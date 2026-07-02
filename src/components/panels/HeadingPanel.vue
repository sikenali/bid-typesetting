<script setup>
import { ref, computed } from 'vue'
import { RiCheckLine, RiAddLine, RiSubtractLine, RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import AlignButtonGroup from '../ui/AlignButtonGroup.vue'
import CheckboxToggle from '../ui/CheckboxToggle.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import LevelBar from '../ui/LevelBar.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits, numberingSchemes, wrappers } from '../../constants/ui'

const props = defineProps({
  params: { type: Array, required: true },
  patterns: { type: Object, required: true },
})

function addRule() {
  const defaultHeading = {
    cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '五号',
    color: '#000000', bold: false, italic: false, underline: false,
    line_spacing_mode: 'SINGLE', line_spacing_value: 28,
    space_before_value: 6, space_before_unit: 'pt',
    space_after_value: 3, space_after_unit: 'pt',
    left_indent_value: 0, left_indent_unit: 'char',
    right_indent_value: 0, right_indent_unit: 'char',
    first_line_indent_chars: 0, align: 'LEFT',
    add_space: false, space_count: 0,
  }
  props.patterns.rules.push({ enabled: false, scheme: 'ARABIC', wrapper: 'DOT', multi_depth: 1, custom_example: '' })
  props.params.push(defaultHeading)
  activeLevel.value = props.params.length - 1
}

function removeRule() {
  if (props.patterns.rules.length > 1) {
    props.patterns.rules.pop()
    props.params.pop()
    if (activeLevel.value >= props.params.length) {
      activeLevel.value = props.params.length - 1
    }
  }
}

const schemeChars = {
  NONE: '',
  ARABIC: '1',
  ZH_NUM: '一',
  ALPHA_UPPER: 'A',
  ALPHA_LOWER: 'a',
  ROMAN_UPPER: 'I',
  ROMAN_LOWER: 'i',
}

function getPreview(rule) {
  const n = schemeChars[rule.scheme] || '1'
  switch (rule.wrapper) {
    case 'NONE': return n
    case 'DOT': return n + '.'
    case 'DOUBLE_PAREN': return '(' + n + ')'
    case 'SINGLE_PAREN': return n + ')'
    case 'DUNHAO': return n + '、'
    case 'DOUBLE_BRACKET': return '[' + n + ']'
    case 'SINGLE_BRACKET': return n + ']'
    case 'DOUBLE_ANGLE': return '<' + n + '>'
    case 'SINGLE_ANGLE': return n + '>'
    case 'CN_BRACKET': return '【' + n + '】'
    default: return n
  }
}

const activeLevel = ref(0)

function selectLevel(idx) {
  activeLevel.value = idx
}

const cnLevelNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const levelLabels = computed(() =>
  props.params.map((_, i) => (cnLevelNames[i] || `${i + 1}`) + '级标题')
)

