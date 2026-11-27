import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authText } from './accountText.js'
import { useAuth } from './useAuth.js'
import './auth.css'

function getAuthErrorKey(error) {
  const message = error?.message?.toLowerCase() ?? ''

  if (message.includes('invalid login credentials')) {
    return 'badCredentials'
  }

  if (message.includes('user already registered')) {
    return 'emailInUse'
  }

  if (message.includes('password')) {
    return 'checkPassword'
  }

  if (message.includes('email')) {
    return 'checkEmail'
  }

  return 'requestFailed'
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function AuthForm({ mode, language = 'en' }) {
  const text = authText[language]
  const isRegister = mode === 'register'
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorKey('')
    setNeedsEmailConfirmation(false)

    if (!isValidEmail(email.trim())) {
      setErrorKey('invalidEmail')
      return
    }

    if (password.length < 6) {
      setErrorKey('shortPassword')
      return
    }

    if (isRegister && fullName.trim().length < 2) {
      setErrorKey('shortName')
      return
    }

    if (isRegister && password !== confirmPassword) {
      setErrorKey('passwordMismatch')
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
        setErrorKey(getAuthErrorKey(result.error))
      } else if (isRegister && !result.data.session) {
        setNeedsEmailConfirmation(true)
      } else {
        const nextPath = location.state?.from?.pathname ?? '/profile'
        navigate(nextPath, { replace: true })
      }
    } catch {
      setErrorKey('connection')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page" lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-brand" to="/" aria-label={text.returnHome}>
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <p className="auth-eyebrow">{text.intro}</p>
        <h1 id="auth-title">{isRegister ? text.registerTitle : text.loginTitle}</h1>
        <p className="auth-description">
          {isRegister ? text.registerDescription : text.loginDescription}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label className="auth-field">
              <span>{text.fullName}</span>
              <input
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={text.nameExample}
                dir="auto"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>{text.email}</span>
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
            <span>{text.password}</span>
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={text.passwordHint}
              required
            />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>{text.confirmPassword}</span>
              <input
                autoComplete="new-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={text.confirmPasswordHint}
                required
              />
            </label>
          )}

          {errorKey && <p className="auth-alert auth-alert-error" role="alert">{text.errors[errorKey]}</p>}
          {needsEmailConfirmation && <p className="auth-alert auth-alert-success" role="status">{text.confirmEmail}</p>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? text.submitting : isRegister ? text.createAccount : text.signIn}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? text.haveAccount : text.needAccount}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? text.signIn : text.registerTitle}
          </Link>
        </p>
      </section>
    </main>
  )
}
