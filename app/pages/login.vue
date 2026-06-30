<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { $supabase } = useNuxtApp()
const authStore = useAuthStore()
const router = useRouter()
const loading = ref<string | null>(null)

async function loginWithKakao() {
  loading.value = 'kakao'
  await $supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

async function loginWithGoogle() {
  loading.value = 'google'
  await $supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

async function loginWithApple() {
  loading.value = 'apple'
  await $supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}
</script>

<template>
  <div class="flex flex-col min-h-dvh px-8">
    <!-- Header -->
    <div class="pt-16 pb-12">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-caption text-muted mb-10">
        <Icon name="lucide:arrow-left" size="16" />
        돌아가기
      </NuxtLink>
      <AppLogo />
      <h2 class="text-display text-black mt-8 mb-2">로그인</h2>
      <p class="text-ui text-secondary">계속하려면 로그인해주세요.</p>
    </div>

    <!-- Social Login -->
    <div class="flex flex-col gap-3 flex-1">
      <!-- Kakao -->
      <button
        class="btn w-full h-14 text-nav font-medium rounded-2xl gap-3 transition-opacity"
        style="background: #FEE500; color: #191919;"
        :disabled="!!loading"
        @click="loginWithKakao"
      >
        <span class="text-xl">💬</span>
        <span>{{ loading === 'kakao' ? '로그인 중...' : '카카오로 계속하기' }}</span>
      </button>

      <!-- Google -->
      <button
        class="btn btn-white w-full h-14 text-nav gap-3"
        :disabled="!!loading"
        @click="loginWithGoogle"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        <span>{{ loading === 'google' ? '로그인 중...' : 'Google로 계속하기' }}</span>
      </button>

      <!-- Apple -->
      <button
        class="btn btn-primary w-full h-14 text-nav gap-3"
        :disabled="!!loading"
        @click="loginWithApple"
      >
        <Icon name="lucide:apple" size="18" />
        <span>{{ loading === 'apple' ? '로그인 중...' : 'Apple로 계속하기' }}</span>
      </button>
    </div>

    <!-- Footer note -->
    <p class="text-caption text-muted text-center py-8">
      로그인하면 이용약관 및 개인정보처리방침에 동의하게 됩니다.
    </p>
  </div>
</template>
