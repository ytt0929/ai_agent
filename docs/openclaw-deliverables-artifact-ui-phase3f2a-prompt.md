# OpenClaw 提示词：Phase 3-F-2A 单点优化「产物确认」节点 UI

请先阅读以下文件，再开始修改：

1. `src/components/workbench/artifacts/DeliverablesArtifact.vue`
2. `src/components/workbench/WorkbenchBusinessPanel.vue`
3. `src/pages/WorkbenchPage.vue`
4. `src/pages/DueDiligenceTaskPage.vue`
5. `src/styles/tokens.css`

## 本阶段目标

只优化「产物确认」节点的 UI，也就是：

```text
src/components/workbench/artifacts/DeliverablesArtifact.vue
```

这个组件同时被工作台和智能尽调详情页使用，所以需要兼容两个入口：

```text
工作台：右侧是 AI Copilot，左侧是工作台结果区
智能尽调详情页：右侧是尽调助手，左侧是尽调任务工作区
```

目标是把产物确认页从“按钮和表格堆在一起”调整成清晰的产品页面：

```text
顶部摘要区
核心产物表格
报告模板与资料包
待确认项
报告预览/普通产物预览
底部操作区
```

## 严格边界

只允许修改：

```text
src/components/workbench/artifacts/DeliverablesArtifact.vue
```

不要修改：

```text
src/stores/workbenchAssistant.js
src/stores/dueDiligence.js
src/pages/WorkbenchPage.vue
src/pages/DueDiligenceTaskPage.vue
src/pages/DueDiligenceHomePage.vue
src/pages/SmartReportPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/router/*
src/styles/tokens.css
```

不要改业务逻辑。

不要改 props。

不要改 emit 名称。

不要删按钮。

不要真实生成 PDF / Word / ZIP。

不要把中文改乱码。

## 必须保留的 emit

必须保留：

```js
defineEmits([
  'edit-report',
  'export-report',
  'start-monitor',
  'sync-to-report',
  'generate-delivery-package'
])
```

并且以下按钮仍然要触发原事件：

```text
编辑报告 / 进入编辑       -> edit-report
导出报告                 -> export-report
加入监控                 -> start-monitor
同步到智能报告             -> sync-to-report
确认产物并生成交付包        -> generate-delivery-package
```

表格中的「查看」仍然要打开现有预览逻辑。

表格中的「编辑」仍然要进入编辑报告。

证据链的「生成」仍然保持 demo 提示和预览逻辑。

## 页面结构要求

请把 list 状态重构成以下结构：

```text
┌──────────────────────────────────────────────┐
│ 产物确认                                      │
│ 尽调报告草稿、阶段报告、证据链和资料包已生成， │
│ 请确认后生成交付包。                          │
│ [已生成] [待确认 3 项] [资料完整度 86%]        │
├──────────────────────────────────────────────┤
│ 核心产物                                      │
│ el-table                                      │
│ 产物名称 | 类型 | 状态 | 数量 | 操作            │
├──────────────────────────────────────────────┤
│ 报告模板与资料包                              │
│ el-descriptions                               │
│ 报告模板：尽职调查报告                         │
│ 报告底稿：尽职调查报告                         │
│ 资料包：工商资料 / 司法查询 / 税票数据 / 上传资料 │
│ 当前状态：底稿已生成，等待确认和编辑             │
├──────────────────────────────────────────────┤
│ 待确认项                                      │
│ el-alert 或轻量列表                            │
├──────────────────────────────────────────────┤
│ 操作区                                        │
│ [确认产物并生成交付包] [同步到智能报告]          │
│ [导出报告] [加入监控]                          │
└──────────────────────────────────────────────┘
```

如果打开普通产物预览，则预览面板放在产物表格下方，不覆盖右侧 AI。

如果打开报告预览，则保持现有的整区切换 `viewMode === 'reportPreview'`，但要优化布局，不能挤出容器。

## 视觉要求

必须使用 Element Plus：

```text
el-card
el-table
el-table-column
el-tag
el-descriptions
el-descriptions-item
el-alert
el-button
el-scrollbar
el-divider
```

不要使用原生 table。

不要新增大量 icon。

不要做大面积彩色背景。

整体要接近项目企业探查/智能尽调的风格：白底卡片、浅边框、紧凑、清晰。

## CSS 要求

只改 `DeliverablesArtifact.vue` 的 scoped style。

所有新增/调整样式使用 token：

```css
var(--surface-card)
var(--surface-soft)
var(--border-default)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--color-primary)
var(--color-success)
var(--color-warning)
var(--color-danger)
var(--space-xs)
var(--space-sm)
var(--space-md)
var(--space-lg)
var(--radius-sm)
var(--radius-md)
var(--font-size-xs)
var(--font-size-sm)
var(--font-size-body)
var(--font-size-lg)
```

