# UI 控件生效性 & 前后端字段契约 审计报告

- 日期：2026-10-17
- 范围：`src/**`（Vue 3 纯 JS）× `backend/**`（Go），全量 UI 控件、全量接口、全量字段
- 方法：静态只读审计 + 逐条回读源码核验（未修改任何业务代码）
- 结论摘要：**7 个 P0（阻断核心功能）／6 个 P1（部分失效）／7 个 P2（体验与规范）**

---

## P0 阻断级（7 项，均已回读源码确认）

### P0-1 全部清理开关静默失效：字段命名风格不匹配
- 前端 `flattenCleanup()` 输出 **PascalCase**：`src/api/format.js:30-64`
  ```js
  return { PreprocessPunctuation: ..., PreprocessSuperscript: ..., PreprocessSoftReturn: ... }
  ```
- 后端 `Config` 声明 **snake_case** JSON tag：`backend/config.go:13-31`
  ```go
  PreprocessPunctuation bool `json:"preprocess_punctuation"`
  ```
- 后果：`encoding/json` 忽略所有不匹配的 PascalCase 键，**`preprocess_*` 全族保持零值**。标点清理、上标清除、软回车转硬回车、Tab 处理、空行删除、图表格式清除、图题/表题检测等 **23 个清理开关全部无效**。
- 附注：同函数内 `preprocess_table_cell_line_spacing`（`format.js:58`）已是 snake_case，风格不一致，说明是遗漏而非有意设计。

### P0-2 六个"应用 XX 格式"开关完全失效：编辑的是被丢弃的影子副本
- UI 绑定：`src/components/rules/CleanupRuleEditor.vue:37-44`，标注为「全局开关」
  ```html
  <CheckboxField v-model="globalSwitches.apply_page" label="应用页面设置" />
  ```
- 该对象实际落在 `formatParams.cleanup.global_switches`：`src/composables/useFormatState.js:308-313`
- 而 `formatDocument` 发送前执行 `delete backendConfig.cleanup`：`src/api/format.js:63`
- 后端消费的是**顶层** `apply_page` / `apply_body` / ...：`backend/config.go:3-9`
- 前端顶层同名字段在 `useFormatState.js:14-19` 恒为 `true`，UI 无任何入口可改。
- 后果：用户勾选/取消「应用页面设置」「应用正文格式」「应用标题格式」「应用图题表题」「应用目录」「应用页眉页脚」，**均无任何影响**；后端永远收到硬编码的 true。这是本次审计中最严重的一项。

### P0-3 页边距永不生效：前端构造 `page` 扁平对象，后端要求 `margins`
- 后端：`backend/config.go:45` → `Margins Margins \`json:"margins"\``
- 全仓 `src/` 内 `margins` 键写入次数为 **0**（仅 `src/views/Compare.vue:78` 以 `page.top_cm` 读取）。
- 后果：`M Top / Bottom / Left / Right / Gutter` 恒为零值，**页面边距设置无效**。

### P0-4 TOC 左缩进永不生效：字段名不匹配
- 前端：`src/components/rules/TOCRuleEditor.vue:33`
  ```html
  v-model="params.level_styles[activeLevel].left_indent_value"  unit="字符"
  ```
- 后端：`backend/config.go:157` → `LeftIndentChars float64 \`json:"left_indent_chars"\``
- 消费点：`backend/format_toc.go:62-63`（`ls.LeftIndentChars > 0` 时才缩进）
- 后果：目录各级左缩进输入被静默丢弃，恒为 0。

### P0-5 PUT `/api/config` 忽略 `ai_providers`
- 前端发送：`src/views/settings/ModelSettingsView.vue:91` → `JSON.stringify({ ai_providers: merged })`
- 后端处理：`backend/cmd/server/main.go:145-155` 只解码 `LicenseEntries`，调用 `wordformat.SaveLicenseEntries`，**请求体中 `ai_providers` 被直接丢弃**。
- 后端已有 `SaveAiProviders`（`backend/license.go:139`）和 `AiProviders` 字段（`license.go:66,77,85`），但**无任何 HTTP 路由或 handler 调用它**。
- 后果：模型设置页的 API Key / Provider 保存点击"成功"但**不落盘，刷新即丢**。

