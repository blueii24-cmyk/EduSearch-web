const SAVED_COLLEGES_KEY = 'edusearch-saved-colleges'

export function getSavedCollegeIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_COLLEGES_KEY)) || [] } catch { return [] }
}

export function toggleSavedCollege(id) {
  const saved = getSavedCollegeIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(SAVED_COLLEGES_KEY, JSON.stringify(next))
  return next
}
