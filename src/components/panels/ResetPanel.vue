<script setup>
import { ref, computed } from 'vue'
import { RiCheckLine, RiInformationLine } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'

const props = defineProps({
  textCleanup: { type: Object, required: true },
  styleCleanup: { type: Object, required: true },
  objectStructure: { type: Object, required: true },
  captionDetection: { type: Object, required: true },
})

function toggle(obj, key) {
  obj[key] = !obj[key]
}

const styleKeys = ['clear_extra_spaces', 'clear_paragraph_indent', 'clear_heading_indent', 'remove_extra_blank_lines', 'clear_chart_format']
const textKeys = ['soft_enter_to_hard', 'tab_to_spaces_enabled', 'clear_superscript', 'punctuation_clean', 'markdown_tags_to_plaintext']

const styleAllSelected = computed(() => styleKeys.every(k => props.styleCleanup[k]))
const textAllSelected = computed(() => textKeys.every(k => props.textCleanup[k]))

function toggleStyleAll() {
  const val = !styleAllSelected.value
  styleKeys.forEach(k => { props.styleCleanup[k] = val })
}
function toggleTextAll() {
  const val = !textAllSelected.value
  textKeys.forEach(k => { props.textCleanup[k] = val })
}

const tabSpaceOptions = [
  { value: 1, label: '1 个' },
  { value: 2, label: '2 个' },
  { value: 4, label: '4 个' },
  { value: 'none', label: '不处理' },
  { value: 'delete', label: '删除处理' },
  { value: 'enter', label: '回车换行' },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">样式清理</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="toggleStyleAll()">
            <span class="text-[12px] text-brown shrink-0">全选</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="styleAllSelected ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="styleAllSelected" size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(styleCleanup, 'clear_extra_spaces')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="styleCleanup.clear_extra_spaces ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="styleCleanup.clear_extra_spaces" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">清理多余空格</span>
            </div>
            <div class="relative group/tip">
              <div class="w-[22px] h-[22px] rounded-full bg-cream-darker border border-tan-border flex items-center justify-center">
                <RiInformationLine size="12" class="text-brown-muted" />
              </div>
              <div class="absolute right-0 bottom-full mb-2 hidden group-hover/tip:block bg-brown-dark text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-10">
                保留英文单词之间的空格
                <div class="absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-brown-dark"></div>
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(styleCleanup, 'clear_paragraph_indent')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="styleCleanup.clear_paragraph_indent ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="styleCleanup.clear_paragraph_indent" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">清理正文缩进</span>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="py-[10px]">
            <div class="flex items-center justify-between cursor-pointer group" @click="toggle(styleCleanup, 'clear_heading_indent')">
              <div class="flex items-center gap-[6px]">
                <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                  :class="styleCleanup.clear_heading_indent ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="styleCleanup.clear_heading_indent" size="12" class="text-white" />
                </div>
                <span class="text-[13px] text-brown">清理标题缩进</span>
              </div>
            </div>
            <div v-if="styleCleanup.clear_heading_indent" class="flex items-center gap-5 pl-7 mt-1.5">
              <div class="flex items-center gap-[6px] cursor-pointer" @click="toggle(styleCleanup, 'clear_heading_left_indent')">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="styleCleanup.clear_heading_left_indent ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="styleCleanup.clear_heading_left_indent" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown">左缩进</span>
              </div>
              <div class="flex items-center gap-[6px] cursor-pointer" @click="toggle(styleCleanup, 'clear_heading_right_indent')">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="styleCleanup.clear_heading_right_indent ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="styleCleanup.clear_heading_right_indent" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown">右缩进</span>
              </div>
              <div class="flex items-center gap-[6px] cursor-pointer" @click="toggle(styleCleanup, 'clear_heading_special_indent')">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="styleCleanup.clear_heading_special_indent ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="styleCleanup.clear_heading_special_indent" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown">特殊缩进</span>
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(styleCleanup, 'remove_extra_blank_lines')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="styleCleanup.remove_extra_blank_lines ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="styleCleanup.remove_extra_blank_lines" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">清理所有空行</span>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(styleCleanup, 'clear_chart_format')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="styleCleanup.clear_chart_format ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="styleCleanup.clear_chart_format" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">清理图表格式</span>
            </div>
            <div class="relative group/tip">
              <div class="w-[22px] h-[22px] rounded-full bg-cream-darker border border-tan-border flex items-center justify-center">
                <RiInformationLine size="12" class="text-brown-muted" />
              </div>
              <div class="absolute right-0 bottom-full mb-2 hidden group-hover/tip:block bg-brown-dark text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-10">
                将浮动布局的图表格式清理后转成嵌入式布局格式
                <div class="absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-brown-dark"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">符号清理</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="toggleTextAll()">
            <span class="text-[12px] text-brown shrink-0">全选</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="textAllSelected ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="textAllSelected" size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(textCleanup, 'soft_enter_to_hard')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="textCleanup.soft_enter_to_hard ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="textCleanup.soft_enter_to_hard" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">↓符号转换回车</span>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]">
            <div class="flex items-center gap-[6px] flex-1" @click="toggle(textCleanup, 'tab_to_spaces_enabled')">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="textCleanup.tab_to_spaces_enabled ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="textCleanup.tab_to_spaces_enabled" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">→符号转换空格</span>
            </div>
            <div @click.stop><DropdownSelect v-if="textCleanup.tab_to_spaces_enabled" v-model="textCleanup.tab_to_spaces" :options="tabSpaceOptions" width-class="auto" compact /></div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(textCleanup, 'clear_superscript')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="textCleanup.clear_superscript ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="textCleanup.clear_superscript" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">上标数学单位自动设置</span>
            </div>
            <div class="relative group/tip">
              <div class="w-[22px] h-[22px] rounded-full bg-cream-darker border border-tan-border flex items-center justify-center">
                <RiInformationLine size="12" class="text-brown-muted" />
              </div>
              <div class="absolute right-0 bottom-full mb-2 hidden group-hover/tip:block bg-brown-dark text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-10">
                常用的数学单位 m²、m³、mm²
                <div class="absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-brown-dark"></div>
              </div>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(textCleanup, 'punctuation_clean')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="textCleanup.punctuation_clean ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="textCleanup.punctuation_clean" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">英文标点符号自动转换成中文</span>
            </div>
          </div>
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex items-center justify-between cursor-pointer group py-[10px]" @click="toggle(textCleanup, 'markdown_tags_to_plaintext')">
            <div class="flex items-center gap-[6px]">
              <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                :class="textCleanup.markdown_tags_to_plaintext ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="textCleanup.markdown_tags_to_plaintext" size="12" class="text-white" />
              </div>
              <span class="text-[13px] text-brown">标签符转换纯文本</span>
            </div>
            <div class="relative group/tip">
              <div class="w-[22px] h-[22px] rounded-full bg-cream-darker border border-tan-border flex items-center justify-center">
                <RiInformationLine size="12" class="text-brown-muted" />
              </div>
              <div class="absolute right-0 bottom-full mb-2 hidden group-hover/tip:block bg-brown-dark text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-10">
                Markdown文件中的 # &gt; 等
                <div class="absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-brown-dark"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
