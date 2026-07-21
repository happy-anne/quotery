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

onMounted(async () => {
  await categoriesStore.fetchCategories()
})

watch(() => categoriesStore.categories, (list) => {
  if (dragIndex.value === null) items.value = [...list]
}, { immediate: true, deep: true })

async function createCategory() {
  if (!newName.value.trim()) return
  creating.value = true
  await categoriesStore.createCategory(newName.value.trim())
  newName.value = ''
  creating.value = false
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

      <!-- Category list -->
      <div ref="listRef" class="flex flex-col gap-2">
        <div
          v-for="(cat, i) in items"
          :key="cat.id"
          :class="['flex items-center justify-between p-4 card transition-shadow', dragIndex === i ? 'is-dragging' : '']"
        >
          <div class="flex items-center gap-3">
            <button
              class="drag-handle btn btn-ghost p-1 -ml-1 text-muted cursor-grab"
              :aria-label="`${cat.name} 순서 변경`"
              @pointerdown="onPointerDown(i, $event)"
            >
              <Icon name="lucide:grip-vertical" size="18" />
            </button>
            <span
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: cat.color }"
            />
            <span class="text-ui text-black">{{ cat.name }}</span>
          </div>
          <button
            class="btn btn-ghost p-2 rounded-xl text-muted"
            @click="categoriesStore.deleteCategory(cat.id)"
          >
            <Icon name="lucide:x" size="16" />
          </button>
        </div>
        <p v-if="!items.length" class="text-ui text-muted text-center py-8">
          카테고리가 없어요. 추가해보세요!
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
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
