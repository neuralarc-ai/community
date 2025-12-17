'use client'

import { useState, useMemo, memo } from 'react'
import CommentItem from './CommentItem'
import { Comment } from '@/app/types'

interface CommentTreeProps {
  postId: string
  comments: Comment[]
  userVotes?: Record<string, -1 | 0 | 1>
  onVoteChange?: (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  onCommentAdded?: (comment: Comment) => void
  onReplyAdded?: (parentId: string, newComment: Comment) => void
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

  const buildCommentTree = useMemo(() => {
    const build = (commentList: Comment[], parentId: string | null = null, depth: number = 0): Comment[] => {
      return commentList
        .filter(comment => comment.parent_comment_id === parentId)
        .map(comment => ({
          ...comment,
          children: build(commentList, comment.id, depth + 1)
        }))
    }
    return build(comments, null, 0)
  }, [comments])

  return (
    <div className="space-y-3">
      {/* Comments list */}
      {buildCommentTree.length > 0 ? (
        <div className="">
          {buildCommentTree.map((comment) => (
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
  )
})

export default CommentTree
