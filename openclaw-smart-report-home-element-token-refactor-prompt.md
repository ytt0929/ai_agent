# OpenClaw 提示词：智能报告首页改造成 Element Plus + token.css 风格

项目路径：`D:\demo\ai-copilot`

你是资深 Vue / Element Plus 前端工程师。请改造「智能报告首页」的 UI 实现方式和样式，使其更符合项目统一设计系统：**Element Plus 组件优先 + `src/styles/tokens.css` 变量驱动**。

本次只改智能报告首页，不改模板中心、任务识别页、报告编辑器、AI 助手、报告数据或业务流程。

---

## 1. 必须先阅读

请先阅读以下文件：

- `src/pages/SmartReportPage.vue`
- `src/stores/smartReport.js`
- `src/data/mockSmartReport.js`
- `src/styles/tokens.css`
- `src/styles/global.css`

可参考但不要修改：

- `src/pages/EnterpriseDiagnosisListPage.vue`
- `src/pages/EnterpriseMonitorPage.vue`
- `src/pages/ScreeningInitialPage.vue`
- `src/pages/WorkbenchPage.vue`

---

## 2. 允许修改范围

只允许修改：

- `src/pages/SmartReportPage.vue`

但必须严格限定在首页相关区域：

- template 中 `view === 'home'` 对应的首页 DOM
- style 中首页相关 class：
  - `.sr-home`
  - `.sr-home__header`
  - `.sr-home__title`
  - `.sr-home__subtitle`
  - `.sr-home__ai-input-card`
  - `.sr-home__ai-label`
  - `.sr-home__ai-input-row`
  - `.sr-home__ai-input`
  - `.sr-home__ai-chips`
  - `.sr-home__capabilities`
  - `.sr-cap-card`
  - `.sr-cap-card__icon`
  - `.sr-cap-card__title`
  - `.sr-cap-card__desc`
  - `.sr-cap-card__btn`
  - `.sr-home__recent-card`
  - `.sr-home__recent-header`

除非构建必须，不要改其他区域。

---

## 3. 禁止修改范围

不要修改：

- `src/stores/smartReport.js`
- `src/data/mockSmartReport.js`
- router / `src/main.js`
- 智能报告模板中心：`view === 'templateCenter'`
- 智能报告模板上传：`view === 'templateUpload'`
- 智能报告任务识别页
- 报告编辑器区域
- AI 助手区域
- 任何弹窗业务逻辑
- 企业探查页面
- 企业监测页面
- 智能筛客页面
- 工作台页面
- 智能尽调页面

---

## 4. 页面目标

页面路径：

- `/smart-report`

只改首页，也就是：

```vue
<div v-if="view === 'home'" class="sr-home">
  ...
</div>
```

需要保留当前首页的信息结构和业务能力：

1. 页面标题：`智能报告`
2. 页面说明：查询报告状态，继续修改报告，按新模板重排或生成可交付报告
3. AI 自然语言输入区
4. `识别任务` 按钮
5. AI 建议任务按钮
6. 四项核心能力：
   - 查询报告状态
   - 继续修改报告
   - 按新模板生成
   - 维护报告模板
7. 最近报告表格
8. 最近报告操作：
   - 打开
   - 继续修改
   - 查看缺失

不要改变任何业务行为：

- `handleAiTask`
- `startTaskDialog`
- `openReport`
- `view = 'templateCenter'`
- `aiSuggestions`
- `reportTasks.slice(0, 3)`
- 最近报告状态判断逻辑

---

## 5. Element Plus 改造要求

当前首页已经使用了 `el-card`、`el-input`、`el-button`、`el-table`、`el-tag`。本次不是重写，而是进一步收口到统一设计系统。

### 5.0 重点对齐：AI 输入任务区要和企业探查首页保持一致

本次最重要的视觉目标：

- 智能报告首页红框中的 AI 输入任务区，需要和企业探查首页 `/enterprise-diagnosis` 顶部输入区保持同一套视觉语言。
- 请参考 `src/pages/EnterpriseDiagnosisListPage.vue` 中企业探查首页的输入卡片和示例查询区域：
  - `.edl-hero-card`
  - `.edl-hero-input`
  - `.edl-hero-field`
  - `.edl-hero-chips`
  - `.edl-hero-chip`

但注意：

- 只参考视觉，不要复制企业探查的业务文案和逻辑。
- 智能报告首页仍保留自己的文案：
  - `告诉我你要处理什么报告任务？`
  - placeholder
  - `识别任务`
  - AI 建议任务按钮
- 不要改 `handleAiTask` 逻辑。

视觉对齐要求：

- 外层是和企业探查一致的白色输入卡片。
- 卡片使用轻边框、圆角、克制阴影。
- 输入框内部不要出现多重厚边框。
- 输入框高度和企业探查首页的大输入区接近。
- 主按钮放在输入区右侧，保持清晰的 primary 按钮。
- 下方建议任务按钮要改成企业探查首页类似的浅蓝胶囊按钮，不要像普通文本按钮一样散在一行。
- 建议按钮字体不要过粗，字号与企业探查首页示例查询保持接近。
- 整个 AI 输入任务区的视觉密度、边距、圆角、hover 效果要和企业探查首页一致。

### 5.1 首页容器

要求：

- 保持首页最大宽度克制，不要铺满到过宽。
- 使用 token 控制 padding、gap、宽度。
- 页面首屏保持清爽，不要做营销页 hero。

建议：

- `max-width` 使用 `var(--layout-page-default)` 或接近当前 960px 的 token。
- padding 使用 `--space-*`。

### 5.2 AI 自然语言输入区

继续使用：

- `el-card`
- `el-input`
- `el-button`

要求：

