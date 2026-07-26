<script setup>
import { cnFonts, enFonts, sizeCN } from '../../constants/ui'
import SelectField from '../ui/SelectField.vue'
import InputField from '../ui/InputField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2 p-3 bg-cream-dark rounded-lg border border-tan-border">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[12px] font-semibold text-brown-dark">页眉设置</span>
        <CheckboxField v-model="params.enable_header" :label="''" />
      </div>
      <template v-if="params.enable_header">
        <InputField v-model="params.header_text" label="页眉文本" />
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="params.header_cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="params.header_size_cn" label="字号" :options="sizeCN" />
        </div>
        <InputField v-model="params.header_top_cm" label="页眉距离顶部" unit="厘米" :min="0" :step="0.01" />
      </template>
    </div>

    <div class="space-y-2 p-3 bg-cream-dark rounded-lg border border-tan-border">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[12px] font-semibold text-brown-dark">页脚设置</span>
        <CheckboxField v-model="params.enable_footer" :label="''" />
      </div>
      <template v-if="params.enable_footer">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="params.footer_cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="params.footer_size_cn" label="字号" :options="sizeCN" />
        </div>
        <InputField v-model="params.footer_bottom_cm" label="页脚距离底部" unit="厘米" :min="0" :step="0.01" />
      </template>
    </div>
  </div>
</template>
