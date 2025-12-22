ALTER TABLE posts
ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;

-- Optional: Add an index for faster lookups of pinned posts
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned DESC, created_at DESC);
