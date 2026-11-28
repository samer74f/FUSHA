import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { getOrders } from './storeService.js'
import './store.css'
import { useStoreLocale } from './storeLocale.js'

export default function OrdersPage() {
  const { language, direction, t } = useStoreLocale()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      setLoading(true)
      setErrorMessage('')

      try {
        const { data, error } = await getOrders(user.id)
        if (error) throw error
        if (isMounted) setOrders(data ?? [])
      } catch {
        if (isMounted) {
          setOrders([])
          setErrorMessage('We could not load your orders. Try again in a moment.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadOrders()
    return () => { isMounted = false }
  }, [user.id])

  return (
    <main className="store-page" lang={language} dir={direction}>
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>{t('Trips and gear')}</span></Link>
        <nav className="store-nav"><Link to="/store">{t('Store')}</Link><Link to="/cart">{t('Cart')}</Link><Link to="/profile">{t('My account')}</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">{t('My orders')}</h1>
        {loading && <p className="store-state">{t('Loading your orders…')}</p>}
        {!loading && errorMessage && <p className="store-state store-state-error" role="alert">{t(errorMessage)}</p>}
        {!loading && !errorMessage && orders.length === 0 && <p className="store-state">{t('You have no previous orders.')} <Link to="/store">{t('Browse the store')}</Link></p>}
        {!loading && !errorMessage && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-heading">
                  <div><span>{t('Order number')}</span><strong>{String(order.id).slice(0, 8)}</strong></div>
                  <span className={`order-status order-status-${String(order.status).toLowerCase()}`}>
                    {t(order.status)}
                  </span>
                </div>
                <p>{t('Date: {date}', { date: new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en-GB') })}</p>
                {(order.order_items ?? []).map((item) => (
                  <p className="order-item-line" key={item.id}>{item.product_name} × {item.quantity} — {(Number(item.unit_price) * item.quantity).toFixed(2)} ₪</p>
                ))}
                <strong className="order-total">{t('Total: {amount} ₪', { amount: Number(order.total).toFixed(2) })}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
