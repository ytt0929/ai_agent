# OpenClaw 提示词：工作台 Phase 2-B 统一尽调工作区 + 报告编辑 Lite

请继续推进【工作台 Phase 2-B】。上一轮已经完成部分 artifact 内容增强，但仍缺两个核心内容：

```text
1. 统一尽调工作区头部 DueTaskHeader / DueTaskWorkspace 壳
2. ReportEditorArtifact 报告编辑 Lite 形态
```

本轮只做这两件事。不要做浏览器自动化验收，不要安装 Playwright，不要改独立业务模块页面。

## 修改范围

只允许修改工作台相关文件：

```text
src/stores/workbenchAssistant.js
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/artifacts/DueDiligenceArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
src/components/workbench/artifacts/DueFlowProgress.vue
```

可以新增工作台内部组件：

```text
src/components/workbench/DueTaskHeader.vue
src/components/workbench/DueTaskWorkspace.vue
```

不要修改：

```text
src/pages/DueDiligenceTaskPage.vue
src/pages/DueDiligenceHomePage.vue
src/pages/SmartReportPage.vue
src/pages/TaxRpaPage.vue
src/pages/DocRecognitionPage.vue
src/stores/dueDiligence.js
src/stores/smartReport.js
```

## 目标 1：统一尽调工作区头部

文档目标是：工作台新建尽调后，左侧结果区不只是各个 artifact 拼接，而是统一成：

```text
DueTaskWorkspace
├─ DueTaskHeader      企业信息 / 模板 / 评分 / 风险 / 完整度 / 当前进度
├─ DueFlowProgress    只读流程进度
└─ 当前节点产物        business / judicial / tax / materials / evidence / risk / deliverables / reportEditor
```

本轮先实现轻量版，不要重构所有 artifact。

### 0. 先明确流程分层，不能混在同一条流程条里

工作台流程分为两段：

```text
前置编排阶段：智能筛客 → 企业探查 → 新建尽调 / 加入监控
尽调任务阶段：工商核验 → 司法查询 → 税票采集 → 资料补充 → 证据整合 → 风险诊断 → 产物确认 → 报告编辑
```

请注意：

- `智能筛客`、`企业探查`、`新建尽调` 属于工作台前置编排阶段。
- 它们不是尽调任务流程节点。
- 进入尽调任务后，尽调流程条里不要再展示 `智能筛客 / 企业探查 / 新建尽调`。
- 尽调流程条只展示：

```text
工商核验 / 司法查询 / 税票采集 / 资料补充 / 证据整合 / 风险诊断 / 产物确认 / 报告编辑
```

页面头部模式也要分开：

```text
筛客/探查阶段：
  可以保留工具胶囊：智能筛客 / 企业探查 / 新建尽调 / 加入监控

进入尽调后：
  隐藏或弱化工具胶囊，切换为 DueTaskHeader + 尽调流程进度
```

不要把当前红框里的工具胶囊原样保留在报告编辑、风险诊断、税票采集等尽调节点顶部，否则会造成用户误解：以为智能筛客、企业探查也是尽调流程的一部分。

### 1.1 新增或实现 DueTaskHeader

建议新增：

```text
src/components/workbench/DueTaskHeader.vue
```

展示内容：

```text
唐山物桥商贸有限公司
建材批发 / 商贸流通 · 河北唐山 · 500万
标准授信尽调
综合评分 72 / C+ / 中风险 / 资料完整度 86%
当前状态：等待税票RPA / 资料补充中 / 风险诊断完成 / 产物已生成
```

使用 Element Plus：

```text
el-tag
el-progress
el-descriptions 或轻量 flex
```

不要大图标，不要复杂视觉。

### 1.2 统一在 WorkbenchBusinessPanel 外层展示尽调头部

文件：

```text
src/pages/WorkbenchPage.vue
```

或者：

```text
src/components/workbench/WorkbenchBusinessPanel.vue
```

规则：

- 筛客阶段、企业探查阶段不展示 DueTaskHeader。
- 从 `dueDiligence` / `business` / `judicial` / `tax` / `materials` / `evidence` / `riskDiagnosis` / `deliverables` / `reportEditor` 开始展示 DueTaskHeader。
- DueTaskHeader 数据来自 store，不要组件内部硬编码。

建议在 store 增加 computed/函数或 state：

```js
const dueTaskHeader = computed(() => ({
  enterprise: selectedEnterprise.value,
  template: selectedDueTemplate.value,
  score: selectedEnterprise.value?.score || 72,
  grade: selectedEnterprise.value?.grade || 'C+',
  riskLevel: selectedEnterprise.value?.riskLevel || '中风险',
  completeness: currentArtifactType.value === 'materials' ? leftPanelData.completeness : 86,
  statusText: 当前 dueFlow.statusText 或 currentFlowStatus 映射
}))
```

如果 Pinia setup store return computed 不方便，也可以用普通函数/对象，但必须让页面能稳定读取。

### 1.3 流程进度统一处理

当前部分 artifact 内部有 `DueFlowProgress`，例如税票采集里。文档目标是统一工作区只展示一套流程进度。

本轮要求：

- 尽调模式下，优先在 DueTaskHeader 下方或工作区顶部统一展示 `DueFlowProgress`。
- 如果某个 artifact 内部已经重复展示 `DueFlowProgress`，请移除或用 prop 控制隐藏，避免一个页面出现两套流程条。
- `DueFlowProgress` 只读，不影响状态机。

可以在 `WorkbenchPage.vue` 左侧业务区中：

