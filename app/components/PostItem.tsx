import Image from "next/image";
import Link from "next/link";
import { Post } from "@/app/types";
import PostActions from "./PostActions";
import Avatar from "./Avatar";
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
import { ChevronLeft, ChevronRight, CheckCircle, Pin } from "lucide-react";
import React, { useState, useEffect } from "react";

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
    className={`group flex flex-col sm:flex-row bg-card/40 backdrop-blur-sm border rounded-2xl transition-all duration-300 overflow-hidden
      ${
        isProfilePage
          ? "border-[#A6C8D5]/20 hover:border-[#A6C8D5]/30 hover:shadow-[0_0_30px_rgba(166,200,213,0.1)]"
          : post.author?.role === "admin"
            ? "bg-admin-yellow/10 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] shadow-md shadow-admin-yellow/10 hover:scale-[1.01]"
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPreviousLightboxImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (post.image_urls?.length || 0) - 1 : prev - 1
    );
  };

  const goToNextLightboxImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (post.image_urls?.length || 0) - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [post.id]);

  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    onVoteChange(post.id, newScore, newUserVote);
  };

  const handleNotifyPostUsers = async () => {
    try {
      const response = await fetch("/api/notify/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error!",
          description: errorData.message || "Failed to send emails.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
      <div className="relative w-full mb-6 mt-4 group/image-carousel">
        <div className="relative aspect-video w-full bg-neutral-900 rounded-xl overflow-hidden border border-foreground/10">
          <Image
            src={imageUrls[currentImageIndex]}
            alt={`Post image ${currentImageIndex + 1}`}
            fill
            className="object-contain cursor-pointer"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 900px"
            priority={currentImageIndex === 0}
            onClick={() => handleImageClick(currentImageIndex)}
          />

          {/* Image counter */}
          {showNavigation && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-sm text-white">
              <span className="font-semibold">
                {currentImageIndex + 1} / {imageUrls.length}
              </span>
            </div>
          )}
        </div>

        {/* Navigation arrows - hidden on very small screens if only 2 images */}
        {showNavigation && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Dots indicator - only show if >2 images */}
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
    <div className="flex-1 min-w-0 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
        {typeTag && (
          <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
            {typeTag}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Link href={`/profile/${post.author_id}`}>
            <Avatar
              src={post.author?.avatar_url}
              alt={post.author?.username || "User"}
              size={32}
            />
          </Link>
          <Link
            href={`/profile/${post.author_id}`}
            className="font-medium text-foreground hover:text-admin-yellow transition-colors"
          >
            u/{post.author?.username || "Anonymous"}
          </Link>
        </div>
        {post.author?.role === "admin" && (
          <span className="px-2 py-1 bg-admin-yellow/20 text-admin-yellow rounded-full text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/30">
            Admin
          </span>
        )}
        <span className="text-foreground/30">•</span>
        <span>{formatTime(post.created_at)}</span>
        {post.tags && post.tags.length > 0 && (
          <>
            <span className="text-foreground/30">•</span>
            <span className="bg-foreground/5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-foreground/10 hover:border-admin-yellow/30 hover:text-admin-yellow hover:bg-admin-yellow/5 transition-all">
              {post.tags[0]}
            </span>
          </>
        )}
        {post.is_pinned && (
          <>
            <span className="ml-auto px-3 py-1 hidden md:block bg-admin-yellow/10 text-admin-yellow/80 rounded-md text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/20">
              Pinned
            </span>
            <span className="ml-auto p-1 block md:hidden bg-admin-yellow/10 text-admin-yellow/80 rounded-md text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/20">
              <Pin className="rotate-45" size={20} />
            </span>
          </>
        )}
      </div>

      {/* Title & Body */}
      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-3 leading-tight hover:text-admin-yellow/80 transition-colors">
          {post.title}
        </h2>
        {post.body && (
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {post.body}
          </p>
        )}
      </Link>

      {/* Images */}
      {post.image_urls &&
        post.image_urls.length > 0 &&
        renderImages(post.image_urls)}

      {/* Actions */}
      <div className="pt-4 border-t border-foreground/10">
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
  );

  return (
    <article className="mb-8 w-full">
      <PostCardBase post={post} isProfilePage={isProfilePage}>
        {postInnerContent}
      </PostCardBase>

      {/* Lightbox */}
      <Lightbox
        imageUrls={post.image_urls || []}
        currentImageIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onPrevious={goToPreviousLightboxImage}
        onNext={goToNextLightboxImage}
      />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-6 py-8">
            <CheckCircle className="h-20 w-20 text-green-500" />
            <DialogTitle className="text-2xl font-bold">
              Email Sent Successfully!
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground max-w-sm">
              Your post announcement has been sent to all users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full sm:w-auto px-8 bg-green-600 hover:bg-green-700">
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
