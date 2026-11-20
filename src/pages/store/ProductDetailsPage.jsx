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
      const { data, error } = await getProduct(productId)
      if (!isMounted) return
      if (error) setErrorMessage('تعذر جلب تفاصيل المنتج من Supabase.')
      else if (!data) setErrorMessage('لم نعثر على هذا المنتج.')
      else setProduct(data)
      setLoading(false)
    }

    loadProduct()
    return () => { isMounted = false }
  }, [productId])

  function handleAdd() {
    const message = addItem(product)
    setNotice(message || 'تمت إضافة المنتج إلى سلتك.')
  }

  return (
    <main className="store-page" dir="rtl">
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>العودة إلى المتجر</span></Link>
        <nav className="store-nav"><Link to="/cart">السلة ({itemCount})</Link><Link to="/profile">حسابي</Link></nav>
      </header>
      {loading && <p className="store-state">جارٍ تحميل المنتج…</p>}
      {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{errorMessage}</p>}
      {!loading && product && (
        <article className="product-detail">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="product-detail-placeholder">FUSHA</div>}
          <div className="product-detail-copy">
            <span className="store-category">{product.category || 'معدات رحلات'}</span>
            <h1>{product.name}</h1>
            <p>{product.description || 'تفاصيل هذا المنتج ستتوفر قريباً.'}</p>
            <strong className="product-detail-price">{Number(product.price).toFixed(2)} ₪</strong>
            <p className="product-stock">{Number(product.stock) > 0 ? `متوفر: ${product.stock}` : 'غير متوفر حالياً'}</p>
            <button className="store-primary-button" type="button" onClick={handleAdd} disabled={Number(product.stock) <= 0}>أضف إلى السلة</button>
            {notice && <p className="store-notice" role="status">{notice}</p>}
          </div>
        </article>
      )}
    </main>
  )
}
