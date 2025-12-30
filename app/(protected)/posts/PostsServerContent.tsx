import { createServerClient } from '@/app/lib/supabaseServerClient';
import { getCurrentUserProfile } from '@/app/lib/getProfile';
import { Post, Profile } from '@/app/types';
import { cache } from 'react';

interface PostsServerContentProps {
  searchQuery: string | null;
}

export const getPosts = cache(async (searchQuery: string | null): Promise<Post[]> => {
  const supabase = await createServerClient();
  const query = supabase
    .from('posts')
    .select(`
      id,
      created_at,
      updated_at,
      title,
      body: content,
      image_url,
      vote_score,
      author_id: user_id,
      is_pinned,
      tags,
      comments_count: comments(count),
      profiles(id, username, avatar_url),
      user_votes(vote_type)
    `)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    query.ilike('title', `%{searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data.map(post => ({
    id: post.id,
    author_id: post.author_id,
    title: post.title,
    body: post.body,
    tags: post.tags || [],
    created_at: post.created_at,
    updated_at: post.created_at, // Using created_at as updated_at since it's not selected
    author: post.profiles && post.profiles.length > 0 ? {
      username: post.profiles[0].username,
      full_name: post.profiles[0].username, // Using username as full_name if not available
      avatar_url: post.profiles[0].avatar_url,
      role: 'user' as const // Default to user role
    } : undefined,
    vote_score: post.vote_score,
    user_vote: post.user_votes[0]?.vote_type || 0,
    comment_count: post.comments_count[0]?.count || 0,
    is_pinned: post.is_pinned,
    image_urls: post.image_url ? [post.image_url] : undefined
  })) as Post[];
});

export const getUserProfile = cache(async (): Promise<Profile | null> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
});

export const getSavedPostIds = cache(async (userId: string): Promise<Set<string>> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved posts:', error);
    return new Set();
  }

  return new Set(data.map(item => item.post_id));
});

export default async function PostsServerContent({ searchQuery }: PostsServerContentProps) {
  const [posts, currentUserProfile] = await Promise.all([
    getPosts(searchQuery),
    getUserProfile(),
  ]);

  const savedPostIds = currentUserProfile
    ? await getSavedPostIds(currentUserProfile.id)
    : new Set<string>();

  // Sort posts: pinned posts first, then by creation date
  const sortedPosts = posts.sort((a: Post, b: Post) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Render the client component with fetched data
  return (
    <div>
      {/* This will be the client component that takes these props */}
    </div>
  );
}

