"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Lightbox from "@/app/components/Lightbox";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CommentTree from "@/app/components/CommentTree";
import PostActions from "@/app/components/PostActions";
import { Post, Profile } from "@/app/types";
import Avatar from "@/app/components/Avatar";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { toast } from "sonner";

export default function PostDetailPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);
  const [userCommentVotes, setUserCommentVotes] = useState<
    Record<string, -1 | 0 | 1>
  >({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
    fetchUserProfile();
    fetchSavedStatus();
  }, [postId]);

  useEffect(() => {
    setCurrentImageIndex(0); // Reset carousel on post change
  }, [post?.image_urls]);

  const fetchUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setCurrentUserProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSavedStatus = async () => {
    try {
      const response = await fetch("/api/posts/saved");
      if (response.ok) {
        const savedPosts = await response.json();
        setIsSaved(savedPosts.some((p: Post) => p.id === postId));
      }
    } catch (error) {
      console.error("Failed to fetch saved status:", error);
    }
  };

  const handleToggleSave = async (postId: string) => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      const response = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) throw new Error("Failed to toggle save");
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(!newSavedState);
    }
  };

  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    if (currentUserProfile?.role !== "admin") return;

    try {
      const response = await fetch("/api/posts/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, isPinned }),
      });

      if (!response.ok) throw new Error("Failed to toggle pin");
      setPost((prev) => (prev ? { ...prev, is_pinned: isPinned } : null));
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post permanently?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) router.push("/posts");
      else throw new Error("Delete failed");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) throw new Error("Post not found");
      const postData = await response.json();
      setPost(postData);
      setUserCommentVotes(
        extractUserVotesFromComments(postData.comments || [])
      );
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractUserVotesFromComments = (
    comments: any[]
  ): Record<string, -1 | 0 | 1> => {
    const votes: Record<string, -1 | 0 | 1> = {};
    const traverse = (c: any) => {
      if (c.user_vote !== undefined) votes[c.id] = c.user_vote;
      c.replies?.forEach(traverse);
    };
    comments.forEach(traverse);
    return votes;
  };

  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    setPost((prev) =>
      prev ? { ...prev, vote_score: newScore, user_vote: newUserVote } : null
    );
  };

  const handleCommentAdded = (newComment: any) => {
    setPost((prev) =>
      prev
        ? {
            ...prev,
            comments: [...(prev.comments || []), newComment],
            comment_count: (prev.comment_count || 0) + 1,
          }
        : null
    );
  };

  const handleReplyAdded = (parentId: string, newComment: any) => {
    setPost((prev) => {
      if (!prev) return null;
      const addReply = (comments: any[]): any[] =>
        comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : { ...c, replies: c.replies ? addReply(c.replies) : c.replies }
        );
      return { ...prev, comments: addReply(prev.comments || []) };
    });
  };

  const handleCommentVoteChange = (
    commentId: string,
    newScore: number,
    newUserVote: -1 | 0 | 1
  ) => {
    setPost((prev) => {
      if (!prev) return null;
      const update = (comments: any[]): any[] =>
        comments.map((c) =>
          c.id === commentId
            ? { ...c, vote_score: newScore }
            : { ...c, replies: c.replies ? update(c.replies) : c.replies }
        );
      return { ...prev, comments: update(prev.comments || []) };
    });
    setUserCommentVotes((prev) => ({ ...prev, [commentId]: newUserVote }));
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground mb-6">Post not found</p>
        <Link
          href="/posts"
          className="text-primary hover:underline font-medium"
        >
          ← Back to posts
        </Link>
      </div>
    );
  }

  const images = post.image_urls || [];

  return (
    <>
      <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-full bg-card shadow border text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Post</h1>
              <p className="text-muted-foreground">
                View discussion and details
              </p>
            </div>
          </div>

          {/* Post Card */}
          <article className="bg-card rounded-2xl border shadow-lg overflow-hidden mb-10">
            <div className="p-6 sm:p-8">
              {/* Author */}
              <div className="flex items-center gap-3 mb-6 text-foreground">
                <Avatar
                  src={post.author?.avatar_url}
                  alt={post.author?.username}
                />
                <div>
                  <Link
                    href={`/profile/${post.author_id}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {post.author?.username || "Unknown"}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(post.created_at)}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl text-foreground font-bold mb-4 leading-tight">
                {post.title}
              </h2>

              {/* Body */}
              {post.body && (
                <p className="text-foreground/90 leading-relaxed mb-8 whitespace-pre-wrap">
                  {post.body}
                </p>
              )}

              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="mb-8 -mx-6 sm:-mx-8">
                  <div className="relative aspect-video bg-black/50 rounded-t-none">
                    <Image
                      src={images[currentImageIndex]}
                      alt={`Post image ${currentImageIndex + 1}`}
                      fill
                      className="object-contain cursor-pointer"
                      onClick={() => openLightbox(currentImageIndex)}
                      priority={currentImageIndex === 0}
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              (i) => (i - 1 + images.length) % images.length
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((i) => (i + 1) % images.length)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 p-4 bg-accent/5 overflow-x-auto">
                      {images.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            i === currentImageIndex
                              ? "border-primary opacity-100"
                              : "border-transparent opacity-60 hover:opacity-90"
                          }`}
                        >
                          <Image
                            src={url}
                            alt={`Thumbnail ${i + 1}`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-accent/10 text-foreground/80 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-border">
                <PostActions
                  postId={post.id}
                  authorId={post.author_id}
                  currentUserId={currentUserProfile?.id}
                  isAdmin={currentUserProfile?.role === "admin"}
                  onDelete={handleDeletePost}
                  isSaved={isSaved}
                  onToggleSave={handleToggleSave}
                  commentCount={post.comment_count || 0}
                  initialScore={post.vote_score || 0}
                  initialVote={post.user_vote || 0}
                  isPinned={post.is_pinned}
                  onTogglePin={handleTogglePin}
                  onVoteSuccess={fetchPost}
                />
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <section className="bg-card rounded-2xl border p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Comments
              <span className="text-sm font-normal text-muted-foreground bg-accent/10 px-3 py-1 rounded-full">
                {post.comment_count || 0}
              </span>
            </h3>

            <CommentTree
              postId={post.id}
              comments={post.comments || []}
              userVotes={userCommentVotes}
              onCommentAdded={handleCommentAdded}
              onReplyAdded={handleReplyAdded}
              onVoteChange={handleCommentVoteChange}
              activeReplyId={activeReplyId}
              onReplyToggle={setActiveReplyId}
            />
          </section>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox
          imageUrls={images}
          currentImageIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onPrevious={() =>
            setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)
          }
          onNext={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
        />
      )}
    </>
  );
}
