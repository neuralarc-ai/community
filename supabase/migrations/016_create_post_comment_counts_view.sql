
CREATE OR REPLACE VIEW post_comment_counts AS
SELECT
  post_id,
  COUNT(id) AS comment_count
FROM
  comments
GROUP BY
  post_id;

