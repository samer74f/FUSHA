import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import AdminRoute from "./components/auth/AdminRoute.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useAuth } from "./components/auth/useAuth.js";
import PlacesLayout from "./components/places/PlacesLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import HomePage from "./pages/home/HomePage.jsx";
import ComparePage from "./pages/places/ComparePage.jsx";
import NotFoundPage from "./pages/places/NotFoundPage.jsx";
import PlaceDetailsPage from "./pages/places/PlaceDetailsPage.jsx";
import PlacesPage from "./pages/places/PlacesPage.jsx";
import { PlacesLanguageContext } from "./pages/places/placesText.js";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import AdminStorePage from "./pages/store/AdminStorePage.jsx";
import CartPage from "./pages/store/CartPage.jsx";
import CheckoutPage from "./pages/store/CheckoutPage.jsx";
import OrdersPage from "./pages/store/OrdersPage.jsx";
import ProductDetailsPage from "./pages/store/ProductDetailsPage.jsx";
import StorePage from "./pages/store/StorePage.jsx";
import { StoreLocaleContext } from "./pages/store/storeLocale.js";
import Trips from "./pages/trips/Trips.jsx";
import { applyLanguage, getSavedLanguage } from "./services/languagePreferences.js";
import { siteText } from "./siteText.js";
import "./styles/SiteLayout.css";

function SiteHeader({ text, language, onLanguageChange }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const returnPath = location.pathname + location.search + location.hash;
  const loginState = isAuthPage ? undefined : { from: { pathname: returnPath } };
  const nextLanguage = language === "ar" ? "en" : "ar";

  return (
    <header className="site-layout-header">
      <nav className="site-navigation" aria-label={text.navigation}>
        <Link className="site-brand" to="/">{text.brand}</Link>
        <NavLink end to="/">{text.home}</NavLink>
        <NavLink to="/places">{text.places}</NavLink>
        <NavLink to="/trips">{text.trips}</NavLink>
        <NavLink to="/equipment">{text.equipment}</NavLink>
        <NavLink to="/store">{text.store}</NavLink>
        {!loading && (user
          ? <NavLink to="/profile">{text.profile}</NavLink>
          : <NavLink to="/login" state={loginState}>{text.signIn}</NavLink>)}
        <button className="site-language-button" lang={nextLanguage} type="button"
          onClick={() => onLanguageChange(nextLanguage)}>
          {nextLanguage === "ar" ? "العربية" : "English"}
        </button>
      </nav>
    </header>
  );
}

function App() {
  const [language, setLanguage] = useState(getSavedLanguage);
  const text = siteText[language];

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return (
    <PlacesLanguageContext.Provider value={language}>
      <StoreLocaleContext.Provider value={language}>
        <div className="site-layout" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
          <SiteHeader text={text} language={language} onLanguageChange={setLanguage} />
          <Routes>
            <Route element={<PlacesLayout language={language} showNavigation={false} />}>
              <Route index element={<HomePage />} />
              <Route path="places" element={<PlacesPage />} />
              <Route path="places/:id" element={<PlaceDetailsPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/trips/*" element={<Trips language={language} loginPath="/login" />} />
            <Route path="/equipment" element={
              <div className="equipment-shell"><EquipmentPage language={language} /></div>
            } />
            <Route path="/login" element={<LoginPage language={language} />} />
            <Route path="/register" element={<RegisterPage language={language} />} />
            <Route path="/profile" element={
              <ProtectedRoute language={language}><ProfilePage language={language} /></ProtectedRoute>
            } />
            <Route path="/store" element={<StorePage />} />
            <Route path="/store/:productId" element={<ProductDetailsPage />} />
            <Route path="/cart" element={
              <ProtectedRoute language={language}><CartPage /></ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute language={language}><CheckoutPage /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute language={language}><OrdersPage /></ProtectedRoute>
            } />
            <Route path="/admin/store" element={<AdminRoute><AdminStorePage /></AdminRoute>} />
          </Routes>
          <footer className="site-layout-footer">{text.brand} · NewTech Academy</footer>
        </div>
      </StoreLocaleContext.Provider>
    </PlacesLanguageContext.Provider>
  );
}

export default App;
