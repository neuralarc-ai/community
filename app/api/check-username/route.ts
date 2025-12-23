import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      const response = NextResponse.json({ error: 'Username is required' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    if (username.length < 3) {
      const response = NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      const response = NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking username:', error)
      const response = NextResponse.json({ error: 'Error checking username availability' }, { status: 500 });
      return setCorsHeaders(request, response);
    }

    const exists = !!data

    const successResponse = NextResponse.json({ exists });
    return setCorsHeaders(request, successResponse);
  } catch (error) {
    console.error('Unexpected error in check-username API:', error)
    const errorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}