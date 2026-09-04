import React from 'react'
import { Sparkles } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', description }) {
  return <div className="empty-state"><Sparkles size={24} /><h3>{title}</h3>{description && <p>{description}</p>}</div>
}
