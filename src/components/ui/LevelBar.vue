<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  labels: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const barRef = ref(null)
const indicatorStyle = ref({ left: '4px', width: '56px' })

function positionIndicator() {
  const bar = barRef.value
  if (!bar) return
  const btns = bar.querySelectorAll('[data-level-btn]')
  const btn = btns[props.modelValue]
  if (!btn) {
    if (props.modelValue >= 0 && props.modelValue < btns.length) return
    if (props.labels.length) console.warn(`LevelBar: modelValue ${props.modelValue} out of range for ${btns.length} buttons`)
    return
  }
  const barRect = bar.getBoundingClientRect()
  const btnRect = btn.getBoundingClientRect()
  indicatorStyle.value = {
    left: `${btnRect.left - barRect.left}px`,
    width: `${btnRect.width}px`,
  }
}

function select(idx) {
  emit('update:modelValue', idx)
  nextTick(positionIndicator)
}

watch(() => props.modelValue, () => { nextTick(positionIndicator) })
watch(() => props.labels, () => { nextTick(positionIndicator) })
onMounted(() => { nextTick(positionIndicator) })
</script>

<template>
  <div ref="barRef" class="bg-cream-darker rounded-lg p-[3px] flex items-center gap-[3px] relative" role="group" :aria-label="'选择层级'">
    <div class="absolute top-[3px] bottom-[3px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
      :style="indicatorStyle">
    </div>
    <button v-for="(label, idx) in labels" :key="idx" data-level-btn
      @click="select(idx)"
      class="relative z-10 px-[10px] py-[5px] text-[12px] rounded-lg transition-colors duration-200 cursor-pointer"
      :class="modelValue === idx ? 'text-cinnabar font-semibold' : 'text-brown hover:text-brown-dark'"
      :aria-pressed="modelValue === idx"
      :aria-label="label"
    >{{ label }}</button>
  </div>
</template>
