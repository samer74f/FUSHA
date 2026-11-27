import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useAuth } from "./components/auth/useAuth.js";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import Trips from "./pages/trips/Trips.jsx";
import { applyLanguage, getSavedLanguage } from "./services/languagePreferences.js";
import { siteText } from "./siteText.js";
import "./components/auth/auth.css";
import "./styles/SiteLayout.css";

function SiteHeader({ text, language, onLanguageChange }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const returnPath = location.pathname + location.search + location.hash;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const loginState = isAuthPage ? undefined : { from: { pathname: returnPath } };
  const nextLanguage = language === "ar" ? "en" : "ar";

  return (
    <header className="site-layout-header">
      <nav className="site-navigation" aria-label={text.navigation}>
        <Link className="site-brand" to="/">{text.brand}</Link>
        <NavLink end to="/">{text.home}</NavLink>
        <NavLink to="/trips">{text.trips}</NavLink>
        <NavLink to="/equipment">{text.equipment}</NavLink>
        {!loading && (user
          ? <NavLink to="/profile">{text.profile}</NavLink>
          : <NavLink to="/login" state={loginState}>{text.signIn}</NavLink>)}
        <button
          className="site-language-button"
          lang={nextLanguage}
          type="button"
          onClick={() => onLanguageChange(nextLanguage)}
        >
          {nextLanguage === "ar" ? "العربية" : "English"}
        </button>
      </nav>
    </header>
  );
}

function HomePage({ text }) {
  return (
    <main className="site-content">
      <section className="home-intro">
        <h1>{text.brand}</h1>
        <p>{text.intro}</p>
        <div className="home-links">
          <Link to="/trips">{text.exploreTrips}</Link>
          <Link to="/equipment">{text.equipmentGuide}</Link>
        </div>
      </section>
    </main>
  );
}

function StoreComingSoonPage({ text }) {
  return (
    <main className="site-content">
      <h1>{text.storeComingSoon}</h1>
      <Link to="/">{text.backHome}</Link>
    </main>
  );
}

function App() {
  const [language, setLanguage] = useState(getSavedLanguage);
  const text = siteText[language];

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return (
    <div className="site-layout" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <SiteHeader text={text} language={language} onLanguageChange={setLanguage} />
      <Routes>
        <Route path="/" element={<HomePage text={text} />} />
        <Route path="/trips/*" element={<Trips language={language} loginPath="/login" />} />
        <Route path="/equipment" element={<div className="equipment-shell"><EquipmentPage language={language} /></div>} />
        <Route path="/login" element={<LoginPage language={language} />} />
        <Route path="/register" element={<RegisterPage language={language} />} />
        <Route path="/profile" element={
          <ProtectedRoute language={language}><ProfilePage language={language} /></ProtectedRoute>
        } />
        <Route path="/store" element={<StoreComingSoonPage text={text} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="site-layout-footer">{text.brand} · NewTech Academy</footer>
    </div>
  );
}

export default App;
