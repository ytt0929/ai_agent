# OpenClaw 提示词：Phase 3-A 智能尽调首页台账收口修复

请读取并严格执行本文件：

`openclaw-due-diligence-phase3a-fix-prompt.md`

## 背景

Phase 3-A 第一版已经完成：

- `/due-diligence` 首页改成任务台账
- 使用了 Element Plus 的 `el-card / el-table / el-dialog / el-form / el-select / el-tag / el-progress`
- 唐山物桥商贸有限公司 demo 任务已加入
- 支持本页新建尽调
- 点击「继续处理」能进入 `/due-diligence/:taskId`
- `npm run build` 已通过

现在只做 Phase 3-A 的收口修复，不要提前进入 Phase 3-B，不要重写详情页。

## 本轮只允许修改

优先修改：

1. `src/pages/DueDiligenceHomePage.vue`
2. `src/stores/dueDiligence.js`
3. `src/data/mockDueDiligence.js`

不要修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/SmartReportPage.vue`
- `src/components/workbench/*`
- 任何独立业务模块页面

## 必须修复的问题

### 1. 修复新建任务的 currentStep 兼容问题

当前 `createManualTask()` 和 `createTaskFromScreening()` 里可能使用了：

```js
currentStep: 'verify'
```

但现有详情页流程阶段使用的是：

```js
'verify-business'
'verify-legal'
'tax-rpa'
'materials'
'evidence'
'risk'
'artifacts'
```

请统一改为：

```js
currentStep: 'verify-business'
currentStage: 'businessVerify'
statusText: '工商核验'
progress: 14
```

适用位置：

- `createManualTask()`
- `createTaskFromScreening()`
- 如果 mock 中还有新建/初始任务使用 `verify`，也改为 `verify-business`

唐山物桥商贸有限公司 demo 任务保持：

```js
currentStep: 'tax-rpa'
currentStage: 'taxCollection'
statusText: '税票采集 / 待授权'
progress: 43
status: '等待客户'
```

不要改唐山物桥的当前阶段。

### 2. 首页补齐来源快捷筛选 tag

当前首页已有状态快捷筛选：

```text
[全部] [进行中] [等待客户] [待确认] [已完成]
```

请补齐来源快捷筛选：

```text
[来自工作台] [本页创建]
```

交互要求：

- 点击「来自工作台」时，设置 `sourceFilter = '工作台AI'`
- 点击「本页创建」时，设置 `sourceFilter = '本页创建'`
- 点击「全部」时，清空 `statusFilter`、`sourceFilter`、`templateFilter`、`activeQuickTag`
- 快捷 tag 的高亮状态要能区分当前筛选

可以用一个统一的 `quickFilter(type, value)`，也可以保留现有方法后扩展。

不要新增复杂 UI，继续使用 `el-tag`。

### 3. 新建任务后应自动定位到任务列表顶部

点击「创建尽调任务」后：

- 如果创建成功，任务置顶
- 清空筛选条件，确保新任务可见
- 可选：把搜索框清空
- 弹出 `ElMessage.success('已创建尽调任务')`

如果已有同名企业：

- 不重复创建
- 清空筛选条件，确保已有任务可见
- 弹出 `ElMessage.info('该企业已有尽调任务，已为你定位到任务列表')`

### 4. 任务列表按钮文案更准确

当前操作按钮可能直接显示 `row.nextAction`，导致出现「编辑报告」「查看报告」等和按钮动作不一致的情况。

请用函数统一计算操作文案：

```js
function getTaskActionLabel(row) {
  if (row.status === '等待客户') return '继续处理'
  if (row.status === '进行中') return '继续处理'
  if (row.status === '待确认') return '编辑报告'
  if (row.status === '已完成') return '查看报告'
  return '查看任务'
}
```

点击动作仍统一进入详情页：

```js
store.selectTask(row.id)
router.push(`/due-diligence/${row.id}`)
```

### 5. 保持 Element Plus 和 token.css 样式

本轮不要重新设计 UI。

必须保持：

- 主任务列表使用 `el-table`
- 新建任务使用 `el-dialog + el-form`
- 筛选使用 `el-input / el-select / el-tag`
- 统计使用 `el-card`
- 样式继续引用 `src/styles/tokens.css` 变量

不要：

- 不要重新手写原生 table
- 不要引入新视觉风格
- 不要大量硬编码颜色
- 不要修改全局 `tokens.css`

## 验收标准

完成后请验证：

1. `npm run build` 必须通过
2. `/due-diligence` 首页仍是任务台账
3. 唐山物桥商贸有限公司仍显示：
   - 状态：等待客户
   - 来源：工作台AI
   - 阶段：税票采集 / 待授权
   - 进度：43%
4. 新建任务和筛客转入任务的 `currentStep` 是 `verify-business`，不是 `verify`
5. 首页快捷筛选包含：
   - 全部
   - 进行中
   - 等待客户
   - 待确认
   - 已完成
   - 来自工作台
   - 本页创建
6. 点击「来自工作台」只显示工作台AI来源任务
7. 点击「本页创建」只显示本页创建来源任务
8. 点击「全部」清空所有快捷筛选
9. 点击任务操作按钮仍能进入 `/due-diligence/:taskId`
10. 没有修改 `DueDiligenceTaskPage.vue`、工作台、智能报告、独立业务模块

## 输出报告格式

完成后请输出：

```text
Phase 3-A Fix 完成报告

1. 修改了哪些文件
2. currentStep 兼容问题是否修复
3. 来源快捷筛选是否补齐
4. 新建任务后是否能定位并显示
5. 任务操作按钮文案如何计算
6. npm run build 是否通过
7. 是否修改了详情页/工作台/智能报告等非本阶段模块
```

