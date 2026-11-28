import { Link } from 'react-router-dom'
import { usePlacesText } from '../../pages/places/placesText'
import CompareButton from './CompareButton'
import StarRating from './StarRating'

export default function PlaceCard({ place }) {
  const t = usePlacesText()
  const link = `/places/${place.id}`
  const picture = place.pictures[0]
  const category = t.types[place.type] ?? place.typeName

  return (
    <article className="pl-card">
      <Link to={link} className="pl-card-media" tabIndex={-1} aria-hidden="true">
        {picture && <img src={picture.url} alt="" loading="lazy" />}
        {category && <span className="pl-badge">{category}</span>}
      </Link>
      <div className="pl-card-body">
        <h3><Link to={link}>{place.name}</Link></h3>
        {place.region && <p className="pl-muted">{place.region}</p>}
        <StarRating value={place.rating} count={place.reviewCount} />
        <p className="pl-card-text">{place.description}</p>
        <CompareButton id={place.id} />
      </div>
    </article>
  )
}
