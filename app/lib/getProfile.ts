import { createClient } from './supabaseClient'

export async function getCurrentUserProfile(userId?: string) {
  const supabase = createClient()

  let targetUserId = userId;
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    targetUserId = user.id;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, avatar_url, total_flux, posts_count, comments_count, conclaves_attended')
    .eq('id', targetUserId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error
  }

  return {
    ...profile,
    email: profile.email,
  }
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return !!data
}

export async function createProfile(profileData: {
  id: string;
  full_name: string;
  username: string;
  dob: string;
}) {
  const supabase = createClient()

  // Get the current user's email from auth.users
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      ...profileData,
      email: user.email, // Include email from auth.users
      role: 'user'
    })
    .select()
    .single()

  if (error) throw error
  return data
}
