# findIt — System Integration Log

This document records each progressive integration step from mock/local abstractions to real backend infrastructure (Supabase PostgreSQL, Auth, Storage, and Realtime).

---

## Integration: Supabase Posts Database

**Date:** 2026-09-29  
**Status:** Connected to Supabase PostgreSQL (`https://gambbvofjmdnjnrhegax.supabase.co`)

### 1. What Changed
The post data layer was transitioned from mock memory arrays to real Supabase PostgreSQL queries, preserving the exact data-access abstraction layer and UI components:

- **Modified File:** `src/services/postsService.ts`
  - Replaced dummy in-memory post storage with direct calls to `supabase.from('posts')`.
  - Connected authenticated user identity from Supabase Auth (`getCurrentUser()`).
  - Added safe fallback handling for network interruptions or pending database role grants.
- **Preserved Files & UI:**
  - `src/components/LostSection.tsx` (unchanged, continues consuming `searchFoundPosts`)
  - `src/components/FoundSection.tsx` (unchanged, continues consuming `searchLostPosts`)
  - `src/components/CreateLostPost.tsx` (unchanged, continues consuming `createLostPost`)
  - `src/components/CreateFoundPost.tsx` (unchanged, continues consuming `createFoundPost`)
  - `src/components/PostDetail.tsx` (unchanged, continues consuming `getPostById`)

---

### 2. Database Operations Now Connected

| Operation | Data Access Function | PostgreSQL Query | Access Level |
|---|---|---|---|
| **Read Found Posts** | `getFoundPosts()` | `select * from posts where type = 'found' order by created_at desc` | Public / Guest & Authenticated |
| **Search Found Posts** | `searchFoundPosts(query, filters)` | `select * from posts where type = 'found' and category = $1 and colour = $2 and location_text ilike $3 and (...)` | Public / Guest & Authenticated |
| **Read Lost Posts** | `getLostPosts()` | `select * from posts where type = 'lost' order by created_at desc` | Public / Guest & Authenticated |
| **Search Lost Posts** | `searchLostPosts(query, filters)` | `select * from posts where type = 'lost' and category = $1 and colour = $2 and location_text ilike $3 and (...)` | Public / Guest & Authenticated |
| **Get Post by ID** | `getPostById(postId)` | `select * from posts where post_id = $1 limit 1` | Public / Guest & Authenticated |
| **Create Lost Post** | `createLostPost(input)` | `insert into posts (user_id, type, title, desc_text, images, category, colour, location_text, appearance) values ($1, 'lost', ...)` | Authenticated (`user_id = auth.uid()`) |
| **Create Found Post** | `createFoundPost(input)` | `insert into posts (user_id, type, title, desc_text, images, category, colour, location_text, appearance) values ($1, 'found', ...)` | Authenticated (`user_id = auth.uid()`) |
| **User's Own Posts** | `getUserPosts(userId)` | `select * from posts where user_id = $1 order by created_at desc` | Authenticated |
| **Update Post** | `updatePost(postId, input)` | `update posts set title = $1, desc_text = $2, ... where post_id = $3 and user_id = auth.uid()` | Owner only |
| **Delete Post** | `deletePost(postId)` | `delete from posts where post_id = $1 and user_id = auth.uid()` | Owner only |

---

### 3. Mirrored-Feed Mapping

The strict product rule has been preserved:

```text
/lost  ──► posts.type = 'found'   (Students missing an item browse what others have FOUND)
/found ──► posts.type = 'lost'    (Students holding a found item browse who LOST one)
```

**Opposite-Type Suggestions:**
- Creating a `lost` post triggers `getSuggestedFoundMatches(lostPost)` (queries and suggests `found` posts).
- Creating a `found` post triggers `getSuggestedLostMatches(foundPost)` (queries and suggests `lost` posts).

---

### 4. Security & RLS Policy Implementation

The `posts` table uses PostgreSQL Row Level Security:
- **Ownership Verification:** Posts can only be created with the current authenticated user's ID (`user_id = auth.uid()`). Arbitrary client spoofing is rejected.
- **Foreign Key Safety:** Automatic profile upsert ensures the foreign key `posts.user_id -> profiles(user_id)` is satisfied.
- **SQL RLS & Role Grants to Execute in Supabase SQL Editor:**
  ```sql
  -- 1. Grant table privileges to anon and authenticated roles
  grant select on public.posts to anon, authenticated;
  grant insert, update, delete on public.posts to authenticated;

  -- 2. Enable Row Level Security
  alter table public.posts enable row level security;

  -- 3. Read policy: Anyone (guest or authenticated) can browse posts
  create policy "Public posts are viewable by everyone"
    on public.posts for select
    using (true);

  -- 4. Write policies: Only authenticated owners can modify their posts
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

### 5. Status Summary

#### NOW REAL (Connected to Live Supabase Backend)
- **Supabase Authentication**: `@supabase/supabase-js` login, signup, session persistence, and auth state listeners.
- **Supabase `posts` queries**: Live SELECT, INSERT, UPDATE, DELETE connected through `postsService.ts`.
- **Lost feed**: Real `found` posts queried and filtered.
- **Found feed**: Real `lost` posts queried and filtered.
- **Post detail retrieval**: Real `post_id` lookup via `getPostById`.
- **Post creation**: Real `lost` and `found` rows inserted into `posts` with current `user_id = auth.uid()`.
- **Post search/filtering**: Real database queries supporting keywords, categories, colours, and locations.
- **Current-user post ownership**: Strictly bounded to the authenticated session.

#### STILL DUMMY / NOT CONNECTED (Untouched as required)
- **Supabase Storage**: Image uploads remain placeholders (`images: text[]`).
- **Gemini API**: AI structured tag extraction from description remains dummy/client-edited.
- **AI Matching**: Post suggestion scoring uses client-side keyword and tag ranking.
- **Conversations**: The `conversations` table and request flow are not yet connected (`Request Conversation` is an isolated UI state).
- **Messages**: The `messages` table is not yet connected.
- **Realtime**: Supabase Postgres Changes listeners on `messages` are not yet connected.
- **Trust-score resolution**: PostgreSQL `SECURITY DEFINER` increment function is not yet connected.

---

### 6. Next Integration Step

**Next step: integrate conversations/messages and realtime communication.**
*(Do not implement this step until explicitly prompted).*
