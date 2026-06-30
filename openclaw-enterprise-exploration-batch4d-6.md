你是资深前端工程师、资深 UX/UI 工程师，并理解银行客户经理的企业探查、工商分析、税票分析、风险诊断和智能尽调场景。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取旧提示词文件。

本轮任务：Phase 2 Batch 4D-6：企业探查入口识别、源数据 mock、对话式探查流程收口。

## 阶段定位

当前仍属于第二阶段：页面类型规范和 Demo 级产品体验梳理。

企业探查的产品定位：

企业探查是面向银行客户经理的对话式企业数据分析 Agent。它不是单纯工商查询，也不是输入后直接打开企业诊断报告。它应该先识别企业，再判断工商、司法、税票、流水、社保等数据覆盖情况，然后根据问题类型决定输出：

- 简单事实查询：在对话中直接回答，可附轻量明细。
- 指标计算：在对话中返回结果、公式、口径、数据来源和风险判断。
- 明细查询：左侧打开明细表，右侧继续对话。
- 复杂分析：左侧打开结构化分析视图，右侧继续对话。
- 报告生成：用户明确要求时才生成工商分析报告、纳税全景报告或企业诊断报告。

本轮只解决企业探查入口、工作台对话流程和 mock 源数据问题，不改企业诊断报告详情页、不改证据链详情页。

## 重要限制

只允许修改或新增：

- src/pages/EnterpriseDiagnosisListPage.vue
- src/pages/EnterpriseExplorationWorkspacePage.vue
- src/data/mockEnterpriseDiagnosis.js
- src/data/mockEnterpriseSourceData.js（如不存在，请新增）
- docs/enterprise-exploration-product-direction.md（只追加本轮规则，不重写全文）

可读取这些本地数据文件作为 mock 数据依据：

- D:\demo\NS004.txt
- D:\demo\ns010.txt

注意：不要在运行时代码里直接读取 D:\demo\NS004.txt 或 D:\demo\ns010.txt。请只从这两个文件中抽取少量 Demo 字段，整理到 src/data/mockEnterpriseSourceData.js。

不要修改：

- src/main.js 路由结构
- src/components/AppSidebar.vue
- src/components/GlobalInputBar.vue
- src/pages/EnterpriseDiagnosisPage.vue
- src/pages/EnterpriseDiagnosisEvidencePage.vue
- Pinia store
- 全局样式 token

不要引入新依赖，不要接真实接口，不要接真实大模型，不要实现真实 NLP。

如果浏览器没有乱码，不要处理乱码问题。

## 当前问题

1. 企业探查首页输入任何内容都会默认跳到 `91130203MA7EEQ2N0T`，即唐山物桥商贸有限公司。用户只输入“近12个月申报记录如何”时，系统没有先询问企业名称或税号。
2. 首页文案说可以输入企业名称、税号或问题，但代码没有区分“企业身份”和“问题内容”。
3. `EnterpriseExplorationWorkspacePage.vue` 里 `buildChatReply()` 仍然大量硬编码回答，没有使用 NS004/ns010 里的申报、股东、工商、从业人数等明细数据。
4. `hasTaxData`、`hasFlowData`、`dataCoverage` 是按信用代码硬编码，不是真正来自 mock 源数据。
5. 事实查询、指标计算、明细查询、复杂分析的输出边界不清晰，容易直接跳到结果页或报告页。
6. 开始探查时缺少清晰状态：未识别企业、已识别企业、检查数据覆盖、问题分类、回答或打开左侧视图。

## 目标效果

改完后，用户能明显感知企业探查是一个对话式 Agent：

1. 首页可以输入企业名称/统一社会信用代码，也可以输入自然语言问题。
2. 如果用户只输入问题，例如“近12个月申报记录如何”，不要直接默认某家公司；先进入工作台并由 AI 提示“请先输入企业名称或统一社会信用代码”。
3. 如果用户输入企业名称或税号，例如“唐山物桥商贸有限公司 近12个月收入趋势如何”或“91130203MA7EEQ2N0T 税负率是多少”，系统识别企业后再进入探查。
4. 工作台对话流程统一为：
   - 识别企业
   - 检查数据覆盖
   - 判断问题类型
   - 简单问题直接回答
   - 明细/复杂问题打开左侧结果区
5. NS004/ns010 的字段要沉淀成 mock 源数据，用于回答申报明细、股东明细、社保/从业人数、税负率计算等 Demo 问题。
6. 数据不足时明确提示：
   - 缺税票：无法生成纳税全景或税负深度分析，需要授权税票。
   - 缺流水：无法完整判断资金流闭环和欺诈，需要上传流水。

## 具体修改

### 1. 新增源数据 mock

新增文件：

