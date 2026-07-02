# OpenClaw 强约束提示词：按企业探查 UI 硬性重做工作台二级页布局与组件

你是资深前端工程师和 UX/UI 工程师。请严格按本提示词修改【工作台】AI Copilot 二级页面。当前页面虽然已经改成左内容 + 右对话，但效果仍然偏离项目整体 UI 和企业探查页面：右侧 AI 面板顶到页面顶部、没有合理上下留白、滚动区不正确、左侧内容没有使用 Element Plus 组件体系、整体不像项目现有企业探查工作区。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 最高优先级目标

目标效果必须接近企业探查页面，而不是自定义裸 UI。

请参考：

- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- 企业探查右侧 AI 面板 `.ai-assistant-panel`
- 企业探查工作区布局 `.edw-workspace-layout`
- 企业探查内容区卡片、表格、对话气泡、输入框的风格

工作台二级页最终必须满足：

```text
顶部：工作台 AI Copilot 顶部栏 + 阶段胶囊导航
主体：有上下留白的工作区
左侧：业务内容展示区，使用 Element Plus 组件
右侧：AI Copilot 对话面板，类似企业探查右侧 AI 助手
底部：输入框只在右侧 AI 面板内，不横跨页面
```

## 1. 必读文件

请先阅读并修改以下文件：

- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/styles/tokens.css`
- `src/styles/global.css`

不要只改样式。当前问题同时包含：

- 布局容器没有企业探查式的页面留白。
- 右侧 AI 面板没有卡片容器感，直接顶到顶部。
- 左侧业务区仍像裸表格/裸块。
- 滚动容器没有清晰分层。
- 部分 UI 没有使用 Element Plus 组件。

## 1.1 全局 `tokens.css` 硬性要求

本次不能只在 `WorkbenchPage.vue` 的 scoped CSS 里硬写一套孤立样式。必须先检查 `src/styles/tokens.css`，确认项目已有全局 token 和公共 AI 面板类，然后复用它们。

必须阅读并对齐这些变量：

```css
--surface-page
--surface-card
--surface-soft
--border-default
--border-divider
--border-soft
--text-primary
--text-secondary
--text-tertiary
--color-primary
--color-primary-bg
--color-success
--color-success-bg
--color-warning
--color-warning-bg
--color-danger
--color-danger-bg
--radius-sm
--radius-md
--radius-lg
--space-xs
--space-sm
--space-md
--space-lg
--space-xl
--shadow-sm
--shadow-md
```

必须检查 `tokens.css` 中是否已有这些公共类：

```css
.ai-assistant-panel
.ai-assistant-panel__header
.ai-assistant-panel__title
.ai-assistant-panel__messages
.ai-assistant-panel__quick
.ai-assistant-panel__footer
.ai-assistant-panel__input
.ai-assistant-panel__send
.ai-message
.ai-message--ai
.ai-message--user
.ai-message__avatar
.ai-message__bubble
.ai-message__actions
```

如果已有：

- 工作台右侧 AI 面板必须复用这些公共类。
- 只允许在 `WorkbenchPage.vue` 里做布局尺寸补充，例如宽度、gap、padding。
- 不要重新发明另一套 `.wb-ai-message-*`。

如果缺失或不完整：

- 请在 `src/styles/tokens.css` 里补齐公共类。
- 企业探查页面和工作台页面都应该能共享这些类。
- 补充必须克制，不要改动 token 语义，不要破坏其他页面。

工作台页面中的颜色、边框、阴影、圆角、间距必须优先使用 token，不要硬写大量散落颜色。例如：

```css
background: var(--surface-card);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
color: var(--text-primary);
```

允许少量固定尺寸：

```css
grid-template-columns: minmax(0, 1fr) 420px;
padding: 24px 28px;
```

禁止在工作台 scoped CSS 里大面积硬编码：

```css
#f1f5f9
#e5e7eb
#2563eb
box-shadow: 0 8px 32px ...
```

除非这些值已经是 token 缺失且确有必要，否则应放入 `tokens.css` 或复用现有 token。

## 2. 必须修的当前问题

### 问题 A：右侧 AI 对话面板顶到页面顶部

当前截图里右侧 `AI Copilot` 面板从页面最顶部开始，和企业探查不一致。

必须改成：

- 右侧 AI 面板在主体工作区内。
- 主体工作区整体有顶部留白。
- 右侧 AI 面板是一个独立白色卡片/面板，不能直接贴浏览器顶部。
- 面板顶部应与左侧业务内容顶部对齐。
- 面板外侧有背景留白。

### 问题 B：缺少清晰的上下滚动容器

当前页面看起来没有正确的上下滚动条/滚动区。

必须实现：

```text
页面整体：不让 body 乱滚
工作区主体：高度 calc(100vh - header - stageNav)，内部滚动
左侧业务区：独立 overflow-y: auto
右侧消息区：独立 overflow-y: auto
右侧输入框：固定在面板底部
```

硬性 CSS 要求：

```css
.wb-copilot {
  height: 100vh;
  overflow: hidden;
}

