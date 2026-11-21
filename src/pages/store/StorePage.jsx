import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/store/ProductCard.jsx'
import { useCart } from '../../components/store/useCart.js'
import { getProducts } from './storeService.js'
import './store.css'

export default function StorePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const { addItem, itemCount } = useCart()

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setLoading(true)
      setErrorMessage('')

      try {
        const { data, error } = await getProducts()
        if (error) throw error
        if (isMounted) setProducts(data ?? [])
      } catch {
        if (isMounted) {
          setProducts([])
          setErrorMessage('تعذر جلب المنتجات من Supabase. تحقق من الاتصال وجدول products وصلاحية القراءة.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProducts()
    return () => { isMounted = false }
  }, [])

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  )

  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.description ?? ''}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    const matchesCategory = category === 'all' || product.category === category
    const matchesMinPrice = minPrice === '' || Number(product.price) >= Number(minPrice)
    const matchesMaxPrice = maxPrice === '' || Number(product.price) <= Number(maxPrice)
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
  })

  function handleAdd(product) {
    const message = addItem(product)
    setCartMessage(message || `أُضيف ${product.name} إلى السلة.`)
  }

  return (
    <main className="store-page" dir="rtl">
      <header className="store-header">
        <Link className="store-brand" to="/">FUSHA<span>مغامرتك تبدأ من هنا</span></Link>
        <nav className="store-nav" aria-label="روابط المتجر">
          <Link to="/store">المتجر</Link>
          <Link to="/cart">السلة ({itemCount})</Link>
          <Link to="/orders">طلباتي</Link>
          <Link to="/profile">حسابي</Link>
        </nav>
      </header>

      <section className="store-hero">
        <p className="store-eyebrow">تجهيزات لكل مغامرة</p>
        <h1>معدات رحلتك القادمة</h1>
        <p>اختر ما تحتاجه للاستكشاف والتخييم والأنشطة في الهواء الطلق.</p>
      </section>

      <section className="store-content" aria-label="المنتجات">
        <div className="store-toolbar">
          <label>
            <span>ابحث عن منتج</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="خيمة، حقيبة، مصباح…" />
          </label>
          <label>
            <span>التصنيف</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">كل التصنيفات</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>أقل سعر (₪)</span>
            <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="بدون حد" />
          </label>
          <label>
            <span>أعلى سعر (₪)</span>
            <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="بدون حد" />
          </label>
        </div>

        {cartMessage && <p className="store-notice" role="status">{cartMessage} <Link to="/cart">عرض السلة</Link></p>}
        {loading && <p className="store-state" aria-live="polite">جارٍ تحميل المنتجات…</p>}
        {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{errorMessage}</p>}
        {!loading && !errorMessage && filteredProducts.length === 0 && (
          <p className="store-state">لا توجد منتجات تطابق بحثك حالياً.</p>
        )}
        {!loading && !errorMessage && filteredProducts.length > 0 && (
          <div className="store-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
