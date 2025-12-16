'use client'

import Link from 'next/link'
import VoteButton from './VoteButton'
import { Post } from '@/app/types'

interface PostCardProps {
  post: Post
  userVote?: -1 | 0 | 1
  onVoteChange?: (postId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  isExpanded?: boolean
  onToggleComments?: () => void
  commentCount?: number
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex space-x-4">
        {/* Vote section */}
        <div className="flex-shrink-0">
          <VoteButton
            targetType="post"
            targetId={post.id}
            initialScore={post.vote_score || 0}
            userVote={userVote}
            onVoteChange={handleVoteChange}
          />
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Posted by {post.author?.username || 'Anonymous'}</span>
            <span>•</span>
            <span>{formatTime(post.created_at)}</span>
          </div>

          <Link href={`/posts/${post.id}`} className="block">
            <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
              {post.title}
            </h2>
          </Link>

          <p className="text-gray-700 mb-3 line-clamp-3">
            {post.body}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={onToggleComments}
              className="hover:text-blue-600 flex items-center space-x-1 transition-colors"
            >
              <span>💬</span>
              <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
              <span className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
