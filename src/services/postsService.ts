import { Post, PostFilterOptions, CreatePostInput } from '../types/post';

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
];

/**
 * Data Access Layer (DAL)
 * Stable interface: UI -> postsService -> dummy implementation
 * Will be swapped with Supabase calls later without rewriting the UI.
 */

// 1. Get all found posts (for the Lost section)
export async function getFoundPosts(): Promise<Post[]> {
  // Simulate async delay
  await new Promise((r) => setTimeout(r, 40));
  return mockPosts.filter((p) => p.type === 'found');
}

// 2. Search & filter found posts
export async function searchFoundPosts(
  query: string = '',
  filters: PostFilterOptions = {}
): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 40));
  const foundPosts = mockPosts.filter((p) => p.type === 'found');
  const normalizedQuery = query.trim().toLowerCase();

  return foundPosts.filter((post) => {
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

// 3. Get single post by ID
export async function getPostById(postId: string): Promise<Post | null> {
  await new Promise((r) => setTimeout(r, 30));
  const found = mockPosts.find((p) => p.post_id === postId);
  return found ? { ...found } : null;
}

// 4. Create a new lost post (called from /post/new?type=lost)
export async function createLostPost(input: CreatePostInput): Promise<Post> {
  await new Promise((r) => setTimeout(r, 60));

  const newPost: Post = {
    post_id: `post-l${Date.now().toString().slice(-4)}`,
    user_id: 'usr-current-user', // Will be replaced by auth.uid() in Supabase
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

// 5. Get suggested matches for a newly created lost post
// Matches against FOUND posts by category & colour, with location as soft signal
export async function getSuggestedFoundMatches(lostPost: Post): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 50));
  const foundPosts = mockPosts.filter((p) => p.type === 'found');

  return foundPosts
    .map((found) => {
      let score = 0;
      if (lostPost.category && found.category === lostPost.category) {
        score += 3; // Primary signal
      }
      if (lostPost.colour && found.colour === lostPost.colour) {
        score += 2; // Secondary signal
      }
      if (
        lostPost.location_text &&
        found.location_text &&
        (found.location_text.toLowerCase().includes(lostPost.location_text.toLowerCase()) ||
          lostPost.location_text.toLowerCase().includes(found.location_text.toLowerCase()))
      ) {
        score += 1; // Soft location signal
      }

      // Title keyword overlap
      const lostWords = lostPost.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const foundTitle = found.title.toLowerCase();
      for (const word of lostWords) {
        if (foundTitle.includes(word)) score += 1;
      }

      return { post: found, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post);
}
