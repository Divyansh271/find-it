import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';
import { Message } from '../types/conversation';
import { uploadImageFile } from './storageService';
import { getConversationById } from './conversationsService';

// Local in-memory store for messages fallback
const localMessagesStore: Record<string, Message[]> = {};

/**
 * Retrieves chronological message history for a conversation.
 * Verifies that the current user is a participant and the conversation is accepted.
 */
export async function getMessages(convoId: string): Promise<Message[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  // 1. Verify participant and acceptance
  const convo = await getConversationById(convoId);
  if (!convo) {
    throw new Error('Conversation not found or unauthorized.');
  }

  if (!convo.accepted) {
    throw new Error('Cannot view messages: this conversation request has not been accepted yet.');
  }

  const localList = localMessagesStore[convoId] || [];

  // 2. Fetch messages from Supabase
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(display_name)
      `)
      .eq('convo_id', convoId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching messages from Supabase, using local store:', error.message);
      return localList;
    }

    const dbMsgs = (data as Message[]) || [];
    const dbIds = new Set(dbMsgs.map((m) => m.id));
    return [...dbMsgs, ...localList.filter((m) => !dbIds.has(m.id))];
  } catch (err) {
    console.warn('Network error loading messages:', err);
    return localList;
  }
}

/**
 * Sends a message in an accepted conversation.
 * Rejects empty messages. Sender is strictly authenticated user.
 */
export async function sendMessage(
  convoId: string,
  text?: string,
  imageFile?: File | null
): Promise<Message> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required to send a message.');
  }

  const trimmedText = text ? text.trim() : '';
  if (!trimmedText && !imageFile) {
    throw new Error('Cannot send empty message: please provide text or an image.');
  }

  // 1. Determine effective user ID matching active Supabase session
  let effectiveUserId = currentUser.user_id;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      effectiveUserId = sessionData.session.user.id;
    }
  } catch {
    // Keep
  }

  // 2. Upload image if present
  let imgPath: string | null = null;
  if (imageFile) {
    try {
      imgPath = await uploadImageFile(imageFile, `messages/${convoId}`);
    } catch (uploadErr: any) {
      console.warn('Chat image upload error:', uploadErr);
      imgPath = imageFile.name; // Fallback to filename
    }
  }

  const localMessage: Message = {
    id: Date.now(),
    convo_id: convoId,
    sender_id: effectiveUserId,
    msg_text: trimmedText || null,
    msg_img: imgPath,
    created_at: new Date().toISOString(),
    sender_profile: {
      display_name: currentUser.display_name,
    },
  };

  // 3. Insert into Supabase messages table with fallback to local store
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        convo_id: convoId,
        sender_id: effectiveUserId,
        msg_text: localMessage.msg_text,
        msg_img: localMessage.msg_img,
        created_at: localMessage.created_at,
      })
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(display_name)
      `)
      .single();

    if (error) {
      console.warn('Supabase message insert notice:', error.message);
      // Cache locally
      if (!localMessagesStore[convoId]) localMessagesStore[convoId] = [];
      localMessagesStore[convoId].push(localMessage);
      return localMessage;
    }

    if (data) {
      return data as Message;
    }
  } catch (err) {
    console.warn('Error sending message to Supabase, saved locally:', err);
    if (!localMessagesStore[convoId]) localMessagesStore[convoId] = [];
    localMessagesStore[convoId].push(localMessage);
    return localMessage;
  }

  if (!localMessagesStore[convoId]) localMessagesStore[convoId] = [];
  localMessagesStore[convoId].push(localMessage);
  return localMessage;
}

/**
 * Subscribes to Realtime Postgres Changes on the `messages` table for a specific conversation.
 * Returns a cleanup unsubscribe function.
 */
export function subscribeToMessages(
  convoId: string,
  onNewMessage: (msg: Message) => void,
  onStatusChange?: (status: string) => void
): () => void {
  const channelName = `room:${convoId}`;

  try {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `convo_id=eq.${convoId}`,
        },
        (payload) => {
          if (payload.new) {
            onNewMessage(payload.new as Message);
          }
        }
      )
      .subscribe((status, err) => {
        if (onStatusChange) {
          onStatusChange(status);
        }
        if (err) {
          console.warn(`[Realtime: ${channelName}] error:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}
