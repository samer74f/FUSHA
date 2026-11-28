import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { useCart } from '../../components/store/useCart.js'
import './store.css'
import { useStoreLocale } from './storeLocale.js'

export default function CartPage() {
  const { language, direction, t } = useStoreLocale()
  const { user } = useAuth()
  const { items, total, setQuantity, removeItem, loading, notice } = useCart()
  const [quantityError, setQuantityError] = useState('')

  return (
    <main className="store-page" lang={language} dir={direction}>
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>{t('Shopping cart')}</span></Link>
        <nav className="store-nav"><Link to="/store">{t('Continue shopping')}</Link><Link to="/orders">{t('My orders')}</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">{t('Shopping cart')}</h1>
        {loading && <p className="store-state">{t('Loading your cart…')}</p>}
        {notice && <p className="store-notice" role="status">{t(notice)}</p>}
        {quantityError && <p className="store-state-error" role="alert">{t(quantityError)}</p>}
        {!loading && !items.length && <div className="store-state"><p>{t('Your cart is empty.')}</p><Link className="store-primary-button" to="/store">{t('Browse products')}</Link></div>}
        {items.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.product.id}>
                  {item.product.image_url ? <img src={item.product.image_url} alt="" /> : <div className="cart-item-placeholder">F</div>}
                  <div className="cart-item-info">
                    <h2>{item.product.name}</h2>
                    <p>{Number(item.product.price).toFixed(2)} ₪</p>
                    <label className="quantity-control">
                      <span>{t('Quantity')}</span>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(event) => {
                          const nextQuantity = Number(event.target.value)
                          const message = setQuantity(item.product.id, nextQuantity)
                          setQuantityError(message ?? '')
                        }}
                      />
                    </label>
                    <button className="text-button" type="button" onClick={() => removeItem(item.product.id)}>{t('Remove')}</button>
                  </div>
                  <strong>{(Number(item.product.price) * item.quantity).toFixed(2)} ₪</strong>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <h2>{t('Cart summary')}</h2>
              <p><span>{t('Total')}</span><strong>{total.toFixed(2)} ₪</strong></p>
              <small>{t('Orders can be placed without an online payment.')}</small>
              {user ? <Link className="store-primary-button" to="/checkout">{t('Proceed to checkout')}</Link> : <Link className="store-primary-button" to="/login">{t('Sign in to check out')}</Link>}
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
