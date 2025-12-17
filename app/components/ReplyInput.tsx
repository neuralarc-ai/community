'use client'

import CommentForm from './CommentForm'
import type { Comment } from '@/app/types'

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

  const handleReplyAdded = (newComment: Comment) => {
    onReplyAdded(newComment)
  }

  // Calculate responsive indentation for reply input
  // On mobile, stop increasing indent after depth 2
  const effectiveDepth = depth > 2 ? 2 : depth;
  const indentClass = `pl-${effectiveDepth * 4}`;

  return (
    <div
      className={`
        ${indentClass}
        ${isVisible ? 'block' : 'hidden'}
        mt-2 w-full
      `}
    >
      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
        <CommentForm
          postId={postId}
          parentCommentId={parentCommentId}
          onCommentAdded={handleReplyAdded}
          onCancel={onCancel}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
