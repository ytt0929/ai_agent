# OpenClaw Prompt - Phase 3-F-2C-3 风险诊断页外层双头部合并

请严格按本提示词修改。目标是只在【风险诊断】节点页面中，把外层重复的「企业任务头」和「流程进度头」合并成一个头部。不要抽公共组件，不要一次性改其他 6/7 个节点。

## 背景

当前【风险诊断】页面顶部有两块重复头部：

```text
第一块：
唐山物桥商贸有限公司 / 商贸流通 / 尽职调查报告 / 综合评分72 / C+ / 中风险 / 资料完整度86% / 风险诊断已完成

第二块：
唐山物桥商贸有限公司 / 商贸流通 / 河北省唐山市 / 风险诊断已完成 / 86% / 工商核验-司法查询-税票采集-资料补充-证据整合-风险诊断-产物确认流程条
```

这两块信息高度重叠，应在【风险诊断】这个节点下合并为一个头部：

```text
┌──────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司   商贸流通 / 河北省唐山市                │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%    │
│                                      [风险诊断已完成]          │
├──────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ─ ✓ 司法查询 ─ ✓ 税票采集 ─ ✓ 资料补充 ─ ✓ 证据整合 │
│      ─ ◎ 风险诊断 ─ ○ 产物确认                               │
└──────────────────────────────────────────────────────────────┘
```

## 修改范围

允许修改：

- `src/pages/WorkbenchPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`

如确实需要复用极少样式，也可以在同文件 scoped CSS 内新增样式。

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

## 重要边界

1. 不要抽公共 Header 组件。
2. 不要全局替换所有节点头部。
3. 只在当前节点是【风险诊断】时启用合并头。
4. 其他节点如工商核验、税票采集、资料补充、证据整合、产物确认等，先保持现状。
5. 不要改流程推进、按钮事件、store、mock 数据。
6. 不要做编码转换，不要处理乱码。浏览器页面不是乱码。
7. 只使用 Element Plus 和项目 token。

## 工作台入口修改要求

文件：

```text
src/pages/WorkbenchPage.vue
```

当前工作台二级页尽调阶段是：

```vue
<DueTaskHeader v-if="assistant.isDueWorkspace" :data="assistant.dueTaskHeader" />
<DueFlowProgress
  v-if="assistant.isDueWorkspace && currentDueFlow"
  ...
/>
```

请只在风险诊断节点下合并它们。

### 判断条件建议

可根据当前代码可用状态判断：

- `assistant.isDueWorkspace === true`
- 且当前 active tool / artifact 是风险诊断，例如：
  - `assistant.activeTool === 'riskDiagnosis'`
  - 或 `assistant.currentArtifactType === 'riskDiagnosis'`
  - 或 `assistant.activeStageId === 'riskDiagnosis'`

请按实际代码中最稳定的字段判断。

### 目标行为

当处于风险诊断节点：

- 不再连续显示原来的 `DueTaskHeader` 和 `DueFlowProgress` 两块；
- 改为显示一个新 DOM 结构，例如 `.wb-risk-merged-header`；
- 这个新结构只在风险诊断节点出现；
- 非风险诊断节点继续用原来的 `DueTaskHeader + DueFlowProgress`。

### 工作台合并头结构

建议结构：

```text
<section class="wb-risk-merged-header">
  <div class="wb-risk-merged-header__top">
    <div>
      <div class="wb-risk-merged-header__title">唐山物桥商贸有限公司</div>
      <div class="wb-risk-merged-header__meta">商贸流通 / 河北省唐山市</div>
    </div>
    <div class="wb-risk-merged-header__badges">
      [尽职调查报告] [综合评分 72] [C+] [中风险] [资料完整度 86%] [风险诊断已完成]
    </div>
  </div>
  <div class="wb-risk-merged-header__steps">
    复用 currentDueFlow.steps 渲染流程节点
  </div>
</section>
```

注意：

- 不要再额外显示企业名两次；
- 不要把 `86%` 同时在右侧重复一遍；
- `资料完整度` 必须动态读取，不能写死 `86%`；
- 当前节点 `风险诊断` 要明显高亮；
- 已完成节点用 success 风格；
- 未完成节点用 info/浅色风格；
- 不要写死必须只有 7 步，兼容当前 steps 数组。

### 动态数据要求

合并头部中的企业名、行业、地区、模板、评分、评级、风险等级、资料完整度、当前阶段状态都必须优先读取当前已有数据，不能按示例图硬编码。

