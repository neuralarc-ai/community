import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { getCurrentUserProfile } from '@/app/lib/getProfile';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

export async function GET(request: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();

    if (!profile) {
      const response = NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      return setCorsHeaders(request, response);
    }

    const successResponse = NextResponse.json(profile);
    return setCorsHeaders(request, successResponse);
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return setCorsHeaders(request, errorResponse);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return setCorsHeaders(request, response);
    }

    const { full_name, username, bio } = await request.json();

    const updateData: { [key: string]: any } = {
      full_name,
      username,
      email: user.email, // Keep email in sync with auth.users
      updated_at: new Date().toISOString(),
    };

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    const successResponse = NextResponse.json(data);
    return setCorsHeaders(request, successResponse);
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}

