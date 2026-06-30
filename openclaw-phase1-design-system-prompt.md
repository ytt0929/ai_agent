# OpenClaw Phase 1 Prompt: Replace All Comments Directly

```text
You made another incorrect completion claim. The search command can return a false negative because of encoding, but the file content still visibly contains mojibake comments.

Open and edit:
D:\demo\ai-copilot\src\styles\tokens.css

This time, do NOT rely on mojibake search as the main method.
Do NOT try to detect only specific Chinese-looking characters.
Instead, directly replace every CSS comment block in src/styles/tokens.css with readable ASCII English comments.

Task:
Replace all comments in src/styles/tokens.css with ASCII English comments.

Allowed:
- You may edit comment text only.

Forbidden:
- Do not change any token value.
- Do not change any selector.
- Do not change any CSS property.
- Do not change any CSS behavior.
- Do not change src/main.js.
- Do not change src/style.css.
- Do not change src/styles/global.css.
- Do not change Vue components.
- Do not change business pages.
- Do not change routes, stores, mock data, API logic, or page workflows.
- Do not add dependencies.
- Do not start Phase 2.

Important:
Because the old comments are unreliable mojibake, do not preserve or partially edit them.
Replace the comments completely.

Use only ASCII characters in comments.
Examples of allowed comments:

Top header:
/* ============================================================
 * DESIGN TOKENS - AI Copilot design system baseline
 * All page and component styles should use these variables.
 * ============================================================ */

Section comments:
/* ====== Colors ====== */
/* Primary color */
/* Success color */
/* Warning color */
/* Danger color */
/* Neutral colors */
/* Background */
/* Border */
/* ====== Radius ====== */
/* ====== Shadows ====== */
/* ====== Typography ====== */
/* ====== Spacing ====== */
/* ====== Layout ====== */
/* Legacy content width aliases */
/* ====== Page widths ====== */
/* ====== Workspace layout ====== */
/* ====== Semantic colors ====== */
/* ====== Figma design token aliases ====== */
/* ====== Sidebar ====== */
/* ====== Motion ====== */
/* ====== Global reset ====== */
/* ====== Layout shell ====== */
/* Page containers */
/* Page title */
/* Shared components */
/* Cards */
/* Buttons */
/* Tags */
/* Drawer */
/* Empty state */
/* Info cards */
/* ============================================================
 * Phase 1: unified utility classes
 * Keep legacy classes to avoid breaking existing pages.
 * ============================================================ */
/* Page shell */
/* Page header */
/* Reuse .page-header, .page-title, and .page-subtitle rules above. */
/* Workspace shell */
/* UI card */
/* UI toolbar */
/* UI chip */
/* UI tag */
/* UI metric */
/* UI drawer */
/* UI sticky actions */

After editing, verify by reading the file content, not only by search.
The top 180 lines and the Phase 1 section near .page-shell must show only ASCII English comments.

Also verify these values remain unchanged:
- --font-size-assist: 12px;
- --font-size-body-lg: 14px;
- --font-size-workbench-title: 24px;
- --content-max-width: var(--layout-page-default);
- --content-max-width-narrow: var(--layout-page-narrow);
- --content-max-width-wide: var(--layout-page-wide);
- --layout-page-default: 1060px;
- --layout-page-narrow: 960px;
- --layout-page-wide: 100%;
- --layout-page-data: 1280px;
- --sidebar-width: 280px;
- --drawer-width: 420px;
- --drawer-width-wide: 520px;
- .page-shell--default still exists.
- .ui-drawer-panel still uses var(--drawer-width).

Run:
- npm run build

If build fails with esbuild spawn EPERM, report it as a local permission issue. Do not claim build success.

Final response must include:
1. Changed files.
2. Confirmation that all CSS comments in src/styles/tokens.css were replaced with ASCII English comments.
3. Confirmation that no token values/selectors/properties were intentionally changed.
4. Build result.
5. Final conclusion:
   - "Phase 1 is complete; build is only blocked by local esbuild spawn EPERM."
   - Or "Phase 1 is not complete; remaining issue is ..."
```

---

## Previous Prompt Archive

# OpenClaw Phase 1 Prompt: Forced Mojibake Verification

