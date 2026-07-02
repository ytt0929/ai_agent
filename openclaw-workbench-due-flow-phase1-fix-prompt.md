# OpenClaw 提示词：工作台到智能尽调 Phase 1 对齐修复

你是资深 Vue 前端工程师。请基于当前 Phase 1 已完成代码，做一次小范围修复，让实现严格对齐“第一阶段：主流程骨架与状态机”的目标。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本次修复目标

当前代码已经有 12 阶段状态机，但实现更像“自动流水线版”，还没有完全达到“右侧 AI 对话 + 用户确认动作推动流程”的 demo 目标。

本次只修复 Phase 1 的交互断点，不进入 Phase 2 产物美化。

必须补齐：

```text
1. 税票采集必须停在“等待授权确认”，不能自动完成。
2. 资料补充必须停在“等待用户模拟上传”，不能自动完成。
3. 企业探查左侧必须显示“加入监控 / 新建尽调”并列动作。
4. 产物确认左侧必须显示“编辑报告”动作，并能切换到报告编辑模式。
5. 右侧快捷建议必须驱动当前工作台流程，不要跳转路由。
6. 税票采集字段必须和 TaxCollectionArtifact.vue 对齐，避免 0/0 和空状态。
7. 唐山物桥商贸有限公司关键 demo 数值要和讨论稿一致。
```

## 1. 必读文件

请先阅读：

```text
docs/workbench-due-diligence-workspace-discussion.md
openclaw-workbench-due-flow-phase1-state-machine-prompt.md
src/stores/workbenchAssistant.js
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/artifacts/EnterpriseExploreArtifact.vue
src/components/workbench/artifacts/TaxCollectionArtifact.vue
src/components/workbench/artifacts/MaterialsArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
```

## 2. 硬性限制

必须遵守：

```text
1. 不要重写整个 workbenchAssistant.js。
2. 不要改独立智能尽调页面。
3. 不要改企业探查、税票采集、智能报告等独立模块页面。
4. 不要新增路由。
5. 不要新增依赖。
6. 不要把“编辑报告”做成跳转。
7. 不要把右侧快捷动作做成路由跳转。
8. 不要做 Phase 2 的产物细节美化。
9. 不要把中文文案改坏。
10. 所有修改保持 Element Plus + token.css 风格。
```

本次只允许改：

```text
src/stores/workbenchAssistant.js
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/artifacts/EnterpriseExploreArtifact.vue
src/components/workbench/artifacts/TaxCollectionArtifact.vue
src/components/workbench/artifacts/MaterialsArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
```

如确实需要，只能对 `JudicialArtifact.vue`、`EvidenceMergeArtifact.vue` 做极小兜底修复。

## 3. 当前差距

当前代码存在这些问题，请逐项修复：

```text
1. runTaxCollectionStep() 直接把税票采集做成完成状态，并自动进入 runMaterialsStep()。
2. runMaterialsStep() 直接做成资料补充完成，并自动进入 runEvidenceMergeStep()。
3. DeliverablesArtifact.vue 没有“编辑报告”按钮事件。
4. EnterpriseExploreArtifact.vue 没有“加入监控 / 新建尽调”动作按钮。
5. WorkbenchBusinessPanel.vue 只转发 explore / select-template，不转发其他流程动作。
6. WorkbenchPage.vue 没有接收 start-monitor / start-due / confirm-tax-send / tax-authorized / mock-material-upload / edit-report 等事件。
7. contextSuggestions 定义了但基本没有按流程填充。
8. 右侧 quickActions 仍然是路由跳转，不是当前流程动作。
9. TaxCollectionArtifact.vue 读 data.input / data.output / data.filing，但 store 当前给的是 collectionItems / collectedCount / totalCount。
10. 唐山物桥商贸有限公司的风险评分、风险等级、资料完整度、证据完整度和讨论稿不一致。
```

## 4. Store 修复要求

在 `src/stores/workbenchAssistant.js` 中做增量修复。

### 4.1 新增或整理明确的用户动作函数

需要有这些可由页面调用的方法：

```text
startMonitor()
startDueDiligence()
confirmDueTemplate(template)
confirmTaxSend()
mockTaxAuthorized()
mockMaterialUpload()
enterEvidenceMerge()
enterRiskDiagnosis()
enterDeliverables()
startReportEditor()
```

如果已有同名函数，保留并修正行为，不要重复定义。

