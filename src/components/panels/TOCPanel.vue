<script setup>
import { ref, computed, watch } from 'vue'
import { RiCheckLine, RiAddLine, RiSubtractLine } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import LevelBar from '../ui/LevelBar.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits, tabLeaders } from '../../constants/ui'

// 防止循环更新
let isUpdating = false

const props = defineProps({
  params: { type: Object, required: true },
})

const emit = defineEmits(['update:params'])

const activeLevel = ref(0)

const levelLabels = computed(() =>
  props.params.level_styles.map((_, idx) => `第${idx + 1}层`)
)

watch(() => props.params.enable, (val) => {
  if (isUpdating) return
  isUpdating = true
  if (props.params.enable_level_styles !== val) {
    props.params.enable_level_styles = val
  }
  isUpdating = false
}, { immediate: true })

function selectLevel(idx) {
  activeLevel.value = idx
}

function addLevel() {
  const last = props.params.level_styles[props.params.level_styles.length - 1]
  props.params.level_styles.push({ ...last, left_indent_value: last.left_indent_value + 1 })
  selectLevel(props.params.level_styles.length - 1)
}

function removeLevel() {
  if (props.params.level_styles.length > 1) {
    const wasLast = activeLevel.value === props.params.level_styles.length - 1
    props.params.level_styles.pop()
    if (wasLast) {
      activeLevel.value = props.params.level_styles.length - 1
    }
  }
}

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
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录标题</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="params.enable = !params.enable">
            <span class="text-[12px] text-brown shrink-0">启用</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="params.enable ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.enable" size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto flex flex-col gap-3">
          <div class="flex items-center gap-1">
            <span class="text-[12px] text-brown shrink-0">标题文字</span>
            <input type="text" v-model="params.title_text" :disabled="!params.enable"
              class="flex-1 max-w-[240px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors disabled:opacity-60 disabled:cursor-not-allowed" />
          </div>
          <div :class="params.enable ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-3">
            <div class="w-full h-[1px] bg-tan-border"></div>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">中文字体</span>
                <DropdownSelect v-model="params.title_cn_font" :options="cnFonts" width-class="auto" :disabled="!params.enable" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">英文字体</span>
                <DropdownSelect v-model="params.title_en_font" :options="enFonts" width-class="auto" :disabled="!params.enable" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">字号</span>
                <DropdownSelect v-model="params.title_size_cn" :options="sizeCN" width-class="auto" :disabled="!params.enable" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 目录层级样式 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">目录层级样式</span>
          <div class="flex-1"></div>
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
        <div class="flex-1 overflow-y-auto flex flex-col gap-3">
          <LevelBar v-model="activeLevel" :labels="levelLabels" />
        </div>
        <div :class="params.enable_level_styles ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-3">
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
                    <DropdownSelect v-model="params.level_styles[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">行距数值</span>
                    <SpacingInput v-model="params.level_styles[activeLevel].line_spacing_value" unit="磅" width="w-[60px]" />
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-[6px] mt-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段前间距</span>
                    <input type="number" min="0" step="0.1" v-model.number="params.level_styles[activeLevel].space_before_value"
                      class="w-[60px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="params.level_styles[activeLevel].space_before_unit" :options="spacingUnits" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">段后间距</span>
                    <input type="number" min="0" step="0.1" v-model.number="params.level_styles[activeLevel].space_after_value"
                      class="w-[60px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                    <DropdownSelect v-model="params.level_styles[activeLevel].space_after_unit" :options="spacingUnits" width-class="auto" />
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
                    <SpacingInput v-model="params.level_styles[activeLevel].left_indent_value" unit="字符" width="w-[60px]" />
                  </div>
                </div>
              </div>
              <div class="w-full h-[1px] bg-tan-border"></div>
              <!-- 前导符 -->
              <div>
                <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">前导符</span>
                <div>
                  <span class="text-[12px] text-brown shrink-0 block mb-[6px]">制表样式</span>
                  <div class="flex flex-nowrap gap-[4px] justify-between">
                    <label v-for="tl in tabLeaders" :key="tl.value"
                      class="flex items-center gap-1 px-[8px] py-[4px] min-h-[35px] rounded-lg border cursor-pointer transition-all flex-1"
                      :class="params.level_styles[activeLevel].tab_leader === tl.value ? 'border-cinnabar bg-cinnabar/5 ring-1 ring-cinnabar/25' : 'border-tan-border bg-white hover:border-brown-muted hover:ring-1 hover:ring-brown-muted/15'"
                      @click="params.level_styles[activeLevel].tab_leader = tl.value">
                      <div class="w-[14px] h-[14px] rounded-full flex items-center justify-center border shrink-0 transition-colors"
                        :class="params.level_styles[activeLevel].tab_leader === tl.value ? 'border-cinnabar' : 'border-tan-border'">
                        <div v-if="params.level_styles[activeLevel].tab_leader === tl.value" class="w-[6px] h-[6px] rounded-full bg-cinnabar transition-all"></div>
                      </div>
                      <div class="w-[24px] overflow-hidden text-center leading-none whitespace-nowrap"
                        v-html="leaderPreview(tl.value)"></div>
                      <span class="text-[10px] text-brown leading-none whitespace-nowrap">{{ tl.label }}</span>
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
