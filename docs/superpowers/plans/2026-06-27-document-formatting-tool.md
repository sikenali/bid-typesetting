# 文档排版工具实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个中国古典水墨风格的文档排版工具，支持上传、编辑、对比、设置四大功能模块。

**架构：** Vue 3 SPA 应用，通过 Vue Router 管理四个页面。使用 TailwindCSS CDN 实现自定义主题，vue-office 实现文档预览，Lucide 图标库提供 UI 图标。

**技术栈：** Vue 3 + Vite + Vue Router + TailwindCSS 4 (CDN) + Lucide Vue Next + vue-office + Google Fonts

---

### 任务 1：初始化 Vue 3 + Vite 项目

**文件：**
- 创建：`package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue`
- 修改：无

- [ ] **步骤 1：创建项目基础文件**

使用 Vite 创建 Vue 3 项目：

```bash
npm.cmd create vite@latest . -- --template vue
```

- [ ] **步骤 2：安装依赖**

```bash
npm.cmd install
npm.cmd install vue-router@4 lucide-vue-next vue-office
```

- [ ] **步骤 3：安装 TailwindCSS 4**

```bash
npm.cmd install tailwindcss @tailwindcss/vite
```

- [ ] **步骤 4：配置 Vite**

修改 `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
```

- [ ] **步骤 5：创建入口文件**

创建 `src/main.js`:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './styles/tailwind.css'

createApp(App).mount('#app')
```

- [ ] **步骤 6：创建根组件**

创建 `src/App.vue`:

```vue
<script setup>
</script>

<template>
  <div class="min-h-screen bg-parchment">
    <router-view />
  </div>
</template>

<style scoped>
</style>
```

- [ ] **步骤 7：配置 TailwindCSS**

创建 `src/styles/tailwind.css`:

```css
@import "tailwindcss";

@theme {
  --color-parchment: #FDF6E3;
  --color-cinnabar: #C23B22;
  --color-gold: #D4AF37;
  --color-jade: #2D8B57;
  --color-cloud-blue: #5B7DB1;
  --color-ink-black: #2C2C2C;
  --color-white: #FFFFFF;

  --font-calligraphy: 'Ma Shan Zheng', cursive;
  --font-xiaowei: 'ZCOOL XiaoWei', cursive;
  --font-songti: 'Noto Serif SC', serif;
}
```

- [ ] **步骤 8：配置 index.html 引入 Google Fonts**

修改 `index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>文档排版工具</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet">
  </head>
  <body class="bg-parchment font-songti text-ink-black">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **步骤 5：验证项目启动**

```bash
npm.cmd run dev
```

预期：浏览器打开 `http://localhost:5173` 显示空白页面

- [ ] **步骤 6：Commit**

```bash
git add -A
git commit -m "feat: 初始化 Vue 3 + Vite 项目基础结构"
```

---

### 任务 2：创建路由和页面骨架

**文件：**
- 创建：`src/router/index.js`, `src/views/Upload.vue`, `src/views/Editor.vue`, `src/views/Compare.vue`, `src/views/Settings.vue`
- 修改：`src/App.vue`

- [ ] **步骤 1：创建路由配置**

