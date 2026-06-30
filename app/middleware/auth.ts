export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const publicRoutes = ['/', '/login', '/auth/callback']
  const pinRoutes = ['/pin', '/pin-setup', '/biometric']

  if (publicRoutes.includes(to.path)) return

  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  if (pinRoutes.includes(to.path)) return

  if (!authStore.isPinVerified && !authStore.checkSessionVerified()) {
    if (!authStore.hasPin()) return navigateTo('/pin-setup')
    return navigateTo('/pin')
  }
})
