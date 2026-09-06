import { getActiveUserId } from './authService'

const FEEDBACK_KEY = 'edusearch-feedback'
const STUDENT_ID_KEY = 'edusearch_student_id'
const getStorageKey = (key) => getActiveUserId() ? `${key}-${getActiveUserId()}` : key

function read(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function getStudentId() {
  const authenticatedId = getActiveUserId()
  if (authenticatedId) return authenticatedId
  const existing = localStorage.getItem(getStorageKey(STUDENT_ID_KEY))
  if (existing) return existing
  const id = `student-${Date.now()}`
  localStorage.setItem(getStorageKey(STUDENT_ID_KEY), id)
  return id
}

export function getAllFeedback() {
  return read(getStorageKey(FEEDBACK_KEY))
}

export function hasSubmittedFeedback(opportunityId, opportunityType) {
  const studentId = getStudentId()
  return getAllFeedback().some((item) => item.studentId === studentId && item.opportunityId === opportunityId && item.opportunityType === opportunityType)
}

export function saveFeedback({ opportunityId, opportunityType, feedbackValue, reasons, comment = '' }) {
  const record = {
    id: `${getStudentId()}-${opportunityType}-${opportunityId}-${Date.now()}`,
    studentId: getStudentId(),
    opportunityId,
    opportunityType,
    feedbackValue,
    reasons,
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  }

  localStorage.setItem(getStorageKey(FEEDBACK_KEY), JSON.stringify([...getAllFeedback(), record]))
  submitFeedback(record)
  return record
}

export function saveGeneralFeedback({ rating, category, comment = '' }) {
  const record = { id: `${getStudentId()}-general-${Date.now()}`, studentId: getStudentId(), type: 'general', rating, category, comment: comment.trim(), createdAt: new Date().toISOString() }
  localStorage.setItem(getStorageKey(FEEDBACK_KEY), JSON.stringify([...getAllFeedback(), record]))
  submitFeedback(record)
  return record
}

export async function submitFeedback(record) {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('feedback').insert({
    user_id: user.id,
    student_id: getActiveUserId() || record.studentId,
    entity_type: record.opportunityType || null,
    entity_id: isUuid(record.opportunityId) ? record.opportunityId : null,
    feedback_type: record.type || 'opportunity',
    rating: record.rating || record.feedbackValue,
    reasons: record.reasons || [],
    comment: record.comment || ''
  }).select().single()
  if (error) console.error('Could not sync feedback to Supabase.', error)
  return data
}

export async function getMyFeedback() {
  if (!supabase) return getAllFeedback()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return getAllFeedback()
  const { data, error } = await supabase.from('feedback').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export function getAllInteractions() {
  try {
    const value = JSON.parse(localStorage.getItem(getStorageKey('edusearch-interactions')))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function clearFeedbackData() {
  localStorage.removeItem(getStorageKey(FEEDBACK_KEY))
  localStorage.removeItem(getStorageKey('edusearch-interactions'))
  localStorage.removeItem(getStorageKey(STUDENT_ID_KEY))
}
import { isUuid, supabase } from '../lib/supabaseClient'
