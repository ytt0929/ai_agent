# OpenClaw Prompt - Phase 3-F-2E 去掉重复任务摘要卡，保留并增强流程卡

请严格按本提示词修改。上一版尝试把两个头部“重做成合并头”，实际效果拥挤且流程条视觉变弱。本次不要再重造复杂合并头。请采用更稳的方案：

**直接去掉第一块任务摘要卡，保留第二块流程卡，并把第一块里的模板、评分、评级、风险、资料完整度移入第二块流程卡。**

## 目标效果

当前页面顶部有两块：

```text
第一块：任务摘要卡
唐山物桥商贸有限公司 / 商贸流通 / 尽职调查报告 / 综合评分72 / C+ / 中风险 / 资料完整度86% / 司法查询已完成

第二块：流程卡
唐山物桥商贸有限公司 / 商贸流通 / 河北省唐山市 / 司法查询已完成 / 28%
✓ 工商核验 ━ ◎ 司法查询 ━ ○ 税票采集 ━ ○ 资料补充 ━ ○ 证据整合 ━ ○ 风险诊断 ━ ○ 产物确认
```

修改后只保留一个流程卡：

```text
┌────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司        商贸流通 / 河北省唐山市                  │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%          │
│                                            [司法查询已完成]  28%     │
├────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━ ◎ 司法查询 ━ ○ 税票采集 ━ ○ 资料补充 ━ ○ 证据整合      │
│       ━ ○ 风险诊断 ━ ○ 产物确认                                     │
└────────────────────────────────────────────────────────────────────┘

┌ 当前节点摘要 ───────────────────────────────────────────────────────┐
│ 司法查询 · 已完成                                      [无重大风险] │
│ 基于公开司法、执行、裁判文书和行政处罚数据核验。                    │
└────────────────────────────────────────────────────────────────────┘
```

风险诊断节点示例：

```text
┌────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司        商贸流通 / 河北省唐山市                  │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%          │
│                                            [风险诊断已完成]  86%     │
├────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━ ✓ 司法查询 ━ ✓ 税票采集 ━ ✓ 资料补充 ━ ✓ 证据整合      │
│       ━ ◎ 风险诊断 ━ ○ 产物确认                                     │
└────────────────────────────────────────────────────────────────────┘

┌ 当前节点摘要 ───────────────────────────────────────────────────────┐
│ 风险诊断 · 已完成                                      [中风险]     │
│ 基于工商、司法、税票、资料和证据链完成诊断，识别到 8 项风险事项。    │
└────────────────────────────────────────────────────────────────────┘
```

产物确认节点示例：

```text
┌────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司        商贸流通 / 河北省唐山市                  │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%          │
│                                            [产物已生成]  100%        │
├────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━ ✓ 司法查询 ━ ✓ 税票采集 ━ ✓ 资料补充 ━ ✓ 证据整合      │
│       ━ ✓ 风险诊断 ━ ◎ 产物确认                                     │
└────────────────────────────────────────────────────────────────────┘

┌ 当前节点摘要 ───────────────────────────────────────────────────────┐
│ 产物确认 · 已生成                               [待确认 2 项]       │
│ 尽调报告草稿、阶段报告、证据链和资料包已生成，请确认后生成交付包。  │
└────────────────────────────────────────────────────────────────────┘
```

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
- 所有 artifact 组件
- `src/router/*`
- `src/styles/tokens.css`

## 核心要求

### 1. 不要再只处理风险诊断

本次不是只修风险诊断。目标是把尽调流程里的重复头部问题统一处理。

涉及节点：

- 工商核验
- 司法查询
- 税票采集
- 资料补充
- 证据整合
- 风险诊断
- 产物确认
- 如果已有交付包下载，也保持同样风格

### 2. 删除第一块任务摘要卡

工作台入口中，如果尽调阶段已经显示：

```vue
<DueTaskHeader ... />
<DueFlowProgress ... />
```

请不要再同时显示 `DueTaskHeader`。

