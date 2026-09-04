const FEEDBACK_KEY = 'edusearch-feedback'
const STUDENT_ID_KEY = 'edusearch_student_id'

function read(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function getStudentId() {
  const existing = localStorage.getItem(STUDENT_ID_KEY)
  if (existing) return existing
  const id = `student-${Date.now()}`
  localStorage.setItem(STUDENT_ID_KEY, id)
  return id
}

export function getAllFeedback() {
  return read(FEEDBACK_KEY)
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

  localStorage.setItem(FEEDBACK_KEY, JSON.stringify([...getAllFeedback(), record]))
  return record
}

export function saveGeneralFeedback({ rating, category, comment = '' }) {
  const record = { id: `${getStudentId()}-general-${Date.now()}`, studentId: getStudentId(), type: 'general', rating, category, comment: comment.trim(), createdAt: new Date().toISOString() }
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify([...getAllFeedback(), record]))
  return record
}

export function getAllInteractions() {
  try {
    const value = JSON.parse(localStorage.getItem('edusearch-interactions'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function clearFeedbackData() {
  localStorage.removeItem(FEEDBACK_KEY)
  localStorage.removeItem('edusearch-interactions')
  localStorage.removeItem('edusearch_student_id')
}
