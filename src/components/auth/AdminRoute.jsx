import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { useStoreLocale } from '../../pages/store/storeLocale.js'

export default function AdminRoute({ children }) {
  const { language, direction, t } = useStoreLocale()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <main className="store-page" lang={language} dir={direction}>{t('Checking permissions…')}</main>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  const roles = Array.isArray(user.app_metadata?.roles) ? user.app_metadata.roles : []
  const isAdmin = user.app_metadata?.role === 'admin' || roles.includes('admin')

  if (!isAdmin) {
    return <main className="store-page" lang={language} dir={direction}><p className="store-state store-state-error">{t('You do not have permission to manage the store.')}</p></main>
  }

  return children
}
