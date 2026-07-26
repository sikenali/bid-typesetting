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
  <div class="space-y-4">
    <div class="flex gap-1 border-b border-tan-border pb-2 flex-wrap">
      <button
        v-for="(h, i) in headings"
        :key="i"
        @click="activeLevel = i"
        class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
        :class="activeLevel === i ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown hover:bg-cream'"
      >
        标题{{ i + 1 }}
      </button>
      <button
        @click="activeLevel = 99"
        class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
        :class="activeLevel === 99 ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown hover:bg-cream'"
      >
        编号规则
      </button>
    </div>

    <template v-if="activeLevel < 99 && headings[activeLevel]">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="headings[activeLevel].cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="headings[activeLevel].en_font" label="英文字体" :options="enFonts" />
          <SelectField v-model="headings[activeLevel].size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="headings[activeLevel].line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        </div>
        <InputField v-model="headings[activeLevel].line_spacing_value" label="行距值" :unit="headings[activeLevel].line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
        <InputField v-model="headings[activeLevel].first_line_indent_chars" label="首行缩进" unit="字符" :min="0" :step="0.5" />
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="headings[activeLevel].bold" label="加粗" />
          <CheckboxField v-model="headings[activeLevel].italic" label="斜体" />
          <CheckboxField v-model="headings[activeLevel].underline" label="下划线" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="space-y-2">
        <div v-for="(rule, i) in patterns.rules" :key="i" class="p-3 bg-cream-dark rounded-lg border border-tan-border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[12px] font-semibold text-brown-dark">规则{{ i + 1 }}</span>
            <CheckboxField v-model="rule.enabled" :label="''" />
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
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
    </template>
  </div>
</template>
