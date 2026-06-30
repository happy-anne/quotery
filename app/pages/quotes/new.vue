<script setup lang="ts">
const quotesStore = useQuotesStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()

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
const tab = ref<'text' | 'photo'>('text')
const submitting = ref(false)
const ocrLoading = ref(false)
const showMoreFields = ref(false)

onMounted(() => categoriesStore.fetchCategories())

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  runOcr(file)
}

async function runOcr(file: File) {
  ocrLoading.value = true
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('kor+eng')
    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()
    if (text.trim()) form.content = text.trim()
  } catch {
    // OCR failed silently
  } finally {
    ocrLoading.value = false
  }
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
}

async function submit() {
  if (!form.content.trim()) return
  submitting.value = true
  const q = await quotesStore.createQuote(form, imageFile.value || undefined)
  submitting.value = false
  if (q) router.push(`/quotes/${q.id}`)
}
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4" style="border-color: var(--border-subtle);">
      <div class="flex items-center justify-between">
        <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="router.back()">
          <Icon name="lucide:x" size="20" />
        </button>
        <h1 class="text-nav font-medium">문장 저장</h1>
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
      <!-- Input tabs -->
      <div class="flex gap-2 mb-6">
        <button
          :class="['btn text-nav flex-1 py-2.5', tab === 'text' ? 'btn-primary' : 'btn-ghost border border-border']"
          style="border-radius: 9999px;"
          @click="tab = 'text'"
        >
          <Icon name="lucide:type" size="16" />
          텍스트
        </button>
        <button
          :class="['btn text-nav flex-1 py-2.5', tab === 'photo' ? 'btn-primary' : 'btn-ghost border border-border']"
          style="border-radius: 9999px;"
          @click="tab = 'photo'"
        >
          <Icon name="lucide:camera" size="16" />
          사진
        </button>
      </div>

      <!-- Photo tab -->
      <div v-if="tab === 'photo'" class="mb-6">
        <div v-if="imagePreview" class="relative rounded-2xl overflow-hidden mb-4">
          <img :src="imagePreview" alt="Selected" class="w-full object-cover max-h-48">
          <button
            class="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
            @click="removeImage"
          >
            <Icon name="lucide:x" size="14" class="text-white" />
          </button>
        </div>
        <label class="btn btn-stone w-full py-4 justify-center gap-3 cursor-pointer">
          <Icon name="lucide:image-plus" size="18" />
          <span>{{ imagePreview ? '다른 사진 선택' : '사진 선택 또는 촬영' }}</span>
          <input type="file" accept="image/*" capture="environment" class="sr-only" @change="onImageChange">
        </label>
        <div v-if="ocrLoading" class="flex items-center gap-2 mt-3 text-caption text-muted">
          <div class="w-3 h-3 border border-muted border-t-transparent rounded-full animate-spin" />
          텍스트 추출 중...
        </div>
      </div>

      <!-- Content (always shown) -->
      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">
          글귀 <span class="text-black">*</span>
        </label>
        <textarea
          v-model="form.content"
          class="input textarea text-body"
          placeholder='"마음을 움직인 문장을 입력하세요."'
          rows="5"
        />
      </div>

      <!-- Category -->
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
          <NuxtLink to="/categories" class="btn btn-ghost text-caption border border-border px-3 py-1.5" style="border-radius: 9999px;">
            <Icon name="lucide:plus" size="12" />
            추가
          </NuxtLink>
        </div>
      </div>

      <!-- More fields toggle -->
      <button
        class="flex items-center gap-2 text-caption text-muted mb-5"
        @click="showMoreFields = !showMoreFields"
      >
        <Icon :name="showMoreFields ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="14" />
        {{ showMoreFields ? '추가 정보 닫기' : '출처, 저자, 메모 추가' }}
      </button>

      <Transition name="slide-up">
        <div v-if="showMoreFields" class="flex flex-col gap-4">
          <div>
            <label class="block text-caption font-medium text-secondary mb-2">제목</label>
            <input v-model="form.title" class="input" placeholder="예: 어린 왕자">
          </div>
          <div>
            <label class="block text-caption font-medium text-secondary mb-2">출처</label>
            <input v-model="form.source" class="input" placeholder="예: 어린 왕자">
          </div>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-caption font-medium text-secondary mb-2">저자</label>
              <input v-model="form.author" class="input" placeholder="예: 생텍쥐페리">
            </div>
            <div class="w-24">
              <label class="block text-caption font-medium text-secondary mb-2">페이지</label>
              <input v-model="form.page" class="input" type="number" placeholder="123" min="1">
            </div>
          </div>
          <div>
            <label class="block text-caption font-medium text-secondary mb-2">메모</label>
            <textarea v-model="form.memo" class="input textarea" placeholder="이 문장에 대한 생각을 적어보세요." rows="3" />
          </div>
        </div>
      </Transition>

      <!-- Favorite -->
      <div class="flex items-center justify-between py-4 border-t mt-4" style="border-color: var(--border);">
        <span class="text-ui text-secondary">즐겨찾기에 추가</span>
        <button
          :class="['w-12 h-6 rounded-full transition-colors', form.favorite ? 'bg-black' : 'bg-border']"
          @click="form.favorite = !form.favorite"
        >
          <span
            :class="['block w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5', form.favorite ? 'translate-x-6' : 'translate-x-0']"
          />
        </button>
      </div>
    </div>
  </div>
</template>
