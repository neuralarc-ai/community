'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import TwoColumnLayout from '@/app/components/TwoColumnLayout'
import CommentTree from '@/app/components/CommentTree'
import VoteColumn from '@/app/components/VoteColumn'
import { Post, Comment } from '@/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import Avatar from '@/app/components/Avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare, Share2, ArrowLeft, Bookmark } from 'lucide-react'

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [userCommentVotes, setUserCommentVotes] = useState<Record<string, -1 | 0 | 1>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [postId])

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
    <TwoColumnLayout>
        {/* Back Link */}
        <div className="mb-4">
            <Link href="/posts" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors">
                <ArrowLeft size={16} />
                Back to Feed
            </Link>
        </div>

        {/* Main Post Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="flex">
                {/* Vote Column - Hidden on mobile, shown on SM+ */}
                <div className="hidden sm:flex w-14 bg-gray-50/50 border-r border-gray-100 flex-col items-center py-4 gap-1">
                    <VoteColumn
                        targetType="post"
                        targetId={post.id}
                        initialScore={post.vote_score || 0}
                        userVote={post.user_vote || 0}
                        onVoteChange={handleVoteChange}
                        orientation="vertical"
                    />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 sm:p-6">
                    {/* Metadata */}
                    <div className="flex items-center text-xs text-gray-500 mb-3 gap-2">
                        <div className="flex items-center gap-1">
                            <Avatar src={post.author?.avatar_url} alt={post.author?.username || 'User'} size={24} />
                            <span className="font-bold text-gray-900">u/{post.author?.username || 'Anonymous'}</span>
                        </div>
                        <span>•</span>
                        <span>{formatTime(post.created_at)}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-4 leading-tight">
                        {post.title}
                    </h1>
                    
                    {/* Body */}
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans mb-6 text-[15px]">
                        {post.body}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                                {tag}
                            </span>
                        ))}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 sm:gap-4 border-t border-gray-100 pt-4 flex-wrap">
                        {/* Mobile Vote Buttons */}
                        <div className="sm:hidden mr-2">
                             <VoteColumn
                                targetType="post"
                                targetId={post.id}
                                initialScore={post.vote_score || 0}
                                userVote={post.user_vote || 0}
                                onVoteChange={handleVoteChange}
                                orientation="horizontal"
                            />
                        </div>

                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full h-8">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold">{post.comment_count || 0} Comments</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full h-8">
                            <Share2 className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold">Share</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full h-8">
                            <Bookmark className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold">Save</span>
                        </Button>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                Comments 
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{post.comment_count || 0}</span>
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
  )
}
