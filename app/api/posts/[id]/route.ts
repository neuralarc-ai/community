import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Post, Comment } from '@/app/types'
import { getVoteScore } from '@/app/lib/voteUtils'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id: postId } = await params

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch the post
    const { data: post, error: postError } = await supabase
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
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Fetch the post author profile
    const { data: postProfile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', post.author_id)
      .single()

    // Fetch all comments for this post (flat list)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        author_id,
        parent_comment_id,
        body,
        created_at
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Error fetching comments:', commentsError)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    // Fetch user votes if authenticated
    let userVotesMap = new Map<string, -1 | 0 | 1>()
    if (user) {
      const targetIds = [postId, ...comments.map(comment => comment.id)]
      const { data: userVotes } = await supabase
        .from('votes')
        .select('target_type, target_id, value')
        .eq('user_id', user.id)
        .in('target_id', targetIds)

      userVotesMap = new Map(
        userVotes?.map(vote => [`${vote.target_type}:${vote.target_id}`, vote.value as -1 | 1]) || []
      )
    }

    // Calculate vote scores for post and comments
    const [postVoteScore, commentVoteScores] = await Promise.all([
      getVoteScore('post', postId),
      Promise.all(
        comments.map(comment => getVoteScore('comment', comment.id))
      )
    ])

    // Fetch profiles for all comment authors
    const authorIds = [...new Set(comments.map(comment => comment.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', authorIds)

    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || [])

    // Build the comment tree structure
    const commentMap = new Map<string, Comment & { replies: Comment[] }>()
    const rootComments: (Comment & { replies: Comment[] })[] = []

    // Initialize comment map
    comments.forEach((comment, index) => {
      const profile = profileMap.get(comment.author_id)
      commentMap.set(comment.id, {
        ...comment,
        author: {
          username: profile?.username || 'Anonymous',
          full_name: profile?.full_name || 'Anonymous',
          avatar_url: profile?.avatar_url || ''
        },
        vote_score: commentVoteScores[index],
        user_vote: userVotesMap.get(`comment:${comment.id}`) || 0,
        replies: []
      })
    })

    // Build the tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    const postWithDetails: Post & { comments: Comment[], user_vote?: number } = {
      ...post,
      author: {
        username: postProfile?.username || 'Anonymous',
        full_name: postProfile?.full_name || 'Anonymous',
        avatar_url: postProfile?.avatar_url || ''
      },
      vote_score: postVoteScore,
      user_vote: userVotesMap.get(`post:${postId}`) || 0,
      comments: rootComments
    }

    return NextResponse.json(postWithDetails)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id: postId } = await params

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check post ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts' },
        { status: 403 }
      )
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Error deleting post:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