应该改成：

- 不再渲染单独的 `DueTaskHeader`；
- 只保留/重建一个“增强版流程卡”；
- 这个流程卡承担任务信息 + 流程进度展示。

智能尽调详情页中，如果顶部是：

```text
due-task__header
due-task__process-bar
```

请不要再同时显示这两块。

应该改成：

- 删除/隐藏单独的 `due-task__header`；
- 保留并增强原来的 `due-task__process-bar`；
- 或重写成一个同等结构的增强流程卡；
- 不要再出现上下两张头部卡片。

### 3. 保留流程条主视觉

绝对不能把流程条降级成普通 tag 串。

必须保留连续流程视觉：

```text
✓ 工商核验 ━ ◎ 司法查询 ━ ○ 税票采集 ━ ○ 资料补充 ━ ○ 证据整合 ━ ○ 风险诊断 ━ ○ 产物确认
```

视觉要求：

- done：绿色圆点/勾选 + 绿色连接线；
- active：蓝色高亮圆点 + 蓝色文字；
- pending：浅灰圆点 + 浅灰连接线；
- 连接线必须是 CSS 线条，不要用普通 `-` 字符；
- 当前节点必须和实际节点一致。

### 4. 当前节点动态高亮

当前高亮必须动态。

工作台入口：

- 根据 `assistant.activeStageId`
- 或 `assistant.currentArtifactType`
- 或 `currentDueFlow.steps` 中的 active/status
- 判断当前节点。

智能尽调详情页：

- 根据 `selectedStageKey`
- 或 `task.currentStep`
- 判断当前节点。

不要固定高亮风险诊断，也不要固定高亮产物确认。

### 5. 动态数据读取

企业信息、模板、评分、评级、风险、资料完整度、状态、进度必须动态读取，不允许硬编码。

#### 工作台入口优先级

企业名：

1. `assistant.selectedEnterprise.name`
2. `assistant.dueTaskHeader.name`
3. `assistant.dueTaskHeader.enterpriseName`
4. `assistant.leftPanelData.enterprise.name`
5. 兜底：`唐山物桥商贸有限公司`

行业：

1. `assistant.selectedEnterprise.industry`
2. `assistant.dueTaskHeader.industry`
3. `assistant.leftPanelData.enterprise.industry`
4. 兜底：`商贸流通`

地区：

1. `assistant.selectedEnterprise.region`
2. `assistant.dueTaskHeader.region`
3. `assistant.leftPanelData.enterprise.region`
4. 兜底：`河北省唐山市`

模板：

1. `assistant.dueTaskHeader.templateName`
2. `assistant.leftPanelData.reportTemplate`
3. 兜底：`尽职调查报告`

评分：

1. `assistant.dueTaskHeader.score`
2. `assistant.selectedEnterprise.score`
3. `assistant.leftPanelData.score`
4. 兜底：`72`

评级：

1. `assistant.dueTaskHeader.grade`
2. `assistant.selectedEnterprise.grade`
3. `assistant.leftPanelData.grade`
4. 兜底：`C+`

风险等级：

1. `assistant.dueTaskHeader.riskLevel`
2. `assistant.selectedEnterprise.riskLevel`
3. `assistant.leftPanelData.riskLevel`
4. 兜底：`中风险`

资料完整度：

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

状态和进度：

1. `currentDueFlow.statusText`
2. `assistant.dueTaskHeader.statusText`
3. `assistant.leftPanelData.status`
4. 根据当前 active stage label 生成，如 `司法查询已完成`

进度优先读取：

1. `currentDueFlow.progress`
2. `assistant.dueTaskHeader.progress`
3. `assistant.leftPanelData.progress`

#### 智能尽调详情页

直接从 `task` 读取：

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
- 当前状态：`task.statusText`
- 当前进度：`task.progress`

### 6. 当前节点摘要保留在 artifact 内部或紧跟流程卡下方

不要把当前节点所有结论都塞进流程卡。

流程卡只负责：

