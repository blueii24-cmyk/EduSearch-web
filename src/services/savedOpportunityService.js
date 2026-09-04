const SAVED_KEY = 'edusearch-saved-opportunities'

export function getSavedOpportunityIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || [] } catch { return [] }
}

export function toggleSavedOpportunity(id) {
  const saved = getSavedOpportunityIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  syncSavedItem(id, next.includes(id))
  return next
}

async function syncSavedItem(entityId, isSaved) {
  if (!supabase || !isUuid(entityId)) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (isSaved) await supabase.from('saved_items').upsert({ user_id: user.id, entity_type: 'internship', entity_id: entityId })
  else await supabase.from('saved_items').delete().match({ user_id: user.id, entity_type: 'internship', entity_id: entityId })
}
import { isUuid, supabase } from '../lib/supabaseClient'
