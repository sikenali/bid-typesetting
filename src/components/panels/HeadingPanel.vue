<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { RiCheckLine, RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify, RiAddLine, RiSubtractLine } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

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
  props.patterns.rules.push({ enabled: false, scheme: 'ARABIC', wrapper: 'DOT', multi_depth: '1', custom_example: '' })
  props.params.push(defaultHeading)
  activeLevel.value = props.params.length - 1
  nextTick(positionIndicator)
}

function removeRule() {
  if (props.patterns.rules.length > 1) {
    props.patterns.rules.pop()
    props.params.pop()
    if (activeLevel.value >= props.params.length) {
      activeLevel.value = props.params.length - 1
    }
    nextTick(positionIndicator)
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
const levelBarRef = ref(null)
const indicatorStyle = ref({ left: '4px', width: '56px' })

function positionIndicator() {
  const bar = levelBarRef.value
  if (!bar) return
  const btns = bar.querySelectorAll('button')
  const btn = btns[activeLevel.value]
  if (!btn) return
  const barRect = bar.getBoundingClientRect()
  const btnRect = btn.getBoundingClientRect()
  indicatorStyle.value = {
    left: `${btnRect.left - barRect.left}px`,
    width: `${btnRect.width}px`,
  }
}

function selectLevel(idx) {
  activeLevel.value = idx
  nextTick(positionIndicator)
}

onMounted(() => { nextTick(positionIndicator) })

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'MULTIPLE', label: '多倍行距' },
  { value: 'AT_LEAST', label: '最小值' },
]
const spacingUnits = ['行', '厘米', '字符', '磅'].map(v => ({ value: v === '磅' ? 'pt' : v === '行' ? 'line' : v === '字符' ? 'char' : v === '厘米' ? 'cm' : v, label: v }))
const indentUnits = ['行', '厘米', '字符', '磅'].map(v => ({ value: v === '磅' ? 'pt' : v === '行' ? 'line' : v === '字符' ? 'char' : v === '厘米' ? 'cm' : v, label: v }))
const cnLevelNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const levelLabels = computed(() =>
  props.params.map((_, i) => (cnLevelNames[i] || `${i + 1}`) + '级标题')
)

const numberingSchemes = [
  { value: 'NONE', label: '原有级别&标题' },
  { value: 'ZH_NUM', label: '中文数字' },
  { value: 'ALPHA_UPPER', label: '大写字母' },
  { value: 'ALPHA_LOWER', label: '小写字母' },
  { value: 'ARABIC', label: '阿拉伯数字' },
  { value: 'ROMAN_UPPER', label: '大写罗马数字' },
  { value: 'ROMAN_LOWER', label: '小写罗马数字' },
]

const wrappers = [
  { value: 'NONE', label: '无前后缀' },
  { value: 'DOT', label: '尾部加点.' },
  { value: 'DOUBLE_PAREN', label: '双圆括号()' },
  { value: 'SINGLE_PAREN', label: '单圆括号)' },
  { value: 'DUNHAO', label: '顿号、' },
  { value: 'DOUBLE_BRACKET', label: '双方括号[]' },
  { value: 'SINGLE_BRACKET', label: '单方括号]' },
  { value: 'DOUBLE_ANGLE', label: '双尖括号<>' },
  { value: 'SINGLE_ANGLE', label: '单尖括号>' },
  { value: 'CN_BRACKET', label: '中文方括号【】' },
]

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
          <span class="text-[14px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">标题级别</span>
        </div>
        <div ref="levelBarRef" class="bg-cream-darker rounded-lg p-[3px] flex items-center gap-[3px] relative">
          <div class="absolute top-[3px] bottom-[3px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
            :style="indicatorStyle">
          </div>
          <button
            v-for="(label, idx) in levelLabels" :key="idx"
            @click="selectLevel(idx)"
            class="relative z-10 px-[10px] py-[5px] text-[12px] rounded-lg transition-colors duration-200 cursor-pointer"
            :class="activeLevel === idx ? 'text-cinnabar font-semibold' : 'text-brown hover:text-brown-dark'"
          >{{ label }}</button>
        </div>
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
                      <input type="color" v-model="props.params[activeLevel].color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </label>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="props.params[activeLevel].bold = !props.params[activeLevel].bold">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="props.params[activeLevel].bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="props.params[activeLevel].bold" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">粗体</span>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="props.params[activeLevel].italic = !props.params[activeLevel].italic">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="props.params[activeLevel].italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="props.params[activeLevel].italic" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">斜体</span>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="props.params[activeLevel].underline = !props.params[activeLevel].underline">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="props.params[activeLevel].underline ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="props.params[activeLevel].underline" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">下划线</span>
                  </div>
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
                  <input type="number" min="0" step="0.5" v-model.number="props.params[activeLevel].line_spacing_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <span class="text-[12px] text-brown shrink-0">磅</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">段前</span>
                  <input type="number" min="0" step="0.5" v-model.number="props.params[activeLevel].space_before_value"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="props.params[activeLevel].space_before_unit" :options="spacingUnits" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段后</span>
                    <input type="number" min="0" step="0.5" v-model.number="props.params[activeLevel].space_after_value"
                      class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
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
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="props.params[activeLevel].left_indent_unit" :options="indentUnits" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">右</span>
                    <input type="number" min="0" step="0.1" v-model.number="props.params[activeLevel].right_indent_value"
                      class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="props.params[activeLevel].right_indent_unit" :options="indentUnits" width-class="auto" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">首行</span>
                  <input type="number" min="0" step="0.1" v-model.number="props.params[activeLevel].first_line_indent_chars"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <span class="text-[12px] text-brown shrink-0">字符</span>
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
                  <div class="bg-cream-darker rounded-lg p-[3px] flex items-center relative">
                    <div class="absolute top-[3px] bottom-[3px] w-7 bg-white rounded-[3px] shadow-sm transition-all duration-300 ease-out pointer-events-none"
                      :style="{ left: `${3 + ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY'].indexOf(props.params[activeLevel].align) * 28}px` }">
                    </div>
                    <button @click="props.params[activeLevel].align = 'LEFT'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="props.params[activeLevel].align === 'LEFT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignLeft size="13" />
                    </button>
                    <button @click="props.params[activeLevel].align = 'CENTER'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="props.params[activeLevel].align === 'CENTER' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignCenter size="13" />
                    </button>
                    <button @click="props.params[activeLevel].align = 'RIGHT'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="props.params[activeLevel].align === 'RIGHT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignRight size="13" />
                    </button>
                    <button @click="props.params[activeLevel].align = 'JUSTIFY'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="props.params[activeLevel].align === 'JUSTIFY' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignJustify size="13" />
                    </button>
                  </div>
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
                    class="w-[45px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
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
