import React from 'react'
import { ArrowRight } from 'lucide-react'

export default function Button({ children, variant = 'primary', icon = true, ...props }) {
  return <button className={`button button-${variant}`} {...props}>{children}{icon && <ArrowRight size={17} />}</button>
}
