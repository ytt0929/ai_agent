# OpenClaw Prompt - Phase 3-F-2C 风险诊断节点 UI 优化

请严格按本提示词修改。目标是优化【风险诊断】节点左侧结果展示区的 UI，让它和已经调整过的【产物确认】、后续【税票采集】节点保持同一套轻量风格。不要改流程、不要改 store、不要改路由、不要改全局 token。

## 修改范围

只允许优先修改：

- `src/components/workbench/artifacts/RiskDiagnosisArtifact.vue`

如确实需要让风险事项列表更协调，可以做极小范围样式优化：

- `src/components/workbench/artifacts/RiskIssueList.vue`

禁止修改：

- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/pages/WorkbenchPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/router/*`
- `src/styles/tokens.css`
- 任何 mock 数据文件

## 重要边界

1. 不能改乱码相关内容。浏览器页面不是乱码，不要做任何编码转换、批量替换中文、重新保存全项目之类的动作。
2. 不能改任何 props / emit 名称。
3. 不能改变工作台和智能尽调详情页的流程推进。
4. 不能把风险诊断改成新页面、drawer、弹窗主流程。
5. 不能引入新 UI 库，只能使用 Element Plus 和项目现有 token。

## 必须保留的 props / emits

`RiskDiagnosisArtifact.vue` 必须保留：

```js
const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['view-diagnosis-report', 'sync-report', 'enter-deliverables'])
```

三个按钮事件必须继续可用：

- `view-diagnosis-report`
- `sync-report`
- `enter-deliverables`

`RiskIssueList.vue` 如果修改，必须保留：

- props: `issues`、`highlights`、`indicators`、`title`
- 风险等级筛选
- tabs: 风险事项 / 企业亮点 / 全量指标
- 查看证据链弹窗

## 当前问题

风险诊断节点现在的展示比较像一个独立大报表：

- 顶部大评分卡太重，占空间过多；
- 风险结论和风险事项之间层级不够清晰；
- 风险事项列表信息密度和工作台整体风格不统一；
- 操作按钮虽然可用，但不像“下一步确认产物”的流程动作；
- 在工作台右侧 AI 对话并列布局下，左侧需要更紧凑、更像过程产物。

## 目标效果

将风险诊断节点调整为：

```text
┌────────────────────────────────────────────┐
│ 风险诊断  [已完成] [中风险] [评分 72] [C+] │
│ 基于工商、司法、税票、资料和证据链完成诊断，│
│ 识别到若干风险事项，可查看证据链并进入产物确认。│
└────────────────────────────────────────────┘

┌ 风险总览 ──────────────────────────────────┐
│ 综合评分 72        风险等级 中风险          │
│ 评级 C+            风险事项 8 项            │
│ [warning alert] 企业存在多项风险事项，建议...│
└────────────────────────────────────────────┘

┌ 风险事项 ──────────────────────────────────┐
│ tabs: 风险事项(8) / 企业亮点 / 全量指标      │
│ filter: 全部 / 高风险 / 中风险 / 低风险      │
│                                              │
│ 营收增长异常     [高风险] 经营稳定性         │
│ 近12月开票收入同比增长188.3%... [查看证据链] │
│                                              │
│ 税负率显著低于行业 [高风险] 税务风险         │
│ 增值税税负率0.8%...               [查看证据链]│
└────────────────────────────────────────────┘

┌ 建议动作 ──────────────────────────────────┐
│ [进一步核实收入真实性] [补充银行流水核验] ...│
└────────────────────────────────────────────┘

┌ 操作区 ────────────────────────────────────┐
│ [查看诊断报告] [同步到最终报告] [进入产物确认]│
└────────────────────────────────────────────┘
```

## 具体 UI 要求

### 1. 顶部不要重卡片

`RiskDiagnosisArtifact.vue` 顶部不要再使用大面积居中的大评分卡。

请改为轻量的顶部摘要区，例如：

- 左侧：标题 `风险诊断`
- 右侧：`el-tag` 展示 `已完成`、风险等级、评分、等级
- 下一行一句说明文字
- 高度控制在约 64-84px
- 背景可以使用 `var(--surface-card)` 或轻微 `var(--surface-soft)`，不要大色块

### 2. 风险总览要紧凑

保留评分、等级、风险等级、风险事项数量，但以 2x2 summary grid 展示，不要再用 36px 以上巨大数字。

建议结构：

- `综合评分`
- `评级`
- `风险等级`
- `风险事项`

使用 `el-card shadow="never"` 或普通 div 都可以，但必须轻量。

### 3. 结论提示要紧贴总览

`conclusion` 用 `el-alert` 展示，`type="warning"`，`show-icon`，`closable=false`。

不要让 alert 独立占过大空间。

### 4. 风险事项列表可以保留 RiskIssueList

优先保留 `RiskIssueList` 组件，不要重写复杂逻辑。

如果调整 `RiskIssueList.vue`，只允许做展示层优化：

- 容器 `min-width: 0; max-width: 100%; box-sizing: border-box;`
- 风险 item 改得更像一行业务事项，而不是厚卡片；
- `risk-issue-item` 支持窄宽度换行；
- `查看证据链` 按钮仍然打开原来的 `el-dialog`；
- tabs 和筛选按钮继续可用；
- 不要改变 props、computed、dialog 逻辑。

### 5. 建议动作轻量展示

`suggestedActions` 保留，但不要做厚卡片。

可以放在列表下方，用：

- 小标题 `建议动作`
- `el-tag effect="plain"` 或 `el-button size="small" plain`

如果没有建议动作，不显示这个区块。

### 6. 操作区按钮不能溢出

底部操作区必须：

```css
display: flex;
flex-wrap: wrap;
justify-content: flex-end;
gap: var(--space-sm, 8px);
```

按钮顺序保持：

1. 查看诊断报告
2. 同步到最终报告
3. 进入产物确认（primary）

### 7. 响应式和滚动

组件本身不要写死高度，不要 `overflow: hidden`。

必须保证在工作台左侧内容区和智能尽调详情页左侧内容区都不横向溢出：

```css
min-width: 0;
max-width: 100%;
box-sizing: border-box;
```

### 8. 样式必须使用 token

所有颜色、间距、字号、圆角尽量使用项目 token，例如：

- `var(--text-primary)`
- `var(--text-secondary)`
- `var(--text-tertiary)`
- `var(--surface-card)`
- `var(--surface-soft)`
- `var(--border-color-divider)`
- `var(--space-xs)`
- `var(--space-sm)`
- `var(--space-md)`
- `var(--radius-md)`

不要新增一堆硬编码蓝色/绿色/阴影。

## 验收路径

完成后请运行：

```bash
npm run build
```

并按下面口径自查：

### 工作台入口

1. 进入工作台完整 demo 流程到【风险诊断】。
2. 左侧展示区顶部不是大评分卡，而是轻量摘要。
3. 风险事项列表可筛选、可查看证据链。
4. 点击【进入产物确认】仍能进入产物确认节点。
5. 右侧 AI Copilot 不被覆盖。
6. 不出现横向溢出。

### 智能尽调详情入口

1. 从智能尽调详情页进入【风险诊断】节点。
2. 左侧风险诊断组件正常展示。
3. 点击【进入产物确认】仍能推进到产物确认。
4. 右侧尽调助手不被覆盖。
5. 不影响顶部 8 节点流程条。

## 输出要求

请在完成后回复：

1. 修改了哪些文件；
2. 是否只改了风险诊断相关组件；
3. 是否保留 props / emits；
4. 风险诊断顶部是否已改成轻量摘要；
5. 风险事项列表是否仍可筛选和查看证据链；
6. `npm run build` 是否通过；
7. 是否未修改 store / 页面 / 路由 / tokens.css。

