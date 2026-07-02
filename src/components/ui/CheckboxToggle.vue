<script setup>
import { RiCheckLine } from '@remixicon/vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  size: { type: String, default: 'small' },
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="flex items-center gap-[3px] cursor-pointer" @click="toggle" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle" role="checkbox" :aria-checked="modelValue" :aria-label="label" tabindex="0">
    <div
      class="rounded-[3px] flex items-center justify-center transition-colors shrink-0"
      :class="[
        modelValue ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border',
        size === 'medium' ? 'w-[18px] h-[18px] rounded-[4px]' : 'w-[16px] h-[16px]',
      ]"
    >
      <RiCheckLine v-if="modelValue" :size="size === 'medium' ? 12 : 10" class="text-white" />
    </div>
    <span class="text-[12px] text-brown shrink-0">{{ label }}</span>
  </div>
</template>
