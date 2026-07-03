# OpenClaw Prompt - Phase 3-F-2E2 尽调流程头部强约束修复

请严格按照本提示词修改。当前页面的头部效果仍然不符合产品目标：  
1. 工作台尽调流程里仍有重复头部信息；  
2. 风险诊断曾被单独特殊处理，导致样式拥挤、流程条动态效果变弱；  
3. 智能尽调详情页也需要和工作台保持同一套流程头部视觉；  
4. 不能再只修风险诊断，也不能重新造一个和项目风格不一致的大头部。

本次目标非常明确：

**去掉单独任务摘要卡，只保留一个增强版流程卡。增强版流程卡必须同时承载企业信息、模板信息、评分风险信息、资料完整度、当前状态、进度和流程条。**

## 必须修改的文件

只允许修改以下 2 个文件：

- `src/pages/WorkbenchPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`

## 禁止修改的文件

不要修改：

- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/components/workbench/DueTaskHeader.vue`
- `src/components/workbench/artifacts/DueFlowProgress.vue`
- `src/components/workbench/artifacts/*.vue`
- `src/router/*`
- `src/styles/tokens.css`
- `src/data/*.js`

如果发现数据不够，请在页面内用 computed 兜底，不要改 store。

## 目标线框

工作台尽调节点、智能尽调详情页都应该接近这个结构：

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司                    商贸流通 / 河北省唐山市            │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%                │
│                                            [司法查询已完成]      28%        │
├────────────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━━ ◎ 司法查询 ━━ ○ 税票采集 ━━ ○ 资料补充 ━━ ○ 证据整合        │
│              ━━ ○ 风险诊断 ━━ ○ 产物确认                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

风险诊断节点示例：

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司                    商贸流通 / 河北省唐山市            │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%                │
│                                            [风险诊断已完成]      86%        │
├────────────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━━ ✓ 司法查询 ━━ ✓ 税票采集 ━━ ✓ 资料补充 ━━ ✓ 证据整合        │
│              ━━ ◎ 风险诊断 ━━ ○ 产物确认                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

产物确认节点示例：

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司                    商贸流通 / 河北省唐山市            │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%                │
│                                            [产物已生成]          100%       │
├────────────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━━ ✓ 司法查询 ━━ ✓ 税票采集 ━━ ✓ 资料补充 ━━ ✓ 证据整合        │
│              ━━ ✓ 风险诊断 ━━ ◎ 产物确认                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

智能尽调详情页如果存在第 8 节点「交付包下载」，流程条需要展示第 8 节点：

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ 杭州智造装备有限公司                    专用设备制造 / 浙江杭州 / 500万     │
│ [尽职调查报告]  来源：本页创建  负责人：张经理  综合评分 78  [B]  [低风险] │
│ 资料完整度 86%                              [交付包已生成]       100%       │
├────────────────────────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ━━ ✓ 司法查询 ━━ ✓ 税票采集 ━━ ✓ 资料补充 ━━ ✓ 证据整合        │
│              ━━ ✓ 风险诊断 ━━ ✓ 产物确认 ━━ ◎ 交付包下载                  │
└────────────────────────────────────────────────────────────────────────────┘
```

## 工作台实现要求

### 1. 删除重复头部

在 `WorkbenchPage.vue` 中，尽调流程阶段不能再同时渲染：

```vue
<DueTaskHeader ... />
<DueFlowProgress ... />
```

也不能再使用只针对风险诊断的特殊头：

- 删除或停止使用 `.wb-risk-merged-header`
- 删除或停止使用只判断 `assistant.activeStageId === 'riskDiagnosis'` 的特殊头逻辑

改成：

```vue
<section v-if="assistant.isDueWorkspace && currentDueFlow" class="wb-due-flow-header">
  <!-- 企业信息 + 模板/评分/风险/完整度 + 当前状态/进度 + 流程条 -->
</section>

<WorkbenchBusinessPanel ... />
```

非尽调阶段仍然保留原来的 `WorkbenchStageStrip`。

### 2. 工作台适用节点

这个统一头部必须覆盖工作台尽调流程中的所有节点：

- 工商核验
- 司法查询
- 税票采集
- 资料补充
- 证据整合
- 风险诊断
- 产物确认
- 如果工作台已经有轻量交付包节点，也按同一风格展示

不要只修风险诊断。

### 3. 工作台动态数据读取

所有数据必须动态读取，允许兜底，但不要硬编码死。

企业名优先级：

1. `assistant.selectedEnterprise.name`
2. `assistant.dueTaskHeader.name`
3. `assistant.dueTaskHeader.enterpriseName`
4. `assistant.leftPanelData.enterprise.name`
5. 兜底：`唐山物桥商贸有限公司`

行业优先级：

1. `assistant.selectedEnterprise.industry`
2. `assistant.dueTaskHeader.industry`
3. `assistant.leftPanelData.enterprise.industry`
4. 兜底：`商贸流通`

地区优先级：

1. `assistant.selectedEnterprise.region`
2. `assistant.dueTaskHeader.region`
3. `assistant.leftPanelData.enterprise.region`
4. 兜底：`河北省唐山市`

模板优先级：

1. `assistant.dueTaskHeader.templateName`
2. `assistant.leftPanelData.reportTemplate`
3. 兜底：`尽职调查报告`

综合评分优先级：

1. `assistant.dueTaskHeader.score`
2. `assistant.selectedEnterprise.score`
3. `assistant.leftPanelData.score`
4. 兜底：`72`

评级优先级：

1. `assistant.dueTaskHeader.grade`
2. `assistant.selectedEnterprise.grade`
3. `assistant.leftPanelData.grade`
4. 兜底：`C+`

风险等级优先级：

1. `assistant.dueTaskHeader.riskLevel`
2. `assistant.selectedEnterprise.riskLevel`
3. `assistant.leftPanelData.riskLevel`
4. 兜底：`中风险`

资料完整度优先级：

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

当前状态优先级：

1. `currentDueFlow.statusText`
2. `assistant.dueTaskHeader.statusText`
3. `assistant.leftPanelData.status`
4. 根据 active stage label 生成，例如 `司法查询已完成`

进度优先级：

1. `currentDueFlow.progress`
2. `assistant.dueTaskHeader.progress`
3. `assistant.leftPanelData.progress`
4. 根据当前 stage index 计算

### 4. 工作台当前节点高亮

当前节点必须动态高亮，优先参考：

1. `assistant.activeStageId`
2. `assistant.currentArtifactType`
3. `currentDueFlow.steps` 中的 active/status

不要固定高亮风险诊断，也不要固定高亮产物确认。

## 智能尽调详情页实现要求

### 1. 使用同一套头部思路

在 `DueDiligenceTaskPage.vue` 中，不要同时展示：

```text
due-task__header
due-task__process-bar
```

应该统一成一个增强版流程头：

```vue
<section class="due-task-flow-header">
  <!-- 返回按钮 + 企业信息 + 模板/来源/负责人/评分/评级/风险/完整度 + 当前状态/进度 + 流程条 -->
</section>
```

如果当前已经有 `due-task-flow-header`，请继续修正它，不要再新增第三套头部。

### 2. 智能尽调详情动态数据

从 `task` 读取：

- 企业名：`task.name`
- 行业：`task.industry`
- 地区：`task.region`
- 注册资本：`task.amount`
- 模板：`task.templateName`
- 来源：`task.source`
- 负责人：`task.manager`
- 综合评分：`task.score`
- 评级：`task.grade`
- 风险等级：`task.riskLevel`
- 资料完整度：`task.materialCompleteness || task.materialComplete || 86`
- 当前状态：`task.statusText`
- 当前进度：`task.progress`

### 3. 智能尽调详情当前节点高亮

当前节点必须优先使用 `selectedStageKey`，其次才是 `task.currentStep`。

原因：用户在详情页手动点击不同节点时，左侧展示区会切换，流程条高亮也必须跟着切换。

不要只根据 `task.currentStep`，否则会出现页面切到别的节点但头部还高亮旧节点。

## 流程条视觉强约束

流程条必须有连续的视觉关系，不能变成松散 tag。

视觉状态：

- done：绿色圆点 + 对勾 + 绿色连接线
- active：蓝色描边/高亮圆点 + 蓝色文字 + 轻微 halo
- pending：浅灰圆点 + 灰色文字 + 浅灰连接线

连接线必须用 CSS 线条实现，不要用普通字符 `-`。

流程条允许换行，但不能横向溢出父容器。

必须设置：

```css
min-width: 0;
max-width: 100%;
box-sizing: border-box;
flex-wrap: wrap;
```

## 样式强约束

必须使用项目 token，不要乱造新颜色。

优先使用：

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
- `var(--shadow-sm)`

不要新增大面积渐变、阴影、紫色、厚边框。

整体要轻：像企业探查和当前项目的 Element Plus 风格，而不是一个大营销 banner。

## 内容边界

流程头只展示：

- 企业是谁
- 任务模板
- 综合评分/评级/风险/资料完整度
- 当前状态和进度
- 流程走到哪一步

不要把每个节点的业务结论都塞进流程头。

节点业务结论继续留在下方 artifact 内部，例如：

```text
风险诊断 · 已完成 [中风险]
基于工商、司法、税票、资料和证据链完成诊断，识别到 8 项风险事项。
```

如果 artifact 已经有节点摘要，不要重复新增。

## 验收路径

完成后运行：

```bash
npm run build
```

然后检查：

### 工作台

逐一进入以下节点：

1. 工商核验
2. 司法查询
3. 税票采集
4. 资料补充
5. 证据整合
6. 风险诊断
7. 产物确认
8. 如果已有交付包节点，也检查交付包节点

必须满足：

- 顶部只有一个增强版流程卡；
- 不再出现单独任务摘要卡；
- 模板、评分、评级、风险、资料完整度已经移入流程卡；
- 当前节点高亮正确；
- 流程条有连续连接线；
- 流程头不拥挤、不横向溢出；
- 下方 artifact 正常显示；
- 右侧 AI Copilot 不被覆盖。

### 智能尽调详情页

逐一进入以下节点：

1. 工商核验
2. 司法查询
3. 税票采集
4. 资料补充
5. 证据整合
6. 风险诊断
7. 产物确认
8. 交付包下载

必须满足：

- 顶部只有一个增强版流程卡；
- 返回按钮仍然可用；
- 当前节点高亮跟随 `selectedStageKey`；
- 流程条有连续连接线；
- 右侧尽调助手不被覆盖；
- 交付包下载仍然可用。

## 输出要求

完成后请回复：

1. 修改了哪些文件；
2. 是否删除/隐藏了重复任务摘要卡；
3. 是否将模板、评分、评级、风险、资料完整度移入流程卡；
4. 工作台 7/8 个节点当前高亮是否正确；
5. 智能尽调详情 8 个节点当前高亮是否正确；
6. 流程条是否保留连续连接线；
7. 是否未修改 store / route / token / artifact；
8. `npm run build` 是否通过。

