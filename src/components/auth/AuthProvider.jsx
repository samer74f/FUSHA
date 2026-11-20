import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        console.error('Could not restore the Supabase session:', error.message)
      }

      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp({ email, password, fullName }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  const value = { user, loading, signUp, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
