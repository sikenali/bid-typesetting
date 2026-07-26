# 规则配置可视化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有排版规则配置项（全部面板参数）通过可视化表单编辑，支持保存为模板、导入/导出 JSON。

**Architecture:** 在现有 Sidebar 侧边栏中增加第 8 个标签「规则编辑器」，使用统一的面板编辑器组件 `RulePanelEditor.vue` 动态渲染所有 `formatParams` 的配置项。模板保存/载入流程复用现有 Modal，增强其交互体验。

**Tech Stack:** Vue 3 Composition API, TailwindCSS v4, localStorage

## Global Constraints

- 遵循项目现有 UI 设计规范：羊皮纸底色 `#FDF6E3`、朱红 `#C23B22` 主色、圆角 `rounded-xl` 风格
- 所有修改必须实时绑定到 `formatParams`（响应式对象），无需额外确认
- 保持与现有组件一致的命名约定和目录结构
- 使用 `@remixicon/vue` 图标库中的图标（已有的图标已列出）
- 不引入新的外部依赖

---

## Task 1: 创建通用规则面板编辑器组件

**Files:**
- Create: `src/components/RulePanelEditor.vue`

**Interfaces:**
- Consumes: `formatParams` from `useFormatState()`
- Produces: None (directly mutates reactive `formatParams`)

**Summary:** 创建一个可复用的折叠面板编辑器组件，接收一个配置段落名称和对应的数据路径，自动生成表单字段渲染规则配置的编辑界面。

- [ ] **Step 1: 创建 RulePanelEditor.vue 组件**

```vue
<!-- src/components/RulePanelEditor.vue -->
<script setup>
import { ref } from 'vue'
import { RiCheckLine } from '@remixicon/vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  path: { type: String, required: true }, // e.g., 'page', 'body', 'headings'
  iconClass: { type: String, required: false, default: 'bg-cinnabar' },
})

const collapsed = ref(true)
</script>

<template>
  <div class="bg-white border border-tan-border rounded-xl overflow-hidden transition-all duration-200">
    <!-- 折叠标题栏 -->
    <button
      @click="collapsed = !collapsed"
      class="w-full flex items-center gap-2 px-4 py-3 bg-cream-dark hover:bg-cream transition-colors text-left"
      :aria-expanded="!collapsed"
    >
      <span class="text-sm font-semibold text-brown-dark">{{ title }}</span>
      <span v-if="description" class="text-xs text-brown-muted">{{ description }}</span>
      <span class="flex-1"></span>
      <svg
        :class="[collapsed ? '-rotate-90' : 'rotate-0', 'transition-transform duration-200']"
        width="16" height="16" viewBox="0 0 16 16" fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="#5C4033" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    
    <!-- 可折叠内容区 -->
    <div v-show="!collapsed" class="p-4 space-y-4 border-t border-tan-border">
      <slot />
    </div>
  </div>
</template>
```

- [ ] **Step 2: 创建基础字段组件 - InputField.vue**

```vue
<!-- src/components/ui/InputField.vue -->
<script setup>
const model = defineModel()
defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  unit: { type: String, default: '' },
  min: [Number, String],
  max: [Number, String],
  step: [Number, String],
})
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-[13px] text-brown whitespace-nowrap shrink-0">{{ label }}</label>
    <input
      v-model.number="model"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-2 py-1.5 text-[13px] text-brown outline-none focus:border-cinnabar transition-colors"
      :aria-label="label"
    />
    <span v-if="unit" class="text-[13px] text-brown shrink-0">{{ unit }}</span>
  </div>
</template>
```

- [ ] **Step 3: 创建基础字段组件 - SelectField.vue**

```vue
<!-- src/components/ui/SelectField.vue -->
<script setup>
defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
})
const model = defineModel()
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-[13px] text-brown whitespace-nowrap shrink-0">{{ label }}</label>
    <select
      v-model="model"
      class="flex-1 bg-white border border-tan-border rounded-lg px-2 py-1.5 text-[13px] text-brown outline-none focus:border-cinnabar transition-colors"
      :aria-label="label"
    >
      <option v-for="opt in options" :key="opt[optionValue]" :value="opt[optionValue]">
        {{ opt[optionLabel] }}
      </option>
    </select>
  </div>
</template>
```

