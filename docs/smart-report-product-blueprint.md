# 智能报告产品蓝图：AI 报告交付工作台

## 1. 产品定位

智能报告不是普通报告管理页，也不是企业问数工具。

它的核心定位是：

```text
AI 报告交付工作台
```

一句话定义：

```text
智能报告负责维护报告模板、资料包和报告正文，把智能尽调产物或用户上传资料转换成可修改、可追溯、可导出、可提交确认的正式报告。
```

它解决的是银行客户经理在报告交付中的问题：

- 报告模板多，版本多，不同银行和分支机构要求不一样。
- 尽调材料分散，资料和报告章节之间缺少清晰关系。
- 已生成报告仍有大量待确认、待补充、待改写内容。
- 客户经理需要按新模板快速重排旧报告。
- 报告提交前需要检查资料缺口、待确认项和导出附件。
- 报告正文需要 AI 快速改写，但必须可预览、可应用、可追溯。

## 2. 产品边界

智能报告负责：

- 模板中心：维护多银行、多业务、多版本报告模板。
- 资料包中心：维护客户资料包、尽调证据包、补充资料。
- 报告生成：从尽调产物或上传资料生成报告草稿。
- 报告编辑：编辑章节正文，查看章节证据。
- AI 改写：对报告正文进行局部改写、压缩、审批口吻转换。
- 新模板重排：把旧报告按新模板重新组织。
- 交付检查：检查待确认、缺资料、规则风险和导出内容。
- 导出提交：导出报告、附件清单、资料包、证据目录。

智能报告不负责：

- 问企业经营数据。
- 计算经营指标。
- 找企业异常。
- 解释风险评分。
- 追问异常原因。
- 替代智能尽调核验。

模块关系：

```text
企业探查：数据到洞察
智能尽调：资料到尽调结论
智能报告：资料到报告，报告到交付
```

## 3. 用户与核心场景

### 3.1 银行客户经理处理待确认报告

用户目标：

```text
快速处理由智能尽调生成的待确认报告。
```

交互路径：

```text
进入智能报告
-> 查看 AI 交付任务
-> 打开待确认报告
-> 定位待确认章节
-> 查看章节资料依据
-> 使用 AI 改写或人工修改
-> 应用修改
-> 待确认项减少
-> 提交前检查
-> 导出或提交确认
```

解决问题：

- 不需要从完整报告里人工找问题。
- 能看到每个待确认内容对应的章节和资料。
- AI 修改不是直接覆盖，而是先预览再应用。

### 3.2 用户上传资料附件生成报告

用户目标：

```text
只有一批附件时，快速按照选定模板生成报告草稿。
```

交互路径：

```text
首页点击上传资料生成报告
-> 选择报告模板
-> 上传资料附件
-> AI 识别资料类型
-> 展示已识别资料和缺失资料
-> 匹配模板章节资料要求
-> 生成报告草稿
-> 进入报告编辑器
```

解决问题：

- 不依赖完整智能尽调流程，也能先生成报告草稿。
- 缺失资料在生成前被提示。
- 生成后能继续补资料和改正文。

### 3.3 模板管理员维护多银行模板

用户目标：

```text
维护不同银行、不同机构、不同业务类型的报告模板。
```

交互路径：

```text
进入模板中心
-> 按银行/机构/业务类型筛选模板
-> 查看模板章节结构
-> 查看每章资料要求
-> 上传新版本模板
-> AI 解析章节、占位字段、资料要求
-> 查看解析警告
-> 确认发布或设为默认模板
```

解决问题：

- 模板不是固定 3 个，而是可持续维护的模板资产。
- 不同银行和分行可以有自己的模板。
- 模板版本和章节资料规则可追踪。

### 3.4 客户经理按新模板重排旧报告

用户目标：

```text
银行模板变更后，快速把旧报告迁移到新模板。
```

交互路径：

```text
打开报告
-> 点击按新模板生成
-> 选择目标模板
-> 查看章节映射预览
-> 确认生成
-> 生成新版本报告
-> 标记新增、合并、未映射章节
```

解决问题：

- 避免人工复制粘贴旧报告。
- 能清楚看到哪些章节被迁移、合并或新增。
- 新模板缺失资料要求可以提前提示。

### 3.5 用户查看章节资料依据并修改资料包

