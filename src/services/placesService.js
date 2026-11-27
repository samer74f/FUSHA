import { places, seedReviews } from '../pages/places/placesData'

// Mock data layer: same async API the Supabase version will expose.
// Later: replace each function body with a supabase query; pages stay unchanged.
const REVIEWS_KEY = 'fusha-place-reviews'
const REVIEWER_KEY = 'fusha-reviewer-id'
const wait = () => new Promise((resolve) => setTimeout(resolve, 300))

function readReviews() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY)) ?? seedReviews
  } catch {
    return seedReviews
  }
}

function saveReviews(list) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list))
}

function withRating(place, reviews) {
  const own = reviews.filter((review) => review.placeId === place.id)
  const total = own.reduce((sum, review) => sum + review.rating, 0)
  const rating = own.length ? Math.round((total / own.length) * 10) / 10 : 0
  return { ...place, rating, reviewCount: own.length }
}

const sorters = {
  rating: (a, b) => b.rating - a.rating,
  name: (a, b) => a.name.localeCompare(b.name, 'ar'),
  fee: (a, b) => {
    if (a.entryFee == null) return b.entryFee == null ? 0 : 1
    if (b.entryFee == null) return -1
    return a.entryFee - b.entryFee
  },
}

export async function getPlaces({ q = '', city = '', type = '', minRating = '', sort = 'rating' } = {}) {
  await wait()
  const reviews = readReviews()
  const text = q.trim().toLocaleLowerCase('ar')
  return places
    .map((place) => withRating(place, reviews))
    .filter((place) =>
      (!text || `${place.name} ${place.city} ${place.description}`.toLocaleLowerCase('ar').includes(text)) &&
      (!city || place.city === city) &&
      (!type || place.type === type) &&
      (!minRating || place.rating >= Number(minRating)))
    .sort(sorters[sort] ?? sorters.rating)
}

export async function getPlace(id) {
  await wait()
  const place = places.find((item) => item.id === id)
  if (!place) throw new Error('not-found')
  return withRating(place, readReviews())
}

export async function getPlacesByIds(ids) {
  await wait()
  const reviews = readReviews()
  return ids
    .map((id) => places.find((place) => place.id === id))
    .filter(Boolean)
    .map((place) => withRating(place, reviews))
}

// Stand-in for the logged-in user's id until auth is connected.
export function getReviewerId() {
  let id = localStorage.getItem(REVIEWER_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(REVIEWER_KEY, id)
  }
  return id
}

export async function getReviews(placeId) {
  await wait()
  return readReviews()
    .filter((review) => review.placeId === placeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addReview({ placeId, author, rating, comment }) {
  await wait()
  const review = {
    id: crypto.randomUUID(),
    placeId,
    authorId: getReviewerId(),
    author,
    rating,
    comment,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  saveReviews([review, ...readReviews()])
  return review
}

export async function updateReview(id, { author, rating, comment }) {
  await wait()
  const list = readReviews()
  const target = list.find((review) => review.id === id && review.authorId === getReviewerId())
  if (!target) throw new Error('not-allowed')
  const updated = { ...target, author, rating, comment }
  saveReviews(list.map((review) => (review.id === id ? updated : review)))
  return updated
}

export async function deleteReview(id) {
  await wait()
  const list = readReviews()
  if (!list.some((review) => review.id === id && review.authorId === getReviewerId())) throw new Error('not-allowed')
  saveReviews(list.filter((review) => review.id !== id))
}