### P0-6 清理流程总开关不存在（设计缺口）
- 后端 `backend/pipeline.go` 与 `backend/preprocess*.go` 中 grep `enabled` 零命中 —— 后端**不存在**"启用/禁用清理"的总闸。
- 前端 `formatParams.cleanup`（`useFormatState.js:273`）也无 `enabled` 键。
- 后果：当前唯一能关掉清理的方式是把每个子开关单独关闭；且 `PreprocessClearAllStyles` 默认 `?? true`（`format.js:38`）在命名错配修复后会**默认强制清样式**，需与「清除所有样式」复选框的默认值对齐（`useFormatState.js:286` 为 `false`）。

### P0-7 「清除所有样式」双源冲突
- `format.js:38`：`PreprocessClearAllStyles: sc.clear_all_styles ?? true`（默认 true）
- `useFormatState.js:286`：`clear_all_styles: false`
- `useFormatState.js:393`：另有一条 `formatParams.cleanup.style_cleanup.clear_all_styles = enabled === true` 的写入
- 三处来源在 P0-1 修复后会产生不一致行为，需统一为单一数据源。

---

## P1 部分失效（6 项）

### P1-1 `acceptAll()` 只接受嵌套对象，数组与标量全部跳过
- `src/views/Compare.vue:142-163`
  ```js
  if (typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
    Object.assign(formatParams[key], merged[key])
  }
  ```
- `!Array.isArray` 排除了 `headings` / `toc.level_styles` / `patterns` 等数组字段；标量（`apply_page`、`body.cn_font` 之上的顶层标量）因 `typeof !== 'object'` 被跳过。
- 后果：「接受全部修改」实际只合并嵌套对象，**大部分参数变更丢失**；且 `Object.assign` 为浅合并，嵌套对象内的数组同样丢失。

### P1-2 三个个人设置开关为死开关
- `previewEnabled` / `annotationEnabled` / `highlightEnabled`：定义 `src/composables/useSettings.js:22,24,25`，持久化 `:40-43`，在 `ProfileSettingsView.vue:57,83,96` 渲染为三个 `UiSwitch`。
- 全仓消费点 grep 结果仅出现在上述两处 —— **`DocumentPreview` 等任何 UI 都不读取它们**。
- 后果：三个开关可切换、可持久化、可"保存成功"，但**对界面零影响**。

### P1-3 `cleanup.global_switches.auto_refresh_fields` / `close_word_after_refresh` 是唯一存活的清理字段
- `format.js:55-56` 将两者拍平为顶层 `AutoRefreshFields` / `CloseWordAfterRefresh`，但**同样是 PascalCase**，受 P0-1 影响实际也不生效。
- 修复 P0-1 时应一并改名为 `auto_refresh_fields` / `close_word_after_refresh`。

### P1-4 `text_cleanup.remove_extra_blank_lines` 与 `style_cleanup.remove_extra_blank_lines` 重名
- `useFormatState.js:283` 与 `:294` 两处同名键，分别位于不同子对象，语义不同（软回车后空行 vs 段落空行）。
- 后果：易误绑；`flattenCleanup` 仅消费了 `style_cleanup` 侧（`format.js:44`），`text_cleanup` 侧的从未发送。

### P1-5 `tab_to_spaces` 三值编码缺少契约说明
- `format.js:14-19` 将 `'none'/'delete'/'enter'/数字` 映射为 `0 / -1 / -2 / n`。
- 后端仅存 `PreprocessTabMode int`，无枚举定义与校验；负数语义未在 `backend/` 内集中声明，易被后续改动破坏。

### P1-6 `/api/config` GET 返回体与前端读取字段不一致
- 后端 GET 返回 `LoadConfigForAPI()` 的 `ConfigForAPI{LicenseEntries, AiProviders}`（`license.go:71,85`）。
- 前端 `ModelSettingsView.vue:82` 读 `data.ai_providers`（可用），但同页还依赖 `data.license_entries`；需核对 `license_entries` 结构与 `LicenseEntryResponse` 是否一致。

---

## P2 体验与规范（7 项）

