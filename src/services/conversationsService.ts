import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';
import { Conversation } from '../types/conversation';
import { getPostById } from './postsService';
import { uploadImageFile } from './storageService';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a conversation request on a post.
 * Derives owner_id and finder_id strictly based on post.type:
 * - If post.type === 'lost': post.user_id is owner_id; requester is finder_id.
 * - If post.type === 'found': post.user_id is finder_id; requester is owner_id.
 */
export async function createConversationRequest(
  postId: string,
  requestText?: string,
  imageFile?: File | null
): Promise<Conversation> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required: please log in to request a conversation.');
  }

  const post = await getPostById(postId);
  if (!post) {
    throw new Error('Post not found or has already been resolved.');
  }

  if (post.user_id === currentUser.user_id) {
    throw new Error('You cannot request a conversation on your own post.');
  }

  const trimmedText = requestText ? requestText.trim() : '';
  if (!trimmedText && !imageFile) {
    throw new Error('Please provide a message or attach a photo for your request.');
  }

  // 1. Upload request image if provided
  let requestImgPath: string | null = null;
  if (imageFile) {
    try {
      requestImgPath = await uploadImageFile(imageFile, 'requests');
    } catch (uploadErr: any) {
      console.warn('Image upload error on conversation request:', uploadErr);
      requestImgPath = imageFile.name; // Fallback to filename
    }
  }

  // 2. Strict Role Calculation:
  // owner = person who lost the item
  // finder = person who found the item
  let ownerId: string;
  let finderId: string;

  if (post.type === 'lost') {
    // Post creator lost the item -> owner
    // Requester has found it -> finder
    ownerId = post.user_id;
    finderId = currentUser.user_id;
  } else {
    // Post creator found the item -> finder
    // Requester lost the item -> owner
    finderId = post.user_id;
    ownerId = currentUser.user_id;
  }

  // Check if request already exists for this (post_id, requested_by)
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('post_id', postId)
    .eq('requested_by', currentUser.user_id)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already submitted a conversation request for this post.');
  }

  const newConvoPayload = {
    convo_id: generateUuid(),
    post_id: postId,
    owner_id: ownerId,
    finder_id: finderId,
    requested_by: currentUser.user_id,
    request_text: trimmedText || null,
    request_img: requestImgPath,
    accepted: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('conversations')
    .insert(newConvoPayload)
    .select()
    .single();

  if (error) {
    console.error('Error inserting conversation request:', error);
    if (error.code === '23505') {
      throw new Error('You have already submitted a conversation request for this post.');
    }
    if (error.code === '42501') {
      throw new Error(
        'Database permission error: Conversations table requires permissions. Please verify the conversations RLS policies in Supabase.'
      );
    }
    throw new Error(`Failed to submit request (${error.code}): ${error.message}`);
  }

  return data as Conversation;
}

/**
 * Checks if the current authenticated user has already requested a conversation for a post.
 */
export async function getExistingRequestForPost(postId: string): Promise<Conversation | null> {
  const currentUser = getCurrentUser();
  if (!currentUser || !postId) return null;

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('post_id', postId)
      .eq('requested_by', currentUser.user_id)
      .maybeSingle();

    if (error || !data) return null;
    return data as Conversation;
  } catch {
    return null;
  }
}

/**
 * Retrieves incoming pending conversation requests directed to the current user
 * (where the current user is a participant but NOT the requester, and accepted = false).
 */
