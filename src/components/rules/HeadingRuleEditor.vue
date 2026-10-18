<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  headings: { type: Array, required: true },
  patterns: { type: Object, required: true },
})

const activeLevel = ref(0)
</script>

<template>
  <div class="heading-editor">
    <div class="tab-row">
      <button
        v-for="(h, i) in headings"
        :key="i"
        class="tab-btn"
        :class="{ active: activeLevel === i && activeLevel !== 99 }"
        @click="activeLevel = i"
      >标题{{ i + 1 }}</button>
      <button
        v-if="patterns?.rules"
        class="tab-btn"
        :class="{ active: activeLevel === 99 }"
        @click="activeLevel = 99"
      >编号规则</button>
    </div>

    <div v-if="activeLevel !== 99 && headings[activeLevel]" class="rules-grid">
      <SelectField v-model="headings[activeLevel].cn_font" label="中文字体" :options="cnFonts" />
      <SelectField v-model="headings[activeLevel].en_font" label="英文字体" :options="enFonts" />
      <SelectField v-model="headings[activeLevel].size_cn" label="字号" :options="sizeCN" />
      <SelectField v-model="headings[activeLevel].line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
      <InputField v-model="headings[activeLevel].line_spacing_value" label="行距值" :unit="headings[activeLevel].line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
      <InputField v-model="headings[activeLevel].first_line_indent_chars" label="首行缩进" unit="字符" :min="0" :step="0.5" />
      <div class="checkbox-row">
        <CheckboxField v-model="headings[activeLevel].bold" label="加粗" />
        <CheckboxField v-model="headings[activeLevel].italic" label="斜体" />
        <CheckboxField v-model="headings[activeLevel].underline" label="下划线" />
      </div>
    </div>

    <div v-else-if="patterns?.rules" class="rule-list">
      <div v-for="(rule, i) in patterns.rules" :key="i" class="rule-card">
        <div class="rule-head">
          <span class="rule-title">规则{{ i + 1 }}</span>
          <CheckboxField v-model="rule.enabled" :label="''" />
        </div>
        <div class="rules-grid">
          <SelectField v-model="rule.scheme" label="编号方案" :options="[
            { value: 'NONE', label: '原有级别&标题' },
            { value: 'ZH_NUM', label: '中文数字' },
            { value: 'ARABIC', label: '阿拉伯数字' },
          ]" />
          <SelectField v-model="rule.wrapper" label="前后缀" :options="[
            { value: 'NONE', label: '无' },
            { value: 'DOT', label: '尾部加点.' },
            { value: 'DUNHAO', label: '顿号、' },
            { value: 'DOUBLE_PAREN', label: '双圆括号()' },
            { value: 'SINGLE_PAREN', label: '单圆括号)' },
          ]" />
          <InputField v-model="rule.multi_depth" label="多级深度" :min="0" :step="1" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 0.7px solid var(--color-border-soft);
  margin-bottom: 14px;
}
.tab-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 13px;
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
}
.rule-list { display: flex; flex-direction: column; gap: 12px; }
.rule-card {
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 10px;
  padding: 14px 16px;
}
.rule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.rule-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}
</style>
