# 文版猩 — 智能投标文件排版工具

面向政府/企业投标文件的智能排版系统。上传 DOCX 文档，通过标签化设置页面尺寸、正文字体、标题层级等排版参数，一键生成规范化的投标文件，支持在线编辑与前后对比。

---

## 工具介绍

文版猩（Mò Mò Wú Wén）是一款专为投标文件场景设计的 Web 排版工具，目标群体为招投标人员、商务专员和标书制作团队。

**灵感来源**：中国古典水墨卷轴 × 现代杂志编辑风格。视觉上以羊皮纸底色、朱红强调、金色点缀、水墨书法字体传递东方审美，交互上采用三栏式专业布局（标签导航 + 预览区 + 设置面板），对标 Adobe InDesign 的编辑体验。

**核心价值**：投标文件排版具有高度重复性——每份标书都需按招标文件要求设置页边距、标题字体、正文行距、图表编号规则等参数。文版猩将这一过程从手动操作（Word 逐项设置）变为"上传 → 打标签 → 一键生成"的三步流水线，将排版时间从小时级压缩到分钟级。

**设计风格**：

| 元素 | 实现 |
|------|------|
| **底色** | 羊皮纸 `#FDF6E3`，营造古典卷轴质感 |
| **主色** | 朱红 `#C23B22` — 按钮、选中态、强调 |
| **点缀** | 金色 `#D4AF37`、玉绿 `#2D8B57`、云蓝 `#5B7DB1` |
| **字体** | 思源黑体（正文）+ 马善政书法体（装饰标题）+ Noto Serif SC（宋体） |
| **布局** | 三栏式（侧边栏 + 预览区 + 设置面板），留白充足 |
| **边框** | 暖棕 `#E0D5C0`，模拟卷轴装裱 |

---

## 实现原理

系统采用**解析 → 参数化 → 重建**的三段式流水线，支持纯前端模式和前后端混合模式两种部署形态。

### 架构模式

#### 模式一：纯前端 SPA（默认）

所有文档处理均在浏览器本地完成，不依赖任何后端服务器。

| 层次 | 对应模块 | 职责 |
|------|---------|------|
| **视图层** | `views/` + `components/` | 路由页面、UI 组件、面板交互、用户输入采集 |
| **状态层** | `composables/` | 文件状态管理、排版参数存取、差异计算、模板 CRUD |
| **文档处理层** | `useDocumentExport.js` + mammoth/docx | DOCX 解析、OOXML 重建、字体映射、跨平台兼容 |
| **持久化层** | `localStorage` | 排版参数自动保存、用户模板存储、设置持久化 |

**数据流**：视图层通过 composable API 读写状态 → 状态层统一管理数据和差异快照 → 文档处理层消费状态生成 OOXML 输出 → 导出为 `.docx` 文件。

#### 模式二：前后端混合（Go + Unioffice）

当需要服务端批量处理或更高性能时，系统可通过 API 接入后端服务。

