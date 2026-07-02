# OpenClaw 提示词：Phase 3-F-1 工作台左侧产物区 UI 统一

请先阅读以下文件，再开始修改：

1. `docs/workbench-due-diligence-workspace-discussion.md`
2. `src/pages/WorkbenchPage.vue`
3. `src/components/workbench/WorkbenchBusinessPanel.vue`
4. `src/components/workbench/artifacts/*.vue`
5. `src/styles/token.css`

## 本阶段目标

统一「工作台」二级对话页面左侧业务结果区 / 尽调工作区的所有产物组件 UI。

当前工作台流程已经基本打通，不要再重做流程。本阶段只处理左侧展示区的视觉一致性、Element Plus 组件化、token.css 规范和滚动/容器稳定性。

工作台左侧产物区需要看起来像一套统一的产品工作区，而不是多个临时 demo 页面拼在一起。

## 严格边界

只允许修改：

1. `src/components/workbench/artifacts/*.vue`
2. 如确实需要，可以极小范围修改 `src/components/workbench/WorkbenchBusinessPanel.vue` 的容器样式

不要修改：

1. `src/stores/workbenchAssistant.js`
2. `src/pages/WorkbenchPage.vue`
3. `src/stores/dueDiligence.js`
4. `src/pages/DueDiligenceTaskPage.vue`
5. `src/pages/DueDiligenceHomePage.vue`
6. `src/pages/SmartReportPage.vue`
7. `src/router/*`
8. `src/styles/token.css`

不要新增路由。

不要改业务数据结构。

不要改任何流程推进函数。

不要改任何现有 `emit` 名称和事件含义。

不要把页面中文改乱码。不要用脚本批量重写中文内容。

## 必须保留的交互事件

修改组件 UI 时，必须保留所有现有 `defineEmits` 和触发点，包括但不限于：

```text
explore
select-template
start-monitor
start-due
confirm-tax-send
tax-authorized
enter-materials
send-material-list
mock-material-upload
enter-evidence
enter-risk
view-diagnosis-report
sync-report
enter-deliverables
edit-report
export-report
generate-delivery-package
confirm-and-generate
send-reminder
switch-to-upload
download-qr
mock-download
view-list
```

如果某个组件现在已经发出这些事件，改 UI 后必须还能发出。

## UI 统一原则

### 1. 统一组件结构

每个 artifact 尽量遵循以下结构：

```text
┌──────────────────────────────────────────┐
│ 顶部摘要区                                │
│ 标题 / 状态 tag / 关键说明                 │
├──────────────────────────────────────────┤
│ 核心指标区                                │
│ 2-4 个指标卡 / progress / 状态摘要          │
├──────────────────────────────────────────┤
│ 明细内容区                                │
│ el-table / el-descriptions / el-alert      │
├──────────────────────────────────────────┤
│ 底部操作区                                │
│ 主要按钮在右侧或底部，不能溢出容器           │
└──────────────────────────────────────────┘
```

不是每个节点都必须四段齐全，但视觉节奏要一致。

### 2. 统一 Element Plus 使用

优先使用：

```text
el-card
el-table
el-table-column
el-tag
el-descriptions
el-descriptions-item
el-progress
el-alert
el-button
el-row
el-col
el-empty
el-collapse
el-collapse-item
```

不要继续使用原生 `<table>` 作为主要展示结构。若组件里还有原生 table，请改成 `el-table` 或 `el-descriptions`。

不要使用大量 icon，不要用花哨图形。

### 3. 统一 token.css

样式必须引用项目 token：

```css
var(--surface-card)
var(--surface-soft)
var(--border-default)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--color-primary)
var(--color-success)
var(--color-warning)
var(--color-danger)
var(--space-xs)
var(--space-sm)
var(--space-md)
var(--space-lg)
var(--radius-sm)
var(--radius-md)
var(--radius-lg)
var(--font-size-xs)
var(--font-size-sm)
var(--font-size-body)
var(--font-size-lg)
```

如果 token 不存在，可以使用 fallback，但不要大面积硬编码颜色。

示例：

```css
background: var(--surface-card, #fff);
border: 1px solid var(--border-default, #dbeafe);
color: var(--text-primary, #0f172a);
padding: var(--space-md, 16px);
border-radius: var(--radius-md, 8px);
```

### 4. 统一容器与滚动

所有 artifact 根节点需要：

```css
display: flex;
flex-direction: column;
gap: var(--space-md, 16px);
min-width: 0;
max-width: 100%;
box-sizing: border-box;
```

卡片、表格、按钮区域不能超出左侧工作区。

