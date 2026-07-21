<script setup lang="ts">
import type { SortOption } from '~/types'

const quotesStore = useQuotesStore()
const categoriesStore = useCategoriesStore()

const showSortMenu = ref(false)
const sortMenuRef = ref<HTMLElement | null>(null)
const selectedCategoryId = ref<string | undefined>()

const sortLabels: Record<SortOption, string> = {
  newest: '최신순',
  oldest: '오래된순',
  edited: '최종 편집일순',
}

onClickOutside(sortMenuRef, () => { showSortMenu.value = false })

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
    <header class="app-header">
      <div class="app-bar-inner px-5 pt-4 pb-3">
        <div class="flex items-center justify-between mb-4">
          <AppLogo />
        </div>

        <!-- Category filter -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            :class="[
              'btn text-nav px-4 py-1.5 flex-shrink-0',
              !selectedCategoryId ? 'btn-primary' : 'btn-chip',
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
              selectedCategoryId === cat.id ? 'btn-primary' : 'btn-chip',
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
      <div ref="sortMenuRef" class="relative">
        <button class="btn btn-ghost text-caption px-3 py-1.5 gap-1" @click="showSortMenu = !showSortMenu">
          {{ sortLabels[quotesStore.filter.sort] }}
          <Icon name="lucide:chevron-down" size="14" />
        </button>
        <Transition name="fade" :duration="250">
          <div v-if="showSortMenu" class="absolute right-0 top-full mt-1 card py-1 z-20 w-40">
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
        <div class="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center mb-2">
          <Icon name="lucide:quote" size="28" class="text-muted" />
        </div>
        <p class="text-section text-black" style="font-weight: 300;">아직 저장된 문장이<br>없어요</p>
        <p class="text-ui text-secondary">마음에 남은 문장을 저장해보세요.</p>
        <NuxtLink to="/quotes/new" class="btn btn-white mt-4">
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
    <NuxtLink to="/quotes/new" class="fab">
      <Icon name="lucide:plus" size="22" class="text-white" />
    </NuxtLink>

    <BottomNav />
  </div>
</template>
