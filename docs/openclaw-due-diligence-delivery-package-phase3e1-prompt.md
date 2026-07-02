# OpenClaw 提示词：Phase 3-E-1 智能尽调详情新增第 8 节点「交付包下载」

请先阅读：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- `src/components/workbench/artifacts/DeliverablesArtifact.vue`

## 本阶段目标

Phase 3-E 是交付包下载。本阶段只做 E-1：

```text
智能尽调详情页新增第 8 个节点：交付包下载
```

流程从：

```text
工商核验 → 司法查询 → 税票采集 → 资料补充 → 证据整合 → 风险诊断 → 产物确认
```

调整为：

```text
工商核验 → 司法查询 → 税票采集 → 资料补充 → 证据整合 → 风险诊断 → 产物确认 → 交付包下载
```

产物确认阶段负责确认报告草稿、风险结论、授信建议。

交付包下载阶段负责展示完整交付目录，并模拟下载完整交付包或单份 PDF 报告。

## 重要边界

本阶段只做智能尽调详情页主节点，不做其他端入口：

- 不改工作台。
- 不改智能报告。
- 不改智能尽调首页台账下载按钮，那是 Phase 3-E-2。
- 不做工作台轻量交付包入口，那是 Phase 3-E-3。
- 不做智能报告关联交付包入口，那是 Phase 3-E-4。
- 不真实生成 zip。
- 不真实导出 PDF。
- 不改路由结构。
- 不改 `token.css`。

## 允许修改文件

优先只改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`

如果确实需要独立组件，可以新增：

- `src/components/workbench/artifacts/DeliveryPackageArtifact.vue`

不建议把交付包下载内容塞进 `DeliverablesArtifact.vue`，因为「产物确认」和「交付包下载」是两个阶段。

## 具体实现要求

### 1. 增加第 8 节点

请把智能尽调详情页和 store 中的阶段补齐：

```js
{ key: 'delivery-package', label: '交付包下载' }
```

同时更新相关状态：

```js
currentStep: 'delivery-package'
currentStage: 'delivery-package'
statusText: '交付包下载'
status: '已完成' 或 '待下载'
progress: 100
deliveryPackageStatus: '已生成'
```

注意：产物确认阶段也可以是 100%，但当前 active 节点应能区分 `artifacts` 和 `delivery-package`。

### 2. 从产物确认进入交付包下载

在产物确认阶段提供动作：

```text
[确认产物] 或 [生成交付包]
```

点击后：

- 当前阶段切换到 `delivery-package`
- 左侧展示交付包下载内容
- 右侧尽调助手追加消息

推荐话术：

```text
我：确认产物，生成交付包
AI：报告和待确认项已确认。我已整理完整尽调交付包，包含尽调报告、阶段报告、证据链文件和原始资料包。
```

如果当前 `DeliverablesArtifact.vue` 没有「确认产物 / 生成交付包」事件，可以在 `DueDiligenceTaskPage.vue` 的右侧快捷动作中提供。

### 3. 交付包下载左侧内容

左侧展示完整交付目录，建议新建 `DeliveryPackageArtifact.vue`，使用 Element Plus 组件和项目 token 风格。

内容：

```text
交付包下载 · 唐山物桥商贸有限公司

交付包状态：已生成
包名：唐山物桥商贸有限公司_尽调交付包_20260702.zip
生成时间：2026-07-02 15:40

交付目录

1. 尽调报告
   ✓ 尽职调查报告.pdf
   ✓ 尽职调查报告.docx / 可编辑草稿

2. 阶段报告
   ✓ 工商核验报告.pdf
   ✓ 司法查询报告.pdf
   ✓ 税票分析报告.pdf
   ✓ 资料识别报告.pdf
   ✓ 风险诊断报告.pdf

3. 证据链文件
   ✓ 企业基础资料证据链.xlsx
   ✓ 风险事项证据链.pdf
   ✓ 税票数据证据链.xlsx
   ✓ 资料完整性清单.xlsx

4. 原始资料包
   ✓ 营业执照.pdf
   ✓ 纳税申报表.pdf
   ✓ 发票明细.xlsx
   ✓ 合同文件.pdf
   ✓ 上传资料.zip
```

按钮：

```text
[下载完整交付包] [单独下载报告PDF] [返回产物确认]
```

### 4. 下载动作

Demo 阶段只模拟，不真实下载。

点击「下载完整交付包」：

```text
AI：正在生成「唐山物桥商贸有限公司_尽调交付包_20260702.zip」。
AI：交付包已生成。demo 阶段已模拟下载完成。
```

同时可以使用：

```js
ElMessage.success('交付包已生成，demo 阶段模拟下载完成')
```

点击「单独下载报告PDF」：

```text
AI：已模拟导出「尽职调查报告.pdf」。正式环境将由后端渲染 PDF。
```

点击「返回产物确认」：

- `selectedStageKey = 'artifacts'`
- 左侧回到产物确认
- 不改变已生成交付包状态

### 5. 右侧尽调助手快捷动作

当 `selectedStageKey === 'delivery-package'` 时，右侧快捷动作应为：

```text
[下载完整交付包] [单独下载报告PDF] [返回产物确认]
```

当 `selectedStageKey === 'artifacts'` 时，右侧快捷动作应包含进入交付包下载的动作，例如：

```text
[编辑报告] [同步到智能报告] [生成交付包]
```

不要移除已有的编辑报告 / 同步到智能报告能力。

### 6. 自然语言输入

右侧输入框支持简单关键词：

```text
下载 / 交付包 / zip → 下载完整交付包
pdf / 报告pdf → 单独下载报告PDF
返回 / 产物确认 → 返回产物确认
```

### 7. 数据结构建议

可在任务对象上补充：

```js
deliveryPackageStatus: '已生成',
deliveryPackageName: '唐山物桥商贸有限公司_尽调交付包_20260702.zip',
deliveryPackageGeneratedAt: '2026-07-02 15:40',
deliveryPackageDownloaded: false
```

下载完整交付包后：

```js
deliveryPackageDownloaded = true
deliveryPackageDownloadedAt = 当前时间
```

## UI 和样式要求

- 必须使用 Element Plus 组件。
- 样式使用项目 token 变量，例如 `var(--surface-card)`、`var(--border-default)`、`var(--text-primary)`。
- 不要大量使用图标，不要造花哨图形。
- 左侧内容要比普通表格丰富：状态摘要 + 交付目录 + 操作按钮。
- 保持智能尽调详情页左右布局和滚动条稳定。

## 验收路径

1. 进入 `/due-diligence`。
2. 打开 `唐山物桥商贸有限公司` 任务。
3. 进入或切换到 `产物确认`。
4. 点击「生成交付包」或「确认产物」。
5. 流程条出现第 8 节点「交付包下载」，并高亮该节点。
6. 左侧展示完整交付目录。
7. 右侧快捷动作出现：
   `[下载完整交付包] [单独下载报告PDF] [返回产物确认]`
8. 点击「下载完整交付包」，出现模拟下载成功提示和 AI 消息。
9. 点击「单独下载报告PDF」，出现模拟导出 PDF 提示和 AI 消息。
10. 点击「返回产物确认」，左侧回到产物确认。
11. `npm run build` 通过。

## 最终回复要求

完成后请说明：

1. 修改了哪些文件。
2. 是否新增第 8 节点「交付包下载」。
3. 产物确认如何进入交付包下载。
4. 左侧交付目录包含哪些内容。
5. 下载完整交付包和单独下载 PDF 是否为模拟。
6. 是否没有修改工作台、智能报告和智能尽调首页。
7. `npm run build` 是否通过。
