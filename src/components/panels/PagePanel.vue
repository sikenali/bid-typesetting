<script setup>
import DropdownSelect from '../ui/DropdownSelect.vue'
import { paperSizes } from '../../constants/ui'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">页面设置</div>
        <div class="panel-desc">配置页面尺寸、边距与方向</div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiRulerLine size="16" />
        <span>边距设置</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">上边距</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.top_cm" class="input-box" aria-label="上边距" />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">下边距</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.bottom_cm" class="input-box" aria-label="下边距" />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">左边距</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.left_cm" class="input-box" aria-label="左边距" />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">右边距</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.right_cm" class="input-box" aria-label="右边距" />
            <span class="input-unit">cm</span>
          </div>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiFileLine size="16" />
        <span>纸张与装订</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">纸张大小</span>
          <DropdownSelect v-model="params.paper_size" :options="paperSizes" width-class="flex-1" />
        </div>
        <div class="field-cell">
          <span class="field-label">装订线</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.gutter_cm" class="input-box" aria-label="装订线" />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">页眉距离</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.header_margin_cm" class="input-box" aria-label="页眉距离" />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">保持原方向</span>
          <div class="switch" :class="{ on: params.keep_original_orientation }" @click="params.keep_original_orientation = !params.keep_original_orientation">
            <div class="knob"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">
        <RiLayoutMasonryLine size="16" />
        <span>分栏</span>
      </div>
      <div class="field-row">
        <div class="field-cell">
          <span class="field-label">栏数</span>
          <div class="chip-group">
            <button v-for="n in [1, 2, 3, 4]" :key="n" type="button" class="chip" :class="{ active: params.columns === n }" @click="params.columns = n">{{ n }}</button>
          </div>
        </div>
        <div class="field-cell">
          <span class="field-label">栏间距</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.1" v-model.number="params.column_spacing_cm" class="input-box" aria-label="栏间距" />
            <span class="input-unit">cm</span>
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
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.panel-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
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
.field-label {
  font-size: 16px;
  color: var(--color-text-body);
  flex-shrink: 0;
}
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}
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
.input-box:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-white);
}
.input-unit {
  font-size: 14px;
  color: var(--color-text-muted);
}
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
.chip-group { display: inline-flex; gap: 6px; }
.chip {
  height: 36px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}
.chip:hover { border-color: var(--color-primary); }
.chip.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary-deep);
  font-weight: 500;
}
</style>
