import React, { useEffect, useRef, useState } from 'react'

export default function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(node)
    const fallback = setTimeout(() => setInView(true), 1800)
    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return React.cloneElement(children, {
    ref,
    className: `${children.props.className || ''} reveal-on-scroll ${inView ? 'in-view' : ''} ${className}`.trim()
  })
}
