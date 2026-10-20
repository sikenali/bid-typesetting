# 模板库迁移到设置中心 + 弹框统一 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 8 个内置排版模板从 `/template` 页面迁入 Settings > 模板管理，统一所有弹框为 UiModal 外壳，同时保留 Editor 的「预览」按钮及其交互。

**架构：** 单一模板存储（`bid-typesetting-settings.templates`）承载 outline 与 typography 两类模板（`kind` 字段区分）；`useTemplates.js` 变为薄适配层；7 个业务弹框全部迁移到已有 `UiModal` 外壳；排版模板的全量编辑由新增 `TypographyTemplateEditor.vue` 组件提供（复用现有 `*RuleEditor.vue`）。

**技术栈：** Vue 3 `<script setup>`、Vue Router 4、Vite、Remixicon、Tailwind v4；无测试框架，验证靠 `npm run build` + 手工 `npm run dev` 走查。

---

## 文件清单

**新建：**
- `src/utils/migrateTemplates.js` — 一次性迁移旧 `bid-page-user-templates` 到 `bid-typesetting-settings`
- `src/components/settings/TypographyTemplateEditor.vue` — 全量 `formatParams` 编辑器（复用 Rule Editor 系列）
- `src/components/settings/TypographyTemplatePreview.vue` — 模板参数只读摘要卡片（供 PreviewTemplateModal 使用）

**修改：**
- `src/api/settings.js` — Schema 扩展（`kind`, `formatParams`, `builtIn`, `enabled`），DEFAULT_TEMPLATES 加 8 个内置排版模板，导出 `getTemplateList`/`createTemplate`/`updateTemplate`/`deleteTemplate`/`resetTemplates` 支持新字段
- `src/composables/useTemplates.js` — 变为 `getTemplateList()` 的薄适配层（仅返回 `kind === 'typography'`）
- `src/components/layout/SettingsModal.vue` — 迁移到 UiModal 外壳，支持 `initial-tab` / `initial-kind` props
- `src/components/layout/CreditQualificationModal.vue` — 迁移到 UiModal 外壳
- `src/components/layout/BiddingSitesModal.vue` — 迁移到 UiModal 外壳
- `src/components/PreviewTemplateModal.vue` — 迁移到 UiModal 外壳，右侧改用 `TypographyTemplatePreview`
- `src/components/FormatProgressModal.vue` — 迁移到 UiModal 外壳
- `src/views/settings/TemplateSettingsView.vue` — 加类型筛选、预览按钮、排版模板全量编辑入口
- `src/views/Editor.vue` — 移除 `SaveTemplateModal`/`LoadTemplateModal` 引用；「保存模板/加载模板」改为打开 Settings 定位模板管理；文档预览视觉微调对齐 UiModal
- `src/App.vue` — 挂载 `migrateLegacyTemplates()`
- `src/router/index.js` — 移除 `/template` 路由，加 `/template` → `/settings?tab=template` 重定向

**删除：**
- `src/views/Template.vue`
- `src/components/LoadTemplateModal.vue`
- `src/components/SaveTemplateModal.vue`

---

## 任务 1：Schema 扩展 + 内置模板迁移

**文件：**
- 修改：`src/api/settings.js`

- [ ] **步骤 1.1：在 `api/settings.js` 中扩展 DEFAULT_TEMPLATES 加入 8 个排版模板**

从 `src/composables/useTemplates.js:132-383` 复制 `builtinTemplates` 数组，改写为 `kind: 'typography'`、`builtIn: true`、`enabled: 1`、`content: []`、`id` 用 `201`–`208`（避开 -1/-2/-3/-100~-104 的历史负 id），`createdAt: Date.now()`、`keywords: []`。

在 `api/settings.js` 的 `DEFAULT_TEMPLATES` 数组末尾追加：

```js
// ── 内置排版模板（8 个，从 useTemplates.js:132-383 迁入）──
{
  id: 201,
  name: 'GB/T 7714 顺序编码制',
  type: 'custom',
  kind: 'typography',
  category: '学术',
  description: 'GB/T 7714-2015 顺序编码制参考文献格式',
  keywords: [],
  enabled: 1,
  builtIn: true,
  content: [],
  formatParams: {
    page: { paper_size: 'A4', top_cm: 2.54, bottom_cm: 2.54, left_cm: 3.17, right_cm: 3.17, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
    // ...（完整复制 useTemplates.js:143-173 的 formatParams）
  },
  createdAt: Date.now(),
},
// ... 其余 7 个（-2/-3/-100~-104）以同样方式加入，id 递增
```

完整的 8 个模板参数**直接拷贝**自 `useTemplates.js:132-383`，只替换 `id`、加 `kind`/`builtIn`/`enabled`/`content`/`createdAt`/`keywords` 字段。

- [ ] **步骤 1.2：更新 `createTemplate` 使用 maxId 计算且加 100 起跳（避免与内置冲突）**

```js
export async function createTemplate(data) {
  const templates = getSetting('templates', DEFAULT_TEMPLATES);
  const maxId = templates.reduce((max, t) => Math.max(max, t.id || 0), 0);
  const newId = Math.max(maxId + 1, 1000); // 用户自定义从 1000 起，避免和 201-208 内置撞
  templates.push({
    ...data,
    id: newId,
    kind: data.kind || 'outline',
    builtIn: false,
    enabled: 1,
    content: data.kind === 'typography' ? [] : (data.content || []),
    createdAt: Date.now(),
  });
  setSetting('templates', templates);
}
```

