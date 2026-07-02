# OpenClaw 提示词：Phase 3-B 智能尽调详情页任务工作区

请读取并严格执行本文件：

`openclaw-due-diligence-phase3b-task-workspace-prompt.md`

## 一、背景

Phase 3-A 已完成智能尽调首页任务台账：

- `/due-diligence` 首页已经是任务列表/台账
- 支持新建尽调
- 唐山物桥商贸有限公司 demo 任务已加入
- 点击「继续处理」进入 `/due-diligence/:taskId`

现在进入 Phase 3-B：改造智能尽调详情页。

核心目标：

> 用户从智能尽调首页点击「继续处理」后，进入的是一个真实的“尽调任务详情工作区”，而不是旧的单页演示流程。

## 二、本阶段只做什么

本阶段只改造智能尽调详情页：

- 任务详情头部
- 7 节点流程进度
- 左侧阶段产物工作区
- 右侧尽调任务助手
- 唐山物桥商贸有限公司 demo 的税票等待授权状态

不要做工作台和智能尽调的真实同步，那是 Phase 3-C。

不要做智能报告联动，那是 Phase 3-D。

## 三、重点修改文件

优先修改：

1. `src/pages/DueDiligenceTaskPage.vue`
2. `src/stores/dueDiligence.js`
3. `src/data/mockDueDiligence.js`

可以复用/引入但尽量不要修改：

4. `src/components/workbench/DueTaskHeader.vue`
5. `src/components/workbench/artifacts/DueFlowProgress.vue`
6. `src/components/workbench/artifacts/TaxCollectionArtifact.vue`
7. `src/components/workbench/artifacts/MaterialsArtifact.vue`
8. `src/components/workbench/artifacts/DeliverablesArtifact.vue`
9. `src/components/workbench/artifacts/BusinessVerifyArtifact.vue`
10. `src/components/workbench/artifacts/JudicialArtifact.vue`
11. `src/components/workbench/artifacts/EvidenceMergeArtifact.vue`
12. `src/components/workbench/artifacts/RiskDiagnosisArtifact.vue`

不要修改：

- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/SmartReportPage.vue`
- `src/pages/DueDiligenceHomePage.vue` 的整体结构
- 任何独立业务模块页面
- 全局 `src/styles/tokens.css`

## 四、强制 UI 和样式要求

必须使用 Element Plus 和项目 token。

必须使用或优先使用：

- `el-card`
- `el-button`
- `el-tag`
- `el-progress`
- `el-descriptions`
- `el-divider`
- `el-timeline` / `el-steps` / 现有 `DueFlowProgress`
- `el-alert`
- `el-empty`

样式必须引用 `src/styles/tokens.css`：

```css
var(--surface-page)
var(--surface-card)
var(--surface-soft)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--border-default)
var(--border-light)
var(--border-divider)
var(--color-primary)
var(--color-primary-bg)
var(--color-success)
var(--color-success-bg)
var(--color-warning)
var(--color-warning-bg)
var(--color-danger)
var(--color-danger-bg)
var(--radius-md)
var(--shadow-sm)
var(--space-md)
var(--space-lg)
var(--font-size-page-title)
var(--font-size-body)
```

禁止：

- 不要写一套全新的视觉风格
- 不要大面积硬编码颜色
- 不要大量自造 icon
- 不要大圆角、大阴影、渐变背景
- 不要重写工作台页面
- 不要把右侧做成工作台 AI Copilot 的完整复制

## 五、智能尽调详情页目标结构

目标线框：

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ ← 返回任务列表                                                              │
│ 唐山物桥商贸有限公司                                                        │
│ 建材批发 / 商贸流通 · 河北省唐山市 · 注册资本 500 万                         │
│ 模板：尽职调查报告    来源：工作台AI    负责人：张经理                         │
│ 综合评分 72  C+  中风险    资料完整度 67%    当前：税票采集 · 等待授权          │
├────────────────────────────────────────────────────────────────────────────┤
│ 流程进度                                                                    │
│ ● 工商核验 ─ ● 司法查询 ─ ◉ 税票采集 ─ ○ 资料补充 ─ ○ 证据整合 ─ ○ 风险诊断 ─ ○ 产物确认 │
│ 当前进度：43%                                           [稍后继续] [回到工作台] │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ 左侧：阶段产物工作区                                    右侧：尽调任务助手      │
│ ┌──────────────────────────────────────────────┐       ┌───────────────────┐ │
│ │ 税票采集 · 等待企业授权                         │       │ 尽调助手           │ │
│ │                                              │       │                   │ │
│ │ 授权状态：等待授权                             │       │ 税票采集需要企业授权 │ │
│ │ 链接状态：已发送                               │       │ 当前任务会保持在等待 │ │
│ │ 授权链接：https://ai-copilot.demo/auth/rpa002   │       │ 状态。              │ │
│ │                                              │       │                   │ │
│ │ 采集进度                                      │       │ 快捷操作：          │ │
│ │ 进项发票 0/0    销项发票 0/0    纳税申报 未采集 │       │ [发送提醒]         │ │
│ │                                              │       │ [模拟企业已授权]    │ │
│ │ 采集日志                                      │       │ [改为上传材料]      │ │
│ │ 10:33 已生成税票采集授权链接                    │       │ [稍后继续]         │ │
│ │ 10:35 授权链接已发送                            │       │ [回到工作台]       │ │
│ │ —    等待企业扫码授权                            │       │                   │ │
│ └──────────────────────────────────────────────┘       └───────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

## 六、详情页头部要求

详情页顶部必须从任务对象读取信息，不能写死成旧任务。

唐山物桥任务头部显示：

```text
唐山物桥商贸有限公司
建材批发 / 商贸流通 · 河北省唐山市 · 注册资本 500万
模板：尽职调查报告
来源：工作台AI
负责人：张经理
综合评分：72
等级：C+
风险等级：中风险
资料完整度：67%
当前：税票采集 · 等待授权
进度：43%
```

头部可使用：

- `el-card`
- `el-tag`
- `el-progress`
- `el-descriptions`

返回按钮继续返回 `/due-diligence`。

## 七、流程进度要求

详情页流程固定为 7 个业务节点：

```text
工商核验
司法查询
税票采集
资料补充
证据整合
风险诊断
产物确认
```

字段映射建议：

```js
const DUE_STAGE_MAP = [
  { key: 'verify-business', id: 'business', label: '工商核验' },
  { key: 'verify-legal', id: 'judicial', label: '司法查询' },
  { key: 'tax-rpa', id: 'tax', label: '税票采集' },
  { key: 'materials', id: 'materials', label: '资料补充' },
  { key: 'evidence', id: 'evidence', label: '证据整合' },
  { key: 'risk', id: 'riskDiagnosis', label: '风险诊断' },
  { key: 'artifacts', id: 'deliverables', label: '产物确认' },
]
```

唐山物桥默认：

```js
currentStep: 'tax-rpa'
progress: 43
```

所以：

- 工商核验：已完成
- 司法查询：已完成
- 税票采集：当前
- 后续节点：待处理

可以复用 `DueFlowProgress.vue`，也可以用 Element Plus `el-steps`，但视觉必须和工作台流程条一致或接近。

## 八、左侧阶段产物工作区

原则：

```text
沿用工作台阶段产物内容
不直接照搬整个 WorkbenchPage
```

可以复用工作台 artifacts：

- `BusinessVerifyArtifact.vue`
- `JudicialArtifact.vue`
- `TaxCollectionArtifact.vue`
- `MaterialsArtifact.vue`
- `EvidenceMergeArtifact.vue`
- `RiskDiagnosisArtifact.vue`
- `DeliverablesArtifact.vue`
- `ReportEditorArtifact.vue`

本阶段至少要完成三个阶段的真实展示：

### 1. 税票采集 TaxCollectionArtifact

唐山物桥默认进入详情页后，左侧应该显示税票采集等待授权状态：

```text
税票采集 · 等待企业授权
授权状态：等待授权
链接状态：已发送
授权链接：https://ai-copilot.demo/auth/rpa002

采集进度：
进项发票 0/0
销项发票 0/0
纳税申报 未采集