- src/data/mockEnterpriseSourceData.js

请从 D:\demo\NS004.txt 和 D:\demo\ns010.txt 中抽取少量 Demo 字段，不要整文件复制。

建议导出这些结构：

```js
export const enterpriseSourceData = {
  '91130203MA7EEQ2N0T': {
    identity: {
      name: '唐山物桥商贸有限公司',
      creditCode: '91130203MA7EEQ2N0T',
      industry: '建材批发',
      taxpayerType: '一般纳税人',
      legalRep: '马丽',
      establishedYear: 2022,
      employeeCount: 5
    },
    coverage: {
      business: true,
      judicial: true,
      tax: true,
      flow: false,
      socialSecurity: true
    },
    shareholders: [],
    taxDeclarations: [],
    incomeTaxDeclarations: [],
    socialSecurity: [],
    metrics: {},
    evidenceSources: []
  }
}
```

字段要求：

- `shareholders` 从 ns010 的 `stockList` 抽取：股东姓名、证件类型、认缴金额、持股比例。
- `taxDeclarations` 从 NS004 的 `sbxxList` 抽取 6-12 条：申报期间、申报日期、征收项目、销售额、应纳税额、减免税额。
- `incomeTaxDeclarations` 从 ns010 的所得税/申报字段抽取 3-6 条即可。
- `socialSecurity` 如果源文件没有完整社保费明细，可先用 `employeeCount` 和已有证据链中的缴保连续性做 Demo 数据，但要标注为“从业/缴保概览”。
- `metrics` 至少包含：
  - `vatBurdenRate`
  - `revenueYoY`
  - `invoiceIncome`
  - `declaredIncome`
  - `declarationDiffRate`

同时导出工具函数：

```js
export function findEnterpriseFromText(text) {}
export function getEnterpriseSourceData(creditCode) {}
export function getDataCoverage(creditCode) {}
export function getTaxDeclarationRows(creditCode) {}
export function getShareholderRows(creditCode) {}
export function calculateVatBurden(creditCode) {}
```

这些函数只服务 Demo，不需要通用复杂算法。

### 2. 修改企业探查首页输入逻辑

文件：

- src/pages/EnterpriseDiagnosisListPage.vue

修改 `handleHeroSearch()` 和 `onChipClick()`。

要求：

- 使用 `findEnterpriseFromText(text)` 判断输入中是否包含企业名称或统一社会信用代码。
- 如果识别到企业：
  - 跳转 `/enterprise-diagnosis/workspace/:creditCode?q=...`
- 如果没有识别到企业：
  - 跳转 `/enterprise-diagnosis/workspace/_new?q=...&needIdentity=1`
  - 不要再默认用 `91130203MA7EEQ2N0T`

示例：

- 输入 `91130203MA7EEQ2N0T 近12个月申报记录如何`：识别到唐山物桥，进入工作台并开始探查。
- 输入 `唐山物桥商贸有限公司 税负率是多少`：识别到唐山物桥，进入工作台并开始探查。
- 输入 `近12个月申报记录如何`：进入工作台，但先由 AI 提示“请先输入企业名称或统一社会信用代码”。

首页提示文案改成：

> 先输入企业名称或统一社会信用代码，也可以带上问题一起问，例如：唐山物桥商贸有限公司 税负率是多少。

不要让用户误以为“完全没有企业身份也能直接查数据”。

### 3. 修改工作台企业识别状态

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

当前 `creditCode = route.params.creditCode || '91130203MA7EEQ2N0T'` 会导致默认企业。请改成：

- 如果 `route.params.creditCode === '_new'` 或 `needIdentity=1`：
  - 不设置默认企业。
  - `enterprise` 显示为空状态。
  - 工作台第一条 AI 消息提示：`我可以帮你查企业经营、税票、工商、股东、申报和风险证据链。请先输入企业名称或统一社会信用代码。`
- 用户在工作台输入企业名或税号后：
  - 调用 `findEnterpriseFromText`
  - 找到企业后更新 `enterprise`、`creditCode`、`sourceData`、`dataCoverage`
  - 如果原始问题存在，继续执行原始问题

注意：

- 不要在 `_new` 状态下默认唐山物桥。
- 如果找不到企业，回复：`当前 Demo 只内置了少量企业样例，请输入：唐山物桥商贸有限公司 或 91130203MA7EEQ2N0T。`

### 4. 重构对话探查流程

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

保留现有 `classifyQuestion()`、`runExploreFlow()`、`buildChatReply()` 思路，但要调整流程。

统一流程：

```text
sendChat
-> 如果未识别企业：先尝试识别企业；识别失败就要求输入企业名/税号
-> 已识别企业：检查数据覆盖
-> classifyQuestion
-> fact/metric：对话中回答
-> detail：左侧打开明细视图
-> analysis：左侧打开结构化分析视图
-> report：按报告类型处理
```

