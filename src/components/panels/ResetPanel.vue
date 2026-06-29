<script setup>
import { RiCheckLine } from '@remixicon/vue'

const props = defineProps({
  textCleanup: { type: Object, required: true },
  styleCleanup: { type: Object, required: true },
  objectStructure: { type: Object, required: true },
  captionDetection: { type: Object, required: true },
})

function toggle(obj, key) {
  obj[key] = !obj[key]
}

const styleFields = [
  { key: 'clear_all_styles', label: '符号清理' },
  { key: 'clear_paragraph_indent', label: '清除段落缩进' },
  { key: 'clear_align_grid', label: '清除对齐网格' },
  { key: 'clean_after_formatting', label: '格式化后清理残留样式' },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
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

      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">符号清理</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div v-for="f in styleFields" :key="f.key"
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
    </div>
  </div>
</template>
