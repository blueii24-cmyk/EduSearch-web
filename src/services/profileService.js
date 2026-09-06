export const PROFILE_STORAGE_KEY = 'edusearch-profile'
import { supabase } from '../lib/supabaseClient'
import { getActiveUserId } from './authService'

export const emptyProfile = {
  education: '',
  year: '',
  percentage: '',
  skills: [],
  interests: [],
  location: ''
}

export const defaultProfile = emptyProfile

function getStorageKey(userId = getActiveUserId()) {
  return userId ? `${PROFILE_STORAGE_KEY}-${userId}` : PROFILE_STORAGE_KEY
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey())) || emptyProfile
  } catch {
    return emptyProfile
  }
}

export async function getAuthenticatedProfile() {
  if (!supabase) return getProfile()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  return data ? normalizeProfile(data) : null
}

export async function saveProfile(profile) {
  if (!supabase) {
    localStorage.setItem(getStorageKey(), JSON.stringify(profile))
    return profile
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    return profile
  }
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    education: profile.education,
    year: profile.year,
    percentage: Number(profile.percentage || 0),
    location: profile.location,
    skills: profile.skills || [],
    interests: profile.interests || [],
    updated_at: new Date().toISOString()
  })
  if (error) throw error
  return profile
}

export const updateProfile = saveProfile

export async function getProfileFromSupabase() {
  return getAuthenticatedProfile()
}

function normalizeProfile(data) {
  return {
    education: data.education || emptyProfile.education,
    year: data.year || emptyProfile.year,
    percentage: String(data.percentage ?? ''),
    location: data.location || emptyProfile.location,
    skills: Array.isArray(data.skills) ? data.skills : [],
    interests: Array.isArray(data.interests) ? data.interests : []
  }
}
