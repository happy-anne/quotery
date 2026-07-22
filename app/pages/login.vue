<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { $supabase } = useNuxtApp()
const router = useRouter()
const loading = ref<string | null>(null)
const errorMsg = ref('')
const infoMsg = ref('')

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  errorMsg.value = ''
  infoMsg.value = ''
}

async function submitEmailAuth() {
  if (!email.value || !password.value) return
  errorMsg.value = ''
  infoMsg.value = ''

  if (mode.value === 'signup') {
    loading.value = 'email'
    const { data, error } = await $supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    loading.value = null
    if (error) {
      errorMsg.value = error.message === 'User already registered'
        ? '이미 가입된 이메일입니다.'
        : '회원가입에 실패했습니다. 다시 시도해주세요.'
      return
    }
    if (data.session) {
      router.push('/auth/callback')
    } else {
      infoMsg.value = '확인 이메일을 보냈어요. 메일함을 확인한 뒤 로그인해주세요.'
      mode.value = 'login'
    }
    return
  }

  loading.value = 'email'
  const { error } = await $supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    errorMsg.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    loading.value = null
    return
  }
  router.push('/auth/callback')
}

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
    <div class="pt-16 pb-8">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-caption text-muted mb-10">
        <Icon name="lucide:arrow-left" size="16" />
        돌아가기
      </NuxtLink>
      <h2 class="text-display text-black mb-2">{{ mode === 'signup' ? '회원가입' : '로그인' }}</h2>
      <p class="text-ui text-secondary">
        {{ mode === 'signup' ? '이메일로 새 계정을 만들어보세요.' : '계속하려면 로그인해주세요.' }}
      </p>
    </div>

    <div class="flex flex-col gap-3 flex-1">
      <!-- Email / Password -->
      <div class="flex flex-col gap-2 mb-1">
        <div class="flex flex-col gap-1">
          <label class="text-caption font-medium text-secondary px-1">이메일</label>
          <input
            v-model="email"
            class="input"
            type="email"
            placeholder="hello@example.com"
            autocomplete="email"
            :disabled="!!loading"
          >
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-caption font-medium text-secondary px-1">비밀번호</label>
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="••••••••"
            :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
            :disabled="!!loading"
            @keyup.enter="submitEmailAuth"
          >
          <p v-if="mode === 'signup'" class="text-caption text-muted px-1">6자 이상 입력해주세요.</p>
        </div>
        <Transition name="fade" :duration="250">
          <p v-if="errorMsg" class="text-caption text-red-500 px-1">{{ errorMsg }}</p>
        </Transition>
        <Transition name="fade" :duration="250">
          <p v-if="infoMsg" class="text-caption text-black px-1">{{ infoMsg }}</p>
        </Transition>
        <button
          class="btn w-full h-14 text-nav font-medium mt-2 transition-all"
          :class="email && password && !loading ? 'btn-primary' : 'btn-white opacity-60'"
          :disabled="!email || !password || !!loading"
          @click="submitEmailAuth"
        >
          <span v-if="loading === 'email'" class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            {{ mode === 'signup' ? '가입 중...' : '로그인 중...' }}
          </span>
          <span v-else>{{ mode === 'signup' ? '회원가입' : '로그인' }}</span>
        </button>
        <button class="text-caption text-secondary text-center mt-1" @click="toggleMode">
          {{ mode === 'signup' ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입' }}
        </button>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-3 my-1">
        <div class="flex-1 h-px bg-border" />
        <span class="text-caption text-muted">또는</span>
        <div class="flex-1 h-px bg-border" />
      </div>

      <!-- Social icons row -->
      <div class="flex justify-center gap-4">
        <!-- TODO: 카카오 로그인 — Supabase provider 설정 후 활성화
        <button
          class="w-14 h-14 rounded-full flex items-center justify-center transition-opacity"
          style="background: #FEE500;"
          :disabled="!!loading"
          :style="{ opacity: loading && loading !== 'kakao' ? 0.4 : 1 }"
          title="카카오로 로그인"
          @click="loginWithKakao"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2.5C14.8334 2.5 18.7509 5.55333 18.7509 9.32083C18.7509 13.0875 14.8334 16.1408 10.0009 16.1408C9.5197 16.14 9.03906 16.1094 8.56169 16.0492L4.88835 18.4517C4.47085 18.6725 4.32335 18.6483 4.49502 18.1075L5.23835 15.0425C2.83835 13.8258 1.25085 11.7175 1.25085 9.32083C1.25085 5.55417 5.16752 2.5 10.0009 2.5" fill="#3E2723"/>
          </svg>
        </button>
        -->

        <!-- Google -->
        <button
          class="w-14 h-14 rounded-full flex items-center justify-center transition-opacity"
          style="background: #ffffff;"
          :disabled="!!loading"
          :style="{ opacity: loading && loading !== 'google' ? 0.4 : 1 }"
          title="Google로 로그인"
          @click="loginWithGoogle"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.1712 8.36792H17.5V8.33334H9.99996V11.6667H14.7095C14.0225 13.6071 12.1762 15 9.99996 15C7.23871 15 4.99996 12.7613 4.99996 10C4.99996 7.23875 7.23871 5 9.99996 5C11.2745 5 12.4341 5.48084 13.317 6.26625L15.6741 3.90917C14.1858 2.52209 12.195 1.66667 9.99996 1.66667C5.39788 1.66667 1.66663 5.39792 1.66663 10C1.66663 14.6021 5.39788 18.3333 9.99996 18.3333C14.602 18.3333 18.3333 14.6021 18.3333 10C18.3333 9.44125 18.2758 8.89584 18.1712 8.36792Z" fill="#FFC107"/>
            <path d="M2.62744 6.12126L5.36536 8.12917C6.10619 6.29501 7.90036 5.00001 9.99994 5.00001C11.2745 5.00001 12.4341 5.48084 13.317 6.26626L15.6741 3.90917C14.1858 2.52209 12.1949 1.66667 9.99994 1.66667C6.79911 1.66667 4.02327 3.47376 2.62744 6.12126Z" fill="#FF3D00"/>
            <path d="M10 18.3333C12.1525 18.3333 14.1084 17.5096 15.5871 16.17L13.008 13.9875C12.1433 14.6454 11.0865 15.0012 10 15C7.83255 15 5.99213 13.6179 5.2988 11.6892L2.5813 13.7829C3.96047 16.4817 6.7613 18.3333 10 18.3333Z" fill="#4CAF50"/>
            <path d="M18.1712 8.36791H17.5V8.33333H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3333 14.1667 18.3333 9.99999C18.3333 9.44124 18.2758 8.89583 18.1712 8.36791Z" fill="#1976D2"/>
          </svg>
        </button>

        <!-- TODO: Apple 로그인 — Supabase provider 설정 후 활성화
        <button
          class="w-14 h-14 rounded-full flex items-center justify-center transition-opacity"
          style="background: #000000;"
          :disabled="!!loading"
          :style="{ opacity: loading && loading !== 'apple' ? 0.4 : 1 }"
          title="Apple로 로그인"
          @click="loginWithApple"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5293 3.87081C12.8543 3.47869 13.1021 3.02322 13.2585 2.53056C13.4149 2.0379 13.4768 1.51776 13.4406 1C12.4428 1.08431 11.5165 1.57556 10.8613 2.36791C10.5476 2.74766 10.3099 3.18945 10.1622 3.6671C10.0145 4.14476 9.95991 4.64858 10.0016 5.14872C10.4883 5.15297 10.9695 5.03992 11.4078 4.81832C11.8461 4.59672 12.2298 4.27252 12.5293 3.87081ZM14.6959 10.5664C14.7016 9.87677 14.8752 9.20009 15.2001 8.60018C15.525 8.00026 15.9906 7.4969 16.5529 7.13759C16.198 6.60234 15.7289 6.16101 15.1827 5.84858C14.6365 5.53616 14.0283 5.36125 13.4062 5.33771C12.065 5.19372 10.827 6.15666 10.1134 6.15666C9.39977 6.15666 8.39385 5.35571 7.27617 5.37371C6.54549 5.3989 5.83352 5.6219 5.20971 6.02093C4.58589 6.41997 4.07153 6.98144 3.71679 7.65056C2.20362 10.4044 3.3299 14.4991 4.84307 16.722C5.53087 17.8109 6.39062 19.0438 7.5255 18.9988C8.66038 18.9538 9.03007 18.2609 10.3455 18.2609C11.6609 18.2609 12.065 18.9988 13.1827 18.9718C14.3004 18.9448 15.0913 17.8559 15.8135 16.767C16.3251 15.9764 16.7248 15.1125 17 14.2021C16.3186 13.898 15.7373 13.3915 15.3278 12.7454C14.9183 12.0993 14.6986 11.3417 14.6959 10.5664Z" fill="white"/>
          </svg>
        </button>
        -->
      </div>
    </div>

    <!-- Footer note -->
    <p class="text-caption text-muted text-center py-8">
      로그인하면 이용약관 및 개인정보처리방침에 동의하게 됩니다.
    </p>
  </div>
</template>
