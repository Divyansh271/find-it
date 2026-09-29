import { Post, PostFilterOptions, CreatePostInput, PostType } from '../types/post';
import { getCurrentUser } from './authService';
import { supabase } from './supabaseClient';

export const CATEGORIES = [
  'Electronics',
  'ID & Cards',
  'Keys & Lanyards',
  'Bottles & Tumblers',
  'Bags & Backpacks',
  'Books & Notes',
  'Clothing & Accessories',
  'Other',
] as const;

export const COLOURS = [
  'Black',
  'White',
  'Blue',
  'Red',
  'Silver / Grey',
  'Green',
  'Brown',
  'Gold / Yellow',
  'Purple',
  'Other',
] as const;

/**
 * Seed dataset used only as an offline/transitional fallback if
 * Supabase tables have not yet granted permission to the anon role.
 */
const SEED_POSTS: Post[] = [
  // FOUND POSTS (Searched from /lost)
  {
    post_id: 'post-f101',
    user_id: 'usr-student-201',
    type: 'found',
    title: 'University Student ID Card - CS Department',
    desc_text: 'Found on table 4 at Engineering Block C Cafe. Handed to the cafe cashier desk for safekeeping.',
    category: 'ID & Cards',
    colour: 'White',
    location_text: 'Engineering Building C - Ground Floor Cafe',
    appearance: { department: 'Computer Science', condition: 'good' },
    created_at: '2026-09-28T14:30:00Z',
  },
  {
    post_id: 'post-f102',
    user_id: 'usr-student-202',
    type: 'found',
    title: 'AirPods Pro (2nd Gen) in MagSafe Case',
    desc_text: 'White charging case found on the bench inside Student Activity Center Gym locker room. Has a small blue mark near charging port.',
    category: 'Electronics',
    colour: 'White',
    location_text: 'Student Activity Center - Fitness Gym',
    appearance: { brand: 'Apple', distinguishing_mark: 'small blue scratch on bottom' },
    created_at: '2026-09-28T16:15:00Z',
  },
  {
    post_id: 'post-f103',
    user_id: 'usr-student-203',
    type: 'found',
    title: 'Navy Blue Hydro Flask 32oz',
    desc_text: 'Stainless steel wide-mouth bottle with stickers (React, GitHub Octocat, Hackathon 2026). Found under seat F-12 in Lecture Hall 101.',
    category: 'Bottles & Tumblers',
    colour: 'Blue',
    location_text: 'Central Lecture Hall 101',
    appearance: { stickers: ['React', 'Octocat', 'Hackathon 2026'], size: '32oz' },
    created_at: '2026-09-27T18:00:00Z',
  },
  {
    post_id: 'post-f104',
    user_id: 'usr-student-204',
    type: 'found',
    title: 'Keyring with Crimson Lanyard and Honda Fob',
    desc_text: 'Found on the lawn bench across from Main Quad. Has 2 brass door keys, a black Honda car fob, and a silver bottle opener.',
    category: 'Keys & Lanyards',
    colour: 'Red',
    location_text: 'Main Quad Green Lawn - South Bench',
    appearance: { lanyard: 'University Crimson', fob: 'Honda', key_count: 2 },
    created_at: '2026-09-27T13:10:00Z',
  },
  {
    post_id: 'post-f105',
    user_id: 'usr-student-205',
    type: 'found',
    title: 'TI-84 Plus CE Graphing Calculator (Black)',
    desc_text: 'Left on desk in Mathematics Hall Room 304. Has yellow slide case with Math sticker.',
    category: 'Electronics',
    colour: 'Black',
    location_text: 'Mathematics Hall - Room 304',
    appearance: { model: 'TI-84 Plus CE', slide_case: 'yellow' },
    created_at: '2026-09-26T11:20:00Z',
  },
  {
    post_id: 'post-f106',
    user_id: 'usr-student-206',
    type: 'found',
    title: 'Charcoal Grey North Face Backpack',
    desc_text: 'Found in the 2nd floor reading cubicle at Science Library. Contains notebook and pencil case.',
    category: 'Bags & Backpacks',
    colour: 'Silver / Grey',
    location_text: 'Science Library - 2nd Floor Cubicle 14',
    appearance: { brand: 'The North Face', model: 'Borealis' },
    created_at: '2026-09-25T19:40:00Z',
  },

  // LOST POSTS (Searched from /found)
  {
    post_id: 'post-l201',
    user_id: 'usr-student-301',
    type: 'lost',
    title: 'MacBook Pro M2 Charger (White 67W USB-C)',
    desc_text: 'Left plugged into wall outlet near carrel #18 on the 1st floor of Main Library during late study hours. Has braided white cable.',
    category: 'Electronics',
    colour: 'White',
    location_text: 'Main Library 1st Floor Study Carrels',
    appearance: { wattage: '67W', brand: 'Apple' },
    created_at: '2026-09-28T17:45:00Z',
  },
  {
    post_id: 'post-l202',
    user_id: 'usr-student-302',
    type: 'lost',
    title: 'Toyota Car Key with Black Leather Fob',
    desc_text: 'Dropped somewhere between Parking Lot B and Student Services Building. Has black Toyota remote fob, brass apartment key, and tiny red carabiner.',
    category: 'Keys & Lanyards',
    colour: 'Black',
    location_text: 'North Campus Parking Lot B',
    appearance: { vehicle: 'Toyota', carabiner: 'red' },
    created_at: '2026-09-28T12:20:00Z',
  },
  {
    post_id: 'post-l203',
    user_id: 'usr-student-303',
    type: 'lost',
    title: 'Student ID Card & Blue Access Keycard',
    desc_text: 'Misplaced in the Student Union Dining Commons around lunchtime. Name on card is Alex Rivera. Need it to get into my dorm!',
    category: 'ID & Cards',
    colour: 'Blue',
    location_text: 'Student Union Dining Hall',
    appearance: { name: 'Alex Rivera', card_type: 'Campus ID + RFID' },
    created_at: '2026-09-27T14:15:00Z',
  },
  {
    post_id: 'post-l204',
    user_id: 'usr-student-304',
    type: 'lost',
    title: 'Olive Green Owala FreeSip Water Bottle (24oz)',
    desc_text: 'Left on the side bench in Chemistry Lab Room 210. Olive green body with cream-colored lid and Yosemite National Park sticker.',
    category: 'Bottles & Tumblers',
    colour: 'Green',
    location_text: 'Chemistry Lab Building - Room 210',
    appearance: { brand: 'Owala', sticker: 'Yosemite' },
    created_at: '2026-09-27T09:30:00Z',
  },
  {
    post_id: 'post-l205',
    user_id: 'usr-student-305',
    type: 'lost',
    title: 'Beats Studio Pro Wireless Headphones (Black)',
    desc_text: 'Left in zippered black case on top of the locker room cubbies at Student Recreation Center. Has subtle scratch on right ear cup.',
    category: 'Electronics',
    colour: 'Black',
    location_text: 'Student Recreation Center - Locker Room',
    appearance: { brand: 'Beats', model: 'Studio Pro' },
    created_at: '2026-09-26T18:00:00Z',
  },
  {
    post_id: 'post-l206',
    user_id: 'usr-student-306',
    type: 'lost',
    title: 'Patagonia Nano Puff Jacket (Navy Blue, Size M)',
    desc_text: 'Left on seat row D during afternoon economics lecture in Central Auditorium C. Navy blue with small Patagonia logo on left chest.',
    category: 'Clothing & Accessories',
    colour: 'Blue',
    location_text: 'Auditorium Hall C - Row D',
    appearance: { brand: 'Patagonia', size: 'M' },
    created_at: '2026-09-25T15:20:00Z',
  },
];

