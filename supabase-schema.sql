-- ReviewBoost Supabase Schema
-- Run this in your Supabase SQL Editor

-- Reviews table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  platform text not null check (platform in ('Google', 'Tripadvisor', 'Booking.com', 'Yelp', 'Facebook')),
  rating integer not null check (rating between 1 and 5),
  content text not null,
  responded boolean default false not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.reviews enable row level security;

-- RLS Policies: users can only see and modify their own reviews
create policy "Users can view own reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Optional: Insert sample data (replace 'YOUR_USER_ID' with an actual user UUID after signup)
-- insert into public.reviews (user_id, author_name, platform, rating, content, responded) values
--   ('YOUR_USER_ID', 'Maria K.', 'Google', 5, 'Absolut fantastisches Restaurant! Das Essen war unglaublich lecker und der Service top. Komme definitiv wieder!', false),
--   ('YOUR_USER_ID', 'Thomas B.', 'Tripadvisor', 4, 'Sehr gutes Essen, tolle Atmosphäre. Der Service war etwas langsam, aber insgesamt sehr empfehlenswert.', true),
--   ('YOUR_USER_ID', 'Sandra M.', 'Google', 5, 'Bestes Restaurant der Stadt! Die Pasta war perfekt al dente und die Weinkarte beeindruckend. Gerne wieder!', false),
--   ('YOUR_USER_ID', 'Klaus H.', 'Booking.com', 3, 'Ganz ok, aber für den Preis hätte ich mehr erwartet. Das Frühstück war gut, Zimmer etwas klein.', false),
--   ('YOUR_USER_ID', 'Anna L.', 'Google', 5, 'Traumhafter Abend! Das Team ist sehr freundlich und professionell. Die Desserts sind ein Gedicht!', true);
