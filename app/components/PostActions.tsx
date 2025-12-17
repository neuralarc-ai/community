import Link from 'next/link';
import { MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PostActionsProps {
  commentCount: number;
  onToggleComments?: () => void;
  isExpanded?: boolean;
  postId: string;
  authorId: string;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export default function PostActions({ 
  commentCount, 
  onToggleComments, 
  isExpanded, 
  postId,
  authorId,
  currentUserId,
  onDelete
}: PostActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this post?')) {
      onDelete?.(postId);
    }
    setShowMenu(false);
  };

  const CommentsButton = () => (
    <button
      className="flex items-center space-x-2 hover:bg-white/5 text-muted-foreground hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 group"
      onClick={(e) => {
        if (onToggleComments) {
          e.preventDefault();
          onToggleComments();
        }
      }}
    >
      <MessageSquare size={16} className="group-hover:text-white transition-colors" />
      <span>{commentCount} Comments</span>
    </button>
  );

  return (
    <div className="flex items-center space-x-2 text-xs font-medium relative">
      {onToggleComments ? (
        <CommentsButton />
      ) : (
        <Link href={`/posts/${postId}#comments`} passHref className="no-underline">
           <div className="flex items-center space-x-2 hover:bg-white/5 text-muted-foreground hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 group">
             <MessageSquare size={16} className="group-hover:text-white transition-colors" />
             <span>{commentCount} Comments</span>
           </div>
        </Link>
      )}

      <button className="flex items-center space-x-2 hover:bg-white/5 text-muted-foreground hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 group">
        <Share2 size={16} className="group-hover:text-white transition-colors" />
        <span>Share</span>
      </button>

      <div className="relative" ref={menuRef}>
        <button 
          className="flex items-center space-x-2 hover:bg-white/5 text-muted-foreground hover:text-white px-2 py-1.5 rounded-full transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-32 bg-[#1A1A1A] rounded-lg shadow-xl shadow-black/50 border border-white/10 py-1 z-10 backdrop-blur-md">
            {currentUserId === authorId && onDelete ? (
              <button
                onClick={handleDeleteClick}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-xs font-medium transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            ) : null}
            {!currentUserId || currentUserId !== authorId ? (
                <div className="px-4 py-2 text-muted-foreground text-xs text-center">
                    No actions
                </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
