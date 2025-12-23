import Link from 'next/link';
import { Post } from '@/app/types'; // Assuming Post type will include image_urls
import PostActions from './PostActions';
import Avatar from './Avatar';
import MagicBento from './MagicBento';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import React, { useState } from 'react';
import Lightbox from './Lightbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/components/ui/use-toast';

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
  isProfilePage?: boolean;
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
  isProfilePage?: boolean;
}

const PostCardBase = ({ children, post, isProfilePage }: PostCardBaseProps) => (
    <div className={`flex bg-card/40 backdrop-blur-sm border rounded-2xl transition-all duration-300 overflow-hidden group
      ${isProfilePage
        ? 'border-[#A6C8D5]/20 hover:border-[#A6C8D5]/30 hover:shadow-[0_0_30px_rgba(166,200,213,0.1)]'
        : post.author?.role === 'admin'
          ? 'bg-admin-yellow/10 border-admin-yellow/40 shadow-md shadow-admin-yellow/10'
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
  typeTag,
  isProfilePage
}: PostItemProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageClick = (src: string) => {
    setCurrentImageSrc(src);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageSrc(null);
  };

  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange(post.id, newScore, newUserVote);
  };

  const handleNotifyPostUsers = async () => {
    try {
      const response = await fetch('/api/notify/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Post announcement emails sent successfully.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error!",
          description: errorData.message || "Failed to send post announcement emails.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to notify post users:', error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const renderImages = (imageUrls: string[]) => {
    const numImages = imageUrls.length;
    let gridClass = '';
    let imageClasses: string[] = [];

    switch (numImages) {
      case 1:
        gridClass = 'grid grid-cols-1';
        imageClasses = ['w-full max-h-[300px] h-[200px] object-cover rounded-xl'];
        break;
      case 2:
        gridClass = 'grid grid-cols-2 gap-2';
        imageClasses = ['w-full h-[150px] object-cover rounded-xl'];
        break;
      case 3:
        gridClass = 'grid grid-cols-3 gap-2';
        imageClasses = [
          'col-span-2 w-full h-[180px] object-cover rounded-xl', // Large image (60%)
          'col-span-1 w-full h-[90px] object-cover rounded-xl', // Stacked top (40%)
          'col-span-1 w-full h-[90px] object-cover rounded-xl', // Stacked bottom (40%)
        ];
        break;
      default:
        return null; // Should not happen with max 3 constraint
    }

    return (
      <div className={`${gridClass} mb-4`}>
        {imageUrls.map((url, index) => (
          <div key={index} onClick={() => handleImageClick(url)} className="block overflow-hidden cursor-pointer">
            <img 
              src={url} 
              alt={`Post image ${index + 1}`} 
              className={`${imageClasses[index] || ''} transition-transform duration-300 hover:scale-105`} 
            />
          </div>
        ))}
      </div>
    );
  };


  const postInnerContent = (
    <div className="flex-1 min-w-0 p-6">
      {/* Header Metadata */}
          <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
            {typeTag && (
              <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-500/20 mr-1">
                {typeTag}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={28} />
              <span className="font-medium text-white">u/{post.author?.username || 'Anonymous'}</span>
            </div>
            {post.author?.role === 'admin' && (
              <span className="ml-2 px-2 py-0.5 bg-admin-yellow/20 text-admin-yellow rounded-full text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/30">
                Admin
              </span>
            )}
            <span className="text-white/20">•</span>
            <span>{formatTime(post.created_at)}</span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-white/20"> • </span>
                <span className="bg-white/5 text-muted-foreground px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/5 hover:border-admin-yellow/30 hover:text-admin-yellow hover:bg-admin-yellow/5 transition-all">
                  {post.tags[0]}
                </span>
              </>
            )}
            {post.is_pinned && (
              <span className="ml-auto px-2 py-0.5 bg-admin-yellow/10 text-admin-yellow/80 rounded-md text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/20">
                Pinned Post
              </span>
            )}
          </div>
        <Link href={`/posts/${post.id}`} className="block group/title">
            <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3 leading-snug group-hover/title:text-admin-yellow/80 transition-colors">
              {post.title}
            </h2>
            {post.body && (
              <div className="text-sm text-muted-foreground line-clamp-3 mb-4 font-sans leading-relaxed group-hover/title:text-white/80 transition-colors">
                {post.body}
              </div>
            )}
        </Link>

        {/* Render Images if available */}
        {post.image_urls && post.image_urls.length > 0 && renderImages(post.image_urls)}

        {/* Mobile Vote & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
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
                  onNotifyUsers={isAdmin ? handleNotifyPostUsers : undefined}
                />
            </div>
          </div>
    </div>
  );

  return (
    <article className="mb-6 w-full font-manrope"> {/* Added font-manrope */}
      <PostCardBase post={post}>{postInnerContent}</PostCardBase>
      <Lightbox src={currentImageSrc} isOpen={lightboxOpen} onClose={handleCloseLightbox} />
    </article>
  );
}
