import { MAX_COMPARE, toggleCompare, useCompare } from '../../hooks/useCompare'
import { usePlacesText } from '../../pages/places/placesText'

export default function CompareButton({ id }) {
  const t = usePlacesText()
  const compareIds = useCompare()
  const picked = compareIds.includes(id)
  const full = !picked && compareIds.length >= MAX_COMPARE

  return (
    <button
      type="button"
      className={`pl-btn-ghost${picked ? ' is-on' : ''}`}
      aria-pressed={picked}
      disabled={full}
      title={full ? t.compare.full : undefined}
      onClick={() => toggleCompare(id)}
    >
      {picked ? t.card.compareRemove : t.card.compareAdd}
    </button>
  )
}
