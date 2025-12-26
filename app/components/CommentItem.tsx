import { memo } from 'react'
import Link from 'next/link'
import Avatar from './Avatar';
import ReplyInput from './ReplyInput'
import VoteButton from './VoteButton'
import CommentTree from './CommentTree'
import type { Comment } from '@/app/types'
import { MessageSquare } from 'lucide-react'

interface CommentItemProps {
  comment: Comment & { children?: Comment[] }
  userVote?: -1 | 0 | 1
  onVoteChange?: (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => void
  onReplyAdded?: (parentId: string, newComment: Comment) => void
  depth?: number
  activeReplyId?: string | null
  onReplyToggle?: (commentId: string | null) => void
}

const CommentItem = memo(function CommentItem({
  comment,
  userVote = 0,
  onVoteChange,
  onReplyAdded,
  depth = 0,
  activeReplyId = null,
  onReplyToggle
}: CommentItemProps) {
  
  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange?.(comment.id, newScore, newUserVote)
  }

  const handleReplyAdded = (newComment: Comment) => {
    onReplyAdded?.(comment.id, newComment)
    onReplyToggle?.(null) // Close reply input
  }

  const handleReplyInputAdded = (newComment: Comment) => {
    handleReplyAdded(newComment)
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
  const hasChildren = comment.children && comment.children.length > 0;

  return (
    <div className="flex gap-4 relative group/comment">
      {/* Thread Line - Refined for NebulaMax */}
      {hasChildren && (
        <div 
          className="w-px absolute left-[19px] top-10 h-[calc(100%-2rem)] bg-white/10 group-hover/comment:bg-white/20 transition-colors duration-300" 
          aria-hidden="true"
        />
      )}

      {/* Avatar Column */}
      <div className="flex flex-col items-center z-10 flex-shrink-0">
         <div className="w-10 h-10 rounded-full p-0.5 bg-[#0A0A0A] ring-1 ring-white/10">
            <Link href={`/profile/${comment.author?.id}`}>
              <Avatar src={comment.author?.avatar_url || null} alt={`${comment.author?.username || 'Anonymous'}'s avatar`} size={36} className="rounded-full" />
            </Link>
         </div>
      </div>

      {/* Content Column */}
      <div className="flex-grow min-w-0 pt-1">
        {/* Header */}
        <div className="flex items-center text-sm mb-1.5 gap-2">
          <Link href={`/profile/${comment.author?.id}`} className="font-semibold text-white hover:underline cursor-pointer">
            u/{comment.author?.username || 'Anonymous'}
          </Link>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground text-xs">{formatTime(comment.created_at)}</span>
        </div>

        {/* Body */}
        <div className="text-sm mb-3 text-white/90 whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-3 mb-2">
           <VoteButton
              targetType="comment"
              targetId={comment.id}
              initialScore={comment.vote_score || 0}
              userVote={userVote}
              onVoteChange={handleVoteChange}
              orientation="horizontal"
           />
           
           <button 
             onClick={handleReplyClick}
             className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
           >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reply</span>
           </button>
        </div>

        {/* Reply Input */}
        {isReplyInputVisible && (
          <div className="mt-4 mb-4 pl-2">
            <ReplyInput
              postId={comment.post_id}
              parentCommentId={comment.id}
              onReplyAdded={handleReplyInputAdded}
              onCancel={handleReplyCancel}
              depth={depth}
              isVisible={isReplyInputVisible}
            />
          </div>
        )}

        {/* Nested Children */}
        {hasChildren && (
          <div className="mt-4 space-y-5">
            <CommentTree
              postId={comment.post_id}
              comments={comment.children || []}
              userVotes={{}}
              onVoteChange={onVoteChange}
              onReplyAdded={onReplyAdded}
              activeReplyId={activeReplyId}
              onReplyToggle={onReplyToggle}
              depth={depth + 1}
            />
          </div>
        )}
      </div>
    </div>
  )
})

export default CommentItem