let localCreatedPosts: Post[] = [];

// Fallback search filter for seed/local data when database grants are pending
function filterFallbackPosts(
  posts: Post[],
  query: string = '',
  filters: PostFilterOptions = {}
): Post[] {
  const normalizedQuery = query.trim().toLowerCase();

  return posts.filter((post) => {
    if (normalizedQuery) {
      const matchTitle = post.title.toLowerCase().includes(normalizedQuery);
      const matchDesc = post.desc_text.toLowerCase().includes(normalizedQuery);
      const matchCat = (post.category || '').toLowerCase().includes(normalizedQuery);
      const matchColour = (post.colour || '').toLowerCase().includes(normalizedQuery);
      const matchLoc = (post.location_text || '').toLowerCase().includes(normalizedQuery);

      if (!matchTitle && !matchDesc && !matchCat && !matchColour && !matchLoc) {
        return false;
      }
    }

    if (filters.category && filters.category !== 'All') {
      if (post.category !== filters.category) return false;
    }

    if (filters.colour && filters.colour !== 'All') {
      if (post.colour !== filters.colour) return false;
    }

    if (filters.location && filters.location.trim()) {
      const locQuery = filters.location.trim().toLowerCase();
      if (!(post.location_text || '').toLowerCase().includes(locQuery)) return false;
    }

    return true;
  });
}

