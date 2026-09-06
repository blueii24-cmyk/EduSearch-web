import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { saveGeneralFeedback } from '../../services/feedbackService'
import Logo from '../common/Logo'

export default function Footer() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [comment, setComment] = useState('')
  const [category, setCategory] = useState('Website experience')
  const submit = () => {
    saveGeneralFeedback({ rating: 'neutral', category, comment })
    setSent(true)
  }
  return <footer><div className="container footer-inner"><Link className="brand" to="/"><span className="brand-mark"><Logo size={17} /></span><span>Edu<span>Search</span></span></Link><span>Start with where you are. See what’s possible.</span><button className="footer-feedback-link" onClick={() => { setOpen(!open); setSent(false) }}>Give feedback</button><span>© 2025 EduSearch</span>{open && <div className="general-feedback"><strong>Help us improve EduSearch</strong>{sent ? <span>Thanks — your feedback helps us improve EduSearch.</span> : <><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Website experience</option><option>Search/discovery</option><option>Recommendations</option><option>Colleges</option><option>Jobs</option><option>Internships</option><option>Map</option><option>Other</option></select><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={240} placeholder="What should we improve? (optional)" /><button className="button button-primary" onClick={submit}>Submit feedback</button><small>Your feedback helps us improve EduSearch. We only record interactions with EduSearch features.</small></>}</div>}</div></footer>
}
