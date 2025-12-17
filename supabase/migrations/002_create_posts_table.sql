-- 002_create_posts_table.sql
-- Create the posts table for the discussion system

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
-- Authenticated users can read all posts
CREATE POLICY "posts_select_all" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can create posts
CREATE POLICY "posts_insert_authenticated" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id AND auth.role() = 'authenticated');

-- Post authors can update their own posts
CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Post authors can delete their own posts, admins can delete any post
CREATE POLICY "posts_delete_own_or_admin" ON posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
