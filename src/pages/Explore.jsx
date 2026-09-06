import React, { useMemo, useState } from 'react'
import { ArrowRight, Bookmark, Check, List, Map as MapIcon, MapPin, Search, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { opportunities, getDistanceKm } from '../services/opportunityService'
import { getProfile } from '../services/profileService'
import { matchProfileToOpportunity } from '../services/matchingService'
import { getCollegeEligibility } from '../services/collegeService'
import { getSavedOpportunityIds, toggleSavedOpportunity } from '../services/savedOpportunityService'
import { getSavedCollegeIds, toggleSavedCollege } from '../services/savedCollegeService'
import { getSavedJobIds, toggleSavedJob } from '../services/savedJobService'
import { recordInteraction, INTERACTION_EVENTS } from '../services/interactionService'
import { useAuth } from '../services/authService'
import SearchBar from '../components/common/SearchBar'
import FitSummary from '../components/common/FitSummary'
import MapCanvas from '../components/common/MapCanvas'

export default function Explore() {
  const navigate = useNavigate()
  const { configured, user } = useAuth()
  const profile = getProfile()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [distance, setDistance] = useState('any')
  const [fit, setFit] = useState('all')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('map')
  const [saved, setSaved] = useState(() => [...getSavedOpportunityIds(), ...getSavedCollegeIds(), ...getSavedJobIds()])
  const filtered = useMemo(() => opportunities.filter((item) => {
    const text = [item.title, item.name, item.organization, item.company, item.location, item.area, item.category, ...(item.skills || []), ...(item.courses || [])].join(' ').toLowerCase()
    if (query && !text.includes(query.toLowerCase())) return false
    if (type !== 'All' && item.type !== type) return false
    if (distance !== 'any' && getDistanceKm(item) > Number(distance)) return false
    const result = item.type === 'College' ? getCollegeEligibility(profile, item) : matchProfileToOpportunity(profile, item)
    if (fit === 'good' && !['eligible'].includes(result.eligibilityStatus)) return false
    if (fit === 'almost' && result.eligibilityStatus !== 'almost') return false
    return true
  }), [distance, fit, profile, query, type])
  const toggleSave = (item) => {
    if (configured && !user) {
      navigate('/login', { state: { from: '/explore' } })
      return
    }
    const next = item.type === 'College' ? toggleSavedCollege(item.id) : item.type === 'Job' ? toggleSavedJob(item.id) : toggleSavedOpportunity(item.id)
    setSaved(next)
  }
  const analysis = selected?.type === 'College' ? getCollegeEligibility(profile, selected) : selected ? matchProfileToOpportunity(profile, selected) : null
  const match = selected?.type === 'College' ? { matchPercentage: analysis?.eligibilityStatus === 'eligible' ? 100 : analysis?.eligibilityStatus === 'almost' ? 68 : 42, matchedSkills: [], missingSkills: [] } : analysis
  const detailPath = selected?.type === 'College' ? `/college/${selected.id}` : `/opportunity/${selected?.id}`
  const selectItem = (item) => {
    setSelected(item)
    recordInteraction(INTERACTION_EVENTS.MAP_MARKER_SELECTED, { entityId: item.id, entityType: item.type })
  }
  return <section className="map-page section explore-page"><div className="container"><div className="map-page-header"><div><div className="eyebrow">Local discovery</div><h1>Explore what’s <em>nearby.</em></h1><p><MapPin size={15} /> You are here · {profile.location || 'Panaji, Goa'}</p></div><div className="map-view-toggle"><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={15} /> List</button><button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}><MapIcon size={15} /> Map</button></div></div><div className="explore-controls"><SearchBar value={query} onChange={setQuery} onSearch={(term) => recordInteraction(INTERACTION_EVENTS.SEARCH_PERFORMED, { metadata: { searchTerm: term.trim().slice(0, 80) } })} /><div className="explore-filter-row">{['All', 'College', 'Job', 'Internship'].map((value) => <button className={type === value ? 'active' : ''} key={value} onClick={() => { setType(value); recordInteraction(INTERACTION_EVENTS.FILTER_USED, { metadata: { filter: `type_${value.toLowerCase()}` } }) }}>{value === 'All' ? 'All' : `${value}s`}</button>)}<select value={distance} onChange={(event) => { setDistance(event.target.value); recordInteraction(INTERACTION_EVENTS.FILTER_USED, { metadata: { filter: `within_${event.target.value}km` } }) }}><option value="any">Any distance</option><option value="5">5 km</option><option value="10">10 km</option><option value="25">25 km</option></select><select value={fit} onChange={(event) => { setFit(event.target.value); recordInteraction(INTERACTION_EVENTS.FILTER_USED, { metadata: { filter: `fit_${event.target.value}` } }) }}><option value="all">Show all fits</option><option value="good">Good match / eligible</option><option value="almost">Almost ready</option></select></div></div><div className={`map-layout ${view === 'list' ? 'list-view' : ''}`}><div className="map-list">{filtered.map((item) => <button className={`map-list-item ${selected?.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => selectItem(item)}><span className="preview-type">{item.type}</span><strong>{item.title || item.name}</strong><small>{item.organization || item.company}</small><span><MapPin size={12} /> {item.location} · {item.distance}</span></button>)}</div><div className="map-stage">  <MapCanvas items={filtered} profile={profile} selectedId={selected?.id} onSelect={selectItem} zoomable />{selected && <div className="map-preview enhanced-preview"><button className="preview-close" onClick={() => setSelected(null)} aria-label="Close summary"><X size={14} /></button><div className="preview-type">{selected.type}</div><h3>{selected.title || selected.name}</h3><p>{selected.organization || selected.company}</p><span><MapPin size={13} /> {selected.location} · {selected.distance}</span>{selected.type === 'College' ? <><p>{selected.courses.join(' · ')} · {selected.fees}</p><strong>{selected.admissionStatus === 'open' ? 'Open admission' : selected.admissionStatus === 'closingSoon' ? 'Closing soon' : 'Closed admission'}</strong><FitSummary matchPercentage={match.matchPercentage} status={analysis.eligibilityStatus} matchedSkills={[]} missingSkills={[]} message={`${analysis.reasons.join('. ')}. Verify official requirements before applying.`} /></> : <><p>{selected.salary || selected.stipend} · {selected.jobType || selected.duration}</p><FitSummary matchPercentage={match.matchPercentage} status={analysis.eligibilityStatus} matchedSkills={match.matchedSkills} missingSkills={match.missingSkills} /></>}<div className="preview-actions"><Link className="button button-primary" to={detailPath}>View full details <ArrowRight size={14} /></Link><button className="save-button" onClick={() => toggleSave(selected)}><Bookmark size={15} fill={saved.includes(selected.id) ? 'currentColor' : 'none'} /> {saved.includes(selected.id) ? 'Saved' : 'Save'}</button></div></div>}</div></div></div></section>
}
