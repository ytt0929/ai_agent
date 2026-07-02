# OpenClaw 提示词：Phase 3-D-2 进入智能报告深度编辑

请先阅读：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/SmartReportPage.vue`
- `src/data/mockSmartReport.js`

## 本阶段目标

Phase 3-D-1 已经完成：

- 智能尽调产物确认阶段点击「编辑报告 / 同步到智能报告」
- 创建或复用智能报告编写任务
- 智能尽调左侧展示报告编辑 Lite
- 智能报告首页可见该任务

Phase 3-D-2 只做一件事：

```text
智能尽调报告编辑 Lite 点击「进入智能报告」
→ 跳转智能报告模块
→ 智能报告自动打开同一份报告任务的深度编辑态
```

## 产品边界

必须遵守：

- 不做交付包下载，交付包下载留到 Phase 3-E。
- 不重新创建报告任务。
- 不重复插入唐山物桥报告任务。
- 不改工作台。
- 不改智能尽调 7 节点流程。
- 不改路由结构。
- 不真实导出 PDF / Word。

## 允许修改文件

优先只改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/SmartReportPage.vue`

必要时可以小改：

- `src/data/mockSmartReport.js`

不要修改：

- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- `src/stores/dueDiligence.js`，除非必须补充 reportTaskId 字段
- `token.css`
- 路由配置

## 实现要求

### 1. 智能尽调点击「进入智能报告」真实跳转

当前 `DueDiligenceTaskPage.vue` 的 `handleEnterSmartReport()` 只是 `ElMessage.info`。

请改成：

1. 确认当前任务已有 `task.reportDraftId` 或 `task.reportTaskId`。
2. 如果没有，则先复用 Phase 3-D-1 的创建/复用逻辑创建报告任务。
3. 获取报告任务 id。
4. 跳转：

```js
router.push({
  path: '/smart-report',
  query: {
    reportId: reportTaskId,
    from: 'due-diligence',
    dueTaskId: taskId
  }
})
```

跳转前右侧尽调助手追加用户/AI 消息：

```text
我：进入智能报告
AI：正在打开智能报告深度编辑页。你可以继续编辑正文、处理待确认项并导出正式报告。
```

### 2. 智能报告页面根据 query 自动打开 editor

`SmartReportPage.vue` 当前已有：

```js
function openReport(task) {
  activeReport.value = { ...task }
  activeSectionId.value = reportSections[0].id
  assistantCollapsed.value = false
  updateAiFirstMessage()
  view.value = 'editor'
}
```

请增加 `useRoute`，并在页面初始化时读取：

```js
route.query.reportId
```

如果存在：

- 从 `reportTasks` 找到对应任务。
- 找到后调用 `openReport(task)`。
- 如果找不到，保持首页并 `ElMessage.warning('未找到对应报告任务')`。

建议用：

```js
onMounted(() => openReportFromQuery())
watch(() => route.query.reportId, () => openReportFromQuery())
```

注意避免重复打开导致状态闪烁，可记录当前已打开 id。

### 3. 智能报告编辑页展示一致

打开后必须显示：

```text
企业：唐山物桥商贸有限公司
报告：尽职调查报告
来源：智能尽调
状态：草稿待编辑
模板：尽职调查报告
```

目录继续使用现有智能报告编辑页目录和正文，不要重写 editor。

### 4. 最近报告列表仍可手动打开

不要破坏智能报告首页已有逻辑：

- 最近报告列表仍可点击「打开 / 继续编辑」进入 editor。
- 模板中心、上传模板、报告生成等现有能力不要改。

### 5. 返回行为

智能报告编辑页原有「返回首页」继续回智能报告首页即可。

本阶段不要求提供「返回智能尽调」按钮。

## 验收路径

1. 进入 `/due-diligence`。
2. 打开 `唐山物桥商贸有限公司` 任务。
3. 进入或切换到 `产物确认`。
4. 点击「编辑报告」或「同步到智能报告」。
5. 左侧进入报告编辑 Lite。
6. 点击「进入智能报告」。
7. 页面应跳转到 `/smart-report?reportId=RPT-TS-WQ...`。
8. 智能报告页面应自动进入 editor，而不是停在首页。
9. editor 顶部应显示 `唐山物桥商贸有限公司 / 尽职调查报告 / 来源：智能尽调 / 草稿待编辑`。
10. 返回智能报告首页后，最近报告列表仍可正常打开报告。

## 构建要求

完成后运行：

```bash
npm run build
```

最终回复请说明：

1. 修改了哪些文件。
2. 「进入智能报告」是否真实跳转。
3. 智能报告是否可根据 `reportId` 自动打开 editor。
4. 是否复用已有报告任务，没有重复创建。
5. 是否未修改工作台、交付包下载和路由结构。
6. `npm run build` 是否通过。
