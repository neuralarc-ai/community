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
import { MessageSquare, Share2, ArrowLeft, Bookmark } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/lib/getProfile'

const renderImages = (imageUrls: string[], handleImageClick: (src: string) => void) => {
  const numImages = imageUrls.length;
  let gridClass = '';
  let imageClasses: string[] = [];

  switch (numImages) {
    case 1:
      gridClass = 'grid grid-cols-1 place-items-center';
      imageClasses = ['max-w-full max-h-[500px] w-auto h-auto object-contain rounded-xl'];
      break;
    case 2:
      gridClass = 'grid grid-cols-2 gap-2';
      imageClasses = ['w-full h-[250px] object-cover rounded-xl', 'w-full h-[250px] object-cover rounded-xl'];
      break;
    case 3:
      gridClass = 'grid grid-cols-3 gap-2';
      imageClasses = [
        'w-full h-[250px] object-cover rounded-xl',
        'w-full h-[250px] object-cover rounded-xl',
        'w-full h-[250px] object-cover rounded-xl',
      ];
      break;
    default:
      return null; // Should not happen with max 3 constraint
  }

  return (
    <div className={`${gridClass} mb-4`}>
      {imageUrls.map((url, index) => (
        <div key={index} onClick={() => handleImageClick(url)} className="block overflow-hidden cursor-pointer">
          <Image 
            src={url} 
            alt={`Post image ${index + 1}`} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`${imageClasses[index] || ''} transition-transform duration-300 hover:scale-105`} 
            priority
          />
        </div>
      ))}
    </div>
  );
};

export default function PostDetailPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
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

  const handleImageClick = (src: string) => {
    setCurrentImageSrc(src)
    setLightboxOpen(true)
  }

  const handleCloseLightbox = () => {
    setLightboxOpen(false)
    setCurrentImageSrc(null)
  }

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
      <TwoColumnLayout>
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </TwoColumnLayout>
    )
  }

  if (!post) {
    return (
      <TwoColumnLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">Post not found</p>
            <Link href="/posts" className="text-primary hover:underline inline-block font-medium">
              ← Back to posts
            </Link>
          </div>
      </TwoColumnLayout>
    )
  }

  return (
    <>
    <TwoColumnLayout>
<div className="flex items-center gap-4 mb-8">
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

        {/* Main Post Card */}
        <div className="bg-[#121212] backdrop-blur-sm border border-white/5 rounded-xl shadow-sm overflow-hidden mb-6 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(231,179,27,0.05)] transition-all duration-300">
            <div className="flex flex-col">
                
                {/* Content */}
                <div className="flex-1 p-4 sm:p-6">
                    {/* Metadata */}
                    <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
                        <div className="flex items-center gap-1">
                            <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={32} />
                            <span className="font-bold text-white">u/{post.author?.username || 'Anonymous'}</span>
                            {post.author?.role === 'admin' && (
                                <span className="ml-1 bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border border-yellow-500/20">Admin</span>
                            )}
                        </div>
                        {post.is_pinned && (
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Pinned by Admin</span>
                            </div>
                        )}
                        <span>•</span>
                        <span>{formatTime(post.created_at)}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-heading font-bold text-white mb-4 leading-tight">
                        {post.title}
                    </h1>
                    
                    {/* Body */}
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans mb-6 text-[15px]">
                        {post.body}
                    </div>

                    {/* Render Images if available */}
                    {(() => {
                      return post.image_urls && post.image_urls.length > 0 && renderImages(post.image_urls, handleImageClick)
                    })()}

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
                            initialVoteScore={post.vote_score || 0}
                            userVote={post.user_vote || 0}
                            onVoteChange={handleVoteChange}
                            isPinned={post.is_pinned}
                            onTogglePin={handleTogglePin}
                        />
                    </div>
                </div>
            </div>
        </div>

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
    </TwoColumnLayout>
    <Lightbox src={currentImageSrc} isOpen={lightboxOpen} onClose={handleCloseLightbox} />
    </>
  )
}
