# OpenClaw 提示词：工作台 Phase 1 验收阻塞修复

你现在只做【工作台 Phase 1 状态机验收修复】，不要重构页面，不要改现有其他模块，不要改智能筛客、企业探查、智能尽调、企业监测、智能报告、税票采集、资料识别这些独立页面的功能和结构。只修复工作台 `WorkbenchPage.vue`、`stores/workbenchAssistant.js` 以及必要的工作台 artifact 组件中的小范围问题。

目标：让工作台首页输入默认示例后，可以稳定进入二级对话页，并完成这条 demo 主链路：

```text
首页输入/发送默认示例
→ 进入工作台二级对话页
→ 智能筛客结果出现，右侧提示可探查唐山物桥商贸有限公司
→ 点击/输入探查唐山物桥商贸有限公司
→ 企业探查结果
→ 新建尽调
→ 选择标准授信尽调模板
→ 工商核验、司法查询自动完成
→ 税票采集等待确认发送采集链接
→ 点击确认发送采集链接
→ 等待企业授权
→ 点击模拟企业已授权
→ 税票采集完成，进入资料补充等待动作
→ 点击进入资料补充或模拟企业上传资料
→ 资料补充完成
→ 证据整合
→ 风险诊断
→ 产物确认
→ 编辑报告 / 导出报告 / 加入监控
```

## 必须修复的问题

### 1. 首页输入后必须进入二级对话页

文件：`src/stores/workbenchAssistant.js`

当前 `runIntentRecognition(text)` 只设置 `dialogInput.value = text` 并调用 `sendMessage()`，但没有打开 `dialogOpen`。  
请修改：

```js
async function runIntentRecognition(text) {
  dialogOpen.value = true
  dialogInput.value = text
  await sendMessage()
}
```

同时确保首页默认示例按钮和首页输入框触发后都能切换到二级对话页。

### 2. 二级页右侧输入框发送必须生效

文件：`src/stores/workbenchAssistant.js`

当前 `sendMessage()` 不接收参数，只读取 store 内部 `dialogInput.value`。但 `WorkbenchPage.vue` 里调用的是 `assistant.sendMessage(t)`。  
请把 `sendMessage` 改成兼容参数：

```js
async function sendMessage(text = '') {
  if (text) dialogInput.value = text
  const inputText = dialogInput.value.trim()
  if (!inputText) return
  dialogInput.value = ''
  ...
}
```

不要改变原有 `dialogInput` 逻辑，只做兼容。

### 3. 导出 `runMaterialsStep`

文件：`src/stores/workbenchAssistant.js`

`runMaterialsStep()` 已定义，但 return 里没有导出。  
请在 return 对象中补充：

```js
runMaterialsStep,
```

否则 `WorkbenchPage.vue` 中 `assistant.runMaterialsStep()` 会运行时报错。

### 4. 筛客完成后补齐右侧建议按钮

文件：`src/stores/workbenchAssistant.js`

`runScreening()` 设置了：

```js
currentFlowStatus.value = 'waiting_selection'
waitingForInput.value = true
```

但没有调用：

```js
fillSuggestions('waiting_selection')
```

请在筛客完成后补上，让右侧建议按钮出现“探查 唐山物桥商贸有限公司”。

同时建议把 `waiting_selection` 的 value 改成完整企业名称，避免模糊匹配：

```js
waiting_selection: [
  { label: '探查 唐山物桥商贸有限公司', value: '唐山物桥商贸有限公司' }
]
```

### 5. 修正工作台二级页事件语义错位

文件：`src/pages/WorkbenchPage.vue`

当前这些绑定会推进错阶段，请修正：

#### 5.1 导出报告不要进入编辑器

当前：

```vue
@export-report="assistant.startReportEditor()"
```

请改成调用 store 新增方法，例如：

```vue
@export-report="assistant.exportFinalReport()"
```

并在 `workbenchAssistant.js` 新增轻量方法：

```js
async function exportFinalReport() {
  await pushMessage('user', '导出最终报告')
  await pushStreamingMessage('已生成最终报告导出任务，demo 阶段可在左侧产物确认区查看报告和资料包。')
}
```

return 中导出 `exportFinalReport`。

#### 5.2 查看诊断报告不要重新跑风险诊断

当前：

```vue
@view-diagnosis-report="assistant.enterRiskDiagnosis()"
```

请改成新增方法，例如：

