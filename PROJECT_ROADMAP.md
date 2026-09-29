# findIt — Architecture, Code Reference & Developer Roadmap

This document is the **single source of truth** for developers, Codex, Claude, and Gemini working on **findIt**. Read this document to immediately understand the project state, data-access contracts, security requirements, and next implementation steps without burning context window limits.

---

## 1. Access Model & Core Product Rules

### 1.1 The Mirrored-Feed Architecture
- **`/lost` (Lost Section):** Used by a student who **LOST** an item. It displays and searches **FOUND posts** (`type = 'found'`), because a student missing an item needs to see what others have already found.
- **`/found` (Found Section):** Used by a student who **FOUND** an item. It displays and searches **LOST posts** (`type = 'lost'`), because a student holding a found item needs to find the owner's missing report.
- **Opposite-Type Suggestions:**
  - After creating a `lost` post → suggest matching `found` posts.
  - After creating a `found` post → suggest matching `lost` posts.
- **Never reverse these relationships.**

### 1.2 Guest vs. Authenticated User Model
```text
                 findIt
                   │
          ┌────────┴────────┐
          │                 │
       GUEST          AUTHENTICATED
          │                 │
   Browse/search       Browse/search
   View post details   Create Lost/Found posts
                       Request conversations
                       Dashboard & Requests
                       Realtime Chat
                       Profile & Trust score
```

- **Public Routes (Guests Allowed):**
  - `/` (Landing page)
  - `/lost` (Browse & search found posts)
  - `/found` (Browse & search lost posts)
  - `/post/[id]` (View full post details)
- **Protected Routes & Actions (Auth Required):**
  - `/post/new?type=lost` & `/post/new?type=found` (Create posts)
  - `Request conversation` action on post detail
  - `/dashboard` (Future: user incoming/outgoing requests)
  - `/chat/[convo_id]` (Future: realtime messaging)
  - `/profile` (Future: user profile & trust score)
- **Redirection Rule:** When a guest attempts a protected action/route, redirect to `/auth/login?redirect=<targetUrl>`. After successful authentication, return them directly to their intended destination.

---

## 2. Complete Application Routes & Sitemap

| Route | View Component | Access | Description |
|---|---|---|---|
| `/` | `LandingPage.tsx` | Public | Minimal landing page with prominent "Lost" and "Found" options, plus auth state in navbar. |
| `/lost` | `LostSection.tsx` | Public | Searches & filters **FOUND** posts (`type = 'found'`). Multi-filters by Category, Colour, Location. Protected action: `+ Create Lost Post`. |
| `/found` | `FoundSection.tsx` | Public | Searches & filters **LOST** posts (`type = 'lost'`). Multi-filters by Category, Colour, Location. Protected action: `+ Create Found Post`. |
| `/post/new?type=lost` | `CreateLostPost.tsx` | Protected | Collects `title` (required), `desc_text` (required), optional tags, images. Suggests matching FOUND posts upon submission. |
| `/post/new?type=found` | `CreateFoundPost.tsx` | Protected | Collects `title` (required), `desc_text` (required), optional tags, images. Suggests matching LOST posts upon submission. |
| `/post/[id]` | `PostDetail.tsx` | Public | Full post detail view. Protected action: `Request conversation`. |
| `/auth/login` | `LoginPage.tsx` | Public | Collects email & password. Preserves `redirect` query parameter. |
| `/auth/signup` | `SignupPage.tsx` | Public | Collects `displayName` (2-30 chars, privacy-first), email, password. Preserves `redirect`. |
| `/dashboard` | — | Protected | Next phase: My posts, outgoing requests, incoming requests. |
| `/chat/[convo_id]` | — | Protected | Next phase: Realtime chat once request is accepted. |
| `/profile` | — | Protected | Next phase: Student display name & read-only trust score. |

---

## 3. Frontend ↔ Backend Contracts

The frontend interacts with the system strictly through two clean service abstractions. When Supabase is connected by Codex, **only these two service files will be modified**; UI components will remain unchanged.

### 3.1 Authentication Abstraction (`src/services/authService.ts`)
```typescript
getCurrentUser(): User | null
getSession(): Session | null
login(email: string, password: string): Promise<User>
signUp(displayName: string, email: string, password: string): Promise<User>
logout(): Promise<void>
onAuthStateChange(callback: (user: User | null) => void): () => void
```

#### User Entity (`src/types/auth.ts`):
```typescript
export interface User {
  user_id: string;        // UUID from auth.users(id)
  email: string;
  display_name: string;   // Public student identity (2-30 chars)
  trust_score: number;    // Reputation signal, starts at 0
  created_at: string;
}
```

