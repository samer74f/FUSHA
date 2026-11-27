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
      setErrorMessage('Your cart is empty. Add a product before placing an order.')
      return
    }

    if (recipientName.trim().length < 2 || !/^[+\d\s()-]{7,20}$/.test(phone.trim()) || deliveryAddress.trim().length < 5) {
      setErrorMessage('Check the recipient name, phone number, and delivery address.')
      return
    }

    setSubmitting(true)
    let result

    try {
      result = await createOrder({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items,
      })
    } catch {
      setErrorMessage('We could not confirm whether the order was placed. Check My orders before trying again.')
      setSubmitting(false)
      return
    }

    if (result.error) {
      setErrorMessage('We could not place your order. Try again in a moment.')
      setSubmitting(false)
      return
    }

    clearCart()
    navigate('/orders', { replace: true, state: { orderId: result.data } })
  }

  return (
    <main className="store-page" dir="ltr">
      <header className="store-header">
        <Link className="store-brand" to="/cart">FUSHA<span>Checkout</span></Link>
        <Link to="/store">Continue shopping</Link>
      </header>
      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <p className="store-eyebrow">No online payment</p>
          <h1>Delivery information</h1>
          <label className="store-field"><span>Recipient name</span><input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required minLength={2} /></label>
          <label className="store-field"><span>Phone number</span><input type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
          <label className="store-field"><span>Delivery address</span><textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required minLength={5} rows="3" /></label>
          {errorMessage && <p className="store-state-error" role="alert">{errorMessage}</p>}
          <button className="store-primary-button" type="submit" disabled={submitting || !items.length}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>
        <aside className="cart-summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <p className="checkout-line" key={item.product.id}>
              <span>{item.product.name} × {item.quantity}</span>
              <strong>{(Number(item.product.price) * item.quantity).toFixed(2)} ₪</strong>
            </p>
          ))}
          <p className="checkout-total"><span>Total</span><strong>{total.toFixed(2)} ₪</strong></p>
          <small>The store will receive your order for processing. There is no online payment.</small>
        </aside>
      </section>
    </main>
  )
}
