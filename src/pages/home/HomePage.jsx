import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PlaceCard from '../../components/places/PlaceCard'
import { ErrorState, Loading } from '../../components/places/Status'
import { useAsync } from '../../hooks/useAsync'
import { getPlaces } from '../../services/placesService'
import { placeTypes, typeIcons } from '../places/placesData'
import { t } from '../places/placesText'

export default function HomePage() {
  const navigate = useNavigate()
  const load = useCallback(() => getPlaces({ sort: 'rating' }), [])
  const { data: places, error, reload } = useAsync(load)

  function search(event) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(q ? `/places?q=${encodeURIComponent(q)}` : '/places')
  }

  return (
    <>
      <section className="pl-hero">
        <div className="wrap pl-hero-inner">
          <h1>{t.home.title}</h1>
          <p>{t.home.lead}</p>
          <form className="pl-hero-search" role="search" onSubmit={search}>
            <input name="q" type="search" placeholder={t.home.search} aria-label={t.home.search} />
            <button type="submit">{t.home.go}</button>
          </form>
        </div>
      </section>

      <div className="wrap pl-page">
        <section className="pl-home-block" aria-labelledby="pl-home-types">
          <h2 id="pl-home-types">{t.home.types}</h2>
          <div className="pl-type-grid">
            {placeTypes.map((type) => (
              <Link key={type} to={`/places?type=${type}`} className="pl-type-tile">
                <span aria-hidden="true">{typeIcons[type]}</span>
                {t.types[type]}
              </Link>
            ))}
          </div>
        </section>

        <section className="pl-home-block" aria-labelledby="pl-home-top">
          <div className="pl-block-head">
            <h2 id="pl-home-top">{t.home.top}</h2>
            <Link to="/places">{t.home.all}</Link>
          </div>
          {error ? (
            <ErrorState onRetry={reload} />
          ) : !places ? (
            <Loading />
          ) : (
            <div className="pl-grid">
              {places.slice(0, 3).map((place) => <PlaceCard key={place.id} place={place} />)}
            </div>
          )}
        </section>

        <section className="pl-home-block" aria-labelledby="pl-home-sections">
          <h2 id="pl-home-sections">{t.home.sections}</h2>
          <div className="pl-section-grid">
            {t.home.links.map((item) => (
              <Link key={item.to} to={item.to} className="pl-section-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
