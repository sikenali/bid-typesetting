# 文版猩 — 智能投标文件排版工具

<p align="center">
  <strong>上传 DOCX · 标签化排版参数 · 一键生成规范标书</strong>
</p>

<p align="center">
  <img src="public/logo-icon.svg" width="120" height="120" alt="文版猩 Logo">
</p>

<p align="center">
  <img alt="Vue" src="https://img.shields.io/badge/Vue_3-3.5-4FC08D?logo=vue.js&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow">
</p>

## 软件介绍

文版猩是一款专为招投标场景设计的文档排版工具。上传 DOCX 文件，通过可视化面板设置页面尺寸、正文字体、标题层级、图表样式等排版参数，一键生成规范化的投标文件。

**核心功能**

| 功能 | 说明 |
|------|------|
| 页面设置 | 纸张尺寸、边距、装订线、分栏（Word「布局」） |
| 正文格式 | 中英文字体/字号/行距/段落间距/缩进/对齐 |
| 标题样式 | 4 级标题各自字体、字号、编号规则配置 |
| 图表样式 | 图题/表题格式 + 表格单元格格式化 |
| 目录生成 | 多级目录标题与层级样式定制 |
| 页眉页脚 | 页眉文本、页脚页码自定义 |
| 初始化清理 | 标点清理、软回车转换、空行删除、样式重置 |

## 技术实现

### 解析 → 参数化 → 重建

系统采用三段式流水线：用户上传 DOCX 后，前端使用 mammoth.js 解析为 HTML，采集排版参数后通过 docx.js（JS 原生 OOXML 生成器）重建符合规范的 `.docx` 文档。中文字体名映射到 `w:rFonts` 四槽（ascii/hAnsi/eastAsia/cs），确保跨 Office/WPS/LibreOffice 正确回退。

### 前端架构

纯 SPA 模式，所有处理在浏览器本地完成，不依赖后端服务器。状态管理采用 Vue 3 composable + localStorage 持久化。7 个标签面板对应 Word 的对应设置对话框，支持模板保存/载入和 JSON 导入导出。

### 后端模式（可选）

通过 Go + unioffice 提供服务端 API 路由，支持批量处理和更高性能。

### 桌面客户端

基于 Electron 构建 Windows 原生应用。

```bash
# 安装依赖
npm install

# 开发模式（需同时运行 Vite dev server）
npm run electron:dev

# 打包 Windows exe
npm run electron:build
```

---

## 声明

1. **使用目的**：本工具旨在辅助投标文件的版面规范化排版，不保证生成的文档完全满足任何特定招标文件或政府标准的要求。用户应自行核对最终文档的合规性。
2. **字体授权**：本工具不包含任何字体文件的嵌入或分发。文档渲染依赖用户系统中已安装的字体。使用的 Google Fonts 遵循其各自的 SIL Open Font License。
3. **文档安全**：所有用户文档处理均在浏览器本地完成，不上传至任何服务器。
4. **免责**：本工具按"现有状态"提供，不作任何形式的明示或默示保证。在任何情况下，作者或版权持有人均不对因使用本工具而产生的任何索赔、损害或其他责任负责。

## License

[MIT](./LICENSE)
