import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="auth-page" aria-live="polite">
        <p className="auth-message">Checking your session…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