特别是 `资料完整度`：

- 工作台入口优先读取：
  - `assistant.dueTaskHeader.materialComplete`
  - `assistant.dueTaskHeader.materialCompleteness`
  - `currentDueFlow.materialComplete`
  - `currentDueFlow.materialCompleteness`
  - `assistant.selectedEnterprise.materialComplete`
  - `assistant.selectedEnterprise.materialCompleteness`
- 智能尽调详情入口优先读取：
  - `task.materialCompleteness`
  - `task.materialComplete`

只有字段不存在时，才允许兜底显示 `86%`。

显示格式统一为：

```text
资料完整度 {{ value }}%
```

评分、评级、风险等级、模板名称、当前阶段状态也同样优先使用现有数据。示例中的 `72`、`C+`、`中风险`、`尽职调查报告`、`风险诊断已完成` 只是 demo 展示文案，不允许在代码里无条件写死。

## 智能尽调详情入口修改要求

文件：

```text
src/pages/DueDiligenceTaskPage.vue
```

当前详情页顶部是：

```text
due-task__header
due-task__process-bar
```

请只在 `selectedStageKey === 'risk'` 时合并这两块。

### 目标行为

当 `selectedStageKey === 'risk'`：

- 使用一个合并后的 `.due-task-risk-header`；
- 原来的 `.due-task__header` 和 `.due-task__process-bar` 不要同时显示；
- 合并头内仍然包含返回按钮；
- 合并头内仍然包含企业信息、模板、评分、风险、完整度、当前状态、流程条；
- 点击流程节点的原有逻辑尽量保留，如果当前流程节点可点，仍可设置 `selectedStageKey`。

当 `selectedStageKey !== 'risk'`：

- 原来的 `due-task__header` 和 `due-task__process-bar` 保持原样。

### 智能尽调合并头结构

建议结构：

```text
┌──────────────────────────────────────────────────────────────┐
│ ←  唐山物桥商贸有限公司   商贸流通 / 河北省唐山市              │
│    [尽职调查报告] 来源 xxx  负责人 xxx  评分72 [C+] [中风险]   │
│    资料完整度 86%  [风险诊断已完成]                            │
├──────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ─ ✓ 司法查询 ─ ✓ 税票采集 ─ ✓ 资料补充 ─ ✓ 证据整合 │
│      ─ ◎ 风险诊断 ─ ○ 产物确认 ─ ○ 交付包下载                 │
└──────────────────────────────────────────────────────────────┘
```

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

头部高度目标：

- 两行任务信息 + 一行流程条；
- 总高度尽量控制在 120-150px；
- 不要出现上下两张大卡片。

布局要求：

```css
min-width: 0;
max-width: 100%;
box-sizing: border-box;
```

流程节点允许换行，但不能横向撑破容器。

## 验收路径

完成后运行：

```bash
npm run build
```

并检查：

### 工作台风险诊断入口

1. 工作台 demo 流程进入【风险诊断】。
2. 原先两块重复头部已合并为一个。
3. 企业名、模板、评分、风险、资料完整度、当前状态只出现一次。
4. 流程条仍然可见，风险诊断节点高亮。
5. 下方 `RiskDiagnosisArtifact` 正常显示。
6. 点击【进入产物确认】仍能推进。
7. 右侧 AI Copilot 不被遮挡。
8. 没有横向溢出。

### 工作台其他节点

1. 税票采集、资料补充、证据整合、产物确认等节点头部暂不改变。
2. 不要因为本次修改影响其他节点布局。

### 智能尽调详情风险诊断入口

1. 进入智能尽调详情页，切到【风险诊断】。
2. 原先 header + process bar 合并为一个头部。
3. 返回按钮仍可用。
4. 流程条仍可见，风险诊断节点高亮。
5. 下方风险诊断内容正常。
6. 右侧尽调助手不被遮挡。

### 智能尽调详情其他节点

1. 税票采集、资料补充、产物确认、交付包下载等节点保持现状。

## 输出要求

完成后请回复：

1. 修改了哪些文件；
2. 是否只在风险诊断节点启用合并头；
3. 工作台风险诊断页是否已把两个头合并为一个；
4. 智能尽调详情风险诊断页是否已把两个头合并为一个；
5. 其他节点是否保持现状；
6. 是否未修改 store / 路由 / token / artifact；
7. `npm run build` 是否通过。
