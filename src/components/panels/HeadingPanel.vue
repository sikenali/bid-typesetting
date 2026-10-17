<script setup>
import { computed, ref } from 'vue'
import { RiAddLine, RiSubtractLine, RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import AlignButtonGroup from '../ui/AlignButtonGroup.vue'
import CheckboxToggle from '../ui/CheckboxToggle.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import LevelBar from '../ui/LevelBar.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits, numberingSchemes, wrappers } from '../../constants/ui'

const props = defineProps({
  params: { type: Array, required: true },
  patterns: { type: Object, required: true },
})

function addRule() {
  const defaultHeading = {
    cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '五号',
    color: '#000000', bold: false, italic: false, underline: false,
    line_spacing_mode: 'SINGLE', line_spacing_value: 28,
    space_before_value: 6, space_before_unit: 'pt',
    space_after_value: 3, space_after_unit: 'pt',
    left_indent_value: 0, left_indent_unit: 'char',
    right_indent_value: 0, right_indent_unit: 'char',
    first_line_indent_chars: 0, align: 'LEFT',
    add_space: false, space_count: 0,
  }
  props.patterns.rules.push({ enabled: false, scheme: 'ARABIC', wrapper: 'DOT', multi_depth: 1, custom_example: '' })
  props.params.push(defaultHeading)
  activeLevel.value = props.params.length - 1
}

function removeRule() {
  if (props.patterns.rules.length > 1) {
    props.patterns.rules.pop()
    props.params.pop()
    if (activeLevel.value >= props.params.length) {
      activeLevel.value = props.params.length - 1
    }
  }
}

const schemeChars = {
  NONE: '', ARABIC: '1', ZH_NUM: '一', ALPHA_UPPER: 'A', ALPHA_LOWER: 'a', ROMAN_UPPER: 'I', ROMAN_LOWER: 'i',
}

function getPreview(rule) {
  const n = schemeChars[rule.scheme] || '1'
  switch (rule.wrapper) {
    case 'NONE': return n
    case 'DOT': return n + '.'
    case 'DOUBLE_PAREN': return '(' + n + ')'
    case 'SINGLE_PAREN': return n + ')'
    case 'DUNHAO': return n + '、'
    case 'DOUBLE_BRACKET': return '[' + n + ']'
    case 'SINGLE_BRACKET': return n + ']'
    case 'DOUBLE_ANGLE': return '<' + n + '>'
    case 'SINGLE_ANGLE': return n + '>'
    case 'CN_BRACKET': return '【' + n + '】'
    default: return n
  }
}

const activeLevel = ref(0)

function selectLevel(idx) { activeLevel.value = idx }

const cnLevelNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const levelLabels = computed(() =>
  props.params.map((_, i) => (cnLevelNames[i] || `${i + 1}`) + '级标题')
)
</script>

