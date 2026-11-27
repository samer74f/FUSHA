import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import PlaceCard from '../../components/places/PlaceCard'
import PlaceFilters from '../../components/places/PlaceFilters'
import { EmptyState, ErrorState, Loading } from '../../components/places/Status'
import { useAsync } from '../../hooks/useAsync'
import { getPlaces } from '../../services/placesService'
import { t } from './placesText'

export default function PlacesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.toString()
  const load = useCallback(() => getPlaces(Object.fromEntries(new URLSearchParams(query))), [query])
  const { data: list, loading, error, reload } = useAsync(load)

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
      <PlaceFilters params={params} onChange={change} />
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
