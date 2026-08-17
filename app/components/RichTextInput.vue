<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
  autofocus?: boolean
}>(), {
  placeholder: '',
  rows: 5,
  autofocus: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<HTMLDivElement | null>(null)
const toolbar = reactive({ visible: false, top: 0, left: 0 })

function syncModel() {
  if (!editorRef.value) return
  emit('update:modelValue', sanitizeQuoteHtml(editorRef.value.innerHTML))
}

function onInput() {
  syncModel()
}

function selectionInEditor(sel: Selection | null): Range | null {
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !editorRef.value) return null
  const range = sel.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) return null
  return range
}

function updateToolbar() {
  const range = selectionInEditor(window.getSelection())
  if (!range) {
    toolbar.visible = false
    return
  }
  const rect = range.getBoundingClientRect()
  const hostRect = editorRef.value!.getBoundingClientRect()
  toolbar.visible = true
  toolbar.top = rect.top - hostRect.top
  toolbar.left = rect.left - hostRect.left + rect.width / 2
}

function onSelectionChange() {
  // Selection changes fire globally; only react while this editor is focused
  // so multiple editors on one page (new + memo textareas) don't fight.
  if (document.activeElement !== editorRef.value) {
    toolbar.visible = false
    return
  }
  updateToolbar()
}

function focusEditor() {
  editorRef.value?.focus()
}

function applyBold() {
  focusEditor()
  document.execCommand('bold')
  syncModel()
  updateToolbar()
}

function applyItalic() {
  focusEditor()
  document.execCommand('italic')
  syncModel()
  updateToolbar()
}

function findHighlightAncestor(node: Node): HTMLElement | null {
  let el: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  while (el && el !== editorRef.value) {
    if (el instanceof HTMLElement && el.tagName === 'MARK') return el
    el = el.parentElement
  }
  return null
}

function unwrap(el: HTMLElement) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

function applyHighlight() {
  const sel = window.getSelection()
  const range = selectionInEditor(sel)
  if (!sel || !range) return

  const existingMark = findHighlightAncestor(range.commonAncestorContainer)
  if (existingMark) {
    unwrap(existingMark)
  } else {
    const mark = document.createElement('mark')
    mark.className = 'quote-highlight'
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
    const newRange = document.createRange()
    newRange.selectNodeContents(mark)
    sel.removeAllRanges()
    sel.addRange(newRange)
  }
  focusEditor()
  syncModel()
  updateToolbar()
}

watch(() => props.modelValue, (val) => {
  if (!editorRef.value) return
  // Only external changes (OCR autofill, initial load) should overwrite the
  // live DOM — never while the user is actively typing in this editor.
  if (document.activeElement === editorRef.value) return
  const safe = sanitizeQuoteHtml(val || '')
  if (editorRef.value.innerHTML !== safe) editorRef.value.innerHTML = safe
})

onMounted(() => {
  if (editorRef.value) editorRef.value.innerHTML = sanitizeQuoteHtml(props.modelValue || '')
  if (props.autofocus) focusEditor()
  document.addEventListener('selectionchange', onSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
})

defineExpose({ focus: focusEditor })
</script>

<template>
  <div class="rich-text-input relative">
    <div
      ref="editorRef"
      class="input textarea text-body rich-editor"
      :style="{ minHeight: `${rows * 1.6}em` }"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="onInput"
    />
    <div
      v-if="toolbar.visible"
      class="format-toolbar"
      :style="{ top: `${toolbar.top}px`, left: `${toolbar.left}px` }"
    >
      <button
        type="button"
        class="format-btn"
        style="font-weight: 700;"
        @mousedown.prevent="applyBold"
        @touchstart.prevent="applyBold"
      >
        B
      </button>
      <button
        type="button"
        class="format-btn"
        style="font-style: italic;"
        @mousedown.prevent="applyItalic"
        @touchstart.prevent="applyItalic"
      >
        I
      </button>
      <button
        type="button"
        class="format-btn"
        @mousedown.prevent="applyHighlight"
        @touchstart.prevent="applyHighlight"
      >
        <span class="format-highlight-swatch" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.rich-editor {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--muted);
}

.rich-editor :deep(mark.quote-highlight) {
  background: #fff3a3;
  border-radius: 2px;
  padding: 0 1px;
}

.format-toolbar {
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--black);
  border-radius: var(--radius-md);
  padding: 4px;
  box-shadow: var(--shadow-card);
  z-index: 20;
}

.format-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #fff;
  font-size: 0.9375rem;
  cursor: pointer;
}

.format-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.format-highlight-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: #fff3a3;
}
</style>
