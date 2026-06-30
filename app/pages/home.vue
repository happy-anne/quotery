<script setup lang="ts">
import type { SortOption } from '~/types'

const quotesStore = useQuotesStore()
const categoriesStore = useCategoriesStore()

const showSortMenu = ref(false)
const selectedCategoryId = ref<string | undefined>()

const sortLabels: Record<SortOption, string> = {
  newest: '최신순',
  oldest: '오래된순',
  title: '제목순',
  source: '출처순',
}

onMounted(async () => {
  await Promise.all([
    quotesStore.fetchQuotes(),
    categoriesStore.fetchCategories(),
  ])
})

function setCategory(id?: string) {
  selectedCategoryId.value = id
  quotesStore.filter.category_id = id
}

function setSort(sort: SortOption) {
  quotesStore.filter.sort = sort
  showSortMenu.value = false
}

function onFavorite(id: string) {
  quotesStore.toggleFavorite(id)
}
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b" style="border-color: var(--border-subtle);">
      <div class="px-5 pt-4 pb-3">
        <div class="flex items-center justify-between mb-4">
          <AppLogo />
          <NuxtLink to="/search" class="btn btn-ghost p-2 rounded-xl">
            <Icon name="lucide:search" size="20" />
          </NuxtLink>
        </div>

        <!-- Category filter -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            :class="[
              'btn text-nav px-4 py-1.5 flex-shrink-0',
              !selectedCategoryId ? 'btn-primary' : 'btn-ghost border border-border',
            ]"
            style="border-radius: 9999px; padding: 6px 14px;"
            @click="setCategory(undefined)"
          >
            전체
          </button>
          <button
            v-for="cat in categoriesStore.categories"
            :key="cat.id"
            :class="[
              'btn text-nav flex-shrink-0',
              selectedCategoryId === cat.id ? 'btn-primary' : 'btn-ghost border border-border',
            ]"
            style="border-radius: 9999px; padding: 6px 14px;"
            @click="setCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </header>

    <!-- Sort bar -->
    <div class="flex items-center justify-between px-5 py-3">
      <p class="text-caption text-muted">
        {{ quotesStore.filteredQuotes.length }}개의 문장
      </p>
      <div class="relative">
        <button class="btn btn-ghost text-caption px-3 py-1.5 gap-1" @click="showSortMenu = !showSortMenu">
          {{ sortLabels[quotesStore.filter.sort] }}
          <Icon name="lucide:chevron-down" size="14" />
        </button>
        <Transition name="fade">
          <div v-if="showSortMenu" class="absolute right-0 top-full mt-1 card py-1 z-20 w-32">
            <button
              v-for="(label, key) in sortLabels"
              :key="key"
              :class="[
                'w-full text-left px-4 py-2.5 text-caption transition-colors',
                quotesStore.filter.sort === key ? 'font-medium text-black' : 'text-secondary hover:bg-surface',
              ]"
              @click="setSort(key as SortOption)"
            >
              {{ label }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Quote list -->
    <main class="px-5 pb-32">
      <!-- Loading skeleton -->
      <div v-if="quotesStore.loading" class="flex flex-col gap-4">
        <div v-for="i in 3" :key="i" class="skeleton h-40 rounded-3xl" />
      </div>

      <!-- Empty state -->
      <div v-else-if="quotesStore.filteredQuotes.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-stone flex items-center justify-center mb-2">
          <Icon name="lucide:quote" size="28" class="text-muted" />
        </div>
        <p class="text-section text-black" style="font-weight: 300;">아직 저장된 문장이<br>없어요</p>
        <p class="text-ui text-secondary">마음에 남은 문장을 저장해보세요.</p>
        <NuxtLink to="/quotes/new" class="btn btn-stone mt-4">
          <Icon name="lucide:plus" size="16" />
          첫 문장 저장하기
        </NuxtLink>
      </div>

      <!-- Quotes -->
      <div v-else class="flex flex-col gap-4">
        <QuoteCard
          v-for="quote in quotesStore.filteredQuotes"
          :key="quote.id"
          :quote="quote"
          @favorite="onFavorite"
        />
      </div>
    </main>

    <!-- FAB -->
    <NuxtLink
      to="/quotes/new"
      class="fixed z-40 flex items-center justify-center"
      style="bottom: calc(72px + env(safe-area-inset-bottom) + 16px); right: max(16px, calc(50vw - 215px + 16px)); width: 52px; height: 52px; background: #000; border-radius: 9999px; box-shadow: rgba(0,0,0,0.4) 0px 0px 1px, rgba(0,0,0,0.1) 0px 8px 16px;"
    >
      <Icon name="lucide:plus" size="22" class="text-white" />
    </NuxtLink>

    <BottomNav />
  </div>
</template>
