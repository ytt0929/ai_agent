# OpenClaw 提示词：Phase 2-D 产物确认三态改造

请读取并严格执行本文件：

`openclaw-workbench-phase2d-three-state-report-preview-prompt.md`

## 背景

当前工作台产物确认页中，点击「尽职调查报告 / 查看」后反馈不明显。之前尝试过内嵌面板或抽屉，但产品上最终确定：

> 尽职调查报告是长文档，不适合放在小抽屉里，也不适合在产物列表下方很深的位置展开。  
> 点击「查看」后，左侧业务工作区应整区切换为「报告预览态」。  
> 点击「编辑」后，左侧业务工作区应整区切换为「报告编辑态」。  
> 右侧 AI Copilot 始终保留，不被遮挡。

请先阅读需求文档中的新增章节：

`docs/workbench-due-diligence-workspace-discussion.md`

重点阅读：

```text
## 12. 产物确认、报告预览与报告编辑的三态交互
```

## 只允许重点修改

优先只修改：

1. `src/components/workbench/artifacts/DeliverablesArtifact.vue`

如确实需要触发外部编辑事件，可以保持现有 emit：

- `edit-report`
- `export-report`
- `start-monitor`

不要修改：

- `src/pages/WorkbenchPage.vue` 主布局
- `src/stores/workbenchAssistant.js` 主状态机
- 智能尽调、智能报告、税票采集等独立业务页面
- 路由
- `src/data/mockSmartReport.js`

## 当前必须先修复的问题

请检查 `DeliverablesArtifact.vue` 是否出现异常中文或模板损坏，例如：

```vue
宸茬敓鎴?/el-tag>
label="鐘舵€? width="90"
{{ section.no }}銆亄{ section.title }}
```

如果存在，必须修正为正常中文和合法 Vue 模板。

示例：

```vue
<span class="artifact-card__title">尽调产物</span>
<el-tag type="success" size="small">已生成</el-tag>
<el-table-column label="状态" width="90" align="center">
<h3>{{ section.no }}、{{ section.title }}</h3>
```

所有展示文案必须是正常中文，不要出现乱码。

## 目标交互：三态切换

在 `DeliverablesArtifact.vue` 内部实现一个局部状态，例如：

```js
const viewMode = ref('list')
// list | reportPreview | reportEdit
```

### 状态 1：list 产物确认列表态

默认显示产物确认列表：

```text
产物确认列表态
  ├─ 查看尽职调查报告 → reportPreview
  ├─ 编辑尽职调查报告 → reportEdit 或 emit('edit-report')
  └─ 查看其他产物 → 当前页轻量预览 / 小面板
```

列表必须包含：

- 尽职调查报告：查看 / 编辑
- 工商核验报告：查看
- 司法查询报告：查看
- 税票分析报告：查看
- 风险诊断报告：查看
- 证据链文件：查看 / 生成

### 状态 2：reportPreview 报告预览态

点击「尽职调查报告 / 查看」后，不要打开浏览器右侧 drawer，不要在列表下方很深处展开。

应整区切换为报告预览：

```text
← 返回产物确认        报告预览：尽职调查报告

唐山物桥商贸有限公司   商贸流通   综合评分 72   C+   中风险   资料完整度 86%

┌────────────── 报告目录 ──────────────┬──────────── PDF 文档页 ─────────┐
│ 一  履职声明与基本信息       已完成   │           尽职调查报告           │
│ 二  重要说明事项             待确认   │ 企业名称：唐山物桥商贸有限公司    │
│ 三  行内评级及授信情况       待确认   │ 报告模板：尽职调查报告            │
│ ...                                  │ 摘要 / 正文 / 资料依据 / 证据链    │
│ 十五 附件清单                已完成   │                                │
└──────────────────────────────────────┴────────────────────────────────┘

[进入编辑] [导出报告] [返回产物确认]
```

要求：

- 预览态占用左侧业务工作区，不覆盖右侧 AI Copilot
- 15 章目录必须来自 `props.data.reportSections`
- 文档页要像 PDF/Word 文档预览：白底、正文排版、标题、摘要、章节
- 正文语言要正式，不要出现 mock、demo、模拟等字样
- 返回按钮将 `viewMode` 改回 `list`
- 进入编辑可以选择：
  - 如果在本组件内实现轻编辑，则 `viewMode = 'reportEdit'`
  - 如果已有外部 `ReportEditorArtifact`，则继续 `emit('edit-report')`

### 状态 3：reportEdit 报告编辑态