```text
You made an incorrect claim in the last pass. The file still contains mojibake comments.

Open and edit:
D:\demo\ai-copilot\src\styles\tokens.css

Do not rely on visual judgment only. You must search for mojibake characters and prove the search result is zero before claiming completion.

Task:
Replace all mojibake comments in src/styles/tokens.css with readable ASCII English comments.

Do ONLY this task.

Forbidden:
- Do not change token values.
- Do not change CSS selectors.
- Do not change CSS behavior.
- Do not change business pages.
- Do not change src/main.js.
- Do not change src/style.css.
- Do not change src/styles/global.css.
- Do not change routes, stores, mock data, API logic, or page workflows.
- Do not add dependencies.
- Do not start Phase 2.

Known remaining problem:
The following areas still contain mojibake comments:
- File header comment at the top of src/styles/tokens.css.
- Colors section comments.
- Typography section comments.
- Spacing section comments.
- Semantic colors section comments.
- Sidebar section comments.
- Motion section comments.
- Global reset comments.
- Page container and page header comments.
- Shared component comments.
- Drawer / empty state / info card comments.
- Phase 1 utility section comment near .page-shell.
- UI Card / UI Chip / UI Tag comments.

Replace comments with ASCII English labels, for example:
- DESIGN TOKENS - AI Copilot design system baseline
- All page and component styles should use these variables.
- Colors
- Primary color
- Success color
- Warning color
- Danger color
- Neutral colors
- Background
- Border
- Radius
- Shadows
- Typography
- Spacing
- Layout
- Page widths
- Workspace layout
- Semantic colors
- Sidebar
- Motion
- Global reset
- Page containers
- Page title
- Page header
- Shared components
- Cards
- Buttons
- Tags
- Drawer
- Empty state
- Info cards
- Phase 1 unified utility classes
- UI card
- UI toolbar
- UI chip
- UI tag
- UI metric
- UI drawer
- UI sticky actions

After editing, you MUST run a search against src/styles/tokens.css for these characters:
璁|绯|瀛|椤|鍗|闂|甯|渚|鍔|鏍|锛|鐨|涓|骞|褰|鎴|璀|鑹|杈|闃|閫|瑙|櫙|淇|绔|缁|搴|宸|昏|被|潰|噺|叏

Acceptance rule:
- If the search returns any match, you are NOT done.
- If the search result is not zero, continue replacing comments.
- Do not reply "complete" until the search result is zero.

Also verify:
- --font-size-assist remains 12px.
- --content-max-width remains var(--layout-page-default).
- --content-max-width-narrow remains var(--layout-page-narrow).
- --content-max-width-wide remains var(--layout-page-wide).
- .page-shell--default still exists.
- src/main.js still imports only src/styles/tokens.css as project-owned style.

Run:
- npm run build

If build fails with esbuild spawn EPERM, report it as a local permission issue. Do not claim build success.

Final response must include:
1. Changed files.
2. Search verification result for the mojibake pattern. It must say zero matches, or list exact remaining matched lines.
3. Confirmation that token values were not changed.
4. npm run build result.
5. Final conclusion:
   - "Phase 1 is complete; build is only blocked by local esbuild spawn EPERM."
   - Or "Phase 1 is not complete; remaining mojibake lines are ..."
```

---

## Previous Prompt Archive

# OpenClaw Phase 1 Prompt: Comment Cleanup Only

```text
You are a senior frontend engineer and UI engineer. Continue in D:\demo\ai-copilot and finish Phase 1.

Latest review conclusion:
Phase 1 is NOT complete only because src/styles/tokens.css still contains mojibake comments.

Do ONLY this task:
Clean unreadable mojibake comments in src/styles/tokens.css.

Do not change token values.
Do not change selectors.
Do not change CSS behavior.
Do not refactor business pages.
Do not start Phase 2.
Do not change routes, stores, mock data, API logic, or page workflows.
Do not add dependencies.
Do not delete compatibility classes such as .page, .card, .drawer-panel.

Already completed, keep unchanged:
- src/main.js imports src/styles/tokens.css as the only project-owned style entry.
- src/main.js does not import src/style.css or src/styles/global.css.
- src/style.css contains only a deprecated notice and no real CSS rules.
- src/styles/global.css contains only a deprecated notice and no real CSS rules.
- AppSidebar.vue uses var(--sidebar-width).
- GlobalInputBar.vue uses var(--sidebar-width).
- --sidebar-width is 280px.
- --font-size-assist is 12px.
- --font-size-body-lg is 14px.
- --font-size-workbench-title is 24px.
- --layout-page-default is 1060px.
- --layout-page-narrow is 960px.
- --layout-page-wide is 100%.
- --layout-page-data is 1280px.
- --layout-page-full is 100%.
- --content-max-width aliases to var(--layout-page-default).
- --content-max-width-narrow aliases to var(--layout-page-narrow).
- --content-max-width-wide aliases to var(--layout-page-wide).
- --panel-width-chat is 340px.
- --panel-width-chat-min is 320px.
- --panel-width-chat-max is 460px.
- --panel-width-list is 320px.
- --drawer-width is 420px.
- --drawer-width-wide is 520px.
- --copilot-* tokens alias to unified tokens.
- .page-shell--default exists.
- .page-shell--data uses var(--layout-page-data).
- .ui-drawer-panel and .drawer-panel use drawer width tokens.

Required comment cleanup:
Replace mojibake comments in src/styles/tokens.css with readable ASCII English comments.

At minimum fix:
- The top file header comment.
- Comments around Colors.
- Comments around primary, success, warning, danger, neutral colors.
- Comments around Background.
- Comments around Border.
- Comments around Radius.
- Comments around Shadows.
- Comments around Typography.
- Comments around Spacing.
- Comments around Layout.
- Comments around Workspace layout.
- Comments around Semantic colors.
- Comments around Sidebar.
- Comments around Motion.
- Comments around Global reset.
- Comments around Page containers.
- Comments around Page title and page header.
- Comments around shared cards, buttons, tags, drawer, empty state, and info cards.
- The Phase 1 utility section comment near .page-shell.
- Comments around UI card, UI chip, UI tag, UI drawer, and UI sticky actions.

Use examples like:
- DESIGN TOKENS - AI Copilot design system baseline
- Colors
- Primary color
- Success color
- Warning color
- Danger color
- Neutral colors
- Background
- Border
- Radius
- Shadows
- Typography
- Spacing
- Layout
- Page widths
- Workspace layout
- Semantic colors
- Sidebar
- Motion
- Global reset
- Page containers
- Page title
- Shared components
- Cards
- Buttons
- Tags
- Drawer
- Empty state
- Info cards
- Phase 1 unified utility classes
- UI card
- UI chip
- UI tag
- UI drawer
- UI sticky actions

After the edit, verify:
- There are no obvious mojibake sequences left in comments, such as "璁", "绯", "瀛", "椤", "鍗", "闂", "甯", "渚", "鍔", "鏍", "锛", "鐨", "涓", "骞", "褰".
- Token values remain unchanged.
- .page-shell--default still exists.
- src/main.js still imports only src/styles/tokens.css as project-owned style.

Run:
- npm run build

If build fails with esbuild spawn EPERM, report it as a local permission issue and do not claim build success.

Final response must include:
1. Changed files.
2. Confirmation that comment cleanup is complete.
3. Build result.
4. Final conclusion:
   - "Phase 1 is complete" if comments are clean and only build issue is local esbuild EPERM.
   - Or "Phase 1 is not complete" with exact remaining items.
```

