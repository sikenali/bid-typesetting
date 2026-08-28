<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
  tableSettings: { type: Object, required: true },
  activeSubTab: { type: String, default: 'fig' },
})

const emit = defineEmits(['update:activeSubTab'])
const activeSubTab = ref(props.activeSubTab)

watch(() => props.activeSubTab, (val) => { activeSubTab.value = val })

function switchTab(tab) {
  activeSubTab.value = tab
  emit('update:activeSubTab', tab)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-1 border-b border-tan-border pb-2">
      <button @click="switchTab('fig')" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='fig' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">图题</button>
      <button @click="switchTab('tbl')" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='tbl' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">表题</button>
      <button @click="switchTab('table')" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='table' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">表格</button>
    </div>

    <template v-if="activeSubTab === 'fig' && figCaption">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="figCaption.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="figCaption.size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="figCaption.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="figCaption.bold" label="加粗" />
          <CheckboxField v-model="figCaption.italic" label="斜体" />
          <CheckboxField v-model="figCaption.underline" label="下划线" />
        </div>
      </div>
    </template>

    <template v-if="activeSubTab === 'tbl' && tblCaption">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="tblCaption.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="tblCaption.size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="tblCaption.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="tblCaption.bold" label="加粗" />
          <CheckboxField v-model="tblCaption.italic" label="斜体" />
          <CheckboxField v-model="tblCaption.underline" label="下划线" />
        </div>
      </div>
    </template>

    <template v-if="activeSubTab === 'table'">
      <div class="space-y-3">
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="table.enable" label="启用表格格式" />
          <CheckboxField v-model="table.autofit" label="自动调整列宽" />
          <CheckboxField v-model="table.enable_cell_formatting" label="启用单元格格式" />
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="table.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="table.en_font" label="英文字体" :options="enFonts" />
          <SelectField v-model="table.size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="table.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
          <InputField v-model="table.line_spacing_value" label="行距值" :unit="table.line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="table.align" label="对齐方式" :options="[
            { value: 'LEFT', label: '左对齐' },
            { value: 'CENTER', label: '居中对齐' },
            { value: 'RIGHT', label: '右对齐' },
            { value: 'JUSTIFY', label: '两端对齐' },
          ]" />
          <SelectField v-model="table.cell_align" label="单元格对齐" :options="[
            { value: 'LEFT', label: '左对齐' },
            { value: 'CENTER', label: '居中' },
            { value: 'RIGHT', label: '右对齐' },
          ]" />
          <InputField v-model="table.min_row_height_pt" label="最小行高" unit="磅" :min="0" :step="1" />
          <InputField v-model="table.style_type" label="表格样式" />
        </div>
      </div>
    </template>

    <div class="border-t border-tan-border pt-3 mt-2">
      <h4 class="text-[12px] font-semibold text-brown-dark mb-2">表格单元格设置</h4>
      <div class="space-y-3">
        <CheckboxField v-model="tableSettings.enable" label="启用单元格格式" />
        <template v-if="tableSettings.enable">
          <div class="grid grid-cols-2 gap-x-6 gap-y-2">
            <SelectField v-model="tableSettings.cn_font" label="中文字体" :options="cnFonts" />
            <SelectField v-model="tableSettings.en_font" label="英文字体" :options="enFonts" />
            <SelectField v-model="tableSettings.size_cn" label="字号" :options="sizeCN" />
            <InputField v-model="tableSettings.line_spacing_value" label="行距值" unit="磅" :min="0" :step="0.1" />
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2">
            <SelectField v-model="tableSettings.align" label="对齐方式" :options="[
              { value: 'LEFT', label: '左对齐' },
              { value: 'CENTER', label: '居中对齐' },
              { value: 'RIGHT', label: '右对齐' },
            ]" />
            <InputField v-model="tableSettings.border_style" label="边框样式" />
            <CheckboxField v-model="tableSettings.auto_width" label="自动宽度" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
