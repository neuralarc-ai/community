import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/app/types'; // Assuming Post type will include image_urls
import PostActions from './PostActions';
import Avatar from './Avatar';
import MagicBento from './MagicBento';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import React, { useState, useEffect } from 'react';
import Lightbox from './Lightbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // ADD THIS LINE

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
          : 'border-white/5 hover:shadow-[0_0_30px_rgba(231,179,27,0.05)] hover:bg-white/[0.02]'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // ADD THIS LINE
  const { toast } = useToast();

  const handleImageClick = (src: string, index: number) => {
    setCurrentImageSrc(src);
    setCurrentImageIndex(index); // Set the clicked image's index
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageSrc(null);
  };

  const goToPreviousLightboxImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? (post?.image_urls?.length || 0) - 1 : prevIndex - 1
    );
  };

  const goToNextLightboxImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === (post?.image_urls?.length || 0) - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
        setCurrentImageIndex(0); // Reset index when post changes
    }, [post.id, post.image_urls]); // Depend on post.id and image_urls to reset carousel

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
    if (imageUrls.length === 0) return null;

    const showNavigation = imageUrls.length > 1;

    const goToPreviousImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
      );
    };

    const goToNextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    };

    return (
      <div className="relative w-full mb-4"> {/* Use relative for positioning arrows */}
        <div className="w-full bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={imageUrls[currentImageIndex]} // Display current image
            alt={`Post image ${currentImageIndex + 1}`}
            className="max-h-[500px] w-auto object-contain cursor-pointer" // Adjusted styling for main image
            onClick={() => handleImageClick(imageUrls[currentImageIndex], currentImageIndex)}
          />
        </div>

        {showNavigation && (
          <>
            <button
              onClick={goToPreviousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
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
              <Link href={`/profile/${post.author_id}`}>
                <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={28} />
              </Link>
              <Link href={`/profile/${post.author_id}`} className="font-medium text-white">
                u/{post.author?.username || 'Anonymous'}
              </Link>
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

        {/* Render Images if available, below text */}
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
      <Lightbox
        imageUrls={post.image_urls || []} // Pass the array of image URLs
        currentImageIndex={currentImageIndex} // Pass the current index
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onPrevious={goToPreviousLightboxImage} // Pass previous handler
        onNext={goToNextLightboxImage} // Pass next handler
      />
    </article>
  );
}
