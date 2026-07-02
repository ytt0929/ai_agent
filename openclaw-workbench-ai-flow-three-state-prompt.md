# OpenClaw 提示词：实现工作台 AI Copilot 三态工作流与业务工具嵌入

你是资深 UX/UI 工程师和前端工程师，熟悉 Vue、Element Plus、银行客户经理工作台、智能筛客、企业探查、智能尽调、企业监控、风险诊断和智能报告编辑场景。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本次目标

请实现“工作台首页输入框发起后，由 AI Copilot 驱动完整业务流程”的交互原型。

核心目标：

- 用户从工作台首页输入框输入一句话后，进入 AI Copilot 工作区。
- AI 先进行意图识别，再调用对应业务工具。
- 工作区采用“三态布局”：
  1. 对话启动态：没有业务结果时，居中 AI 对话。
  2. 工作区态：有业务结果时，左侧业务结果，右侧 AI 对话。
  3. 沉浸编辑态：进入报告编辑时，报告编辑器占据主画布，AI 作为右侧报告助手，可更窄或可收起。
- UI 必须使用 Element Plus 组件，保持项目全局风格，并尽量和企业探查页面体验一致。

本次是高保真业务交互原型，不需要接真实后端，不需要真实 LLM。

## 1. 必读文件

请先阅读：

- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/components/workbench/WorkbenchArtifactPanel.vue`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/pages/EnterpriseDiagnosisPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/SmartReportPage.vue`
- `src/styles/tokens.css`
- `src/styles/global.css`

参考重点：

- 企业探查的对话优先体验：`EnterpriseExplorationWorkspacePage.vue` 中 `.edw-chat-only`
- 企业探查结果态布局：`.edw-workspace-layout`
- AI 对话面板风格：`.ai-assistant-panel`
- Element Plus 使用方式：当前项目里的 `el-button`、`el-input`、`el-table`、`el-card`、`el-tag`、`el-progress`、`el-steps`、`el-tabs`、`el-drawer` 等。

## 2. 重要限制

请遵守：

- 不要新增依赖。
- 不要接真实接口。
- 不要引入真实 LLM。
- 不要大范围重写路由。
- 不要破坏现有企业探查、尽调、监控、报告页面。
- 不要启用全局 `GlobalInputBar`。
- 不要改全局设计 token 的含义，必要时只补少量通用样式。
- 不要把所有页面硬跳转出去，工作台 AI Copilot 应该把业务工具结果嵌入到同一个工作区左侧。
- 不要处理无关中文编码问题，浏览器显示正常即可。

允许做：

- 修改 `src/pages/WorkbenchPage.vue`
- 修改 `src/components/workbench/WorkbenchConversation.vue`
- 修改 `src/components/workbench/WorkbenchArtifactPanel.vue`
- 修改 `src/components/workbench/WorkbenchStageStrip.vue`
- 修改 `src/stores/workbenchAssistant.js`
- 少量修改 `src/styles/tokens.css` 或 `src/styles/global.css`
- 如有必要，可新增小型工作台专用组件，放在 `src/components/workbench/`

## 3. 产品逻辑：一个输入框驱动完整业务流程

用户在工作台首页输入框输入：

```text
帮我筛选深圳的软件企业，看看工商风险和进度
```

进入 AI Copilot 后，应按下面流程演示。

### 3.1 对话启动态：意图识别

布局：

```text
居中 AI 对话面板
```

AI 对话内容示例：

```text
已收到需求，正在识别你的操作意图。
识别到：智能筛客工具。
筛选条件：深圳 / 软件企业 / 关注工商风险与尽调进度。
正在生成候选客户列表...
```

要求：

- 使用居中对话布局，不要左右分栏。
- 使用 Element Plus 的输入框、按钮、标签、步骤或进度组件。
- 显示轻量执行状态，例如 `el-steps`、`el-progress` 或紧凑状态条。
- 识别完成后自动进入工作区态。

