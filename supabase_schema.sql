-- ==============================================================================
-- findIt — Supabase PostgreSQL Schema, Security Rules & Functions
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gambbvofjmdnjnrhegax/sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE & TRIGGER
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 50),
  trust_score int not null default 0,
  created_at timestamptz not null default now()
);

grant all on public.profiles to anon, authenticated;
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are readable by everyone" on public.profiles;
create policy "Public profiles are readable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own display_name" on public.profiles;
create policy "Users can update their own display_name"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profile auto-creation trigger on new user signup
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
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. POSTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.posts (
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
  created_at timestamptz not null default now()
);

grant all on public.posts to anon, authenticated;
alter table public.posts enable row level security;

drop policy if exists "Public posts are viewable by everyone" on public.posts;
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using (true);

drop policy if exists "Users can insert their own posts" on public.posts;
create policy "Users can insert their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. CONVERSATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.conversations (
  convo_id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(post_id) on delete cascade,
  owner_id uuid not null references public.profiles(user_id) on delete cascade,
  finder_id uuid not null references public.profiles(user_id) on delete cascade,
  requested_by uuid not null references public.profiles(user_id) on delete cascade,
  request_text text,
  request_img text,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  constraint uq_conversations_post_requester unique (post_id, requested_by)
);

-- Foreign key constraints for relational queries
alter table public.conversations
  drop constraint if exists conversations_owner_id_fkey,
  add constraint conversations_owner_id_fkey foreign key (owner_id) references public.profiles(user_id) on delete cascade;

alter table public.conversations
  drop constraint if exists conversations_finder_id_fkey,
  add constraint conversations_finder_id_fkey foreign key (finder_id) references public.profiles(user_id) on delete cascade;

alter table public.conversations
  drop constraint if exists conversations_requested_by_fkey,
  add constraint conversations_requested_by_fkey foreign key (requested_by) references public.profiles(user_id) on delete cascade;

grant all on public.conversations to anon, authenticated;
alter table public.conversations enable row level security;

-- Only participants (owner, finder, or requester) can read the conversation
drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() in (owner_id, finder_id, requested_by));

-- Authenticated user can insert a conversation request where requested_by is themselves
drop policy if exists "Users can create conversation requests" on public.conversations;
create policy "Users can create conversation requests"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = requested_by);

-- ONLY the non-requester participant can accept a request
drop policy if exists "Non-requester participant can accept request" on public.conversations;
create policy "Non-requester participant can accept request"
  on public.conversations for update
  to authenticated
  using (
    auth.uid() in (owner_id, finder_id)
    and auth.uid() != requested_by
  )
  with check (
    auth.uid() in (owner_id, finder_id)
    and auth.uid() != requested_by
  );

-- Participants can delete conversations (decline request or end conversation)
drop policy if exists "Participants can delete conversations" on public.conversations;
create policy "Participants can delete conversations"
  on public.conversations for delete
  to authenticated
  using (auth.uid() in (owner_id, finder_id));

-- ------------------------------------------------------------------------------
-- 4. MESSAGES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.messages (
  id bigint generated by default as identity primary key,
  convo_id uuid not null references public.conversations(convo_id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete cascade,
  msg_text text,
  msg_img text,
  created_at timestamptz not null default now(),
  constraint chk_message_has_content check (msg_text is not null or msg_img is not null)
);

alter table public.messages
  drop constraint if exists messages_sender_id_fkey,
  add constraint messages_sender_id_fkey foreign key (sender_id) references public.profiles(user_id) on delete cascade;

grant all on public.messages to anon, authenticated;
alter table public.messages enable row level security;

-- Participants can select messages if they belong to the conversation
drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.convo_id = messages.convo_id
        and (c.owner_id = auth.uid() or c.finder_id = auth.uid())
        and c.accepted = true
    )
  );

-- Only participants in accepted conversations can insert messages, and sender_id must be auth.uid()
drop policy if exists "Participants can insert messages in accepted conversations" on public.messages;
create policy "Participants can insert messages in accepted conversations"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.convo_id = messages.convo_id
        and (c.owner_id = auth.uid() or c.finder_id = auth.uid())
        and c.accepted = true
    )
  );

-- Enable Supabase Realtime Postgres Changes on messages
alter publication supabase_realtime add table public.messages;

-- ------------------------------------------------------------------------------
-- 5. SECURE TRANSACTIONAL RESOLUTION RPC (Trust Score + Post & Convo Cleanup)
-- ------------------------------------------------------------------------------
create or replace function public.resolve_conversation(p_convo_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_convo record;
  v_finder_id uuid;
  v_post_id uuid;
  v_new_trust_score int;
begin
  -- 1. Identify the authenticated caller
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized: must be logged in to resolve a conversation';
  end if;

  -- 2. Fetch the conversation
  select * into v_convo
  from public.conversations
  where convo_id = p_convo_id;

  if not found then
    raise exception 'Conversation not found';
  end if;

  -- 3. Verify conversation is accepted
  if not v_convo.accepted then
    raise exception 'Cannot resolve a conversation that has not been accepted';
  end if;

  -- 4. Verify only the owner (the person who lost the item) can resolve
  if v_convo.owner_id != v_user_id then
    raise exception 'Only the item owner can confirm return and resolve this conversation';
  end if;

  v_finder_id := v_convo.finder_id;
  v_post_id := v_convo.post_id;

  -- 5. Increment the finder's trust score by exactly 1
  update public.profiles
  set trust_score = trust_score + 1
  where user_id = v_finder_id
  returning trust_score into v_new_trust_score;

  -- 6. Delete the post (this post has been returned and resolved)
  delete from public.posts
  where post_id = v_post_id;

  -- 7. Delete the conversation (messages cascade)
  delete from public.conversations
  where convo_id = p_convo_id;

  -- 8. Return result
  return json_build_object(
    'success', true,
    'finder_id', v_finder_id,
    'new_trust_score', v_new_trust_score
  );
end;
$$;

-- Grant execution to authenticated users
grant execute on function public.resolve_conversation(uuid) to authenticated;

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET & POLICIES (item-photos)
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access to Item Photos" on storage.objects;
create policy "Public Access to Item Photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

drop policy if exists "Authenticated users can upload item photos" on storage.objects;
create policy "Authenticated users can upload item photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-photos');
