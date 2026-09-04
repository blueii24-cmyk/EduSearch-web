import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ProfileWizard from '../components/profile/ProfileWizard'

export default function Profile({ profile, onSave }) {
  const navigate = useNavigate()
  const handleSave = (nextProfile) => {
    onSave(nextProfile)
    navigate('/dashboard')
  }
  return <section className="profile-page"><div className="container profile-layout"><aside className="profile-aside"><Link to="/" className="back-link"><ChevronLeft size={16} /> Back home</Link><div className="profile-aside-copy"><div className="eyebrow">Your profile</div><h1>Make your<br /><em>next move</em><br />more yours.</h1><p>The more we know about you, the more useful EduSearch becomes.</p></div><div className="profile-progress"><div className="progress-track"><span style={{ width: '16.6%' }} /></div><span>Build your profile in six quick steps</span></div></aside><ProfileWizard profile={profile} onSave={handleSave} /></div></section>
}
