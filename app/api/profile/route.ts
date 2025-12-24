import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { getCurrentUserProfile } from '@/app/lib/getProfile';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';
import rateLimit from '@/app/lib/rateLimit';

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
  // Apply rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ??
             request.headers.get('x-real-ip') ??
             '127.0.0.1';
  const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
  const limit = 10; // 10 requests per 60 seconds
  const rateLimitResult = limiter.check(limit, ip);

  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      { error: 'Too Many Requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
    return setCorsHeaders(request, response);
  }

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

