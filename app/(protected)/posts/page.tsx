"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import PostItem from "@/app/components/PostItem";
import { Post } from "@/app/types";
import { useSearchParams } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import Avatar from "@/app/components/Avatar";
import { createClient } from "@/app/lib/supabaseClient";
import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { Profile } from "@/app/types";
import CreatePostDialog from "@/app/components/CreatePostDialog";
import { toast } from "sonner";

function PostsContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(
    null
  );
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("post-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Listen only to UPDATE events
          schema: "public",
          table: "posts", // Listen to changes on the posts table
        },
        (payload) => {
          const updatedPost = payload.new as Post;
          setPosts((currentPosts) =>
            currentPosts.map((post) =>
              post.id === updatedPost.id
                ? { ...post, vote_score: updatedPost.vote_score }
                : post
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      setCurrentUserProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const searchQuery = searchParams.get("search");
      const url = searchQuery
        ? `/api/posts?search=${encodeURIComponent(searchQuery)}`
        : "/api/posts";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }

      // Check if posts data exists
      if (!data.posts || !Array.isArray(data.posts)) {
        console.warn("No posts data received or invalid format:", data);
        setPosts([]);
        return;
      }

      // Sort posts: pinned posts first, then by creation date
      const sortedPosts = data.posts.sort((a: Post, b: Post) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSavedPosts = useCallback(async () => {
    try {
      // Use the new endpoint we created to get saved posts
      // Or we can create a lightweight endpoint just for IDs if performance is a concern
      // For now, let's reuse the saved posts endpoint and extract IDs
      const response = await fetch("/api/posts/saved");
      if (response.ok) {
        const savedPosts = await response.json();
        setSavedPostIds(new Set(savedPosts.map((p: Post) => p.id)));
      }
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
    }
  }, []);

  const handleToggleSave = async (postId: string) => {
    // Optimistic update
    const isCurrentlySaved = savedPostIds.has(postId);
    const newSavedState = !isCurrentlySaved;

    setSavedPostIds((prev) => {
      const newSet = new Set(prev);
      if (newSavedState) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });

    try {
      const response = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle save");
      }

      const result = await response.json();

      // Revert if server state doesn't match (though we trust optimistic for now)
      if (result.saved !== newSavedState) {
        setSavedPostIds((prev) => {
          const newSet = new Set(prev);
          if (result.saved) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      // Revert optimistic update on error
      setSavedPostIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      toast.error("Failed to update saved status");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
    fetchSavedPosts();
  }, [searchParams, fetchPosts, fetchUserProfile, fetchSavedPosts]);

  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    if (currentUserProfile?.role !== "admin") {
      toast.error("You do not have permission to pin posts.");
      return;
    }

    try {
      const response = await fetch("/api/posts/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, isPinned }),
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If parsing fails, try to get the raw response text
          try {
            const rawResponse = await response.text();
            console.error("Raw server response:", rawResponse);
            errorMessage = rawResponse || errorMessage;
          } catch (textError) {
            console.error("Could not read server response:", textError);
          }
        }
        throw new Error(
          `Failed to toggle pin status: ${response.status} - ${errorMessage}`
        );
      }

      // If we pinned a post, we need to unpin all others in our local state
      setPosts((currentPosts) =>
        currentPosts.map((post) => {
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
      console.error("Error toggling pin:", error);
      toast.error("Failed to update pin status.");
    }
  };

  const handleVoteChange = (
    postId: string,
    newScore: number,
    newUserVote: -1 | 0 | 1
  ) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, vote_score: newScore, user_vote: newUserVote }
          : post
      )
    );
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((currentPosts) =>
          currentPosts.filter((post) => post.id !== postId)
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const filteredPosts = posts;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto md:py-8 md:px-6 space-y-4 md:space-y-6">
      {/* Create Post Input & Filter Bar */}
      <Card className="mb-6 shadow-sm  bg-card/50 backdrop-blur-sm  rounded-2xl hover:border-yellow-500/50 transition-all group">
        <div className="flex items-center gap-2 p-2">
          <div className="flex-shrink-0">
            <Avatar
              src={currentUserProfile?.avatar_url}
              alt={currentUserProfile?.username || "User"}
              size={32} // Adjusted for responsiveness
            />
          </div>
          <input
            type="text"
            placeholder="Create Post"
            className="bg-foreground/5 group-hover:bg-foreground/10 border border-foreground/5 rounded-md px-4 py-3 flex-grow text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-all cursor-text"
            onClick={() => setIsCreatePostDialogOpen(true)}
          />
        </div>
      </Card>

      <CreatePostDialog
        isOpen={isCreatePostDialogOpen}
        onClose={() => setIsCreatePostDialogOpen(false)}
        onPostCreated={fetchPosts}
      />

      {/* Posts List */}
      {filteredPosts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No posts yet. Be the first to start a discussion!
          </p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <div key={post.id} className="w-full">
            <PostItem
              post={post}
              userVote={post.user_vote || 0}
              onVoteChange={handleVoteChange}
              commentCount={post.comment_count || 0}
              currentUserId={currentUserProfile?.id}
              isAdmin={currentUserProfile?.role === "admin"}
              onDelete={handleDeletePost}
              isSaved={savedPostIds.has(post.id)}
              onToggleSave={handleToggleSave}
              onTogglePin={handleTogglePin}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostsContent />
    </Suspense>
  );
}