用户目标：

```text
确认某一章节为什么这么写，并修正资料识别摘要。
```

交互路径：

```text
打开报告编辑器
-> 点击某一章节
-> 右侧显示本章资料依据
-> 打开资料详情
-> 查看来源、状态、置信度、摘要
-> 修改资料摘要
-> 标记资料已修改
-> 重新生成本节
```

解决问题：

- 报告正文不再是黑盒生成。
- 客户经理能追溯每章资料来源。
- 资料摘要修改后可以影响章节正文。

### 3.6 报告导出和提交前检查

用户目标：

```text
在导出或提交前确认报告是否具备交付条件。
```

交互路径：

```text
点击提交确认
-> 系统检查阻断项
-> 展示缺失资料、待确认项、规则风险
-> 用户处理或强制带缺口提交
-> 点击导出
-> 选择报告正文、附件清单、资料包、证据目录
-> 生成导出任务
```

解决问题：

- 防止资料缺失时静默提交。
- 导出内容可控。
- 报告和资料包可以一起交付。

## 4. 功能地图

```text
智能报告

1. AI 交付任务
   - 待确认报告
   - 资料缺失报告
   - 待导出报告
   - AI 下一步建议
   - 继续编辑
   - 补充资料
   - 按新模板生成
   - 导出

2. 模板中心
   - 多银行模板库
   - 机构/业务类型筛选
   - 模板搜索
   - 模板详情
   - 章节结构
   - 章节资料要求
   - 占位字段
   - 版本记录
   - 上传新模板
   - AI 解析模板
   - 设为机构默认模板
   - 新旧模板差异/映射

3. 资料包中心
   - 客户资料包
   - 尽调证据包
   - 补充资料包
   - 资料详情
   - 识别摘要
   - 资料状态
   - 关联章节
   - 是否参与生成
   - 置信度
   - 修改资料摘要
   - 补充资料

4. 报告生成器
   - 从智能尽调产物生成
   - 上传资料生成
   - 上传旧报告按新模板生成
   - 选择模板
   - 识别资料
   - 匹配章节资料要求
   - 生成报告草稿
   - 标记待确认/缺资料

5. 报告编辑器
   - 报告目录
   - 章节正文
   - 表格内容
   - 风险事项
   - 资料依据
   - 手工编辑
   - 保存草稿
   - 重新生成本节

6. AI 报告助手
   - 改写当前章节
   - 压缩本节内容
   - 改成审批口吻
   - 补齐待确认说明
   - 检查缺失资料
   - 查看引用资料
   - 生成修改建议
   - 应用/放弃修改

7. 交付检查
   - 阻断项
   - 待确认项
   - 可跳过提示
   - 禁用词/规则风险
   - 未关联资料
   - 检查结果弹窗
   - 强制提交说明

8. 导出提交
   - 导出 Word 报告
   - 导出附件清单
   - 导出资料包
   - 导出证据目录
   - 提交确认
   - 导出任务反馈
```

## 5. 当前代码实现阶段

当前实现已经有：

- 首页工作台。
- AI 任务输入。
- 报告任务列表。
- 模板维护雏形。
- 资料包列表。
- 上传资料生成流程。
- 生成中步骤。
- 三栏报告编辑器。
- 章节资料依据。
- 资料详情和摘要修改。
- AI 修改建议弹窗。
- 应用 AI 修改。
- 按新模板生成弹窗。
- 章节映射预览。
- 导出选项弹窗。
- 提交前交付检查。

当前主要不足：

- 模板仍是少量演示数据，不支持多银行、多机构、多业务类型。
- 模板中心没有搜索、筛选、分类、审核、发布、停用。
- 报告、模板、资料包、章节之间还不是完整上下文绑定。
- 上传资料后没有生成真正的新报告对象。
- 按新模板生成后没有真正替换章节结构或生成新版本。
- 补充资料只是提示，没有改变缺失资料和交付检查状态。
- 自然语言 AI 输入和快捷按钮行为不完全一致。
- 资料包中心只是列表和右侧依据，不是完整资料生命周期管理。

阶段判断：

```text
当前约等于 AI 报告交付工作台 1.5 到 2.0 阶段。
```

下一阶段目标：

```text
把它升级为具备多银行模板中心、资料包中心、报告上下文模型的 2.5 阶段产品原型。
```

