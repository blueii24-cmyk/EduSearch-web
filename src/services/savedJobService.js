const SAVED_JOBS_KEY = 'edusearch-saved-jobs'

export function getSavedJobIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY)) || [] } catch { return [] }
}

export function toggleSavedJob(id) {
  const saved = getSavedJobIds()
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next))
  syncSavedJob(id, next.includes(id))
  return next
}

async function syncSavedJob(entityId, isSaved) {
  if (!supabase || !isUuid(entityId)) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (isSaved) await supabase.from('saved_items').upsert({ user_id: user.id, entity_type: 'job', entity_id: entityId })
  else await supabase.from('saved_items').delete().match({ user_id: user.id, entity_type: 'job', entity_id: entityId })
}
import { isUuid, supabase } from '../lib/supabaseClient'
