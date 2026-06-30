<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div :class="['flex items-center gap-2', size === 'lg' ? 'gap-3' : '']">
    <div
      :class="[
        'rounded-xl flex items-center justify-center bg-black',
        size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9',
      ]"
    >
      <span
        :class="[
          'text-white font-light',
          size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg',
        ]"
        style="font-weight: 300; letter-spacing: -0.5px;"
      >"</span>
    </div>
    <span
      :class="[
        'font-light tracking-tight text-black',
        size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl',
      ]"
      style="font-weight: 300;"
    >Quotery</span>
  </div>
</template>