## 6. 产品底层 mock 模型规划

为了让 OpenClaw 能把产品底层 mock 起来，建议不要继续只堆页面数据，而是建立清晰的数据关系。

### 6.1 银行/机构模型

```js
bankOrgs = [
  {
    id,
    bankName,
    orgName,
    orgLevel, // 总行 / 分行 / 支行 / 事业部
    parentOrgId,
    region,
    enabledTemplateCount
  }
]
```

用途：

- 支持不同银行、不同分行维护不同模板。
- 支持设置“本机构默认模板”。

### 6.2 模板模型

```js
reportTemplates = [
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
    status, // 草稿 / 待审核 / 已启用 / 已停用 / 已归档
    isDefaultForOrg,
    sectionsCount,
    requiredMaterialsCount,
    ownerDepartment,
    updatedAt,
    usageCount,
    chapters,
    versions
  }
]
```

模板数量建议至少 mock 8 到 12 个，覆盖：

- 不同银行。
- 不同分行。
- 不同业务条线。
- 不同报告类型。
- 不同状态。

### 6.3 模板章节模型

```js
templateChapters = [
  {
    templateId,
    chapterId,
    no,
    title,
    requiredMaterials,
    optionalMaterials,
    blockingMissingMaterials,
    placeholders,
    generationRule,
    reviewRule
  }
]
```

用途：

- 让报告生成能够匹配章节资料要求。
- 让模板详情能展示章节结构。
- 让缺资料提示有规则来源。

### 6.4 模板解析模型

```js
templateParseResults = [
  {
    id,
    fileName,
    bankName,
    targetTemplateName,
    status,
    recognizedChapters,
    placeholders,
    requiredMaterials,
    warnings,
    createdAt
  }
]
```

用途：

- 模拟上传 Word 模板。
- AI 解析章节、字段、资料要求和警告。

### 6.5 资料包模型

```js
materialPackages = [
  {
    id,
    enterpriseId,
    enterpriseName,
    packageName,
    source, // 智能尽调 / 用户上传 / 资料识别 / 人工补充
    relatedReportIds,
    materialCount,
    missingCount,
    updatedAt,
    materials
  }
]
```

### 6.6 资料模型

```js
materials = [
  {
    id,
    packageId,
    name,
    type,
    source,
    status, // 已关联 / 缺失 / 待确认 / 已修改 / 已替换
    relatedSectionIds,
    extractedSummary,
    usedInGeneration,
    confidence,
    updatedAt
  }
]
```

用途：

- 支持章节资料追溯。
- 支持资料摘要修改。
- 支持补充资料后状态变化。

### 6.7 报告任务模型

```js
reportTasks = [
  {
    id,
    enterpriseId,
    enterpriseName,
    reportName,
    reportType,
    source,
    templateId,
    templateName,
    templateVersion,
    materialPackageId,
    status,
    materialComplete,
    pendingCount,
    missingMaterials,
    aiNextAction,
    updatedAt
  }
]
```

用途：

- 首页 AI 交付任务。
- 打开报告时能绑定模板、资料包、章节和检查项。

### 6.8 报告章节模型

```js
reportSections = [
  {
    reportId,
    sectionId,
    templateChapterId,
    no,
    title,
    status,
    materialStatus,
    relatedMaterialIds,
    aiNote,
    body,
    table,
    risks,
    lastModifiedBy,
    updatedAt
  }
]
```

用途：

- 不同报告应该有自己的章节，而不是全局共用同一组章节。
- AI 修改只影响当前报告当前章节。

### 6.9 待确认项模型

```js
pendingConfirmations = [
  {
    id,
    reportId,
    sectionId,
    title,
    reason,
    status,
    confirmed,
    actionText
  }
]
```

用途：

- 修改或确认章节后更新待确认数量。

### 6.10 交付检查模型

```js
deliveryCheckItems = [
  {
    id,
    reportId,
    type,
    level, // block / warn / info
    title,
    status,
    relatedSectionId,
    relatedMaterialId,
    actionText
  }
]
```

用途：

- 提交前阻断检查。
- 补资料后同步更新检查状态。

### 6.11 模板映射模型

```js
templateMappingPreview = [
  {
    sourceTemplateId,
    targetTemplateId,
    oldChapter,
    newChapter,
    mappingStatus,
    note
  }
]
```