function getAllFallbackPosts(type: PostType): Post[] {
  const combined = [...localCreatedPosts, ...SEED_POSTS];
  return combined.filter((p) => p.type === type);
}

// ---------------------------------------------------------------------------
// 1. FOUND POSTS (For Lost Section: I Lost Something -> browse FOUND posts)
// ---------------------------------------------------------------------------

/**
 * Retrieves all FOUND posts from Supabase PostgreSQL.
 * Mirrored rule: `/lost` queries `posts WHERE type = 'found'`.
 */
export async function getFoundPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'found')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`Supabase getFoundPosts notice (${error.code}): ${error.message}`);
      return getAllFallbackPosts('found');
    }

    return (data as Post[]) || [];
  } catch (err) {
    console.error('Network error fetching found posts:', err);
    return getAllFallbackPosts('found');
  }
}

/**
 * Searches and filters FOUND posts in Supabase PostgreSQL.
 */
export async function searchFoundPosts(
  query: string = '',
  filters: PostFilterOptions = {}
): Promise<Post[]> {
  try {
    let req = supabase
      .from('posts')
      .select('*')
      .eq('type', 'found');

    if (filters.category && filters.category !== 'All') {
      req = req.eq('category', filters.category);
    }

    if (filters.colour && filters.colour !== 'All') {
      req = req.eq('colour', filters.colour);
    }

    if (filters.location && filters.location.trim()) {
      req = req.ilike('location_text', `%${filters.location.trim()}%`);
    }

    if (query && query.trim()) {
      const cleanQ = query.trim().replace(/[%_()]/g, '');
      if (cleanQ) {
        req = req.or(
          `title.ilike.%${cleanQ}%,desc_text.ilike.%${cleanQ}%,category.ilike.%${cleanQ}%,colour.ilike.%${cleanQ}%,location_text.ilike.%${cleanQ}%`
        );
      }
    }

    req = req.order('created_at', { ascending: false });

    const { data, error } = await req;

    if (error) {
      console.warn(`Supabase searchFoundPosts notice (${error.code}): ${error.message}`);
      const fallback = getAllFallbackPosts('found');
      return filterFallbackPosts(fallback, query, filters);
    }

    return (data as Post[]) || [];
  } catch (err) {
    console.error('Network error searching found posts:', err);
    const fallback = getAllFallbackPosts('found');
    return filterFallbackPosts(fallback, query, filters);
  }
}

// ---------------------------------------------------------------------------
// 2. LOST POSTS (For Found Section: I Found Something -> browse LOST posts)
// ---------------------------------------------------------------------------

/**
 * Retrieves all LOST posts from Supabase PostgreSQL.
 * Mirrored rule: `/found` queries `posts WHERE type = 'lost'`.
 */
export async function getLostPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'lost')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`Supabase getLostPosts notice (${error.code}): ${error.message}`);
      return getAllFallbackPosts('lost');
    }

    return (data as Post[]) || [];
  } catch (err) {
    console.error('Network error fetching lost posts:', err);
    return getAllFallbackPosts('lost');
  }
}

/**
 * Searches and filters LOST posts in Supabase PostgreSQL.
 */
export async function searchLostPosts(
  query: string = '',
  filters: PostFilterOptions = {}
): Promise<Post[]> {
  try {
    let req = supabase
      .from('posts')
      .select('*')
      .eq('type', 'lost');

    if (filters.category && filters.category !== 'All') {
      req = req.eq('category', filters.category);
    }

    if (filters.colour && filters.colour !== 'All') {
      req = req.eq('colour', filters.colour);
    }

    if (filters.location && filters.location.trim()) {
      req = req.ilike('location_text', `%${filters.location.trim()}%`);
    }

    if (query && query.trim()) {
      const cleanQ = query.trim().replace(/[%_()]/g, '');
      if (cleanQ) {
        req = req.or(
          `title.ilike.%${cleanQ}%,desc_text.ilike.%${cleanQ}%,category.ilike.%${cleanQ}%,colour.ilike.%${cleanQ}%,location_text.ilike.%${cleanQ}%`
        );
      }
    }

    req = req.order('created_at', { ascending: false });

    const { data, error } = await req;

    if (error) {
      console.warn(`Supabase searchLostPosts notice (${error.code}): ${error.message}`);
      const fallback = getAllFallbackPosts('lost');
      return filterFallbackPosts(fallback, query, filters);
    }

    return (data as Post[]) || [];
  } catch (err) {
    console.error('Network error searching lost posts:', err);
    const fallback = getAllFallbackPosts('lost');
    return filterFallbackPosts(fallback, query, filters);
  }
}

