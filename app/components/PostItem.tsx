import Link from 'next/link';
import { Post } from '@/app/types';
import VoteColumn from './VoteColumn';
import PostActions from './PostActions';
import Avatar from './Avatar';

interface PostItemProps {
  post: Post;
  userVote: -1 | 0 | 1;
  onVoteChange: (postId: string, newScore: number, newUserVote: -1 | 0 | 1) => void;
  commentCount: number;
  isExpanded: boolean;
  onToggleComments: () => void;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (postId: string) => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

export default function PostItem({
  post,
  userVote,
  onVoteChange,
  commentCount,
  isExpanded,
  onToggleComments,
  currentUserId,
  onDelete,
  isSaved = false,
  onToggleSave
}: PostItemProps) {
  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange(post.id, newScore, newUserVote);
  };

  return (
    <div className="flex bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl mb-6 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.05)] hover:bg-white/[0.02] overflow-hidden group">
      <div className="flex-1 min-w-0 p-5 sm:p-6">
        {/* Header Metadata */}
        <div className="flex items-center text-xs text-muted-foreground mb-3 gap-3">
             <div className="flex items-center gap-2 hover:bg-yellow-500/5 p-1.5 -ml-1.5 rounded-lg transition-colors cursor-pointer group/user">
                <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={32} />
                <span className="font-medium text-white group-hover/user:text-yellow-200 underline-offset-4 group-hover/user:underline">u/{post.author?.username || 'Anonymous'}</span>
             </div>
             <span className="text-white/20">•</span>
             <span>{formatTime(post.created_at)}</span>
             {post.tags && post.tags.length > 0 && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="bg-white/5 text-muted-foreground px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/5 hover:border-yellow-500/30 hover:text-yellow-200 hover:bg-yellow-500/5 transition-all">
                    {post.tags[0]}
                  </span>
                </>
             )}
        </div>

        {/* Content Link */}
        <Link href={`/posts/${post.id}`} className="block group/title">
            <h2 className="text-xl font-heading font-semibold text-white mb-3 leading-snug group-hover/title:text-yellow-50 transition-colors">
              {post.title}
            </h2>
            {post.body && (
              <div className="text-sm text-muted-foreground line-clamp-3 mb-4 font-sans leading-relaxed group-hover/title:text-white/80 transition-colors">
                {post.body}
              </div>
            )}
        </Link>

        {/* Mobile Vote & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
            {/* Removed mobile VoteColumn, now handled in PostActions */}
            <div className="flex items-center text-muted-foreground font-medium text-xs">
                <PostActions
                  commentCount={commentCount}
                  onToggleComments={onToggleComments}
                  isExpanded={isExpanded}
                  postId={post.id}
                  authorId={post.author_id}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                  isSaved={isSaved}
                  onToggleSave={onToggleSave}
                  initialVoteScore={post.vote_score || 0}
                  userVote={userVote}
                  onVoteChange={handleVoteChange}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
