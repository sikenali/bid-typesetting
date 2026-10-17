<script setup>
import { ref } from 'vue'
import { RiAlignLeft, RiAlignCenter, RiAlignRight } from '@remixicon/vue'
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

const activeLevel = ref(0)
const levelLabels = ['图标题样式', '表标题样式']

function selectLevel(idx) { activeLevel.value = idx }

const currentParams = () => activeLevel.value === 0 ? props.figCaption : props.tblCaption
</script>

<template>
  <div v-if="activeSubTab === 'fig'" class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">图表设置</div>
        <div class="panel-desc">配置图表样式与位置</div>
      </div>
    </div>

    <div class="two-col">
      <div class="sub-card">
        <div class="sub-title">
          <RiImageLine size="16" />
          <span>图表标题</span>
        </div>

        <LevelBar v-model="activeLevel" :labels="levelLabels" />

        <Transition name="fade-slide" mode="out-in">
          <div :key="activeLevel" class="level-body">
            <div class="level-group">
              <div class="level-subtitle">字体</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">中文字体</span>
                  <DropdownSelect v-model="currentParams().cn_font" :options="cnFonts" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">英文字体</span>
                  <DropdownSelect v-model="currentParams().en_font" :options="enFonts" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">字号</span>
                  <DropdownSelect v-model="currentParams().size_cn" :options="sizeCN" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <div class="toggle-row">
                    <CheckboxToggle v-model="currentParams().bold" label="粗体" />
                    <CheckboxToggle v-model="currentParams().italic" label="斜体" />
                    <CheckboxToggle v-model="currentParams().underline" label="下划线" />
                  </div>
                </div>
              </div>
            </div>

            <div class="level-group">
              <div class="level-subtitle">行距与段落间距</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">行距模式</span>
                  <DropdownSelect v-model="currentParams().line_spacing_mode" :options="lineSpacingModes" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">行距数值</span>
                  <SpacingInput v-model="currentParams().line_spacing_value" unit="磅" step="0.5" aria-label="行距数值" />
                </div>
                <div class="field-cell">
                  <span class="field-label">段前间距</span>
                  <div class="inline-control">
                    <SpacingInput v-model="currentParams().space_before_value" aria-label="段前间距" />
                    <DropdownSelect v-model="currentParams().space_before_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
                <div class="field-cell">
                  <span class="field-label">段后间距</span>
                  <div class="inline-control">
                    <SpacingInput v-model="currentParams().space_after_value" aria-label="段后间距" />
                    <DropdownSelect v-model="currentParams().space_after_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
              </div>
            </div>

            <div class="level-group">
              <div class="level-subtitle">缩进</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">左缩进</span>
                  <div class="inline-control">
                    <SpacingInput v-model="currentParams().left_indent_value" aria-label="左缩进" />
                    <DropdownSelect v-model="currentParams().left_indent_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
                <div class="field-cell">
                  <span class="field-label">右缩进</span>
                  <div class="inline-control">
                    <SpacingInput v-model="currentParams().right_indent_value" aria-label="右缩进" />
                    <DropdownSelect v-model="currentParams().right_indent_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
              </div>
            </div>

            <div class="level-group">
              <div class="level-subtitle">对齐</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">对齐方式</span>
                  <AlignButtonGroup v-model="currentParams().align" :options="[
                    { value: 'LEFT', icon: RiAlignLeft },
                    { value: 'CENTER', icon: RiAlignCenter },
                    { value: 'RIGHT', icon: RiAlignRight },
                  ]" />
                </div>
                <div class="field-cell">
                  <CheckboxToggle v-model="currentParams().add_space" label="自动化识别图标题后加空格" />
                </div>
                <div v-if="currentParams().add_space" class="field-cell">
                  <span class="field-label">空格数</span>
                  <input type="number" min="1" max="5" v-model.number="currentParams().space_count" class="input-box small" aria-label="空格数" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div class="sub-card">
        <div class="sub-title-row">
          <div class="sub-title">
            <RiTableLine size="16" />
            <span>表格单元格</span>
          </div>
          <div class="switch" :class="{ on: props.tableSettings.enable }" @click="props.tableSettings.enable = !props.tableSettings.enable">
            <div class="knob"></div>
          </div>
        </div>

        <div class="level-body" :class="{ disabled: !props.tableSettings.enable }">
          <div class="level-group">
            <div class="level-subtitle">字体</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">中文字体</span>
                <DropdownSelect v-model="props.tableSettings.cn_font" :options="cnFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">英文字体</span>
                <DropdownSelect v-model="props.tableSettings.en_font" :options="enFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">字号</span>
                <DropdownSelect v-model="props.tableSettings.size_cn" :options="sizeCN" width-class="flex-1" compact />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">行距与段落</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">行距数值</span>
                <SpacingInput v-model="props.tableSettings.line_spacing_value" unit="磅" step="0.5" aria-label="行距数值" />
              </div>
              <div class="field-cell">
                <span class="field-label">最小行高</span>
                <SpacingInput v-model="props.tableSettings.min_line_height" unit="磅" step="0.5" aria-label="最小行高" />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">单元格对齐</div>
            <div class="field-row">
              <div class="field-cell">
                <AlignButtonGroup v-model="props.tableSettings.align" :options="[
                  { value: 'LEFT', icon: RiAlignLeft },
                  { value: 'CENTER', icon: RiAlignCenter },
                  { value: 'RIGHT', icon: RiAlignRight },
                ]" />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">边框样式</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">边框</span>
                <DropdownSelect v-model="props.tableSettings.border_style" :options="borderStyles" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <CheckboxToggle v-model="props.tableSettings.auto_width" label="表格宽度根据窗口自动调整" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 24px 28px 28px;
  height: 100%;
  overflow-y: auto;
}
.panel-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.panel-title { font-size: 17px; font-weight: 500; color: var(--color-text-primary); }
.panel-desc { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
.two-col {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}
@media (max-width: 1100px) {
  .two-col { grid-template-columns: 1fr; }
}
.sub-card {
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sub-title-row { display: flex; align-items: center; justify-content: space-between; }
.sub-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.sub-title svg { color: var(--color-primary); }

.switch {
  width: 46px;
  height: 26px;
  border-radius: 9999px;
  padding: 3px;
  background: var(--color-switch-off);
  transition: background var(--transition-base);
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}
.switch.on { background: var(--color-primary); }
.switch .knob {
  width: 21px;
  height: 20px;
  border-radius: 9999px;
  background: #fff;
  transition: transform var(--transition-base);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.switch.on .knob { transform: translateX(20px); }

.level-body { display: flex; flex-direction: column; gap: 20px; }
.level-body.disabled { opacity: 0.55; pointer-events: none; }
.level-group { display: flex; flex-direction: column; gap: 8px; }
.level-subtitle { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.field-row { display: grid; grid-template-columns: 1fr; gap: 12px; }
.field-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
}
.field-label { font-size: 14px; color: var(--color-text-body); flex-shrink: 0; min-width: 64px; }
.toggle-row { display: flex; align-items: center; gap: 16px; }
.inline-control { display: flex; align-items: center; gap: 8px; }
.input-box {
  width: 120px;
  height: 36px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base), background var(--transition-base);
  font-family: var(--font-family);
}
.input-box:focus { border-color: var(--color-primary); background: var(--color-bg-white); }
.input-box.small { width: 120px; }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
