# OpenClaw 提示词：Phase 3-E-4 智能报告关联尽调交付包

请先阅读以下文件，再开始修改：

1. `docs/workbench-due-diligence-workspace-discussion.md`
2. `src/pages/SmartReportPage.vue`
3. `src/data/mockSmartReport.js`
4. `src/stores/dueDiligence.js`

## 本阶段目标

在「智能报告」的报告编辑页中，补齐和「智能尽调交付包」的关联能力。

当前链路已经是：

```text
工作台 / 智能尽调
  -> 生成尽调报告草稿
  -> 智能报告深度编辑
  -> 智能尽调产物确认
  -> 交付包下载
```

现在要让用户在「智能报告」里编辑报告时，也能明确看到：

```text
这份报告来自哪个智能尽调任务
该尽调任务是否已经生成交付包
交付包里包含哪些内容
可以模拟下载交付包
必要时可以手动进入智能尽调详情页查看完整交付包
```

注意：本阶段不是重做智能报告，也不是重做智能尽调，只是在智能报告编辑页补一条「关联交付包」通路。

## 严格边界

只允许修改：

1. `src/pages/SmartReportPage.vue`
2. 必要时只读 `src/stores/dueDiligence.js`
3. 必要时只读 `src/data/mockSmartReport.js`

不要修改：

1. `src/stores/workbenchAssistant.js`
2. `src/pages/WorkbenchPage.vue`
3. `src/pages/DueDiligenceTaskPage.vue`
4. `src/pages/DueDiligenceHomePage.vue`
5. `src/components/workbench/artifacts/*.vue`
6. `src/router/*`
7. `src/styles/token.css`

不要新增真实下载、真实 PDF、真实 ZIP 生成逻辑。所有下载都是 demo 模拟。

不要把页面中文改乱码。不要大范围重写已有中文内容，只做最小必要增量。

## UI 要求

必须使用 Element Plus 组件：

- `el-tag`
- `el-button`
- `el-drawer` 或 `el-card`
- `el-descriptions`
- `el-tree` 或 `el-table`
- `ElMessage`

样式必须沿用项目现有风格和 `token.css` 变量：

- `var(--surface-card)`
- `var(--border-default)`
- `var(--text-primary)`
- `var(--text-secondary)`
- `var(--text-tertiary)`
- `var(--color-primary)`
- `var(--color-success)`
- `var(--color-warning)`
- `var(--space-*)`
- `var(--radius-*)`
- `var(--font-size-*)`

不要使用大量 icon，不要用花哨卡片，不要改变全局布局。

## 具体改动

### 1. 在 `SmartReportPage.vue` 引入智能尽调 store

在 `<script setup>` 中增加：

```js
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
```

并创建：

```js
const dueStore = useDueDiligenceStore()
```

### 2. 根据 `activeReport.dueTaskId` 找关联尽调任务

新增 computed：

```js
const relatedDueTask = computed(() => {
  if (!activeReport.value?.dueTaskId) return null
  return dueStore.tasks.find(t => t.id === activeReport.value.dueTaskId) || null
})
```

新增 computed：

```js
const relatedDeliveryStatus = computed(() => {
  const task = relatedDueTask.value
  if (!task) return { label: '未关联', type: 'info' }
  if (task.deliveryPackageDownloaded) return { label: '已下载', type: 'success' }
  if (task.deliveryPackageStatus === '已生成' || task.currentStep === 'delivery-package') {
    return { label: '已生成', type: 'success' }
  }
  if (task.currentStep === 'artifacts') return { label: '待生成', type: 'warning' }
  return { label: '未生成', type: 'info' }
})
```

### 3. 在报告编辑页 header 增加交付包状态和入口

位置：`view === 'editor'` 下的 `.sr-editor__header`。

当前 header 已显示：

```text
企业名称 / 报告名称 / 模板 / 来源 / 资料完整度 / 待确认 / 状态
```

请在这里补充：

```text
关联尽调：有/无
交付包：已生成/已下载/待生成/未生成
```

建议 UI：

```vue
<el-tag v-if="activeReport?.dueTaskId" size="small" type="primary" effect="plain">
  关联尽调
</el-tag>
<el-tag v-if="activeReport?.dueTaskId" size="small" :type="relatedDeliveryStatus.type" effect="plain">
  交付包{{ relatedDeliveryStatus.label }}
</el-tag>
```

