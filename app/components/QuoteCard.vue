<script setup lang="ts">
import type { Quote } from '~/types'

const props = defineProps<{ quote: Quote }>()
const emit = defineEmits<{ favorite: [id: string] }>()

const dateStr = computed(() => {
  return new Date(props.quote.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
})

const excerpt = computed(() => {
  const c = props.quote.content
  return c.length > 160 ? c.slice(0, 160) + '…' : c
})
</script>

<template>
  <NuxtLink :to="`/quotes/${quote.id}`" class="block">
    <article class="card p-5 active:scale-[0.99] transition-transform duration-150">
      <!-- Category + Date -->
      <div class="flex items-center justify-between mb-3">
        <CategoryBadge :category="quote.category" />
        <span class="text-caption text-muted">{{ dateStr }}</span>
      </div>

      <!-- Content -->
      <blockquote class="text-body text-black mb-3 leading-relaxed">
        "{{ excerpt }}"
      </blockquote>

      <!-- Source / Author -->
      <div v-if="quote.source || quote.author" class="text-caption text-muted mb-3">
        <span v-if="quote.author">{{ quote.author }}</span>
        <span v-if="quote.author && quote.source"> · </span>
        <span v-if="quote.source">{{ quote.source }}</span>
        <span v-if="quote.page"> p.{{ quote.page }}</span>
      </div>

      <!-- Title + Favorite -->
      <div class="flex items-center justify-between">
        <p v-if="quote.title" class="text-caption font-medium text-secondary truncate pr-4">
          {{ quote.title }}
        </p>
        <div v-else class="flex-1" />
        <button
          class="ml-auto text-muted hover:text-black transition-colors"
          @click.prevent="emit('favorite', quote.id)"
        >
          <Icon
            :name="quote.favorite ? 'lucide:heart' : 'lucide:heart'"
            :class="quote.favorite ? 'text-black' : 'text-muted'"
            size="16"
          />
        </button>
      </div>
    </article>
  </NuxtLink>
</template>
