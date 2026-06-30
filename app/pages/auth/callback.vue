<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { $supabase } = useNuxtApp()
const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  const { data: { session } } = await $supabase.auth.getSession()
  if (session?.user) {
    authStore.setUser({
      id: session.user.id,
      email: session.user.email,
      full_name: session.user.user_metadata?.full_name,
      avatar_url: session.user.user_metadata?.avatar_url,
    })
    if (!authStore.hasPin()) {
      router.push('/pin-setup')
    } else {
      router.push('/pin')
    }
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4">
    <div class="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    <p class="text-ui text-secondary">로그인 처리 중...</p>
  </div>
</template>
