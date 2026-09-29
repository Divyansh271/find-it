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
| `/auth/login` | `LoginPage.tsx` | Public | Supabase Auth sign-in with email & password. Preserves `redirect` query parameter. |
| `/auth/signup` | `SignupPage.tsx` | Public | Supabase Auth registration with `displayName` (2-30 chars, stored in user metadata), email, password. Preserves `redirect`. |
| `/dashboard` | — | Protected | Next phase: My posts, outgoing requests, incoming requests. |
| `/chat/[convo_id]` | — | Protected | Next phase: Realtime chat once request is accepted. |
| `/profile` | — | Protected | Next phase: Student display name & read-only trust score. |

---

## 3. Frontend ↔ Backend Contracts

The frontend interacts with the system strictly through two clean service abstractions:

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

### 3.2 Posts & Search Abstraction (`src/services/postsService.ts`) — [TEMPORARY MOCK / READY FOR POSTGRES]
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
- **Supabase Auth Integration**: `@supabase/supabase-js` connected via `src/services/supabaseClient.ts`
- Real email/password login and registration wired to live Supabase Auth instance (`https://gambbvofjmdnjnrhegax.supabase.co`)
- `displayName` passed through Supabase user metadata (`raw_user_meta_data->>'display_name'`)
- Session persistence and `onAuthStateChange` synchronization
- Landing page (`/`)
- Lost section (`/lost` browsing FOUND posts)
- Found section (`/found` browsing LOST posts)
- Lost post creation flow (`/post/new?type=lost`)
- Found post creation flow (`/post/new?type=found`)
- Search & multi-filtering by keywords, category, colour, and location
- Post detail flow (`/post/[id]`) with context-aware back navigation
- Suggested opposite-type matches on post submission
- Auth guards on `/post/new` and `Request conversation`, with target redirection preservation

### NOT YET CONNECTED (Do NOT Claim Implemented)
- Supabase PostgreSQL database tables (`posts`, `profiles`, `conversations`, `messages`)
- Supabase Storage bucket (for post photos and request images)
- Supabase Realtime (for messages delivery)
- Google Gemini API (for AI tag extraction from descriptions)
- Postgres RLS security policies
- Real `conversations` records
- Real `messages` records
- Postgres `SECURITY DEFINER` trust-score resolution function

---

## 5. Security, Database Migrations & Trigger Reference for Codex

When setting up the database in Supabase SQL editor:

### 5.1 `profiles` Table & Trigger Migration
```sql
-- 1. Create Profiles Table
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  trust_score int not null default 0,
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. RLS Policies
create policy "Public profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own display_name"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Automatic Profile Creation Trigger from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5.2 `posts` Table Migration
```sql
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

alter table public.posts enable row level security;

create policy "Posts are readable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

create policy "Users can insert their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);
```

---

## 6. Next Backend Integration — Step-by-Step Checklist for Codex

1. [x] **Supabase Client Setup**: Connected in `src/services/supabaseClient.ts`.
2. [x] **Supabase Auth Wired**: `authService.ts` calls `supabase.auth.*`.
3. [ ] **Database Migration — `profiles`**: Run the SQL trigger above so `auth.users` automatically syncs to `public.profiles`.
4. [ ] **Database Migration — `posts`**: Create the `posts` table in Supabase PostgreSQL.
5. [ ] **Connect Posts Abstraction**: Replace dummy operations in `src/services/postsService.ts` with `supabase.from('posts').select(...)` and `supabase.from('posts').insert(...)`.
6. [ ] **Supabase Storage**: Create an `item-photos` bucket for image uploads.
7. [ ] **Gemini AI Tag Extraction**: Add server-side proxy route `/api/extract-tags` calling Gemini to extract category, colour, location from post description.
8. [ ] **Conversations & Dashboard**: Implement `conversations` table and connect request/accept flow.
9. [ ] **Realtime Chat & Resolution**: Enable Realtime on `messages` table and implement the `resolve_handover` PostgreSQL function.
