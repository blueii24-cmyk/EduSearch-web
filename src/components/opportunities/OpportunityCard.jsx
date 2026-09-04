import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import MatchBadge from '../common/MatchBadge'
import SkillChip from '../common/SkillChip'
import { matchProfileToOpportunity } from '../../services/matchingService'

export default function OpportunityCard({ item, profile }) {
  const match = profile ? matchProfileToOpportunity(profile, item) : { matchPercentage: item.match, matchedSkills: item.skills, missingSkills: [] }
  return <Link to={item.type === 'College' ? `/college/${item.id}` : `/opportunity/${item.id || item.title.toLowerCase().replaceAll(' ', '-')}`} className="opportunity-card"><div className="card-topline"><span className={`type-label ${item.type.toLowerCase()}`}>{item.type}</span><span className="distance">{item.distance}</span></div><h3>{item.title}</h3><p className="organization">{item.organization}</p><div className="card-location"><MapPin size={14} /> {item.location} · {item.area}</div><p className="card-description">{item.description}</p><div className="card-bottom"><div className="skill-list">{(item.requiredSkills || item.skills).slice(0, 4).map((skill) => <SkillChip key={skill}>{match.matchedSkills.includes(skill) ? '✓ ' : '○ '}{skill}</SkillChip>)}</div><MatchBadge value={match.matchPercentage} /></div><span className="card-cta">View opportunity <span>→</span></span></Link>
}
