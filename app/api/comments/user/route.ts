import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's comments with the associated post title
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        post:posts (
          id,
          title
        )
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching user comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

