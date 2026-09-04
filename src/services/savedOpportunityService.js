const SAVED_KEY = 'edusearch-saved-opportunities'

export function getSavedOpportunityIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || [] } catch { return [] }
}

export function toggleSavedOpportunity(id) {
  const saved = getSavedOpportunityIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  return next
}
