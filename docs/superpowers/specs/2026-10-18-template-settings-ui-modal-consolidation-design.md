# 模板库迁移到设置中心 + 弹框统一 · 设计

日期：2026-10-18
状态：待用户批准

## 一、背景

现状存在两套独立模板系统与多套并行的弹框壳：

- **模板 A（排版）**：`src/composables/useTemplates.js:132-383` 定义 8 个内置模板（`formatParams`），localStorage `bid-page-user-templates` 存用户自定义。在 `/template` 页面浏览、预览、应用。
- **模板 B（大纲）**：`src/api/settings.js:139-228` 定义 3 个内置大纲模板（`content`），localStorage `bid-typesetting-settings`。在 Settings > 模板管理（`TemplateSettingsView.vue`）增删改。
- **弹框壳重复**：7 个模态组件（`SettingsModal`、`CreditQualificationModal`、`BiddingSitesModal`、`PreviewTemplateModal`、`LoadTemplateModal`、`SaveTemplateModal`、`FormatProgressModal`）各自实现 `.overlay` + `.modal-card` 结构与 CSS，仅 `Editor.vue` 的文档预览与 Settings 各弹窗已用 `UiModal`。

目标：

1. 把 8 个排版模板迁入 Settings > 模板管理，成为统一管理的模板。
2. Editor 主界面「预览」按钮保留，交互不变；仅其内部 UI 与统一视觉对齐。
3. 把 7 个重复的弹框壳全部基于已有 `UiModal` 重写。

## 二、需求边界（已确认）

| 决策点 | 结论 |
|---|---|
| 排版模板在设置页里能否编辑？ | 可以，弹窗内**全量编辑** `formatParams` 各字段 |
| 内置模板能否删除？ | 可以，**全部可删**（删除即从 localStorage 中移除，可通过「恢复默认」恢复） |
| 模板编辑入口是否统一？ | **统一跳到设置页**；Editor 中「保存模板 / 加载模板」按钮改为打开 Settings 并定位到模板管理 tab |
| 旧用户自定义排版模板数据如何迁移？ | **自动一次性迁移**到 `bid-typesetting-settings.templates`，删除旧 key |
| 弹框整合范围 | **全部**（含 7 个组件）迁移到 `UiModal` |
| Editor 主界面的「预览」按钮 | **保留**，交互不变；**内部 UI** 与统一视觉对齐 |

## 三、数据模型

### 3.1 模板 Schema 扩展

在 `src/api/settings.js` 的模板对象上增加两个可选字段：

```
{
  id: number,
  name: string,
  description: string,
  category: string,
  keywords: string[],
  enabled: 0 | 1,
  type: string,                 // 'bidding' | 'proposal' | 'custom' | ...
  kind: 'outline' | 'typography',  // 新增
  content?: [{ title, level, children? }],   // outline 用
  formatParams?: { page, body, headings, ... },  // typography 用
  builtIn?: boolean,            // 新增：是否为内置模板
  createdAt: number
}
```

- `kind` 缺省时视为 `'outline'`（兼容旧数据）。
- `builtIn: true` 仅为标签，用于在 UI 中标识内置；不影响可删除性。

### 3.2 内置模板合并

在 `api/settings.js` 的 `DEFAULT_TEMPLATES` 中：

- 保留现有 3 个 outline 模板（id: 1-3）。
- 追加 8 个 typography 模板（id: -1, -2, -3, -100 ~ -104），`kind: 'typography'`、`builtIn: true`、`content: []`、`formatParams: <原 useTemplates.js:132-383 对应模板的完整参数>`。

`useTemplates.js` 中原 8 个 `builtinTemplates` 的定义**整体搬到 `api/settings.js`**，`useTemplates.js` 保留作为 Editor 侧的薄适配层：

```js
// src/composables/useTemplates.js（迁移后）
import { getTemplateList } from '@/api/settings';
export function useTemplates() {
  return computed(() => {
    const { templates } = getTemplateList();
    return templates.filter(t => (t.kind || 'outline') === 'typography');
  });
}
```

Editor 中「LoadTemplateModal」若保留则改用此适配层，若被移除则此 composables 也一并清理（见 3.4）。

### 3.3 一次性数据迁移

新增 `src/utils/migrateTemplates.js`：

- 触发时机：`api/settings.js` 的 `getSetting` 首次调用时（或 `App.vue` 启动时）。
- 逻辑：
  1. 读取旧 key `bid-page-user-templates`。
  2. 若存在且为数组，把每条 `{id, name, description, formatParams, ...}` 映射为新 schema（`kind: 'typography'`, `content: []`, `enabled: 1`, `builtIn: false`, `type: 'custom'`）。
  3. 合并到 `bid-typesetting-settings.templates`（id 冲突时重分配 `maxId+1`）。
  4. 删除 `bid-page-user-templates` 旧 key。
  5. 用一次性标记 `settings.migrated.from-use-templates = true` 防止重复。

