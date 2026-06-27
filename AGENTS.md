# AGENTS.md — Bid Page Formatting

## Project Overview
投标文件排版工具。可上传 docx/PDF 文档 → 系统提取版面信息 → 智能排版 → 生成规范化投标文件。使用 Calicat 设计稿高保真还原，中国古典水墨卷轴×现代杂志编辑风格。

## Tech Stack
- Vue 3 (Composition API + script setup)
- Vue Router 4
- TailwindCSS v4 (new CSS-first config via `@import "tailwindcss"`)
- Vite 5
- @remixicon/vue v4.4.0 (图标库)
- 字体: Source Han Sans SC / Noto Serif SC / Ma Shan Zheng

## Tailwind Theme Tokens
Defined in `src/styles/tailwind.css` using `@theme` directive:
- Colors: `cinnabar` (#C23B22), `cinnabar-dark` (#A83028), `gold` (#D4AF37), `gold-dark` (#C8A45C), `jade` (#2D8B57), `jade-light` (#5B8C5A), `cloud-blue` (#5B7DB1), `ink-black` (#2C2C2C), `brown-dark` (#3D2B1F), `brown` (#5C4033), `brown-muted` (#8B7355), `parchment` (#FDF6E3), `cream` (#FBF7EF), `cream-dark` (#F5EFE0), `cream-darker` (#F0E8D5), `warm-gray` (#EAE5D9), `tan-border` (#E0D5C0), `tan-dark` (#D4C4A8), `tan-light` (#E8DCC8), `diff-red-bg` (#FFF0ED), `diff-green-bg` (#E8F0E0)
- Fonts: `sans` → Source Han Sans SC, `serif` → Noto Serif SC, `calligraphy` → Ma Shan Zheng, `songti` → Noto Serif SC

## RemixIcon Import Convention
Always use named re-export imports: `import { RiNameLine } from '@remixicon/vue'`
NEVER use deep path imports like `import RiName from '@remixicon/vue/RiNameLine'`

## Routing
- `/` → Upload.vue
- `/editor` → Editor.vue
- `/compare` → Compare.vue
- `/settings` → Settings.vue
- `/template` → Template.vue

## Component Tree
```
App.vue
├── Navbar.vue (sticky)
└── <router-view>
    ├── Upload.vue
    ├── Editor.vue
    │   └── Sidebar.vue
    ├── Compare.vue
    ├── Settings.vue
    └── Template.vue
```

## Design Tokens & Layout
- Page width: 1440px design target
- Navbar height: `h-16` (4rem)
- All pages: responsive with max-w-7xl container
- Base bg: `bg-parchment` (#FDF6E3)
- Card bg: `bg-cream` (#F5E6C8)
- Primary accent: `text-cinnabar` (#C43A31)
- Border: `border-tan-border` (#C4A97D)

## Cross-Platform & Cross-Office Font Compatibility

The export engine (`useDocumentExport.js`) generates DOCX using Windows font names (SimSun, FangSong, SimHei, KaiTi). These are only pre-installed on Windows. Behavior on other platforms:

| Platform / Office | 宋体/SimSun | 仿宋/FangSong | 黑体/SimHei | 楷体/KaiTi |
|---|---|---|---|---|
| Win + MS Office | ✓ 原生 | ✓ 原生 | ✓ 原生 | ✓ 原生 |
| Win + WPS | ✓ 原生 | ✓ 原生 | ✓ 原生 | ✓ 原生 |
| macOS + MS Office | ↪ Songti SC | ↪ STFangsong | ↪ Heiti SC | ↪ Kaiti SC |
| macOS + WPS | ↪ 同上 (macOS 字体回退) | ↪ 同上 | ↪ 同上 | ↪ 同上 |
| Linux + WPS | ✓ (wps-office-fonts) | ✓ | ✓ | ✓ |
| Linux + LibreOffice | ↪ Noto Serif CJK SC | ↪ Noto Serif CJK SC | ↪ Noto Sans CJK SC | ↪ Noto Sans CJK SC |

**The generated DOCX uses `w:rFonts` with all four slots (ascii, hAnsi, eastAsia, cs) to ensure the Office app on each platform makes the best possible font substitution.**

### Font Size Handling
`useDocumentExport.js::parseFontSize()` supports:
- Extracting pt number from `"三号 (16pt)"` → 32 half-pts
- Chinese name lookup (`"三号"` → 16pt → 32 half-pts)
- Falls back to 12pt (24 half-pts) if neither matches

### Known Differences (MS Office vs WPS)
- **Paragraph spacing**: WPS rounds `w:spacing` differently; our `line: 560` (28pt fixed) may render ±1pt on WPS
- **Character spacing**: WPS ignores `w:spacing` with `w:val` on certain run properties
- **Table rendering**: Not yet implemented in export; WPS and MS Office handle nested table borders differently
- **Font embedding**: Not implemented (licensing); documents rely on system fonts
- **Page margins**: `w:pgMar` is standard OOXML and renders identically across both

## Session Summary
### 2025-06-27 — Icon Library Migration & Feature Completion
- 卸载 lucide-vue-next，安装 @remixicon/vue v4.4.0
- 更新 index.html：Google Fonts 添加 Source Han Sans SC
- 更新 tailwind.css：添加全套设计系统主题色和字体 tokens
- Navbar.vue：RiFileTextLine(Logo), RiBookmark3Line(模板), RiSettings3Line(设置)
- Upload.vue：RiUploadCloud2Line(上传区), RiAddLine(选择文件), RiFileTextLine/RiFilePdfLine/RiFileList3Line/RiMarkdownLine(格式徽标)
- Sidebar.vue：6标签(RiLayout2Line/RiFileTextLine/RiMarkdownLine/RiBarChart2Line/RiListCheck/RiLayoutTop2Line/RiFileEditLine)+页码按钮
- Editor.vue：三栏布局，右侧设置面板根据activeTab动态切换
- Compare.vue：并排/叠加模式，差异导航栏，RiLayout2Line/RiCollageLine切换
- Settings.vue：三标签(RiPaletteLine/RiBookmark3Line/RiEyeLine)，选择卡片+开关+预览
- Template.vue：模板书架页，RiSearchLine/RiBookOpenLine等
- router/index.js：新增 /template 路由
- 修复 import 规范：统一使用 `import { RiXxx } from '@remixicon/vue'` 命名导入
