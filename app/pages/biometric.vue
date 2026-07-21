<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const router = useRouter()

function allow() {
  localStorage.setItem('quotery_biometric', '1')
  router.push('/home')
}

function skip() {
  router.push('/home')
}
</script>

<template>
  <div class="flex flex-col min-h-dvh px-8 py-16">
    <div class="flex-1 flex flex-col items-center justify-center text-center gap-6">
      <div class="w-20 h-20 rounded-3xl bg-canvas flex items-center justify-center mb-4">
        <Icon name="lucide:fingerprint" size="36" />
      </div>
      <h2 class="text-display text-black">생체 인증</h2>
      <p class="text-body text-secondary max-w-xs">
        Face ID, Touch ID 또는 지문 인증을 사용하면<br>
        더 빠르게 Quotery를 열 수 있어요.
      </p>
    </div>

    <div class="flex flex-col gap-3 pb-8">
      <button class="btn btn-primary w-full h-14 text-nav" @click="allow">
        생체 인증 사용하기
      </button>
      <button class="btn btn-ghost w-full h-14 text-nav text-muted" @click="skip">
        나중에 설정하기
      </button>
    </div>
  </div>
</template>
