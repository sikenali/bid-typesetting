<script setup>
import { RiAlignLeft, RiAlignCenter, RiAlignRight, RiAlignJustify } from '@remixicon/vue'
import CheckboxToggle from '../ui/CheckboxToggle.vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import SpacingInput from '../ui/SpacingInput.vue'
import AlignButtonGroup from '../ui/AlignButtonGroup.vue'
import { cnFonts, enFonts, sizeCN, lineSpacingModes, spacingUnits } from '../../constants/ui'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">正文设置</div>
        <div class="panel-desc">配置正文字体、段落、缩进与对齐方式</div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiFontFamilyLine size="16" />
        <span>字体</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">中文字体</span>
          <DropdownSelect v-model="params.cn_font" :options="cnFonts" width-class="flex-1" />
        </div>
        <div class="field-cell">
          <span class="field-label">英文字体</span>
          <DropdownSelect v-model="params.en_font" :options="enFonts" width-class="flex-1" />
        </div>
        <div class="field-cell">
          <span class="field-label">字号</span>
          <DropdownSelect v-model="params.size_cn" :options="sizeCN" width-class="flex-1" />
        </div>
        <div class="field-cell">
          <div class="toggle-row">
            <CheckboxToggle v-model="params.bold" label="粗体" />
            <CheckboxToggle v-model="params.italic" label="斜体" />
            <CheckboxToggle v-model="params.underline" label="下划线" />
          </div>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiTextSpacingVertical size="16" />
        <span>行距与段落间距</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">行距模式</span>
          <DropdownSelect v-model="params.line_spacing_mode" :options="lineSpacingModes" width-class="flex-1" />
        </div>
        <div class="field-cell">
          <span class="field-label">行距数值</span>
          <SpacingInput v-model="params.line_spacing_value" unit="磅" aria-label="行距数值" />
        </div>
        <div class="field-cell">
          <span class="field-label">段前间距</span>
          <div class="inline-control">
            <SpacingInput v-model="params.space_before_value" aria-label="段前间距" />
            <DropdownSelect v-model="params.space_before_unit" :options="spacingUnits" width-class="auto" compact />
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">段后间距</span>
          <div class="inline-control">
            <SpacingInput v-model="params.space_after_value" aria-label="段后间距" />
            <DropdownSelect v-model="params.space_after_unit" :options="spacingUnits" width-class="auto" compact />
          </div>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiAlignLeftLine size="16" />
        <span>缩进</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">左缩进</span>
          <div class="inline-control">
            <SpacingInput v-model="params.left_indent_value" aria-label="左缩进" />
            <DropdownSelect v-model="params.left_indent_unit" :options="spacingUnits" width-class="auto" compact />
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">右缩进</span>
          <div class="inline-control">
            <SpacingInput v-model="params.right_indent_value" aria-label="右缩进" />
            <DropdownSelect v-model="params.right_indent_unit" :options="spacingUnits" width-class="auto" compact />
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">首行缩进</span>
          <SpacingInput v-model="params.first_line_indent_chars" unit="字符" aria-label="首行缩进" />
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiAlignRightLine size="16" />
        <span>对齐与空格</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">对齐方式</span>
          <AlignButtonGroup v-model="params.align" :options="[
            { value: 'LEFT', icon: RiAlignLeft },
            { value: 'CENTER', icon: RiAlignCenter },
            { value: 'RIGHT', icon: RiAlignRight },
            { value: 'JUSTIFY', icon: RiAlignJustify },
          ]" />
        </div>
        <div class="field-cell">
          <CheckboxToggle v-model="params.add_space" label="中英文间加空格" />
        </div>
        <div v-if="params.add_space" class="field-cell">
          <span class="field-label">空格数量</span>
          <input type="number" min="1" max="5" v-model.number="params.space_count" class="input-box" aria-label="空格数量" />
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
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-title { font-size: 17px; font-weight: 500; color: var(--color-text-primary); }
.panel-desc { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
.group { margin-top: 24px; }
.group:first-of-type { margin-top: 4px; }
.group-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 0.7px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  gap: 8px;
}
.group-title svg { color: var(--color-primary); }
.field-row {
  display: grid;
  grid-template-columns: minmax(0, 740px) 1fr;
  gap: 24px 32px;
}
@media (max-width: 1100px) {
  .field-row { grid-template-columns: 1fr; }
}
.field-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  gap: 16px;
}
.field-label { font-size: 16px; color: var(--color-text-body); flex-shrink: 0; }
.toggle-row { display: flex; align-items: center; gap: 20px; }
.inline-control { display: flex; align-items: center; gap: 10px; }
.input-with-unit { display: flex; align-items: center; gap: 8px; }
.input-box {
  width: 130px;
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
.input-box:focus { border-color: var(--color-primary); background: var(--color-bg-white); }
.input-unit { font-size: 14px; color: var(--color-text-muted); }
</style>
