import { Link } from 'react-router-dom'
import { toggleCompare } from '../../hooks/useCompare'
import { t } from '../../pages/places/placesText'
import StarRating from './StarRating'

// Side-by-side table; with 2+ places the best rating and lowest fee are highlighted.
export default function CompareTable({ places }) {
  const many = places.length > 1
  const bestRating = Math.max(...places.map((place) => place.rating))
  const knownFees = places.map((place) => place.entryFee).filter((fee) => fee !== null && fee !== undefined)
  const lowestFee = knownFees.length ? Math.min(...knownFees) : null
  const facilities = [...new Set(places.flatMap((place) => place.facilities))]
  const best = (on) => (many && on ? 'is-best' : undefined)
  const bestTag = (on) => many && on && <span className="pl-best-tag">{t.compare.best}</span>

  return (
    <div className="pl-compare-scroll">
      <table className="pl-compare">
        <thead>
          <tr>
            <td />
            {places.map((place) => (
              <th key={place.id} scope="col">
                <img src={place.images[0]} alt="" loading="lazy" />
                <Link to={`/places/${place.id}`}>{place.name}</Link>
                <button type="button" className="pl-btn-ghost" onClick={() => toggleCompare(place.id)}>{t.compare.remove}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{t.compare.rows.rating}</th>
            {places.map((place) => (
              <td key={place.id} className={best(place.rating === bestRating && place.rating > 0)}>
                <StarRating value={place.rating} count={place.reviewCount} />
                {bestTag(place.rating === bestRating && place.rating > 0)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">{t.compare.rows.fee}</th>
            {places.map((place) => (
              <td key={place.id} className={best(lowestFee !== null && place.entryFee === lowestFee)}>
                {place.entryFee != null ? t.card.fee(place.entryFee) : t.card.free}
                {bestTag(lowestFee !== null && place.entryFee === lowestFee)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">{t.compare.rows.city}</th>
            {places.map((place) => <td key={place.id}>{place.city}</td>)}
          </tr>
          <tr>
            <th scope="row">{t.compare.rows.type}</th>
            {places.map((place) => <td key={place.id}>{t.types[place.type]}</td>)}
          </tr>
          <tr>
            <th scope="row">{t.compare.rows.season}</th>
            {places.map((place) => <td key={place.id}>{place.season}</td>)}
          </tr>
          <tr className="pl-compare-group">
            <th scope="rowgroup" colSpan={places.length + 1}>{t.compare.rows.facilities}</th>
          </tr>
          {facilities.map((key) => (
            <tr key={key}>
              <th scope="row">{t.facilities[key]}</th>
              {places.map((place) => {
                const has = place.facilities.includes(key)
                return <td key={place.id} className={has ? 'pl-yes' : 'pl-no'}>{has ? '✓' : '—'}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