如果本轮不想重写编辑器，可以先保留现有 `emit('edit-report')` 进入外部 ReportEditorArtifact。

但如果在本组件内做轻量编辑态，必须符合：

```text
← 返回产物确认        报告编辑：尽职调查报告

左侧：15 章报告目录
右侧：当前章节正文 textarea / 资料依据 / 证据链 / 待确认项

[保存草稿] [根据资料重新生成本节] [预览报告] [导出最终报告]
```

本轮优先级：

1. 先保证 reportPreview 正常可见
2. 编辑可继续走已有 `emit('edit-report')`
3. 不强制在 DeliverablesArtifact 内重写完整编辑器

## 非报告产物预览

非报告产物不要整区切换成复杂文档。

以下产物点击「查看」可以显示轻量结构化预览：

- 工商核验报告
- 司法查询报告
- 税票分析报告
- 风险诊断报告
- 证据链文件

轻量预览可以在 list 态下用 `el-card` 展示在产物表格下方，或用一个较小的内嵌详情区。不要覆盖右侧 AI。

## 样式硬性要求

必须符合项目全局样式体系：

1. 组件必须使用 Element Plus：
   - `el-card`
   - `el-table`
   - `el-tag`
   - `el-button`
   - `el-descriptions`
   - `el-divider`
   - `el-input`
   - `el-scrollbar`

2. CSS 必须优先使用 `src/styles/tokens.css` 中的 token：

```css
var(--color-primary)
var(--color-primary-bg)
var(--color-primary-border)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--bg-card)
var(--bg-page)
var(--border-color)
var(--border-divider)
var(--border-light)
var(--radius-md)
var(--space-sm)
var(--space-md)
var(--space-lg)
var(--font-size-sm)
var(--font-size-body)
var(--font-size-lg)
```

3. 禁止：

- 大面积硬编码颜色
- 大面积渐变
- 装饰性大图标
- 大圆角卡片
- 重阴影
- 把报告预览做成营销页
- 使用全屏遮罩覆盖 AI Copilot

4. 文档预览样式：

- 像后台系统中的 PDF/Word 文档预览
- 白色文档页放在浅色工作区
- 字号、行距、边框都要克制
- 报告目录窄栏 + 文档正文宽栏
- 支持滚动阅读

## 建议实现结构

```vue
<template>
  <div class="artifact-deliverables">
    <template v-if="viewMode === 'list'">
      <!-- 产物列表态 -->
    </template>

    <template v-else-if="viewMode === 'reportPreview'">
      <!-- 报告预览态 -->
    </template>
  </div>
</template>
```

建议方法：

```js
function viewReport(row) {
  previewItem.value = row
  activePreviewChapter.value = 'c1'
  viewMode.value = 'reportPreview'
}

function backToList() {
  viewMode.value = 'list'
}

function editReport() {
  emit('edit-report')
}
```

不要依赖 `scrollIntoView` 来让用户发现预览。点击查看后应直接切换视图，用户立即看到报告预览。

## 验收标准

请修改后验证：

1. `npm run build` 必须通过
2. 打开工作台产物确认页
3. 点击「尽职调查报告 / 查看」
4. 左侧业务工作区立即切换为「报告预览：尽职调查报告」
5. 预览中有：
   - 返回产物确认
   - 企业摘要信息
   - 15 章目录
   - PDF/Word 样式文档页
   - 封面信息
   - 摘要
   - 章节正文
   - 资料依据
   - 证据链
   - 待确认项
   - 进入编辑 / 导出报告 / 返回产物确认
6. 点击「返回产物确认」回到列表
7. 点击「编辑」仍能进入报告编辑
8. 右侧 AI Copilot 不被覆盖
9. 非报告产物查看仍可用
10. 页面无控制台错误
11. 文件中不要出现乱码
12. 样式使用 Element Plus + token.css，不能自由新增一套视觉体系

## 输出报告格式

完成后请输出：

```text
Phase 2-D Three State Report Preview 完成报告

1. 修改了哪些文件
2. 是否修复 DeliverablesArtifact.vue 中文/模板问题
3. 是否实现 list / reportPreview 三态中的前两态
4. 点击「尽职调查报告 / 查看」后是否立即整区切换
5. 报告预览是否保留 15 章目录和文档页样式
6. 编辑是否仍可进入 ReportEditorArtifact
7. 非报告产物查看是否仍可用
8. 样式是否使用 Element Plus + token.css
9. npm run build 是否通过
10. 是否修改了独立业务模块
```

