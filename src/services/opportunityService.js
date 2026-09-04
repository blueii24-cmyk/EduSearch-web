import { colleges } from '../data/colleges'
import { jobs } from '../data/jobs'
import { internships } from '../data/internships'
import { supabase } from '../lib/supabaseClient'

export const opportunities = [...internships, ...jobs, ...colleges]

export function getOpportunitiesByType(type = 'All opportunities') {
  if (type === 'All opportunities' || type === 'All') return opportunities
  return opportunities.filter((item) => item.type === type.slice(0, -1) || item.type === type)
}

export function searchOpportunities(query = '') {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return opportunities
  return opportunities.filter((item) => [item.title, item.organization, item.location, item.category, ...(item.skills || []), ...(item.courses || [])].join(' ').toLowerCase().includes(normalized))
}

export function getOpportunityById(id) {
  return opportunities.find((item) => item.id === id)
}

export function getDistanceKm(item) {
  return item.distanceKm ?? Number.parseFloat(item.distance)
}

export async function fetchRemoteOpportunities() {
  if (!supabase) return opportunities
  const [collegeResult, jobResult, internshipResult] = await Promise.all([
    supabase.from('colleges').select('*'),
    supabase.from('jobs').select('*'),
    supabase.from('internships').select('*')
  ])
  const failure = [collegeResult, jobResult, internshipResult].find((result) => result.error)
  if (failure) throw failure.error
  return [
    ...(collegeResult.data || []).map((item) => ({ ...item, type: 'College', title: item.name, organization: item.name, coordinates: { lat: item.latitude, lng: item.longitude }, courses: item.courses || [], studyLevels: item.study_levels || [], acceptedEducation: item.accepted_education || [], feesPerYear: item.fees_per_year, entranceRequired: item.entrance_required, applicationUrl: item.application_url })),
    ...(jobResult.data || []).map((item) => ({ ...item, type: 'Job', organization: item.company, requiredSkills: item.required_skills || [], preferredSkills: item.preferred_skills || [], educationRequirements: item.education_requirements || [], fresherFriendly: item.fresher_friendly, jobType: item.job_type, applicationUrl: item.application_url, coordinates: { lat: item.latitude, lng: item.longitude } })),
    ...(internshipResult.data || []).map((item) => ({ ...item, type: 'Internship', organization: item.company, requiredSkills: item.required_skills || [], preferredSkills: item.preferred_skills || [], educationRequirements: item.education_requirements || [], fresherFriendly: item.fresher_friendly, stipend: item.stipend, applicationUrl: item.application_url, coordinates: { lat: item.latitude, lng: item.longitude } }))
  ]
}
