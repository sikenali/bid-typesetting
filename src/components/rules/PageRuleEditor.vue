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
  <div class="rules-grid">
    <InputField v-model="params.top_cm" label="上边距" unit="厘米" :min="0" :step="0.1" />
    <InputField v-model="params.bottom_cm" label="下边距" unit="厘米" :min="0" :step="0.1" />
    <InputField v-model="params.left_cm" label="左边距" unit="厘米" :min="0" :step="0.1" />
    <InputField v-model="params.right_cm" label="右边距" unit="厘米" :min="0" :step="0.1" />
    <InputField v-model="params.gutter_cm" label="装订线" unit="厘米" :min="0" :step="0.1" />
    <InputField v-model="params.header_margin_cm" label="页眉距离" unit="厘米" :min="0" :step="0.1" />
    <SelectField v-model="params.paper_size" label="纸张大小" :options="paperSizes" optionLabel="label" optionValue="value" />
    <InputField v-model="params.columns" label="栏数" :min="1" :max="4" :step="1" />
    <InputField v-model="params.column_spacing_cm" label="栏间距" unit="厘米" :min="0" :step="0.1" />
    <CheckboxField v-model="params.keep_original_orientation" label="保持原方向" />
  </div>
</template>

<style scoped>
.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}
</style>
