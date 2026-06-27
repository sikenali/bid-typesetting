# 文档排版工具设计文档

> 日期: 2026-06-27
> 版本: 1.0

## 概述

中国古典水墨卷轴 × 现代杂志编辑风格的文档排版工具，支持 Word/PDF/Excel/PPT 等 Office 文档的自动化排版编辑。

## 技术栈

| 项目 | 技术 |
|------|------|
| 框架 | Vue 3 + Composition API |
| 路由 | Vue Router |
| 样式 | TailwindCSS 4 (CDN) |
| 图标 | Lucide Vue Next |
| 字体 | Google Fonts (马善政 + 站酷小薇体 + 思源宋体) |
| Office 预览 | vue-office |
| 构建工具 | Vite |

## 配色方案

| 颜色 | 色值 | 用途 |
|------|------|------|
| 羊皮纸底 | `#FDF6E3` | 页面背景 |
| 朱红 | `#C23B22` | 主按钮、强调 |
| 金色 | `#D4AF37` | 装饰线、图标 |
| 玉绿 | `#2D8B57` | 成功状态、保存 |
| 云蓝 | `#5B7DB1` | 标题、链接 |
| 墨黑 | `#2C2C2C` | 正文文字 |
| 留白 | `#FFFFFF` | 卡片背景、间距 |

## 字体方案

| 字体 | 用途 |
|------|------|
| 马善政书法体 | Logo、大标题 |
| 站酷小薇体 | 导航、按钮 |
| 思源宋体 | 正文、文档内容 |

## 项目结构

```
src/
├── router/               # Vue Router 路由配置
├── views/
│   ├── Upload.vue            # 界面一：上传文档
│   ├── Editor.vue            # 界面二：排版编辑（核心）
│   ├── Compare.vue           # 界面三：前后对比
│   └── Settings.vue          # 界面四：设置面板
├── components/
│   ├── Navbar.vue                # 顶部导航栏
│   ├── Sidebar.vue               # 左侧排版标签栏
│   ├── DocumentPreview.vue       # Office 文件预览
│   ├── TemplatePanel.vue         # 模板面板
│   └── WatermarkBg.vue           # 水墨背景组件
├── composables/
│   ├── useDocument.js            # 文档状态管理
│   ├── useTemplate.js            # 模板管理
│   └── useFormatting.js          # 排版逻辑
├── styles/
│   └── tailwind.css              # TailwindCSS 配置 + 自定义样式
└── App.vue                       # 根组件
```

## 界面设计

### 界面一：上传文档
- 居中放置水墨风格上传区域
- 支持拖拽上传和点击上传
- 显示支持的格式（DOCX/PDF/XLSX/PPTX）

### 界面二：排版编辑（核心）
- 左侧边栏：排版标签（页面/正文/标题/图表/目录/页眉页脚）
- 中间：Office 文件预览（vue-office）
- 右侧上方：对应标签的设置项面板
- 底部：保存到模板 + 一键修改按钮

### 界面三：前后对比
- 左右分屏布局
- 左侧：原始文档
- 右侧：排版后文档
- 顶部有同步滚动开关

### 界面四：设置面板
- 模态框/抽屉形式弹出
- 主题黑白切换
- 内置模板选择（GB/T 政府公文等）
- 批注形式开关

## 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Upload | 上传文档 |
| `/editor` | Editor | 排版编辑 |
| `/compare` | Compare | 前后对比 |
| `/settings` | Settings | 设置面板 |

## 数据流

```
Upload → DocumentState → Editor → FormattingLogic → Compare
                                ↓
                          TemplateStore → Settings
```

## 状态管理

- **文档状态**: 文件对象、原始内容、排版后内容
- **模板状态**: 当前模板、自定义模板列表
- **排版状态**: 当前标签、设置项、操作历史
