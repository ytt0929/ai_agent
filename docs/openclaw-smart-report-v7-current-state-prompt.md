# OpenClaw Prompt V7：基于当前状态补齐智能报告 AI 工作台

请修改 `D:\demo\ai-copilot` 项目中的“智能报告”功能。

请先阅读：

```text
D:\demo\ai-copilot\docs\smart-report-ai-workbench-product-blueprint.md
D:\demo\ai-copilot\docs\openclaw-smart-report-v6-ai-workbench-prompt.md
```

再阅读当前代码：

```text
src/pages/SmartReportPage.vue
src/data/mockSmartReport.js
src/stores/smartReport.js
src/components/GlobalInputBar.vue
```

## 1. 当前代码状态

当前项目已经可以 `npm run build` 通过。

智能报告已经有以下基础：

- 多银行/机构 mock：`bankOrgs`、`orgUnits`
- 多模板 mock：`reportTemplates`
- AI 推荐任务：`aiRecommendedTasks`
- AI 任务卡预设：`aiTaskCardPresets`
- AI 执行结果预设：`aiTaskExecutions`
- 报告任务：`reportTasks`
- 报告编辑器
- 模板详情弹窗
- 模板解析弹窗
- AI 修改建议弹窗
- 交付检查弹窗
- 导出弹窗
- 按新模板生成弹窗

但当前主要问题是：

1. 页面仍偏传统 SaaS 工作台
   - 仍是 AI 输入框 + 统计卡 + 报告列表 + 模板列表 + 资料包列表。
   - 关键动作仍在列表按钮和弹窗里。
   - AI 推荐任务和 AI 任务卡 mock 已经有了，但还没有成为首页主交互。

2. 报告上下文没有打通
   - 当前页面仍大量使用全局 `reportSections`。
   - 右侧章节资料仍可能固定使用 `materialPackages[0]`。
   - 打开不同报告时，模板、资料包、章节、交付检查不一定随报告切换。

3. 状态闭环不足
   - 补充资料、重新生成、导出等动作仍有不少只是 `ElMessage`。
   - 点击动作后 mock 状态变化不够明确。

4. 有越界风险
   - 当前工作区里 `src/pages/EnterpriseExplorationWorkspacePage.vue` 曾被修改。
   - 本次不要继续修改企业探查相关文件。

## 2. 本次目标

本次不要继续堆新弹窗，不要继续扩散页面。

本次只做三个重点：

```text
1. 让首页真正变成 AI 任务卡驱动
2. 打通 activeReport 上下文
3. 让关键动作推动 mock 状态变化
```

最终体验应该是：

```text
用户输入目标或点击 AI 推荐任务
-> AI 生成任务理解卡
-> 用户点击任务卡里的动作
-> 系统执行并更新当前报告/资料/模板/检查状态
-> AI 返回执行结果卡和下一步建议
```

## 3. 修改边界

允许修改：

```text
src/pages/SmartReportPage.vue
src/data/mockSmartReport.js
```

必要时允许新增：

```text
src/components/report/AiTaskConsole.vue
src/components/report/AiTaskCard.vue
```

尽量不要修改：

```text
src/stores/smartReport.js
src/components/GlobalInputBar.vue
```

严禁修改：

```text
src/pages/EnterpriseExplorationWorkspacePage.vue
src/pages/DueDiligenceTaskPage.vue
src/stores/dueDiligence.js
src/data/mockDueDiligence.js
src/stores/workbenchAssistant.js
路由结构
侧边栏结构
企业探查相关模块
智能尽调入口逻辑
```

`mockSmartReport.js` 必须保留旧导出兼容：

```js
export const reportTemplates = []
export const dataSources = []
export const reportHistory = []
export function getReportContent(templateId, enterprise) {}
```

也必须继续导出当前 `SmartReportPage.vue` 已依赖的数据：

```js
export const materialPackages = []
export const uploadEntryOptions = []
export const reportSections = []
export const pendingConfirmations = []
export const aiDeliveryActions = []
export const exportPackages = []
export const templateParseResult = {}
export const templateMappingPreview = []
export const deliveryCheckItems = []
```

## 4. 第一阶段：补齐报告上下文 mock

请在 `mockSmartReport.js` 中补齐按报告维度组织的数据。

新增：

```js
export const reportSectionsByReport = {}
export const pendingConfirmationsByReport = {}
export const deliveryCheckItemsByReport = {}
```

要求：

- 至少为 `RPT-001`、`RPT-002`、`RPT-003` 各准备一套章节。
- 至少为 `RPT-001`、`RPT-002`、`RPT-003` 各准备待确认项。
- 至少为 `RPT-001`、`RPT-002`、`RPT-003` 各准备交付检查项。
- `RPT-001` 偏待确认。
- `RPT-002` 偏资料缺失。
- `RPT-003` 偏可导出。

保留兼容：

```js
export const reportSections = reportSectionsByReport['RPT-001']
export const pendingConfirmations = pendingConfirmationsByReport['RPT-001']
export const deliveryCheckItems = deliveryCheckItemsByReport['RPT-001']
```

## 5. 第二阶段：打通 activeReport 上下文

在 `SmartReportPage.vue` 中建立以下 computed 或等价逻辑：

```js
activeTemplate
activeMaterialPackage
activeReportSections
activePendingConfirmations
activeDeliveryCheckItems
currentSectionMaterials
```

要求：

