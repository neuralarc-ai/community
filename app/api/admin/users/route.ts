import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

export async function GET(request: NextRequest) {
  let response: NextResponse<any> = NextResponse.json({});
  response = setCorsHeaders(request, response);
  try {
    const supabase = await createServerClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response = setCorsHeaders(request, response);
      return response;
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      response = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      response = setCorsHeaders(request, response);
      return response;
    }

    // Fetch all profiles and count them
    const { data: users, count: totalUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role, created_at, total_flux', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      response = NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      response = setCorsHeaders(request, response);
      return response;
    }

    let successResponse: NextResponse<any> = NextResponse.json({ users, totalUsers });
    successResponse = setCorsHeaders(request, successResponse);
    return successResponse;
  } catch (error) {
    console.error('Server error:', error)
    let errorResponse: NextResponse<any> = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    errorResponse = setCorsHeaders(request, errorResponse);
    return errorResponse;
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
