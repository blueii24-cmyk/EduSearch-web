export const PROFILE_STORAGE_KEY = 'edusearch-profile'

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

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  return profile
}
