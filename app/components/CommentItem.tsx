'use client'

import { useState } from 'react'
import CommentThreadLine from './CommentThreadLine'
import CommentActions from './CommentActions'
import ReplyInput from './ReplyInput'
import { Comment } from '@/app/types'

interface CommentItemProps {
  comment: Comment
  userVote?: -1 | 0 | 1
  userVotes?: Record<string, -1 | 0 | 1>
  onVoteChange?: (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  onReplyAdded?: (parentId: string, newComment: Comment) => void
  depth?: number
  activeReplyId?: string | null
  onReplyToggle?: (commentId: string | null) => void
}

export default function CommentItem({
  comment,
  userVote = 0,
  userVotes = {},
  onVoteChange,
  onReplyAdded,
  depth = 0,
  activeReplyId,
  onReplyToggle
}: CommentItemProps) {
  const maxDepth = 5 // Prevent infinite nesting visually

  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange?.(comment.id, newScore, newUserVote)
  }

  const handleReplyAdded = (newComment: Comment) => {
    onReplyAdded?.(comment.id, newComment)
    onReplyToggle?.(null) // Close reply input
  }

  const handleReplyClick = () => {
    onReplyToggle?.(activeReplyId === comment.id ? null : comment.id)
  }

  const handleReplyCancel = () => {
    onReplyToggle?.(null)
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

  const isReplyInputVisible = activeReplyId === comment.id

  return (
    <div className="relative">
      {/* Thread line for nested comments */}
      <CommentThreadLine depth={depth} />

      {/* Comment content */}
      <div className={`${depth > 0 ? 'ml-4 sm:ml-6' : ''} group`}>
        <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Comment header */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 p-3 pb-2">
            <span className="font-medium text-gray-900">
              {comment.author?.username || 'Anonymous'}
            </span>
            <span>•</span>
            <span>{formatTime(comment.created_at)}</span>
          </div>

          {/* Comment body */}
          <div className="px-3 pb-2">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {comment.body}
            </div>
          </div>

          {/* Comment actions */}
          <div className="px-3 pb-3">
            <CommentActions
              commentId={comment.id}
              initialScore={comment.vote_score || 0}
              userVote={userVote}
              onVoteChange={onVoteChange}
              onReplyClick={handleReplyClick}
              onShareClick={() => {/* TODO: implement share */}}
              onMoreClick={() => {/* TODO: implement more options */}}
            />
          </div>
        </div>

        {/* Reply input */}
        <ReplyInput
          postId={comment.post_id}
          parentCommentId={comment.id}
          onReplyAdded={handleReplyAdded}
          onCancel={handleReplyCancel}
          depth={depth}
          isVisible={isReplyInputVisible}
        />

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply, index) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                userVote={userVotes[reply.id] || 0}
                userVotes={userVotes}
                onVoteChange={onVoteChange}
                onReplyAdded={onReplyAdded}
                depth={depth + 1}
                activeReplyId={activeReplyId}
                onReplyToggle={onReplyToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
