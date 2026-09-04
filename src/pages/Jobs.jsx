import React, { useMemo, useState } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import { getProfile } from '../services/profileService'
import { opportunities } from '../services/opportunityService'
import { matchProfileToOpportunity } from '../services/matchingService'
import JobCard from '../components/opportunities/JobCard'
import SearchBar from '../components/common/SearchBar'
import EmptyState from '../components/common/EmptyState'
import { recordInteraction, INTERACTION_EVENTS } from '../services/interactionService'

const initialFilters = { distance: 'any', jobType: 'all', experience: 'all', skills: 'all', category: 'all' }

export default function Jobs() {
  const profile = getProfile()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const update = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    recordInteraction(INTERACTION_EVENTS.FILTER_USED, { metadata: { filter: `${key}_${value}` } })
  }
  const jobs = useMemo(() => {
    let results = opportunities.filter((item) => item.type === 'Job')
    const search = query.trim().toLowerCase()
    if (search) results = results.filter((job) => [job.title, job.company, job.location, job.category, ...job.skills].join(' ').toLowerCase().includes(search))
    if (filters.distance !== 'any') results = results.filter((job) => job.distanceKm <= Number(filters.distance))
    if (filters.jobType !== 'all') results = results.filter((job) => job.jobTypes?.includes(filters.jobType))
    if (filters.experience !== 'all') results = results.filter((job) => filters.experience === 'Fresher' ? job.fresherFriendly : job.experienceRange === filters.experience)
    if (filters.category !== 'all') results = results.filter((job) => job.category === filters.category)
    if (filters.skills !== 'all') results = results.filter((job) => { const status = matchProfileToOpportunity(profile, job).eligibilityStatus; return filters.skills === 'matches' ? status === 'eligible' : status === 'almost' })
    return results
  }, [filters, profile, query])
  const filterContent = <><label>Distance</label><div className="job-filter-buttons">{[['any', 'Any distance'], ['5', '5 km'], ['10', '10 km'], ['25', '25 km']].map(([value, label]) => <button className={filters.distance === value ? 'active' : ''} key={value} onClick={() => update('distance', value)}>{label}</button>)}</div><label>Job type</label><div className="job-filter-buttons">{['all', 'Full-time', 'Part-time', 'Remote'].map((type) => <button className={filters.jobType === type ? 'active' : ''} key={type} onClick={() => update('jobType', type)}>{type === 'all' ? 'Any' : type}</button>)}</div><label>Experience</label><div className="job-filter-buttons">{[['all', 'Any'], ['Fresher', 'Fresher'], ['0–1 years', '0–1 years'], ['1–2 years', '1–2 years']].map(([value, label]) => <button className={filters.experience === value ? 'active' : ''} key={value} onClick={() => update('experience', value)}>{label}</button>)}</div><label>Skill match</label><select value={filters.skills} onChange={(event) => update('skills', event.target.value)}><option value="all">Show all</option><option value="matches">Matches my skills</option><option value="almost">Almost ready</option></select><label>Category</label><select value={filters.category} onChange={(event) => update('category', event.target.value)}><option value="all">All categories</option>{['Software', 'Data', 'Design', 'Business', 'Marketing', 'Finance', 'Other'].map((category) => <option key={category} value={category}>{category}</option>)}</select></>
  return <section className="jobs-page section"><div className="container"><div className="jobs-header"><div><div className="eyebrow">Personalized for you</div><h1>Jobs<br /><em>near you.</em></h1><p><MapPin size={15} /> Showing jobs near {profile.location || 'Panaji, Goa'}</p></div><SearchBar value={query} onChange={setQuery} onSearch={(term) => recordInteraction(INTERACTION_EVENTS.SEARCH_PERFORMED, { metadata: { searchTerm: term.trim().slice(0, 80) } })} placeholder="Search jobs, skills or companies" /></div><button className="mobile-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>Filters <span>{filtersOpen ? '−' : '+'}</span></button><div className={`jobs-layout ${filtersOpen ? 'filters-visible' : ''}`}><aside className="job-filters"><div className="filter-title"><strong>Refine jobs</strong><button onClick={() => setFilters(initialFilters)}>Reset</button></div>{filterContent}</aside><div className="job-results"><div className="results-top"><span><strong>{jobs.length} jobs</strong> match your profile</span><button>Best match <ChevronRight size={15} /></button></div>{jobs.length ? <div className="job-grid">{jobs.map((job) => <JobCard job={job} profile={profile} key={job.id} />)}</div> : <EmptyState title="No jobs match those filters" description="Try widening your distance or showing all skill matches." />}</div></div></div></section>
}
