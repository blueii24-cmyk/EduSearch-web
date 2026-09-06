import { getActiveUserId } from './authService'

const SAVED_KEY = 'edusearch-saved-opportunities'
const getStorageKey = () => getActiveUserId() ? `${SAVED_KEY}-${getActiveUserId()}` : SAVED_KEY

export function getSavedOpportunityIds() {
  try { return JSON.parse(localStorage.getItem(getStorageKey())) || [] } catch { return [] }
}

export function toggleSavedOpportunity(id) {
  const saved = getSavedOpportunityIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(getStorageKey(), JSON.stringify(next))
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
