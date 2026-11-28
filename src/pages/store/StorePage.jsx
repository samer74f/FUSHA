import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/store/ProductCard.jsx'
import { useAuth } from '../../components/auth/useAuth.js'
import { useCart } from '../../components/store/useCart.js'
import { getProducts } from './storeService.js'
import './store.css'
import { useStoreLocale } from './storeLocale.js'

export default function StorePage() {
  const { language, direction, t } = useStoreLocale()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [cartMessage, setCartMessage] = useState(null)
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
          setErrorMessage('We could not load the products. Try again in a moment.')
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
    setCartMessage(message ? { text: message } : {
      text: '{product} was added to your cart.',
      values: { product: product.name },
    })
  }

  return (
    <main className="store-page" lang={language} dir={direction}>
      <header className="store-header">
        <Link className="store-brand" to="/">FUSHA<span>{t('Your adventure starts here')}</span></Link>
        <nav className="store-nav" aria-label={t('Store navigation')}>
          <Link to="/store">{t('Store')}</Link>
          <Link to="/cart">{user ? t('Cart ({count})', { count: itemCount }) : t('Cart')}</Link>
          <Link to="/orders">{t('My orders')}</Link>
          <Link to="/profile">{t('My account')}</Link>
        </nav>
      </header>

      <section className="store-hero">
        <p className="store-eyebrow">{t('Gear for every adventure')}</p>
        <h1>{t('Gear for your next trip')}</h1>
        <p>{t('Find what you need for exploring, camping, and other outdoor activities.')}</p>
      </section>

      <section className="store-content" aria-label={t('Products')}>
        <div className="store-toolbar">
          <label>
            <span>{t('Search products')}</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('Tent, backpack, flashlight…')} />
          </label>
          <label>
            <span>{t('Category')}</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">{t('All categories')}</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>{t('Minimum price (₪)')}</span>
            <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder={t('No limit')} />
          </label>
          <label>
            <span>{t('Maximum price (₪)')}</span>
            <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder={t('No limit')} />
          </label>
        </div>

        {cartMessage && <p className="store-notice" role="status">{t(cartMessage.text, cartMessage.values)} <Link to="/cart">{t('View cart')}</Link></p>}
        {loading && <p className="store-state" aria-live="polite">{t('Loading products…')}</p>}
        {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{t(errorMessage)}</p>}
        {!loading && !errorMessage && filteredProducts.length === 0 && (
          <p className="store-state">{t('No products match your search.')}</p>
        )}
        {!loading && !errorMessage && filteredProducts.length > 0 && (
          <div className="store-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} canAdd={Boolean(user)} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
