"use client";

import { useState, useMemo, memo } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Comment } from "@/app/types";

interface CommentTreeProps {
  postId: string;
  comments: Comment[];
  userVotes?: Record<string, -1 | 0 | 1>;
  onVoteChange?: (
    commentId: string,
    newScore: number,
    newUserVote: -1 | 0 | 1
  ) => void;
  onCommentAdded?: (comment: Comment) => void;
  onReplyAdded?: (parentId: string, newComment: Comment) => void;
  onReplyToggle?: (commentId: string | null) => void;
  activeReplyId: string | null;
  depth?: number;
}

const CommentTree = memo(function CommentTree({
  postId,
  comments,
  userVotes = {},
  onVoteChange,
  onCommentAdded,
  onReplyAdded,
  activeReplyId = null,
  onReplyToggle,
  depth = 0,
}: CommentTreeProps) {
  const displayComments = useMemo(() => {
    return comments.map((comment) => ({
      ...comment,
      children: (comment as any).children || comment.replies || [],
    }));
  }, [comments]);

  return (
    <div className="space-y-0">
      {/* Top-level Comment Form */}
      {depth === 0 && (
        <div className="mb-6">
          <CommentForm
            postId={postId}
            onCommentAdded={onCommentAdded}
            placeholder="What are your thoughts?"
          />
        </div>
      )}

      {/* Comments list */}
      {displayComments.length > 0 ? (
        <div className="space-y-0">
          {displayComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userVote={userVotes[comment.id] || 0}
              onVoteChange={onVoteChange}
              onReplyAdded={onReplyAdded}
              depth={depth}
              activeReplyId={activeReplyId}
              onReplyToggle={onReplyToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
});

export default CommentTree;
