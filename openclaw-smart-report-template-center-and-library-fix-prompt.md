# OpenClaw 提示词：智能报告模板中心与报告库入口修正

项目路径：`D:\demo\ai-copilot`

你是资深 Vue / Element Plus 前端工程师。请修正智能报告模块中「报告模板中心」页面的布局和样式，并修正首页 AI 输入区下方入口按钮的跳转逻辑。

本次不是重构智能报告全模块，而是解决两个明确问题：

1. 报告模板中心页面存在不必要的大面积空白，整体样式需要按 **Element Plus + `src/styles/tokens.css`** 统一。
2. 首页 AI 输入区下方的「打开报告中心 / 打开报告库 / 打开模板中心」类入口，不应该进入任务识别页，应直接进入对应的库/中心页面。

---

## 1. 必须先阅读

请先阅读：

- `src/pages/SmartReportPage.vue`
- `src/stores/smartReport.js`
- `src/data/mockSmartReport.js`
- `src/styles/tokens.css`
- `src/styles/global.css`

可参考但不要修改：

- `src/pages/EnterpriseDiagnosisListPage.vue`
- `src/pages/EnterpriseMonitorPage.vue`
- `src/pages/ScreeningInitialPage.vue`

---

## 2. 允许修改范围

只允许修改：

- `src/pages/SmartReportPage.vue`

除非构建必须，不要修改其他文件。

禁止修改：

- `src/stores/smartReport.js`
- `src/data/mockSmartReport.js`
- router / `src/main.js`
- 企业探查页面
- 企业监测页面
- 智能筛客页面
- 工作台页面
- 智能尽调页面

---

## 3. 问题一：报告模板中心页面样式和空白修正

当前页面：

- 路径：`/smart-report`
- 进入方式：智能报告首页点击「维护报告模板 / 进入模板中心」
- 对应代码：`view === 'templateCenter'`

### 3.1 需要修正的问题

模板中心页面当前存在以下问题：

- 页面下方出现不必要的大面积空白。
- 左侧模板列表和右侧章节规则区域高度/滚动关系不协调。
- 返回首页按钮区域视觉存在割裂，顶部布局不够像项目统一页面。
- 页面整体有部分硬编码颜色和固定高度，不够符合 Element Plus + token.css。

### 3.2 目标效果

报告模板中心应该是一个紧凑、可滚动、无异常空白的业务管理页：

```text
┌──────────────────────────────────────────────────────────────┐
│ 返回首页  报告模板中心                                      │
│          维护不同银行/分行的报告模板、章节规则、资料要求...   │
├──────────────────────────────────────────────────────────────┤
│ 搜索模板名称/银行/报告类型  银行/机构  报告类型  状态  操作   │
├───────────────────────┬──────────────────────────────────────┤
│ 模板列表               │ 模板详情 / 章节规则                  │
│ - 模板 A               │ 标题、标签、统计、操作按钮           │
│ - 模板 B               │ 章节规则表格                         │
│ - 模板 C               │                                      │
└───────────────────────┴──────────────────────────────────────┘
```

### 3.2.1 当前截图中的重点问题

请重点处理截图红框区域：

- 顶部筛选区现在像普通输入控件堆放，缺少统一的 Element Plus 卡片容器感。
- 左侧「模板列表」和右侧「章节规则」视觉密度不一致。
- 右侧详情区内部出现明显滚动条，但底部仍有大片空白，说明容器高度和 overflow 关系不合理。
- 返回首页按钮和页面标题之间的空间关系不够统一，顶部 header 应该更像项目页面头部。
- 当前模板中心虽然用了部分 Element Plus 控件，但整体仍像自定义布局，必须收口成 Element Plus + token.css 的业务后台样式。

### 3.3 样式要求

请使用 Element Plus + token.css：

- 容器使用 `el-card` / Element Plus 卡片语义。
- 筛选区使用 `el-input`、`el-select`、`el-button`。
- 标签使用 `el-tag`。
- 表格继续使用 `el-table`。
- 左侧模板列表优先使用 `el-scrollbar` 包裹，列表项可以保留自定义结构，但样式必须使用 token。
- 右侧详情区优先使用 `el-card` + `el-table` + `el-scrollbar`，不要用裸 div + 原生滚动条堆叠。
- 页面背景、卡片、边框、圆角、间距全部优先使用 token。

### 3.3.1 顶部 Header 要求

模板中心顶部应改成统一页面头：

- 左侧返回按钮使用 `el-button text` 或 `el-button link` 风格，配 Element Plus 返回图标。
- 标题 `报告模板中心` 使用 `--font-size-page-title` 或同级 token。
- 副标题使用 `--text-secondary` / `--text-tertiary`。
- 返回按钮、标题、副标题在同一顶部区域内对齐，不要出现独立大块空白。
- 顶部区域不要固定高度，不要撑出多余留白。