```vue
<DueTaskHeader v-if="assistant.isDueWorkspace" :data="assistant.dueTaskHeader" />
<DueFlowProgress v-if="assistant.isDueWorkspace && assistant.currentDueFlow" ... />
<WorkbenchBusinessPanel ... />
```

如果新增 `DueTaskWorkspace.vue` 更清晰，也可以做，但不要大规模改结构。

### 1.4 Store 中补齐统一头部数据

文件：

```text
src/stores/workbenchAssistant.js
```

唐山物桥统一数据：

```js
{
  name: '唐山物桥商贸有限公司',
  industry: '建材批发',
  segment: '商贸流通',
  location: '河北唐山',
  capital: '500万',
  score: 72,
  grade: 'C+',
  riskLevel: '中风险',
  completeness: 86
}
```

确保每个尽调阶段都能拿到统一企业头部信息。

## 目标 2：增强 ReportEditorArtifact 为 Lite 编辑器

当前 `ReportEditorArtifact` 是章节表 + textarea，太弱。请按文档改成 Lite 报告编辑器。

文件：

```text
src/components/workbench/artifacts/ReportEditorArtifact.vue
src/stores/workbenchAssistant.js
```

### 2.1 布局目标

左侧结果区中的报告编辑模式应为：

```text
报告编辑
标准授信尽调 · 资料完整度 86% · 待确认 2 项

┌──────────────┬──────────────────────────────────────┐
│ 报告目录       │ 当前章节正文                          │
│ 一 企业概况    │ 标题 / 状态 / 资料完整度               │
│ 二 工商核验    │ 正文内容                              │
│ 三 税票分析    │ 表格 / 风险点 / 建议                   │
│ 四 风险诊断    │ 本章证据链 / 关联资料 / 待确认项         │
│ 五 授信建议    │                                      │
│ 六 附件清单    │                                      │
└──────────────┴──────────────────────────────────────┘

[保存草稿] [导出报告] [提交确认]
```

不要跳转到 `SmartReportPage.vue`。  
不要嵌入智能报告页面自己的右侧 AI 助手。  
右侧仍然是工作台 AI Copilot。

### 2.2 交互要求

- 章节目录可点击切换当前章节。
- 当前章节正文可用 `el-input type="textarea"` 编辑。
- 展示本章证据链、关联资料、待确认项。
- 保存草稿 / 导出报告 / 提交确认按钮可以先只做 UI，不需要完整业务逻辑。
- 右侧 AI 建议按钮仍由 store 的 `fillSuggestions('editing')` 控制。

### 2.3 Store 中补齐 reportEditor artifactData

`startReportEditor()` 中需要下发更完整的数据：

```js
{
  title: '唐山物桥商贸有限公司 尽职调查报告',
  template: '标准授信尽调',
  completeness: 86,
  pendingCount: 2,
  sections: [
    {
      id: 'overview',
      no: 1,
      title: '企业概况',
      status: '已完成',
      content: '...',
      evidence: ['工商登记信息', '企业探查结果'],
      materials: ['营业执照', '工商基础资料'],
      pending: []
    },
    {
      id: 'business',
      no: 2,
      title: '工商核验',
      status: '已完成',
      content: '...',
      evidence: ['主体状态核验', '关联企业查询'],
      materials: ['工商登记信息'],
      pending: []
    },
    {
      id: 'tax',
      no: 3,
      title: '税票分析',
      status: '待确认',
      content: '...',
      evidence: ['进项发票 128/150', '销项发票 96/120', '纳税申报数据'],
      materials: ['开票明细', '纳税申报表'],
      pending: ['税负异常说明待补充']
    },
    {
      id: 'risk',
      no: 4,
      title: '风险诊断',
      status: '待确认',
      content: '...',
      evidence: ['风险事项证据链', '企业探查诊断报告'],
      materials: ['证据链清单'],
      pending: ['购销两头在外业务解释待确认']
    },
    {
      id: 'credit',
      no: 5,
      title: '授信建议',
      status: '待确认',
      content: '...',
      evidence: ['综合评分 72', '资料完整度 86%'],
      materials: ['尽调结论'],
      pending: ['授信额度和条件待确认']
    },
    {
      id: 'appendix',
      no: 6,
      title: '附件清单',
      status: '已完成',
      content: '...',
      evidence: [],
      materials: ['工商资料', '司法查询', '税票数据', '资料包'],
      pending: []
    }
  ]
}
```

组件中不要只显示一个大 textarea，要根据当前章节显示正文、证据链、关联资料、待确认项。

## 明确不要做

- 不做完整浏览器自动化验收。
- 不安装 Playwright。
- 不修改独立业务模块页面。
- 不重写所有 artifact。
- 不改变 Phase 1 状态机推进逻辑。
- 不把右侧 AI 对话收起。
- 不把报告编辑跳转到智能报告独立页面。

## 验收标准

运行：

```bash
npm run build
```

代码层确认：

```text
1. 尽调阶段左侧有统一企业头部。
2. 尽调阶段只展示一套流程进度。
3. ReportEditorArtifact 有报告目录 + 当前章节正文 + 证据链 + 关联资料 + 待确认项。
4. 右侧 AI Copilot 仍然保留。
5. 独立业务模块未修改。
```

## 输出要求

完成后输出：

1. 修改了哪些文件。
2. DueTaskHeader / 尽调工作区如何实现。
3. 是否移除了重复流程条。
4. ReportEditorArtifact Lite 增强了哪些内容。
5. `npm run build` 是否通过。
6. 哪些内容仍留到后续阶段。
