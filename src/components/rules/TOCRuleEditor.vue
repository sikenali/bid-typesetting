<script setup>
import { cnFonts, sizeCN } from '../../constants/ui'
import SelectField from '../ui/SelectField.vue'
import InputField from '../ui/InputField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  params: { type: Object, required: true },
})

const activeLevel = ref(0)
</script>

<template>
  <div class="space-y-4">
    <InputField v-model="params.title_text" label="目录标题文字" />
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <SelectField v-model="params.title_cn_font" label="目录标题中文字体" :options="cnFonts" />
      <SelectField v-model="params.title_en_font" label="目录标题英文字体" :options="[{ value: 'Times New Roman', label: 'Times New Roman' }, { value: 'Arial', label: 'Arial' }]" />
      <SelectField v-model="params.title_size_cn" label="目录标题字号" :options="sizeCN" />
    </div>

    <div class="border-t border-tan-border pt-3">
      <div class="flex gap-1 mb-2 flex-wrap">
        <button v-for="n in (params.level_styles?.length || 4)" :key="n" @click="activeLevel = n - 1" class="px-2 py-1 rounded text-[11px]"
          :class="activeLevel === n - 1 ? 'bg-jade-light text-white' : 'bg-white border border-tan-border text-brown'">
          层级{{ n }}
        </button>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2" v-if="params.level_styles?.[activeLevel]">
        <SelectField v-model="params.level_styles[activeLevel].cn_font" label="中文字体" :options="cnFonts" />
        <SelectField v-model="params.level_styles[activeLevel].size_cn" label="字号" :options="sizeCN" />
        <InputField v-model="params.level_styles[activeLevel].left_indent_value" label="左缩进" unit="字符" :min="0" />
        <CheckboxField v-model="params.level_styles[activeLevel].bold" label="加粗" />
      </div>
    </div>
  </div>
</template>
