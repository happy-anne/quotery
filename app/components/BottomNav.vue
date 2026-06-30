<script setup lang="ts">
const route = useRoute()

const items = [
  { label: '홈', icon: 'lucide:home', to: '/home' },
  { label: '검색', icon: 'lucide:search', to: '/search' },
  { label: '즐겨찾기', icon: 'lucide:heart', to: '/favorites' },
  { label: '설정', icon: 'lucide:settings', to: '/settings' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 safe-bottom" style="max-width: 430px; margin: 0 auto;">
    <div
      class="bg-canvas/95 backdrop-blur-sm border-t border-border"
      style="border-color: var(--border);"
    >
      <div class="flex items-center justify-around px-2 pt-2 pb-1">
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
