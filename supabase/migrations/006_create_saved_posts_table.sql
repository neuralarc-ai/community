-- Create the table
create table if not exists saved_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure a user can only save a post once
  unique(user_id, post_id)
);

-- Enable Row Level Security (RLS)
alter table saved_posts enable row level security;

-- Policies (Privacy Logic)

-- 1. Users can only see their OWN saved posts
create policy "Users can view their own saved posts"
  on saved_posts for select
  using (auth.uid() = user_id);

-- 2. Users can only save posts for THEMSELVES
create policy "Users can insert their own saved posts"
  on saved_posts for insert
  with check (auth.uid() = user_id);

-- 3. Users can only remove their OWN saved posts
create policy "Users can delete their own saved posts"
  on saved_posts for delete
  using (auth.uid() = user_id);