### 4.2 税票采集必须分三态

`runTaxCollectionStep()` 进入税票采集后，只能展示等待授权态，不能自动完成。

进入税票采集时：

```text
currentFlowStatus = 'waiting_tax_confirmation'
waitingForInput = true
activeStageId = 'tax'
activeTool = 'tax'
```

右侧话术：

```text
AI：已生成税票采集授权链接。请发送给企业扫码授权，有效期 24 小时。
AI：授权完成前，左侧会展示等待授权状态和采集清单。
```

左侧数据必须包含：

```js
{
  enterprise,
  status: '等待企业授权',
  authStatus: '等待授权',
  linkStatus: '待发送',
  authUrl: 'https://ai-copilot.demo/auth/rpa002',
  input: { count: 0, total: 150 },
  output: { count: 0, total: 120 },
  filing: { status: '未采集' },
  logs: [
    { time: '09:10', desc: '已生成税票采集授权链接', status: 'done' },
    { time: '—', desc: '等待发送给企业授权', status: 'waiting' }
  ],
  dueFlow: {
    statusText: '等待税票授权',
    progress: 43,
    activeKey: 'tax',
    steps: [...]
  }
}
```

用户点击“确认发送采集链接”后调用 `confirmTaxSend()`：

```text
currentFlowStatus = 'waiting_tax_authorization'
waitingForInput = true
linkStatus = '已发送'
```

右侧话术：

```text
AI：采集链接已发送。等待企业线下扫码授权完成后，可以点击“模拟企业已授权”继续。
```

用户点击“模拟企业已授权”后调用 `mockTaxAuthorized()`：

```text
authStatus = '已授权'
linkStatus = '已使用'
status = '已完成'
input = { count: 128, total: 150 }
output = { count: 96, total: 120 }
filing = { status: '已采集' }
currentFlowStatus = 'waiting_material_action'
waitingForInput = true
```

右侧话术：

```text
AI：企业已完成授权，正在采集进项发票、销项发票和纳税申报数据。
AI：税票数据采集完成。左侧已展示采集进度、发票数量和采集日志。
AI：下一步将进入资料补充，当前资料包完整度预计为 67%。
```

然后显示“进入资料补充”建议，但不要自动调用资料补充。

### 4.3 资料补充必须分两态

进入资料补充时先展示待补充态，不能自动完成。

建议新增 `runMaterialsStep()` 或修正原函数行为：

```text
currentFlowStatus = 'waiting_material_upload'
waitingForInput = true
activeStageId = 'materials'
activeTool = 'materials'
```

左侧数据：

```js
{
  enterprise,
  status: '待补充',
  completeness: 67,
  materials: [
    { name: '营业执照', type: '证照', status: '已收集' },
    { name: '近一年纳税申报', type: '税务', status: '已收集' },
    { name: '开票明细', type: '税务', status: '已收集' },
    { name: '基础工商资料', type: '工商', status: '已收集' },
    { name: '主要合同', type: '合同', status: '缺失' },
    { name: '银行流水', type: '财务', status: '缺失' },
    { name: '购销说明', type: '经营', status: '缺失' },
    { name: '税负异常说明', type: '税务', status: '缺失' }
  ],
  missing: [...]
}
```

右侧话术：

```text
AI：已根据「标准授信尽调」模板生成资料包。当前识别到 8 项资料，缺失 4 项。
AI：我可以生成资料收集清单，发送给企业补充，也可以在 demo 中模拟企业已上传资料。
```

用户点击“模拟企业上传资料”后调用 `mockMaterialUpload()`：

```text
completeness = 86
status = '已补充'
missing 只剩 2 项待确认
currentFlowStatus = 'waiting_evidence_action'
waitingForInput = true
```

右侧话术：

```text
AI：已收到企业补充资料，正在识别营业执照、合同、银行流水和税务说明。
AI：资料识别完成。当前资料包完整度提升至 86%，仍有 2 项需要后续确认。
AI：下一步将进入证据整合。
```

然后显示“进入证据整合”建议，不要自动进入。

### 4.4 证据整合、风险诊断、产物确认可以由按钮推进

第一阶段可以允许证据整合、风险诊断、产物确认快速完成，但必须通过右侧建议或左侧按钮触发。

不要从资料补充自动一路跑到产物确认。

建议：

