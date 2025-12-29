import { createClient } from '@/app/lib/supabaseServerClient';
import { getCurrentUserProfile } from '@/app/lib/getProfile';
import { Post, Profile } from '@/app/types';
import { cache } from 'react';

interface PostsServerContentProps {
  searchQuery: string | null;
}

export const getPosts = cache(async (searchQuery: string | null): Promise<Post[]> => {
  const supabase = createClient();
  const query = supabase
    .from('posts')
    .select(`
      id,
      created_at,
      title,
      content,
      image_url,
      vote_score,
      user_id,
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
    ...post,
    comment_count: post.comments_count[0]?.count || 0,
    user_vote: post.user_votes[0]?.vote_type || 0,
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
  const supabase = createClient();
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
  const [posts, currentUserProfile, savedPostIdsArray] = await Promise.all([
    getPosts(searchQuery),
    getUserProfile(),
    currentUserProfile ? getSavedPostIds(currentUserProfile.id) : Promise.resolve(new Set<string>()),
  ]);

  const savedPostIds = new Set(savedPostIdsArray); // Convert array back to Set

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