---

## Previous Prompt Archive

# OpenClaw Phase 1 Prompt: Final Fix Pass

```text
You are a senior frontend engineer and UI engineer. Continue in D:\demo\ai-copilot and finish Phase 1. This is the final fix pass.

Do not start Phase 2.
Do not refactor business pages.
Do not change routes, stores, mock data, API logic, or page workflows.
Do not add dependencies.
Do not delete compatibility classes such as .page, .card, .drawer-panel.

Latest review result:
Phase 1 is still NOT complete, but only a few items remain.

Already completed, keep unchanged:
- src/main.js imports src/styles/tokens.css as the only project-owned style entry.
- src/main.js does not import src/style.css or src/styles/global.css.
- src/style.css contains only a deprecated notice and no real CSS rules.
- src/styles/global.css contains only a deprecated notice and no real CSS rules.
- AppSidebar.vue uses var(--sidebar-width).
- GlobalInputBar.vue uses var(--sidebar-width).
- --sidebar-width is 280px.
- --layout-page-default is 1060px.
- --layout-page-narrow is 960px.
- --layout-page-wide is 100%.
- --layout-page-data is 1280px.
- --layout-page-full is 100%.
- --panel-width-chat is 340px.
- --panel-width-chat-min is 320px.
- --panel-width-chat-max is 460px.
- --panel-width-list is 320px.
- --drawer-width is 420px.
- --drawer-width-wide is 520px.
- --copilot-* tokens mostly alias to unified tokens.
- .page-shell--default exists.
- .page-shell--data uses var(--layout-page-data).
- .ui-drawer-panel and .drawer-panel use drawer width tokens.

Only fix these remaining items:

1. Fix mojibake comments in src/styles/tokens.css
The file still has unreadable mojibake comments.
At minimum, replace these comments with readable English:
- The top file header comment near line 1.
- The Phase 1 utility section comment near the .page-shell area.
- The section comments around colors, radius, shadow, typography, spacing, layout, semantic colors, sidebar, animation, reset, page shell, cards, chips, tags, drawer, and sticky actions if they are visibly mojibake.

Use plain ASCII English comments to avoid encoding issues. Example:
- DESIGN TOKENS - AI Copilot design system baseline
- Colors
- Radius
- Shadows
- Typography
- Spacing
- Layout
- Page widths
- Workspace layout
- Semantic colors
- Sidebar
- Motion
- Global reset
- Page containers
- Shared components
- Phase 1 unified utility classes
- UI drawer

Do not rewrite business CSS just for comments. Only replace unreadable comments.

2. Fix --font-size-assist
In src/styles/tokens.css, the current value is wrong:
- --font-size-assist: 16px;

Change it to:
- --font-size-assist: 12px;

Keep these typography tokens valid:
- --font-size-caption: 11px;
- --font-size-assist: 12px;
- --font-size-body: 13px;
- --font-size-body-lg: 14px;
- --font-size-section-title: 15px;
- --font-size-page-title: 20px;
- --font-size-workbench-title: 24px;
- --font-size-metric: 28px;

3. Alias old content width tokens to unified layout tokens
The old tokens are still independent numbers:
- --content-max-width: 1100px;
- --content-max-width-narrow: 780px;
- --content-max-width-wide: 960px;

Change them to aliases:
- --content-max-width: var(--layout-page-default);
- --content-max-width-narrow: var(--layout-page-narrow);
- --content-max-width-wide: var(--layout-page-wide);

Important ordering note:
If CSS variable ordering makes these aliases reference variables declared later, move the --layout-page-* declarations above the old --content-max-width* aliases, or place the aliases after --layout-page-* declarations. The final CSS must be clear and maintainable.

4. Verify there is no regression
Confirm:
- src/main.js still imports only src/styles/tokens.css as project-owned style.
- src/style.css still has no real CSS rules.
- src/styles/global.css still has no real CSS rules.
- .page-shell--default still exists.
- .ui-drawer-panel still uses var(--drawer-width).
- .ui-drawer-panel--wide still uses var(--drawer-width-wide).

5. Run build
Run:
- npm run build

If the build fails with esbuild spawn EPERM, clearly report that this is a local permission problem and do not claim build success.
If the build fails for code reasons, fix the code errors.

Final response must be concise and must include:
1. Changed files.
2. The 3 remaining fixes and whether each is complete.
3. Build result.
4. Final conclusion:
   - "Phase 1 is complete" if all checks pass except local esbuild EPERM.
   - Or "Phase 1 is not complete" with exact remaining items.
```

