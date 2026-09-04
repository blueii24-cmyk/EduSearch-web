import React, { useMemo, useState } from 'react'
import { ChevronRight, List, Map as MapIcon, MapPin } from 'lucide-react'
import SearchBar from '../components/common/SearchBar'
import FilterPanel from '../components/opportunities/FilterPanel'
import OpportunityCard from '../components/opportunities/OpportunityCard'
import EmptyState from '../components/common/EmptyState'
import { opportunities, searchOpportunities, getDistanceKm } from '../services/opportunityService'
import { matchProfileToOpportunity } from '../services/matchingService'
import { Link } from 'react-router-dom'

const initialFilters = { type: 'All', distance: 'any', fresherFriendly: false, matchesSkills: false, eligible: false, jobType: 'all', collegeLevel: 'all' }

export default function Discover({ profile }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [view, setView] = useState('list')
  const filtered = useMemo(() => {
    let result = query ? searchOpportunities(query) : opportunities
    if (filters.type !== 'All') result = result.filter((item) => item.type === filters.type)
    if (filters.distance !== 'any') result = result.filter((item) => getDistanceKm(item) <= Number(filters.distance))
    if (filters.fresherFriendly) result = result.filter((item) => item.fresherFriendly)
    if (filters.matchesSkills) result = result.filter((item) => matchProfileToOpportunity(profile, item).matchedSkills.length > 0)
    if (filters.eligible) result = result.filter((item) => matchProfileToOpportunity(profile, item).eligibilityStatus === 'eligible')
    if (filters.jobType !== 'all') result = result.filter((item) => item.type !== 'Job' || item.jobTypes?.includes(filters.jobType))
    if (filters.collegeLevel !== 'all') result = result.filter((item) => item.type !== 'College' || item.level === filters.collegeLevel)
    return result
  }, [filters, profile, query])
  const counts = { All: opportunities.length, College: opportunities.filter((item) => item.type === 'College').length, Job: opportunities.filter((item) => item.type === 'Job').length, Internship: opportunities.filter((item) => item.type === 'Internship').length }
  return <section className="discover-page section"><div className="container"><div className="discover-header"><div><div className="eyebrow">Personalized for you</div><h1>Explore opportunities<br /><em>around you.</em></h1><p><MapPin size={15} /> Showing results near {profile.location || 'Panaji, Goa'}</p></div><SearchBar value={query} onChange={setQuery} /></div><div className="view-toggle"><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={15} /> List view</button><button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}><MapIcon size={15} /> Map view</button></div><div className={`discover-body ${view === 'map' ? 'map-only-mobile' : ''}`}><FilterPanel filters={filters} onChange={setFilters} counts={counts} /><div className="discover-results"><div className="results-top"><span><strong>{filtered.length} opportunities</strong> that match your profile</span><button>Best match <ChevronRight size={15} /></button></div>{filtered.length ? <div className="discover-cards">{filtered.map((item) => <OpportunityCard item={item} profile={profile} key={item.id} />)}</div> : <EmptyState title="No opportunities match those filters" description="Try widening your distance or removing a filter." />}</div><div className="discover-map"><div className="map-header"><strong>Nearby map</strong><Link to="/map">Open map <ChevronRight size={14} /></Link></div><MapCanvas items={filtered} profile={profile} /></div></div></div></section>
}

export function MapCanvas({ items, profile, onSelect, selectedId }) {
  return <div className="large-map"><span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" /><span className="map-area-label area-panaji">PANAJI</span><span className="map-area-label area-porvorim">PORVORIM</span>{items.map((item, index) => <button key={item.id} className={`large-marker marker-${index % 5} ${selectedId === item.id ? 'selected' : ''}`} style={{ left: `${18 + (index * 19) % 68}%`, top: `${18 + (index * 23) % 60}%` }} onClick={() => onSelect?.(item)} aria-label={`Select ${item.title}`}>{item.type === 'College' ? '🎓' : item.type === 'Job' ? '💼' : '🧑‍💻'}</button>)}<div className="you-are-here"><span /> {profile.location || 'Panaji, Goa'}</div></div>
}
