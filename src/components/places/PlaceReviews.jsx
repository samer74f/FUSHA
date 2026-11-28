import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { useAsync } from '../../hooks/useAsync'
import { usePlacesText } from '../../pages/places/placesText'
import { addReview, deleteReview, getReviews, updateReview } from '../../services/placesService'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import { ErrorState, Loading } from './Status'

export default function PlaceReviews({ placeId, onChange }) {
  const t = usePlacesText()
  const { user, loading: sessionLoading } = useAuth()
  const location = useLocation()
  const me = user?.id ?? null
  const load = useCallback(
    () => getReviews(placeId, Boolean(me)),
    [placeId, me],
  )
  const { data: reviews, error, reload } = useAsync(load)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const mine = me ? reviews?.find((review) => review.authorId === me) : null
  const returnPath = location.pathname + location.search + location.hash

  async function save(values) {
    if (mine) await updateReview(mine.id, values)
    else await addReview({ placeId, ...values })
    setEditing(false)
    reload()
    onChange()
  }

  async function remove() {
    if (!mine || !window.confirm(t.reviews.confirmDelete)) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteReview(mine.id)
      setEditing(false)
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
      {error?.code === 'PGRST205' ? (
        <p className="pl-muted">{t.reviews.unavailable}</p>
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : !reviews ? (
        <Loading />
      ) : (
        <>
          {!sessionLoading && !me && (
            <p className="pl-muted">
              <Link to="/login" state={{ from: { pathname: returnPath } }}>{t.reviews.signIn}</Link>
            </p>
          )}
          {me && (!mine || editing) && (
            <ReviewForm
              key={editing ? mine?.id : me}
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
