import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { env } from 'process';

const DEFAULT_AVATAR_URL = '/images/default-avatar.jpg'; // Path to your default avatar image

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();

  try {
    let avatarUrl: string;

    // Check if the id is a full URL (starts with http/https)
    if (id.startsWith('http://') || id.startsWith('https://')) {
      // Direct URL provided - fix malformed URLs
      avatarUrl = id.replace('https:/', 'https://');
    } else {
      // User ID provided - fetch from profile
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', id)
        .single();

      avatarUrl = data?.avatar_url || DEFAULT_AVATAR_URL;

      // If avatarUrl is from Supabase storage, ensure it's correctly formatted
      if (avatarUrl.includes('supabase.co') && avatarUrl.startsWith('https:/')) {
        // Fix malformed URLs that start with https:/ instead of https://
        avatarUrl = avatarUrl.replace('https:/', 'https://');
      }
    }

    // Fetch the image from the determined URL
    console.log(`Attempting to fetch avatar from: ${avatarUrl}`);
    const imageResponse = await fetch(avatarUrl);

    if (!imageResponse.ok) {
      console.warn(`Failed to fetch avatar from ${avatarUrl}. Status: ${imageResponse.status}`);
      // Fallback to default avatar if fetching the user's avatar fails
      const defaultImageResponse = await fetch(DEFAULT_AVATAR_URL);
      if (defaultImageResponse.ok) {
        return new NextResponse(defaultImageResponse.body, {
          headers: {
            'Content-Type': defaultImageResponse.headers.get('Content-Type') || 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
      throw new Error('Failed to fetch default avatar');
    }

    // Return the fetched image
    return new NextResponse(imageResponse.body, {
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    // On any error, try to serve the default avatar
    try {
      const defaultImageResponse = await fetch(DEFAULT_AVATAR_URL);
      if (defaultImageResponse.ok) {
        return new NextResponse(defaultImageResponse.body, {
          headers: {
            'Content-Type': defaultImageResponse.headers.get('Content-Type') || 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch (e) {
      console.error('Failed to serve default avatar:', e);
    }
    return new NextResponse('Failed to fetch avatar', { status: 500 });
  }
}

