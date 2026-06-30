# OpenClaw Current Short Prompt: Phase 2 Batch 3 Stage-Driven Workspace

```text
Read only this short prompt. Older prompts below are archive and may conflict with this direction.

You are a senior UI/UX engineer and frontend engineer.

Project:
D:\demo\ai-copilot

Scope:
Only modify `src/pages/DueDiligenceTaskPage.vue`.
Do not modify other pages unless absolutely necessary.
Do not change routes, stores, dependencies, or global tokens.

Current problem:
The page now has a top process bar, main work area, and right AI chat, but the UX is still not correct:
1. The top process bar is static and has no interaction/dynamic feedback.
2. Process stages and artifacts are not symmetrical. The work area should represent the current selected/current stage, not always show generic artifacts.
3. The right chat panel is not sufficiently linked to the current work area/stage.

New product direction:
This page should be a stage-driven due diligence workspace.
The process bar is not decoration. It is the navigation/control for the workspace.
When the user selects a stage, the center work area and right AI context should reflect that stage.

Required interaction model:
1. Process bar:
   - Show 7 stages:
     工商核验, 司法查询, 税票采集, 资料补充, 证据整合, 风险诊断, 产物确认
   - Completed stages use green.
   - Current/selected stage uses blue and is visually strongest.
   - Pending stages use gray.
   - Clicking a stage changes the selected stage in local component state.
   - Add a small dynamic visual response:
     hover state, active underline/ring, connector progress highlight, or selected card transition.
   - Do not add heavy animation; use subtle transition only.

2. Center work area:
   - Must be driven by selected/current stage.
   - It should not only show a generic "all artifacts" section.
   - For each stage, show:
     - stage title
     - status summary
     - current output/produced artifact for that stage
     - primary action
     - compact evidence/detail summary
   - Demo data may be static and local in the component.

Suggested static stage-to-work-area mapping:
- 工商核验:
  output: 工商核验结果
  action: 查看工商信息
  detail: 主体信息、经营状态、注册资本、异常项
- 司法查询:
  output: 司法查询摘要
  action: 查看司法风险
  detail: 被执行、裁判文书、限制高消等
- 税票采集:
  output: 税票采集结果
  action: 查看税票采集
  detail: 已采集张数、缺口、授权状态
- 资料补充:
  output: 客户补充资料
  action: 查看/补充资料
  detail: 已上传文件、待补材料
- 证据整合:
  output: 证据包
  action: 查看证据
  detail: 证据数量、覆盖率、缺口
- 风险诊断:
  output: 风险诊断摘要
  action: 查看风险
  detail: 高/中/低风险数量
- 产物确认:
  output: 尽调报告草稿 / 客户补充清单
  action: 进入智能报告 / 确认全部
  detail: V2 有 3 处待确认

3. Artifact/product display:
   - Artifacts should be related to the selected/current stage.
   - For "产物确认", showing the 4 final artifacts is correct.
   - For earlier stages, show that stage's output card(s), not the full final artifact grid.
   - Static demo data is fine. Do not overfocus on backend-real status.

4. Right AI panel linkage:
   - Right chat should show context for the selected stage.
   - When selected stage changes, update:
     - AI insight text
     - quick action chips/buttons
     - suggested questions
   - Example:
     selected 风险诊断 -> quick questions about high risk and report wording.
     selected 税票采集 -> quick questions about missing invoices/auth.
     selected 产物确认 -> quick actions: 进入智能报告, 导出产物包, 提交确认.
   - It can be local computed/static data; no backend needed.

5. Visual style:
   - Restore meaningful but restrained icons.
   - Use Element Plus icons already imported or add imports from the same package.
   - No emoji.
   - Icons should help identify stage type and output type.
   - Use existing tokens only.
   - Keep financial product tone: professional, clean, restrained.

6. Layout:
   - Keep main work area + right AI panel.
   - Top process bar remains above the center stage content.
   - Avoid reintroducing the confusing left filter rail.
   - Ensure no bottom/global input overlaps main content.
   - Keep center area scrollable if content overflows.

Validation:
- `npm run build` passes.
- Browser check confirms:
  - process bar has hover/selected feedback
  - clicking stages changes center work content
  - selected/current stage is obvious
  - center work area matches selected stage
  - right AI panel context/quick actions match selected stage
  - final "产物确认" stage shows final artifacts and report actions
  - page still feels like a polished bank RM workflow console

Final response must include:
1. Changed files
2. How stage selection works
3. Stage-to-work-area mapping
4. How right AI context links to selected stage
5. Build result
6. Browser visual verification result
```

---

# OpenClaw Current Short Prompt: Phase 2 Batch 3 Layout Direction Update

```text
只读这一段短提示词即可，下面的旧长提示词是历史归档，不要继续执行旧的三栏修复要求。

You are a senior UI/UX engineer and frontend engineer.

Project:
D:\demo\ai-copilot

Scope:
Only modify `src/pages/DueDiligenceTaskPage.vue`.
Do not modify other pages unless there is a tiny direct dependency issue.
Do not change routes, stores, dependencies, or global tokens.

Current UX decision:
Do NOT force the due diligence detail page into a three-column layout.
The current left workflow rail is confusing: it looks like a filter panel, not an actual process.
For this demo-stage bank relationship-manager Agent product, use a clearer layout:

New target layout:
1. Header remains at the top with enterprise name, industry/region/amount, status, progress.
2. Main page becomes two columns:
   - main work area
   - right AI due-diligence assistant
3. Move the workflow process into the top of the main work area as a horizontal process bar.
4. Remove or greatly reduce the left workflow rail.
5. Keep the right AI panel visible and contained, with optional collapse if already available.

Main work area structure:
1. Horizontal process bar at the top:
   - 工商核验
   - 司法查询
   - 税票采集
   - 资料补充
   - 证据整合
   - 风险诊断
   - 产物确认
   Show clear order and current step.
   Use static demo data if needed. It does not need to be backend-real.

2. Current focus block directly under the process bar:
   For report-ready task:
   - title: 产物确认
   - text: 报告草稿 V2 有 3 处待确认，确认后即可提交
   - primary action: 进入智能报告
   - secondary action: 确认全部

3. Static artifact entry area:
   Treat the four artifacts as static demo entries, not backend status-driven cards.
   Do NOT make all buttons say "确认".
   Use fixed type semantics:
   - 证据包: icon = evidence/file/archive, action = 查看证据
   - 风险诊断摘要: icon = warning/analysis, action = 查看风险
   - 尽调报告草稿: icon = document/edit/report, action = 进入报告
   - 客户补充清单: icon = list/send, action = 查看清单 or 发送清单

4. Completed process records below artifacts:
   Show compact completed steps.
   Completed = green subtle style.
   Current = blue stronger style.
   Pending = gray muted style.

Visual style requirements:
- Restore meaningful icon richness, but keep it professional and restrained.
- Use Element Plus icons already available; no emoji.
- Icons should have small tinted containers:
  - 28-32px
  - radius 6-8px
  - subtle background
  - icon size 16-18px
- Artifact entries should be visually distinguishable by type, not by "real status".
- Use existing tokens only.
- Do not use gradients or large shadows.
- Keep financial product tone: restrained, credible, clean.

Important correction:
Do not overfocus on mapping real artifact statuses.
This is static demo data.
The issue is not whether status is real.
The issue is that static artifact types and action semantics are unclear.

Layout requirements:
- Main work area should be wider than before.
- Right AI panel should be about 320-360px.
- Horizontal process bar should make the workflow understandable in one glance.
- Evidence coverage can be moved under the process bar or into a compact summary near the current focus block.
- Avoid a separate left sidebar unless it has clear value.
- No top blank area.
- No duplicate global/page input covering content.

Do not:
- Do not go back to card-gallery demo style.
- Do not remove the due diligence assistant.
- Do not make the page decorative.
- Do not use emoji.
- Do not add dependencies.
- Do not rewrite stores.

Validation:
- `npm run build` passes.
- Browser visual check confirms:
  - layout is now main work area + right AI panel
  - process is visible as a horizontal sequence
  - user can tell current step is 产物确认
  - artifact cards have distinct icons and actions
  - actions are not all "确认"
  - page feels like a polished workflow console, not a wireframe

Final response must include:
1. Changed files
2. Layout change summary
3. How process moved from left rail to top process bar
4. Artifact icon/action mapping
5. Build result
6. Browser visual verification result
```

---

# Archive: Previous Long Prompt

# OpenClaw Phase 2 Current Prompt: Fix Batch 3 Workflow Workspace Structure

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Current status:
Phase 2 Batch 1/2 is complete enough:
- Workbench / Home
- Screening initial page
- Screening results page

Continue Phase 2 Batch 3 only.
Batch 3 is NOT complete because the due diligence detail page has a layout regression.
After the latest visual check, the detail page still does not match the expected workflow workspace effect.

Do not expand into all pages yet.
Do not start Batch 4-7.
Do not try to solve full global page-type unification in this pass.

Why:
This is still a demo-stage Agent product for bank relationship managers.
The demo path now continues from screening results into due diligence:
Screening results -> batch transfer to due diligence -> manage due diligence queue -> inspect a due diligence task workflow.

Current pass scope:
- src/pages/DueDiligenceHomePage.vue
- src/pages/DueDiligenceTaskPage.vue
- src/data/mockDueDiligence.js only if you need to import existing artifact data or add tiny missing artifact metadata.

Only edit shared components used directly by these two pages if a tiny safe adjustment is absolutely required.
Only edit shared tokens if a tiny safe adjustment is absolutely required.
Do not edit other pages.

Product positioning:
This is a demo-stage Agent product for bank relationship managers.

Important clarification:
Phase 2's larger problem is that page-type rules are not globally implemented yet.
However, Batch 3 scope is only the due diligence pages.
Do not touch tax RPA, document recognition, diagnosis, monitoring, reports, or business-risk pages in this pass.

