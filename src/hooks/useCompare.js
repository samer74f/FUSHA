import { useSyncExternalStore } from 'react'

// Places picked for comparison, shared by every page and kept in localStorage.
const KEY = 'fusha-compare'
export const MAX_COMPARE = 3
const listeners = new Set()
let ids = read()

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(saved) ? saved.slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

function write(next) {
  ids = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((notify) => notify())
}

function subscribe(notify) {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

export function toggleCompare(id) {
  if (ids.includes(id)) write(ids.filter((item) => item !== id))
  else if (ids.length < MAX_COMPARE) write([...ids, id])
}

export function clearCompare() {
  write([])
}

export function useCompare() {
  return useSyncExternalStore(subscribe, () => ids, () => ids)
}
