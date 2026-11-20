import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { getOrders } from './storeService.js'
import './store.css'

const statusLabels = {
  Pending: 'قيد الانتظار',
  Processing: 'قيد التجهيز',
  Completed: 'مكتمل',
  Cancelled: 'ملغي',
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      const { data, error } = await getOrders(user.id)
      if (!isMounted) return
      if (error) setErrorMessage('تعذر جلب طلباتك. تحقق من جدول orders وسياسات RLS.')
      else setOrders(data ?? [])
      setLoading(false)
    }

    loadOrders()
    return () => { isMounted = false }
  }, [user.id])

  return (
    <main className="store-page" dir="rtl">
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>رحلات ومستلزمات</span></Link>
        <nav className="store-nav"><Link to="/store">المتجر</Link><Link to="/cart">السلة</Link><Link to="/profile">حسابي</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">طلباتي</h1>
        {loading && <p className="store-state">جارٍ تحميل الطلبات…</p>}
        {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{errorMessage}</p>}
        {!loading && !errorMessage && orders.length === 0 && <p className="store-state">لا توجد طلبات سابقة. <Link to="/store">تصفح المتجر</Link></p>}
        {!loading && !errorMessage && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-heading">
                  <div><span>رقم الطلب</span><strong>{String(order.id).slice(0, 8)}</strong></div>
                  <span className={`order-status order-status-${String(order.status).toLowerCase()}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
                <p>التاريخ: {new Date(order.created_at).toLocaleDateString('ar')}</p>
                {(order.order_items ?? []).map((item) => (
                  <p className="order-item-line" key={item.id}>{item.product_name} × {item.quantity} — {(Number(item.unit_price) * item.quantity).toFixed(2)} ₪</p>
                ))}
                <strong className="order-total">المجموع: {Number(order.total).toFixed(2)} ₪</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
