import { getActiveUserId } from './authService'

const SAVED_COLLEGES_KEY = 'edusearch-saved-colleges'
const getStorageKey = () => getActiveUserId() ? `${SAVED_COLLEGES_KEY}-${getActiveUserId()}` : SAVED_COLLEGES_KEY

export function getSavedCollegeIds() {
  try { return JSON.parse(localStorage.getItem(getStorageKey())) || [] } catch { return [] }
}

export function toggleSavedCollege(id) {
  const saved = getSavedCollegeIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(getStorageKey(), JSON.stringify(next))
  syncSavedCollege(id, next.includes(id))
  return next
}

async function syncSavedCollege(entityId, isSaved) {
  if (!supabase || !isUuid(entityId)) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (isSaved) await supabase.from('saved_items').upsert({ user_id: user.id, entity_type: 'college', entity_id: entityId })
  else await supabase.from('saved_items').delete().match({ user_id: user.id, entity_type: 'college', entity_id: entityId })
}
import { isUuid, supabase } from '../lib/supabaseClient'
