import Link from 'next/link';
import { MessageSquare, Share2, MoreHorizontal, Trash2, Bookmark } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import VoteColumn from './VoteColumn';

interface PostActionsProps {
  commentCount: number;
  onToggleComments?: () => void;
  isExpanded?: boolean;
  postId: string;
  authorId: string;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onDelete?: (postId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (postId: string) => void;
  initialVoteScore: number;
  userVote: -1 | 0 | 1;
  onVoteChange: (newScore: number, newUserVote: -1 | 0 | 1) => void;
}

export default function PostActions({
  commentCount,
  onToggleComments,
  isExpanded,
  postId,
  authorId,
  currentUserId,
  isAdmin,
  onDelete,
  isSaved = false,
  onToggleSave,
  initialVoteScore,
  userVote,
  onVoteChange
}: PostActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false); // New state for copied message
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

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const postLink = `${window.location.origin}/posts/${postId}`;
    try {
      await navigator.clipboard.writeText(postLink);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000); // Hide after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
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
      <VoteColumn
        targetType="post"
        targetId={postId}
        initialScore={initialVoteScore}
        userVote={userVote}
        onVoteChange={onVoteChange}
        orientation="horizontal"
      />
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

      <button 
        className="flex items-center space-x-2 hover:bg-white/5 text-muted-foreground hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 group"
        onClick={handleShareClick}
      >
        <Share2 size={16} className="group-hover:text-white transition-colors" />
        <span>Share</span>
      </button>

      {showCopiedMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-[#1A1A1A]/90 backdrop-blur-xl text-white text-sm font-semibold rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in fade-in slide-in-from-top-10 duration-500 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.(postId);
        }}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 group ${
          isSaved 
            ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
        }`}
      >
        <Bookmark size={16} className={`transition-colors ${isSaved ? 'fill-current' : 'group-hover:text-white'}`} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
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
            {(currentUserId === authorId || isAdmin) && onDelete ? (
              <button
                onClick={handleDeleteClick}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-xs font-medium transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            ) : null}
            {!currentUserId || (currentUserId !== authorId && !isAdmin) ? (
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
