import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { supabase } from '../auth/supabaseClient.js'
import { PRODUCT_FIELDS } from '../../pages/store/storeService.js'
import { CartContext } from './CartContext.js'

const EMPTY_CART = []

function readCart(storageKey) {
  try {
    const savedCart = localStorage.getItem(storageKey)
    const parsedCart = savedCart ? JSON.parse(savedCart) : []
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

async function fetchCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`quantity, product:products(${PRODUCT_FIELDS})`)
    .eq('user_id', userId)

  if (error) throw error
  return (data ?? [])
    .filter((row) => row.product)
    .map((row) => ({ product: row.product, quantity: row.quantity }))
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const storageKey = `fusha-cart:${user?.id ?? 'guest'}`
  const [cartState, setCartState] = useState({ storageKey: '', items: [], loading: true, notice: '' })
  const cartSync = useRef(Promise.resolve())
  const items = cartState.storageKey === storageKey ? cartState.items : EMPTY_CART

  useEffect(() => {
    if (authLoading) return undefined

    let isMounted = true

    async function loadCart() {
      let nextItems = readCart(storageKey)
      let notice = ''

      if (user?.id) {
        try {
          nextItems = await fetchCart(user.id)
        } catch {
          notice = 'We could not sync your cart with Supabase. Your cart is saved on this device.'
        }
      }

      if (isMounted) {
        setCartState({ storageKey, items: nextItems, loading: false, notice })
      }
    }

    loadCart()
    return () => { isMounted = false }
  }, [authLoading, storageKey, user?.id])

  useEffect(() => {
    if (cartState.storageKey !== storageKey || cartState.loading) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartState.items))
    } catch {
      // The cart remains available for the current page if browser storage is disabled.
    }
  }, [cartState, storageKey])

  function setNotice(notice) {
    setCartState((current) =>
      current.storageKey === storageKey ? { ...current, notice } : current,
    )
  }

  function queueCartSync(sync) {
    cartSync.current = cartSync.current.then(async () => {
      try {
        const { error } = await sync()
        if (error) throw error
      } catch {
        setNotice('Your cart could not sync with the database. It is still saved on this device.')
      }
    })
  }

  function syncRemoteItem(product, quantity) {
    if (!user?.id) return

    queueCartSync(() => supabase.from('cart_items').upsert(
      { user_id: user.id, product_id: product.id, quantity },
      { onConflict: 'user_id,product_id' },
    ))
  }

  function waitForCartSync() {
    return cartSync.current
  }

  function updateItems(update) {
    setCartState((current) => {
      if (current.storageKey !== storageKey) return current
      return { ...current, items: update(current.items) }
    })
  }

  function addItem(product) {
    if (cartState.loading || cartState.storageKey !== storageKey) {
      return 'Your cart is loading. Try again in a moment.'
    }

    if (product.is_active === false || !Number.isInteger(Number(product.stock)) || Number(product.stock) <= 0) {
      return 'This product is currently unavailable.'
    }

    const existingItem = items.find((item) => item.product.id === product.id)

    if (existingItem && existingItem.quantity >= Number(product.stock)) {
      return 'Your cart already contains all the available stock for this product.'
    }

    updateItems((currentItems) => {
      const foundItem = currentItems.find((item) => item.product.id === product.id)

      if (foundItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { product, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, { product, quantity: 1 }]
    })

    syncRemoteItem(product, existingItem ? existingItem.quantity + 1 : 1)

    return null
  }

  function setQuantity(productId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return 'Enter a whole number greater than zero.'
    }

    const item = items.find((cartItem) => cartItem.product.id === productId)
    if (!item) return 'We could not find this product in your cart.'
    if (quantity > Number(item.product.stock)) return 'The requested quantity exceeds the available stock.'

    updateItems((currentItems) =>
      currentItems.map((cartItem) =>
        cartItem.product.id === productId ? { ...cartItem, quantity } : cartItem,
      ),
    )

    syncRemoteItem(item.product, quantity)

    return null
  }

  function removeItem(productId) {
    updateItems((currentItems) => currentItems.filter((item) => item.product.id !== productId))
    if (user?.id) {
      queueCartSync(() =>
        supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId),
      )
    }
  }

  async function refreshCartProducts() {
    const productIds = items.map((item) => item.product.id)
    if (!productIds.length) return

    const { data, error } = await supabase.from('products')
      .select(PRODUCT_FIELDS)
      .in('id', productIds)
      .eq('is_active', true)

    if (error) throw error

    const products = new Map((data ?? []).map((product) => [product.id, product]))
    updateItems((currentItems) => currentItems.map((item) => {
      if (!productIds.includes(item.product.id)) return item
      const product = products.get(item.product.id) ?? { ...item.product, stock: 0, is_active: false }
      return { ...item, product }
    }))
  }

  async function reloadAfterCheckout(orderedItems = []) {
    if (!user?.id) return

    // The checkout RPC removes the purchased rows. Refresh the remaining cart.
    try {
      const remainingItems = await fetchCart(user.id)
      updateItems(() => remainingItems)
      setNotice('')
    } catch {
      updateItems((currentItems) => currentItems.filter((item) =>
        !orderedItems.some((ordered) =>
          ordered.product.id === item.product.id && ordered.quantity === item.quantity),
      ))
      setNotice('Your order is confirmed. Refresh to sync the remaining cart.')
    }
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  )
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    items,
    total,
    itemCount,
    loading: authLoading || cartState.storageKey !== storageKey || cartState.loading,
    notice: cartState.storageKey === storageKey ? cartState.notice : '',
    addItem,
    setQuantity,
    removeItem,
    waitForCartSync,
    refreshCartProducts,
    reloadAfterCheckout,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