export async function getIncomingRequests(): Promise<Conversation[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  try {
    // 1. Fetch conversations where user is owner or finder, but not the requester, and accepted is false
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        post:posts(post_id, title, type, images, location_text),
        requester_profile:profiles!conversations_requested_by_fkey(display_name, trust_score)
      `)
      .neq('requested_by', currentUser.user_id)
      .or(`owner_id.eq.${currentUser.user_id},finder_id.eq.${currentUser.user_id}`)
      .eq('accepted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching incoming requests with join, trying fallback:', error.message);
      // Fallback query without relational join
      const simple = await supabase
        .from('conversations')
        .select('*')
        .neq('requested_by', currentUser.user_id)
        .or(`owner_id.eq.${currentUser.user_id},finder_id.eq.${currentUser.user_id}`)
        .eq('accepted', false)
        .order('created_at', { ascending: false });

      if (simple.data) {
        return await hydrateConversations(simple.data as Conversation[]);
      }
      return [];
    }

    return (data as any[]) || [];
  } catch (err) {
    console.error('Error fetching incoming requests:', err);
    return [];
  }
}

/**
 * Retrieves outgoing conversation requests initiated by the current user.
 */
export async function getOutgoingRequests(): Promise<Conversation[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        post:posts(post_id, title, type, images, location_text)
      `)
      .eq('requested_by', currentUser.user_id)
      .order('created_at', { ascending: false });

    if (error) {
      const simple = await supabase
        .from('conversations')
        .select('*')
        .eq('requested_by', currentUser.user_id)
        .order('created_at', { ascending: false });

      if (simple.data) {
        return await hydrateConversations(simple.data as Conversation[]);
      }
      return [];
    }

    return (data as any[]) || [];
  } catch (err) {
    console.error('Error fetching outgoing requests:', err);
    return [];
  }
}

/**
 * Retrieves all accepted, active conversations for the current user.
 */
export async function getActiveConversations(): Promise<Conversation[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        post:posts(post_id, title, type, images, location_text),
        owner_profile:profiles!conversations_owner_id_fkey(display_name, trust_score),
        finder_profile:profiles!conversations_finder_id_fkey(display_name, trust_score)
      `)
      .eq('accepted', true)
      .or(`owner_id.eq.${currentUser.user_id},finder_id.eq.${currentUser.user_id}`)
      .order('created_at', { ascending: false });

    if (error) {
      const simple = await supabase
        .from('conversations')
        .select('*')
        .eq('accepted', true)
        .or(`owner_id.eq.${currentUser.user_id},finder_id.eq.${currentUser.user_id}`)
        .order('created_at', { ascending: false });

      if (simple.data) {
        return await hydrateConversations(simple.data as Conversation[]);
      }
      return [];
    }

    return (data as any[]) || [];
  } catch (err) {
    console.error('Error fetching active conversations:', err);
    return [];
  }
}

/**
 * Retrieves a single conversation by convo_id and verifies the current user is a participant.
 */
export async function getConversationById(convoId: string): Promise<Conversation | null> {
  const currentUser = getCurrentUser();
  if (!currentUser || !convoId) return null;

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        post:posts(post_id, title, type, images, location_text, desc_text, user_id),
        owner_profile:profiles!conversations_owner_id_fkey(display_name, trust_score),
        finder_profile:profiles!conversations_finder_id_fkey(display_name, trust_score),
        requester_profile:profiles!conversations_requested_by_fkey(display_name, trust_score)
      `)
      .eq('convo_id', convoId)
      .maybeSingle();

    if (error || !data) {
      // Fallback
      const simple = await supabase
        .from('conversations')
        .select('*')
        .eq('convo_id', convoId)
        .maybeSingle();

      if (simple.data) {
        const hydrated = await hydrateConversations([simple.data as Conversation]);
        return hydrated[0] || null;
      }
      return null;
    }

    const convo = data as Conversation;
    // Verify participant
    if (convo.owner_id !== currentUser.user_id && convo.finder_id !== currentUser.user_id) {
      throw new Error('Access denied: you are not a participant in this conversation.');
    }

    return convo;
  } catch (err) {
    console.error('Error fetching conversation:', err);
    return null;
  }
}

/**
 * Accepts a conversation request.
 * Enforces rule: accepted can only be changed by the participant who did NOT request it.
 */
