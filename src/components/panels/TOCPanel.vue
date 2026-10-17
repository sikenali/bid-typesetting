<script setup>
import { computed, ref, watch } from 'vue'
import { RiAddLine, RiSubtractLine } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import LevelBar from '../ui/LevelBar.vue'
import CheckboxToggle from '../ui/CheckboxToggle.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits, tabLeaders } from '../../constants/ui'

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

function selectLevel(idx) { activeLevel.value = idx }

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

function rgbToString(rgb) { return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` }

function onColorChange(e, level) {
  const hex = e.target.value
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  level.color_rgb = [r, g, b]
}

function rgbToHex(rgb) { return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('') }

function leaderPreview(value) {
  const color = 'var(--color-text-muted)'
  const lines = {
    DOT: `<span style="letter-spacing:1px;font-size:9px;color:${color}">- - -</span>`,
    MID_DOT: `<span style="letter-spacing:0px;font-size:10px;color:${color}">···</span>`,
    DASH: `<span style="letter-spacing:0px;font-size:9px;color:${color}">--</span>`,
    UNDERSCORE: `<span style="letter-spacing:0px;font-size:10px;color:${color}">___</span>`,
    THICK: `<span style="letter-spacing:0px;font-size:12px;font-weight:700;color:${color}">━</span>`,
    NONE: `<span style="font-size:9px;color:${color}">—</span>`,
  }
  return lines[value] || ''
}
</script>

<template>
  <div class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">目录设置</div>
        <div class="panel-desc">设置目录层级与格式</div>
      </div>
    </div>

    <div class="two-col">
      <div class="sub-card">
        <div class="sub-title-row">
          <div class="group-title">
            <RiFileTextLine size="16" />
            <span>目录标题</span>
          </div>
          <div class="switch" :class="{ on: params.enable }" @click="params.enable = !params.enable">
            <div class="knob"></div>
          </div>
        </div>

        <div class="level-body" :class="{ disabled: !params.enable }">
          <div class="level-group">
            <div class="level-subtitle">标题文字</div>
            <div class="field-row">
              <div class="field-cell">
                <input type="text" v-model="params.title_text" class="text-input" aria-label="标题文字" />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">字体</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">中文字体</span>
                <DropdownSelect v-model="params.title_cn_font" :options="cnFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">英文字体</span>
                <DropdownSelect v-model="params.title_en_font" :options="enFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">字号</span>
                <DropdownSelect v-model="params.title_size_cn" :options="sizeCN" width-class="flex-1" compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sub-card">
        <div class="sub-title-row">
          <div class="group-title">
            <RiListUnordered size="16" />
            <span>目录层级样式</span>
          </div>
          <div class="sub-actions">
            <button class="icon-btn" @click="addLevel" title="新增层级">
              <RiAddLine size="16" />
            </button>
            <button class="icon-btn" @click="removeLevel" :disabled="props.params.level_styles.length <= 1" title="删除最末层级">
              <RiSubtractLine size="16" />
            </button>
          </div>
        </div>

        <LevelBar v-model="activeLevel" :labels="levelLabels" />

        <div class="level-body" :class="{ disabled: !params.enable_level_styles }">
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeLevel">
              <div class="level-group">
                <div class="level-subtitle">字体</div>
                <div class="field-row">
                  <div class="field-cell">
                    <span class="field-label">中文字体</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].cn_font" :options="cnFonts" width-class="flex-1" compact />
                  </div>
                  <div class="field-cell">
                    <span class="field-label">英文字体</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].en_font" :options="enFonts" width-class="flex-1" compact />
                  </div>
                  <div class="field-cell">
                    <span class="field-label">字号</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].size_cn" :options="sizeCN" width-class="flex-1" compact />
                  </div>
                  <div class="field-cell">
                    <span class="field-label">颜色</span>
                    <label class="color-box">
                      <span class="color-swatch" :style="{ backgroundColor: rgbToString(params.level_styles[activeLevel].color_rgb) }"></span>
                      <span class="color-value">{{ rgbToHex(params.level_styles[activeLevel].color_rgb) }}</span>
                      <input type="color" class="color-input" :value="rgbToHex(params.level_styles[activeLevel].color_rgb)" @input="onColorChange($event, params.level_styles[activeLevel])" aria-label="选择颜色" />
                    </label>
                  </div>
                  <div class="field-cell">
                    <div class="toggle-row">
                      <CheckboxToggle v-model="params.level_styles[activeLevel].bold" label="粗体" />
                      <CheckboxToggle v-model="params.level_styles[activeLevel].italic" label="斜体" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="level-group">
                <div class="level-subtitle">行距与段落间距</div>
                <div class="field-row">
                  <div class="field-cell">
                    <span class="field-label">行距模式</span>
                    <DropdownSelect v-model="params.level_styles[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="flex-1" compact />
                  </div>
                  <div class="field-cell">
                    <span class="field-label">行距数值</span>
                    <SpacingInput v-model="params.level_styles[activeLevel].line_spacing_value" unit="磅" aria-label="行距数值" />
                  </div>
                  <div class="field-cell">
                    <span class="field-label">段前间距</span>
                    <div class="inline-control">
                      <SpacingInput v-model="params.level_styles[activeLevel].space_before_value" aria-label="段前间距" />
                      <DropdownSelect v-model="params.level_styles[activeLevel].space_before_unit" :options="spacingUnits" width-class="auto" compact />
                    </div>
                  </div>
                  <div class="field-cell">
                    <span class="field-label">段后间距</span>
                    <div class="inline-control">
                      <SpacingInput v-model="params.level_styles[activeLevel].space_after_value" aria-label="段后间距" />
                      <DropdownSelect v-model="params.level_styles[activeLevel].space_after_unit" :options="spacingUnits" width-class="auto" compact />
                    </div>
                  </div>
                </div>
              </div>

              <div class="level-group">
                <div class="level-subtitle">缩进</div>
                <div class="field-row">
                  <div class="field-cell">
                    <span class="field-label">左缩进</span>
                    <SpacingInput v-model="params.level_styles[activeLevel].left_indent_value" unit="字符" aria-label="左缩进" />
                  </div>
                </div>
              </div>

              <div class="level-group">
                <div class="level-subtitle">前导符</div>
                <div class="leader-list">
                  <button
                    v-for="tl in tabLeaders"
                    :key="tl.value"
                    class="leader-item"
                    :class="{ active: params.level_styles[activeLevel].tab_leader === tl.value }"
                    @click="params.level_styles[activeLevel].tab_leader = tl.value"
                  >
                    <span class="leader-preview" v-html="leaderPreview(tl.value)"></span>
                    <span class="leader-label">{{ tl.label }}</span>
                  </button>
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
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
  gap: 14px;
}
.sub-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 0.7px solid var(--color-border-soft);
}
.group-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.group-title svg { color: var(--color-primary); }
.sub-actions { display: flex; gap: 4px; }
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  cursor: pointer;
  transition: all var(--transition-base);
}
.icon-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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

.level-body { display: flex; flex-direction: column; gap: 18px; }
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

.text-input {
  width: 100%;
  height: 44px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 15px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base), background var(--transition-base);
  font-family: var(--font-family);
}
.text-input:focus { border-color: var(--color-primary); background: var(--color-bg-white); }

.color-box {
  width: 180px;
  height: 36px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
  transition: border-color var(--transition-base);
}
.color-box:hover { border-color: var(--color-border-hover); }
.color-swatch {
  width: 21px;
  height: 20px;
  border-radius: 5px;
  box-shadow: inset 0 0 0 0.7px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}
.color-value {
  font-size: 13px;
  color: var(--color-text-primary);
  font-family: var(--font-family);
}
.color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.leader-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.leader-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 6px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-base);
}
.leader-item:hover { border-color: var(--color-border-hover); }
.leader-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}
.leader-preview { display: inline-flex; align-items: center; justify-content: center; height: 18px; }
.leader-label { font-size: 12px; color: var(--color-text-body); }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
