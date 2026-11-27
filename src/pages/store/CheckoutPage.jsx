import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { useCart } from '../../components/store/useCart.js'
import { clearCheckoutRequest, getCheckoutRequest, readCheckoutRequest } from './checkoutRequest.js'
import { createOrder, getOrderByRequest } from './storeService.js'
import './store.css'
import { useStoreLocale } from './storeLocale.js'

const quoteErrors = {
  FUSHA_PRICE_CHANGED: 'A product price changed. Review the updated total before placing your order.',
  FUSHA_STOCK_CHANGED: 'Available stock changed. Update the quantities in your cart before ordering.',
  FUSHA_PRODUCT_UNAVAILABLE: 'A product is no longer available. Remove it from your cart before ordering.',
}

export default function CheckoutPage() {
  const { language, direction, t } = useStoreLocale()
  const { user } = useAuth()
  const { items, total, loading, waitForCartSync, refreshCartProducts, reloadAfterCheckout } = useCart()
  const navigate = useNavigate()
  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showOrderRecovery, setShowOrderRecovery] = useState(() => Boolean(readCheckoutRequest(user.id)))
  const hasUnavailableItems = items.some((item) =>
    item.product.is_active === false || item.quantity > Number(item.product.stock),
  )

  async function finishOrder(orderId, requestId, orderedItems) {
    await reloadAfterCheckout(orderedItems)
    clearCheckoutRequest(user.id, requestId)
    navigate('/orders', { replace: true, state: { orderId } })
  }

  async function handleCheckPreviousOrder() {
    const requestId = readCheckoutRequest(user.id)
    if (!requestId || submitting || loading) return

    setErrorMessage('')
    setSubmitting(true)
    try {
      const { data, error } = await getOrderByRequest(user.id, requestId)
      if (error) throw error

      if (data) {
        await finishOrder(data.id, requestId)
      } else {
        setErrorMessage('No order has been found for this attempt yet. You can retry from this checkout.')
      }
    } catch {
      setErrorMessage('We could not check the previous order. Check My orders or try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateQuote(message) {
    try {
      await refreshCartProducts()
      setErrorMessage(message)
    } catch {
      setErrorMessage('The cart changed. We could not load the latest prices and stock. Open your cart and refresh it before continuing.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting || loading) return

    setErrorMessage('')
    if (!items.length) {
      setErrorMessage('Your cart is empty. Add a product before placing an order.')
      return
    }
    if (hasUnavailableItems) {
      setErrorMessage('Update the unavailable items in your cart before placing an order.')
      return
    }
    if (recipientName.trim().length < 2 || !/^[+\d\s()-]{7,20}$/.test(phone.trim()) || deliveryAddress.trim().length < 5) {
      setErrorMessage('Check the recipient name, phone number, and delivery address.')
      return
    }

    let requestId
    try {
      requestId = getCheckoutRequest(user.id)
    } catch {
      setErrorMessage('Enable browser storage to safely place an order.')
      return
    }

    setSubmitting(true)
    try {
      await waitForCartSync()
      const result = await createOrder({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items,
        requestId,
      })

      if (!result.error && result.data) {
        await finishOrder(result.data, requestId, items)
      } else if (quoteErrors[result.error?.message]) {
        await updateQuote(quoteErrors[result.error.message])
      } else if (result.error?.message === 'FUSHA_REQUEST_ALREADY_USED') {
        setShowOrderRecovery(true)
        setErrorMessage('Your earlier checkout was already placed. Use Check previous order to open it.')
      } else {
        setShowOrderRecovery(true)
        setErrorMessage('We could not confirm your order. Check the previous order or retry this checkout.')
      }
    } catch {
      setShowOrderRecovery(true)
      setErrorMessage('We could not confirm your order. Check the previous order or retry this checkout.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="store-page" lang={language} dir={direction}>
      <header className="store-header">
        <Link className="store-brand" to="/cart">FUSHA<span>{t('Checkout')}</span></Link>
        <Link to="/store">{t('Continue shopping')}</Link>
      </header>
      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <p className="store-eyebrow">{t('No online payment')}</p>
          <h1>{t('Delivery information')}</h1>
          <label className="store-field"><span>{t('Recipient name')}</span><input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required minLength={2} /></label>
          <label className="store-field"><span>{t('Phone number')}</span><input type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
          <label className="store-field"><span>{t('Delivery address')}</span><textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required minLength={5} rows="3" /></label>
          {hasUnavailableItems && <p className="store-state-error"><Link to="/cart">{t('Update the unavailable items in your cart')}</Link>.</p>}
          {errorMessage && <p className="store-state-error" role="alert">{t(errorMessage)}</p>}
          <button className="store-primary-button" type="submit" disabled={submitting || loading || !items.length || hasUnavailableItems}>
            {submitting ? t('Checking order…') : t('Place order')}
          </button>
          {showOrderRecovery && (
            <button className="text-button" type="button" onClick={handleCheckPreviousOrder} disabled={submitting || loading}>
              {t('Check previous order')}
            </button>
          )}
        </form>
        <aside className="cart-summary">
          <h2>{t('Order summary')}</h2>
          {items.map((item) => (
            <p className="checkout-line" key={item.product.id}>
              <span>{item.product.name} × {item.quantity}</span>
              <strong>{(Number(item.product.price) * item.quantity).toFixed(2)} ₪</strong>
            </p>
          ))}
          <p className="checkout-total"><span>{t('Total')}</span><strong>{total.toFixed(2)} ₪</strong></p>
          <small>{t('The store will receive your order for processing. There is no online payment.')}</small>
        </aside>
      </section>
    </main>
  )
}
