import Link from 'next/link';
import { Post } from '@/app/types';
import VoteColumn from './VoteColumn'; // Will be refactored or created
import PostAuthorRow from './PostAuthorRow'; // Will be created
import PostActions from './PostActions'; // Will be refactored or created

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
    <div className="group relative flex rounded-md bg-white shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out">
      <VoteColumn
        targetType="post"
        targetId={post.id}
        initialScore={post.vote_score || 0}
        userVote={userVote}
        onVoteChange={handleVoteChange}
        orientation="vertical"
      />

      <div className="flex-1 min-w-0">
        <div className="p-3">
          <PostAuthorRow
            author={post.author?.username || 'Anonymous'}
            avatarUrl={post.author?.avatar_url || ''}
            postedTime={formatTime(post.created_at)}
          />
          <Link href={`/posts/${post.id}`} className="block mt-2">
            <h2 className="text-base font-semibold text-gray-900 line-clamp-2">
              {post.title}
            </h2>
            {post.body && (
              <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                {post.body}
              </p>
            )}
          </Link>
        </div>

        <div className="relative z-10 flex items-center p-2 border-t border-gray-200 bg-gray-50">
          <PostActions
            commentCount={commentCount}
            onToggleComments={onToggleComments}
            isExpanded={isExpanded}
            postId={post.id}
          />
        </div>
      </div>
    </div>
  );
}

