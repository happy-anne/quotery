<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const pinInputRef = ref()

onMounted(() => {
  if (authStore.checkSessionVerified()) {
    router.push('/home')
  }
})

function onPinComplete(pin: string) {
  const ok = authStore.verifyPin(pin)
  if (ok) {
    router.push('/home')
  } else {
    pinInputRef.value?.setError('PIN이 올바르지 않습니다.')
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh px-8 py-16">
    <div class="mb-16 flex justify-center">
      <AppLogo size="lg" />
    </div>

    <div class="flex-1 flex flex-col items-center justify-center">
      <h2 class="text-display text-black mb-2 text-center">PIN 입력</h2>
      <p class="text-ui text-secondary mb-12 text-center">
        4자리 PIN을 입력하세요.
      </p>
      <PinInput ref="pinInputRef" @complete="onPinComplete" />
    </div>

    <div class="pb-8 text-center">
      <button class="text-caption text-muted underline underline-offset-2">
        PIN을 잊으셨나요?
      </button>
    </div>
  </div>
</template>
