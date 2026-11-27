import { useEffect, useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { getPackingOptions } from './equipmentCatalog'

export function Select({ label, options, ...props }) {
  return (
    <label>{label}
      <select {...props}>
        {Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  )
}

function PackingItems({ owner, trip, templates, text }) {
  const localKey = 'fusha:packing:' + Object.values(trip).join(':')
  const [changes, setChanges] = useState(() => {
    if (owner) return []
    try { return JSON.parse(localStorage.getItem(localKey)) ?? [] }
    catch { return [] }
  })
  const [loading, setLoading] = useState(Boolean(owner))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!owner) return
    let active = true
    result(supabase.from('packing_items').select('name, packed, removed')
      .match({ owner_id: owner, ...trip }))
      .then(rows => { if (active) setChanges(rows) })
      .catch(() => {
        if (active) {
          setError('loadError')
          setLoadFailed(true)
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [owner, trip])

  const suggested = templates.filter(template =>
    (!template.trip_type || template.trip_type === trip.trip_type)
    && (!template.terrain || template.terrain === trip.terrain)
    && (template.min_days ?? 1) <= trip.days
  ).flatMap(template => template.items.map((name, index) => ({
    name, label: template.itemLabels?.[index] ?? name, packed: false,
  })))
  const items = new Map(suggested.map(item => [item.name, item]))
  changes.forEach(item => {
    if (item.removed) items.delete(item.name)
    else items.set(item.name, { ...item, label: items.get(item.name)?.label ?? item.name })
  })
  const packedCount = [...items.values()].filter(item => item.packed).length

  async function save(item) {
    setError('')
    setBusy(true)
    const next = [...changes.filter(change => change.name !== item.name), item]
    try {
      if (owner) {
        await result(supabase.from('packing_items').upsert({
          ...trip, owner_id: owner, ...item,
        }, { onConflict: 'owner_id,trip_type,terrain,days,name' }))
      } else {
        localStorage.setItem(localKey, JSON.stringify(next))
      }
      setChanges(next)
      return true
    } catch {
      setError('saveError')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function add(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (items.has(trimmed) || [...items.values()].some(item => item.label === trimmed)) {
      setError('duplicate')
      return
    }
    if (await save({ name: trimmed, packed: false, removed: false })) setName('')
  }

  return <>
    {error && <p role="alert" className="notice">{text[error]}</p>}
    {loading && <p role="status">{text.loading}</p>}
    {!loading && !loadFailed && (
      <div className="packing-panel">
        <div className="section-line">
          <h3>{text.checklist}</h3>
          <span>{text.count(packedCount, items.size)}</span>
        </div>
        <progress value={packedCount} max={items.size || 1} aria-label={text.progress} />
        <ul className="checklist">
          {[...items.values()].map(item => (
            <li key={item.name}>
              <label className={item.packed ? 'checked' : ''}>
                <input type="checkbox" checked={item.packed} disabled={busy}
                  onChange={() => save({ name: item.name, packed: !item.packed, removed: false })} />
                <bdi>{item.label}</bdi>
              </label>
              <button className="quiet" type="button" disabled={busy}
                aria-label={text.remove + ' ' + item.label} onClick={() => save({ name: item.name, packed: false, removed: true })}>
                {text.remove}
              </button>
            </li>
          ))}
        </ul>
        {!items.size && <p>{text.empty}</p>}
        <form className="inline-form" onSubmit={add}>
          <input dir="auto" value={name} onChange={event => setName(event.target.value)}
            required maxLength={120} aria-label={text.newItem} placeholder={text.placeholder} />
          <button disabled={busy}>{text.add}</button>
        </form>
      </div>
    )}
  </>
}

export default function PackingList({ owner, templates, language, text }) {
  const { tripTypes, terrains } = getPackingOptions(language)
  const [trip, setTrip] = useState({ trip_type: 'hiking', terrain: 'mountain', days: 1 })

  function generate(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const next = { trip_type: fields.get('trip_type'), terrain: fields.get('terrain'), days: Number(fields.get('days')) }
    setTrip(current => Object.values(current).join(':') === Object.values(next).join(':') ? current : next)
  }

  return (
    <section id="packing" aria-labelledby="packing-title">
      <h2 id="packing-title">{text.title}</h2>
      <p className="muted">{owner ? text.accountNote : text.guestNote}</p>
      <form className="trip-form" onSubmit={generate}>
        <Select label={text.tripType} name="trip_type" options={tripTypes} defaultValue={trip.trip_type} />
        <label>{text.tripLength}
          <input type="number" name="days" min="1" max="365" defaultValue={trip.days} required />
        </label>
        <Select label={text.terrain} name="terrain" options={terrains} defaultValue={trip.terrain} />
        <button>{text.show}</button>
      </form>
      <PackingItems key={[owner, ...Object.values(trip)].join(':')} owner={owner} trip={trip} templates={templates} text={text} />
    </section>
  )
}
