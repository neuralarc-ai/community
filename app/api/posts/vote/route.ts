import { createServerClient } from '@/app/lib/supabaseServerClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { postId, voteType } = await req.json();
  const supabase = await createServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const voteValue = voteType === 'up' ? 1 : -1;

  try {
    const { data: existingVote, error: fetchError } = await supabase
      .from('post_votes')
      .select('vote_value')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching existing vote:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingVote) {
      if (existingVote.vote_value === voteValue) {
        // Scenario B: Existing vote matches request - DELETE
        const { error: deleteError } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting vote:', deleteError);
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Vote removed' }, { status: 200 });
      } else {
        // Scenario C: Existing vote differs - UPDATE
        const { error: updateError } = await supabase
          .from('post_votes')
          .update({ vote_value: voteValue })
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Vote updated' }, { status: 200 });
      }
    } else {
      // Scenario A: No existing vote - INSERT
      const { error: insertError } = await supabase
        .from('post_votes')
        .insert({ post_id: postId, user_id: userId, vote_value: voteValue });

      if (insertError) {
        console.error('Error inserting vote:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      return NextResponse.json({ message: 'Vote recorded' }, { status: 201 });
    }
  } catch (error) {
    console.error('Unhandled error in vote API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