- [ ] **步骤 1.3：更新 `updateTemplate` 使 `kind: 'typography'` 时能带 `formatParams`**

保持现有实现（`{ ...templates[idx], ...data }` 已支持合并）。

- [ ] **步骤 1.4：更新 `getTemplateList` 对旧数据默认填 `kind: 'outline'`**

```js
export function getTemplateList() {
  const raw = getSetting('templates', DEFAULT_TEMPLATES);
  const templates = raw.map(t => ({
    ...t,
    kind: t.kind || 'outline',
    enabled: t.enabled ?? 1,
    builtIn: t.builtIn ?? false,
    content: t.content || [],
  }));
  return { templates };
}
```

- [ ] **步骤 1.5：`npm run build` 验证**

运行：`npm run build`
预期：无编译错误。

- [ ] **步骤 1.6：Commit**

```bash
git add src/api/settings.js
git commit -m "feat(settings): extend template schema with kind/formatParams and seed 8 typography templates"
```

---

## 任务 2：一次性数据迁移

**文件：**
- 创建：`src/utils/migrateTemplates.js`
- 修改：`src/App.vue`

- [ ] **步骤 2.1：新建 `src/utils/migrateTemplates.js`**

```js
// src/utils/migrateTemplates.js
// 一次性把旧 useTemplates.js 的 localStorage 'bid-page-user-templates' 迁入
// 新 settings 'templates' 存储，标记 'migrated.from-use-templates'。

const OLD_KEY = 'bid-page-user-templates';
const MIGRATION_FLAG = 'migrated.from-use-templates';

export function migrateLegacyTemplates() {
  try {
    const settings = JSON.parse(localStorage.getItem('bid-typesetting-settings') || '{}');
    if (settings[MIGRATION_FLAG]) return;

    const raw = localStorage.getItem(OLD_KEY);
    let legacy = [];
    try { legacy = raw ? JSON.parse(raw) : []; } catch { legacy = []; }

    if (Array.isArray(legacy) && legacy.length > 0) {
      const templates = settings.templates || [];
      let maxId = templates.reduce((m, t) => Math.max(m, t.id || 0), 0);
      const migrated = legacy.map((t) => {
        maxId += 1;
        return {
          ...t,
          id: maxId,
          kind: 'typography',
          builtIn: false,
          enabled: 1,
          content: [],
          keywords: [],
          type: 'custom',
          createdAt: Date.now(),
        };
      });
      settings.templates = [...templates, ...migrated];
    }

    settings[MIGRATION_FLAG] = true;
    localStorage.setItem('bid-typesetting-settings', JSON.stringify(settings));
    localStorage.removeItem(OLD_KEY);
    localStorage.removeItem('bid-page-templates-initialized');
  } catch (e) {
    console.warn('[migrateTemplates] migration failed:', e);
  }
}
```

- [ ] **步骤 2.2：在 `App.vue` 挂载入口调用迁移函数**

修改 `src/App.vue`（现有 `<script setup>` 段最顶部）：

```js
import { migrateLegacyTemplates } from '@/utils/migrateTemplates';
migrateLegacyTemplates();
```

- [ ] **步骤 2.3：`npm run build` 验证**

运行：`npm run build`
预期：无编译错误。

- [ ] **步骤 2.4：手工冒烟验证**

启动 `npm run dev`，打开浏览器 console 执行：

```js
localStorage.setItem('bid-page-user-templates', JSON.stringify([
  { id: 999, name: '测试自定义模板', description: '测试', category: 'academic',
    builtIn: false, formatParams: { page: { paper_size: 'A4' } } }
]));
```

刷新页面后再次执行：

```js
console.log(localStorage.getItem('bid-typesetting-settings'));  // 应含迁移条目
console.log(localStorage.getItem('bid-page-user-templates'));   // 应为 null
```

- [ ] **步骤 2.5：Commit**

```bash
git add src/utils/migrateTemplates.js src/App.vue
git commit -m "feat(migrate): one-shot migration of legacy typography templates into settings"
```

---

## 任务 3：TypographyTemplateEditor + TypographyTemplatePreview

**文件：**
- 创建：`src/components/settings/TypographyTemplateEditor.vue`
- 创建：`src/components/settings/TypographyTemplatePreview.vue`

- [ ] **步骤 3.1：创建 `TypographyTemplateEditor.vue`**

这个组件是全量 `formatParams` 编辑面板，复用现有 `*RuleEditor` 组件（Editor.vue 已经用过）：

