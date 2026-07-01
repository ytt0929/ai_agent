# OpenClaw Prompt V6：智能报告改造成对话驱动 AI 工作台

请修改 `D:\demo\ai-copilot` 项目中的“智能报告”功能。

先阅读产品文档：

```text
D:\demo\ai-copilot\docs\smart-report-ai-workbench-product-blueprint.md
```

再阅读当前代码：

- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`
- `src/components/GlobalInputBar.vue`
- `src/stores/smartReport.js`

## 1. 本次目标

把智能报告从“报告管理页 + 部分 AI 助手”升级为：

```text
对话驱动的 AI 报告交付工作台
```

核心要求：

```text
用户输入目标
-> AI 返回任务理解卡
-> 用户点击任务动作
-> 系统执行并更新 mock 状态
-> AI 返回执行结果卡和下一步建议
```

不要继续做成传统 SaaS：

```text
报告列表 + 模板卡片 + 资料包卡片 + 一堆操作按钮
```

按钮不是不能有，而是关键按钮要进入 AI 对话任务卡。

## 2. 交互原则

### 2.1 主交互必须是 AI 对话任务卡

首页第一入口是 AI 任务输入。

用户可以输入：

```text
把明达精工的授信调查报告按浙江分行新模板重排，并检查缺失资料
```

AI 应返回任务理解卡：

```text
已识别任务：
客户：明达精工有限公司
当前报告：单户授信调查报告 V1 草稿
目标模板：浙江分行单户授信调查报告 V2024
资料包：明达精工尽调证据包

建议执行：
1. 检查模板差异
2. 匹配资料包
3. 生成重排预览
4. 标记缺失资料

[查看模板差异] [开始重排] [先检查资料缺口]
```

### 2.2 点击任务按钮必须改变状态

不要只弹 `ElMessage`。

例如点击“开始重排”后：

- 出现执行进度卡。
- 展示已完成步骤。
- 生成执行结果卡。
- 当前报告模板信息更新或进入待确认状态。

例如点击“补充资料”后：

- 资料状态从“缺失”变成“处理中”或“已关联”。
- 资料包缺失数减少或状态变化。
- 对应交付检查项状态变化。

### 2.3 传统列表按钮要弱化

报告任务、模板、资料包仍可以展示，但它们是辅助信息区。

列表里的按钮不要喧宾夺主。更推荐：

```text
AI 建议下一步：补充银行流水后可提交
[让 AI 处理]
```

点击后进入 AI 任务卡，而不是直接跳转或只弹提示。

## 3. 修改边界

优先允许修改：

- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`

必要时允许新增：

- `src/components/report/AiTaskConsole.vue`
- `src/components/report/AiTaskCard.vue`
- `src/components/report/TemplateCenter.vue`
- `src/components/report/MaterialPackageCenter.vue`
- `src/components/report/ReportDeliveryTasks.vue`

必要时允许修改：

- `src/components/GlobalInputBar.vue`

尽量不要修改：

- `src/stores/smartReport.js`

不要修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- `src/stores/workbenchAssistant.js`
- 路由结构
- 侧边栏结构
- 企业探查相关模块
- 智能尽调入口逻辑

`mockSmartReport.js` 必须保留旧导出兼容：

```js
export const reportTemplates = []
export const dataSources = []
export const reportHistory = []
export function getReportContent(templateId, enterprise) {}
```

## 4. 第一阶段：补 AI 任务卡 mock

在 `mockSmartReport.js` 中新增或补齐：

```js
export const aiRecommendedTasks = []
export const aiTaskCardPresets = []
export const aiTaskExecutions = []
```

推荐任务至少包含：

- 处理明达精工待确认报告。
- 检查宁波天合缺失资料。
- 上传浙江分行新版授信模板。
- 按新模板重排明达精工报告。
- 导出杭州智造全景报告交付包。

任务卡字段建议：

```js
{
  id,
  type,
  title,
  userGoal,
  targetReportId,
  targetTemplateId,
  targetMaterialPackageId,
  summary,
  steps,
  actions,
  result
}
```

actions 示例：