```vue
@view-diagnosis-report="assistant.viewDiagnosisReport()"
```

store 新增：

```js
async function viewDiagnosisReport() {
  await pushMessage('user', '查看诊断报告')
  await pushStreamingMessage('左侧已展示当前企业诊断报告摘要，可继续进入产物确认或要求我补充风险说明。')
}
```

return 中导出 `viewDiagnosisReport`。

#### 5.3 发送资料清单不要直接模拟上传完成

当前：

```vue
@send-material-list="assistant.mockMaterialUpload()"
```

请改成：

```vue
@send-material-list="assistant.sendMaterialList()"
```

store 新增：

```js
async function sendMaterialList() {
  await pushMessage('user', '发送资料清单')
  await pushStreamingMessage('资料清单已发送给企业。demo 阶段可以点击「模拟企业上传资料」继续。')
  currentFlowStatus.value = 'waiting_material_upload'
  waitingForInput.value = true
  fillSuggestions('waiting_material_upload')
}
```

return 中导出 `sendMaterialList`。

#### 5.4 发送提醒不要直接模拟企业授权

当前：

```vue
@send-reminder="assistant.mockTaxAuthorized()"
```

请改成：

```vue
@send-reminder="assistant.sendTaxAuthReminder()"
```

store 新增：

```js
async function sendTaxAuthReminder() {
  await pushMessage('user', '发送授权提醒')
  await pushStreamingMessage('已向企业发送税票授权提醒。demo 阶段可以点击「模拟企业已授权」继续。')
  currentFlowStatus.value = 'waiting_tax_authorization'
  waitingForInput.value = true
  fillSuggestions('waiting_tax_authorization')
}
```

return 中导出 `sendTaxAuthReminder`。

### 6. 报告编辑阶段补齐建议按钮

文件：`src/stores/workbenchAssistant.js`

`startReportEditor()` 设置了：

```js
currentFlowStatus.value = 'editing'
```

请补充：

```js
waitingForInput.value = true
fillSuggestions('editing')
```

让右侧出现“改写风险结论 / 补充税票说明 / 生成授信建议”。

### 7. 修正状态名不一致

文件：`src/pages/WorkbenchPage.vue`

`dialogPlaceholder` 中当前判断了不存在的状态：

```js
waiting_tax_auth
editing_report
```

请改成 store 实际状态：

```js
waiting_tax_authorization
editing
```

不要新增多套状态名，统一以 store 当前已有状态为准。

### 8. 唐山物桥资料补充完整度对齐

文件：`src/stores/workbenchAssistant.js`

`runMaterialsStep()` 中唐山物桥初始资料完整度当前是 50。请改成 67，保持和对话提示一致：

```js
completeness: isTsWq ? 67 : 60
```

上传完成后仍保持 86。

### 9. 资料补充统计口径对齐

文件：`src/components/workbench/artifacts/MaterialsArtifact.vue`

当前 `pending` 只统计 `status === '待补充'`，但 store 里缺失资料是 `缺失`。  
请改成兼容：

```js
const pending = computed(() =>
  (props.data.materials || []).filter(m => ['待补充', '缺失', '待上传'].includes(m.status)).length
)
```

不要大改资料补充组件结构。

## 验收标准

请完成后运行：

```bash
npm run build
```

并手动检查以下路径不报错：

1. 打开 `/workbench`。
2. 首页默认示例可以一键发送。
3. 发送后进入二级对话页。
4. 筛客结果左侧出现，右侧出现“探查 唐山物桥商贸有限公司”建议按钮。
5. 点击探查后进入企业探查。
6. 点击新建尽调、选择模板后进入尽调流程。
7. 税票采集阶段先等待发送链接，不自动完成。
8. 点击确认发送采集链接后等待授权。
9. 点击模拟企业已授权后税票完成，并可进入资料补充。
10. 资料补充、证据整合、风险诊断、产物确认、报告编辑均可按按钮推进。
11. 控制台不能出现：
    - `assistant.runMaterialsStep is not a function`
    - `Cannot read properties of null`
    - `Cannot set properties of null`
    - Vue patch / subTree / __vnode 相关错误

## 禁止事项

- 不要重构工作台整体布局。
- 不要改独立业务模块页面。
- 不要把右侧对话过程卡片重新塞回对话流。
- 不要新增复杂 icon 或自定义视觉风格。
- 不要改动与本次验收无关的文案、样式和路由。
- 不要把用户确认驱动改回自动流水线。

