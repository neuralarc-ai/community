'use client'

import { useState, useEffect } from 'react'
import PostList from '@/app/components/PostList'
import PostItem from '@/app/components/PostItem'
import CommentTree from '@/app/components/CommentTree'
import { Post, Comment } from '@/app/types'
import { Plus, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/app/components/ui/card'
import Avatar from '@/app/components/Avatar'
import { createClient } from '@/app/lib/supabaseClient'
import { getCurrentUserProfile } from '@/app/lib/getProfile'
import { Profile } from '@/app/types'
import TwoColumnLayout from '@/app/components/TwoColumnLayout'
import FilterSection from '@/app/components/FilterSection'

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({})
  const [userCommentVotes, setUserCommentVotes] = useState<Record<string, Record<string, -1 | 0 | 1>>>({})
  const [activeReplyIds, setActiveReplyIds] = useState<Record<string, string | null>>({})
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile()
      setCurrentUserProfile(profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

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

  const handleReplyToggle = (postId: string, commentId: string | null) => {
    setActiveReplyIds(prev => ({
      ...prev,
      [postId]: commentId
    }))
  }

  // Derived state for tags and filtered posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || []))).sort()
  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags?.includes(selectedTag)) 
    : posts

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <TwoColumnLayout>
        {/* Create Post Input */}
        <Card className="mb-6 shadow-sm border-border p-2">
            <div className="flex items-center space-x-2 p-2">
                <div className="flex-shrink-0">
                    <Avatar 
                        src={currentUserProfile?.avatar_url} 
                        alt={currentUserProfile?.username || 'User'} 
                        size={38} 
                    />
                </div>
                <input 
                    type="text" 
                    placeholder="Create Post" 
                    className="bg-muted hover:bg-background border border-transparent hover:border-primary/50 rounded-md px-4 py-2 flex-grow text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-text"
                    onFocus={() => router.push('/posts/new')}
                />
                <button 
                    onClick={() => router.push('/posts/new')}
                    className="text-muted-foreground hover:bg-muted p-2 rounded transition-colors"
                >
                    <ImageIcon size={20} />
                </button>
                <button 
                    onClick={() => router.push('/posts/new')}
                    className="text-muted-foreground hover:bg-muted p-2 rounded transition-colors"
                >
                    <LinkIcon size={20} />
                </button>
            </div>
        </Card>

        {/* Filter Section */}
        <FilterSection 
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
        />

        {/* Posts List */}
        <PostList>
          {filteredPosts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {selectedTag ? `No posts found with tag "${selectedTag}"` : "No posts yet. Be the first to start a discussion!"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
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
                  <div className="ml-0 mt-2 bg-card rounded-b-xl border-x border-b border-border p-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <CommentTree
                      postId={post.id}
                      comments={postComments[post.id] || []}
                      userVotes={userCommentVotes[post.id] || {}}
                      onCommentAdded={(comment) => handleCommentAdded(post.id, comment)}
                      onReplyAdded={(parentId, comment) => handleReplyAdded(post.id, parentId, comment)}
                      onVoteChange={(commentId, newScore, newUserVote) =>
                        handleCommentVoteChange(post.id, commentId, newScore, newUserVote)
                      }
                      activeReplyId={activeReplyIds[post.id] || null}
                      onReplyToggle={(commentId) => handleReplyToggle(post.id, commentId)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </PostList>
    </TwoColumnLayout>
  )
}