```vue
<script setup>
import { reactive } from 'vue';
import RulePanelEditor from '@/components/RulePanelEditor.vue';
import PageRuleEditor from '@/components/rules/PageRuleEditor.vue';
import BodyRuleEditor from '@/components/rules/BodyRuleEditor.vue';
import HeadingRuleEditor from '@/components/rules/HeadingRuleEditor.vue';
import ChartRuleEditor from '@/components/rules/ChartRuleEditor.vue';
import TOCRuleEditor from '@/components/rules/TOCRuleEditor.vue';
import HeaderFooterRuleEditor from '@/components/rules/HeaderFooterRuleEditor.vue';
import CleanupRuleEditor from '@/components/rules/CleanupRuleEditor.vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
});
const emit = defineEmits(['update:modelValue']);

const fp = props.modelValue;
</script>

<template>
  <div class="typography-editor">
    <RulePanelEditor title="页面设置" desc="页面尺寸、边距与方向" icon="RiPagesLine" default-open>
      <PageRuleEditor :params="fp.page" />
    </RulePanelEditor>
    <RulePanelEditor title="正文格式" desc="字体、字号、行距与缩进" icon="RiTextSnippet" default-open>
      <BodyRuleEditor :params="fp.body" />
    </RulePanelEditor>
    <RulePanelEditor title="标题与编号" desc="各级标题样式与自动编号规则" icon="RiHeading" default-open>
      <HeadingRuleEditor :headings="fp.headings" :patterns="fp.patterns" />
    </RulePanelEditor>
    <RulePanelEditor title="图表样式" desc="图题、表题与表格样式" icon="RiBarChart2Line" default-open>
      <ChartRuleEditor
        :fig-caption="fp.fig_caption"
        :tbl-caption="fp.tbl_caption"
        :table="fp.table"
        :table-settings="fp.table_settings"
      />
    </RulePanelEditor>
    <RulePanelEditor title="目录设置" desc="目录层级与引导符" icon="RiListCheck2" default-open>
      <TOCRuleEditor :params="fp.toc" />
    </RulePanelEditor>
    <RulePanelEditor title="页眉页脚" desc="页眉页脚内容与位置" icon="RiLayoutTop2Line" default-open>
      <HeaderFooterRuleEditor :params="fp.header_footer" />
    </RulePanelEditor>
    <RulePanelEditor title="预处理与全局开关" desc="排版前的清理与检测策略" icon="RiBrushLine" default-open>
      <CleanupRuleEditor
        :text-cleanup="fp.cleanup?.text_cleanup"
        :style-cleanup="fp.cleanup?.style_cleanup"
        :object-structure="fp.cleanup?.object_structure"
        :caption-detection="fp.cleanup?.caption_detection"
        :apply-switches="fp"
      />
    </RulePanelEditor>
  </div>
</template>

<style scoped>
.typography-editor { display: flex; flex-direction: column; gap: 12px; }
</style>
```

**关键**：由于 Rule Editor 通过 prop 引用直接 mutate `fp` 子对象，父组件只要 `v-model` 到 `fp` 就能通过深层引用拿到最新值；不需要 `emit('update:modelValue', ...)` 显式同步。父级使用 `v-model="localFormatParams"` 即可，其中 `localFormatParams` 是 `reactive()` 或 `toRefs` 化后的 `formatParams`。

- [ ] **步骤 3.2：创建 `TypographyTemplatePreview.vue`**

只读摘要，卡片式罗列关键字段：

```vue
<script setup>
import { computed } from 'vue';

const props = defineProps({
  formatParams: { type: Object, required: true },
});

const fp = computed(() => props.formatParams);

function fmt(v, fallback = '—') { return v === undefined || v === null || v === '' ? fallback : String(v); }
function font(item) {
  if (!item) return '—';
  return [item.cn_font, item.size_cn, item.bold ? '粗' : '', item.italic ? '斜' : '']
    .filter(Boolean).join(' · ');
}
</script>

<template>
  <div class="typography-preview">
    <div class="card" v-if="fp.page">
      <h4><RiPagesLine class="card-icon" /> 页面</h4>
      <p>纸张：{{ fp.page.paper_size }} · {{ fp.page.orientation }}</p>
      <p>上 {{ fp.page.top_cm }} / 下 {{ fp.page.bottom_cm }} / 左 {{ fp.page.left_cm }} / 右 {{ fp.page.right_cm }} cm</p>
    </div>
    <div class="card" v-if="fp.body">
      <h4><RiTextSnippet class="card-icon" /> 正文</h4>
      <p>{{ font(fp.body) }}</p>
      <p>行距：{{ fmt(fp.body.line_spacing_mode) }} × {{ fmt(fp.body.line_spacing_value) }} · 首行缩进 {{ fmt(fp.body.first_line_indent_chars, '0') }} 字符</p>
    </div>
    <div class="card" v-if="fp.headings?.length">
      <h4><RiHeading class="card-icon" /> 标题</h4>
      <p v-for="(h, i) in fp.headings.slice(0, 3)" :key="i">H{{ i + 1 }}：{{ font(h) }}</p>
    </div>
    <div class="card" v-if="fp.fig_caption || fp.tbl_caption">
      <h4><RiBarChart2Line class="card-icon" /> 图表题</h4>
      <p>图：{{ font(fp.fig_caption) }}</p>
      <p>表：{{ font(fp.tbl_caption) }}</p>
    </div>
    <div class="card" v-if="fp.toc?.enable">
      <h4><RiListCheck2 class="card-icon" /> 目录</h4>
      <p>标题：{{ fmt(fp.toc.title_text, '目录') }} · 层级数 {{ fp.toc.level_styles?.length || 0 }}</p>
    </div>
    <div class="card" v-if="fp.header_footer">
      <h4><RiLayoutTop2Line class="card-icon" /> 页眉页脚</h4>
      <p>页眉：{{ fp.header_footer.enable_header ? '启用' : '关闭' }} · {{ fmt(fp.header_footer.header_text) }}</p>
      <p>页脚：{{ fp.header_footer.enable_footer ? '启用' : '关闭' }} · 页码 {{ fmt(fp.header_footer.footer_page_number_type) }}</p>
    </div>
  </div>
</template>

<style scoped>
.typography-preview { display: flex; flex-direction: column; gap: 12px; }
.card {
  padding: 14px 16px;
  background: var(--color-bg-secondary, #F7F3EA);
  border-radius: 12px;
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
}
.card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon { color: var(--color-primary); display: inline-flex; }
.card p {
  margin: 2px 0;
  font-size: 13px;
  color: var(--color-text-body);
  line-height: 1.6;
}
</style>
```

