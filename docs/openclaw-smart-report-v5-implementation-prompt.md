# OpenClaw Prompt V5：智能报告底层 mock 与产品闭环实现

请修改 `D:\demo\ai-copilot` 项目中的“智能报告”功能。

本次请先阅读产品蓝图：

```text
D:\demo\ai-copilot\docs\smart-report-product-blueprint.md
```

再阅读当前代码：

- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`
- `src/components/GlobalInputBar.vue`
- `src/stores/smartReport.js`

## 1. 本次角色定位

你本次是：

- 资深 AI 产品经理
- 资深银行业务产品经理
- 资深 UX/UI 工程师
- 资深 Vue 前端工程师

不要重新发散产品方向。请按照已有产品目标，把当前智能报告从“1.5 阶段原型”推进到“2.5 阶段产品原型”。

目标定位：

```text
智能报告 = AI 报告交付工作台
```

它由四个核心能力组成：

```text
AI 交付任务 + 模板中心 + 资料包中心 + 报告编辑器
```

## 2. 当前现状

当前代码已经有：

- 首页工作台
- AI 任务输入
- 报告任务列表
- 模板维护雏形
- 资料包列表
- 上传资料生成报告流程
- 生成中状态
- 三栏报告编辑器
- 章节资料依据
- 资料详情和摘要修改
- AI 修改建议弹窗
- 应用 AI 修改
- 按新模板生成弹窗
- 章节映射预览
- 导出选项弹窗
- 提交前交付检查

但当前主要问题是：

- 模板只有少量演示数据，不能支撑多银行、多机构、多业务类型。
- 首页仍偏列表和卡片，不像完整 AI 交付工作台。
- 报告、模板、资料包、章节、交付检查之间没有完整上下文绑定。
- 打开不同报告时，右侧资料包可能仍使用固定资料包。
- 上传资料后没有形成新的报告任务或资料包对象。
- 按新模板生成后没有真正更新报告模板信息或章节版本。
- 补充资料、处理阻断项很多只是 message，没有推动状态变化。

## 3. 本次目标

本次目标不是追求真实后端，而是把智能报告的产品底层 mock 起来，让页面交互更像真实产品。

需要完成：

1. 建立可扩展 mock 数据关系。
2. 把首页重构为三中心工作台。
3. 打通报告上下文。
4. 补齐关键状态闭环。
5. 保持智能尽调、路由、侧边栏不受影响。

## 4. 修改边界

优先允许修改：

- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`

必要时允许新增：

- `src/components/report/ReportDeliveryTasks.vue`
- `src/components/report/TemplateCenter.vue`
- `src/components/report/MaterialPackageCenter.vue`
- `src/components/report/ReportEditorWorkspace.vue`

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

## 5. 第一阶段：重建 mock 数据关系

请优先改 `mockSmartReport.js`。

### 5.1 新增银行/机构数据

新增：

```js
export const bankOrgs = []
```

至少 mock 5 个机构：

- 华东银行总行
- 华东银行浙江分行
- 华东银行宁波分行
- 城商银行小微事业部
- 农商银行公司金融部

字段建议：

```js
{
  id,
  bankName,
  orgName,
  orgLevel,
  parentOrgId,
  region,
  enabledTemplateCount
}
```

### 5.2 扩展模板库

`reportTemplates` 不要只有 3 个。请扩展到至少 8 到 12 个，覆盖不同银行、不同机构、不同业务类型。

模板字段至少包含：

```js
{
  id,
  bankId,
  bankName,
  orgId,
  orgName,
  name,
  type,
  businessLine,
  scenario,
  version,
  status,
  isDefaultForOrg,
  sectionsCount,
  requiredMaterials,
  ownerDepartment,
  updatedAt,
  usageCount,
  chapters,
  versions
}
```

模板类型至少覆盖：

- 单户授信调查报告
- 小微信贷调查报告
- 集团客户授信调查报告
- 企业全景报告
- 企业诊断报告
- 贷后检查报告
- 押品调查报告
- 风险排查报告

模板状态至少覆盖：

- 草稿
- 待审核
- 已启用
- 已停用
- 已归档

### 5.3 报告任务绑定模板和资料包

扩展 `reportTasks`，每条任务必须绑定：

```js
templateId
materialPackageId
reportType
templateVersion
aiNextAction
```

不要只展示 `templateName`。

### 5.4 报告章节改成按 reportId 组织

新增或重构：

```js
export const reportSectionsByReport = {}
```

结构示例：

```js
{
  'RPT-001': [...sections],
  'RPT-002': [...sections],
  'RPT-003': [...sections]
}
```

保留旧导出：

```js
export const reportSections = reportSectionsByReport['RPT-001']
```

### 5.5 交付检查按 reportId 组织

新增：

```js
export const deliveryCheckItemsByReport = {}
```

保留旧导出：

```js
export const deliveryCheckItems = deliveryCheckItemsByReport['RPT-001']
```

### 5.6 待确认项按 reportId 组织

新增：

```js
export const pendingConfirmationsByReport = {}
```

保留旧导出：

```js
export const pendingConfirmations = pendingConfirmationsByReport['RPT-001']
```

## 6. 第二阶段：首页升级为三中心

请把 `/smart-report` 首页调整成：

