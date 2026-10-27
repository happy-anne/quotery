<script setup lang="ts">
import type { Category } from '~/types'

const categoriesStore = useCategoriesStore()
const newName = ref('')
const creating = ref(false)

// Local copy so a drag can rearrange rows without writing on every pointer move.
const items = ref<Category[]>([])
const dragIndex = ref<number | null>(null)
const listRef = ref<HTMLElement | null>(null)
const saveError = ref('')

const quotesStore = useQuotesStore()

// Counts come from the quotes cache, so it is loaded here as well.
onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    quotesStore.fetchQuotes(),
  ])
})

function countOf(id: string) {
  return categoriesStore.quoteCounts[id] ?? 0
}

const uncategorizedCount = computed(() => countOf(UNCATEGORIZED_ID))

const deleteMessage = computed(() => {
  const n = pendingDelete.value ? countOf(pendingDelete.value.id) : 0
  const moved = n
    ? `이 카테고리의 문장 ${n}개는 '${UNCATEGORIZED_NAME}'로 옮겨져요.`
    : '이 카테고리에는 문장이 없어요.'
  return `${moved} 삭제한 카테고리는 되돌릴 수 없습니다.`
})

watch(() => categoriesStore.categories, (list) => {
  if (dragIndex.value === null) items.value = [...list]
}, { immediate: true, deep: true })

async function createCategory() {
  if (!newName.value.trim()) return
  if (newName.value.trim() === UNCATEGORIZED_NAME) {
    saveError.value = `'${UNCATEGORIZED_NAME}'는 기본 카테고리라 따로 만들 수 없어요.`
    return
  }
  saveError.value = ''
  creating.value = true
  await categoriesStore.createCategory(newName.value.trim())
  newName.value = ''
  creating.value = false
}

const pendingDelete = ref<Category | null>(null)
const deleting = ref(false)

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  const ok = await categoriesStore.deleteCategory(pendingDelete.value.id)
  deleting.value = false
  pendingDelete.value = null
  saveError.value = ok ? '' : '카테고리를 삭제하지 못했어요. 다시 시도해주세요.'
}

const editingId = ref<string | null>(null)
const editName = ref('')

function startEdit(cat: Category) {
  editingId.value = cat.id
  editName.value = cat.name
  saveError.value = ''
  nextTick(() => document.querySelector<HTMLInputElement>('.rename-input')?.focus())
}

function cancelEdit() {
  editingId.value = null
}

// Runs on both Enter and blur; clearing editingId first keeps the blur that
// follows Enter from saving a second time.
async function saveEdit() {
  const id = editingId.value
  if (!id) return
  editingId.value = null
  const name = editName.value.trim()
  const current = categoriesStore.getCategoryById(id)
  if (!name || name === current?.name) return
  if (name === UNCATEGORIZED_NAME) {
    saveError.value = `'${UNCATEGORIZED_NAME}'는 기본 카테고리 이름이라 쓸 수 없어요.`
    return
  }
  const { ok, message } = await categoriesStore.renameCategory(id, name)
  if (!ok) saveError.value = message
}

