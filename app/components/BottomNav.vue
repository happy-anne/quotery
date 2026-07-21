<script setup lang="ts">
const route = useRoute()

const items = [
  { label: '홈', icon: 'lucide:home', to: '/home' },
  { label: '즐겨찾기', icon: 'lucide:star', to: '/favorites' },
  { label: '검색', icon: 'lucide:search', to: '/search' },
  { label: '설정', icon: 'lucide:settings', to: '/settings' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 safe-bottom">
    <div
      class="app-bar-bg backdrop-blur-sm border-t"
      style="border-color: var(--border-subtle);"
    >
      <div class="app-bar-inner flex items-center justify-around px-2 pt-2 pb-[14px]">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
            isActive(item.to) ? 'text-black' : 'text-muted',
          ]"
        >
          <Icon :name="item.icon" :size="isActive(item.to) ? '22' : '20'" />
          <span class="text-[11px] font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
