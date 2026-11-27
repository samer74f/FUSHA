import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useAuth } from "./components/auth/useAuth.js";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import Trips from "./pages/trips/Trips.jsx";
import "./components/auth/auth.css";
import "./styles/release-shell.css";

function SiteHeader() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const returnPath = location.pathname + location.search + location.hash;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const loginState = isAuthPage ? undefined : { from: { pathname: returnPath } };

  return (
    <header className="release-header">
      <nav className="release-nav" aria-label="التنقّل الرئيسي">
        <Link className="release-brand" to="/">فُسحة</Link>
        <NavLink end to="/">الرئيسية</NavLink>
        <NavLink to="/trips">الرحلات</NavLink>
        <NavLink to="/equipment">المعدات</NavLink>
        {!loading && (user
          ? <NavLink to="/profile">ملفي الشخصي</NavLink>
          : <NavLink to="/login" state={loginState}>تسجيل الدخول</NavLink>)}
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <main className="release-main">
      <section className="release-hero">
        <h1>فُسحة</h1>
        <p>خطّط لرحلتك وجهّز المعدات اللي بتحتاجها.</p>
        <div className="release-actions">
          <Link to="/trips">استكشف الرحلات</Link>
          <Link to="/equipment">دليل المعدات</Link>
        </div>
      </section>
    </main>
  );
}

function StorePending() {
  return (
    <main className="release-main">
      <h1>المتجر قيد التجهيز</h1>
      <Link to="/">العودة إلى الرئيسية</Link>
    </main>
  );
}

function App() {
  return (
    <div className="release-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips/*" element={<Trips loginPath="/login" />} />
        <Route path="/equipment" element={<div className="equipment-shell" lang="ar" dir="rtl"><EquipmentPage /></div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/store" element={<StorePending />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="release-footer">فُسحة · NewTech Academy</footer>
    </div>
  );
}

export default App;
