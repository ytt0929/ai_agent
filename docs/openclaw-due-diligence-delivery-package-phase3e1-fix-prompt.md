# OpenClaw 提示词：Phase 3-E-1 修复交付包入口与运行时报错

请先阅读并对齐以下文件：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- `src/components/workbench/artifacts/DeliverablesArtifact.vue`
- `src/components/workbench/artifacts/DeliveryPackageArtifact.vue`
- `src/components/workbench/artifacts/ReportEditorArtifact.vue`

## 当前问题

当前智能尽调详情页在产物确认 / 报告编辑 Lite 阶段，点击「生成交付包」等按钮无反应，浏览器报错：

```text
Uncaught TypeError: store.enterDeliveryPackage is not a function
    at handleGenerateDeliveryPackage (DueDiligenceTaskPage.vue:336:9)
```

同时当前「生成交付包 / 交付包下载」入口不够明显。用户在左侧报告编辑区看到的主按钮是「提交确认」，但不知道下一步应该进入「交付包下载」。右侧助手底部的「生成交付包」太弱，不能作为唯一入口。

本次任务只做 Phase 3-E-1 的修复和体验补强，不扩展其他模块。

## 重要边界

只允许修改智能尽调详情页相关文件：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- `src/components/workbench/artifacts/DeliverablesArtifact.vue`
- `src/components/workbench/artifacts/DeliveryPackageArtifact.vue`
- 必要时可小改 `src/components/workbench/artifacts/ReportEditorArtifact.vue`

不要修改：

- 工作台页面和工作台 store
- 智能报告页面
- 智能尽调首页
- 路由结构
- `token.css`
- 独立业务模块

## 一、先修复运行时报错

请重点检查 `src/stores/dueDiligence.js`。

必须存在方法：

```js
function enterDeliveryPackage(taskId) {
  // 将任务切换到 delivery-package 阶段
}

function markDeliveryPackageDownloaded(taskId) {
  // 标记交付包已模拟下载
}
```

这两个方法必须从 Pinia setup store 的 `return { ... }` 中导出：

```js
return {
  // ...
  enterDeliveryPackage,
  markDeliveryPackageDownloaded
}
```

`DueDiligenceTaskPage.vue` 必须使用同一个 store：

```js
import { useDueDiligenceStore } from '../stores/dueDiligence'
const store = useDueDiligenceStore()
```

`handleGenerateDeliveryPackage()` 不允许静默失败。请增加防御判断：

```js
if (typeof store.enterDeliveryPackage !== 'function') {
  ElMessage.error('交付包流程方法未加载，请刷新页面后重试')
  return
}
```

然后再调用：

```js
store.enterDeliveryPackage(taskId)
selectedStageKey.value = 'delivery-package'
```

如果源码已经有方法但运行时仍报错，需要考虑 Vite HMR / Pinia 热更新导致旧 store 实例未挂载新方法。请在最终报告中明确提示需要重启 dev server 后验收。

## 二、交付包入口必须变成左侧主路径

当前不要只在右侧助手底部提供「生成交付包」。交付包是产物确认后的主流程节点，入口必须出现在左侧结果区。

### 1. 产物确认阶段

在 `DeliverablesArtifact.vue` 的产物确认动作区，增加明显主按钮：

```text
[确认产物并生成交付包]
```

要求：

- 使用 Element Plus `el-button`
- 类型使用 `type="primary"`
- 视觉优先级高于普通「查看 / 编辑 / 导出」动作
- 点击后 emit 给父组件，例如：

```js
emit('generate-delivery-package')
```

父组件 `DueDiligenceTaskPage.vue` 监听后调用 `handleGenerateDeliveryPackage()`。

### 2. 报告编辑 Lite 阶段

当前左侧报告编辑 Lite 底部有：

```text
[保存草稿] [导出报告] [提交确认]
```

请把主路径表达清楚，推荐改为：

```text
[保存草稿] [导出报告] [确认产物并生成交付包]
```

优先方案：直接把主按钮改成「确认产物并生成交付包」，避免用户二次寻找入口。

如果不便直接替换按钮，也必须在点击「提交确认」后立即出现一个明显的下一步卡片：

```text
下一步：生成尽调交付包
报告草稿、风险结论和授信建议已确认，可整理最终交付包。
[确认产物并生成交付包]
```

### 3. 右侧助手快捷按钮

右侧助手可以保留快捷按钮，但不要作为唯一入口。

在 `selectedStageKey === 'artifacts'` 或报告编辑 Lite 模式下，右侧按钮建议为：

```text
[查看报告] [编辑报告] [确认产物并生成交付包] [稍后继续]
```

点击「确认产物并生成交付包」后：

```text
我：确认产物并生成交付包
AI：报告草稿、阶段报告和证据链已确认。我已整理完整尽调交付包，包含尽调报告、阶段报告、证据链文件和原始资料包。
```

