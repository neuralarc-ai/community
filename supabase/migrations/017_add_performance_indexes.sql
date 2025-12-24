
-- Indexes for 'comments' table
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments (author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);

-- Indexes for 'posts' table
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts (is_pinned);
-- For title and body searches, if using ILIKE frequently, consider a GIN index for full-text search:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Enable pg_trgm for better LIKE performance
-- CREATE INDEX IF NOT EXISTS trgm_idx_posts_title ON posts USING GIN (title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS trgm_idx_posts_body ON posts USING GIN (body gin_trgm_ops);


-- Indexes for 'profiles' table
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username); -- If username must be unique and is used for lookups

-- Indexes for 'votes' table
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes (user_id);
CREATE INDEX IF NOT EXISTS idx_votes_target_id_type ON votes (target_id, target_type); -- Composite index for efficient lookups
