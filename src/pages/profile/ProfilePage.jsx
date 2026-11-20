import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { supabase } from '../../components/auth/supabaseClient.js'
import '../../components/auth/auth.css'
import './profile.css'

function getProfileError(error) {
  if (error?.code === '42501') {
    return 'لا تسمح صلاحيات قاعدة البيانات بقراءة هذا الملف الشخصي.'
  }

  return 'تعذر تحميل الملف الشخصي. تحقق من الاتصال وحاول مرة أخرى.'
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('id', user.id)
        .maybeSingle()

      if (!isMounted) return

      if (error) {
        setErrorMessage(getProfileError(error))
      } else if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name ?? '',
            avatar_url: user.user_metadata?.avatar_url ?? null,
          }, { onConflict: 'id' })
          .select('id, full_name, avatar_url, created_at')
          .single()

        if (createError) {
          setErrorMessage('لم نجد سجلاً لملفك الشخصي، وتعذر إنشاؤه. تحقق من سياسات RLS.')
        } else {
          setProfile(newProfile)
          setFullName(newProfile.full_name ?? '')
        }
      } else {
        setProfile(data)
        setFullName(data.full_name ?? user.user_metadata?.full_name ?? '')
      }

      setLoading(false)
    }

    if (user?.id) {
      loadProfile()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  async function handleSave(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanName = fullName.trim()

    if (cleanName.length < 2) {
      setErrorMessage('أدخل اسماً من حرفين على الأقل.')
      return
    }

    if (!profile) {
      setErrorMessage('لا يوجد سجل محفوظ لتعديله. اطلب تهيئة ملفك في جدول profiles أولاً.')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: cleanName })
      .eq('id', user.id)
      .select('id, full_name, avatar_url, created_at')
      .maybeSingle()

    if (error) {
      setErrorMessage('تعذر حفظ التعديلات. تحقق من صلاحيات RLS وحاول مرة أخرى.')
    } else if (!data) {
      setErrorMessage('لم يتم تحديث الملف. قد تمنع سياسات RLS هذا التعديل.')
    } else {
      setProfile(data)
      setFullName(data.full_name ?? '')
      setSuccessMessage('تم حفظ اسمك في الملف الشخصي.')
    }

    setSaving(false)
  }

  async function handleSignOut() {
    const { error } = await signOut()

    if (error) {
      setErrorMessage('تعذر تسجيل الخروج. حاول مرة أخرى.')
    }
  }

  if (loading) {
    return (
      <main className="auth-page" dir="rtl" aria-live="polite">
        <p className="auth-message">جارٍ تحميل الملف الشخصي…</p>
      </main>
    )
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card profile-card" aria-labelledby="profile-title">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <Link className="profile-store-link" to="/store">دخول إلى المتجر</Link>

        <div className="profile-heading">
          {profile?.avatar_url ? (
            <img className="profile-avatar" src={profile.avatar_url} alt="الصورة الشخصية" />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" aria-hidden="true">
              {(fullName || user.email || 'F').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="auth-eyebrow">ملفي الشخصي</p>
            <h1 id="profile-title">أهلاً بك</h1>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>البريد الإلكتروني</dt>
            <dd dir="ltr">{user.email}</dd>
          </div>
          {profile?.created_at && (
            <div>
              <dt>تاريخ إنشاء الملف</dt>
              <dd>{new Date(profile.created_at).toLocaleDateString('ar')}</dd>
            </div>
          )}
        </dl>

        <form className="auth-form" onSubmit={handleSave}>
          <label className="auth-field">
            <span>الاسم الكامل</span>
            <input
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="أدخل اسمك"
              required
            />
          </label>

          {errorMessage && <p className="auth-alert auth-alert-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-alert auth-alert-success" role="status">{successMessage}</p>}

          <button className="auth-submit" type="submit" disabled={saving || !profile}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
          </button>
        </form>

        <button className="profile-logout" type="button" onClick={handleSignOut}>
          تسجيل الخروج
        </button>
      </section>
    </main>
  )
}