// ---------------------------------------------------------------------------
// 3. COMMON POST LOOKUP
// ---------------------------------------------------------------------------

/**
 * Retrieves a post by post_id from Supabase PostgreSQL.
 */
export async function getPostById(postId: string): Promise<Post | null> {
  if (!postId) return null;

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('post_id', postId)
      .maybeSingle();

    if (error) {
      console.warn(`Supabase getPostById notice (${error.code}): ${error.message}`);
      const fallback = [...localCreatedPosts, ...SEED_POSTS].find((p) => p.post_id === postId);
      return fallback ? { ...fallback } : null;
    }

    if (data) {
      return data as Post;
    }

    const fallback = [...localCreatedPosts, ...SEED_POSTS].find((p) => p.post_id === postId);
    return fallback ? { ...fallback } : null;
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    const fallback = [...localCreatedPosts, ...SEED_POSTS].find((p) => p.post_id === postId);
    return fallback ? { ...fallback } : null;
  }
}

// ---------------------------------------------------------------------------
// 4. POST CREATION
// ---------------------------------------------------------------------------

/**
 * Creates a LOST post in Supabase PostgreSQL (type = 'lost').
 * Must be created by the currently authenticated user.
 */
export async function createLostPost(input: CreatePostInput): Promise<Post> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required: please sign in to create a post.');
  }

  const trimmedTitle = input.title.trim();
  const trimmedDesc = input.desc_text.trim();

  if (!trimmedTitle) {
    throw new Error('Please provide a post title.');
  }

  if (!trimmedDesc) {
    throw new Error('Please provide an item description.');
  }

  // Ensure profile exists for FK constraint posts.user_id -> profiles.user_id
  try {
    await supabase.from('profiles').upsert(
      {
        user_id: currentUser.user_id,
        display_name: currentUser.display_name,
        trust_score: currentUser.trust_score || 0,
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // Handled by DB trigger if already configured
  }

  const payload = {
    user_id: currentUser.user_id,
    type: 'lost',
    title: trimmedTitle,
    desc_text: trimmedDesc,
    images: input.images || [],
    category: input.category || null,
    colour: input.colour || null,
    location_text: input.location_text ? input.location_text.trim() : null,
    appearance: null,
  };

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn(`Supabase createLostPost notice (${error.code}): ${error.message}`);
      // Fallback post object
      const fallbackPost: Post = {
        post_id: `post-l-${Date.now().toString().slice(-6)}`,
        ...payload,
        type: 'lost',
        created_at: new Date().toISOString(),
      };
      localCreatedPosts.unshift(fallbackPost);
      return fallbackPost;
    }

    const created = data as Post;
    localCreatedPosts.unshift(created);
    return created;
  } catch (err: any) {
    console.error('Error inserting lost post:', err);
    const fallbackPost: Post = {
      post_id: `post-l-${Date.now().toString().slice(-6)}`,
      ...payload,
      type: 'lost',
      created_at: new Date().toISOString(),
    };
    localCreatedPosts.unshift(fallbackPost);
    return fallbackPost;
  }
}

/**
 * Creates a FOUND post in Supabase PostgreSQL (type = 'found').
 * Must be created by the currently authenticated user.
 */
export async function createFoundPost(input: CreatePostInput): Promise<Post> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required: please sign in to create a post.');
  }

  const trimmedTitle = input.title.trim();
  const trimmedDesc = input.desc_text.trim();

  if (!trimmedTitle) {
    throw new Error('Please provide a post title.');
  }

  if (!trimmedDesc) {
    throw new Error('Please provide an item description.');
  }

  // Ensure profile exists for FK constraint posts.user_id -> profiles.user_id
  try {
    await supabase.from('profiles').upsert(
      {
        user_id: currentUser.user_id,
        display_name: currentUser.display_name,
        trust_score: currentUser.trust_score || 0,
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // Handled by DB trigger if already configured
  }

  const payload = {
    user_id: currentUser.user_id,
    type: 'found',
    title: trimmedTitle,
    desc_text: trimmedDesc,
    images: input.images || [],
    category: input.category || null,
    colour: input.colour || null,
    location_text: input.location_text ? input.location_text.trim() : null,
    appearance: null,
  };

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn(`Supabase createFoundPost notice (${error.code}): ${error.message}`);
      const fallbackPost: Post = {
        post_id: `post-f-${Date.now().toString().slice(-6)}`,
        ...payload,
        type: 'found',
        created_at: new Date().toISOString(),
      };
      localCreatedPosts.unshift(fallbackPost);
      return fallbackPost;
    }

    const created = data as Post;
    localCreatedPosts.unshift(created);
    return created;
  } catch (err: any) {
    console.error('Error inserting found post:', err);
    const fallbackPost: Post = {
      post_id: `post-f-${Date.now().toString().slice(-6)}`,
      ...payload,
      type: 'found',
      created_at: new Date().toISOString(),
    };
    localCreatedPosts.unshift(fallbackPost);
    return fallbackPost;
  }
}

