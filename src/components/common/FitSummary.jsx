import React from 'react'
import { Check } from 'lucide-react'
import ProgressBar from './ProgressBar'

const labels = { eligible: 'Good match', almost: 'Almost ready', explore: 'Explore', notEligible: 'Explore' }

export default function FitSummary({ matchPercentage = 0, status = 'explore', matchedSkills = [], missingSkills = [], message }) {
  return <section className="fit-summary"><div className="fit-summary-head"><div><div className="eyebrow">Your shot</div><strong>{matchPercentage}% <small>match</small></strong></div><span className={`eligibility ${status}`}>{labels[status] || 'Explore'}</span></div><ProgressBar value={matchPercentage} /><div className="fit-summary-skills"><div><b>You have</b>{matchedSkills.length ? matchedSkills.slice(0, 4).map((skill) => <span key={skill}><Check size={13} /> {skill}</span>) : <span className="muted">Keep building your profile</span>}</div><div><b>Learn next</b>{missingSkills.length ? missingSkills.slice(0, 4).map((skill) => <span key={skill} className="missing">○ {skill}</span>) : <span><Check size={13} /> No gaps listed</span>}</div></div><p>{message || (status === 'eligible' ? 'You already meet most of the requirements.' : status === 'almost' ? `Learn ${missingSkills.slice(0, 1).join(' or ') || 'the next skill'} to become a stronger match.` : 'Explore this opportunity and verify its official requirements.')}</p></section>
}
