<script setup>
import { RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify } from '@remixicon/vue'
import CheckboxToggle from '../ui/CheckboxToggle.vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import AlignButtonGroup from '../ui/AlignButtonGroup.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits } from '../../constants/ui'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">字体</span>
        </div>
        <div class="h-2"></div>
        <div class="grid grid-cols-2 gap-2">
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
          <div class="flex items-center gap-3">
            <CheckboxToggle v-model="params.bold" label="粗体" />
            <CheckboxToggle v-model="params.italic" label="斜体" />
            <CheckboxToggle v-model="params.underline" label="下划线" />
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">行距与段落间距</span>
        </div>
        <div class="h-2"></div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距模式</span>
          <DropdownSelect v-model="params.line_spacing_mode" :options="lineSpacingModes" width-class="auto" />
          <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距数值</span>
          <SpacingInput v-model="params.line_spacing_value" unit="磅" :width="'w-[70px]'" />
        </div>
        <div class="w-full h-[1px] bg-tan-border"></div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">段前间距</span>
            <SpacingInput v-model="params.space_before_value" :width="'w-[70px]'" />
            <DropdownSelect v-model="params.space_before_unit" :options="spacingUnits" width-class="auto" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">段后间距</span>
            <SpacingInput v-model="params.space_after_value" :width="'w-[70px]'" />
            <DropdownSelect v-model="params.space_after_unit" :options="spacingUnits" width-class="auto" />
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cloud-blue"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">缩进</span>
        </div>
        <div class="h-2"></div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">左缩进</span>
            <SpacingInput v-model="params.left_indent_value" :width="'w-full'" />
            <DropdownSelect v-model="params.left_indent_unit" :options="spacingUnits" width-class="auto" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">右缩进</span>
            <SpacingInput v-model="params.right_indent_value" :width="'w-full'" />
            <DropdownSelect v-model="params.right_indent_unit" :options="spacingUnits" width-class="auto" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">首行缩进</span>
            <SpacingInput v-model="params.first_line_indent_chars" unit="字符" :width="'w-full'" />
          </div>
        </div>
      </div>

      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-jade-light"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">对齐与空格</span>
        </div>
        <div class="h-2"></div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13px] text-brown whitespace-nowrap shrink-0">对齐方式</span>
          <AlignButtonGroup v-model="params.align" :options="[
            { value: 'LEFT', icon: RiAlignLeft },
            { value: 'CENTER', icon: RiAlignCenter },
            { value: 'RIGHT', icon: RiAlignRight },
            { value: 'JUSTIFY', icon: RiAlignJustify },
          ]" />
          <CheckboxToggle v-model="params.add_space" label="中英文间加空格" />
          <div v-if="params.add_space" class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">空格数量</span>
            <input type="number" min="1" max="5" v-model.number="params.space_count"
              class="w-[70px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="空格数量" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
