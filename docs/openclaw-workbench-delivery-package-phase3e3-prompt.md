# OpenClaw 提示词：Phase 3-E-3 工作台完整模拟流程增加轻量交付包结果和模拟下载

请先阅读并对齐以下文件：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/components/workbench/artifacts/DeliverablesArtifact.vue`
- `src/components/workbench/artifacts/DeliveryPackageArtifact.vue`

## 当前阶段目标

Phase 3-E-1 已完成：智能尽调详情页有第 8 节点「交付包下载」。

Phase 3-E-2 已完成：智能尽调首页台账有「交付包」状态和「下载交付包」按钮。

本阶段只做 Phase 3-E-3：

```text
工作台完整模拟流程增加轻量交付包结果和模拟下载。
```

工作台是 AI 编排和演示入口，不是完整尽调任务详情页。因此工作台里不要做复杂第 8 节点，也不要完整复制智能尽调详情页的交付包下载页。

工作台只需要在完整模拟流程末尾展示一个轻量交付包结果，让演示者能完成闭环：

```text
筛客 → 企业探查 → 新建尽调 → 工商/司法/税票/资料/证据/风险 → 产物确认 → 交付包已生成 → 模拟下载
```

## 重要边界

只允许修改工作台相关文件：

- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- 可新增：`src/components/workbench/artifacts/WorkbenchDeliveryPackageArtifact.vue`

必要时可小改：

- `src/components/workbench/artifacts/DeliverablesArtifact.vue`，仅用于事件透传或按钮事件，不要重写已验收结构。

不要修改：

- 智能尽调首页
- 智能尽调详情页
- 智能报告页面
- 路由结构
- `token.css`
- `DeliveryPackageArtifact.vue` 详情页完整组件

## 产品定位

三个端的分工必须保持清楚：

```text
工作台：
  负责 AI 编排、完整演示闭环、轻量交付结果和模拟下载。
  不展示完整交付目录，不做长期任务管理。

智能尽调：
  负责完整任务、完整交付包目录、交付包下载归档。

智能报告：
  负责报告正文编辑、版本管理、单份报告导出。
```

## 一、工作台交付包轻量结果形态

请新增一个轻量组件，推荐：

```text
src/components/workbench/artifacts/WorkbenchDeliveryPackageArtifact.vue
```

左侧展示效果：

```text
┌──────────────────────────────────────────────┐
│ 交付包已生成                                  │
├──────────────────────────────────────────────┤
│ 企业：唐山物桥商贸有限公司                    │
│ 包名：唐山物桥商贸有限公司_尽调交付包_20260702.zip │
│ 状态：已生成                                  │
│ 内容：尽调报告、阶段报告、证据链文件、原始资料包 │
│ 生成时间：2026-07-02 15:40                    │
├──────────────────────────────────────────────┤
│ 交付清单摘要                                  │
│ - 尽职调查报告.pdf / docx                     │
│ - 工商核验、司法查询、税票分析、风险诊断报告    │
│ - 企业基础资料证据链、风险事项证据链            │
│ - 营业执照、纳税申报表、发票明细、合同文件      │
├──────────────────────────────────────────────┤
│ [模拟下载交付包] [查看交付清单]                │
└──────────────────────────────────────────────┘
```

要求：

- 使用 Element Plus：`el-card`、`el-descriptions`、`el-tag`、`el-button`。
- 使用项目 token 样式变量。
- 不要大量图标。
- 不要做复杂 `el-tree`，完整目录留在智能尽调详情页。

## 二、workbenchAssistant 增加交付包状态

在 `src/stores/workbenchAssistant.js` 中增加一个新阶段或轻量结果：

建议 stage id：

```js
deliveryPackage
```

补充映射：

```js
STAGE_LABEL_MAP.deliveryPackage = '交付包'
ARTIFACT_TYPE_MAP.deliveryPackage = 'deliveryPackage'
```

或者如果当前映射结构不方便，也可以直接在 `WorkbenchBusinessPanel.vue` 中注册 `deliveryPackage` 组件。

交付包数据建议：

```js
{
  enterprise: selectedEnterprise.value,
  status: '已生成',
  packageName: '唐山物桥商贸有限公司_尽调交付包_20260702.zip',
  generatedAt: '2026-07-02 15:40',
  downloaded: false,
  summary: [
    '尽调报告',
    '阶段报告',
    '证据链文件',
    '原始资料包'
  ],
  files: [
    '尽职调查报告.pdf',
    '尽职调查报告.docx / 可编辑草稿',
    '工商核验报告.pdf',
    '司法查询报告.pdf',
    '税票分析报告.pdf',
    '风险诊断报告.pdf',
    '企业基础资料证据链.xlsx',
    '风险事项证据链.pdf',
    '营业执照.pdf',
    '纳税申报表.pdf',
    '发票明细.xlsx',
    '合同文件.pdf'
  ]
}
```

## 三、从产物确认进入轻量交付包

当前工作台 `DeliverablesArtifact.vue` 已有按钮：

```text
确认产物并生成交付包
```

但工作台目前未完整承接这个事件。请补齐事件链：

```text
DeliverablesArtifact emit('generate-delivery-package')
  → WorkbenchBusinessPanel emit('generate-delivery-package')
  → WorkbenchPage 调用 assistant.generateDeliveryPackage()
  → workbenchAssistant 新增/切换 deliveryPackage stage
