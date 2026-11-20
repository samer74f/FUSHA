import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../components/store/useCart.js'
import { createOrder } from './storeService.js'
import './store.css'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!items.length) {
      setErrorMessage('السلة فارغة. أضف منتجاً قبل تأكيد الطلب.')
      return
    }

    if (recipientName.trim().length < 2 || !/^[+\d\s()-]{7,20}$/.test(phone.trim()) || deliveryAddress.trim().length < 5) {
      setErrorMessage('تحقق من اسم المستلم ورقم الهاتف وعنوان التوصيل.')
      return
    }

    setSubmitting(true)
    const { data, error } = await createOrder({
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items,
    })

    if (error) {
      setErrorMessage('تعذر تأكيد الطلب. تأكد من إعداد جداول الطلبات ودالة place_order وسياسات RLS في Supabase.')
      setSubmitting(false)
      return
    }

    clearCart()
    navigate('/orders', { replace: true, state: { orderId: data } })
  }

  return (
    <main className="store-page" dir="rtl">
      <header className="store-header">
        <Link className="store-brand" to="/cart">FUSHA<span>إتمام الطلب</span></Link>
        <Link to="/store">متابعة التسوق</Link>
      </header>
      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <p className="store-eyebrow">لا يوجد دفع إلكتروني</p>
          <h1>معلومات التوصيل</h1>
          <label className="store-field"><span>اسم المستلم</span><input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required minLength={2} /></label>
          <label className="store-field"><span>رقم الهاتف</span><input type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
          <label className="store-field"><span>عنوان التوصيل</span><textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required minLength={5} rows="3" /></label>
          {errorMessage && <p className="store-state-error" role="alert">{errorMessage}</p>}
          <button className="store-primary-button" type="submit" disabled={submitting || !items.length}>
            {submitting ? 'جارٍ تأكيد الطلب…' : 'تأكيد الطلب'}
          </button>
        </form>
        <aside className="cart-summary">
          <h2>مراجعة الطلب</h2>
          {items.map((item) => (
            <p className="checkout-line" key={item.product.id}>
              <span>{item.product.name} × {item.quantity}</span>
              <strong>{(Number(item.product.price) * item.quantity).toFixed(2)} ₪</strong>
            </p>
          ))}
          <p className="checkout-total"><span>المجموع</span><strong>{total.toFixed(2)} ₪</strong></p>
          <small>سيتم إرسال الطلب إلى المتجر للتجهيز دون تحصيل إلكتروني.</small>
        </aside>
      </section>
    </main>
  )
}
