# OpenClaw Prompt: Phase 3-F-2G 风险诊断下半部分风险事项列表 UI 统一

## 目标

本轮只修「风险诊断」节点下半部分的风险事项列表区域，让它和项目整体 UI、Element Plus 组件体系、`tokens.css` 风格保持一致。

当前问题：

1. `RiskIssueList.vue` 仍然使用自定义 `div` 列表模拟表格，和其他模块的 `el-table` 风格不一致。
2. 风险事项列表内部有 `max-height: 280px; overflow-y: auto`，形成内嵌滚动条，和工作台/智能尽调页面主滚动条冲突，视觉很重。
3. 风险事项、企业亮点、全量指标三类内容排版方式不统一。
4. 风险等级筛选按钮、风险列表、建议动作之间层级松散，像拼接出来的临时内容。
5. 右侧「查看证据链」和风险等级 tag 没有表格列对齐，整体不够像正式业务结果页。

## 必须修改的文件

只允许修改：

- `src/components/workbench/artifacts/RiskIssueList.vue`

如确实需要微调外层间距，最多允许修改：

- `src/components/workbench/artifacts/RiskDiagnosisArtifact.vue`

但不要改头部、流程条、状态机、数据结构。

## 禁止修改

严禁修改：

- `src/pages/WorkbenchPage.vue`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/router/*`
- `src/styles/tokens.css`
- `src/data/*`
- 其他 artifact 组件

不要处理乱码。浏览器页面中文是正常的，PowerShell 读取文件时出现乱码是终端编码问题，不属于本轮任务。

## 具体改造要求

### 1. 风险事项列表改为 Element Plus 表格

将 `RiskIssueList.vue` 中风险事项 tab 里的自定义结构：

- `.risk-issue-list__items`
- `.risk-issue-item`
- `.risk-issue-item__main`
- `.risk-issue-item__desc`
- `.risk-issue-item__actions`

改为 `el-table` + `el-table-column`。

建议列结构：

| 列 | 建议宽度 | 内容 |
|---|---:|---|
| 风险事项 | min-width 180 | 风险名称 + 小号分类文本 |
| 风险说明 | min-width 320 | `item.description`，允许自然换行或最多两行 |
| 等级 | width 100 | `el-tag` 显示 `高风险/中风险/低风险` |
| 操作 | width 110 | `el-button link type="primary"` 查看证据链 |

要求：

- 使用 `el-table size="small"`
- 表格不要设置固定高度
- 不要再出现列表内部滚动条
- 使用 `empty-text`
- 保留 `showEvidence(item)` 逻辑
- 保留 `riskTag(level)` 逻辑

### 2. 移除内部滚动条

删除或废弃：

```css
max-height: 280px;
overflow-y: auto;
```

风险诊断页的滚动应该由工作台左侧结果区或智能尽调详情左侧结果区承接，不要在风险事项列表内部再生成一层滚动条。

### 3. 风险等级筛选改成轻量 Element 控件

保留「全部 / 高风险 / 中风险 / 低风险」筛选能力，但不要用过重的蓝色按钮组。

可以使用以下任一方案：

- `el-radio-group` + `el-radio-button`
- 或 `el-segmented`（如果项目当前 Element Plus 版本支持）
- 或继续用 `el-button`，但必须是轻量 plain/text 风格，间距和字号使用 token

要求：

- 筛选控件和表格之间间距紧凑
- 激活态清晰，但不要抢过风险表格主体
- 不要新增花哨 icon

### 4. 企业亮点 tab 也使用统一表格样式

当前企业亮点是自定义卡片列表，改为 `el-table size="small"`。

建议列：

| 列 | 内容 |
|---|---|
| 亮点 | `h.name` |
| 说明 | `h.description` |

如没有数据，用 `empty-text="暂无企业亮点数据"`。

### 5. 全量指标 tab 也使用统一表格样式

当前全量指标是自定义 div 列表，改为 `el-table size="small"`。

建议列：

| 列 | 内容 |
|---|---|
| 指标 | `ind.label` |
| 指标值 | `ind.value` |

如没有数据，用 `empty-text="暂无全量指标数据"`。

### 6. 保留证据链弹窗

证据链弹窗必须保留：

- `el-dialog`
- `el-descriptions`
- `selectedIssue`
- `evidenceDialogVisible`
- `showEvidence(issue)`

可以微调弹窗标题和宽度，但不要改变交互逻辑。

### 7. 样式要求

所有新增样式必须使用项目 token：

- `var(--space-*)`
- `var(--font-size-*)`
- `var(--text-*)`
- `var(--border-*)`
- `var(--surface-*)`
- `var(--radius-*)`

不要写大面积硬编码颜色。必要 fallback 可以保留，例如：

```css
var(--border-default, #dbe3ef)
```

样式方向：

- 更像正式业务结果页
- 更像 Element Plus 表格
- 不要卡片套卡片
- 不要内部滚动条
- 不要大面积蓝色强调
- 不要新增复杂图标

### 8. 兼容双入口

`RiskIssueList.vue` 是工作台和智能尽调详情共用组件。

必须保证：

- 工作台风险诊断页正常显示
- 智能尽调详情风险诊断页正常显示
- 右侧 AI 对话区不被覆盖
- 顶部流程条不受影响
- `view-diagnosis-report`、`sync-report`、`enter-deliverables` 等外层事件不受影响

## 验收路径

请至少检查：

1. 工作台进入风险诊断节点。
2. 风险事项区域无内嵌滚动条。
3. 风险事项列表为 Element Plus 表格风格。
4. 点击「查看证据链」仍然弹出证据链弹窗。
5. 切换「企业亮点」「全量指标」tab 正常。
6. 智能尽调详情中的风险诊断节点也正常。
7. `npm run build` 通过。

## 完成后汇报格式

请按以下格式汇报：

1. 修改了哪些文件。
2. 是否只修改了允许文件。
3. 风险事项是否改为 `el-table`。
4. 是否移除了内部滚动条。
5. 企业亮点和全量指标是否也统一为 Element 表格。
6. 证据链弹窗是否保留且可用。
7. 工作台和智能尽调详情双入口是否兼容。
8. `npm run build` 是否通过。
