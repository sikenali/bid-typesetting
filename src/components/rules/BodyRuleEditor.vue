<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes, underlineTypes, highlightColors, textColors } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="rules-grid">
    <SelectField v-model="params.cn_font" label="中文字体" :options="cnFonts" />
    <SelectField v-model="params.en_font" label="英文字体" :options="enFonts" />
    <SelectField v-model="params.size_cn" label="字号" :options="sizeCN" />
    <SelectField v-model="params.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
    <InputField v-model="params.line_spacing_value" label="行距值" :unit="params.line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
    <InputField v-model="params.first_line_indent_chars" label="首行缩进" unit="字符" :min="0" :step="0.5" />
    <InputField v-model="params.space_before_value" label="段前间距" :unit="params.space_before_unit" :min="0" :step="1" />
    <InputField v-model="params.space_after_value" label="段后间距" :unit="params.space_after_unit" :min="0" :step="1" />
    <InputField v-model="params.left_indent_value" label="左缩进" :unit="params.left_indent_unit" :min="0" />
    <InputField v-model="params.right_indent_value" label="右缩进" :unit="params.right_indent_unit" :min="0" />
    <SelectField v-model="params.color" label="字体颜色" :options="textColors" />
    <SelectField v-model="params.highlight" label="高亮底纹" :options="highlightColors" />
    <SelectField v-model="params.underline_type" label="下划线样式" :options="underlineTypes" />
    <div class="checkbox-row">
      <CheckboxField v-model="params.bold" label="加粗" />
      <CheckboxField v-model="params.italic" label="斜体" />
      <CheckboxField v-model="params.underline" label="下划线" />
      <CheckboxField v-model="params.strike" label="删除线" />
      <CheckboxField v-model="params.add_space" label="中英文空格" />
      <CheckboxField v-model="params.keep_with_next" label="与下段同页" />
      <CheckboxField v-model="params.page_break_before" label="段前分页" />
    </div>
  </div>
</template>

<style scoped>
.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}
.checkbox-row {
  grid-column: 1 / -1;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 4px;
  border-top: 0.7px solid var(--color-border-soft);
  margin-top: 4px;
}
</style>
