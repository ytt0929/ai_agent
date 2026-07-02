# OpenClaw 提示词：Phase 3-F-1B 共用尽调节点产物 UI 统一（方案 B）

请先阅读以下文件，再开始修改：

1. `docs/workbench-due-diligence-workspace-discussion.md`
2. `src/pages/WorkbenchPage.vue`
3. `src/pages/DueDiligenceTaskPage.vue`
4. `src/components/workbench/WorkbenchBusinessPanel.vue`
5. `src/components/workbench/artifacts/*.vue`
6. `src/styles/tokens.css`

## 背景

工作台和智能尽调详情页现在复用了部分尽调节点产物组件。为了避免同类节点在两个入口长得不一样，本阶段采用 **方案 B**：

```text
允许修改共用 artifact 组件的 UI，
但必须同时兼容工作台和智能尽调详情页，
只改展示层，不改流程、不改 store、不改路由。
```

本阶段目标不是新增功能，而是统一以下 7 个核心尽调节点的左侧结果展示区样式：

```text
1. 工商核验
2. 司法查询
3. 税票采集
4. 资料补充
5. 证据整合
6. 风险诊断
7. 产物确认
```

如果这些节点后面进入报告编辑 Lite 或交付包展示，也可以做轻量兼容检查，但本阶段重点是上面 7 个节点。

## 严格边界

允许修改：

```text
src/components/workbench/artifacts/BusinessVerifyArtifact.vue
src/components/workbench/artifacts/JudicialArtifact.vue
src/components/workbench/artifacts/TaxCollectionArtifact.vue
src/components/workbench/artifacts/MaterialsArtifact.vue
src/components/workbench/artifacts/EvidenceMergeArtifact.vue
src/components/workbench/artifacts/RiskDiagnosisArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/RiskIssueList.vue
src/components/workbench/artifacts/DueFlowProgress.vue
```

必要时，可以极小范围修改：

```text
src/components/workbench/WorkbenchBusinessPanel.vue
```

不要修改：

```text
src/stores/workbenchAssistant.js
src/stores/dueDiligence.js
src/pages/WorkbenchPage.vue
src/pages/DueDiligenceTaskPage.vue
src/pages/DueDiligenceHomePage.vue
src/pages/SmartReportPage.vue
src/router/*
src/styles/tokens.css
```

不要新增路由。

不要改业务数据。

不要改任何流程推进函数。

不要改 props 字段名。

不要改 emit 事件名。

不要删除现有按钮。

不要把中文改乱码。

## 共用组件风险控制

因为这些 artifact 同时可能出现在：

```text
工作台二级页左侧结果区
智能尽调详情页左侧任务工作区
```

所以每个组件修改后必须满足：

```text
1. 在较窄容器中不溢出。
2. 在较宽容器中不显得过空。
3. 不依赖某一端独有字段。
4. data 字段缺失时有兜底展示。
5. 所有按钮仍触发原 emit。
6. 不改变节点推进节奏。
```

如果字段可能不存在，请使用安全写法：

```vue
{{ data?.xxx || '—' }}
```

或 computed 兜底。

## 保留事件要求

必须保留以下事件：

```text
BusinessVerifyArtifact：无流程事件则保持现状
JudicialArtifact：无流程事件则保持现状
TaxCollectionArtifact：
  confirm-tax-send
  tax-authorized
  enter-materials
  send-reminder
  switch-to-upload
  download-qr

MaterialsArtifact：
  send-material-list
  mock-material-upload
  enter-evidence

EvidenceMergeArtifact：
  enter-risk

RiskDiagnosisArtifact：
  view-diagnosis-report
  sync-report
  enter-deliverables

DeliverablesArtifact：
  edit-report
  export-report
  start-monitor
  sync-to-report
  generate-delivery-package
```

如果修改模板结构，必须逐个确认这些 `$emit` 仍然存在。

## 统一 UI 结构

7 个节点都尽量采用以下统一骨架：

```text
┌────────────────────────────────────────────┐
│ 节点标题 + 状态 tag + 一句话结论             │
├────────────────────────────────────────────┤
│ 核心指标区                                  │
│ 2-4 个 compact 指标卡 / progress / 状态摘要  │
├────────────────────────────────────────────┤
│ 明细区                                      │
│ el-descriptions / el-table / el-alert       │
├────────────────────────────────────────────┤
│ 操作区                                      │
│ 主按钮 + 次按钮，自动换行，不溢出             │
└────────────────────────────────────────────┘
```

### 统一视觉要求

使用 Element Plus：

```text
el-card
el-table
el-table-column
el-tag
el-descriptions
el-descriptions-item
el-progress
el-alert
el-button
el-row
el-col
el-collapse
el-collapse-item
```

禁止继续使用原生 `<table>` 做主表格。如果发现原生 table，请改为 `el-table` 或 `el-descriptions`。

不要使用大量 icon。

不要使用装饰性大色块。

不要写 marketing 风格大标题。

### token.css 要求

所有新增/调整样式必须使用 token 变量：

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

可以带 fallback：

```css
background: var(--surface-card, #fff);
border: 1px solid var(--border-default, #dbe3ef);
```

## 7 个节点逐项要求

### 1. 工商核验 `BusinessVerifyArtifact.vue`

目标结构：

```text
工商核验 · 已完成       结论：主体正常存续
------------------------------------------------
基础信息 el-descriptions
  统一社会信用代码 / 法定代表人 / 注册资本 / 成立日期
  行业 / 区域 / 关联企业 / 纳税评级

核验结果
  主体状态：正常存续
  司法风险：无重大诉讼
  关联企业：3 家

关联企业 el-table

风险提示 el-alert / el-card
```

