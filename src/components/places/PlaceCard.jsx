import { Link } from 'react-router-dom'
import { t } from '../../pages/places/placesText'
import CompareButton from './CompareButton'
import StarRating from './StarRating'

export default function PlaceCard({ place }) {
  const link = `/places/${place.id}`

  return (
    <article className="pl-card">
      <Link to={link} className="pl-card-media" tabIndex={-1} aria-hidden="true">
        <img src={place.images[0]} alt="" loading="lazy" />
        <span className="pl-badge">{t.types[place.type]}</span>
      </Link>
      <div className="pl-card-body">
        <h3><Link to={link}>{place.name}</Link></h3>
        <p className="pl-muted">{place.city} · {place.entryFee ? t.card.fee(place.entryFee) : t.card.free}</p>
        <StarRating value={place.rating} count={place.reviewCount} />
        <p className="pl-card-text">{place.description}</p>
        <CompareButton id={place.id} />
      </div>
    </article>
  )
}
