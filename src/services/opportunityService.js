import { colleges } from '../data/colleges'
import { jobs } from '../data/jobs'
import { internships } from '../data/internships'

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
