<script setup lang="ts">
const quotesStore = useQuotesStore()
const query = ref('')
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
  quotesStore.filter.search = ''
})

watch(query, (val) => {
  quotesStore.filter.search = val
})

onUnmounted(() => {
  quotesStore.filter.search = ''
})
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4" style="border-color: var(--border-subtle);">
      <div class="flex items-center gap-3">
        <button class="btn btn-ghost p-2 rounded-xl -ml-2 flex-shrink-0" @click="$router.back()">
          <Icon name="lucide:arrow-left" size="20" />
        </button>
        <div class="relative flex-1">
          <Icon name="lucide:search" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref="inputRef"
            v-model="query"
            class="input pl-9 py-2.5 rounded-xl"
            placeholder="글귀, 제목, 출처 검색..."
          >
        </div>
        <button v-if="query" class="btn btn-ghost text-caption text-muted flex-shrink-0" @click="query = ''">
          지우기
        </button>
      </div>
    </header>

    <main class="px-5 py-5 pb-8">
      <!-- Hint -->
      <div v-if="!query" class="text-center py-16">
        <Icon name="lucide:search" size="32" class="text-muted mx-auto mb-4" />
        <p class="text-ui text-secondary">글귀, 제목, 출처, 저자로<br>검색할 수 있어요.</p>
      </div>

      <!-- No results -->
      <div v-else-if="quotesStore.filteredQuotes.length === 0" class="text-center py-16">
        <p class="text-ui text-secondary">"{{ query }}"에 대한 결과가 없어요.</p>
      </div>

      <!-- Results -->
      <div v-else class="flex flex-col gap-4">
        <p class="text-caption text-muted mb-2">{{ quotesStore.filteredQuotes.length }}개 결과</p>
        <QuoteCard
          v-for="quote in quotesStore.filteredQuotes"
          :key="quote.id"
          :quote="quote"
          @favorite="quotesStore.toggleFavorite"
        />
      </div>
    </main>

    <BottomNav />
  </div>
</template>
