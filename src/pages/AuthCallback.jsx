import React, { useEffect, useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import { getAuthenticatedProfile } from '../services/profileService'
import { getCurrentSession, useAuth } from '../services/authService'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallback() {
  const { configured, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!configured || loading) return undefined
    let mounted = true
    const finish = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code')
        if (code && supabase) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        }
        const session = await getCurrentSession()
        if (!session) throw new Error('This confirmation link is missing or has expired. Please request a new one.')
        const profile = await getAuthenticatedProfile()
        if (mounted) navigate(profile ? '/dashboard' : '/profile', { replace: true })
      } catch (callbackError) {
        if (mounted) setError(callbackError.message || 'We could not complete email confirmation.')
      }
    }
    finish()
    return () => { mounted = false }
  }, [configured, loading, navigate])

  if (error) return <section className="auth-page section"><div className="container auth-card"><div className="auth-message error"><X size={15} /> {error}</div><Link className="button button-primary" to="/login">Back to login <ArrowRight size={16} /></Link></div></section>
  if (!configured) return <section className="auth-page section"><div className="container auth-card"><div className="auth-message error">Authentication is not configured.</div><Link className="button button-primary" to="/">Back home <ArrowRight size={16} /></Link></div></section>
  return <section className="auth-page section"><div className="container auth-card"><div className="auth-message success"><Check size={15} /> Confirming your EduSearch account…</div><LoadingState /></div></section>
}
