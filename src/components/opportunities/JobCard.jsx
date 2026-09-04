import React from 'react'
import OpportunityCard from './OpportunityCard'

export default function JobCard({ job, profile }) {
  return <OpportunityCard item={job} profile={profile} />
}
