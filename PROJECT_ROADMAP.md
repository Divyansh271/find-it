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
  - `/lost` (Browse & search found posts from Supabase)
  - `/found` (Browse & search lost posts from Supabase)
  - `/post/[id]` (View full post details from Supabase)
- **Protected Routes & Actions (Auth Required):**
  - `/post/new?type=lost` & `/post/new?type=found` (Create posts in Supabase)
  - `Request conversation` action on post detail (Future: conversations table)
  - `/dashboard` (Future: user incoming/outgoing requests)
  - `/chat/[convo_id]` (Future: realtime messaging)
  - `/profile` (Future: user profile & trust score)
- **Redirection Rule:** When a guest attempts a protected action/route, redirect to `/auth/login?redirect=<targetUrl>`. After successful authentication, return them directly to their intended destination.

---

## 2. Complete Application Routes & Sitemap

| Route | View Component | Access | Description |
|---|---|---|---|
| `/` | `LandingPage.tsx` | Public | Minimal landing page with prominent "Lost" and "Found" options, plus auth state in navbar. |
| `/lost` | `LostSection.tsx` | Public | Searches & filters **FOUND** posts (`type = 'found'`) from Supabase. Multi-filters by Category, Colour, Location. Protected action: `+ Create Lost Post`. |
| `/found` | `FoundSection.tsx` | Public | Searches & filters **LOST** posts (`type = 'lost'`) from Supabase. Multi-filters by Category, Colour, Location. Protected action: `+ Create Found Post`. |
| `/post/new?type=lost` | `CreateLostPost.tsx` | Protected | Collects `title`, `desc_text`, optional tags, images. Saves to Supabase `posts` (`type = 'lost'`) with `user_id = auth.uid()`. Suggests matching FOUND posts. |
| `/post/new?type=found` | `CreateFoundPost.tsx` | Protected | Collects `title`, `desc_text`, optional tags, images. Saves to Supabase `posts` (`type = 'found'`) with `user_id = auth.uid()`. Suggests matching LOST posts. |
| `/post/[id]` | `PostDetail.tsx` | Public | Full post detail view retrieved by `post_id` from Supabase. Action: `Request conversation` (placeholder). |
| `/auth/login` | `LoginPage.tsx` | Public | Supabase Auth sign-in with email & password. Preserves `redirect` query parameter. |
| `/auth/signup` | `SignupPage.tsx` | Public | Supabase Auth registration with `displayName` (2-30 chars, stored in user metadata), email, password. Preserves `redirect`. |
| `/dashboard` | — | Protected | Next phase: My posts, outgoing requests, incoming requests. |
| `/chat/[convo_id]` | — | Protected | Next phase: Realtime chat once request is accepted. |
| `/profile` | — | Protected | Next phase: Student display name & read-only trust score. |

---

## 3. Frontend ↔ Backend Contracts

The frontend interacts with the system strictly through clean service abstractions:

### 3.1 Authentication Abstraction (`src/services/authService.ts`) — [CONNECTED TO SUPABASE AUTH]
Backed by the centralized client in `src/services/supabaseClient.ts`:
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
  display_name: string;   // Public student identity (2-30 chars, from raw_user_meta_data)
  trust_score: number;    // Reputation signal, starts at 0
  created_at: string;
}
```

### 3.2 Posts & Search Abstraction (`src/services/postsService.ts`) — [CONNECTED TO SUPABASE POSTGRES]
Backed by `supabase.from('posts')`:
```typescript
// 1. Found Posts Retrieval (for Lost Section: type = 'found')
getFoundPosts(): Promise<Post[]>
searchFoundPosts(query?: string, filters?: PostFilterOptions): Promise<Post[]>

// 2. Lost Posts Retrieval (for Found Section: type = 'lost')
getLostPosts(): Promise<Post[]>
searchLostPosts(query?: string, filters?: PostFilterOptions): Promise<Post[]>

// 3. Post by ID Lookup
getPostById(postId: string): Promise<Post | null>

// 4. Post Creation (Authenticated user_id = auth.uid())
createLostPost(input: CreatePostInput): Promise<Post>
createFoundPost(input: CreatePostInput): Promise<Post>

