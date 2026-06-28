<script setup>
import { RiCheckLine, RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

defineProps({
  params: { type: Object, required: true },
})

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'MULTIPLE', label: '多倍行距' },
  { value: 'AT_LEAST', label: '最小值' },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border max-h-[calc(100vh-16rem)] overflow-y-auto px-5 py-3">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-2">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">字体</span>
        </div>
        <div class="h-2"></div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">中文字体</span>
            <DropdownSelect v-model="params.cn_font" :options="cnFonts" width-class="flex-1" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">英文字体</span>
            <DropdownSelect v-model="params.en_font" :options="enFonts" width-class="flex-1" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">字号</span>
            <DropdownSelect v-model="params.size_cn" :options="sizeCN" width-class="flex-1" />
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-[4px] cursor-pointer" @click="params.bold = !params.bold">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="params.bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="params.bold" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">粗体</span>
            </div>
            <div class="flex items-center gap-[4px] cursor-pointer" @click="params.italic = !params.italic">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="params.italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="params.italic" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">斜体</span>
            </div>
            <div class="flex items-center gap-[4px] cursor-pointer" @click="params.underline = !params.underline">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="params.underline ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="params.underline" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">下划线</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-2">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">行距与段落间距</span>
        </div>
        <div class="h-2"></div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距模式</span>
          <DropdownSelect v-model="params.line_spacing_mode" :options="lineSpacingModes" width-class="w-[130px]" />
          <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距值</span>
          <input type="number" step="0.1" v-model.number="params.line_spacing_value"
            class="w-[70px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          <span class="text-[12px] text-brown-muted whitespace-nowrap">磅</span>
        </div>
        <div class="w-full h-[1px] bg-tan-border"></div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">段前间距</span>
            <input type="number" step="0.1" v-model.number="params.space_before_value"
              class="w-[70px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">段后间距</span>
            <input type="number" step="0.1" v-model.number="params.space_after_value"
              class="w-[70px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-2">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cloud-blue"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">缩进</span>
        </div>
        <div class="h-2"></div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">左缩进</span>
            <input type="number" step="0.1" v-model.number="params.left_indent_value"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[12px] text-brown-muted whitespace-nowrap">字符</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">右缩进</span>
            <input type="number" step="0.1" v-model.number="params.right_indent_value"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[12px] text-brown-muted whitespace-nowrap">字符</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">首行缩进</span>
            <input type="number" step="0.1" v-model.number="params.first_line_indent_chars"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[12px] text-brown-muted whitespace-nowrap">字符</span>
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-2">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-jade-light"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">对齐与空格</span>
        </div>
        <div class="h-2"></div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13px] text-brown whitespace-nowrap shrink-0">对齐方式</span>
          <div class="bg-cream-darker rounded-lg p-1 flex">
            <button @click="params.align = 'LEFT'"
              class="w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors"
              :class="params.align === 'LEFT' ? 'bg-white text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignLeft size="16" />
            </button>
            <button @click="params.align = 'CENTER'"
              class="w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors"
              :class="params.align === 'CENTER' ? 'bg-white text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignCenter size="16" />
            </button>
            <button @click="params.align = 'RIGHT'"
              class="w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors"
              :class="params.align === 'RIGHT' ? 'bg-white text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignRight size="16" />
            </button>
            <button @click="params.align = 'JUSTIFY'"
              class="w-8 h-7 rounded-[4px] flex items-center justify-center transition-colors"
              :class="params.align === 'JUSTIFY' ? 'bg-white text-cinnabar' : 'text-brown-muted hover:text-brown'">
              <RiAlignJustify size="16" />
            </button>
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.add_space = !params.add_space">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.add_space ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.add_space" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown">中英文间加空格</span>
          </div>
          <div v-if="params.add_space" class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">空格数量</span>
            <input type="number" min="1" max="5" v-model.number="params.space_count"
              class="w-[70px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