---

## Previous Prompt Archive

# OpenClaw Phase 1 Prompt: ASCII Execution Version

```text
You are a senior frontend engineer and UI engineer. Continue working in D:\demo\ai-copilot and finish Phase 1 only.

This is NOT Phase 2. Do not refactor business pages. Do not change routes, stores, mock data, API logic, or page-level workflows. Do not add new dependencies.

Read these files first:
- src/main.js
- src/styles/tokens.css
- src/style.css
- src/styles/global.css
- src/components/AppSidebar.vue
- src/components/GlobalInputBar.vue

Current status:
Phase 1 is not finished yet. Some items are already done. Keep the completed items and only fix the remaining Phase 1 issues.

Already completed, keep them:
- src/main.js imports src/styles/tokens.css as the only project-owned style entry.
- src/style.css contains only a deprecated notice and no real CSS rules.
- src/styles/global.css contains only a deprecated notice and no real CSS rules.
- AppSidebar.vue uses var(--sidebar-width).
- GlobalInputBar.vue uses var(--sidebar-width).
- --sidebar-width is 280px.
- .ui-drawer-panel uses var(--drawer-width).
- .ui-drawer-panel--wide uses var(--drawer-width-wide).
- .page-shell--data uses var(--layout-page-data), and --layout-page-data is 1280px.

Required fixes:

1. Fix mojibake comments in src/styles/tokens.css.
- The file header comment must be readable English or Chinese.
- The Phase 1 utility section comment must be readable English or Chinese.
- Fix other obvious mojibake comments if easy, but do not rewrite CSS only for comments.

2. Complete typography tokens in :root:
- --font-size-caption: 11px;
- --font-size-assist: 12px;
- --font-size-body: 13px;
- --font-size-body-lg: 14px;
- --font-size-section-title: 15px;
- --font-size-page-title: 20px;
- --font-size-workbench-title: 24px;
- --font-size-metric: 28px;

Current problems:
- Missing --font-size-assist.
- Missing --font-size-body-lg.
- Missing --font-size-workbench-title.
- --font-size-section-title is currently 16px and must become 15px.

You may keep legacy aliases such as --font-size-xs, --font-size-sm, --font-size-base, --font-size-lg, but prefer aliasing them to the semantic tokens.

3. Fix layout tokens:
- --layout-page-narrow: 960px;
- --layout-page-default: 1060px;
- --layout-page-data: 1280px;
- --layout-page-wide: 100%;
- --layout-page-full: 100%;
- --sidebar-width: 280px;

Current problems:
- --layout-page-default is 1100px and must become 1060px.
- --layout-page-narrow is 780px and must become 960px.
- --layout-page-wide is 960px and must become 100%.

You may keep old --content-max-width variables, but alias them to the unified layout tokens.

4. Fix panel and drawer tokens:
- --panel-width-chat: 340px;
- --panel-width-chat-min: 320px;
- --panel-width-chat-max: 460px;
- --panel-width-list: 320px;
- --drawer-width: 420px;
- --drawer-width-wide: 520px;

Current problems:
- --panel-width-chat-min is 300px and must become 320px.
- --panel-width-chat-max is 440px and must become 460px.
- --panel-width-list is 260px and must become 320px.
- --drawer-width is 400px and must become 420px.
- --drawer-width-wide is 560px and must become 520px.

5. Fix --copilot-* aliases.
Do not delete --copilot-* tokens. Existing pages may depend on them. But they must alias to the unified tokens, not to a separate system.

Set at least:
- --copilot-primary: var(--color-primary);
- --copilot-primary-hover: var(--color-primary-hover);
- --copilot-primary-soft: var(--color-primary-bg);
- --copilot-bg-page: var(--surface-page);
- --copilot-bg-surface: var(--surface-card);
- --copilot-bg-soft: var(--surface-soft);
- --copilot-border: var(--border-default);
- --copilot-border-soft: var(--border-soft);
- --copilot-text: var(--text-primary);
- --copilot-text-muted: var(--text-secondary);
- --copilot-text-subtle: var(--text-tertiary);
- --copilot-success: var(--color-success);
- --copilot-success-soft: var(--color-success-bg);
- --copilot-warning: var(--color-warning);
- --copilot-warning-soft: var(--color-warning-bg);
- --copilot-danger: var(--color-danger);
- --copilot-shadow: var(--shadow-lg);
- --copilot-shadow-sm: var(--shadow-sm);
- --copilot-radius: var(--radius-md);

Known wrong examples:
- --copilot-primary currently uses var(--color-primary-light), but must use var(--color-primary).
- --copilot-bg-page currently uses var(--bg-page), but must use var(--surface-page).
- --copilot-border currently uses var(--border-color), but must use var(--border-default).
- --copilot-shadow currently uses var(--shadow-md), but must use var(--shadow-lg).

6. Add .page-shell--default:
- .page-shell--default { max-width: var(--layout-page-default); }

Also confirm:
- .page-shell default max-width uses var(--layout-page-default).
- .page-shell--narrow uses var(--layout-page-narrow).
- .page-shell--data uses var(--layout-page-data).
- .page-shell--wide uses var(--layout-page-wide).
- .page-shell--full uses max-width: none.

7. Keep deprecated style files clean:
- src/style.css must contain only a deprecated notice and no real CSS.
- src/styles/global.css must contain only a deprecated notice and no real CSS.
- src/main.js must not import src/style.css or src/styles/global.css.

Do not remove compatibility classes such as .page, .card, .drawer-panel.

After changes, run:
- npm run build

If the build fails because of code errors, fix them.
If it fails with esbuild spawn EPERM, clearly report that it is a local permission problem and do not claim build success.

Final answer must include:
1. Changed files.
2. Completion status for each of the 7 required fixes.
3. npm run build result.
4. A clear final conclusion: either "Phase 1 is complete" or "Phase 1 is not complete, remaining items are ...".
```

