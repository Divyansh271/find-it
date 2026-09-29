# findIt — Architecture & AI Developer Roadmap

This document serves as the **source of truth** for developers and AI models (Codex, Claude, Gemini, etc.) working on the **findIt** codebase. Please read this file before implementing new features to maintain architectural consistency.

---

## 1. Project Purpose & Core Rules

**findIt** is a campus lost-and-found platform built for university students to report missing or found belongings, connect with the other party through an intentional request-and-accept flow, and coordinate handoffs in real-time chat.

### The Fundamental Mirrored-Feed Rule
- **`/lost` (Lost section):** Represents a student who **LOST** an item. Therefore, this section searches and displays **FOUND posts** (items that other students have already picked up or turned in).
- **`/found` (Found section):** Represents a student who **FOUND** an item. Therefore, this section searches and displays **LOST posts** (reports from students missing an item).
- **Never accidentally reverse this mapping.**

---

## 2. Complete Sitemap & Route Hierarchy

```text
/                      → Landing page with prominent "Lost" and "Found" actions
├── /lost              → Lost section: Search & browse FOUND posts [Implemented]
├── /found             → Found section: Search & browse LOST posts [Step 1 placeholder]
├── /post/new          → Create a post (?type=lost [Implemented] or ?type=found [Upcoming])
│   └── Gemini AI tag extraction step (category, colour, location, appearance)
│   └── Suggested opposite-type matches shown post-submission
├── /post/[id]         → Single post detail view with "Request conversation" action
├── /dashboard         → User dashboard (My posts, My requests, Incoming requests)
├── /chat/[convo_id]   → Realtime chat (only after a request is accepted)
└── /profile           → User profile (display name, read-only trust score)
```

---

## 3. Database Schema (Target Supabase Postgres)

The project will connect to 4 tables in Supabase Postgres. Status is **never stored** on posts; it is computed at query time from conversations.

### 3.1 `profiles`
- `user_id` (uuid, PK, FK → `auth.users.id` ON DELETE CASCADE)
- `display_name` (text, 2-30 chars, used instead of real names for student safety)
- `trust_score` (int, default 0, modified **only** via Postgres `SECURITY DEFINER` function on resolved handover)
- `created_at` (timestamptz, default `now()`)

### 3.2 `posts`
- `post_id` (uuid, PK)
- `user_id` (uuid, FK → `profiles.user_id` ON DELETE CASCADE)
- `type` (text, check `'lost' | 'found'`)
- `title` (text, required)
- `desc_text` (text, required free-form input)
- `images` (text[], storage paths)
- `category` (text, fixed list: `CATEGORIES` in `src/services/postsService.ts`)
- `colour` (text, fixed list: `COLOURS` in `src/services/postsService.ts`)
- `location_text` (text, free-form location)
- `appearance` (jsonb, optional distinguishing marks)
- `created_at` (timestamptz)

### 3.3 `conversations`
- `convo_id` (uuid, PK)
- `post_id` (uuid, FK → `posts.post_id` ON DELETE CASCADE)
- `owner_id` (uuid, role = whoever lost the item)
- `finder_id` (uuid, role = whoever found the item)
- `requested_by` (uuid, must equal `owner_id` or `finder_id`)
- `request_text` (text, optional note)
- `request_img` (text, optional photo attached to request before chat opens)
- `accepted` (boolean, default false)
- `created_at` (timestamptz)
- *Unique constraint on `(post_id, requested_by)`*

### 3.4 `messages` (Realtime enabled)
- `id` (bigint identity, PK)
- `convo_id` (uuid, FK → `conversations.convo_id` ON DELETE CASCADE)
- `sender_id` (uuid, FK → `profiles.user_id`)
- `msg_text` (text)
- `msg_img` (text, storage path)
- `created_at` (timestamptz)

---

## 4. Current Code Structure & Data Access Layer

Data access is strictly separated so UI components do not touch raw mock data or future database drivers directly.

```text
UI Components
      ↓
src/services/postsService.ts  (Data Access Layer)
      ↓
[Current: In-Memory Mock Store]  ──► [Future: Supabase Client & RLS]
```

### Key Service Functions in `src/services/postsService.ts`:
- `getFoundPosts()`: Retrieves all posts where `type === 'found'`.
- `searchFoundPosts(query, filters)`: Keyword search over title/description/category/colour/location with multi-filters.
- `getPostById(id)`: Retrieves a single post.
- `createLostPost(input)`: Validates and appends a `type === 'lost'` post.
- `getSuggestedFoundMatches(lostPost)`: Calculates match similarity against found posts (category + colour primary, location soft signal). Later replaced with Gemini API.

---

## 5. Implementation Status

| Feature / Page | Status | Notes |
|---|---|---|
| Landing Page (`/`) | Completed | Clean UI with Lost & Found primary options, dummy auth buttons |
| Lost Section (`/lost`) | Completed | Searches & filters **FOUND** posts, category/colour/location filters |
| Create Lost Post (`/post/new?type=lost`) | Completed | Form collecting title, description, optional tags & image preview |
| Post-Creation Suggested Matches | Completed | Shows top 3 matching found posts upon submitting a lost post |
| Post Detail View (`/post/[id]`) | Completed | Shows post details, metadata, and "Request conversation" placeholder |
| Found Section (`/found`) | Pending | Next step: search & browse **LOST** posts |
| Create Found Post (`/post/new?type=found`) | Pending | Flow for finder creating a found-item post |
| Supabase Integration | Pending | Auth, Postgres, Storage, RLS policies |
| Gemini AI Extraction | Pending | Server-side function extracting category, colour, location from `desc_text` |
| Conversations & Chat | Pending | Request & accept flow, realtime chat, resolution & trust score |