- [ ] **Step 4: 创建基础字段组件 - CheckboxField.vue**

```vue
<!-- src/components/ui/CheckboxField.vue -->
<script setup>
defineProps({
  label: { type: String, required: true },
})
const model = defineModel({ type: Boolean })
</script>

<template>
  <div class="flex items-center gap-2 cursor-pointer" @click="model = !model">
    <div
      class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
      :class="model ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'"
    >
      <RiCheckLine v-if="model" size="12" class="text-white" />
    </div>
    <span class="text-[13px] text-brown shrink-0">{{ label }}</span>
  </div>
</template>
```

- [ ] **Step 5: 提交并运行 lint**

```bash
git add src/components/RulePanelEditor.vue src/components/ui/InputField.vue src/components/ui/SelectField.vue src/components/ui/CheckboxField.vue
npm run lint  # 或项目实际的 lint 命令
```

---

## Task 2: 创建各段落编辑器子组件

**Files:**
- Create: `src/components/rules/PageRuleEditor.vue`
- Create: `src/components/rules/BodyRuleEditor.vue`
- Create: `src/components/rules/HeadingRuleEditor.vue`
- Create: `src/components/rules/ChartRuleEditor.vue`
- Create: `src/components/rules/TOCRuleEditor.vue`
- Create: `src/components/rules/HeaderFooterRuleEditor.vue`
- Create: `src/components/rules/CleanupRuleEditor.vue`

**Interfaces:**
- Consumes: `params` prop from parent (bound to `formatParams.*`)
- Produces: UI form fields that bind directly to passed params

**Summary:** 为每个规则段落（页面、正文、标题等）创建专用的编辑器组件，复用 Task 1 的字段组件。

- [ ] **Step 1: 创建 PageRuleEditor.vue**

```vue
<!-- src/components/rules/PageRuleEditor.vue -->
<script setup>
import { paperSizes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <InputField v-model="params.top_cm" label="上边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.bottom_cm" label="下边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.left_cm" label="左边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.right_cm" label="右边距" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.gutter_cm" label="装订线" unit="厘米" :min="0" :step="0.1" />
      <InputField v-model="params.header_margin_cm" label="页眉距离" unit="厘米" :min="0" :step="0.1" />
    </div>
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <SelectField v-model="params.paper_size" label="纸张大小" :options="paperSizes" optionLabel="label" optionValue="value" />
      <InputField v-model="params.columns" label="栏数" :min="1" :max="4" :step="1" />
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[13px] text-brown whitespace-nowrap shrink-0">栏间距</span>
      <input type="number" min="0" step="0.1" v-model.number="params.column_spacing_cm"
        class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-2 py-1.5 text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="栏间距" />
      <span class="text-[13px] text-brown shrink-0">厘米</span>
    </div>
    <CheckboxField v-model="params.keep_original_orientation" label="保持原方向" />
  </div>
</template>
```

- [ ] **Step 2: 创建 BodyRuleEditor.vue**

```vue
<!-- src/components/rules/BodyRuleEditor.vue -->
<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <SelectField v-model="params.cn_font" label="中文字体" :options="cnFonts" />
      <SelectField v-model="params.en_font" label="英文字体" :options="enFonts" />
      <SelectField v-model="params.size_cn" label="字号" :options="sizeCN" />
      <SelectField v-model="params.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
    </div>
    <InputField v-model="params.line_spacing_value" label="行距值" :unit="params.line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <InputField v-model="params.first_line_indent_chars" label="首行缩进" unit="字符" :min="0" :step="0.5" />
      <InputField v-model="params.space_before_value" label="段前间距" :unit="params.space_before_unit" :min="0" :step="1" />
      <InputField v-model="params.space_after_value" label="段后间距" :unit="params.space_after_unit" :min="0" :step="1" />
    </div>
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <InputField v-model="params.left_indent_value" label="左缩进" :unit="params.left_indent_unit" :min="0" />
      <InputField v-model="params.right_indent_value" label="右缩进" :unit="params.right_indent_unit" :min="0" />
    </div>
    <div class="flex items-center gap-4 flex-wrap">
      <CheckboxField v-model="params.bold" label="加粗" />
      <CheckboxField v-model="params.italic" label="斜体" />
      <CheckboxField v-model="params.underline" label="下划线" />
      <CheckboxField v-model="params.add_space" label="中英文空格" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: 创建 HeadingRuleEditor.vue（包含4级标题 + 编号规则）**

```vue
<!-- src/components/rules/HeadingRuleEditor.vue -->
<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  headings: { type: Array, required: true },
  patterns: { type: Object, required: true },
})

