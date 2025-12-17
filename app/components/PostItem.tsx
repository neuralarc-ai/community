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
}: PostItemProps) {
  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange(post.id, newScore, newUserVote);
  };

  return (
    <div className="flex bg-white border border-gray-200 rounded-xl mb-4 hover:border-gray-300 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md">
      {/* Vote Column - Hidden on mobile */}
      <div className="hidden sm:flex bg-gray-50/50 w-12 border-r border-gray-100 flex-col items-center pt-3 gap-1">
        <VoteColumn
          targetType="post"
          targetId={post.id}
          initialScore={post.vote_score || 0}
          userVote={userVote}
          onVoteChange={handleVoteChange}
          orientation="vertical"
        />
      </div>

      <div className="flex-1 min-w-0 p-3 sm:p-4">
        {/* Header Metadata */}
        <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
             <div className="flex items-center gap-1 hover:bg-gray-100 p-1 -ml-1 rounded transition-colors">
                <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={20} />
                <span className="font-bold text-gray-900 hover:underline">u/{post.author?.username || 'Anonymous'}</span>
             </div>
             <span>•</span>
             <span>{formatTime(post.created_at)}</span>
             {post.tags && post.tags.length > 0 && (
                <>
                  <span>•</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {post.tags[0]}
                  </span>
                </>
             )}
        </div>

        {/* Content Link */}
        <Link href={`/posts/${post.id}`} className="block group">
            <h2 className="text-lg font-heading font-bold text-gray-900 mb-2 leading-snug group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            {post.body && (
              <div className="text-sm text-gray-600 line-clamp-3 mb-3 font-sans leading-relaxed">
                {post.body}
              </div>
            )}
        </Link>

        {/* Mobile Vote & Actions */}
        <div className="flex items-center justify-between mt-2">
            <div className="sm:hidden">
                <VoteColumn
                  targetType="post"
                  targetId={post.id}
                  initialScore={post.vote_score || 0}
                  userVote={userVote}
                  onVoteChange={handleVoteChange}
                  orientation="horizontal"
                />
            </div>

            <div className="flex items-center text-gray-500 font-bold text-xs">
                <PostActions
                  commentCount={commentCount}
                  onToggleComments={onToggleComments}
                  isExpanded={isExpanded}
                  postId={post.id}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
