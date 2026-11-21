import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getAdminProducts, getAllOrders, saveProduct, setOrderStatus } from './storeService.js'
import './store.css'

const initialProduct = { name: '', description: '', price: '', category: '', image_url: '', stock: '', is_active: true }
const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled']
const loadError = 'تعذر تحميل بيانات الإدارة. تحقق من الاتصال والجداول وصلاحية مسؤول المتجر في Supabase.'

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
      setErrorMessage('أدخل اسم المنتج وسعراً غير سالب ومخزوناً صحيحاً.')
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
        setErrorMessage('تعذر حفظ المنتج. تحقق من صلاحية المسؤول وحقول جدول products.')
        return
      }

      setProduct(initialProduct)
      setEditingId(null)
      setMessage('تم حفظ المنتج.')
      await reloadData()
    } catch {
      setErrorMessage('تعذر الاتصال لحفظ المنتج. تحقق من الاتصال وحاول مرة أخرى.')
    }
  }

  async function handleDelete(productId) {
    if (!window.confirm('هل تريد حذف هذا المنتج؟')) return

    try {
      const { error } = await deleteProduct(productId)
      if (error) {
        setErrorMessage('تعذر حذف المنتج. قد يكون مرتبطاً بطلب سابق.')
      } else {
        setMessage('تم حذف المنتج.')
        await reloadData()
      }
    } catch {
      setErrorMessage('تعذر الاتصال لحذف المنتج. حاول مرة أخرى.')
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const { error } = await setOrderStatus(orderId, status)
      if (error) {
        setErrorMessage('تعذر تحديث حالة الطلب. تحقق من صلاحيات المسؤول.')
      } else {
        setMessage('تم تحديث حالة الطلب.')
        await reloadData()
      }
    } catch {
      setErrorMessage('تعذر الاتصال لتحديث حالة الطلب. حاول مرة أخرى.')
    }
  }

  return (
    <main className="store-page" dir="rtl">
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>إدارة المتجر</span></Link>
        <nav className="store-nav"><Link to="/store">المتجر</Link><Link to="/orders">الطلبات</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">إدارة المتجر</h1>
        {loading && <p className="store-state">جارٍ تحميل بيانات المتجر…</p>}
        {errorMessage && <p className="store-state-error" role="alert">{errorMessage}</p>}
        {message && <p className="store-notice" role="status">{message}</p>}

        <div className="admin-layout">
          <form className="checkout-form admin-form" onSubmit={handleSave}>
            <h2>{editingId ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
            <label className="store-field"><span>اسم المنتج</span><input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} required /></label>
            <label className="store-field"><span>الوصف</span><textarea rows="3" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} /></label>
            <div className="admin-fields-row">
              <label className="store-field"><span>السعر (₪)</span><input type="number" min="0" step="0.01" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} required /></label>
              <label className="store-field"><span>المخزون</span><input type="number" min="0" step="1" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} required /></label>
            </div>
            <label className="store-field"><span>التصنيف</span><input value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} /></label>
            <label className="store-field"><span>رابط الصورة</span><input type="url" dir="ltr" value={product.image_url} onChange={(event) => setProduct({ ...product, image_url: event.target.value })} /></label>
            {editingId && <label className="admin-checkbox"><input type="checkbox" checked={product.is_active} onChange={(event) => setProduct({ ...product, is_active: event.target.checked })} /> المنتج متاح للعرض</label>}
            <button className="store-primary-button" type="submit">{editingId ? 'حفظ المنتج' : 'إضافة المنتج'}</button>
            {editingId && <button className="store-secondary-button" type="button" onClick={() => { setEditingId(null); setProduct(initialProduct) }}>إلغاء التعديل</button>}
          </form>

          <section className="admin-list">
            <h2>المنتجات ({products.length})</h2>
            {!loading && products.length === 0 && <p className="store-state">لا توجد منتجات.</p>}
            {products.map((item) => (
              <article className="admin-row" key={item.id}>
                <div><strong>{item.name}</strong><span>{Number(item.price).toFixed(2)} ₪ · المخزون {item.stock}</span></div>
                <div className="admin-row-actions">
                  <button className="text-button" type="button" onClick={() => startEdit(item)}>تعديل</button>
                  <button className="text-button text-button-danger" type="button" onClick={() => handleDelete(item.id)}>حذف</button>
                </div>
              </article>
            ))}

            <h2 className="admin-orders-title">متابعة الطلبات ({orders.length})</h2>
            {orders.map((order) => (
              <article className="admin-row" key={order.id}>
                <div><strong>{order.recipient_name}</strong><span>{Number(order.total).toFixed(2)} ₪ · {order.phone}</span></div>
                <select aria-label={`حالة الطلب ${order.id}`} value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}>
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
