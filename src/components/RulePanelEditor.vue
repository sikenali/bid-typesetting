<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  path: { type: String, required: true },
  iconClass: { type: String, required: false, default: 'bg-cinnabar' },
})

const collapsed = ref(true)
</script>

<template>
  <div class="bg-white border border-tan-border rounded-xl overflow-hidden transition-all duration-200">
    <button
      @click="collapsed = !collapsed"
      class="w-full flex items-center gap-2 px-4 py-3 bg-cream-dark hover:bg-cream transition-colors text-left"
      :aria-expanded="!collapsed"
    >
      <span class="text-sm font-semibold text-brown-dark">{{ title }}</span>
      <span v-if="description" class="text-xs text-brown-muted">{{ description }}</span>
      <span class="flex-1"></span>
      <svg
        :class="[collapsed ? '-rotate-90' : 'rotate-0', 'transition-transform duration-200']"
        width="16" height="16" viewBox="0 0 16 16" fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="#5C4033" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    
    <div v-show="!collapsed" class="p-4 space-y-4 border-t border-tan-border">
      <slot />
    </div>
  </div>
</template>
