<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const pinInputRef = ref()
const step = ref<'set' | 'confirm'>('set')
const firstPin = ref('')

function onPinComplete(pin: string) {
  if (step.value === 'set') {
    firstPin.value = pin
    step.value = 'confirm'
    nextTick(() => pinInputRef.value?.reset())
  } else {
    if (pin === firstPin.value) {
      authStore.storePin(pin)
      router.push('/biometric')
    } else {
      pinInputRef.value?.setError('PIN이 일치하지 않습니다. 다시 입력해주세요.')
      step.value = 'set'
      firstPin.value = ''
    }
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh px-8 py-16">
    <div class="mb-12">
      <AppLogo />
    </div>

    <Transition name="fade" mode="out-in" :duration="250">
      <div :key="step">
        <h2 class="text-display text-black mb-2">
          {{ step === 'set' ? 'PIN 번호 설정' : 'PIN 확인' }}
        </h2>
        <p class="text-ui text-secondary mb-12">
          {{ step === 'set'
            ? '앱 잠금을 위한 4자리 PIN을 설정해주세요.'
            : '확인을 위해 PIN을 한 번 더 입력해주세요.' }}
        </p>

        <PinInput ref="pinInputRef" @complete="onPinComplete" />
      </div>
    </Transition>
  </div>
</template>