Strict boundaries:
- Do not change routes.
- Do not change store state shape.
- Do not change API assumptions.
- Do not add dependencies.
- Do not introduce a new UI framework.
- Do not edit src/style.css or src/styles/global.css.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.
- Do not start Batch 4.
- Do not perform broad refactors.
- Do not over-polish.
- Do not do full productization.

Batch 3 page types:
1. DueDiligenceHomePage.vue = Data Result / Task Queue page
2. DueDiligenceTaskPage.vue = Workflow Workspace page

Primary goal for Batch 3:
Turn intelligent due diligence from a display-style demo into a relationship-manager task queue and workflow workspace.

Current assessment:
- DueDiligenceHomePage.vue is basically complete.
- It already uses a task queue table with toolbar, blocker column, next-action column, source column, and compact stats.
- Do not rewrite DueDiligenceHomePage.vue.
- DueDiligenceHomePage.vue launch flow is already acceptable if:
  clicking "发起智能尽调" opens enterprise selection first,
  task creation happens only after enterprise selection,
  and no blank "待选择企业" detail page is created.
- Only touch DueDiligenceHomePage.vue if this exact launch flow is broken after you inspect the current code.
- DueDiligenceTaskPage.vue has regressed visually and structurally.
- The current rendered page does NOT look like a workflow workspace.
- Screenshot symptoms:
  - left workflow rail becomes extremely wide
  - evidence coverage bars stretch across almost the whole page
  - center work area is missing or pushed far below
  - giant dark icon-like shapes appear in the lower viewport
  - the right AI panel is not visible as a proper right-side auxiliary panel
- Latest screenshot symptoms after partial fixes:
  - the top of the work area is empty, especially above the center column
  - the page lacks clear vertical separation between left process rail, center work area, and right AI panel
  - the center column starts too low and does not show a clear current-task/focus module at the top
  - the right AI panel floats on the background instead of reading as a contained auxiliary panel
  - the layout feels like loose content on one canvas, not a process workspace
- This must be fixed before claiming Batch 3 complete.

Latest code audit result:
Build currently passes, but Batch 3 is still NOT complete.
Do not treat "npm run build passed" as completion.
The problem is rendered layout and UX correctness.

Most recent code audit, highest priority:
The current DueDiligenceTaskPage.vue can build, but the center workspace is still visually broken.
The screenshot shows a large blank area at the top of the center column and no independent vertical scroll inside the center work area.

Root cause 1: `card-animate` makes top center modules invisible while still occupying space.
- In src/pages/DueDiligenceTaskPage.vue, the report-ready branch uses:
  - `<section class="center-module center-module--output card-animate">`
  - `<div class="next-action-banner next-action-banner--confirm card-animate">`
- These are exactly the modules that should appear at the top of the center column for a task with status "报告待确认" and currentStep "artifacts".
- Global src/styles/tokens.css defines:
  `.card-animate { animation: card-enter var(--duration-slowest) var(--ease-out) forwards; opacity: 0; }`
- DueDiligenceTaskPage.vue also defines a local `.card-animate { animation: fadeInUp 0.3s ease; }`
- Because the local animation overrides the global animation but does not override `opacity: 0` and does not use `forwards`, the element can remain transparent after animation.
- Result: the center modules occupy height but are invisible, causing the large blank area in the screenshot.

Required fix for root cause 1:
- Do not let DueDiligenceTaskPage.vue center modules inherit an invisible `card-animate` state.
- Preferred fixes:
  1. Remove `card-animate` from DueDiligenceTaskPage.vue center modules and banners; or
  2. Locally override `.due-task .card-animate { opacity: 1; animation: none; }`; or
  3. Use a local animation with `forwards` and explicit final opacity.
- The simplest safest fix is to remove `card-animate` usage from DueDiligenceTaskPage.vue and keep the page static/stable.
- After the fix, the "尽调产物" and "产物确认" modules must be visible at the top of the center column for report-ready tasks.

Root cause 2: the center work area has no independent vertical scroll.
- Current CSS has:
  `.due-task__content { min-width: 0; padding-top: 0; }`
- Left rail has `max-height` and `overflow-y: auto`.
- Right AI panel has fixed height and internal scroll.
- Center work area has no height/max-height/overflow-y, so the full page scrolls instead of the center workspace.

Required fix for root cause 2:
- Make the three-column workspace behave like a console/workbench.
- Give the body and center column a stable viewport-relative height.
- Example direction:
  `.due-task__body { height: calc(100vh - 120px); align-items: stretch; }`
  `.due-task__content { min-width: 0; height: 100%; overflow-y: auto; padding-right: var(--space-xs); }`
  `.due-task__rail, .due-task__chat { height: 100%; max-height: none; }`
- Tune exact height to match the actual header height.
- The result must show an independent vertical scrollbar for the center content when content overflows.
- Avoid making the page rely only on the browser page scrollbar.

Current residue to clean in DueDiligenceTaskPage.vue:
- Remove the literal `\n` at the end of the `.status-card__time` CSS line.
- Replace `width: 100%%` with `width: 100%`.

Do these newest fixes before any further visual polish.

Confirmed blockers in src/pages/DueDiligenceTaskPage.vue:
1. The three-column grid uses undefined CSS variables:
   - current code uses `grid-template-columns: var(--rail-width) 1fr var(--chat-width);`
   - `--rail-width` is not defined in src/styles/tokens.css
   - `--chat-width` is not defined in src/styles/tokens.css
   - this likely causes the left rail / center work area / right AI panel layout to collapse or stretch incorrectly.
2. Several Element Plus icons are rendered raw instead of inside controlled `<el-icon>` wrappers:
   - `<CircleCheck />`
   - `<Loading />`
   - `<Clock />`
   These must be wrapped and sized. This likely causes the giant dark icon shapes seen in the screenshot.
3. The back action is wrong:
   - current code has `router.push('/due')`
   - there is no `/due` route
   - correct return route should be `/due-diligence`
4. Some CSS variables used in this page are not defined in tokens:
   - `--border-base`
   - `--surface-hard`
   - `--bg-success-subtle`
   Use existing tokens instead, such as:
   - `--border-default`
   - `--border-light`
   - `--surface-card`
   - `--surface-soft`
   - `--color-success-bg`

The screenshot failure to fix:
- left rail and evidence coverage are visually stretched
- center work area is not presented as the primary workflow area
- right AI panel is not clearly visible as a right-side auxiliary panel
- large uncontrolled dark icon shapes appear in the lower viewport
- there is too much empty vertical space
- even after basic width repair, the workspace top remains visually empty
- the page needs explicit column boundaries and panel structure
- the first viewport must show a clear current workflow focus, not just scattered status groups

OpenClaw must fix these exact blockers first.
After fixing them, inspect the page in the browser at desktop size.
Only then decide whether Batch 3 is complete.

Updated UX target:
The due diligence detail page should feel like a professional workflow console, not a normal page with cards.
It should have:
- a compact fixed header with enterprise identity, status, progress, and primary next action
- a three-column workspace immediately below the header
- visible vertical separation between columns
- left column = process navigation and evidence coverage
- center column = current work focus and workflow output
- right column = AI assistant / decision support

The first viewport must answer:
- Which company is this?
- What is the current workflow state?
- What is blocking progress?
- What should the relationship manager do next?
- Where can the user view outputs or evidence?

The user should understand within seconds:
- DueDiligenceHomePage: which due diligence tasks require attention, where the blockers are, and what the next action is.
- DueDiligenceTaskPage: which workflow step is current, where the process is stuck, what to do next, and how AI assists.
- DueDiligenceTaskPage must also answer:
  - What has already been produced?
  - What can I view, export, confirm, or hand off?

DueDiligenceHomePage.vue required verification:
1. Keep current task queue structure.
2. Do not convert it back to cards.
3. Verify the "发起智能尽调" flow.
4. Required launch behavior, which should already be present:
   - First click opens an enterprise selection UI, such as a modal/dialog/drawer.
   - User selects one enterprise/customer.
   - Only after selection should the code create the due diligence task.
   - Only after task creation should it navigate to `/due-diligence/:taskId`.
   - Do not create or show a task named "待选择企业".
5. Candidate enterprise source:
   - Prefer existing screening results/customers if available.
   - If no candidates exist, show a clear empty state with an action to go to intelligent screening.
   - Do not invent a separate heavy customer-management module.
6. Keep this launch selection UI compact and task-oriented:
   - search input
   - customer list
   - selected state
   - confirm button
   - cancel button
7. Do not make other homepage changes unless required by the launch-flow verification:
   - next-action column clarity
   - blocker tag clarity
   - tokenized colors
   - obvious typo/copy issue

DueDiligenceTaskPage.vue current issue:
- The page appears to have been over-compressed / partially rewritten.
- It contains visible mojibake / broken Chinese in template and script.
- It likely contains malformed template or script fragments.
- It uses undefined or unreliable layout variables such as rail/chat widths, causing the three-column grid to fail.
- It may render Element Plus icons at uncontrolled size, creating giant dark icon shapes.
- It no longer visually matches the intended Batch 3 workflow workspace.

DueDiligenceTaskPage.vue required changes:
1. Restore the page as a Workflow Workspace.
2. Restore a stable desktop three-column layout:
   - left rail: fixed 220-260px
   - center work area: flexible minmax(0, 1fr)
   - right AI panel: fixed 320-360px
3. Use explicit CSS dimensions, not undefined width variables.
   Example:
   .due-task__body {
     display: grid;
     grid-template-columns: 240px minmax(0, 1fr) 340px;
     gap: var(--space-lg);
     align-items: start;
   }
   Do not use `var(--rail-width)` or `var(--chat-width)` unless you define them safely in the same component or in tokens.
   Prefer explicit local dimensions for this pass:
   - 240px
   - minmax(0, 1fr)
   - 340px
4. The left rail must not stretch full width.
5. Evidence coverage bars must stay inside the 220-260px rail.
6. The center work area must be visible in the first viewport.
7. The right AI panel must appear as a right-side auxiliary panel, not vanish or push content.
7a. Add visible column separation:
   - use full-height column containers or clear vertical dividers
   - left rail and right AI should read as separate panels
   - center work area should have its own top-aligned content block
   - avoid all three columns floating on the same unbounded background
