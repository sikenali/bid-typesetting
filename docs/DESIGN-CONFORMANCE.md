# 设计符合度核验报告（Calicat 设计图 / DESIGN.md / bid-maker）

> 只读核验，未修改代码。范围：上传界面、顶部导航、设置中心、排版设置 7 面板。

## 0. 验收基准（用户已确认）

| 区域 | 基准 |
|---|---|
| 排版设置的 **7 个面板**（页面/标题/正文/目录/图表/页面页脚/初始化） | **Calicat 最新设计图** |
| **导航 / 设置 / 上传** | **DESIGN.md 规范 + bid-maker 实现** |

补充事实：Calicat 设计图与 `DESIGN.md`/bid-maker **本身存在冲突**。`bid-typesetting` 现状是「部分按设计图、部分按 bid-maker、部分两者都不符」。下面逐项标注基准与判定。

设计源：Calicat `file_id=2108028159918399488`，`canvas_id=2108028159947759616`。
- 上传界面：`4633410b-09ac-4220-a78f-82ed0e3c6155`（文版星-上传标书文件）
- 排版设置：`c7086974-e711-49b4-ad39-76e1855caafc` / `3a27a527-08ae-4748-b7bf-7574f847a335`（链接层 `bf1bf573-9691-4737-ba85-d57c13ff644a` = 主体）

---

## 1. 顶部导航（基准：bid-maker `TopNav.vue`）— 影响所有页面

bid-maker 基线：`frontend/src/components/layout/TopNav.vue`
- 右侧仅 **2 个圆钮**：返回 + 设置（无「模板库」）
- `.nav-btn` = **28×28**，图标 **14px**（`:103-105`、`:122-125`）

| 项 | bid-maker 基线 | bid-typesetting 现状 | 判定 |
|---|---|---|---|
| 圆钮尺寸 | 28×28 | **40×40**（`src/components/layout/TopNav.vue:104-105`） | ❌ 不符 |
| 图标尺寸 | 14px | 18px | ❌ 不符 |
| 按钮数量/集合 | 返回 + 设置（2 个） | 返回 + **模板库** + 设置（3 个，`:18`/`:21`） | ❌ 多「模板库」 |
| 设置入模 | SettingsModal | SettingsModal | ✅ |

> 说明：Calicat 设计图写的是「返回 + **主题切换**」（40×40）。因导航基准定为 bid-maker，此处以「返回 + 设置 + 28×28」为准，设计图的主题切换按钮**不采纳**。

## 2. 上传界面（基准：DESIGN.md + bid-maker）

bid-maker 基线：`views/UploadView.vue`、`components/upload/UploadCard.vue`、`components/StepStrip.vue`
- 无 hero 标题块（`UploadView.vue:23-31`）
- 卡片 **875×345 / r14**（`UploadCard.vue:262-267`）
- 步骤 = **大纲解析 / 大纲提取 / 大纲展示**（`UploadCard.vue:19-21`）
- CTA = **一键制作 / 制作中…**（`UploadCard.vue:159-160`）
- StepStrip：pill 高 **48**、边框 1.5px、圆点 **24**、标签 15px、连接线 **2px**（`StepStrip.vue:139-172`、`:272`）
- 主按钮 **260×54 / r12**、disabled `opacity 0.5`（`StepStrip.vue:317-321`、`:354-357`）
- 替换文件按钮 **36×36**（`UploadCard.vue:342-345`）

| 项 | 基准 | bid-typesetting 现状 | 判定 |
|---|---|---|---|
| 页面结构 | 无 hero，仅卡片 | 多 hero 标题/副标题（`src/views/Upload.vue:6-9`） | ❌ 多余 |
| 卡片高度 | 345 | **390**（`src/components/upload/UploadCard.vue:286`） | ❌ 与 bid-maker/DESIGN 不符 |
| 卡片底色/描边 | `--color-bg-white` / `--color-border` | `--color-bg-panel` / `--color-border-strong`（`:289` 附近） | ❌ 不符 |
| 步骤文案 | 大纲解析/大纲提取/大纲展示 | **样式遍历/样式提取/样式显示**（`UploadCard.vue:95-97`、`StepStrip.vue:25-27`） | ❌ 不符 |
| CTA 文案 | 一键制作 / 制作中… | **一键解析 / 解析中…**（`UploadCard.vue:158,164,166`） | ❌ 不符 |
| StepStrip pill 高 | 48 | **50**（`StepStrip.vue:78`） | ❌ 不符 |
| 连接线 | 2px | **1px**（`StepStrip.vue:145`） | ❌ 不符 |
| 步骤圆点 | 24 | **26**（`StepStrip.vue:104`） | ❌ 不符 |
| 主按钮 | 260×54 / r12 | **292×60 / r10** | ❌ 不符 |
| 主按钮 disabled | 0.5 | **0.7** | ❌ 不符 |
| 替换文件按钮 | 36×36 | 40×40 | ❌ 不符 |
| 文件名/信息字号 | 18 / 15 | 18 / 15（`UploadCard.vue:373,380`） | ✅ 合 bid-maker（注：DESIGN.md 写 16/14，二者本身冲突） |

> 注：本屏的 `min-height:390`、步骤「样式遍历/提取/显示」、主按钮 292×60 **恰好与 Calicat 设计图一致**，但与本次基准（bid-maker/DESIGN.md）不一致。即此屏需按 bid-maker 回改。

## 3. 设置中心（基准：DESIGN.md + bid-maker `SettingsModal.vue`）

bid-maker 基线菜单（`frontend/src/components/layout/SettingsModal.vue:69-74`）— **6 项**：

