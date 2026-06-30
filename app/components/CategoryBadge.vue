<script setup lang="ts">
import type { Category } from '~/types'

defineProps<{ category?: Category | null; name?: string; color?: string }>()
</script>

<template>
  <span
    v-if="category || name"
    class="inline-flex items-center gap-1.5 text-caption px-2.5 py-1 rounded-full"
    :style="{ backgroundColor: (category?.color || color || '#e8d5c4') + '60' }"
  >
    <span
      class="w-1.5 h-1.5 rounded-full flex-shrink-0"
      :style="{ backgroundColor: category?.color || color || '#e8d5c4' }"
    />
    <span class="text-secondary font-medium">{{ category?.name || name }}</span>
  </span>
</template>
