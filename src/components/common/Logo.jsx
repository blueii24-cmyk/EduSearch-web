import React from 'react'

export default function Logo({ size = 17, strokeWidth = 2.1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M6.6 17.7 16.1 8.1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="6.6" cy="17.7" r="2" fill="currentColor" />
      <circle cx="16.6" cy="7.6" r="3.1" stroke="currentColor" strokeWidth={strokeWidth - 0.3} />
      <circle cx="16.6" cy="7.6" r="1.05" fill="currentColor" />
    </svg>
  )
}