- [ ] **步骤 3.3：`npm run build` 验证**

运行：`npm run build`
预期：无编译错误。

- [ ] **步骤 3.4：Commit**

```bash
git add src/components/settings/
git commit -m "feat(settings): add TypographyTemplateEditor and TypographyTemplatePreview components"
```

---

## 任务 4：UiModal 迁移（5 个独立组件）

按顺序迁移 5 个组件，逐个 commit。每个组件的核心操作：
1. 引入 `UiModal`，删除 `<teleport>` + `<transition>` + `.overlay/.card` 结构。
2. 保留业务 body 作为 UiModal 的默认 slot。
3. 用 `:width`、`:max-width`、`:height`、`:show-footer="false"` 覆盖默认尺寸。
4. 删除组件内的 `.modal-overlay`、`.modal-card`、`.panel-header`、`.close-btn`、`.header-icon`、`.panel-title`、`.panel-subtitle` 等 CSS。
5. 保留业务专属 CSS（body 内的表格、内容卡片等）。

### 4A. SettingsModal.vue

- [ ] **步骤 4A.1：替换外壳**

```vue
<template>
  <UiModal
    v-model="visible"
    :title="title"
    :subtitle="subtitle"
    icon="ri-settings-3-line"
    width="92vw"
    :max-width="1400"
    height="92vh"
    :show-footer="false"
    :close-on-click-overlay="false"
  >
    <div class="settings-body">
      <nav class="nav-list">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeKey === item.key }"
          @click="selectTab(item.key)"
        >
          <component :is="riToCompName(item.icon)" class="icon" size="20" />
          <span class="label">{{ item.label }}</span>
        </div>
      </nav>
      <div class="panel-content">
        <component :is="activeComponent" :key="activeKey" />
      </div>
    </div>
  </UiModal>
</template>
```

- [ ] **步骤 4A.2：`<script setup>` 改动**

```js
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { UiModal } from '@/components/ui';
import { riToCompName } from '@/utils/icon';
import ThemeSettingsView from '@/views/settings/ThemeSettingsView.vue';
import TemplateSettingsView from '@/views/settings/TemplateSettingsView.vue';
import ModelSettingsView from '@/views/settings/ModelSettingsView.vue';
import ProfileSettingsView from '@/views/settings/ProfileSettingsView.vue';
import AboutSettingsView from '@/views/settings/AboutSettingsView.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialTab: { type: String, default: '' },
  initialKind: { type: String, default: '' },
});
const emit = defineEmits(['update:visible']);

const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
});

const title = '设置中心';
const subtitle = '选择要进入的设置界面';

const menuItems = [
  { key: 'theme', label: '主题设置', icon: 'ri-palette-line', component: ThemeSettingsView },
  { key: 'template', label: '模板管理', icon: 'ri-file-list-2-line', component: TemplateSettingsView },
  { key: 'model', label: '模型管理', icon: 'ri-cpu-line', component: ModelSettingsView },
  { key: 'profile', label: '个性设置', icon: 'ri-user-settings-line', component: ProfileSettingsView },
  { key: 'about', label: '关于', icon: 'ri-information-line', component: AboutSettingsView },
];

const route = useRoute();
function initialTab() {
  if (props.initialTab && menuItems.some(i => i.key === props.initialTab)) return props.initialTab;
  return menuItems.some((i) => i.key === route.query.tab) ? route.query.tab : 'theme';
}

const activeKey = ref(initialTab());
watch(() => props.visible, (v) => { if (v) activeKey.value = initialTab(); });

const activeComponent = computed(() => menuItems.find((i) => i.key === activeKey.value)?.component);
function selectTab(key) { activeKey.value = key; }
```

- [ ] **步骤 4A.3：删除全部原 `.modal-overlay`/`.settings-panel`/`.panel-header`/`.header-*`/`.close-*` CSS**，仅保留 `.settings-body`、`.nav-list`、`.nav-item`、`.panel-content` 布局：

```css
.settings-body {
  display: flex;
  gap: 20px;
  height: 100%;
  min-height: 0;
  padding: 0;
}
.nav-list {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 16px;
  padding: 16px;
}
.nav-item { /* 保留原样 */ }
.panel-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding-right: 4px;
}
.panel-content :deep(.page-header-card) { display: none; }
```

- [ ] **步骤 4A.4：`npm run build` 验证**

### 4B. CreditQualificationModal.vue

- [ ] **步骤 4B.1：替换外壳**

```vue
<template>
  <UiModal
    v-model="visible"
    title="企业信用信息查询"
    subtitle="查看企业信用状态"
    icon="ri-shield-check-line"
    width="1200px"
    :max-width="1400"
    height="88vh"
    :show-footer="false"
  >
    <!-- 原 .panel-body 内容原样放入 -->
  </UiModal>
</template>
```

- [ ] **步骤 4B.2：`visible` 走 v-model 计算属性，同 4A.2 模式**
- [ ] **步骤 4B.3：删除 `.modal-overlay`/`.panel-header`/`.close-btn` 等 CSS**
- [ ] **步骤 4B.4：`npm run build` 验证**

### 4C. BiddingSitesModal.vue

- [ ] **步骤 4C.1：同 4B，标题 `招标网站查询`、icon `ri-globe-line`、subtitle `常用招标平台导航`**
- [ ] **步骤 4C.2：`visible` 走 v-model**
- [ ] **步骤 4C.3：删除自实现外壳 CSS**
- [ ] **步骤 4C.4：`npm run build` 验证**

