import { useSearchParams } from 'react-router-dom'
import PlaceCard from '../../components/places/PlaceCard'
import PlaceFilters from '../../components/places/PlaceFilters'
import { EmptyState, ErrorState, Loading } from '../../components/places/Status'
import { useAsync } from '../../hooks/useAsync'
import { filterPlaces, getPlaces } from '../../services/placesService'
import { usePlacesText } from './placesText'

const loadPlaces = () => getPlaces()

export default function PlacesPage() {
  const t = usePlacesText()
  const [params, setParams] = useSearchParams()
  const { data: places, loading, error, reload } = useAsync(loadPlaces)
  const list = places ? filterPlaces(places, Object.fromEntries(params)) : null

  function change(key, value) {
    if (!key) return setParams({}, { replace: true })
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="wrap pl-page">
      <header className="pl-page-head">
        <h1>{t.explore.title}</h1>
        <p className="pl-muted">{t.explore.lead}</p>
      </header>
      <PlaceFilters places={places ?? []} params={params} onChange={change} />
      {error ? (
        <ErrorState onRetry={reload} />
      ) : !list ? (
        <Loading />
      ) : (
        <section aria-busy={loading} className={loading ? 'pl-dim' : undefined}>
          <p className="pl-count" aria-live="polite">{t.explore.count(list.length)}</p>
          {list.length ? (
            <div className="pl-grid">
              {list.map((place) => <PlaceCard key={place.id} place={place} />)}
            </div>
          ) : (
            <EmptyState>{t.explore.empty}</EmptyState>
          )}
        </section>
      )}
    </div>
  )
}
