import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../components/store/useCart.js'
import { getProduct } from './storeService.js'
import './store.css'

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const { addItem, itemCount } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setLoading(true)
      setErrorMessage('')
      setProduct(null)

      try {
        const { data, error } = await getProduct(productId)
        if (error) throw error
        if (!isMounted) return
        if (!data) setErrorMessage('We could not find this product.')
        else setProduct(data)
      } catch {
        if (isMounted) setErrorMessage('We could not load the product details. Check your connection and try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProduct()
    return () => { isMounted = false }
  }, [productId])

  function handleAdd() {
    const message = addItem(product)
    setNotice(message || 'The product was added to your cart.')
  }

  return (
    <main className="store-page" dir="ltr">
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>Back to store</span></Link>
        <nav className="store-nav"><Link to="/cart">Cart ({itemCount})</Link><Link to="/profile">My account</Link></nav>
      </header>
      {loading && <p className="store-state">Loading product…</p>}
      {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{errorMessage}</p>}
      {!loading && product && (
        <article className="product-detail">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="product-detail-placeholder">FUSHA</div>}
          <div className="product-detail-copy">
            <span className="store-category">{product.category || 'Trip gear'}</span>
            <h1>{product.name}</h1>
            <p>{product.description || 'Product details will be available soon.'}</p>
            <strong className="product-detail-price">{Number(product.price).toFixed(2)} ₪</strong>
            <p className="product-stock">{Number(product.stock) > 0 ? `In stock: ${product.stock}` : 'Out of stock'}</p>
            <button className="store-primary-button" type="button" onClick={handleAdd} disabled={Number(product.stock) <= 0}>Add to cart</button>
            {notice && <p className="store-notice" role="status">{notice}</p>}
          </div>
        </article>
      )}
    </main>
  )
}