const activeLevel = ref(0)
</script>

<template>
  <div class="space-y-4">
    <!-- 级别切换 Tabs -->
    <div class="flex gap-1 border-b border-tan-border pb-2">
      <button
        v-for="(h, i) in headings"
        :key="i"
        @click="activeLevel = i"
        class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
        :class="activeLevel === i ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown hover:bg-cream'"
      >
        标题{{ i + 1 }}
      </button>
      <button
        @click="activeLevel = 4"
        class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
        :class="activeLevel === 4 ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown hover:bg-cream'"
      >
        编号规则
      </button>
    </div>

    <!-- 各级标题编辑 -->
    <template v-if="activeLevel < 4">
      <div class="space-y-3" v-if="headings[activeLevel]">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="headings[activeLevel].cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="headings[activeLevel].en_font" label="英文字体" :options="enFonts" />
          <SelectField v-model="headings[activeLevel].size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="headings[activeLevel].line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        </div>
        <InputField v-model="headings[activeLevel].line_spacing_value" label="行距值" :unit="headings[activeLevel].line_spacing_mode === 'EXACT' ? '磅' : '倍'" :min="0" :step="0.1" />
        <InputField v-model="headings[activeLevel].first_line_indent_chars" label="首行缩进" unit="字符" :min="0" :step="0.5" />
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="headings[activeLevel].bold" label="加粗" />
          <CheckboxField v-model="headings[activeLevel].italic" label="斜体" />
          <CheckboxField v-model="headings[activeLevel].underline" label="下划线" />
        </div>
      </div>
    </template>

    <!-- 编号规则编辑 -->
    <template v-else>
      <div class="space-y-2">
        <div v-for="(rule, i) in patterns.rules" :key="i" class="p-3 bg-cream-dark rounded-lg border border-tan-border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[12px] font-semibold text-brown-dark">规则{{ i + 1 }}</span>
            <CheckboxField v-model="rule.enabled" :label="''" />
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <SelectField v-model="rule.scheme" label="编号方案" :options="[
              { value: 'NONE', label: '原有级别&标题' },
              { value: 'ZH_NUM', label: '中文数字' },
              { value: 'ARABIC', label: '阿拉伯数字' },
            ]" />
            <SelectField v-model="rule.wrapper" label="前后缀" :options="[
              { value: 'NONE', label: '无' },
              { value: 'DOT', label: '尾部加点.' },
              { value: 'DUNHAO', label: '顿号、' },
              { value: 'DOUBLE_PAREN', label: '双圆括号()' },
              { value: 'SINGLE_PAREN', label: '单圆括号)' },
            ]" />
            <InputField v-model="rule.multi_depth" label="多级深度" :min="0" :step="1" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 4: 创建 ChartRuleEditor.vue（图题+表题+表格）**

