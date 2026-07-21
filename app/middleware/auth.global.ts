export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  const publicRoutes = ['/', '/login', '/auth/callback']
  const pinRoutes = ['/pin', '/pin-setup', '/biometric']

  if (publicRoutes.includes(to.path)) return

  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  // 30-day login window, independent of the PIN idle lock.
  if (authStore.isSessionExpired()) {
    const { $supabase } = useNuxtApp()
    await $supabase.auth.signOut()
    authStore.signOut()
    return navigateTo('/')
  }

  if (pinRoutes.includes(to.path)) return

  if (!authStore.isPinVerified && !authStore.checkSessionVerified()) {
    if (!authStore.hasPin()) return navigateTo('/pin-setup')
    return navigateTo('/pin')
  }

  // Reaching here means the PIN lock is currently open — every in-app
  // navigation counts as activity and slides the 15-minute idle window.
  authStore.recordActivity()
})
