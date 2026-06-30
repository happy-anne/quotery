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

const dateStr = computed(() => {
  if (!quote.value) return ''
  return new Date(quote.value.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
})

async function toggleFavorite() {
  if (!quote.value) return
  await quotesStore.toggleFavorite(quote.value.id)
  quote.value.favorite = !quote.value.favorite
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
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4 flex items-center justify-between" style="border-color: var(--border-subtle);">
      <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="router.back()">
        <Icon name="lucide:arrow-left" size="20" />
      </button>
      <div class="flex items-center gap-1">
        <button class="btn btn-ghost p-2 rounded-xl" @click="toggleFavorite">
          <Icon :name="quote?.favorite ? 'lucide:heart' : 'lucide:heart'" :class="quote?.favorite ? 'text-black fill-black' : 'text-muted'" size="20" />
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

      <!-- Image -->
      <div v-if="quote.image_url" class="rounded-2xl overflow-hidden mb-8">
        <img :src="quote.image_url" :alt="quote.title || ''" class="w-full object-cover">
      </div>

      <!-- Quote content -->
      <blockquote class="mb-8">
        <p class="text-body-lg text-black leading-relaxed mb-4" style="font-size: 1.2rem; line-height: 1.7;">
          "{{ quote.content }}"
        </p>
        <div v-if="quote.source || quote.author" class="text-ui text-muted">
          <span v-if="quote.author">{{ quote.author }}</span>
          <span v-if="quote.author && quote.source"> · </span>
          <span v-if="quote.source">{{ quote.source }}</span>
          <span v-if="quote.page"> · p.{{ quote.page }}</span>
        </div>
      </blockquote>

      <!-- Title -->
      <div v-if="quote.title" class="mb-6">
        <p class="text-caption text-muted mb-1">제목</p>
        <p class="text-ui font-medium text-black">{{ quote.title }}</p>
      </div>

      <!-- Memo -->
      <div v-if="quote.memo" class="card-stone p-4 rounded-2xl mb-6">
        <p class="text-caption text-muted mb-1">메모</p>
        <p class="text-ui text-secondary">{{ quote.memo }}</p>
      </div>

      <!-- Meta -->
      <div class="border-t pt-6" style="border-color: var(--border);">
        <p class="text-caption text-muted">{{ dateStr }}에 저장됨</p>
      </div>
    </main>

    <!-- 404 -->
    <div v-else class="flex flex-col items-center justify-center py-24 px-5 text-center gap-4">
      <p class="text-section text-black" style="font-weight: 300;">문장을 찾을 수 없어요</p>
      <button class="btn btn-stone" @click="router.push('/home')">홈으로</button>
    </div>

    <!-- Delete confirm modal -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-end justify-center" style="max-width: 430px; margin: 0 auto;">
        <div class="absolute inset-0 bg-black/30" @click="showDeleteConfirm = false" />
        <div class="relative bg-canvas rounded-t-3xl w-full p-6 pb-10">
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