### 3.2 Posts & Search Abstraction (`src/services/postsService.ts`)
```typescript
// 1. Found Posts Retrieval (for Lost Section)
getFoundPosts(): Promise<Post[]>
searchFoundPosts(query?: string, filters?: PostFilterOptions): Promise<Post[]>

// 2. Lost Posts Retrieval (for Found Section)
getLostPosts(): Promise<Post[]>
searchLostPosts(query?: string, filters?: PostFilterOptions): Promise<Post[]>

// 3. Post by ID Lookup
getPostById(postId: string): Promise<Post | null>

// 4. Post Creation
createLostPost(input: CreatePostInput): Promise<Post>
createFoundPost(input: CreatePostInput): Promise<Post>

// 5. Suggested Opposite-Type Matches
getSuggestedFoundMatches(lostPost: Post): Promise<Post[]>
getSuggestedLostMatches(foundPost: Post): Promise<Post[]>
```

---

## 4. Current Implementation Status

### CURRENTLY IMPLEMENTED
- Landing page (`/`)
- Lost section (`/lost` browsing FOUND posts)
- Found section (`/found` browsing LOST posts)
- Lost post creation flow (`/post/new?type=lost`)
- Found post creation flow (`/post/new?type=found`)
- Search & multi-filtering by keywords, category, colour, and location
- Post detail flow (`/post/[id]`) with context-aware back navigation
- Suggested opposite-type matches on post submission
- Frontend authentication flow (`/auth/login` and `/auth/signup`)
- Student display name privacy convention (2-30 characters)
- Auth guards on `/post/new` and `Request conversation`, with target redirection preservation
- Stable DAL & Auth abstraction layers with mock persistence

### NOT YET CONNECTED (Do NOT Claim Implemented)
- Supabase Auth SDK (`@supabase/supabase-js`)
- Supabase PostgreSQL database tables
- Supabase Storage bucket (for post photos and request images)
- Supabase Realtime (for messages delivery)
- Google Gemini API (for AI tag extraction from descriptions)
- Postgres RLS security policies
- Real `conversations` records
- Real `messages` records
- Postgres `SECURITY DEFINER` trust-score resolution function

---

## 5. Security & Row Level Security (RLS) Requirements for Codex

When Codex connects Supabase, the following RLS policies must be applied in PostgreSQL:

### `profiles` Table
- **Read:** Any authenticated user can read `display_name` and `trust_score`.
- **Insert:** Auto-created via database trigger on `auth.users` insert (pulls `display_name` from `raw_user_meta_data`).
- **Update:** A user can update only their **own** `display_name` (`auth.uid() = user_id`).
- **Forbidden:** Users must **NEVER** directly update their own `trust_score`. Only the secure handover resolution function can increment this.

### `posts` Table
- **Read:** Any authenticated user can read posts.
- **Insert:** Only authenticated users can insert posts, with `posts.user_id = auth.uid()`.
- **Update / Delete:** Only the post author can update or delete their own post (`posts.user_id = auth.uid()`).

### `conversations` Table
- **Read / Insert:** Only `owner_id` or `finder_id`. One request per user per post (`UNIQUE(post_id, requested_by)`).
- **Update:** `accepted` can only be flipped by the participant who is **not** `requested_by`.

### `messages` Table (Realtime)
- **Insert / Read:** Only `owner_id` or `finder_id` of the parent conversation, and only once `accepted = true`.

---

## 6. Next Backend Integration — Checklist for Codex

Codex should execute the following integration tasks in order:

1. **Supabase Client Setup**: Install `@supabase/supabase-js` and initialize `src/services/supabaseClient.ts` with environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2. **Connect Auth Abstraction**: Update `src/services/authService.ts` to call:
   - `supabase.auth.signInWithPassword({ email, password })`
   - `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`
   - `supabase.auth.signOut()`
   - `supabase.auth.onAuthStateChange(...)`
3. **Database Migration — `profiles` Table**:
   - `user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 30)`
   - `trust_score int NOT NULL DEFAULT 0`
   - `created_at timestamptz DEFAULT now()`
4. **Database Trigger**:
   - Create trigger function on `auth.users AFTER INSERT` that inserts into `public.profiles` using `new.raw_user_meta_data->>'display_name'`.
5. **Database Migration — `posts` Table**:
   - Create `posts` table referencing `profiles(user_id) ON DELETE CASCADE`.
6. **Connect Posts Abstraction**: Replace in-memory queries in `src/services/postsService.ts` with Supabase PostgreSQL queries (`supabase.from('posts').select(...)`).
7. **Supabase Storage**:
   - Create private bucket for item photos.
   - Upload file attachments and store bucket file paths in `posts.images`.
8. **Gemini AI Tag Extraction**:
   - Server-side proxy or secure edge function receiving `desc_text` and returning suggested `category`, `colour`, `location_text`, and `appearance` before user confirms post creation.
9. **Conversations & Dashboard**:
   - Implement `conversations` table and `/dashboard` view (My Posts, My Requests, Incoming Requests).
10. **Realtime Chat & Resolution**:
    - Implement `messages` table with Realtime Postgres changes.
    - Implement `resolve_handover` PostgreSQL `SECURITY DEFINER` transaction that increments finder's `trust_score` and deletes the post with cascading cleanup.
