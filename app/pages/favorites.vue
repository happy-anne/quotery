<script setup lang="ts">
const quotesStore = useQuotesStore()

const favorites = computed(() => quotesStore.quotes.filter(q => q.favorite))

onMounted(() => {
  if (!quotesStore.quotes.length) quotesStore.fetchQuotes()
})
</script>

<template>
  <div class="page-container">
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4" style="border-color: var(--border-subtle);">
      <h1 class="text-section text-black" style="font-weight: 300;">즐겨찾기</h1>
    </header>

    <main class="px-5 py-5 pb-28">
      <div v-if="quotesStore.loading" class="flex flex-col gap-4">
        <div v-for="i in 3" :key="i" class="skeleton h-40 rounded-3xl" />
      </div>

      <div v-else-if="favorites.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-stone flex items-center justify-center mb-2">
          <Icon name="lucide:heart" size="28" class="text-muted" />
        </div>
        <p class="text-section text-black" style="font-weight: 300;">즐겨찾기가 없어요</p>
        <p class="text-ui text-secondary">마음에 드는 문장을 즐겨찾기에 추가하면<br>여기서 모아볼 수 있어요.</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <QuoteCard
          v-for="quote in favorites"
          :key="quote.id"
          :quote="quote"
          @favorite="quotesStore.toggleFavorite"
        />
      </div>
    </main>

    <BottomNav />
  </div>
</template>
