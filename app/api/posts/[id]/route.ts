import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { Post, Comment } from '@/app/types'
import { getVoteScore } from '@/app/lib/voteUtils'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id: postId } = await params

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
      .select('username, full_name')
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
      .select('id, username, full_name')
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
          full_name: profile?.full_name || 'Anonymous'
        },
        vote_score: commentVoteScores[index],
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

    const postWithDetails: Post & { comments: Comment[] } = {
      ...post,
      author: {
        username: postProfile?.username || 'Anonymous',
        full_name: postProfile?.full_name || 'Anonymous'
      },
      vote_score: postVoteScore,
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
