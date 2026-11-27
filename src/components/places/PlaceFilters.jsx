import { cities, placeTypes } from '../../pages/places/placesData'
import { t } from '../../pages/places/placesText'

const minRatings = ['4.5', '4', '3']

// Controlled by URL search params; onChange(key, value), or onChange(null) to reset all.
export default function PlaceFilters({ params, onChange }) {
  const bind = (key) => ({ value: params.get(key) ?? '', onChange: (event) => onChange(key, event.target.value) })

  return (
    <form className="pl-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <input type="search" className="pl-search" placeholder={t.explore.search} aria-label={t.explore.search} {...bind('q')} />
      <label>
        {t.explore.city}
        <select {...bind('city')}>
          <option value="">{t.explore.all}</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
      </label>
      <label>
        {t.explore.type}
        <select {...bind('type')}>
          <option value="">{t.explore.all}</option>
          {placeTypes.map((type) => <option key={type} value={type}>{t.types[type]}</option>)}
        </select>
      </label>
      <label>
        {t.explore.minRating}
        <select {...bind('minRating')}>
          <option value="">{t.explore.anyRating}</option>
          {minRatings.map((v) => <option key={v} value={v}>{t.explore.ratingOption(v)}</option>)}
        </select>
      </label>
      <label>
        {t.explore.sort}
        <select {...bind('sort')}>
          {Object.entries(t.sort).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <button type="button" className="pl-btn-ghost" onClick={() => onChange(null)}>{t.explore.reset}</button>
    </form>
  )
}
