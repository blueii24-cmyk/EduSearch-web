import { getStudentId } from './feedbackService'
import { getActiveUserId } from './authService'
import { isUuid, supabase } from '../lib/supabaseClient'

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
const getStorageKey = () => getActiveUserId() ? `${INTERACTIONS_KEY}-${getActiveUserId()}` : INTERACTIONS_KEY

function getStored() {
  try {
    const value = JSON.parse(localStorage.getItem(getStorageKey()))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function recordInteraction(eventType, { entityId = null, entityType = null, metadata = {} } = {}) {
  const studentId = getActiveUserId() || getStudentId()
  const record = { id: `${studentId}-${Date.now()}-${eventType}`, studentId, eventType, entityId, entityType, metadata, timestamp: new Date().toISOString() }
  localStorage.setItem(getStorageKey(), JSON.stringify([...getStored(), record]))
  syncInteraction(record)
  return record
}

async function syncInteraction(record) {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('interactions').insert({
    user_id: user.id,
    student_id: record.studentId,
    event_type: record.eventType,
    entity_type: record.entityType,
    entity_id: isUuid(record.entityId) ? record.entityId : null,
    metadata: record.metadata
  })
  if (error) console.error('Could not sync interaction to Supabase.', error)
}

export function getAllInteractions() {
  return getStored()
}

export function clearInteractionData() {
  localStorage.removeItem(getStorageKey())
}
