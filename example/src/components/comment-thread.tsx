import type { Comment as CommentType } from "@/lib/types";
import { Comment } from "./comment";

interface CommentThreadProps {
  comments: CommentType[];
  postId: string;
}

export function CommentThread({ comments, postId }: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}
