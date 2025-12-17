'use client'

import { useState } from 'react'
import { Comment } from '@/app/types'
import CommentForm from './CommentForm'

interface ReplyInputProps {
  postId: string
  parentCommentId: string
  onReplyAdded: (newComment: Comment) => void
  onCancel: () => void
  placeholder?: string
  depth: number
  isVisible: boolean
}

export default function ReplyInput({
  postId,
  parentCommentId,
  onReplyAdded,
  onCancel,
  placeholder = "Write a reply...",
  depth,
  isVisible
}: ReplyInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleReplyAdded = (newComment: Comment) => {
    onReplyAdded(newComment)
    setIsExpanded(false)
  }

  const handleCancel = () => {
    setIsExpanded(false)
    onCancel()
  }

  // Calculate responsive indentation for reply input
  const indentClass = depth > 0 ? `ml-4 sm:ml-6` : 'ml-4 sm:ml-6'

  return (
    <div
      className={`
        ${indentClass}
        transition-all duration-300 ease-in-out transform
        ${isVisible
          ? 'max-h-96 opacity-100 scale-100 mt-3 mb-4'
          : 'max-h-0 opacity-0 scale-95 overflow-hidden'
        }
      `}
    >
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-2 border-gray-300 shadow-sm">
        <CommentForm
          postId={postId}
          parentCommentId={parentCommentId}
          onCommentAdded={handleReplyAdded}
          onCancel={handleCancel}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
