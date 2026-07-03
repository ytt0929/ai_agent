# OpenClaw Prompt: Phase 3-G Step 3 工作台交付包下载补统一尽调头部

## 背景

智能尽调详情页的「交付包下载」已经有统一头部和流程条，本轮不要改智能尽调详情页。

当前需要修的是：工作台内跑完整尽调 demo 流程后，进入「交付包下载」时，它应该也是尽调流程的第 8 个正式环节，需要显示和工作台其他尽调节点一致的统一头部，而不是像孤立的交付包结果卡。

## 本轮目标

只做一件事：

> 工作台的「交付包下载」阶段补齐统一尽调头部和第 8 节点流程条。

效果应类似：

```text
┌──────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司                         [交付包已生成] 100% │
│ 商贸流通 / 河北省唐山市                                      │
│ [尽职调查报告] 综合评分 72 [C+] [中风险] 资料完整度 86%        │
├──────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ─ ✓ 司法查询 ─ ✓ 税票采集 ─ ✓ 资料补充 ─ ✓ 证据整合 │
│      ─ ✓ 风险诊断 ─ ✓ 产物确认 ─ ◎ 交付包下载                 │
└──────────────────────────────────────────────────────────────┘

下面才是交付包清单和下载按钮。
```

## 允许修改的文件

只允许修改：

- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`

说明：

- 优先通过 `workbenchAssistant.js` 给 `deliveryPackage` stage 补齐 `artifactData.dueFlow`。
- `WorkbenchPage.vue` 只允许做兜底读取或很小的标题映射修补。

## 禁止修改

严禁修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/DueDiligenceHomePage.vue`
- `src/stores/dueDiligence.js`
- `src/components/workbench/artifacts/*`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/router/*`
- `src/styles/tokens.css`
- `src/data/*`
- 智能报告页面

不要处理乱码。浏览器页面中文是正常的，PowerShell 读取文件时出现乱码是终端编码问题，不属于本轮任务。

## 当前代码线索

工作台统一尽调头部在：

- `src/pages/WorkbenchPage.vue`
- `v-if="assistant.isDueWorkspace && currentDueFlow"`
- `currentDueFlow` 目前从当前 stage 的 `artifactData.dueFlow` 读取

交付包生成逻辑在：

- `src/stores/workbenchAssistant.js`
- `generateDeliveryPackage()`
- 其中会 `upsertStage({ id: 'deliveryPackage', ... artifactData: { ...dpArtifactData } })`
- 当前 `dpArtifactData` 可能没有 `dueFlow`，导致工作台交付包下载阶段没有统一头部

注意：请先用 `rg "function generateDeliveryPackage|async function generateDeliveryPackage"` 检查 `workbenchAssistant.js` 中是否存在重复定义。如果存在重复定义：

- 不要大重构全文件
- 但必须保证实际生效/导出的 `generateDeliveryPackage()` 给 `deliveryPackage` stage 补齐 `dueFlow`
- 如有两处重复实现且都可能被保留，请保持两处逻辑一致，避免后续 HMR 或函数覆盖导致行为不一致

## 必须实现

### 1. deliveryPackage stage 必须带 dueFlow

在 `generateDeliveryPackage()` 生成 `dpArtifactData` 时，补充：

```js
dueFlow: {
  enterpriseName,
  industry,
  region,
  templateName,
  score,
  grade,
  riskLevel,
  completeness,
  materialComplete,
  statusText: '交付包已生成',
  progress: 100,
  steps: [
    { key: 'business', label: '工商核验', status: 'done' },
    { key: 'judicial', label: '司法查询', status: 'done' },
    { key: 'tax', label: '税票采集', status: 'done' },
    { key: 'materials', label: '资料补充', status: 'done' },
    { key: 'evidence', label: '证据整合', status: 'done' },
    { key: 'riskDiagnosis', label: '风险诊断', status: 'done' },
    { key: 'deliverables', label: '产物确认', status: 'done' },
    { key: 'deliveryPackage', label: '交付包下载', status: 'active' }
  ]
}
```

字段值必须尽量复用现有数据来源：

- 企业名：`selectedEnterprise.value?.name` 或已有兜底
- 行业：`selectedEnterprise.value?.industry` 或兜底 `商贸流通`
- 地区：`selectedEnterprise.value?.region` 或兜底 `河北省唐山市`
- 模板：`dueTaskHeader.templateName` 或兜底 `尽职调查报告`
- 评分：`dueTaskHeader.score` / 企业 score / 兜底 `72`
- 评级：`dueTaskHeader.grade` / 企业 grade / 兜底 `C+`
- 风险：`dueTaskHeader.riskLevel` / 企业 riskLevel / 兜底 `中风险`
- 完整度：`dueTaskHeader.completeness` / `materialComplete` / 企业资料完整度 / 兜底 `86`

不要在交付包阶段显示「综合评分 待诊断」，交付包阶段已经在风险诊断之后，可以显示真实评分/评级/风险。

### 2. WorkbenchPage.vue 必须识别 deliveryPackage 为第 8 节点

确认 `WorkbenchPage.vue` 里以下逻辑兼容：

- `wbShowCompleteness` 包含 `deliveryPackage`
- `wbShowScoreGradeRisk` 包含 `deliveryPackage`
- `wbStageIdFromFlowStep()` 能把 `deliveryPackage` / `delivery-package` / 中文「交付」映射到 `deliveryPackage`
- 工作台标题映射里应有 `deliveryPackage: '交付包下载'`，否则页面标题可能显示不准确

如果已经存在，不要重复添加。

### 3. 不要改交付包组件

本轮不要修改：

- `src/components/workbench/artifacts/WorkbenchDeliveryPackageArtifact.vue`
- `src/components/workbench/artifacts/DeliveryPackageArtifact.vue`

交付包内容卡片保持现状。

本轮只保证它上方能显示统一尽调头部。

### 4. 不要改节点回看逻辑

上一阶段已经做了节点回看能力。本轮不要修复或调整：

- 点击节点是否会推进状态
- `handleStageReview`
- `handleWbFlowStepReview`
- 智能尽调详情页流程条点击逻辑

本轮只修工作台交付包下载头部。

## 验收路径

1. 在工作台跑完整流程到「产物确认」。
2. 点击「确认产物并生成交付包」。
3. 左侧进入「交付包下载」阶段。
4. 交付包清单上方显示统一尽调头部。
5. 头部展示：
   - 企业名：唐山物桥商贸有限公司
   - 状态：交付包已生成
   - 进度：100%
   - 模板：尽职调查报告
   - 综合评分：72
   - 评级：C+
   - 风险：中风险
   - 资料完整度：86%
6. 流程条显示 8 个节点：
   - 工商核验
   - 司法查询
   - 税票采集
   - 资料补充
   - 证据整合
   - 风险诊断
   - 产物确认
   - 交付包下载
7. 前 7 个节点为完成态，第 8 个「交付包下载」为当前态。
8. 不修改智能尽调详情页。
9. 不修改交付包组件。
10. `npm run build` 通过。

## 完成后汇报格式

请按以下格式汇报：

1. 修改了哪些文件。
2. 是否只修改了 `workbenchAssistant.js` 和/或 `WorkbenchPage.vue`。
3. 是否没有修改智能尽调详情页。
4. `deliveryPackage` stage 是否补齐 `dueFlow`。
5. 工作台交付包下载是否显示统一头部。
6. 流程条是否显示 8 个节点，且第 8 个为当前态。
7. 评分/评级/风险/资料完整度是否在交付包阶段正常显示。
8. 是否没有修改交付包组件和 token.css。
9. `npm run build` 是否通过。
