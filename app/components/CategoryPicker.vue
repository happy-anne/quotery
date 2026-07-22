<script setup lang="ts">
// Category chips with inline creation. Adding a category here deliberately
// never navigates: leaving the write screen would abandon the draft.
const model = defineModel<string>({ required: true })

const categoriesStore = useCategoriesStore()

const adding = ref(false)
const draft = ref('')
const saving = ref(false)
const errorMsg = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startAdd() {
  errorMsg.value = ''
  draft.value = ''
  adding.value = true
  nextTick(() => inputRef.value?.focus())
}

function cancelAdd() {
  adding.value = false
  draft.value = ''
  errorMsg.value = ''
}

function select(id: string) {
  model.value = model.value === id ? '' : id
}

async function submitAdd() {
  const name = draft.value.trim()
  if (!name || saving.value) return

  // Reuse an existing category instead of creating a duplicate name.
  const existing = categoriesStore.categories.find(c => c.name === name)
  if (existing) {
    model.value = existing.id
    cancelAdd()
    return
  }

  saving.value = true
  errorMsg.value = ''
  const created = await categoriesStore.createCategory(name)
  saving.value = false

  if (!created) {
    errorMsg.value = '카테고리를 추가하지 못했어요. 다시 시도해주세요.'
    return
  }

  model.value = created.id
  cancelAdd()
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="cat in categoriesStore.categories"
        :key="cat.id"
        :class="['btn text-caption px-3 py-1.5', model === cat.id ? 'btn-chip-selected' : 'btn-chip']"
        style="border-radius: 9999px;"
        @click="select(cat.id)"
      >
        {{ cat.name }}
      </button>

      <button
        v-if="!adding"
        class="btn btn-chip text-caption px-3 py-1.5"
        aria-label="카테고리 추가"
        @click="startAdd"
      >
        <Icon name="lucide:plus" size="12" />
        추가
      </button>

      <span v-else class="inline-flex items-center gap-1">
        <input
          ref="inputRef"
          v-model="draft"
          class="input input-chip"
          placeholder="새 카테고리"
          maxlength="20"
          :disabled="saving"
          @keydown.enter.prevent="submitAdd"
          @keydown.esc="cancelAdd"
        >
        <button
          class="btn btn-ghost p-1.5 rounded-lg"
          :disabled="!draft.trim() || saving"
          aria-label="추가 확인"
          @click="submitAdd"
        >
          <Icon name="lucide:check" size="15" />
        </button>
        <button
          class="btn btn-ghost p-1.5 rounded-lg"
          aria-label="추가 취소"
          @click="cancelAdd"
        >
          <Icon name="lucide:x" size="15" />
        </button>
      </span>
    </div>

    <p v-if="errorMsg" class="text-caption text-red-500 mt-2">{{ errorMsg }}</p>
  </div>
</template>
