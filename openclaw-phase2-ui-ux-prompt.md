# OpenClaw Current Prompt: Phase 2 Batch 4 - Biz Risk + Enterprise Diagnosis

```text
You are a senior UI/UX engineer and frontend engineer.

Project:
D:\demo\ai-copilot

Read this prompt only. Ignore old archived prompts.

Phase context:
We are still in Phase 2: page type standardization.
Phase 2 is not complete globally yet.
Completed or mostly completed earlier:
- Workbench
- Smart screening entry
- Intelligent due diligence home/detail

This Batch 4 only covers:
1. 工商查询 / Biz Risk
2. 企业诊断 / Enterprise Diagnosis

Scope:
- `src/pages/BizRiskPage.vue`
- `src/pages/BizRiskSinglePage.vue`
- `src/pages/BizRiskBatchPage.vue`
- `src/pages/EnterpriseDiagnosisPage.vue`
- Related stores/mock data only if needed:
  - `src/stores/bizRisk.js`
  - `src/data/mockBizRisk.js`
  - `src/stores/enterpriseDiagnosis.js`
  - `src/data/mockEnterpriseDiagnosis.js`

Do not modify unrelated pages.
Do not change routes, dependencies, or global tokens unless absolutely necessary.

Product positioning:
This is a demo-stage Agent product for bank relationship managers.
The UI should feel restrained, professional, workflow-oriented, and suitable for financial risk review.
AI should assist judgment and actions, not dominate the page visually.

Batch 4 overall goal:
Make 工商查询 and 企业诊断 conform to Phase 2 page type rules.
Stop using old demo-style layouts such as:
- emoji-heavy UI
- large explanation cards
- card grid action area
- long single-column card stacking
- generic AI chat occupying too much attention

============================================================
Module A: 工商查询 / Biz Risk
============================================================

Current files:
- `BizRiskPage.vue` switches between single and batch mode by `store.mode`.
- `BizRiskSinglePage.vue` is single-enterprise query.
- `BizRiskBatchPage.vue` is batch scan.

A1. Single query page type:
This page should be a "search/query entry + single-enterprise risk judgment page".

Current issues:
- Too many emoji: 🔍 📁 📋 ⚡ 🔴 🟡 🟢 📄 💡 etc.
- Query result is still card stacking: conclusion card + risk cards + action grid.
- Risk card structure is noisy and inconsistent.
- 后续操作 is a card grid; it should become a clear action bar.
- `searchInput` currently has an empty computed setter and does not feel like a reliable real input flow.

Required direction:
- Keep the natural-language / enterprise-name query as the main entrance.
- Make the input area clear and compact.
- Scenario chips should be secondary, not visually louder than the input.
- Replace emoji with Element Plus icons or text labels.
- Result area should become:
  1. enterprise overview
  2. AI risk summary / risk level
  3. risk fact list
  4. main action bar
- Risk item structure should be stable:
  - left colored status bar or severity marker
  - risk title/type
  - fact
  - due diligence suggestion
  - primary action
  - optional expandable evidence/details
- Use status colors consistently:
  - red = high risk / must verify
  - yellow = attention
  - green = normal
  - blue = active/current
- Avoid emoji severity icons.
- Avoid large decorative cards.
- Actions should be clear and work-oriented:
  - 标记已核实
  - 加入尽调
  - 生成风险报告
  - 订阅风险监控
- The main post-result actions should be placed in a stable action bar, not a four-card grid.

A2. Batch scan page type:
This page should be a "data result page".

Current issues:
- Upload area is large and demo-like.
- Result width is too constrained for a batch review tool.
- Table is good direction but too narrow and underpowered.
- Abnormal filter is outside the table toolbar.
- Batch action bar is not sticky bottom.
- `详情/推送` only shows toast and has no visible detail/result state.

Required direction:
- Batch result view should use a wider page layout.
- Keep table as the core object.
- Move abnormal filtering into a compact table toolbar.
- Add or improve columns if useful for review:
  - enterprise name
  - credit code
  - risk level
  - core risk
  - verify count / attention count
  - suggested action
  - transfer/due-diligence status
- Batch operation bar should be sticky bottom once there are results.
- Selected count should be clear.
- Detail should use a right drawer or inline detail panel, not only `ElMessage`.
- Push to due diligence should create visible operation feedback, not only toast.
- Upload/paste state can remain, but should be more compact and professional.

============================================================
Module B: 企业诊断 / Enterprise Diagnosis
============================================================

Current file:
- `EnterpriseDiagnosisPage.vue`

Page type:
This module contains:
1. search/create entry state
2. diagnosing/loading state
3. diagnosis result / analysis report state

B1. Search state direction:
- Keep search input as the main element.
- Quick picks and history should be secondary.
- Reduce large card feeling if possible.
- Keep it simple: input, candidate list, recent diagnoses.

B2. Diagnosing state direction:
Current diagnosing state uses text symbols like ✓ ⟳ ○.
Required:
- Use Element Plus icons or token-based status styles.
- Keep it compact and professional.
- Steps can stay static for demo, but should look like an analysis progress tracker.

B3. Result state must become an "analysis report page".

Current issues:
- Result is single-column stacked cards.
- Dimension cards are long collapsible cards.
- AI chat block is too prominent and demo-like.
- The result does not yet feel like a structured diagnostic report.

Required result layout:
Use a clear structure such as:
- Top overview band:
  - enterprise name / credit code / industry
  - risk score
  - risk level
  - core conclusion
  - primary actions: 推送至尽调, 创建监测, 生成报告, 重新诊断
- Middle analysis area:
  - dimensions such as 司法风险, 税票数据, 工商变更, 经营指标, 舆情信息
  - display as a compact matrix/list or report sections
  - each dimension shows: level, title, key facts, optional trend
- Right side or lower compact action/AI panel:
  - AI suggestions
  - recommended next actions
  - chat should be collapsible or visually secondary

AI guidance:
- AI advice should assist the diagnosis result.
- It should not dominate the page.
- Chat can remain, but should be reduced, folded, or placed as an assistant panel.

Visual requirements for both modules:
- Remove emoji from primary UI where possible.
- Use Element Plus icons.
- Avoid card-in-card visual nesting.
- Keep cards at `var(--radius-md)` or existing token equivalent.
- Avoid hardcoded colors where tokens exist.
- Keep page density suitable for repeated bank RM work.
- No decorative gradients.
- No giant icons.
- No marketing-style hero sections.
- Use concise labels and stable table/action layouts.

Validation:
- Run `npm run build`.
- Browser-check:
  1. `/biz-risk` single mode before query
  2. `/biz-risk` single mode after query
  3. `/biz-risk` batch mode before scan
  4. `/biz-risk` batch mode after scan
  5. `/enterprise-diagnosis` before diagnosis
  6. `/enterprise-diagnosis` diagnosing state if possible
  7. `/enterprise-diagnosis` result state

Acceptance criteria:
- 工商单户 feels like a focused enterprise risk judgment tool.
- 工商批量 feels like a wide data review page with batch actions.
- 企业诊断 result feels like an analysis report, not a long stack of demo cards.
- Users can tell within 3 seconds whether the page is for query, batch review, or diagnosis analysis.
- High-frequency actions are visible and reachable.
- Visual style matches previous Phase 1/2 workbench and due diligence pages.

Final response must include:
- changed files
- Biz Risk single-page changes
- Biz Risk batch-page changes
- Enterprise Diagnosis changes
- build result
- browser verification result
```
# OpenClaw Current Prompt: Phase 2 Batch 4A - Enterprise Diagnosis Report Refactor

