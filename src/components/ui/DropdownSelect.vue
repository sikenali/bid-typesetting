<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { RiArrowDownSLine } from '@remixicon/vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  widthClass: { type: String, default: 'w-[100px]' },
  compact: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const normalizedOptions = computed(() => Array.isArray(props.options) ? props.options : [])
const selectedLabel = computed(() => {
  const match = normalizedOptions.value.find(o => o && o.value === props.modelValue)
  return match ? match.label : props.placeholder
})

const isAutoWidth = computed(() => props.widthClass === 'auto')

const wrapperStyle = computed(() => {
  if (props.widthClass === 'flex-1') return { flex: '1', minWidth: '0' }
  return {}
})

const dropdownRef = ref(null)
const listRef = ref(null)
const highlightIndex = ref(-1)

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    highlightIndex.value = normalizedOptions.value.findIndex(o => o && o.value === props.modelValue)
    nextTick(() => {
      const active = listRef.value?.querySelector('[data-highlighted]')
      active?.scrollIntoView({ block: 'nearest' })
    })
  }
}

function select(val) {
  emit('update:modelValue', val)
  isOpen.value = false
}

function onKeydown(e) {
  if (!isOpen.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightIndex.value = Math.min(highlightIndex.value + 1, normalizedOptions.value.length - 1)
    scrollToHighlight()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightIndex.value = Math.max(highlightIndex.value - 1, 0)
    scrollToHighlight()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (highlightIndex.value >= 0) {
      select(normalizedOptions.value[highlightIndex.value]?.value)
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

function scrollToHighlight() {
  nextTick(() => {
    const el = listRef.value?.querySelector('[data-highlighted]')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="select-box" :class="{ open: isOpen, compact, disabled, auto: isAutoWidth }" :style="wrapperStyle" @keydown="onKeydown">
    <button
      type="button"
      @click="toggle"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :disabled="disabled"
      class="select-btn"
    >
      <span class="value" :class="{ muted: !modelValue }">{{ selectedLabel }}</span>
      <span class="arrow">
        <RiArrowDownSLine :size="18" />
      </span>
    </button>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="listRef"
        role="listbox"
        class="select-list"
      >
        <button
          v-for="(opt, i) in normalizedOptions"
          :key="opt.value"
          type="button"
          role="option"
          :aria-selected="modelValue === opt.value"
          :data-highlighted="highlightIndex === i ? '' : null"
          :data-selected="modelValue === opt.value ? '' : null"
          @click="select(opt.value)"
          @mouseenter="highlightIndex = i"
          class="select-item"
          :class="{ active: modelValue === opt.value, hover: highlightIndex === i && modelValue !== opt.value }"
        >{{ opt.label }}</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.select-box {
  position: relative;
  width: 250px;
  height: 52px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  transition: border-color var(--transition-base), background var(--transition-base);
}
.select-box.compact { height: 40px; }
.select-box.auto { width: auto; min-width: 140px; }
.select-box:hover { border-color: var(--color-border-hover); }
.select-box.open { border-color: var(--color-primary); }
.select-box:focus-within { border-color: var(--color-primary); background: var(--color-bg-white); }
.select-box.disabled { opacity: 0.6; cursor: not-allowed; }

.select-btn {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.select-btn .value {
  font-size: 16px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-btn .value.muted { color: var(--color-text-muted); }
.select-btn .arrow {
  color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}

.select-list {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  z-index: 50;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
}

.select-item {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--color-text-body);
  cursor: pointer;
  border-radius: 6px;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.select-item.hover { background: var(--color-primary-soft); color: var(--color-primary-deep); }
.select-item.active { background: var(--color-primary-soft); color: var(--color-primary-deep); font-weight: 500; }

.dropdown-enter-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-leave-active {
  transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
