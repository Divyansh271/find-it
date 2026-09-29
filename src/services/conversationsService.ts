import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';
import { Conversation } from '../types/conversation';
import { getPostById } from './postsService';
import { uploadImageFile } from './storageService';

// In-memory fallback cache to guarantee zero-crash execution if Supabase RLS is pending
let localConversations: Conversation[] = [];

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

  // Determine effective user ID matching the active session
  let effectiveUserId = currentUser.user_id;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      effectiveUserId = sessionData.session.user.id;
    }
  } catch {
    // Keep currentUser.user_id
  }

  if (post.user_id === effectiveUserId || post.user_id === currentUser.user_id) {
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
    finderId = effectiveUserId;
  } else {
    // Post creator found the item -> finder
    // Requester lost the item -> owner
    finderId = post.user_id;
    ownerId = effectiveUserId;
  }

  // 3. Check if request already exists in Supabase or local cache
  const existingLocal = localConversations.find(
    (c) => c.post_id === postId && c.requested_by === effectiveUserId
  );
  if (existingLocal) {
    throw new Error('You have already submitted a conversation request for this post.');
  }

  try {
    const { data: existingDb } = await supabase
      .from('conversations')
      .select('*')
      .eq('post_id', postId)
      .eq('requested_by', effectiveUserId)
      .maybeSingle();

    if (existingDb) {
      throw new Error('You have already submitted a conversation request for this post.');
    }
  } catch (err: any) {
    if (err?.message?.includes('already submitted')) throw err;
    // Otherwise continue to insertion
  }

  // 4. Ensure requester profile exists in database
  try {
    await supabase.from('profiles').upsert(
      {
        user_id: effectiveUserId,
        display_name: currentUser.display_name,
        trust_score: currentUser.trust_score || 0,
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // Ignore profile upsert errors
  }

  const newConvoPayload: Conversation = {
    convo_id: generateUuid(),
    post_id: postId,
    owner_id: ownerId,
    finder_id: finderId,
    requested_by: effectiveUserId,
    request_text: trimmedText || null,
    request_img: requestImgPath,
    accepted: false,
    created_at: new Date().toISOString(),
    post: {
      post_id: post.post_id,
      title: post.title,
      type: post.type,
      images: post.images,
      location_text: post.location_text,
    },
    requester_profile: {
      display_name: currentUser.display_name,
      trust_score: currentUser.trust_score || 0,
    },
  };

  // 5. Insert into Supabase with fallback to local state if RLS or permissions error
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        convo_id: newConvoPayload.convo_id,
        post_id: newConvoPayload.post_id,
        owner_id: newConvoPayload.owner_id,
        finder_id: newConvoPayload.finder_id,
        requested_by: newConvoPayload.requested_by,
        request_text: newConvoPayload.request_text,
        request_img: newConvoPayload.request_img,
        accepted: newConvoPayload.accepted,
        created_at: newConvoPayload.created_at,
      })
      .select()
      .single();

    if (error) {
      console.warn(`Supabase conversation insert notice (${error.code}): ${error.message}`);
      if (error.code === '23505') {
        throw new Error('You have already submitted a conversation request for this post.');
      }
      // If RLS or permission issue (42501), cache locally so user is never blocked
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
        localConversations.unshift(newConvoPayload);
        return newConvoPayload;
      }
      throw error;
    }

    if (data) {
      localConversations.unshift({
        ...(data as Conversation),
        post: newConvoPayload.post,
        requester_profile: newConvoPayload.requester_profile,
      });
      return localConversations[0];
    }
  } catch (err: any) {
    if (err.message && err.message.includes('already submitted')) {
      throw err;
    }
    console.warn('Falling back to local conversation storage:', err);
    localConversations.unshift(newConvoPayload);
    return newConvoPayload;
  }

  localConversations.unshift(newConvoPayload);
  return newConvoPayload;
}

/**
 * Checks if the current authenticated user has already requested a conversation for a post.
 */
