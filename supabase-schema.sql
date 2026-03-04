-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to create tables for shared data.
-- Then set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and Vercel.

-- Users (username is login; password stored in plain text for demo only)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  is_admin boolean default false,
  join_date timestamptz default now(),
  display_name text,
  avatar text
);

-- Store listings
create table if not exists public.store_posts (
  id uuid primary key default gen_random_uuid(),
  author_username text not null,
  title text not null,
  description text,
  price text default '0',
  date timestamptz default now(),
  category text default 'OTHER',
  image text,
  views int default 0
);

-- DMs: one row per message, thread_key = sorted "user1::user2"
create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_key text not null,
  from_username text not null,
  to_username text not null,
  text text not null,
  date timestamptz default now()
);
create index if not exists idx_dm_messages_thread on public.dm_messages(thread_key);

-- News channel
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  author_username text not null,
  title text not null,
  body text,
  date timestamptz default now()
);

-- Banned usernames
create table if not exists public.banned (
  username text primary key
);

-- Crypto balances (site currency)
create table if not exists public.crypto_balances (
  username text primary key,
  balance numeric default 0
);

-- Allow anonymous read/write for demo (so you and friends can use without Supabase Auth).
-- For production you would use Row Level Security with real auth.
alter table public.users enable row level security;
alter table public.store_posts enable row level security;
alter table public.dm_messages enable row level security;
alter table public.news enable row level security;
alter table public.banned enable row level security;
alter table public.crypto_balances enable row level security;

create policy "Allow all for users" on public.users for all using (true) with check (true);
create policy "Allow all for store_posts" on public.store_posts for all using (true) with check (true);
create policy "Allow all for dm_messages" on public.dm_messages for all using (true) with check (true);
create policy "Allow all for news" on public.news for all using (true) with check (true);
create policy "Allow all for banned" on public.banned for all using (true) with check (true);
create policy "Allow all for crypto_balances" on public.crypto_balances for all using (true) with check (true);

-- Enable Realtime so DMs and store listings update without refresh (run this after tables exist)
alter publication supabase_realtime add table public.dm_messages;
alter publication supabase_realtime add table public.store_posts;
