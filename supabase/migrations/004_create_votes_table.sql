-- 004_create_votes_table.sql
-- Create the votes table for upvote/downvote functionality

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint to prevent duplicate votes (one vote per user per target)
ALTER TABLE votes ADD CONSTRAINT unique_user_target_vote
  UNIQUE (user_id, target_type, target_id);

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
-- Users can read their own votes and votes on content they can access
CREATE POLICY "votes_select_own" ON votes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update/delete their own votes
CREATE POLICY "votes_manage_own" ON votes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_target ON votes(target_type, target_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);
