<script setup lang="ts">
import type { Quote } from '~/types'

const route = useRoute()
const router = useRouter()
const quotesStore = useQuotesStore()
const categoriesStore = useCategoriesStore()

const quote = ref<Quote | null>(null)
const form = reactive({
  title: '',
  content: '',
  source: '',
  author: '',
  page: '',
  memo: '',
  category_id: '',
  favorite: false,
})
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const submitting = ref(false)

onMounted(async () => {
  await categoriesStore.fetchCategories()
  quote.value = await quotesStore.getQuote(route.params.id as string)
  if (quote.value) {
    form.title = quote.value.title || ''
    form.content = quote.value.content
    form.source = quote.value.source || ''
    form.author = quote.value.author || ''
    form.page = quote.value.page?.toString() || ''
    form.memo = quote.value.memo || ''
    form.category_id = quote.value.category_id || ''
    form.favorite = quote.value.favorite
    imagePreview.value = quote.value.image_url || null
  }
})

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

async function submit() {
  if (!form.content.trim() || !quote.value) return
  submitting.value = true
  await quotesStore.updateQuote(quote.value.id, form, imageFile.value || undefined)
  submitting.value = false
  router.push(`/quotes/${quote.value.id}`)
}
</script>

<template>
  <div class="page-container">
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4" style="border-color: var(--border-subtle);">
      <div class="flex items-center justify-between">
        <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="router.back()">
          <Icon name="lucide:x" size="20" />
        </button>
        <h1 class="text-nav font-medium">문장 수정</h1>
        <button
          class="btn btn-primary text-nav px-5 py-2.5"
          :disabled="!form.content.trim() || submitting"
          @click="submit"
        >
          {{ submitting ? '저장 중...' : '저장' }}
        </button>
      </div>
    </header>

    <div class="px-5 pb-12 pt-5">
      <!-- Image preview -->
      <div v-if="imagePreview" class="relative rounded-2xl overflow-hidden mb-5">
        <img :src="imagePreview" alt="" class="w-full object-cover max-h-48">
        <label class="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center cursor-pointer">
          <Icon name="lucide:pencil" size="14" class="text-white" />
          <input type="file" accept="image/*" class="sr-only" @change="onImageChange">
        </label>
      </div>
      <div v-else class="mb-5">
        <label class="btn btn-stone w-full py-3 justify-center gap-2 text-caption cursor-pointer">
          <Icon name="lucide:image-plus" size="16" />
          사진 추가
          <input type="file" accept="image/*" class="sr-only" @change="onImageChange">
        </label>
      </div>

      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">글귀 *</label>
        <textarea v-model="form.content" class="input textarea text-body" rows="5" />
      </div>

      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">카테고리</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categoriesStore.categories"
            :key="cat.id"
            :class="['btn text-caption px-3 py-1.5', form.category_id === cat.id ? 'btn-primary' : 'btn-ghost border border-border']"
            style="border-radius: 9999px;"
            @click="form.category_id = form.category_id === cat.id ? '' : cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">제목</label>
        <input v-model="form.title" class="input" placeholder="예: 어린 왕자">
      </div>
      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">출처</label>
        <input v-model="form.source" class="input" placeholder="예: 어린 왕자">
      </div>
      <div class="flex gap-3 mb-5">
        <div class="flex-1">
          <label class="block text-caption font-medium text-secondary mb-2">저자</label>
          <input v-model="form.author" class="input" placeholder="예: 생텍쥐페리">
        </div>
        <div class="w-24">
          <label class="block text-caption font-medium text-secondary mb-2">페이지</label>
          <input v-model="form.page" class="input" type="number" min="1">
        </div>
      </div>
      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">메모</label>
        <textarea v-model="form.memo" class="input textarea" rows="3" />
      </div>

      <div class="flex items-center justify-between py-4 border-t" style="border-color: var(--border);">
        <span class="text-ui text-secondary">즐겨찾기</span>
        <button
          :class="['w-12 h-6 rounded-full transition-colors', form.favorite ? 'bg-black' : 'bg-border']"
          @click="form.favorite = !form.favorite"
        >
          <span :class="['block w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5', form.favorite ? 'translate-x-6' : 'translate-x-0']" />
        </button>
      </div>
    </div>
  </div>
</template>