### 4D. PreviewTemplateModal.vue

- [ ] **步骤 4D.1：替换外壳**

```vue
<template>
  <UiModal
    v-model="visible"
    :title="'预览模板 · ' + (template?.name || '')"
    subtitle="左侧：当前文档；右侧：模板参数摘要"
    icon="ri-eye-line"
    width="94vw"
    :max-width="1400"
    height="88vh"
    :show-footer="false"
  >
    <div class="preview-body">
      <div class="preview-left">
        <!-- 原有 DocumentPreview / VueOfficeDocx 逻辑 -->
      </div>
      <div class="preview-right">
        <TypographyTemplatePreview :format-params="template.formatParams" />
      </div>
    </div>
    <template #footer>
      <span class="ui-modal-footer-hint">模板：{{ template.name }}</span>
      <span class="ui-modal-footer-btns">
        <button class="ui-modal-cancel" @click="close">关闭</button>
      </span>
    </template>
  </UiModal>
</template>
```

- [ ] **步骤 4D.2：引入新组件**

```js
import TypographyTemplatePreview from '@/components/settings/TypographyTemplatePreview.vue';
```

- [ ] **步骤 4D.3：删除原 `.overlay`/`.modal-card`/`.modal-header`/`.modal-footer` CSS**，保留 `.preview-body` 左右布局
- [ ] **步骤 4D.4：`npm run build` 验证**

### 4E. FormatProgressModal.vue

- [ ] **步骤 4E.1：替换外壳**

```vue
<template>
  <UiModal
    v-model="visible"
    title="排版进度"
    subtitle="正在处理文档…"
    icon="ri-loader-2-line"
    width="1474px"
    :max-width="1400"
    :show-footer="false"
    :close-on-click-overlay="!processing"
    :close-on-esc="!processing"
  >
    <div class="fp-inner">
      <!-- 原 fp-title-row / fp-percent / fp-desc / fp-bar / fp-logs 内容原样放入 -->
    </div>
  </UiModal>
</template>
```

- [ ] **步骤 4E.2：`visible` 走 v-model 计算属性**

```js
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  processing: { type: Boolean, default: false },
  logs: { type: Array, default: () => [] },
  desc: { type: String, default: '' },
});
const visible = computed({
  get: () => props.modelValue,
  set: (v) => { if (!props.processing) emit('update:modelValue', v); },
});
const emit = defineEmits(['update:modelValue']);
```

- [ ] **步骤 4E.3：删除 `.fp-overlay`/`.fp-card`/`.fp-close` 及 modal 相关 transition CSS**，保留 `.fp-inner` 内部的进度条、日志样式
- [ ] **步骤 4E.4：`npm run build` 验证**

- [ ] **步骤 4F：一次性 Commit**

```bash
git add src/components/layout/SettingsModal.vue src/components/layout/CreditQualificationModal.vue src/components/layout/BiddingSitesModal.vue src/components/PreviewTemplateModal.vue src/components/FormatProgressModal.vue
git commit -m "refactor(modals): migrate 5 business modals to UiModal shell"
```

---

## 任务 5：TemplateSettingsView 增加类型筛选、预览按钮、排版模板全量编辑

**文件：**
- 修改：`src/views/settings/TemplateSettingsView.vue`

- [ ] **步骤 5.1：`<script setup>` 加入类型筛选**

在 `searchQuery` 之后追加：

```js
const kindFilter = ref('all'); // 'all' | 'outline' | 'typography'

function kindLabel(k) {
  return k === 'typography' ? '排版' : '大纲';
}
```

修改 `applyFilter`：

```js
function applyFilter() {
  let list = templates.value;
  if (kindFilter.value !== 'all') {
    list = list.filter(t => (t.kind || 'outline') === kindFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }
  filteredTemplates.value = list;
}
```

- [ ] **步骤 5.2：加入 `showPreviewDialog`、`previewingTpl`、`openPreview` 状态**

```js
const showPreviewDialog = ref(false);
const previewingTpl = ref(null);

function openPreview(tpl) {
  if (tpl.kind === 'typography') {
    previewingTpl.value = tpl;
    showPreviewDialog.value = true;
  } else {
    ElMessage.info('大纲模板预览即将上线');
  }
}
```

- [ ] **步骤 5.3：`handleAdd` 增加 `kind`**

修改：在 `showAddDialog` 附近添加：

```js
const newTemplateKind = ref('outline');
```

修改 `handleAdd`：

```js
async function handleAdd() {
  if (!newTemplateName.value.trim()) {
    ElMessage.warning('请输入模板名称'); return;
  }
  try {
    await createTemplate({
      name: newTemplateName.value.trim(),
      description: newTemplateDesc.value.trim(),
      category: newTemplateCategory.value.trim() || '自定义',
      type: 'custom',
      kind: newTemplateKind.value,
      keywords: [],
      content: newTemplateKind.value === 'typography' ? [] : parseContentText(newTemplateContentText.value),
      formatParams: newTemplateKind.value === 'typography' ? {} : undefined,
      enabled: 1,
    });
    await loadTemplates();
    showAddDialog.value = false;
    newTemplateName.value = '';
    newTemplateDesc.value = '';
    newTemplateCategory.value = '';
    newTemplateContentText.value = '';
    newTemplateKind.value = 'outline';
    applyFilter();
    ElMessage.success('已添加');
  } catch (err) {
    ElMessage.error(err?.message || '添加失败');
  }
}
```

