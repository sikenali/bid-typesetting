<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RiCheckLine } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

const props = defineProps({
  params: { type: Object, required: true },
})

const activeLevel = ref(0)
const levelBarRef = ref(null)
const indicatorStyle = ref({ left: '4px', width: '56px' })

function positionIndicator() {
  const bar = levelBarRef.value
  if (!bar) return
  const btns = bar.querySelectorAll('button')
  const btn = btns[activeLevel.value]
  if (!btn) return
  const barRect = bar.getBoundingClientRect()
  const btnRect = btn.getBoundingClientRect()
  indicatorStyle.value = {
    left: `${btnRect.left - barRect.left}px`,
    width: `${btnRect.width}px`,
  }
}

function selectLevel(idx) {
  activeLevel.value = idx
  nextTick(positionIndicator)
}

onMounted(() => { nextTick(positionIndicator) })

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
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-4">
      <!-- 目录标题 -->
      <div class="flex-1 bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-full h-[5px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[6px]">
          <div class="w-[4px] h-[16px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[14px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录标题</span>
        </div>
        <div class="flex items-center gap-[6px] flex-wrap">
          <div class="flex items-center gap-[3px] cursor-pointer" @click="params.enable = !params.enable">
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="params.enable ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.enable" size="10" class="text-white" />
            </div>
            <span class="text-[12px] text-brown shrink-0">启用</span>
          </div>
          <div class="w-[1px] h-[16px] bg-tan-border shrink-0"></div>
          <div class="flex items-center gap-1">
            <span class="text-[12px] text-brown shrink-0">标题文字</span>
            <input type="text" v-model="params.title_text"
              class="w-[120px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
          </div>
        </div>
        <template v-if="params.enable">
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex flex-wrap items-center gap-[6px]">
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">中文</span>
              <DropdownSelect v-model="params.title_cn_font" :options="cnFonts" width-class="auto" />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">英文</span>
              <DropdownSelect v-model="params.title_en_font" :options="enFonts" width-class="auto" />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">字号</span>
              <DropdownSelect v-model="params.title_size_cn" :options="sizeCN" width-class="auto" />
            </div>
          </div>
        </template>
      </div>

      <!-- 目录层级样式 -->
      <template v-if="params.enable">
        <div class="flex-1 bg-cream-dark border border-tan-border rounded-2xl p-5 flex flex-col gap-3">
          <div class="w-full h-[5px] bg-tan-dark rounded-sm shrink-0"></div>
          <div class="flex items-center gap-[6px]">
            <div class="w-[4px] h-[16px] rounded-[2px] bg-gold-dark shrink-0"></div>
            <span class="text-[14px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录层级样式</span>
          </div>
          <div ref="levelBarRef" class="bg-cream-darker rounded-lg p-[3px] flex items-center gap-[3px] relative">
            <div class="absolute top-[3px] bottom-[3px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
              :style="indicatorStyle">
            </div>
            <button v-for="(lbl, idx) in ['第1层','第2层','第3层','第4层']" :key="idx"
              @click="selectLevel(idx)"
              class="relative z-10 px-[10px] py-[5px] text-[12px] rounded-lg transition-colors duration-200 cursor-pointer"
              :class="activeLevel === idx ? 'text-cinnabar font-semibold' : 'text-brown hover:text-brown-dark'"
            >{{ lbl }}</button>
          </div>
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeLevel" class="flex flex-col gap-3">
              <!-- 字体 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">字体</span>
                <div class="flex flex-wrap items-center gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">中文</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].cn_font" :options="cnFonts" width-class="auto" />
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-[12px] text-brown shrink-0">英文</span>
                      <DropdownSelect v-model="params.level_styles[activeLevel].en_font" :options="enFonts" width-class="auto" />
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-[12px] text-brown shrink-0">字号</span>
                      <DropdownSelect v-model="params.level_styles[activeLevel].size_cn" :options="sizeCN" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">颜色</span>
                    <label class="relative cursor-pointer">
                      <div class="w-[22px] h-[22px] rounded-[3px] border border-tan-border cursor-pointer"
                        :style="{ backgroundColor: rgbToString(params.level_styles[activeLevel].color_rgb) }"></div>
                      <input type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        :value="rgbToHex(params.level_styles[activeLevel].color_rgb)"
                        @input="onColorChange($event, params.level_styles[activeLevel])" />
                    </label>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="params.level_styles[activeLevel].bold = !params.level_styles[activeLevel].bold">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="params.level_styles[activeLevel].bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="params.level_styles[activeLevel].bold" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">粗体</span>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="params.level_styles[activeLevel].italic = !params.level_styles[activeLevel].italic">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="params.level_styles[activeLevel].italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="params.level_styles[activeLevel].italic" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">斜体</span>
                  </div>
                </div>
              </div>
              <div class="w-full h-[1px] bg-tan-border"></div>
              <!-- 行距与段落间距与缩进 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">行距与段落间距与缩进</span>
                <div class="flex flex-wrap items-center gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">行距</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="w-[80px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">值</span>
                    <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].line_spacing_value"
                      class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <span class="text-[12px] text-brown shrink-0">磅</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段前</span>
                    <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].space_before_value"
                      class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="params.level_styles[activeLevel].space_before_unit" :options="spacingUnits" width-class="w-[50px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段后</span>
                    <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].space_after_value"
                      class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="params.level_styles[activeLevel].space_after_unit" :options="spacingUnits" width-class="w-[50px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">左缩进</span>
                    <input type="number" step="0.1" v-model.number="params.level_styles[activeLevel].left_indent_value"
                      class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <span class="text-[12px] text-brown shrink-0">字符</span>
                  </div>
                </div>
              </div>
              <div class="w-full h-[1px] bg-tan-border"></div>
              <!-- 前导符 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">前导符</span>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">样式</span>
                  <DropdownSelect v-model="params.level_styles[activeLevel].tab_leader" :options="tabLeaders" width-class="w-[110px]" />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </div>
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