创建 `src/router/index.js`:

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue'
import Editor from '../views/Editor.vue'
import Compare from '../views/Compare.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', component: Upload },
  { path: '/editor', component: Editor },
  { path: '/compare', component: Compare },
  { path: '/settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

- [ ] **步骤 2：配置 App.vue 使用路由**

修改 `src/App.vue`:

```vue
<script setup>
import { useRouter } from 'vue-router'
import { BookText, Settings as SettingsIcon, LayoutTemplate } from 'lucide-vue-next'
import Navbar from './components/Navbar.vue'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-parchment font-songti text-ink-black">
    <Navbar />
    <main class="pt-16">
      <router-view />
    </main>
  </div>
</template>
```

- [ ] **步骤 3：配置 main.js 注册路由**

修改 `src/main.js`:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tailwind.css'

createApp(App).use(router).mount('#app')
```

- [ ] **步骤 4：创建四个页面组件（骨架）**

创建 `src/views/Upload.vue`:

```vue
<script setup>
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <h1 class="text-4xl font-calligraphy text-cinnabar">上传文档</h1>
  </div>
</template>
```

创建 `src/views/Editor.vue`:

```vue
<script setup>
</script>

<template>
  <div class="min-h-screen p-8">
    <h1 class="text-4xl font-calligraphy text-cinnabar">排版编辑</h1>
  </div>
</template>
```

创建 `src/views/Compare.vue`:

```vue
<script setup>
</script>

<template>
  <div class="min-h-screen p-8">
    <h1 class="text-4xl font-calligraphy text-cinnabar">前后对比</h1>
  </div>
</template>
```

创建 `src/views/Settings.vue`:

```vue
<script setup>
</script>

<template>
  <div class="min-h-screen p-8">
    <h1 class="text-4xl font-calligraphy text-cinnabar">设置</h1>
  </div>
</template>
```

- [ ] **步骤 5：验证路由切换**

```bash
npm.cmd run dev
```

预期：访问不同路由显示对应标题

- [ ] **步骤 6：Commit**

```bash
git add -A
git commit -m "feat: 创建路由配置和四个页面骨架"
```

---

### 任务 3：实现顶部导航栏组件

**文件：**
- 创建：`src/components/Navbar.vue`
- 修改：无

- [ ] **步骤 1：创建 Navbar 组件**

创建 `src/components/Navbar.vue`:

```vue
<script setup>
import { useRouter } from 'vue-router'
import { Settings, LayoutTemplate } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-sm border-b border-gold/30 flex items-center justify-between px-6 z-50">
    <!-- Logo -->
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
      <span class="text-3xl font-calligraphy text-cinnabar">文版猩</span>
    </div>

    <!-- 右侧按钮 -->
    <div class="flex items-center gap-4">
      <button
        @click="router.push('/editor')"
        class="flex items-center gap-2 px-4 py-2 text-sm font-xiaowei text-ink-black hover:text-cinnabar transition-colors"
      >
        <LayoutTemplate :size="18" />
        模板
      </button>
      <button
        @click="router.push('/settings')"
        class="flex items-center gap-2 px-4 py-2 text-sm font-xiaowei text-ink-black hover:text-cinnabar transition-colors rounded-lg hover:bg-parchment/50"
      >
        <Settings :size="18" />
        设置
      </button>
    </div>
  </nav>
</template>
```

- [ ] **步骤 2：验证导航栏显示**

预期：页面顶部显示"文版猩"Logo 和模板、设置按钮

- [ ] **步骤 3：Commit**

```bash
git add -A
git commit -m "feat: 实现顶部导航栏组件"
```

---

### 任务 4：实现上传文档页面

**文件：**
- 修改：`src/views/Upload.vue`

- [ ] **步骤 1：创建上传页面**

修改 `src/views/Upload.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, FileText, FileType } from 'lucide-vue-next'

const router = useRouter()
const isDragging = ref(false)
const selectedFile = ref(null)

