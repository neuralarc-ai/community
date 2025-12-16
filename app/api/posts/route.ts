import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Post } from '@/app/types'
import { getVoteScore } from '@/app/lib/voteUtils'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Fetch posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        title,
        body,
        tags,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // Fetch profiles for all post authors
    const authorIds = [...new Set(posts.map(post => post.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', authorIds)

    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || [])

    // Calculate vote scores for each post
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const voteScore = await getVoteScore('post', post.id)
        const profile = profileMap.get(post.author_id)
        return {
          ...post,
          author: {
            username: profile?.username || 'Anonymous',
            full_name: profile?.full_name || 'Anonymous'
          },
          vote_score: voteScore
        }
      })
    )

    return NextResponse.json(postsWithScores)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, body: postBody, tags = [] } = body

    if (!title || !postBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    // Create the post
    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title,
        body: postBody,
        tags
      })
      .select(`
        id,
        author_id,
        title,
        body,
        tags,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Fetch the author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single()

    const postWithAuthor = {
      ...newPost,
      author: {
        username: profile?.username || 'Anonymous',
        full_name: profile?.full_name || 'Anonymous'
      },
      vote_score: 0
    }

    return NextResponse.json(postWithAuthor, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
