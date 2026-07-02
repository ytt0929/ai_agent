# OpenClaw 提示词：Phase 2-C 产物预览收口修复

请读取并严格执行本文件：

`openclaw-workbench-phase2c-preview-fix-prompt.md`

## 背景

当前工作台 Phase 2-C 已经完成大部分内容：

- 尽调模板已改为「尽职调查报告」
- 产物列表第一项已改为「尽职调查报告」
- 报告目录已从 `src/data/mockSmartReport.js` 的 `credit-v2021` 模板读取 15 章
- `DeliverablesArtifact.vue` 已经增加了报告预览抽屉
- `ReportEditorArtifact.vue` 已经增加了底部「章节证据链」入口
- `npm run build` 已通过

现在只做本轮收口修复，不要重写主流程，不要重构状态机，不要修改独立业务模块页面。

## 只允许重点修改的文件

优先只修改：

1. `src/components/workbench/artifacts/DeliverablesArtifact.vue`
2. 必要时少量修改 `src/stores/workbenchAssistant.js`

除非构建失败或类型引用缺失，不要修改其他文件。

不要修改：

- `src/pages/WorkbenchPage.vue` 的主布局
- `src/stores/workbenchAssistant.js` 的 12 阶段主状态机逻辑
- `src/data/mockSmartReport.js`
- 智能筛客、企业探查、智能尽调、税票采集、资料识别、智能报告等独立页面
- 任何路由配置

## 本轮必须修复的问题

### 1. 证据链文件的操作按钮错误

当前 `DeliverablesArtifact.vue` 中按钮逻辑类似：

```vue
<el-button v-if="row.status === '已生成'">查看</el-button>
<el-button v-else>生成</el-button>
```

这会导致 `证据链文件` 状态为 `已归档` 时显示「生成」，不符合要求。

请改成按 `row.type` 和 `row.status` 判断：

- `type === 'report'`：显示「查看」和「编辑」
- `type === 'evidence'` 且 `status === '已归档'`：显示「查看」和「生成」
- 其他 `已生成` 产物：显示「查看」
- 其他未生成产物：显示「生成」

点击「查看」必须调用同一个 `openPreview(row)`，不能跳转页面。

点击「编辑」触发 `emit('edit-report')`。

点击「生成」demo 阶段不需要真实生成文件，可以只展示 Element Plus message，或打开该产物的轻量预览并提示「demo 阶段已模拟生成」。

### 2. 非报告产物预览标题错误

当前预览抽屉标题类似：

```vue
:title="'报告预览：' + (previewItem?.name || '尽职调查报告')"
```

这会导致查看 `工商核验报告`、`税票分析报告`、`证据链文件` 时标题仍可能显示「报告预览：尽职调查报告」。

请新增稳定的 computed：

```js
const previewTitle = computed(() => {
  const item = previewItem.value || selectedPreviewItem.value
  if (!item) return '产物预览'
  return item.type === 'report' ? `报告预览：${item.name}` : `产物预览：${item.name}`
})
```

然后 `el-drawer` 使用：

```vue
:title="previewTitle"
```

### 3. 预览不能覆盖右侧 AI 对话区

当前 `el-drawer direction="rtl" size="60%"` 会从浏览器右侧弹出，容易覆盖右侧 AI Copilot。

业务要求是：产物确认页的「查看」不跳转页面，在左侧当前工作区打开预览，右侧 AI Copilot 保持存在且不被遮挡。

请二选一实现，推荐方案 A：

#### 方案 A（推荐）：把预览做成左侧工作区内嵌预览面板

在 `DeliverablesArtifact.vue` 内部使用 `previewVisible` 控制一个内嵌预览面板，放在产物列表下方或通过 `el-card` 展示：

```text
产物确认 · 已生成
┌──────────────────────────────┐
│ 产物列表                       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 报告预览：尽职调查报告   [关闭] │
│ ┌──────────┬────────────────┐ │
│ │ 报告目录  │ 当前章节正文     │ │
│ └──────────┴────────────────┘ │
│ [进入编辑] [导出报告] [关闭预览] │
└──────────────────────────────┘
```

