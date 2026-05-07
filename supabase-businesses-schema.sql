-- ReviewBoost: Businesses Schema
-- Run this AFTER supabase-schema.sql in the SQL Editor

-- Businesses table
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address text,
  place_id text,
  google_maps_url text,
  google_review_url text,
  phone text,
  website text,
  rating numeric(2,1),
  total_ratings integer,
  photo_url text,
  chain_name text,
  is_chain_member boolean default false,
  created_at timestamptz default now() not null
);

alter table public.businesses enable row level security;

create policy "Users can view own businesses"
  on public.businesses for select using (auth.uid() = user_id);

create policy "Users can insert own businesses"
  on public.businesses for insert with check (auth.uid() = user_id);

create policy "Users can update own businesses"
  on public.businesses for update using (auth.uid() = user_id);

create policy "Users can delete own businesses"
  on public.businesses for delete using (auth.uid() = user_id);

-- Add business_id to reviews (optional, for linking)
alter table public.reviews
  add column if not exists business_id uuid references public.businesses(id) on delete set null;