<template>
  <div class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">标题设置</div>
        <div class="panel-desc">设置各级标题样式</div>
      </div>
    </div>

    <div class="two-col">
      <div class="sub-card">
        <div class="sub-title-row">
          <div class="sub-title">
            <RiBookOpenLine size="16" />
            <span>标题规则</span>
          </div>
          <div class="sub-actions">
            <button class="icon-btn" @click="addRule" title="新增">
              <RiAddLine size="16" />
            </button>
            <button class="icon-btn" @click="removeRule" :disabled="props.patterns.rules.length <= 1" title="删除最末项">
              <RiSubtractLine size="16" />
            </button>
          </div>
        </div>

        <div class="rules-table-wrap">
          <table class="rules-table">
            <thead>
              <tr>
                <th class="col-w-48">自定义</th>
                <th class="col-w-64">标题级别</th>
                <th>标题编号</th>
                <th class="col-w-88">标题后缀符号</th>
                <th class="col-w-64">标题预览</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule, ri) in props.patterns.rules" :key="ri">
                <td>
                  <div class="switch" :class="{ on: rule.enabled }" @click="rule.enabled = !rule.enabled">
                    <div class="knob"></div>
                  </div>
                </td>
                <td class="text-strong">{{ (cnLevelNames[ri] || `${ri + 1}`) + '级标题' }}</td>
                <td>
                  <input v-if="rule.enabled" type="text" v-model="rule.custom_example" class="input-box small" placeholder="输入自定义标题" />
                  <DropdownSelect v-else v-model="rule.scheme" :options="numberingSchemes" width-class="flex-1" compact />
                </td>
                <template v-if="!rule.enabled">
                  <td>
                    <DropdownSelect v-model="rule.wrapper" :options="wrappers" width-class="flex-1" compact />
                  </td>
                  <td class="preview-cell">{{ getPreview(rule) }}</td>
                </template>
                <template v-else>
                  <td></td>
                  <td></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="sub-card">
        <div class="sub-title">
          <RiListOrdered size="16" />
          <span>标题级别</span>
        </div>
        <LevelBar v-model="activeLevel" :labels="levelLabels" />

        <Transition name="fade-slide" mode="out-in">
          <div :key="activeLevel" class="level-body">
            <div class="level-group">
              <div class="level-subtitle">字体</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">中文字体</span>
                  <DropdownSelect v-model="props.params[activeLevel].cn_font" :options="cnFonts" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">英文字体</span>
                  <DropdownSelect v-model="props.params[activeLevel].en_font" :options="enFonts" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">字号</span>
                  <DropdownSelect v-model="props.params[activeLevel].size_cn" :options="sizeCN" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">颜色</span>
                  <label class="color-box">
                    <span class="color-swatch" :style="{ backgroundColor: props.params[activeLevel].color || '#000000' }"></span>
                    <span class="color-value">{{ props.params[activeLevel].color || '#000000' }}</span>
                    <input type="color" v-model="props.params[activeLevel].color" class="color-input" aria-label="选择颜色" />
                  </label>
                </div>
                <div class="field-cell">
                  <div class="toggle-row">
                    <CheckboxToggle v-model="props.params[activeLevel].bold" label="粗体" />
                    <CheckboxToggle v-model="props.params[activeLevel].italic" label="斜体" />
                    <CheckboxToggle v-model="props.params[activeLevel].underline" label="下划线" />
                  </div>
                </div>
              </div>
            </div>

            <div class="level-group">
              <div class="level-subtitle">行距与段落间距</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">行距模式</span>
                  <DropdownSelect v-model="props.params[activeLevel].line_spacing_mode" :options="lineSpacingModes" width-class="flex-1" compact />
                </div>
                <div class="field-cell">
                  <span class="field-label">行距数值</span>
                  <SpacingInput v-model="props.params[activeLevel].line_spacing_value" unit="磅" step="0.5" aria-label="行距数值" />
                </div>
                <div class="field-cell">
                  <span class="field-label">段前间距</span>
                  <div class="inline-control">
                    <SpacingInput v-model="props.params[activeLevel].space_before_value" aria-label="段前间距" />
                    <DropdownSelect v-model="props.params[activeLevel].space_before_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
                <div class="field-cell">
                  <span class="field-label">段后间距</span>
                  <div class="inline-control">
                    <SpacingInput v-model="props.params[activeLevel].space_after_value" aria-label="段后间距" />
                    <DropdownSelect v-model="props.params[activeLevel].space_after_unit" :options="spacingUnits" width-class="auto" compact />
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
                    <SpacingInput v-model="props.params[activeLevel].left_indent_value" aria-label="左缩进" />
                    <DropdownSelect v-model="props.params[activeLevel].left_indent_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
                <div class="field-cell">
                  <span class="field-label">右缩进</span>
                  <div class="inline-control">
                    <SpacingInput v-model="props.params[activeLevel].right_indent_value" aria-label="右缩进" />
                    <DropdownSelect v-model="props.params[activeLevel].right_indent_unit" :options="spacingUnits" width-class="auto" compact />
                  </div>
                </div>
                <div class="field-cell">
                  <span class="field-label">首行缩进</span>
                  <SpacingInput v-model="props.params[activeLevel].first_line_indent_chars" unit="字符" aria-label="首行缩进" />
                </div>
              </div>
            </div>

            <div class="level-group">
              <div class="level-subtitle">对齐</div>
              <div class="field-row">
                <div class="field-cell">
                  <span class="field-label">对齐方式</span>
                  <AlignButtonGroup v-model="props.params[activeLevel].align" :options="[
                    { value: 'LEFT', icon: RiAlignLeft },
                    { value: 'CENTER', icon: RiAlignCenter },
                    { value: 'RIGHT', icon: RiAlignRight },
                    { value: 'JUSTIFY', icon: RiAlignJustify },
                  ]" />
                </div>
                <div class="field-cell">
                  <CheckboxToggle v-model="props.params[activeLevel].add_space" label="标题编号后添加空格" />
                </div>
                <div v-if="props.params[activeLevel].add_space" class="field-cell">
                  <span class="field-label">空格数</span>
                  <input type="number" min="1" max="5" v-model.number="props.params[activeLevel].space_count" class="input-box small" aria-label="空格数" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
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

.rules-table-wrap { overflow-x: auto; }
.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rules-table thead th {
  text-align: left;
  padding: 10px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  border-bottom: 0.7px solid var(--color-border-soft);
}
.rules-table tbody td {
  padding: 10px 8px;
  border-bottom: 0.7px solid var(--color-border-soft);
  vertical-align: middle;
  color: var(--color-text-body);
}
.col-w-48 { width: 48px; }
.col-w-64 { width: 64px; }
.col-w-88 { width: 88px; }
.text-strong { font-weight: 500; color: var(--color-text-primary); white-space: nowrap; }
.preview-cell { color: var(--color-primary); font-weight: 500; text-align: center; }

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

.input-box {
  width: 100%;
  min-width: 0;
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

.level-body { display: flex; flex-direction: column; gap: 20px; }
.level-group { display: flex; flex-direction: column; gap: 8px; }
.level-subtitle {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.field-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.field-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
}
.field-label {
  font-size: 14px;
  color: var(--color-text-body);
  flex-shrink: 0;
  min-width: 64px;
}
.toggle-row { display: flex; align-items: center; gap: 16px; }
.inline-control { display: flex; align-items: center; gap: 8px; }

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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
