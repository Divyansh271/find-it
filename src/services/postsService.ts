import { Post, PostFilterOptions, CreatePostInput } from '../types/post';
import { getCurrentUser } from './authService';

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

// In-memory mock database following the schema in §2.2
let mockPosts: Post[] = [
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

/**
 * Data Access Layer (DAL)
 * Stable interface: UI -> postsService -> dummy implementation
 * Will be swapped with Supabase queries later without rewriting the UI.
 */

// Helper to filter posts by search query and category/colour/location filters
function filterPosts(
  posts: Post[],
  query: string = '',
  filters: PostFilterOptions = {}
): Post[] {
  const normalizedQuery = query.trim().toLowerCase();

  return posts.filter((post) => {
    // Keyword search across title, description, category, colour, location
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

    // Category filter
    if (filters.category && filters.category !== 'All') {
      if (post.category !== filters.category) {
        return false;
      }
    }

    // Colour filter
    if (filters.colour && filters.colour !== 'All') {
      if (post.colour !== filters.colour) {
        return false;
      }
    }

    // Location filter (free text matching)
    if (filters.location && filters.location.trim()) {
      const locQuery = filters.location.trim().toLowerCase();
      if (!(post.location_text || '').toLowerCase().includes(locQuery)) {
        return false;
      }
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// 1. FOUND POSTS (For Lost Section: I Lost Something -> browse FOUND posts)
// ---------------------------------------------------------------------------

export async function getFoundPosts(): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 40));
  return mockPosts.filter((p) => p.type === 'found');
}

export async function searchFoundPosts(
  query: string = '',
  filters: PostFilterOptions = {}
): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 40));
  const foundPosts = mockPosts.filter((p) => p.type === 'found');
  return filterPosts(foundPosts, query, filters);
}

// ---------------------------------------------------------------------------
// 2. LOST POSTS (For Found Section: I Found Something -> browse LOST posts)
// ---------------------------------------------------------------------------

export async function getLostPosts(): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 40));
  return mockPosts.filter((p) => p.type === 'lost');
}

export async function searchLostPosts(
  query: string = '',
  filters: PostFilterOptions = {}
): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 40));
  const lostPosts = mockPosts.filter((p) => p.type === 'lost');
  return filterPosts(lostPosts, query, filters);
}

// ---------------------------------------------------------------------------
// 3. COMMON POST LOOKUP
// ---------------------------------------------------------------------------

export async function getPostById(postId: string): Promise<Post | null> {
  await new Promise((r) => setTimeout(r, 30));
  const found = mockPosts.find((p) => p.post_id === postId);
  return found ? { ...found } : null;
}

// ---------------------------------------------------------------------------
// 4. POST CREATION
// ---------------------------------------------------------------------------

// Create Lost Post (type = 'lost')
export async function createLostPost(input: CreatePostInput): Promise<Post> {
  await new Promise((r) => setTimeout(r, 60));

  const currentUser = getCurrentUser();
  const newPost: Post = {
    post_id: `post-l${Date.now().toString().slice(-4)}`,
    user_id: currentUser ? currentUser.user_id : 'usr-authenticated-student', // Replaced with auth.uid() in Supabase
    type: 'lost',
    title: input.title.trim(),
    desc_text: input.desc_text.trim(),
    images: input.images || [],
    category: input.category || null,
    colour: input.colour || null,
    location_text: input.location_text || null,
    appearance: null,
    created_at: new Date().toISOString(),
  };

  mockPosts = [newPost, ...mockPosts];
  return newPost;
}

// Create Found Post (type = 'found')
export async function createFoundPost(input: CreatePostInput): Promise<Post> {
  await new Promise((r) => setTimeout(r, 60));

  const currentUser = getCurrentUser();
  const newPost: Post = {
    post_id: `post-f${Date.now().toString().slice(-4)}`,
    user_id: currentUser ? currentUser.user_id : 'usr-authenticated-student', // Replaced with auth.uid() in Supabase
    type: 'found',
    title: input.title.trim(),
    desc_text: input.desc_text.trim(),
    images: input.images || [],
    category: input.category || null,
    colour: input.colour || null,
    location_text: input.location_text || null,
    appearance: null,
    created_at: new Date().toISOString(),
  };

  mockPosts = [newPost, ...mockPosts];
  return newPost;
}

// ---------------------------------------------------------------------------
// 5. OPPOSITE-TYPE SUGGESTED MATCHING
// ---------------------------------------------------------------------------

// Helper to rank matches of opposite type
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

// When creating a LOST post: suggest FOUND posts
export async function getSuggestedFoundMatches(lostPost: Post): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 50));
  const foundPosts = mockPosts.filter((p) => p.type === 'found');
  return rankMatches(lostPost, foundPosts);
}

// When creating a FOUND post: suggest LOST posts (opposite type!)
export async function getSuggestedLostMatches(foundPost: Post): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 50));
  const lostPosts = mockPosts.filter((p) => p.type === 'lost');
  return rankMatches(foundPost, lostPosts);
}
