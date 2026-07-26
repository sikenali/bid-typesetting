# Task 5 实现报告

## 完成内容

### 1. Editor.vue - JSON 导入导出功能

**图标导入** (`src/views/Editor.vue:16`)
- 添加了 `RiDownloadLine` 和 `RiUploadLine` 到 remixicon 导入语句

**新增 ref** (`src/views/Editor.vue:72`)
- 添加 `fileInput = ref(null)` 用于隐藏的文件输入元素

**新增函数** (`src/views/Editor.vue:321-347`)
- `handleExportJSON()` — 将 `formatParams` 序列化为 JSON 文件并触发下载，文件名格式为 `排版配置-YYYY-MM-DD.json`
- `handleImportJSON(event)` — 读取用户上传的 JSON 文件，解析后调用 `loadFormatParams` 载入配置，使用 `showToast` 反馈成功/失败

**工具栏按钮** (`src/views/Editor.vue:519-535`)
- 在"载入模板"和"一键排版"之间插入了"导出配置"和"导入配置"两个按钮
- 按钮样式与现有工具栏按钮一致（白色背景、棕色边框、悬停变深米色）
- 导入按钮触发隐藏 `<input type="file" accept=".json">` 的点击事件

### 2. LoadTemplateModal.vue - 编辑按钮增强

**图标导入** (`src/components/LoadTemplateModal.vue:3`)
- 添加了 `RiEdit2Line` 到 remixicon 导入语句

**事件声明** (`src/components/LoadTemplateModal.vue:5`)
- emit 从 `['close', 'select', 'delete']` 扩展为 `['close', 'select', 'delete', 'edit']`

**编辑按钮** (`src/components/LoadTemplateModal.vue:105-112`)
- 在非内置模板卡片上、删除按钮之前添加了编辑按钮（蓝色铅笔图标）
- `v-if="!tpl.builtIn"` 限制仅自定义模板显示
- `@click.stop="emit('edit', tpl)"` 阻止事件冒泡防止触发卡片点击加载

### 3. Editor.vue - 监听 edit 事件 (`src/views/Editor.vue:557`)

- LoadTemplateModal 组件添加了 `@edit="(tpl) => { showLoadModal = false; showSaveModal = true; }"` 处理程序
- 点击编辑按钮后关闭载入模态框、打开保存模态框以编辑选中模板

## 技术要点
- 零新依赖 — 全部使用已有库（Vue refs、FileReader API、Blob/URL.createObjectURL）
- 遵循现有 UI 风格 — 按钮样式与工具栏已有按钮保持一致
- 使用现有 `showToast` 进行成功/错误提示