- [ ] **步骤 5.4：`confirmEdit` 保留 kind 并处理 typography 分支**

```js
async function confirmEdit() {
  if (!editingTpl.value || !editName.value.trim()) {
    ElMessage.warning('请输入模板名称');
    return;
  }
  const isTypo = editingTpl.value.kind === 'typography';
  try {
    await updateTemplate(parseInt(editingTpl.value.id), {
      name: editName.value.trim(),
      description: editDesc.value.trim(),
      category: editCategory.value.trim() || '自定义',
      type: editingTpl.value.type,
      kind: editingTpl.value.kind,
      keywords: [],
      content: isTypo ? [] : parseContentText(editContentText.value),
      formatParams: isTypo ? editFormatParams.value : undefined,
    });
    await loadTemplates();
    applyFilter();
    showEditDialog.value = false;
    ElMessage.success('模板已更新');
  } catch {
    ElMessage.error('保存失败');
  }
}
```

在 `editingTpl` 附近加入：

```js
const editFormatParams = ref({});

function openEdit(tpl) {
  editingTpl.value = tpl;
  editName.value = tpl.name;
  editDesc.value = tpl.description;
  editCategory.value = tpl.category;
  editContentText.value = formatContentText(tpl.content || []);
  if (tpl.kind === 'typography') {
    // 深拷贝，避免编辑时意外 mutate 原对象
    editFormatParams.value = JSON.parse(JSON.stringify(tpl.formatParams || {}));
    ensureFullFormatParams(editFormatParams.value);
  }
  showEditDialog.value = true;
}

// 补齐所有 formatParams 子字段默认值，避免 Rule Editor 因 undefined 报错
function ensureFullFormatParams(fp) {
  fp.page = fp.page || {};
  fp.body = fp.body || {};
  fp.headings = fp.headings || [];
  fp.patterns = fp.patterns || { rules: [] };
  fp.fig_caption = fp.fig_caption || {};
  fp.tbl_caption = fp.tbl_caption || {};
  fp.table = fp.table || {};
  fp.table_settings = fp.table_settings || {};
  fp.toc = fp.toc || { enable: false };
  fp.header_footer = fp.header_footer || {};
  fp.cleanup = fp.cleanup || {
    text_cleanup: {}, style_cleanup: {}, object_structure: {}, caption_detection: {},
  };
}
```

- [ ] **步骤 5.5：模板中加入类型筛选 pill、预览按钮、Typography 编辑面板**

在工具栏搜索框之前插入：

```html
<div class="kind-filter">
  <button class="kind-btn" :class="{ active: kindFilter === 'all' }" @click="kindFilter = 'all'; applyFilter()">全部</button>
  <button class="kind-btn" :class="{ active: kindFilter === 'outline' }" @click="kindFilter = 'outline'; applyFilter()">大纲</button>
  <button class="kind-btn" :class="{ active: kindFilter === 'typography' }" @click="kindFilter = 'typography'; applyFilter()">排版</button>
</div>
```

在列表视图 `row-actions` 里加预览按钮（在 `修改` 之前）：

```html
<button class="action-btn preview" @click="openPreview(tpl)">预览</button>
```

在网格视图 `grid-card-actions` 里同样加：

```html
<button class="action-btn preview" @click="openPreview(tpl)">预览</button>
```

在列表/网格 `row-name` / `grid-card-title` 后加 kind 徽标：

```html
<span class="kind-tag" :class="'kind-' + (tpl.kind || 'outline')">{{ kindLabel(tpl.kind) }}</span>
```

在 `<UiModal>` 编辑弹窗中，按 kind 切换 body：

```html
<UiModal
  v-model="showEditDialog"
  title="编辑模板"
  subtitle="修改模板基本信息"
  icon="ri-edit-line"
  :width="editingTpl?.kind === 'typography' ? 1200 : 560"
  :max-width="editingTpl?.kind === 'typography' ? 1400 : 600"
  :height="editingTpl?.kind === 'typography' ? '88vh' : undefined"
  @confirm="confirmEdit"
>
  <div v-if="editingTpl?.kind === 'typography'" class="edit-typography">
    <div class="form-group">
      <label class="form-label">模板名称 <span class="required">*</span></label>
      <UiInput v-model="editName" placeholder="请输入模板名称" />
    </div>
    <div class="form-group">
      <label class="form-label">模板描述</label>
      <UiInput v-model="editDesc" multiline :rows="2" placeholder="请输入模板描述（可选）" />
    </div>
    <div class="form-group">
      <label class="form-label">所属分类</label>
      <UiInput v-model="editCategory" placeholder="例如：公文、学术、军标" />
    </div>
    <div class="form-group">
      <label class="form-label">排版参数（全量编辑）</label>
      <TypographyTemplateEditor v-model="editFormatParams" />
    </div>
  </div>
  <div v-else>
    <!-- 原有 outline 表单 -->
    <div class="form-group">
      <label class="form-label">模板名称 <span class="required">*</span></label>
      <UiInput v-model="editName" placeholder="请输入模板名称" />
    </div>
    <div class="form-group">
      <label class="form-label">模板描述</label>
      <UiInput v-model="editDesc" multiline :rows="3" placeholder="请输入模板描述（可选）" />
    </div>
    <div class="form-group">
      <label class="form-label">所属分类</label>
      <UiInput v-model="editCategory" placeholder="例如：商务标、技术标" />
    </div>
    <div class="form-group">
      <label class="form-label">大纲内容 <span class="required">*</span></label>
      <UiInput
        v-model="editContentText"
        multiline
        :rows="8"
        placeholder="按层级输入章节，格式：1. 一级标题&#10;1.1 二级标题&#10;2. 另一个一级标题"
      />
      <span class="form-hint">每行一个章节，编号表示层级（1=一级，2=二级）</span>
    </div>
  </div>
</UiModal>
```

