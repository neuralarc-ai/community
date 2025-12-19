import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Post } from '@/app/types'
import { getVoteScore } from '@/app/lib/voteUtils'
import { awardFlux } from '@/lib/flux'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get('search')

  try {
    const supabase = await createServerClient()

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch posts
    let query = supabase
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

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
    }

    const { data: posts, error: postsError } = await query.order('created_at', { ascending: false })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // Get total count of posts (without pagination/filters for the dashboard)
    const { count: totalPostsCount, error: countError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('Error fetching total posts count:', countError)
      // Continue with posts even if count fails, or return error
    }

    // Fetch profiles for all post authors
    const authorIds = [...new Set(posts.map(post => post.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', authorIds)

    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || [])

    // Fetch user votes for posts if user is authenticated
    let userVotesMap = new Map<string, -1 | 0 | 1>()
    if (user) {
      const postIds = posts.map(post => post.id)
      const { data: userVotes } = await supabase
        .from('votes')
        .select('target_id, value')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .in('target_id', postIds)

      userVotesMap = new Map(userVotes?.map(vote => [vote.target_id, vote.value as -1 | 1]) || [])
    }

    // Calculate vote scores and comment counts for each post
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const [voteScore, commentCount] = await Promise.all([
          getVoteScore('post', post.id),
          // Count comments for this post
          (async () => {
            const { count, error } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
            return error ? 0 : count || 0
          })()
        ])

        const profile = profileMap.get(post.author_id)
        return {
          ...post,
          author: {
            username: profile?.username || 'Anonymous',
            full_name: profile?.full_name || 'Anonymous',
            avatar_url: profile?.avatar_url || ''
          },
          vote_score: voteScore,
          comment_count: commentCount,
          user_vote: userVotesMap.get(post.id) || 0
        }
      })
    )

    return NextResponse.json({ posts: postsWithScores, totalPostsCount })
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
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    // Award flux points for creating a post
    const fluxAwardResult = await awardFlux(user.id, 'POST')
    console.log('Flux award result for post creation:', fluxAwardResult)

    const postWithAuthor = {
      ...newPost,
      author: {
        username: profile?.username || 'Anonymous',
        full_name: profile?.full_name || 'Anonymous',
        avatar_url: profile?.avatar_url || ''
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
