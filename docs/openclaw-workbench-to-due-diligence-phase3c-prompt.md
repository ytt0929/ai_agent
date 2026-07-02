# OpenClaw 提示词：Phase 3-C 迭代：工作台继续可操作 + 稍后处理沉淀到智能尽调

请先阅读：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- `src/stores/dueDiligence.js`
- `src/pages/DueDiligenceHomePage.vue`
- `src/pages/DueDiligenceTaskPage.vue`（只读，不要改）
- `src/components/AppSidebar.vue`

## 本阶段目标

本阶段要修正 Phase 3-C 的交互方向：工作台创建尽调任务后，不应该强制或主推直接跳到智能尽调详情页。

正确目标：

1. 用户在工作台完成筛客、企业探查后，点击「新建尽调」并选择「尽职调查报告」模板。
2. 工作台创建或复用一条智能尽调任务。
3. 智能尽调首页任务台账能看到这条任务。
4. 工作台当前对话和左侧产物流程继续可操作，不要因为创建了智能尽调任务就中断工作台 demo。
5. 用户如果不点「稍后处理」，应当可以继续在工作台里推进完整流程：工商核验、司法查询、税票采集、资料补充、证据整合、风险诊断、产物确认。
6. 用户点击「稍后处理」时，不跳转，只提示用户后续可点击左侧菜单「智能尽调」进入任务台账继续处理。
7. 用户点击左侧菜单「智能尽调」后，进入智能尽调首页 `/due-diligence`，从任务台账选择对应任务继续，不从工作台按钮直接跳详情页。
8. 用户再次点击左侧菜单「工作台」时，必须回到工作台首页，而不是停留在工作台二级对话页。

## 产品交互定位，必须遵守

本阶段不是在工作台新增一个「任务列表」或「任务卡片」入口，也不是在工作台首页待办区域加按钮。

工作台创建尽调任务后，工作台仍然是 AI Copilot 编排现场。智能尽调是任务台账和长流程沉淀空间。

正确交互是：

```text
工作台 AI 对话流：

用户：为「唐山物桥商贸有限公司」新建尽调任务
AI：请先选择尽调模板。
用户：选择模板「尽职调查报告」
AI：已为「唐山物桥商贸有限公司」创建尽调任务，模板为「尽职调查报告」。
AI：该任务已同步到智能尽调任务台账。你可以继续在工作台完成当前 demo 流程；如果稍后再处理，可点击「稍后处理」。

快捷动作：
[稍后处理]

如果用户不点「稍后处理」：
工作台继续自动或对话式推进完整尽调流程。

如果用户点击「稍后处理」：
AI：已为你保留该尽调任务。稍后请点击左侧菜单「智能尽调」，在任务台账中继续处理。
```

错误做法：

```text
不要在工作台首页另起任务列表。
不要在今日待办里新增「进入智能尽调」按钮。
不要在左侧业务产物区顶部新增固定按钮。
不要把工作台改造成第二个智能尽调详情页。
不要在工作台右侧建议按钮里提供「进入智能尽调任务」并直接跳详情页。
不要在工作台点击按钮直接跳转 `/due-diligence/:taskId`。
不要因为创建了智能尽调任务就停止工作台完整流程。
```

## 重要产品边界

本阶段不要做双向同步：

- 不做「智能尽调 → 工作台」主流程。
- 不做智能尽调推进后反写工作台对话。
- 不做从智能尽调回到工作台继续对话推进。
- 不要强化「回到工作台」按钮；如果现有页面已有普通返回按钮，可以先保留，但不要作为主动作。
- 不要改智能尽调详情页的 7 个阶段产物组件。
- 不要改智能报告页面。
- 不要改路由结构。
- 允许小改 `AppSidebar.vue`：点击「工作台」菜单时重置 workbench store，确保进入工作台首页。

## 允许修改的文件

优先只改这些文件：

- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- `src/stores/dueDiligence.js`
- `src/components/AppSidebar.vue`（仅用于点击工作台菜单重置工作台首页）

如果确实需要补充 mock 字段，才允许小范围修改：

- `src/data/mockDueDiligence.js`