| # | 位置 | 问题 |
|---|------|------|
| P2-1 | `src/api/format.js:2` | `API_BASE` 默认 `http://127.0.0.1:8099` 硬编码，无端口/启动失败降级提示 |
| P2-2 | `backend/cmd/server/main.go:150` | `json.Unmarshal(body, &req)` 丢弃错误返回值，畸形请求体静默当空对象处理 |
| P2-3 | `backend/cmd/server/main.go:170-173` | `handleTestKey` 无超时控制，`TestApiKey` 同步阻塞，可能长期占用连接 |
| P2-4 | `backend/pipeline.go` | 死字段 `PreprocessTableCellBorder`、`PreprocessClearExtraSpaces`、`AutoRefreshFields`、`CloseWordAfterRefresh` 在 Config 中定义但无业务逻辑消费 |
| P2-5 | `useFormatState.js:308-313` | `global_switches` 影子副本应整体删除（见 P0-2），保留双份配置必然漂移 |
| P2-6 | `Compare.vue:145` | 使用原生 `confirm()`，与 UI 组件体系（`UiModal`）不一致 |
| P2-7 | `src/api/format.js:63` | `delete backendConfig.cleanup` 用"删除"而非"白名单透传"，新增清理字段时会静默丢失（P0-2 即由此产生） |

---

## 修复建议顺序

1. **P0-1**：`flattenCleanup` 返回值全部改为 snake_case（对齐 `config.go` JSON tag），同时处理 P1-3。
2. **P0-2**：删除 `useFormatState.js:308-313` 的 `global_switches` 影子副本；`CleanupRuleEditor.vue:39-44` 改为直接绑定 `formatParams.apply_page` 等顶层字段；`format.js` 保留顶层透传。
3. **P0-3**：在 `formatDocument` 发送前由 `config.page` 组装 `{ top_cm, bottom_cm, left_cm, right_cm, gutter }` 写入 `config.margins`。
4. **P0-4**：`TOCRuleEditor.vue:33` 字段改为 `left_indent_chars`（或后端加别名字段兼容）。
5. **P0-5**：`handleConfig` 的 PUT 分支同时解码并持久化 `ai_providers`（调用已存在的 `SaveAiProviders`）。
6. **P0-6/P0-7**：统一 `clear_all_styles` 默认值为单一来源；明确是否需要清理总闸。
7. **P1-1**：`acceptAll()` 改为深合并，正确处理数组与标量。
8. **P1-2**：让 `DocumentPreview` 消费三个开关，或从设置页移除（二选一，不要留死开关）。
9. 其后处理 P2 各项。

---

## 核验方式说明

- P0-1 ~ P0-5、P0-7、P1-1、P1-2、P1-4、P2-5 均由直接回读源码确认（文件:行号如上）。
- P1-6、P2-2 ~ P2-4 基于静态阅读，未运行集成测试。
- 本次审计为纯只读，未修改任何文件，未提交任何改动。
- 后端未启动，以上均为静态契约分析；建议修复后跑一次端到端排版验证 `margins` 与 `preprocess_*` 是否真正生效。

---

# 修复记录（2026-10-17）

验证：`go vet ./...` 无输出、`go test ./...` 全部 ok、`npx vite build` 通过。

## 已修复