可使用 fallback，例如：

```css
background: var(--surface-card, #fff);
border: 1px solid var(--border-default, #dbe3ef);
```

根容器必须：

```css
.artifact-deliverables {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}
```

操作区必须：

```css
.artifact-deliverables__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-sm, 8px);
  min-width: 0;
}
```

主按钮「确认产物并生成交付包」不能超出卡片背景。

表格外层和预览区必须：

```css
min-width: 0;
max-width: 100%;
overflow: hidden;
```

报告预览 `reportPreview` 状态必须适配窄宽度：

```text
左侧目录固定 180-220px
右侧报告正文 minmax(0, 1fr)
底部按钮自动换行
不能把右侧 AI 对话挤出去
```

## 具体优化点

### 1. 顶部摘要区

新增一个清晰的顶部摘要卡或 header block：

```text
标题：产物确认
说明：尽调报告草稿、阶段报告、证据链和资料包已生成，请确认后生成交付包。
状态 tag：已生成
待确认：pendingItems.length 项
资料完整度：data.materialComplete || 86%
```

注意不要写死所有值，优先从 `props.data` 取，缺失再兜底。

### 2. 产物表格

表格列建议：

```text
产物名称 min-width 160
类型 width 110
状态 width 90
数量 width 80
操作 width 140
```

类型可以根据 `row.type` 显示：

```text
report -> 尽调报告
business -> 阶段报告
judicial -> 阶段报告
tax -> 阶段报告
risk -> 阶段报告
evidence -> 证据链
其他 -> 产物
```

操作区：

```text
报告行：查看 / 编辑
已生成或已归档：查看
证据链：查看 / 生成
未生成：生成
```

不要改变现有点击行为。

### 3. 报告模板与资料包

用 `el-descriptions` 展示：

```text
报告模板：尽职调查报告
报告底稿：尽职调查报告
资料包：工商资料 / 司法查询 / 税票数据 / 上传资料 / 证据链
当前状态：底稿已生成，等待确认和编辑
```

文案注意：产物名称仍然是目录中的产物名称；报告底稿是「尽职调查报告」。

### 4. 待确认项

如果有待确认项，用 `el-alert type="warning"` 或轻量 list 展示：

```text
风险结论需确认
税票异常说明待补充
授信建议待确认
```

不要做过大的橙色区域。

### 5. 操作区

操作区建议分成两层：

```text
主操作：
[确认产物并生成交付包]

辅助操作：
[同步到智能报告] [导出报告] [加入监控]
```

如果保持一行，也必须自动换行，不能溢出。

主按钮放右侧或底部明显位置，但不要超出背景。

### 6. 报告预览状态

现有 `viewMode === 'reportPreview'` 继续保留。

请优化：

```text
顶部：返回产物确认 + 报告预览标题 + 进入编辑/导出报告
摘要：企业名称、报告模板、评分、风险等级、资料完整度
正文：左目录 + 右 PDF-like 文档预览
底部：进入编辑 / 导出报告 / 返回产物确认
```

要求：

- 不要用 drawer 覆盖右侧 AI。
- 不要把整个页面宽度撑爆。
- 目录和正文都要 `min-width: 0`。

## 双入口验收

完成后必须检查：

### A. 工作台入口

```text
工作台 -> 完整流程到产物确认
```

检查：

```text
1. 产物确认页不溢出。
2. 按钮不超出背景。
3. 点击「查看」能打开报告预览。
4. 点击「编辑」能进入报告编辑 Lite。
5. 点击「确认产物并生成交付包」能进入交付包。
6. 右侧 AI Copilot 不被覆盖。
```

### B. 智能尽调详情入口

```text
智能尽调首页 -> 进入任务详情 -> 产物确认
```

检查：

```text
1. 产物确认页不溢出。
2. 按钮不超出背景。
3. 点击「编辑报告」能进入报告 Lite / 智能报告联动。
4. 点击「确认产物并生成交付包」能进入第 8 节点交付包下载。
5. 右侧尽调助手不被覆盖。
```

## 构建要求

完成后运行：

```bash
npm run build
```

## 输出要求

完成后请汇报：

1. 是否只修改了 `DeliverablesArtifact.vue`。
2. 是否保留所有 props 和 emit。
3. 产物确认页结构做了哪些调整。
4. 报告预览是否仍然可用。
5. 「确认产物并生成交付包」是否仍然触发 `generate-delivery-package`。
6. 工作台入口验收情况。
7. 智能尽调详情入口验收情况。
8. `npm run build` 是否通过。
