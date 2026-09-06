import React, { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, Check, ExternalLink, MapPin } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOpportunityById } from '../services/opportunityService'
import { matchProfileToOpportunity } from '../services/matchingService'
import { getSavedOpportunityIds, toggleSavedOpportunity } from '../services/savedOpportunityService'
import { getSavedJobIds, toggleSavedJob } from '../services/savedJobService'
import ProgressBar from '../components/common/ProgressBar'
import SkillChip from '../components/common/SkillChip'
import MatchBadge from '../components/common/MatchBadge'
import FeedbackPrompt from '../components/common/FeedbackPrompt'
import { recordInteraction, INTERACTION_EVENTS } from '../services/interactionService'
import { useAuth } from '../services/authService'

export default function OpportunityDetails({ profile }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { configured, user } = useAuth()
  const item = getOpportunityById(id)
  const isJob = item?.type === 'Job'
  const [saved, setSaved] = useState(() => isJob ? getSavedJobIds().includes(id) : getSavedOpportunityIds().includes(id))
  useEffect(() => {
    if (item) {
      recordInteraction(INTERACTION_EVENTS.OPPORTUNITY_VIEWED, { entityId: item.id, entityType: item.type })
      recordInteraction(INTERACTION_EVENTS[`${item.type.toUpperCase()}_VIEWED`], { entityId: item.id, entityType: item.type })
    }
  }, [item])
  if (!item) return <section className="empty-page section"><h1>Opportunity not found</h1><Link className="button button-primary" to="/discover">Back to discover</Link></section>
  const match = matchProfileToOpportunity(profile, item)
  const nextStep = match.missingSkills.length ? `Learn ${match.missingSkills.slice(0, 2).join(' and ')}, then build one project before applying.` : 'Apply now — your current skills align well.'
  const toggleSave = () => {
    if (configured && !user) {
      navigate('/login', { state: { from: `/opportunity/${id}` } })
      return
    }
    const nextSaved = (isJob ? toggleSavedJob(id) : toggleSavedOpportunity(id)).includes(id)
    setSaved(nextSaved)
    recordInteraction(nextSaved ? INTERACTION_EVENTS.OPPORTUNITY_SAVED : INTERACTION_EVENTS.OPPORTUNITY_UNSAVED, { entityId: id, entityType: item.type })
    if (isJob) recordInteraction(nextSaved ? INTERACTION_EVENTS.JOB_SAVED : INTERACTION_EVENTS.JOB_UNSAVED, { entityId: id, entityType: item.type })
  }
  return <section className="details-page section"><div className="container"><Link className="back-link details-back" to={isJob ? '/jobs' : '/discover'}><ArrowLeft size={16} /> Back to {isJob ? 'jobs' : 'opportunities'}</Link><div className="details-layout"><article><div className={`detail-type ${item.type.toLowerCase()}`}>{item.type}</div><h1>{item.title}</h1><h2>{item.company || item.organization}</h2><p className="detail-location"><MapPin size={16} /> {item.location} · {item.distance}</p><p className="detail-description">{item.description}</p><div className="detail-meta"><div><small>Salary</small><strong>{item.salary || item.stipend || 'Student-friendly'}</strong></div><div><small>Job type</small><strong>{item.jobType || item.duration || 'Opportunity'}</strong></div><div><small>Experience</small><strong>{item.experience || 'No experience required'}</strong></div></div>{isJob && <section className="job-content-section"><h2>What you’ll do</h2><ul>{item.responsibilities?.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}</ul></section>}<section className="fit-panel"><div className="fit-panel-head"><div><div className="eyebrow">Your fit</div><h2><MatchBadge value={match.matchPercentage} /></h2></div><span className={`eligibility ${match.eligibilityStatus}`}>{match.eligibilityStatus === 'eligible' ? '✓ Good match' : match.eligibilityStatus === 'almost' ? '⚠ Almost ready' : '○ Explore'}</span></div><ProgressBar value={match.matchPercentage} /><div className="fit-columns"><div><strong>You already have</strong>{match.matchedSkills.length ? match.matchedSkills.map((skill) => <span key={skill}><Check size={14} /> {skill}</span>) : <span className="muted">Your profile is still growing</span>}</div><div><strong>You may need</strong>{match.missingSkills.length ? match.missingSkills.map((skill) => <span key={skill} className="missing">○ {skill}</span>) : <span><Check size={14} /> Nothing extra listed</span>}</div></div><p className="prototype-note">This is a prototype estimate. Verify the employer’s actual requirements before applying.</p></section><FeedbackPrompt opportunityId={item.id} opportunityType={item.type} /></article><aside className="details-sidebar"><button className={`save-button ${saved ? 'saved' : ''}`} onClick={toggleSave}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? `Saved ${isJob ? 'job' : 'opportunity'}` : `Save ${isJob ? 'job' : 'opportunity'}`}</button><div className="next-step-card"><div className="eyebrow">Your next step</div><h3>{nextStep}</h3><a className="button button-primary" href={item.applicationUrl} target="_blank" rel="noreferrer" onClick={() => recordInteraction(INTERACTION_EVENTS.APPLY_CLICKED, { entityId: item.id, entityType: item.type })}>Apply <ExternalLink size={15} /></a></div><div className="requirements-card"><h3>Requirements</h3><strong className="requirements-label">Required skills</strong>{(item.requiredSkills || item.skills).map((skill) => <SkillChip key={skill}>{skill}</SkillChip>)}{item.preferredSkills?.length > 0 && <><strong className="requirements-label">Preferred skills</strong>{item.preferredSkills.map((skill) => <SkillChip key={skill}>{skill}</SkillChip>)}</>}</div></aside></div></div></section>
}