### 3.3.2 筛选区要求

筛选区必须是一个清晰的 Element Plus 工具条：

- 外层使用 `el-card shadow="never"` 或同等 Element Plus 卡片语义。
- 搜索框使用 `el-input clearable`。
- 银行/机构、报告类型、状态使用 `el-select clearable`。
- 右侧操作使用 `el-button type="primary"`、`el-button plain`。
- 筛选区高度要克制，控件垂直居中。
- 筛选区背景、边框、圆角使用 token。
- 不要让筛选区和下面的左右布局粘在一起，使用 `--space-md` 或 `--space-lg` 间距。

### 3.3.3 左侧模板列表要求

左侧模板列表要像 Element Plus 管理后台列表：

- 外层建议使用 `el-card shadow="never"`。
- 标题区和列表区分开，标题区有底部分割线。
- 列表区域用 `el-scrollbar`，不要直接依赖浏览器原生滚动条。
- 列表项使用 token 背景、边框、圆角。
- 选中态使用 `--color-primary-bg` + `--color-primary` 或边框强调。
- 启用/草稿/默认状态必须使用 `el-tag`。
- 列表项间距不要过大，保持业务列表密度。
- 左侧列表高度应跟右侧详情区协调，不要比右侧长出很多导致页面底部空白。

### 3.3.4 右侧模板详情与章节规则要求

右侧详情区要改成 Element Plus 风格：

- 外层建议使用 `el-card shadow="never"`。
- 顶部展示模板名称、状态标签、默认标签、银行/机构、报告类型、章节数、必需资料、最近使用、禁用词规则。
- 统计信息建议使用 `el-descriptions` 或结构化 grid，但样式必须使用 token。
- 操作按钮使用 Element Plus：
  - 已是默认 / 设为默认
  - 查看章节规则
  - 上传新版模板
  - 用此模板生成报告
  - 新建模板
- 操作按钮不要挤出容器，必要时允许换行。
- 章节规则表格必须使用 `el-table`。
- 表格表头不要写硬编码 `#fafbfd`、`#64748b`，改用 token 或 CSS class。
- 状态使用 `el-tag`。
- 表格区域如果超过高度，使用 `el-scrollbar` 或 `el-table` 自身滚动能力。
- 右侧详情底部不能出现大片空白。

### 3.3.5 推荐布局结构

推荐把 `view === 'templateCenter'` 区域整理为类似结构：

```vue
<div class="sr-template-center">
  <header class="sr-tc-header">...</header>
  <el-card class="sr-tc-filter-card" shadow="never">...</el-card>
  <div class="sr-tc-layout">
    <el-card class="sr-tc-list-card" shadow="never">
      <template #header>模板列表</template>
      <el-scrollbar class="sr-tc-list-scroll">...</el-scrollbar>
    </el-card>
    <el-card class="sr-tc-detail-card" shadow="never">
      ...
      <el-table ... />
    </el-card>
  </div>
</div>
```

不要求一字不差，但必须体现：

- Element Plus 卡片语义
- token.css 样式变量
- 正确滚动
- 无多余空白
- 业务内容不丢失

优先使用：

