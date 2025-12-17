import { createServerClient } from './supabaseServerClient';

export async function getVoteScore(targetType: 'post' | 'comment', targetId: string): Promise<number> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  if (error) {
    console.error('Error fetching vote score:', error);
    return 0;
  }

  return data.reduce((sum, vote) => sum + vote.value, 0);
}

export async function getUserVote(userId: string, targetType: 'post' | 'comment', targetId: string): Promise<-1 | 0 | 1> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('user_id', userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.value as -1 | 1;
}
