import { useEffect, useState } from 'react'
import { result, supabase } from '../../services/supabase'
import { categories, guide, templates } from './catalog'
import PackingList from './PackingList'
import UsedGear from './UsedGear'

const sections = { guide: 'دليل المعدات', packing: 'قائمة التجهيز', used: 'المعدات المستعملة' }

function Account({ owner }) {
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
      setMessage('أرسلنا رابط تسجيل الدخول إلى بريدك الإلكتروني.')
    } catch {
      setMessage('تعذّر إرسال رابط الدخول. حاول مجددًا.')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    setMessage('')
    try { await result(supabase.auth.signOut()) }
    catch { setMessage('تعذّر تسجيل الخروج. حاول مجددًا.') }
    finally { setBusy(false) }
  }

  return (
    <div className="account">
      {owner
        ? <button className="secondary" disabled={busy} onClick={signOut}>تسجيل الخروج</button>
        : <button className="secondary" aria-expanded={open} onClick={() => setOpen(value => !value)}>تسجيل الدخول</button>}
      {!owner && open && (
        <form className="inline-form" onSubmit={signIn}>
          <input type="email" name="email" dir="ltr" aria-label="البريد الإلكتروني" placeholder="name@example.com" required />
          <button disabled={busy}>أرسل رابط الدخول</button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  )
}

function EquipmentGuide({ items }) {
  const [category, setCategory] = useState('all')
  const visible = items.filter(item => category === 'all' || item.category === category)

  return (
    <section id="guide" aria-labelledby="guide-title">
      <h2 id="guide-title">دليل المعدات</h2>
      <div className="filters" aria-label="فئات المعدات">
        {Object.entries({ all: 'الكل', ...categories }).map(([key, label]) => (
          <button key={key} className="chip" aria-pressed={key === category} onClick={() => setCategory(key)}>{label}</button>
        ))}
      </div>
      {!visible.length && <p className="empty">لا توجد معدات في هذه الفئة.</p>}
      <div className="card-grid">
        {visible.map(item => (
          <article className="card" key={item.id}>
            {item.image_url
              ? <img className="listing-img" src={item.image_url} alt={item.name} loading="lazy" />
              : <div className={`guide-photo photo-${item.category}`} role="img" aria-label={item.name} />}
            <div className="card-body">
              <span className="label">{categories[item.category]}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <details>
                <summary>الاستخدام ونصائح الاختيار</summary>
                <h4>طريقة الاستخدام</h4>
                <p>{item.usage}</p>
                <h4>نصائح الاختيار</h4>
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
  return Object.hasOwn(sections, key) ? key : 'guide'
}

export default function EquipmentPage() {
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
          <a className="brand" href="#guide">فُسحة<span>.</span></a>
          <Account key={owner ?? 'guest'} owner={owner} />
        </div>
      </header>
      <main className="wrap">
        <div className="intro">
          <h1>المعدات والتجهيز</h1>
          <p>اختر معدات رحلتك وجهّز قائمتك قبل الانطلاق.</p>
        </div>
        <nav className="section-nav" aria-label="المعدات والتجهيز">
          {Object.entries(sections).map(([key, title]) => (
            <a key={key} href={'#' + key} aria-current={section === key ? 'page' : undefined}>{title}</a>
          ))}
        </nav>
        {failed && <p className="notice" role="alert">تعذّر تحميل البيانات من Supabase. أعد تحميل الصفحة للمحاولة مجددًا.</p>}
        {section === 'guide' && <EquipmentGuide items={items} />}
        {section === 'packing' && <PackingList owner={owner} templates={packingTemplates} />}
        {section === 'used' && <UsedGear key={owner ?? 'guest'} owner={owner} listings={listings} setListings={setListings} loading={loading} failed={failed} />}
      </main>
    </>
  )
}