</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">标题规则</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-1">
            <button @click="addRule"
              class="w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200 text-brown-muted hover:text-cinnabar hover:bg-cream-darker" title="新增">
              <RiAddLine size="14" />
            </button>
            <button @click="removeRule" :disabled="props.patterns.rules.length <= 1"
              class="w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200 text-brown-muted hover:text-cinnabar hover:bg-cream-darker disabled:opacity-30 disabled:cursor-not-allowed" title="删除最末项">
              <RiSubtractLine size="14" />
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate" style="border-spacing: 0;">
            <thead>
              <tr class="text-[12px] font-semibold text-brown-muted">
                <th class="py-3 px-2 w-[60px] shrink-0">自定义</th>
                <th class="py-3 px-2 w-[80px] shrink-0">标题级别</th>
                <th class="py-3 px-2">标题编号</th>
                <th class="py-3 px-2 w-[110px] shrink-0">标题后缀符号</th>
                <th class="py-3 px-2 w-[80px] shrink-0">标题预览</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule, ri) in props.patterns.rules" :key="ri" class="text-[13px] border-t border-tan-border">
                <td class="py-2 px-2">
                  <div class="flex items-center gap-[4px] cursor-pointer w-fit" @click="rule.enabled = !rule.enabled">
                    <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                      :class="rule.enabled ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="rule.enabled" size="12" class="text-white" />
                    </div>
                  </div>
                </td>
                <td class="py-2 px-2 text-brown font-medium">{{ (cnLevelNames[ri] || `${ri + 1}`) + '级标题' }}</td>
                <td class="py-2 px-2">
                  <input v-if="rule.enabled" type="text" v-model="rule.custom_example"
                    class="w-full bg-white border border-tan-border rounded-lg px-[10px] py-[7px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" placeholder="输入自定义标题" />
                  <DropdownSelect v-else v-model="rule.scheme" :options="numberingSchemes" width-class="w-full" />
                </td>
                <template v-if="!rule.enabled">
                  <td class="py-2 px-2">
                    <DropdownSelect v-model="rule.wrapper" :options="wrappers" width-class="auto" />
                  </td>
                  <td class="py-2 px-2 text-cinnabar text-[13px] font-semibold text-center">{{ getPreview(rule) }}</td>
                </template>
                <template v-else>
                  <td class="py-2 px-2"></td>
                  <td class="py-2 px-2"></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 标题级别设置 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">标题级别</span>
        </div>
        <LevelBar v-model="activeLevel" :labels="levelLabels" />
        <Transition name="fade-slide" mode="out-in">
          <div :key="activeLevel" class="flex flex-col gap-3">
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">字体</span>
              <div class="w-full flex flex-col gap-[6px]">
                <div class="flex items-center justify-between gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">中文</span>
                    <DropdownSelect v-model="props.params[activeLevel].cn_font" :options="cnFonts" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">英文</span>
                    <DropdownSelect v-model="props.params[activeLevel].en_font" :options="enFonts" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">字号</span>
                    <DropdownSelect v-model="props.params[activeLevel].size_cn" :options="sizeCN" width-class="auto" />
                  </div>
                </div>
                <div class="flex items-center gap-[6px] whitespace-nowrap">
                  <div class="flex items-center gap-[3px]">
                    <span class="text-[12px] text-brown shrink-0">颜色</span>
                    <label class="relative cursor-pointer">
                      <div class="w-[18px] h-[18px] rounded-[3px] border border-tan-border cursor-pointer" :style="{ backgroundColor: props.params[activeLevel].color || '#000000' }"></div>
                      <input type="color" v-model="props.params[activeLevel].color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" aria-label="选择颜色" />
                    </label>
                  </div>
                  <CheckboxToggle v-model="props.params[activeLevel].bold" label="粗体" />
                  <CheckboxToggle v-model="props.params[activeLevel].italic" label="斜体" />
                  <CheckboxToggle v-model="props.params[activeLevel].underline" label="下划线" />
                </div>
              </div>
            </div>
            <div class="w-full h-[1px] bg-tan-border"></div>
            <!-- 行距与段落间距 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">行距与段落间距</span>
              <div class="flex flex-wrap items-center gap-[6px]">
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">行距</span>
                  <DropdownSelect v-model="props.params[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="auto" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">值</span>
                  <SpacingInput v-model="props.params[activeLevel].line_spacing_value" unit="磅" step="0.5" width="w-[50px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">段前</span>
                  <input type="number" min="0" step="0.5" v-model.number="props.params[activeLevel].space_before_value"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="段前间距" />
                    <DropdownSelect v-model="props.params[activeLevel].space_before_unit" :options="spacingUnits" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段后</span>
                    <input type="number" min="0" step="0.5" v-model.number="props.params[activeLevel].space_after_value"
                      class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="段后间距" />
                    <DropdownSelect v-model="props.params[activeLevel].space_after_unit" :options="spacingUnits" width-class="auto" />
                </div>
              </div>
            </div>
            <div class="w-full h-[1px] bg-tan-border"></div>
            <!-- 缩进 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">缩进</span>
              <div class="flex flex-wrap items-center gap-[6px]">
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">左</span>
                  <input type="number" min="0" step="0.1" v-model.number="props.params[activeLevel].left_indent_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="左缩进" />
                    <DropdownSelect v-model="props.params[activeLevel].left_indent_unit" :options="spacingUnits" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">右</span>
                    <input type="number" min="0" step="0.1" v-model.number="props.params[activeLevel].right_indent_value"
                      class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="右缩进" />
                    <DropdownSelect v-model="props.params[activeLevel].right_indent_unit" :options="spacingUnits" width-class="auto" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">首行</span>
                  <SpacingInput v-model="props.params[activeLevel].first_line_indent_chars" unit="字符" width="w-[50px]" />
                </div>
              </div>
            </div>
            <div class="w-full h-[1px] bg-tan-border"></div>
            <!-- 对齐 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">对齐</span>
              <div class="flex flex-wrap items-center gap-[6px]">
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">对齐方式</span>
                  <AlignButtonGroup v-model="props.params[activeLevel].align" :options="[
                    { value: 'LEFT', icon: RiAlignLeft },
                    { value: 'CENTER', icon: RiAlignCenter },
                    { value: 'RIGHT', icon: RiAlignRight },
                    { value: 'JUSTIFY', icon: RiAlignJustify },
                  ]" />
                </div>
                <div class="flex items-center gap-[3px] cursor-pointer" @click="props.params[activeLevel].add_space = !props.params[activeLevel].add_space">
                  <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                    :class="props.params[activeLevel].add_space ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                    <RiCheckLine v-if="props.params[activeLevel].add_space" size="10" class="text-white" />
                  </div>
                  <span class="text-[12px] text-brown shrink-0">标题编号后添加空格</span>
                </div>
                <div v-if="props.params[activeLevel].add_space" class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">空格数</span>
                  <input type="number" min="1" max="5" v-model.number="props.params[activeLevel].space_count"
                    class="w-[45px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="空格数" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
