<script setup lang="ts">
import type { Quote } from '~/types'

const props = defineProps<{ quote: Quote }>()
const emit = defineEmits<{ favorite: [id: string] }>()

const dateStr = computed(() => formatDateTime(props.quote.created_at))

const excerpt = computed(() => {
  const c = props.quote.content
  return c.length > 160 ? c.slice(0, 160) + '…' : c
})

// Title, author, source and page collapse into one supporting line.
const details = computed(() => {
  const parts = [props.quote.title, props.quote.author, props.quote.source].filter(Boolean)
  if (props.quote.page) parts.push(`p.${props.quote.page}`)
  return parts.join(' · ')
})
</script>

<template>
  <NuxtLink :to="`/quotes/${quote.id}`" class="block">
    <article class="card p-5 active:scale-[0.99] transition-transform duration-150">
      <!-- Row 1: quote + supporting text, thumbnail on the right -->
      <div class="flex gap-4">
        <div class="flex-1 min-w-0">
          <blockquote class="text-body text-black leading-relaxed">
            "{{ excerpt }}"
          </blockquote>
          <p v-if="details" class="text-caption text-muted mt-2 truncate">
            {{ details }}
          </p>
        </div>
        <img
          v-if="quote.image_url"
          :src="quote.image_url"
          :alt="quote.title || ''"
          class="quote-thumb"
          loading="lazy"
        >
      </div>

      <!-- Row 2: category + date, favorite pinned right -->
      <div class="flex items-center gap-2 mt-4">
        <CategoryBadge :category="quote.category" />
        <span class="text-caption text-muted-soft">{{ dateStr }}</span>
        <button
          class="ml-auto text-muted hover:text-black transition-colors"
          :aria-label="quote.favorite ? '즐겨찾기 해제' : '즐겨찾기에 추가'"
          @click.prevent="emit('favorite', quote.id)"
        >
          <Icon
            name="lucide:star"
            mode="svg"
            :class="quote.favorite ? 'text-black icon-filled' : 'text-muted'"
            size="16"
          />
        </button>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
.quote-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--stone);
}
</style>