7b. Remove the empty top gap in the center work area:
   - the center column must start near the top of the workspace, aligned with the left and right columns
   - the first center module should be the current-focus / next-action module for in-progress tasks
   - for report-ready tasks, the first center module should be output readiness / artifacts
7c. Add a center "current focus" module for non-output-ready tasks:
   - title: 当前焦点 / 当前步骤
   - step name
   - current blocker or progress summary
   - primary action button
   - lightweight progress or risk summary
   This module should sit at the top of the center column.
7d. Right AI panel should be visually contained:
   - give it a panel background or clear border
   - align it to the top of the workspace
   - keep input fixed at the bottom of the panel if practical
   - do not let it float as loose messages on the page background
8. Make all Element Plus icons controlled:
   - wrap icons with <el-icon>
   - set reasonable font-size / width / height
   - no icon should visually exceed 24px inside normal cards or rail controls
   Specifically fix raw icon usage in group headers:
   - CircleCheck
   - Loading
   - Clock
9. Keep state-aware ordering:
   - if isOutputReadyTask: artifacts first, then confirm/action banner, then process groups
   - if !isOutputReadyTask: next-action/current-focus first, then process groups, then artifacts
10. Restore readable Simplified Chinese copy in visible UI and comments touched in this file.
11. Remove mojibake strings from visible UI.
12. Right-side AI panel should be auxiliary, not dominant.
13. Keep the right AI panel collapsible with a visible restore entry.
14. Evidence coverage should be a lighter summary, not a heavy visual block.
15. Status colors must be consistent:
   - blue = in progress
   - green = completed / low risk
   - yellow = waiting / attention
   - red = exception / high risk
16. Reduce obvious emoji in newly edited high-visibility workflow UI.
17. Avoid adding new cards unless they clarify current step, blocker, or next action.
18. Keep existing business interactions working.
19. Fix the back button route from `/due` to `/due-diligence`.
20. Replace undefined CSS tokens in this page:
   - replace `--border-base` with `--border-default` or `--border-light`
   - replace `--surface-hard` with a valid subtle background token
   - replace `--bg-success-subtle` with `--color-success-bg`

Visual structure requirements:
1. The header should not consume excessive vertical space.
2. The workspace body should begin immediately after the header.
3. The left rail, center area, and right AI panel should be visually separated.
4. Use one of these acceptable separation methods:
   - three panel containers with subtle borders/backgrounds
   - or vertical borders between columns
   - or a shell layout where left/right are side panels and center is the work surface
5. Do not rely only on whitespace to communicate structure.
6. Do not leave a large empty band above the center content.
7. The center column should be visually dominant, but not disconnected.
8. The right AI panel should support the work, not become a floating chat area.

Most important missing requirement:
Fix the visual layout regression in DueDiligenceTaskPage.vue.

The page must visually resemble a professional workflow workspace:
- compact left rail
- visible center task/work area
- visible right AI assistant
- no giant icons
- no stretched evidence bars
- no huge empty voids
- no mojibake in visible UI

Then verify the state-aware order:
- In-progress / waiting tasks should lead with current step, blocker, and next action.
- Report-ready / completed tasks should lead with artifacts, report draft, evidence package, risk summary, and confirm/export actions.

Do NOT claim completion only because the branch order exists in code.
The rendered page must actually look correct at desktop size.

Artifact data:
Use existing artifact data from:
- src/data/mockDueDiligence.js

Existing artifactsList includes:
- 证据包
- 风险诊断摘要
- 尽调报告草稿
- 客户补充清单

The middle work area already shows artifacts. Keep the artifact content and actions, but make placement state-aware.
Each artifact should continue to show:
- name
- status
- count or short summary
- primary action

Suggested artifact actions:
- 证据包 -> 查看证据
- 风险诊断摘要 -> 查看风险
- 尽调报告草稿 -> 查看报告 / 进入智能报告
- 客户补充清单 -> 查看清单 / 发送补充

Use existing local patterns for actions:
- route to /smart-report for report entry if appropriate
- route to /enterprise-diagnosis for risk detail if appropriate
- show ElMessage feedback for export/confirm actions if no real route exists
- use existing store.handleChipAction() if it fits without a store refactor

Required state-priority behavior:
If the task status is "报告待确认", "已完成", or currentStep is "artifacts":
- The artifacts area should appear before the step groups or be visually stronger than the step groups.
- The first thing the user should see should be:
  - conclusion / output readiness
  - report draft
  - evidence package
  - risk summary
  - confirm/export actions

If the task is not near completion:
- The next-action banner or current-step focus area must appear before the artifacts area.
- Show artifacts area below the next-action/current-step area.
- Artifacts that are not ready can be shown as pending/processing, but still provide orientation.

Implementation guidance:
Implementation guidance:
- First run npm run build and fix any Vue/template/script errors in DueDiligenceTaskPage.vue.
- Inspect browser rendering, not only code.
- If current DueDiligenceTaskPage.vue is too broken, restore the previous readable structure manually:
  header
  body grid
  left rail
  center content
  right chat panel
- Do not minify the Vue template into unreadable one-line markup.
- Keep template readable and maintainable.
- Use explicit CSS for:
  .due-task
  .due-task__body
  .due-task__rail
  .due-task__content
  .due-task__chat
- Avoid full-page SVG/icon-like shapes.
- Do not use raw icon components directly as layout elements.
- All icon components should be inside <el-icon> and sized with CSS.
- Check desktop viewport around 1600x900.
- Optional but recommended: also check 1366x768.

Do not hide process status.
The goal is not to replace the process with artifacts.
The goal is to pair:
- current process / next action
- generated outputs / artifacts

DueDiligenceTaskPage.vue target effect:
The relationship manager can quickly judge where the due diligence process is stuck and what to do next.
The relationship manager can also see what has already been produced and open the report/evidence/risk outputs.
AI should feel like help in the workflow, not a separate competing product.

Shared visual requirements for Batch 3:
- Match the Batch 1/2 baseline.
- Use existing tokens.
- Do not invent a new radius/color/shadow system.
- Keep card radius at var(--radius-md) unless there is a strong local reason.
- Keep financial product tone restrained and professional.
- Data and task information should be scan-friendly.
- Avoid decorative gradients, excessive icons, or emoji in edited high-visibility areas.
- Do not make the page feel like a marketing page.

Targeted cleanup for this pass:
- Remove visible mojibake in DueDiligenceTaskPage.vue.
- Remove giant icon rendering.
- Remove the remaining visible emoji if any.
- Keep tokenized colors.
- Do not perform broad refactors outside the due diligence pages.

Do NOT:
- Do not edit WorkbenchPage.vue.
- Do not edit ScreeningInitialPage.vue.
- Do not edit ScreeningResultsPage.vue.
- Do not edit TaxRpaPage.vue.
- Do not edit DocRecognitionPage.vue.
- Do not edit EnterpriseDiagnosisPage.vue.
- Do not edit EnterpriseMonitorPage.vue.
- Do not edit SmartReportPage.vue.
- Do not edit BizRisk pages.
- Do not rewrite stores.
- Do not change routes.
- Do not add new dependencies.
- Do not remove the current task queue table.
- Do not remove the next-action banner.
- Do not remove the existing tax/materials inline panels.

Validation:
- DueDiligenceHome first screen feels like a task queue, not a card gallery.
- DueDiligenceHome makes "待我处理" and next action obvious.
- Confirm, without rewriting if already correct, that clicking "发起智能尽调" first asks the user to select an enterprise.
- Confirm a due diligence detail page is opened only after enterprise selection and task creation.
- Confirm no blank "待选择企业" detail page is created.
- DueDiligenceTask desktop rendering has a stable three-column workspace:
  left rail 220-260px, center content flexible, right AI 320-360px.
- DueDiligenceTask workspace body starts immediately under the header; there is no large empty top band above the center work area.
- For a report-ready task such as "报告待确认" / currentStep "artifacts", the top of the center column visibly shows the output/artifacts module, not blank space.
- The "尽调产物" module and the "产物确认" banner must not be transparent or invisible due to `card-animate`.
- DueDiligenceTaskPage.vue must not leave `card-animate` elements at `opacity: 0`.
- The three columns are visually separated; left rail, center work area, and right AI panel must not look like loose content floating on one background.
- Center column top contains a visible current-focus module for in-progress/waiting tasks, or an output-readiness/artifacts module for report-ready tasks.
- The first viewport must show a complete workspace composition: left process rail + center focus/output + right AI panel aligned near the same top edge.
- The center work area has an independent vertical scrollbar when content overflows.
- Left rail, center content, and right AI should behave like workbench panels with stable viewport-relative heights.
- Clean residual CSS mistakes in DueDiligenceTaskPage.vue: no literal `\n`, no `100%%`.
- Left rail does not stretch across the page.
- Evidence coverage bars stay inside the left rail.
- No giant dark icons or oversized symbols appear.
- Center content appears in the first viewport.
- Right AI panel appears as a contained auxiliary right panel or has a clear restore control if collapsed.
- Right AI panel must have a clear panel boundary/background and should not float as loose chat messages on the page background.
- DueDiligenceTask in-progress/waiting task first screen makes current step, blocker, and next action obvious before artifacts.
- DueDiligenceTask middle work area contains visible artifact/output entries.
- For "报告待确认", "已完成", or currentStep "artifacts", artifact/report/evidence outputs are visually prioritized before process cards.
- Collapsing the right AI panel provides a clear way to reopen it.
- Right AI/chat area is auxiliary.
- Status colors are consistent.
- No mojibake or obvious emoji remains in newly edited high-visibility detail-page workflow UI.
- Hardcoded colors touched in DueDiligenceTaskPage are reduced or converted to existing tokens/classes.
- No unrelated page changes.
- No business logic regression.
- Run npm run build.
- Also visually verify the rendered DueDiligenceTaskPage.vue in the browser.