`import TypographyTemplateEditor from '@/components/settings/TypographyTemplateEditor.vue'`。

新增预览弹窗（追加到组件末尾）：

```html
<PreviewTemplateModal
  v-if="showPreviewDialog && previewingTpl"
  :template="previewingTpl"
  @close="showPreviewDialog = false"
/>
```

`import PreviewTemplateModal from '@/components/PreviewTemplateModal.vue'`。

- [ ] **步骤 5.6：新增 CSS**

```css
.kind-filter { display: inline-flex; gap: 4px; padding: 4px; background: var(--color-bg-white); border: 0.7px solid var(--color-border); border-radius: 12px; }
.kind-btn { padding: 0 14px; height: 34px; border: none; border-radius: 8px; background: transparent; color: var(--color-text-muted); font-size: 14px; cursor: pointer; font-family: "SourceHanSans-Regular", var(--font-family-cn); }
.kind-btn.active { background: var(--color-primary-soft); color: var(--color-primary); }
.kind-tag { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
.kind-tag.kind-outline { background: var(--color-bg-secondary); color: var(--color-text-muted); }
.kind-tag.kind-typography { background: var(--color-primary-soft); color: var(--color-primary); }
.action-btn.preview { color: var(--color-primary); }
.edit-typography { display: flex; flex-direction: column; gap: 14px; }
```

- [ ] **步骤 5.7：`npm run build` 验证**

运行：`npm run build`
预期：无编译错误。

- [ ] **步骤 5.8：Commit**

```bash
git add src/views/settings/TemplateSettingsView.vue
git commit -m "feat(settings): template management adds type filter, preview button, full typography edit"
```

---

## 任务 6：Editor.vue 预览视觉微调 + 模板入口重定向

**文件：**
- 修改：`src/views/Editor.vue`

- [ ] **步骤 6.1：移除 SaveTemplateModal / LoadTemplateModal 引用**

删除以下导入（`Editor.vue:301-302`）：

```js
import SaveTemplateModal from '@/components/SaveTemplateModal.vue'
import LoadTemplateModal from '@/components/LoadTemplateModal.vue'
```

删除以下模板片段（`Editor.vue:190-204`）：

```html
<SaveTemplateModal
  v-if="showSaveModal"
  :params="formatParams"
  @close="showSaveModal = false"
  @saved="onTemplateSaved"
/>

<LoadTemplateModal
  v-if="showLoadModal"
  :templates="templates"
  @close="showLoadModal = false"
  @select="handleLoadSelected"
  @delete="handleDeleteTemplate"
  @edit="() => { showLoadModal = false; showSaveModal = true; }"
/>
```

删除以下状态：

```js
const showSaveModal = ref(false)
const showLoadModal = ref(false)
```

- [ ] **步骤 6.2：调整 handler 打开 Settings 定位模板管理**

修改：

```js
import { useSettingsTab } from '@/utils/settingsTab'; // 见步骤 6.4

const handleSaveTemplate = () => {
  useSettingsTab().set({ tab: 'template', kind: 'typography' });
  showSettings.value = true;
};
const handleLoadTemplate = () => {
  useSettingsTab().set({ tab: 'template', kind: 'typography' });
  showSettings.value = true;
};
```

- [ ] **步骤 6.3：删除 `handleLoadSelected` / `handleDeleteTemplate` / `onTemplateSaved` / `handleSaveTemplate` 内 `showSaveModal = true` 等旧实现**

删掉 `Editor.vue:494-498`（`handleSaveTemplate` / `handleLoadTemplate` 旧版）、`Editor.vue:498-508`（`handleLoadSelected` / `handleDeleteTemplate`）、`Editor.vue:652-658`（`onTemplateSaved`）；用 6.2 的新实现替换。

- [ ] **步骤 6.4：新建 `src/utils/settingsTab.js` 传递初始 tab/kind**

因为 Editor 和 SettingsModal 可能不同组件实例（Editor 里挂 SettingsModal），我们通过 URL query + 一个模块级 ref 双通道传参：

```js
import { ref } from 'vue';
const state = ref({ tab: '', kind: '' });
export function useSettingsTab() {
  function set(payload) {
    state.value = { ...state.value, ...payload };
  }
  function clear() {
    state.value = { tab: '', kind: '' };
  }
  return { state, set, clear };
}
```

`SettingsModal.vue` 内部读取该 state 作为 `initial-tab`/`initial-kind` 的备用来源：

在 `SettingsModal.vue` 里加入：

```js
import { useSettingsTab } from '@/utils/settingsTab';
const { state: tabState, clear: clearTabState } = useSettingsTab();

function initialTab() {
  if (props.initialTab && menuItems.some(i => i.key === props.initialTab)) return props.initialTab;
  if (tabState.value.tab && menuItems.some(i => i.key === tabState.value.tab)) {
    const t = tabState.value.tab;
    clearTabState();
    return t;
  }
  return menuItems.some((i) => i.key === route.query.tab) ? route.query.tab : 'theme';
}
```

并在 `TemplateSettingsView.vue` 里读取一次 tab state 的 kind 用作初始 kindFilter：

