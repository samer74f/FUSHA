import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useAuth } from "./components/auth/useAuth.js";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import Trips from "./pages/trips/Trips.jsx";
import "./components/auth/auth.css";
import "./styles/SiteLayout.css";

function SiteHeader() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const returnPath = location.pathname + location.search + location.hash;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const loginState = isAuthPage ? undefined : { from: { pathname: returnPath } };

  return (
    <header className="site-layout-header">
      <nav className="site-navigation" aria-label="Main navigation">
        <Link className="site-brand" to="/">FUSHA</Link>
        <NavLink end to="/">Home</NavLink>
        <NavLink to="/trips">Trips</NavLink>
        <NavLink to="/equipment">Equipment</NavLink>
        {!loading && (user
          ? <NavLink to="/profile">My profile</NavLink>
          : <NavLink to="/login" state={loginState}>Sign in</NavLink>)}
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <main className="site-content">
      <section className="home-intro">
        <h1>FUSHA</h1>
        <p>Plan your trip and find the gear you need.</p>
        <div className="home-links">
          <Link to="/trips">Explore trips</Link>
          <Link to="/equipment">Equipment guide</Link>
        </div>
      </section>
    </main>
  );
}

function StoreComingSoonPage() {
  return (
    <main className="site-content">
      <h1>Store coming soon</h1>
      <Link to="/">Back to home</Link>
    </main>
  );
}

function App() {
  return (
    <div className="site-layout">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips/*" element={<Trips loginPath="/login" />} />
        <Route path="/equipment" element={<div className="equipment-shell"><EquipmentPage /></div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/store" element={<StoreComingSoonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="site-layout-footer">FUSHA · NewTech Academy</footer>
    </div>
  );
}

export default App;
