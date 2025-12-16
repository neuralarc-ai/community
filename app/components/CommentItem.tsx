'use client'

import { useState } from 'react'
import VoteButton from './VoteButton'
import CommentForm from './CommentForm'
import { Comment } from '@/app/types'

interface CommentItemProps {
  comment: Comment
  userVote?: -1 | 0 | 1
  onVoteChange?: (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  onReplyAdded?: (parentId: string, newComment: Comment) => void
  depth?: number
}

export default function CommentItem({
  comment,
  userVote = 0,
  onVoteChange,
  onReplyAdded,
  depth = 0
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange?.(comment.id, newScore, newUserVote)
  }

  const handleReplyAdded = (newComment: Comment) => {
    onReplyAdded?.(comment.id, newComment)
    setShowReplyForm(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const maxDepth = 5 // Prevent infinite nesting visually

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="flex space-x-3 mb-2">
        {/* Vote section */}
        <div className="flex-shrink-0">
          <VoteButton
            targetType="comment"
            targetId={comment.id}
            initialScore={comment.vote_score || 0}
            userVote={userVote}
            onVoteChange={handleVoteChange}
          />
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span className="font-medium text-gray-900">
              {comment.author?.username || 'Anonymous'}
            </span>
            <span>•</span>
            <span>{formatTime(comment.created_at)}</span>
          </div>

          <div className="text-gray-800 mb-2 whitespace-pre-wrap">
            {comment.body}
          </div>

          {/* Action buttons */}
          {depth < maxDepth && (
            <div className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-500 hover:text-blue-600 flex items-center space-x-1"
              >
                <span>💬</span>
                <span>Reply</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-9 mt-3 mb-4">
          <CommentForm
            postId={comment.post_id}
            parentCommentId={comment.id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onVoteChange={onVoteChange}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