### 3.4 Editor 侧入口重定向

- 移除 `src/components/LoadTemplateModal.vue`、`src/components/SaveTemplateModal.vue`。
- `Editor.vue` 中原「加载模板 / 保存模板」按钮：改为打开 `SettingsModal` 并传 `:initial-tab="templates"` 与 `:initial-kind="typography"`，让设置页定位到模板管理 tab 且类型过滤为排版模板。
- Editor 中「保存当前参数为模板」入口（若有）：改为弹 UiModal 收集 name/desc/category，然后 `createTemplate({kind:'typography', formatParams, ...})`，成功后 toast。

## 四、UI 层重构

### 4.1 设置页 — 模板管理（TemplateSettingsView.vue 增强）

新增能力：

1. **类型筛选**：在工具栏搜索框左侧新增 `UiInput type="select"` 或三个 pill（全部 / 大纲模板 / 排版模板），默认「全部」。
2. **每行操作增加「预览」**：在列表和网格视图的操作栏都加入 `预览` 按钮（在修改之前），点击打开模板预览弹框。
3. **修改弹窗**：根据 `kind` 切换内容：
   - `kind === 'outline'`：现有章节文本框（不变）。
   - `kind === 'typography'`：全量 `formatParams` 编辑器（见 4.2）。
4. **新建模板**：新增弹窗增加「类型」单选（大纲 / 排版），按选择切换内部表单。
5. **恢复默认**：`api/settings.js` 的 `resetTemplates()` 已支持恢复全部内置；无需改。

### 4.2 排版参数编辑器组件（新增）

新建 `src/components/settings/TypographyTemplateEditor.vue`：

- 内部结构复用 Editor.vue 中已有的各 Panel 组件（`PagePanel`、`HeadingPanel`、`BodyPanel`、`TOCPanel`、`ChartPanel`、`HeaderFooterPanel`）+ CleanupRule 系列。
- Props：`v-model`（`formatParams`）。
- 内部用左侧导航 + 右侧面板的布局，与 Editor.vue 侧边栏一致，但精简视觉。
- 由于 Editor.vue 目前直接把 `formatParams.xxx` 传给各 Panel，本组件只需 `v-model="localFormatParams"` 后解构后传入。
- **只读态支持**：预览弹窗中的参数摘要可复用简化视图；此处先实现可编辑态，预览摘要走独立只读组件（见 4.4）。

### 4.3 UiModal 统一迁移清单

| 组件 | 位置 | 迁移要点 |
|---|---|---|
| `SettingsModal.vue` | `src/components/layout/` | UiModal 外壳（`width: '92vw'`, `max-width: 1400px`, `height: '92vh'`, `show-footer: false`），左侧 sidebar 用 `slot name="header"` 或自定义 header 承载 |
| `CreditQualificationModal.vue` | 同上 | UiModal 外壳，body 承载原表格 |
| `BiddingSitesModal.vue` | 同上 | 同上 |
| `PreviewTemplateModal.vue` | `src/components/` | UiModal `width: '100vw'`、`show-footer: false`，body 两栏：左 `<DocumentPreview>`、右参数摘要 |
| `FormatProgressModal.vue` | `src/components/` | UiModal `show-footer: false`，body 内 progress bar + log list |
| `Editor.vue` 文档预览 | inline | 已用 UiModal，**保留**；仅调整工具栏按钮、页面切换、缩放控制的 CSS 使其视觉与 UiModal 内部规范（`ui-modal-*` 系）一致 |

删除（不再需要）：

- `src/components/LoadTemplateModal.vue`
- `src/components/SaveTemplateModal.vue`

**新增**：

- `src/components/settings/TypographyTemplateEditor.vue`（全量参数编辑）
- `src/components/settings/TypographyTemplatePreview.vue`（只读摘要，供 PreviewTemplateModal 使用）

### 4.4 模板预览弹框（PreviewTemplateModal.vue 重写）

保留原设计：左侧当前文档实时预览、右侧模板参数摘要。改造点：

- 外壳改为 UiModal（`width: 1200px`, `max-width: '94vw'`, `height: '88vh'`, `show-footer: false`，footer slot 放「关闭」按钮）。
- 左侧渲染：保留 `DocumentPreview` 或 `VueOfficeDocx`。
- 右侧渲染：新增只读组件 `TypographyTemplatePreview.vue`，卡片式展示 `page` / `body` / `headings` / `toc` / `chart` / `header_footer` / `patterns` 的关键字段。
- 支持从 Settings 侧栏「预览」按钮打开，也支持从（旧的）`/template` 页面打开——但后者会被移除。

## 五、路由与文件清理

- 移除 `src/views/Template.vue`。
- 移除 `src/router` 中 `/template` 路由项。
- 检查全局导航 `TopNav.vue` / `PageFooter.vue` 里是否有指向 `/template` 的入口，改为打开 Settings 定位到模板管理 tab。
- 检查 `MainApp.vue` / `App.vue` 里的 `LoadTemplateModal` / `SaveTemplateModal` 引用同步移除。