### 3.2 工作区态：智能筛客结果

布局：

```text
左侧：智能筛客结果
右侧：AI 对话面板
```

左侧内容：

- 筛选条件摘要。
- 企业列表。
- 企业名称、地区、行业、风险标签、进度、建议动作。
- 支持选中一家企业。
- 使用 Element Plus：
  - `el-card`
  - `el-table`
  - `el-tag`
  - `el-button`
  - `el-empty` 或 `el-skeleton` 如有必要。

右侧 AI 提示：

```text
已完成智能筛客，识别到 5 家候选企业。
请在左侧选择一家企业进行探查，或者继续调整筛选条件。
```

右侧快捷按钮：

- 探查选中企业
- 重新筛选
- 新建尽调

### 3.3 工作区态：企业探查结果

触发方式：

- 用户在右侧输入：探查某某企业。
- 或用户在左侧表格选中一家企业后点击“探查选中企业”。

左侧切换为企业探查结果，风格参考 `EnterpriseExplorationWorkspacePage.vue`。

左侧内容：

- 企业基本信息。
- 探查结论。
- 工商风险。
- 经营风险。
- 税务风险。
- 证据链摘要。
- 使用 `el-card`、`el-descriptions`、`el-tabs`、`el-tag`、`el-table`、`el-button`。

右侧 AI 提示：

```text
已完成企业探查。
你可以将该企业加入监控，也可以新建尽调任务。
这两个动作是并列选择，也可以后续互相转入。
```

右侧快捷按钮：

- 加入监控
- 新建尽调
- 查看证据链
- 继续探查其他企业

### 3.4 并列动作：加入监控

加入监控是企业探查后的并列动作，不是尽调的必经附属功能。

触发：

- 用户点击“加入监控”。

左侧切换为监控配置 / 监控创建结果：

- 企业名称。
- 监控规则选择。
- 风险预警项。
- 监控频率。
- 创建结果。
- 使用 `el-form`、`el-checkbox-group`、`el-select`、`el-card`、`el-alert`。

右侧 AI 提示：

```text
已创建企业监控任务。
后续如果监控发现工商变更、税务异常或经营风险，可以从监控预警转入复核尽调。
```

右侧快捷按钮：

- 查看监控任务
- 从监控转入尽调
- 返回企业探查

### 3.5 并列动作：新建尽调

新建尽调也是企业探查后的并列动作。

触发：

- 用户点击“新建尽调”。
- 或从监控预警点击“从监控转入尽调”。

右侧先进入确认式对话：

```text
请先选择尽调模板。
```

模板选项：

- 标准授信尽调
- 小微快审尽调
- 税票专项尽调
- 自定义资料包

左侧展示模板选择卡或任务创建预览。

使用 Element Plus：

- `el-radio-group`
- `el-card`
- `el-button`
- `el-alert`
- `el-descriptions`

用户确认后：

右侧提示：

```text
已创建尽调任务。
正在进入智能尽调流程。
```

左侧切换为智能尽调任务页面。

### 3.6 智能尽调流程

左侧展示智能尽调流程内容，包含：

- 企业信息。
- 当前尽调模板。
- 阶段进度。
- 阶段列表：
  1. 工商校验
  2. 税票采集
  3. 资料收集
  4. 风险诊断
  5. 报告生成
  6. 报告确认
  7. 可选：加入监控

使用 Element Plus：

- `el-steps`
- `el-progress`
- `el-card`
- `el-tag`
- `el-button`
- `el-timeline`

右侧 AI 对话负责逐步推进：

```text
已创建尽调任务。
当前阶段：工商校验。
工商信息校验通过，下一步进入税票采集。
```

### 3.7 税票采集模拟

左侧展示税票采集过程：

- 生成采集链接。
- 等待企业授权。
- 模拟企业已授权。
- 采集中。
- 采集完成。
- 发票、纳税申报、纳税信用等摘要。

右侧 AI 提示和快捷按钮：

