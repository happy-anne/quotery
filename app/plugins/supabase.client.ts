import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
  )

  const authStore = useAuthStore()

  function applySession(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    authStore.setUser({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name as string | undefined,
      avatar_url: user.user_metadata?.avatar_url as string | undefined,
    })
  }

  // Supabase persists its own session in localStorage, but the app's `user`
  // state lives only in memory — without this, every reload looks logged out
  // even though the underlying session is still valid.
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    applySession(session.user)
    // Approximate the 30-day window for sessions that predate this feature;
    // a real sign-in below always overwrites this with a fresh timestamp.
    if (authStore.getLoginAt() === null) authStore.markLoginNow()
  }

  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_IN' && newSession?.user) {
      applySession(newSession.user)
      authStore.markLoginNow()
    }
    if (event === 'SIGNED_OUT') {
      authStore.signOut()
    }
  })

  return {
    provide: {
      supabase,
    },
  }
})
