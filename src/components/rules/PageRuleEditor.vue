<script setup>
import { paperSizes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <InputField v-model="params.top_cm" label="上边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.bottom_cm" label="下边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.left_cm" label="左边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.right_cm" label="右边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.gutter_cm" label="装订线" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.header_margin_cm" label="页眉距离" unit="厘米" :min="0" :step="0.1" />
    </div>
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <SelectField v-model="params.paper_size" label="纸张大小" :options="paperSizes" optionLabel="label" optionValue="value" />
      <InputField v-model="params.columns" label="栏数" :min="1" :max="4" :step="1" />
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[13px] text-brown whitespace-nowrap shrink-0">栏间距</span>
      <input type="number" min="0" step="0.1" v-model.number="params.column_spacing_cm"
        class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-2 py-1.5 text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="栏间距" />
      <span class="text-[13px] text-brown shrink-0">厘米</span>
    </div>
    <CheckboxField v-model="params.keep_original_orientation" label="保持原方向" />
  </div>
</template>