---

## Chinese Reference Version

# OpenClaw Phase 1 Prompt: Continue And Finish Phase 1

```text
你是资深前端工程师和 UI 工程师。请继续在 D:\demo\ai-copilot 项目中完成第一阶段改造。

这是一次“补完第一阶段”的任务，不是进入第二阶段。

请先阅读以下文件：
- src/main.js
- src/styles/tokens.css
- src/style.css
- src/styles/global.css
- src/components/AppSidebar.vue
- src/components/GlobalInputBar.vue

本轮复查结论：
第一阶段尚未完成，但很多基础项已经完成。请不要重复改已经完成的部分，只补齐剩余未完成项。

已经完成，请保持：
- src/main.js 项目自有样式只引入 src/styles/tokens.css。
- src/style.css 已清理为废弃说明，没有实际 CSS 规则。
- src/styles/global.css 已清理为废弃说明。
- AppSidebar.vue 已使用 var(--sidebar-width)。
- GlobalInputBar.vue 已使用 var(--sidebar-width)。
- --sidebar-width 已是 280px。
- .ui-drawer-panel 已使用 var(--drawer-width)。
- .ui-drawer-panel--wide 已使用 var(--drawer-width-wide)。
- .page-shell--data 已使用 var(--layout-page-data)，并且 --layout-page-data 当前是 1280px。

本轮必须完成的剩余问题：

1. 修复 src/styles/tokens.css 中的乱码注释
- 文件顶部注释必须改为可读中文或英文。
- Phase 1 新增区域注释必须改为可读中文或英文。
- 其他明显乱码注释也请顺手修复，但不要为了注释大面积重写 CSS。

2. 补齐字体 token
在 :root 中确保存在并符合以下值：
- --font-size-caption: 11px;
- --font-size-assist: 12px;
- --font-size-body: 13px;
- --font-size-body-lg: 14px;
- --font-size-section-title: 15px;
- --font-size-page-title: 20px;
- --font-size-workbench-title: 24px;
- --font-size-metric: 28px;

注意：
- 当前缺少 --font-size-assist、--font-size-body-lg、--font-size-workbench-title。
- 当前 --font-size-section-title 是 16px，必须改成 15px。
- 可以保留旧的 --font-size-xs、--font-size-sm、--font-size-base、--font-size-lg 等兼容变量，但建议 alias 到新语义 token，例如 --font-size-sm: var(--font-size-assist)。

3. 修正布局 token 数值
请确保以下值准确：
- --layout-page-narrow: 960px;
- --layout-page-default: 1060px;
- --layout-page-data: 1280px;
- --layout-page-wide: 100%;
- --layout-page-full: 100%;
- --sidebar-width: 280px;

当前错误：
- --layout-page-default 当前是 1100px，应改为 1060px。
- --layout-page-narrow 当前是 780px，应改为 960px。
- --layout-page-wide 当前是 960px，应改为 100%。

可以保留旧的 --content-max-width、--content-max-width-narrow、--content-max-width-wide，但必须 alias 到统一布局 token，避免两套宽度体系继续分裂。

4. 修正面板和 drawer token 数值
请确保以下值准确：
- --panel-width-chat: 340px;
- --panel-width-chat-min: 320px;
- --panel-width-chat-max: 460px;
- --panel-width-list: 320px;
- --drawer-width: 420px;
- --drawer-width-wide: 520px;

当前错误：
- --panel-width-chat-min 当前是 300px，应改为 320px。
- --panel-width-chat-max 当前是 440px，应改为 460px。
- --panel-width-list 当前是 260px，应改为 320px。
- --drawer-width 当前是 400px，应改为 420px。
- --drawer-width-wide 当前是 560px，应改为 520px。

5. 修正 --copilot-* token alias
不要删除 --copilot-*，避免破坏现有页面。
但它们必须 alias 到统一 token，不要继续引用另一套独立值。

请至少调整为：
- --copilot-primary: var(--color-primary);
- --copilot-primary-hover: var(--color-primary-hover);
- --copilot-primary-soft: var(--color-primary-bg);
- --copilot-bg-page: var(--surface-page);
- --copilot-bg-surface: var(--surface-card);
- --copilot-bg-soft: var(--surface-soft);
- --copilot-border: var(--border-default);
- --copilot-border-soft: var(--border-soft);
- --copilot-text: var(--text-primary);
- --copilot-text-muted: var(--text-secondary);
- --copilot-text-subtle: var(--text-tertiary);
- --copilot-success: var(--color-success);
- --copilot-success-soft: var(--color-success-bg);
- --copilot-warning: var(--color-warning);
- --copilot-warning-soft: var(--color-warning-bg);
- --copilot-danger: var(--color-danger);
- --copilot-shadow: var(--shadow-lg);
- --copilot-shadow-sm: var(--shadow-sm);
- --copilot-radius: var(--radius-md);

当前错误示例：
- --copilot-primary 当前指向 var(--color-primary-light)，应改成 var(--color-primary)。
- --copilot-bg-page 当前指向 var(--bg-page)，应改成 var(--surface-page)。
- --copilot-border 当前指向 var(--border-color)，应改成 var(--border-default)。
- --copilot-shadow 当前指向 var(--shadow-md)，应改成 var(--shadow-lg)。

6. 补齐 .page-shell--default
在 src/styles/tokens.css 中补齐：
- .page-shell--default { max-width: var(--layout-page-default); }

并确认：
- .page-shell 默认 max-width 也是 var(--layout-page-default)。
- .page-shell--narrow 使用 var(--layout-page-narrow)。
- .page-shell--data 使用 var(--layout-page-data)。
- .page-shell--wide 使用 var(--layout-page-wide)。
- .page-shell--full 使用 max-width: none。

7. 保持 src/style.css 和 src/styles/global.css 不污染项目
请确认：
- src/style.css 只有废弃说明，没有实际 CSS 规则。
- src/styles/global.css 只有废弃说明，没有实际 CSS 规则。
- src/main.js 不引入 src/style.css 或 src/styles/global.css。

禁止事项：
- 不要进入第二阶段页面级重构。
- 不要改业务页面布局。
- 不要改路由。
- 不要改 store、mock、接口逻辑。
- 不要引入新依赖。
- 不要删除兼容旧页面所需的旧类名，例如 .page、.card、.drawer-panel。

完成后请运行：
- npm run build

如果构建失败：
- 如果是代码错误，必须修复。
- 如果仍是 esbuild spawn EPERM，请明确说明这是本地权限问题，不要伪装成构建通过。

最终回复必须包含：
1. 修改文件列表。
2. 上面 7 项剩余问题的逐项完成情况。
3. npm run build 结果。
4. 是否仍有第一阶段未完成项。

验收结论只能是：
- “第一阶段已完成”
或
- “第一阶段未完成，剩余项是……”

不要模糊表达。
```