export async function acceptConversationRequest(convoId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  // Fetch conversation first to verify rule
  const { data: convo, error: fetchErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('convo_id', convoId)
    .single();

  if (fetchErr || !convo) {
    throw new Error('Conversation request not found.');
  }

  if (convo.requested_by === currentUser.user_id) {
    throw new Error('You cannot accept your own request. Only the other participant may accept.');
  }

  if (convo.owner_id !== currentUser.user_id && convo.finder_id !== currentUser.user_id) {
    throw new Error('You are not a participant in this conversation.');
  }

  const { error } = await supabase
    .from('conversations')
    .update({ accepted: true })
    .eq('convo_id', convoId)
    .neq('requested_by', currentUser.user_id);

  if (error) {
    throw new Error(`Failed to accept conversation: ${error.message}`);
  }
}

/**
 * Declines a conversation request.
 * Per specification: Declining a request DELETES the conversation record.
 */
export async function declineConversationRequest(convoId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('convo_id', convoId)
    .or(`owner_id.eq.${currentUser.user_id},finder_id.eq.${currentUser.user_id}`);

  if (error) {
    throw new Error(`Failed to decline conversation: ${error.message}`);
  }
}

/**
 * Unilaterally ends an active conversation when item was NOT resolved.
 * Owner-only operation: deletes the conversation and its messages; post remains intact.
 */
export async function endConversation(convoId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  // Verify owner
  const { data: convo } = await supabase
    .from('conversations')
    .select('owner_id')
    .eq('convo_id', convoId)
    .single();

  if (!convo || convo.owner_id !== currentUser.user_id) {
    throw new Error('Only the item owner may unilaterally end this conversation.');
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('convo_id', convoId)
    .eq('owner_id', currentUser.user_id);

  if (error) {
    throw new Error(`Failed to end conversation: ${error.message}`);
  }
}

/**
 * Resolves a conversation when the item has been successfully returned.
 * Transactional & secure:
 * 1. Verifies caller is the owner
 * 2. Increments finder's trust_score by +1
 * 3. Deletes the post
 * 4. Deletes the conversation (messages cascade)
 */
export async function resolveConversation(convoId: string): Promise<{ success: boolean; newScore?: number }> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  // 1. Call secure PostgreSQL RPC
  const { data, error } = await supabase.rpc('resolve_conversation', {
    p_convo_id: convoId,
  });

  if (error) {
    console.error('RPC resolve_conversation error:', error);
    // If the RPC is not yet installed in Supabase, provide clear message
    if (error.code === '42883') {
      throw new Error(
        'Database function "resolve_conversation" is missing. Please run the provided SQL migration in the Supabase SQL Editor.'
      );
    }
    throw new Error(`Failed to resolve conversation: ${error.message}`);
  }

  return {
    success: true,
    newScore: data?.new_trust_score,
  };
}

/**
 * Helper to manually hydrate posts and profiles if joined queries fail.
 */
async function hydrateConversations(convos: Conversation[]): Promise<Conversation[]> {
  if (convos.length === 0) return [];

  const postIds = Array.from(new Set(convos.map((c) => c.post_id)));
  const userIds = Array.from(
    new Set(convos.flatMap((c) => [c.owner_id, c.finder_id, c.requested_by]))
  );

  const [postsRes, profilesRes] = await Promise.all([
    supabase.from('posts').select('post_id, title, type, images, location_text').in('post_id', postIds),
    supabase.from('profiles').select('user_id, display_name, trust_score').in('user_id', userIds),
  ]);

  const postMap = new Map((postsRes.data || []).map((p: any) => [p.post_id, p]));
  const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p]));

  return convos.map((c) => ({
    ...c,
    post: postMap.get(c.post_id) || undefined,
    requester_profile: profileMap.get(c.requested_by) || undefined,
    owner_profile: profileMap.get(c.owner_id) || undefined,
    finder_profile: profileMap.get(c.finder_id) || undefined,
  }));
}
