import { getLocalizedPlaceContent } from '../pages/places/placesData.js'
import { result, supabase } from './supabase.js'

const placeColumns = 'id,slug,name,description,region,category_id,country,latitude,longitude,difficulty'
const reviewColumns = 'id,place_id,author_name,rating,comment,created_at'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function database() {
  if (!supabase) throw new Error('places-config-missing')
  return supabase
}

function imageUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

async function getReviewSummaries(ids) {
  const { data, error } = await database()
    .from('place_review_summary')
    .select('place_id,rating,review_count')
    .in('place_id', ids)
  // Browsing still works while the shared reviews migration is pending.
  if (error?.code === 'PGRST205') return []
  if (error) throw error
  return data
}

async function completePlaces(rows) {
  if (!rows.length) return []
  const client = database()
  const ids = rows.map((row) => row.id)
  const categoryIds = [...new Set(rows.map((row) => row.category_id).filter(Boolean))]
  const [categories, photos, summaries] = await Promise.all([
    categoryIds.length
      ? result(client.from('place_categories').select('id,name,slug').in('id', categoryIds))
      : [],
    result(client
      .from('place_photos')
      .select('id,place_id,image_url,alt_text')
      .in('place_id', ids)
      .order('sort_order')
      .order('id')),
    getReviewSummaries(ids),
  ])

  return rows.map((row) => {
    const category = categories.find((item) => item.id === row.category_id)
    const summary = summaries.find((item) => item.place_id === row.id)
    const pictures = photos
      .filter((photo) => photo.place_id === row.id)
      .map((photo) => ({ id: photo.id, url: imageUrl(photo.image_url), alt: photo.alt_text }))
      .filter((photo) => photo.url)

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      region: row.region,
      country: row.country,
      type: category?.slug,
      typeName: category?.name,
      difficulty: row.difficulty,
      lat: row.latitude == null ? null : Number(row.latitude),
      lng: row.longitude == null ? null : Number(row.longitude),
      pictures,
      rating: Number(summary?.rating ?? 0),
      reviewCount: Number(summary?.review_count ?? 0),
    }
  })
}

function normalizePlaceSearch(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').trim().toLocaleLowerCase()
}

function matchesPlaceSearch(place, search) {
  const arabic = getLocalizedPlaceContent(place, 'ar')
  const searchableText = [place.name, place.region, place.description, arabic.name, arabic.region, arabic.description]
  return normalizePlaceSearch(searchableText.join(' ')).includes(search)
}

export function filterPlaces(places, { q = '', city = '', type = '', minRating = '', sort = 'rating' } = {}) {
  const search = normalizePlaceSearch(q)
  return places
    .filter((place) =>
      (!search || matchesPlaceSearch(place, search)) &&
      (!city || place.region === city) &&
      (!type || place.type === type) &&
      (!minRating || place.rating >= Number(minRating)))
    .sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name)
      : b.rating - a.rating || a.name.localeCompare(b.name))
}

export async function getPlaces(filters) {
  const rows = await result(database().from('places').select(placeColumns).eq('is_published', true).order('name'))
  return filterPlaces(await completePlaces(rows), filters)
}

export async function getPlace(id) {
  const key = uuidPattern.test(id) ? 'id' : 'slug'
  const row = await result(database().from('places').select(placeColumns).eq('is_published', true).eq(key, id).maybeSingle())
  if (!row) throw new Error('not-found')
  const [place] = await completePlaces([row])
  return place
}

export async function getPlacesByIds(ids) {
  const validIds = ids.filter((id) => uuidPattern.test(id))
  if (!validIds.length) return []
  const rows = await result(database().from('places').select(placeColumns).eq('is_published', true).in('id', validIds))
  const places = await completePlaces(rows)
  return validIds.map((id) => places.find((place) => place.id === id)).filter(Boolean)
}

export async function getReviews(placeId, signedIn) {
  const columns = signedIn ? reviewColumns + ',user_id' : reviewColumns
  const rows = await result(database()
    .from('place_reviews')
    .select(columns)
    .eq('place_id', placeId)
    .order('created_at', { ascending: false }))
  return rows.map((row) => ({
    id: row.id,
    authorId: row.user_id,
    author: row.author_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }))
}

export async function addReview({ placeId, rating, comment }) {
  await result(database().from('place_reviews').insert({ place_id: placeId, rating, comment }))
}

export async function updateReview(id, { rating, comment }) {
  await result(database().from('place_reviews').update({ rating, comment }).eq('id', id).select('id').single())
}

export async function deleteReview(id) {
  await result(database().from('place_reviews').delete().eq('id', id).select('id').single())
}