```text
waiting_evidence_action  → 用户点击进入证据整合 → runEvidenceMergeStep()
waiting_risk_action      → 用户点击进入风险诊断 → runRiskDiagnosisStep()
waiting_deliverable_action → 用户点击进入产物确认 → runDeliverablesStep()
completed / waiting_report_action → 用户点击编辑报告 → startReportEditor()
```

### 4.5 唐山物桥关键数值统一

请把主线企业 demo 口径改回：

```text
风险评分：72 / 100
风险等级：中风险
资料完整度：86%
证据完整度：86%
诊断结论：建议有条件授信，补充交易真实性和税负异常说明
```

不要使用：

```text
62 / 高风险 / 83 / 78
```

## 5. 左侧组件事件要求

### 5.1 EnterpriseExploreArtifact.vue

在企业探查结果底部增加并列动作区：

```text
[加入监控] [新建尽调]
```

事件：

```js
defineEmits(['start-monitor', 'start-due'])
```

按钮：

```vue
<el-button @click="$emit('start-monitor')">加入监控</el-button>
<el-button type="primary" @click="$emit('start-due')">新建尽调</el-button>
```

### 5.2 TaxCollectionArtifact.vue

根据状态显示动作按钮：

如果 `linkStatus === '待发送'`：

```text
[确认发送采集链接] [复制授权链接]
```

如果 `linkStatus === '已发送' && authStatus !== '已授权'`：

```text
[模拟企业已授权] [发送提醒] [改为上传材料]
```

如果 `status === '已完成'`：

```text
[进入资料补充] [查看税票明细]
```

事件：

```js
defineEmits(['confirm-tax-send', 'tax-authorized', 'enter-materials'])
```

### 5.3 MaterialsArtifact.vue

如果 `status === '待补充'`：

```text
[发送资料清单] [模拟企业上传资料] [先进入风险诊断]
```

如果 `status === '已补充'`：

```text
[进入证据整合]
```

事件：

```js
defineEmits(['send-material-list', 'mock-material-upload', 'enter-evidence'])
```

### 5.4 EvidenceMergeArtifact.vue

增加动作：

```text
[进入风险诊断]
```

事件：

```js
defineEmits(['enter-risk'])
```

### 5.5 RiskDiagnosisArtifact.vue

增加动作：

```text
[查看诊断报告] [同步到最终报告] [进入产物确认]
```

事件：

```js
defineEmits(['view-diagnosis-report', 'sync-report', 'enter-deliverables'])
```

第一阶段“查看诊断报告”可以只弹出一个轻量提示或抽屉摘要。

### 5.6 DeliverablesArtifact.vue

增加动作：

```text
[编辑报告] [导出报告] [加入监控]
```

事件：

```js
defineEmits(['edit-report', 'export-report', 'start-monitor'])
```

点击“编辑报告”必须触发工作台左侧切换为 `reportEditor`。

### 5.7 WorkbenchBusinessPanel.vue

必须转发这些事件：

```text
explore
select-template
start-monitor
start-due
confirm-tax-send
tax-authorized
enter-materials
send-material-list
mock-material-upload
enter-evidence
enter-risk
view-diagnosis-report
sync-report
enter-deliverables
edit-report
export-report
```

### 5.8 WorkbenchPage.vue

接收 `WorkbenchBusinessPanel` 转发事件，并调用 store 方法：

```vue
@start-monitor="assistant.startMonitor()"
@start-due="assistant.startDueDiligence()"
@confirm-tax-send="assistant.confirmTaxSend()"
@tax-authorized="assistant.mockTaxAuthorized()"
@enter-materials="assistant.runMaterialsStep?.() 或 assistant.enterMaterialsStep?.()"
@mock-material-upload="assistant.mockMaterialUpload()"
@enter-evidence="assistant.enterEvidenceMerge()"
@enter-risk="assistant.enterRiskDiagnosis()"
@enter-deliverables="assistant.enterDeliverables()"
@edit-report="assistant.startReportEditor()"
```

如果 store 方法名不同，请统一命名并导出。

## 6. 右侧建议按钮要求

`contextSuggestions` 必须随状态变化填充，不要一直为空。

建议：

