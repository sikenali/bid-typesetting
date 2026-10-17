<script setup>
import { computed } from 'vue'
import DropdownSelect from '../ui/DropdownSelect.vue'

const props = defineProps({
  textCleanup: { type: Object, required: true },
  styleCleanup: { type: Object, required: true },
  objectStructure: { type: Object, required: true },
  captionDetection: { type: Object, required: true },
})

const emit = defineEmits(['reset'])

function toggle(obj, key) { obj[key] = !obj[key] }

const styleKeys = ['clear_extra_spaces', 'clear_paragraph_indent', 'clear_heading_indent', 'remove_extra_blank_lines', 'clear_chart_format']
const textKeys = ['soft_enter_to_hard', 'tab_to_spaces_enabled', 'clear_superscript', 'punctuation_clean', 'markdown_tags_to_plaintext']

const styleAllSelected = computed(() => styleKeys.every(k => props.styleCleanup[k]))
const textAllSelected = computed(() => textKeys.every(k => props.textCleanup[k]))

function toggleStyleAll() {
  const val = !styleAllSelected.value
  styleKeys.forEach(k => { props.styleCleanup[k] = val })
}
function toggleTextAll() {
  const val = !textAllSelected.value
  textKeys.forEach(k => { props.textCleanup[k] = val })
}

const tabSpaceOptions = [
  { value: 1, label: '1 个' },
  { value: 2, label: '2 个' },
  { value: 4, label: '4 个' },
  { value: 'none', label: '不处理' },
  { value: 'delete', label: '删除处理' },
  { value: 'enter', label: '回车换行' },
]
</script>

<template>
  <div class="panel-card">
    <div class="panel-head">
      <div>
        <div class="panel-title">初始化</div>
        <div class="panel-desc">在一键排版之前，对上传的文件进行初始化操作</div>
      </div>
    </div>

    <div class="two-col">
      <div class="sub-card">
        <div class="sub-title-row">
          <div class="group-title">
            <RiBrushLine size="16" />
            <span>样式清理</span>
          </div>
          <button class="chip" :class="{ active: styleAllSelected }" @click="toggleStyleAll()">全选</button>
        </div>

        <div class="switch-list">
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">清理多余空格</div>
              <div class="row-desc">保留英文单词之间的空格</div>
            </div>
            <div class="switch" :class="{ on: styleCleanup.clear_extra_spaces }" @click="toggle(styleCleanup, 'clear_extra_spaces')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">清理正文缩进</div>
            </div>
            <div class="switch" :class="{ on: styleCleanup.clear_paragraph_indent }" @click="toggle(styleCleanup, 'clear_paragraph_indent')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">清理标题缩进</div>
              <div v-if="styleCleanup.clear_heading_indent" class="sub-toggles">
                <div class="sub-toggle" @click="toggle(styleCleanup, 'clear_heading_left_indent')">
                  <span class="sub-dot" :class="{ on: styleCleanup.clear_heading_left_indent }"></span>
                  <span>左缩进</span>
                </div>
                <div class="sub-toggle" @click="toggle(styleCleanup, 'clear_heading_right_indent')">
                  <span class="sub-dot" :class="{ on: styleCleanup.clear_heading_right_indent }"></span>
                  <span>右缩进</span>
                </div>
                <div class="sub-toggle" @click="toggle(styleCleanup, 'clear_heading_special_indent')">
                  <span class="sub-dot" :class="{ on: styleCleanup.clear_heading_special_indent }"></span>
                  <span>特殊缩进</span>
                </div>
              </div>
            </div>
            <div class="switch" :class="{ on: styleCleanup.clear_heading_indent }" @click="toggle(styleCleanup, 'clear_heading_indent')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">清理所有空行</div>
            </div>
            <div class="switch" :class="{ on: styleCleanup.remove_extra_blank_lines }" @click="toggle(styleCleanup, 'remove_extra_blank_lines')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">清理图表格式</div>
              <div class="row-desc">将浮动布局的图表格式清理后转成嵌入式布局格式</div>
            </div>
            <div class="switch" :class="{ on: styleCleanup.clear_chart_format }" @click="toggle(styleCleanup, 'clear_chart_format')">
              <div class="knob"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="sub-card">
        <div class="sub-title-row">
          <div class="group-title">
            <RiReplaceLine size="16" />
            <span>符号清理</span>
          </div>
          <button class="chip" :class="{ active: textAllSelected }" @click="toggleTextAll()">全选</button>
        </div>

        <div class="switch-list">
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">软符号转换回车</div>
            </div>
            <div class="switch" :class="{ on: textCleanup.soft_enter_to_hard }" @click="toggle(textCleanup, 'soft_enter_to_hard')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">软符号转换空格</div>
              <div v-if="textCleanup.tab_to_spaces_enabled" class="row-inline">
                <DropdownSelect v-model="textCleanup.tab_to_spaces" :options="tabSpaceOptions" width-class="auto" compact />
              </div>
            </div>
            <div class="switch" :class="{ on: textCleanup.tab_to_spaces_enabled }" @click="toggle(textCleanup, 'tab_to_spaces_enabled')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">上标数学单位自动设置</div>
              <div class="row-desc">常用的数学单位 m²、m³、mm²</div>
            </div>
            <div class="switch" :class="{ on: textCleanup.clear_superscript }" @click="toggle(textCleanup, 'clear_superscript')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">英文标点符号自动转换成中文</div>
            </div>
            <div class="switch" :class="{ on: textCleanup.punctuation_clean }" @click="toggle(textCleanup, 'punctuation_clean')">
              <div class="knob"></div>
            </div>
          </div>
          <div class="switch-row">
            <div class="row-body">
              <div class="row-title">标签符转换纯文本</div>
              <div class="row-desc">Markdown 文件中的 #、&gt; 等</div>
            </div>
            <div class="switch" :class="{ on: textCleanup.markdown_tags_to_plaintext }" @click="toggle(textCleanup, 'markdown_tags_to_plaintext')">
              <div class="knob"></div>
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
  gap: 12px;
}
.sub-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 0.7px solid var(--color-border-soft);
  margin-bottom: 4px;
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
.chip {
  height: 28px;
  padding: 0 12px;
  border-radius: 9999px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all var(--transition-base);
}
.chip:hover { border-color: var(--color-primary); }
.chip.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary-deep);
  font-weight: 500;
}

.switch-list { display: flex; flex-direction: column; }
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  border-bottom: 0.7px solid var(--color-border-soft);
}
.switch-row:last-child { border-bottom: none; }
.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 15px; color: var(--color-text-body); }
.row-desc { font-size: 13px; color: var(--color-text-muted); margin-top: 2px; }
.row-inline { margin-top: 4px; }

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

.sub-toggles {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
.sub-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-body);
  cursor: pointer;
}
.sub-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}
.sub-dot.on {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 3px var(--color-primary);
}
</style>
