# findIt — Architecture, Code Reference & Developer Roadmap

This document serves as the **master reference** for engineers and AI models (Codex, Claude, Gemini, etc.) developing the **findIt** university lost-and-found platform. Read this file to immediately understand the code structure, data layer functions, endpoints, and future roadmap without wasting context tokens.

---

## 1. Core Product Rule: The Mirrored-Feed Architecture

The application uses an intentional mirrored-feed structure:
- **`/lost` (Lost Section):** Used by a student who **LOST** an item. It displays and searches **FOUND posts** (`type = 'found'`), because a student missing an item needs to see what others have already found.
- **`/found` (Found Section):** Used by a student who **FOUND** an item. It displays and searches **LOST posts** (`type = 'lost'`), because a student holding an item needs to find the owner's missing report.
- **Post-Submission Suggestions:**
  - After creating a `lost` post → suggest matching `found` posts.
  - After creating a `found` post → suggest matching `lost` posts.
- **Never reverse these relationships.**

---

## 2. Complete Application Routes & Sitemaps

| Route | View Component | Status | Description |
|---|---|---|---|
| `/` | `LandingPage.tsx` | Completed | Minimal university landing page with prominent "Lost" and "Found" options, plus dummy login/signup buttons. |
| `/lost` | `LostSection.tsx` | Completed | Searches & filters **FOUND** posts (`type = 'found'`). Multi-filters by Category, Colour, and Location. Includes `+ Create Lost Post` button. |
| `/found` | `FoundSection.tsx` | Completed | Searches & filters **LOST** posts (`type = 'lost'`). Multi-filters by Category, Colour, and Location. Includes `+ Create Found Post` button. |
| `/post/new?type=lost` | `CreateLostPost.tsx` | Completed | Collects `title` (required), `desc_text` (required), optional tags, images preview. After submission, displays top suggested **FOUND** matches. |
| `/post/new?type=found` | `CreateFoundPost.tsx` | Completed | Collects `title` (required), `desc_text` (required), optional tags, images preview. After submission, displays top suggested **LOST** matches. |
| `/post/[id]` | `PostDetail.tsx` | Completed | Post detail view showing category, colour, location, timestamp, full description, and placeholder `Request conversation` action. |
| `/auth/signup` | — | Planned | Student signup: display name, university email, password. |
| `/auth/login` | — | Planned | Student login flow. |
| `/dashboard` | — | Planned | Tabs: My Posts, My Requests (outgoing), Incoming Requests (accept/decline). |
| `/chat/[convo_id]` | — | Planned | Realtime chat between `owner_id` and `finder_id` once request is accepted. |
| `/profile` | — | Planned | Read-only profile with display name and reputation trust score. |

---

## 3. Data Access Layer (DAL) Reference: `src/services/postsService.ts`

All data interactions are strictly abstracted behind asynchronous functions. When Supabase is connected, **only this file will be updated**—the UI components will remain unchanged.

### Types (`src/types/post.ts`)
```typescript
export type PostType = 'lost' | 'found';

export interface Post {
  post_id: string;
  user_id: string;
  type: PostType;
  title: string;
  desc_text: string;
  images?: string[];
  category?: string | null;
  colour?: string | null;
  location_text?: string | null;
  appearance?: Record<string, any> | null;
  created_at: string;
}

export interface PostFilterOptions {
  category?: string;
  colour?: string;
  location?: string;
}

export interface CreatePostInput {
  title: string;
  desc_text: string;
  images?: string[];
  category?: string;
  colour?: string;
  location_text?: string;
}
```

### Exported Constants
- `CATEGORIES`: `['Electronics', 'ID & Cards', 'Keys & Lanyards', 'Bottles & Tumblers', 'Bags & Backpacks', 'Books & Notes', 'Clothing & Accessories', 'Other']`
- `COLOURS`: `['Black', 'White', 'Blue', 'Red', 'Silver / Grey', 'Green', 'Brown', 'Gold / Yellow', 'Purple', 'Other']`

### Service Functions
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

## 4. Database Schema (Target: Supabase Postgres)

The database consists of 4 relational tables with cascading deletes:

### 4.1 `profiles`
- `user_id` (uuid, PK, references `auth.users.id` ON DELETE CASCADE)
- `display_name` (text, check length between 2 and 30 characters, student safety)
- `trust_score` (int, default `0`, modified ONLY via `SECURITY DEFINER` function upon resolved handover)
- `created_at` (timestamptz, default `now()`)

### 4.2 `posts`
- `post_id` (uuid, PK)
- `user_id` (uuid, references `profiles.user_id` ON DELETE CASCADE)
- `type` (text, check constraint `'lost' | 'found'`)
- `title` (text, required)
- `desc_text` (text, required free-form description)
- `images` (text[], array of private storage bucket paths)
- `category` (text, matches `CATEGORIES` list)
- `colour` (text, matches `COLOURS` list)
- `location_text` (text, free-form campus building/room)
- `appearance` (jsonb, extracted distinguishing marks)
- `created_at` (timestamptz, default `now()`)
*Note: Post `status` is NEVER stored on disk; it is dynamically computed at query time (Open / Requested / In Chat) based on linked conversations.*

### 4.3 `conversations`
- `convo_id` (uuid, PK)
- `post_id` (uuid, references `posts.post_id` ON DELETE CASCADE)
- `owner_id` (uuid, role = whoever lost the item)
- `finder_id` (uuid, role = whoever found the item)
- `requested_by` (uuid, must equal `owner_id` or `finder_id`)
- `request_text` (text, optional note)
- `request_img` (text, optional photo attached to request before chat opens)
- `accepted` (boolean, default `false`)
- `created_at` (timestamptz, default `now()`)
*Constraint: Unique on `(post_id, requested_by)` prevents duplicate requests from the same user on the same post.*

### 4.4 `messages` (Realtime Enabled)
- `id` (bigint identity, PK)
- `convo_id` (uuid, references `conversations.convo_id` ON DELETE CASCADE)
- `sender_id` (uuid, references `profiles.user_id`)
- `msg_text` (text, nullable)
- `msg_img` (text, storage path, nullable)
- `created_at` (timestamptz, default `now()`)
*Constraint: `msg_text IS NOT NULL OR msg_img IS NOT NULL`.*

---

## 5. Upcoming Implementation Phases

- [x] **Step 1: Landing Page & Mirrored Navigation** (`/`, `/lost` placeholder, `/found` placeholder, dummy auth buttons)
- [x] **Step 2: Lost Section** (`/lost` search & filters for FOUND posts, `/post/new?type=lost`, suggested found matches, `/post/:id` detail view)
- [x] **Step 3: Found Section** (`/found` search & filters for LOST posts, `/post/new?type=found`, suggested lost matches, `/post/:id` detail view)
- [ ] **Step 4: Supabase Connection & Authentication** (Connect client, sign-up with display name, sign-in, session state)
- [ ] **Step 5: Gemini AI Tag Extraction** (Extract `category`, `colour`, `location_text`, and `appearance` from `desc_text` for user confirmation before saving)
- [ ] **Step 6: Request Conversation & Dashboard** (`/dashboard` with incoming/outgoing requests, accept/decline flows)
- [ ] **Step 7: Realtime Chat & Handover Resolution** (`/chat/[convo_id]`, owner-initiated resolution, `trust_score` increment)
