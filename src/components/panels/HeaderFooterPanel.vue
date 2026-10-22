<script setup>
import DropdownSelect from '../ui/DropdownSelect.vue'
import { cnFonts, enFonts, sizeCN } from '../../constants/ui'

defineProps({
  params: { type: Object, required: true },
})

const alignOptions = [
  { value: 'LEFT', label: '左对齐' },
  { value: 'CENTER', label: '居中' },
  { value: 'RIGHT', label: '右对齐' },
]
const headerUnderlineTypes = [
  { value: 'none', label: '无' },
  { value: 'single', label: '默认下划线' },
  { value: 'thick', label: '加粗下划线' },
  { value: 'double', label: '双下划线' },
  { value: 'word', label: '上细下粗双线' },
]
const pageNumberTypes = [
  { value: 'standard', label: '1, 2, 3, ...' },
  { value: 'dash', label: '-1-, -2-, ...' },
  { value: 'simple', label: '第1页' },
  { value: 'total', label: '第1页/共n页' },
]
</script>

<template>
  <div class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">页眉页脚设置</div>
        <div class="panel-desc">配置页眉页脚内容、位置与样式</div>
      </div>
    </div>

    <div class="two-col">
      <div class="sub-card">
        <div class="sub-title-row">
          <div class="group-title">
            <RiLayoutTopLine size="16" />
            <span>页眉</span>
          </div>
          <div class="switch" :class="{ on: params.enable_header }" @click="params.enable_header = !params.enable_header">
            <div class="knob"></div>
          </div>
        </div>

        <div class="level-body" :class="{ disabled: !params.enable_header }">
          <div class="level-group">
            <div class="level-subtitle">内容</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">页眉标题</span>
                <input type="text" v-model="params.header_text" placeholder="文版星-智能化排版工具" class="text-input" aria-label="页眉标题" />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">字体</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">中文字体</span>
                <DropdownSelect v-model="params.header_cn_font" :options="cnFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">英文字体</span>
                <DropdownSelect v-model="params.header_en_font" :options="enFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">字号</span>
                <DropdownSelect v-model="params.header_size_cn" :options="sizeCN" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">对齐</span>
                <DropdownSelect v-model="params.header_align" :options="alignOptions" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">粗体</span>
                <div class="switch" :class="{ on: params.header_bold }" @click="params.header_bold = !params.header_bold">
                  <div class="knob"></div>
                </div>
              </div>
              <div class="field-cell">
                <span class="field-label">斜体</span>
                <div class="switch" :class="{ on: params.header_italic }" @click="params.header_italic = !params.header_italic">
                  <div class="knob"></div>
                </div>
              </div>
              <div class="field-cell">
                <span class="field-label">下划线</span>
                <DropdownSelect v-model="params.header_underline_type" :options="headerUnderlineTypes" width-class="flex-1" compact />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">位置</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">页眉距离</span>
                <div class="input-with-unit">
                  <input type="number" min="0" step="0.5" v-model.number="params.header_top_cm" class="input-box" aria-label="页眉距离" />
                  <span class="input-unit">cm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sub-card">
        <div class="sub-title-row">
          <div class="group-title">
            <RiLayoutBottomLine size="16" />
            <span>页脚</span>
          </div>
          <div class="switch" :class="{ on: params.enable_footer }" @click="params.enable_footer = !params.enable_footer">
            <div class="knob"></div>
          </div>
        </div>

        <div class="level-body" :class="{ disabled: !params.enable_footer }">
          <div class="level-group">
            <div class="level-subtitle">页码选项</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">清除页码后插入</span>
                <div class="switch" :class="{ on: params.clear_footer }" @click="params.clear_footer = !params.clear_footer">
                  <div class="knob"></div>
                </div>
              </div>
              <div class="field-cell">
                <span class="field-label">从正文开始</span>
                <div class="switch" :class="{ on: params.page_number_from_body }" @click="params.page_number_from_body = !params.page_number_from_body">
                  <div class="knob"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">字体</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">中文字体</span>
                <DropdownSelect v-model="params.footer_cn_font" :options="cnFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">英文字体</span>
                <DropdownSelect v-model="params.footer_en_font" :options="enFonts" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">字号</span>
                <DropdownSelect v-model="params.footer_size_cn" :options="sizeCN" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">对齐</span>
                <DropdownSelect v-model="params.footer_align" :options="alignOptions" width-class="flex-1" compact />
              </div>
              <div class="field-cell">
                <span class="field-label">粗体</span>
                <div class="switch" :class="{ on: params.footer_bold }" @click="params.footer_bold = !params.footer_bold">
                  <div class="knob"></div>
                </div>
              </div>
              <div class="field-cell">
                <span class="field-label">斜体</span>
                <div class="switch" :class="{ on: params.footer_italic }" @click="params.footer_italic = !params.footer_italic">
                  <div class="knob"></div>
                </div>
              </div>
              <div class="field-cell">
                <span class="field-label">页码类型</span>
                <DropdownSelect v-model="params.footer_page_number_type" :options="pageNumberTypes" width-class="flex-1" compact />
              </div>
            </div>
          </div>

          <div class="level-group">
            <div class="level-subtitle">位置</div>
            <div class="field-row">
              <div class="field-cell">
                <span class="field-label">页脚距离</span>
                <div class="input-with-unit">
                  <input type="number" min="0" step="0.5" v-model.number="params.footer_bottom_cm" class="input-box" aria-label="页脚距离" />
                  <span class="input-unit">cm</span>
                </div>
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
.field-label { font-size: 14px; color: var(--color-text-body); flex-shrink: 0; min-width: 84px; }
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
.text-input {
  width: 220px;
  height: 40px;
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
.text-input:focus { border-color: var(--color-primary); background: var(--color-bg-white); }
.text-input::placeholder { color: var(--color-text-muted); opacity: 0.6; }
</style>