```vue
<!-- src/components/rules/ChartRuleEditor.vue -->
<script setup>
import { cnFonts, enFonts, sizeCN, lineSpacingModes } from '../../constants/ui'
import InputField from '../ui/InputField.vue'
import SelectField from '../ui/SelectField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
  tableSettings: { type: Object, required: true },
})

const activeSubTab = ref('fig')
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-1 border-b border-tan-border pb-2">
      <button @click="activeSubTab='fig'" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='fig' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">图题</button>
      <button @click="activeSubTab='tbl'" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='tbl' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">表题</button>
      <button @click="activeSubTab='table'" class="px-3 py-1.5 rounded-lg text-[12px] font-medium"
        :class="activeSubTab==='table' ? 'bg-cinnabar text-white' : 'bg-white border border-tan-border text-brown'">表格</button>
    </div>

    <template v-if="activeSubTab === 'fig' && figCaption">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="figCaption.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="figCaption.size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="figCaption.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="figCaption.bold" label="加粗" />
          <CheckboxField v-model="figCaption.italic" label="斜体" />
          <CheckboxField v-model="figCaption.underline" label="下划线" />
        </div>
      </div>
    </template>

    <template v-if="activeSubTab === 'tbl' && tblCaption">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="tblCaption.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="tblCaption.size_cn" label="字号" :options="sizeCN" />
          <SelectField v-model="tblCaption.line_spacing_mode" label="行距模式" :options="lineSpacingModes" />
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <CheckboxField v-model="tblCaption.bold" label="加粗" />
          <CheckboxField v-model="tblCaption.italic" label="斜体" />
          <CheckboxField v-model="tblCaption.underline" label="下划线" />
        </div>
      </div>
    </template>

    <template v-if="activeSubTab === 'table'">
      <div class="space-y-3">
        <CheckboxField v-model="table.enable" label="启用表格格式" />
        <CheckboxField v-model="table.enable_cell_formatting" label="启用单元格格式" />
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="table.cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="table.size_cn" label="字号" :options="sizeCN" />
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 5: 创建 TOCRuleEditor.vue**

```vue
<!-- src/components/rules/TOCRuleEditor.vue -->
<script setup>
import { cnFonts, enFonts, sizeCN } from '../../constants/ui'
import SelectField from '../ui/SelectField.vue'
import InputField from '../ui/InputField.vue'
import CheckboxField from '../ui/CheckboxField.vue'
import { ref } from 'vue'

const props = defineProps({
  params: { type: Object, required: true },
})

const activeLevel = ref(0)
</script>

<template>
  <div class="space-y-4">
    <InputField v-model="params.title_text" label="目录标题文字" />
    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
      <SelectField v-model="params.title_cn_font" label="目录标题中文字体" :options="cnFonts" />
      <SelectField v-model="params.title_en_font" label="目录标题英文字体" :options="[{ value: 'Times New Roman', label: 'Times New Roman' }, { value: 'Arial', label: 'Arial' }]" />
      <SelectField v-model="params.title_size_cn" label="目录标题字号" :options="sizeCN" />
    </div>

    <div class="border-t border-tan-border pt-3">
      <div class="flex gap-1 mb-2">
        <button v-for="n in 4" :key="n" @click="activeLevel = n - 1" class="px-2 py-1 rounded text-[11px]"
          :class="activeLevel === n - 1 ? 'bg-jade-light text-white' : 'bg-white border border-tan-border'">
          层级{{ n }}
        </button>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2" v-if="params.level_styles?.[activeLevel]">
        <SelectField v-model="params.level_styles[activeLevel].cn_font" label="中文字体" :options="cnFonts" />
        <SelectField v-model="params.level_styles[activeLevel].size_cn" label="字号" :options="sizeCN" />
        <InputField v-model="params.level_styles[activeLevel].left_indent_value" label="左缩进" unit="字符" :min="0" />
        <CheckboxField v-model="params.level_styles[activeLevel].bold" label="加粗" />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 6: 创建 HeaderFooterRuleEditor.vue**

```vue
<!-- src/components/rules/HeaderFooterRuleEditor.vue -->
<script setup>
import { cnFonts, enFonts, sizeCN } from '../../constants/ui'
import SelectField from '../ui/SelectField.vue'
import InputField from '../ui/InputField.vue'
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2 p-3 bg-cream-dark rounded-lg border border-tan-border">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[12px] font-semibold text-brown-dark">页眉设置</span>
        <CheckboxField v-model="params.enable_header" :label="''" />
      </div>
      <template v-if="params.enable_header">
        <InputField v-model="params.header_text" label="页眉文本" />
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="params.header_cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="params.header_size_cn" label="字号" :options="sizeCN" />
        </div>
        <InputField v-model="params.header_top_cm" label="页眉距离顶部" unit="厘米" :min="0" :step="0.01" />
      </template>
    </div>

    <div class="space-y-2 p-3 bg-cream-dark rounded-lg border border-tan-border">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[12px] font-semibold text-brown-dark">页脚设置</span>
        <CheckboxField v-model="params.enable_footer" :label="''" />
      </div>
      <template v-if="params.enable_footer">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <SelectField v-model="params.footer_cn_font" label="中文字体" :options="cnFonts" />
          <SelectField v-model="params.footer_size_cn" label="字号" :options="sizeCN" />
        </div>
        <InputField v-model="params.footer_bottom_cm" label="页脚距离底部" unit="厘米" :min="0" :step="0.01" />
      </template>
    </div>
  </div>
</template>
```

