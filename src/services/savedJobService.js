const SAVED_JOBS_KEY = 'edusearch-saved-jobs'

export function getSavedJobIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY)) || [] } catch { return [] }
}

export function toggleSavedJob(id) {
  const saved = getSavedJobIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next))
  return next
}
