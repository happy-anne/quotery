<script setup lang="ts">
import type { Quote } from '~/types'

const route = useRoute()
const router = useRouter()
const quotesStore = useQuotesStore()

const quote = ref<Quote | null>(null)
const loading = ref(true)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

onMounted(async () => {
  quote.value = await quotesStore.getQuote(route.params.id as string)
  loading.value = false
})

// Source, author and page collapse into one labeled line above the memo.
const sourceLine = computed(() => {
  if (!quote.value) return ''
  const parts = [quote.value.source, quote.value.author].filter(Boolean)
  if (quote.value.page) parts.push(`p.${quote.value.page}`)
  return parts.join(' · ')
})

const createdStr = computed(() => quote.value ? formatDateTime(quote.value.created_at) : '')

// Only meaningful once the quote has actually been edited after creation.
const editedStr = computed(() => {
  if (!quote.value?.updated_at) return ''
  const edited = formatDateTime(quote.value.updated_at)
  return edited === createdStr.value ? '' : edited
})

async function toggleFavorite() {
  if (!quote.value) return
  const updated = await quotesStore.toggleFavorite(quote.value.id)
  if (updated) quote.value = updated
}

async function deleteQuote() {
  if (!quote.value) return
  deleting.value = true
  await quotesStore.deleteQuote(quote.value.id)
  router.push('/home')
}

async function share() {
  if (!quote.value) return
  const text = `"${quote.value.content}"${quote.value.source ? `\n— ${quote.value.source}` : ''}`
  if (navigator.share) {
    await navigator.share({ text })
  } else {
    await navigator.clipboard.writeText(text)
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4 flex items-center justify-between">
        <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="router.back()">
          <Icon name="lucide:arrow-left" size="20" />
        </button>
        <div class="flex items-center gap-1">
          <button class="btn btn-ghost p-2 rounded-xl" @click="toggleFavorite">
            <Icon name="lucide:star" mode="svg" :class="quote?.favorite ? 'text-black icon-filled' : 'text-muted'" size="20" />
          </button>
          <button class="btn btn-ghost p-2 rounded-xl" @click="share">
            <Icon name="lucide:share-2" size="20" />
          </button>
          <NuxtLink v-if="quote" :to="`/quotes/${quote.id}/edit`" class="btn btn-ghost p-2 rounded-xl">
            <Icon name="lucide:pencil" size="20" />
          </NuxtLink>
          <button class="btn btn-ghost p-2 rounded-xl text-red-500" @click="showDeleteConfirm = true">
            <Icon name="lucide:trash-2" size="20" />
          </button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="p-5 flex flex-col gap-4">
      <div class="skeleton h-6 w-24 rounded-full" />
      <div class="skeleton h-32 rounded-2xl" />
      <div class="skeleton h-4 w-48 rounded" />
    </div>

    <!-- Content -->
    <main v-else-if="quote" class="px-5 py-8 pb-24">
      <!-- Category -->
      <CategoryBadge :category="quote.category" class="mb-6" />

      <!-- Quote content -->
      <blockquote class="mb-8">
        <p class="text-body-lg text-black leading-relaxed" style="font-size: 1.2rem; line-height: 1.7;">
          "{{ quote.content }}"
        </p>
      </blockquote>

      <!-- Image -->
      <div v-if="quote.image_url" class="rounded-2xl overflow-hidden mb-8">
        <img :src="quote.image_url" alt="" class="w-full object-cover">
      </div>

      <!-- Source/author/page, one line, right above the memo -->
      <div v-if="sourceLine" class="mb-6">
        <p class="text-caption text-muted mb-1">출처</p>
        <p class="text-ui text-secondary">{{ sourceLine }}</p>
      </div>

      <!-- Memo — same label + plain text style, no card -->
      <div v-if="quote.memo" class="mb-6">
        <p class="text-caption text-muted mb-1">메모</p>
        <p class="text-ui text-secondary">{{ quote.memo }}</p>
      </div>

      <!-- Meta -->
      <div class="border-t pt-6 flex flex-col gap-1" style="border-color: var(--border);">
        <p class="text-caption text-muted">
          <span class="inline-block w-16">최초 작성</span>{{ createdStr }}
        </p>
        <p v-if="editedStr" class="text-caption text-muted">
          <span class="inline-block w-16">최종 편집</span>{{ editedStr }}
        </p>
      </div>
    </main>

    <!-- 404 -->
    <div v-else class="flex flex-col items-center justify-center py-24 px-5 text-center gap-4">
      <p class="text-section text-black" style="font-weight: 300;">문장을 찾을 수 없어요</p>
      <button class="btn btn-white" @click="router.push('/home')">홈으로</button>
    </div>

    <!-- Delete confirm modal -->
    <Transition name="fade" :duration="250">
      <div v-if="showDeleteConfirm" class="sheet">
        <div class="sheet-backdrop" @click="showDeleteConfirm = false" />
        <div class="sheet-panel">
          <h3 class="text-section text-black mb-2" style="font-weight: 300;">삭제하시겠어요?</h3>
          <p class="text-ui text-secondary mb-6">이 문장은 영구적으로 삭제됩니다.</p>
          <div class="flex flex-col gap-3">
            <button class="btn h-14 rounded-2xl text-nav font-medium text-white" style="background: #dc2626;" :disabled="deleting" @click="deleteQuote">
              {{ deleting ? '삭제 중...' : '삭제하기' }}
            </button>
            <button class="btn btn-ghost h-14 rounded-2xl text-nav" @click="showDeleteConfirm = false">
              취소
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
