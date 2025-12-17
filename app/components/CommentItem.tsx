import { memo } from 'react'
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
    <div className="flex gap-3 relative">
      {/* Thread Line - strictly following example structure */}
      {hasChildren && (
        <div 
          className="w-px absolute left-4 top-10 h-[calc(100%-2.5rem)] bg-border hover:bg-primary transition-colors cursor-pointer" 
          aria-hidden="true"
        />
      )}

      {/* Avatar Column */}
      <div className="flex flex-col items-center z-10 w-8 flex-shrink-0">
         <div className="w-8 h-8">
            <Avatar src={comment.author?.avatar_url || null} alt={`${comment.author?.username || 'Anonymous'}'s avatar`} size={32} />
         </div>
      </div>

      {/* Content Column */}
      <div className="flex-grow min-w-0">
        {/* Header */}
        <div className="flex items-center text-sm mb-1">
          <span className="font-semibold text-foreground mr-2">
            u/{comment.author?.username || 'Anonymous'}
          </span>
          <span className="text-muted-foreground">{formatTime(comment.created_at)}</span>
        </div>

        {/* Body */}
        <div className="text-base mb-2 text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-2 mb-2">
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
             className="flex items-center gap-2 px-2 py-1 h-8 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
           >
              <MessageSquare className="w-4 h-4" />
              <span>Reply</span>
           </button>
        </div>

        {/* Reply Input */}
        {isReplyInputVisible && (
          <div className="mt-4 mb-4">
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
          <div className="mt-4 space-y-6">
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