Final response must include:
1. Changed files.
2. Whether DueDiligenceHomePage was touched. If not touched, confirm the enterprise selection-before-detail flow was already correct.
3. What was completed for DueDiligenceTaskPage.
4. How task-state priority now works for in-progress vs output-ready tasks.
5. How completion-state output priority works.
6. How AI collapse and restore works.
7. How the three-column layout regression was fixed.
8. What demo residue was cleaned up, especially mojibake/emoji/hardcoded colors.
9. What was intentionally deferred.
10. Build result.
11. Visual verification result.
12. Final conclusion:
   - "Phase 2 Batch 3 is complete"
   - or "Phase 2 Batch 3 is not complete" with exact blockers.
```

---

## Previous Prompt Archive

# OpenClaw Phase 2 Current Prompt: Batch 1/2 Final QA Polish

Archived prompt. Do not follow this section if it conflicts with the latest prompt above.

```text
Phase 2 Batch 1/2 QA polish is complete enough to proceed to Batch 3.

Scope was:
- src/pages/WorkbenchPage.vue
- src/pages/ScreeningInitialPage.vue
- src/pages/ScreeningResultsPage.vue

Outcome:
- Workbench Agent input is inside today's-work area after inline AI suggestion.
- Screening initial is a search/create page.
- Screening results is a data result page with compact toolbar, table focus, sticky batch actions, and tokenized drawer width.

Do not repeat Batch 1/2 unless explicitly requested.
```

# OpenClaw Phase 2 Batch 2 Prompt: Finish Screening Pages

Archived prompt. Do not follow this section if it conflicts with the latest prompt above.

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Current status:
Phase 2 planning is complete.
Batch 1 is mostly complete.
Batch 2 has started but is not complete.

Now finish Batch 2 only.

Batch 2 scope:
- src/pages/ScreeningInitialPage.vue
- src/pages/ScreeningResultsPage.vue

Do not edit other pages in this batch unless a tiny shared style adjustment is absolutely required.

Product positioning:
This is a demo-stage Agent product for bank relationship managers.

Batch 2 page types:
1. ScreeningInitialPage.vue = Search / Create page
2. ScreeningResultsPage.vue = Data result page

Batch 2 goal:
The screening flow should clearly show:
- The relationship manager enters a client-screening need in natural language.
- AI recognizes screening conditions.
- The results page supports scanning, selecting, and batch actions.

Do not over-polish.
Do not do full productization.
Do not refactor business logic.

Strict boundaries:
- Do not change routes.
- Do not change store state shape.
- Do not change API assumptions.
- Do not add dependencies.
- Do not introduce a new UI framework.
- Do not edit src/style.css or src/styles/global.css.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.
- Do not start Batch 3.

ScreeningInitialPage.vue current status:
- Natural-language input is already the visual focus.
- Example chips are close to the input.
- AI condition recognition is already shown only after input.
- History and info areas are lower on the page.

ScreeningInitialPage.vue required finishing:
1. Keep the input as the main visual focus.
2. Do not add more explanatory cards.
3. Keep AI condition recognition collapsed until there is input.
4. Make history and explanation areas visually secondary.
5. Ensure visible copy in the browser is readable Simplified Chinese.
6. Keep styles aligned with Phase 1 tokens.

Suggested visible copy:
- Page title: 智能筛客
- Subtitle: 描述目标企业客户特征，AI 从企业库中生成匹配名单
- Placeholder: 筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户
- Submit label: 开始筛选
- Example label: 示例查询
- AI recognition title: AI 将自动识别
- Hint: 也可以直接输入自然语言，AI 将自动理解并拆解条件
- History title: 历史筛选记录
- Reuse: 再次使用
- More: 查看全部记录

ScreeningResultsPage.vue current status:
- Wide result table exists.
- Batch action bar exists and has sticky positioning.
- Drawer exists.
- But summary cards still compete with the result table.
- Some hardcoded colors remain.
- Drawer width is still hardcoded.
- Table toolbar/filter pattern is still weak.

ScreeningResultsPage.vue required finishing:
1. Make it clearly a Data Result page.
2. Result table should be the core visual area.
3. Summary cards should be compact and secondary.
4. Add or strengthen a compact table toolbar above the table if feasible.
   Toolbar may include:
   - selected count
   - risk/match filter chips
   - batch actions entry or table actions
   Do not add complex new logic if not already available.
5. Keep batch action bar sticky bottom or close to the table.
6. Drawer details should avoid repeating too much row information.
7. Drawer width should use token:
   - var(--drawer-width)
   or existing drawer token/class.
8. Replace obvious hardcoded visual colors with tokens/classes where safe:
   - #2563eb -> var(--color-primary)
   - #10b981 -> var(--color-success)
   - #f59e0b -> var(--color-warning)
   - #ef4444 -> var(--color-danger)
   - #94a3b8 -> var(--text-tertiary)
   - #dbe7f5 -> var(--border-default)
   - #e5eaf2 -> var(--border-soft)
   - #fff -> var(--surface-card)
9. If JavaScript helpers such as matchColor() return hardcoded colors, either:
   - convert them to CSS class names, or
   - return CSS var() strings such as var(--color-success), var(--color-primary), var(--color-warning).

Suggested visible copy:
- Page title: 智能筛客 · 结果
- Back button: 修改条件
- Summary labels:
  - 匹配企业
  - 高匹配
  - 可转尽调
- AI note: 已按匹配度排序，优先展示经营稳定、风险较低、具备尽调条件的企业。
- Table columns:
  - 企业名称
  - 匹配度
  - 风险
  - 推荐理由
  - 状态
- Batch selected: 已选择 X 家
- Batch actions:
  - 批量导出
  - 加入监测
  - 转入尽调
- Drawer title: 企业摘要
- Drawer sections:
  - 匹配度
  - 风险等级
  - 推荐理由
  - 状态

Important visual baseline:
The screening pages should follow the same lightweight visual baseline as the workbench:
- Use existing tokens.
- Do not invent new radius/color/shadow systems.
- Keep cards at var(--radius-md) unless there is a clear reason.
- Use restrained financial-product tone.
- AI should appear as useful decision support, not decoration.

Validation:
- ScreeningInitial first screen feels like an AI search/create entrance.
- ScreeningResults first screen feels like a data result review page.
- Result table is visually more important than summary cards.
- Batch action bar is sticky or clearly available near the table.
- Drawer uses token width.
- Obvious hardcoded colors in edited high-visibility areas are reduced.
- No business logic regression.
- Run npm run build.

Final response must include:
1. Changed files.
2. What was completed for ScreeningInitialPage.
3. What was completed for ScreeningResultsPage.
4. How the data-result page pattern was improved.
5. What was intentionally deferred.
6. Build result.
7. Final conclusion:
   - "Phase 2 Batch 2 is complete"
   - or "Phase 2 Batch 2 is not complete" with exact blockers.
```

---

## Older Prompt Archive

# OpenClaw Phase 2 Prompt: Page Type Rules And Demo Visual Baseline

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Product positioning:
This is a demo-stage Agent product for bank relationship managers.

Phase 2 must be understood correctly:
It is NOT full productization.
It is NOT a complete code refactor.
It is NOT full token migration for every page.
It is NOT only a workbench polish pass.

Phase 2 goal:
Establish page-type rules and a lightweight visual baseline for the bank relationship manager Agent demo.

The demo should feel like one coherent product, while each page type should match the user's task:
- Workbench: handle today's work.
- Search/create page: enter a need and start a task.
- Data result page: scan results and perform batch actions.
- Workflow workspace: drive a process and resolve blockers.
- Document editing page: review, edit, and export a report.

Phase 2 target effect:
Users should understand within 3 seconds whether the current page is for:
- handling tasks
- searching or creating
- reviewing results
- executing a workflow
- editing a report

Important visual baseline:
The workbench can be the first polished page, but it must NOT become a visual island.
Any new workbench style must follow the Phase 1 tokens and be reusable as a reference for later pages.

Do not create a new visual language only for the workbench.
Do not introduce new radius/color/shadow systems.
Do not make the homepage feel more polished than the rest by using one-off styles that later pages cannot follow.

Use existing design tokens whenever feasible:
- var(--surface-card)
- var(--surface-page)
- var(--surface-soft)
- var(--text-primary)
- var(--text-secondary)
- var(--text-tertiary)
- var(--border-default)
- var(--border-soft)
- var(--border-divider)
- var(--color-primary)
- var(--color-success)
- var(--color-warning)
- var(--color-danger)
- var(--radius-md)
- var(--shadow-sm)
- var(--font-size-body)
- var(--font-size-body-lg)
- var(--font-size-section-title)
- var(--font-size-page-title)
- var(--font-size-metric)
- var(--space-*)

Phase 2 deliverables:
1. A clear page-type system in the prompt/documentation.
2. A lightweight visual baseline for Demo pages:
   - cards use the same radius/border/background logic
   - KPI numbers use the same scale
   - table/result pages use compact scan-friendly layouts
   - status colors stay consistent
   - AI appears as decision support, not as decoration
3. Batch 1 implementation:
   - Sidebar + Workbench should demonstrate the baseline.
   - Workbench first screen focuses on today's tasks, AI next action, and task progress.
4. Later batches should adapt other pages to the same baseline by page type.

Phase 2 Batch 1 current status:
- Sidebar is mostly done.
- Workbench quick actions have been reduced to 4.
- Workbench has started using Phase 1 tokens.
- Workbench still needs final structure cleanup:
  - today's tasks must be visually primary
  - AI suggestion should be attached to task workflow, not a separate standalone card
  - weekly progress should be secondary
  - task table should remain but be lower/secondary

Current implementation focus:
Finish Batch 1 in:
- src/pages/WorkbenchPage.vue

Only edit src/components/AppSidebar.vue if there is a clear regression.
Do not edit other pages in this batch.

