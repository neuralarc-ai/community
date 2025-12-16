-- 003_create_comments_table.sql
-- Create the comments table for the threaded discussion system

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
-- Authenticated users can read all comments
CREATE POLICY "comments_select_all" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can create comments
CREATE POLICY "comments_insert_authenticated" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id AND auth.role() = 'authenticated');

-- Comment authors can update their own comments
CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Comment authors can delete their own comments, admins can delete any comment
CREATE POLICY "comments_delete_own_or_admin" ON comments
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