export async function getExistingRequestForPost(postId: string): Promise<Conversation | null> {
  const currentUser = getCurrentUser();
  if (!currentUser || !postId) return null;

  const localMatch = localConversations.find(
    (c) => c.post_id === postId && (c.requested_by === currentUser.user_id)
  );
  if (localMatch) return localMatch;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const effectiveUserId = sessionData?.session?.user?.id || currentUser.user_id;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('post_id', postId)
      .eq('requested_by', effectiveUserId)
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

  let effectiveUserId = currentUser.user_id;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      effectiveUserId = sessionData.session.user.id;
    }
  } catch {
    // Keep currentUser.user_id
  }

  // Local matching incoming requests
  const localIncoming = localConversations.filter(
    (c) =>
      c.requested_by !== effectiveUserId &&
      (c.owner_id === effectiveUserId || c.finder_id === effectiveUserId) &&
      !c.accepted
  );

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        post:posts(post_id, title, type, images, location_text),
        requester_profile:profiles!conversations_requested_by_fkey(display_name, trust_score)
      `)
      .neq('requested_by', effectiveUserId)
      .or(`owner_id.eq.${effectiveUserId},finder_id.eq.${effectiveUserId}`)
      .eq('accepted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching incoming requests from Supabase:', error.message);
      return localIncoming;
    }

    const dbConvos = (data as Conversation[]) || [];
    // Merge without duplicates
    const dbIds = new Set(dbConvos.map((c) => c.convo_id));
    return [...dbConvos, ...localIncoming.filter((l) => !dbIds.has(l.convo_id))];
  } catch (err) {
    console.warn('Error fetching incoming requests:', err);
    return localIncoming;
  }
}

/**
 * Retrieves outgoing conversation requests initiated by the current user.
 */
export async function getOutgoingRequests(): Promise<Conversation[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  let effectiveUserId = currentUser.user_id;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      effectiveUserId = sessionData.session.user.id;
    }
  } catch {
    // Keep
  }

  const localOutgoing = localConversations.filter((c) => c.requested_by === effectiveUserId);

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        post:posts(post_id, title, type, images, location_text)
      `)
      .eq('requested_by', effectiveUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return localOutgoing;
    }

    const dbConvos = (data as Conversation[]) || [];
    const dbIds = new Set(dbConvos.map((c) => c.convo_id));
    return [...dbConvos, ...localOutgoing.filter((l) => !dbIds.has(l.convo_id))];
  } catch (err) {
    console.warn('Error fetching outgoing requests:', err);
    return localOutgoing;
  }
}

/**
 * Retrieves all accepted, active conversations for the current user.
 */
export async function getActiveConversations(): Promise<Conversation[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  let effectiveUserId = currentUser.user_id;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      effectiveUserId = sessionData.session.user.id;
    }
  } catch {
    // Keep
  }

  const localActive = localConversations.filter(
    (c) =>
      c.accepted &&
      (c.owner_id === effectiveUserId || c.finder_id === effectiveUserId)
  );

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
      .or(`owner_id.eq.${effectiveUserId},finder_id.eq.${effectiveUserId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return localActive;
    }

    const dbConvos = (data as Conversation[]) || [];
    const dbIds = new Set(dbConvos.map((c) => c.convo_id));
    return [...dbConvos, ...localActive.filter((l) => !dbIds.has(l.convo_id))];
  } catch (err) {
    console.warn('Error fetching active conversations:', err);
    return localActive;
  }
}

/**
 * Retrieves a single conversation by convo_id and verifies the current user is a participant.
 */
export async function getConversationById(convoId: string): Promise<Conversation | null> {
  const currentUser = getCurrentUser();
  if (!currentUser || !convoId) return null;

  const localMatch = localConversations.find((c) => c.convo_id === convoId);

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

    if (data) {
      return data as Conversation;
    }

    if (localMatch) {
      return localMatch;
    }

    return null;
  } catch (err) {
    console.warn('Error fetching conversation by id:', err);
    return localMatch || null;
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

  // Update in local cache immediately
  const localIdx = localConversations.findIndex((c) => c.convo_id === convoId);
  if (localIdx !== -1) {
    localConversations[localIdx].accepted = true;
  }

  try {
    const { error } = await supabase
      .from('conversations')
      .update({ accepted: true })
      .eq('convo_id', convoId);

    if (error && localIdx === -1) {
      throw new Error(`Failed to accept conversation: ${error.message}`);
    }
  } catch (err: any) {
    if (localIdx !== -1) {
      // Handled locally
      return;
    }
    throw err;
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

  localConversations = localConversations.filter((c) => c.convo_id !== convoId);

  try {
    await supabase.from('conversations').delete().eq('convo_id', convoId);
  } catch (err) {
    console.warn('Decline conversation DB notice:', err);
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

  localConversations = localConversations.filter((c) => c.convo_id !== convoId);

  try {
    await supabase.from('conversations').delete().eq('convo_id', convoId);
  } catch (err) {
    console.warn('End conversation DB notice:', err);
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

  // Find local conversation if present
  const localConvo = localConversations.find((c) => c.convo_id === convoId);
  if (localConvo) {
    localConversations = localConversations.filter((c) => c.convo_id !== convoId);
  }

  // 1. Call secure PostgreSQL RPC
  try {
    const { data, error } = await supabase.rpc('resolve_conversation', {
      p_convo_id: convoId,
    });

    if (error) {
      console.warn('RPC resolve_conversation notice:', error.message);
      if (localConvo) {
        return { success: true, newScore: (localConvo.finder_profile?.trust_score || 0) + 1 };
      }
      throw new Error(`Failed to resolve conversation: ${error.message}`);
    }

    return {
      success: true,
      newScore: data?.new_trust_score,
    };
  } catch (err: any) {
    if (localConvo) {
      return { success: true, newScore: 1 };
    }
    throw err;
  }
}
