'use client'

import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import { Comment } from '@/app/types'

interface CommentTreeProps {
  postId: string
  comments: Comment[]
  userVotes?: Record<string, -1 | 0 | 1>
  onVoteChange?: (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  onCommentAdded?: (comment: Comment) => void
  onReplyAdded?: (parentId: string, newComment: Comment) => void
}

export default function CommentTree({
  postId,
  comments,
  userVotes = {},
  onVoteChange,
  onCommentAdded,
  onReplyAdded
}: CommentTreeProps) {
  const handleReplyAdded = (parentId: string, newComment: Comment) => {
    onReplyAdded?.(parentId, newComment)
  }

  return (
    <div className="space-y-6">
      {/* Top-level comment form */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Comment</h3>
        <CommentForm
          postId={postId}
          onCommentAdded={onCommentAdded}
        />
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg p-6 shadow-sm">
              <CommentItem
                comment={comment}
                userVote={userVotes[comment.id] || 0}
                onVoteChange={onVoteChange}
                onReplyAdded={onReplyAdded}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
