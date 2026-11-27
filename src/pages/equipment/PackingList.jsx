import { useEffect, useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { terrains, tripTypes } from './catalog'

export function Select({ label, options, ...props }) {
  return (
    <label>{label}
      <select {...props}>
        {Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  )
}

function PackingItems({ owner, trip, templates }) {
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
          setError('تعذّر تحميل القائمة. أعد فتح القسم للمحاولة مجددًا.')
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
  ).flatMap(template => template.items)
  const items = new Map(suggested.map(item => [item, { name: item, packed: false }]))
  changes.forEach(item => {
    if (item.removed) items.delete(item.name)
    else items.set(item.name, item)
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
      setError('تعذّر حفظ التغيير. حاول مجددًا.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function add(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (items.has(trimmed)) {
      setError('هذا العنصر موجود في القائمة.')
      return
    }
    if (await save({ name: trimmed, packed: false, removed: false })) setName('')
  }

  return <>
    {error && <p role="alert" className="notice">{error}</p>}
    {loading && <p role="status">جارٍ تحميل قائمتك…</p>}
    {!loading && !loadFailed && (
      <div className="packing-panel">
        <div className="section-line">
          <h3>قائمة رحلتك</h3>
          <span>{packedCount} من {items.size} تم تجهيزها</span>
        </div>
        <progress value={packedCount} max={items.size || 1} aria-label="تقدم التجهيز" />
        <ul className="checklist">
          {[...items.values()].map(item => (
            <li key={item.name}>
              <label className={item.packed ? 'checked' : ''}>
                <input type="checkbox" checked={item.packed} disabled={busy}
                  onChange={() => save({ name: item.name, packed: !item.packed, removed: false })} />
                {item.name}
              </label>
              <button className="quiet" type="button" disabled={busy}
                aria-label={'حذف ' + item.name} onClick={() => save({ name: item.name, packed: false, removed: true })}>
                حذف
              </button>
            </li>
          ))}
        </ul>
        {!items.size && <p>القائمة فارغة.</p>}
        <form className="inline-form" onSubmit={add}>
          <input value={name} onChange={event => setName(event.target.value)}
            required maxLength={120} aria-label="اسم عنصر جديد" placeholder="أضف عنصرًا إلى القائمة" />
          <button disabled={busy}>إضافة</button>
        </form>
      </div>
    )}
  </>
}

export default function PackingList({ owner, templates }) {
  const [trip, setTrip] = useState({ trip_type: 'hiking', terrain: 'mountain', days: 1 })

  function generate(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const next = { trip_type: fields.get('trip_type'), terrain: fields.get('terrain'), days: Number(fields.get('days')) }
    setTrip(current => Object.values(current).join(':') === Object.values(next).join(':') ? current : next)
  }

  return (
    <section id="packing" aria-labelledby="packing-title">
      <h2 id="packing-title">قائمة التجهيز الذكية</h2>
      <p className="muted">{owner ? 'تُحفظ القائمة في حسابك.' : 'تُحفظ قائمة الضيف على هذا المتصفح.'}</p>
      <form className="trip-form" onSubmit={generate}>
        <Select label="نوع الرحلة" name="trip_type" options={tripTypes} defaultValue={trip.trip_type} />
        <label>مدة الرحلة بالأيام
          <input type="number" name="days" min="1" max="365" defaultValue={trip.days} required />
        </label>
        <Select label="طبيعة الرحلة" name="terrain" options={terrains} defaultValue={trip.terrain} />
        <button>عرض القائمة</button>
      </form>
      <PackingItems key={[owner, ...Object.values(trip)].join(':')} owner={owner} trip={trip} templates={templates} />
    </section>
  )
}
