# OpenClaw 提示词：Phase 3-D-1 智能尽调内嵌报告 Lite + 创建智能报告编写任务

请先阅读：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/components/workbench/artifacts/DeliverablesArtifact.vue`
- `src/components/workbench/artifacts/ReportEditorArtifact.vue`
- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`

## 本阶段目标

实现 Phase 3-D-1：智能尽调与智能报告打通，但只做第一步。

产物确认阶段点击「编辑报告」或「同步到智能报告」时：

1. 创建或复用一条智能报告编写任务。
2. 智能尽调左侧切换为报告编辑 Lite。
3. 智能报告首页「最近报告」能看到这条报告任务。
4. 不强制跳转到智能报告页面。
5. 保留「进入智能报告」作为后续入口，但本阶段不要求做深度跳转编辑。

## 产品边界

必须遵守：

- 不在新建尽调时创建报告任务。
- 只在产物确认阶段点击「编辑报告」或「同步到智能报告」时创建/复用报告任务。
- 不做交付包下载，交付包下载留到 Phase 3-E。
- 不改工作台逻辑。
- 不改智能尽调 7 个阶段主流程。
- 不重写智能报告整页。
- 不新增后端，不真实导出 PDF。

## 允许修改的文件

优先只改：

- `src/stores/dueDiligence.js`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/components/workbench/artifacts/DeliverablesArtifact.vue`
- `src/components/workbench/artifacts/ReportEditorArtifact.vue`
- `src/data/mockSmartReport.js`
- `src/pages/SmartReportPage.vue`

不要修改：

- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- 路由结构
- 全局导航
- `token.css`

## 实现要求

### 1. 创建/复用智能报告编写任务

优先复用 `src/data/mockSmartReport.js` 现有的 `reportTasks` 结构。

请新增一个前端 mock 方法，例如：

```js
export function createOrReuseReportTaskFromDueDiligence(payload) {}
```

行为：

- 按 `dueTaskId` 或 `enterpriseName + reportName` 查找已有报告任务。
- 已存在则复用，不重复创建。
- 不存在则创建新任务并插入 `reportTasks` 第一位。
- 返回 `{ task, reused }`。

唐山物桥任务建议：

```js
{
  id: 'RPT-TS-WQ',
  enterpriseName: '唐山物桥商贸有限公司',
  reportName: '尽职调查报告',
  source: '智能尽调',
  dueTaskId: 'dd-ts-wq-001',
  templateId: 'credit-v2021',
  templateName: '尽职调查报告',
  materialPackageId: 'MAT-004',
  status: '草稿待编辑',
  pendingCount: 3,
  materialComplete: 86,
  chapters: 15,
  evidenceCount: 24,
  aiNote: '税负率偏低、购销两头在外、开票收入与申报收入不一致等风险事项需重点核实',
  updatedAt: '2026-07-02 15:40',
  riskLevel: '中风险'
}
```

注意：`reportTasks` 当前已可能存在唐山物桥任务，必须复用，不能重复插入多条。

### 2. 智能尽调产物确认阶段按钮

在智能尽调详情页的产物确认阶段，至少支持两个动作：

```text
[编辑报告] [同步到智能报告]
```

点击任意一个都要：

- 创建/复用智能报告编写任务。
- 将当前左侧展示区切换为 `ReportEditorArtifact` Lite 形态。
- 右侧尽调助手追加 AI 消息。

AI 话术：

```text
已基于当前尽调产物创建智能报告编写任务。
你可以先在当前页轻量编辑报告，也可以稍后进入智能报告进行深度编辑、版本管理和导出。
```

如果复用已有任务：

```text
已找到该企业的智能报告编写任务，并同步当前尽调产物。你可以继续在当前页编辑。
```

### 3. 报告编辑 Lite

智能尽调左侧的报告编辑 Lite 继续复用 `ReportEditorArtifact.vue`，不要重新写一套。

要求：

- 目录必须来自智能报告模板 `credit-v2021` 的 15 章。
- 企业名称为 `唐山物桥商贸有限公司`。
- 模板名称展示为 `尽职调查报告`。
- 显示本章证据链、关联资料、待确认项。
- 保留轻量按钮：
  - `保存草稿`
  - `根据资料重新生成本节`
  - `预览报告`
  - `进入智能报告`

本阶段「进入智能报告」可以只提示 `ElMessage.info` 或追加 AI 消息，不要求真实深度跳转。

### 4. 智能报告首页可见

进入 `/smart-report` 后，首页「最近报告」列表需要能看到：

```text
唐山物桥商贸有限公司 | 尽职调查报告 | 草稿待编辑 | 继续编辑
```

如果现有 `reportTasks` 已经有唐山物桥任务，请确保状态、模板名、来源符合：

```text
来源：智能尽调
模板：尽职调查报告
状态：草稿待编辑
```

### 5. 智能尽调任务状态

智能尽调任务对象可以记录报告任务 id：

```js
task.reportTaskId = reportTask.id
task.reportStatus = '草稿待编辑'
```

如果当前 store 中已有 `reportDraftId`，可以复用该字段，但命名要保持当前代码风格一致。

## UI 和样式要求

- 使用现有 Element Plus 组件。
- 使用现有 `ReportEditorArtifact.vue` 和项目 token 样式。
- 不新增大量图标。
- 不要用原生 table 替代 Element Plus 或现有组件。
- 不要破坏智能尽调详情页左右布局和滚动。

## 验收路径

1. 进入 `/due-diligence`。
2. 打开 `唐山物桥商贸有限公司` 任务。
3. 推进或切换到 `产物确认` 阶段。
4. 点击「编辑报告」或「同步到智能报告」。
5. 左侧应切换为报告编辑 Lite，目录为智能报告模板 15 章。
6. 右侧尽调助手应追加“已创建智能报告编写任务”的 AI 消息。
7. 进入 `/smart-report`。
8. 最近报告中应看到 `唐山物桥商贸有限公司 / 尽职调查报告 / 草稿待编辑`。
9. 重复点击「编辑报告」或「同步到智能报告」，不应新增重复报告任务。

## 构建要求

完成后运行：

```bash
npm run build
```

最终回复请说明：

1. 修改了哪些文件。
2. 是否创建/复用智能报告编写任务。
3. 是否在智能尽调左侧展示报告编辑 Lite。
4. 智能报告首页是否能看到任务。
5. 是否避免重复创建报告任务。
6. 是否没有修改工作台和交付包下载。
7. `npm run build` 是否通过。
