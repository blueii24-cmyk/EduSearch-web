import { createContext, useContext } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

let activeUserId = null

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase authentication is not configured.')
  const { data, error } = await supabase.auth.signUp({ email, password })
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
  const { error } = await supabase.auth.signOut()
  if (error) throw error
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
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
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
