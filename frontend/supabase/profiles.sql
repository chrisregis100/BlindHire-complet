-- ============================================================
-- BlindHire: profiles table + avatars storage bucket
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create profiles table
create table if not exists public.profiles (
  wallet_address text primary key,
  name           text not null,
  title          text,
  bio            text,
  country        text,
  avatar_url     text,
  skills         jsonb not null default '[]'::jsonb,
  rating         double precision not null default 0,
  created_at     timestamptz not null default now()
);

-- 2. Enable Row-Level Security
alter table public.profiles enable row level security;

-- 3. MVP RLS policies — open read/write via anon key
--    WARNING: This is suitable for hackathon/MVP only.
--    For production, restrict writes to authenticated wallet owners.

create policy "Anyone can read profiles"
  on public.profiles for select
  using (true);

create policy "Anyone can insert profiles"
  on public.profiles for insert
  with check (true);

create policy "Anyone can update profiles"
  on public.profiles for update
  using (true)
  with check (true);

-- 4. Create avatars storage bucket (public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 5. Storage RLS — allow public reads and anon uploads
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Avatar anon upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "Avatar anon update"
  on storage.objects for update
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');
