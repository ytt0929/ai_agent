# OpenClaw 提示词：修复 Phase 3-C 工作台新建尽调后流程卡住问题

请先阅读并对齐以下文件：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/artifacts/DueDiligenceArtifact.vue`
- `src/components/workbench/artifacts/BusinessVerifyArtifact.vue`

## 当前问题

工作台流程中，用户完成：

```text
企业探查 → 新建尽调 → 选择模板「尽职调查报告」
```

后，页面左侧出现尽调任务已创建和工商核验流程条，但右侧只出现「稍后处理」按钮。

如果用户不点「稍后处理」，流程没有继续入口，卡在工商核验 0% / 等待开始状态。

这是 Phase 3-C 的流程 BUG。

## 产品决策

Phase 3-C 的产品边界是：

```text
工作台可以创建/复用智能尽调任务，但不直接跳转智能尽调详情页。
```

这不代表工作台流程停止。工作台 demo 仍然应该能继续跑完整链路：

```text
选择模板完成
  → 已创建尽调任务
  → 用户可选择：
       [开始工商核验] 主动作，继续在工作台跑 demo 全流程
       [稍后处理] 次动作，稍后从智能尽调台账处理
```

因此「稍后处理」应该保留在选择模板之后，但不能是唯一动作。

## 重要边界

本次只修复 Phase 3-C 工作台流程断点。

只允许修改：

- `src/stores/workbenchAssistant.js`

必要时小改：

- `src/pages/WorkbenchPage.vue`

不要修改：

- 智能尽调首页
- 智能尽调详情页
- 智能报告页面
- Phase 3-E 交付包组件
- 路由结构
- `token.css`

## 一、修复选择模板后的建议按钮

请找到 `fillSuggestions('waiting_due_diligence_action')` 的配置。

当前很可能只有：

```js
waiting_due_diligence_action: [
  { label: '稍后处理', value: 'pause_due_task' }
]
```

请改为：

```js
waiting_due_diligence_action: [
  { label: '开始工商核验', value: 'continue_due_flow' },
  { label: '稍后处理', value: 'pause_due_task' }
]
```

主按钮是「开始工商核验」，「稍后处理」是次按钮。

如果当前 UI 不区分主次样式，只要按钮顺序正确即可：先开始工商核验，再稍后处理。

## 二、修复按钮分发

请在 `handleSuggestionClick(value)` 或当前建议按钮分发逻辑中增加：

```js
if (value === 'continue_due_flow') {
  await runBusinessVerification()
  return
}
```

注意：

- 不要跳转到 `/due-diligence/:id`
- 不要清空当前工作台对话
- 不要重新创建尽调任务
- 直接沿用当前已选择的企业和模板，进入工作台内的工商核验阶段

## 三、修复自然语言输入

请在 `handleWaitingForInput(text)` 中处理：

```js
currentFlowStatus.value === 'waiting_due_diligence_action'
```

规则：

```text
如果输入包含：继续 / 开始 / 工商 / 核验 / 执行
  → runBusinessVerification()

如果输入包含：稍后 / 暂停 / 以后
  → pause_due_task

否则：
  → 默认 runBusinessVerification()
```

这样用户即使不点按钮，输入「继续」也能推进流程。

## 四、优化选择模板后的 AI 话术

在 `confirmDueTemplate(template)` 成功后，AI 话术应明确告诉用户有两条路：

```text
已创建尽调任务，并选择「尽职调查报告」模板。
你可以继续在工作台完成 demo 流程，也可以稍后从「智能尽调」任务台账继续处理。
```

然后右侧按钮显示：

```text
[开始工商核验] [稍后处理]
```

不要再只提示“稍后处理”。

## 五、稍后处理行为

`pause_due_task` 保持当前产品决策：

```text
AI：已保留当前尽调任务。稍后可以从左侧「智能尽调」进入任务台账继续处理。
```

要求：

- 不跳转智能尽调详情页
- 不跳转工作台首页
- 不清空当前工作台对话
- 不删除左侧尽调任务创建结果

## 六、开始工商核验后的行为

点击「开始工商核验」或输入「继续」后：

```text
我：开始工商核验
AI：正在进行工商核验，核查企业主体状态、工商登记、关联企业和税务评级。
```

然后执行现有：

```js
runBusinessVerification()
```

左侧应切换到工商核验结果，不再停留在空的 0% 流程卡。

后续流程保持已有逻辑：

```text
工商核验 → 司法查询 → 税票采集 → 资料补充 → 证据整合 → 风险诊断 → 产物确认 → 交付包
```

不要改后续阶段。

## 七、验收路径

请按以下路径验证：

1. 打开 `/workbench`。
2. 输入或点击默认示例，完成筛客。
3. 选择唐山物桥商贸有限公司并完成企业探查。
4. 点击「新建尽调」。
5. 选择模板「尽职调查报告」。
6. 右侧应出现：

```text
[开始工商核验] [稍后处理]
```

7. 点击「开始工商核验」。
8. 左侧进入工商核验结果，不再卡在 0%。
9. 回到同样节点，再输入「继续」也能进入工商核验。
10. 点击「稍后处理」只输出提示，不跳转、不清空。
11. `npm run build` 通过。

## 八、最终回复要求

完成后请说明：

1. 修改了哪些文件。
2. 是否修复了选择模板后只有「稍后处理」的问题。
3. 「开始工商核验」按钮是否可以推进工作台内流程。
4. 自然语言输入「继续 / 开始 / 工商 / 核验」是否可以推进。
5. 「稍后处理」是否仍然保留且不跳转。
6. 是否没有修改智能尽调、智能报告、交付包阶段和路由结构。
7. `npm run build` 是否通过。
