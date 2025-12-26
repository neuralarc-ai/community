import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { getVoteScore } from '@/app/lib/voteUtils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let targetUserId = userId;
    if (!targetUserId) {
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      targetUserId = user.id;
    }

    // Fetch user's posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, profiles(username, full_name, avatar_url, role)') // Fetch author profile directly
      .eq('author_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enhance with scores
    const postsWithScores = await Promise.all(
      posts.map(async (post: any) => {
        const [voteScore, commentCount] = await Promise.all([
          getVoteScore('post', post.id),
          (async () => {
             const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
             return count || 0;
          })()
        ]);

        const authorProfile = post.profiles;
        return {
          ...post,
          author: {
            username: authorProfile?.username || 'Anonymous',
            full_name: authorProfile?.full_name || 'Anonymous',
            avatar_url: authorProfile?.avatar_url || '',
            role: authorProfile?.role || 'user', // Default to 'user' if not available
          },
          vote_score: voteScore,
          comment_count: commentCount
        };
      })
    )

    return NextResponse.json(postsWithScores)
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