- 外层卡片使用 `el-card shadow="never"`。
- 输入框和按钮行保持清晰。
- `识别任务` 按钮保持 primary。
- AI 建议任务按钮必须用轻量胶囊风格，视觉参考企业探查首页的示例查询按钮。
- 不要改 placeholder 和文案。

视觉要求：

- 使用 `--surface-card`、`--border-default`、`--radius-lg`。
- focus/hover 使用 `--color-primary`。
- 不要使用大面积阴影。
- 不要把 `识别任务` 按钮放到输入框下方形成断裂感；优先和输入框在同一输入卡片行内。
- 如果页面宽度不足，可在移动端自然换行，但桌面端应保持输入框 + 按钮的一行布局。

### 5.3 四项核心能力卡

继续使用：

- `el-card`
- `el-button`
- Element Plus icons

重要要求：

- 当前 emoji 图标 `📊`、`✏️`、`📋`、`⚙️` 建议替换为 Element Plus icon。
- 可以从 `@element-plus/icons-vue` 引入合适图标，但不要新增第三方依赖。
- 不要使用复杂插画或大图标。
- 四张卡片高度、标题、描述、按钮位置要统一。
- hover 使用 token 边框和轻微阴影。

建议图标：

- 查询报告状态：`DataAnalysis` / `DocumentSearch` 若不存在则使用已可用的近似 icon
- 继续修改报告：`EditPen`
- 按新模板生成：`DocumentCopy` / `Files`
- 维护报告模板：`Setting`

如果项目当前 Element Plus icon 中某个图标不可用，请选择已存在的相近图标，确保构建通过。

### 5.4 最近报告表格

继续使用：

- `el-card`
- `el-table`
- `el-table-column`
- `el-tag`
- `el-button text`

要求：

- 不要改列结构。
- 不要改 `reportTasks.slice(0, 3)`。
- 不要改状态判断。
- 表头、行高、字体、边框使用 token 风格。
- 操作按钮保持原行为。

---

## 6. token.css 使用要求

样式必须优先使用 `src/styles/tokens.css` 已有变量。

优先使用：

- 背景：`--surface-page`、`--surface-card`、`--surface-soft`
- 文本：`--text-primary`、`--text-secondary`、`--text-tertiary`
- 主色：`--color-primary`、`--color-primary-hover`、`--color-primary-bg`
- 状态色：`--color-success`、`--color-success-bg`、`--color-warning`、`--color-warning-bg`、`--color-danger`、`--color-danger-bg`
- 边框：`--border-default`、`--border-light`、`--border-divider`
- 圆角：`--radius-sm`、`--radius-md`、`--radius-lg`、`--radius-full`
- 间距：`--space-*`
- 字体：`--font-size-*`、`--font-weight-*`
- 阴影：`--shadow-sm`、`--shadow-primary`
- 动效：`--duration-normal`、`--ease-out`

硬性要求：

- 首页新增或修改的样式不要写大量硬编码颜色。
- 尽量将首页相关硬编码数值替换为 token。
- 不要为了首页改动去清理全文件所有硬编码颜色，避免误伤编辑器和模板中心。
- 不要新增一套独立视觉体系。
- 不要使用大面积渐变、复杂阴影、装饰图形。

---

## 7. 中文和编码要求

非常重要：

- 不要批量重写中文文案。
- 不要因为终端里看到中文显示异常就整体“修复编码”。
- 如果浏览器中中文正常显示，则文案保持原样。
- 如果你发现当前文件存在会导致构建失败的字符串语法问题，只修复必要语法，不要顺手改业务文案。
- 修改后必须确认浏览器中没有新增中文显示异常。

---

## 8. 不要做的事

不要：

- 不要改 store。
- 不要改 mock 数据。
- 不要改路由。
- 不要新增依赖。
- 不要改模板中心。
- 不要改报告编辑器。
- 不要改 AI 助手。
- 不要改任务识别页。
- 不要改弹窗和抽屉业务流程。
- 不要改首页的任务识别逻辑。
- 不要把智能报告首页改成工作台左右对话布局。
- 不要把页面做成 Element Plus 官方 demo 默认样子。

---

## 9. 建议实现步骤

1. 阅读 `SmartReportPage.vue`，确认首页区域 `view === 'home'`。
2. 保留 `<script setup>` 业务逻辑。
3. 如替换 emoji icon，需要只补充 Element Plus icon import。
4. 优先调整首页 template：
   - AI 输入卡
   - 四项能力卡
   - 最近报告卡
5. 只调整首页相关 CSS。
6. 运行构建。

---

## 10. 验收标准

完成后请运行：

```bash
npm run build
```

浏览器检查：

1. 打开 `/smart-report`。
2. 首页标题、说明、AI 输入区存在。
3. 输入任务后点击 `识别任务` 行为不变。
4. AI 建议任务按钮仍可点击。
5. 四项能力卡都存在，点击行为不变。
6. `维护报告模板` 仍能进入模板中心。
7. 最近报告表格仍展示 3 条。
8. 最近报告操作按钮仍可打开/继续修改/查看缺失。
9. 模板中心、报告编辑器、任务识别页没有被改坏。
10. 页面视觉更接近 Element Plus + token.css，且不出现新增 console error。
11. 浏览器中文显示无新增异常。

---

## 11. 输出报告格式

完成后请输出：

```text
智能报告首页 Element Plus + token.css 改造完成报告

1. 修改了哪些文件
2. 哪些首页区域改成了 Element Plus 风格
3. 哪些样式改成了 token.css 变量
4. 是否替换了 emoji 图标，使用了哪些 Element Plus icon
5. 是否保留全部原有首页交互
6. 是否修改了模板中心/报告编辑器/任务识别页/store/router/其他业务页面
7. npm run build 是否通过
8. 浏览器检查结果
```
