import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getAdminProducts, getAllOrders, saveProduct, setOrderStatus } from './storeService.js'
import './store.css'

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
    if (!window.confirm('Delete this product?')) return

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
    <main className="store-page" dir="ltr">
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>Manage store</span></Link>
        <nav className="store-nav"><Link to="/store">Store</Link><Link to="/orders">Orders</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">Manage store</h1>
        {loading && <p className="store-state">Loading store data…</p>}
        {errorMessage && <p className="store-state-error" role="alert">{errorMessage}</p>}
        {message && <p className="store-notice" role="status">{message}</p>}

        <div className="admin-layout">
          <form className="checkout-form admin-form" onSubmit={handleSave}>
            <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
            <label className="store-field"><span>Product name</span><input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} required /></label>
            <label className="store-field"><span>Description</span><textarea rows="3" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} /></label>
            <div className="admin-fields-row">
              <label className="store-field"><span>Price (₪)</span><input type="number" min="0" step="0.01" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} required /></label>
              <label className="store-field"><span>Stock</span><input type="number" min="0" step="1" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} required /></label>
            </div>
            <label className="store-field"><span>Category</span><input value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} /></label>
            <label className="store-field"><span>Image URL</span><input type="url" dir="ltr" value={product.image_url} onChange={(event) => setProduct({ ...product, image_url: event.target.value })} /></label>
            {editingId && <label className="admin-checkbox"><input type="checkbox" checked={product.is_active} onChange={(event) => setProduct({ ...product, is_active: event.target.checked })} /> Show product in the store</label>}
            <button className="store-primary-button" type="submit">{editingId ? 'Save product' : 'Add product'}</button>
            {editingId && <button className="store-secondary-button" type="button" onClick={() => { setEditingId(null); setProduct(initialProduct) }}>Cancel edit</button>}
          </form>

          <section className="admin-list">
            <h2>Products ({products.length})</h2>
            {!loading && products.length === 0 && <p className="store-state">No products yet.</p>}
            {products.map((item) => (
              <article className="admin-row" key={item.id}>
                <div><strong>{item.name}</strong><span>{Number(item.price).toFixed(2)} ₪ · Stock {item.stock}</span></div>
                <div className="admin-row-actions">
                  <button className="text-button" type="button" onClick={() => startEdit(item)}>Edit</button>
                  <button className="text-button text-button-danger" type="button" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </article>
            ))}

            <h2 className="admin-orders-title">Manage orders ({orders.length})</h2>
            {orders.map((order) => (
              <article className="admin-row" key={order.id}>
                <div><strong>{order.recipient_name}</strong><span>{Number(order.total).toFixed(2)} ₪ · {order.phone}</span></div>
                <select aria-label={`Order status for ${order.id}`} value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  )
}
