<script setup lang="ts">
import type { Quote } from '~/types'

const route = useRoute()
const router = useRouter()
const quotesStore = useQuotesStore()
const categoriesStore = useCategoriesStore()

const quote = ref<Quote | null>(null)
const form = reactive({
  content: '',
  source: '',
  author: '',
  page: '',
  memo: '',
  category_id: '',
  // Toggled from the quote detail view, not this form — carried through so
  // saving an edit doesn't clear it.
  favorite: false,
})
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
// True once the user removes the ORIGINAL photo without picking a
// replacement — distinct from imageFile being empty, which just means
// "nothing changed".
const removePhoto = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  await categoriesStore.fetchCategories()
  quote.value = await quotesStore.getQuote(route.params.id as string)
  if (quote.value) {
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
  removePhoto.value = false
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
  removePhoto.value = true
}

// Dirty means "differs from the quote as loaded", so simply opening the form
// and leaving it alone does not prompt.
const isDirty = computed(() => {
  if (!quote.value) return false
  if (imageFile.value || removePhoto.value) return true
  return form.content !== quote.value.content
    || form.source !== (quote.value.source || '')
    || form.author !== (quote.value.author || '')
    || form.page !== (quote.value.page?.toString() || '')
    || form.memo !== (quote.value.memo || '')
    || form.category_id !== (quote.value.category_id || '')
})

const { showConfirm, confirmLeave, cancelLeave, allowLeave } = useUnsavedGuard(isDirty)

async function submit() {
  if (!form.content.trim() || !quote.value) return
  submitting.value = true
  errorMsg.value = ''
  const updated = await quotesStore.updateQuote(quote.value.id, form, imageFile.value || undefined, removePhoto.value)
  submitting.value = false
  if (updated) {
    allowLeave()
    // This screen was reached by pushing from the detail page, so going back
    // returns there directly (it remounts and re-reads the now-updated quote)
    // instead of leaving this submitted form as an extra hop in history.
    router.back()
  } else {
    errorMsg.value = '저장에 실패했어요. 다시 시도해주세요.'
  }
}
</script>

<template>
  <div class="page-container">
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4 flex items-center justify-between">
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
      <p v-if="errorMsg" class="text-caption text-red-500 mb-4">{{ errorMsg }}</p>

      <div class="mb-6">
        <label class="block text-caption font-medium text-secondary mb-2">문장 *</label>
        <textarea v-model="form.content" class="input textarea text-body" rows="5" />
      </div>

      <!-- Photo -->
      <div class="mb-6">
        <label class="block text-caption font-medium text-secondary mb-2">사진</label>
        <div v-if="imagePreview" class="relative rounded-[8px] overflow-hidden mb-3">
          <img :src="imagePreview" alt="첨부된 사진" class="w-full object-cover max-h-64">
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
      </div>

      <div class="mb-6">
        <label class="block text-caption font-medium text-secondary mb-2">카테고리</label>
        <CategoryPicker v-model="form.category_id" />
      </div>

      <!-- Extra details -->
      <div class="pt-5 mt-1 border-t" style="border-color: var(--border-subtle);">
        <div class="mb-6">
          <label class="block text-caption font-medium text-secondary mb-2">출처</label>
          <input v-model="form.source" class="input" placeholder="예: 어린 왕자">
        </div>
        <div class="flex gap-3 mb-6">
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
              @input="form.page = form.page.replace(/\D/g, '')"
            >
          </div>
        </div>
        <div class="mb-6">
          <label class="block text-caption font-medium text-secondary mb-2">메모</label>
          <textarea v-model="form.memo" class="input textarea" rows="3" />
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="showConfirm"
      title="작성을 취소할까요?"
      message="수정한 내용은 저장되지 않습니다."
      confirm-text="나가기"
      cancel-text="계속 작성"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />
  </div>
</template>
