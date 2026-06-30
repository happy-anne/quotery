<script setup lang="ts">
const emit = defineEmits<{ complete: [pin: string] }>()

const digits = ref(['', '', '', ''])
const refs = ref<HTMLInputElement[]>([])
const error = ref('')

function onInput(index: number, e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1)
  digits.value[index] = val
  if (val && index < 3) {
    refs.value[index + 1]?.focus()
  }
  checkComplete()
}

function onKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    refs.value[index - 1]?.focus()
  }
}

function checkComplete() {
  const pin = digits.value.join('')
  if (pin.length === 4) {
    emit('complete', pin)
  }
}

function setError(msg: string) {
  error.value = msg
  digits.value = ['', '', '', '']
  nextTick(() => refs.value[0]?.focus())
  setTimeout(() => { error.value = '' }, 2000)
}

defineExpose({ setError })
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="flex gap-3">
      <input
        v-for="(_, i) in 4"
        :key="i"
        :ref="el => { if (el) refs[i] = el as HTMLInputElement }"
        v-model="digits[i]"
        type="tel"
        inputmode="numeric"
        maxlength="1"
        :class="[
          'w-14 h-14 text-center text-xl font-medium rounded-2xl border-2 transition-all outline-none',
          digits[i] ? 'border-black bg-stone' : 'border-border bg-canvas',
          'focus:border-black',
        ]"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
      >
    </div>
    <Transition name="fade">
      <p v-if="error" class="text-caption text-red-500">{{ error }}</p>
    </Transition>
  </div>
</template>
