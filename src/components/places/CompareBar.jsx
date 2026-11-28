import { Link, useLocation } from 'react-router-dom'
import { clearCompare, useCompare } from '../../hooks/useCompare'
import { usePlacesText } from '../../pages/places/placesText'

// Floating bar on every page (except /compare) once a place is picked.
export default function CompareBar() {
  const t = usePlacesText()
  const ids = useCompare()
  const { pathname } = useLocation()
  if (!ids.length || pathname === '/compare') return null

  return (
    <div className="pl-compare-bar" role="region" aria-label={t.nav.compare}>
      <span aria-live="polite">{t.compare.bar(ids.length)}</span>
      <Link to="/compare" className="pl-link-btn">{t.compare.open}</Link>
      <button type="button" className="pl-btn-ghost" onClick={clearCompare}>{t.compare.clear}</button>
    </div>
  )
}
