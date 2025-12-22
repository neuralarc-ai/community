import Link from 'next/link';
import { Post } from '@/app/types';
import PostActions from './PostActions';
import Avatar from './Avatar';
import MagicBento from './MagicBento';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import React from 'react';

interface PostItemProps {
  post: Post;
  userVote: -1 | 0 | 1;
  onVoteChange: (postId: string, newScore: number, newUserVote: -1 | 0 | 1) => void;
  commentCount: number;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (postId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (postId: string) => void;
  onTogglePin?: (postId: string, isPinned: boolean) => void;
  typeTag?: string;
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

  interface PostCardBaseProps {
  children: React.ReactNode;
  post: Post;
}

const PostCardBase = ({ children, post }: PostCardBaseProps) => (
    <div className={`flex bg-card/40 backdrop-blur-sm border rounded-2xl transition-all duration-300 overflow-hidden group min-h-[220px]
      ${post.author?.role === 'admin'
        ? 'bg-gradient-to-br from-admin-yellow/40 via-admin-yellow/20 to-transparent border-admin-yellow/30 shadow-[0_0_25px_rgba(231,179,27,0.15)]'
        : 'border-white/5 hover:border-admin-yellow/30 hover:shadow-[0_0_30px_rgba(231,179,27,0.05)] hover:bg-white/[0.02]'
      }
    `}>
      {children}
    </div>
);

export default function PostItem({
  post,
  userVote,
  onVoteChange,
  commentCount,
  currentUserId,
  isAdmin,
  onDelete,
  isSaved = false,
  onToggleSave,
  onTogglePin,
  typeTag
}: PostItemProps) {
  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange(post.id, newScore, newUserVote);
  };

  const postInnerContent = (
    <div className="flex-1 min-w-0 p-5 sm:p-6">
      {/* Header Metadata */}
      <div className="flex items-center text-xs text-muted-foreground mb-3 gap-3">
           {typeTag && (
              <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                  {typeTag}
              </span>
           )}
           
           <div className="flex items-center gap-2 hover:bg-admin-yellow/5 p-1.5 -ml-1.5 rounded-lg transition-colors cursor-pointer group/user">
              <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={32} />
              <span className="font-medium text-white group-hover/user:text-admin-yellow/80 underline-offset-4 group-hover/user:underline">u/{post.author?.username || 'Anonymous'}</span>
              {post.author?.role === 'admin' && (
                <span className="ml-2 px-2 py-0.5 bg-admin-yellow/20 text-admin-yellow rounded-full text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/30">
                  Admin
                </span>
              )}
           </div>
           <span className="text-white/20">•</span>
           <span>{formatTime(post.created_at)}</span>
           {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-white/20">•</span>
                <span className="bg-white/5 text-muted-foreground px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/5 hover:border-admin-yellow/30 hover:text-admin-yellow hover:bg-admin-yellow/5 transition-all">
                  {post.tags[0]}
                </span>

              </>
              
           )}
           {post.is_pinned && (
              <span className="bg-admin-yellow/10 text-admin-yellow/80 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/20">
                  Pinned Post
              </span>
           )}
          </div>
        <Link href={`/posts/${post.id}`} className="block group/title">
            <h2 className="text-xl font-heading font-semibold text-white mb-3 leading-snug group-hover/title:text-admin-yellow/80 transition-colors">
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
                  postId={post.id}
                  authorId={post.author_id}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                  isSaved={isSaved}
                  onToggleSave={onToggleSave}
                  initialVoteScore={post.vote_score}
                  userVote={userVote}
                  onVoteChange={handleVoteChange}
                  isPinned={post.is_pinned}
                  onTogglePin={onTogglePin}
                />
            </div>
          </div>
    </div>
  );

  return (
    <article className="mb-6 w-full">
      <PostCardBase post={post}>{postInnerContent}</PostCardBase>
    </article>
  );
}
