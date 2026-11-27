import { useEffect, useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { categories, getEquipmentCategories, guide, localizeGuideRow, localizeTemplateRow, templates } from './equipmentCatalog'
import { equipmentText } from './equipmentText'
import PackingList from './PackingList'
import UsedGear from './UsedGear'

function Account({ owner, text }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  if (!supabase) return null

  async function signIn(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const email = new FormData(event.currentTarget).get('email')
      await result(supabase.auth.signInWithOtp({
        email, options: { emailRedirectTo: window.location.origin + window.location.pathname },
      }))
      setMessage('sent')
    } catch {
      setMessage('signInError')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    setMessage('')
    try { await result(supabase.auth.signOut()) }
    catch { setMessage('signOutError') }
    finally { setBusy(false) }
  }

  return (
    <div className="account">
      {owner
        ? <button className="secondary" disabled={busy} onClick={signOut}>{text.signOut}</button>
        : <button className="secondary" aria-expanded={open} onClick={() => setOpen(value => !value)}>{text.signIn}</button>}
      {!owner && open && (
        <form className="inline-form" onSubmit={signIn}>
          <input type="email" name="email" dir="ltr" aria-label={text.email} placeholder="name@example.com" required />
          <button disabled={busy}>{text.send}</button>
        </form>
      )}
      {message && <p role="status">{text[message]}</p>}
    </div>
  )
}

function normalizeEquipmentName(name, language) {
  return name.normalize('NFD').replace(/[\p{M}ـ]/gu, '').toLocaleLowerCase(language).trim()
}

function EquipmentGuide({ items, language, title, text }) {
  const categoryLabels = getEquipmentCategories(language)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const needle = normalizeEquipmentName(query, language)
  const visible = items
    .filter(item => category === 'all' || item.category === category)
    .map(item => localizeGuideRow(item, language))
    .filter(item => normalizeEquipmentName(item.name, language).includes(needle))

  return (
    <section id="guide" aria-labelledby="guide-title">
      <h2 id="guide-title">{title}</h2>
      <label className="equipment-guide-search">
        {text.search}
        <input type="search" dir="auto" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <div className="filters" aria-label={text.categories}>
        {Object.entries({ all: text.all, ...categoryLabels }).map(([key, label]) => (
          <button key={key} className="chip" aria-pressed={key === category} onClick={() => setCategory(key)}>{label}</button>
        ))}
      </div>
      {!visible.length && <p className="empty" role="status">{needle ? text.noMatches : text.empty}</p>}
      <div className="card-grid">
        {visible.map(item => (
          <article className="card" key={item.id}>
            {item.image_url
              ? <img className="listing-img" src={item.image_url} alt={item.name} loading="lazy" />
              : <div className={`guide-photo photo-${item.category}`} role="img" aria-label={item.name} />}
            <div className="card-body">
              <span className="label">{categoryLabels[item.category]}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <details>
                <summary>{text.details}</summary>
                <h4>{text.usage}</h4>
                <p>{item.usage}</p>
                <h4>{text.selection}</h4>
                <p>{item.selection_tips}</p>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function currentSection() {
  const key = window.location.hash.slice(1)
  return Object.hasOwn(equipmentText.en.sections, key) ? key : 'guide'
}

export default function EquipmentPage({ language = 'en' }) {
  const text = equipmentText[language] ?? equipmentText.en
  const [section, setSection] = useState(currentSection)
  const [owner, setOwner] = useState(null)
  const [items, setItems] = useState(guide)
  const [packingTemplates, setPackingTemplates] = useState(templates)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const sync = () => setSection(currentSection())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      setOwner(session?.user.id ?? null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) return
    let active = true
    Promise.all([
      result(supabase.from('equipment').select().eq('kind', 'guide')),
      result(supabase.from('packing_templates').select().order('min_days').order('id')),
      result(supabase.from('equipment').select().in('kind', ['sale', 'loan']).order('created_at', { ascending: false })),
    ]).then(([guideRows, templateRows, listingRows]) => {
      if (!active) return
      if (guideRows.length) {
        const categoryOrder = Object.keys(categories)
        setItems(guideRows.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)))
      }
      if (templateRows.length) setPackingTemplates(templateRows)
      setListings(listingRows)
    }).catch(() => { if (active) setFailed(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="#guide">{text.brand}<span>.</span></a>
          <Account key={owner ?? 'guest'} owner={owner} text={text.account} />
        </div>
      </header>
      <main className="wrap">
        <div className="intro">
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
        </div>
        <nav className="section-nav" aria-label={text.title}>
          {Object.entries(text.sections).map(([key, title]) => (
            <a key={key} href={'#' + key} aria-current={section === key ? 'page' : undefined}>{title}</a>
          ))}
        </nav>
        {failed && <p className="notice" role="alert">{text.loadError}</p>}
        {section === 'guide' && <EquipmentGuide items={items} language={language} title={text.sections.guide} text={text.guide} />}
        {section === 'packing' && <PackingList owner={owner} language={language} text={text.packing}
          templates={packingTemplates.map(row => localizeTemplateRow(row, language))} />}
        {section === 'used' && <UsedGear key={owner ?? 'guest'} owner={owner} listings={listings} setListings={setListings}
          language={language} title={text.sections.used} text={text.usedGear} loading={loading} failed={failed} />}
      </main>
    </>
  )
}