并切换左侧到 `DeliveryPackageArtifact`。

## 三、进入交付包下载后的状态

点击「确认产物并生成交付包」后：

- `task.currentStep = 'delivery-package'`
- `task.currentStage = 'delivery-package'`
- `task.progress = 100`
- `task.statusText = '交付包已生成'`
- `task.deliveryPackageStatus = '已生成'`
- `selectedStageKey = 'delivery-package'`

左侧展示 `DeliveryPackageArtifact`。

右侧助手快捷按钮变为：

```text
[下载完整交付包] [单独下载报告PDF] [返回产物确认]
```

## 四、交付包下载页内容

`DeliveryPackageArtifact.vue` 左侧内容需要展示完整交付目录：

```text
交付包下载 · 唐山物桥商贸有限公司

交付包状态：已生成
包名：唐山物桥商贸有限公司_尽调交付包_20260702.zip
生成时间：2026-07-02 15:40

交付目录

1. 尽调报告
   - 尽职调查报告.pdf
   - 尽职调查报告.docx / 可编辑草稿

2. 阶段报告
   - 工商核验报告.pdf
   - 司法查询报告.pdf
   - 税票分析报告.pdf
   - 资料识别报告.pdf
   - 风险诊断报告.pdf

3. 证据链文件
   - 企业基础资料证据链.xlsx
   - 风险事项证据链.pdf
   - 税票数据证据链.xlsx
   - 资料完整性清单.xlsx

4. 原始资料包
   - 营业执照.pdf
   - 纳税申报表.pdf
   - 发票明细.xlsx
   - 合同文件.pdf
   - 上传资料.zip
```

按钮：

```text
[下载完整交付包] [单独下载报告PDF] [返回产物确认]
```

下载动作只做 demo 模拟，不真实生成 zip / PDF。

## 五、按钮点击行为

### 下载完整交付包

点击后：

```text
我：下载完整交付包
AI：正在生成「唐山物桥商贸有限公司_尽调交付包_20260702.zip」。
AI：交付包已生成。demo 阶段已模拟下载完成。
```

同时：

```js
store.markDeliveryPackageDownloaded(taskId)
ElMessage.success('交付包已生成，demo 阶段模拟下载完成')
```

### 单独下载报告 PDF

点击后：

```text
我：单独下载报告PDF
AI：已模拟导出「尽职调查报告.pdf」。正式环境将由后端渲染 PDF。
```

同时：

```js
ElMessage.success('已模拟导出尽职调查报告 PDF')
```

### 返回产物确认

点击后：

```js
selectedStageKey = 'artifacts'
```

不要清空已生成交付包状态。

## 六、UI 要求

- 必须使用 Element Plus 组件。
- 样式必须使用项目 token 变量，例如：
  - `var(--surface-card)`
  - `var(--border-default)`
  - `var(--text-primary)`
  - `var(--text-secondary)`
  - `var(--space-*)`
- 不要大量使用图标。
- 不要自造一套视觉风格。
- 不要让右侧助手按钮成为唯一入口。
- 左侧主按钮必须清楚表达“确认产物并进入交付包下载”。
- 保持智能尽调详情页左右滚动稳定。

## 七、验收路径

请按以下路径真实验证：

1. 打开 `/due-diligence`。
2. 进入任意 demo 任务，优先验证 `唐山物桥商贸有限公司`。
3. 推进或切换到 `产物确认` 阶段。
4. 在左侧产物确认 / 报告编辑 Lite 区域看到明显主按钮：

```text
[确认产物并生成交付包]
```

5. 点击该按钮，不应再出现：

```text
store.enterDeliveryPackage is not a function
```

6. 左侧切换到 `交付包下载`。
7. 顶部流程条高亮第 8 节点 `交付包下载`。
8. 右侧助手出现：

```text
[下载完整交付包] [单独下载报告PDF] [返回产物确认]
```

9. 点击「下载完整交付包」，出现模拟下载成功提示和 AI 消息。
10. 点击「单独下载报告PDF」，出现模拟导出 PDF 提示和 AI 消息。
11. 点击「返回产物确认」，左侧回到产物确认，交付包状态不丢失。
12. 执行 `npm run build` 并通过。

## 八、最终回复要求

完成后请说明：

1. `store.enterDeliveryPackage is not a function` 的根因是什么，如何修复。
2. 修改了哪些文件。
3. 交付包入口现在放在哪里。
4. 右侧助手按钮是否仍保留。
5. 点击后是否能切到第 8 节点 `交付包下载`。
6. 交付包下载是否只是 demo 模拟。
7. `npm run build` 是否通过。
8. 是否没有修改工作台、智能报告、智能尽调首页和路由结构。
