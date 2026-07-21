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
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4">
        <h1 class="text-section text-black" style="font-weight: 300;">검색</h1>
      </div>
    </header>

    <main class="px-5 py-5 pb-8">
      <div class="flex items-center gap-3 mb-5">
        <div class="relative flex-1">
          <Icon name="lucide:search" size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            ref="inputRef"
            v-model="query"
            class="input input-icon"
            placeholder="글귀, 제목, 출처 검색..."
          >
        </div>
        <button v-if="query" class="btn btn-ghost text-caption text-muted flex-shrink-0" @click="query = ''">
          지우기
        </button>
      </div>

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