| key | label | icon |
|---|---|---|
| theme | 主题管理 | ri-palette-line |
| template | 模板管理 | ri-file-list-2-line |
| skill | 技能管理 | ri-git-branch-line |
| model | 模型管理 | ri-cpu-line |
| export | 导出管理 | ri-download-2-line |
| about | 关于 | ri-information-line |

（bid-maker **无**「个性设置」）

| 项 | 基准 | bid-typesetting 现状 | 判定 |
|---|---|---|---|
| 菜单项 | 6 项（含技能/导出，无个性） | 5 项：主题设置/模板管理/模型管理/**个性设置**/关于（`src/components/layout/SettingsModal.vue:63-69`） | ❌ 缺技能、导出；多个性 |
| 主题项名 | 主题管理 | **主题设置** | ❌ 改名 |
| 子路由 | 应有 `/settings/*` 子路由 | 仅 `/settings`（`src/router/index.js`） | ❌ 缺失 |
| 默认强调色 | `#C0392B`（朱红，`stores/theme.ts:11,61`） | **`#4A72A8`（云蓝）**，`resetAll()` 回落云蓝 | ❌ 不符 |
| token | `--color-primary` = 朱红；云蓝是 `--color-info` | `--color-primary` = 云蓝（`src/assets/global.css`） | ❌ 不符 |
| `@theme` 自引用 | — | `global.css:142-164` 自引用致 `text-muted` 等工具类未生成 | ❌ 缺陷 |
| SettingsModal 结构/尺寸 | — | 1320/94vw/86vh、radius16、padding 28px 32px（`SettingsModal.vue:118-126`） | ✅ |
| 主题应用方式 | JS `setProperty`、无 `[data-theme]` 覆盖块 | 同 | ✅ |

### ThemeSettingsView（基准：DESIGN.md）
- ❌「布局切换」整块缺失（无 mockup / setLayout / reload）
- ❌ 外观主题 3 张卡 ≠ 规范 2 张

## 4. 排版设置 7 面板（基准：Calicat 设计图）

设计规格（frame 主体 1920×1170）：侧栏 310 / 7 项各 270×50；底部「取消/重置/保存」各 270×50 竖排；主内容含操作行（左：保存 44×44 + 上传 44×44；右：预览 108×46 + 一键排版 121×46）、标题样式卡片（5 个「左字段/右字段」表单行：字体/字号/字体颜色/加粗/自动编号）、排版进度卡片（进度条 + 5 行日志）。

| 项 | 设计图 | bid-typesetting 现状 | 判定 |
|---|---|---|---|
| 7 个设置项及顺序 | 页面/标题/正文/目录/图表/页面页脚/初始化 | `src/views/Editor.vue:369-377` 完全一致 | ✅ |
| 侧栏宽 / 项尺寸 | 310 / 270×50 | `Editor.vue:635,683` | ✅ |
| 底部按钮 | 取消/重置/保存（270×50 竖排） | `Editor.vue:55-59` | ✅（但「保存」仅算 diff、不落盘 `:508`） |
| 页脚 | 58 | `PageFooter.vue:52` | ✅ |
| 操作行左 | 保存 44×44 + 上传 44×44（2 个） | **5 个**图标钮（保存到模板/载入模板/导出/导入/规则编辑器，`Editor.vue:66-86`） | ❌ |
| 操作行右 | 预览 108×46 + 一键排版 121×46 | 有；预览在「初始化」页被隐藏（`Editor.vue:92`） | ⚠️ |
| 标题样式卡片 | 5 个「左字段/右字段」表单行 | `HeadingPanel.vue:273-277` 为左右两个子卡片；加粗用 checkbox、自动编号为表格列 | ❌ 结构不符 |
| 排版进度卡片 | 主列内常驻卡片（进度条 + 5 行日志） | 仅处理时临时 `UiModal`（`Editor.vue:276-310`） | ❌ 常驻卡片缺失 |
| 默认选中面板 | 页面（第 1 项） | **初始化**（最后一项，`Editor.vue:379`） | ⚠️ |
| 侧栏标题栏 | 高 22 | 含额外 `detect-tag` 标签（`Editor.vue:10-19`） | ⚠️ 多余 |

## 5. 修复优先级清单

**P0（影响基准符合度，逐屏可见）**
1. 顶部导航：模板库按钮移除、圆钮 40→28、图标 18→14（`TopNav.vue:18,104-105`）。
2. 上传页：删除 hero 块；卡片 390→345、底色/描边改回 `--color-bg-white`/`--color-border`；步骤文案改「大纲解析/大纲提取/大纲展示」；CTA 改「一键制作/制作中…」；StepStrip pill 50→48、线 1→2px、圆点 26→24；主按钮 292×60/r10→260×54/r12、disabled 0.7→0.5；替换钮 40→36。
3. 排版设置操作行：5 图标钮 → 保存 + 上传 两个（`Editor.vue:66-86`）。
4. 设置中心菜单：加「技能管理/导出管理」、去「个性设置」、「主题设置」改「主题管理」（`SettingsModal.vue:63-69`）。

**P1**
5. 默认强调色 `#4A72A8` → `#C0392B`，`resetAll()` 同步；token 与 `@theme` 自引用修复（`global.css:142-164`）。
6. 排版设置标题样式卡片改为设计图的双列表单行结构（`HeadingPanel.vue`）。
7. 排版设置补常驻排版进度卡片（进度条 + 日志）。
8. 设置子路由 `/settings/*` 补齐；ThemeSettingsView 补「布局切换」、外观主题 3→2 卡。

**P2**
9. 排版设置默认面板 初始化 → 页面；移除侧栏多余 `detect-tag`（如需，移到标题栏右侧）。
10. 「保存」按钮应有实际落盘语义或改名。
