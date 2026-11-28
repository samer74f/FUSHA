import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import CompareTable from '../../components/places/CompareTable'
import { EmptyState, ErrorState, Loading } from '../../components/places/Status'
import { useAsync } from '../../hooks/useAsync'
import { MAX_COMPARE, clearCompare, toggleCompare, useCompare } from '../../hooks/useCompare'
import { getPlaces, getPlacesByIds } from '../../services/placesService'
import { getLocalizedPlaceContent } from './placesData'
import { usePlacesText } from './placesText'

const loadAll = () => getPlaces({ sort: 'name' })

export default function ComparePage() {
  const t = usePlacesText()
  const ids = useCompare()
  const key = ids.join(',')
  const load = useCallback(() => getPlacesByIds(key ? key.split(',') : []), [key])
  const { data: chosen, error, reload } = useAsync(load)
  const { data: all } = useAsync(loadAll)
  const options = all?.filter((place) => !ids.includes(place.id)) ?? []
  const visible = chosen?.filter((place) => ids.includes(place.id))
    .map((place) => ({ ...place, ...getLocalizedPlaceContent(place, t.language) }))

  return (
    <div className="wrap pl-page">
      <header className="pl-page-head">
        <h1>{t.compare.title}</h1>
        <p className="pl-muted">{t.compare.lead}</p>
      </header>

      <div className="pl-compare-tools">
        {ids.length < MAX_COMPARE && options.length > 0 && (
          <label>
            {t.compare.pick}
            <select className="pl-field" value="" onChange={(event) => event.target.value && toggleCompare(event.target.value)}>
              <option value="">—</option>
              {options.map((place) => (
                <option key={place.id} value={place.id}>{getLocalizedPlaceContent(place, t.language).name}</option>
              ))}
            </select>
          </label>
        )}
        {ids.length > 0 && <button type="button" className="pl-btn-ghost" onClick={clearCompare}>{t.compare.clear}</button>}
      </div>

      {!ids.length ? (
        <EmptyState>
          <p>{t.compare.empty}</p>
          <Link to="/places" className="pl-link-btn">{t.compare.browse}</Link>
        </EmptyState>
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : !chosen ? (
        <Loading />
      ) : visible.length ? (
        <CompareTable places={visible} />
      ) : (
        <EmptyState><Link to="/places">{t.compare.browse}</Link></EmptyState>
      )}
    </div>
  )
}
