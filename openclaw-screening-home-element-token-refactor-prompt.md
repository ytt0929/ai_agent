# OpenClaw 提示词：智能筛客首页改造成 Element Plus + token.css 风格

项目路径：`D:\demo\ai-copilot`

你是资深 Vue / Element Plus 前端工程师。请改造「智能筛客首页」的 UI 实现方式和样式，使其更符合项目统一设计系统：**Element Plus 组件优先 + `src/styles/tokens.css` 变量驱动**。

本次只改智能筛客首页，不改运行页和结果页，不改变任何业务功能、数据、路由、store 或交互流程。

---

## 1. 必须先阅读

请先阅读以下文件：

- `src/pages/ScreeningInitialPage.vue`
- `src/stores/screening.js`
- `src/styles/tokens.css`
- `src/styles/global.css`

可参考但不要修改：

- `src/pages/ScreeningRunningPage.vue`
- `src/pages/ScreeningResultsPage.vue`
- `src/pages/EnterpriseDiagnosisListPage.vue`
- `src/pages/EnterpriseMonitorPage.vue`
- `src/pages/WorkbenchPage.vue`

---

## 2. 允许修改范围

只允许修改：

- `src/pages/ScreeningInitialPage.vue`

除非发现构建必需问题，否则不要修改其他文件。

禁止修改：

- `src/pages/ScreeningRunningPage.vue`
- `src/pages/ScreeningResultsPage.vue`
- `src/stores/screening.js`
- router / `src/main.js`
- 企业探查页面
- 企业监测页面
- 工作台页面
- 智能尽调页面
- 智能报告页面

---

## 3. 页面目标

页面路径：

- `/screening`

需要保留当前首页的信息结构和业务能力：

1. 页面标题：`智能筛客`
2. 页面说明：描述目标客户特征，AI 从企业库中生成匹配名单
3. 自然语言输入区
4. `开始筛选` 入口
5. 示例查询
6. AI 自动识别条件区
7. 历史筛选记录
8. 筛选结果能力说明

不要改变任何业务行为：

- `selectChip`
- `reuseSearch`
- `startScreening`
- `parsedTags`
- 默认查询语句
- 示例查询内容
- 历史筛选记录内容
- 跳转到 `/screening/running` 的逻辑

---

## 4. Element Plus 改造要求

当前页面已经有较好的 AI 产品视觉，但实现上仍有较多自定义结构。请把首页收口为 Element Plus 组件语义。

### 4.1 页面标题区

保留当前结构：

- 标题
- 说明

要求：

- 字号、颜色、间距使用 `token.css`。
- 不要改文案。
- 不要做营销页大 hero。

### 4.2 自然语言输入区

当前输入框是原生 `textarea`。请改成 Element Plus 组件：

- 使用 `el-input type="textarea"` 或 Element Plus 输入组件能力。
- 保留 `v-model="queryText"`。
- 保留 placeholder。
- 保留空值时不可开始筛选的逻辑。
- 保留右侧圆形发送/开始筛选入口，允许继续用 `el-button circle` 或 Element Plus 风格按钮。

视觉要求：

- 外层是项目风格白色卡片。
- 输入区有轻边框和圆角。
- focus 状态使用 `--color-primary` 和 token 阴影。
- 不要让 Element Plus 默认 textarea 边框和外层卡片打架。
- 不要改变默认输入文案。

### 4.3 示例查询

当前示例查询是自定义 chip。请改成 Element Plus 风格：

- 优先使用 `el-button`，也可使用可点击的 `el-tag`。
- 保留原有 4 个示例查询。
- 保留图标。
- 点击仍调用 `selectChip(chip)`。

视觉要求：

- 浅蓝/浅色胶囊风格。
- 文字不变。
- hover 只轻微强调边框或背景。
- 不要过多装饰。

### 4.4 AI 自动识别条件区

当前条件卡是自定义结构。可以保留卡片网格，但要收口为 Element Plus + token 风格：

