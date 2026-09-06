import React, { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, Check, ExternalLink, MapPin } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCollegeById, getCollegeEligibility } from '../services/collegeService'
import { getSavedCollegeIds, toggleSavedCollege } from '../services/savedCollegeService'
import ProgressBar from '../components/common/ProgressBar'
import MapCanvas from '../components/common/MapCanvas'
import FeedbackPrompt from '../components/common/FeedbackPrompt'
import { recordInteraction, INTERACTION_EVENTS } from '../services/interactionService'
import { useAuth } from '../services/authService'

export default function CollegeDetails({ profile }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { configured, user } = useAuth()
  const college = getCollegeById(id)
  const [saved, setSaved] = useState(() => getSavedCollegeIds().includes(id))
  useEffect(() => {
    if (college) recordInteraction(INTERACTION_EVENTS.COLLEGE_VIEWED, { entityId: college.id, entityType: 'College' })
  }, [college])
  if (!college) return <section className="empty-page section"><h1>College not found</h1><Link className="button button-primary" to="/colleges">Back to colleges</Link></section>
  const eligibility = getCollegeEligibility(profile, college)
  const nextStep = eligibility.entranceRequired ? 'Prepare for the entrance exam, then check the application dates.' : eligibility.eligibilityStatus === 'eligible' ? 'Check the admission form and verify the latest requirements.' : 'Verify the latest eligibility requirements before applying.'
  const toggleSave = () => {
    if (configured && !user) {
      navigate('/login', { state: { from: `/college/${id}` } })
      return
    }
    const nextSaved = toggleSavedCollege(id).includes(id)
    setSaved(nextSaved)
    recordInteraction(nextSaved ? INTERACTION_EVENTS.COLLEGE_SAVED : INTERACTION_EVENTS.COLLEGE_UNSAVED, { entityId: id, entityType: 'College' })
  }
  return <section className="college-details-page section"><div className="container"><Link className="back-link details-back" to="/colleges"><ArrowLeft size={16} /> Back to colleges</Link><div className="college-details-layout"><article><div className="detail-type college">College · {college.category}</div><h1>{college.name}</h1><h2>{college.title}</h2><p className="detail-location"><MapPin size={16} /> {college.location} · {college.distance}</p><p className="detail-description">{college.description}</p><div className="college-detail-meta"><div><small>Courses</small><strong>{college.courses.join(' · ')}</strong></div><div><small>Fees</small><strong>₹{college.feesPerYear.toLocaleString('en-IN')} / year</strong></div><div><small>Admission</small><strong>{college.admissionStatus === 'open' ? 'Open' : college.admissionStatus === 'closingSoon' ? 'Closing soon' : 'Closed'}</strong></div></div><section className="apply-panel"><div className="eyebrow">Can you apply?</div><h2>{eligibility.eligibilityStatus === 'eligible' ? 'Based on your profile, you appear eligible.' : eligibility.eligibilityStatus === 'almost' ? 'You are almost ready to apply.' : 'This may not be the right fit yet.'}</h2><ProgressBar value={eligibility.eligibilityStatus === 'eligible' ? 100 : eligibility.eligibilityStatus === 'almost' ? 70 : 35} /><div className="eligibility-reasons"><span className={eligibility.educationMet ? 'good' : 'bad'}>{eligibility.educationMet ? <Check size={15} /> : '✕'} {eligibility.educationMet ? 'Education requirement met' : 'Required qualification not met'}</span><span className={eligibility.percentageMet ? 'good' : 'bad'}>{eligibility.percentageMet ? <Check size={15} /> : '✕'} {eligibility.percentageMet ? 'Minimum percentage met' : `Minimum percentage is ${college.minimumPercentage}%`}</span>{college.entranceRequired && <span className="warn">⚠ Entrance examination required</span>}</div><p className="prototype-note">This is a prototype estimate. Please verify official admission requirements before applying.</p></section><section className="college-info-section"><h2>Courses and eligibility</h2><div className="course-pills">{college.courses.map((course) => <span key={course}>{course}</span>)}</div><p>{college.eligibility}</p><p>Minimum percentage: <strong>{college.minimumPercentage}%</strong></p></section><FeedbackPrompt opportunityId={college.id} opportunityType="College" /></article><aside className="college-details-sidebar"><button className={`save-button ${saved ? 'saved' : ''}`} onClick={toggleSave}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved college' : 'Save college'}</button><div className="next-step-card"><div className="eyebrow">Your next step</div><h3>{nextStep}</h3><a className="button button-light" href={college.applicationUrl} target="_blank" rel="noreferrer" onClick={() => recordInteraction(INTERACTION_EVENTS.APPLY_CLICKED, { entityId: college.id, entityType: 'College' })}>Apply / visit website <ExternalLink size={15} /></a></div><div className="college-map-preview"><div className="map-preview-heading"><strong>College location</strong><span>{college.area}</span></div><MapCanvas items={[college]} profile={profile} /><Link to="/map">View on map <ExternalLink size={13} /></Link></div></aside></div></div></section>
}
