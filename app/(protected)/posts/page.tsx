'use client'

import { useState, useEffect, Suspense } from 'react'
import PostList from '@/app/components/PostList'
import PostItem from '@/app/components/PostItem'
import CommentTree from '@/app/components/CommentTree'
import { Post, Comment } from '@/app/types'
import { Plus, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/app/components/ui/card'
import Avatar from '@/app/components/Avatar'
import { createClient } from '@/app/lib/supabaseClient'
import { getCurrentUserProfile } from '@/app/lib/getProfile'
import { Profile } from '@/app/types'
import FilterSection from '@/app/components/FilterSection'
import CreatePostDialog from '@/app/components/CreatePostDialog'

function PostsContent() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchPosts()
    fetchUserProfile()
    fetchSavedPosts()
  }, [searchParams])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('post-updates')
      .on(
        'postgres_changes',
        {
        event: 'UPDATE', // Listen only to UPDATE events
        schema: 'public',
        table: 'posts', // Listen to changes on the posts table
      },
      (payload) => {
        const updatedPost = payload.new as Post;
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === updatedPost.id 
              ? { ...post, vote_score: updatedPost.vote_score } 
              : post
          )
        )
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
    setLoading(true)
    try {
      const searchQuery = searchParams.get('search')
      const url = searchQuery ? `/api/posts?search=${encodeURIComponent(searchQuery)}` : '/api/posts'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error)
      }

      // Check if posts data exists
      if (!data.posts || !Array.isArray(data.posts)) {
        console.warn('No posts data received or invalid format:', data)
        setPosts([])
        return
      }

      // Sort posts: pinned posts first, then by creation date
      const sortedPosts = data.posts.sort((a: Post, b: Post) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts([]) // Set empty array on error
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle pin status');
      }

      // If we pinned a post, we need to unpin all others in our local state
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            return { ...post, is_pinned: isPinned };
          } else if (isPinned) {
            // If we are pinning this post, all other posts should be unpinned
            return { ...post, is_pinned: false };
          }
          return post;
        })
      );
      
      // We don't necessarily need to fetchPosts() again if we updated the state correctly,
      // but fetchPosts also handles sorting. Let's keep it for safety but the local update
      // will handle the UI immediately.
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update pin status.');
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
    <div className="container max-w-[1000px] mx-auto py-8 px-6 space-y-12">
        {/* Create Post Input & Filter Bar */}
            <Card className="mb-6 shadow-sm border-yellow-500/50 bg-card/50 backdrop-blur-sm px-4 py-2 sm:p-2 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:bg-yellow-500/5 transition-all">
            <div className="flex items-center space-x-2 p-2">
                <div className="flex-shrink-0">
                    <Avatar 
                        src={currentUserProfile?.avatar_url} 
                        alt={currentUserProfile?.username || 'User'} 
                        size={32} // Adjusted for responsiveness
                    />
                </div>
                <input 
                    type="text" 
                    placeholder="Create Post" 
                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-yellow-500/50 rounded-lg px-4 py-2.5 flex-grow text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-all cursor-text"
                    onClick={() => setIsCreatePostDialogOpen(true)}
                />
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

        <CreatePostDialog
          isOpen={isCreatePostDialogOpen}
          onClose={() => setIsCreatePostDialogOpen(false)}
          onPostCreated={fetchPosts}
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
              <div key={post.id} className="w-full">
                <PostItem
                  post={post}
                  userVote={(post as any).user_vote || 0}
                  onVoteChange={handleVoteChange}
                  commentCount={post.comment_count || 0}
                  currentUserId={currentUserProfile?.id}
                  isAdmin={currentUserProfile?.role === 'admin'}
                  onDelete={handleDeletePost}
                  isSaved={savedPostIds.has(post.id)}
                  onToggleSave={handleToggleSave}
                  onTogglePin={handleTogglePin}
                />
              </div>
            ))
          )}
        </PostList>
    </div>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostsContent />
    </Suspense>
  )
}