Workbench Batch 1 final requirements:
1. Today's pending tasks are the main first-screen area.
2. AI suggestion is integrated into today's tasks or the top priority task.
3. Weekly progress remains visible but secondary.
4. Quick actions remain exactly 4:
   - 发起尽调
   - 筛选客户
   - 税票采集
   - 资料识别
5. Task table remains available but is visually lower/secondary.
6. New workbench styles must follow the lightweight visual baseline and avoid one-off visual systems.

Page type roadmap after Batch 1:

Batch 2 - Search/create + data result pattern:
- ScreeningInitialPage.vue
- ScreeningResultsPage.vue

Batch 3 - Task queue + workflow workspace pattern:
- DueDiligenceHomePage.vue
- DueDiligenceTaskPage.vue

Batch 4 - Operational workflow pattern:
- TaxRpaPage.vue
- DocRecognitionPage.vue

Batch 5 - Risk handling + diagnosis result pattern:
- EnterpriseMonitorPage.vue
- EnterpriseDiagnosisPage.vue

Batch 6 - Document editing pattern:
- SmartReportPage.vue

Batch 7 - Business risk query/review pattern:
- BizRiskSinglePage.vue
- BizRiskBatchPage.vue

Strict boundaries:
- Do not change routes.
- Do not change store state shape.
- Do not change business logic.
- Do not add dependencies.
- Do not introduce a new UI framework.
- Do not edit src/style.css or src/styles/global.css.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.
- Do not implement all later batches now.

Validation:
- Browser first screen should clearly communicate: today's work + AI next action + task progress.
- Workbench should not feel like a generic function portal.
- Workbench styles should align with Phase 1 tokens and be suitable as a later-page baseline.
- Quick actions remain 4.
- Task table remains available.
- No business logic regression.
- Run npm run build.

Final response must include:
1. Changed files.
2. Whether Phase 2 goal is being followed.
3. How Batch 1 workbench was completed or what remains.
4. How the visual baseline was preserved.
5. What is deferred to later batches.
6. Build result.
7. Final conclusion:
   - "Phase 2 Batch 1 is complete"
   - or "Phase 2 Batch 1 is not complete" with exact blockers.
```

---

## Previous Prompt Archive

# OpenClaw Phase 2 Batch 1 Prompt: Finish Workbench Structure

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Current status:
Phase 2 planning is complete.
Phase 2 Batch 1 is partially complete.
Sidebar is mostly done. Do not keep changing the sidebar unless you find a clear regression.

Now finish Batch 1 by improving only:
- src/pages/WorkbenchPage.vue

Do not edit other pages.
Do not edit src/components/AppSidebar.vue unless absolutely necessary.

Product positioning:
This is a demo-stage Agent product for bank relationship managers.

Batch 1 final goal:
The workbench first screen must clearly answer:
"What should Zhang, the relationship manager, handle today?"

Current workbench progress:
- Quick actions have already been reduced to 4. Keep that.
- Sidebar positioning copy is already readable in the browser. Keep that.
- Today's tasks exist.
- Weekly progress exists.
- Task table exists.
- A small "AI recommendation priority" badge has been added to a task.

Remaining issues:
- AI suggestion still appears as an independent card.
- Today's pending tasks are not yet dominant enough.
- AI suggestion is not fully integrated into the task workflow.
- The task table is still too visually close to the primary first-screen content.
- The first screen still feels partially like stacked cards, not a daily relationship-manager workbench.

Required changes:

1. Make "Today's pending tasks" the primary first-screen area.
- Keep it visually larger than weekly progress and quick actions.
- It should communicate priority, client, reason, and next action.
- It should be the first thing the user notices after the greeting.

2. Integrate AI suggestion into the pending task workflow.
- Do not keep AI suggestion as a separate standalone marketing-style card.
- Move the AI suggestion content into the top priority task or directly under the today's tasks section.
- Suggested format:
  - A light inline recommendation block inside the today's task card/section.
  - Text such as: "AI 建议：优先处理宁波天合新材料税票超时事项；杭州智造装备证据已齐，可进入报告确认。"
  - Action buttons: "采纳建议" and "稍后处理" or "忽略".
- The AI should feel like a decision-support assistant attached to work, not a separate content card.

3. Keep weekly progress secondary.
- Weekly progress can remain on the right side or as a compact secondary panel.
- It should not compete with today's pending tasks.

4. Keep quick actions secondary.
- Keep exactly 4 quick actions:
  - 发起尽调
  - 筛选客户
  - 税票采集
  - 资料识别
- Quick actions should look like utility shortcuts, not the core of the page.

5. Move task table lower / make it visually secondary.
- Keep "我的任务" table available.
- It should act as a detailed queue, below the primary daily work area.
- Do not remove it.

6. Preserve current behavior.
- Do not change routes.
- Do not change store state shape.
- Do not change assistant store behavior.
- Do not remove conversation mode.
- Do not break send message / return / clear behavior.
- Do not edit other pages.

7. Keep banking relationship-manager tone.
Use restrained professional wording:
- 今日待办
- 推荐下一步
- 证据已齐
- 税票超时
- 报告待确认
- 待我处理
- 查看并确认
- 处理税票
- 查看进度
- 立即筛客

Avoid:
- Excessive emoji
- Marketing hero wording
- Generic SaaS wording
- Decorative AI copy

8. Use existing tokens/classes where safe.
Do not do a full CSS cleanup.
Only adjust what is necessary:
- primary pending task area
- inline AI recommendation block
- secondary weekly progress
- secondary quick actions
- task table spacing

Use tokens where convenient:
- var(--surface-card)
- var(--surface-soft)
- var(--text-primary)
- var(--text-secondary)
- var(--text-tertiary)
- var(--border-default)
- var(--border-soft)
- var(--color-primary)
- var(--color-warning)
- var(--color-danger)
- var(--radius-md)
- var(--shadow-sm)
- var(--space-*)

Validation:
- Browser first screen should make today's tasks the visual focus.
- AI suggestion should be attached to tasks, not a separate card.
- Quick actions remain 4.
- Task table still exists and is visually lower/secondary.
- No business logic changes.
- Run npm run build.

Final response must include:
1. Changed files.
2. How the AI suggestion was integrated into today's tasks.
3. How the first screen now prioritizes today's work.
4. Confirmation that quick actions remain 4.
5. Confirmation that task table remains available.
6. What was intentionally deferred.
7. Build result.
8. Final conclusion:
   - "Phase 2 Batch 1 is complete"
   - or "Phase 2 Batch 1 is not complete" with exact remaining blockers.
```

---

## Previous Prompt Archive

# OpenClaw Phase 2 Batch 1 Prompt: Sidebar And Workbench Demo Page

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Important:
Phase 2 planning is complete. Now implement Phase 2 Batch 1 only.

Batch 1 scope:
- src/components/AppSidebar.vue
- src/pages/WorkbenchPage.vue

Do not edit other pages in this batch unless a tiny shared style adjustment is absolutely required.

Product positioning:
This is a demo-stage Agent product for bank relationship managers.

The first screen must communicate:
"This is a bank relationship manager AI Copilot. It helps the manager know what to handle today, see AI-recommended next actions, and continue client tasks."

Important encoding note:
Terminal output may show mojibake while the browser may display Chinese correctly.
Do not judge only by terminal output.
Validate by running the app or reading the browser-rendered page if possible.
If you edit visible copy, make sure the final browser UI shows readable Simplified Chinese.

Strict boundaries:
- Do not change routes.
- Do not change store state shape.
- Do not change business logic.
- Do not change mock data structure broadly.
- Do not add dependencies.
- Do not redesign the whole app.
- Do not touch src/style.css or src/styles/global.css.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.
- Do not implement Phase 3/4 full roadmap in this batch.

Batch 1 goals:

1. Sidebar should clearly express the product positioning.
The sidebar should feel like a bank relationship manager workbench, not a generic SaaS menu.

Recommended visible copy:
- Product title: 客户经理 AI Copilot
- Product subtitle: 懂金融，更懂客户经理
- Main nav: 工作台
- Group title: 核心
- Core items:
  - 智能尽调
  - 企业诊断
  - 企业监测
  - 智能报告
- Group title: 工具
- Tool items:
  - 智能筛客
  - 税票采集
  - 资料识别
  - 工商查询
- User card:
  - 张经理
  - 客户经理
  - 浙江分行 · 公司金融部

Keep the current sidebar layout unless a small visual adjustment improves clarity.

2. Workbench must focus on "what should I handle today".
The first screen should not feel like a function portal.
It should feel like a daily workbench for a bank relationship manager.

Required workbench structure:
- Header: greeting + date + notification
- Primary area: today's pending tasks
- AI suggestion should be integrated into the pending-task area or visually attached to the most important task.
- Weekly/task progress should remain visible but secondary.
- Quick actions should be reduced to 4 and visually secondary.
- Task table should move lower and act as a detail/queue area.

Recommended workbench visible copy:
- Greeting: 上午好，张经理 / 下午好，张经理 / 晚上好，张经理
- Section: 今日待办
- Section: 本周进展
- Section: AI 建议
- Section: 快捷操作
- Section: 我的任务
- Actions:
  - 查看并确认
  - 处理税票
  - 查看进度
  - 立即筛客
  - 采纳建议
  - 忽略
- Table columns:
  - 企业名称
  - 类型
  - 进度
  - 状态
  - 下一步

Recommended demo tasks:
- 杭州智造装备：报告待确认，证据已齐
- 宁波天合新材料：税票已超时，已等 3 天
- 温州瑞达机械：税票采集中
- 新客户：建议先做快速筛查

Recommended quick actions, keep only 4:
- 发起尽调
- 筛选客户
- 税票采集
- 资料识别

Optional secondary actions such as 工商查询 or 看预警 should not dominate the first screen.

3. Banking relationship manager tone.
Use restrained, professional banking workflow wording.
Prefer:
- 企业客户
- 客户经理
- 尽调
- 税票
- 资料
- 证据
- 风险
- 预警
- 报告
- 下一步

