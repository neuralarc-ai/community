import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { getVoteScore } from '@/app/lib/voteUtils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch profile (we know it's the current user, but good for consistency)
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    // Enhance with scores
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const [voteScore, commentCount] = await Promise.all([
          getVoteScore('post', post.id),
          (async () => {
             const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
             return count || 0
          })()
        ])

        return {
          ...post,
          author: {
            username: profile?.username || 'Anonymous',
            full_name: profile?.full_name || 'Anonymous',
            avatar_url: profile?.avatar_url || '',
            role: profile?.role || 'user', // Default to 'user' if not available
          })

    )

    return NextResponse.json(postsWithScores)
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

