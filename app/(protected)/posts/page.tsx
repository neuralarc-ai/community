'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import PostList from '@/app/components/PostList'
import PostItem from '@/app/components/PostItem'
import CommentTree from '@/app/components/CommentTree'
import { Post, Comment } from '@/app/types'
import Link from 'next/link'

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({})
  const [userCommentVotes, setUserCommentVotes] = useState<Record<string, Record<string, -1 | 0 | 1>>>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoteChange = (postId: string, newScore: number, newUserVote: -1 | 0 | 1) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId
          ? { ...post, vote_score: newScore }
          : post
      )
    )
  }

  const togglePostComments = async (postId: string) => {
    const newExpanded = new Set(expandedPosts)
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId)
    } else {
      newExpanded.add(postId)
      // Fetch comments if not already loaded
      if (!postComments[postId]) {
        await fetchPostComments(postId)
      }
    }
    setExpandedPosts(newExpanded)
  }

  const fetchPostComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const postData = await response.json()
        setPostComments(prev => ({
          ...prev,
          [postId]: postData.comments || []
        }))
        // Update user votes for this post's comments
        setUserCommentVotes(prev => ({
          ...prev,
          [postId]: extractUserVotesFromComments(postData.comments || [])
        }))
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
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

  const handleCommentAdded = (postId: string, newComment: Comment) => {
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }))
  }

  const handleCommentVoteChange = (postId: string, commentId: string, newScore: number, newUserVote: -1 | 0 | 1) => {
    setPostComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).map(comment =>
        comment.id === commentId
          ? { ...comment, vote_score: newScore }
          : comment
      )
    }))
    // Update user vote for this comment
    setUserCommentVotes(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [commentId]: newUserVote
      }
    }))
  }

  const handleReplyAdded = (postId: string, parentId: string, newComment: Comment) => {
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

    setPostComments(prev => ({
      ...prev,
      [postId]: addReplyToTree(prev[postId] || [])
    }))
    // Add user vote entry for the new comment
    setUserCommentVotes(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [newComment.id]: 0
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Community Posts</h1>
            <p className="text-gray-600">Share ideas and engage in discussions</p>
          </div>
          <Link href="/posts/new" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
            New Post
          </Link>
        </div>

        {/* Posts List */}
        <PostList>
          {posts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id}>
                <PostItem
                  post={post}
                  userVote={(post as any).user_vote || 0}
                  onVoteChange={handleVoteChange}
                  isExpanded={expandedPosts.has(post.id)}
                  onToggleComments={() => togglePostComments(post.id)}
                  commentCount={post.comment_count || 0}
                />
                {expandedPosts.has(post.id) && (
                  <div className="ml-12 mt-4">
                    <CommentTree
                      postId={post.id}
                      comments={postComments[post.id] || []}
                      userVotes={userCommentVotes[post.id] || {}}
                      onCommentAdded={(comment) => handleCommentAdded(post.id, comment)}
                      onReplyAdded={(parentId, comment) => handleReplyAdded(post.id, parentId, comment)}
                      onVoteChange={(commentId, newScore, newUserVote) =>
                        handleCommentVoteChange(post.id, commentId, newScore, newUserVote)
                      }
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </PostList>
      </main>
    </div>
  )
}
