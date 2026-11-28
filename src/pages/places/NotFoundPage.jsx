import { Link } from 'react-router-dom'
import { usePlacesText } from './placesText'

export default function NotFoundPage() {
  const t = usePlacesText()
  return (
    <div className="wrap pl-page pl-state">
      <h1>404</h1>
      <p>{t.status.notFound}</p>
      <Link to="/" className="pl-link-btn">{t.status.backHome}</Link>
    </div>
  )
}
