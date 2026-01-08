import Image from "next/image";
import Link from "next/link";
import { Post } from "@/app/types"; // Assuming Post type will include image_urls
import PostActions from "./PostActions";
import Avatar from "./Avatar";
import MagicBento from "./MagicBento";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import React, { useState, useEffect } from "react";
import Lightbox from "./Lightbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"; // ADD THIS LINE

interface PostItemProps {
  post: Post;
  userVote: -1 | 0 | 1;
  onVoteChange: (
    postId: string,
    newScore: number,
    newUserVote: -1 | 0 | 1
  ) => void;
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
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
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
  <div
    className={`group flex bg-card/40 backdrop-blur-sm border rounded-2xl transition-all duration-300 overflow-hidden
      ${
        isProfilePage
          ? "border-[#A6C8D5]/20 hover:border-[#A6C8D5]/30 hover:shadow-[0_0_30px_rgba(166,200,213,0.1)]"
          : post.author?.role === "admin"
            ? "bg-admin-yellow/10 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] shadow-md shadow-admin-yellow/10 hover:scale-[1.01] transition-all duration-300"
            : "border-foreground/5 hover:shadow-[0_0_30px_rgba(231,179,27,0.05)] hover:bg-foreground/[0.02]"
      }
    `}
  >
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
  isProfilePage,
}: PostItemProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // ADD THIS LINE
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      const response = await fetch("/api/notify/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        setShowSuccessModal(true); // Open the success modal
      } else {
        const errorData = await response.json();
        toast({
          title: "Error!",
          description:
            errorData.message || "Failed to send post announcement emails.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to notify post users:", error);
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

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative w-full mb-6 group/image-carousel">
      
      <div className="relative aspect-video w-full bg-neutral-900 rounded-xl overflow-hidden border border-foreground/10">
        
        <Image
          src={imageUrls[currentImageIndex]}
          alt={`Post image ${currentImageIndex + 1} of ${imageUrls.length}`}
          fill
          className="object-contain transition-transform duration-500 ease-out my-2"
          priority={currentImageIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
          onClick={() =>
            handleImageClick(imageUrls[currentImageIndex], currentImageIndex)
          }
        />

        
        {showNavigation && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-foreground">
            <span className="font-medium">
              {currentImageIndex + 1} / {imageUrls.length}
            </span>
          </div>
        )}
      </div>

      
      {showNavigation && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-200 "
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-200 "
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      
      {imageUrls.length > 2 && (
        <div className="flex justify-center gap-2 mt-4">
          {imageUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-foreground w-8"
                  : "bg-foreground/40 hover:bg-foreground/70"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
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
            <Avatar
              src={post.author?.avatar_url}
              alt={post.author?.username || "User"}
              size={28}
            />
          </Link>
          <Link
            href={`/profile/${post.author_id}`}
            className="font-medium text-foreground"
          >
            u/{post.author?.username || "Anonymous"}
          </Link>
        </div>
        {post.author?.role === "admin" && (
          <span className="ml-2 px-2 py-0.5 bg-admin-yellow/20 text-admin-yellow rounded-full text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/30">
            Admin
          </span>
        )}
        <span className="text-foreground/20">•</span>
        <span>{formatTime(post.created_at)}</span>
        {post.tags && post.tags.length > 0 && (
          <>
            <span className="text-foreground/20"> • </span>
            <span className="bg-foreground/5 text-muted-foreground px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-foreground/5 hover:border-admin-yellow/30 hover:text-admin-yellow hover:bg-admin-yellow/5 transition-all">
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
        <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-3 leading-snug group-hover/title:text-admin-yellow/80 transition-colors">
          {post.title}
        </h2>
        {post.body && (
          <div className="text-sm text-muted-foreground line-clamp-3 mb-4 font-sans leading-relaxed  transition-colors">
            {post.body}
          </div>
        )}
      </Link>

      {/* Render Images if available, below text */}
      {post.image_urls &&
        post.image_urls.length > 0 &&
        renderImages(post.image_urls)}

      {/* Mobile Vote & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-foreground/5 mt-2">
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
            initialScore={post.vote_score}
            initialVote={userVote}
            onVoteSuccess={handleVoteChange}
            isPinned={post.is_pinned}
            onTogglePin={onTogglePin}
            onNotifyUsers={isAdmin ? handleNotifyPostUsers : undefined}
          />
        </div>
      </div>
    </div>
  );

  return (
    <article className="mb-6 w-full font-manrope">
      {" "}
      {/* Added font-manrope */}
      <PostCardBase post={post}>{postInnerContent}</PostCardBase>
      <Lightbox
        imageUrls={post.image_urls || []} // Pass the array of image URLs
        currentImageIndex={currentImageIndex} // Pass the current index
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onPrevious={goToPreviousLightboxImage} // Pass previous handler
        onNext={goToNextLightboxImage} // Pass next handler
      />
      {/* Success Modal for Post Notifications */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-[#27584F]/10 border border-[#27584F] text-foreground p-6 rounded-2xl shadow-xl backdrop-blur-xl">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-[#27584F]" />
            <DialogTitle className="text-2xl font-bold text-foreground">
              Email was successfully sent!
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-base">
              Your post announcement emails have been successfully dispatched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button
                type="button"
                className="w-full bg-[#27584F] hover:bg-[#27584F]/90 text-foreground font-bold py-3 rounded-xl transition-colors duration-200"
              >
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
