import React, { useState } from 'react'
import { Check, ThumbsDown, ThumbsUp } from 'lucide-react'
import { hasSubmittedFeedback, saveFeedback } from '../../services/feedbackService'

const defaultReasons = {
  positive: ['Matches my skills', "I'm eligible", 'Good location', 'Useful information', 'Good opportunity', 'Other'],
  negative: ['Not relevant to me', "I'm not eligible", 'Too far away', "Skills don't match", 'Information seems wrong', 'Opportunity no longer available', 'Other']
}

const collegeReasons = {
  positive: ['Eligible for me', 'Good location', 'Course is useful', 'Fees are reasonable', 'Useful information', 'Other'],
  negative: ['Not eligible', 'Too far away', "Course isn't relevant", 'Information seems wrong', 'Admission unavailable', 'Other']
}

export default function FeedbackPrompt({ opportunityId, opportunityType }) {
  const [submitted, setSubmitted] = useState(() => hasSubmittedFeedback(opportunityId, opportunityType))
  const [value, setValue] = useState(null)
  const [reasons, setReasons] = useState([])
  const [comment, setComment] = useState('')
  if (submitted) return <section className="feedback-prompt feedback-complete"><Check size={16} /> Thanks — your feedback helps us make recommendations better.</section>
  const options = opportunityType === 'College' ? collegeReasons : defaultReasons
  const toggleReason = (reason) => setReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason])
  const submit = () => {
    if (!value) return
    saveFeedback({ opportunityId, opportunityType, feedbackValue: value, reasons, comment })
    setSubmitted(true)
  }
  return <section className="feedback-prompt"><div><strong>Were these details useful?</strong><span>Optional feedback helps us improve EduSearch.</span></div>{!value ? <div className="feedback-votes"><button onClick={() => setValue('positive')}><ThumbsUp size={15} /> Yes</button><button onClick={() => setValue('negative')}><ThumbsDown size={15} /> No</button></div> : <div className="feedback-form"><p>What made this {value === 'positive' ? 'useful' : 'less useful'}?</p><div className="feedback-reasons">{options[value].map((reason) => <button className={reasons.includes(reason) ? 'selected' : ''} key={reason} onClick={() => toggleReason(reason)}>{reason}</button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={240} placeholder="Anything else? (optional)" /><button className="button button-primary" onClick={submit}>Submit feedback</button></div>}</section>
}
