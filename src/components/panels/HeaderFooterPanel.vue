<script setup>
import { RiCheckLine } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import { cnFonts, enFonts, sizeCN, spacingUnits } from '../../constants/ui'

defineProps({
  params: { type: Object, required: true },
})

const alignOptions = [
  { value: 'LEFT', label: '左对齐' },
  { value: 'CENTER', label: '居中' },
  { value: 'RIGHT', label: '右对齐' },
]
const headerUnderlineTypes = [
  { value: 'none', label: '无' },
  { value: 'single', label: '默认下划线' },
  { value: 'thick', label: '加粗下划线' },
  { value: 'double', label: '双下划线' },
  { value: 'word', label: '上细下粗双线' },
]
const pageNumberTypes = [
  { value: 'standard', label: '1, 2, 3, ...' },
  { value: 'dash', label: '-1-, -2-, ...' },
  { value: 'simple', label: '第1页' },
  { value: 'total', label: '第1页/共n页' },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <!-- 页眉 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">页眉</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="params.enable_header = !params.enable_header">
            <span class="text-[12px] text-brown shrink-0">启用</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="params.enable_header ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.enable_header" size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div :class="params.enable_header ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-2">
          <div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">页眉标题</span>
              <input type="text" v-model="params.header_text" placeholder="墨墨梧文-智能化排版工具"
                class="w-[200px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors placeholder:text-brown-muted/50" />
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">中文字体</span>
                <DropdownSelect v-model="params.header_cn_font" :options="cnFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">英文字体</span>
                <DropdownSelect v-model="params.header_en_font" :options="enFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">字号</span>
                <DropdownSelect v-model="params.header_size_cn" :options="sizeCN" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">对齐</span>
                <DropdownSelect v-model="params.header_align" :options="alignOptions" width-class="auto" />
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-[3px] cursor-pointer" @click="params.header_bold = !params.header_bold">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="params.header_bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="params.header_bold" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">粗体</span>
              </div>
              <div class="flex items-center gap-[3px] cursor-pointer" @click="params.header_italic = !params.header_italic">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="params.header_italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="params.header_italic" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">斜体</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">下划线</span>
                <DropdownSelect v-model="params.header_underline_type" :options="headerUnderlineTypes" width-class="auto" compact />
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div>
                <div class="flex items-center gap-[6px]">
                  <span class="text-[12px] text-brown shrink-0">页眉距离</span>
                  <input type="number" min="0" step="0.5" v-model.number="params.header_distance"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="页眉距离" />
                  <DropdownSelect v-model="params.header_distance_unit" :options="spacingUnits" width-class="auto" />
                </div>
              </div>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">页脚</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="params.enable_footer = !params.enable_footer">
            <span class="text-[12px] text-brown shrink-0">启用</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="params.enable_footer ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.enable_footer" size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div :class="params.enable_footer ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-2">
          <div>
            <div class="flex items-center gap-[6px] flex-wrap">
              <div class="flex items-center gap-[3px] cursor-pointer" @click="params.clear_footer = !params.clear_footer">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="params.clear_footer ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="params.clear_footer" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">清除页码后插入</span>
              </div>
              <div class="w-[1px] h-[16px] bg-tan-border shrink-0"></div>
              <div class="flex items-center gap-[3px] cursor-pointer" @click="params.page_number_from_body = !params.page_number_from_body">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="params.page_number_from_body ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="params.page_number_from_body" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">从正文开始</span>
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">中文字体</span>
                <DropdownSelect v-model="params.footer_cn_font" :options="cnFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">英文字体</span>
                <DropdownSelect v-model="params.footer_en_font" :options="enFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">字号</span>
                <DropdownSelect v-model="params.footer_size_cn" :options="sizeCN" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">对齐</span>
                <DropdownSelect v-model="params.footer_align" :options="alignOptions" width-class="auto" />
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-[3px] cursor-pointer" @click="params.footer_bold = !params.footer_bold">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="params.footer_bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="params.footer_bold" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">粗体</span>
              </div>
              <div class="flex items-center gap-[3px] cursor-pointer" @click="params.footer_italic = !params.footer_italic">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="params.footer_italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="params.footer_italic" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">斜体</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">页码类型</span>
                <DropdownSelect v-model="params.footer_page_number_type" :options="pageNumberTypes" width-class="auto" compact />
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div>
            <div class="flex items-center gap-[6px]">
              <span class="text-[12px] text-brown shrink-0">页脚距离</span>
              <input type="number" min="0" step="0.5" v-model.number="params.footer_distance"
                class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="页脚距离" />
              <DropdownSelect v-model="params.footer_distance_unit" :options="spacingUnits" width-class="auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
