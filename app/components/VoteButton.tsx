'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabaseClient'

interface VoteButtonProps {
  targetType: 'post' | 'comment'
  targetId: string
  initialScore: number
  userVote: -1 | 0 | 1
  onVoteChange?: (newScore: number, newUserVote: -1 | 0 | 1) => void
}

export default function VoteButton({
  targetType,
  targetId,
  initialScore,
  userVote,
  onVoteChange
}: VoteButtonProps) {
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
          target_type: targetType,
          target_id: targetId,
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
      onVoteChange?.(newScore, newVote)
    } catch (error) {
      console.error('Vote error:', error)
      // Could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 ${
          currentVote === 1 ? 'text-orange-500' : 'text-gray-400'
        }`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className={`text-sm font-medium ${
        score > 0 ? 'text-green-600' :
        score < 0 ? 'text-red-600' :
        'text-gray-500'
      }`}>
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 ${
          currentVote === -1 ? 'text-blue-500' : 'text-gray-400'
        }`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  )
}