- `openReport(task)` 后，根据 `task.templateId` 找当前模板。
- 根据 `task.materialPackageId` 找当前资料包。
- 根据 `task.id` 找当前报告章节。
- 根据 `task.id` 找当前待确认项。
- 根据 `task.id` 找当前交付检查项。
- 右侧资料依据必须来自 `activeMaterialPackage`，不要固定使用 `materialPackages[0]`。
- 左侧目录和中间正文必须来自 `activeReportSections`，不要固定使用全局 `reportSections`。
- 提交检查必须来自 `activeDeliveryCheckItems`。

验收：

- 打开明达精工、宁波天合、杭州智造，右侧资料包不同。
- 打开不同报告，交付检查项不同。
- AI 修改只影响当前报告当前章节。

## 6. 第三阶段：首页 AI 任务卡主交互

当前首页的 AI 输入框要升级为真正的 AI 任务台。

首页结构建议：

```text
顶部：标题 + AI 任务输入
主区域：AI 推荐任务 + 当前 AI 任务卡
辅助区：报告任务队列 + 模板中心 + 资料包中心
```

请渲染 `aiRecommendedTasks`。

点击 AI 推荐任务后：

```text
找到对应 aiTaskCardPreset
-> 生成当前任务卡 currentAiTask
-> 展示任务理解、步骤、动作按钮
```

用户输入目标后：

```text
根据关键词匹配任务类型
-> 生成 currentAiTask
```

至少支持这些关键词：

- 待确认 / 修改报告
- 缺资料 / 补资料
- 上传模板 / 解析模板
- 新模板 / 重排
- 导出 / 交付包

任务卡必须显示：

- 用户目标
- 识别到的报告/企业/模板/资料包
- 建议执行步骤
- 动作按钮
- 执行状态
- 执行结果
- 下一步建议

## 7. 第四阶段：任务卡动作必须改变状态

请实现统一动作处理函数，例如：

```js
runAiTaskAction(action)
```

至少支持：

```text
open-report
check-missing-materials
start-regenerate
apply-template
upload-template
parse-template
apply-ai-edit
supplement-material
export-package
submit-check
process-pending
```

动作要求：

### 7.1 check-missing-materials

- 展示缺失资料结果卡。
- 如果当前报告有缺失资料，列出缺失项。
- 不要只弹 message。

### 7.2 start-regenerate

- 将任务步骤改为执行中/已完成。
- 展示章节映射结果。
- 生成“应用新模板”动作。

### 7.3 apply-template

- 更新当前报告的 `templateId`、`templateName`、`templateVersion` 或等价状态。
- 报告状态变成“待确认”或“已按新模板生成”。
- 展示结果卡。

### 7.4 supplement-material

- 将相关缺失资料状态改成“处理中”或“已关联”。
- 更新资料包缺失数或显示状态变化。
- 更新相关交付检查项状态。

### 7.5 apply-ai-edit

- 弹出或展示 AI 修改建议。
- 用户应用后更新正文。
- 当前章节状态变成“已修改”或“已确认”。
- 当前报告待确认数减少。

### 7.6 export-package

- 展示导出内容选择或导出结果卡。
- 当前报告状态变成“已导出”。

### 7.7 submit-check

- 如果有 block 项，展示阻断结果卡。
- 如果只有 warn 项，允许强制提交。
- 如果全部通过，报告状态变成“已提交确认”。

## 8. UI 规范

必须和现有项目 UI 一致。

要求：

- 使用当前 CSS 变量：`--color-primary`、`--text-primary`、`--surface-card`、`--border-default`、`--radius-md`、`--space-md` 等。
- 不要新做一套视觉体系。
- 不要做大面积渐变、玻璃拟态、发光效果、营销风格。
- AI 任务卡要像银行工作台里的任务卡。
- 模板中心要适合多模板扫描，不要做大卡片堆叠。
- 状态色保持一致：
  - 待确认：橙色
  - 缺失/阻断：红色
  - 已完成/已导出：绿色
  - 处理中/已修改：蓝色或信息色
- 列表按钮要克制，关键动作放进 AI 任务卡。
- 页面不能出现文字溢出、按钮挤压、三栏重叠。

## 9. 不要做的事

不要：

- 不要继续只加弹窗。
- 不要把首页做成纯 SaaS 卡片列表。
- 不要把所有动作都放在列表按钮里。
- 不要只用 `ElMessage` 反馈关键动作。
- 不要修改企业探查。
- 不要修改智能尽调。
- 不要改路由和侧边栏。

## 10. 验收标准

完成后必须满足：

### 构建

- `npm run build` 通过。
- `/smart-report` 不空白。
- 浏览器控制台无明显报错。

### 产品

- 首页第一入口是 AI 任务输入。
- 首页能看到 AI 推荐任务。
- 点击推荐任务能生成 AI 任务卡。
- 任务卡有动作按钮、步骤、结果和下一步建议。
- 点击任务卡动作会改变页面或 mock 状态。
- 报告列表、模板中心、资料包中心仍存在，但作为辅助区。
- 打开不同报告时，模板、资料包、章节、检查项不同。
- 不再固定使用 `materialPackages[0]`。
- AI 修改、补资料、模板重排、导出、提交至少各有一个状态闭环。

### 边界

- 不修改企业探查。
- 不修改智能尽调。
- 不修改路由和侧边栏。
- 保留 `mockSmartReport.js` 旧导出兼容。

## 11. 输出要求

完成后请说明：

1. 修改了哪些文件。
2. 是否新增组件。
3. 如何实现 AI 任务卡。
4. 如何绑定 activeReport 上下文。
5. 哪些动作会改变 mock 状态。
6. 是否运行 `npm run build`。
7. 如果有未完成项，请列出。

