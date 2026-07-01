<script setup>
import { ref } from 'vue'
import { RiCheckLine, RiAlignLeft, RiAlignCenter, RiAlignRight } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import AlignButtonGroup from '../ui/AlignButtonGroup.vue'
import CheckboxToggle from '../ui/CheckboxToggle.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import LevelBar from '../ui/LevelBar.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits } from '../../constants/ui'

const props = defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
  tableSettings: { type: Object, required: true },
  activeSubTab: { type: String, default: 'fig' },
})

const borderStyles = [
  { value: 'none', label: '无边框' },
  { value: 'single', label: '单线边框' },
  { value: 'double', label: '双线边框' },
  { value: 'thick', label: '粗边框' },
]

// 层级选择器
const activeLevel = ref(0) // 0=图标题样式, 1=表标题样式
const levelLabels = ['图标题样式', '表标题样式']

function selectLevel(idx) {
  activeLevel.value = idx
}

// 获取当前层级的参数
const currentParams = () => activeLevel.value === 0 ? props.figCaption : props.tblCaption
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

        <LevelBar v-model="activeLevel" :labels="levelLabels" />

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
                  <CheckboxToggle v-model="currentParams().bold" label="粗体" />
                  <CheckboxToggle v-model="currentParams().italic" label="斜体" />
                  <CheckboxToggle v-model="currentParams().underline" label="下划线" />
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
                  <DropdownSelect v-model="currentParams().line_spacing_mode" :options="lineSpacingModes" width-class="auto" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">值</span>
                  <SpacingInput v-model="currentParams().line_spacing_value" unit="磅" step="0.5" width="w-[50px]" />
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
                  <DropdownSelect v-model="currentParams().left_indent_unit" :options="spacingUnits" width-class="auto" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[12px] text-brown shrink-0">右边距</span>
                  <input type="number" min="0" step="0.1" v-model.number="currentParams().right_indent_value"
                    class="w-[50px] bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors" />
                  <DropdownSelect v-model="currentParams().right_indent_unit" :options="spacingUnits" width-class="auto" />
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
                  <AlignButtonGroup v-model="currentParams().align" :options="[
                    { value: 'LEFT', icon: RiAlignLeft },
                    { value: 'CENTER', icon: RiAlignCenter },
                    { value: 'RIGHT', icon: RiAlignRight },
                  ]" />
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
          <div class="flex items-center gap-[3px] cursor-pointer shrink-0" @click="props.tableSettings.enable = !props.tableSettings.enable">
            <span class="text-[12px] text-brown shrink-0">启用</span>
            <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
              :class="props.tableSettings.enable ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="props.tableSettings.enable" size="10" class="text-white" />
            </div>
          </div>
        </div>

        <div :class="props.tableSettings.enable ? '' : 'pointer-events-none opacity-60'" class="flex flex-col gap-3">
          <!-- 字体设置 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">字体</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">中文</span>
                <DropdownSelect v-model="props.tableSettings.cn_font" :options="cnFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">英文</span>
                <DropdownSelect v-model="props.tableSettings.en_font" :options="enFonts" width-class="auto" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">字号</span>
                <DropdownSelect v-model="props.tableSettings.size_cn" :options="sizeCN" width-class="auto" />
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
                <SpacingInput v-model="props.tableSettings.line_spacing_value" unit="磅" step="0.5" width="w-[50px]" />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">最小行高</span>
                <SpacingInput v-model="props.tableSettings.min_line_height" unit="磅" step="0.5" width="w-[50px]" />
              </div>
            </div>
          </div>

          <div class="w-full h-[1px] bg-tan-border"></div>

          <!-- 单元格对齐 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">单元格对齐</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <AlignButtonGroup v-model="props.tableSettings.align" :options="[
                { value: 'LEFT', icon: RiAlignLeft },
                { value: 'CENTER', icon: RiAlignCenter },
                { value: 'RIGHT', icon: RiAlignRight },
              ]" />
            </div>
          </div>

          <div class="w-full h-[1px] bg-tan-border"></div>

          <!-- 边框样式 & 自动宽度 -->
          <div>
            <span class="text-[12px] font-semibold text-brown-muted block mb-[6px]">边框样式</span>
            <div class="flex flex-wrap items-center gap-[6px]">
              <div class="flex items-center gap-1">
                <span class="text-[12px] text-brown shrink-0">边框</span>
                <DropdownSelect v-model="props.tableSettings.border_style" :options="borderStyles" width-class="auto" />
              </div>
              <div class="flex items-center gap-[3px] cursor-pointer" @click="props.tableSettings.auto_width = !props.tableSettings.auto_width">
                <div class="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center transition-colors shrink-0"
                  :class="props.tableSettings.auto_width ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
                  <RiCheckLine v-if="props.tableSettings.auto_width" size="10" class="text-white" />
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