- 任务是谁；
- 用什么模板；
- 总体评分/风险/完整度；
- 流程到哪一步。

当前节点摘要继续在下方展示，例如：

```text
司法查询 · 已完成 [无重大风险]
基于公开司法、执行、裁判文书和行政处罚数据核验。
```

```text
风险诊断 · 已完成 [中风险]
基于工商、司法、税票、资料和证据链完成诊断，识别到 8 项风险事项。
```

如果现有 artifact 已经有节点摘要，不要重复新增。

## 工作台入口实现建议

在 `WorkbenchPage.vue` 里，目前尽调阶段左侧大致是：

```vue
<DueTaskHeader v-if="assistant.isDueWorkspace" :data="assistant.dueTaskHeader" />
<DueFlowProgress v-if="assistant.isDueWorkspace && currentDueFlow" ... />
<WorkbenchBusinessPanel ... />
```

请调整为：

```vue
<section v-if="assistant.isDueWorkspace && currentDueFlow" class="wb-due-flow-header">
  <!-- 企业 + 模板 + 评分 + 风险 + 完整度 + 当前状态 + 进度 -->
  <!-- 流程条 -->
</section>
<WorkbenchBusinessPanel ... />
```

非尽调阶段仍然保留原来的 `WorkbenchStageStrip`。

不要再渲染 `DueTaskHeader`。

## 智能尽调详情实现建议

在 `DueDiligenceTaskPage.vue` 里，把：

```text
due-task__header
due-task__process-bar
```

替换为一个：

```text
due-task-flow-header
```

其中包含：

- 返回按钮；
- 企业名、行业、地区、注册资本；
- 模板、来源、负责人、评分、评级、风险、资料完整度、当前状态、进度；
- 流程条。

不要再同时渲染原来的两块。

## 样式要求

必须使用项目 token：

- `var(--surface-card)`
- `var(--surface-soft)`
- `var(--text-primary)`
- `var(--text-secondary)`
- `var(--text-tertiary)`
- `var(--border-light)`
- `var(--border-color-divider)`
- `var(--space-xs)`
- `var(--space-sm)`
- `var(--space-md)`
- `var(--space-lg)`
- `var(--radius-md)`
- `var(--color-primary)`
- `var(--color-success)`
- `var(--color-warning)`

不要新增大量硬编码颜色。

布局要求：

```css
min-width: 0;
max-width: 100%;
box-sizing: border-box;
```

流程条允许换行，但不能横向溢出。

## 验收路径

完成后运行：

```bash
npm run build
```

并检查：

### 工作台入口

进入以下节点逐一查看：

1. 工商核验
2. 司法查询
3. 税票采集
4. 资料补充
5. 证据整合
6. 风险诊断
7. 产物确认

检查：

- 顶部只有一个流程卡；
- 没有重复任务摘要卡；
- 模板、评分、风险、资料完整度已经移入流程卡；
- 当前节点高亮正确；
- 流程条有连续连接线；
- 下方 artifact 正常显示；
- 右侧 AI Copilot 不被遮挡；
- 没有横向溢出。

### 智能尽调详情入口

进入以下节点逐一查看：

1. 工商核验
2. 司法查询
3. 税票采集
4. 资料补充
5. 证据整合
6. 风险诊断
7. 产物确认
8. 交付包下载

检查：

- 顶部只有一个流程卡；
- 返回按钮仍可用；
- 当前节点高亮正确；
- 流程条有连续连接线；
- 右侧尽调助手不被遮挡；
- 交付包下载仍可用。

## 输出要求

完成后请回复：

1. 修改了哪些文件；
2. 是否删除了重复任务摘要卡；
3. 是否把模板、评分、风险、资料完整度移入流程卡；
4. 工作台 7 个节点当前高亮是否正确；
5. 智能尽调详情 8 个节点当前高亮是否正确；
6. 流程条是否保留连续连接线；
7. 是否未修改 store / route / token / artifact；
8. `npm run build` 是否通过。

