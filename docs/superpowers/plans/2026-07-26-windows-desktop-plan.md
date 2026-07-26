# 文版猩 Windows 桌面客户端打包实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 参考 bid-compare 的 Deno WebView 模式，为 bid-typesetting 创建 Windows 桌面客户端打包流程，编译为单文件 `文版猩.exe`。

**Architecture:** 使用 Deno + @webview/webview 创建一个原生 WebView 宿主程序：先通过 Vite 构建前端到 dist/，然后用 Deno 内建 HTTP server serve dist/，最后用 WebView 窗口加载 localhost 页面。通过 `deno compile` 编译为 Windows 原生 exe，嵌入 dist/ 目录。

**Tech Stack:** Deno (编译exe), @webview/webview (JSR 原生 WebView 绑定), @std/http (HTTP 服务器), Vite (前端构建)

## Global Constraints

- 目标平台仅 Windows（使用 WebView2，Windows 10+ 内置）
- 不引入任何 Node.js 外部依赖（仅用 Deno JSR 包）
- 桌面客户端标题固定为"文版猩"
- 端口使用 51732 避免与 bid-compare 的 51730 冲突
- 遵循 bid-compare 已有的完全相同的代码结构
- deno compile 使用 `--include dist` 将 dist/ 嵌入 exe
- 输出可执行文件名必须是 `文版猩.exe`

---

## Task 1: 创建 deno.json 配置文件

**Files:**
- Create: `deno.json`

**Interfaces:**
- Consumes: None
- Produces: Deno import map with `@webview/webview` and `@std/http`

- [ ] **Step 1: 创建 deno.json**

```json
{
  "imports": {
    "@webview/webview": "jsr:@webview/webview@^0.9.0",
    "@std/http": "jsr:@std/http@^1.1.2"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add deno.json
git commit -m "feat: add deno.json for Windows desktop client packaging"
```

---

## Task 2: 创建 desktop/desktop.ts

**Files:**
- Create: `desktop/desktop.ts`

**Interfaces:**
- Consumes: None
- Produces: Standalone WebView host program

- [ ] **Step 1: 创建 desktop 目录和 desktop.ts 文件**

```typescript
// desktop/desktop.ts
import { Webview } from "@webview/webview"

const PORT = 51732

const distDir = (() => {
  const binDir = import.meta.dirname
  if (binDir) {
    const resolved = new URL("../dist", `file://${binDir}/`).pathname
    try { Deno.statSync(resolved); return resolved } catch {}
  }
  const cwdDist = new URL("./dist", `file://${Deno.cwd()}/`).pathname
  try { Deno.statSync(cwdDist); return cwdDist } catch {
    console.error("Cannot find dist/ directory. Build the app first: npm run build")
    Deno.exit(1)
  }
})()

const serverProc = new Deno.Command(Deno.execPath(), {
  args: [
    "eval",
    `
    import { serveDir } from "jsr:@std/http@^1";
    const ac = new AbortController();
    Deno.serve({ port: ${PORT}, signal: ac.signal, onListen() { console.log("READY"); } },
      (req) => serveDir(req, { fsRoot: ${JSON.stringify(distDir)}, urlRoot: "" })
    );
  `,
  ],
  stdout: "piped",
  stderr: "inherit",
  env: {},
}).spawn()

await new Promise<void>((resolve, reject) => {
  const reader = serverProc.stdout.getReader()
  const decoder = new TextDecoder()
  ;(async () => {
    const timer = setTimeout(() => reject(new Error("Server start timeout")), 10000)
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (decoder.decode(value).includes("READY")) {
        clearTimeout(timer)
        resolve()
      }
    }
  })()
})

const webview = new Webview(false)
webview.title = "文版猩"
webview.navigate(`http://localhost:${PORT}/`)

try {
  webview.run()
} finally {
  serverProc.kill()
}
```

注意：这里去掉了对比项目中 `GTK_A11Y=none` 的环境变量设置（Windows 不需要），其余与 bid-compare 完全一致。

- [ ] **Step 2: 提交**

```bash
git add desktop/
git commit -m "feat: add WebView desktop host for Windows client"
```

---

## Task 3: 更新 package.json 添加打包脚本

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: existing `build` script
- Produces: `desktop` and `desktop:compile` npm scripts

- [ ] **Step 1: 在 package.json scripts 中添加桌面端命令**

在现有 scripts 中新增两个命令：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "desktop": "deno run -A desktop/desktop.ts",
    "desktop:compile": "deno compile -A --include dist --output \"文版猩.exe\" desktop/desktop.ts"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add package.json
git commit -m "feat: add desktop compile scripts to package.json"
```

---

## Task 4: 端到端验证

**Files:**
- No code changes needed

**Interfaces:**
- Consumes: 整个应用

- [ ] **Step 1: 验证文件结构**
  - 确认 `deno.json`, `desktop/desktop.ts`, `package.json` 修改正确
  - 检查 `desktop/desktop.ts` 端口为 51732、标题为"文版猩"
  - 确认 `package.json` 的 `desktop:compile` 输出路径正确

- [ ] **Step 2: 验证 Deno 依赖导入正确性**
  - `deno.json` 的 imports 映射能正确解析 `@webview/webview` 和 `@std/http`
  - `desktop/desktop.ts` 的 import 语句匹配 deno.json 的映射

- [ ] **Step 3: 确认无遗漏**
  - 对比 bid-compare 的 desktop.ts — 只有 `GTK_A11Y` 环境变量不同（bid-typesetting 不需要）
  - 对比 bid-compare 的 package.json scripts — 命名约定相同
  - 确认不修改其他任何文件

---

## 文件变更总结

| 文件 | 动作 | 说明 |
|------|------|------|
| `deno.json` | **新建** | Deno import map (@webview/webview + @std/http) |
| `desktop/desktop.ts` | **新建** | WebView 宿主程序（HTTP server + WebView2 窗口） |
| `package.json` | **修改** | 添加 `desktop` 和 `desktop:compile` 脚本 |