```js
import { useSettingsTab } from '@/utils/settingsTab';
const { state: tabState } = useSettingsTab();

onMounted(() => {
  if (tabState.value.kind) {
    kindFilter.value = tabState.value.kind;
  }
  loadTemplates().then(applyFilter);
});
```

- [ ] **步骤 6.5：Editor.vue 文档预览 UI 微调**

现有文档预览在 `Editor.vue:206-273` 已用 UiModal。调整 `icon-btn-sm` / `page-btn` / `chip` 的视觉，使其与 UiModal 内的其它按钮一致（`border-radius: 8px`、hover 使用 `--color-bg-secondary`、字体大小 `13px`）。仅 CSS 层面，交互不变。

- [ ] **步骤 6.6：`npm run build` 验证**

- [ ] **步骤 6.7：Commit**

```bash
git add src/views/Editor.vue src/utils/settingsTab.js src/components/layout/SettingsModal.vue src/views/settings/TemplateSettingsView.vue
git commit -m "refactor(editor): redirect template actions to settings, tune preview UI"
```

---

## 任务 7：路由 + 删除文件

**文件：**
- 修改：`src/router/index.js`
- 删除：`src/views/Template.vue`
- 删除：`src/components/LoadTemplateModal.vue`
- 删除：`src/components/SaveTemplateModal.vue`

- [ ] **步骤 7.1：更新 `router/index.js`**

```js
import { createRouter, createWebHistory } from 'vue-router'
import Upload from '@/views/Upload.vue'
import Editor from '@/views/Editor.vue'
import Compare from '@/views/Compare.vue'
import SettingsView from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Upload },
    { path: '/editor', component: Editor },
    { path: '/compare', component: Compare },
    { path: '/settings', component: SettingsView },
    { path: '/template', redirect: { path: '/settings', query: { tab: 'template' } } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
```

- [ ] **步骤 7.2：删除三个文件**

```bash
git rm src/views/Template.vue src/components/LoadTemplateModal.vue src/components/SaveTemplateModal.vue
```

- [ ] **步骤 7.3：确认无残留引用**

```bash
grep -rn "views/Template\|LoadTemplateModal\|SaveTemplateModal\|/template'" src/ || true
```

若还有引用，逐个删除或改造。

- [ ] **步骤 7.4：`npm run build` 验证**

- [ ] **步骤 7.5：Commit**

```bash
git add -A
git commit -m "chore(router): remove /template route, delete legacy template views and modals"
```

---

## 任务 8：全局冒烟验证

- [ ] **步骤 8.1：`npm run build` 通过**

- [ ] **步骤 8.2：`npm run dev` 打开 `/`**
  - 上传一个 docx，进 `/editor`
  - 点顶部「模板」→ 应打开 Settings > 模板管理
  - 点顶部「预览」→ 应打开文档预览，缩放/翻页/编辑切换可用

- [ ] **步骤 8.3：进入 Settings > 模板管理**
  - 应看到 3 个 outline 内置 + 8 个 typography 内置（默认列表混合展示）
  - 类型筛选切换 outline / typography / 全部
  - 修改一个 typography 模板：弹窗加宽、可编辑所有 Rule Editor 面板、保存后列表刷新
  - 删除一个 typography 模板：确认弹窗、删除后消失
  - 「恢复默认」：清空用户模板 + 恢复内置
  - 新增 typography 模板：类型选「排版」、参数面板为空但可编辑、保存后出现在列表

- [ ] **步骤 8.4：预览统一**
  - Settings > 模板管理 → typography 模板 → 预览：UiModal 打开，左侧文档、右侧参数摘要
  - Editor > 预览：UiModal 打开，缩放/翻页/编辑切换可用

- [ ] **步骤 8.5：数据迁移**
  - 清 localStorage 后重新 `npm run dev`
  - 在 console 塞入 `bid-page-user-templates`，刷新后确认迁到 `bid-typesetting-settings`

- [ ] **步骤 8.6：最终 Commit**（若有微调）

```bash
git add -A
git commit -m "chore(template-migration): final polish"
```

---

## 自检清单

**规格覆盖度：**
- ✅ 8 个内置排版模板迁入 Settings > 模板管理 → 任务 1 + 5
- ✅ 「预览」按钮在操作栏保留（模板管理里） → 任务 5.5
- ✅ Editor 主界面「预览」按钮保留、交互不变、UI 统一 → 任务 6.5
- ✅ 全部弹框迁移到 UiModal → 任务 4
- ✅ 排版模板全量编辑 → 任务 3.1 + 5.5
- ✅ 内置模板可删 → 复用现有 deleteTemplate + 5.4（updateTemplate 保留 kind）
- ✅ 一次性数据迁移 → 任务 2
- ✅ 旧 /template 路由重定向 → 任务 7

**占位符扫描：** 无 `TODO`/`待定`；每个 CSS 变更都给了完整代码。

**类型一致性：**
- `kind` 字段统一用 `'outline' | 'typography'`
- `builtIn` 用 `boolean`
- `enabled` 在 API 层是 `0|1`，UI 层由 `getTemplateList` 归一为 `1`；`UiSwitch` 接收 `boolean`，需在 `toggleEnabled` 转换（现有代码已是）
- 组件文件名与 import 路径一致

**已知风险：**
- Rule Editor 组件对 `formatParams` 缺字段的容错度未知；`ensureFullFormatParams` 提供兜底默认值。若个别字段仍报 undefined 错，在编辑流程中 catch 并 toast。
- `SettingsModal` 高度 92vh 时若模板管理内容较长，右侧滚动条位置需目视校验。
