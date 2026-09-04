import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
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
import { defaultProfile, getProfile, saveProfile } from './services/profileService'

export default function App() {
  const [profile, setProfile] = useState(() => getProfile() || defaultProfile)
  const handleSave = (nextProfile) => setProfile(saveProfile(nextProfile))
  return <BrowserRouter><Layout profile={profile}><Routes><Route path="/" element={<Landing profile={profile} />} /><Route path="/profile" element={<Profile profile={profile} onSave={handleSave} />} /><Route path="/dashboard" element={<Dashboard profile={profile} />} /><Route path="/discover" element={<Discover profile={profile} />} /><Route path="/colleges" element={<Colleges />} /><Route path="/jobs" element={<Jobs />} /><Route path="/internships" element={<Internships />} /><Route path="/explore" element={<Explore />} /><Route path="/map" element={<Map />} /><Route path="/paths" element={<Paths />} /><Route path="/opportunity/:id" element={<OpportunityDetails />} /><Route path="/college/:id" element={<CollegeDetails />} /></Routes></Layout></BrowserRouter>
}
