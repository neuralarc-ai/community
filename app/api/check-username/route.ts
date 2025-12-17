import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking username:', error)
      return NextResponse.json({ error: 'Error checking username availability' }, { status: 500 })
    }

    const exists = !!data

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Unexpected error in check-username API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
