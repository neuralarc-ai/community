-- Add vote_score to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0;

-- Function to update post vote score
CREATE OR REPLACE FUNCTION update_post_vote_score()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.target_type = 'post') THEN
        UPDATE posts SET vote_score = vote_score + NEW.value WHERE id = NEW.target_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.target_type = 'post') THEN
        UPDATE posts SET vote_score = vote_score - OLD.value WHERE id = OLD.target_id;
    ELSIF (TG_OP = 'UPDATE' AND NEW.target_type = 'post') THEN
        UPDATE posts SET vote_score = vote_score - OLD.value + NEW.value WHERE id = NEW.target_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the votes table to update post score
DROP TRIGGER IF EXISTS tr_update_post_vote_score ON votes;
CREATE TRIGGER tr_update_post_vote_score
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_post_vote_score();

-- Initial sync: Update existing scores
UPDATE posts p
SET vote_score = (
    SELECT COALESCE(SUM(value), 0)
    FROM votes v
    WHERE v.target_id = p.id AND v.target_type = 'post'
);

