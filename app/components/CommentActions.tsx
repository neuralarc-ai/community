'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabaseClient'

interface CommentActionsProps {
  commentId: string
  initialScore: number
  userVote: -1 | 0 | 1
  onVoteChange?: (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  onReplyClick?: () => void
  onShareClick?: () => void
  onMoreClick?: () => void
}

export default function CommentActions({
  commentId,
  initialScore,
  userVote,
  onVoteChange,
  onReplyClick,
  onShareClick,
  onMoreClick
}: CommentActionsProps) {
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState(userVote)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleVote = async (voteValue: 1 | -1) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: 'comment',
          target_id: commentId,
          value: voteValue
        })
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const result = await response.json()

      // Calculate new score and vote state based on the action
      let newScore = score
      let newVote: -1 | 0 | 1 = 0

      if (result.action === 'created') {
        newScore += voteValue
        newVote = voteValue
      } else if (result.action === 'removed') {
        newScore -= result.previous_value
        newVote = 0
      } else if (result.action === 'updated') {
        newScore = newScore - result.previous_value + voteValue
        newVote = voteValue
      }

      setScore(newScore)
      setCurrentVote(newVote)
      onVoteChange?.(commentId, newScore, newVote)
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    // Copy current URL to clipboard
    if (navigator.share) {
      navigator.share({
        title: 'Check out this comment',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Could add toast notification here
    }
    onShareClick?.()
  }

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
      {/* Vote buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleVote(1)}
          disabled={isLoading}
          className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors ${
            currentVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
          }`}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className={`font-medium text-xs ${
          score > 0 ? 'text-green-600' :
          score < 0 ? 'text-red-600' :
          'text-gray-500'
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          disabled={isLoading}
          className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors ${
            currentVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
          }`}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>

      {/* Reply button */}
      <button
        onClick={onReplyClick}
        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
      >
        <span>💬</span>
        <span>Reply</span>
      </button>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
      >
        <span>🔗</span>
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* More options */}
      <button
        onClick={onMoreClick}
        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
      >
        <span>⋯</span>
      </button>
    </div>
  )
}
