import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { useCart } from '../../components/store/useCart.js'
import { getProduct } from './storeService.js'
import './store.css'
import { useStoreLocale } from './storeLocale.js'

export default function ProductDetailsPage() {
  const { language, direction, t } = useStoreLocale()
  const { productId } = useParams()
  const location = useLocation()
  const { user } = useAuth()
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
    <main className="store-page" lang={language} dir={direction}>
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>{t('Back to store')}</span></Link>
        <nav className="store-nav"><Link to="/cart">{user ? t('Cart ({count})', { count: itemCount }) : t('Cart')}</Link><Link to="/profile">{t('My account')}</Link></nav>
      </header>
      {loading && <p className="store-state">{t('Loading product…')}</p>}
      {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{t(errorMessage)}</p>}
      {!loading && product && (
        <article className="product-detail">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="product-detail-placeholder">FUSHA</div>}
          <div className="product-detail-copy">
            <span className="store-category">{product.category || t('Trip gear')}</span>
            <h1>{product.name}</h1>
            <p>{product.description || t('Product details will be available soon.')}</p>
            <strong className="product-detail-price">{Number(product.price).toFixed(2)} ₪</strong>
            <p className="product-stock">{Number(product.stock) > 0 ? t('In stock: {count}', { count: product.stock }) : t('Out of stock')}</p>
            {user || Number(product.stock) <= 0 ? (
              <button className="store-primary-button" type="button" onClick={handleAdd} disabled={Number(product.stock) <= 0}>{t('Add to cart')}</button>
            ) : (
              <Link className="store-primary-button" to="/login" state={{ from: location }}>{t('Sign in to add to cart')}</Link>
            )}
            {notice && <p className="store-notice" role="status">{t(notice)}</p>}
          </div>
        </article>
      )}
    </main>
  )
}
