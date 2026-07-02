# OpenClaw 提示词：Phase 3-E-2 智能尽调首页台账增加交付包状态和下载按钮

请先阅读并对齐以下文件：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/pages/DueDiligenceHomePage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/components/workbench/artifacts/DeliveryPackageArtifact.vue`

## 当前阶段目标

Phase 3-E-1 已完成：智能尽调详情页已经有第 8 节点「交付包下载」，并且详情页可以模拟下载完整交付包和单独下载报告 PDF。

本阶段只做 Phase 3-E-2：

```text
智能尽调首页台账增加交付包状态和下载按钮。
```

智能尽调首页是任务台账，不负责展示完整交付包目录，也不负责编辑报告。它只需要让客户经理在列表里快速识别：

- 哪些任务还在流程中
- 哪些任务报告待确认
- 哪些任务已经生成交付包
- 哪些任务交付包已经下载
- 哪些任务可以直接从首页模拟下载交付包

## 重要边界

本阶段只允许修改：

- `src/pages/DueDiligenceHomePage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`

必要时可小改：

- `src/pages/DueDiligenceTaskPage.vue`，仅用于确认字段兼容，不要重写详情页。

不要修改：

- 工作台页面和工作台 store
- 智能报告页面
- 详情页交付包主体流程
- `DeliveryPackageArtifact.vue` 已验收的结构
- 路由结构
- `token.css`
- 全局导航

## 产品逻辑

智能尽调详情页是主流程处理处：

```text
产物确认 → 交付包下载 → 下载完整交付包 / 单独下载报告 PDF
```

智能尽调首页是台账视角：

```text
任务列表
  ├─ 未到产物确认：继续处理
  ├─ 产物确认：确认报告
  ├─ 交付包已生成：下载交付包
  └─ 交付包已下载：查看记录 / 再次下载
```

首页不要做复杂交付包目录。完整目录仍然在详情页第 8 节点中展示。

## 一、补齐 mock 数据

请在 `src/data/mockDueDiligence.js` 中确保至少有一个 demo 任务处于交付包状态。

建议把 `唐山物桥商贸有限公司` 或新增一条任务设置为：

```js
{
  currentStep: 'delivery-package',
  currentStage: 'delivery-package',
  progress: 100,
  status: '已完成',
  statusText: '交付包已生成',
  deliveryPackageStatus: '已生成',
  deliveryPackageName: '唐山物桥商贸有限公司_尽调交付包_20260702.zip',
  deliveryPackageGeneratedAt: '2026-07-02 15:40',
  deliveryPackageDownloaded: false,
  reportDraftId: 'RPT-TS-WQ'
}
```

同时保留其他状态的任务，用于列表对比：

```text
唐山物桥商贸有限公司：交付包已生成，可下载
杭州智造装备有限公司：资料补充 / 继续处理
宁波天合新材料股份有限公司：产物确认 / 确认报告
温州瑞达机械制造有限公司：已完成 / 可查看记录
```

不要把所有任务都改成完成态。

## 二、store 增加首页下载能力

请在 `src/stores/dueDiligence.js` 中提供首页可用的方法：

```js
function downloadDeliveryPackageFromHome(taskId) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return { ok: false, reason: 'not_found' }
  if (task.currentStep !== 'delivery-package' && task.deliveryPackageStatus !== '已生成') {
    return { ok: false, reason: 'not_ready' }
  }

  task.deliveryPackageDownloaded = true
  task.deliveryPackageDownloadedAt = new Date().toLocaleString('zh-CN')
  task.updatedAt = new Date().toLocaleString('zh-CN')

  return {
    ok: true,
    task,
    packageName: task.deliveryPackageName || `${task.name}_尽调交付包_20260702.zip`
  }
}
```

并从 setup store 的 `return { ... }` 中导出。

如果已有类似方法，可以复用 `markDeliveryPackageDownloaded(taskId)`，但首页最好有一个语义更清楚的方法，便于后续维护。

## 三、首页台账增加交付包状态列

在 `src/pages/DueDiligenceHomePage.vue` 的任务列表 `el-table` 中增加一列：

```text
交付包
```

展示规则：

```text
deliveryPackageStatus === '已生成' && !deliveryPackageDownloaded
  显示：已生成
  tag: success

