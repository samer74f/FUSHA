import { useCallback, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { t } from '../../pages/places/placesText'
import { addReview, deleteReview, getReviewerId, getReviews, updateReview } from '../../services/placesService'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import { ErrorState, Loading } from './Status'

// Reviews section of a place: one review per user; onChange() lets the page refresh its average.
export default function PlaceReviews({ placeId, onChange }) {
  const load = useCallback(() => getReviews(placeId), [placeId])
  const { data: reviews, error, reload } = useAsync(load)
  const [me] = useState(getReviewerId)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const mine = reviews?.find((review) => review.authorId === me)

  async function save(values) {
    if (mine) await updateReview(mine.id, values)
    else await addReview({ placeId, ...values })
    setEditing(false)
    reload()
    onChange()
  }

  async function remove() {
    if (!window.confirm(t.reviews.confirmDelete)) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteReview(mine.id)
      reload()
      onChange()
    } catch {
      setDeleteError(t.reviews.saveError)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="pl-panel pl-reviews" aria-labelledby="pl-reviews-title">
      <h2 id="pl-reviews-title">{t.reviews.title}</h2>
      {error ? (
        <ErrorState onRetry={reload} />
      ) : !reviews ? (
        <Loading />
      ) : (
        <>
          {(!mine || editing) && (
            <ReviewForm
              key={editing ? mine.id : 'new'}
              initial={editing ? mine : undefined}
              onSubmit={save}
              onCancel={editing ? () => setEditing(false) : undefined}
            />
          )}
          {deleteError && <p className="pl-form-error" role="alert">{deleteError}</p>}
          <ReviewList reviews={reviews} me={me} busy={deleting} onEdit={() => setEditing(true)} onDelete={remove} />
        </>
      )}
    </section>
  )
}