要求：

- 不使用全屏遮罩
- 不覆盖右侧 AI 对话区
- 面板宽度跟随左侧内容区
- 用 `el-card`、`el-table`、`el-tag`、`el-button`、`el-descriptions` 等 Element Plus 组件

#### 方案 B：保留 drawer，但不能从右侧覆盖 AI

如果保留 `el-drawer`，请至少改为：

```vue
direction="ltr"
size="52%"
modal-class="workbench-left-preview-drawer"
```

并通过样式确保它从左侧内容区视觉上出现，不遮挡右侧 AI。

优先采用方案 A，只有改动风险太大时才用方案 B。

### 4. 报告预览目录必须保持 15 章

报告预览中目录继续使用 `props.data.reportSections`，不能手写 6 章目录。

目录必须来自 `src/data/mockSmartReport.js` 的 `credit-v2021` 模板映射：

1. 履职声明与基本信息
2. 重要说明事项
3. 行内评级及授信情况
4. 申请人基本信息
5. 股权结构及实控人
6. 经营情况
7. 财务状况
8. 收入真实性核实
9. 信用状况
10. 行业地位比较
11. 诉讼与负面信息
12. 主要风险分析
13. 授信额度依据
14. 调查结论与授信方案
15. 附件清单

注意：

- 「章节证据链」不是第 16 章
- 「章节证据链」只作为报告编辑区底部辅助入口

### 5. 产物名称继续保持当前口径

不要改回「尽调底稿」或「标准授信尽调报告」。

产物列表必须保持：

- 尽职调查报告
- 工商核验报告
- 司法查询报告
- 税票分析报告
- 风险诊断报告
- 证据链文件

「报告模板与资料包」区域必须保持：

- 报告模板：尽职调查报告
- 报告底稿：尽职调查报告
- 资料包：工商资料 / 司法查询 / 税票数据 / 上传资料 / 证据链
- 当前状态：底稿已生成，等待确认和编辑

### 6. 样式要求

必须使用项目现有 UI 风格和 Element Plus 组件。

要求：

- 使用 `el-card`、`el-table`、`el-tag`、`el-button`、`el-descriptions`、`el-empty` 等组件
- 优先使用项目已有 CSS token，例如 `var(--text-primary)`、`var(--text-secondary)`、`var(--border-divider)`、`var(--bg-card)`、`var(--bg-page)`、`var(--color-primary)` 等
- 不要新增大量图标
- 不要使用很重的阴影和大圆角
- 不要使用大面积硬编码颜色
- 如果必须兜底颜色，写在 CSS 变量 fallback 中，例如 `var(--bg-card, #fff)`

## 验收标准

请修改后自行验证：

1. `npm run build` 必须通过
2. 产物列表中：
   - `尽职调查报告` 显示「查看」「编辑」
   - `工商核验报告`、`司法查询报告`、`税票分析报告`、`风险诊断报告` 显示「查看」
   - `证据链文件` 显示「查看」「生成」
3. 点击每个「查看」：
   - 不跳转页面
   - 不覆盖右侧 AI Copilot
   - 标题准确显示当前产物名
4. 点击 `尽职调查报告 / 查看`：
   - 预览中出现 15 章目录
   - 可点击章节切换正文
   - 有资料依据、本章证据链、待确认项
   - 底部有「进入编辑」「导出报告」「关闭预览」
5. 点击 `尽职调查报告 / 编辑` 或预览内「进入编辑」：
   - 进入 `ReportEditorArtifact` Lite
   - 目录仍然是 15 章
6. 不要破坏工作台右侧 AI 对话
7. 不要修改独立业务模块页面

## 输出报告格式

完成后请输出：

```text
Phase 2-C Preview Fix 完成报告

1. 修改了哪些文件
2. 产物列表按钮现在如何显示
3. 预览现在是内嵌面板还是 drawer，是否会覆盖右侧 AI
4. 尽职调查报告预览是否保持 15 章
5. npm run build 是否通过
6. 是否修改了独立业务模块
```

