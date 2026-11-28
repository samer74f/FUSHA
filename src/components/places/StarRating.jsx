import { usePlacesText } from '../../pages/places/placesText'

// Read-only stars (value + optional count), or a 1–5 picker when onChange is given.
export default function StarRating({ value = 0, count, onChange }) {
  const t = usePlacesText()
  if (onChange) {
    return (
      <div className="pl-stars-input" role="radiogroup" aria-label={t.reviews.yourRating}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={t.reviews.star(n)}
            className={n <= value ? 'is-on' : ''}
            onClick={() => onChange(n)}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <p className="pl-stars" aria-label={t.card.ratingLabel(value)}>
      <span className="pl-stars-track" style={{ '--pct': `${(value / 5) * 100}%` }} aria-hidden="true">★★★★★</span>
      <b aria-hidden="true">{value ? value.toFixed(1) : '—'}</b>
      {count !== undefined && <span className="pl-muted" aria-hidden="true">({t.card.reviews(count)})</span>}
    </p>
  )
}
