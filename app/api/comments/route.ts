import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Comment } from '@/app/types'
import { awardFlux } from '@/lib/flux'

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

    const { post_id, body: commentBody, parent_comment_id } = body

    if (!post_id || !commentBody) {
      return NextResponse.json(
        { error: 'Post ID and body are required' },
        { status: 400 }
      )
    }

    // Verify the post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // If parent_comment_id is provided, verify it exists and belongs to the same post
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, post_id')
        .eq('id', parent_comment_id)
        .eq('post_id', post_id)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found or does not belong to this post' },
          { status: 400 }
        )
      }
    }

    // Create the comment
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        author_id: user.id,
        parent_comment_id: parent_comment_id || null,
        body: commentBody
      })
      .select(`
        id,
        post_id,
        author_id,
        parent_comment_id,
        body,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Fetch the author profile separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Award flux points for creating a comment
    const fluxAwardResult = await awardFlux(user.id, 'COMMENT')
    console.log('Flux award result for comment creation:', fluxAwardResult)

    const commentWithAuthor: Comment = {
      ...newComment,
      author: {
        username: profile?.username || 'Anonymous',
        full_name: profile?.full_name || 'Anonymous',
        avatar_url: profile?.avatar_url || ''
      },
      vote_score: 0
    }

    return NextResponse.json(commentWithAuthor, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