Avoid:
- consumer-style copy
- excessive emoji
- decorative AI language
- marketing hero language

4. Visual behavior.
Use the existing first-stage tokens where safe:
- var(--surface-card)
- var(--surface-page)
- var(--text-primary)
- var(--text-secondary)
- var(--text-tertiary)
- var(--border-default)
- var(--border-soft)
- var(--color-primary)
- var(--color-success)
- var(--color-warning)
- var(--color-danger)
- var(--radius-md)
- var(--font-size-body)
- var(--font-size-page-title)
- var(--font-size-metric)

Do not perform a full CSS cleanup.
Only adjust styles needed for Batch 1:
- Make today's pending tasks visually primary.
- Make AI suggestion look attached to the workflow, not a separate marketing card.
- Make quick actions lighter and fewer.
- Keep task table readable but secondary.
- Preserve current clean financial-product tone.

5. Validation.
After changes:
- Verify the browser-rendered sidebar and workbench display readable Chinese.
- Verify the first screen communicates "today's work + AI next action + task progress".
- Verify quick actions are reduced to 4.
- Verify task table is still available.
- Verify no route/store/business behavior was changed.
- Run npm run build.

If build fails with code errors, fix them.
If build fails for an environment reason, report the exact reason.

Final response must include:
1. Changed files.
2. What changed in the sidebar.
3. What changed in the workbench first screen.
4. Whether the page now follows the Home / Workbench page type.
5. What was intentionally deferred to later batches.
6. Build result.
7. Final conclusion:
   - "Phase 2 Batch 1 is complete"
   - or "Phase 2 Batch 1 is not complete" with exact remaining blockers.
```

---

## Previous Prompt Archive

# OpenClaw Phase 2 Prompt: Page Type System For Bank RM Agent Demo

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Product positioning:
This is a demo-stage Agent product for bank relationship managers.

The demo should communicate:
A bank relationship manager uses this AI Copilot to handle corporate client screening, due diligence, enterprise monitoring, tax/invoice collection, document recognition, business-risk checks, and smart report preparation.

Important correction:
This is still a DEMO stage product.
Do not treat Phase 2 as full productization.
Do not do deep architecture refactoring.
Do not try to perfectly migrate every CSS rule to tokens.

Phase 2 purpose:
Build page-type rules so that different pages use layouts that match the task nature.

Current problem:
Too many pages look like generic card stacks.
The demo needs clearer page types so users can immediately understand whether they are:
- handling today's work
- searching or creating a task
- reviewing data results
- driving a workflow
- editing a report

Phase 2 target effect:
Users should know within 3 seconds what kind of page they are on:
- task handling
- search/create
- result review
- workflow execution
- report editing

Strict boundaries:
- Do not change business logic.
- Do not change routes.
- Do not change store state shape.
- Do not change API assumptions.
- Do not add dependencies.
- Do not introduce a new UI framework.
- Do not remove demo capabilities.
- Do not rewrite the whole app.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.
- Keep src/style.css and src/styles/global.css deprecated-only.
- Use existing tokens/classes from src/styles/tokens.css where safe.

Phase 2 page-type rules:

1. Home / Workbench page
Representative page:
- src/pages/WorkbenchPage.vue

Task nature:
The relationship manager needs to know what to handle today.

Layout rule:
- Core content should be "Today's tasks + AI suggestion + task progress".
- Do not make the page a large function-grid portal.
- Quick actions are secondary and should not dominate.
- Task table can sit lower on the page.

Target effect:
The relationship manager opens the home page and immediately knows the next action.

2. Search / Create pages
Representative pages:
- src/pages/ScreeningInitialPage.vue
- src/pages/EnterpriseDiagnosisPage.vue
- src/pages/BizRiskSinglePage.vue

Task nature:
The user enters a company, credit code, or natural-language request to start screening, diagnosis, or query.

Layout rule:
- The input area is the main visual focus.
- Example chips should sit close to the input.
- History and explanation cards should be visually weaker.
- AI condition recognition should expand only after input or when useful.

Target effect:
The page feels like an AI tool entrance, not a documentation page.

3. Data result pages
Representative pages:
- src/pages/ScreeningResultsPage.vue
- src/pages/BizRiskBatchPage.vue
- src/pages/DueDiligenceHomePage.vue

Task nature:
The user reviews many companies/tasks/results, filters them, and performs batch actions.

Layout rule:
- Prefer wide tables or compact result lists.
- Use a compact filter toolbar.
- Batch action bar should be sticky bottom or close to the table.
- Drawer details should avoid repeating information already shown in the row.
- Increase information density compared with display-card pages.

Target effect:
The page supports real list review and batch due-diligence transfer.

4. Workflow workspace pages
Representative pages:
- src/pages/DueDiligenceTaskPage.vue
- src/pages/DocRecognitionPage.vue
- src/pages/TaxRpaPage.vue

Task nature:
The user is driving a specific process and needs to know the current step, blocker, and next action.

Layout rule:
- Use left/right or three-column layout.
- Left: task/file/step list.
- Center: current work content.
- Right: AI assistance, evidence, details, or recommendations.
- Right-side auxiliary panel should be collapsible where feasible.
- Current step should be visually highlighted.

Target effect:
The user can quickly judge where the workflow is blocked and what to do next.

5. Document editing page
Representative page:
- src/pages/SmartReportPage.vue

Task nature:
The user edits, reviews, and exports a report.

Layout rule:
- Document body is primary.
- Keep fixed section navigation.
- AI assistant is secondary and collapsible.
- Improve paper/document feeling.
- Main actions should support report generation, section editing, and export.

Target effect:
The page feels like a real document workspace, not only a report-generation demo.

Recommended implementation batches:

Batch 1:
- Sidebar + WorkbenchPage.vue
- Goal: make the first demo screen express "bank relationship manager workbench".

Batch 2:
- ScreeningInitialPage.vue + ScreeningResultsPage.vue
- Goal: establish search/create and data-result page patterns.

Batch 3:
- DueDiligenceHomePage.vue + DueDiligenceTaskPage.vue
- Goal: establish task queue and workflow workspace patterns.

Batch 4:
- TaxRpaPage.vue + DocRecognitionPage.vue
- Goal: establish operational workflow pages.

Batch 5:
- EnterpriseMonitorPage.vue + EnterpriseDiagnosisPage.vue
- Goal: establish risk handling and diagnosis result patterns.

Batch 6:
- SmartReportPage.vue
- Goal: establish document editing pattern.

Batch 7:
- BizRiskSinglePage.vue + BizRiskBatchPage.vue
- Goal: establish single-company query and batch risk review patterns.

Phase 2 first implementation scope:
Do not implement every batch at once.
Start with Batch 1 unless explicitly instructed otherwise.

Batch 1 exact goal:
- Sidebar should clearly identify the product as a bank relationship manager AI Copilot.
- Workbench should focus the first screen on today's tasks, AI suggestion, and task progress.
- Quick actions should be secondary.
- The page should not feel like a generic function portal.
- Keep business logic unchanged.

Validation for Phase 2:
- The selected pages follow their page type.
- User can identify the page task within 3 seconds.
- The page feels appropriate for bank relationship managers.
- The demo path is readable and coherent.
- No business logic regression.
- npm run build is executed.
- If build fails with esbuild spawn EPERM, report it as a local permission issue and do not claim build success.

Later roadmap, not Phase 2 execution:

Phase 3 - Page-level remodeling:
- Workbench: enlarge today's tasks, merge AI suggestion into task cards, reduce quick actions to 4, move task table lower.
- Screening home: strengthen natural-language input, move examples near input, expand AI condition recognition only after input.
- Screening results: wider table, reordered columns, sticky batch action bar, leaner drawer details.
- Due diligence home: task list/table first, stats reduced from 6 to 4, highlight "pending my action".
- Due diligence task detail: highlight current step, collapsible right AI panel, lighter evidence summary.
- Tax collection: show different operation focus by status.
- Document recognition: adjustable three columns, stronger low-confidence field hints, fixed confirm-sync action.
- Enterprise diagnosis: "overview + dimensions + recommendations/actions", collapsible chat.
- Enterprise monitor: warnings first, rule creation secondary, blue lightweight input instead of purple natural-language bar.
- Smart report: document body first, paper feeling, collapsible chat, fixed section navigation.
- Biz risk single: reduce emoji, use left color stripe + title + facts + advice + primary action.
- Biz risk batch: full-width result table, filter in toolbar, sticky batch actions.

Phase 4 - Interaction and usability reinforcement:
- Sticky batch action bars.
- Collapsible right panels for three-column pages.
- Wide layout for long tables.
- Consistent primary action placement.
- Unified empty/loading/error states.
- Unified status colors:
  blue = in progress
  green = completed / low risk
  yellow = attention / waiting
  red = high risk / abnormal

Phase 5 - Acceptance:
- Pages feel like one coherent demo, not separate prototypes.
- Users understand each page's main task within 3 seconds.
- High-frequency actions are reachable within two clicks.
- Data pages show more useful information per screen.
- Typography is stable and readable.
- Financial product tone is restrained, credible, and professional.
- AI appears as decision support, not as a visual distraction.
```

---

## Previous Prompt Archive

# OpenClaw Phase 2 Prompt: Bank Relationship Manager Agent Demo