`el-table` 外层或父级要保证：

```css
min-width: 0;
overflow: hidden;
```

操作按钮区域需要自动换行：

```css
display: flex;
gap: var(--space-sm, 8px);
flex-wrap: wrap;
align-items: center;
justify-content: flex-end;
```

不要让按钮顶出背景或顶到右侧对话面板。

### 5. 统一主按钮层级

每个节点最多一个主按钮 `type="primary"`。

示例：

```text
税票采集：
主按钮：模拟企业已授权 / 进入资料补充
次按钮：发送提醒 / 改为上传材料 / 下载二维码

资料补充：
主按钮：模拟客户上传资料 / 进入证据整合
次按钮：发送资料清单

产物确认：
主按钮：确认产物并生成交付包
次按钮：编辑报告 / 导出报告 / 加入监控

交付包：
主按钮：模拟下载交付包
次按钮：查看交付清单
```

## 需要重点检查和统一的组件

请逐个检查以下文件：

```text
src/components/workbench/artifacts/ScreeningArtifact.vue
src/components/workbench/artifacts/EnterpriseExploreArtifact.vue
src/components/workbench/artifacts/BusinessVerifyArtifact.vue
src/components/workbench/artifacts/JudicialArtifact.vue
src/components/workbench/artifacts/TaxCollectionArtifact.vue
src/components/workbench/artifacts/MaterialsArtifact.vue
src/components/workbench/artifacts/EvidenceMergeArtifact.vue
src/components/workbench/artifacts/RiskDiagnosisArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
src/components/workbench/artifacts/WorkbenchDeliveryPackageArtifact.vue
src/components/workbench/artifacts/DueDiligenceArtifact.vue
src/components/workbench/artifacts/MonitorArtifact.vue
src/components/workbench/artifacts/EmptyArtifact.vue
src/components/workbench/artifacts/RiskIssueList.vue
src/components/workbench/artifacts/DueFlowProgress.vue
```

注意：`DeliveryPackageArtifact.vue` 是智能尽调详情页完整交付包组件，如果它只在智能尽调详情中使用，本阶段不要主动改它。工作台轻量交付包组件是 `WorkbenchDeliveryPackageArtifact.vue`。

## 每个节点的目标效果

### 1. 智能筛客 `ScreeningArtifact.vue`

目标：

```text
顶部：智能筛客结果 + 命中企业数
条件：筛选条件 tags
指标：匹配企业 / 高风险过滤 / 适合转尽调
表格：企业名称 / 行业 / 风险 / 匹配度 / 操作
```

要求：

- 使用 `el-card` + `el-row/el-col` + `el-table`
- 表格不要横向溢出
- 唐山物桥商贸有限公司在列表中正常展示

### 2. 企业探查 `EnterpriseExploreArtifact.vue`

目标：

```text
顶部：企业名称 + 探查状态
基础信息：el-descriptions
结论：el-alert
风险事项：复用 RiskIssueList，但风格要和工作台一致
操作：加入监控 / 新建尽调
```

要求：

- 不要改探查逻辑
- 不要改风险事项数据

### 3. 工商核验 `BusinessVerifyArtifact.vue`

目标：

```text
顶部：工商核验 + 已完成 tag + 结论摘要
基础信息：el-descriptions
核验结果：el-table 或 compact list
关联企业：el-table
风险提示：el-alert 或 el-card
```

要求：

- 当前已经比较接近，重点统一 spacing/token。

### 4. 司法查询 `JudicialArtifact.vue`

目标：

```text
顶部：司法查询 + 已完成
指标卡：重大诉讼 / 被执行 / 失信 / 行政处罚
结论：无重大司法风险
明细：el-table
数据来源：轻量说明
```

要求：

- 不要让指标卡过宽或挤压。

### 5. 税票采集 `TaxCollectionArtifact.vue`

目标：

```text
顶部：税票采集 + 当前状态
授权状态：el-descriptions 或状态行
授权链接/二维码：轻量展示
采集进度：3 个指标卡 + progress
采集日志：el-table 或 compact list
操作：根据状态显示主按钮
```

要求：

- 未授权、已发送、已授权/已完成三种状态都要稳定。
- 按钮不能溢出。
- 操作区必须靠下或单独成行。

### 6. 资料补充 `MaterialsArtifact.vue`

目标：

```text
顶部：资料包 + 完整度
进度：el-progress
指标：已收集 / 待补充 / 待识别
资料清单：el-table
缺失资料：el-alert 或 el-card
操作：发送资料清单 / 模拟客户上传资料 / 进入证据整合
```

