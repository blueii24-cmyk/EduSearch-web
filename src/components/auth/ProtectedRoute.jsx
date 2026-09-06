import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../common/LoadingState'
import { useAuth } from '../../services/authService'

export default function ProtectedRoute() {
  const { configured, loading, user } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingState />
  if (configured && !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
