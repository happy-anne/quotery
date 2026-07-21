<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <span
    :class="[
      'font-light tracking-tight text-black',
      size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl',
    ]"
    style="font-weight: 300;"
  >Quotery</span>
</template>
