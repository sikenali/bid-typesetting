<script setup>
import { RiCheckLine } from '@remixicon/vue'

const props = defineProps({
  textCleanup: { type: Object, required: true },
  styleCleanup: { type: Object, required: true },
  objectStructure: { type: Object, required: true },
  captionDetection: { type: Object, required: true },
  globalSwitches: { type: Object, required: true },
})

function toggle(obj, key) {
  obj[key] = !obj[key]
}

const textFields = [
  { key: 'add_space_between_cn_en', label: '中英文间加空格' },
  { key: 'punctuation_clean', label: '标点清理' },
  { key: 'clear_superscript', label: '清除上标' },
  { key: 'soft_enter_to_hard', label: '软回车转硬回车' },
  { key: 'remove_extra_blank_lines', label: '删除多余空行' },
]

const styleFields = [
  { key: 'clear_all_styles', label: '清除所有样式' },
  { key: 'clear_paragraph_indent', label: '清除段落缩进' },
  { key: 'clear_align_grid', label: '清除对齐网格' },
  { key: 'clean_after_formatting', label: '格式化后清理残留样式' },
]

const objectFields = [
  { key: 'object_wrapping', label: '对象环绕方式' },
  { key: 'collapse_sdt_tags', label: '折叠SDT标签' },
]

const globalRow1 = [
  { key: 'apply_page', label: '应用页面设置' },
  { key: 'apply_body', label: '应用正文格式' },
  { key: 'apply_headings', label: '应用标题格式' },
  { key: 'apply_figtbl', label: '应用图题表题格式' },
]

const globalRow2 = [
  { key: 'apply_toc', label: '应用目录格式' },
  { key: 'apply_header_footer', label: '应用页眉页脚格式' },
  { key: 'auto_refresh_fields', label: '自动刷新域代码' },
  { key: 'close_word_after_refresh', label: '刷新后关闭Word' },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full space-y-5 px-5 py-3">
    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">文本清理</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div v-for="f in textFields" :key="f.key"
          class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(textCleanup, f.key)">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="textCleanup[f.key] ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="textCleanup[f.key]" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown whitespace-nowrap">{{ f.label }}</span>
        </div>
      </div>
    </div>

    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-gold shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">样式清理</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div v-for="f in styleFields" :key="f.key"
          class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(styleCleanup, f.key)">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="styleCleanup[f.key] ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="styleCleanup[f.key]" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown whitespace-nowrap">{{ f.label }}</span>
        </div>
      </div>
    </div>

    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-cloud-blue shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">对象与结构处理</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div v-for="f in objectFields" :key="f.key"
          class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(objectStructure, f.key)">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="objectStructure[f.key] ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="objectStructure[f.key]" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown whitespace-nowrap">{{ f.label }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[13px] text-brown">制表符模式</span>
        <input type="text" v-model="objectStructure.tab_stop_mode"
          class="w-[64px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
      </div>
    </div>

    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-jade shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">图题/表题检测</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(captionDetection, 'fig_detection_enabled')">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="captionDetection.fig_detection_enabled ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="captionDetection.fig_detection_enabled" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">图题检测</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[13px] text-brown">图题检测间距</span>
          <input type="number" v-model.number="captionDetection.fig_detection_spacing"
            class="w-[64px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
        </div>
        <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
        <div class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(captionDetection, 'tbl_detection_enabled')">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="captionDetection.tbl_detection_enabled ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="captionDetection.tbl_detection_enabled" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">表题检测</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[13px] text-brown">表题检测间距</span>
          <input type="number" v-model.number="captionDetection.tbl_detection_spacing"
            class="w-[64px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
        </div>
      </div>
    </div>

    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">全局应用开关</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div v-for="f in globalRow1" :key="f.key"
          class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(globalSwitches, f.key)">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="globalSwitches[f.key] ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="globalSwitches[f.key]" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown whitespace-nowrap">{{ f.label }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div v-for="f in globalRow2" :key="f.key"
          class="flex items-center gap-[4px] cursor-pointer"
          @click="toggle(globalSwitches, f.key)">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="globalSwitches[f.key] ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="globalSwitches[f.key]" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown whitespace-nowrap">{{ f.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
