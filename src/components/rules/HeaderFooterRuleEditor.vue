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
          <SelectField v-model="params.header_size_cn" label="字号" :options="sizeCN" />
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
          <SelectField v-model="params.footer_size_cn" label="字号" :options="sizeCN" />
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
</style>
