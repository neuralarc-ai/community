'use client'

import VoteColumn from './VoteColumn'
import PostHeader from './PostHeader'
import PostActions from './PostActions'
import Link from 'next/link'
import { Post } from '@/app/types'

interface PostCardProps {
  post: Post
  userVote?: -1 | 0 | 1
  onVoteChange?: (postId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  isExpanded?: boolean
  onToggleComments?: () => void
  commentCount?: number // Override for when we want to show loaded comment count
}

export default function PostCard({ post, userVote = 0, onVoteChange, isExpanded = false, onToggleComments, commentCount = 0 }: PostCardProps) {
  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange?.(post.id, newScore, newUserVote)
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

  return (
    <Link href={`/posts/${post.id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-0">
      <div className="flex space-x-0">
        <VoteColumn
          targetType="post"
          targetId={post.id}
          initialScore={post.vote_score || 0}
          userVote={userVote}
          onVoteChange={handleVoteChange}
        />

        {/* Content section */}
        <div className="flex-1 min-w-0 p-4">
          <PostHeader post={post} formatTime={formatTime} />

          <PostActions commentCount={commentCount !== undefined ? commentCount : (post.comment_count || 0)} onToggleComments={onToggleComments} isExpanded={isExpanded} />
        </div>
      </div>
    </Link>
  )
}
