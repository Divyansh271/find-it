import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';
import { Message } from '../types/conversation';
import { uploadImageFile } from './storageService';
import { getConversationById } from './conversationsService';

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

  // 2. Fetch messages
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender_profile:profiles!messages_sender_id_fkey(display_name)
    `)
    .eq('convo_id', convoId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Error fetching messages with relation, falling back to simple select:', error.message);
    const simple = await supabase
      .from('messages')
      .select('*')
      .eq('convo_id', convoId)
      .order('created_at', { ascending: true });

    if (simple.error) {
      throw new Error(`Failed to load messages: ${simple.error.message}`);
    }

    return (simple.data as Message[]) || [];
  }

  return (data as Message[]) || [];
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

  // 1. Verify conversation is accepted
  const convo = await getConversationById(convoId);
  if (!convo) {
    throw new Error('Conversation not found or unauthorized.');
  }

  if (!convo.accepted) {
    throw new Error('This conversation has not been accepted yet.');
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

  // 3. Insert into Supabase messages table
  const newMsgPayload = {
    convo_id: convoId,
    sender_id: currentUser.user_id,
    msg_text: trimmedText || null,
    msg_img: imgPath,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(newMsgPayload)
    .select(`
      *,
      sender_profile:profiles!messages_sender_id_fkey(display_name)
    `)
    .single();

  if (error) {
    console.error('Error inserting message:', error);
    // If join failed, try plain insert
    const plainInsert = await supabase
      .from('messages')
      .insert(newMsgPayload)
      .select()
      .single();

    if (plainInsert.error) {
      throw new Error(`Failed to send message (${plainInsert.error.code}): ${plainInsert.error.message}`);
    }
    return plainInsert.data as Message;
  }

  return data as Message;
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
}
