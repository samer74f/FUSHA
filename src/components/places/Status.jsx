import { t } from '../../pages/places/placesText'

export function Loading() {
  return (
    <div className="pl-state" role="status">
      <span className="pl-spinner" aria-hidden="true" />
      <p>{t.status.loading}</p>
    </div>
  )
}

export function ErrorState({ message = t.status.error, onRetry }) {
  return (
    <div className="pl-state pl-state-error" role="alert">
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>{t.status.retry}</button>}
    </div>
  )
}

export function EmptyState({ children }) {
  return <div className="pl-state">{children}</div>
}