**后端技术栈**：

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| **语言** | Go 1.21+ | 高性能、低内存、强类型编译语言 |
| **DOCX 引擎** | [unioffice](https://github.com/unidoc/unioffice) | 工业级 Office 文档处理库，支持 DOCX/XLSX/PPTX |
| **API 框架** | Gin / Chi | RESTful API 路由 |
| **文件上传** | multipart/form-data | 支持 150MB+ 大文件上传 |

**Unioffice 核心能力**：

- **DOCX 读写**：通过 `docx.Document` 直接操作 OOXML 底层结构，支持段落、表格、页眉页脚、目录、编号等完整元素
- **字体管理**：`docx.FontResolver` 实现跨平台字体回退（Windows SimSun → macOS Songti SC → Linux wps-office-fonts）
- **样式系统**：`docx.Style` 支持自定义样式定义，包括字体、字号、行距、缩进、对齐等
- **编号系统**：`docx.Numbering` 支持多级列表、自定义前缀后缀、编号格式
- **文档模板**：`docx.Template` 支持基于模板文件进行参数化替换

**Pipeline 步骤**：

```
上传 DOCX → 预处理（标点/制表符/空行清理）→ 参数应用（页面/正文/标题/图表/目录/页眉页脚）→ 后处理（字段刷新/样式清理）→ 输出 DOCX
```

### 前端实现原理（纯前端模式）

#### 1. DOCX 解析层

用户上传 DOCX 文件后，系统使用 [mammoth.js](https://github.com/mwilliamson/mammoth.js) 将二进制文档解析为结构化 HTML。解析过程中保留原始段落结构、文本样式和文档骨架，同时通过 `@vue-office/docx` 和 `@eigenpal/docx-editor-vue` 提供双模式预览（只读预览 / WYSIWYG 编辑）。

#### 2. 参数化排版引擎

用户通过 7 个标签面板（页面、正文、标题、图表、目录、页眉页脚、初始化）设置排版参数，所有参数集中存储在 `useFormatState` composable 的模块级闭包中。每个参数面板对标 Word 的对应设置对话框：

- **页面**：纸张尺寸/边距/装订线/分栏（Word「布局」选项卡）
- **正文**：中英文字体/字号/行距/段落间距/缩进/对齐/空格（Word「开始」→「段落」）
- **标题**：4 级标题各自的中英文字体/字号/粗斜体/行距/段前段后/缩进 + 编号规则表格（Word「多级列表」）
- **图表**：图题/表题的字体/行距/缩进对齐规则（Word「引用」→「插入题注」）
- **目录**：目录标题 + 4 层级的字体/行距/缩进/前导符样式（Word「引用」→「目录」→「自定义目录」）
- **页眉页脚**：页眉/页脚的内容属性与距离设置（Word「插入」→「页眉/页脚」）

#### 3. DOCX 重建层

使用 [docx.js](https://github.com/dolanmedia/docx) 库（JavaScript 原生 OOXML 生成器）将原始 HTML 内容与排版参数合并，生成符合 OOXML 规范的 `.docx` 文件。关键实现：

- **字体映射表**：中文字体名（宋体/仿宋/黑体/楷体）→ `w:rFonts` 四槽（ascii/hAnsi/eastAsia/cs），确保跨 Office/WPS/LibreOffice 正确回退
- **字号映射**：中文字号名（三号/小四/五号等）→ 半磅值（twip），精确控制字体大小
- **段落属性**：行距（EXACT/AT_LEAST/MULTIPLE）、段前段后间距、缩进（左缩进/首行缩进）、对齐方式
- **编号规则**：通过 OOXML 编号定义（w:numPr/w:numFmt）生成多级列表
- **差异快照**：排版前后参数快照对比，生成可视化差异列表供用户确认

### 跨平台字体兼容

| 字体 | Win+Office | macOS+Office | Linux+WPS |
|------|-----------|-------------|-----------|
| 宋体/SimSun | ✓ 原生 | ↪ Songti SC | ✓ wps-office-fonts |
| 仿宋/FangSong | ✓ 原生 | ↪ STFangsong | ✓ |
| 黑体/SimHei | ✓ 原生 | ↪ Heiti SC | ✓ |
| 楷体/KaiTi | ✓ 原生 | ↪ Kaiti SC | ✓ |

工具生成 DOCX 时使用 `w:rFonts` 四槽填充，确保各平台自动选择最优回退字体。

---

## 软件架构

### 项目结构

```
bid-pageformatting/
├── src/
│   ├── components/
│   │   ├── Navbar.vue               # 顶部导航栏（Logo + 模板/设置入口）
│   │   ├── Sidebar.vue              # 左侧排版标签面板（7 类标签）
│   │   ├── ui/                      # 公共 UI 组件
│   │   │   ├── DropdownSelect.vue   # 自定义下拉选择框（键盘导航/焦点管理）
│   │   │   ├── CheckboxToggle.vue   # 复选框开关组件
│   │   │   ├── SpacingInput.vue     # 数值输入框+单位
│   │   │   └── AlignButtonGroup.vue # 对齐按钮组
│   │   ├── SaveTemplateModal.vue    # 保存模板弹框
│   │   └── panels/
│   │       ├── PagePanel.vue        # 页面参数面板
│   │       ├── BodyPanel.vue        # 正文参数面板
│   │       ├── HeadingPanel.vue     # 标题参数面板（含编号规则表格）
│   │       ├── ChartPanel.vue       # 图表参数面板（图题/表题子标签）
│   │       ├── TOCPanel.vue         # 目录参数面板
│   │       ├── HeaderFooterPanel.vue # 页眉页脚参数面板
│   │       └── ResetPanel.vue       # 初始化面板（清理/检测/全局开关）
│   ├── constants/
│   │   └── ui.js                    # UI 常量（字体/字号/行距/编号规则等）
│   ├── composables/
│   │   ├── useDocument.js           # 文件状态管理（模块级闭包）
│   │   ├── useSettings.js           # 主题/模板/显示选项（localStorage 持久化）
│   │   ├── useFormatState.js        # 排版参数 + before/after 快照 + 差异计算
│   │   ├── useTemplates.js          # 用户模板 CRUD（localStorage）
│   │   ├── useDocumentExport.js     # DOCX 导出引擎（mammoth + docx）
│   │   └── useToast.js              # Toast 消息提示
│   ├── views/
│   │   ├── Upload.vue               # 上传页面
│   │   ├── Editor.vue               # 编辑器（三栏布局 + 双预览引擎）
│   │   ├── Compare.vue              # 前后对比页面
│   │   ├── Settings.vue             # 设置页面（主题/模板/显示模式）
│   │   └── Template.vue             # 模板书架页面
│   ├── router/
│   │   └── index.js                 # 5 条路由配置
│   └── styles/
│       └── tailwind.css             # TailwindCSS v4 主题 tokens
├── backend/                         # （可选）Go 后端服务
│   ├── cmd/server/main.go           # API 入口
│   ├── config.go                    # 排版配置结构体
│   ├── format_headerfooter.go       # 页眉页脚处理
│   ├── format_table.go              # 表格处理
│   ├── preprocess.go                # 文档预处理
│   └── pipeline/                    # Pipeline 步骤定义
├── LICENSE
├── README.md
├── AGENTS.md
├── index.html
├── package.json
└── vite.config.js
```

### 组件依赖关系

```
App.vue
├── Navbar.vue (sticky 顶部导航)
└── <router-view>
    ├── Upload.vue → useDocument.setFile() → /editor
    ├── Editor.vue
    │   ├── Sidebar.vue (7 类排版标签)
    │   │   └── panels/*.vue (根据 activeTab 动态切换)
    │   ├── DocxEditor (@eigenpal/docx-editor-vue / 编辑模式)
    │   └── VueOfficeDocx (@vue-office/docx / 预览模式)
    ├── Compare.vue → useFormatState.diffs
    ├── Settings.vue → useSettings
    └── Template.vue → useTemplates
```

### 状态管理模式

系统采用**模块级闭包**实现跨组件状态共享，无需 Vuex/Pinia：

| Composable | 职责 | 持久化 |
|-----------|------|--------|
| `useDocument` | 当前上传文件 File 对象 + 数据提取 | 内存 |
| `useSettings` | 主题/模板管理/显示选项 | localStorage |
| `useFormatState` | 排版参数 + before/after 快照 + 差异列表 | localStorage |
| `useTemplates` | 用户模板 CRUD | localStorage |
| `useDocumentExport` | DOCX 导出（纯函数，无状态） | — |

### 技术栈

| 层次 | 技术 |
|------|------|
| **框架** | Vue 3 (Composition API + `<script setup>`) |
| **路由** | Vue Router 4（5 条路由） |
| **样式** | TailwindCSS v4（CSS-first 配置） |
| **图标** | @remixicon/vue v4 |
| **编辑器** | @eigenpal/docx-editor-vue（在线编辑 + 修订/评论） |
| **预览** | @vue-office/docx（只读预览） |
| **解析** | mammoth（DOCX → HTML） |
| **生成** | docx（OOXML 生成器） |
| **构建** | Vite 5 |

---

## 声明

1. **使用目的**：本工具旨在辅助投标文件的版面规范化排版，不保证生成的文档完全满足任何特定招标文件或政府标准的要求。用户应自行核对最终文档的合规性。

2. **字体授权**：本工具不包含任何字体文件的嵌入或分发。文档渲染依赖用户系统中已安装的字体。使用的 Google Fonts 网络字体（Source Han Sans SC / Noto Serif SC / Ma Shan Zheng）遵循其各自的 SIL Open Font License。

3. **文档安全**：所有用户文档处理均在浏览器本地完成，不上传至任何服务器。排版引擎和导出功能均为纯前端实现，用户文件数据不离开本地设备。

4. **免责**：本工具按"现有状态"提供，不作任何形式的明示或默示保证，包括但不限于适销性、特定用途适用性和非侵权性的保证。在任何情况下，作者或版权持有人均不对因使用本工具而产生的任何索赔、损害或其他责任负责。

5. **开源许可**：本项目基于 MIT 许可证开源，详情见 [LICENSE](./LICENSE) 文件。

---

## License

[MIT](./LICENSE)
