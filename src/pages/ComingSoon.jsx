import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ComingSoon({ title }) {
  return <section className="empty-page section"><div className="empty-icon"><Sparkles size={27} /></div><div className="eyebrow">Coming next</div><h1>{title}</h1><p>This part of EduSearch is being shaped next. Start with your profile so your future matches are ready when it launches.</p><Link className="button button-primary" to="/profile">Build your profile <ArrowRight size={17} /></Link></section>
}
