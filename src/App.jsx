import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import Discover from './pages/Discover'
import Colleges from './pages/Colleges'
import Jobs from './pages/Jobs'
import Internships from './pages/Internships'
import Map from './pages/Map'
import Explore from './pages/Explore'
import Dashboard from './pages/Dashboard'
import Paths from './pages/Paths'
import OpportunityDetails from './pages/OpportunityDetails'
import CollegeDetails from './pages/CollegeDetails'
import { emptyProfile, getAuthenticatedProfile, getProfile, saveProfile } from './services/profileService'
import { AuthContext, getActiveUserId, getCurrentSession, onAuthStateChange, setActiveUser, signOut } from './services/authService'
import { supabaseConfigured } from './lib/supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(supabaseConfigured)
  const [profile, setProfile] = useState(emptyProfile)
  const profileRequest = useRef(0)

  useEffect(() => {
    if (!supabaseConfigured) {
      setProfile(getProfile())
      return undefined
    }
    let mounted = true
    const loadProfile = async (nextSession) => {
      const requestId = ++profileRequest.current
      if (!nextSession) {
        if (requestId === profileRequest.current) setProfile(getProfile())
        return
      }
      const nextProfile = await getAuthenticatedProfile()
      if (mounted && requestId === profileRequest.current) setProfile(nextProfile || emptyProfile)
    }
    getCurrentSession().then(async (nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setActiveUser(nextSession?.user)
      await loadProfile(nextSession)
      if (mounted) setAuthLoading(false)
    }).catch((error) => {
      if (mounted) {
        console.error('EduSearch could not restore the Supabase session.', error)
        setAuthLoading(false)
      }
    })
    const unsubscribe = onAuthStateChange((event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      const previousUserId = getActiveUserId()
      setActiveUser(nextSession?.user)
      setAuthLoading(Boolean(nextSession))
      if (event === 'SIGNED_OUT') {
        profileRequest.current += 1
        setProfile(emptyProfile)
        setAuthLoading(false)
        if (previousUserId) {
          localStorage.removeItem(`edusearch-profile-${previousUserId}`)
          localStorage.removeItem(`edusearch-feedback-${previousUserId}`)
          localStorage.removeItem(`edusearch-interactions-${previousUserId}`)
          localStorage.removeItem(`edusearch_student_id-${previousUserId}`)
          localStorage.removeItem(`edusearch-saved-opportunities-${previousUserId}`)
          localStorage.removeItem(`edusearch-saved-jobs-${previousUserId}`)
          localStorage.removeItem(`edusearch-saved-colleges-${previousUserId}`)
        }
        return
      }
      loadProfile(nextSession)
        .catch((error) => console.error('EduSearch could not load the authenticated profile.', error))
        .finally(() => mounted && setAuthLoading(false))
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const handleSave = async (nextProfile) => {
    const savedProfile = await saveProfile(nextProfile)
    setProfile(savedProfile)
  }
  const authValue = useMemo(() => ({ configured: supabaseConfigured, loading: authLoading, session, user: session?.user || null, signOut }), [authLoading, session])
  return <BrowserRouter><AuthContext.Provider value={authValue}><Layout profile={profile}><Routes><Route path="/" element={<Landing profile={profile} />} /><Route path="/auth" element={<Auth />} /><Route path="/login" element={<Auth />} /><Route path="/auth/callback" element={<AuthCallback />} /><Route element={<ProtectedRoute />}><Route path="/profile" element={<Profile profile={profile} onSave={handleSave} />} /><Route path="/dashboard" element={<Dashboard profile={profile} />} /></Route><Route path="/discover" element={<Discover profile={profile} />} /><Route path="/colleges" element={<Colleges profile={profile} />} /><Route path="/jobs" element={<Jobs profile={profile} />} /><Route path="/internships" element={<Internships />} /><Route path="/explore" element={<Explore profile={profile} />} /><Route path="/map" element={<Map />} /><Route path="/paths" element={<Paths />} /><Route path="/opportunity/:id" element={<OpportunityDetails profile={profile} />} /><Route path="/college/:id" element={<CollegeDetails profile={profile} />} /></Routes></Layout></AuthContext.Provider></BrowserRouter>
}
