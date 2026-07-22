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
const contentRef = ref<HTMLTextAreaElement | null>(null)
const submitting = ref(false)
const ocrLoading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  categoriesStore.fetchCategories()
  contentRef.value?.focus()
})

// Anything typed or attached counts as unsaved work.
const isDirty = computed(() =>
  Object.values(form).some(v => typeof v === 'string' && v.trim() !== '')
  || imageFile.value !== null,
)

const { showConfirm, confirmLeave, cancelLeave, allowLeave } = useUnsavedGuard(isDirty)

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
    // The form is unified now, so never clobber text the user already wrote.
    if (text.trim() && !form.content.trim()) form.content = text.trim()
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
  errorMsg.value = ''
  const q = await quotesStore.createQuote(form, imageFile.value || undefined)
  submitting.value = false
  if (q) {
    allowLeave()
    router.push(`/quotes/${q.id}`)
  } else {
    errorMsg.value = '저장에 실패했어요. 다시 시도해주세요.'
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4 flex items-center justify-between">
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
      <p v-if="errorMsg" class="text-caption text-red-500 mb-4">{{ errorMsg }}</p>

      <!-- Content -->
      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">
          문장 <span class="text-black">*</span>
        </label>
        <textarea
          ref="contentRef"
          v-model="form.content"
          class="input textarea text-body"
          placeholder='"마음을 움직인 문장을 입력하세요."'
          rows="5"
          autofocus
        />
      </div>

      <!-- Category -->
      <div class="mb-5">
        <label class="block text-caption font-medium text-secondary mb-2">카테고리</label>
        <CategoryPicker v-model="form.category_id" />
      </div>

      <!-- Extra details, always visible -->
      <div class="flex flex-col gap-4 pt-5 mt-1 border-t" style="border-color: var(--border-subtle);">
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
            <input
              v-model="form.page"
              class="input"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="123"
              @input="form.page = form.page.replace(/\D/g, '')"
            >
          </div>
        </div>
        <div>
          <label class="block text-caption font-medium text-secondary mb-2">메모</label>
          <textarea v-model="form.memo" class="input textarea" placeholder="이 문장에 대한 생각을 적어보세요." rows="3" />
        </div>

        <!-- Photo — extracts text into 글귀 automatically when it is still empty -->
        <div>
          <label class="block text-caption font-medium text-secondary mb-2">사진</label>
          <div v-if="imagePreview" class="relative rounded-2xl overflow-hidden mb-3">
            <img :src="imagePreview" alt="선택한 사진" class="w-full object-cover max-h-64">
            <button
              class="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
              @click="removeImage"
            >
              <Icon name="lucide:x" size="14" class="text-white" />
            </button>
          </div>
          <div class="flex gap-2">
            <label class="btn btn-white flex-1 py-3 justify-center gap-2 text-caption cursor-pointer">
              <Icon name="lucide:camera" size="16" />
              촬영
              <input type="file" accept="image/*" capture="environment" class="sr-only" @change="onImageChange">
            </label>
            <label class="btn btn-white flex-1 py-3 justify-center gap-2 text-caption cursor-pointer">
              <Icon name="lucide:image-plus" size="16" />
              {{ imagePreview ? '사진 변경' : '사진 선택' }}
              <input type="file" accept="image/*" class="sr-only" @change="onImageChange">
            </label>
          </div>
          <div v-if="ocrLoading" class="flex items-center gap-2 mt-3 text-caption text-muted">
            <div class="w-3 h-3 border border-muted border-t-transparent rounded-full animate-spin" />
            텍스트 추출 중...
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="showConfirm"
      title="작성을 취소할까요?"
      message="입력한 내용은 저장되지 않습니다."
      confirm-text="나가기"
      cancel-text="계속 작성"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />
  </div>
</template>
