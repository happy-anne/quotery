<script setup lang="ts">
const authStore = useAuthStore()
const quotesStore = useQuotesStore()
const categoriesStore = useCategoriesStore()
const { $supabase } = useNuxtApp()
const router = useRouter()

const showLogoutConfirm = ref(false)
const showWithdrawConfirm = ref(false)
const withdrawing = ref(false)
const withdrawError = ref('')

const biometricEnabled = ref(localStorage.getItem('quotery_biometric') === '1')

function toggleBiometric() {
  biometricEnabled.value = !biometricEnabled.value
  if (biometricEnabled.value) {
    localStorage.setItem('quotery_biometric', '1')
  } else {
    localStorage.removeItem('quotery_biometric')
  }
}

const sessionDaysLabel = computed(() => {
  const d = authStore.daysRemaining()
  return d === null ? '-' : `D-${d}`
})

// Nickname — inline edit, no modal needed for a single short field.
const editingNickname = ref(false)
const nicknameDraft = ref('')
const savingNickname = ref(false)
const nicknameError = ref('')

function startEditNickname() {
  nicknameDraft.value = authStore.user?.full_name || ''
  nicknameError.value = ''
  editingNickname.value = true
}

function cancelEditNickname() {
  editingNickname.value = false
}

async function saveNickname() {
  const name = nicknameDraft.value.trim()
  if (!name) return
  savingNickname.value = true
  nicknameError.value = ''
  const { data, error } = await $supabase.auth.updateUser({ data: { full_name: name } })
  savingNickname.value = false
  if (error || !data.user) {
    nicknameError.value = '닉네임을 저장하지 못했어요. 다시 시도해주세요.'
    return
  }
  authStore.setUser({
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name as string | undefined,
    avatar_url: data.user.user_metadata?.avatar_url as string | undefined,
  })
  editingNickname.value = false
}

async function logout() {
  await $supabase.auth.signOut()
  authStore.signOut()
  router.push('/')
}

function cancelWithdraw() {
  if (withdrawing.value) return
  showWithdrawConfirm.value = false
}

// Deletes every quote, category, and uploaded photo for this account, then
// signs out. There's no backend here to remove the auth.users row itself
// (that needs a service_role key, which never belongs in client code) — so
// this is a full data wipe, which matches what the confirmation copy promises.
async function withdraw() {
  if (withdrawing.value) return
  withdrawing.value = true
  withdrawError.value = ''

  const quotesOk = await quotesStore.deleteAllUserData()
  await categoriesStore.deleteAllUserData()

  if (!quotesOk) {
    withdrawing.value = false
    withdrawError.value = '탈퇴 처리 중 오류가 발생했어요. 다시 시도해주세요.'
    return
  }

  await $supabase.auth.signOut()
  authStore.signOut()
  localStorage.removeItem('quotery_pin')
  localStorage.removeItem('quotery_biometric')

  withdrawing.value = false
  showWithdrawConfirm.value = false
  router.push('/')
}
</script>

<template>
  <div class="page-container">
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4">
        <h1 class="text-section text-black" style="font-weight: 300;">설정</h1>
      </div>
    </header>

    <main class="px-5 py-6 pb-28">
      <p v-if="withdrawError" class="text-caption text-red-500 mb-4">{{ withdrawError }}</p>

      <!-- Profile -->
      <section class="card p-5 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-stone flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:user" size="22" class="text-secondary" />
          </div>
          <div class="flex-1 min-w-0">
            <template v-if="!editingNickname">
              <div class="flex items-center gap-1">
                <p class="text-ui font-medium text-black truncate">{{ authStore.user?.full_name || '사용자' }}</p>
                <button class="btn btn-ghost p-1.5 rounded-lg flex-shrink-0" aria-label="닉네임 수정" @click="startEditNickname">
                  <Icon name="lucide:pencil" size="13" class="text-muted" />
                </button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <input
                  v-model="nicknameDraft"
                  class="input py-2 text-ui flex-1"
                  placeholder="닉네임"
                  maxlength="20"
                  autofocus
                  @keyup.enter="saveNickname"
                >
                <button class="btn btn-ghost p-2 rounded-xl flex-shrink-0" :disabled="savingNickname" aria-label="저장" @click="saveNickname">
                  <Icon name="lucide:check" size="16" />
                </button>
                <button class="btn btn-ghost p-2 rounded-xl flex-shrink-0" aria-label="취소" @click="cancelEditNickname">
                  <Icon name="lucide:x" size="16" />
                </button>
              </div>
              <p v-if="nicknameError" class="text-caption text-red-500 mt-1">{{ nicknameError }}</p>
            </template>
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
          <div class="flex items-center justify-between p-4 gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <Icon name="lucide:mail" size="18" class="text-secondary flex-shrink-0" />
              <span class="text-ui text-black">로그인 계정</span>
            </div>
            <span class="text-caption text-muted truncate">{{ authStore.user?.email || '-' }}</span>
          </div>
          <div class="flex items-center justify-between p-4 gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <Icon name="lucide:calendar-clock" size="18" class="text-secondary flex-shrink-0" />
              <span class="text-ui text-black">로그인 세션</span>
            </div>
            <span class="text-caption text-muted">{{ sessionDaysLabel }}</span>
          </div>
          <button class="flex items-center gap-3 p-4 w-full" @click="showLogoutConfirm = true">
            <Icon name="lucide:log-out" size="18" class="text-secondary" />
            <span class="text-ui text-black">로그아웃</span>
          </button>
          <button class="flex items-center gap-3 p-4 w-full text-red-500" @click="showWithdrawConfirm = true">
            <Icon name="lucide:user-x" size="18" />
            <span class="text-ui">회원 탈퇴</span>
          </button>
        </div>
      </section>
    </main>

    <ConfirmDialog
      :open="showLogoutConfirm"
      title="로그아웃"
      message="정말 로그아웃 하시겠어요?"
      confirm-text="로그아웃"
      @confirm="logout"
      @cancel="showLogoutConfirm = false"
    />

    <ConfirmDialog
      :open="showWithdrawConfirm"
      title="정말 탈퇴하시겠어요?"
      message="작성한 모든 문장과 카테고리, 사진이 삭제되며 되돌릴 수 없습니다."
      :confirm-text="withdrawing ? '처리 중...' : '탈퇴하기'"
      cancel-text="취소"
      destructive
      @confirm="withdraw"
      @cancel="cancelWithdraw"
    />

    <BottomNav />
  </div>
</template>
