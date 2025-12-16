import { createClient } from './supabaseClient'

export async function getCurrentUserProfile() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error
  }

  return profile
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

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      ...profileData,
      role: 'user'
    })
    .select()
    .single()

  if (error) throw error
  return data
}
