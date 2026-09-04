import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Auth from './pages/Auth'
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
import { defaultProfile, getAuthenticatedProfile, getProfile, saveProfile } from './services/profileService'
import { AuthContext, getCurrentSession, onAuthStateChange, setActiveUser, signOut } from './services/authService'
import { supabaseConfigured } from './lib/supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(supabaseConfigured)
  const [profile, setProfile] = useState(() => getProfile() || defaultProfile)

  useEffect(() => {
    if (!supabaseConfigured) return undefined
    let mounted = true
    getCurrentSession().then((nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setActiveUser(nextSession?.user)
      setAuthLoading(false)
      if (nextSession) getAuthenticatedProfile().then((nextProfile) => nextProfile && mounted && setProfile(nextProfile))
    }).catch(() => {
      if (mounted) setAuthLoading(false)
    })
    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession)
      setActiveUser(nextSession?.user)
      if (nextSession) getAuthenticatedProfile().then((nextProfile) => nextProfile && setProfile(nextProfile))
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const handleSave = (nextProfile) => setProfile(saveProfile(nextProfile))
  const authValue = useMemo(() => ({ configured: supabaseConfigured, loading: authLoading, session, user: session?.user || null, signOut }), [authLoading, session])
  return <BrowserRouter><AuthContext.Provider value={authValue}><Layout profile={profile}><Routes><Route path="/" element={<Landing profile={profile} />} /><Route path="/auth" element={<Auth />} /><Route element={<ProtectedRoute />}><Route path="/profile" element={<Profile profile={profile} onSave={handleSave} />} /><Route path="/dashboard" element={<Dashboard profile={profile} />} /></Route><Route path="/discover" element={<Discover profile={profile} />} /><Route path="/colleges" element={<Colleges />} /><Route path="/jobs" element={<Jobs />} /><Route path="/internships" element={<Internships />} /><Route path="/explore" element={<Explore />} /><Route path="/map" element={<Map />} /><Route path="/paths" element={<Paths />} /><Route path="/opportunity/:id" element={<OpportunityDetails />} /><Route path="/college/:id" element={<CollegeDetails />} /></Routes></Layout></AuthContext.Provider></BrowserRouter>
}