const handleDragOver = (e) => {
  isDragging.value = true
  e.preventDefault()
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleFileChange = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const startEditing = () => {
  if (selectedFile.value) {
    router.push('/editor')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-calligraphy text-cinnabar mb-4">文版猩</h1>
        <p class="text-xl font-xiaowei text-ink-black/70">中国古典水墨风格文档排版工具</p>
      </div>

      <!-- 上传区域 -->
      <div
        class="border-2 border-dashed rounded-xl p-12 text-center transition-all"
        :class="isDragging ? 'border-cinnabar bg-cinnabar/5' : 'border-gold/40 bg-white/50'"
        @drag-over="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <Upload :size="64" class="mx-auto mb-6 text-gold" />
        <p class="text-lg font-xiaowei mb-4">
          {{ selectedFile ? `已选择: ${selectedFile.name}` : '拖拽文件到此处或点击上传' }}
        </p>
        <input
          type="file"
          class="hidden"
          id="file-input"
          accept=".docx,.pdf,.xlsx,.pptx"
          @change="handleFileChange"
        />
        <label
          for="file-input"
          class="inline-flex items-center gap-2 px-6 py-3 bg-cinnabar text-white font-xiaowei rounded-lg cursor-pointer hover:bg-cinnabar/90 transition-colors"
        >
          <FileText :size="18" />
          选择文件
        </label>

        <!-- 支持格式提示 -->
        <div class="mt-8 flex justify-center gap-4 text-sm text-ink-black/50">
          <span class="flex items-center gap-1"><FileType :size="14" /> DOCX</span>
          <span class="flex items-center gap-1"><FileType :size="14" /> PDF</span>
          <span class="flex items-center gap-1"><FileType :size="14" /> XLSX</span>
          <span class="flex items-center gap-1"><FileType :size="14" /> PPTX</span>
        </div>
      </div>

      <!-- 开始编辑按钮 -->
      <div v-if="selectedFile" class="mt-8 text-center">
        <button
          @click="startEditing"
          class="px-8 py-3 bg-jade text-white font-xiaowei rounded-lg hover:bg-jade/90 transition-colors"
        >
          开始排版
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **步骤 2：验证上传页面**

预期：显示水墨风格上传区域，支持拖拽和点击上传

- [ ] **步骤 3：Commit**

```bash
git add -A
git commit -m "feat: 实现上传文档页面"
```

---

### 任务 5：实现排版编辑页面（核心）

**文件：**
- 修改：`src/views/Editor.vue`
- 创建：`src/components/Sidebar.vue`, `src/components/DocumentPreview.vue`

- [ ] **步骤 1：创建侧边栏组件**

创建 `src/components/Sidebar.vue`:

```vue
<script setup>
import { ref } from 'vue'
import {
  Page,
  Type,
  Heading1,
  Table,
  List,
  Header,
  Footer,
  Save,
  Wand2,
} from 'lucide-vue-next'

const activeTab = ref('page')

const tabs = [
  { id: 'page', label: '页面', icon: Page },
  { id: 'body', label: '正文', icon: Type },
  { id: 'heading', label: '标题', icon: Heading1 },
  { id: 'chart', label: '图表', icon: Table },
  { id: 'toc', label: '目录', icon: List },
  { id: 'header', label: '页眉', icon: Header },
  { id: 'footer', label: '页脚', icon: Footer },
]
</script>

<template>
  <aside class="w-64 bg-white/80 backdrop-blur-sm border-r border-gold/30 flex flex-col">
    <!-- 标签列表 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
          :class="activeTab === tab.id ? 'bg-cinnabar/10 text-cinnabar border-l-2 border-cinnabar' : 'hover:bg-parchment/50 text-ink-black/70'"
        >
          <component :is="tab.icon" :size="18" />
          <span class="font-xiaowei">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="p-4 border-t border-gold/30 space-y-2">
      <button class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-jade text-white font-xiaowei rounded-lg hover:bg-jade/90 transition-colors">
        <Save :size="16" />
        保存到模板
      </button>
      <button class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cinnabar text-white font-xiaowei rounded-lg hover:bg-cinnabar/90 transition-colors">
        <Wand2 :size="16" />
        一键修改
      </button>
    </div>
  </aside>
</template>
```

- [ ] **步骤 2：创建文档预览组件**

创建 `src/components/DocumentPreview.vue`:

```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  file: {
    type: File,
    default: null,
  },
})

const previewRef = ref(null)
</script>

<template>
  <div ref="previewRef" class="w-full h-full bg-white shadow-lg overflow-auto p-8">
    <div v-if="!file" class="flex items-center justify-center h-full text-ink-black/40 font-xiaowei">
      请先上传文档
    </div>
    <div v-else class="max-w-[800px] mx-auto">
      <div class="mb-4 pb-4 border-b border-gold/30">
        <h3 class="font-calligraphy text-2xl text-cinnabar">{{ file.name }}</h3>
      </div>
      <div class="prose prose-slate max-w-none">
        <p class="font-songti leading-relaxed text-justify">
          文档预览区域（vue-office 将在实际使用时集成）
        </p>
        <p class="font-songti leading-relaxed text-justify mt-4">
          这里将显示 Office 文档的排版效果，支持 Word、PDF、Excel、PPT 等格式。
        </p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **步骤 3：实现编辑页面**

修改 `src/views/Editor.vue`:

```vue
<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import DocumentPreview from '../components/DocumentPreview.vue'

const activeSetting = ref('page')
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex">
    <!-- 左侧边栏 -->
    <Sidebar />

    <!-- 中间预览区域 -->
    <div class="flex-1 flex flex-col">
      <div class="flex-1 p-4">
        <DocumentPreview />
      </div>
    </div>

    <!-- 右侧设置面板 -->
    <div class="w-80 bg-white/80 backdrop-blur-sm border-l border-gold/30 p-6 overflow-y-auto">
      <h3 class="font-calligraphy text-xl text-cinnabar mb-6">排版设置</h3>
      <div class="space-y-6">
        <!-- 页面设置 -->
        <div class="space-y-3">
          <h4 class="font-xiaowei text-sm text-ink-black/70">页面设置</h4>
          <div class="space-y-2">
            <label class="text-sm">纸张大小</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>A4</option>
              <option>B5</option>
              <option>16开</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm">页边距</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>标准</option>
              <option>窄边距</option>
              <option>宽边距</option>
            </select>
          </div>
        </div>

        <div class="border-t border-gold/20"></div>

        <!-- 正文设置 -->
        <div class="space-y-3">
          <h4 class="font-xiaowei text-sm text-ink-black/70">正文设置</h4>
          <div class="space-y-2">
            <label class="text-sm">字体</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>仿宋_GB2312</option>
              <option>楷体</option>
              <option>宋体</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm">字号</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>三号</option>
              <option>小三</option>
              <option>四号</option>
              <option>小四</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm">行间距</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>固定值 28磅</option>
              <option>1.5倍</option>
              <option>2倍</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **步骤 4：验证编辑页面**

预期：显示三栏布局（侧边栏 + 预览 + 设置面板）

- [ ] **步骤 5：Commit**

```bash
git add -A
git commit -m "feat: 实现排版编辑页面核心布局"
```

---

### 任务 6：实现前后对比页面

**文件：**
- 修改：`src/views/Compare.vue`

- [ ] **步骤 1：创建对比页面**

修改 `src/views/Compare.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const syncScroll = ref(true)
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col">
    <!-- 顶部工具栏 -->
    <div class="px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-gold/30 flex items-center justify-between">
      <h2 class="font-calligraphy text-2xl text-cinnabar">排版前后对比</h2>
      <button
        @click="syncScroll = !syncScroll"
        class="flex items-center gap-2 px-4 py-2 text-sm font-xiaowei rounded-lg transition-colors"
        :class="syncScroll ? 'bg-jade/10 text-jade' : 'bg-parchment/50 text-ink-black/50'"
      >
        <component :is="syncScroll ? Eye : EyeOff" :size="16" />
        同步滚动
      </button>
    </div>

    <!-- 对比区域 -->
    <div class="flex-1 flex">
      <!-- 原始文档 -->
      <div class="flex-1 border-r border-gold/30">
        <div class="p-4 bg-parchment/50 font-xiaowei text-sm text-ink-black/70">原始文档</div>
        <div class="p-8 bg-white h-[calc(100%-2.5rem)] overflow-auto">
          <div class="max-w-[800px] mx-auto prose prose-slate">
            <p class="font-songti leading-relaxed text-justify">
              这里是原始文档内容预览区域。排版前的文档可能包含不规范的格式、不一致的字体、不对齐的段落等问题。
            </p>
            <p class="font-songti leading-relaxed text-justify mt-4">
              通过本工具的排版功能，可以将文档调整为符合 GB/T 政府公文标准或其他自定义模板的规范格式。
            </p>
          </div>
        </div>
      </div>

      <!-- 排版后文档 -->
      <div class="flex-1">
        <div class="p-4 bg-parchment/50 font-xiaowei text-sm text-ink-black/70">排版后文档</div>
        <div class="p-8 bg-white h-[calc(100%-2.5rem)] overflow-auto">
          <div class="max-w-[800px] mx-auto prose prose-slate">
            <p class="font-songti leading-relaxed text-justify">
              这里是排版后的文档内容预览区域。经过规范化处理后，文档格式统一、版面整洁、符合行业标准。
            </p>
            <p class="font-songti leading-relaxed text-justify mt-4">
              排版功能支持页面设置、正文格式、标题层级、图表对齐、目录生成、页眉页脚等全方位调整。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **步骤 2：验证对比页面**

预期：左右分屏显示原始和排版后文档

- [ ] **步骤 3：Commit**

```bash
git add -A
git commit -m "feat: 实现前后对比页面"
```

---

### 任务 7：实现设置面板

**文件：**
- 修改：`src/views/Settings.vue`

- [ ] **步骤 1：创建设置页面**

修改 `src/views/Settings.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { Sun, Moon, FileText, PenLine } from 'lucide-vue-next'

const theme = ref('light')
const template = ref('government')
const annotation = ref(false)

const templates = [
  { id: 'government', name: 'GB/T 政府公文', desc: '符合国家公文标准格式' },
  { id: 'enterprise', name: '企业标准文档', desc: '企业通用文档模板' },
  { id: 'academic', name: '学术论文模板', desc: '符合学术出版规范' },
  { id: 'custom', name: '自定义模板', desc: '自由配置排版参数' },
]
</script>

<template>
  <div class="min-h-screen p-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-calligraphy text-cinnabar mb-8">排版设置</h1>

      <div class="space-y-8">
        <!-- 主题设置 -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
          <h2 class="font-calligraphy text-xl text-cinnabar mb-4">主题设置</h2>
          <div class="flex gap-4">
            <button
              @click="theme = 'light'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all"
              :class="theme === 'light' ? 'border-gold bg-parchment/50' : 'border-transparent hover:border-gold/30'"
            >
              <Sun :size="18" />
              <span class="font-xiaowei">亮色主题</span>
            </button>
            <button
              @click="theme = 'dark'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all"
              :class="theme === 'dark' ? 'border-gold bg-ink-black text-white' : 'border-transparent hover:border-gold/30'"
            >
              <Moon :size="18" />
              <span class="font-xiaowei">暗色主题</span>
            </button>
          </div>
        </div>

        <!-- 内置模板 -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
          <h2 class="font-calligraphy text-xl text-cinnabar mb-4">内置模板</h2>
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="t in templates"
              :key="t.id"
              @click="template = t.id"
              class="p-4 rounded-lg border-2 transition-all text-left"
              :class="template === t.id ? 'border-cinnabar bg-cinnabar/5' : 'border-transparent hover:border-gold/30'"
            >
              <div class="flex items-center gap-2 mb-2">
                <FileText :size="16" class="text-gold" />
                <span class="font-xiaowei">{{ t.name }}</span>
              </div>
              <p class="text-xs text-ink-black/50">{{ t.desc }}</p>
            </button>
          </div>
        </div>

        <!-- 批注设置 -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
          <h2 class="font-calligraphy text-xl text-cinnabar mb-4">批注设置</h2>
          <label class="flex items-center gap-3 cursor-pointer">
            <div class="relative">
              <input
                type="checkbox"
                v-model="annotation"
                class="sr-only"
              />
              <div
                class="w-12 h-6 rounded-full transition-colors"
                :class="annotation ? 'bg-jade' : 'bg-parchment border border-gold/30'"
              ></div>
              <div
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                :class="annotation ? 'translate-x-6' : 'translate-x-0'"
              ></div>
            </div>
            <span class="font-xiaowei">启用批注形式</span>
          </label>
          <p class="text-sm text-ink-black/50 mt-2 ml-15 pl-15">
            开启后，排版修改将以批注形式显示，方便审阅和确认
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **步骤 2：验证设置页面**

预期：显示主题切换、模板选择、批注开关

- [ ] **步骤 3：Commit**

```bash
git add -A
git commit -m "feat: 实现设置面板页面"
```

---

### 任务 8：添加水墨风格装饰和细节优化

**文件：**
- 修改：`src/styles/tailwind.css`
- 修改：各页面组件

- [ ] **步骤 1：添加水墨风格装饰类**

修改 `src/styles/tailwind.css`:

```css
@import "tailwindcss";

@theme {
  --color-parchment: #FDF6E3;
  --color-cinnabar: #C23B22;
  --color-gold: #D4AF37;
  --color-jade: #2D8B57;
  --color-cloud-blue: #5B7DB1;
  --color-ink-black: #2C2C2C;
  --color-white: #FFFFFF;

  --font-calligraphy: 'Ma Shan Zheng', cursive;
  --font-xiaowei: 'ZCOOL XiaoWei', cursive;
  --font-songti: 'Noto Serif SC', serif;
}

/* 水墨纹理背景 */
.bg-water-ink {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

/* 卷轴装饰线 */
.scroll-decoration {
  position: relative;
}

.scroll-decoration::before,
.scroll-decoration::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gold);
  border-radius: 50%;
}

.scroll-decoration::before {
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
}

.scroll-decoration::after {
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
}
```

- [ ] **步骤 2：在各页面添加水墨装饰元素**

- 上传页面：添加水墨晕染动画效果
- 编辑页面：添加卷轴风格边框
- 对比页面：添加分隔水墨线
- 设置页面：添加印章风格按钮

- [ ] **步骤 3：验证视觉效果**

预期：整体呈现中国古典水墨卷轴风格

- [ ] **步骤 4：Commit**

```bash
git add -A
git commit -m "style: 添加水墨风格装饰和细节优化"
```

---

### 任务 9：集成 vue-office 实现真实文档预览

**文件：**
- 修改：`src/components/DocumentPreview.vue`

- [ ] **步骤 1：安装 vue-office 依赖**

```bash
npm.cmd install @vue-office/docx @vue-office/pdf
```

- [ ] **步骤 2：集成 vue-office 到预览组件**

修改 `src/components/DocumentPreview.vue`:

```vue
<script setup>
import { ref, watch } from 'vue'
import { Docx } from '@vue-office/docx'
import { Pdf } from '@vue-office/pdf'

const props = defineProps({
  file: {
    type: File,
    default: null,
  },
})

const previewComponent = ref(null)

watch(() => props.file, (newFile) => {
  if (!newFile) return
  
  const ext = newFile.name.split('.').pop().toLowerCase()
  if (ext === 'docx') {
    previewComponent.value = Docx
  } else if (ext === 'pdf') {
    previewComponent.value = Pdf
  }
})
</script>

<template>
  <div class="w-full h-full bg-white shadow-lg overflow-auto p-8">
    <div v-if="!file" class="flex items-center justify-center h-full text-ink-black/40 font-xiaowei">
      请先上传文档
    </div>
    <component
      v-else
      :is="previewComponent"
      :src="file"
      class="w-full h-full"
    />
  </div>
</template>
```

- [ ] **步骤 3：验证文档预览**

预期：上传 DOCX/PDF 文件后能正确预览

- [ ] **步骤 4：Commit**

```bash
git add -A
git commit -m "feat: 集成 vue-office 实现真实文档预览"
```

---

### 任务 10：最终测试和优化

**文件：**
- 修改：各组件

- [ ] **步骤 1：测试所有页面路由**

- 访问 `/` 显示上传页面
- 上传文件后跳转到 `/editor`
- 访问 `/compare` 显示对比页面
- 访问 `/settings` 显示设置页面

- [ ] **步骤 2：响应式适配**

- 确保在小屏幕设备上正常显示
- 侧边栏和设置面板可折叠

- [ ] **步骤 3：性能优化**

- 添加加载状态提示
- 优化大图和长文档渲染

- [ ] **步骤 4：最终 Commit**

```bash
git add -A
git commit -m "chore: 最终测试和优化"
```