| 项 | 修复方式 |
|---|---|
| P0-1 | `src/api/format.js` `flattenCleanup` 全部改 snake_case，对齐 `config.go` JSON tag |
| P0-2 | 删除 `useFormatState.js` 的 `global_switches` 影子副本；`CleanupRuleEditor.vue` prop 改名 `applySwitches`，`Editor.vue` 改传 `formatParams`；分组标题「全局开关」改「应用范围」 |
| P0-3 | `formatDocument` 发送前 `backendConfig.margins = {...config.page}` |
| P0-4 | `formatDocument` 把 `toc.level_styles[].left_indent_value` 映射为 `left_indent_chars`（保留原字段，兼容旧模板） |
| P0-5 | `handleConfig` PUT 同时解码并持久化 `ai_providers`（调用既有 `SaveAiProviders`） |
| P0-6/7 | `preprocess_clear_all_styles` 默认值由 `?? true` 改为 `?? false`，与 store 默认值一致 |
| 新增 P0-8（审计遗漏） | `SaveLicenseEntries(nil)` 会把磁盘 `LicenseEntries` 清空为 `[]`。前端 PUT 从不传 `license_entries`，因此**每次保存模型设置都会清空授权表**。改用 `json.RawMessage` 判空，字段缺失/`null` 时跳过写入 |
| P1-1 | `Compare.vue` `acceptAll` 改用 `deepMerge`，数组与标量正常合并 |
| P1-2 | `previewEnabled` 控制 Editor「预览」按钮；`highlightEnabled` 与 Compare「高亮修改」双向同步；`annotationEnabled` 控制批注差异列表 |
| P1-3 | `auto_refresh_fields` / `close_word_after_refresh` 提升为顶层字段，改 snake_case 后真正生效 |
| P1-4 | 删除死字段 `text_cleanup.remove_extra_blank_lines`；为后端 `preprocess_delete_empty_lines` 补上此前完全缺失的 UI 开关「删除多余空行」 |
| P1-5 | 删除多余键 `preprocess_tab_enabled`（后端无对应字段，`preprocess_tab_mode` 单独控制） |
| P1-6 | 结论修正：前端只读 `ai_providers`，从未读 `license_entries`，原 P1-6 不成立（真问题是 P0-8） |
| P2-1 | `healthCheck` 捕获网络异常返回 `false`，连接被拒时能给出明确的启动提示而非泛化报错 |
| P2-2 | `handleConfig` 检查 `json.Unmarshal` 错误，返回 400 |
| P2-3 | `handleTestKey` 加 15s 超时（goroutine + `context`），超时返回 504 |
| P2-7 | `cleanup` 仍整体不透传，但 `flattenCleanup` 已是唯一显式映射点，不再有 PascalCase 漏项 |
| P2-1 | 新增 `src/utils/apiBase.js`：`getApiBase()/setApiBase()` 读写 `localStorage('wpx_api_base')`，回退 `VITE_API_BASE_URL` → `http://127.0.0.1:8099`；`format.js` 与 `ModelSettingsView.vue` 改为**调用时取值**（改地址即时生效，无需刷新）；设置中心「模型管理」新增「后端服务地址」卡片（保存/恢复默认 + 协议校验） |
| P2-4 | 三字段全部落地或移除：`PreprocessPostCleanStyles` → pipeline 末尾新增「格式化后清理」步骤（`ClearExtraSpaces`+`DeleteEmptyLines`，不触碰样式/缩进，避免抹掉刚应用的格式）；`AutoRefreshFields` → 新增「自动刷新域」步骤写 `doc.Settings.SetUpdateFieldsOnOpen(true)`（`word/settings.xml` 输出 `<w:updateFields/>`）；`CloseWordAfterRefresh` → 服务端架构无实现目标，从 `config.go`/`format.js`/`useFormatState.js`/测试/`testdata` 一并移除 |
| P2-6 | 新增 `src/utils/confirm.js`（Promise 风格 `confirmDialog`）+ `src/components/ConfirmHost.vue`（复用 `UiModal`），在 `App.vue` 全局挂载；`Compare.vue`、`Editor.vue`、`LoadTemplateModal.vue` 三处原生 `confirm()` 全部替换，调用方相应改 `async/await` |

## 回归测试

`backend/config_test.go` 新增 `TestConfigAcceptsFrontendKeySet`：以 map 形式复刻 `flattenCleanup` 的**完整键集** + `margins` + `toc.left_indent_chars`，逐组断言字段落地。今后任何人改动 `config.go` 的 JSON tag 或前端键名，该测试即失败，P0-1 类错配无法静默回归。

`backend/pipeline_test.go` 新增 4 个用例：`AutoRefreshFields` 开/关时 `settings.xml` 的 `updateFields` 与否；`PreprocessPostCleanStyles` 开/关时空段落删除与多余空格收敛。因关闭态断言的是「不做任何改动」，可防止后置清理步骤被误置为无条件执行。

## 未修（有意保留）

