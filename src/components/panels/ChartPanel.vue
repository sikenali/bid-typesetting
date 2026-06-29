<script setup>
import { RiCheckLine, RiAlignLeft, RiAlignCenter, RiAlignRight } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
  activeSubTab: { type: String, default: 'fig' },
})

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'MULTIPLE', label: '多倍行距' },
]
const indentUnits = ['行', '厘米', '字符', '磅'].map(v => ({ value: v === '磅' ? 'pt' : v === '行' ? 'line' : v === '字符' ? 'char' : v === '厘米' ? 'cm' : v, label: v }))
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full space-y-5 px-5 py-3">
    <template v-if="activeSubTab === 'fig'">
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">图题 · 字体</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">中文字体</span>
            <DropdownSelect v-model="figCaption.cn_font" :options="cnFonts" width-class="auto" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">英文字体</span>
            <DropdownSelect v-model="figCaption.en_font" :options="enFonts" width-class="auto" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">字号</span>
            <DropdownSelect v-model="figCaption.size_cn" :options="sizeCN" width-class="auto" />
          </div>
          <div class="flex items-center gap-[3px] cursor-pointer" @click="figCaption.bold = !figCaption.bold">
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="figCaption.bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="figCaption.bold" size="10" class="text-white" />
            </div>
            <span class="text-[12px] text-brown shrink-0">粗体</span>
          </div>
          <div class="flex items-center gap-[3px] cursor-pointer" @click="figCaption.italic = !figCaption.italic">
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="figCaption.italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="figCaption.italic" size="10" class="text-white" />
            </div>
            <span class="text-[12px] text-brown shrink-0">斜体</span>
          </div>
          <div class="flex items-center gap-[3px] cursor-pointer" @click="figCaption.underline = !figCaption.underline">
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="figCaption.underline ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="figCaption.underline" size="10" class="text-white" />
            </div>
            <span class="text-[12px] text-brown shrink-0">下划线</span>
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">图题 · 行距与段落间距</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距模式</span>
            <DropdownSelect v-model="figCaption.line_spacing_mode" :options="lineSpacingModes" width-class="w-[110px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距值</span>
            <input type="number" min="0" step="0.5" v-model.number="figCaption.line_spacing_value"
              class="w-[70px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">磅</span>
          </div>
          <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">段前</span>
            <input type="number" min="0" step="0.5" v-model.number="figCaption.space_before_value"
              class="w-[65px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">段后</span>
            <input type="number" min="0" step="0.5" v-model.number="figCaption.space_after_value"
              class="w-[65px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cloud-blue shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">图题 · 缩进与对齐</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">左缩进</span>
            <input type="number" min="0" step="0.1" v-model.number="figCaption.left_indent_value"
              class="w-[65px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <DropdownSelect v-model="figCaption.left_indent_unit" :options="indentUnits" width-class="w-[70px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">右缩进</span>
            <input type="number" min="0" step="0.1" v-model.number="figCaption.right_indent_value"
              class="w-[65px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <DropdownSelect v-model="figCaption.right_indent_unit" :options="indentUnits" width-class="w-[70px]" />
          </div>
          <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">首行缩进</span>
            <input type="number" min="0" step="0.1" v-model.number="figCaption.first_line_indent_chars"
              class="w-[65px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">字符</span>
          </div>
          <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
          <div class="bg-cream-darker rounded-lg p-1 flex items-center relative">
            <div class="absolute top-1 bottom-1 w-8 bg-white rounded-[4px] shadow-sm transition-all duration-300 ease-out pointer-events-none"
              :style="{ left: `${4 + ['LEFT', 'CENTER', 'RIGHT'].indexOf(figCaption.align) * 32}px` }">
            </div>
            <button @click="figCaption.align = 'LEFT'"
              class="relative z-10 w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors duration-200"
              :class="figCaption.align === 'LEFT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignLeft size="16" />
            </button>
            <button @click="figCaption.align = 'CENTER'"
              class="relative z-10 w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors duration-200"
              :class="figCaption.align === 'CENTER' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignCenter size="16" />
            </button>
            <button @click="figCaption.align = 'RIGHT'"
              class="relative z-10 w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors duration-200"
              :class="figCaption.align === 'RIGHT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignRight size="16" />
            </button>
          </div>
          <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
          <div class="flex items-center gap-[3px] cursor-pointer" @click="figCaption.add_space = !figCaption.add_space">
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="figCaption.add_space ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="figCaption.add_space" size="10" class="text-white" />
            </div>
            <span class="text-[12px] text-brown shrink-0">中英文间加空格</span>
          </div>
          <div v-if="figCaption.add_space" class="flex items-center gap-2">
            <span class="text-[13px] text-brown">空格数</span>
            <input type="number" min="1" max="5" v-model.number="figCaption.space_count"
              class="w-[55px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
        </div>
      </div>
    </template>

    <template v-if="activeSubTab === 'tbl'">
      <div class="flex items-center justify-center py-16 text-brown-muted text-[14px]">
        表题设置（待实现）
      </div>
    </template>

    <template v-if="activeSubTab === 'table'">
      <div class="flex items-center justify-center py-16 text-brown-muted text-[14px]">
        表格设置（待实现）
      </div>
    </template>
  </div>
</template>
