import { getStudentId } from './feedbackService'

export const INTERACTION_EVENTS = {
  OPPORTUNITY_VIEWED: 'OPPORTUNITY_VIEWED',
  OPPORTUNITY_SAVED: 'OPPORTUNITY_SAVED',
  OPPORTUNITY_UNSAVED: 'OPPORTUNITY_UNSAVED',
  APPLY_CLICKED: 'APPLY_CLICKED',
  COLLEGE_VIEWED: 'COLLEGE_VIEWED',
  COLLEGE_SAVED: 'COLLEGE_SAVED',
  COLLEGE_UNSAVED: 'COLLEGE_UNSAVED',
  JOB_VIEWED: 'JOB_VIEWED',
  INTERNSHIP_VIEWED: 'INTERNSHIP_VIEWED',
  MAP_MARKER_SELECTED: 'MAP_MARKER_SELECTED',
  SEARCH_PERFORMED: 'SEARCH_PERFORMED',
  FILTER_USED: 'FILTER_USED'
}

const INTERACTIONS_KEY = 'edusearch-interactions'

function getStored() {
  try {
    const value = JSON.parse(localStorage.getItem(INTERACTIONS_KEY))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function recordInteraction(eventType, { entityId = null, entityType = null, metadata = {} } = {}) {
  const record = { id: `${getStudentId()}-${Date.now()}-${eventType}`, studentId: getStudentId(), eventType, entityId, entityType, metadata, timestamp: new Date().toISOString() }
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify([...getStored(), record]))
  return record
}

export function getAllInteractions() {
  return getStored()
}

export function clearInteractionData() {
  localStorage.removeItem(INTERACTIONS_KEY)
}