.wb-state-split {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.wb-state-split__left {
  overflow-y: auto;
}

.wb-state-split__right-msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
```

如果父级高度不是 `100vh`，请按 `App.vue` / `.app-main` 的实际结构补齐高度链路，不要让滚动失效。

### 问题 C：没有充分使用 Element Plus 组件

左侧业务区不得使用裸 `<table>`、裸按钮、裸卡片模拟。

必须使用 Element Plus：

- 表格：`el-table`、`el-table-column`
- 卡片：`el-card`
- 标签：`el-tag`
- 指标：`el-statistic` 或 `el-card + el-row/el-col`
- 按钮：`el-button`
- 输入：`el-input`
- 进度：`el-progress`
- 步骤：`el-steps` / `el-step`
- 描述：`el-descriptions`
- 提示：`el-alert`
- tabs：`el-tabs` / `el-tab-pane`

如果某个业务区现在是原生 div 拼出来的，请替换成 Element Plus 组件。

### 问题 D：左侧内容区不像企业探查

左侧业务内容区必须像企业探查结果页：

- 页面内边距 `24px 28px` 或接近。
- 标题区清晰。
- 主内容使用 `el-card` 承载。
- 表格使用 `el-table`。
- 指标用卡片网格展示。
- 风险/状态用 `el-tag`。
- 不要裸表格、不要无边界白块。

### 问题 E：右侧对话气泡不像企业探查

右侧 AI 对话面板必须接近企业探查 AI 助手：

- AI 消息左侧。
- 用户消息右侧。
- AI 头像蓝色圆形或项目统一样式。
- 用户头像显示 `我`，不要乱码。
- AI 气泡浅灰/浅蓝底，有细边框。
- 用户气泡主蓝色底，白字。
- 气泡宽度在右侧窄面板内合理，不溢出。
- 消息区滚动，输入区固定。

## 3. 必须修改 `WorkbenchPage.vue`

### 3.1 主体结构必须改成“页面壳 + 主体工作区”

当前工作区主体需要增加一个类似企业探查页面的容器，不要让左右分栏直接顶到 header。

请将 workspace 态结构调整为：

```vue
<div v-else class="wb-state-split-shell">
  <div class="wb-state-split">
    <main class="wb-state-split__left">
      <WorkbenchBusinessPanel
        :tool="assistant.activeTool"
        :data="assistant.leftPanelData"
        @explore="onExplore"
        @select-template="onTpl"
      />
    </main>

    <aside class="wb-state-split__right ai-assistant-panel">
      <div class="wb-state-split__right-head ai-assistant-panel__header">
        <h3 class="ai-assistant-panel__title">AI Copilot</h3>
        <el-button text size="small" @click="clearChat">清空</el-button>
      </div>

      <div class="wb-state-split__right-msgs ai-assistant-panel__messages">
        <WorkbenchConversation ... />
      </div>

      <div class="wb-state-split__quick ai-assistant-panel__quick" v-if="assistant.contextSuggestions.length">
        <el-button
          v-for="(s, i) in assistant.contextSuggestions"
          :key="i"
          size="small"
          round
          plain
          type="primary"
          @click="assistant.handleSuggestionClick(s)"
        >
          {{ s.label }}
        </el-button>
      </div>

      <div class="wb-composer wb-composer--right ai-assistant-panel__footer">
        <el-input
          v-model="dialogInputLocal"
          :placeholder="dialogPlaceholder"
          clearable
          @keyup.enter="sendMsg"
          size="large"
        />
        <el-button type="primary" @click="sendMsg">
          发送
        </el-button>
      </div>
    </aside>
  </div>
</div>
```

硬性要求：

- 快捷建议按钮用 `el-button`，不要原生 `<button>`。
- 输入区用 `el-input + el-button`，不要只依赖 append 插槽挤在一起。
- 右侧面板必须复用或对齐 `.ai-assistant-panel` 风格。
- 右侧面板不要贴顶，必须在 `.wb-state-split-shell` 内。

### 3.2 workspace 态 CSS 必须按这个方向改

请在 `WorkbenchPage.vue` scoped style 中加入或替换：

```css
.wb-state-split-shell {
  flex: 1;
  min-height: 0;
  padding: 24px 28px 24px;
  overflow: hidden;
  background: var(--surface-page);
}

.wb-state-split {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 24px;
  overflow: hidden;
}

.wb-state-split__left {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.wb-state-split__right {
  min-width: 0;
  width: 420px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.wb-state-split__right-head {
  height: 52px;
  padding: 0 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-divider);
}

.wb-state-split__right-msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

.wb-state-split__quick {
  flex-shrink: 0;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid var(--border-divider);
}

.wb-composer--right {
  flex-shrink: 0;
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  background: var(--surface-card);
  border-top: 1px solid var(--border-divider);
}

.wb-composer--right .el-input {
  flex: 1;
}

.wb-composer--right .el-button {
  flex-shrink: 0;
}
```

注意：如果已有同名样式冲突，请删除旧样式，不要叠加出奇怪效果。

### 3.3 chat-center 态也要有企业探查式留白

居中态不能贴顶。

要求：

```css
.wb-state-center {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 32px 28px 24px;
  background: var(--surface-page);
}

.wb-state-center__col {
  width: min(860px, 100%);
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
```

## 4. 必须修改 `WorkbenchConversation.vue`

当前对话组件内部仍像旧工作台，不完全像企业探查。

请硬性调整：

1. `.conversation` 不要自己加大背景和大 padding，外层面板已经有 padding。
2. 消息区宽度 100%。
3. AI/user 使用 flex + order 控制，不用 `row-reverse`。
4. 用户头像写 `我`，不要乱码。
5. 日期 chip 居中，弱化。
6. 流程卡片如果出现在右侧面板内，宽度不能超过 100%，不能产生横向滚动。

建议样式：

```css
.conversation {
  width: 100%;
  min-height: 0;
  overflow-y: visible;
  padding: 0;
  background: transparent;
}

.message {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
}

.message.ai {
  justify-content: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message.ai .ai-avatar {
  order: 0;
}

.message.ai .bubble {
  order: 1;
}

.message.user .bubble {
  order: 0;
}

.message.user .user-avatar {
  order: 1;
}

.bubble.ai {
  max-width: 86%;
  background: #f8fafc;
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  border-top-left-radius: 4px;
}

.bubble.user {
  max-width: 76%;
  background: var(--color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
```

## 5. 必须修改 `WorkbenchBusinessPanel.vue`

左侧业务面板必须改成 Element Plus 风格，不允许裸 table 和简陋 div 卡片。

当前左侧展示区太单调的根因是：`WorkbenchBusinessPanel.vue` 只做了很薄的阶段摘要，没有复用项目里已有业务页面/阶段组件的产物 UI。

本次必须把左侧展示区从“阶段摘要卡片”升级为：

```text
当前业务工具的嵌入式工作页 / 产物展示页
```

也就是：

```text
智能筛客结果 → 企业探查结果 → 工商校验 → 税票采集 → 资料收集 → 风险诊断 → 产物生成 → 报告编辑
```

每个阶段左侧都应该有足够丰富的业务内容，而不是三行表格或单个提示条。

## 5.0 新增产物复用层：`src/components/workbench/artifacts/`

请新增目录：

```text
src/components/workbench/artifacts/
```

并把左侧各业务阶段拆成可复用产物组件。

最低要求新增这些组件：

```text
src/components/workbench/artifacts/ScreeningArtifact.vue
src/components/workbench/artifacts/EnterpriseExploreArtifact.vue
src/components/workbench/artifacts/BusinessVerifyArtifact.vue
src/components/workbench/artifacts/TaxCollectionArtifact.vue
src/components/workbench/artifacts/MaterialsArtifact.vue
src/components/workbench/artifacts/RiskDiagnosisArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
src/components/workbench/artifacts/MonitorArtifact.vue
```

`WorkbenchBusinessPanel.vue` 不要继续写所有阶段的大量模板。它应该变成统一壳 + 动态分发：

```vue
<template>
  <div class="wb-business-panel">
    <component
      :is="artifactComponent"
      :data="data"
      @explore="$emit('explore', $event)"
      @select-template="$emit('select-template', $event)"
      @action="$emit('action', $event)"
    />
  </div>
</template>
```

建议：

```js
import ScreeningArtifact from './artifacts/ScreeningArtifact.vue'
import EnterpriseExploreArtifact from './artifacts/EnterpriseExploreArtifact.vue'
import BusinessVerifyArtifact from './artifacts/BusinessVerifyArtifact.vue'
import TaxCollectionArtifact from './artifacts/TaxCollectionArtifact.vue'
import MaterialsArtifact from './artifacts/MaterialsArtifact.vue'
import RiskDiagnosisArtifact from './artifacts/RiskDiagnosisArtifact.vue'
import DeliverablesArtifact from './artifacts/DeliverablesArtifact.vue'
import ReportEditorArtifact from './artifacts/ReportEditorArtifact.vue'
import MonitorArtifact from './artifacts/MonitorArtifact.vue'

const artifactComponent = computed(() => ({
  screening: ScreeningArtifact,
  exploration: EnterpriseExploreArtifact,
  business: BusinessVerifyArtifact,
  tax: TaxCollectionArtifact,
  materials: MaterialsArtifact,
  riskDiagnosis: RiskDiagnosisArtifact,
  deliverables: DeliverablesArtifact,
  reportEditor: ReportEditorArtifact,
  monitor: MonitorArtifact,
  dueDiligence: DueDiligenceArtifact,
}[props.tool] || EmptyArtifact)
```

如果时间有限，可以先不新增 `DueDiligenceArtifact.vue`，但 `dueDiligence` 阶段也必须有一个比当前更丰富的模板选择/任务创建视图。

## 5.0.1 产物 UI 的复用来源

请不要凭空重新画所有内容。优先从以下页面/组件抽取设计和结构：

### 智能筛客 `ScreeningArtifact.vue`

参考：

- `src/components/ScreeningResultCard.vue`
- `src/pages/ScreeningResultsPage.vue`
- `src/stores/workbenchAssistant.js` 中候选企业 mock 数据

必须包含：

- 筛选条件摘要。
- 指标卡：匹配企业、高风险过滤、适合转尽调、平均匹配度。
- 企业列表 `el-table`。
- 每行支持“探查”。
- 风险、标签、匹配度用 `el-tag` / `el-progress`。

### 企业探查 `EnterpriseExploreArtifact.vue`

参考：

- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/data/mockEnterpriseSourceData.js`
- `src/data/mockEnterpriseDiagnosis.js`

必须包含：

- 企业基本信息。
- 探查结论卡。
- 工商/经营/税务/司法/证据链 tabs。
- 风险等级标签。
- 证据来源摘要。

不要只显示 `el-descriptions` 四行信息。

### 工商校验 `BusinessVerifyArtifact.vue`

参考：

- `src/components/steps/VerifyStep.vue`
- `src/pages/DueDiligenceTaskPage.vue` 里的工商/司法风险阶段内容

必须包含：

- 工商登记校验结果。
- 主体状态。
- 法人/注册资本/成立日期。
- 司法风险、关联企业、行政处罚。
- 至少 3 个状态卡 + 1 个明细表。

### 税票采集 `TaxCollectionArtifact.vue`

参考：

- `src/components/steps/TaxRpaStep.vue`
- `src/pages/TaxRpaPage.vue`

必须包含：

- 授权状态。
- 链接状态。
- RPA 采集进度。
- 进项/销项/申报数据指标。
- 采集日志 timeline。
- 使用 `el-steps`、`el-progress`、`el-card`、`el-tag`。

### 资料收集 `MaterialsArtifact.vue`

参考：

- `src/components/steps/MaterialsStep.vue`
- `src/pages/DocRecognitionPage.vue`

必须包含：

- 资料完整度。
- 已收集/待补充/待识别指标。
- 资料清单表。
- 缺失资料列表。
- 可展示 `el-upload` 但不需要真实上传。

### 风险诊断 `RiskDiagnosisArtifact.vue`

参考：

- `src/components/steps/RiskStep.vue`
- `src/pages/EnterpriseDiagnosisPage.vue`

必须包含：

- 综合评分。
- 风险等级。
- 高/中/低风险统计。
- 风险事项列表。
- 证据链摘要。
- 建议动作。
- 使用 `el-tabs` / `el-collapse` / `el-alert` / `el-tag`。

### 产物生成 `DeliverablesArtifact.vue`

参考：

- `src/components/steps/ArtifactsStep.vue`
- `src/pages/DueDiligenceTaskPage.vue` 的产物确认区

必须包含：

- 尽调资料包。
- 风险诊断报告。
- 智能报告草稿。
- 附件与证据链。
- 每个产物有状态、数量、操作按钮。

### 报告编辑 `ReportEditorArtifact.vue`

参考：

- `src/pages/SmartReportPage.vue`

必须包含：

- 报告标题。
- 章节目录。
- 章节状态标签。
- 正文编辑区 `el-input type="textarea"`。
- AI 辅助提示条。
- 保存/确认按钮。

### 企业监控 `MonitorArtifact.vue`

参考：

- `src/pages/EnterpriseMonitorPage.vue`
- `src/components/MonitorStatusCard.vue`
- `src/data/mockEnterpriseMonitor.js`

必须包含：

- 监控规则。
- 监控频率。
- 风险预警项。
- 当前状态。
- 可从监控转入尽调的提示。

## 5.0.2 `leftPanelData` 要改成“产物数据包”

在 `src/stores/workbenchAssistant.js` 中，`leftPanelData` 不要继续只是零散字段。每个阶段都应给左侧组件一个完整数据包。

建议结构：

```js
leftPanelData = {
  title: '',
  enterprise: {},
  summary: {},
  metrics: [],
  filters: [],
  tables: {},
  risks: [],
  evidence: [],
  timeline: [],
  materials: [],
  deliverables: [],
  actions: [],
}
```

请新增轻量 adapter 函数，把当前 mock/stage 数据转成统一产物数据：

```js
function setLeftPanel(tool, payload = {}) {
  activeTool.value = tool
  Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
  Object.assign(leftPanelData, payload)
}
```

然后各阶段调用：

```js
setLeftPanel('screening', buildScreeningArtifactData(enterprises, filters))
setLeftPanel('exploration', buildExploreArtifactData(enterprise, stage.artifactData))
setLeftPanel('business', buildBusinessVerifyArtifactData(stage.artifactData))
setLeftPanel('tax', buildTaxArtifactData(stage.artifactData))
setLeftPanel('materials', buildMaterialsArtifactData(stage.artifactData))
setLeftPanel('riskDiagnosis', buildRiskArtifactData(stage.artifactData))
setLeftPanel('deliverables', buildDeliverablesArtifactData(stage.artifactData))
setLeftPanel('reportEditor', buildReportArtifactData(stage.artifactData))
```

不要到处直接 `Object.assign(leftPanelData, ...)` 写零散字段。可以保留少量兼容，但新增流程必须优先用 `setLeftPanel()`。

## 5.0.3 左侧丰富度验收标准

以下任一情况算不合格：

- 工商校验仍然只有一张三行表。
- 税票采集没有进度、日志、指标。
- 资料收集没有完整度和资料列表。
- 风险诊断只有一个分数，没有风险列表。
- 报告编辑只有裸 textarea。
- 企业探查只有四行 `el-descriptions`。
- 左侧大面积空白，内容高度不足 500px。

### 5.1 外层

```vue
<div class="wb-business-panel">
  <div class="wb-business-panel__header">...</div>
  <div class="wb-business-panel__body">...</div>
</div>
```

CSS：

```css
.wb-business-panel {
  min-height: 100%;
  padding: 0;
}

.wb-business-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.wb-business-panel__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

### 5.2 筛客结果必须使用 Element Plus

`tool === 'screening'` 时请使用：

- `el-card` 承载筛选摘要。
- `el-row` / `el-col` 或多个 `el-card` 承载指标。
- `el-table` 展示企业列表。
- `el-button type="primary" link` 做“探查”操作。
- `el-tag` 展示风险。

结构示例：

```vue
<el-card shadow="never" class="wb-biz-card">
  <template #header>
    <div class="wb-card-head">
      <span>智能筛客结果</span>
      <el-tag type="success" size="small">{{ data.summary?.recommended }}</el-tag>
    </div>
  </template>

  <div class="wb-filter-tags">
    <el-tag v-for="f in data.filters" :key="f" type="info" effect="plain">
      {{ f }}
    </el-tag>
  </div>

  <el-row :gutter="12" class="wb-metric-row">
    <el-col :span="8">
      <el-card shadow="never" class="wb-metric-card">
        <div class="wb-metric-label">匹配企业</div>
        <div class="wb-metric-value">{{ data.summary?.matched }}</div>
      </el-card>
    </el-col>
    ...
  </el-row>

  <el-table :data="data.enterprises || []" stripe border>
    ...
  </el-table>
</el-card>
```

### 5.3 报告编辑必须像截图，不要裸 textarea

`tool === 'reportEditor'` 时：

- 外层用 `el-card`。
- 章节列表用 `el-card` / `el-table` / `el-tag`。
- 正文编辑用 `el-input type="textarea"`。
- 状态标签用 `el-tag`。

## 6. 必须修改 `WorkbenchStageStrip.vue`

顶部阶段条现在要像截图中的胶囊按钮，不能抢太多高度。

要求：

- 外层高度控制在 `64px - 72px`。
- 横向滚动但不出现难看的滚动条。
- 每个阶段用 `el-button` 或 `el-tag` 风格，不要原生按钮。
- 当前阶段蓝色实心。
- 已完成阶段浅绿色。
- 未完成阶段浅灰/浅蓝。

如果当前组件使用原生 button，请换成 `el-button`。

## 7. 状态源硬性要求

在 `src/stores/workbenchAssistant.js` 中：

- `layoutMode` 是唯一布局状态源。
- `activeTool + leftPanelData` 是唯一左侧业务内容状态源。
- `messages + contextSuggestions` 是唯一右侧对话状态源。
- `currentArtifactType/artifactData` 只能兼容旧逻辑，不允许决定页面左右布局。

必须确认：

```js
runScreening() 生成结果后必须执行：
layoutMode.value = 'workspace'
activeTool.value = 'screening'
```

如果这行被注释吞掉，必须修复。

## 8. 禁止事项

以下任一项出现都算不合格：

- 右侧 AI 面板顶到页面最顶部，没有主体留白。
- 页面没有正确滚动区，内容被截断但无法滚动。
- 业务结果使用裸 `<table>`。
- 快捷建议使用裸 `<button>`。
- 工作台主布局中出现 `WorkbenchArtifactPanel` 或“阶段产物”右栏。
- 输入框横跨左侧和右侧。
- 同时出现两个输入框。
- 用户头像显示乱码。
- `body` 产生不受控横向滚动。
- 新增依赖。

## 9. 验收

完成后运行：

```bash
npm run build
```

验收场景：

1. 进入工作台，输入“帮我筛选深圳的软件企业”。
2. 初始阶段对话居中，有合理顶部留白。
3. 筛客结果生成后，左侧是 Element Plus 风格业务结果，右侧是企业探查风格 AI 面板。
4. 右侧 AI 面板没有顶到页面顶部，而是在主体工作区内。
5. 左侧业务区内容超出时可上下滚动。
6. 右侧消息超出时消息区可上下滚动，输入框固定在底部。
7. 快捷建议是 `el-button`。
8. 表格是 `el-table`。
9. 用户消息头像是“我”，不是乱码。
10. 页面没有“阶段产物”右栏。
11. `npm run build` 通过。

## 10. 最终回复

完成后请回复：

1. 修改了哪些文件。
2. 右侧 AI 面板如何对齐企业探查风格。
3. 哪些地方改用了 Element Plus 组件。
4. 上下滚动容器如何实现。
5. 是否彻底移除工作台主布局中的“阶段产物”右栏。
6. `npm run build` 结果。

请严格按上述验收项修改，不要用“已经差不多”作为完成标准。