```js
[
  { key: 'check-template-diff', label: '查看模板差异' },
  { key: 'start-regenerate', label: '开始重排' },
  { key: 'check-missing-materials', label: '先检查资料缺口' }
]
```

## 5. 第二阶段：补多银行模板 mock

新增：

```js
export const bankOrgs = []
```

扩展 `reportTemplates` 到至少 8 到 12 个。

模板必须覆盖：

- 不同银行。
- 不同分行。
- 不同业务条线。
- 不同报告类型。
- 不同模板状态。

模板字段必须包含：

```js
bankId
bankName
orgId
orgName
businessLine
scenario
status
isDefaultForOrg
usageCount
chapters
versions
```

## 6. 第三阶段：首页改成 AI 工作台

首页结构调整为：

```text
顶部：AI 任务输入区
中部：AI 推荐任务 + 对话任务卡
下方：模板中心 + 资料包中心 + 最近报告任务
```

首页必须能展示：

- AI 推荐任务。
- 当前 AI 任务卡。
- 执行进度卡。
- 执行结果卡。
- 模板中心。
- 资料包中心。

关键点：

- AI 任务卡是主视觉。
- 模板和资料包是辅助工作区。
- 不要让统计卡成为主视觉。

## 7. 第四阶段：实现任务卡动作

在 `SmartReportPage.vue` 中实现任务动作处理。

建议函数：

```js
handleAiGoalSubmit()
createAiTaskCard()
runAiTaskAction(action)
completeAiTaskExecution()
applyTaskResult()
```

动作类型至少支持：

- `open-report`
- `check-missing-materials`
- `start-regenerate`
- `apply-template`
- `upload-template`
- `parse-template`
- `apply-ai-edit`
- `supplement-material`
- `export-package`
- `submit-check`

每个动作必须至少做一件状态变化：

- 切换当前任务状态。
- 更新报告状态。
- 更新资料状态。
- 更新模板状态。
- 更新章节状态。
- 更新交付检查状态。
- 打开对应编辑视图。

## 8. 第五阶段：打通报告上下文

实现：

```text
activeReport
activeTemplate
activeMaterialPackage
activeReportSections
activePendingConfirmations
activeDeliveryCheckItems
```

要求：

- 打开不同报告，模板不同。
- 打开不同报告，资料包不同。
- 打开不同报告，章节不同。
- 打开不同报告，交付检查不同。
- 不要固定使用 `materialPackages[0]`。

## 9. 第六阶段：关键闭环

### 9.1 AI 修改闭环

- 生成修改建议卡。
- 用户点击应用。
- 正文更新。
- 章节状态更新。
- 待确认数减少。

### 9.2 资料补充闭环

- 点击补充资料。
- 资料状态变化。
- 资料包缺失数变化。
- 交付检查项变化。

### 9.3 模板重排闭环

- 点击开始重排。
- 展示进度。
- 展示章节映射结果。
- 应用后报告模板信息变化。

### 9.4 导出闭环

- AI 生成导出建议。
- 用户确认导出内容。
- 报告状态变为已导出或待提交。

### 9.5 提交检查闭环

- 有 block 项时阻断。
- 只有 warn 项时允许强制提交。
- 全部通过时状态变为已提交确认。

## 10. UI 要求

整体风格：

- 专业、克制、可信。
- 银行客户经理工作台。
- 不要营销页。
- 不要普通 SaaS 看板。
- 必须和项目现有整体 UI 风格一致。
- 沿用当前系统的导航、间距、字号、色彩、卡片、按钮和表格风格。
- 不要引入新的视觉体系，不要做成独立的新产品皮肤。

AI 任务卡：

- 要明显。
- 要有任务理解。
- 要有步骤。
- 要有动作按钮。
- 要有执行状态。
- 要有结果反馈。
- 要像工作台里的任务卡，不要像营销页宣传卡。
- 卡片边框、圆角、阴影、背景色要和现有页面一致。
- 任务卡里的按钮要使用现有按钮风格，主按钮突出，次按钮克制。

模板中心：