```

如果现有 `WorkbenchBusinessPanel.vue` 已经转发该事件，请只补漏，不要重复。

点击后右侧对话：

```text
我：确认产物并生成交付包
AI：报告和待确认项已确认。我已整理轻量尽调交付包，包含尽调报告、阶段报告、证据链文件和原始资料包。
AI：demo 阶段可在左侧查看交付清单并模拟下载。完整交付记录可在智能尽调任务台账查看。
```

左侧切换为 `WorkbenchDeliveryPackageArtifact`。

右侧快捷按钮变为：

```text
[模拟下载交付包] [查看交付清单] [稍后处理]
```

## 四、模拟下载交付包

在 `workbenchAssistant.js` 中新增方法：

```js
async function mockDownloadDeliveryPackage() {}
```

行为：

```text
我：模拟下载交付包
AI：正在生成「唐山物桥商贸有限公司_尽调交付包_20260702.zip」。
AI：交付包已生成，demo 阶段已模拟下载完成。
```

同时更新左侧 artifact 数据：

```js
downloaded: true
downloadedAt: 当前时间
downloadStatus: '已下载'
```

使用 `ElMessage.success` 可以在页面层做，也可以只通过 AI 消息提示。优先保持与现有工作台模式一致，不要强行引入复杂 UI。

## 五、查看交付清单

在工作台里「查看交付清单」只需要切换/展开左侧轻量清单，不要跳转详情页。

可实现为：

```js
async function viewDeliveryPackageList() {
  setActiveStage('deliveryPackage')
  await pushStreamingMessage('左侧已展示本次尽调交付清单摘要。完整交付包目录可在智能尽调任务详情中查看。')
}
```

如果轻量组件默认已经显示清单，则点击后只需定位左侧并输出 AI 提示。

## 六、工作台完成态建议按钮

请更新 `fillSuggestions()`：

在交付包生成后：

```js
currentFlowStatus.value = 'delivery_package_ready'
fillSuggestions('delivery_package_ready')
```

建议按钮：

```js
delivery_package_ready: [
  { label: '模拟下载交付包', value: 'mock_download_delivery_package' },
  { label: '查看交付清单', value: 'view_delivery_package_list' },
  { label: '稍后处理', value: 'pause_due_task' },
]
```

并在 `handleSuggestionClick()` 或对应分发逻辑中处理：

```js
mock_download_delivery_package → mockDownloadDeliveryPackage()
view_delivery_package_list → viewDeliveryPackageList()
pause_due_task → 保持当前工作台，不跳转
```

不要新增「进入智能尽调任务」按钮。此前产品决策是：工作台不主动跳详情页，稍后用户可从左侧菜单进入智能尽调台账。

## 七、工作台左侧流程展示

工作台不是智能尽调详情页，不要求顶部流程条增加第 8 节点。

但左侧结果区需要能展示轻量交付包结果，标题可以是：

```text
交付包
```

或者：

```text
交付包已生成
```

不要把智能尽调详情页的完整 `DeliveryPackageArtifact.vue` 原样搬进工作台。工作台要轻、短、适合 demo。

## 八、与智能尽调任务的关系

如果工作台已经创建/复用了智能尽调任务，请在生成轻量交付包时尽量同步该任务的交付包字段：

```js
deliveryPackageStatus: '已生成'
deliveryPackageName: '唐山物桥商贸有限公司_尽调交付包_20260702.zip'
deliveryPackageDownloaded: false
currentStep: 'delivery-package'
currentStage: 'delivery-package'
statusText: '交付包已生成'
```

可以通过 `useDueDiligenceStore()` 查找 `linkedDueTaskId` 对应任务并更新。

如果当前工作台没有成功关联尽调任务，不要报错，工作台仍然展示轻量交付包结果。

## 九、自然语言输入

当 `currentFlowStatus === 'delivery_package_ready'` 时，右侧输入框支持：

```text
下载 / 交付包 / zip → mockDownloadDeliveryPackage()
清单 / 查看交付清单 → viewDeliveryPackageList()
稍后 → pause_due_task
```

不要影响其他阶段关键词。

## 十、验收路径

请按以下路径验证：

1. 打开 `/workbench`。
2. 走完整 demo 流程，直到产物确认。
3. 点击左侧产物确认区的「确认产物并生成交付包」。
4. 左侧切换为轻量交付包结果。
5. 右侧 AI 输出交付包已生成的提示。
6. 右侧快捷按钮出现：

```text
[模拟下载交付包] [查看交付清单] [稍后处理]
```

7. 点击「模拟下载交付包」，右侧出现模拟下载消息，左侧状态变为「已下载」。
8. 点击「查看交付清单」，不跳转页面，左侧仍展示交付清单摘要。
9. 点击「稍后处理」，不跳转智能尽调详情页。
10. 如果存在关联的智能尽调任务，进入 `/due-diligence` 后该任务应显示交付包已生成。
11. `npm run build` 通过。

## 十一、最终回复要求

完成后请说明：

1. 修改了哪些文件。
2. 是否新增工作台轻量交付包组件。
3. 工作台如何从产物确认进入轻量交付包。
4. 右侧 AI 建议按钮有哪些。
5. 模拟下载是否只在 demo 内完成，不真实生成 zip。
6. 是否同步了智能尽调任务交付包状态。
7. 是否没有修改智能尽调详情页、智能尽调首页、智能报告和路由结构。
8. `npm run build` 是否通过。