采集日志：
10:33 已生成税票采集授权链接
10:35 授权链接已发送
—    等待企业扫码授权
```

### 2. 资料补充 MaterialsArtifact

切换到资料补充阶段时，左侧显示资料完整度和缺失资料：

```text
资料补充 · 等待客户上传
资料完整度：67%
已收集：8 项
缺失资料：4 项
缺失：最新财务报表、主要合同、应收账款明细、电费缴费记录
```

### 3. 产物确认 DeliverablesArtifact

切换到产物确认阶段时，左侧显示产物列表和「尽职调查报告」文档化预览能力。

如果已经可以复用 `DeliverablesArtifact.vue`，请复用。

其他阶段：

- 工商核验
- 司法查询
- 证据整合
- 风险诊断

可以先使用轻量 `el-card` 或已有 artifact，但数据要与唐山物桥一致。

## 九、右侧尽调任务助手

右侧不是工作台 AI Copilot 的完整复制，而是“任务助手 + 操作区”。

右侧固定结构：

```text
尽调助手

当前阶段说明
AI 提示语

快捷操作
[主按钮]
[次按钮]

任务状态
当前阶段
等待事项
同步状态
最近更新
```

税票采集阶段提示语：

```text
税票采集需要企业授权。当前任务会保持在「等待客户」状态。
你可以发送提醒，也可以在 demo 中点击「模拟企业已授权」继续采集。
```

按钮：

```text
[发送提醒]
[模拟企业已授权]
[改为上传材料]
[稍后继续]
[回到工作台]
```

交互要求：

- 点击「发送提醒」：`ElMessage.success('已发送企业授权提醒')`
- 点击「模拟企业已授权」：把当前展示切换为税票采集完成态，或提示 `已模拟企业授权，税票采集完成`；如果改数据风险大，可以仅 message + 更新本地状态
- 点击「改为上传材料」：切换到资料补充阶段或提示已切换
- 点击「稍后继续」：提示 `任务已保留在当前阶段，可稍后继续处理`
- 点击「回到工作台」：如果已有 `/workbench` 路由则 `router.push('/workbench')`

不要在本阶段强行实现真实工作台同步。

## 十、状态表达要求

要明确真实业务不是一次性完成：

```text
税票采集：等待企业授权
资料补充：等待客户上传
报告阶段：等待客户经理确认和修改
```

不要出现：

```text
系统将自动完成全部流程
一键完成全部尽调
已自动完成所有节点
```

## 十一、数据要求

请在 store 或页面 computed 中为唐山物桥构造 stage artifact data。

至少包括：

```js
const taxArtifactData = {
  status: 'waiting',
  authStatus: '等待授权',
  linkStatus: '已发送',
  authUrl: 'https://ai-copilot.demo/auth/rpa002',
  input: { collected: 0, total: 0, percent: 0 },
  output: { collected: 0, total: 0, percent: 0 },
  filing: { status: '未采集' },
  logs: [
    { time: '10:33', text: '已生成税票采集授权链接', status: 'done' },
    { time: '10:35', text: '授权链接已发送', status: 'done' },
    { time: '—', text: '等待企业扫码授权', status: 'waiting' },
  ],
}
```

字段名需要按实际 `TaxCollectionArtifact.vue` 使用的 props 对齐。请先读该组件再传参。

## 十二、验收标准

完成后请验证：

1. `npm run build` 必须通过
2. `/due-diligence/dd-ts-wq-001` 能打开
3. 详情页中文正常
4. 顶部任务头部显示唐山物桥、尽职调查报告、工作台AI、72、C+、中风险、67%、43%
5. 流程条显示 7 个节点，税票采集为当前节点
6. 左侧默认展示税票采集等待授权产物
7. 右侧显示尽调助手和快捷操作
8. 点击发送提醒、稍后继续、回到工作台有反馈
9. 不要修改工作台和智能报告
10. 首页 `/due-diligence` 不被破坏

## 十三、输出报告格式

完成后请输出：

```text
Phase 3-B 智能尽调详情页任务工作区完成报告

1. 修改了哪些文件
2. 详情页头部展示了哪些任务信息
3. 流程进度是否改为 7 个节点
4. 左侧阶段产物工作区复用了哪些工作台 artifact
5. 唐山物桥默认是否停在税票采集等待授权
6. 右侧尽调任务助手有哪些按钮
7. npm run build 是否通过
8. 是否修改了工作台/智能报告/独立业务模块
```

