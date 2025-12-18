-- Create workshops table
create table workshops (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  start_time timestamptz not null,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED', 'LIVE', 'ENDED')),
  recording_url text,
  created_at timestamptz default now()
);

-- Create workshop_waitlist table
create table workshop_waitlist (
  id uuid default gen_random_uuid() primary key,
  workshop_id uuid references workshops(id) on delete cascade not null,
  user_email text not null,
  notified boolean default false,
  created_at timestamptz default now(),
  unique(workshop_id, user_email)
);

-- Enable RLS
alter table workshops enable row level security;
alter table workshop_waitlist enable row level security;

-- Policies for workshops
-- Everyone can view workshops
create policy "Workshops are viewable by everyone"
  on workshops for select
  using (true);

-- Authenticated users can create workshops (hosts)
create policy "Users can create workshops"
  on workshops for insert
  with check (auth.uid() = host_id);

-- Hosts can update their own workshops
create policy "Hosts can update their own workshops"
  on workshops for update
  using (auth.uid() = host_id);

-- Hosts can delete their own workshops
create policy "Hosts can delete their own workshops"
  on workshops for delete
  using (auth.uid() = host_id);

-- Policies for workshop_waitlist
-- Anyone can join waitlist (insert)
create policy "Anyone can join waitlist"
  on workshop_waitlist for insert
  with check (true);

-- Hosts can view waitlist for their workshops
create policy "Hosts can view waitlist"
  on workshop_waitlist for select
  using (
    exists (
      select 1 from workshops
      where workshops.id = workshop_waitlist.workshop_id
      and workshops.host_id = auth.uid()
    )
  );

-- Storage bucket for recordings
-- Note: This requires the storage schema to be available. 
-- In Supabase, buckets are usually created via dashboard or client, but SQL is possible.
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', true)
on conflict (id) do nothing;

-- Storage policies
-- Allow public read access to recordings
create policy "Recordings are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'recordings' );

-- Allow authenticated uploads (if needed for manual uploads, otherwise egress uses S3 keys)
create policy "Authenticated users can upload recordings"
  on storage.objects for insert
  with check ( bucket_id = 'recordings' and auth.role() = 'authenticated' );

