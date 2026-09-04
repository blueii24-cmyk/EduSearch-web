import React, { useMemo, useState } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import { getProfile } from '../services/profileService'
import { getCollegeEligibility, searchColleges } from '../services/collegeService'
import CollegeCard from '../components/opportunities/CollegeCard'
import SearchBar from '../components/common/SearchBar'
import EmptyState from '../components/common/EmptyState'
import { recordInteraction, INTERACTION_EVENTS } from '../services/interactionService'

const initialFilters = { distance: 'any', level: 'all', course: 'all', eligibility: 'all', admission: 'all' }

export default function Colleges() {
  const profile = getProfile()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const update = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    recordInteraction(INTERACTION_EVENTS.FILTER_USED, { metadata: { filter: `${key}_${value}` } })
  }
  const filtered = useMemo(() => {
    let results = searchColleges(query)
    if (filters.distance !== 'any') results = results.filter((college) => college.distanceKm <= Number(filters.distance))
    if (filters.level !== 'all') results = results.filter((college) => college.studyLevels.includes(filters.level))
    if (filters.course !== 'all') results = results.filter((college) => college.courses.includes(filters.course))
    if (filters.admission !== 'all') results = results.filter((college) => college.admissionStatus === filters.admission)
    if (filters.eligibility !== 'all') results = results.filter((college) => getCollegeEligibility(profile, college).eligibilityStatus === filters.eligibility)
    return results
  }, [filters, profile, query])
  const filterContent = <><label>Distance</label><div className="college-filter-buttons">{[['any', 'Any distance'], ['5', '5 km'], ['10', '10 km'], ['25', '25 km']].map(([value, label]) => <button className={filters.distance === value ? 'active' : ''} key={value} onClick={() => update('distance', value)}>{label}</button>)}</div><label>Study level</label><div className="college-filter-buttons"><button className={filters.level === 'all' ? 'active' : ''} onClick={() => update('level', 'all')}>All</button>{['Undergraduate', 'Postgraduate'].map((level) => <button className={filters.level === level ? 'active' : ''} key={level} onClick={() => update('level', level)}>{level}</button>)}</div><label>Course</label><select value={filters.course} onChange={(event) => update('course', event.target.value)}><option value="all">All courses</option>{[...new Set(searchColleges('').flatMap((college) => college.courses))].map((course) => <option key={course} value={course}>{course}</option>)}</select><label>Eligibility</label><select value={filters.eligibility} onChange={(event) => update('eligibility', event.target.value)}><option value="all">Show all</option><option value="eligible">Eligible for me</option><option value="almost">Almost eligible</option><option value="notEligible">Not eligible</option></select><label>Admission status</label><select value={filters.admission} onChange={(event) => update('admission', event.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="closingSoon">Closing soon</option><option value="closed">Closed</option></select></>
  return <section className="colleges-page section"><div className="container"><div className="colleges-header"><div><div className="eyebrow">Personalized for you</div><h1>Find colleges<br /><em>near you.</em></h1><p><MapPin size={15} /> Showing colleges near {profile.location || 'Panaji, Goa'}</p></div><SearchBar value={query} onChange={setQuery} onSearch={(term) => recordInteraction(INTERACTION_EVENTS.SEARCH_PERFORMED, { metadata: { searchTerm: term.trim().slice(0, 80) } })} placeholder="Search colleges, courses or areas" /></div><button className="mobile-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>Filters <span>{filtersOpen ? '−' : '+'}</span></button><div className={`colleges-layout ${filtersOpen ? 'filters-visible' : ''}`}><aside className="college-filters"><div className="filter-title"><strong>Refine colleges</strong><button onClick={() => setFilters(initialFilters)}>Reset</button></div>{filterContent}</aside><div className="college-results"><div className="results-top"><span><strong>{filtered.length} colleges</strong> match your profile</span><button>Best match <ChevronRight size={15} /></button></div>{filtered.length ? <div className="college-grid">{filtered.map((college) => <CollegeCard college={college} profile={profile} key={college.id} />)}</div> : <EmptyState title="No colleges match those filters" description="Try widening your distance or showing all eligibility statuses." />}</div></div></div></section>
}
