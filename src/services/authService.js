import { createContext, useContext } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

let activeUserId = null

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase authentication is not configured.')
  const emailRedirectTo = `${window.location.origin}/auth/callback`
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo }
  })
  if (error) throw error
  return data
}

export async function resendConfirmation(email) {
  if (!supabase) throw new Error('Supabase authentication is not configured.')
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase authentication is not configured.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  const currentUserId = getActiveUserId()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  setActiveUser(null)
  if (currentUserId) {
    localStorage.removeItem(`edusearch-profile-${currentUserId}`)
    localStorage.removeItem(`edusearch-feedback-${currentUserId}`)
    localStorage.removeItem(`edusearch-interactions-${currentUserId}`)
    localStorage.removeItem(`edusearch_student_id-${currentUserId}`)
    localStorage.removeItem(`edusearch-saved-opportunities-${currentUserId}`)
    localStorage.removeItem(`edusearch-saved-jobs-${currentUserId}`)
    localStorage.removeItem(`edusearch-saved-colleges-${currentUserId}`)
  }
}

export async function getCurrentSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session))
  return () => data.subscription.unsubscribe()
}

export function setActiveUser(user) {
  activeUserId = user?.id || null
}

export function getActiveUserId() {
  return activeUserId
}

export const AuthContext = createContext({
  configured: supabaseConfigured,
  loading: supabaseConfigured,
  session: null,
  user: null,
  signOut
})

export function useAuth() {
  return useContext(AuthContext)
}
