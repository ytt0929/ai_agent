# OpenClaw Prompt: Enterprise Diagnosis Batch 4A Short Fix

```text
You are a senior frontend engineer.

Project:
D:\demo\ai-copilot

Read only this prompt.
Do not read old prompt files.

Goal:
Finish Phase 2 Batch 4A for 企业诊断.
The data/store are already partially updated. The page is still old.
Your task is to update only the Enterprise Diagnosis page so the existing report data is actually rendered.

Reference target HTML:
design/enterprise-diagnosis-report-workbench-target.html

Use the HTML as the visual/content target, but implement it in Vue using the existing project style tokens and Element Plus icons/components.

Scope:
- src/pages/EnterpriseDiagnosisPage.vue
- src/stores/enterpriseDiagnosis.js only if small computed helpers are needed
- src/data/mockEnterpriseDiagnosis.js only if a missing field blocks rendering

Do not modify other pages.
Do not change routes, dependencies, global tokens, or app shell.

Current problem:
EnterpriseDiagnosisPage.vue still uses the old structure:
- dim.label
- dim.title
- dim.items

But mockEnterpriseDiagnosis.js now returns the new structure:
- profile
- score
- grade
- dimensions: key/name/score/level/riskCount/highlightCount/conclusion
- riskItems
- highlightItems
- allIndicators
- evidenceChain
- reportDraft

Required implementation:

1. Search state
- Keep current search.
- Ensure 唐山物桥商贸有限公司 can be selected and diagnosed.

2. Result page header
Render:
- 返回列表
- 企业名称
- 行业 / 一般纳税人 / 纳税信用等级
- credit code / 法人 / 成立时间
- 综合评分 513
- grade badge D

3. AI 综合诊断 section
Render:
- 风险 8
- 高风险 3
- 亮点 9
- 强亮点 3
- diagnosis paragraph from result.summary
- 5 action suggestions from result.suggestions

4. 八大维度诊断 section
Render result.dimensions as 8 dimensions:
- name
- score
- level
- conclusion
Add lightweight tabs: 雷达图 / 蝴蝶图 / 玫瑰图.
No chart dependency. Use CSS matrix/chart-like cards.
Clicking a dimension should:
- set activeDimension
- filter the indicator list by dimensionKey
- visually highlight the selected dimension

5. 核心风险和亮点 section
Add segmented controls:
- 风险事项 (8)
- 企业亮点 (9)
- 全量指标 (17)
Use store.indicatorTab or local state.
Add dimension filters:
- 全部
- 经营稳定性
- 业务真实性
- 税务风险
- 企业稳定性
- 供应链稳定性
- 司法负面
- 关联交易

Render indicator rows/cards:
- name
- level tag
- dimensionName
- fact
- 查看证据链 button

6. Evidence chain
Clicking 查看证据链 must open a visible Element Plus drawer or side panel.
Use selectedIndicator.evidenceIds to read result.evidenceChain.
Show:
- source
- title
- value
- comparison/explanation
- collectedAt
- confidence
Do not use only ElMessage.

7. Report action area
Render reportDraft:
- title
- includedConclusions count
- evidenceCount
- pendingConfirmations
Actions:
- 生成诊断报告
- 加入智能报告
- 推送至尽调
- 创建监测规则
Clicking actions can be simulated, but must update visible operation feedback using store.operationLog or local state. Do not only toast.

8. AI assistant
Keep secondary.
Remove emoji avatars.
Show current context:
- selected dimension name, or selected indicator name
Quick prompts:
- 解释扣分原因
- 查看证据链
- 生成专项说明
- 加入报告

9. Visual requirements
- No emoji in primary UI.
- Use Element Plus icons.
- Use existing CSS tokens.
- Avoid old single-column card stack.
- Avoid card-in-card nesting.
- Keep layout dense and suitable for bank relationship managers.
- The result should look like a report workbench similar to the target HTML.

Validation:
- npm run build
- Browser-check /enterprise-diagnosis:
  1. search/select 唐山物桥商贸有限公司
  2. result header appears
  3. 8 dimensions appear
  4. dimension click filters indicators
  5. risk/highlight/all tabs work
  6. 查看证据链 opens drawer
  7. report actions create visible feedback
  8. AI assistant shows selected context

Final response:
- changed files
- what was connected from existing data
- build result
- browser verification result
```
