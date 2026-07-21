// Slides the 15-minute PIN idle window forward while the user is actually
// using the app. Throttled hard since this fires on every tap/keystroke.
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const THROTTLE_MS = 60_000
  let last = 0

  function bump() {
    const now = Date.now()
    if (now - last < THROTTLE_MS) return
    last = now
    authStore.recordActivity()
  }

  window.addEventListener('pointerdown', bump, { passive: true })
  window.addEventListener('keydown', bump, { passive: true })
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') bump()
  })
})