不要修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/components/workbench/artifacts/*.vue`
- `src/pages/SmartReportPage.vue`
- 独立业务模块页面

## 具体实现要求

### 1. 工作台创建/复用智能尽调任务

在工作台确认模板后，调用智能尽调 store 创建任务。

推荐在 `src/stores/dueDiligence.js` 中新增或复用一个方法：

```js
createOrReuseTaskFromWorkbench(payload)
```

行为：

- 根据 `enterpriseName` 或 `creditCode` 查找是否已有同企业任务。
- 如果已存在，直接返回已有任务，不重复创建。
- 如果不存在，创建一条新任务。
- 创建任务时使用工作台选择的企业和模板信息。

唐山物桥 demo 任务字段建议：

```js
{
  enterpriseName: '唐山物桥商贸有限公司',
  creditCode: '91130203MA7EEQ2N0T',
  industry: '商贸流通',
  region: '河北唐山',
  registeredCapital: '500万',
  source: '工作台AI',
  templateName: '尽职调查报告',
  currentStep: 'tax-rpa',
  currentStage: '税票采集',
  statusText: '税票采集 / 待授权',
  status: '等待客户',
  progress: 43,
  score: 72,
  rating: 'C+',
  riskLevel: '中风险',
  materialCompleteness: 67
}
```

如果已有任务，不要重置它当前阶段，避免用户已经推进到资料补充、风险诊断后被覆盖。

### 2. 工作台保存关联任务 id

在 `workbenchAssistant.js` 中增加类似状态：

```js
const linkedDueTaskId = ref('')
```

确认模板后：

- 调用 `dueDiligenceStore.createOrReuseTaskFromWorkbench(...)`
- 将返回任务 id 写入 `linkedDueTaskId`
- 右侧 AI 输出：

```text
已为「唐山物桥商贸有限公司」创建尽调任务，模板为「尽职调查报告」。
该任务已同步到智能尽调任务台账。你可以继续在工作台完成当前 demo 流程；如果稍后再处理，可点击「稍后处理」。
```

如果是复用已有任务，则输出：

```text
已找到「唐山物桥商贸有限公司」的尽调任务，当前任务已在智能尽调中保留。你可以继续在工作台操作，或稍后去智能尽调任务台账继续处理。
```

重要：创建/复用任务之后，不要停止工作台流程。需要恢复或保留原有工作台完整流程推进能力。

如果当前代码在 `confirmDueTemplate()` 中已经把 `runBusinessVerification()` 去掉了，请恢复工作台原有流程：

```js
await runBusinessVerification()
```

或者按现有代码结构恢复等价的工作台流程推进逻辑。智能尽调 store 只用于创建/复用任务，不应该阻断工作台内的 demo 流程。

### 3. 工作台右侧建议按钮

确认模板后，不再提供 `进入智能尽调任务` 快捷按钮。

只允许在合适的位置提供 `稍后处理`。

不要新增工作台任务列表按钮；不要改工作台首页待办模块。

建议按钮 value：

```js
{ label: '稍后处理', value: 'pause_due_task' }
```

如果当前代码已有：

```js
{ label: '进入智能尽调任务', value: 'open_due_task' }
```

请删除，不要再渲染。

### 4. 不要从工作台按钮直接跳详情页

如果当前 `WorkbenchPage.vue` 中存在 `handleWorkbenchSuggestion(s)` 拦截：

```js
if (s.value === 'open_due_task') {
  router.push('/due-diligence/' + id)
}
```

请删除这段直接跳转逻辑，或者让它不再被触发。

工作台对话按钮不负责进入智能尽调详情页。

### 5. 稍后处理

点击「稍后处理」时，不跳转。

右侧 AI 输出：

```text
已为你保留该尽调任务。稍后请点击左侧菜单「智能尽调」，在任务台账中继续处理。
```

并清理或更新建议按钮。

不要提示「点击进入智能尽调任务按钮」，因为现在没有这个按钮。

### 6. 点击智能尽调菜单的行为

点击左侧菜单「智能尽调」时，进入 `/due-diligence` 首页，即智能尽调任务台账。

不需要从工作台自动跳到 `/due-diligence/:taskId`。

用户在智能尽调首页任务台账中点击对应任务的「继续处理」，再进入 `/due-diligence/:taskId`。

### 7. 点击工作台菜单的行为

用户再次点击左侧菜单「工作台」时，应该看到工作台首页，而不是之前的二级对话页。

实现建议：

- 在 `AppSidebar.vue` 的工作台菜单点击逻辑里，调用 `useWorkbenchAssistantStore().reset()`。
- 然后 `router.push('/workbench')`。
- 只对工作台菜单这样处理，不要影响其他菜单。

示意：

```js
if (item.key === 'workbench') {
  useWorkbenchAssistantStore().reset()
}
router.push(item.route)
```

注意需要按当前代码实际结构调整，不要机械复制。

## UI 和样式要求

- 不新增复杂 UI。
- 不改工作台整体布局。
- 使用现有 AI Copilot 对话样式和现有建议按钮样式。
- 如果新增按钮，使用现有组件结构或 Element Plus 组件。
- 不要手写大量新图标。
- 不要改 `token.css`。

## 验收路径

请完成后按下面路径自测：

1. 进入 `/workbench`。
2. 使用默认筛客示例或输入：
   `筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户`
3. 选择/探查 `唐山物桥商贸有限公司`。
4. 点击「新建尽调」。
5. 选择模板「尽职调查报告」。
6. 检查右侧 AI 是否出现：
   - 任务已同步到智能尽调
   - 不出现 `[进入智能尽调任务]`
   - 可以出现 `[稍后处理]`
7. 不点击「稍后处理」，继续在工作台推进流程，应能继续看到工商核验、司法查询、税票采集、资料补充等工作台完整流程。
8. 回到该分支重新创建任务后，点击「稍后处理」，页面不跳转，AI 提示用户点击左侧菜单「智能尽调」进入任务台账。
9. 点击左侧菜单「智能尽调」，进入 `/due-diligence` 首页，任务台账里能看到该任务。
10. 在智能尽调首页点击对应任务「继续处理」，进入 `/due-diligence/:taskId` 详情页。
11. 再点击左侧菜单「工作台」，应回到工作台首页，不应停留在工作台二级对话页。
12. 重复从工作台创建同一企业任务，不应产生重复任务。

## 构建要求

完成后运行：

```bash
npm run build
```

最终回复请说明：

1. 修改了哪些文件。
2. 是否实现工作台创建/复用智能尽调任务。
3. 是否删除工作台对话按钮直接跳详情页的逻辑。
4. 是否避免重复创建同企业任务。
5. 是否保留工作台完整流程可继续操作。
6. 点击智能尽调菜单是否进入任务台账。
7. 点击工作台菜单是否回到工作台首页。
8. 是否没有修改智能尽调详情页和工作台 artifact。
9. `npm run build` 是否通过。
