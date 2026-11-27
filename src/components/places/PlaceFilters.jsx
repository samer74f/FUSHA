import { usePlacesText } from '../../pages/places/placesText'

const minRatings = ['4.5', '4', '3']

export default function PlaceFilters({ places, params, onChange }) {
  const t = usePlacesText()
  const regions = [...new Set(places.map((place) => place.region).filter(Boolean))].sort()
  const categories = [...new Map(places.filter((place) => place.type)
    .map((place) => [place.type, t.types[place.type] ?? place.typeName])).entries()]
  const bind = (key) => ({ value: params.get(key) ?? '', onChange: (event) => onChange(key, event.target.value) })

  return (
    <form className="pl-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <input type="search" className="pl-search" placeholder={t.explore.search} aria-label={t.explore.search} {...bind('q')} />
      <label>
        {t.explore.city}
        <select {...bind('city')}>
          <option value="">{t.explore.all}</option>
          {regions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </label>
      <label>
        {t.explore.type}
        <select {...bind('type')}>
          <option value="">{t.explore.all}</option>
          {categories.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
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
