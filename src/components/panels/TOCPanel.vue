<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RiCheckLine, RiAddLine, RiSubtractLine } from '@remixicon/vue'
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

function addLevel() {
  const last = props.params.level_styles[props.params.level_styles.length - 1]
  props.params.level_styles.push({ ...last, left_indent_value: last.left_indent_value + 1 })
  nextTick(() => {
    selectLevel(props.params.level_styles.length - 1)
  })
}

function removeLevel() {
  if (props.params.level_styles.length > 1) {
    const wasLast = activeLevel.value === props.params.level_styles.length - 1
    props.params.level_styles.pop()
    if (wasLast) {
      activeLevel.value = props.params.level_styles.length - 1
    }
    nextTick(positionIndicator)
  }
}

onMounted(() => { nextTick(positionIndicator) })

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值(磅)' },
  { value: 'MULTIPLE', label: '多倍行距' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'ONE_POINT_FIVE', label: '1.5倍行距' },
  { value: 'DOUBLE', label: '双倍行距' },
]
const spacingUnits = [
  { value: 'line', label: '行' },
  { value: 'cm', label: '厘米' },
  { value: 'char', label: '字符' },
  { value: 'pt', label: '磅' },
]
const tabLeaders = [
  { value: 'DOT', label: '点线' },
  { value: 'MID_DOT', label: '中间点' },
  { value: 'DASH', label: '短横线' },
  { value: 'UNDERSCORE', label: '下划线' },
  { value: 'THICK', label: '粗线' },
  { value: 'NONE', label: '无线条' },
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

function leaderPreview(value) {
  const lines = {
    DOT: '<span style="letter-spacing:1px;font-size:9px;color:#8B7355">- - -</span>',
    MID_DOT: '<span style="letter-spacing:0px;font-size:10px;color:#8B7355">···</span>',
    DASH: '<span style="letter-spacing:0px;font-size:9px;color:#8B7355">--</span>',
    UNDERSCORE: '<span style="letter-spacing:0px;font-size:10px;color:#8B7355">___</span>',
    THICK: '<span style="letter-spacing:0px;font-size:12px;font-weight:700;color:#8B7355">━</span>',
    NONE: '<span style="font-size:9px;color:#8B7355">—</span>',
  }
  return lines[value] || ''
}
</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <!-- 目录标题 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[14px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录标题</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="params.enable = !params.enable">
            <span class="text-[12px] text-brown shrink-0">启用</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="params.enable ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.enable" size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[12px] text-brown shrink-0">标题文字</span>
          <input type="text" v-model="params.title_text"
            class="flex-1 max-w-[240px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
        </div>
        <div :class="params.enable ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-3">
          <div class="w-full h-[1px] bg-tan-border"></div>
          <div class="flex flex-wrap items-center gap-[6px]">
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">中文字体</span>
              <DropdownSelect v-model="params.title_cn_font" :options="cnFonts" width-class="auto" />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">英文字体</span>
              <DropdownSelect v-model="params.title_en_font" :options="enFonts" width-class="auto" />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] text-brown shrink-0">字号</span>
              <DropdownSelect v-model="params.title_size_cn" :options="sizeCN" width-class="auto" />
            </div>
          </div>
        </div>
      </div>

      <!-- 目录层级样式 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
          <div class="flex items-center gap-[8px]">
            <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
            <span class="text-[14px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录层级样式</span>
            <div class="flex-1"></div>
            <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="params.enable_level_styles = !params.enable_level_styles">
              <span class="text-[12px] text-brown shrink-0">启用</span>
              <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                :class="params.enable_level_styles ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                <RiCheckLine v-if="params.enable_level_styles" size="10" class="text-white" />
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click="addLevel"
                class="w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200 text-brown-muted hover:text-cinnabar hover:bg-cream-darker" title="新增层级">
                <RiAddLine size="14" />
              </button>
              <button @click="removeLevel" :disabled="props.params.level_styles.length <= 1"
                class="w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200 text-brown-muted hover:text-cinnabar hover:bg-cream-darker disabled:opacity-30 disabled:cursor-not-allowed" title="删除最末层级">
                <RiSubtractLine size="14" />
              </button>
            </div>
          </div>
          <div :class="params.enable_level_styles ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-3">
            <div ref="levelBarRef" class="bg-cream-darker rounded-lg p-[3px] flex items-center gap-[3px] relative">
            <div class="absolute top-[3px] bottom-[3px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
              :style="indicatorStyle">
            </div>
            <button v-for="(_, idx) in props.params.level_styles" :key="idx"
              @click="selectLevel(idx)"
              class="relative z-10 px-[10px] py-[5px] text-[12px] rounded-lg transition-colors duration-200 cursor-pointer"
              :class="activeLevel === idx ? 'text-cinnabar font-semibold' : 'text-brown hover:text-brown-dark'"
            >第{{ idx + 1 }}层</button>
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
                      <div class="w-[18px] h-[18px] rounded-[3px] border border-tan-border cursor-pointer"
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
              <!-- 行距与段落间距 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">行距与段落间距</span>
                <div class="flex flex-wrap items-center gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">行距模式</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="w-[110px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">行距数值</span>
                    <input type="number" min="0" step="0.1" v-model.number="params.level_styles[activeLevel].line_spacing_value"
                      class="w-[60px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <span class="text-[12px] text-brown-muted shrink-0">磅</span>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-[6px] mt-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段前间距</span>
                    <input type="number" min="0" step="0.1" v-model.number="params.level_styles[activeLevel].space_before_value"
                      class="w-[60px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="params.level_styles[activeLevel].space_before_unit" :options="spacingUnits" width-class="w-[60px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段后间距</span>
                    <input type="number" min="0" step="0.1" v-model.number="params.level_styles[activeLevel].space_after_value"
                      class="w-[60px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="params.level_styles[activeLevel].space_after_unit" :options="spacingUnits" width-class="w-[60px]" />
                  </div>
                </div>
              </div>
              <div class="w-full h-[1px] bg-tan-border"></div>
              <!-- 缩进 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">缩进</span>
                <div class="flex flex-wrap items-center gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">左缩进</span>
                    <input type="number" min="0" step="0.1" v-model.number="params.level_styles[activeLevel].left_indent_value"
                      class="w-[60px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <span class="text-[12px] text-brown-muted shrink-0">字符</span>
                  </div>
                </div>
              </div>
              <div class="w-full h-[1px] bg-tan-border"></div>
              <!-- 前导符 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">前导符</span>
                <div>
                  <span class="text-[12px] text-brown shrink-0 block mb-[6px]">制表样式</span>
                  <div class="flex flex-nowrap gap-[2px] justify-between">
                    <label v-for="tl in tabLeaders" :key="tl.value"
                      class="flex items-center gap-1 px-[4px] py-[2px] rounded-lg border cursor-pointer transition-all flex-1"
                      :class="params.level_styles[activeLevel].tab_leader === tl.value ? 'border-cinnabar bg-cinnabar/5 ring-1 ring-cinnabar/25' : 'border-tan-border bg-white hover:border-brown-muted hover:ring-1 hover:ring-brown-muted/15'"
                      @click="params.level_styles[activeLevel].tab_leader = tl.value">
                      <div class="w-[10px] h-[10px] rounded-full flex items-center justify-center border shrink-0 transition-colors"
                        :class="params.level_styles[activeLevel].tab_leader === tl.value ? 'border-cinnabar' : 'border-tan-border'">
                        <div v-if="params.level_styles[activeLevel].tab_leader === tl.value" class="w-[5px] h-[5px] rounded-full bg-cinnabar transition-all"></div>
                      </div>
                      <div class="w-[20px] overflow-hidden text-center leading-none whitespace-nowrap"
                        v-html="leaderPreview(tl.value)"></div>
                      <span class="text-[8px] text-brown leading-none whitespace-nowrap">{{ tl.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
          </div>
      </div>
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
