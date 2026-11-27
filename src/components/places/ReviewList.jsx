import { usePlacesText } from '../../pages/places/placesText'
import StarRating from './StarRating'
import { EmptyState } from './Status'

const formatDate = (iso, locale) => new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })

// Only the current user's review gets edit / delete buttons.
export default function ReviewList({ reviews, me, onEdit, onDelete, busy }) {
  const t = usePlacesText()
  if (!reviews.length) return <EmptyState>{t.reviews.none}</EmptyState>

  return (
    <ul className="pl-review-list">
      {reviews.map((review) => {
        const mine = Boolean(me && review.authorId === me)
        return (
          <li key={review.id} className={mine ? 'pl-review is-mine' : 'pl-review'}>
            <div className="pl-review-head">
              <span className="pl-avatar" aria-hidden="true">{review.author.charAt(0)}</span>
              <div>
                <b>{review.author}</b>
                {mine && <span className="pl-chip">{t.reviews.you}</span>}
                <time className="pl-muted" dateTime={review.createdAt}>{formatDate(review.createdAt, t.locale)}</time>
              </div>
              <StarRating value={review.rating} />
            </div>
            <p>{review.comment}</p>
            {mine && (
              <div className="pl-form-actions">
                <button type="button" className="pl-btn-ghost" onClick={onEdit} disabled={busy}>{t.reviews.editBtn}</button>
                <button type="button" className="pl-btn-danger" onClick={onDelete} disabled={busy}>{t.reviews.deleteBtn}</button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
