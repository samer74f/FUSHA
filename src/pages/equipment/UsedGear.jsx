import { useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { categories } from './catalog'
import { Select } from './PackingList'

const kinds = { sale: 'للبيع', loan: 'للإعارة' }
const conditions = { excellent: 'ممتازة', good: 'جيدة', fair: 'مقبولة' }

function ListingForm({ listing, owner, onSave, onClose }) {
  const [kind, setKind] = useState(listing?.kind ?? 'sale')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const get = name => String(fields.get(name) ?? '').trim()
    const image = new URL(get('image_url'))
    if (!['http:', 'https:'].includes(image.protocol)) {
      setError('أدخل رابط صورة يبدأ بـ https أو http.')
      return
    }
    const row = {
      owner_id: owner, kind, name: get('name'), category: get('category'),
      description: get('description'), condition: get('condition'), image_url: image.href,
      price: kind === 'sale' ? Number(get('price')) : null,
      currency: kind === 'sale' ? get('currency').toUpperCase() : null,
      loan_terms: kind === 'loan' ? get('loan_terms') : null,
    }
    if (!row.name || !row.description || (kind === 'loan' && !row.loan_terms)) {
      setError('أكمل الحقول المطلوبة.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const table = supabase.from('equipment')
      const query = listing
        ? table.update(row).match({ id: listing.id, owner_id: owner })
        : table.insert(row)
      onSave(await result(query.select().single()))
    } catch {
      setError('تعذّر حفظ الإعلان. راجع الحقول وحاول مجددًا.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="listing-form" onSubmit={save}>
      <h3>{listing ? 'تعديل الإعلان' : 'إضافة إعلان'}</h3>
      <fieldset disabled={busy}>
        <label>اسم المعدّة<input name="name" required maxLength={100} defaultValue={listing?.name} /></label>
        <Select label="الفئة" name="category" options={categories} defaultValue={listing?.category} />
        <Select label="نوع الإعلان" name="kind" options={kinds} value={kind} onChange={event => setKind(event.target.value)} />
        <Select label="الحالة" name="condition" options={conditions} defaultValue={listing?.condition} />
        <label className="full">رابط الصورة
          <input dir="ltr" name="image_url" type="url" pattern="https?://.+" required defaultValue={listing?.image_url} />
        </label>
        <label className="full">الوصف<textarea name="description" required maxLength={2000} defaultValue={listing?.description} /></label>
        {kind === 'sale' ? <>
          <label>السعر<input name="price" type="number" min="0.01" max="99999999.99" step="0.01" required defaultValue={listing?.price} /></label>
          <label>رمز العملة
            <input name="currency" dir="ltr" required pattern="[A-Za-z]{3}" maxLength={3} placeholder="ILS" defaultValue={listing?.currency} />
          </label>
        </> : (
          <label className="full">شروط الإعارة<textarea name="loan_terms" required maxLength={1000} defaultValue={listing?.loan_terms} /></label>
        )}
      </fieldset>
      {error && <p role="alert" className="notice">{error}</p>}
      <div className="actions">
        <button disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ الإعلان'}</button>
        <button disabled={busy} type="button" className="secondary" onClick={onClose}>إلغاء</button>
      </div>
    </form>
  )
}

export default function UsedGear({ owner, listings, setListings, loading, failed }) {
  const [filter, setFilter] = useState('all')
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function remove(id) {
    setBusy(true)
    setError('')
    try {
      await result(supabase.from('equipment').delete().match({ id, owner_id: owner }).select('id').single())
      setListings(current => current.filter(row => row.id !== id))
      setDeleting(null)
    } catch {
      setError('تعذّر حذف الإعلان. حاول مجددًا.')
    } finally {
      setBusy(false)
    }
  }

  function saved(row) {
    setListings(current => [row, ...current.filter(item => item.id !== row.id)])
    setFilter('all')
    setEditor(null)
  }

  const visible = listings.filter(listing => filter === 'all' || listing.kind === filter)
  return (
    <section id="used" aria-labelledby="used-title">
      <div className="section-line">
        <h2 id="used-title">المعدات المستعملة</h2>
        {owner && !editor && !loading && <button onClick={() => setEditor({})}>إضافة إعلان</button>}
      </div>
      {supabase && !owner && <p className="muted">سجّل الدخول لإضافة إعلان للبيع أو الإعارة.</p>}
      {!supabase && <p className="notice">تظهر الإعلانات عند ربط المشروع بـ Supabase.</p>}
      {editor && owner && (
        <ListingForm key={editor.id ?? 'new'} listing={editor.id ? editor : null}
          owner={owner} onSave={saved} onClose={() => setEditor(null)} />
      )}
      <div className="filters" aria-label="تصفية الإعلانات">
        {Object.entries({ all: 'الكل', ...kinds }).map(([key, label]) => (
          <button key={key} className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>
      {error && <p role="alert" className="notice">{error}</p>}
      {loading && <p role="status">جارٍ تحميل الإعلانات…</p>}
      {!loading && !failed && supabase && !visible.length && <p className="empty">لا توجد إعلانات في هذه الفئة.</p>}
      <div className="card-grid">
        {visible.map(row => (
          <article className="card" key={row.id}>
            <img className="listing-img" src={row.image_url} alt={row.name} loading="lazy" referrerPolicy="no-referrer" />
            <div className="card-body">
              <span className="label">{kinds[row.kind]} · {categories[row.category]}</span>
              <h3>{row.name}</h3>
              <p>{row.description}</p>
              <p>الحالة {conditions[row.condition]}</p>
              <p className="listing-value">{row.kind === 'sale'
                ? new Intl.NumberFormat('ar', { style: 'currency', currency: row.currency }).format(row.price)
                : 'شروط الإعارة: ' + row.loan_terms}</p>
              {row.owner_id === owner && (
                deleting === row.id ? (
                  <div className="actions">
                    <button className="danger" disabled={busy} onClick={() => remove(row.id)}>تأكيد الحذف</button>
                    <button className="secondary" disabled={busy} onClick={() => setDeleting(null)}>إلغاء</button>
                  </div>
                ) : (
                  <div className="actions">
                    <button className="secondary" disabled={busy || Boolean(editor)} onClick={() => setEditor(row)}>تعديل</button>
                    <button className="quiet" disabled={busy || Boolean(editor)} onClick={() => setDeleting(row.id)}>حذف</button>
                  </div>
                )
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
