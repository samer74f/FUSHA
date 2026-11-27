import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import { useAuth } from './components/auth/useAuth.js'
import './components/auth/auth.css'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import AdminRoute from './components/auth/AdminRoute.jsx'
import StorePage from './pages/store/StorePage.jsx'
import ProductDetailsPage from './pages/store/ProductDetailsPage.jsx'
import CartPage from './pages/store/CartPage.jsx'
import CheckoutPage from './pages/store/CheckoutPage.jsx'
import OrdersPage from './pages/store/OrdersPage.jsx'
import AdminStorePage from './pages/store/AdminStorePage.jsx'

function HomePage() {
  const { user } = useAuth()

  return (
    <main className="auth-page" dir="ltr">
      <section className="auth-home">
        <p className="auth-brand-mark" aria-hidden="true">F</p>
        <h1>FUSHA</h1>
        <p>Discover new places, plan your next trip, and join a community of outdoor adventurers.</p>
        <div className="auth-home-actions">
          {user ? (
            <>
              <Link className="auth-home-link auth-home-link-primary" to="/store">Visit the store</Link>
              <Link className="auth-home-link" to="/profile">My profile</Link>
            </>
          ) : (
            <>
              <Link className="auth-home-link auth-home-link-primary" to="/register">Create an account</Link>
              <Link className="auth-home-link" to="/login">Sign in</Link>
            </>
          )}
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
        path="/store"
        element={<ProtectedRoute><StorePage /></ProtectedRoute>}
      />
      <Route
        path="/store/:productId"
        element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>}
      />
      <Route
        path="/cart"
        element={<ProtectedRoute><CartPage /></ProtectedRoute>}
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/store" element={<AdminRoute><AdminStorePage /></AdminRoute>} />
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
