import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import './components/auth/auth.css'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'

function HomePage() {
  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-home">
        <p className="auth-brand-mark" aria-hidden="true">F</p>
        <h1>FUSHA</h1>
        <p>اكتشف أماكن جديدة، وخطط لرحلتك القادمة، وانضم إلى مجتمع المغامرات الخارجية.</p>
        <div className="auth-home-actions">
          <Link className="auth-home-link auth-home-link-primary" to="/register">إنشاء حساب</Link>
          <Link className="auth-home-link" to="/login">تسجيل الدخول</Link>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
