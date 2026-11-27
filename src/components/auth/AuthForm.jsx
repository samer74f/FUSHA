import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import './auth.css'

function getFriendlyError(error) {
  const message = error?.message?.toLowerCase() ?? ''

  if (message.includes('invalid login credentials')) {
    return 'The email address or password is incorrect.'
  }

  if (message.includes('user already registered')) {
    return 'An account already uses this email address. Try signing in.'
  }

  if (message.includes('password')) {
    return 'Make sure your password is at least 6 characters long.'
  }

  if (message.includes('email')) {
    return 'Check that your email address is correct.'
  }

  return 'We could not complete your request. Try again in a moment.'
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!isValidEmail(email.trim())) {
      setErrorMessage('Enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Your password must be at least 6 characters long.')
      return
    }

    if (isRegister && fullName.trim().length < 2) {
      setErrorMessage('Enter your name with at least 2 characters.')
      return
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMessage('The passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const result = isRegister
        ? await signUp({
            email: email.trim(),
            password,
            fullName: fullName.trim(),
          })
        : await signIn({ email: email.trim(), password })

      if (result.error) {
        setErrorMessage(getFriendlyError(result.error))
      } else if (isRegister && !result.data.session) {
        setSuccessMessage('Your account is ready. Check your email to confirm your registration, then sign in.')
      } else {
        const nextPath = location.state?.from?.pathname ?? '/profile'
        navigate(nextPath, { replace: true })
      }
    } catch {
      setErrorMessage('We could not connect. Check your internet connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page" dir="ltr">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-brand" to="/" aria-label="Return to FUSHA">
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <p className="auth-eyebrow">Your journey starts here</p>
        <h1 id="auth-title">{isRegister ? 'Create an account' : 'Welcome back'}</h1>
        <p className="auth-description">
          {isRegister
            ? 'Create an account to discover trips and prepare for your next adventure.'
            : 'Sign in to access your trips and account.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label className="auth-field">
              <span>Full name</span>
              <input
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Example: Alex Taylor"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email address</span>
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>Confirm password</span>
              <input
                autoComplete="new-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                required
              />
            </label>
          )}

          {errorMessage && <p className="auth-alert auth-alert-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-alert auth-alert-success" role="status">{successMessage}</p>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  )
}
