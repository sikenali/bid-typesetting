<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RiArrowDownSLine } from '@remixicon/vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  widthClass: { type: String, default: 'w-[100px]' },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedLabel = computed(() => {
  const match = props.options.find(o => o.value === props.modelValue)
  return match ? match.label : props.placeholder
})

const contentWidth = computed(() => {
  let maxW = 0
  for (const opt of props.options) {
    let w = 0
    for (const ch of opt.label) {
      w += ch.charCodeAt(0) > 127 ? 14 : 7.5
    }
    if (w > maxW) { maxW = w }
  }
  return Math.ceil(maxW) + 44
})

const isAutoWidth = computed(() => props.widthClass === 'auto')
const resolvedWidth = computed(() => isAutoWidth.value ? `${contentWidth.value}px` : '')

const dropdownRef = ref(null)
const listRef = ref(null)
const highlightIndex = ref(-1)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    highlightIndex.value = props.options.findIndex(o => o.value === props.modelValue)
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
    highlightIndex.value = Math.min(highlightIndex.value + 1, props.options.length - 1)
    scrollToHighlight()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightIndex.value = Math.max(highlightIndex.value - 1, 0)
    scrollToHighlight()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (highlightIndex.value >= 0) {
      select(props.options[highlightIndex.value].value)
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
  <div ref="dropdownRef" class="relative" :class="isAutoWidth ? '' : widthClass" :style="resolvedWidth ? { minWidth: resolvedWidth, width: 'auto' } : undefined" @keydown="onKeydown">
    <button
      type="button"
      @click="toggle"
      :aria-expanded="isOpen"
      class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-left outline-none transition-all duration-150 flex items-center gap-1 cursor-pointer"
      :class="isOpen ? 'border-cinnabar ring-1 ring-cinnabar/25' : 'hover:border-tan-dark'"
    >
      <span class="flex-1 truncate" :class="modelValue ? 'text-brown' : 'text-brown-muted'">{{ selectedLabel }}</span>
      <RiArrowDownSLine
        size="16"
        class="text-brown-muted shrink-0 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="listRef"
        class="absolute left-0 right-0 top-full mt-1 bg-white border border-tan-border rounded-xl shadow-lg z-50 max-h-[240px] overflow-y-auto py-1"
      >
        <button
          v-for="(opt, i) in options"
          :key="opt.value"
          type="button"
          :data-highlighted="highlightIndex === i ? '' : null"
          :data-selected="modelValue === opt.value ? '' : null"
          @click="select(opt.value)"
          @mouseenter="highlightIndex = i"
          class="w-full text-left px-[12px] py-[9px] text-[13px] transition-colors cursor-pointer"
          :class="[
            modelValue === opt.value
              ? 'text-cinnabar font-semibold bg-cinnabar/5'
              : highlightIndex === i
                ? 'bg-cream-darker text-brown-dark'
                : 'text-brown hover:bg-cream-darker'
          ]"
        >{{ opt.label }}</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
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
