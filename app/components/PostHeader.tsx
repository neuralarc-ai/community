import { Post } from '@/app/types';

interface PostHeaderProps {
  post: Post;
  formatTime: (dateString: string) => string;
}

export default function PostHeader({ post, formatTime }: PostHeaderProps) {
  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
        {post.title}
      </h2>

      <p className="text-gray-700 mb-3 line-clamp-3">
        {post.body}
      </p>

      {/* Metadata row */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Posted by {post.author?.username || 'Anonymous'}</span>
        <span>•</span>
        <span>{formatTime(post.created_at)}</span>
      </div>
    </div>
  );
}

