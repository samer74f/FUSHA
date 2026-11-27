import { supabase } from '../../components/auth/supabaseClient.js'

export const PRODUCT_FIELDS = 'id, name, description, price, category, image_url, stock, is_active'

export async function getProducts() {
  return supabase.from('products').select(PRODUCT_FIELDS).eq('is_active', true).order('name')
}

export async function getProduct(productId) {
  return supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('id', productId)
    .eq('is_active', true)
    .maybeSingle()
}

export async function getOrders(userId) {
  return supabase
    .from('orders')
    .select('id, recipient_name, total, status, created_at, order_items(id, product_name, unit_price, quantity)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createOrder({ recipientName, phone, deliveryAddress, items }) {
  return supabase.rpc('place_order', {
    p_recipient_name: recipientName,
    p_phone: phone,
    p_delivery_address: deliveryAddress,
    p_items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
  })
}

export async function getAdminProducts() {
  return supabase.from('products').select(PRODUCT_FIELDS).order('created_at', { ascending: false })
}

export async function saveProduct(product, productId) {
  const query = productId
    ? supabase.from('products').update(product).eq('id', productId)
    : supabase.from('products').insert(product)

  return query.select(PRODUCT_FIELDS).single()
}

export async function deleteProduct(productId) {
  return supabase.from('products').delete().eq('id', productId)
}

export async function getAllOrders() {
  return supabase
    .from('orders')
    .select('id, recipient_name, phone, delivery_address, total, status, created_at')
    .order('created_at', { ascending: false })
}

export async function setOrderStatus(orderId, status) {
  return supabase.from('orders').update({ status }).eq('id', orderId).select('id').single()
}