- 外层可使用 `el-card`。
- 条件项可使用 `el-card`、`el-tag` 或 Element Plus 风格的轻量卡片。
- 地区 / 行业 / 风险等级 / 数据条件四类信息要保留。
- parsedTags 的识别逻辑不要改。

视觉要求：

- 条件项保持清晰、克制、适合金融业务。
- 不要新增复杂图表。
- 图标可以保留，但不要过度放大。

### 4.5 历史筛选记录

当前历史记录是自定义列表。请改成更接近 Element Plus 的卡片/列表风格：

- 外层可使用 `el-card`。
- 标签使用 `el-tag`。
- `再次使用` 使用 `el-button size="small"`。
- 点击仍调用 `reuseSearch(rec)`。

不要改变：

- 历史记录标题
- 历史记录内容
- 历史标签
- 时间
- 再次使用逻辑

### 4.6 筛选能力说明

右侧说明卡保留：

- 支持批量导出 Excel
- 一键加入企业监控
- 支持一键转入尽调任务

可以使用：

- `el-card`
- `el-tag`
- `el-icon`

不要改文案和含义。

---

## 5. token.css 使用要求

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

- 不要继续新增大量硬编码颜色。
- 尽量移除首页里已有的硬编码颜色。
- 不要新增一套独立视觉体系。
- 不要使用大面积渐变、复杂阴影、装饰图形。
- 不要为了视觉效果引入新依赖。

---

## 6. 中文和编码要求

非常重要：

- 不要批量重写中文文案。
- 不要因为终端里看到中文显示异常就整体“修复编码”。
- 如果浏览器中中文正常显示，则文案保持原样。
- 如果你发现当前文件存在会导致构建失败的字符串语法问题，只修复必要语法，不要顺手改业务文案。
- 修改后必须确认浏览器中没有新增中文显示异常。

---

## 7. 不要做的事

不要：

- 不要改 store。
- 不要改 mock 数据。
- 不要改路由。
- 不要新增依赖。
- 不要改变默认输入句子。
- 不要改变示例查询和历史记录内容。
- 不要改变点击示例查询后的填充逻辑。
- 不要改变开始筛选后的跳转逻辑。
- 不要改 `/screening/running`。
- 不要改 `/screening/results`。
- 不要把智能筛客首页改成工作台左右对话布局。
- 不要把页面做成 Element Plus 官方 demo 默认样子。

---

## 8. 建议实现步骤

1. 阅读 `ScreeningInitialPage.vue`，确认 template / script / style 结构。
2. 保留 `<script setup>` 的业务逻辑。
3. 优先改 template 中首页展示结构：
   - title
   - natural language input
   - example chips
   - AI parsed condition cards
   - history list
   - info card
4. 将原生 textarea 改为 `el-input type="textarea"`。
5. 将 chip / tag / card 尽量收口到 Element Plus 语义。
6. 清理 `<style scoped>` 中硬编码颜色和重复样式。
7. 运行构建。

---

## 9. 验收标准

完成后请运行：

```bash
npm run build
```

浏览器检查：

1. 打开 `/screening`。
2. 页面标题、说明、默认输入语句存在。
3. 输入框可编辑。
4. 点击 `开始筛选` 仍进入 `/screening/running`。
5. 点击 4 个示例查询仍能填充输入框。
6. AI 自动识别条件区仍根据输入内容展示。
7. 历史筛选记录仍展示，点击 `再次使用` 仍能填充输入框。
8. 筛选结果能力说明仍展示。
9. 页面视觉更接近 Element Plus + token.css，且不出现新增 console error。
10. 浏览器中文显示无新增异常。

---

## 10. 输出报告格式

完成后请输出：

```text
智能筛客首页 Element Plus + token.css 改造完成报告

1. 修改了哪些文件
2. 哪些区域改成了 Element Plus 风格
3. 哪些样式改成了 token.css 变量
4. 是否保留全部原有交互
5. 是否修改了运行页/结果页/store/router/其他业务页面
6. npm run build 是否通过
7. 浏览器检查结果
```