要求：

- 现有内容保留。
- 统一卡片、间距、tag。
- 表格不能超宽。

### 2. 司法查询 `JudicialArtifact.vue`

目标结构：

```text
司法查询 · 已完成       结论：无重大司法风险
------------------------------------------------
指标卡：
  重大诉讼 / 被执行 / 失信 / 行政处罚

核验结论 el-alert

司法记录明细 el-table

数据来源 / 更新时间
```

要求：

- 指标卡在工作台窄宽度下自动换行。
- 司法记录表格列宽要自适应。

### 3. 税票采集 `TaxCollectionArtifact.vue`

目标结构：

```text
税票采集 · 等待授权 / 已发送 / 已完成
------------------------------------------------
授权状态 el-descriptions
  授权状态 / 链接状态 / 有效期 / 采集方式

授权链接 / 二维码区域

采集进度：
  进项发票 / 销项发票 / 纳税申报
  el-progress

采集日志：
  时间 / 事项 / 状态

操作区：
  主按钮：确认发送 / 模拟授权 / 进入资料补充
  次按钮：发送提醒 / 改为上传材料 / 下载二维码
```

要求：

- 未授权、已发送、已完成三种状态都要排版正常。
- 操作按钮必须自动换行，不能超出背景。
- 授权链接太长要 `word-break: break-all`。

### 4. 资料补充 `MaterialsArtifact.vue`

目标结构：

```text
资料包 · 完整度 86%
------------------------------------------------
el-progress

指标卡：
  已收集 / 待补充 / 待识别

资料清单 el-table
  资料名称 / 类型 / 状态

缺失资料 el-alert 或 list

操作区：
  发送资料清单
  模拟客户上传资料
  进入证据整合
```

要求：

- 完整度突出但不做大色块。
- 资料状态 tag 统一。

### 5. 证据整合 `EvidenceMergeArtifact.vue`

目标结构：

```text
证据整合 · 已完成
------------------------------------------------
指标卡：
  证据完整度 / 已归档 / 待确认

证据来源分布
  工商 / 司法 / 税票 / 资料包

风险事项证据链 el-table
  风险事项 / 证据数 / 置信度 / 操作

证据缺口提示

操作区：
  进入风险诊断
```

要求：

- 如果已有“查看具体内容”入口，必须保留。
- 不要让证据卡片像聊天过程卡片堆在右侧。

### 6. 风险诊断 `RiskDiagnosisArtifact.vue`

目标结构：

```text
风险诊断 · 已完成
------------------------------------------------
评分卡：
  综合评分 / 等级 / 风险等级

诊断结论 el-alert

风险事项：
  复用 RiskIssueList，但统一字体、间距、tag

建议动作：
  进一步核实收入真实性
  补充银行流水核验
  约谈实际控制人

操作区：
  查看诊断报告
  同步报告
  进入产物确认
```

要求：

- 风险事项列表必须适配工作台和智能尽调详情页宽度。
- 按钮不溢出。

### 7. 产物确认 `DeliverablesArtifact.vue`

目标结构：

```text
尽调产物 · 已生成
------------------------------------------------
产物表格 el-table
  产物名称 / 状态 / 数量 / 操作

报告模板与资料包 el-descriptions
  报告模板：尽职调查报告
  资料包：工商资料 / 司法查询 / 税票数据 / 上传资料

待确认项
  风险结论需确认
  税票异常说明待补充
  授信建议待确认

预览面板
  保持现有功能

操作区：
  主按钮：确认产物并生成交付包
  次按钮：编辑报告 / 导出报告 / 加入监控
```

要求：

- 当前按钮容易超出背景，必须修复。
- `确认产物并生成交付包` 必须保留 `generate-delivery-package` 事件。
- 预览面板不能覆盖右侧 AI 对话。

## 通用 CSS 约束

每个根节点建议：

```css
display: flex;
flex-direction: column;
gap: var(--space-md, 16px);
min-width: 0;
max-width: 100%;
box-sizing: border-box;
```

表格外层：

```css
min-width: 0;
overflow: hidden;
```

操作区：

```css
display: flex;
align-items: center;
justify-content: flex-end;
flex-wrap: wrap;
gap: var(--space-sm, 8px);
min-width: 0;
```

Element Plus 表格建议：

```vue
<el-table size="small" stripe border style="width: 100%">
```

不要给表格写死大宽度。

## 双入口验收

完成后必须同时检查两个入口：

### A. 工作台入口

```text
工作台 -> 智能筛客 -> 探查唐山物桥 -> 新建尽调 -> 选择尽职调查报告
-> 开始工商核验 -> 依次检查 7 个节点 -> 产物确认
```

检查点：

```text
左侧结果区不溢出
按钮不超出背景
表格可读
滚动正常
右侧 AI 对话不被覆盖
```

### B. 智能尽调详情入口

```text
智能尽调首页 -> 点击任务继续处理 / 查看详情
-> 智能尽调详情页 -> 检查工商核验、司法查询、税票采集、资料补充、证据整合、风险诊断、产物确认
```

检查点：

```text
同一 artifact 在智能尽调详情页不破版
右侧尽调助手按钮仍可推进
顶部流程条不受影响
```

## 构建要求

完成后运行：

```bash
npm run build
```

## 输出要求

完成后请汇报：

1. 修改了哪些 artifact 文件。
2. 是否只改展示层，没有改 store / 页面 / 路由。
3. 是否保留所有 props 和 emit。
4. 哪些原生 table 被替换成 Element Plus。
5. 哪些按钮溢出或容器溢出问题已修复。
6. 工作台入口验收情况。
7. 智能尽调详情入口验收情况。
8. `npm run build` 是否通过。
