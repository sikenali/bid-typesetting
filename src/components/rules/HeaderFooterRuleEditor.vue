<script setup>
import { cnFonts, enFonts, sizeCN } from '../../constants/ui'
import SelectField from '../ui/SelectField.vue'
import InputField from '../ui/InputField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="hf-editor">
    <div class="hf-section">
      <div class="hf-head">
        <span class="hf-title">页眉设置</span>
        <CheckboxField v-model="params.enable_header" :label="''" />
      </div>
      <template v-if="params.enable_header">
        <InputField v-model="params.header_text" label="页眉文本" />
        <div class="rules-grid">
          <SelectField v-model="params.header_cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="params.header_en_font" label="英文字体" :options="enFonts" />
          <SelectField v-model="params.header_size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="params.header_align" label="对齐方式" :options="[{ value: 'LEFT', label: '左对齐' }, { value: 'CENTER', label: '居中' }, { value: 'RIGHT', label: '右对齐' }]" />
          <SelectField v-model="params.header_underline_type" label="下划线样式" :options="[{ value: '', label: '无' }, { value: 'single', label: '单线' }, { value: 'double', label: '双线' }]" />
          <div class="checkbox-row">
            <CheckboxField v-model="params.header_bold" label="加粗" />
            <CheckboxField v-model="params.header_italic" label="斜体" />
          </div>
        </div>
        <InputField v-model="params.header_top_cm" label="页眉距离顶部" unit="厘米" :min="0" :step="0.01" />
      </template>
    </div>

    <div class="hf-section">
      <div class="hf-head">
        <span class="hf-title">页脚设置</span>
        <CheckboxField v-model="params.enable_footer" :label="''" />
      </div>
      <template v-if="params.enable_footer">
        <div class="rules-grid">
          <SelectField v-model="params.footer_cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="params.footer_en_font" label="英文字体" :options="enFonts" />
          <SelectField v-model="params.footer_size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="params.footer_align" label="对齐方式" :options="[{ value: 'LEFT', label: '左对齐' }, { value: 'CENTER', label: '居中' }, { value: 'RIGHT', label: '右对齐' }]" />
          <SelectField v-model="params.footer_page_number_type" label="页码格式" :options="[{ value: 'standard', label: '标准 (X / Y)' }, { value: 'page_only', label: '仅页码' }, { value: 'dash', label: '短横线 (X - Y)' }, { value: 'simple', label: '简单' }, { value: 'none', label: '无' }]" />
          <div class="checkbox-row">
            <CheckboxField v-model="params.footer_bold" label="加粗" />
            <CheckboxField v-model="params.footer_italic" label="斜体" />
            <CheckboxField v-model="params.clear_footer" label="清除原页脚" />
            <CheckboxField v-model="params.page_number_from_body" label="正文页码" />
          </div>
        </div>
        <InputField v-model="params.footer_bottom_cm" label="页脚距离底部" unit="厘米" :min="0" :step="0.01" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.hf-section {
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.hf-section:last-child { margin-bottom: 0; }
.hf-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.hf-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
  margin: 8px 0;
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
