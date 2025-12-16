'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import CommentTree from '@/app/components/CommentTree'
import VoteColumn from '@/app/components/VoteColumn'
import { Post, Comment } from '@/app/types'
import Link from 'next/link'

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [userCommentVotes, setUserCommentVotes] = useState<Record<string, -1 | 0 | 1>>({})

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const postData = await response.json()
        setPost(postData)
        // Extract user votes from comments
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
      if (comment.user_vote !== undefined) {
        votes[comment.id] = comment.user_vote
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Post not found</p>
            <Link href="/posts" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Back to posts
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8">
        <Link href="/posts" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to posts
        </Link>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex space-x-0">
            <VoteColumn
              targetType="post"
              targetId={post.id}
              initialScore={post.vote_score || 0}
              userVote={post.user_vote || 0}
              onVoteChange={handleVoteChange}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-900">
                  {post.author?.username || 'Anonymous'}
                </span>
                <span>•</span>
                <span>{formatTime(post.created_at)}</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>

              <div className="text-gray-800 mb-4 whitespace-pre-wrap">
                {post.body}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Comments ({post.comment_count || 0})
          </h2>

          <CommentTree
            postId={post.id}
            comments={post.comments || []}
            userVotes={userCommentVotes}
            onCommentAdded={handleCommentAdded}
            onReplyAdded={handleReplyAdded}
            onVoteChange={handleCommentVoteChange}
          />
        </div>
      </main>
    </div>
  )
}
