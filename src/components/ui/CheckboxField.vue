<script setup>
import { RiCheckLine } from '@remixicon/vue'
defineProps({
  label: { type: String, required: true },
})
const model = defineModel({ type: Boolean })
</script>

<template>
  <label class="flex items-center gap-2 cursor-pointer">
    <div
      role="checkbox"
      :aria-checked="model"
      tabindex="0"
      class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
      :class="model ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'"
      @click="model = !model"
      @keydown.enter.prevent="model = !model"
      @keydown.space.prevent="model = !model"
    >
      <RiCheckLine v-if="model" size="12" class="text-white" />
    </div>
    <span class="text-[13px] text-brown shrink-0">{{ label }}</span>
  </label>
</template>