- 确认发送采集链接
- 模拟企业已授权
- 查看采集明细
- 继续资料收集

注意：

- 不要真实调用接口。
- 用 mock 状态和短延迟模拟即可。
- 不要让“确认发送链接”直接跳过“企业授权”。

### 3.8 资料包收集

根据第 3.5 选择的尽调模板，左侧生成资料包清单：

- 必需资料。
- 已收集资料。
- 缺失资料。
- 自动识别资料。
- 资料完整度。

使用 Element Plus：

- `el-table`
- `el-progress`
- `el-tag`
- `el-upload` 可以展示但不需要真实上传。
- `el-checkbox`

右侧 AI 提示：

```text
已根据“标准授信尽调”模板生成资料包。
当前资料完整度 86%，可进入风险诊断。
```

### 3.9 风险诊断

左侧展示风险诊断结果：

- 综合风险评分。
- 风险等级。
- 工商风险。
- 税务风险。
- 经营风险。
- 资料一致性风险。
- 证据链摘要。
- AI 诊断结论。

使用 Element Plus：

- `el-card`
- `el-tabs`
- `el-table`
- `el-tag`
- `el-alert`
- `el-collapse`

右侧 AI 提示：

```text
风险诊断已完成。
已生成一份诊断报告草稿，下一步可以生成最终报告。
```

### 3.10 产物生成

左侧展示产物清单：

- 尽调资料包。
- 风险诊断报告。
- 智能报告草稿。
- 附件与证据链。

右侧 AI 提示：

```text
产物已生成。
你可以开始资料包确认和报告修改。
```

快捷按钮：

- 确认资料包
- 修改报告
- 导出报告
- 加入监控

注意：

- 加入监控也可以作为尽调最后一个环节。
- 用户确认后可创建监控任务。

### 3.11 沉浸编辑态：智能报告编辑

触发：

- 用户点击“修改报告”。

布局切换为沉浸编辑态：

```text
主画布：智能报告编辑器
右侧：AI 报告助手，可以更窄或可收起
```

左侧 / 主画布内容：

- 报告标题。
- 报告目录。
- 正文编辑区。
- 风险结论。
- 证据引用。
- 修改记录。

使用 Element Plus：

- `el-tabs`
- `el-card`
- `el-input type="textarea"`
- `el-tree` 或目录列表。
- `el-button`
- `el-divider`

右侧 AI 报告助手：

可输入：

- 帮我改写风险结论
- 补充税票异常说明
- 生成授信建议
- 导出最终报告

AI 回复应该围绕报告修改，不再主要推进尽调流程。

## 4. 三态布局规则

请在工作台 AI Copilot 中实现布局状态。

### 4.1 对话启动态

适用条件：

- 刚从工作台首页输入进入。
- 尚未产生业务结果。

布局：

```text
居中 AI 对话面板
```

建议 class：

```text
workbench-ai--chat
```

### 4.2 工作区态

适用条件：

- 已经产生智能筛客、企业探查、监控、尽调、税票、资料包、风险诊断、产物等业务内容。

布局：

```text
左侧业务结果
右侧 AI 对话面板
```

建议 class：

```text
workbench-ai--workspace
```

### 4.3 沉浸编辑态

适用条件：

- 进入智能报告编辑。

布局：

```text
主画布报告编辑器
右侧 AI 报告助手
```

建议 class：

```text
workbench-ai--editor
```

## 5. 全局风格与 UI 要求

请使用项目已有设计 token：

- `var(--surface-page)`
- `var(--surface-card)`
- `var(--border-default)`
- `var(--border-divider)`
- `var(--text-primary)`
- `var(--text-secondary)`
- `var(--color-primary)`
- `var(--color-success)`
- `var(--color-warning)`
- `var(--color-danger)`
- `var(--radius-md)`
- `var(--space-md)` 等。

UI 风格要求：

