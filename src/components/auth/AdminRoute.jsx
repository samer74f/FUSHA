import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <main className="store-page">Checking permissions…</main>
  if (!user) return <Navigate to="/login" replace />

  const roles = Array.isArray(user.app_metadata?.roles) ? user.app_metadata.roles : []
  const isAdmin = user.app_metadata?.role === 'admin' || roles.includes('admin')

  if (!isAdmin) {
    return <main className="store-page" dir="ltr"><p className="store-state store-state-error">You do not have permission to manage the store.</p></main>
  }

  return children
}
