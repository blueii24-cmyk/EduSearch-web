import React from 'react'
import { ArrowRight, Search } from 'lucide-react'

export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search roles, skills or colleges', className = '' }) {
  return <div className={`search-bar ${className}`}><Search size={18} /><input value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} aria-label={placeholder} /><button aria-label="Search" onClick={() => onSearch?.(value)}><ArrowRight size={18} /></button></div>
}
