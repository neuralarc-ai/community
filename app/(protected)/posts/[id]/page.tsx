'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Lightbox from '@/app/components/Lightbox';
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TwoColumnLayout from '@/app/components/TwoColumnLayout'
import CommentTree from '@/app/components/CommentTree'
import PostActions from '@/app/components/PostActions'
import { Post, Comment, Profile } from '@/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import Avatar from '@/app/components/Avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare, Share2, ArrowLeft, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/lib/getProfile'

const renderImages = (
      imageUrls: string[],
      handleImageClick: (url: string, index: number) => void,
      currentImageIndex: number, // Add this
      setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>> // Add this
    ) => {
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
      <div className="relative w-full mb-6"> {/* Relative for positioning arrows */}
        <div className="w-full bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={imageUrls[currentImageIndex]} // Display current image
            alt={`Post image ${currentImageIndex + 1}`}
            className="max-h-[600px] object-contain cursor-pointer"
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
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    );
  };

export default function PostDetailPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // New state for carousel index
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [userCommentVotes, setUserCommentVotes] = useState<Record<string, -1 | 0 | 1>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [isSaved, setIsSaved] = useState(false)

      useEffect(() => {
        fetchPost()
        fetchUserProfile()
        fetchSavedStatus()
      }, [postId])

      useEffect(() => {
        setCurrentImageIndex(0); // Reset index when post changes
      }, [postId, post?.image_urls]); // Depend on postId and image_urls to reset carousel

  const fetchUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile()
      setCurrentUserProfile(profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchSavedStatus = async () => {
    try {
      const response = await fetch('/api/posts/saved')
      if (response.ok) {
        const savedPosts = await response.json()
        setIsSaved(savedPosts.some((p: Post) => p.id === postId))
      }
    } catch (error) {
      console.error('Failed to fetch saved status:', error)
    }
  }

  const handleToggleSave = async (postId: string) => {
    const newSavedState = !isSaved
    setIsSaved(newSavedState)

    try {
      const response = await fetch('/api/posts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle save')
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      setIsSaved(!newSavedState)
      alert('Failed to update saved status')
    }
  }

  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    if (currentUserProfile?.role !== 'admin') {
      alert('You do not have permission to pin posts.');
      return;
    }

    try {
      const response = await fetch('/api/posts/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, isPinned }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle pin status');
      }

      if (post) {
        setPost({ ...post, is_pinned: isPinned });
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update pin status.');
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/posts')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const postData = await response.json()
        setPost(postData)
        setUserCommentVotes(extractUserVotesFromComments(postData.comments || []))
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractUserVotesFromComments = (comments: Comment[]): Record<string, -1 | 0 | 1> => {
    const votes: Record<string, -1 | 0 | 1> = {}
    const processComment = (comment: Comment) => {
      if ((comment as any).user_vote !== undefined) {
        votes[comment.id] = (comment as any).user_vote
      }
      if (comment.replies) {
        comment.replies.forEach(processComment)
      }
    }
    comments.forEach(processComment)
    return votes
  }

  const handleVoteChange = (newScore: number, newUserVote: -1 | 0 | 1) => {
    if (post) {
      setPost({ ...post, vote_score: newScore, user_vote: newUserVote })
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    if (post) {
      setPost({
        ...post,
        comments: [...(post.comments || []), newComment],
        comment_count: (post.comment_count || 0) + 1
      })
      setUserCommentVotes(prev => ({ ...prev, [newComment.id]: 0 }))
    }
  }

  const handleReplyAdded = (parentId: string, newComment: Comment) => {
    if (post) {
      const addReplyToTree = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), { ...newComment, user_vote: 0 }]
            }
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToTree(comment.replies)
            }
          }
          return comment
        })
      }
      setPost({
        ...post,
        comments: addReplyToTree(post.comments || [])
      })
      setUserCommentVotes(prev => ({ ...prev, [newComment.id]: 0 }))
    }
  }

  const onReplyToggle = (commentId: string | null) => {
    setActiveReplyId(commentId)
  }

  const handleCommentVoteChange = (commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => {
    if (post) {
      const updateCommentScore = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, vote_score: newScore }
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentScore(comment.replies)
            }
          }
          return comment
        })
      }
      setPost({
        ...post,
        comments: updateCommentScore(post.comments || [])
      })
      setUserCommentVotes(prev => ({ ...prev, [commentId]: newUserVote }))
    }
  }

  const handleImageClick = (src: string, index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const handleCloseLightbox = () => {
    setLightboxOpen(false)
    setCurrentImageSrc(null)
  }

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
    )
  }

  if (!post) {
    return (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">Post not found</p>
            <Link href="/posts" className="text-primary hover:underline inline-block font-medium">
              ← Back to posts
            </Link>
          </div>
    )
  }

  return (
    <>
      <main className="relative flex-1 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        {/* Back button and title */}
        <div className="max-w-4xl mx-auto flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/5 hover:bg-yellow-500/20 text-muted-foreground hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Post Details</h1>
              <p className="text-muted-foreground font-sans">Dive into the discussion and insights of this post</p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {post ? (
            <div className="bg-gradient-to-br from-neutral-900 to-black rounded-xl shadow-2xl overflow-hidden mb-8 border border-white/10">
              <div className="p-6">
                {/* User Info (Author Avatar, Username, Time) */}
                <div className="flex items-center space-x-3 mb-5">
                  <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'U'} />
                  <div>
                    <Link href={`/profile/${post.author_id}`} className="text-sm font-semibold text-white hover:text-admin-yellow/80 transition-colors">
                      {post.author?.username || 'Unknown User'}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatTime(post.created_at)}</p>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-heading font-bold text-white mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Body */}
                {post.body && (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans mb-6 text-[15px]">
                    {post.body}
                  </div>
                )}

                {/* Render Images if available, below text */}
                {post.image_urls && post.image_urls.length > 0 && renderImages(post.image_urls, handleImageClick, currentImageIndex, setCurrentImageIndex)}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2.5 py-0.5 bg-white/5 text-muted-foreground border border-white/5 text-xs font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="border-t border-white/5 pt-4">
                        <PostActions
                            postId={post.id}
                            authorId={post.author_id}
                            currentUserId={currentUserProfile?.id}
                            isAdmin={currentUserProfile?.role === 'admin'}
                            onDelete={handleDeletePost}
                            isSaved={isSaved}
                            onToggleSave={handleToggleSave}
                            commentCount={post.comment_count || 0}
                            initialScore={post.vote_score || 0}
                            initialVote={post.user_vote || 0}
                            isPinned={post.is_pinned}
                            onTogglePin={handleTogglePin}
                            onVoteSuccess={fetchPost} // Pass fetchPost as the callback
                        />
                    </div>
              </div>
            </div>
          ) : (
            // ... existing loading/error state ...
            <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">Post not found</p>
            <Link href="/posts" className="text-primary hover:underline inline-block font-medium">
              ← Back to posts
            </Link>
          </div>
          )}
           {/* Comment Section Input Area (Optional: separate card for input or just integrated) 
            For now, we rely on the input inside CommentTree or at the top of comments if we want.
            Typical Reddit has a "Comment as [User]" box here. 
            We'll stick to displaying the tree which usually has an input if we add it, 
            but the current CommentTree implementation expects to just list comments. 
            We might need to add a top-level comment input.
        */}
        
        {/* Comments Tree */}
        <div className="bg-[#121212] backdrop-blur-sm border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                Comments 
                <span className="bg-white/5 text-muted-foreground border border-white/5 px-2 py-0.5 rounded-full text-xs">{post.comment_count || 0}</span>
            </h3>
            <CommentTree
              postId={post.id}
              comments={post.comments || []}
              userVotes={userCommentVotes}
              onCommentAdded={handleCommentAdded}
              onReplyAdded={handleReplyAdded}
              onVoteChange={handleCommentVoteChange}
              activeReplyId={activeReplyId}
              onReplyToggle={onReplyToggle}
            />
        </div>
        </div>
      </main>

      {lightboxOpen && (
        <Lightbox
          imageUrls={post?.image_urls || []} // Pass the array of image URLs
          currentImageIndex={currentImageIndex} // Pass the current index
          isOpen={lightboxOpen}
          onClose={handleCloseLightbox}
          onPrevious={goToPreviousLightboxImage} // Pass previous handler
          onNext={goToNextLightboxImage} // Pass next handler
        />
      )}
    </>
  )
}