```text
You are a senior frontend engineer, UI engineer, and UX designer.

Continue in:
D:\demo\ai-copilot

Product positioning:
This is an Agent product for bank relationship managers.

The demo should communicate:
"A bank relationship manager can use this AI Copilot to screen corporate clients, launch due diligence, monitor enterprise risk, collect tax/invoice evidence, recognize documents, and generate decision-ready reports."

Primary user:
Bank relationship manager / corporate banking account manager.

Primary scenarios:
- Quickly screen prospective corporate clients.
- Start and track intelligent due diligence.
- Monitor existing corporate clients for risk signals.
- Collect tax/invoice data and supporting materials.
- Recognize uploaded documents and extract key fields.
- Compare materials against risk and compliance signals.
- Generate a smart report for internal review or credit decision support.

Product tone:
- Professional, reliable, risk-aware, and work-focused.
- It should feel like a banking productivity tool, not a generic chatbot demo.
- The AI should appear as a copilot that helps the relationship manager move work forward, not as a decorative assistant.

UI/UX implications:
- Copy should use banking/corporate-client wording.
- Prefer terms like: 客户经理, 企业客户, 准入筛选, 尽职调查, 风险预警, 税票采集, 资料识别, 交叉核验, 智能报告, 授信辅助, 贷前审查.
- Avoid generic phrases that do not fit banking work.
- Avoid overly playful copy in core workflows.
- Keep the interface calm, dense, and decision-oriented.
- Highlight risk, progress, evidence, next action, and report readiness.

Demo narrative:
The demo should show that the relationship manager starts from a workbench, sees pending client tasks, follows AI recommendations, launches due diligence, tracks tax/invoice collection and document recognition, monitors client risk, and prepares reports for review.

Do not use consumer-style or marketing-style wording.
Do not turn the product into a generic enterprise admin dashboard.
Do not overemphasize decorative AI language.
```

---

## Demo UI/UX Execution Prompt

# OpenClaw Phase 2 Prompt: Demo-Ready UI and UX Pass

```text
You are a senior frontend engineer, UI engineer, and UX designer.

Continue in:
D:\demo\ai-copilot

Important correction:
This project is still in DEMO stage.
Phase 2 is NOT a full productization pass.
Phase 2 is NOT a complete design-system migration.
Phase 2 is a demo-ready UI/UX pass.

Primary goal:
Make the demo look readable, credible, and visually consistent on the core demo path.

The target is:
"This demo feels like a coherent enterprise AI product."

Not the target:
"Every page is perfectly refactored and fully tokenized."

Critical context:
- Phase 1 is complete. Do not redo Phase 1.
- Vue 3 + Vite + Element Plus.
- src/styles/tokens.css is the only project-owned global style entry.
- src/style.css and src/styles/global.css are deprecated and must stay clean.
- The app still contains many mojibake user-facing strings.
- Many pages contain hardcoded visual styles.
- Because this is a demo, prioritize what users will see during the demo.

Strict boundaries:
- Do not change business logic.
- Do not change routes.
- Do not change store state shape.
- Do not change mock data structure unless only correcting visible display text is required.
- Do not change API assumptions.
- Do not add dependencies.
- Do not introduce a new UI framework.
- Do not remove demo features.
- Do not rewrite the whole app.
- Do not pursue perfect abstraction.
- Do not touch src/style.css or src/styles/global.css except to confirm they stay deprecated-only.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.

Phase 2 demo priorities:

P0 - Demo blockers:
- User-facing mojibake text.
- Broken or unreadable page titles.
- Broken or unreadable button text.
- Broken or unreadable table headers.
- Broken or unreadable status labels.
- Broken or unreadable placeholders.
- Broken or unreadable drawer titles and key action labels.
- Obvious visual breakage in the first screen.

P1 - Core demo path visual consistency:
- Workbench
- Due diligence
- Enterprise monitor
- Document recognition
- Smart report
- Tax RPA
- Business risk
- Screening

Only make these pages look coherent enough for demo.
Use existing tokens and shared classes where easy.
Do not force a full refactor if it risks breaking the demo.

P2 - Defer:
- Deep component abstraction.
- Full hardcoded-style cleanup.
- Perfect token migration.
- Full responsive polish.
- Full accessibility pass.
- Store/model cleanup.
- Non-demo edge cases.

Core demo pages to prioritize:
- src/pages/WorkbenchPage.vue
- src/pages/DueDiligenceHomePage.vue
- src/pages/DueDiligenceTaskPage.vue
- src/pages/EnterpriseMonitorPage.vue
- src/pages/DocRecognitionPage.vue
- src/pages/SmartReportPage.vue
- src/pages/TaxRpaPage.vue
- src/pages/BizRiskPage.vue
- src/pages/BizRiskSinglePage.vue
- src/pages/BizRiskBatchPage.vue
- src/pages/ScreeningInitialPage.vue
- src/pages/ScreeningResultsPage.vue

Recommended first implementation pass:
Do not edit all pages deeply.
Start with the pages most likely to be shown first:
1. WorkbenchPage.vue
2. DueDiligenceHomePage.vue
3. EnterpriseMonitorPage.vue
4. DocRecognitionPage.vue
5. BizRiskBatchPage.vue or BizRiskSinglePage.vue

First-pass required outcome:
The first screen of each selected page must be readable and visually coherent.

User-facing copy rules:
- Replace mojibake with readable Simplified Chinese.
- Keep wording concise and enterprise-SaaS appropriate.
- Avoid decorative emoji in main headings, table headers, core buttons, and status labels.
- It is acceptable to use a small number of emoji in demo storytelling areas only if they do not hurt professional tone.
- Do not change internal variable names just because they are mojibake unless they are clearly display-only and safe.
- Prefer fixing visible text in templates and mock display fields over deep data model changes.

Suggested demo copy:

Workbench:
- Greeting: 上午好，张经理
- Today tasks: 今日待办
- Weekly progress: 本周进度
- AI suggestion: AI 建议
- Quick actions: 快捷操作
- My tasks: 我的任务
- Return: 返回工作台
- AI Copilot status: 自动推进中
- Clear: 清空

Due diligence:
- Page title: 智能尽调
- Subtitle: 自动发起、跨天跟进、税票采集，最终生成尽调报告
- Primary button: 发起智能尽调
- Search placeholder: 搜索企业名称 / 信用代码
- Status filter: 状态筛选
- Source filter: 来源筛选
- Sort: 排序
- Next step: 下一步

Enterprise monitor:
- Page title: 企业监测
- Subtitle: 7x24 小时监测企业风险，在异常发生时及时提醒
- KPI labels: 监测企业 / 今日预警 / 未读 / 资料过期
- Create rule: 创建规则
- Enterprise warnings: 企业预警
- Compliance monitor: 合规监测
- My rules: 我的规则
- Warning detail: 预警详情

Document recognition:
- Page title: 资料识别
- Subtitle: 上传文件，AI 识别字段并完成交叉比对
- Filter: 筛选
- Search placeholder: 搜索企业 / 文件
- Upload text: 点击或拖拽上传文件
- File recognition: 字段识别
- Cross compare: 交叉比对
- Confirm and sync: 确认并同步

Business risk:
- Page title: 工商风险
- Batch scan: 批量扫描
- Single query: 单企查询
- Risk level: 风险等级
- Action: 操作

Style rules for demo pass:
- Use existing tokens where easy:
  var(--color-primary)
  var(--color-success)
  var(--color-warning)
  var(--color-danger)
  var(--text-primary)
  var(--text-secondary)
  var(--text-tertiary)
  var(--surface-card)
  var(--surface-page)
  var(--border-default)
  var(--border-soft)
  var(--radius-md)
  var(--shadow-sm)
  var(--font-size-body)
  var(--font-size-page-title)
  var(--font-size-metric)
- Do not spend time replacing every single hardcoded value.
- Replace only obvious hardcoded values in first-screen demo areas or repeated high-visibility elements.
- Keep card radius at 8px unless existing component context strongly requires otherwise.
- Keep enterprise SaaS visual tone quiet, clean, and work-focused.

Layout rules for demo pass:
- Use page-shell/page-shell--default/page-shell--data where safe.
- Use page-header/page-title/page-subtitle where safe.
- Keep dense tool pages full-width if needed.
- Do not break three-column workbench/tool layouts.
- Improve first-screen spacing if it is obviously crowded.

Verification:
After edits, check the selected pages for remaining obvious mojibake in user-facing text.
Search patterns may include:
璁|绯|瀛|椤|鍗|闂|甯|渚|鍔|鏍|锛|鐨|涓|骞|褰|鎴|璀|鑹|杈|闃|閫|瑙|櫙|淇|绔|缁|搴|宸|昏|被|潰|噺|叏|馃|鈥|鉁

Important:
Search can have encoding false negatives. Also read the edited page content directly.

Run:
- npm run build

If build fails with esbuild spawn EPERM, report it as a local permission issue. Do not claim build success.
If build fails because of code errors, fix them.

Final response must include:
1. Changed files.
2. Which demo pages were improved.
3. What visible copy was fixed.
4. What first-screen UI/UX consistency improvements were made.
5. What was intentionally deferred because this is demo stage.
6. Build result.
7. Clear conclusion:
   - "Phase 2 demo pass is complete for the selected demo path" if selected pages are readable and coherent.
   - Or "Phase 2 demo pass is not complete" with exact remaining demo blockers.
```

---

## Previous Prompt Archive

# OpenClaw Phase 2 Prompt: Page-Level UI and UX Unification

