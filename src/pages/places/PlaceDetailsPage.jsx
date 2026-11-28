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
import { getLocalizedPlaceContent } from './placesData'
import { usePlacesText } from './placesText'

export default function PlaceDetailsPage() {
  const t = usePlacesText()
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
  if (!place || (place.id !== id.toLowerCase() && place.slug !== id)) return <div className="wrap pl-page"><Loading /></div>
  const category = t.types[place.type] ?? place.typeName
  const { name, region, description } = getLocalizedPlaceContent(place, t.language)
  const hasLocation = Number.isFinite(place.lat) && Number.isFinite(place.lng)

  return (
    <div className="wrap pl-page">
      <Link to="/places" className="pl-back">{t.details.back}</Link>
      <header className="pl-details-head">
        <div className="pl-details-title">
          <p className="pl-chips">
            {category && <span className="pl-chip">{category}</span>}
            {region && <span className="pl-chip" dir="auto">{region}</span>}
          </p>
          <h1 dir="auto">{name}</h1>
          <StarRating value={place.rating} count={place.reviewCount} />
        </div>
        <CompareButton id={place.id} />
      </header>

      <Gallery key={place.id} pictures={place.pictures} name={name} />

      <div className="pl-details-grid">
        <section className="pl-panel">
          <h2>{t.details.about}</h2>
          <p dir="auto">{description}</p>
        </section>
        <aside className="pl-panel">
          <h2>{t.details.info}</h2>
          <dl className="pl-info">
            {region && <div><dt>{t.details.city}</dt><dd dir="auto">{region}</dd></div>}
            {place.country && <div><dt>{t.details.country}</dt><dd>{place.country}</dd></div>}
            {place.difficulty && <div><dt>{t.details.difficulty}</dt><dd>{place.difficulty}</dd></div>}
          </dl>
          {hasLocation && (
            <>
              <h3>{t.details.location}</h3>
              <MapView lat={place.lat} lng={place.lng} name={name} />
            </>
          )}
        </aside>
      </div>

      <PlaceReviews key={place.id} placeId={place.id} onChange={reload} />
    </div>
  )
}
