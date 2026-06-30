<script setup lang="ts">
const categoriesStore = useCategoriesStore()
const newName = ref('')
const creating = ref(false)

onMounted(() => categoriesStore.fetchCategories())

async function createCategory() {
  if (!newName.value.trim()) return
  creating.value = true
  await categoriesStore.createCategory(newName.value.trim())
  newName.value = ''
  creating.value = false
}
</script>

<template>
  <div class="page-container">
    <header class="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b px-5 py-4 flex items-center gap-3" style="border-color: var(--border-subtle);">
      <button class="btn btn-ghost p-2 rounded-xl -ml-2" @click="$router.back()">
        <Icon name="lucide:arrow-left" size="20" />
      </button>
      <h1 class="text-section text-black" style="font-weight: 300;">카테고리</h1>
    </header>

    <main class="px-5 py-5 pb-8">
      <!-- Add category -->
      <div class="flex gap-3 mb-8">
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

      <!-- Category list -->
      <div class="flex flex-col gap-2">
        <div
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          class="flex items-center justify-between p-4 card"
        >
          <div class="flex items-center gap-3">
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
        <p v-if="!categoriesStore.categories.length" class="text-ui text-muted text-center py-8">
          카테고리가 없어요. 추가해보세요!
        </p>
      </div>
    </main>
  </div>
</template>