- 支持搜索和筛选。
- 显示多银行、多机构、多状态。
- 不要只像 3 张卡片。
- 模板列表应适合大量模板浏览，优先使用紧凑列表、表格式信息或密度较高的卡片。
- 不要使用过大的营销型卡片。

资料包中心：

- 显示缺失资料和关联报告。
- 支持进入 AI 补资料任务。
- 资料状态、缺失状态、已修改状态要使用项目已有状态色体系。

### 10.1 统一 UI 规范

实现时必须遵守以下 UI 规范：

1. 视觉一致性
   - 使用项目现有 CSS 变量，例如 `--color-primary`、`--text-primary`、`--surface-card`、`--border-default`、`--radius-md`、`--space-md` 等。
   - 不要新增大面积渐变、发光、玻璃拟态、夸张阴影或装饰背景。
   - 页面应继续像银行业务系统，不要像营销落地页。

2. 布局一致性
   - 保持当前智能报告页面的工作台容器风格。
   - 首页可以重构，但不要破坏左侧导航和全局布局。
   - 编辑页继续保持三栏工作台思路：目录、正文、右侧助手/资料/检查。
   - 不要让 AI 任务卡遮挡报告正文、资料包或底部输入区。

3. 信息密度
   - 银行客户经理需要快速扫描任务、模板、资料状态，界面不能过空。
   - 首页主视觉给 AI 任务台，但模板中心和资料包中心仍要有足够业务信息。
   - 模板中心面对 8 到 12 个模板时仍要可读、可筛选、可扫描。

4. 组件风格
   - 优先复用当前项目已经使用的 Element Plus 组件和现有按钮样式。
   - 如果新增组件，放在 `src/components/report/`，并保持命名、class 风格和现有代码一致。
   - 操作按钮不要过多堆叠，主要动作放在 AI 任务卡里，列表内只保留必要辅助动作。

5. 状态表达
   - 待确认使用橙色/警示语义。
   - 资料缺失/阻断项使用红色/危险语义。
   - 已完成/已导出/已通过使用绿色/成功语义。
   - 已修改/处理中使用蓝色或信息语义。
   - 状态标签样式要和现有 `sr-badge`、`sr-check-item` 等风格保持一致。

6. 交互反馈
   - 点击 AI 任务按钮后必须有明确反馈：执行中、已完成、失败或下一步。
   - 不要只弹 `ElMessage`，页面内也要有任务卡状态变化。
   - 弹窗、抽屉、任务卡的关闭和返回行为要清晰。

7. 响应式
   - 宽屏下保持工作台信息密度。
   - 小屏下允许上下堆叠，但不能出现文字遮挡、按钮溢出、三栏挤压。
   - 文本过长时要换行或截断，不能撑破卡片。

8. 文案风格
   - 文案要像银行业务工作台，简洁、明确、可信。
   - 不要使用营销式表达，例如“开启智能新时代”“一键赋能”等。
   - AI 回复要说明识别结果、执行步骤、风险和下一步动作。

## 11. 验收标准

产品验收：

- 首页第一入口是 AI 任务输入。
- 用户输入目标后能生成 AI 任务卡。
- AI 任务卡有动作按钮。
- 点击动作按钮会改变页面或 mock 状态。
- 首页仍有模板中心和资料包中心，但不是主交互。
- 模板至少 8 到 12 个，并支持银行/机构/类型/状态。
- 打开不同报告时上下文不同。
- AI 修改、补资料、模板重排、导出、提交都有状态闭环。

工程验收：

- `npm run build` 通过。
- `/smart-report` 不空白。
- 浏览器控制台无明显报错。
- 不修改智能尽调、企业探查、路由、侧边栏。
- 保留 `mockSmartReport.js` 旧导出兼容。

## 12. 输出要求

完成后请输出：

1. 修改了哪些文件。
2. 新增了哪些 AI 任务卡 mock 数据。
3. 首页如何体现对话驱动。
4. 哪些按钮已经进入 AI 任务卡。
5. 哪些动作会改变 mock 状态。
6. 报告上下文如何绑定。
7. 是否运行 `npm run build`。
