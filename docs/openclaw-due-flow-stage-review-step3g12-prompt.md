# OpenClaw Prompt: Phase 3-G Step 1 + Step 2 尽调流程节点可回看

## 背景

Demo 阶段需要方便演示每个尽调阶段的产物。当前问题是流程推进到后面后，用户不方便点击前面的流程节点回看对应产物。

本轮只做两个能力：

1. 智能尽调详情页：已完成/当前节点可点击回看对应阶段产物。
2. 工作台尽调流程：已完成/当前节点可点击回看对应阶段产物。

重要原则：

点击流程节点只是「查看历史产物」，不是「重新执行流程」。

## 本轮允许修改的文件

只允许修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/WorkbenchPage.vue`

如发现必须补极小样式，可仍限定在这两个文件的 scoped CSS 内。

## 禁止修改

严禁修改：

- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/components/workbench/artifacts/*`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/router/*`
- `src/styles/tokens.css`
- `src/data/*`
- 智能报告页面

不要处理乱码。浏览器页面中文是正常的，PowerShell 读取文件时出现乱码是终端编码问题，不属于本轮任务。

## 关键要求

### 1. 点击已完成节点只切换展示，不重新执行

点击流程条节点时，只允许做：

- 工作台：切换 `assistant.activeStageId` / 调用已有 `assistant.setActiveStage(stageId)`
- 智能尽调详情：切换 `selectedStageKey`

严禁在节点点击中调用任何流程执行函数，例如：

- `runBusinessVerification`
- `runJudicialQuery`
- `runTaxCollection`
- `runMaterialsStep`
- `runEvidenceStep`
- `runRiskDiagnosis`
- `runDeliverablesStep`
- `generateDeliveryPackage`
- `enterDeliveryPackage`
- `markTaxAuthorized`
- `markMaterialsUploaded`
- `enterEvidence`
- `enterRisk`
- `enterArtifacts`

也不要在点击回看时：

- push / add AI 消息
- 修改 `currentFlowStatus`
- 修改任务进度
- 重新生成 artifact
- 重置对话
- 跳转路由

### 2. 节点点击规则

统一规则：

| 节点状态 | 行为 |
|---|---|
| 已完成 | 可以点击，切换到该阶段产物 |
| 当前节点 | 可以点击，保持或切换到该阶段产物 |
| 未开始 | 不允许跳转，轻提示即可 |

未开始节点点击时，可以使用 `ElMessage.info('请先完成前序节点')`，但不要改变状态。

### 3. 智能尽调详情页实现要求

文件：`src/pages/DueDiligenceTaskPage.vue`

当前页面已有：

- `selectedStageKey`
- `stageTemplates`
- `stageInfo`
- 各阶段 artifact 渲染分支

需要检查当前流程条节点点击逻辑。当前可能存在类似：

```vue
@click="!step.done && (selectedStageKey = step.key)"
```

如果存在，必须修正。这个逻辑是反的：Demo 回看应允许点击已完成节点，而不是未完成节点。

建议新增函数：

```js
function canReviewStage(step) {
  return step.done || step.active || step.key === selectedStageKey.value || step.key === task.value?.currentStep
}

function handleStageReview(step) {
  if (!canReviewStage(step)) {
    ElMessage.info('请先完成前序节点')
    return
  }
  selectedStageKey.value = step.key
}
```

实际字段名请以当前代码为准。如果当前 `step` 没有 `active`，可根据 `task.currentStep` 和 steps 顺序判断。

点击模板改为：

```vue
@click="handleStageReview(step)"
```

并为节点增加轻量可点击样式：

- 可回看节点：`cursor: pointer`
- 未开始节点：`cursor: not-allowed; opacity` 可轻微降低

不要重写流程条视觉样式，只补交互状态即可。

### 4. 工作台实现要求

文件：`src/pages/WorkbenchPage.vue`

当前工作台尽调流程头部使用：

- `currentDueFlow.steps`
- `assistant.activeStageId`
- `wbStepIsDone(step)`
- `wbStepIsActive(step)`
- `wbStepIsPending(step)`

需要给每个流程节点增加点击回看能力。

建议新增映射函数：

```js
function wbStageIdFromFlowStep(step) {
  const key = step.key || step.id || step.stage || step.value || step.label
  const label = step.label || ''

  const map = {
    business: 'business',
    judicial: 'judicial',
    tax: 'tax',
    materials: 'materials',
    evidence: 'evidence',
    riskDiagnosis: 'riskDiagnosis',
    risk: 'riskDiagnosis',
    deliverables: 'deliverables',
    artifacts: 'deliverables',
    deliveryPackage: 'deliveryPackage',
    'delivery-package': 'deliveryPackage'
  }

  // 如 step 没有 key，就用中文 label 兜底
  if (label.includes('工商')) return 'business'
  if (label.includes('司法')) return 'judicial'
  if (label.includes('税票')) return 'tax'
  if (label.includes('资料')) return 'materials'
  if (label.includes('证据')) return 'evidence'
  if (label.includes('风险')) return 'riskDiagnosis'
  if (label.includes('产物')) return 'deliverables'
  if (label.includes('交付')) return 'deliveryPackage'

  return map[key] || ''
}
```

建议新增函数：

```js
function canReviewWbFlowStep(step) {
  return wbStepIsDone(step) || wbStepIsActive(step)
}

function handleWbFlowStepReview(step) {
  if (!canReviewWbFlowStep(step)) {
    ElMessage.info('请先完成前序节点')
    return
  }
  const stageId = wbStageIdFromFlowStep(step)
  if (!stageId) return
  assistant.setActiveStage(stageId)
}
```

点击模板改为：

```vue
@click="handleWbFlowStepReview(step)"
```

注意：

- 只能调用 `assistant.setActiveStage(stageId)`
- 不能调用任何 `runXXX` 或 `generateXXX`
- 不能追加 AI 消息
- 不能修改 `currentFlowStatus`
- 不能跳转页面

### 5. 工作台 stage 映射必须兼容 7/8 节点

工作台当前可能有 7 节点，也可能已有交付包第 8 节点。映射必须兼容：

| 流程节点 | 工作台 stageId |
|---|---|
| 工商核验 | `business` |
| 司法查询 | `judicial` |
| 税票采集 | `tax` |
| 资料补充 | `materials` |
| 证据整合 | `evidence` |
| 风险诊断 | `riskDiagnosis` |
| 产物确认 | `deliverables` |
| 交付包下载 | `deliveryPackage` |

如果当前没有交付包节点，也不要强行新增。本轮只做回看点击能力。

## 样式要求

只做轻量交互样式，不要重构视觉。

建议：

```css
.wb-flow-step,
.due-task-flow-step {
  cursor: pointer;
}

.wb-flow-step--pending,
.due-task-flow-step--pending {
  cursor: not-allowed;
}
```

具体 class 以当前代码为准。

不要改变：

- 流程条圆点大小
- 连接线样式
- 头部布局
- 卡片间距
- 页面滚动结构

## 验收路径

### 智能尽调详情页

1. 进入一个已经推进到资料补充/风险诊断/产物确认/交付包下载的任务。
2. 点击已完成的「工商核验」节点。
3. 左侧显示工商核验产物。
4. 点击已完成的「司法查询」节点。
5. 左侧显示司法查询产物。
6. 点击未开始节点时，不切换，只提示「请先完成前序节点」。
7. 右侧尽调助手不新增消息。

### 工作台

1. 在工作台跑到税票采集或后续节点。
2. 点击已完成的「工商核验」节点。
3. 左侧切换为工商核验产物。
4. 点击当前节点，保持当前产物。
5. 点击未开始节点，不切换，只提示。
6. 右侧 AI Copilot 不新增消息。
7. 不跳转路由。

## 完成后运行

```bash
npm run build
```

## 完成后汇报格式

请按以下格式汇报：

1. 修改了哪些文件。
2. 是否只修改了 `WorkbenchPage.vue` 和 `DueDiligenceTaskPage.vue`。
3. 智能尽调详情页已完成节点是否可点击回看。
4. 工作台已完成节点是否可点击回看。
5. 未开始节点点击是否不会切换。
6. 点击回看是否没有追加 AI 消息、没有重跑流程、没有跳转。
7. 是否兼容交付包第 8 节点映射。
8. `npm run build` 是否通过。
