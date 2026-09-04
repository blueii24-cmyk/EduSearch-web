import { colleges } from '../data/colleges'
import { supabase } from '../lib/supabaseClient'

export function getCollegeById(id) {
  return colleges.find((college) => college.id === id)
}

export function getCollegeEligibility(profile, college) {
  const educationMet = college.acceptedEducation.includes(profile?.education)
  const percentageMet = Number(profile?.percentage || 0) >= college.minimumPercentage
  const entranceNote = college.entranceRequired ? 'Entrance examination required' : null
  const reasons = []
  if (educationMet) reasons.push(`Your ${profile.education} qualification is accepted`)
  else reasons.push(`Required qualification: ${college.acceptedEducation.join(' or ')}`)
  if (percentageMet) reasons.push(`Your percentage meets the ${college.minimumPercentage}% minimum`)
  else reasons.push(`You need at least ${college.minimumPercentage}%`)
  if (entranceNote) reasons.push(entranceNote)
  let eligibilityStatus = 'notEligible'
  if (educationMet && percentageMet) eligibilityStatus = college.entranceRequired ? 'almost' : 'eligible'
  else if (educationMet || percentageMet) eligibilityStatus = 'almost'
  return { eligibilityStatus, educationMet, percentageMet, entranceRequired: college.entranceRequired, reasons }
}

export function searchColleges(query = '') {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return colleges
  return colleges.filter((college) => [college.name, college.location, college.area, college.category, ...college.courses, ...college.studyLevels].join(' ').toLowerCase().includes(normalized))
}

export async function fetchRemoteColleges() {
  if (!supabase) return colleges
  const { data, error } = await supabase.from('colleges').select('*')
  if (error) throw error
  return data
}