---

## Previous Prompt Archive

# OpenClaw Phase 1 Prompt: Complete Design System Foundation

```text
你是资深前端工程师和 UI 工程师。请继续在 D:\demo\ai-copilot 项目中补完第一阶段改造。

重要边界：
- 这次不是进入第二阶段。
- 不要重构业务页面。
- 不要改路由、状态管理、mock 数据、接口逻辑。
- 不要大面积替换页面结构。
- 不要引入新的 UI 框架或网络依赖。
- 只补齐“第一阶段设计系统基础层”没有完成的内容。

当前第一阶段验收结果：

已完成：
- src/main.js 仍只引入 src/styles/tokens.css。
- src/styles/global.css 已改为废弃说明。
- src/components/AppSidebar.vue 已使用 var(--sidebar-width)。
- src/components/GlobalInputBar.vue 已使用 var(--sidebar-width)。
- src/styles/tokens.css 中 --sidebar-width 已是 280px。
- 已新增部分 page-shell / workspace / ui-card / ui-chip / ui-tag / ui-drawer / ui-sticky-actions 类。

未完成，必须补齐：
1. src/styles/tokens.css 缺少完整语义 token。
2. --copilot-* 仍然作为独立一套 token 存在，没有 alias 到统一 token。
3. src/style.css 虽然标了 deprecated，但仍保留完整 Vite 模板样式，未来误引入会污染项目。
4. .page-shell--default 未实现。
5. .page-shell--data 仍使用 960px，不符合数据页 1280px 要求。
6. .ui-drawer-panel / .ui-drawer-panel--wide 写死 width，没有使用 drawer token。
7. 部分注释仍乱码，至少 tokens.css 顶部和新增 Phase 1 注释需要改成正常中文或英文。

本次必须完成的修改：

一、补齐 src/styles/tokens.css 的语义 token

在 :root 中补齐以下 token。如果已有同义变量，优先让新 token alias 到已有变量，不要制造第三套命名。

字体层级：
- --font-size-caption: 11px;
- --font-size-assist: 12px;
- --font-size-body: 13px;
- --font-size-body-lg: 14px;
- --font-size-section-title: 15px;
- --font-size-page-title: 20px;
- --font-size-workbench-title: 24px;
- --font-size-metric: 28px;

页面和面板宽度：
- --layout-page-narrow: 960px;
- --layout-page-default: 1060px;
- --layout-page-data: 1280px;
- --layout-page-wide: 100%;
- --sidebar-width: 280px;
- --panel-width-chat: 340px;
- --panel-width-chat-min: 320px;
- --panel-width-chat-max: 460px;
- --panel-width-list: 320px;
- --drawer-width: 420px;
- --drawer-width-wide: 520px;

语义颜色和边框：
- --text-primary: var(--color-text-primary);
- --text-secondary: var(--color-text-secondary);
- --text-tertiary: var(--color-text-tertiary);
- --text-disabled: var(--color-text-disabled);
- --surface-page: var(--bg-page);
- --surface-card: var(--bg-card);
- --surface-soft: var(--bg-card-hover);
- --surface-table-header: var(--bg-table-header);
- --border-default: var(--border-color);
- --border-soft: var(--border-color-light);
- --border-divider: var(--border-color-divider);

同时确认 body 默认字号使用：
- font-size: var(--font-size-body);

二、处理 --copilot-* token

不要删除 --copilot-*，避免破坏现有页面。
但必须把它们改成 alias，不再作为独立设计系统存在。

请至少调整为：
- --copilot-primary: var(--color-primary);
- --copilot-primary-hover: var(--color-primary-hover);
- --copilot-primary-soft: var(--color-primary-bg);
- --copilot-bg-page: var(--surface-page);
- --copilot-bg-surface: var(--surface-card);
- --copilot-bg-soft: var(--surface-soft);
- --copilot-border: var(--border-default);
- --copilot-border-soft: var(--border-soft);
- --copilot-text: var(--text-primary);
- --copilot-text-muted: var(--text-secondary);
- --copilot-text-subtle: var(--text-tertiary);
- --copilot-success: var(--color-success);
- --copilot-success-soft: var(--color-success-bg);
- --copilot-warning: var(--color-warning);
- --copilot-warning-soft: var(--color-warning-bg);
- --copilot-danger: var(--color-danger);
- --copilot-shadow: var(--shadow-lg);
- --copilot-shadow-sm: var(--shadow-sm);
- --copilot-radius: var(--radius-md);

三、完善 page-shell

在 tokens.css 中补齐并统一以下规则：
- .page-shell 使用 width: 100%、margin: 0 auto、padding 使用现有 spacing token，默认 max-width 使用 var(--layout-page-default)。
- .page-shell--narrow 使用 var(--layout-page-narrow)。
- .page-shell--default 使用 var(--layout-page-default)。
- .page-shell--data 使用 var(--layout-page-data)，即 1280px。
- .page-shell--wide 使用 var(--layout-page-wide)。
- .page-shell--full 取消 max-width 限制。

注意：
- 不要删除旧的 .page 类。
- 可以让旧的 .page 继续 alias 到现有布局规则，保证兼容。

四、完善 drawer token 使用

把以下写死宽度改为 token：
- .ui-drawer-panel width: var(--drawer-width);
- .ui-drawer-panel--wide width: var(--drawer-width-wide);

如果仍保留旧 .drawer-panel，也要同步使用 drawer token。

五、清理 src/style.css

src/style.css 现在虽然标了 deprecated，但仍保留 Vite 模板样式和 copilot 样式。
请把它清理成只有废弃说明，不保留任何实际 CSS 规则。

目标效果：
- 即使未来有人误引入 src/style.css，也不会污染页面。
- 全局样式入口保持唯一：src/styles/tokens.css。

六、修复乱码注释

至少修复：
- src/styles/tokens.css 顶部注释。
- Phase 1 新增区域注释。

可以使用中文或英文，但必须可读，不能出现乱码。

七、验证

完成后运行：
- npm run build

如果构建失败，请区分原因：
- 如果是代码错误，必须修复。
- 如果是本地 esbuild spawn EPERM 权限问题，请在最终说明中明确写出这是本地权限问题，并列出已完成的静态检查。

最终输出必须包含：
1. 修改过的文件列表。
2. 第一阶段未完成项逐条完成情况。
3. 构建结果。
4. 是否还存在不属于第一阶段的遗留问题。

验收标准：
- src/main.js 只引入 src/styles/tokens.css。
- src/style.css 不再有实际 CSS 规则。
- tokens.css 中存在完整字体、布局、语义、drawer token。
- --copilot-* 已 alias 到统一 token。
- .page-shell--default 存在。
- .page-shell--data 使用 1280px。
- .ui-drawer-panel 使用 drawer token。
- 乱码注释已清理。
- 不进入第二阶段，不改业务页面。
```

