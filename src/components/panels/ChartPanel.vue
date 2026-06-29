<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RiCheckLine, RiAlignLeft, RiAlignCenter, RiAlignRight, RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/vue'
import DropdownSelect from '../DropdownSelect.vue'

const props = defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
  activeSubTab: { type: String, default: 'fig' },
})

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'MULTIPLE', label: '多倍行距' },
]
const indentUnits = ['行', '厘米', '字符', '磅'].map(v => ({ value: v === '磅' ? 'pt' : v === '行' ? 'line' : v === '字符' ? 'char' : v === '厘米' ? 'cm' : v, label: v }))
const borderStyles = [
  { value: 'none', label: '无边框' },
  { value: 'single', label: '单线边框' },
  { value: 'double', label: '双线边框' },
  { value: 'thick', label: '粗边框' },
]

// 层级选择器
const activeLevel = ref(0) // 0=图标题样式, 1=表标题样式
const levelBarRef = ref(null)
const indicatorStyle = ref({ left: '4px', width: '80px' })
const levelLabels = ['图标题样式', '表标题样式']

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

// 获取当前层级的参数
const currentParams = () => activeLevel.value === 0 ? props.figCaption : props.tblCaption

// 表格单元格参数
const tocTitleParams = ref({
  enable: false,
  cn_font: '宋体',
  en_font: 'Times New Roman',
  size_cn: '四号',
  line_spacing_value: 20,
  min_line_height: 15,
  align: 'CENTER',
  border_style: 'single',
  auto_width: true,
})
</script>

