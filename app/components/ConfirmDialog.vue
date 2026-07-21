<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}>(), {
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  destructive: false,
})

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Transition name="fade" :duration="250">
    <div v-if="open" class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-backdrop" @click="emit('cancel')" />
      <div class="sheet-panel">
        <h3 class="text-section text-black mb-2" style="font-weight: 300;">{{ title }}</h3>
        <p v-if="message" class="text-ui text-secondary mb-6">{{ message }}</p>
        <div class="flex flex-col gap-3">
          <button
            class="btn w-full h-14 text-nav font-medium"
            :class="destructive ? 'text-white' : 'btn-primary'"
            :style="destructive ? 'background: #dc2626;' : ''"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
          <button class="btn btn-ghost w-full h-14 text-nav" @click="emit('cancel')">
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