## 六、弹框整合原则

`UiModal` 作为唯一外壳。所有业务弹框必须遵循：

1. 用 `v-model` 控制显隐，用 `title` / `subtitle` / `icon` 描述语义。
2. 内容差异通过默认 slot 承载；差异较大的 header / footer 通过具名 slot 承载。
3. 不允许业务组件自实现 `.overlay` + `.modal-card` 结构或自实现 `role="dialog"`。
4. 需要进度/日志/表格等复杂内容时，body 内部自由，但外壳与头部样式必须复用 UiModal。
5. 特殊尺寸（超宽如 92vw，超高如 92vh）通过 props 传入，不覆盖 CSS。

## 七、验证与测试

1. **数据迁移**：写入 mock 的 `bid-page-user-templates` localStorage，启动应用后检查：
   - `bid-typesetting-settings.templates` 里出现了对应 typography 条目（`kind` 正确）。
   - `bid-page-user-templates` 已被删除。
   - `settings.migrated.from-use-templates === true`。
2. **模板管理**：
   - 列表和网格视图都能看到 8 个内置 + 用户模板。
   - 类型筛选能过滤 outline / typography。
   - 修改 typography 模板：弹窗能编辑所有 formatParams 字段，保存后 Editor 中「应用」结果正确。
   - 删除内置模板后可通过「恢复默认」回来。
   - 新建 typography 模板：能收集完整参数并保存。
3. **预览统一**：
   - Editor 主界面「预览」按钮点击，UiModal 打开、工具栏可用（缩放 / 翻页 / 编辑切换）。
   - Settings > 模板管理 → 单个排版模板 → 「预览」，UiModal 打开、左右分栏、关闭按钮可点。
4. **弹框整合**：全项目 `grep -R "\.modal-overlay\|\.modal-card\|\.fp-overlay\|\.fp-card\|\.overlay"` 应无残留业务组件；仅 `UiModal.vue` 中保留。
5. **路由**：`/template` 访问应重定向到 `/settings` 或 `NotFound`（决定：重定向到 `/settings` 并定位模板管理 tab）。
6. **lint / build**：`npm run lint`、`npm run build` 通过。

## 八、非目标

- 不改 `DocumentPreview.vue` 内部的 docx/pdf/xlsx/pptx 分支逻辑。
- 不改 `Editor.vue` 中「一键排版」「规则编辑器」等业务逻辑。
- 不改 `confirmDialog` / `ToastContainer` 体系。
- 不新增独立的设计语言；沿用现有 `UiModal` 与主题变量。

## 九、影响面

- 修改文件：
  - `src/api/settings.js`（扩展 schema、DEFAULT_TEMPLATES、迁移函数）
  - `src/composables/useTemplates.js`（改为 settings 适配层）
  - `src/views/settings/TemplateSettingsView.vue`（新增类型筛选、预览按钮、全量参数编辑）
  - `src/components/layout/SettingsModal.vue`（UiModal 外壳）
  - `src/components/layout/CreditQualificationModal.vue`（UiModal 外壳）
  - `src/components/layout/BiddingSitesModal.vue`（UiModal 外壳）
  - `src/components/PreviewTemplateModal.vue`（UiModal 外壳 + 新右侧组件）
  - `src/components/FormatProgressModal.vue`（UiModal 外壳）
  - `src/views/Editor.vue`（预览工具栏 UI 微调；移除 LoadTemplateModal / SaveTemplateModal 引用；保存模板入口重定向到 Settings）
  - `src/router/index.js`（移除 `/template`，增加重定向）
  - `src/App.vue` / `src/views/MainApp.vue`（移除已删组件的挂载）
- 新增文件：
  - `src/utils/migrateTemplates.js`
  - `src/components/settings/TypographyTemplateEditor.vue`
  - `src/components/settings/TypographyTemplatePreview.vue`
- 删除文件：
  - `src/views/Template.vue`
  - `src/components/LoadTemplateModal.vue`
  - `src/components/SaveTemplateModal.vue`

## 十、风险与回滚

- **风险 A**：`formatParams` 复杂度高，全量编辑弹窗可能过长导致 body 滚动条混乱。缓解：TypographyTemplateEditor 内部用左侧导航 + 右侧单栏，避免一次性铺满。
- **风险 B**：数据迁移函数若在 settings.js 里被循环调用（`getSetting` 频繁触发），可能反复执行。缓解：用 `migrated.from-use-templates` 标记，且迁移函数幂等。
- **风险 C**：Editor 中「加载模板」按钮移除后，用户可能不习惯。缓解：Editor 侧保留「模板」入口按钮，点击打开 Settings 定位到模板管理，文案清晰。
- **回滚**：所有变更集中在一个 commit；`useTemplates.js` 保持 API 兼容（返回值仍是 typography 模板数组），Editor 侧无需大改。
