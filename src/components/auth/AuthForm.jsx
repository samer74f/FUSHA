import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import './auth.css'

function getFriendlyError(error) {
  const message = error?.message?.toLowerCase() ?? ''

  if (message.includes('invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  }

  if (message.includes('user already registered')) {
    return 'هذا البريد مسجل مسبقاً. جرّب تسجيل الدخول.'
  }

  if (message.includes('password')) {
    return 'تحقق من كلمة المرور، وتأكد أنها لا تقل عن 6 أحرف.'
  }

  if (message.includes('email')) {
    return 'تحقق من صحة البريد الإلكتروني.'
  }

  return 'تعذر إكمال العملية. حاول مرة أخرى بعد قليل.'
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
      setErrorMessage('أدخل بريداً إلكترونياً صحيحاً.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.')
      return
    }

    if (isRegister && fullName.trim().length < 2) {
      setErrorMessage('أدخل اسمك (حرفان على الأقل).')
      return
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.')
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
        setSuccessMessage('تم إنشاء الحساب. افتح بريدك لتأكيد التسجيل ثم سجّل الدخول.')
      } else {
        const nextPath = location.state?.from?.pathname ?? '/profile'
        navigate(nextPath, { replace: true })
      }
    } catch {
      setErrorMessage('تعذر الاتصال بالخدمة. تحقق من اتصال الإنترنت وحاول مجدداً.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-brand" to="/" aria-label="العودة إلى FUSHA">
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <p className="auth-eyebrow">رحلتك تبدأ من هنا</p>
        <h1 id="auth-title">{isRegister ? 'إنشاء حساب' : 'أهلاً بعودتك'}</h1>
        <p className="auth-description">
          {isRegister
            ? 'أنشئ حسابك لاكتشاف الرحلات والاستعداد لمغامرتك القادمة.'
            : 'سجّل الدخول لمتابعة رحلاتك وحسابك.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label className="auth-field">
              <span>الاسم الكامل</span>
              <input
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="مثال: يوسف أحمد"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>البريد الإلكتروني</span>
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
            <span>كلمة المرور</span>
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="6 أحرف على الأقل"
              required
            />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>تأكيد كلمة المرور</span>
              <input
                autoComplete="new-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="أعد كتابة كلمة المرور"
                required
              />
            </label>
          )}

          {errorMessage && <p className="auth-alert auth-alert-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-alert auth-alert-success" role="status">{successMessage}</p>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'جارٍ الإرسال…' : isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'سجّل الدخول' : 'أنشئ حساباً'}
          </Link>
        </p>
      </section>
    </main>
  )
}
