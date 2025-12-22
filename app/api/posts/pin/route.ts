import { createServerClient } from '@/app/lib/supabaseServerClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { postId, isPinned } = await request.json();
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
  }

  // If we're pinning a post, unpin all other posts first
  if (isPinned) {
    const { error: unpinError } = await supabase
      .from('posts')
      .update({ is_pinned: false })
      .neq('id', postId);

    if (unpinError) {
      console.error('Error unpinning other posts:', unpinError);
      return NextResponse.json({ error: unpinError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ is_pinned: isPinned })
    .eq('id', postId)
    .select();

  if (error) {
    console.error('Error pinning/unpinning post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