```text
You are a senior frontend engineer, UI engineer, and UX designer.

Continue in:
D:\demo\ai-copilot

Phase 1 is complete. Do not redo Phase 1.

Phase 2 goal:
Make the product pages readable, visually consistent, and aligned with the Phase 1 design system. This phase is about page-level UI/UX unification, not business logic refactoring.

Critical context:
- The project is Vue 3 + Vite + Element Plus.
- The only project-owned global style entry is src/styles/tokens.css.
- src/style.css and src/styles/global.css are deprecated and must stay clean.
- src/styles/tokens.css already contains the design tokens and shared utility classes.
- Many pages still contain mojibake user-facing Chinese text.
- Many pages still use hardcoded colors, font sizes, spacing, radius, shadows, and widths.

Strict boundaries:
- Do not change business logic.
- Do not change routes.
- Do not change store state shape.
- Do not change mock data structure.
- Do not change API assumptions.
- Do not add dependencies.
- Do not introduce a new UI framework.
- Do not remove existing features.
- Do not rewrite the whole app.
- Do not touch src/style.css or src/styles/global.css except to confirm they stay deprecated-only.
- Keep src/main.js importing only src/styles/tokens.css as the project-owned style entry.

Phase 2 priority order:

1. Restore readable user-facing copy.
2. Unify page shell and page header patterns.
3. Replace obvious hardcoded page styles with existing tokens/classes.
4. Normalize repeated UI patterns: KPI cards, task cards, filter chips, tabs, tables, drawers, empty states, action bars.
5. Keep behavior unchanged.

Important:
The current app has many mojibake strings such as "璁", "绯", "瀛", "椤", "鍗", "闂", "甯", "锛", "鐨", "涓", "骞", "褰", "鎴", "鑹", etc.
These are not acceptable in user-facing UI.

You must fix user-facing mojibake in templates, buttons, labels, placeholders, table headers, status text, drawer titles, tabs, empty states, and visible messages.

Use readable Simplified Chinese for product copy.
Use professional enterprise SaaS wording.
Avoid decorative emoji in core navigation, headings, table labels, and status text. Prefer Element Plus icons that already exist in the file, or plain text.

Do not blindly change internal IDs, route names, variable names, or data keys unless they are only display labels.

Recommended page grouping:

Group A - ordinary list/dashboard pages:
- src/pages/DueDiligenceHomePage.vue
- src/pages/EnterpriseMonitorPage.vue
- src/pages/BizRiskBatchPage.vue
- src/pages/ScreeningInitialPage.vue
- src/pages/ScreeningResultsPage.vue

Group B - dense workbench/tool pages:
- src/pages/DocRecognitionPage.vue
- src/pages/TaxRpaPage.vue
- src/pages/SmartReportPage.vue
- src/pages/EnterpriseDiagnosisPage.vue

Group C - special interactive page:
- src/pages/WorkbenchPage.vue

Implementation strategy:

First pass in this phase:
Focus on Group A and shared patterns. Do not try to fully polish every dense workbench page in one pass.

Required first-pass changes:

1. Fix readable Chinese copy in Group A pages.
At minimum fix:
- Page titles
- Page subtitles
- Button text
- Table column labels
- Placeholder text
- Filter labels
- Tab labels
- Status labels
- Drawer titles
- Empty state descriptions
- Action labels

2. Standardize page shell usage in Group A.
Use existing global classes where appropriate:
- page-shell
- page-shell--default
- page-shell--data
- page-header
- page-title
- page-subtitle
- ui-card
- ui-chip
- ui-tag
- ui-drawer-panel
- ui-sticky-actions

For normal task/list pages:
- Use page-shell or page-shell--default.

For data-heavy table/dashboard pages:
- Use page-shell page-shell--data.

Do not create a new global page system unless a small utility class is clearly missing.

3. Reduce hardcoded styles in Group A scoped CSS.
Replace obvious hardcoded values with tokens:
- #2563eb -> var(--color-primary)
- #1d4ed8 -> var(--color-primary-hover)
- #10b981 -> var(--color-success)
- #f59e0b -> var(--color-warning)
- #ef4444 -> var(--color-danger)
- #1a1a2e -> var(--text-primary)
- #64748b -> var(--text-secondary)
- #94a3b8 -> var(--text-tertiary)
- #cbd5e1 -> var(--text-disabled)
- #ffffff or #fff -> var(--surface-card)
- #f7faff -> var(--surface-page)
- #dbe7f5 -> var(--border-default)
- #e5eaf2 -> var(--border-soft)
- #f1f5f9 -> var(--border-divider)
- 4px radius -> var(--radius-sm)
- 8px radius -> var(--radius-md)
- 12px radius -> var(--radius-lg), except cards should generally stay 8px if using ui-card/radius-md.
- 11px -> var(--font-size-caption)
- 12px -> var(--font-size-assist)
- 13px -> var(--font-size-body)
- 14px -> var(--font-size-body-lg)
- 15px -> var(--font-size-section-title)
- 20px -> var(--font-size-page-title)
- 24px metric/title values should use --font-size-workbench-title or a local justified value.
- 28px KPI metrics -> var(--font-size-metric)

4. Normalize key repeated components in Group A.
KPI cards:
- consistent card background, border, radius, padding.
- metric number uses var(--font-size-metric).
- label uses var(--font-size-assist) or var(--font-size-caption).

Filter chips:
- consistent with ui-chip or tokenized equivalent.
- active state uses primary color and primary soft background.

Tables:
- header background uses var(--surface-table-header).
- borders use var(--border-soft) / var(--border-divider).
- body text uses var(--text-primary).
- secondary text uses var(--text-tertiary).

Drawers:
- use drawer-panel or ui-drawer-panel token widths.
- sticky footer/actions should use ui-sticky-actions if possible.

5. Do not over-polish WorkbenchPage in this pass.
WorkbenchPage has many mojibake strings and complex conversation/workflow logic.
For this first Phase 2 pass:
- You may fix obvious top-level visible copy if safe.
- Do not restructure the workbench conversation flow.
- Do not change the assistant store behavior.
- Leave deeper Workbench polish for a later pass.

6. Verification
After changes, run these checks:

- Search for obvious mojibake in edited Group A files:
  patterns include:
  璁|绯|瀛|椤|鍗|闂|甯|渚|鍔|鏍|锛|鐨|涓|骞|褰|鎴|璀|鑹|杈|闃|閫|瑙|櫙|淇|绔|缁|搴|宸|昏|被|潰|噺|叏|馃|鈥|鉁

- Search for remaining obvious hardcoded style values in edited Group A files.
  Some hardcoded values may remain when semantically justified, but explain them.

- Run:
  npm run build

If build fails with esbuild spawn EPERM, report it as a local permission issue. Do not claim build success.
If build fails because of code errors, fix them.

Final response must include:
1. Changed files.
2. Which pages were included in this first Phase 2 pass.
3. What user-facing copy was fixed.
4. What layout/style patterns were unified.
5. Any remaining pages with mojibake or hardcoded style debt.
6. Build result.
7. Clear conclusion:
   - "Phase 2 first pass is complete" if Group A scope is done and build is only blocked by local esbuild EPERM.
   - Or "Phase 2 first pass is not complete" with exact remaining items.
```
# OpenClaw Current Short Prompt: Phase 2 Batch 3 Visual State Polish

```text
You are a senior UI/UX engineer and frontend engineer.

Continue in:
D:\demo\ai-copilot

Task:
Only refine `src/pages/DueDiligenceTaskPage.vue`.
Do not edit other pages unless absolutely necessary.
Do not change routes, store shape, dependencies, or global design tokens.

Context:
The due diligence detail page now has the correct 3-column structure:
- left = workflow/process rail
- center = work area
- right = due diligence chat

But the UI now looks too plain. During layout fixes, icon/color/state styling was weakened.
The page reads like a wireframe instead of a polished bank relationship-manager workflow console.

Code findings:
1. Artifact cards do not map real mock statuses.
   `src/data/mockDueDiligence.js` has:
   - status "已生成"
   - status "V2待确认"
   - status "可发送"
   But `artifactStatusClass()` in `DueDiligenceTaskPage.vue` only handles:
   - "已确认"
   - "待确认"
   - "草稿"
   So most artifact cards fall into the default gray draft style.

2. Artifact icons are mostly gray.
   `.artifact-card__icon { color: var(--text-tertiary); }`
   Only confirmed/pending variants change color, and those variants usually do not match current mock data.

3. Step cards are too generic.
   Completed/current/pending states are not visually distinct enough.
   The page should show:
   - completed = green subtle
   - current/in progress = blue stronger
   - waiting/attention = yellow subtle
   - error/high risk = red only when needed

4. Left rail still looks like filters, not workflow.
   Do not fully redesign it now, but improve visual language:
   - active chip stronger
   - completed/in-progress/pending count colorized
   - evidence coverage remains compact

5. Right AI panel is structurally okay but visually plain.
   Add subtle context styling if safe:
   - clearer panel header
   - quick actions/chips should remain subtle
   - do not make it decorative or dominant

Required visual improvements:
1. Restore typed artifact card styling.
   Map artifacts by either `artifact.status` or `artifact.icon`:
   - 证据包 / Files / 已生成: blue type style
   - 风险诊断摘要 / Warning / 已生成: warning/yellow type style
   - 尽调报告草稿 / Document / V2待确认: primary/blue action style, visually important
   - 客户补充清单 / List / 可发送: green or neutral-success style

2. Use restrained icon treatments.
   Do not use emoji.
   Use Element Plus icons already imported.
   Give artifact icons a small tinted icon box:
   - 28-32px square
   - 6-8px radius
   - subtle background from existing tokens
   - icon size about 16-18px

3. Improve card affordance without becoming colorful.
   Add one of:
   - left color strip
   - subtle tinted icon box
   - subtle tinted background on important state
   Do not use heavy gradients or large shadows.

4. Make the report confirmation area the visual priority for report-ready tasks.
   The "产物确认" banner should be the main focus, or the report artifact card should be visually emphasized.
   Users should immediately know the next action is "进入智能报告" or "确认全部".

5. Improve workflow step cards:
   - completed cards: green icon / subtle green left border
   - current/in-progress cards: blue border or blue left strip
   - pending cards: muted gray
   Keep density compact.

6. Fix any remaining obvious CSS residue:
   - no literal `\n`
   - no `100%%`
   - no undefined CSS variables

7. Keep existing layout:
   - 3 columns remain
   - center area keeps independent vertical scroll
   - right AI panel remains contained
   - no giant icons
   - no top blank area

Validation:
- `npm run build` passes.
- In browser, due diligence detail page still has stable left/middle/right columns.
- Artifact cards are visually distinguishable by type/status.
- Icons have meaningful, restrained color again.
- Report-ready task clearly prioritizes report confirmation.
- Page feels like a polished financial workflow console, not a wireframe.

Final response must include:
1. Changed files.
2. What status/type mappings were fixed.
3. What visual treatments were added.
4. Build result.
5. Browser visual check result.
```

---

# Archive: Previous Long Prompt
