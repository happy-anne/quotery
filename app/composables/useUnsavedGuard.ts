import type { Ref } from 'vue'

/**
 * Warns before leaving a form that has unsaved input.
 *
 * Covers both in-app navigation (router guard — back button, links, the header
 * close button) and leaving the site entirely (beforeunload — reload, tab
 * close). Call `allowLeave()` right before navigating away on a successful
 * save so the prompt does not fire on the happy path.
 */
export function useUnsavedGuard(isDirty: Ref<boolean>) {
  const router = useRouter()
  const showConfirm = ref(false)
  const bypass = ref(false)
  const pendingPath = ref<string | null>(null)

  onBeforeRouteLeave((to) => {
    if (!isDirty.value || bypass.value) return true
    pendingPath.value = to.fullPath
    showConfirm.value = true
    return false
  })

  useEventListener(window, 'beforeunload', (e: BeforeUnloadEvent) => {
    if (!isDirty.value || bypass.value) return
    // Browsers show their own generic wording here; the text cannot be set.
    e.preventDefault()
    e.returnValue = ''
  })

  function allowLeave() {
    bypass.value = true
  }

  function confirmLeave() {
    showConfirm.value = false
    bypass.value = true
    const path = pendingPath.value
    pendingPath.value = null
    if (path) router.push(path)
    else router.back()
  }

  function cancelLeave() {
    showConfirm.value = false
    pendingPath.value = null
  }

  return { showConfirm, confirmLeave, cancelLeave, allowLeave }
}
