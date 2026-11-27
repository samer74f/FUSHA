import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import CompareButton from '../../components/places/CompareButton'
import Gallery from '../../components/places/Gallery'
import MapView from '../../components/places/MapView'
import PlaceReviews from '../../components/places/PlaceReviews'
import StarRating from '../../components/places/StarRating'
import { ErrorState, Loading } from '../../components/places/Status'
import { useAsync } from '../../hooks/useAsync'
import { getPlace } from '../../services/placesService'
import { t } from './placesText'

export default function PlaceDetailsPage() {
  const { id } = useParams()
  const load = useCallback(() => getPlace(id), [id])
  const { data: place, error, reload } = useAsync(load)

  if (error) {
    return (
      <div className="wrap pl-page">
        {error.message === 'not-found' ? <ErrorState message={t.details.notFound} /> : <ErrorState onRetry={reload} />}
        <p className="pl-center"><Link to="/places" className="pl-link-btn">{t.details.back}</Link></p>
      </div>
    )
  }
  // Keep showing the page while it reloads (e.g. after a new review); show spinner only for a new place.
  if (!place || place.id !== id) return <div className="wrap pl-page"><Loading /></div>

  return (
    <div className="wrap pl-page">
      <Link to="/places" className="pl-back">{t.details.back}</Link>
      <header className="pl-details-head">
        <div className="pl-details-title">
          <p className="pl-chips">
            <span className="pl-chip">{t.types[place.type]}</span>
            <span className="pl-chip">{place.city}</span>
          </p>
          <h1>{place.name}</h1>
          <StarRating value={place.rating} count={place.reviewCount} />
        </div>
        <CompareButton id={place.id} />
      </header>

      <Gallery key={place.id} images={place.images} name={place.name} />

      <div className="pl-details-grid">
        <section className="pl-panel">
          <h2>{t.details.about}</h2>
          <p>{place.description}</p>
          <h3>{t.details.facilities}</h3>
          <ul className="pl-facilities">
            {place.facilities.map((key) => <li key={key}>{t.facilities[key]}</li>)}
          </ul>
        </section>
        <aside className="pl-panel">
          <h2>{t.details.info}</h2>
          <dl className="pl-info">
            <div><dt>{t.details.fee}</dt><dd>{place.entryFee ? t.card.fee(place.entryFee) : t.card.free}</dd></div>
            <div><dt>{t.details.season}</dt><dd>{place.season}</dd></div>
            <div><dt>{t.details.city}</dt><dd>{place.city}</dd></div>
          </dl>
          <h3>{t.details.location}</h3>
          <MapView lat={place.lat} lng={place.lng} name={place.name} />
        </aside>
      </div>

      <PlaceReviews key={place.id} placeId={place.id} onChange={reload} />
    </div>
  )
}
