import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import { getAuthenticatedProfile } from '../services/profileService'
import { resendConfirmation, signIn, signUp, useAuth } from '../services/authService'

function friendlyAuthError(error) {
  const message = error?.message || ''
  if (/email not confirmed/i.test(message)) return 'Please confirm your email before logging in. You can resend the confirmation email below.'
  if (/rate limit|too many requests/i.test(message)) return 'Too many attempts. Please wait a few minutes before trying again.'
  if (/invalid login credentials/i.test(message)) return 'The email or password is incorrect.'
  return message || 'We could not complete that request.'
}

export default function Auth() {
  const { configured, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!configured) return <section className="auth-page section"><div className="auth-card"><div className="eyebrow"><Sparkles size={13} /> Development mode</div><h1>Authentication is not configured.</h1><p>Add the Supabase variables to <code>.env.local</code> to use account sign in.</p><Link className="button button-primary" to="/">Back home <ArrowRight size={16} /></Link></div></section>
  if (user) return <NavigateToProfile />
  if (confirmationEmail) return <ConfirmationState email={confirmationEmail} onBack={() => { setConfirmationEmail(''); setMode('login'); setMessage('') }} />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const normalizedEmail = email.trim()
      const result = mode === 'signup' ? await signUp(normalizedEmail, password) : await signIn(normalizedEmail, password)
      if (mode === 'signup' && !result.session) {
        setConfirmationEmail(normalizedEmail)
      } else {
        await redirectAfterAuth()
      }
    } catch (authError) {
      setError(friendlyAuthError(authError))
    } finally {
      setSubmitting(false)
    }
  }

  async function redirectAfterAuth() {
    const profile = await getAuthenticatedProfile()
    navigate(profile ? '/dashboard' : '/profile', { replace: true })
  }

  return <section className="auth-page section"><div className="container auth-layout"><div className="auth-intro"><Link className="back-link" to="/"><ArrowLeft size={16} /> Back home</Link><div className="eyebrow"><Sparkles size={13} /> Your EduSearch account</div><h1>Find your next move, <em>with you.</em></h1><p>Save opportunities, keep your profile in sync, and return to recommendations made for you.</p></div><div className="auth-card"><div className="auth-card-heading"><div className="auth-icon"><LockKeyhole size={19} /></div><div><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Log in to continue your journey.' : 'Start with a free EduSearch profile.'}</p></div></div><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength="6" required /></label>{mode === 'signup' && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" minLength="6" required /></label>}{error && <div className="auth-message error">{error}</div>}{message && <div className="auth-message success"><Check size={15} /> {message}</div>}<button className="button button-primary auth-submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'} {!submitting && <ArrowRight size={16} />}</button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>{mode === 'login' ? 'New to EduSearch? Create an account' : 'Already have an account? Log in'}</button><small className="auth-note"><Mail size={13} /> We never expose your password in the EduSearch app.</small></div></div></section>
}

function ConfirmationState({ email, onBack }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const resend = async () => {
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await resendConfirmation(email)
      setMessage('A new confirmation email is on its way.')
    } catch (resendError) {
      const text = resendError?.message || ''
      setError(/already confirmed/i.test(text) ? 'This email is already confirmed. You can log in now.' : friendlyAuthError(resendError))
    } finally {
      setSubmitting(false)
    }
  }
  return <section className="auth-page section"><div className="container auth-card"><div className="auth-card-heading"><div className="auth-icon"><Mail size={19} /></div><div><h2>Check your email</h2><p>We sent a confirmation link to <strong>{email}</strong>.</p></div></div><p>Open the email and confirm your account. The link will return you to EduSearch, then send you to your profile or dashboard.</p>{error && <div className="auth-message error">{error}</div>}{message && <div className="auth-message success"><Check size={15} /> {message}</div>}<button className="button button-primary" onClick={resend} disabled={submitting}>{submitting ? 'Sending…' : 'Resend confirmation email'} <ArrowRight size={16} /></button><button className="auth-switch" onClick={onBack}>Back to login</button></div></section>
}

function NavigateToProfile() {
  return <NavigateTo path="/dashboard" />
}

function NavigateTo({ path }) {
  const navigate = useNavigate()
  React.useEffect(() => {
    getAuthenticatedProfile().then((profile) => navigate(profile ? '/dashboard' : path, { replace: true })).catch(() => navigate(path, { replace: true }))
  }, [navigate, path])
  return <LoadingState />
}
