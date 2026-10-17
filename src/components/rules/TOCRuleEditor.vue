<script setup>
import { cnFonts, sizeCN } from '../../constants/ui'
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
    <InputField v-model="params.title_text" label="目录标题文字" />
    <div class="rules-grid">
      <SelectField v-model="params.title_cn_font" label="目录标题中文字体" :options="cnFonts" />
      <SelectField v-model="params.title_en_font" label="目录标题英文字体" :options="[{ value: 'Times New Roman', label: 'Times New Roman' }, { value: 'Arial', label: 'Arial' }]" />
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
        <SelectField v-model="params.level_styles[activeLevel].size_cn" label="字号" :options="sizeCN" />
        <InputField v-model="params.level_styles[activeLevel].left_indent_value" label="左缩进" unit="字符" :min="0" />
        <CheckboxField v-model="params.level_styles[activeLevel].bold" label="加粗" />
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
  color: #fff;
  font-weight: 500;
}
</style>