要求：

- 资料表格可读，状态 tag 统一。

### 7. 证据整合 `EvidenceMergeArtifact.vue`

目标：

```text
顶部：证据整合 + 已完成
指标：证据完整度 / 已归档 / 待确认
来源分布：轻量列表或 el-table
风险事项证据链：el-table
操作：进入风险诊断
```

要求：

- “查看具体内容”的按钮/入口保持可见。
- 不要让过程卡片像聊天气泡堆在右侧。

### 8. 风险诊断 `RiskDiagnosisArtifact.vue`

目标：

```text
顶部：综合评分 / 等级 / 风险等级
结论：el-alert
风险事项：RiskIssueList
企业亮点/全量指标：如已有则统一样式
操作：查看诊断报告 / 同步报告 / 进入产物确认
```

要求：

- 风险事项来自企业探查的风险事项风格，但要适配工作台字体和间距。

### 9. 产物确认 `DeliverablesArtifact.vue`

目标：

```text
顶部：尽调产物 + 已生成
产物表格：报告/阶段报告/证据链/资料包
报告模板与资料包：el-descriptions
待确认项：el-alert / list
预览面板：保持现有功能
操作：确认产物并生成交付包 / 编辑报告 / 导出报告 / 加入监控
```

要求：

- 当前按钮容易挤出背景，必须修复。
- 主按钮「确认产物并生成交付包」必须清晰但不能溢出。
- 不要改按钮事件。

### 10. 报告编辑 Lite `ReportEditorArtifact.vue`

目标：

```text
左：报告目录
中：当前章节正文
底部：章节证据链 + 操作按钮
```

要求：

- 目录和正文区域高度稳定。
- 底部操作按钮不能超出容器。
- 「确认产物并生成交付包」事件必须保留。

### 11. 工作台交付包 `WorkbenchDeliveryPackageArtifact.vue`

目标：

```text
顶部：交付包已生成 / 已下载
摘要：企业、包名、生成时间、内容摘要
交付清单：分组展示
操作：模拟下载交付包 / 查看交付清单
```

要求：

- 使用 `el-card`、`el-tag`、`el-descriptions`、`el-table` 或 `el-collapse`
- 不要真实下载

## 统一 CSS 建议

可以在每个组件内部 scoped style 中保留局部类，但请尽量统一命名和规则。

推荐根类：

```css
.artifact-screening,
.artifact-explore,
.artifact-business,
.artifact-judicial,
.artifact-tax,
.artifact-materials,
.artifact-evidence,
.artifact-risk,
.artifact-deliverables,
.artifact-report-lite,
.wb-dp {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}
```

推荐通用卡片：

```css
.artifact-card {
  border-radius: var(--radius-md, 8px);
  border-color: var(--border-default, #dbe3ef);
  background: var(--surface-card, #fff);
}

.artifact-card :deep(.el-card__header) {
  padding: var(--space-sm, 10px) var(--space-md, 16px);
}

.artifact-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm, 8px);
  min-width: 0;
}

.artifact-card__title {
  font-size: var(--font-size-body, 14px);
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}
```

推荐操作区：

```css
.artifact-actions,
.artifact-deliverables__actions,
.artifact-report-lite__actions,
.wb-dp__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-sm, 8px);
  padding-top: var(--space-sm, 8px);
  min-width: 0;
}
```

## 验收路径

完成后请运行：

```bash
npm run build
```

然后按以下路径人工检查：

```text
1. 工作台首页输入默认筛选示例并发送
2. 查看智能筛客结果
3. 探查唐山物桥商贸有限公司
4. 新建尽调，选择「尽职调查报告」
5. 点击「开始工商核验」
6. 依次检查：
   - 工商核验
   - 司法查询
   - 税票采集
   - 资料补充
   - 证据整合
   - 风险诊断
   - 产物确认
   - 报告编辑 Lite
   - 交付包
7. 每个左侧产物区必须：
   - 不溢出右侧边界
   - 有纵向滚动时滚动正常
   - 表格和按钮不挤出卡片
   - 字体、间距、卡片、tag 风格统一
   - 所有原有按钮仍能触发原流程
```

## 输出要求

完成后请汇报：

1. 修改了哪些 artifact 文件。
2. 哪些原生 table 已改成 Element Plus。
3. 哪些按钮/容器溢出问题已修复。
4. 是否保留所有原有 emit 事件。
5. 是否没有修改 store、路由、工作台页面、智能尽调页面和智能报告页面。
6. `npm run build` 是否通过。
