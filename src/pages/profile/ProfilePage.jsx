import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/useAuth.js'
import { supabase } from '../../components/auth/supabaseClient.js'
import '../../components/auth/auth.css'
import './profile.css'

function getProfileError(error) {
  if (error?.code === '42501') {
    return 'You do not have permission to view this profile.'
  }

  return 'We could not load your profile. Check your connection and try again.'
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

      try {
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

          if (!isMounted) return

          if (createError) {
            setErrorMessage('We could not load your profile. Try again in a moment.')
          } else {
            setProfile(newProfile)
            setFullName(newProfile.full_name ?? '')
          }
        } else {
          setProfile(data)
          setFullName(data.full_name ?? user.user_metadata?.full_name ?? '')
        }
      } catch {
        if (isMounted) setErrorMessage('We could not connect to load your profile. Try again.')
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
    setErrorMessage('')
    setSuccessMessage('')

    const cleanName = fullName.trim()

    if (cleanName.length < 2) {
      setErrorMessage('Enter a name with at least 2 characters.')
      return
    }

    if (!profile) {
      setErrorMessage('Ask the project administrator to create your profile in the profiles table before editing it.')
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
        setErrorMessage('We could not save your profile. Try again in a moment.')
      } else if (!data) {
        setErrorMessage('Your changes were not saved. Reload the page and try again.')
      } else {
        setProfile(data)
        setFullName(data.full_name ?? '')
        setSuccessMessage('Your profile name was saved.')
      }
    } catch {
      setErrorMessage('We could not connect to save your changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await signOut()

      if (error) setErrorMessage('We could not sign you out. Try again.')
    } catch {
      setErrorMessage('We could not connect to sign you out. Try again.')
    }
  }

  if (loading) {
    return (
      <main className="auth-page" dir="ltr" aria-live="polite">
        <p className="auth-message">Loading your profile…</p>
      </main>
    )
  }

  return (
    <main className="auth-page" dir="ltr">
      <section className="auth-card profile-card" aria-labelledby="profile-title">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark" aria-hidden="true">F</span>
          <span>FUSHA</span>
        </Link>
        <Link className="profile-store-link" to="/store">Visit the store</Link>

        <div className="profile-heading">
          {profile?.avatar_url ? (
            <img className="profile-avatar" src={profile.avatar_url} alt="Profile photo" />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" aria-hidden="true">
              {(fullName || user.email || 'F').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="auth-eyebrow">My profile</p>
            <h1 id="profile-title">Welcome</h1>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>Email address</dt>
            <dd dir="ltr">{user.email}</dd>
          </div>
          {profile?.created_at && (
            <div>
              <dt>Profile created</dt>
              <dd>{new Date(profile.created_at).toLocaleDateString('en-GB')}</dd>
            </div>
          )}
        </dl>

        <form className="auth-form" onSubmit={handleSave}>
          <label className="auth-field">
            <span>Full name</span>
            <input
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </label>

          {errorMessage && <p className="auth-alert auth-alert-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-alert auth-alert-success" role="status">{successMessage}</p>}

          <button className="auth-submit" type="submit" disabled={saving || !profile}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <button className="profile-logout" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </section>
    </main>
  )
}