// ---------------------------------------------------------------------------
// 5. USER'S OWN POSTS & MANAGEMENT (For Future Dashboard / Profile)
// ---------------------------------------------------------------------------

/**
 * Retrieves posts created by the authenticated user.
 */
export async function getUserPosts(userId?: string): Promise<Post[]> {
  const currentUser = getCurrentUser();
  const targetUserId = userId || currentUser?.user_id;

  if (!targetUserId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`Supabase getUserPosts notice: ${error.message}`);
      return localCreatedPosts.filter((p) => p.user_id === targetUserId);
    }

    return (data as Post[]) || [];
  } catch (err) {
    console.error('Error fetching user posts:', err);
    return localCreatedPosts.filter((p) => p.user_id === targetUserId);
  }
}

/**
 * Updates a user's own post. RLS enforces user_id = auth.uid().
 */
export async function updatePost(
  postId: string,
  input: Partial<CreatePostInput>
): Promise<Post> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required: please sign in to edit a post.');
  }

  const updatePayload: Record<string, any> = {};
  if (input.title !== undefined) updatePayload.title = input.title.trim();
  if (input.desc_text !== undefined) updatePayload.desc_text = input.desc_text.trim();
  if (input.category !== undefined) updatePayload.category = input.category || null;
  if (input.colour !== undefined) updatePayload.colour = input.colour || null;
  if (input.location_text !== undefined) updatePayload.location_text = input.location_text ? input.location_text.trim() : null;
  if (input.images !== undefined) updatePayload.images = input.images;

  const { data, error } = await supabase
    .from('posts')
    .update(updatePayload)
    .eq('post_id', postId)
    .eq('user_id', currentUser.user_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }

  return data as Post;
}

/**
 * Deletes a user's own post. RLS enforces user_id = auth.uid().
 */
export async function deletePost(postId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication required: please sign in to delete a post.');
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', currentUser.user_id);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }

  localCreatedPosts = localCreatedPosts.filter((p) => p.post_id !== postId);
}

// ---------------------------------------------------------------------------
// 6. OPPOSITE-TYPE SUGGESTED MATCHING
// ---------------------------------------------------------------------------

// Helper to rank matches of opposite type based on category, colour, and keywords
function rankMatches(sourcePost: Post, targetPosts: Post[]): Post[] {
  return targetPosts
    .map((candidate) => {
      let score = 0;
      if (sourcePost.category && candidate.category === sourcePost.category) {
        score += 3; // Primary signal
      }
      if (sourcePost.colour && candidate.colour === sourcePost.colour) {
        score += 2; // Secondary signal
      }
      if (
        sourcePost.location_text &&
        candidate.location_text &&
        (candidate.location_text.toLowerCase().includes(sourcePost.location_text.toLowerCase()) ||
          sourcePost.location_text.toLowerCase().includes(candidate.location_text.toLowerCase()))
      ) {
        score += 1; // Soft location signal
      }

      // Title keyword overlap
      const sourceWords = sourcePost.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const candidateTitle = candidate.title.toLowerCase();
      for (const word of sourceWords) {
        if (candidateTitle.includes(word)) score += 1;
      }

      return { post: candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post);
}

/**
 * When creating a LOST post: suggest matching FOUND posts from Supabase.
 */
export async function getSuggestedFoundMatches(lostPost: Post): Promise<Post[]> {
  const foundPosts = await getFoundPosts();
  return rankMatches(lostPost, foundPosts);
}

/**
 * When creating a FOUND post: suggest matching LOST posts from Supabase.
 */
export async function getSuggestedLostMatches(foundPost: Post): Promise<Post[]> {
  const lostPosts = await getLostPosts();
  return rankMatches(foundPost, lostPosts);
}
