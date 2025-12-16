interface PostActionsProps {
  commentCount: number;
  onToggleComments?: () => void;
  isExpanded?: boolean;
}

export default function PostActions({ commentCount, onToggleComments, isExpanded }: PostActionsProps) {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
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

      {/* Placeholder for Share button */}
      <button className="hover:text-blue-600 flex items-center space-x-1 transition-colors">
        <span>🔗</span>
        <span>Share</span>
      </button>

      {/* Placeholder for More (ellipsis) button */}
      <button className="hover:text-blue-600 flex items-center space-x-1 transition-colors">
        <span>•••</span>
        <span>More</span>
      </button>
    </div>
  );
}