`classifyQuestion()` 至少区分：

- `fact`: 法人、成立时间、行业、纳税人类型
- `detail_shareholder`: 股东明细
- `detail_social`: 社保/从业人数明细
- `detail_tax_declaration`: 申报明细
- `metric_tax_burden`: 税负率
- `metric_revenue`: 收入同比
- `analysis_ops`: 经营情况
- `analysis_tax`: 纳税全景
- `analysis_fraud`: 欺诈风险
- `analysis_risk`: 风险诊断
- `evidence`: 证据链
- `report_business`: 工商分析报告
- `report_tax`: 纳税全景报告
- `report_diagnosis`: 企业诊断报告

### 5. 用源数据回答事实、指标、明细问题

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue
- src/data/mockEnterpriseSourceData.js

请替换 `buildChatReply()` 中纯硬编码内容。

要求：

- 股东明细：从 `getShareholderRows()` 返回。
- 申报明细：从 `getTaxDeclarationRows()` 返回。
- 税负率：从 `calculateVatBurden()` 返回，展示公式。
- 法人/成立时间/行业：从 `sourceData.identity` 返回。
- 社保/从业人数：从 `sourceData.socialSecurity` 或 `identity.employeeCount` 返回。

回答样式保持轻量：

- 对话中用 3-6 行摘要，不要塞满长文本。
- 明细类如果超过 3 条，对话里只展示摘要，同时打开左侧明细表。
- 每个回答尽量带“数据来源”。

### 6. 左侧结果区只承载明细或复杂分析

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

左侧视图新增或整理这些 `currentView`：

- `taxDeclarations`：申报明细表
- `shareholders`：股东明细表
- `socialSecurity`：从业/社保概览
- `ops`：经营分析
- `tax`：纳税全景
- `fraud`：欺诈风险
- `risk`：风险诊断
- `evidence`：证据链摘要

不要把所有问题都落到 `ops` 或 `overview`。

### 7. 数据缺失处理

如果问题需要税票，但 `coverage.tax === false`：

- 不打开空结果页。
- 在对话中提示：`当前税票未授权，无法查看申报明细/计算税负率。可先授权税票。`
- 给一个按钮：`授权税票`

如果问题需要流水，但 `coverage.flow === false`：

- 允许给出初步欺诈风险判断。
- 必须提示：`流水缺失，无法完整判断资金流闭环。`
- 给一个按钮：`上传流水`

### 8. 轻量优化当前 UI

只在 `EnterpriseExplorationWorkspacePage.vue` 内做必要样式调整：

- 未识别企业时，主区域是对话优先，不要大面积空白。
- 识别和检查过程作为 AI 消息里的过程卡片，不要独立漂浮在页面中央。
- 进入结果态后，左侧结果区和右侧对话区保持清晰两栏。
- 对话里的 AI 头像不能丢失。
- 操作按钮优先放在 AI 消息下方，不要散落在页面顶部。

不要大改全局样式。

## 不要改

- 不要重写整个页面。
- 不要删除已有报告页和证据链页。
- 不要改路由结构。
- 不要改侧边栏。
- 不要改全局输入条。
- 不要引入真实接口或真实 AI。
- 不要处理浏览器未出现的乱码问题。
- 不要把 NS004/ns010 整文件复制进项目。

## 验收标准

1. `npm run build` 通过。
2. 输入 `近12个月申报记录如何` 时，不再默认唐山物桥；AI 会先要求输入企业名称或统一社会信用代码。
3. 输入 `唐山物桥商贸有限公司 近12个月申报记录如何` 时，可以识别企业，并展示申报明细摘要或左侧申报明细表。
4. 输入 `91130203MA7EEQ2N0T 税负率是多少` 时，可以返回税负率、公式、口径、数据来源和异常判断。
5. 输入 `查看股东明细` 且企业已识别时，可以从 mock 源数据返回股东信息。
6. 输入 `这家企业经营情况如何` 时，左侧打开经营分析，右侧继续对话。
7. 输入 `是否存在欺诈风险` 时，提示流水缺失，并给出初步风险判断和上传流水入口。
8. 首页不再把所有 chip 直接默认跳到唐山物桥；没有企业身份时进入 `_new` 识别态。
9. 页面没有新增乱码，没有丢失 AI 头像，没有出现大面积错乱布局。

完成后请回复：

- 修改了哪些文件。
- 新增了哪些 mock 数据字段。
- 哪些问题类型已经支持。
- `npm run build` 是否通过。
- 如果某些 NS004/ns010 字段无法确认，请说明采用了哪些 Demo fallback。
