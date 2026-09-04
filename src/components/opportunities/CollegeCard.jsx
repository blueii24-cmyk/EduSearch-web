import React from 'react'
import { Check, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import MatchBadge from '../common/MatchBadge'
import { getCollegeEligibility } from '../../services/collegeService'

export default function CollegeCard({ college, profile }) {
  const eligibility = getCollegeEligibility(profile, college)
  const statusLabel = { eligible: '✓ Eligible', almost: '⚠ Almost eligible', notEligible: '✕ Not eligible' }[eligibility.eligibilityStatus]
  return <Link to={`/college/${college.id}`} className="college-card"><div className="college-card-top"><span className="type-label college">{college.category}</span><MatchBadge value={college.match} /></div><h3>{college.name}</h3><p className="organization">{college.title}</p><div className="college-location"><MapPin size={14} /> {college.location} · {college.distance}</div><div className="college-courses"><small>Courses</small><strong>{college.courses.join(' · ')}</strong></div><div className="college-card-meta"><div><small>Your eligibility</small><span className={`eligibility ${eligibility.eligibilityStatus}`}>{statusLabel}</span></div><div><small>Fees</small><strong>₹{college.feesPerYear.toLocaleString('en-IN')} / year</strong></div><div><small>Admission</small><span className={`admission-status ${college.admissionStatus}`}>{college.admissionStatus === 'open' ? 'Open' : college.admissionStatus === 'closingSoon' ? 'Closing soon' : 'Closed'}</span></div></div><span className="card-cta">View college <span>→</span></span></Link>
}
