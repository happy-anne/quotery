import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isPinVerified = ref(false)

  function setUser(u: User | null) {
    user.value = u
  }

  function setPinVerified(v: boolean) {
    isPinVerified.value = v
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
      sessionStorage.setItem('quotery_pin_verified', '1')
      return true
    }
    return false
  }

  function checkSessionVerified(): boolean {
    const v = sessionStorage.getItem('quotery_pin_verified') === '1'
    if (v) isPinVerified.value = true
    return v
  }

  function signOut() {
    user.value = null
    isPinVerified.value = false
    sessionStorage.removeItem('quotery_pin_verified')
  }

  return {
    user,
    isAuthenticated,
    isPinVerified,
    setUser,
    setPinVerified,
    getStoredPin,
    storePin,
    hasPin,
    verifyPin,
    checkSessionVerified,
    signOut,
  }
})
