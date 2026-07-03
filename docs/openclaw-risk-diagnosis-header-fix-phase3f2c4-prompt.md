# OpenClaw Prompt - Phase 3-F-2C-4 风险诊断合并头纠偏

请严格按本提示词修改。上一版【风险诊断】外层双头部合并已经完成，但实际效果有三个明显问题：

1. 工作台合并头企业名显示成了「企业尽调」，没有正确读取当前企业；
2. 信息太挤，模板、评分、等级、风险、完整度、状态全部挤在右侧一行；
3. 流程条的视觉效果消失了，只剩下小点和文字，缺少连续进度线，用户看不出流程推进关系。

本次目标是修复这三个问题。不要扩展到其他节点，不要抽公共组件。

## 修改范围

允许修改：

- `src/pages/WorkbenchPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`

禁止修改：

- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/components/workbench/DueTaskHeader.vue`
- `src/components/workbench/artifacts/DueFlowProgress.vue`
- `src/components/workbench/artifacts/RiskDiagnosisArtifact.vue`
- 其他 artifact 组件
- `src/router/*`
- `src/styles/tokens.css`

## 必须保持的边界

1. 只在风险诊断节点启用合并头：
   - 工作台：`assistant.isDueWorkspace && assistant.activeStageId === 'riskDiagnosis'`
   - 智能尽调详情：`selectedStageKey === 'risk'`
2. 其他节点继续保持现状。
3. 不改 store、不改路由、不改 token、不改 artifact。
4. 不要处理乱码，不要做编码转换。
5. 必须使用 Element Plus 和现有 token。

## 当前错误效果

当前工作台风险诊断页效果类似：

```text
企业尽调                 [尽职调查报告] 综合评分72 [C+] [中风险] 资料完整度86% [风险诊断已完成]
商贸流通 / 河北省唐山市
○ 工商核验 - ○ 司法查询 - ○ 税票采集 - ○ 资料补充 - ○ 证据整合 - ○ 风险诊断 - ◎ 产物确认
```

问题：

- 标题不应该是「企业尽调」，应该是当前企业名；
- 右侧标签太多太挤；
- 流程条没有连续线条，没有原来那种完成/当前/未完成的进度感；
- 当前处于风险诊断时，却把「产物确认」显示成主视觉高亮，用户会误解当前节点。

## 目标效果

### 工作台风险诊断合并头目标

```text
┌──────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司                         [风险诊断已完成] │
│ 商贸流通 / 河北省唐山市                                      │
│ [尽职调查报告]   综合评分 72   [C+]   [中风险]   资料完整度 86%│
├──────────────────────────────────────────────────────────────┤
│  ✓ 工商核验 ━ ✓ 司法查询 ━ ✓ 税票采集 ━ ✓ 资料补充 ━ ✓ 证据整合 │
│                                             ━ ◎ 风险诊断 ━ ○ 产物确认 │
└──────────────────────────────────────────────────────────────┘
```

注意：

- 企业名必须是真实当前企业名；
- 第一行只放企业名和当前状态；
- 第二行放行业/地区；
- 第三行放模板、评分、等级、风险、资料完整度；
- 流程条必须有连续连接线；
- 当前节点应高亮【风险诊断】，不是【产物确认】；
- 产物确认应该是 pending/下一步状态。

### 智能尽调详情风险诊断合并头目标

```text
┌──────────────────────────────────────────────────────────────┐
│ ← 唐山物桥商贸有限公司                       [风险诊断已完成] │
│ 商贸流通 / 河北省唐山市 / 注册资本 500万                    │
│ [尽职调查报告] 来源：工作台AI  负责人：张经理  评分72 [C+] [中风险] 资料完整度86% │
├──────────────────────────────────────────────────────────────┤
│  ✓ 工商核验 ━ ✓ 司法查询 ━ ✓ 税票采集 ━ ✓ 资料补充 ━ ✓ 证据整合 │
│                                             ━ ◎ 风险诊断 ━ ○ 产物确认 ━ ○ 交付包下载 │
└──────────────────────────────────────────────────────────────┘
```

## 动态数据读取要求

不要写死企业名、模板、评分、风险、完整度、状态。

### 工作台入口字段优先级

企业名优先读取：

1. `assistant.selectedEnterprise.name`
2. `assistant.dueTaskHeader.name`
3. `assistant.dueTaskHeader.enterpriseName`
4. `assistant.leftPanelData.enterprise.name`
5. 兜底：`唐山物桥商贸有限公司`

行业优先读取：

1. `assistant.selectedEnterprise.industry`
2. `assistant.dueTaskHeader.industry`
3. `assistant.leftPanelData.enterprise.industry`
4. 兜底：`商贸流通`

地区优先读取：

1. `assistant.selectedEnterprise.region`
2. `assistant.dueTaskHeader.region`
3. `assistant.leftPanelData.enterprise.region`
4. 兜底：`河北省唐山市`

模板优先读取：

1. `assistant.dueTaskHeader.templateName`
2. `assistant.leftPanelData.reportTemplate`
3. 兜底：`尽职调查报告`

评分优先读取：

1. `assistant.dueTaskHeader.score`
2. `assistant.selectedEnterprise.score`
3. `assistant.leftPanelData.score`
4. 兜底：`72`

评级优先读取：

1. `assistant.dueTaskHeader.grade`
2. `assistant.selectedEnterprise.grade`
3. `assistant.leftPanelData.grade`
4. 兜底：`C+`

风险等级优先读取：

1. `assistant.dueTaskHeader.riskLevel`
2. `assistant.selectedEnterprise.riskLevel`
3. `assistant.leftPanelData.riskLevel`
4. 兜底：`中风险`

资料完整度优先读取：

1. `assistant.dueTaskHeader.materialComplete`
2. `assistant.dueTaskHeader.materialCompleteness`
3. `assistant.dueTaskHeader.completeness`
4. `currentDueFlow.materialComplete`
5. `currentDueFlow.materialCompleteness`
6. `assistant.selectedEnterprise.materialComplete`
7. `assistant.selectedEnterprise.materialCompleteness`
8. `assistant.leftPanelData.materialComplete`
9. `assistant.leftPanelData.materialCompleteness`
10. 兜底：`86`

当前状态优先读取：

1. `currentDueFlow.statusText`
2. `assistant.dueTaskHeader.statusText`
3. `assistant.leftPanelData.status`
4. 兜底：`风险诊断已完成`

### 智能尽调详情字段优先级

智能尽调详情页直接从 `task` 读取：

- 企业名：`task.name`
- 行业：`task.industry`
- 地区：`task.region`
- 注册资本：`task.amount`
- 模板：`task.templateName`
- 来源：`task.source`
- 负责人：`task.manager`
- 评分：`task.score`
- 评级：`task.grade`
- 风险等级：`task.riskLevel`
- 资料完整度：`task.materialCompleteness || task.materialComplete || 86`
- 当前状态：`task.statusText || '风险诊断已完成'`

## 流程条视觉要求

必须恢复“进度条”感，不要只是小标签。

### 推荐结构

每个 step 用一个节点 + 连接线：

```text
[node] label [connector] [node] label [connector] [node] label
```

节点状态：

- done：绿色实心圆 + check；
- active：蓝色描边圆或蓝色高亮圆 + 当前节点文字蓝色；
- pending：浅灰圆 + 灰色文字；

连接线状态：

- 已完成节点之间：绿色线；
- active 到下一节点：蓝色或浅蓝线；
- 未完成：浅灰线；

不要用普通短横线字符 `-` 代替连接线。

### 工作台步骤状态判断

工作台使用 `currentDueFlow.steps` 渲染。

判断逻辑建议：

- `step.id === 'riskDiagnosis'` 或 `step.label === '风险诊断'` 视为 active；
- 在风险诊断之前的步骤视为 done；
- 风险诊断之后的步骤视为 pending；
- 不要把 `产物确认` 高亮成 active。

如果 `currentDueFlow.steps` 的状态字段不可靠，请根据 index 和风险诊断位置计算展示状态，但不要修改 store。

### 智能尽调详情步骤状态判断

智能尽调详情使用 `processSteps`。

在 `selectedStageKey === 'risk'` 时：

- `step.key === 'risk'` 为 active；
- risk 之前为 done；
- risk 之后为 pending；
- 不要因为任务后续状态误把 `artifacts` 高亮。

## 布局要求

### 合并头整体

```css
display: flex;
flex-direction: column;
gap: var(--space-sm);
padding: var(--space-md) var(--space-lg);
background: var(--surface-card);
border: 1px solid var(--border-light);
border-radius: var(--radius-md);
min-width: 0;
max-width: 100%;
box-sizing: border-box;
```

### 顶部信息区

不要一行塞满所有信息。

推荐：

```text
第一行：企业名 + 当前状态
第二行：行业 / 地区
第三行：模板 + 评分 + 等级 + 风险 + 完整度
```

如果宽度不够，第三行允许换行。

### 流程条

流程条可换行，但要保持连接线视觉。

建议：

```css
.steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: var(--space-sm);
}
```

每个 step 内部不要太宽，避免挤压。

## 验收

完成后运行：

```bash
npm run build
```

并检查：

### 工作台风险诊断

1. 企业名显示真实企业名，不是「企业尽调」。
2. 资料完整度使用动态数据，不是无条件写死 86。
3. 头部不拥挤，信息分成 2-3 行。
4. 流程条有连续连接线。
5. 当前高亮是【风险诊断】，不是【产物确认】。
6. 下方风险事项列表更靠近主体区域。
7. 右侧 AI Copilot 不被遮挡。

### 智能尽调详情风险诊断

1. 企业名、行业、地区、模板、评分、完整度均从 task 读取。
2. 当前高亮是【风险诊断】。
3. 流程线有连续进度感。
4. 返回按钮仍可用。
5. 其他节点不变。

## 输出要求

完成后请回复：

1. 修改了哪些文件；
2. 是否修复工作台企业名显示为「企业尽调」的问题；
3. 资料完整度是否动态读取；
4. 流程条是否恢复连续连接线；
5. 当前 active 是否为风险诊断；
6. 是否只影响风险诊断节点；
7. 是否未修改 store / route / token / artifact；
8. `npm run build` 是否通过。