```text
You are a senior UI/UX engineer and frontend engineer.

Project:
D:\demo\ai-copilot

Read only this top prompt. Ignore everything below "OLD PROMPT BELOW".

Context:
We are still in Phase 2: page type standardization.
This batch only adjusts 企业诊断. Do not modify other pages.

Scope:
- src/pages/EnterpriseDiagnosisPage.vue
- src/stores/enterpriseDiagnosis.js
- src/data/mockEnterpriseDiagnosis.js

Do not change routes, dependencies, global tokens, or unrelated files.

Product positioning:
This is a demo-stage Agent product for bank relationship managers.
Enterprise Diagnosis should become a professional enterprise diagnostic report workbench, not a simple risk-card demo page.
AI should support judgment, evidence review, and report generation. It should not dominate the page visually.

Business baseline for the demo:
- 企业名称: 唐山物桥商贸有限公司
- 行业: 建材批发
- 纳税人类型: 一般纳税人
- 纳税信用等级: D
- 综合评分: 513
- 统一社会信用代码: 91130203MA7EEQ2N0T
- 法人: 马丽
- 成立时间: 2022年
- 从业人员: 5人
- 近三年应税销售收入持续增长，2025年达 2,275.98 万元，同比增长 +188.3%
- 增值税税负率仅 0.8%，远低于同行业均值 2.8%
- 存在 "两头在外" 经营模式，业务真实性风险较高
- 司法记录清白、纳税信用等级 A 级/基础信用背书、管理层连续稳定可作为亮点内容

Target result:
Enterprise Diagnosis must clearly present:
1. 企业画像
2. 综合评分
3. AI 综合诊断
4. 行动建议
5. 八大维度诊断
6. 风险事项 / 企业亮点 / 全量指标
7. 每个指标的证据链入口
8. 报告产物动作

1. Replace old 5-dimension model with 8 dimensions:
- 经营稳定性
- 经营成长性
- 业务真实性
- 税务风险
- 企业稳定性
- 供应链稳定性
- 关联交易
- 司法负面

Each dimension needs:
- key
- name
- score
- level: high / medium / low
- riskCount
- highlightCount
- short conclusion

2. Rebuild mock data into report data:
In src/data/mockEnterpriseDiagnosis.js, create richer demo data for 唐山物桥商贸有限公司.

summary should include:
- score: 513
- grade: "D"
- riskCount: 8
- highRiskCount: 3
- highlightCount: 9
- strongHighlightCount: 3
- diagnosisText based on the business baseline
- actionSuggestions:
  1. 核实营收增长的真实来源，重点审查大额订单
  2. 调查"两头在外"物流和资金流匹配情况
  3. 核查增值税税负率异常偏低的原因
  4. 关注客户集中度过高带来的经营风险
  5. 督促企业优化债务结构，降低偿债压力

indicators:
Create at least 17 indicators:
- 8 risk items
- 9 highlight items

Risk items must include:
- 营收增长异常 / 高风险 / 经营稳定性
  fact: 近12月开票收入同比增长188.3%，增速远超行业平均水平
- 购销两头在外 / 中风险 / 业务真实性
  fact: 主要供应商和客户均位于外地，存在两头在外经营模式
- 短期偿债压力过大 / 高风险 / 经营稳定性
  fact: 短期借款50万元，占流动资产61%，偿债压力较大
- 应收账款周转率下降 / 中风险 / 经营稳定性
  fact: 应收账款周转率从8.2降至5.6，回款速度变慢
- 税负率显著低于行业 / 高风险 / 税务风险
  fact: 增值税税负率0.8%，仅为行业均值2.8%的29%
- 开票收入与申报收入不一致 / 中风险 / 业务真实性
  fact: 开票收入2275.98万元，申报收入2175.46万元，差异4.4%
- 电费与收入相关性低 / 低风险 / 业务真实性
  fact: 近12月电费与收入相关性仅0.18，低于正常水平
- 公司成立时间较短 / 中风险 / 企业稳定性
  fact: 企业成立39个月，经营历史相对较短

Each indicator should include:
- id
- name
- type: risk / highlight
- level
- dimensionKey
- dimensionName
- fact
- evidenceIds
- reportStatus: pending / included / ignored

evidenceChain:
Create evidence objects linked to indicators.
Each evidence item should include:
- id
- source
- title
- value
- comparison or explanation
- collectedAt
- confidence

reportDraft:
- status: draft
- title: 唐山物桥商贸有限公司企业诊断报告
- includedConclusions
- evidenceCount
- pendingConfirmations

3. Result page layout:
Do not keep a long single-column card stack.
Build a report workbench:

Top report header:
- 返回列表
- 企业名称
- 行业 / 一般纳税人 / 纳税信用等级
- credit code / 法人 / 成立时间
- 综合评分 513
- grade badge D or risk level badge

AI 综合诊断:
- Title: AI 综合诊断
- Subtext: 基于多维度数据智能分析
- Risk count: 风险 8 / 高风险 3
- Highlight count: 亮点 9 / 强亮点 3
- Diagnosis paragraph
- Action suggestions 1-5

八大维度诊断:
- Title: 八大维度诊断结果
- Tabs: 雷达图 / 蝴蝶图 / 玫瑰图
- Use a lightweight CSS matrix/chart-like area. Do not add chart dependencies.
- Helper text: 点击维度查看指标
- Clicking a dimension highlights it and filters indicators below.

核心风险和亮点:
- Segmented controls:
  - 风险事项 (8)
  - 企业亮点 (9)
  - 全量指标 (17)
- Dimension filters:
  - 全部
  - 经营稳定性
  - 业务真实性
  - 税务风险
  - 企业稳定性
  - 供应链稳定性
  - 司法负面
  - 关联交易
- Indicator rows/cards:
  - indicator name
  - level tag
  - dimension tag
  - fact
  - 查看证据链 action

Evidence chain:
- Clicking 查看证据链 must open a visible drawer or side panel.
- Show evidence source, value, comparison/explanation, confidence, collected time.
- Do not use only ElMessage for evidence actions.

Report actions:
- Add visible actions:
  - 生成诊断报告
  - 加入智能报告
  - 推送至尽调
  - 创建监测规则
- Clicking can be simulated, but must create visible operation feedback on the page or panel, not only toast.

AI assistant:
- Keep it secondary and context-aware.
- If a dimension or indicator is selected, show that context in assistant header or quick prompts.
- Quick prompts: 解释扣分原因, 查看证据链, 生成专项说明, 加入报告.
- Remove emoji avatars from primary UI. Use Element Plus icons.

Search state:
- Keep input as main element.
- Quick picks/history secondary.
- Ensure 唐山物桥商贸有限公司 can be selected/searched.

Diagnosing state:
- Compact progress tracker.
- Use Element Plus icons and token colors.
- No emoji or large decorative animation.

Visual rules:
- No emoji in primary UI.
- Use Element Plus icons.
- Use existing CSS tokens where possible.
- Avoid hardcoded colors where tokens exist.
- Avoid card-in-card visual nesting.
- Avoid giant decorative icons.
- Keep layout professional, dense, and suitable for bank relationship managers.
- Cards should use existing radius tokens.
- The page should feel like a diagnostic report workbench, not a marketing/demo landing page.

Validation:
- Run npm run build.
- Browser-check:
  1. /enterprise-diagnosis before diagnosis
  2. selecting/searching 唐山物桥商贸有限公司
  3. diagnosing state
  4. result state
  5. dimension click filters indicators
  6. 风险事项 / 企业亮点 / 全量指标 tabs
  7. 查看证据链 drawer/panel
  8. report action feedback
  9. AI assistant context after selecting a dimension or indicator

Acceptance criteria:
- 企业诊断 no longer feels like old 5-card demo.
- It clearly presents enterprise profile, score, AI diagnosis, action suggestions, 8 dimensions, risks/highlights, and evidence chain.
- A bank relationship manager can understand the main risk conclusion within 3 seconds.
- Each risk/highlight indicator has a visible evidence-chain entrance.
- AI is visibly linked to selected dimension/indicator.
- Build passes.

Final response must include:
- changed files
- data model changes
- Enterprise Diagnosis page changes
- evidence chain behavior
- report action behavior
- build result
- browser verification result
```

---

# OLD PROMPT BELOW - IGNORE FOR CURRENT OPENCLAW RUN
