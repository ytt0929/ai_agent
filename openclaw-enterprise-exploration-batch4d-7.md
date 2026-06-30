你是资深全栈前端工程师、资深 UX/UI 工程师，并理解银行客户经理的企业探查场景。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取旧提示词文件。

本轮任务：Phase 2 Batch 4D-7：企业探查对话流程修正与明细视图落地。

## 阶段定位

当前仍属于第二阶段：页面类型规范和 Demo 级产品体验梳理。

企业探查的目标是“对话式驱动的企业数据分析 Agent”：

- 先识别企业身份。
- 再检查工商、司法、税票、流水、社保等数据覆盖。
- 再判断用户问题类型。
- 简单事实和指标计算在对话中回答。
- 申报明细、股东明细、社保/从业概览在左侧工作区展示。
- 经营分析、纳税全景、欺诈风险、风险诊断等复杂问题在左侧结构化展示。
- 报告生成是明确动作，不是默认承载。

本轮只修企业探查首页和企业探查工作台，不改企业诊断报告页、不改证据链详情页。

## 重要限制

只允许修改：

- src/pages/EnterpriseDiagnosisListPage.vue
- src/pages/EnterpriseExplorationWorkspacePage.vue
- src/data/mockEnterpriseSourceData.js
- docs/enterprise-exploration-product-direction.md（只追加简短说明，可不改）

不要修改：

- src/main.js
- src/components/AppSidebar.vue
- src/components/GlobalInputBar.vue
- src/pages/EnterpriseDiagnosisPage.vue
- src/pages/EnterpriseDiagnosisEvidencePage.vue
- Pinia store
- 全局样式 token

不要引入新依赖。
不要接真实接口。
不要接真实大模型。
不要处理浏览器没有出现的乱码问题。
不要重写整个页面。

## 当前问题

1. 用户在首页只输入问题，例如“近12个月申报记录如何”，系统进入 `_new` 后会要求输入企业名称或信用代码，这是对的；但用户再输入“唐山物桥商贸有限公司”后，系统只识别企业，没有继续执行原始问题，导致上下文断裂。
2. 截图中 AI 回复出现单独的“已”，说明识别后的打字机输出或状态衔接体验不完整。
3. `classifyQuestion()` 仍把“股东明细、申报明细、社保明细”归到 fact，实际这些应该是 detail 类问题，并在左侧打开明细视图。
4. 当前 `currentView` 没有 `taxDeclarations / shareholders / socialSecurity` 等明细视图，导致“查看申报明细、查看股东明细、查看社保费明细”不能真正落到左侧工作区。
5. 首页文案仍然容易让用户以为“不输入企业身份也可以直接查数据”。实际应该提示：先输入企业名称或统一社会信用代码，也可以带问题一起问。
6. 对话过程不像真实 AI 探查：缺少“识别企业 -> 检查数据覆盖 -> 判断问题类型 -> 打开视图/回答”的自然连续消息。

## 目标效果

改完后必须支持这些 Demo 流程：

### 流程 A：用户先问问题，再给企业

用户在首页输入：

```text
近12个月申报记录如何
```

进入工作台后，AI 回复：

```text
我可以帮你查看申报明细。请先输入企业名称或统一社会信用代码。
```

用户输入：

```text
唐山物桥商贸有限公司
```

AI 必须继续执行原始问题，不要丢失上下文：

```text
已识别企业：唐山物桥商贸有限公司。
工商、司法、税票已获取，流水缺失。
你的问题属于“申报明细查询”，我已在左侧打开近12个月申报明细。
```

左侧打开“申报明细”表格。

### 流程 B：用户企业和问题一起输入

用户输入：

```text
唐山物桥商贸有限公司 税负率是多少
```

系统识别企业后，直接在对话中回答：

- 税负率结果
- 计算公式
- 行业均值
- 数据来源
- 是否异常

不要打开大报告页。

### 流程 C：明细类问题打开左侧工作区

这些问题必须打开左侧明细视图：

- 查看申报信息明细
- 近12个月申报记录如何
- 查看股东明细
- 查看社保费明细

