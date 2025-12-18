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
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPosts()
    fetchUserProfile()
    fetchSavedPosts()
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('realtime-votes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'votes',
        },
        async (payload) => {
          console.log('Vote change detected:', payload)
          
          const newVote = payload.new as any
          const oldVote = payload.old as any
          const targetId = newVote?.target_id || oldVote?.target_id
          const targetType = newVote?.target_type || oldVote?.target_type

          if (targetType === 'post' && targetId) {
            // Re-fetch the specific post to get accurate count
            const response = await fetch(`/api/posts/${targetId}`)
            if (response.ok) {
              const updatedPost = await response.json()
              setPosts(currentPosts => 
                currentPosts.map(post => 
                  post.id === targetId 
                    ? { ...post, vote_score: updatedPost.vote_score } 
                    : post
                )
              )
            }
          }
          
          // Handle comment votes similarly if needed, or trigger re-fetch of comments
          if (targetType === 'comment' && targetId) {
             // For comments, we might need to know the postId to update the correct state slice.
             // Since we don't easily have the postId from just the vote payload (unless we fetch the comment),
             // we might rely on the user navigating or manually refreshing, or implement a more complex lookup.
             // However, simply updating the UI if the comment is currently visible is a good enhancement.
             // For now, let's focus on posts as requested, but the structure is here.
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

  const fetchSavedPosts = async () => {
    try {
      // Use the new endpoint we created to get saved posts
      // Or we can create a lightweight endpoint just for IDs if performance is a concern
      // For now, let's reuse the saved posts endpoint and extract IDs
      const response = await fetch('/api/posts/saved')
      if (response.ok) {
        const savedPosts = await response.json()
        setSavedPostIds(new Set(savedPosts.map((p: Post) => p.id)))
      }
    } catch (error) {
      console.error('Failed to fetch saved posts:', error)
    }
  }

  const handleToggleSave = async (postId: string) => {
    // Optimistic update
    const isCurrentlySaved = savedPostIds.has(postId)
    const newSavedState = !isCurrentlySaved
    
    setSavedPostIds(prev => {
      const newSet = new Set(prev)
      if (newSavedState) {
        newSet.add(postId)
      } else {
        newSet.delete(postId)
      }
      return newSet
    })

    try {
      const response = await fetch('/api/posts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle save')
      }
      
      const result = await response.json()
      
      // Revert if server state doesn't match (though we trust optimistic for now)
      if (result.saved !== newSavedState) {
         setSavedPostIds(prev => {
          const newSet = new Set(prev)
          if (result.saved) {
            newSet.add(postId)
          } else {
            newSet.delete(postId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert optimistic update on error
      setSavedPostIds(prev => {
        const newSet = new Set(prev)
        if (isCurrentlySaved) {
          newSet.add(postId)
        } else {
          newSet.delete(postId)
        }
        return newSet
      })
      alert('Failed to update saved status')
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

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

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
        {/* Create Post Input & Filter Bar */}
            <Card className="mb-6 shadow-sm border-yellow-500/50 bg-card/50 backdrop-blur-sm p-2 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:bg-yellow-500/5 transition-all">
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
                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-yellow-500/50 rounded-lg px-4 py-2.5 flex-grow text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-all cursor-text"
                    onFocus={() => router.push('/posts/new')}
                />
                <button 
                    onClick={() => router.push('/posts/new')}
                    className="text-muted-foreground hover:bg-white/10 hover:text-white p-2 rounded-lg transition-all"
                >
                    <ImageIcon size={20} />
                </button>
                <button 
                    onClick={() => router.push('/posts/new')}
                    className="text-muted-foreground hover:bg-white/10 hover:text-white p-2 rounded-lg transition-all"
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
            activeColor="bg-yellow-500/10 text-white shadow-sm border border-yellow-500/20"
            hoverColor="hover:bg-yellow-500/5 hover:text-white"
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
                  currentUserId={currentUserProfile?.id}
                  onDelete={handleDeletePost}
                  isSaved={savedPostIds.has(post.id)}
                  onToggleSave={handleToggleSave}
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
