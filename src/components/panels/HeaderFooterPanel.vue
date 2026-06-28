<script setup>
import { RiCheckLine } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

defineProps({
  params: { type: Object, required: true },
})

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const alignOptions = [
  { value: 'LEFT', label: '左对齐' },
  { value: 'CENTER', label: '居中' },
  { value: 'RIGHT', label: '右对齐' },
]
const underlineTypes = [
  { value: 'none', label: '无' },
  { value: 'single', label: '单线' },
  { value: 'double', label: '双线' },
  { value: 'thick', label: '粗线' },
  { value: 'dotted', label: '点线' },
  { value: 'dash', label: '虚线' },
]
const pageNumberTypes = [
  { value: 'standard', label: '1, 2, 3, ...' },
  { value: 'roman', label: 'I, II, III, ...' },
  { value: 'simple', label: '第X页' },
  { value: 'total', label: '第X页/共Y页' },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border max-h-[calc(100vh-16rem)] overflow-y-auto space-y-5 px-5 py-3">
    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">页眉</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-[4px] cursor-pointer" @click="params.enable_header = !params.enable_header">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="params.enable_header ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="params.enable_header" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">启用页眉格式化</span>
        </div>
        <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
        <span class="text-[13px] text-brown shrink-0">页眉文字</span>
        <input type="text" v-model="params.header_text"
          class="w-[200px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
      </div>
      <template v-if="params.enable_header">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">中文字体</span>
            <DropdownSelect v-model="params.header_cn_font" :options="cnFonts" width-class="w-[110px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">英文字体</span>
            <DropdownSelect v-model="params.header_en_font" :options="enFonts" width-class="w-[180px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">字号</span>
            <DropdownSelect v-model="params.header_size_cn" :options="sizeCN" width-class="w-[100px]" />
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.header_bold = !params.header_bold">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.header_bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.header_bold" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown">粗体</span>
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.header_italic = !params.header_italic">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.header_italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.header_italic" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown">斜体</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">对齐方式</span>
            <DropdownSelect v-model="params.header_align" :options="alignOptions" width-class="w-[100px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">下划线类型</span>
            <DropdownSelect v-model="params.header_underline_type" :options="underlineTypes" width-class="w-[100px]" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[13px] text-brown">页眉顶端距离</span>
          <input type="number" v-model.number="params.header_top_cm" min="0" step="0.1"
            class="w-[72px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          <span class="text-[13px] text-brown">毫米</span>
        </div>
      </template>
    </div>

    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">页脚</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-[4px] cursor-pointer" @click="params.enable_footer = !params.enable_footer">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="params.enable_footer ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="params.enable_footer" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">启用页脚格式化</span>
        </div>
        <div class="flex items-center gap-[4px] cursor-pointer" @click="params.clear_footer = !params.clear_footer">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="params.clear_footer ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="params.clear_footer" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">清除原页脚页码</span>
        </div>
        <div class="flex items-center gap-[4px] cursor-pointer" @click="params.page_number_from_body = !params.page_number_from_body">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="params.page_number_from_body ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="params.page_number_from_body" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">页码从正文开始</span>
        </div>
      </div>
      <template v-if="params.enable_footer">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">中文字体</span>
            <DropdownSelect v-model="params.footer_cn_font" :options="cnFonts" width-class="w-[110px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">英文字体</span>
            <DropdownSelect v-model="params.footer_en_font" :options="enFonts" width-class="w-[180px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">字号</span>
            <DropdownSelect v-model="params.footer_size_cn" :options="sizeCN" width-class="w-[100px]" />
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.footer_bold = !params.footer_bold">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.footer_bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.footer_bold" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown">粗体</span>
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.footer_italic = !params.footer_italic">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.footer_italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.footer_italic" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown">斜体</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">对齐方式</span>
            <DropdownSelect v-model="params.footer_align" :options="alignOptions" width-class="w-[100px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">号码类型</span>
            <DropdownSelect v-model="params.footer_page_number_type" :options="pageNumberTypes" width-class="w-[140px]" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[13px] text-brown">页脚底端距离</span>
          <input type="number" v-model.number="params.footer_bottom_cm" min="0" step="0.1"
            class="w-[72px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
          <span class="text-[13px] text-brown">毫米</span>
        </div>
      </template>
    </div>
  </div>
</template>