右侧对话继续保留，并用一句话解释已打开的内容。

### 流程 D：复杂分析打开左侧结构化视图

这些问题打开左侧分析视图：

- 这家企业经营情况如何
- 是否存在欺诈风险
- 纳税全景怎么看
- 风险诊断结果如何

### 流程 E：没有企业身份时不默认唐山物桥

用户只输入问题时，不能直接默认 `91130203MA7EEQ2N0T`。

## 具体修改

### 1. 首页文案调整

文件：

- src/pages/EnterpriseDiagnosisListPage.vue

将入口说明改成更准确的表达：

```text
输入企业名称或统一社会信用代码开始探查，也可以带上问题一起问。
```

输入框 placeholder 改成类似：

```text
输入企业名称/统一社会信用代码，或输入：唐山物桥商贸有限公司 税负率是多少
```

`handleHeroSearch()` 逻辑保留：

- 能识别企业：进入 `/enterprise-diagnosis/workspace/:creditCode?q=...`
- 不能识别企业：进入 `/enterprise-diagnosis/workspace/_new?q=...`

不要再默认唐山物桥。

### 2. 增加 pendingQuestion，修复上下文断裂

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

新增状态：

```js
const pendingQuestion = ref('')
```

规则：

- 如果 `route.params.creditCode === '_new'` 且 `route.query.q` 存在：
  - 把 `route.query.q` 保存到 `pendingQuestion`
  - AI 首条消息根据问题类型提示：
    - 如果是申报明细：`我可以帮你查看申报明细。请先输入企业名称或统一社会信用代码。`
    - 如果是税负率：`我可以帮你计算税负率。请先输入企业名称或统一社会信用代码。`
    - 其他：`我可以帮你探查企业经营、工商、税票、股东、申报和风险证据链。请先输入企业名称或统一社会信用代码。`

用户输入企业名称或信用代码后：

- 调用 `findEnterpriseFromText(text)`
- 识别成功后执行：

```js
initDataFor(found.creditCode)
```

- 如果 `pendingQuestion.value` 存在：
  - 用完整 AI 消息说明已识别企业和数据覆盖。
  - 然后自动调用 `runExploreFlow(pendingQuestion.value)`
  - 执行后清空 `pendingQuestion.value`

注意：

- 不要只输出“已”。
- 不要要求用户重新输入原问题。

### 3. 优化识别成功后的 AI 消息

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

识别企业后，AI 消息必须一次完整输出，不要出现单字“已”：

```text
已识别企业：唐山物桥商贸有限公司。
当前数据覆盖：工商已获取、司法已获取、税票已授权、流水缺失。
我将继续处理你刚才的问题。
```

如果没有 pendingQuestion，则回复：

```text
已识别企业：唐山物桥商贸有限公司。
你可以继续问：税负率是多少、查看申报明细、查看股东明细、是否存在欺诈风险。
```

### 4. 重构问题分类

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

调整 `classifyQuestion(text)`，至少返回这些类型：

```js
fact_basic
detail_shareholders
detail_tax_declarations
detail_social_security
metric_tax_burden
metric_revenue
analysis_ops
analysis_tax
analysis_fraud
analysis_risk
evidence
report_business
report_tax
report_diagnosis
```

分类建议：

- 股东、出资、持股 -> `detail_shareholders`
- 社保、缴保、从业人数 -> `detail_social_security`
- 申报明细、申报记录、近12个月申报 -> `detail_tax_declarations`
- 税负率、计算税负 -> `metric_tax_burden`
- 收入同比、收入增长 -> `metric_revenue`
- 经营情况、经营分析、营收趋势 -> `analysis_ops`
- 纳税全景、纳税分析 -> `analysis_tax`
- 欺诈、真实性、票税流、资金流 -> `analysis_fraud`
- 风险、诊断、高风险 -> `analysis_risk`
- 证据、依据、证据链 -> `evidence`
- 生成工商分析报告 -> `report_business`
- 生成纳税全景报告 -> `report_tax`
- 生成企业诊断报告 -> `report_diagnosis`

