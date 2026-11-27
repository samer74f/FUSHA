import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authText, profileText } from '../../components/auth/accountText.js'
import { useAuth } from '../../components/auth/useAuth.js'
import { supabase } from '../../components/auth/supabaseClient.js'
import '../../components/auth/auth.css'
import './profile.css'

export default function ProfilePage({ language = 'en' }) {
  const text = profileText[language]
  const direction = language === 'ar' ? 'rtl' : 'ltr'
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorKey, setErrorKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setLoading(true)
      setErrorKey('')

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, created_at')
          .eq('id', user.id)
          .maybeSingle()

        if (!isMounted) return

        if (error) {
          setErrorKey(error.code === '42501' ? 'permission' : 'loadFailed')
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

          if (!isMounted) return

          if (createError) {
            setErrorKey('createFailed')
          } else {
            setProfile(newProfile)
            setFullName(newProfile.full_name ?? '')
          }
        } else {
          setProfile(data)
          setFullName(data.full_name ?? user.user_metadata?.full_name ?? '')
        }
      } catch {
        if (isMounted) setErrorKey('loadConnection')
      } finally {
        if (isMounted) setLoading(false)
      }
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
    setErrorKey('')
    setSaved(false)

    const cleanName = fullName.trim()

    if (cleanName.length < 2) {
      setErrorKey('shortName')
      return
    }

    if (!profile) {
      setErrorKey('missingProfile')
      return
    }

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: cleanName })
        .eq('id', user.id)
        .select('id, full_name, avatar_url, created_at')
        .maybeSingle()

      if (error) {
        setErrorKey('saveFailed')
      } else if (!data) {
        setErrorKey('noChanges')
      } else {
        setProfile(data)
        setFullName(data.full_name ?? '')
        setSaved(true)
      }
    } catch {
      setErrorKey('saveConnection')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await signOut()

      if (error) setErrorKey('signOutFailed')
    } catch {
      setErrorKey('signOutConnection')
    }
  }

  if (loading) {
    return (
      <main className="auth-page" lang={language} dir={direction} aria-live="polite">
        <p className="auth-message">{text.loading}</p>
      </main>
    )
  }

  return (
    <main className="auth-page" lang={language} dir={direction}>
      <section className="auth-card profile-card" aria-labelledby="profile-title">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <Link className="profile-store-link" to="/store">{text.store}</Link>

        <div className="profile-heading">
          {profile?.avatar_url ? (
            <img className="profile-avatar" src={profile.avatar_url} alt={text.photo} />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" aria-hidden="true">
              {(fullName || user.email || 'F').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="auth-eyebrow">{text.title}</p>
            <h1 id="profile-title">{text.welcome}</h1>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>{authText[language].email}</dt>
            <dd dir="ltr">{user.email}</dd>
          </div>
          {profile?.created_at && (
            <div>
              <dt>{text.created}</dt>
              <dd>{new Date(profile.created_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en-GB')}</dd>
            </div>
          )}
        </dl>

        <form className="auth-form" onSubmit={handleSave}>
          <label className="auth-field">
            <span>{authText[language].fullName}</span>
            <input
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={text.nameHint}
              dir="auto"
              required
            />
          </label>

          {errorKey && <p className="auth-alert auth-alert-error" role="alert">{text.errors[errorKey]}</p>}
          {saved && <p className="auth-alert auth-alert-success" role="status">{text.saved}</p>}

          <button className="auth-submit" type="submit" disabled={saving || !profile}>
            {saving ? text.saving : text.save}
          </button>
        </form>

        <button className="profile-logout" type="button" onClick={handleSignOut}>
          {text.signOut}
        </button>
      </section>
    </main>
  )
}
