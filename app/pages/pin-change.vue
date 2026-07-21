<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const pinInputRef = ref()
// current: confirm the old PIN → set: pick a new one → confirm: type it again
const step = ref<'current' | 'set' | 'confirm'>(authStore.hasPin() ? 'current' : 'set')
const newPin = ref('')
const done = ref(false)

const titles = {
  current: 'PIN 번호 변경',
  set: '새 PIN 번호',
  confirm: '새 PIN 확인',
}

const descriptions = {
  current: '현재 사용 중인 4자리 PIN을 입력해주세요.',
  set: '새로 사용할 4자리 PIN을 입력해주세요.',
  confirm: '확인을 위해 새 PIN을 한 번 더 입력해주세요.',
}

function goToStep(next: 'current' | 'set' | 'confirm') {
  step.value = next
  nextTick(() => pinInputRef.value?.reset())
}

function onPinComplete(pin: string) {
  if (step.value === 'current') {
    if (authStore.getStoredPin() === pin) {
      goToStep('set')
    } else {
      pinInputRef.value?.setError('현재 PIN이 올바르지 않습니다.')
    }
    return
  }

  if (step.value === 'set') {
    newPin.value = pin
    goToStep('confirm')
    return
  }

  if (pin === newPin.value) {
    authStore.storePin(pin)
    done.value = true
    setTimeout(() => router.push('/settings'), 1200)
  } else {
    pinInputRef.value?.setError('PIN이 일치하지 않습니다. 다시 입력해주세요.')
    newPin.value = ''
    goToStep('set')
  }
}
</script>

<template>
  <div class="page-container">
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4 flex items-center gap-3">
        <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="router.back()">
          <Icon name="lucide:arrow-left" size="20" />
        </button>
        <h1 class="text-section text-black" style="font-weight: 300;">PIN 번호 변경</h1>
      </div>
    </header>

    <main class="px-8 py-12">
      <div v-if="done" class="flex flex-col items-center gap-4 py-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center">
          <Icon name="lucide:check" size="28" class="text-black" />
        </div>
        <p class="text-section text-black" style="font-weight: 300;">PIN이 변경되었어요</p>
      </div>

      <Transition v-else name="fade" mode="out-in" :duration="250">
        <div :key="step">
          <h2 class="text-display text-black mb-2">{{ titles[step] }}</h2>
          <p class="text-ui text-secondary mb-12">{{ descriptions[step] }}</p>
          <PinInput ref="pinInputRef" @complete="onPinComplete" />
        </div>
      </Transition>
    </main>
  </div>
</template>
