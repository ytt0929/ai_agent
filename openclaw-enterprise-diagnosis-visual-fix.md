# OpenClaw Prompt: Enterprise Diagnosis Visual + Demo-State Fix

```text
You are a senior UI/UX engineer and frontend engineer.

Project:
D:\demo\ai-copilot

Read only this prompt.
Do not read old prompt files.

Goal:
Fix the currently broken/empty-looking Enterprise Diagnosis result page.
This is not a full rebuild. Keep the existing report workbench direction, but make it visually correct and demo-ready.

Scope:
- src/pages/EnterpriseDiagnosisPage.vue
- src/stores/enterpriseDiagnosis.js
- src/data/mockEnterpriseDiagnosis.js only if needed

Do not modify other pages.
Do not change routes, dependencies, global tokens, or app shell.

Current visible problem:
The page can open with 杭州智造装备有限公司 / simple low-risk data.
That simple data has:
- riskItems: []
- highlightItems: []
- allIndicators: []
- evidenceChain: {}
- reportDraft: null

But EnterpriseDiagnosisPage.vue still renders the full report workbench layout.
Result:
- AI 综合诊断 shows 0/0/0/0
- 报告产物 shows empty counts
- 八大维度 chart area has huge empty space
- indicator area has no useful content
- page looks broken and unfinished

Required fix:

1. Make 唐山物桥商贸有限公司 the primary demo scenario
- quick choices must include 唐山物桥商贸有限公司 and preferably show it first.
- If the user reaches /enterprise-diagnosis result through quick demo, the intended demo should be 唐山物桥商贸有限公司, not 杭州智造装备有限公司.
- Do not remove other enterprise options, but the default/demo path should guide users to 唐山物桥.

2. Handle simple-data enterprises gracefully
If result.allIndicators is empty:
- Do not render the full risk/highlight report workbench as if data exists.
- Show a compact normal-result state:
  - enterprise header
  - score/grade
  - AI conclusion
  - 8 dimension compact matrix
  - short empty state: "暂无风险指标，当前企业仅展示基础诊断结果"
- Hide or simplify:
  - 风险事项/企业亮点/全量指标 tabs
  - evidence drawer trigger
  - reportDraft counts
This prevents the 0/0/0/0 broken impression.

3. Fix visual layout for report workbench state
When result.allIndicators has data, especially 唐山物桥:
- Keep top header compact and aligned.
- The score card should not float too far right or feel disconnected.
- AI 综合诊断 + 报告产物 should align in one row on desktop.
- 八大维度诊断 should not have a giant blank dashed area.
- The matrix/chart area should be filled with 8 score cards or a clear CSS chart-like layout.
- The left dimension list should not be too tall compared with the chart area.
- Indicator rows should be visible below the dimension section without excessive blank space.
- Use max-width and grid columns that work inside the app sidebar layout.

Recommended desktop layout:
- .ed-page max-width: 1280px or 1320px, not too wide.
- result header: company info left, score card right.
- AI diagnosis grid: 2 columns, main content 2fr, report panel 1fr.
- dimension section:
  - top tabs right
  - inside: 280px dimension list + flexible matrix
  - matrix uses 4 columns x 2 rows, no large blank center.
- workbench:
  - indicators main column + AI assistant side column
  - avoid huge empty areas.

4. Fix operation feedback
Report action buttons currently log operation but page does not show operationLog.
Render a compact "最近操作" area inside report panel.
Show at most latest 3 operations:
- time
- action
- result text
ElMessage can remain, but visible page feedback is required.

5. Fix indicator interaction
- Clicking an indicator row should set selectedIndicator and activeDimension.
- Clicking 查看证据链 should open drawer and set selectedIndicator.
- AI assistant context should update immediately after selecting indicator.

6. Fix dimension state
toggleDimension must be consistent:
- select dimension: activeDimension = key, indicatorDimensionFilter = key
- click same dimension again: activeDimension = null, indicatorDimensionFilter = all
Visual highlight and indicator filter must match.

7. Fix rating wording conflict
Header should not show "纳税信用 D" if summary/highlights mention "纳税信用 A级".
Use:
- 综合评级 D
- 纳税信用 A级 as a separate positive evidence/highlight.

8. Keep style professional
- No emoji.
- Use Element Plus icons where needed.
- Use existing CSS tokens.
- Avoid oversized blank containers.
- Avoid dashed placeholder boxes unless they are visually filled.
- Keep cards radius to existing tokens.
- Do not add decorative gradients.

Validation:
- npm run build
- Browser-check:
  1. /enterprise-diagnosis search state shows 唐山物桥商贸有限公司 in quick choices.
  2. Selecting 唐山物桥 shows non-empty AI diagnosis: 风险 8, 高风险 3, 亮点 9, 强亮点 3.
  3. 八大维度 section is filled, no giant blank chart area.
  4. 风险事项/企业亮点/全量指标 tabs show real indicators.
  5. Clicking a dimension filters indicators and highlight matches.
  6. Clicking an indicator updates AI assistant context.
  7. 查看证据链 opens drawer with evidence.
  8. Report actions show visible "最近操作" feedback.
  9. Selecting a simple enterprise like 杭州智造 does not show broken 0/0/0/0 layout.

Final response:
- changed files
- visual layout fixes
- demo-state fixes
- interaction fixes
- build result
- browser verification result
```
