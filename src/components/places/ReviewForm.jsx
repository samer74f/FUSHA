import { useState } from 'react'
import { t } from '../../pages/places/placesText'
import StarRating from './StarRating'

// Create or edit a review. onSubmit({ author, rating, comment }) must return a promise.
export default function ReviewForm({ initial, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const issue = !rating ? t.reviews.needRating
      : !author.trim() ? t.reviews.needName
        : comment.trim().length < 10 ? t.reviews.needComment
          : ''
    setProblem(issue)
    if (issue) return
    setBusy(true)
    try {
      await onSubmit({ author: author.trim(), rating, comment: comment.trim() })
    } catch {
      setProblem(t.reviews.saveError)
      setBusy(false)
    }
  }

  return (
    <form className="pl-review-form" onSubmit={submit} noValidate>
      <h3>{initial ? t.reviews.edit : t.reviews.add}</h3>
      <StarRating value={rating} onChange={setRating} />
      <label>
        {t.reviews.name}
        <input className="pl-field" value={author} maxLength={40} onChange={(event) => setAuthor(event.target.value)} />
      </label>
      <label>
        {t.reviews.comment}
        <textarea className="pl-field" rows={3} value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} />
      </label>
      {problem && <p className="pl-form-error" role="alert">{problem}</p>}
      <div className="pl-form-actions">
        <button type="submit" disabled={busy}>{initial ? t.reviews.update : t.reviews.save}</button>
        {onCancel && <button type="button" className="pl-btn-ghost" onClick={onCancel}>{t.reviews.cancel}</button>}
      </div>
    </form>
  )
}
