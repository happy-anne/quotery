<script setup lang="ts">
const authStore = useAuthStore()
const { $supabase } = useNuxtApp()
const router = useRouter()
const showLogoutConfirm = ref(false)

const biometricEnabled = ref(localStorage.getItem('quotery_biometric') === '1')

function toggleBiometric() {
  biometricEnabled.value = !biometricEnabled.value
  if (biometricEnabled.value) {
    localStorage.setItem('quotery_biometric', '1')
  } else {
    localStorage.removeItem('quotery_biometric')
  }
}

async function logout() {
  await $supabase.auth.signOut()
  authStore.signOut()
  router.push('/')
}
</script>

<template>
  <div class="page-container">
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4" style="border-color: var(--border-subtle);">
      <h1 class="text-section text-black" style="font-weight: 300;">설정</h1>
    </header>

    <main class="px-5 py-6 pb-28">
      <!-- Profile -->
      <section class="card p-5 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-stone flex items-center justify-center">
            <Icon name="lucide:user" size="22" class="text-secondary" />
          </div>
          <div>
            <p class="text-ui font-medium text-black">{{ authStore.user?.full_name || '사용자' }}</p>
            <p class="text-caption text-muted">{{ authStore.user?.email || '' }}</p>
          </div>
        </div>
      </section>

      <!-- Security -->
      <section class="mb-6">
        <h2 class="text-caption font-medium text-muted uppercase tracking-wider mb-3 px-1">보안</h2>
        <div class="card divide-y" style="border-color: var(--border);">
          <NuxtLink to="/pin-change" class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <Icon name="lucide:lock" size="18" class="text-secondary" />
              <span class="text-ui text-black">PIN 번호 변경</span>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-muted" />
          </NuxtLink>
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <Icon name="lucide:fingerprint" size="18" class="text-secondary" />
              <span class="text-ui text-black">생체 인증</span>
            </div>
            <button
              :class="['w-12 h-6 rounded-full transition-colors', biometricEnabled ? 'bg-black' : 'bg-border']"
              @click="toggleBiometric"
            >
              <span :class="['block w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5', biometricEnabled ? 'translate-x-6' : 'translate-x-0']" />
            </button>
          </div>
        </div>
      </section>

      <!-- Data -->
      <section class="mb-6">
        <h2 class="text-caption font-medium text-muted uppercase tracking-wider mb-3 px-1">데이터</h2>
        <div class="card divide-y" style="border-color: var(--border);">
          <NuxtLink to="/categories" class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <Icon name="lucide:tag" size="18" class="text-secondary" />
              <span class="text-ui text-black">카테고리 관리</span>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-muted" />
          </NuxtLink>
        </div>
      </section>

      <!-- Account -->
      <section>
        <h2 class="text-caption font-medium text-muted uppercase tracking-wider mb-3 px-1">계정</h2>
        <div class="card divide-y" style="border-color: var(--border);">
          <button class="flex items-center gap-3 p-4 w-full" @click="showLogoutConfirm = true">
            <Icon name="lucide:log-out" size="18" class="text-secondary" />
            <span class="text-ui text-black">로그아웃</span>
          </button>
          <button class="flex items-center gap-3 p-4 w-full text-red-500">
            <Icon name="lucide:user-x" size="18" />
            <span class="text-ui">회원 탈퇴</span>
          </button>
        </div>
      </section>
    </main>

    <!-- Logout confirm -->
    <Transition name="fade">
      <div v-if="showLogoutConfirm" class="fixed inset-0 z-50 flex items-end" style="max-width: 430px; margin: 0 auto;">
        <div class="absolute inset-0 bg-black/30" @click="showLogoutConfirm = false" />
        <div class="relative bg-canvas rounded-t-3xl w-full p-6 pb-10">
          <h3 class="text-section text-black mb-2" style="font-weight: 300;">로그아웃</h3>
          <p class="text-ui text-secondary mb-6">정말 로그아웃 하시겠어요?</p>
          <div class="flex flex-col gap-3">
            <button class="btn btn-primary w-full h-14 text-nav" @click="logout">로그아웃</button>
            <button class="btn btn-ghost w-full h-14 text-nav" @click="showLogoutConfirm = false">취소</button>
          </div>
        </div>
      </div>
    </Transition>

    <BottomNav />
  </div>
</template>
