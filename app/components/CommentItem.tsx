'use client'

import { useState } from 'react'
import CommentThreadLine from './CommentThreadLine'
import CommentActions from './CommentActions'
import ReplyInput from './ReplyInput'
import VoteColumn from './VoteColumn' // Import VoteColumn
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
    <div className="relative flex">
      <CommentThreadLine depth={depth} />

      <div className={`${depth > 0 ? 'ml-4 sm:ml-6' : ''} group flex flex-grow`}>
        <div className="flex flex-col items-center pr-2">
          <VoteColumn
            targetType="comment"
            targetId={comment.id}
            initialScore={comment.vote_score || 0}
            userVote={userVote}
            onVoteChange={handleVoteChange}
            orientation="vertical"
          />
        </div>

        <div className="flex-1 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 p-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-900">
              {comment.author?.username || 'Anonymous'}
            </span>
            <span>•</span>
            <span>{formatTime(comment.created_at)}</span>
          </div>

          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-2">
            {comment.body}
          </div>

          <CommentActions
            commentId={comment.id}
            initialScore={comment.vote_score || 0}
            userVote={userVote}
            onVoteChange={onVoteChange}
            onReplyClick={handleReplyClick}
            onShareClick={() => { /* TODO: implement share */ }}
            onMoreClick={() => { /* TODO: implement more options */ }}
            orientation="horizontal"
          />

          <ReplyInput
            postId={comment.post_id}
            parentCommentId={comment.id}
            onReplyAdded={handleReplyAdded}
            onCancel={handleReplyCancel}
            depth={depth}
            isVisible={isReplyInputVisible}
          />
        </div>
      </div>
    </div>
  )
}