// 5. Post Ownership & Management
getUserPosts(userId?: string): Promise<Post[]>
updatePost(postId: string, input: Partial<CreatePostInput>): Promise<Post>
deletePost(postId: string): Promise<void>

// 6. Suggested Opposite-Type Matches
getSuggestedFoundMatches(lostPost: Post): Promise<Post[]>
getSuggestedLostMatches(foundPost: Post): Promise<Post[]>
```

---

## 4. Current Implementation Status

### NOW REAL (Connected to Live Supabase Backend)
- **Supabase Authentication**: `@supabase/supabase-js` login, signup, session persistence, and auth state listeners.
- **Supabase `posts` Database Queries**: `getFoundPosts`, `getLostPosts`, `searchFoundPosts`, `searchLostPosts`, `getPostById`.
- **Lost Feed**: Live query `posts.type = 'found'`.
- **Found Feed**: Live query `posts.type = 'lost'`.
- **Post Creation**: Live `posts.insert()` using authenticated user's ID (`user_id = auth.uid()`).
- **Post Search & Filtering**: Multi-filtering across title, description, category, colour, and location.
- **Current-User Post Ownership**: Enforced in service layer and backed by RLS constraints.

### STILL DUMMY / NOT CONNECTED (Do NOT Claim Implemented)
- **Supabase Storage**: Post photo uploads (`images: text[]`).
- **Google Gemini API**: Tag extraction from descriptions.
- **AI Matching**: Post recommendation uses client-side keyword and tag ranking.
- **Conversations**: The `conversations` table and request flow are not yet connected (`Request Conversation` is an isolated UI placeholder).
- **Messages**: The `messages` table is not yet connected.
- **Realtime**: Realtime WebSocket changes on `messages` are not yet connected.
- **Trust-score resolution**: PostgreSQL `SECURITY DEFINER` function is not yet connected.

---

## 5. Security, Database Migrations & SQL Reference for Codex

Execute the following SQL in the Supabase SQL editor (`https://supabase.com/dashboard/project/gambbvofjmdnjnrhegax/sql`):

### 5.1 `profiles` Table & Trigger Migration
```sql
-- 1. Create Profiles Table
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  trust_score int not null default 0,
  created_at timestamptz default now()
);

-- 2. Grant Permissions
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

-- 3. Enable RLS
alter table public.profiles enable row level security;

-- 4. RLS Policies
create policy "Public profiles are readable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own display_name"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Automatic Profile Creation Trigger from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5.2 `posts` Table Migration & Permissions
```sql
-- 1. Create Posts Table
create table public.posts (
  post_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  type text not null check (type in ('lost', 'found')),
  title text not null,
  desc_text text not null,
  images text[] default '{}',
  category text,
  colour text,
  location_text text,
  appearance jsonb,
  created_at timestamptz default now()
);

-- 2. Grant Permissions to anon & authenticated
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

-- 3. Enable RLS
alter table public.posts enable row level security;

-- 4. Read Policy: Anyone (guest or logged-in) can read posts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using (true);

-- 5. Write Policies: Only authenticated post owner can insert/update/delete
create policy "Users can insert their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);
```

---

## 6. Next Backend Integration — Step-by-Step Checklist for Codex

1. [x] **Supabase Client Setup**: Connected in `src/services/supabaseClient.ts`.
2. [x] **Supabase Auth Wired**: `authService.ts` calls `supabase.auth.*`.
3. [x] **Supabase Posts Data Layer**: `postsService.ts` connects `posts` read, search, filter, and create operations.
4. [ ] **Supabase Storage**: Create an `item-photos` bucket for image uploads.
5. [ ] **Conversations & Dashboard**: Implement `conversations` table and connect request/accept flow.
6. [ ] **Realtime Chat & Resolution**: Enable Realtime on `messages` table and implement the `resolve_handover` PostgreSQL function.
7. [ ] **Gemini AI Tag Extraction**: Add server-side proxy route `/api/extract-tags` calling Gemini to extract category, colour, location from post description.