- `--surface-page`
- `--surface-card`
- `--surface-soft`
- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--border-default`
- `--border-light`
- `--border-divider`
- `--color-primary`
- `--color-primary-bg`
- `--color-success`
- `--color-warning`
- `--color-danger`
- `--radius-md`
- `--radius-lg`
- `--space-*`
- `--font-size-*`
- `--font-weight-*`
- `--shadow-sm`

### 3.4 空白处理要求

重点修正：

- 不要让右侧详情面板产生大片空白。
- 不要用过大的固定高度撑开页面。
- 左侧模板列表和右侧详情区可以各自滚动，但不能导致底部出现无意义空白。
- 如果使用 `height: calc(...)`，必须保证父容器 `min-height: 0`、`overflow` 关系正确。
- 如果内容不足一屏，页面自然结束；如果内容超过一屏，页面或内部区域正常滚动。
- 不要把内容藏在底部不可见区域。
- 不要同时出现页面滚动、左侧原生滚动、右侧原生滚动三层混乱滚动。
- 优先让模板中心主内容区在一屏内形成左右两栏，内部列表/表格用 Element Plus 滚动承载。

---

## 4. 问题二：首页「打开报告中心」应进入报告库，不进入任务识别页

当前问题：

- 首页 AI 输入区下方建议按钮中有类似「打开报告中心」「打开报告库」「打开模板中心」的入口。
- 当前点击后会走 `handleAiTask(chip)`，进入 `view === 'taskDialog'` 的任务识别页。
- 用户期望：其中「打开报告中心 / 打开报告库」应该直接进入「报告库」页面，不是识别页面。

### 4.1 需要实现的入口逻辑

请将首页建议按钮中的对应入口调整为：

- 如果当前按钮文案是 `打开报告中心`，可以保留文案，但点击必须直接进入报告库页面。
- 如果你要统一文案，建议改为：`打开报告库`。
- 点击 `打开报告中心` 或 `打开报告库` 后都必须直接进入报告库页面。
- 不经过 `taskDialog`。
- 不展示任务确认面板。
- 不触发 `startTaskDialog`。

### 4.2 如果当前没有报告库页面

如果 `SmartReportPage.vue` 当前没有独立的 `reportLibrary` view，请在同一个文件内新增一个轻量的：

```js
view === 'reportLibrary'
```

报告库页面使用现有 `reportTasks` 数据，不新增 store，不新增 mock。

报告库页面内容建议：

```text
┌──────────────────────────────────────────────────────────────┐
│ 返回首页  报告库                                             │
│          查看全部报告状态、继续修改、查看缺失、打开报告       │
├──────────────────────────────────────────────────────────────┤
│ 搜索报告/企业  状态筛选  模板筛选                            │
├──────────────────────────────────────────────────────────────┤
│ 企业名称        报告名称        状态       下一步       操作   │
│ 唐山物桥商贸...  尽职调查报告    草稿       修改报告     打开   │
│ 明达精工...      单户授信调查... 待确认     确认章节     继续修改│
└──────────────────────────────────────────────────────────────┘
```

实现要求：

- 使用 `el-card`、`el-input`、`el-select`、`el-table`、`el-tag`、`el-button`。
- 数据使用现有 `reportTasks`。
- 操作按钮复用现有 `openReport(row, mode)`。
- 返回按钮设置 `view = 'home'`。
- 不新增路由。
- 不新增 store。
- 不改变现有报告编辑器逻辑。

### 4.3 首页建议按钮要求

请检查：

- `aiSuggestions`
- `handleAiTask`
- 首页建议按钮点击逻辑

要求：

- 普通任务类建议仍可走 `handleAiTask`。
- `打开报告中心` 和 `打开报告库` 必须直接 `view = 'reportLibrary'`。
- 如果仍保留 `打开模板中心`，它应直接 `view = 'templateCenter'`，也不要进入任务识别页。
- 不要让“打开报告中心 / 打开报告库 / 打开模板中心”这种导航类操作进入任务识别。

---

## 5. 中文和编码要求

非常重要：

- 不要批量重写中文文案。
- 不要因为终端里看到中文显示异常就整体“修复编码”。
- 如果浏览器中中文正常显示，则文案保持原样。
- 只新增必要的中文文案，例如 `报告库`、`打开报告库`。
- 修改后必须确认浏览器中没有新增中文显示异常。

---

## 6. 不要做的事

不要：

- 不要改 store。
- 不要改 mock 数据。
- 不要改 router。
- 不要新增依赖。
- 不要改报告编辑器主体逻辑。
- 不要改模板上传业务逻辑。
- 不要改 AI 助手对话逻辑。
- 不要把报告库做成任务识别页。
- 不要把模板中心做成全屏营销页。
- 不要用大量硬编码颜色替代 token。
- 不要为了修空白把页面内容截断。

---

## 7. 验收标准

完成后请运行：

```bash
npm run build
```

浏览器检查：

1. 打开 `/smart-report`。
2. 首页 AI 输入区下方存在 `打开报告中心` 或 `打开报告库`。
3. 点击 `打开报告中心` 或 `打开报告库` 后直接进入报告库页面，不进入任务识别页。
4. 报告库页面可以返回首页。
5. 报告库页面使用现有报告数据，操作按钮可打开/继续修改/查看缺失。
6. 如果保留 `打开模板中心`，点击后直接进入模板中心，不进入任务识别页。
7. 模板中心页面顶部布局、筛选区、模板列表、详情区风格符合 Element Plus + token.css。
8. 模板中心页面底部不再出现不必要的大面积空白。
9. 模板中心页面滚动正常，内容不被截断。
10. 报告编辑器、模板上传、任务识别页没有被改坏。
11. 浏览器无新增 console error。
12. 浏览器中文显示无新增异常。

---

## 8. 输出报告格式

完成后请输出：

```text
智能报告模板中心与报告库入口修正完成报告

1. 修改了哪些文件
2. 模板中心样式和空白问题如何修复
3. 是否新增/调整了 reportLibrary 视图
4. 首页「打开报告中心 / 打开报告库 / 打开模板中心」入口现在如何跳转
5. 是否保持 Element Plus + token.css
6. 是否修改了 store/mock/router/报告编辑器/模板上传/AI 助手
7. npm run build 是否通过
8. 浏览器检查结果
```