### 5. 新增左侧明细视图

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

新增 `currentView` 支持：

```js
taxDeclarations
shareholders
socialSecurity
```

左侧展示要求：

#### taxDeclarations

标题：申报明细

内容：

- 企业名称
- 数据来源：增值税纳税申报系统
- 表格列：
  - 申报期间
  - 申报日期
  - 征收项目
  - 销售额
  - 应纳税额
  - 减免税额

数据来自：

```js
getTaxDeclarationRows(creditCode.value)
```

#### shareholders

标题：股东明细

表格列：

- 股东名称
- 证件类型
- 认缴金额
- 持股比例
- 数据来源

数据来自：

```js
getShareholderRows(creditCode.value)
```

#### socialSecurity

标题：从业/社保概览

内容：

- 从业人数
- 数据来源
- 是否估算
- 当前限制说明：如无完整社保费明细，说明“当前为从业人数概览，非完整社保费明细”

数据来自：

```js
sourceData.value.socialSecurity
```

### 6. 调整 runExploreFlow 输出边界

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

规则：

- `fact_basic`：只在对话中回答。
- `metric_tax_burden` / `metric_revenue`：只在对话中回答，附公式、口径、数据来源。
- `detail_*`：左侧打开对应明细视图，右侧对话输出“已打开xxx明细”。
- `analysis_*`：走简化探查过程，左侧打开结构化分析视图。
- `report_*`：调用报告处理逻辑，不要默认跳报告页，除非用户点击查看详情。

明细类问题不需要走完整 AI 诊断引擎卡片，最多输出：

```text
已识别为“申报明细查询”，我已在左侧打开近12个月申报记录。
```

复杂分析类才显示过程：

```text
我先检查可用数据范围。
正在判断问题类型。
已打开经营分析视图。
```

### 7. 数据缺失规则

文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

如果问题需要税票但 `coverage.tax === false`：

- 不打开空表格。
- 对话回复：

```text
当前税票未授权，无法查看申报明细/计算税负率。请先授权税票。
```

- 显示“授权税票”按钮。

如果问题需要流水但 `coverage.flow === false`：

- 可以打开欺诈风险初步分析。
- 必须提示：

```text
流水缺失，当前只能给出初步欺诈风险判断，无法完整验证资金流闭环。
```

- 显示“上传流水”按钮。

### 8. 样式小修

只在 `EnterpriseExplorationWorkspacePage.vue` scoped style 内调整：

- AI 消息里的过程卡片宽度不要过窄，最大宽度跟随消息区域。
- 对话优先模式不要有大面积异常空白。
- AI 头像保持显示。
- 识别企业后的消息不要和用户气泡重叠。
- 左侧明细表格使用紧凑表格，不要做大卡片堆叠。

不要大改全局视觉。

## 验收标准

1. `npm run build` 通过。
2. 首页输入 `近12个月申报记录如何` 后进入 `_new`，AI 不默认唐山物桥，而是要求输入企业名称或统一社会信用代码。
3. 接着输入 `唐山物桥商贸有限公司` 后，系统自动继续执行“近12个月申报记录如何”，左侧打开申报明细表。
4. 首页输入 `唐山物桥商贸有限公司 税负率是多少` 后，在对话中返回税负率、公式、行业均值、数据来源和异常判断。
5. 输入 `查看股东明细` 后，左侧打开股东明细表。
6. 输入 `查看社保费明细` 后，左侧打开从业/社保概览，并说明当前是否为估算/概览。
7. 输入 `这家企业经营情况如何` 后，左侧打开经营分析，右侧继续对话。
8. 输入 `是否存在欺诈风险` 后，提示流水缺失，只给初步判断，并提供上传流水按钮。
9. 不出现单独的“已”这种不完整 AI 回复。
10. 不新增乱码，不丢失 AI 头像，不破坏报告页和证据链页。

完成后请回复：

- 修改了哪些文件。
- 修复了哪些流程。
- 支持了哪些问题类型。
- `npm run build` 是否通过。
- 如有未完成项，说明原因。
