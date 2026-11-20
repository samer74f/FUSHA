import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { useCart } from '../../components/store/useCart.js'
import './store.css'

export default function CartPage() {
  const { user } = useAuth()
  const { items, total, setQuantity, removeItem, loading, notice } = useCart()
  const [quantityError, setQuantityError] = useState('')

  return (
    <main className="store-page" dir="rtl">
      <header className="store-header">
        <Link className="store-brand" to="/store">FUSHA<span>سلة المشتريات</span></Link>
        <nav className="store-nav"><Link to="/store">متابعة التسوق</Link><Link to="/orders">طلباتي</Link></nav>
      </header>
      <section className="store-content">
        <h1 className="section-title">سلة المشتريات</h1>
        {loading && <p className="store-state">جارٍ تحميل السلة…</p>}
        {notice && <p className="store-notice" role="status">{notice}</p>}
        {quantityError && <p className="store-state-error" role="alert">{quantityError}</p>}
        {!loading && !items.length && <div className="store-state"><p>سلتك فارغة حالياً.</p><Link className="store-primary-button" to="/store">اكتشف المنتجات</Link></div>}
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
                      <span>الكمية</span>
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
                    <button className="text-button" type="button" onClick={() => removeItem(item.product.id)}>حذف</button>
                  </div>
                  <strong>{(Number(item.product.price) * item.quantity).toFixed(2)} ₪</strong>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <h2>ملخص السلة</h2>
              <p><span>المجموع</span><strong>{total.toFixed(2)} ₪</strong></p>
              <small>الدفع الإلكتروني غير متاح. سيتم تأكيد الطلب دون دفع إلكتروني.</small>
              {user ? <Link className="store-primary-button" to="/checkout">متابعة لإتمام الطلب</Link> : <Link className="store-primary-button" to="/login">سجّل الدخول لإتمام الطلب</Link>}
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
