import { NavLink, Outlet } from 'react-router-dom'
import { usePlacesText } from '../../pages/places/placesText'
import '../../pages/places/places.css'
import CompareBar from './CompareBar'

// Header + page outlet for the home and places routes.
export default function PlacesLayout({ language, setLanguage, showNavigation = true }) {
  const t = usePlacesText()
  return (
    <div className="pl-app" lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {showNavigation && (
        <header className="pl-header">
          <div className="wrap pl-header-inner">
            <NavLink to="/" className="brand">{t.brand}</NavLink>
            <nav className="pl-nav" aria-label={t.nav.label}>
              <NavLink to="/" end>{t.nav.home}</NavLink>
              <NavLink to="/places">{t.nav.places}</NavLink>
              <NavLink to="/compare">{t.nav.compare}</NavLink>
              <NavLink to="/equipment">{t.nav.equipment}</NavLink>
              <button type="button" lang={language === 'ar' ? 'en' : 'ar'} onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
            </nav>
          </div>
        </header>
      )}
      <main>
        <Outlet />
      </main>
      <CompareBar />
    </div>
  )
}
