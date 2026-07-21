<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const router = useRouter()
</script>

<template>
  <div class="flex flex-col min-h-dvh px-8 py-16">
    <!-- Logo area -->
    <div class="flex-1 flex flex-col justify-center">
      <div class="mb-16">
        <AppLogo size="lg" />
      </div>

      <h1 class="text-hero text-black mb-4">
        Collect the words<br>that stay with you.
      </h1>
      <p class="text-body text-secondary">
        마음을 움직인 문장들을 한곳에 모아<br>언제든 다시 만날 수 있는 나만의 라이브러리.
      </p>
    </div>

    <!-- Auth buttons -->
    <div class="flex flex-col gap-3 pb-8">
      <NuxtLink to="/login" class="btn btn-primary w-full text-center justify-center text-nav">
        시작하기
      </NuxtLink>
      <p class="text-center text-caption text-muted">
        계정이 있으신가요?
        <NuxtLink to="/login" class="text-black underline underline-offset-2">로그인</NuxtLink>
      </p>
    </div>
  </div>
</template>