<template>
  <div v-if="activeSubTab === 'fig'" class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">图表标题</span>
        </div>

        <!-- 层级选择器 -->
        <div ref="levelBarRef" class="bg-cream-darker rounded-lg p-[3px] flex items-center gap-[3px] relative">
          <div class="absolute top-[3px] bottom-[3px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
            :style="indicatorStyle">
          </div>
          <button
            v-for="(label, idx) in levelLabels" :key="idx"
            @click="selectLevel(idx)"
            class="relative z-10 px-[10px] py-[5px] text-[12px] rounded-lg transition-colors duration-200 cursor-pointer"
            :class="activeLevel === idx ? 'text-cinnabar font-semibold' : 'text-brown hover:text-brown-dark'"
          >{{ label }}</button>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <div :key="activeLevel" class="flex flex-col gap-3">
            <!-- 字体设置 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">字体</span>
              <div class="w-full flex flex-col gap-[6px]">
                <div class="flex items-center gap-[6px]">
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">中文</span>
                    <DropdownSelect v-model="currentParams().cn_font" :options="cnFonts" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">英文</span>
                    <DropdownSelect v-model="currentParams().en_font" :options="enFonts" width-class="auto" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[12px] text-brown shrink-0">字号</span>
                    <DropdownSelect v-model="currentParams().size_cn" :options="sizeCN" width-class="auto" />
                  </div>
                </div>
                <div class="flex items-center gap-[6px]">
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="currentParams().bold = !currentParams().bold">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="currentParams().bold ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="currentParams().bold" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">粗体</span>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="currentParams().italic = !currentParams().italic">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="currentParams().italic ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="currentParams().italic" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">斜体</span>
                  </div>
                  <div class="flex items-center gap-[3px] cursor-pointer" @click="currentParams().underline = !currentParams().underline">
                    <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                      :class="currentParams().underline ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                      <RiCheckLine v-if="currentParams().underline" size="10" class="text-white" />
                    </div>
                    <span class="text-[12px] text-brown shrink-0">下划线</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full h-[1px] bg-tan-border"></div>

            <!-- 行距与段落间距 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">行距与段落间距</span>
              <div class="flex flex-wrap items-center gap-[6px]">
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">行距</span>
                  <DropdownSelect v-model="currentParams().line_spacing_mode" :options="lineSpacingModes" width-class="w-[80px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">值</span>
                  <input type="number" min="0" step="0.5" v-model.number="currentParams().line_spacing_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <span class="text-[12px] text-brown shrink-0">磅</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">段前</span>
                  <input type="number" min="0" step="0.5" v-model.number="currentParams().space_before_value"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">段后</span>
                  <input type="number" min="0" step="0.5" v-model.number="currentParams().space_after_value"
                    class="w-[48px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                </div>
              </div>
            </div>

            <div class="w-full h-[1px] bg-tan-border"></div>

            <!-- 缩进 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">缩进</span>
              <div class="flex flex-wrap items-center gap-[6px]">
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">左边距</span>
                  <input type="number" min="0" step="0.1" v-model.number="currentParams().left_indent_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="currentParams().left_indent_unit" :options="indentUnits" width-class="w-[65px]" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">右边距</span>
                  <input type="number" min="0" step="0.1" v-model.number="currentParams().right_indent_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="currentParams().right_indent_unit" :options="indentUnits" width-class="w-[65px]" />
                </div>
              </div>
            </div>

            <div class="w-full h-[1px] bg-tan-border"></div>

            <!-- 对齐 -->
            <div>
              <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">对齐</span>
              <div class="flex flex-wrap items-center gap-[6px]">
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">对齐方式</span>
                  <div class="bg-cream-darker rounded-lg p-[3px] flex items-center relative">
                    <div class="absolute top-[3px] bottom-[3px] w-7 bg-white rounded-[3px] shadow-sm transition-all duration-300 ease-out pointer-events-none"
                      :style="{ left: `${3 + ['LEFT', 'CENTER', 'RIGHT'].indexOf(currentParams().align) * 28}px` }">
                    </div>
                    <button @click="currentParams().align = 'LEFT'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="currentParams().align === 'LEFT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignLeft size="13" />
                    </button>
                    <button @click="currentParams().align = 'CENTER'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="currentParams().align === 'CENTER' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignCenter size="13" />
                    </button>
                    <button @click="currentParams().align = 'RIGHT'"
                      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                      :class="currentParams().align === 'RIGHT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                      <RiAlignRight size="13" />
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-[3px] cursor-pointer" @click="currentParams().add_space = !currentParams().add_space">
                  <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                    :class="currentParams().add_space ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                    <RiCheckLine v-if="currentParams().add_space" size="10" class="text-white" />
                  </div>
                  <span class="text-[12px] text-brown shrink-0">自动化识别图标题后加空格</span>
                </div>
                <div v-if="currentParams().add_space" class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">空格数</span>
                  <input type="number" min="1" max="5" v-model.number="currentParams().space_count"
                    class="w-[45px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 右侧: 表格单元格 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cloud-blue shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">表格单元格</span>
          <div class="flex-1"></div>
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="tocTitleParams.enable = !tocTitleParams.enable">
            <span class="text-[12px] text-brown shrink-0">启用</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="tocTitleParams.enable ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="tocTitleParams.enable" size="10" class="text-white" />
            </div>
          </div>
        </div>

        <div :class="tocTitleParams.enable ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-3">
          <!-- 字体设置 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">字体</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">中文</span>
                <DropdownSelect v-model="tocTitleParams.cn_font" :options="cnFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">英文</span>
                <DropdownSelect v-model="tocTitleParams.en_font" :options="enFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">字号</span>
                <DropdownSelect v-model="tocTitleParams.size_cn" :options="sizeCN" width-class="auto" />
              </div>
            </div>
          </div>

          <div class="w-full h-[1px] bg-tan-border"></div>

          <!-- 行距 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">行距与段落</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">行距数值</span>
                <input type="number" min="0" step="0.5" v-model.number="tocTitleParams.line_spacing_value"
                  class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                <span class="text-[12px] text-brown shrink-0">磅</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">最小行高</span>
                <input type="number" min="0" step="0.5" v-model.number="tocTitleParams.min_line_height"
                  class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                <span class="text-[12px] text-brown shrink-0">磅</span>
              </div>
            </div>
          </div>

          <div class="w-full h-[1px] bg-tan-border"></div>

          <!-- 单元格对齐 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">单元格对齐</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="bg-cream rounded-lg p-[3px] flex items-center relative">
                <div class="absolute top-[3px] bottom-[3px] w-7 bg-white rounded-[3px] shadow-sm transition-all duration-300 ease-out pointer-events-none"
                  :style="{ left: `${3 + ['LEFT', 'CENTER', 'RIGHT'].indexOf(tocTitleParams.align) * 28}px` }">
                </div>
                <button @click="tocTitleParams.align = 'LEFT'"
                  class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                  :class="tocTitleParams.align === 'LEFT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                  <RiAlignLeft size="13" />
                </button>
                <button @click="tocTitleParams.align = 'CENTER'"
                  class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                  :class="tocTitleParams.align === 'CENTER' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                  <RiAlignCenter size="13" />
                </button>
                <button @click="tocTitleParams.align = 'RIGHT'"
                  class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200"
                  :class="tocTitleParams.align === 'RIGHT' ? 'text-cinnabar' : 'text-brown-muted hover:text-brown'">
                  <RiAlignRight size="13" />
                </button>
              </div>
            </div>
          </div>

          <div class="w-full h-[1px] bg-tan-border"></div>

          <!-- 边框样式 & 自动宽度 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">边框样式</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">边框</span>
                <DropdownSelect v-model="tocTitleParams.border_style" :options="borderStyles" width-class="w-[100px]" />
              </div>
              <div class="flex items-center gap-[3px] cursor-pointer" @click="tocTitleParams.auto_width = !tocTitleParams.auto_width">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="tocTitleParams.auto_width ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="tocTitleParams.auto_width" size="10" class="text-white" />
                </div>
                <span class="text-[12px] text-brown shrink-0">表格宽度根据窗口自动调整</span>
              </div>
            </div>
          </div>
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
