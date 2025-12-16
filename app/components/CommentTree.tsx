'use client'

import { useState } from 'react'
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
  const [sortOrder, setSortOrder] = useState('best')
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  const handleReplyAdded = (parentId: string, newComment: Comment) => {
    onReplyAdded?.(parentId, newComment)
  }

  const handleReplyToggle = (commentId: string | null) => {
    setActiveReplyId(commentId)
  }

  return (
    <div className="space-y-4">
      {/* Top-level comment form */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <CommentForm
          postId={postId}
          onCommentAdded={onCommentAdded}
          placeholder="What are your thoughts?"
        />
      </div>

      {/* Sort dropdown */}
      <div className="flex justify-end mb-4">
        <select
          className="text-sm text-gray-600 bg-white border border-gray-300 rounded-md py-1 px-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="best">Sort by: Best</option>
          <option value="new">Sort by: New</option>
        </select>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userVote={userVotes[comment.id] || 0}
              userVotes={userVotes}
              onVoteChange={onVoteChange}
              onReplyAdded={onReplyAdded}
              depth={0}
              activeReplyId={activeReplyId}
              onReplyToggle={handleReplyToggle}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 shadow-sm text-center text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
