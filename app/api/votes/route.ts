import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

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

    const { target_type, target_id, value } = body

    // Validate input
    if (!target_type || !target_id || (value !== -1 && value !== 1)) {
      return NextResponse.json(
        { error: 'Invalid vote data. Required: target_type, target_id, value (-1 or 1)' },
        { status: 400 }
      )
    }

    if (!['post', 'comment'].includes(target_type)) {
      return NextResponse.json(
        { error: 'target_type must be "post" or "comment"' },
        { status: 400 }
      )
    }

    // Verify the target exists
    const targetTable = target_type === 'post' ? 'posts' : 'comments'
    const { data: target, error: targetError } = await supabase
      .from(targetTable)
      .select('id')
      .eq('id', target_id)
      .single()

    if (targetError || !target) {
      return NextResponse.json(
        { error: `${target_type} not found` },
        { status: 404 }
      )
    }

    // Check if user already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id, value')
      .eq('user_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing vote:', voteCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing vote' },
        { status: 500 }
      )
    }

    let result;

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote exists - remove it (toggle off)
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          console.error('Error removing vote:', deleteError)
          return NextResponse.json(
            { error: 'Failed to remove vote' },
            { status: 500 }
          )
        }

        result = { action: 'removed', previous_value: existingVote.value }
      } else {
        // Opposite vote exists - update it
        const { error: updateError } = await supabase
          .from('votes')
          .update({ value })
          .eq('id', existingVote.id)

        if (updateError) {
          console.error('Error updating vote:', updateError)
          return NextResponse.json(
            { error: 'Failed to update vote' },
            { status: 500 }
          )
        }

        result = { action: 'updated', previous_value: existingVote.value, new_value: value }
      }
    } else {
      // No existing vote - create new one
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          target_type,
          target_id,
          value
        })

      if (insertError) {
        console.error('Error creating vote:', insertError)
        return NextResponse.json(
          { error: 'Failed to create vote' },
          { status: 500 }
        )
      }

      result = { action: 'created', value }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
