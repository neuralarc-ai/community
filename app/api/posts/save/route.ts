import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { postId } = await request.json()

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // 2. Check if already saved
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingSave) {
      // 3. If exists -> Unsave (Delete)
      const { error: deleteError } = await supabase
        .from('saved_posts')
        .delete()
        .eq('id', existingSave.id)

      if (deleteError) throw deleteError

      return NextResponse.json({ saved: false })
    } else {
      // 4. If not exists -> Save (Insert)
      const { error: insertError } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId
        })

      if (insertError) throw insertError

      return NextResponse.json({ saved: true })
    }

  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

