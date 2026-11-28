function storageKey(userId) {
  return `fusha-checkout-request:${userId}`
}

export function readCheckoutRequest(userId) {
  try {
    return localStorage.getItem(storageKey(userId))
  } catch {
    return null
  }
}

export function getCheckoutRequest(userId) {
  const existingRequest = readCheckoutRequest(userId)
  if (existingRequest) return existingRequest

  const requestId = crypto.randomUUID()
  localStorage.setItem(storageKey(userId), requestId)
  return requestId
}

export function clearCheckoutRequest(userId, requestId) {
  if (readCheckoutRequest(userId) === requestId) {
    try {
      localStorage.removeItem(storageKey(userId))
    } catch {
      // The existing request still points to the confirmed order.
    }
  }
}
