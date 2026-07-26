<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
  tableSettings: { type: Object, required: true },
})

const activeSubTab = ref('fig')
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-1 border-b border-tan-border pb-2">
      <button @click="activeSubTab='fig'" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='fig' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">图题</button>
      <button @click="activeSubTab='tbl'" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='tbl' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">表题</button>
      <button @click="activeSubTab='table'" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
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
        <CheckboxField v-model="table.enable" label="启用表格格式" />
        <CheckboxField v-model="table.enable_cell_formatting" label="启用单元格格式" />
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="table.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="table.size_cn" label="字号" :options="sizeCN" />
        </div>
      </div>
    </template>
  </div>
</template>
