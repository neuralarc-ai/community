import { createServerClient } from '@/app/lib/supabaseServerClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { postId, isPinned } = await request.json();
    console.log('Pin request received:', { postId, isPinned });
    const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('User not authenticated');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    console.log('Profile check failed:', { profileError, role: profile?.role });
    const errorMessage = profileError?.message || 'Forbidden: Not an admin';
    return NextResponse.json({ error: errorMessage }, { status: 403 });
  }

  // If we're pinning a post, unpin all other posts first
  if (isPinned) {
    const { error: unpinError } = await supabase
      .from('posts')
      .update({ is_pinned: false })
      .neq('id', postId);

    if (unpinError) {
      console.error('Error unpinning other posts:', unpinError.message || unpinError);
      const errorMessage = unpinError.message || 'Unknown error during unpinning';
      console.log('Returning unpin error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ is_pinned: isPinned })
    .eq('id', postId)
    .select();

  if (error) {
    console.error('Error pinning/unpinning post:', error.message || error);
    const errorMessage = error.message || 'Unknown error during pinning/unpinning';
    console.log('Returning pin/unpin error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

    console.log('Pin operation successful, returning data:', data?.[0]);
    return NextResponse.json(data?.[0] || {});
  } catch (serverError) {
    console.error('Unexpected server error in pin endpoint:', serverError);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