| 项 | 原因 |
|---|---|
| 清理总闸 | 已确认后端无此概念，改为各子开关直接生效；是否需要总闸属产品决策 |
| `global.css:142-164` `@theme` 令牌自引用 | `--color-primary: var(--color-primary)` 导致 `text-muted`/`text-faint`/`border-soft`/`text-primary`/`bg-secondary` 等工具类未被生成（`dist` 产物中 grep 命中为 0）；属 Tailwind v4 令牌映射写法问题，与本次前后端契约无关 |

---

# 端到端实测（2026-10-18）

方法：用 unidoc 生成一份**故意排版错误**的 DOCX（页边距 7070/1440 twips、Arial/Calibri、红色、28 半点、9 个空段落、半角标点、中英文混排无空格、图题表题无格式），启动真实后端 `:8099`，以前端真实键名 POST `/api/format`，再用 XML 解析比对产物。

| 校验项 | 输入 | 输出 | 结果 |
|---|---|---|---|
| 页边距 `margins`（P0-3） | 7070/1440 twips | 2097/1984/1587/1474 twips = 3.7/3.5/2.8/2.6cm | **PASS** |
| 空行删除 `preprocess_delete_empty_lines`（P0-1/P1-4） | 9 个空段 | 0 个空段 | **PASS** |
| 中英文加空格 `preprocess_spaces` | 中文与English | 中文与 English、99.9%以上 | **PASS** |
| 图题/表题 `preprocess_fig_caption` / `tbl_caption` | 图1 系统架构图 | 图 1 系统架构图 | **PASS** |
| 清样式+重设 `preprocess_clear_all_styles` + `body` | Arial/Calibri、红色 | Times New Roman/宋体、红色清零、三号(32半点) | **PASS** |
| 键名契约（P0-1 回归） | 34 个前端键 | 后端 100% 接受，0 个被丢弃 | **PASS** |
| TOC 左缩进（P0-4） | — | — | 无法验证：输入文档无 TOC 样式段落；已由 `TestConfigAcceptsFrontendKeySet` 单测覆盖解码 |
| **标点清理 `preprocess_punctuation`** | 全角 `，。；：！？` | 原实现全角→半角；**已修**为 CJK 感知半角→全角 | **已修复** |

## P0-9（本次实测新发现）标点清理方向反了

`backend/preprocess_punctuation.go:10-17` 的映射表是**全角 → 半角**：

```go
punctMap := map[rune]rune{
	'，': ',', '。': '.', '；': ';', '：': ':', '！': '!', '？': '?',
	'（': '(', '）': ')', '“': '"', '”': '"', '‘': '\'', '’': '\'', '【': '[', '】': ']',
}
```

实测：输入含 9 个全角标点的文档，输出 9 个全角标点全部变成半角。

对投标文件/公文场景这是反向操作 —— 中文正文按 GB/T 15834 要求用全角中文标点，当前逻辑会把正确的标点全部降级成半角。正确实现应是「半角 → 全角」且仅在相邻 CJK 时转换，以保留 `99.9%`、`HTTP 1.1`、`50ms` 中的半角字符。

### P0-9 修复方案（已实施）

产品确认后按「CJK 感知半角→全角」实现，`backend/preprocess_punctuation.go` 整体重写：

- 仅当标点**相邻字符为 CJK** 时转换（`4E00-9FFF` / `3400-4DBF` / `3000-303F` / `FF00-FFE7`），英文与代码片段原样保留
- `.` 两侧任一为数字则保留半角 → `99.9`、`HTTP 1.1`、`v2.0` 不被破坏
- `,` 前为数字则保留半角 → 千分位 `1,000` 不被破坏
- 引号用**开闭交替状态机**而非邻接猜测，`他说"你好"` → `他说“你好”`
- 仅在文本确有变化时才 `ClearContent` + `AddText`，避免无谓改写 run

**新增 `backend/preprocess_punctuation_test.go`**，10 组表驱动用例（逗号句号、千分位保留、小数百分比保留、版本号保留、分号冒号感叹问号、括号、引号成对、纯英文不变、纯数字逗号不变、已全角不变），全部通过。

**端到端复测**：
- 半角标点输入（9 个）→ 输出 8 个中文语境标点全角化，`99.9` 保持半角
- 全角标点输入 → 10 个全角标点全部原样保留，无一处被降级