// The drag ends on the window, not on the handle: reordering moves the handle's
// row under the cursor, so the pointer is usually over a different row by the
// time it is released and the handle would never see the pointerup.
function onPointerDown(index: number, e: PointerEvent) {
  dragIndex.value = index
  e.preventDefault()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function endDragListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

onBeforeUnmount(endDragListeners)

function onPointerMove(e: PointerEvent) {
  if (dragIndex.value === null || !listRef.value) return
  const rows = [...listRef.value.children] as HTMLElement[]

  const target = rows.findIndex((row, i) => {
    if (i === dragIndex.value) return false
    const { top, bottom } = row.getBoundingClientRect()
    return e.clientY >= top && e.clientY <= bottom
  })
  if (target === -1) return

  const [moved] = items.value.splice(dragIndex.value, 1)
  items.value.splice(target, 0, moved!)
  dragIndex.value = target
}

async function onPointerUp() {
  endDragListeners()
  if (dragIndex.value === null) return
  dragIndex.value = null
  saveError.value = ''
  const { ok, message } = await categoriesStore.reorderCategories(items.value)
  if (!ok) {
    items.value = [...categoriesStore.categories]
    saveError.value = message
  }
}
</script>

<template>
  <div class="page-container">
    <header class="app-header">
      <div class="app-bar-inner px-5 py-4 flex items-center gap-3">
        <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="$router.back()">
          <Icon name="lucide:arrow-left" size="20" />
        </button>
        <h1 class="text-section text-black" style="font-weight: 300;">카테고리</h1>
      </div>
    </header>

    <main class="px-5 py-5 pb-8">
      <!-- Add category -->
      <div class="flex gap-3 mb-3">
        <input
          v-model="newName"
          class="input flex-1"
          placeholder="새 카테고리 이름"
          @keyup.enter="createCategory"
        >
        <button
          class="btn btn-primary px-5"
          :disabled="!newName.trim() || creating"
          @click="createCategory"
        >
          추가
        </button>
      </div>

      <p v-if="items.length > 1" class="text-caption text-muted mb-5 px-1">
        손잡이를 끌어 순서를 바꿀 수 있어요. 목록에도 같은 순서로 표시됩니다.
      </p>
      <p v-if="saveError" class="text-caption text-red-500 mb-4 px-1">{{ saveError }}</p>

      <!-- Built-in 미분류: always first, can't be moved, renamed or deleted.
           Kept outside listRef so the drag hit-test only sees real rows. -->
      <div class="flex items-center gap-3 p-4 card mb-2">
        <Icon name="lucide:inbox" size="18" class="text-muted" />
        <span class="text-ui text-black truncate">
          {{ UNCATEGORIZED_NAME }} <span class="quote-count">{{ uncategorizedCount }}</span>
        </span>
        <span class="text-caption text-muted ml-auto shrink-0">기본</span>
      </div>

      <!-- Category list -->
      <div ref="listRef" class="flex flex-col gap-2">
        <div
          v-for="(cat, i) in items"
          :key="cat.id"
          :class="['flex items-center justify-between p-4 card transition-shadow', dragIndex === i ? 'is-dragging' : '']"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <button
              class="drag-handle btn btn-ghost p-1 -ml-1 text-muted cursor-grab"
              :aria-label="`${cat.name} 순서 변경`"
              :disabled="editingId === cat.id"
              @pointerdown="onPointerDown(i, $event)"
            >
              <Icon name="lucide:grip-vertical" size="18" />
            </button>
            <span
              class="w-3 h-3 rounded-full shrink-0"
              :style="{ backgroundColor: cat.color }"
            />
            <input
              v-if="editingId === cat.id"
              v-model="editName"
              class="rename-input input flex-1 min-w-0 py-1"
              :aria-label="`${cat.name} 새 이름`"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
              @blur="saveEdit"
            >
            <span v-else class="text-ui text-black truncate">
              {{ cat.name }} <span class="quote-count">{{ countOf(cat.id) }}</span>
            </span>
          </div>
          <div class="flex items-center shrink-0">
            <button
              v-if="editingId !== cat.id"
              class="btn btn-ghost p-2 rounded-xl text-muted"
              :aria-label="`${cat.name} 이름 수정`"
              @click="startEdit(cat)"
            >
              <Icon name="lucide:pencil" size="16" />
            </button>
            <button
              class="btn btn-ghost p-2 rounded-xl text-muted"
              :aria-label="`${cat.name} 삭제`"
              @click="pendingDelete = cat"
            >
              <Icon name="lucide:x" size="16" />
            </button>
          </div>
        </div>
        <p v-if="!items.length" class="text-ui text-muted text-center py-8">
          직접 만든 카테고리가 없어요. 추가해보세요!
        </p>
      </div>
    </main>

    <ConfirmDialog
      :open="!!pendingDelete"
      :title="`'${pendingDelete?.name ?? ''}' 카테고리를 삭제할까요?`"
      :message="deleteMessage"
      :confirm-text="deleting ? '삭제 중...' : '삭제하기'"
      destructive
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

<style scoped>
.quote-count {
  font-size: 0.875em;
  color: rgba(0, 0, 0, 0.5);
}

/* Keep the drag gesture from scrolling the page on touch devices. */
.drag-handle {
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.is-dragging {
  box-shadow: var(--shadow-outline), 0 8px 24px rgba(0, 0, 0, 0.12);
  opacity: 0.95;
}
</style>
