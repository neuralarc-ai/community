CREATE TABLE post_votes (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_value INT NOT NULL CHECK (vote_value IN (1, -1)),
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE posts ADD COLUMN score INT DEFAULT 0;

CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts
        SET score = score + NEW.vote_value
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts
        SET score = score - OLD.vote_value
        WHERE id = OLD.post_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE posts
        SET score = score - OLD.vote_value + NEW.vote_value
        WHERE id = NEW.post_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_votes_score_trigger
AFTER INSERT OR DELETE OR UPDATE ON post_votes
FOR EACH ROW EXECUTE FUNCTION update_post_score();