deliveryPackageDownloaded === true
  显示：已下载
  tag: info / success

currentStep === 'artifacts'
  显示：待生成
  tag: warning

其他
  显示：未生成
  tag: info
```

建议实现为一个小方法：

```js
function getDeliveryStatus(row) {
  if (row.deliveryPackageDownloaded) return { label: '已下载', type: 'success' }
  if (row.deliveryPackageStatus === '已生成' || row.currentStep === 'delivery-package') return { label: '已生成', type: 'success' }
  if (row.currentStep === 'artifacts') return { label: '待生成', type: 'warning' }
  return { label: '未生成', type: 'info' }
}
```

## 四、首页操作列按任务状态区分

当前操作列只有一个按钮，可能都是「继续处理」。请改成根据任务状态给出不同按钮。

建议规则：

```text
如果交付包已生成：
  主按钮：[下载交付包]
  次按钮：[查看详情]

如果交付包已下载：
  主按钮：[再次下载]
  次按钮：[查看详情]

如果 currentStep === 'artifacts'：
  主按钮：[确认报告]

其他：
  主按钮：[继续处理]
```

点击行为：

### 下载交付包 / 再次下载

不跳转详情页，直接在首页模拟下载：

```js
const result = store.downloadDeliveryPackageFromHome(row.id)
if (result.ok) {
  ElMessage.success(`已模拟下载 ${result.packageName}`)
} else {
  ElMessage.warning('交付包尚未生成，请进入任务详情处理')
}
```

### 查看详情 / 继续处理 / 确认报告

仍然进入详情页：

```js
continueTask(row)
```

注意：不要新增跳转到工作台。

## 五、首页筛选能力补强

在快捷筛选区增加一个轻量筛选标签：

```text
[交付包已生成]
```

点击后只展示：

```js
row.deliveryPackageStatus === '已生成' || row.currentStep === 'delivery-package'
```

如果实现成本低，可以再加：

```text
[交付包已下载]
```

但本阶段必须至少有 `[交付包已生成]`。

不要复杂化筛选逻辑，不要引入新组件库。

## 六、UI 要求

- 必须使用 Element Plus 组件，例如 `el-table`、`el-tag`、`el-button`、`ElMessage`。
- 样式必须沿用项目现有风格和 `token.css` 变量。
- 不要大量使用图标。
- 不要把首页改成新的大屏或卡片流。
- 仍然保持“任务台账”的信息密度。
- 按钮文案必须清晰，避免只写「处理」。
- 不要造成中文乱码。

## 七、验收路径

请按以下路径自测：

1. 打开 `/due-diligence`。
2. 首页任务列表中能看到新列「交付包」。
3. 至少一个任务显示「已生成」，操作列显示「下载交付包」。
4. 点击「下载交付包」，不跳转页面，弹出模拟下载成功提示。
5. 下载后该任务交付包状态变成「已下载」。
6. 点击「再次下载」仍可模拟下载。
7. 点击「查看详情」进入智能尽调详情页，对应任务仍能看到第 8 节点交付包下载。
8. 点击快捷筛选「交付包已生成」，列表只显示交付包已生成或已下载的任务。
9. `npm run build` 通过。

## 八、最终回复要求

完成后请说明：

1. 修改了哪些文件。
2. 首页是否新增「交付包」状态列。
3. 首页操作列如何区分「继续处理 / 确认报告 / 下载交付包 / 再次下载」。
4. 是否支持首页直接模拟下载交付包。
5. 是否保留进入详情页查看完整交付目录。
6. 是否未修改工作台、智能报告、详情页主体流程和路由结构。
7. `npm run build` 是否通过。