用途：

- 按新模板重新生成报告时展示映射关系。

## 7. 给 OpenClaw 的实现规划

建议分 4 步实现，不要一次把所有交互都做复杂。

### 第一步：建立底层 mock 关系

目标：

```text
先把数据模型立起来。
```

任务：

- 在 `mockSmartReport.js` 中新增银行/机构数据。
- 将模板扩展到 8 到 12 个。
- 给模板增加银行、机构、业务条线、状态、默认范围。
- 给报告任务绑定 templateId、materialPackageId。
- 给报告章节增加 reportId。
- 给交付检查增加 reportId。
- 保留旧导出兼容。

验收：

- 页面仍然能正常打开。
- 旧 store 不构建报错。
- 首页能展示多个模板，不再像只有 3 个固定模板。

### 第二步：重构首页为三中心

目标：

```text
让首页从列表页变成 AI 交付工作台。
```

页面结构：

```text
顶部 AI 任务输入
主区域：
- AI 交付任务
- 模板中心
- 资料包中心
```

任务：

- AI 交付任务展示待确认、缺资料、待导出。
- 模板中心支持搜索、机构筛选、类型筛选、状态筛选。
- 资料包中心展示资料包和缺失状态。
- 统计卡弱化，不做主视觉。

验收：

- 用户第一眼能理解这是报告交付工作台。
- 模板中心明显不是普通 3 张卡片。
- 不新增路由，不改侧边栏。

### 第三步：打通报告上下文

目标：

```text
打开哪份报告，就使用哪份报告自己的模板、资料包、章节、检查项。
```

任务：

- openReport 时根据 reportId 取 sections。
- 根据 materialPackageId 取当前报告资料包。
- 右侧资料依据只展示当前报告当前章节资料。
- 提交检查只检查当前报告的 deliveryCheckItems。
- AI 修改只影响当前报告当前章节。

验收：

- 打开不同报告，右侧资料不同。
- 打开不同报告，章节和待确认项不同。
- 不再固定使用 `materialPackages[0]`。

### 第四步：补齐关键交互闭环

目标：

```text
让核心按钮不只是 message，而是能改变状态。
```

任务：

- 补充资料后，资料状态从“缺失”变“已关联”或“处理中”。
- 对应交付检查项从“未解决”变“处理中”或“已解决”。
- AI 应用修改后，章节状态变“已修改/已确认”。
- 待确认数量减少。
- 按新模板生成后生成新的章节版本或至少切换模板信息。
- 导出后任务状态变“已导出”。

验收：

- 用户能感受到任务被推进。
- AI 操作能改变正文和状态。
- 提交前检查结果会随着补资料和确认动作变化。

## 8. OpenClaw 实现边界

优先允许修改：

- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`

必要时允许新增：

- `src/components/report/TemplateCenter.vue`
- `src/components/report/MaterialPackageCenter.vue`
- `src/components/report/ReportDeliveryTasks.vue`
- `src/components/report/ReportEditorWorkspace.vue`

尽量不要修改：

- `src/stores/smartReport.js`

不要修改：

- 智能尽调页面。
- 智能尽调 store。
- 智能尽调 mock 数据。
- 工作台助手。
- 路由结构。
- 侧边栏结构。
- 企业探查相关模块。

## 9. 最终验收标准

产品验收：

- 智能报告定位清晰：AI 报告交付工作台。
- 首页有 AI 交付任务、模板中心、资料包中心。
- 模板支持多银行、多机构、多类型、多版本。
- 用户能上传模板并看到 AI 解析结果。
- 用户能查看模板章节和资料要求。
- 用户能打开报告并查看章节资料依据。
- 用户能修改资料摘要。
- 用户能让 AI 生成修改建议并应用到正文。
- 用户能按新模板查看章节映射。
- 用户能导出报告和资料包。
- 用户提交前能看到交付检查。

工程验收：

- `npm run build` 通过。
- `/smart-report` 不空白。
- 浏览器控制台无明显报错。
- 不影响智能尽调入口和数据结构。
- 不影响侧边栏和路由。
- `mockSmartReport.js` 保留旧导出：

```js
export const reportTemplates = []
export const dataSources = []
export const reportHistory = []
export function getReportContent(templateId, enterprise) {}
```