- [ ] **Step 7: 创建 CleanupRuleEditor.vue（预处理+全局开关）**

```vue
<!-- src/components/rules/CleanupRuleEditor.vue -->
<script setup>
import CheckboxField from '../ui/CheckboxField.vue'
import InputField from '../ui/InputField.vue'

defineProps({
  textCleanup: { type: Object, required: true },
  styleCleanup: { type: Object, required: true },
  objectStructure: { type: Object, required: true },
  captionDetection: { type: Object, required: true },
  globalSwitches: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-3">
    <div class="font-semibold text-brown-dark text-sm border-b border-tan-border pb-1">文本处理</div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-2">
      <CheckboxField v-model="textCleanup.add_space_between_cn_en" label="中英文间加空格" />
      <CheckboxField v-model="textCleanup.punctuation_clean" label="标点符号清理" />
      <CheckboxField v-model="textCleanup.clear_superscript" label="清除上标" />
      <CheckboxField v-model="textCleanup.soft_enter_to_hard" label="软回车转硬回车" />
      <CheckboxField v-model="textCleanup.markdown_tags_to_plaintext" label="Markdown转纯文本" />
    </div>

    <div class="font-semibold text-brown-dark text-sm border-b border-tan-border pb-1 mt-4">样式清理</div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-2">
      <CheckboxField v-model="styleCleanup.clear_all_styles" label="清除所有样式" />
      <CheckboxField v-model="styleCleanup.clear_align_grid" label="清除对齐网格" />
      <CheckboxField v-model="styleCleanup.clear_extra_spaces" label="清除多余空格" />
      <CheckboxField v-model="styleCleanup.clean_after_formatting" label="格式化后清理" />
    </div>

    <div class="font-semibold text-brown-dark text-sm border-b border-tan-border pb-1 mt-4">全局开关</div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-2">
      <CheckboxField v-model="globalSwitches.apply_page" label="应用页面设置" />
      <CheckboxField v-model="globalSwitches.apply_body" label="应用正文格式" />
      <CheckboxField v-model="globalSwitches.apply_headings" label="应用标题格式" />
      <CheckboxField v-model="globalSwitches.apply_figtbl" label="应用图题表题" />
      <CheckboxField v-model="globalSwitches.apply_toc" label="应用目录" />
      <CheckboxField v-model="globalSwitches.apply_header_footer" label="应用页眉页脚" />
    </div>
  </div>
</template>
```

- [ ] **Step 8: 提交并运行 lint**

```bash
git add src/components/rules/ src/components/ui/InputField.vue src/components/ui/SelectField.vue src/components/ui/CheckboxField.vue
npm run lint
```

---

## Task 3: 修改 Sidebar 添加第 8 个标签

**Files:**
- Modify: `src/components/Sidebar.vue:23-31`

**Interfaces:**
- Consumes: existing tab structure
- Produces: new `rules` tab that triggers rule editor panel rendering in Editor.vue

- [ ] **Step 1: 在 tabs 数组中添加「规则编辑器」项**

```js
// 在 Sidebar.vue 的 tabs 数组中添加：
{ id: 'rules', label: '规则编辑器', sublabel: 'Rule Editor', icon: RiEdit2Line, activeBg: 'bg-[#5B7DB1]' },
```

需要在 import 中新增 `RiEdit2Line` 图标。

- [ ] **Step 2: 提交并验证 Sidebar 显示**

```bash
git add src/components/Sidebar.vue
```

---

## Task 4: 在 Editor.vue 中集成规则编辑器

**Files:**
- Modify: `src/views/Editor.vue`

**Interfaces:**
- Consumes: `formatParams` from `useFormatState()`, `activeTab` ref
- Produces: when `activeTab === 'rules'`, renders the rule editor with all sections

