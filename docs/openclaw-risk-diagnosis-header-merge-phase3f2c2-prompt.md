# OpenClaw Prompt - Phase 3-F-2C-2 风险诊断页头部合并优化

请严格按本提示词修改。目标是只优化【风险诊断】页面当前节点的头部重复问题：把页面上方三段高度重叠的信息压缩为「任务头部 + 当前节点摘要」两层。不要抽公共组件，不要一次性改 7 个节点。

## 修改范围

优先只修改：

- `src/components/workbench/artifacts/RiskDiagnosisArtifact.vue`

如风险事项列表在视觉上明显不协调，可以极小范围调整：

- `src/components/workbench/artifacts/RiskIssueList.vue`

禁止修改：

- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/pages/WorkbenchPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/router/*`
- `src/styles/tokens.css`
- 其他 artifact 组件

## 重要边界

1. 不要抽公共 Header 组件。
2. 不要改工作台或智能尽调详情页的整体布局。
3. 不要改 store 状态机、mock 数据、流程推进逻辑。
4. 不要做编码转换，不要处理乱码。浏览器不是乱码。
5. 不要引入新的 UI 库，只用 Element Plus 和现有 token。

## 必须保留

`RiskDiagnosisArtifact.vue` 必须保留：

```js
const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['view-diagnosis-report', 'sync-report', 'enter-deliverables'])
```

按钮事件必须保持：

- `view-diagnosis-report`
- `sync-report`
- `enter-deliverables`

如果修改 `RiskIssueList.vue`，必须保留：

- props: `issues`、`highlights`、`indicators`、`title`
- tabs: 风险事项 / 企业亮点 / 全量指标
- 风险等级筛选
- 查看证据链弹窗

## 当前问题

风险诊断页当前顶部信息重复度高：

```text
第一层：企业信息 + 模板 + 评分 + 风险 + 资料完整度
第二层：企业信息 + 流程进度 + 风险诊断已完成 + 86%
第三层：风险诊断 + 已完成 + 中风险 + 评分72 + C+
```

这三层都在表达同一组信息，导致页面头部很厚，真正的风险事项列表被压到下面。

## 本次目标

只在【风险诊断】这个页面里，把三层压成两层：

```text
┌ 任务头部 ───────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司   商贸流通 / 河北省唐山市           │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度86% │
│                                      [风险诊断已完成] 86% │
├────────────────────────────────────────────────────────┤
│ ✓ 工商核验 ─ ✓ 司法查询 ─ ✓ 税票采集 ─ ✓ 资料补充 ─ ✓ 证据整合 │
│      ─ ◎ 风险诊断 ─ ○ 产物确认                          │
└────────────────────────────────────────────────────────┘

┌ 风险诊断 ───────────────────────────────────────────────┐
│ [已完成] [中风险]                                      │
│ 基于工商、司法、税票、资料和证据链完成诊断，识别到 8 项风险事项。│
│ 建议有条件授信，并补充交易真实性和税负异常说明。          │
└────────────────────────────────────────────────────────┘

┌ 风险事项 / 企业亮点 / 全量指标 ─────────────────────────┐
│ tabs + 筛选 + 风险事项列表                              │
└────────────────────────────────────────────────────────┘
```

## 具体实现要求

### 1. 弱化风险诊断组件内重复评分展示

`RiskDiagnosisArtifact.vue` 里不要再出现大面积独立评分卡。

删除或改造类似这种结构：

```text
大卡片
  72
  综合评分
  等级 C+ · 中风险
```

改成轻量节点摘要：

```text
风险诊断  [已完成] [中风险]
基于工商、司法、税票、资料和证据链完成诊断，识别到 8 项风险事项...
右侧可放小 tag：[评分 72] [C+]
```

注意：评分 72、C+、中风险可以保留，但不能做成很大的视觉主体。

### 2. 当前节点摘要不要像表格头

节点摘要不要使用厚重的 `el-card` header，不要像表格标题栏。

建议用轻量 div / `el-card shadow="never"` 均可，但视觉上要像信息摘要：

- 高度控制在约 64-84px；
- 标题 + 状态 tag + 一句话说明；
- 背景轻，边框轻；
- 不要大色块；
- 不要占满过多纵向空间。

### 3. 风险总览不再重复成单独大块

如果还保留「风险总览」区，请压缩成很轻的 2x2 summary：

```text
综合评分 72    评级 C+
风险等级 中风险 风险事项 8 项
```

但不要让它再成为第二个头部。它应该只是风险事项列表前的辅助信息。

如果节点摘要已经表达清楚，也可以直接去掉单独「风险总览」大卡，只保留 alert + RiskIssueList。

### 4. 风险事项列表保持主体地位

页面主要空间应该给：

- 风险事项
- 企业亮点
- 全量指标
- 查看证据链

`RiskIssueList` 可以继续复用，不要重写业务逻辑。

如调整样式，要求：

- tabs 简洁；
- 筛选按钮轻量；
- 风险事项行不要太厚；
- `查看证据链` 继续弹出原来的 `el-dialog`；
- 窄容器下不横向溢出。

### 5. 底部操作区保持清晰

底部按钮顺序保持：

1. 查看诊断报告
2. 同步到最终报告
3. 进入产物确认

`进入产物确认` 必须是 primary。

操作区必须防止溢出：

```css
display: flex;
flex-wrap: wrap;
justify-content: flex-end;
gap: var(--space-sm, 8px);
```

### 6. 样式要求

必须使用 Element Plus 和项目 token。

可以使用：

- `el-tag`
- `el-alert`
- `el-button`
- `el-tabs`
- `el-dialog`
- `el-descriptions`

样式变量优先用：

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

不要新增大量硬编码颜色、阴影、大圆角。

## 验收路径

完成后运行：

```bash
npm run build
```

然后检查：

### 工作台入口

1. 工作台流程进入【风险诊断】。
2. 红框中原本三层重复信息已压缩。
3. 风险诊断组件内不再有大评分卡。
4. 风险事项列表更靠上，成为页面主体。
5. 点击【查看诊断报告】仍有反应。
6. 点击【进入产物确认】仍能进入产物确认。
7. 右侧 AI Copilot 不被遮挡。
8. 页面无横向溢出。

### 智能尽调详情入口

1. 智能尽调详情页进入【风险诊断】节点。
2. 风险诊断展示正常。
3. 点击【进入产物确认】仍能推进。
4. 不影响顶部流程条和右侧尽调助手。

## 输出要求

完成后请回复：

1. 修改了哪些文件；
2. 是否只处理风险诊断页，没有抽公共组件；
3. 是否去掉/弱化了大评分卡；
4. 风险事项列表是否仍可筛选和查看证据链；
5. props / emits 是否保持不变；
6. `npm run build` 是否通过；
7. 是否未修改 store / 页面 / 路由 / tokens.css。

