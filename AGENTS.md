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
- Colors: `cinnabar` (#C43A31), `cinnabar-dark` (#8B1A1A), `gold` (#D4AF37), `gold-dark` (#B8860B), `jade` (#2D8B57), `jade-light` (#5B8C5A), `cloud-blue` (#5B7DB1), `brown` (#8B7355), `brown-dark` (#5C4033), `brown-muted` (#A0896C), `parchment` (#FDF6E3), `cream` (#F5E6C8), `cream-dark` (#E8D5B0), `cream-darker` (#DCC8A0), `warm-gray` (#F0EBE0), `tan-border` (#C4A97D), `tan-dark` (#A8895E), `tan-light` (#D4BA8C), `diff-red-bg` (#FFF0EE), `diff-green-bg` (#E8F5E0)
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
