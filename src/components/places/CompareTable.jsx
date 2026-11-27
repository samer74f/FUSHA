import { Link } from 'react-router-dom'
import { toggleCompare } from '../../hooks/useCompare'
import { usePlacesText } from '../../pages/places/placesText'
import StarRating from './StarRating'

export default function CompareTable({ places }) {
  const t = usePlacesText()
  const bestRating = Math.max(...places.map((place) => place.rating))

  return (
    <div className="pl-compare-scroll">
      <table className="pl-compare">
        <thead>
          <tr>
            <td />
            {places.map((place) => (
              <th key={place.id} scope="col">
                {place.pictures[0] && <img src={place.pictures[0].url} alt="" loading="lazy" />}
                <Link to={`/places/${place.id}`}>{place.name}</Link>
                <button type="button" className="pl-btn-ghost" onClick={() => toggleCompare(place.id)}>{t.compare.remove}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{t.compare.rows.rating}</th>
            {places.map((place) => {
              const best = places.length > 1 && place.rating === bestRating && place.rating > 0
              return (
                <td key={place.id} className={best ? 'is-best' : undefined}>
                  <StarRating value={place.rating} count={place.reviewCount} />
                  {best && <span className="pl-best-tag">{t.compare.best}</span>}
                </td>
              )
            })}
          </tr>
          <tr>
            <th scope="row">{t.compare.rows.city}</th>
            {places.map((place) => <td key={place.id}>{place.region || '—'}</td>)}
          </tr>
          <tr>
            <th scope="row">{t.compare.rows.type}</th>
            {places.map((place) => <td key={place.id}>{t.types[place.type] ?? place.typeName ?? '—'}</td>)}
          </tr>
          <tr>
            <th scope="row">{t.details.difficulty}</th>
            {places.map((place) => <td key={place.id}>{place.difficulty || '—'}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