- [ ] **Step 1: 导入所需规则编辑器组件和 RulePanelEditor 包装器**

```js
import RulePanelEditor from '../components/RulePanelEditor.vue'
import PageRuleEditor from '../components/rules/PageRuleEditor.vue'
import BodyRuleEditor from '../components/rules/BodyRuleEditor.vue'
import HeadingRuleEditor from '../components/rules/HeadingRuleEditor.vue'
import ChartRuleEditor from '../components/rules/ChartRuleEditor.vue'
import TOCRuleEditor from '../components/rules/TOCRuleEditor.vue'
import HeaderFooterRuleEditor from '../components/rules/HeaderFooterRuleEditor.vue'
import CleanupRuleEditor from '../components/rules/CleanupRuleEditor.vue'
```

- [ ] **Step 2: 添加规则编辑器的 tab 标题和描述**

```js
tabTitles['rules'] = '规则编辑器'
tabSubtitles['rules'] = '可视化编辑全部排版规则配置'
tabIcons['rules'] = RiEdit2Line
```

- [ ] **Step 3: 在预览区域添加 rules 标签的条件渲染**

在 `<div class="flex-1 overflow-y-auto bg-warm-gray px-8 py-6 space-y-5">` 内部添加：

```vue
<RulePanelEditor v-else-if="activeTab === 'rules'" :params="formatParams">
  <PageRuleEditor :params="formatParams.page" />
  <BodyRuleEditor :params="formatParams.body" />
  <HeadingRuleEditor :headings="formatParams.headings" :patterns="formatParams.patterns" />
  <ChartRuleEditor :fig-caption="formatParams.fig_caption" :tbl-caption="formatParams.tbl_caption" :table="formatParams.table" :table-settings="formatParams.table_settings" />
  <TOCRuleEditor :params="formatParams.toc" />
  <HeaderFooterRuleEditor :params="formatParams.header_footer" />
  <CleanupRuleEditor :text-cleanup="formatParams.cleanup.text_cleanup" :style-cleanup="formatParams.cleanup.style_cleanup" :object-structure="formatParams.cleanup.object_structure" :caption-detection="formatParams.cleanup.caption_detection" :global-switches="formatParams.cleanup.global_switches" />
</RulePanelEditor>
```

- [ ] **Step 4: 提交并验证 Editor 中的规则编辑器渲染**

```bash
git add src/views/Editor.vue
```

---

## Task 5: 增强模板保存/载入 + 添加 JSON 导入导出

**Files:**
- Modify: `src/components/SaveTemplateModal.vue`
- Modify: `src/components/LoadTemplateModal.vue`
- Modify: `src/views/Editor.vue`

**Interfaces:**
- Consumes: `saveTemplate`, `templates` from `useTemplates()`
- Produces: enhanced save/load UX + new export/import functions

- [ ] **Step 1: 增强 SaveTemplateModal — 添加模板覆盖编辑功能**

在 SaveTemplateModal 中新增可选 `props` 支持编辑已有模板：

```vue
<!-- 新增 props -->
defineProps({
  editTemplateId: { type: Number, default: null },
})

<!-- 编辑模式下显示模板名称而非输入框 -->
<template v-if="editTemplateId">
  <div class="text-[14px] text-brown-dark">模板名称: {{ editingTemplate?.name }}</div>
</template>
<template v-else>
  <input v-model="name" ... />
</template>
```

- [ ] **Step 2: 增强 LoadTemplateModal — 添加编辑按钮**

在每个用户模板卡片上添加编辑按钮：

```vue
<div class="flex items-center gap-2">
  <button @click.stop="handleEdit(tpl.id)" class="...">
    <RiEdit2Line ... /> 编辑
  </button>
  <button @click.stop="handleDelete($event, tpl.id)">
    <RiDeleteBinLine ... />
  </button>
</div>
```

并在 emit 中新增 `'edit'` 事件。

- [ ] **Step 3: 在 Editor.vue 中实现 JSON 导入导出功能**

```js
// 导出 JSON
const handleExportJSON = () => {
  const jsonStr = JSON.stringify(formatParams, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `排版配置-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入 JSON
