import React from 'react'
import Navbar from '../navigation/Navbar'
import Footer from './Footer'
import { useAuth } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function Layout({ profile, children }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const logout = async () => {
    await auth.signOut()
    navigate('/')
  }
  return <><Navbar profile={profile} user={auth.user} onLogout={logout} /><main>{children}</main><Footer /></>
}
