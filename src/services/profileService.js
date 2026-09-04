export const PROFILE_STORAGE_KEY = 'edusearch-profile'
import { supabase } from '../lib/supabaseClient'

export const defaultProfile = {
  education: 'BCA',
  year: '2nd Year',
  percentage: '78',
  skills: ['HTML', 'CSS', 'JavaScript'],
  interests: ['Web Development'],
  location: 'Panaji, Goa'
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || defaultProfile
  } catch {
    return defaultProfile
  }
}

export async function getAuthenticatedProfile() {
  if (!supabase) return getProfile()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  return data ? normalizeProfile(data) : null
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  syncProfile(profile)
  return profile
}

export const updateProfile = saveProfile

export async function getProfileFromSupabase() {
  return getAuthenticatedProfile()
}

function normalizeProfile(data) {
  return {
    education: data.education || defaultProfile.education,
    year: data.year || defaultProfile.year,
    percentage: String(data.percentage ?? ''),
    location: data.location || defaultProfile.location,
    skills: Array.isArray(data.skills) ? data.skills : [],
    interests: Array.isArray(data.interests) ? data.interests : []
  }
}

async function syncProfile(profile) {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
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
  if (error) console.error('Could not sync profile to Supabase.', error)
}
