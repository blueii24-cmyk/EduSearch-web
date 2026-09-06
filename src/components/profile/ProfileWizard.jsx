import React, { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

export const profileSteps = [
  { label: 'Education', title: 'Where are you in your journey?', copy: 'This helps us find opportunities you’re eligible for.', field: 'education', options: ['12th', 'BCA', 'BSc Computer Science', 'BTech Computer Science', 'BCom', 'BA', 'Other'] },
  { label: 'Year', title: 'What year are you in?', copy: 'We’ll use this to surface the right level of opportunities.', field: 'year', options: ['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Graduate', 'Other'] },
  { label: 'Marks', title: 'What’s your latest percentage?', copy: 'A rough number is enough. You can always update this later.', field: 'percentage', type: 'number' },
  { label: 'Skills', title: 'What can you already do?', copy: 'Pick everything you feel comfortable with.', field: 'skills', options: ['HTML', 'CSS', 'JavaScript', 'Python', 'C', 'C++', 'Java', 'SQL', 'React', 'Git/GitHub'] },
  { label: 'Interests', title: 'What pulls you in?', copy: 'Your interests help us connect you to possibilities you may not have considered.', field: 'interests', options: ['Web Development', 'AI/ML', 'Cloud', 'Cybersecurity', 'Data', 'UI/UX', 'Business', 'Finance'] },
  { label: 'Location', title: 'Where should we look?', copy: 'We’ll find opportunities that are realistic to reach from here.', field: 'location', type: 'location' }
]

export default function ProfileWizard({ profile, onSave }) {
  const [draft, setDraft] = useState(profile)
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const current = profileSteps[step]
  const update = (value) => setDraft({ ...draft, [current.field]: value })
  const toggle = (value) => update(draft[current.field].includes(value) ? draft[current.field].filter((item) => item !== value) : [...draft[current.field], value])
  const next = async () => {
    if (step < profileSteps.length - 1) {
      setStep(step + 1)
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(draft)
      setSaved(true)
    } catch (saveError) {
      setError(saveError.message || 'We could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  return <div className="profile-form-area"><div className="profile-form-top"><span className="eyebrow">{current.label}</span><span className="save-note">Ready to save <span className="save-dot" /></span></div><div className="profile-question" key={step}><h2>{current.title}</h2><p>{current.copy}</p>{current.options && <div className="selection-grid">{current.options.map((option) => { const selected = Array.isArray(draft[current.field]) ? draft[current.field].includes(option) : draft[current.field] === option; return <button type="button" key={option} className={`selection-option ${selected ? 'selected' : ''}`} onClick={() => current.field === 'skills' || current.field === 'interests' ? toggle(option) : update(option)}><span className="option-mark">{selected ? <Check size={15} /> : '+'}</span>{option}</button> })}</div>}{current.type === 'number' && <div className="number-input-wrap"><input autoFocus type="number" min="0" max="100" value={draft.percentage} onChange={(event) => update(event.target.value)} /><span>%</span></div>}{current.type === 'location' && <div className="location-input-wrap"><MapPin size={19} /><input autoFocus value={draft.location} onChange={(event) => update(event.target.value)} placeholder="e.g. Panaji, Goa" /></div>}</div><div className="profile-form-footer"><button className="button button-ghost" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0 || saving}><ChevronLeft size={17} /> Back</button><button className="button button-primary" onClick={next} disabled={saving}>{step === profileSteps.length - 1 ? saving ? 'Saving…' : saved ? 'Profile saved' : 'Finish profile' : 'Continue'}{step < profileSteps.length - 1 && <ChevronRight size={17} />}</button></div>{error && <div className="auth-message error">{error}</div>}{saved && <div className="success-note"><Check size={16} /> Your profile is ready. We’ll use it to personalize your matches.</div>}</div>
}
