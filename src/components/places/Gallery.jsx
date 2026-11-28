import { useState } from 'react'
import { usePlacesText } from '../../pages/places/placesText'

export default function Gallery({ pictures, name }) {
  const t = usePlacesText()
  const [active, setActive] = useState(0)
  const selected = pictures[active] ?? pictures[0]
  if (!selected) return null

  return (
    <div className="pl-gallery">
      <img className="pl-gallery-main" src={selected.url} alt={selected.alt || name} />
      {pictures.length > 1 && (
        <div className="pl-thumbs">
          {pictures.map((picture, index) => (
            <button
              key={picture.id}
              type="button"
              className={index === active ? 'is-on' : undefined}
              aria-label={t.details.photo(index + 1)}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <img src={picture.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