```text
waiting_selection:
  探查 唐山物桥商贸有限公司

waiting_action:
  新建尽调
  加入监控

waiting_template:
  选择模板「标准授信尽调」

waiting_tax_confirmation:
  确认发送采集链接

waiting_tax_authorization:
  模拟企业已授权

waiting_material_upload:
  模拟企业上传资料

waiting_evidence_action:
  进入证据整合

waiting_risk_action:
  进入风险诊断

waiting_deliverable_action:
  进入产物确认

completed / waiting_report_action:
  编辑报告
  导出报告
  加入监控

editing:
  改写风险结论
  补充税票说明
  生成授信建议
```

`handleSuggestionClick()` 必须识别这些建议并调用对应 store 方法，不要只把 label 塞进输入框重新走自然语言识别。

## 7. 右侧底部 quickActions 修正

当前 `WorkbenchPage.vue` 的底部快捷动作是路由跳转：

```text
发起尽调 / 筛选客户 / 税票采集 / 识别文件
```

在 AI Copilot 二级页里，这些按钮不应该跳走。

修复方式：

```text
1. 首页可以保留原快捷路由。
2. 二级页右侧底部优先显示 contextSuggestions。
3. 如果保留 quickActions，也必须调用 assistant 当前流程动作，不要 router.push。
```

第一阶段最简单做法：

```text
在二级页右侧隐藏 ai-assistant-panel__quick-actions，避免误跳转。
```

## 8. 税票字段对齐

`TaxCollectionArtifact.vue` 当前读：

```text
data.input.count
data.input.total
data.output.count
data.output.total
data.filing.status
```

store 必须提供这些字段。

等待授权：

```js
input: { count: 0, total: 150 }
output: { count: 0, total: 120 }
filing: { status: '未采集' }
```

采集完成：

```js
input: { count: 128, total: 150 }
output: { count: 96, total: 120 }
filing: { status: '已采集' }
```

同时保留 logs，左侧最好展示采集日志。

## 9. 文案对齐

请使用这些关键话术，不要改成完全不同口径：

```text
AI：已生成税票采集授权链接。请发送给企业扫码授权，有效期 24 小时。
AI：采集链接已发送。等待企业线下扫码授权完成后，可以点击“模拟企业已授权”继续。
AI：企业已完成授权，正在采集进项发票、销项发票和纳税申报数据。
AI：税票数据采集完成。左侧已展示采集进度、发票数量和采集日志。
AI：已根据「标准授信尽调」模板生成资料包。当前识别到 8 项资料，缺失 4 项。
AI：已收到企业补充资料，正在识别营业执照、合同、银行流水和税务说明。
AI：资料识别完成。当前资料包完整度提升至 86%，仍有 2 项需要后续确认。
AI：风险诊断已完成。该企业整体为中风险，主要风险集中在税负率偏低、收入一致性和业务真实性。
AI：产物已生成，包括尽调报告草稿、资料包、证据链和附件清单。
AI：已进入报告编辑模式。左侧是报告目录和正文，你可以选择章节修改，也可以让我辅助改写。
```

## 10. 验收标准

完成后必须执行：

```text
npm run build
```

手工验证主链路：

```text
1. 工作台首页点击“直接发送”。
2. 左侧出现筛客结果，第一条是唐山物桥商贸有限公司。
3. 点击唐山物桥商贸有限公司“探查”。
4. 左侧企业探查底部看到“加入监控 / 新建尽调”。
5. 点击“新建尽调”。
6. 选择“标准授信尽调”。
7. 工商核验、司法查询自动完成。
8. 到税票采集时必须停住，显示“确认发送采集链接”。
9. 点击确认发送采集链接。
10. 必须停住，显示“模拟企业已授权”。
11. 点击模拟企业已授权。
12. 显示采集完成，再点击进入资料补充。
13. 资料补充必须停住，显示“模拟企业上传资料”。
14. 点击模拟企业上传资料。
15. 再点击进入证据整合、风险诊断、产物确认。
16. 产物确认点击“编辑报告”。
17. 左侧切换为报告编辑模式，右侧 AI Copilot 不收起，不跳转页面。
```

浏览器控制台不得出现：

```text
Cannot read properties of null (reading 'subTree')
Cannot set properties of null (setting '__vnode')
```

左侧不得出现空白阶段。

## 11. 本次不要做

不要做：

```text
1. 不要重做 UI 视觉。
2. 不要做完整报告编辑器。
3. 不要做完整诊断报告长抽屉。
4. 不要接真实接口。
5. 不要动独立模块页面。
6. 不要把所有流程重新改回自动跑完。
```

本次完成后，Phase 1 才算真正对齐。

