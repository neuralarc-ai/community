import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Post } from '@/app/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch saved posts with full post details
    // We need to join saved_posts -> posts -> profiles (author)
    const { data: savedPosts, error: fetchError } = await supabase
      .from('saved_posts')
      .select(`
        post_id,
        posts (
          *,
          author:profiles(
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch saved posts error:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 3. Transform data to match Post interface
    // supabase returns an array of objects like { post_id: '...', posts: { ... } }
    // We want an array of Post objects
    const formattedPosts: Post[] = savedPosts
      .filter(item => item.posts) // Ensure post still exists
      .map(item => item.posts as unknown as Post)

    return NextResponse.json(formattedPosts)

  } catch (error) {
    console.error('Saved posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