const handleImportJSON = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result)
      loadFormatParams(imported)
      showToast('配置导入成功', 'success')
    } catch (err) {
      showToast('JSON 格式错误: ' + err.message, 'error')
    }
  }
  reader.readAsText(file)
  event.target.value = '' // reset file input
}
```

- [ ] **Step 4: 在 Editor.vue 底部操作区添加导入/导出按钮**

在「保存到模板」「载入模板」旁增加：

```vue
<button @click="handleExportJSON" class="...">
  <RiDownloadLine /> 导出配置
</button>
<input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImportJSON" />
<button @click="$refs.fileInput.click()" class="...">
  <RiUploadLine /> 导入配置
</button>
```

需要从 `@remixicon/vue` 导入 `RiDownloadLine` 和 `RiUploadLine`。

- [ ] **Step 5: 提交并测试完整流程**

```bash
git add src/components/SaveTemplateModal.vue src/components/LoadTemplateModal.vue src/views/Editor.vue
```

---

## Task 6: 端到端测试验证

**Files:**
- No files changed
- Manual testing only

**Interfaces:**
- Consumes: 整个应用

- [ ] **Step 1: 验证规则编辑器可访问**
  - 打开应用 → 上传 DOCX → 侧边栏应显示第 8 个标签「规则编辑器」
  - 点击后应看到所有段落面板以折叠形式展示
  - 展开每个面板，验证所有字段可编辑且实时更新

- [ ] **Step 2: 验证编辑后自动生效**
  - 修改任一一字段（如正文字体改为「黑体」）
  - 切换到其他标签再回来，值应保持
  - 切换到「预览」检查文档是否反映修改

- [ ] **Step 3: 验证模板保存/载入**
  - 修改若干配置 → 点击「保存到模板」→ 输入名称 → 保存
  - 修改配置 → 点击「载入模板」→ 选择刚保存的模板 → 验证配置恢复
  - 在 LoadTemplateModal 中验证编辑按钮是否正常

- [ ] **Step 4: 验证 JSON 导入/导出**
  - 配置完成后点击「导出配置」→ 下载 JSON 文件 → 检查内容正确
  - 修改任意配置 → 点击「导入配置」→ 选择刚才导出的 JSON → 验证恢复

- [ ] **Step 5: 验证编号规则编辑**
  - 在 HeadingRuleEditor 中切换到「编号规则」tab
  - 修改某个规则的 scheme/wrapper/multi_depth
  - 保存为模板 → 重新载入 → 验证数值一致

---

## 文件变更总结

| 文件 | 动作 | 说明 |
|------|------|------|
| `src/components/RulePanelEditor.vue` | **新建** | 通用折叠面板编辑器容器 |
| `src/components/ui/InputField.vue` | **新建** | 数值输入框组件 |
| `src/components/ui/SelectField.vue` | **新建** | 下拉选择框组件 |
| `src/components/ui/CheckboxField.vue` | **新建** | 复选框组件 |
| `src/components/rules/PageRuleEditor.vue` | **新建** | 页面段落编辑器 |
| `src/components/rules/BodyRuleEditor.vue` | **新建** | 正文段落编辑器 |
| `src/components/rules/HeadingRuleEditor.vue` | **新建** | 标题段落编辑器（含编号规则） |
| `src/components/rules/ChartRuleEditor.vue` | **新建** | 图表段落编辑器（图题+表题+表格） |
| `src/components/rules/TOCRuleEditor.vue` | **新建** | 目录段落编辑器 |
| `src/components/rules/HeaderFooterRuleEditor.vue` | **新建** | 页眉页脚段落编辑器 |
| `src/components/rules/CleanupRuleEditor.vue` | **新建** | 预处理+全局开关编辑器 |
| `src/components/Sidebar.vue` | **修改** | 新增第 8 个标签「规则编辑器」 |
| `src/views/Editor.vue` | **修改** | 集成规则编辑器渲染 + JSON 导入导出 |
| `src/components/SaveTemplateModal.vue` | **修改** | 增强编辑已有模板功能 |
| `src/components/LoadTemplateModal.vue` | **修改** | 增强编辑入口 |
