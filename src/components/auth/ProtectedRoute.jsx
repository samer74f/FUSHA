import { Navigate, useLocation } from 'react-router-dom'
import { authText } from './accountText.js'
import { useAuth } from './useAuth.js'

export default function ProtectedRoute({ children, language = 'en' }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="auth-page" lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} aria-live="polite">
        <p className="auth-message">{authText[language].checkingSession}</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
