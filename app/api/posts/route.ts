import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Post } from '@/app/types'
import { awardFlux } from '@/lib/flux'
import rateLimit from '@/app/lib/rateLimit'
import { z } from 'zod'
import logger from '@/app/lib/logger'

const limiter = rateLimit({
  uniqueTokenPerInterval: 500, // Max 500 users per 60 seconds
  interval: 60 * 1000, // 60 seconds
});

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  body: z.string().min(1, 'Body is required'),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get('search')
  const limit = searchParams.get('limit')

  try {
    const supabase = await createServerClient()

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch posts - temporarily exclude is_pinned until migration is run
    let query = supabase
      .from('posts')
      .select(`
        id,
        author_id,
        title,
        body,
        tags,
        created_at,
        updated_at,
        vote_score,
        is_pinned
      `)

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
    }

    // Order by is_pinned first, then created_at (newest first)
    let { data: posts, error: postsError } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    posts = posts ?? []

    if (limit) {
      posts = posts.slice(0, parseInt(limit))
    }

    if (postsError) {
      logger.error('Error fetching posts', postsError)
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
      logger.error('Error fetching total posts count', countError)
    }

    // Fetch profiles for all post authors
    const authorIds = [...new Set(posts.map(post => post.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role')
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
        const commentCount = await (async () => {
          const { count, error } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          return error ? 0 : count || 0
        })()

        const profile = profileMap.get(post.author_id)
        return {
          ...post,
          author: {
            username: profile?.username || 'Anonymous',
            full_name: profile?.full_name || 'Anonymous',
            avatar_url: profile?.avatar_url || '',
            role: profile?.role || 'user'
          },
          comment_count: commentCount,
          user_vote: userVotesMap.get(post.id) || 0,
          vote_score: post.vote_score,
          is_pinned: post.          is_pinned
        }
      })
    )

    return NextResponse.json({ posts: postsWithScores, totalPostsCount })
  } catch (error) {
    logger.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ??
               request.headers.get('x-real-ip') ??
               '127.0.0.1';
    const limit = 10; // 10 requests per 60 seconds
    const rateLimitResult = limiter.check(limit, ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const supabase = await createServerClient()
    const body = await request.json()

    // Validate incoming data with Zod
    const validationResult = createPostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { title, body: postBody, tags } = validationResult.data;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
        updated_at,
        vote_score
      `)
      .single()

    if (error) {
      logger.error('Error creating post', error)
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
    logger.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
