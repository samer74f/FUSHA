import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './components/auth/useAuth.js'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import './components/auth/auth.css'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'

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

function AccountPage() {
  const { user, signOut } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSignOut() {
    const { error } = await signOut()

    if (error) {
      setErrorMessage('تعذر تسجيل الخروج. حاول مرة أخرى.')
    }
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <p className="auth-eyebrow">تم تسجيل الدخول</p>
        <h1>أهلاً بك في FUSHA</h1>
        <p className="auth-description">{user?.email}</p>
        <p className="auth-description">حسابك محمي. ستُضاف تفاصيل الملف الشخصي في المرحلة التالية.</p>
        {errorMessage && <p className="auth-alert auth-alert-error" role="alert">{errorMessage}</p>}
        <button className="auth-submit" type="button" onClick={handleSignOut}>تسجيل الخروج</button>
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
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
