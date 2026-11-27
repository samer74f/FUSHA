import { useState } from 'react'
import { t } from '../../pages/places/placesText'

// Big photo + thumbnails. Give it key={place.id} so it resets on a new place.
export default function Gallery({ images, name }) {
  const [active, setActive] = useState(0)

  return (
    <div className="pl-gallery">
      <img className="pl-gallery-main" src={images[active]} alt={`${name} – ${t.details.photo(active + 1)}`} />
      <div className="pl-thumbs">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            className={index === active ? 'is-on' : undefined}
            aria-label={t.details.photo(index + 1)}
            aria-pressed={index === active}
            onClick={() => setActive(index)}
          >
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}
