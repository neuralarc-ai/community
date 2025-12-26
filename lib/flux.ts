import { createServerClient } from '@/app/lib/supabaseServerClient';

type ActionType = 'POST' | 'COMMENT' | 'CONCLAVE_JOIN';

export async function awardFlux(userId: string, action: ActionType) {
  const supabase = await createServerClient()
  const fluxWeights = {
    POST: 10,
    COMMENT: 5,
    CONCLAVE_JOIN: 20,
  };

  const amount = fluxWeights[action];
  const action_type = action; // Use the action type directly as it matches the Supabase ENUM

  const { data, error } = await supabase.from('flux_logs').insert({
    user_id: userId,
    amount,
    action_type,
  });

  if (error) {
    console.error('Error awarding flux:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

