# OpenClaw 提示词：工作台 Phase 1 验收收口 v2

你现在继续处理【工作台 Phase 1 验收收口】，不是做 Phase 2，也不是做视觉重构。上一轮构建已经通过，但还需要把真实浏览器主链路、按钮语义和状态反馈进一步收口，确保 demo 能连续跑完。

## 当前目标

保证工作台 `/workbench` 可以稳定完成这条 Phase 1 demo 主链路：

```text
首页默认查询
→ 进入二级对话页
→ 智能筛客
→ 探查唐山物桥商贸有限公司
→ 新建尽调
→ 选择「标准授信尽调」模板
→ 工商核验
→ 司法查询
→ 税票采集：等待发送链接
→ 确认发送采集链接
→ 等待企业授权
→ 模拟企业已授权
→ 税票采集完成
→ 进入资料补充
→ 发送资料清单 / 模拟企业上传资料
→ 资料补充完成
→ 进入证据整合
→ 进入风险诊断
→ 进入产物确认
→ 编辑报告 / 导出报告 / 加入监控
```

## 修改范围

只允许修改以下工作台相关文件：

```text
src/stores/workbenchAssistant.js
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/artifacts/*.vue
```

不要修改独立业务页面：

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

如果必须引用独立模块的数据或样式，只能复制必要的 mock 数据结构或轻量展示结构到工作台组件内，不要改原模块。

## 必须完成的收口项

### 1. 做一次真实链路自查，不只看 build

请启动本地服务并用浏览器/Playwright 或手动方式检查 `/workbench` 主链路。  
必须确认控制台没有以下错误：

```text
Cannot read properties of null
Cannot set properties of null
subTree
__vnode
assistant.xxx is not a function
```

如果发现错误，优先修复引发错误的 `v-if/v-for key`、未导出方法、空对象访问、组件切换状态不稳定问题。

### 2. 保持组件切换稳定，避免 Vue patch 错误

文件重点：

```text
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/WorkbenchArtifactPanel.vue
src/pages/WorkbenchPage.vue
```

要求：

- 动态组件切换时必须有稳定 key，例如 `:key="tool + '-' + artifactType"` 或等价方式。
- artifact 数据为空时必须有兜底，不允许直接读取深层字段。
- `v-if` / `v-else-if` 分支不要在同一位置频繁切换不同根结构导致 patch 失败。
- 每个 artifact 组件根节点保持单一稳定容器。

### 3. 区分「进入资料补充」和「改为上传材料」

当前 `@enter-materials` 和 `@switch-to-upload` 都可能指向 `runMaterialsStep()`。请梳理清楚：

#### 3.1 进入资料补充

含义：税票采集完成后，正式进入资料补充节点。  
可以调用：

```js
runMaterialsStep()
```

#### 3.2 改为上传材料

含义：税票授权迟迟未完成时，从税票 RPA 授权模式切换到企业上传资料模式。  
请新增或确认一个独立方法，例如：

```js
async function switchTaxToMaterialUpload() {
  await pushMessage('user', '改为上传材料')
  await pushStreamingMessage('已切换为资料上传模式。我会根据尽调模板生成资料清单，企业可上传税票和经营资料继续推进。')
  await runMaterialsStep()
}
```

然后在 `WorkbenchPage.vue` 中：

```vue
@switch-to-upload="assistant.switchTaxToMaterialUpload()"
```

return 中导出 `switchTaxToMaterialUpload`。

### 4. 完善「查看诊断报告」的左侧反馈

当前 `viewDiagnosisReport()` 不能重新跑风险诊断。请让它做轻量但明确的左侧反馈：

- 如果当前已经有 `riskDiagnosis` stage，则切换到 `riskDiagnosis` stage。
- 保持 `leftPanelData` 为已有风险诊断数据。
- 右侧输出一句提示：

```text
已为你定位到左侧风险诊断报告，可查看核心风险、证据链和授信建议。
```

不要重新生成风险诊断，不要改变流程进度。

### 5. 完善「导出报告」的产物反馈

当前 `exportFinalReport()` 可以是 demo 模拟，但要有明确反馈：

- 不要进入报告编辑器。
- 不要清空左侧产物确认页面。
- 如果当前已有 `deliverables` stage，则保持或切换到 `deliverables` stage。
- 在左侧产物数据里增加或更新一个导出状态字段，例如：

```js
exportStatus: '已生成导出任务'
```

或在 `deliverables` 数据中增加：

```js
actions: ['编辑报告', '导出报告', '加入监控']
```

右侧提示：

```text
最终报告导出任务已生成，demo 阶段可在左侧产物确认区查看报告模板和资料包清单。
```

### 6. 报告编辑阶段保持右侧对话可继续驱动

进入报告编辑后：

- `currentFlowStatus` 必须是 `editing`
- `waitingForInput` 必须是 `true`
- `fillSuggestions('editing')` 必须执行
- 左侧展示 `ReportEditorArtifact`
- 右侧建议按钮出现：

```text
改写风险结论
补充税票说明
生成授信建议
```

用户点击或输入这些建议时，不要跳走页面，只在右侧输出处理提示，左侧保持报告编辑模式。

### 7. 右侧输入和建议按钮都必须可推进

请同时验证两种路径：

#### 7.1 点击建议按钮推进

```text
探查唐山物桥商贸有限公司
新建尽调
选择模板
确认发送采集链接
模拟企业已授权
模拟企业上传资料
进入证据整合
进入风险诊断
进入产物确认
编辑报告
```

#### 7.2 直接输入文本推进

输入框输入以下文本时也要推进，不要只靠按钮：

```text
唐山物桥商贸有限公司
新建尽调
标准授信尽调
确认发送
已授权
上传完成
进入证据整合
进入风险诊断
进入产物确认
编辑报告
```

如果 `handleWaitingForInput` 当前已经能覆盖，保持即可；如果覆盖不完整，请补齐关键判断。

### 8. 状态和建议按钮不要残留上一步

每次切换阶段时：

- 应清空或刷新 `contextSuggestions`
- 不要在税票阶段残留筛客建议
- 不要在报告编辑阶段残留产物确认建议
- 不要在完成态仍显示资料补充按钮

建议统一通过 `fillSuggestions(status)` 管理，不要在组件里各自维护右侧建议按钮。

## 不要做的事情

- 不要改工作台整体视觉布局。
- 不要重写状态机。
- 不要把用户确认驱动改回自动流水线。
- 不要把过程卡片重新堆回右侧对话流。
- 不要改独立页面代码。
- 不要引入新的 UI 库。
- 不要大规模替换样式。

## 验收命令

必须运行：

```bash
npm run build
```

如果项目已有 preview/dev 命令，请启动服务并实际访问 `/workbench` 检查主链路。

## 输出要求

完成后请输出：

1. 修改了哪些文件。
2. 修复了哪些验收问题。
3. `npm run build` 是否通过。
4. 是否实际跑过 `/workbench` 主链路。
5. 如果主链路没有实际跑，请明确说明没有跑，不要只说构建通过。

