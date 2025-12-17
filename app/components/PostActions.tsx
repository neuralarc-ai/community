import Link from 'next/link';
import { MessageSquare, Share2, MoreHorizontal } from 'lucide-react';

interface PostActionsProps {
  commentCount: number;
  onToggleComments?: () => void;
  isExpanded?: boolean;
  postId: string;
}

export default function PostActions({ commentCount, onToggleComments, isExpanded, postId }: PostActionsProps) {
  const CommentsButton = () => (
    <button
      className="flex items-center space-x-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors duration-200"
      onClick={(e) => {
        if (onToggleComments) {
          e.preventDefault();
          onToggleComments();
        }
      }}
    >
      <MessageSquare size={16} />
      <span>{commentCount} Comments</span>
    </button>
  );

  return (
    <div className="flex items-center space-x-1 text-xs font-bold">
      {onToggleComments ? (
        <CommentsButton />
      ) : (
        <Link href={`/posts/${postId}#comments`} passHref className="no-underline">
           {/* Wrapping button in Link can be tricky if not careful with hydration, but standard Next.js usage allows elements */}
           <div className="flex items-center space-x-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors duration-200">
             <MessageSquare size={16} />
             <span>{commentCount} Comments</span>
           </div>
        </Link>
      )}

      <button className="flex items-center space-x-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors duration-200">
        <Share2 size={16} />
        <span>Share</span>
      </button>

      <button className="flex items-center space-x-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 px-2 py-1.5 rounded-full transition-colors duration-200">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}
