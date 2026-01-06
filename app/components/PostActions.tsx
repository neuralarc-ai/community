import {
  MessageSquare,
  Share2,
  MoreHorizontal,
  Trash2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/app/components/ui/use-toast"; // Added import for useToast
import Link from "next/link";

import { useVote } from "@/app/hooks/useVote";

interface PostActionsProps {
  commentCount: number;
  postId: string;
  authorId: string;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onDelete?: (postId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (postId: string) => void;
  initialVote: -1 | 0 | 1;
  initialScore: number;
  isPinned?: boolean;
  onTogglePin?: (postId: string, isPinned: boolean) => void;
  onNotifyUsers?: () => Promise<void>; // New prop for notifying users
  onVoteSuccess?: (newScore: number, newVote: -1 | 0 | 1) => void; // New prop for refreshing post data after a successful vote
}

export default function PostActions({
  commentCount,
  postId,
  authorId,
  currentUserId,
  isAdmin,
  onDelete,
  isSaved = false,
  onToggleSave,
  initialVote,
  initialScore,
  isPinned,
  onTogglePin,
  onNotifyUsers, // Destructure new prop
}: PostActionsProps) {
  const { currentVote, currentScore, handleVote, isLoading, error } = useVote({
    initialVote,
    initialScore,
    postId,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast(); // Initialize toast hook

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this post?")) {
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
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex items-center space-x-2 text-xs font-medium relative">
      <div className="flex items-center space-x-1 bg-foreground/5 rounded-full px-2 py-1 transition-all duration-200 group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVote("up");
          }}
          className={`p-1 rounded-full transition-colors ${
            currentVote === 1
              ? "text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30"
              : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
          }`}
        >
          <ChevronUp size={16} />
        </button>
        <span className="text-foreground font-semibold min-w-[20px] text-center">
          {currentScore}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVote("down");
          }}
          className={`p-1 rounded-full transition-colors ${
            currentVote === -1
              ? "text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30"
              : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
          }`}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <Link
        href={`/posts/${postId}#comments`}
        passHref
        className="no-underline"
      >
        <div className="flex items-center space-x-1 hover:bg-foreground/5 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-all duration-200 group">
          <MessageSquare
            size={16}
            className="group-hover:text-foreground transition-colors"
          />
          <span>{commentCount}</span>
        </div>
      </Link>

      <button
        className="flex items-center space-x-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-all duration-200 group"
        onClick={handleShareClick}
      >
        <Share2
          size={16}
          className="group-hover:text-foreground transition-colors"
        />
        <span>Share</span>
      </button>

      {showCopiedMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-[#1A1A1A]/90 backdrop-blur-xl text-foreground text-sm font-semibold rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-foreground/10 animate-in fade-in slide-in-from-top-10 duration-500 flex items-center gap-3">
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
            ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        }`}
      >
        <Bookmark
          size={16}
          className={`transition-colors ${isSaved ? "fill-current" : "group-hover:text-foreground"}`}
        />
        <span>{isSaved ? "Saved" : "Save"}</span>
      </button>

      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center space-x-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-full transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-32 bg-[#1A1A1A] rounded-lg shadow-xl shadow-black/50 border border-foreground/10 py-1 z-10 backdrop-blur-md">
            {(currentUserId === authorId || isAdmin) && onDelete ? (
              <button
                onClick={handleDeleteClick}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-xs font-medium transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            ) : null}
            {isAdmin && onTogglePin ? (
              <button
                onClick={() => onTogglePin(postId, !isPinned)}
                className="w-full text-left px-4 py-2 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 text-xs font-medium transition-colors"
              >
                {isPinned ? <Bookmark size={14} /> : <Bookmark size={14} />}
                <span>{isPinned ? "Unpin Post" : "Pin Post"}</span>
              </button>
            ) : null}
            {isAdmin && onNotifyUsers ? (
              <button
                onClick={() => {
                  onNotifyUsers();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-green-400 hover:bg-green-500/10 flex items-center gap-2 text-xs font-medium transition-colors"
              >
                <Bell size={14} />
                <span>Notify Users</span>
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
