import { useState } from 'react'
import { usePlacesText } from '../../pages/places/placesText'
import StarRating from './StarRating'

export default function ReviewForm({ initial, onSubmit, onCancel }) {
  const t = usePlacesText()
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const cleanComment = comment.trim()
    const length = Array.from(cleanComment).length
    const issue = !rating ? t.reviews.needRating
      : (length < 10 || length > 500) ? t.reviews.needComment
        : ''
    setProblem(issue)
    if (issue) return
    setBusy(true)
    try {
      await onSubmit({ rating, comment: cleanComment })
    } catch {
      setProblem(t.reviews.saveError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pl-review-form" onSubmit={submit} noValidate>
      <h3>{initial ? t.reviews.edit : t.reviews.add}</h3>
      <StarRating value={rating} onChange={setRating} />
      <label>
        {t.reviews.comment}
        <textarea className="pl-field" rows={3} value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} />
      </label>
      {problem && <p className="pl-form-error" role="alert">{problem}</p>}
      <div className="pl-form-actions">
        <button type="submit" disabled={busy}>{initial ? t.reviews.update : t.reviews.save}</button>
        {onCancel && <button type="button" className="pl-btn-ghost" onClick={onCancel} disabled={busy}>{t.reviews.cancel}</button>}
      </div>
    </form>
  )
}
