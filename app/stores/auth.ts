import { defineStore } from 'pinia'
import type { User } from '~/types'

const SESSION_DAYS = 30
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000
const PIN_IDLE_MS = 15 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isPinVerified = ref(false)

  function setUser(u: User | null) {
    user.value = u
  }

  function getStoredPin(): string | null {
    return localStorage.getItem('quotery_pin')
  }

  function storePin(pin: string) {
    localStorage.setItem('quotery_pin', pin)
  }

  function hasPin(): boolean {
    return !!getStoredPin()
  }

  function verifyPin(pin: string): boolean {
    const stored = getStoredPin()
    if (stored === pin) {
      isPinVerified.value = true
      localStorage.setItem('quotery_pin_verified_at', String(Date.now()))
      return true
    }
    return false
  }

  // PIN unlock is idle-based, not session-based: it survives reloads and tab
  // closes, but 15 minutes with no recorded activity forces it to be re-entered.
  function checkSessionVerified(): boolean {
    const raw = localStorage.getItem('quotery_pin_verified_at')
    const verifiedAt = raw ? Number(raw) : NaN
    const ok = !Number.isNaN(verifiedAt) && Date.now() - verifiedAt < PIN_IDLE_MS
    isPinVerified.value = ok
    if (!ok) localStorage.removeItem('quotery_pin_verified_at')
    return ok
  }

  // Slides the idle window forward. Only meaningful once already unlocked —
  // calling this before the PIN is entered must not grant access.
  function recordActivity() {
    if (localStorage.getItem('quotery_pin_verified_at')) {
      localStorage.setItem('quotery_pin_verified_at', String(Date.now()))
    }
  }

  // Marks the start of a 30-day login window. Only a genuine sign-in should
  // call this — a page reload must not reset the clock.
  function markLoginNow() {
    localStorage.setItem('quotery_login_at', String(Date.now()))
  }

  function getLoginAt(): number | null {
    const raw = localStorage.getItem('quotery_login_at')
    const n = raw ? Number(raw) : NaN
    return Number.isNaN(n) ? null : n
  }

  // Null means "unknown" (e.g. a session that predates this feature) rather
  // than "expired", so callers can distinguish no-data from expired.
  function daysRemaining(): number | null {
    const loginAt = getLoginAt()
    if (loginAt === null) return null
    const elapsedDays = Math.floor((Date.now() - loginAt) / (24 * 60 * 60 * 1000))
    return Math.max(SESSION_DAYS - elapsedDays, 0)
  }

  function isSessionExpired(): boolean {
    const loginAt = getLoginAt()
    if (loginAt === null) return false
    return Date.now() - loginAt >= SESSION_MS
  }

  function signOut() {
    user.value = null
    isPinVerified.value = false
    localStorage.removeItem('quotery_pin_verified_at')
    localStorage.removeItem('quotery_login_at')
  }

  return {
    user,
    isAuthenticated,
    isPinVerified,
    setUser,
    getStoredPin,
    storePin,
    hasPin,
    verifyPin,
    checkSessionVerified,
    recordActivity,
    markLoginNow,
    getLoginAt,
    daysRemaining,
    isSessionExpired,
    signOut,
  }
})