---

## Previous Prompt Archive

# OpenClaw Phase 1 Prompt: Design System Foundation

```text
你是资深前端工程师和 UI 工程师。请在 D:\demo\ai-copilot 项目中执行第一阶段改造：统一设计系统和全局布局地基。

重要目标：
只实现阶段一，不要大规模重构业务页面，不要改变业务逻辑、路由、store 数据结构。重点是统一 token、全局样式入口、侧边栏宽度、基础页面容器和公共样式，为后续页面级改造打基础。

当前项目情况：
- Vue 3 + Vite + Element Plus。
- 入口文件是 src/main.js，目前只引入 src/styles/tokens.css。
- src/styles/global.css 与 tokens.css 内容重复，且 global.css 里有乱码注释，没有被加载。
- src/style.css 保留 Vite 模板样式和另一套 --copilot-* token，目前没有被加载。
- AppSidebar.vue 里侧栏写死 280px。
- GlobalInputBar.vue 里 bottom input 写死 left: 280px。
- tokens.css 里 --sidebar-width 仍是 220px，和真实侧栏冲突。
- 页面里大量硬编码颜色、字号、圆角，但第一阶段只建立地基，不要求逐页清理。

第一阶段要完成的事情：

1. 统一 src/styles/tokens.css
- 将 tokens.css 作为唯一设计系统入口。
- 保留并整理现有 --color-* 变量。
- 合并有价值的 --copilot-* 语义变量，不要继续维护两套互相冲突的 token。
- 新增明确的语义 token，包括但不限于：
  --font-size-caption: 11px;
  --font-size-assist: 12px;
  --font-size-body: 13px;
  --font-size-body-lg: 14px;
  --font-size-section-title: 15px;
  --font-size-page-title: 20px;
  --font-size-workbench-title: 24px;
  --font-size-metric: 28px;

  --layout-page-narrow: 960px;
  --layout-page-default: 1060px;
  --layout-page-data: 1280px;
  --layout-page-wide: 100%;
  --sidebar-width: 280px;
  --panel-width-chat: 340px;
  --panel-width-list: 320px;
  --drawer-width: 420px;
  --drawer-width-wide: 520px;

  --surface-page;
  --surface-card;
  --surface-soft;
  --border-default;
  --border-soft;
  --text-primary;
  --text-secondary;
  --text-tertiary;

- 可以让新语义变量 alias 到旧变量，例如：
  --text-primary: var(--color-text-primary);
  --surface-card: var(--bg-card);
  这样降低破坏范围。

2. 清理重复样式入口
- 不要让项目同时维护 tokens.css、global.css、style.css 三套全局样式。
- src/main.js 继续只引入 ./styles/tokens.css。
- src/styles/global.css 如果不使用，请保留文件但改成简短说明注释，说明已统一到 tokens.css；不要删除文件也可以。
- src/style.css 如果不使用，请保留文件但清理 Vite 模板样式，或改成简短说明注释，避免未来误引入污染样式。
- 不要在 main.js 引入 style.css 或 global.css。

3. 建立统一页面容器类
在 tokens.css 中新增/整理这些类：
- .page-shell
- .page-shell--narrow
- .page-shell--default
- .page-shell--data
- .page-shell--full
- .page-header
- .page-title
- .page-subtitle
- .workspace-shell
- .workspace-header
- .workspace-body

要求：
- 普通页面默认 padding: 24px 32px。
- 数据页 max-width 使用 --layout-page-data。
- 工作台/三栏工具页可用 full width。
- 不要强行替换所有页面 class，本阶段只提供公共能力；可轻量修改最外层不会破坏页面的地方。

4. 统一基础 UI 工具类
在 tokens.css 中整理或新增：
- .ui-card
- .ui-card--hover
- .ui-toolbar
- .ui-chip
- .ui-chip--active
- .ui-tag
- .ui-tag--primary / success / warning / danger / neutral
- .ui-metric-value
- .ui-metric-label
- .ui-drawer-overlay
- .ui-drawer-panel
- .ui-drawer-panel--wide
- .ui-sticky-actions

注意：
- 可以保留旧的 .card、.chip、.tag、.metric-value 等类，避免破坏现有页面。
- 旧类可以逐步 alias 到新类风格。
- 不要删除旧类，除非确认没有使用。

5. 修复全局布局耦合
修改：
- src/components/AppSidebar.vue
- src/components/GlobalInputBar.vue

具体要求：
- AppSidebar.vue 中 width/min-width 改为 var(--sidebar-width)。
- GlobalInputBar.vue 中 left: 280px 改为 left: var(--sidebar-width)。
- 保持移动端逻辑不变：小屏仍然 left: 0。
- 不改变 sidebar 的菜单、路由、文案、业务逻辑。

6. 字体和基础渲染
在 tokens.css 中统一：
- html, body 使用 var(--font-family)。
- body 默认 font-size 使用 --font-size-body。
- letter-spacing 保持 0，不要使用负字距。
- 保留 -webkit-font-smoothing。
- 不要引入外部网络字体。

7. 验证
完成后请运行：
- npm run build

如果 build 因本机权限问题失败，请记录错误，不要为了构建失败乱改业务代码。

交付要求：
- 输出修改了哪些文件。
- 说明第一阶段已经完成哪些目标。
- 说明未处理的页面级硬编码样式属于后续阶段。
- 不要做大规模页面视觉重构。
- 不要改 store、mock 数据、路由结构。
- 不要删除业务页面。
- 不要引入新的 UI 框架。
- 不要联网下载资源。

验收标准：
- src/main.js 仍只加载 src/styles/tokens.css。
- tokens.css 成为唯一有效设计系统入口。
- --sidebar-width 与真实侧栏宽度一致，为 280px。
- AppSidebar 和 GlobalInputBar 不再写死 280px。
- 项目保留原有页面功能。
- 后续页面可以直接使用 page-shell、ui-card、ui-chip、ui-drawer 等公共类。
```
