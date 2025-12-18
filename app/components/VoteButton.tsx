'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabaseClient'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface VoteButtonProps {
  targetType: 'post' | 'comment'
  targetId: string
  initialScore: number
  userVote: -1 | 0 | 1
  onVoteChange?: (newScore: number, newUserVote: -1 | 0 | 1) => void
  orientation?: 'vertical' | 'horizontal'
}

export default function VoteButton({
  targetType,
  targetId,
  initialScore,
  userVote,
  onVoteChange,
  orientation = 'vertical'
}: VoteButtonProps) {
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState(userVote)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setScore(initialScore)
  }, [initialScore])

  useEffect(() => {
    setCurrentVote(userVote)
  }, [userVote])

  const handleVoteClick = async (voteValue: 1 | -1) => {
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
      } finally {
        setIsLoading(false)
      }
  }

  const containerClasses = orientation === 'vertical'
    ? "flex flex-col items-center gap-1"
    : "flex items-center gap-2";

  const iconSize = orientation === 'vertical' ? 20 : 16;
  const textSize = orientation === 'vertical' ? "text-sm" : "text-xs";

  return (
    <div className={containerClasses}>
      <button
        onClick={() => handleVoteClick(1)}
        disabled={isLoading}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          currentVote === 1 
            ? 'text-white bg-white/10' 
            : 'text-muted-foreground hover:text-white hover:bg-white/5'
        }`}
        aria-label="Upvote"
      >
        <ArrowUp size={iconSize} strokeWidth={2.5} />
      </button>
      
      <span className={`${textSize} font-heading font-bold min-w-[1ch] text-center tabular-nums ${
        currentVote !== 0 ? 'text-white' : 'text-muted-foreground'
      }`}>
        {score}
      </span>

      <button
        onClick={() => handleVoteClick(-1)}
        disabled={isLoading}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          currentVote === -1 
            ? 'text-white bg-white/10' 
            : 'text-muted-foreground hover:text-white hover:bg-white/5'
        }`}
        aria-label="Downvote"
      >
        <ArrowDown size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  )
}
