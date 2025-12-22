-- Add is_archived column to workshops table
ALTER TABLE workshops
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Create an index for faster lookups on is_archived column
CREATE INDEX idx_workshops_is_archived ON workshops(is_archived);

