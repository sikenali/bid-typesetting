# Deno 桌面端迁移至 Electron Windows 打包 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将桌面客户端从 Deno + WebView2 打包方式迁移到 Electron，仅支持 Windows 平台。

**Architecture:** 创建 Electron 主进程加载 Vite 构建产物（dist/），通过 electron-builder 打包为 Windows exe。Vite 配置改为相对路径 `base: './'` 以适配 Electron 的 `file://` 协议。删除所有 Deno 相关文件。

**Tech Stack:** Electron 33.x, electron-builder, Node.js (已有)

## Global Constraints
- 仅支持 Windows 平台打包
- 窗口可调大小（resizable: true）
- 保留原有 README 中的说明但更新为 Electron 相关命令
- 删除 `desktop/desktop.ts` 和 `deno.json`

---

### Task 1: 创建 Electron 主进程文件

**Files:**
- Create: `electron/main.js`
- Create: `electron-builder.yml`

**Steps:**
- [ ] **Step 1: 创建 `electron/` 目录和主进程文件**

```bash
mkdir -p /home/jingle/opc/bid-typesetting/electron
```

- [ ] **Step 2: 编写 `electron/main.js`**

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    title: '文版猩',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

- [ ] **Step 3: 编写 `electron-builder.yml`**

```yaml
appId: com.bid-typesetting.app
productName: 文版猩
directories:
  buildResources: build
files:
  - dist/**/*
  - electron/main.js
win:
  target:
    - target: nsis
      arch: [x64]
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: public/logo-icon.svg
  uninstallerIcon: public/logo-icon.svg
  createDesktopShortcut: true
  shortcutName: 文版猩
```

**Interfaces:**
- Consumes: Vite 构建产物在 `dist/` 目录
- Produces: Electron 主进程可加载 `dist/index.html`

---

### Task 2: 更新 package.json

**Files:**
- Modify: `package.json`

**Steps:**
- [ ] **Step 1: 更新 `package.json`**

将 scripts 中的 `desktop` 和 `desktop:compile` 替换为 Electron 相关脚本，添加 devDependencies：

```json
{
  "name": "document-formatting-tool",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && NODE_ENV=development electron electron/main.js\"",
    "electron:build": "vite build && electron-builder --win --x64"
  },
  "dependencies": {
    "@eigenpal/docx-editor-vue": "^1.9.0",
    "@remixicon/vue": "^4.9.0",
    "@vue-office/docx": "^1.6.3",
    "@vue-office/excel": "^1.7.14",
    "@vue-office/pdf": "^2.0.10",
    "@vue-office/pptx": "^1.0.1",
    "docx": "^9.7.1",
    "jszip": "^3.10.1",
    "mammoth": "^1.12.0",
    "vue": "^3.4.0",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "concurrently": "^9.0.0",
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "tailwindcss": "^4.0.0",
    "vite": "^5.0.0",
    "wait-on": "^8.0.0"
  }
}
```

**Interfaces:**
- Consumes: `electron/main.js`, `electron-builder.yml`
- Produces: `npm run electron:dev` 启动开发模式，`npm run electron:build` 打包 Windows exe

---

### Task 3: 更新 vite.config.js

**Files:**
- Modify: `vite.config.js`

**Steps:**
- [ ] **Step 1: 添加 `base: './'` 配置**

在现有配置中添加 `base: './'`，使 Vite 输出相对路径，适配 Electron 的 `file://` 协议：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['@vue-office/docx', 'vue-demi'],
  },
})
```

**Interfaces:**
- Consumes: 无额外依赖
- Produces: Vite 构建产物使用相对路径，Electron `loadFile()` 可直接加载

---

### Task 4: 删除 Deno 相关文件并更新 README

**Files:**
- Delete: `desktop/desktop.ts`
- Delete: `deno.json`
- Modify: `README.md`
- Modify: `.gitignore`

**Steps:**
- [ ] **Step 1: 删除 Deno 文件**

```bash
rm /home/jingle/opc/bid-typesetting/desktop/desktop.ts
rm /home/jingle/opc/bid-typesetting/deno.json
rmdir /home/jingle/opc/bid-typesetting/desktop 2>/dev/null || true
```

- [ ] **Step 2: 更新 README.md 中的桌面客户端部分**

将：
```markdown
### 桌面客户端

基于 Deno + WebView2 构建 Windows 原生应用。Vite 构建产物嵌入 exe，运行时启动 HTTP server serve dist/ 并打开 WebView 窗口。

```bash
# 安装 Deno: https://docs.deno.com

npm run build                              # 构建前端
npx deno compile -A --include dist --output "文版猩.exe" desktop/desktop.ts
```

编译后得到单文件 `文版猩.exe`（约 10-15MB），无需安装任何运行时即可在 Windows 10+ 运行。
```

替换为：
```markdown
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

打包后得到 `dist-win-unpacked/文版猩.exe`，或通过 NSIS 安装包。
```

- [ ] **Step 3: 更新 `.gitignore`**

在现有内容末尾添加：
```
# Electron build output
dist-win
out
*.exe
!backend/*.exe
```

**Interfaces:**
- 清理所有 Deno 相关文件

---

### Task 5: 安装依赖并验证

**Steps:**
- [ ] **Step 1: 安装新依赖**

```bash
cd /home/jingle/opc/bid-typesetting
npm install
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
ls dist/
```

- [ ] **Step 3: 验证 Electron 主进程语法（可选快速检查）**

```bash
node -c electron/main.js
```

---

### Task 6: 提交变更

**Steps:**
- [ ] **Step 1: 查看变更状态**

```bash
git status
git diff
```

- [ ] **Step 2: 提交**

```bash
git add electron/main.js electron-builder.yml package.json vite.config.js README.md .gitignore
git rm desktop/desktop.ts deno.json
git commit -m "feat: 迁移桌面端到 Electron，移除 Deno 依赖，仅支持 Windows 打包"
```
