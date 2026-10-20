<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits } from '../../constants/ui'
import SelectField from '../ui/SelectField.vue'
import InputField from '../ui/InputField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  params: { type: Object, required: true },
})

const activeLevel = ref(0)
</script>

<template>
  <div class="toc-editor">
    <div class="rules-grid">
      <CheckboxField v-model="params.enable" label="启用目录" />
      <InputField v-model="params.title_text" label="目录标题文字" />
    </div>
    <div class="rules-grid" v-if="params.enable">
      <SelectField v-model="params.title_cn_font" label="目录标题中文字体" :options="cnFonts" />
      <SelectField v-model="params.title_en_font" label="目录标题英文字体" :options="enFonts" />
      <SelectField v-model="params.title_size_cn" label="目录标题字号" :options="sizeCN" />
    </div>

    <div class="level-section">
      <div class="tab-row">
        <button v-for="n in (params.level_styles?.length || 4)" :key="n" @click="activeLevel = n - 1" class="tab-btn" :class="{ active: activeLevel === n - 1 }">
          层级{{ n }}
        </button>
      </div>
      <div class="rules-grid" v-if="params.level_styles?.[activeLevel]">
        <SelectField v-model="params.level_styles[activeLevel].cn_font" label="中文字体" :options="cnFonts" />
        <SelectField v-model="params.level_styles[activeLevel].en_font" label="英文字体" :options="enFonts" />
        <SelectField v-model="params.level_styles[activeLevel].size_cn" label="字号" :options="sizeCN" />
        <SelectField v-model="params.level_styles[activeLevel].align" label="对齐方式" :options="[{ value: 'LEFT', label: '左对齐' }, { value: 'CENTER', label: '居中' }, { value: 'RIGHT', label: '右对齐' }]" />
        <SelectField v-model="params.level_styles[activeLevel].line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        <InputField v-model="params.level_styles[activeLevel].line_spacing_value" label="行距值" :unit="params.level_styles[activeLevel].line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
        <InputField v-model="params.level_styles[activeLevel].space_before_value" label="段前间距" :unit="params.level_styles[activeLevel].space_before_unit" :min="0" />
        <InputField v-model="params.level_styles[activeLevel].space_after_value" label="段后间距" :unit="params.level_styles[activeLevel].space_after_unit" :min="0" />
        <InputField v-model="params.level_styles[activeLevel].left_indent_value" label="左缩进" unit="字符" :min="0" />
        <InputField v-model="params.level_styles[activeLevel].first_line_indent_chars" label="首行缩进" unit="字符" :min="0" />
        <SelectField v-model="params.level_styles[activeLevel].tab_leader" label="制表符前导符" :options="[{ value: 'DOT', label: '点' }, { value: 'HYPHEN', label: '连字符' }, { value: 'UNDERSCORE', label: '下划线' }, { value: 'MIDDLE_DOT', label: '中点' }, { value: 'NONE', label: '无' }]" />
        <div class="checkbox-row">
          <CheckboxField v-model="params.level_styles[activeLevel].bold" label="加粗" />
          <CheckboxField v-model="params.level_styles[activeLevel].italic" label="斜体" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  margin-top: 12px;
}
.level-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 0.7px solid var(--color-border-soft);
}
.tab-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.tab-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 9999px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all var(--transition-base);
}
.tab-btn:hover { border-color: var(--color-primary); }
.tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary, #fff);
  font-weight: 500;
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