```text
顶部：智能报告工作台 + AI 任务输入

主工作区：
1. AI 交付任务
2. 模板中心
3. 资料包中心
```

### 6.1 AI 交付任务

展示：

- 企业名称
- 报告类型
- 来源
- 模板版本
- 资料完整度
- 待确认项
- 缺失资料
- AI 下一步建议
- 操作：继续编辑、补充资料、按新模板、导出

### 6.2 模板中心

模板中心不能只是 3 张卡片。需要支持：

- 搜索模板
- 按银行/机构筛选
- 按业务类型筛选
- 按模板状态筛选
- 模板列表
- 查看结构
- 上传新版本
- 设为机构默认模板
- 用此模板生成报告

模板列表展示：

- 模板名称
- 银行/机构
- 业务类型
- 当前版本
- 状态
- 章节数
- 必需资料数
- 使用次数
- 更新时间

### 6.3 资料包中心

展示：

- 资料包名称
- 企业名称
- 来源
- 关联报告数
- 资料数量
- 缺失数量
- 更新时间
- 操作：查看资料、补充资料、关联报告

## 7. 第三阶段：打通报告上下文

当前最关键的问题是：打开报告后，要使用这份报告自己的上下文。

请实现：

```text
activeReport
-> activeTemplate
-> activeMaterialPackage
-> activeReportSections
-> activePendingConfirmations
-> activeDeliveryCheckItems
```

具体要求：

- `openReport(task)` 时，根据 `task.templateId` 找模板。
- 根据 `task.materialPackageId` 找资料包。
- 根据 `task.id` 找章节。
- 根据 `task.id` 找待确认项。
- 根据 `task.id` 找交付检查项。
- 右侧资料依据只展示当前报告当前章节关联资料。
- 不要固定使用 `materialPackages[0]`。

验收：

- 打开不同报告，模板信息不同。
- 打开不同报告，资料包不同。
- 打开不同报告，章节和交付检查项不同。

## 8. 第四阶段：补齐状态闭环

不要让关键按钮只是 message。

### 8.1 AI 修改闭环

已有 AI 修改建议弹窗，请保留并增强。

要求：

- 点击 AI 快捷动作后生成修改建议卡。
- 用户点击应用后，正文实际更新。
- 当前章节状态变成“已修改”或“已确认”。
- 对应待确认项变成已确认。
- 当前报告 pendingCount 减少。

### 8.2 资料补充闭环

点击补充资料后：

- 对应资料状态从“缺失”变成“处理中”或“已关联”。
- 资料包 missingCount 减少或状态变化。
- 关联交付检查项从“未解决”变成“处理中”或“已解决”。
- 页面有明确反馈。

### 8.3 按新模板生成闭环

点击确认生成后：

- 当前报告 templateId/templateName/templateVersion 更新。
- 展示章节映射结果。
- 报告状态变成“已按新模板生成”或“待确认”。
- 可以保留旧正文，但要体现新模板已应用。

### 8.4 导出闭环

导出后：

- 当前报告状态变成“已导出”或“待提交”。
- 首页任务状态同步变化。
- 显示导出内容。

### 8.5 提交检查闭环

提交确认时：

- 如果有 block 项，弹出阻断项。
- 如果只有 warn 项，允许用户强制提交。
- 如果全部通过，报告状态变成“已提交确认”。

## 9. UI/UX 要求

整体风格：

- 专业、可信、克制。
- 像银行客户经理日常工作台。
- 不要做营销页。
- 不要做普通 SaaS 数据看板。

首页：

- AI 任务输入是第一入口。
- 三中心结构清晰。
- 统计卡可以保留，但弱化。
- 模板中心要像可维护的资产库。

编辑页：

- 三栏布局保留。
- 左侧目录稳定。
- 中间正文适合长时间阅读编辑。
- 右侧资料依据、交付检查、AI 助手不要互相挤压。
- 如右侧过长，可以使用分区或 tabs。

交互：

- 所有关键动作必须有状态反馈。
- AI 修改必须先预览再应用。
- 缺失资料、待确认、阻断项要醒目。

## 10. 验收标准

### 产品验收

- `/smart-report` 默认显示智能报告工作台。
- 首页包含 AI 交付任务、模板中心、资料包中心。
- 模板中心至少展示 8 到 12 个模板。
- 模板支持银行/机构、业务类型、状态筛选。
- 模板详情能展示章节结构、资料要求、版本记录。
- 上传模板能展示 AI 解析结果。
- 打开不同报告时，模板、资料包、章节、交付检查不同。
- AI 修改建议能应用到正文。
- 补充资料能改变资料或检查状态。
- 按新模板生成能更新当前报告模板信息。
- 导出和提交能改变报告状态或展示检查结果。

### 工程验收

- `npm run build` 通过。
- 浏览器控制台无明显报错。
- `/smart-report` 不空白。
- 不修改智能尽调页面、store、mock。
- 不修改路由结构。
- 不修改侧边栏结构。
- `mockSmartReport.js` 旧导出兼容保留。

## 11. 输出要求

完成后请输出：

1. 修改了哪些文件。
2. 新增了哪些 mock 数据模型。
3. 首页三中心如何交互。
4. 报告上下文如何绑定。
5. 哪些按钮已经形成状态闭环。
6. 是否运行 `npm run build`。
7. 如果没有运行，请说明原因。

