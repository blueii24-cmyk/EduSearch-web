import React from 'react'

export default function ProgressBar({ value, className = '' }) {
  return <div className={`progress-bar ${className}`}><span style={{ width: `${value}%` }} /></div>
}