在 `.sr-editor__actions` 中新增一个按钮：

```text
[查看关联交付包]
```

按钮规则：

- 只有 `activeReport.dueTaskId` 存在时显示。
- 点击后打开交付包预览抽屉或内嵌面板。
- 不要自动跳转智能尽调详情页。

### 4. 新增「关联交付包」预览抽屉

推荐使用 `el-drawer`，宽度 520px，从右侧弹出。

抽屉标题：

```text
关联尽调交付包
```

内容结构：

```text
企业名称：唐山物桥商贸有限公司
关联尽调任务：dd-ts-wq-001
报告名称：尽职调查报告
交付包状态：已生成 / 已下载 / 待生成 / 未生成
交付包名称：唐山物桥商贸有限公司_尽调交付包_20260702.zip
生成时间：2026-07-02 15:40

交付目录摘要
├─ 尽调报告
│  ├─ 尽职调查报告.pdf
│  └─ 尽职调查报告.docx / 可编辑草稿
├─ 阶段报告
│  ├─ 工商核验报告.pdf
│  ├─ 司法查询报告.pdf
│  ├─ 税票分析报告.pdf
│  ├─ 资料识别报告.pdf
│  └─ 风险诊断报告.pdf
├─ 证据链文件
│  ├─ 企业基础资料证据链.xlsx
│  ├─ 风险事项证据链.pdf
│  ├─ 税票数据证据链.xlsx
│  └─ 资料完整性清单.xlsx
└─ 原始资料包
   ├─ 营业执照.pdf
   ├─ 纳税申报表.pdf
   ├─ 发票明细.xlsx
   ├─ 合同文件.pdf
   └─ 上传资料.zip
```

底部按钮：

```text
[模拟下载交付包] [进入智能尽调详情] [关闭]
```

按钮行为：

1. `模拟下载交付包`
   - 如果没有关联任务，`ElMessage.warning('未找到关联尽调任务')`
   - 如果交付包未生成，`ElMessage.warning('交付包尚未生成，请先在智能尽调中完成产物确认')`
   - 如果已生成，调用 `dueStore.downloadDeliveryPackageFromHome(relatedDueTask.value.id)`
   - 成功后 `ElMessage.success('已模拟下载关联尽调交付包')`
   - 不真实下载文件。

2. `进入智能尽调详情`
   - 只有用户主动点击才跳转。
   - 使用现有 router：
     ```js
     router.push('/due-diligence/' + relatedDueTask.value.id)
     ```
   - 不要自动跳转。

3. `关闭`
   - 关闭抽屉。

### 5. 无关联任务时的兜底

如果当前报告没有 `dueTaskId`：

- 不显示「查看关联交付包」按钮。
- 不影响已有导出报告、导出报告和资料包、提交确认等按钮。

如果有 `dueTaskId` 但找不到任务：

- 点击「查看关联交付包」时可以打开抽屉，但显示：

```text
未找到关联智能尽调任务，请从智能尽调任务台账确认任务是否存在。
```

### 6. 不要替换现有导出功能

智能报告已有：

```text
保存草稿
按新模板生成
导出报告
导出报告和资料包
提交确认
```

这些按钮全部保留，不要改掉原行为。

新增的「查看关联交付包」是补充入口，不替代原有按钮。

### 7. 验收路径

请完成后手动检查：

1. 打开智能报告首页。
2. 找到来源为「智能尽调」的唐山物桥报告。
3. 点击「打开」或从智能尽调跳转进入编辑器。
4. 编辑器 header 应显示：
   - 来源：智能尽调
   - 关联尽调
   - 交付包已生成/已下载/未生成
5. 点击「查看关联交付包」。
6. 能看到交付包摘要目录。
7. 点击「模拟下载交付包」后有成功提示。
8. 再次打开抽屉，状态能显示「已下载」。
9. 点击「进入智能尽调详情」才跳转，不点击不跳转。
10. `npm run build` 必须通过。

## 输出要求

完成后请汇报：

1. 修改了哪些文件。
2. 智能报告编辑页新增了哪些交付包信息。
3. 交付包预览是 drawer 还是内嵌面板。
4. 模拟下载是否只更新前端状态。
5. 是否没有修改工作台和智能尽调主流程。
6. `npm run build` 是否通过。
