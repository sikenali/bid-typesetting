<script setup>
import { ref } from 'vue'
import { RiCheckLine } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

const props = defineProps({
  params: { type: Object, required: true },
})

const activeLevel = ref(0)

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'MULTIPLE', label: '多倍行距' },
]
const spacingUnits = ['磅', '行'].map(v => ({ value: v, label: v }))
const tabLeaders = [
  { value: 'DOT', label: '点线（......）' },
  { value: 'DASH', label: '虚线（----）' },
  { value: 'UNDERSCORE', label: '下划线（____）' },
  { value: 'NONE', label: '无' },
]

function rgbToString(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

function onColorChange(e, level) {
  const hex = e.target.value
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  level.color_rgb = [r, g, b]
}

function rgbToHex(rgb) {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('')
}
</script>

<template>
  <div class="bg-cream border-b border-tan-border max-h-[calc(100vh-16rem)] overflow-y-auto space-y-5 px-5 py-3">
    <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
      <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
      <div class="flex items-center gap-[8px]">
        <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
        <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录标题</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-[4px] cursor-pointer" @click="params.enable = !params.enable">
          <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
            :class="params.enable ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
            <RiCheckLine v-if="params.enable" size="12" class="text-white" />
          </div>
          <span class="text-[13px] text-brown">启用目录格式化</span>
        </div>
        <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
        <div class="flex items-center gap-2">
          <span class="text-[13px] text-brown shrink-0">标题文字</span>
          <input type="text" v-model="params.title_text"
            class="w-[140px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
        </div>
      </div>
      <template v-if="params.enable">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">中文字体</span>
            <DropdownSelect v-model="params.title_cn_font" :options="cnFonts" width-class="w-[120px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">英文字体</span>
            <DropdownSelect v-model="params.title_en_font" :options="enFonts" width-class="w-[160px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">字号</span>
            <DropdownSelect v-model="params.title_size_cn" :options="sizeCN" width-class="w-[100px]" />
          </div>
        </div>
      </template>
    </div>

    <template v-if="params.enable">
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-5">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录层级样式</span>
        </div>
        <div class="bg-cream-darker rounded-lg p-1 flex items-center gap-1">
          <button v-for="(lbl, idx) in ['第1层','第2层','第3层','第4层']" :key="idx"
            @click="activeLevel = idx"
            class="px-[16px] py-[8px] text-[13px] rounded-lg transition-all duration-200 cursor-pointer"
            :class="activeLevel === idx ? 'bg-white text-cinnabar font-semibold shadow-sm' : 'text-brown hover:text-brown-dark'"
          >{{ lbl }}</button>
        </div>
        <Transition name="fade-slide" mode="out-in">
          <div :key="activeLevel" class="flex flex-col gap-4">
            <div>
              <span class="text-[13px] font-semibold text-brown-muted block mb-[10px]">字体</span>
              <div class="flex items-center gap-3 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown whitespace-nowrap shrink-0">中文字体</span>
                  <DropdownSelect v-model="params.level_styles[activeLevel].cn_font" :options="cnFonts" width-class="w-[100px]" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown whitespace-nowrap shrink-0">英文字体</span>
                  <DropdownSelect v-model="params.level_styles[activeLevel].en_font" :options="enFonts" width-class="w-[160px]" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown whitespace-nowrap shrink-0">字号</span>
                  <DropdownSelect v-model="params.level_styles[activeLevel].size_cn" :options="sizeCN" width-class="w-[90px]" />
                </div>
                <div class="flex items-center gap-[4px] cursor-pointer" @click="params.level_styles[activeLevel].bold = !params.level_styles[activeLevel].bold">
                  <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                    :class="params.level_styles[activeLevel].bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                    <RiCheckLine v-if="params.level_styles[activeLevel].bold" size="12" class="text-white" />
                  </div>
                  <span class="text-[13px] text-brown">粗体</span>
                </div>
                <div class="flex items-center gap-[4px] cursor-pointer" @click="params.level_styles[activeLevel].italic = !params.level_styles[activeLevel].italic">
                  <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                    :class="params.level_styles[activeLevel].italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                    <RiCheckLine v-if="params.level_styles[activeLevel].italic" size="12" class="text-white" />
                  </div>
                  <span class="text-[13px] text-brown">斜体</span>
                </div>
                <div class="flex items-center gap-[4px]">
                  <span class="text-[13px] text-brown">字体颜色</span>
                  <label class="relative cursor-pointer">
                    <div class="w-[25px] h-[24px] rounded-[4px] border border-tan-border cursor-pointer"
                      :style="{ backgroundColor: rgbToString(params.level_styles[activeLevel].color_rgb) }"></div>
                    <input type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      :value="rgbToHex(params.level_styles[activeLevel].color_rgb)"
                      @input="onColorChange($event, params.level_styles[activeLevel])" />
                  </label>
                </div>
              </div>
            </div>
            <div class="w-full h-[1px] bg-tan-border"></div>
            <div>
              <span class="text-[13px] font-semibold text-brown-muted block mb-[10px]">行距与段落间距与缩进</span>
              <div class="flex items-center gap-3 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown whitespace-nowrap shrink-0">行距模式</span>
                  <DropdownSelect v-model="params.level_styles[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="w-[100px]" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown">行距值</span>
                  <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].line_spacing_value"
                    class="w-[60px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <span class="text-[13px] text-brown">磅</span>
                </div>
                <div class="w-[2px] h-[20px] bg-tan-border shrink-0"></div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown">段前</span>
                  <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].space_before_value"
                    class="w-[55px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="params.level_styles[activeLevel].space_before_unit" :options="spacingUnits" width-class="w-[50px]" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown">段后</span>
                  <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].space_after_value"
                    class="w-[55px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="params.level_styles[activeLevel].space_after_unit" :options="spacingUnits" width-class="w-[50px]" />
                </div>
                <div class="w-[2px] h-[20px] bg-tan-border shrink-0"></div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-brown">左缩进</span>
                  <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].left_indent_value"
                    class="w-[55px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <span class="text-[13px] text-brown">字符</span>
                </div>
              </div>
            </div>
            <div class="w-full h-[1px] bg-tan-border"></div>
            <div>
              <span class="text-[13px] font-semibold text-brown-muted block mb-[10px]">前导符</span>
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-brown">前导符样式</span>
                <DropdownSelect v-model="params.level_styles[activeLevel].tab_leader" :options="tabLeaders" width-class="w-[160px]" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
