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
    setCartMessage(message || `${product.name} was added to your cart.`)
  }

  return (
    <main className="store-page" dir="ltr">
      <header className="store-header">
        <Link className="store-brand" to="/">FUSHA<span>Your adventure starts here</span></Link>
        <nav className="store-nav" aria-label="Store navigation">
          <Link to="/store">Store</Link>
          <Link to="/cart">Cart ({itemCount})</Link>
          <Link to="/orders">My orders</Link>
          <Link to="/profile">My account</Link>
        </nav>
      </header>

      <section className="store-hero">
        <p className="store-eyebrow">Gear for every adventure</p>
        <h1>Gear for your next trip</h1>
        <p>Find what you need for exploring, camping, and other outdoor activities.</p>
      </section>

      <section className="store-content" aria-label="Products">
        <div className="store-toolbar">
          <label>
            <span>Search products</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tent, backpack, flashlight…" />
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Minimum price (₪)</span>
            <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="No limit" />
          </label>
          <label>
            <span>Maximum price (₪)</span>
            <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="No limit" />
          </label>
        </div>

        {cartMessage && <p className="store-notice" role="status">{cartMessage} <Link to="/cart">View cart</Link></p>}
        {loading && <p className="store-state" aria-live="polite">Loading products…</p>}
        {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{errorMessage}</p>}
        {!loading && !errorMessage && filteredProducts.length === 0 && (
          <p className="store-state">No products match your search.</p>
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
