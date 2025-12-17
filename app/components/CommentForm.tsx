'use client'

import { useState } from 'react'
import type { Comment } from '@/app/types'

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  onCommentAdded?: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
}

export default function CommentForm({
  postId,
  parentCommentId,
  onCommentAdded,
  onCancel,
  placeholder = "Write a comment..."
}: CommentFormProps) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          body: body.trim(),
          parent_comment_id: parentCommentId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create comment')
      }

      const newComment = await response.json()
      setBody('')
      onCommentAdded?.(newComment)
    } catch (error) {
      // Could add toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!body.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
