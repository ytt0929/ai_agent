# OpenClaw 提示词：工作台 Phase 1 顶部流程条与真实链路验收

请继续处理【工作台 Phase 1 验收收口】，重点检查并修复工作台二级页顶部流程条对状态机的影响。不要做 Phase 2，不要重构视觉，不要修改独立业务模块页面。

## 背景问题

当前 `/workbench` 二级页顶部有一排流程节点：

```text
智能筛客 / 企业探查 / 新建尽调 / 工商核验 / 税票采集 / 资料收集 / 风险诊断 / 产物生成
```

截图中该区域位于左侧结果区上方。它目前可能造成两个问题：

1. 占用顶部空间，影响左侧结果区首屏展示。
2. 如果允许点击切换 stage，但没有同步右侧 AI 对话状态，会造成状态错位：

```text
左侧显示：风险诊断
右侧状态：仍在选择尽调模板 / 等待税票授权 / 等待资料上传
```

Phase 1 目标不是做自由流程编排，而是跑通用户确认驱动的 demo 主链路。因此顶部流程条必须成为“流程进度展示”，不要成为破坏状态机的入口。

## 修改范围

只允许修改：

```text
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchStageStrip.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/stores/workbenchAssistant.js
src/components/workbench/artifacts/*.vue
```

不要修改：

```text
src/pages/DueDiligenceTaskPage.vue
src/pages/DueDiligenceHomePage.vue
src/pages/EnterpriseExplorePage.vue
src/pages/SmartReportPage.vue
src/pages/TaxRpaPage.vue
src/pages/DocRecognitionPage.vue
src/stores/dueDiligence.js
src/stores/smartReport.js
```

## 必须检查和修复

### 1. 顶部流程条 Phase 1 先改为只读进度条

文件重点：

```text
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchStageStrip.vue
```

当前如果 `WorkbenchStageStrip` 支持点击 `@select="assistant.setActiveStage"`，请先移除或禁用这个点击行为。

建议做法：

```vue
<WorkbenchStageStrip
  v-if="assistant.flowStages.length"
  class="wb-workspace-stages"
  :stages="assistant.flowStages"
  :active-stage-id="assistant.activeStageId"
  :readonly="true"
/>
```

如果 `WorkbenchStageStrip.vue` 没有 `readonly` prop，请新增：

```js
const props = defineProps({
  stages: Array,
  activeStageId: String,
  readonly: {
    type: Boolean,
    default: false,
  },
})
```

点击节点时：

```js
if (props.readonly) return
emit('select', stage.id)
```

Phase 1 不允许用户通过顶部流程条自由跳转节点。后续 Phase 2 再讨论“查看历史产物”的安全跳转。

### 2. 顶部流程条只展示已经进入过的业务节点

不要在筛客刚完成时就展示一整排未来节点，避免误导用户以为所有节点都可点。

建议规则：

```text
智能筛客完成后：展示 智能筛客
企业探查完成后：展示 智能筛客 / 企业探查
新建尽调后：展示 智能筛客 / 企业探查 / 新建尽调 / 工商核验 ...
```

如果当前 store 已经是通过 `flowStages` 增量 `upsertStage` 生成阶段，那保持即可。不要额外硬编码完整流程条。

### 3. 顶部流程条状态必须与左侧结果区一致

请检查以下状态映射：

```text
activeStageId = screen          → 左侧 ScreeningArtifact
activeStageId = exploration     → 左侧 EnterpriseExploreArtifact
activeStageId = dueDiligence    → 左侧 DueDiligenceArtifact / 模板确认
activeStageId = business        → 左侧 BusinessVerifyArtifact
activeStageId = judicial        → 左侧 JudicialArtifact
activeStageId = tax             → 左侧 TaxCollectionArtifact
activeStageId = materials       → 左侧 MaterialsArtifact
activeStageId = evidence        → 左侧 EvidenceMergeArtifact
activeStageId = riskDiagnosis   → 左侧 RiskDiagnosisArtifact
activeStageId = deliverables    → 左侧 DeliverablesArtifact
activeStageId = reportEditor    → 左侧 ReportEditorArtifact
```

如果某个节点名称、id、artifact type 不一致，请修正为统一映射。不要出现顶部高亮“风险诊断”，左侧却是税票/资料的情况。

### 4. 顶部流程条不要影响右侧对话状态

Phase 1 中，右侧对话状态只能由以下行为推进：

```text
用户输入
右侧建议按钮
左侧业务组件中的明确按钮
```

顶部流程条不应该改变：

```text
currentFlowStatus
waitingForInput
contextSuggestions
selectedEnterprise
selectedDueTemplate
```

如果目前点击顶部流程条会调用 `setActiveStage`，请禁用点击或改成只读。

### 5. 顶部流程条视觉轻量化，不要抢占首屏

不要重构整体布局，只做轻量 CSS 调整：

- 顶部流程条高度控制在一行到两行。
- 节点可换行，但不要大面积空白。
- 与标题之间保持紧凑间距。
- 不要遮挡左侧内容区。
- 不要使用大量图标。
- 使用现有 Element Plus 按钮/Tag 风格或项目已有 token。

如果现在该区域造成左侧结果首屏过低，请适当减少：

```css
margin
padding
gap
```

不要大改页面结构。

### 6. 真实链路验收必须补齐

上一轮只启动了 dev 服务，没有实际跑完浏览器链路。这一轮必须完成真实验收。

请访问：

```text
http://127.0.0.1:5201/workbench
```

如果端口不同，以当前 dev server 输出为准。

必须实际跑通：

```text
首页默认查询
→ 智能筛客
→ 探查唐山物桥商贸有限公司
→ 新建尽调
→ 选择标准授信尽调模板
→ 税票采集等待确认发送
→ 确认发送采集链接
→ 模拟企业已授权
→ 进入资料补充
→ 模拟企业上传资料
→ 进入证据整合
→ 进入风险诊断
→ 进入产物确认
→ 编辑报告
```

每一步检查：

```text
左侧标题是否正确
顶部流程条高亮是否正确
左侧 artifact 是否正确
右侧建议按钮是否正确
控制台是否无 Vue runtime 错误
```

控制台不能出现：

```text
Cannot read properties of null
Cannot set properties of null
subTree
__vnode
assistant.xxx is not a function
```

## 验收命令

必须运行：

```bash
npm run build
```

如果无法使用浏览器自动化，请明确说明“没有完成真实浏览器链路验收”。不要只用 build 通过替代验收。

## 输出要求

完成后请输出：

1. 修改了哪些文件。
2. 顶部流程条现在是否只读。
3. 顶部流程条是否还会改变右侧对话状态。
4. 是否实际跑过 `/workbench` 主链路。
5. 每一步的 activeStageId / currentFlowStatus 是否符合预期。
6. `npm run build` 是否通过。
7. 控制台是否无 Vue runtime 错误。

