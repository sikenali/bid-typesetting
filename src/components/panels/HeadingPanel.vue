<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RiCheckLine, RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

const props = defineProps({
  params: { type: Array, required: true },
  patterns: { type: Object, required: true },
})

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
const spacingUnits = ['磅', '行'].map(v => ({ value: v, label: v }))
const indentUnits = ['字符', '厘米', '毫米'].map(v => ({ value: v, label: v }))
const levelLabels = ['一级标题', '二级标题', '三级标题', '四级标题']

const numberingSchemes = [
  { value: 'ARABIC', label: '1, 2, 3' },
  { value: 'ZH_NUM', label: '一、二、三' },
  { value: 'ALPHA', label: 'A, B, C' },
  { value: 'ROMAN', label: 'I, II, III' },
]

const wrappers = [
  { value: 'NONE', label: '无' },
  { value: 'DUNHAO', label: '第X章' },
  { value: 'SECTION', label: '第X节' },
  { value: 'ARTICLE', label: '第X条' },
]

const ruleNames = ['第1章', '1.1', '1.1.1', '1.1.1.1']
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="grid grid-cols-2 gap-4">
      <!-- 编号规则 -->
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">编号规则</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate" style="border-spacing: 0;">
            <thead>
              <tr class="text-[12px] font-semibold text-brown-muted">
                <th class="py-3 px-2 w-[50px] shrink-0">启用</th>
                <th class="py-3 px-2 w-[80px] shrink-0">规则名称</th>
                <th class="py-3 px-2">编号方案</th>
                <th class="py-3 px-2">包装器</th>
                <th class="py-3 px-2 w-[70px] shrink-0">多层深度</th>
                <th class="py-3 px-2 w-[100px] shrink-0">效果示例</th>
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
                <td class="py-2 px-2 text-brown font-medium">{{ ruleNames[ri] }}</td>
                <td class="py-2 px-2">
                  <DropdownSelect v-model="rule.scheme" :options="numberingSchemes" width-class="w-full" />
                </td>
                <td class="py-2 px-2">
                  <DropdownSelect v-model="rule.wrapper" :options="wrappers" width-class="w-full" />
                </td>
                <td class="py-2 px-2">
                  <input type="number" min="1" max="5" v-model.number="rule.multi_depth"
                    class="w-[55px] bg-white border border-tan-border rounded-lg px-[10px] py-[7px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
                </td>
                <td class="py-2 px-2 text-brown-muted text-[12px]">
                  <span v-if="ri === 0 && rule.scheme === 'ZH_NUM' && rule.wrapper === 'DUNHAO'">第X章</span>
                  <span v-else-if="ri === 0 && rule.scheme === 'ARABIC'">第X章</span>
                  <span v-else-if="ri === 1">1.1</span>
                  <span v-else-if="ri === 2">1.1.1</span>
                  <span v-else>1.1.1.1</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 标题级别设置 -->
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-full h-[5px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[6px]">
          <div class="w-[4px] h-[16px] rounded-[2px] bg-cinnabar shrink-0"></div>
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
                <div class="flex items-center gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">中文</span>
                    <DropdownSelect v-model="props.params[activeLevel].cn_font" :options="cnFonts" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">英文</span>
                    <DropdownSelect v-model="props.params[activeLevel].en_font" :options="enFonts" width-class="auto" />
                  </div>
                  <div class="ml-auto flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">字号</span>
                    <DropdownSelect v-model="props.params[activeLevel].size_cn" :options="sizeCN" width-class="auto" />
                  </div>
                </div>
                <div class="flex items-center gap-[6px] whitespace-nowrap">
                  <div class="flex items-center gap-[3px]">
                    <span class="text-[12px] text-brown shrink-0">颜色</span>
                    <label class="relative cursor-pointer">
                      <div class="w-[18px] h-[18px] rounded-[3px] border border-tan-border cursor-pointer"></div>
                      <input type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
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
                  <DropdownSelect v-model="props.params[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="w-[80px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">值</span>
                  <input type="number" step="0.5" v-model.number="props.params[activeLevel].line_spacing_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <span class="text-[12px] text-brown shrink-0">磅</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">段前</span>
                  <input type="number" step="0.5" v-model.number="props.params[activeLevel].space_before_value"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="props.params[activeLevel].space_before_unit" :options="spacingUnits" width-class="w-[50px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">段后</span>
                  <input type="number" step="0.5" v-model.number="props.params[activeLevel].space_after_value"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="props.params[activeLevel].space_after_unit" :options="spacingUnits" width-class="w-[50px]" />
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
                  <input type="number" step="0.1" v-model.number="props.params[activeLevel].left_indent_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="props.params[activeLevel].left_indent_unit" :options="indentUnits" width-class="w-[60px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">右</span>
                  <input type="number" step="0.1" v-model.number="props.params[activeLevel].right_indent_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="props.params[activeLevel].right_indent_unit" :options="indentUnits" width-class="w-[60px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">首行</span>
                  <input type="number" step="0.1" v-model.number="props.params[activeLevel].first_line_indent_chars"
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
                  <span class="text-[12px] text-brown shrink-0">中英文空格</span>
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