- 和企业探查页面保持一致：清爽、密集、偏工作台工具感。
- 不要做营销页风格。
- 不要用大面积渐变、装饰圆球、强阴影。
- 结果区以 Element Plus 的表格、卡片、标签、步骤条为主。
- 对话区保持轻量、稳定、可持续输入。
- AI 气泡在左，用户气泡在右。
- 快捷建议按钮靠近输入框。
- 右侧 AI 面板宽度建议 360px - 420px。
- 报告编辑态右侧 AI 可更窄或可收起，但不要完全消失。

## 6. 状态与数据建议

可以在 `workbenchAssistant.js` 中新增轻量状态，但不要重写旧流程。

建议增加：

```js
layoutMode: 'chat' | 'workspace' | 'editor'
activeTool: 'intent' | 'screening' | 'exploration' | 'monitor' | 'dueDiligence' | 'tax' | 'materials' | 'riskDiagnosis' | 'deliverables' | 'reportEditor'
selectedEnterprise
selectedDueTemplate
leftPanelData
```

也可以使用已有字段组合实现，但要保证逻辑清晰。

需要支持的动作：

- `startFromWorkbenchInput(text)`
- `runIntentRecognition(text)`
- `showScreeningResults()`
- `selectEnterprise(enterprise)`
- `runEnterpriseExploration(enterprise)`
- `startMonitor(enterprise)`
- `startDueDiligence(enterprise)`
- `confirmDueTemplate(template)`
- `runTaxCollectionStep()`
- `runMaterialCollectionStep()`
- `runRiskDiagnosisStep()`
- `generateDeliverables()`
- `openReportEditor()`

以上函数名只是建议，可按现有 store 风格命名。

## 7. 左侧业务结果区建议组件

如果 `WorkbenchArtifactPanel.vue` 已经适合扩展，可以继续扩展它。

如果过于拥挤，可以新增：

```text
src/components/workbench/WorkbenchBusinessPanel.vue
```

用于根据 `activeTool` 渲染左侧业务内容。

内部可以拆小组件，也可以先写在一个文件里，但请保持结构清楚。

建议渲染：

- `screening`：智能筛客结果表。
- `exploration`：企业探查摘要。
- `monitor`：监控配置与创建结果。
- `dueDiligence`：尽调任务与步骤。
- `tax`：税票采集过程。
- `materials`：资料包清单。
- `riskDiagnosis`：风险诊断报告。
- `deliverables`：产物清单。
- `reportEditor`：报告编辑器。

## 8. 验收场景

完成后运行：

```bash
npm run build
```

并检查：

1. 工作台首页输入一句“帮我筛选深圳的软件企业”后，进入对话启动态。
2. AI 显示意图识别过程，识别到智能筛客。
3. 页面切换为工作区态，左侧出现筛客结果，右侧为 AI 对话。
4. 左侧选择企业后，可以生成企业探查结果。
5. 企业探查后，AI 提示“加入监控”和“新建尽调”是并列动作。
6. 点击加入监控，可以创建监控任务，并可从监控转入尽调。
7. 点击新建尽调，可以选择模板并创建尽调任务。
8. 尽调流程可以模拟推进：工商校验、税票采集、资料收集、风险诊断、产物生成。
9. 产物生成后，可以进入报告编辑态。
10. 报告编辑态主画布足够大，右侧 AI 变成报告助手。
11. 全流程没有出现两个输入框同时抢焦点。
12. 页面没有明显溢出、遮挡、错位。
13. `npm run build` 通过。

## 9. 最终回复

完成后请回复：

1. 修改了哪些文件。
2. 三态布局如何实现。
3. 每个业务阶段如何切换。
4. 加入监控和新建尽调如何作为并列动作。
5. 是否使用 Element Plus 组件。
6. 是否保持了和企业探查一致的风格。
7. `npm run build` 结果。

请优先实现可演示、可走通、结构清晰的高保真原型。不要扩大到真实接口或复杂后端逻辑。
