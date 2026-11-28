import { useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { getEquipmentCategories } from './equipmentCatalog'
import { Select } from './PackingList'

function contactHref(contact) {
  const value = String(contact ?? '').trim()
  if (/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
    return 'mailto:' + value
  }
  const digits = value.replace(/\D/g, '')
  if (/^\+?[0-9() -]+$/.test(value) && digits.length >= 7 && digits.length <= 15) {
    return 'tel:' + (value.startsWith('+') ? '+' : '') + digits
  }
  return ''
}

function ListingForm({ listing, owner, onSave, onClose, categories, text, contactAvailable }) {
  const [kind, setKind] = useState(listing?.kind ?? 'sale')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const get = name => String(fields.get(name) ?? '').trim()
    let image
    try {
      image = new URL(get('image_url'))
    } catch {
      setError('imageError')
      return
    }
    if (!['http:', 'https:'].includes(image.protocol)) {
      setError('imageError')
      return
    }
    const contact = get('contact')
    if (contact && !contactHref(contact)) {
      setError('contactError')
      return
    }
    const row = {
      owner_id: owner, kind, name: get('name'), category: get('category'),
      description: get('description'), condition: get('condition'), image_url: image.href,
      price: kind === 'sale' ? Number(get('price')) : null,
      currency: kind === 'sale' ? get('currency').toUpperCase() : null,
      loan_terms: kind === 'loan' ? get('loan_terms') : null,
    }
    if (contactAvailable && (contact || listing?.contact)) row.contact = contact || null
    if (!row.name || !row.description || (kind === 'loan' && !row.loan_terms)) {
      setError('required')
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
      setError('saveError')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="listing-form" onSubmit={save}>
      <h3>{listing ? text.editListing : text.add}</h3>
      <fieldset disabled={busy}>
        <label>{text.name}<input name="name" dir="auto" required maxLength={100} defaultValue={listing?.name} /></label>
        <Select label={text.category} name="category" options={categories} defaultValue={listing?.category} />
        <Select label={text.kind} name="kind" options={text.kinds} value={kind} onChange={event => setKind(event.target.value)} />
        <Select label={text.condition} name="condition" options={text.conditions} defaultValue={listing?.condition} />
        <label className="full">{text.image}
          <input dir="ltr" name="image_url" type="url" pattern="https?://.+" required defaultValue={listing?.image_url} />
        </label>
        <label className="full">{text.description}<textarea name="description" dir="auto" required maxLength={2000} defaultValue={listing?.description} /></label>
        {contactAvailable ? (
          <label className="full">{text.contact}
            <input name="contact" dir="ltr" maxLength={120} defaultValue={listing?.contact ?? ''} aria-describedby="listing-contact-hint" />
            <small id="listing-contact-hint">{text.contactHint}</small>
          </label>
        ) : (
          <p className="full equipment-contact muted">{text.contactUnavailable}</p>
        )}
        {kind === 'sale' ? <>
          <label>{text.price}<input name="price" type="number" min="0.01" max="99999999.99" step="0.01" required defaultValue={listing?.price} /></label>
          <label>{text.currency}
            <input name="currency" dir="ltr" required pattern="[A-Za-z]{3}" maxLength={3} placeholder="ILS" defaultValue={listing?.currency} />
          </label>
        </> : (
          <label className="full">{text.loanTerms}<textarea name="loan_terms" dir="auto" required maxLength={1000} defaultValue={listing?.loan_terms} /></label>
        )}
      </fieldset>
      {error && <p role="alert" className="notice">{text[error]}</p>}
      <div className="actions">
        <button disabled={busy}>{busy ? text.saving : text.save}</button>
        <button disabled={busy} type="button" className="secondary" onClick={onClose}>{text.cancel}</button>
      </div>
    </form>
  )
}

export default function UsedGear({ owner, listings, setListings, loading, failed, language, title, text, contactAvailable }) {
  const categories = getEquipmentCategories(language)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
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
      setError('deleteError')
    } finally {
      setBusy(false)
    }
  }

  function saved(row) {
    setListings(current => [row, ...current.filter(item => item.id !== row.id)])
    setFilter('all')
    setEditor(null)
  }

  const term = search.trim().toLocaleLowerCase(language)
  const visible = listings.filter(listing => (
    (filter === 'all' || listing.kind === filter) && listing.name.toLocaleLowerCase(language).includes(term)
  ))
  return (
    <section id="used" aria-labelledby="used-title">
      <div className="section-line">
        <h2 id="used-title">{title}</h2>
        {owner && !editor && !loading && <button onClick={() => setEditor({})}>{text.add}</button>}
      </div>
      {supabase && !owner && <p className="muted">{text.signIn}</p>}
      {!supabase && <p className="notice">{text.missingConnection}</p>}
      {editor && owner && (
        <ListingForm key={editor.id ?? 'new'} listing={editor.id ? editor : null}
          owner={owner} onSave={saved} onClose={() => setEditor(null)} categories={categories}
          text={text} contactAvailable={contactAvailable} />
      )}
      <label className="equipment-search">{text.search}
        <input type="search" dir="auto" value={search} onChange={event => setSearch(event.target.value)} />
      </label>
      <div className="filters" aria-label={text.filter}>
        {Object.entries({ all: text.all, ...text.kinds }).map(([key, label]) => (
          <button key={key} className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>
      {error && <p role="alert" className="notice">{text[error]}</p>}
      {loading && <p role="status">{text.loading}</p>}
      {!loading && !failed && supabase && !visible.length && <p className="empty">{term ? text.noMatches : text.empty}</p>}
      <div className="card-grid">
        {visible.map(row => {
          const href = contactHref(row.contact)
          return (
            <article className="card" key={row.id}>
              <img className="listing-img" src={row.image_url} alt={row.name} loading="lazy" referrerPolicy="no-referrer" />
              <div className="card-body">
                <span className="label">{text.kinds[row.kind]} · {categories[row.category]}</span>
                <h3 dir="auto">{row.name}</h3>
                <p dir="auto">{row.description}</p>
                <p>{text.condition} {text.conditions[row.condition]}</p>
                <p className="listing-value">{row.kind === 'sale'
                  ? new Intl.NumberFormat(language, { style: 'currency', currency: row.currency }).format(row.price)
                  : <>{text.loanTerms} · <bdi>{row.loan_terms}</bdi></>}</p>
                {href && <p className="equipment-contact">{text.contactLink} <a href={href}><bdi>{row.contact}</bdi></a></p>}
                {owner && row.owner_id === owner && (
                  deleting === row.id ? (
                    <div className="actions">
                      <button className="danger" disabled={busy} onClick={() => remove(row.id)}>{text.confirmDelete}</button>
                      <button className="secondary" disabled={busy} onClick={() => setDeleting(null)}>{text.cancel}</button>
                    </div>
                  ) : (
                    <div className="actions">
                      <button className="secondary" disabled={busy || Boolean(editor)} onClick={() => setEditor(row)}>{text.edit}</button>
                      <button className="quiet" disabled={busy || Boolean(editor)} onClick={() => setDeleting(row.id)}>{text.delete}</button>
                    </div>
                  )
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
