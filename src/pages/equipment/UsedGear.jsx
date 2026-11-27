import { useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { categories } from './equipmentCatalog'
import { Select } from './PackingList'

const kinds = { sale: 'For sale', loan: 'For loan' }
const conditions = { excellent: 'Excellent', good: 'Good', fair: 'Fair' }

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
      setError('Enter an image URL that starts with https:// or http://.')
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
      setError('Complete the required fields.')
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
      setError('Unable to save the listing. Check the fields and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="listing-form" onSubmit={save}>
      <h3>{listing ? 'Edit listing' : 'Add listing'}</h3>
      <fieldset disabled={busy}>
        <label>Equipment name<input name="name" required maxLength={100} defaultValue={listing?.name} /></label>
        <Select label="Category" name="category" options={categories} defaultValue={listing?.category} />
        <Select label="Listing type" name="kind" options={kinds} value={kind} onChange={event => setKind(event.target.value)} />
        <Select label="Condition" name="condition" options={conditions} defaultValue={listing?.condition} />
        <label className="full">Image URL
          <input dir="ltr" name="image_url" type="url" pattern="https?://.+" required defaultValue={listing?.image_url} />
        </label>
        <label className="full">Description<textarea name="description" required maxLength={2000} defaultValue={listing?.description} /></label>
        {kind === 'sale' ? <>
          <label>Price<input name="price" type="number" min="0.01" max="99999999.99" step="0.01" required defaultValue={listing?.price} /></label>
          <label>Currency code
            <input name="currency" dir="ltr" required pattern="[A-Za-z]{3}" maxLength={3} placeholder="ILS" defaultValue={listing?.currency} />
          </label>
        </> : (
          <label className="full">Loan terms<textarea name="loan_terms" required maxLength={1000} defaultValue={listing?.loan_terms} /></label>
        )}
      </fieldset>
      {error && <p role="alert" className="notice">{error}</p>}
      <div className="actions">
        <button disabled={busy}>{busy ? 'Saving…' : 'Save listing'}</button>
        <button disabled={busy} type="button" className="secondary" onClick={onClose}>Cancel</button>
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
      setError('Unable to delete the listing. Try again.')
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
        <h2 id="used-title">Used Equipment</h2>
        {owner && !editor && !loading && <button onClick={() => setEditor({})}>Add listing</button>}
      </div>
      {supabase && !owner && <p className="muted">Sign in to list equipment for sale or loan.</p>}
      {!supabase && <p className="notice">Listings are available when the project is connected to Supabase.</p>}
      {editor && owner && (
        <ListingForm key={editor.id ?? 'new'} listing={editor.id ? editor : null}
          owner={owner} onSave={saved} onClose={() => setEditor(null)} />
      )}
      <div className="filters" aria-label="Filter listings">
        {Object.entries({ all: 'All', ...kinds }).map(([key, label]) => (
          <button key={key} className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>
      {error && <p role="alert" className="notice">{error}</p>}
      {loading && <p role="status">Loading listings…</p>}
      {!loading && !failed && supabase && !visible.length && <p className="empty">No listings in this category.</p>}
      <div className="card-grid">
        {visible.map(row => (
          <article className="card" key={row.id}>
            <img className="listing-img" src={row.image_url} alt={row.name} loading="lazy" referrerPolicy="no-referrer" />
            <div className="card-body">
              <span className="label">{kinds[row.kind]} · {categories[row.category]}</span>
              <h3>{row.name}</h3>
              <p>{row.description}</p>
              <p>Condition {conditions[row.condition]}</p>
              <p className="listing-value">{row.kind === 'sale'
                ? new Intl.NumberFormat('en', { style: 'currency', currency: row.currency }).format(row.price)
                : 'Loan terms · ' + row.loan_terms}</p>
              {row.owner_id === owner && (
                deleting === row.id ? (
                  <div className="actions">
                    <button className="danger" disabled={busy} onClick={() => remove(row.id)}>Confirm deletion</button>
                    <button className="secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="actions">
                    <button className="secondary" disabled={busy || Boolean(editor)} onClick={() => setEditor(row)}>Edit</button>
                    <button className="quiet" disabled={busy || Boolean(editor)} onClick={() => setDeleting(row.id)}>Delete</button>
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
