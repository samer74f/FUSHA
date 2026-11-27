import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getAdminProducts, getAllOrders, saveProduct, setOrderStatus } from './storeService.js'
import './store.css'
import { useStoreLocale } from './storeLocale.js'

const initialProduct = { name: '', description: '', price: '', category: '', image_url: '', stock: '', is_active: true }
const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled']
const loadError = 'We could not load the store admin data. Check the Supabase connection, tables, and store admin permissions.'

async function fetchAdminData() {
  const [productsResult, ordersResult] = await Promise.all([getAdminProducts(), getAllOrders()])

  if (productsResult.error || ordersResult.error) {
    throw new Error('Could not load store administration data.')
  }

  return {
    products: productsResult.data ?? [],
    orders: ordersResult.data ?? [],
  }
}

export default function AdminStorePage() {
  const { language, direction, t } = useStoreLocale()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [product, setProduct] = useState(initialProduct)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const isMounted = useRef(false)

  const reloadData = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchAdminData()

      if (!isMounted.current) return

      setProducts(data.products)
      setOrders(data.orders)
    } catch {
      if (isMounted.current) {
        setErrorMessage(loadError)
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true

    async function loadInitialData() {
      try {
        const data = await fetchAdminData()
        if (!isMounted.current) return
        setProducts(data.products)
        setOrders(data.orders)
      } catch {
        if (isMounted.current) setErrorMessage(loadError)
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }

    loadInitialData()
    return () => { isMounted.current = false }
  }, [])

  function startEdit(item) {
    setEditingId(item.id)
    setProduct({
      name: item.name ?? '',
      description: item.description ?? '',
      price: String(item.price ?? ''),
      category: item.category ?? '',
      image_url: item.image_url ?? '',
      stock: String(item.stock ?? ''),
      is_active: item.is_active ?? true,
    })
  }

  async function handleSave(event) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    const price = Number(product.price)
    const stock = Number(product.stock)
    if (!product.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setErrorMessage('Enter a product name, a non-negative price, and a valid stock quantity.')
      return
    }

    try {
      const { error } = await saveProduct({
        ...product,
        name: product.name.trim(),
        description: product.description.trim(),
        price,
        category: product.category.trim(),
        image_url: product.image_url.trim() || null,
        stock,
      }, editingId)

      if (error) {
        setErrorMessage('We could not save the product. Check the admin permissions and products table fields.')
        return
      }

      setProduct(initialProduct)
      setEditingId(null)
      setMessage('Product saved.')
      await reloadData()
    } catch {
      setErrorMessage('We could not connect to save the product. Check your connection and try again.')
    }
  }

  async function handleDelete(productId) {
    if (!window.confirm(t('Delete this product?'))) return

    try {
      const { error } = await deleteProduct(productId)
      if (error) {
        setErrorMessage('We could not delete the product. An earlier order may reference it.')
      } else {
        setMessage('Product deleted.')
        await reloadData()
      }
    } catch {
      setErrorMessage('We could not connect to delete the product. Try again.')
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const { error } = await setOrderStatus(orderId, status)
      if (error) {
        setErrorMessage('We could not update the order status. Check the admin permissions.')
      } else {
        setMessage('Order status updated.')
        await reloadData()
      }
    } catch {
      setErrorMessage('We could not connect to update the order status. Try again.')
    }
  }

  return (
    <main className="store-page" lang={language} dir={direction}>
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>{t('Manage store')}</span></Link>
        <nav className="store-nav"><Link to="/store">{t('Store')}</Link><Link to="/orders">{t('Orders')}</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">{t('Manage store')}</h1>
        {loading && <p className="store-state">{t('Loading store data…')}</p>}
        {errorMessage && <p className="store-state-error" role="alert">{t(errorMessage)}</p>}
        {message && <p className="store-notice" role="status">{t(message)}</p>}

        <div className="admin-layout">
          <form className="checkout-form admin-form" onSubmit={handleSave}>
            <h2>{editingId ? t('Edit product') : t('Add product')}</h2>
            <label className="store-field"><span>{t('Product name')}</span><input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} required /></label>
            <label className="store-field"><span>{t('Description')}</span><textarea rows="3" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} /></label>
            <div className="admin-fields-row">
              <label className="store-field"><span>{t('Price (₪)')}</span><input type="number" min="0" step="0.01" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} required /></label>
              <label className="store-field"><span>{t('Stock')}</span><input type="number" min="0" step="1" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} required /></label>
            </div>
            <label className="store-field"><span>{t('Category')}</span><input value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} /></label>
            <label className="store-field"><span>{t('Image URL')}</span><input type="url" dir="ltr" value={product.image_url} onChange={(event) => setProduct({ ...product, image_url: event.target.value })} /></label>
            {editingId && <label className="admin-checkbox"><input type="checkbox" checked={product.is_active} onChange={(event) => setProduct({ ...product, is_active: event.target.checked })} /> {t('Show product in the store')}</label>}
            <button className="store-primary-button" type="submit">{editingId ? t('Save product') : t('Add product')}</button>
            {editingId && <button className="store-secondary-button" type="button" onClick={() => { setEditingId(null); setProduct(initialProduct) }}>{t('Cancel edit')}</button>}
          </form>

          <section className="admin-list">
            <h2>{t('Products ({count})', { count: products.length })}</h2>
            {!loading && products.length === 0 && <p className="store-state">{t('No products yet.')}</p>}
            {products.map((item) => (
              <article className="admin-row" key={item.id}>
                <div><strong>{item.name}</strong><span>{Number(item.price).toFixed(2)} ₪ · {t('Stock {count}', { count: item.stock })}</span></div>
                <div className="admin-row-actions">
                  <button className="text-button" type="button" onClick={() => startEdit(item)}>{t('Edit')}</button>
                  <button className="text-button text-button-danger" type="button" onClick={() => handleDelete(item.id)}>{t('Delete')}</button>
                </div>
              </article>
            ))}

            <h2 className="admin-orders-title">{t('Manage orders ({count})', { count: orders.length })}</h2>
            {orders.map((order) => (
              <article className="admin-row" key={order.id}>
                <div><strong>{order.recipient_name}</strong><span>{Number(order.total).toFixed(2)} ₪ · {order.phone}</span></div>
                <select aria-label={t('Order status for {order}', { order: order.id })} value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}
                </select>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  )
}
