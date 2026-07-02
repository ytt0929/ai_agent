# OpenClaw 提示词：按企业探查右侧 AI 面板效果重构工作台对话面板

你是资深前端工程师和资深 UX/UI 工程师。请基于当前代码，按“企业探查页面”的 UI 效果调整【工作台】AI Copilot 对话面板。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本次目标

请让工作台 AI Copilot 的二级页面在视觉和交互上对齐企业探查页面：

- 初始没有业务结果时：对话在中间。
- 生成业务内容后：左侧是业务内容展示区，右侧是固定 AI Copilot 对话面板。
- 右侧 AI 面板要接近企业探查截图中的效果：
  - 白色独立面板。
  - 顶部 header：`AI Copilot` / `清空`。
  - 中间消息区。
  - 底部输入区固定。
  - AI 在左、用户在右。
  - 气泡样式、间距、面板边框、输入框风格与企业探查保持一致。
- 不再出现旧的“阶段产物”右侧面板。

请不要只改 CSS，必须先理顺当前状态源。

## 1. 当前代码状态分析

请先阅读这些文件：

- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/components/workbench/WorkbenchArtifactPanel.vue`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/styles/tokens.css`
- `src/styles/global.css`

当前代码里已经有新布局雏形：

```vue
<div v-else class="wb-copilot" :class="`wb-copilot--${assistant.layoutMode}`">
```

当前 `WorkbenchPage.vue` 里：

- `assistant.layoutMode === 'chat-center'` 时渲染 `.wb-state-center`
- 其他状态渲染 `.wb-state-split`
- `.wb-state-split__left` 里渲染 `WorkbenchBusinessPanel`
- `.wb-state-split__right` 里渲染 `WorkbenchConversation`

当前 store 里同时存在两套状态源：

```js
// 新布局状态
layoutMode
activeTool
leftPanelData

// 旧产物状态
currentArtifactType
artifactData
activeStageId
flowStages
```

本次要求：

- 页面布局只由 `layoutMode` 控制。
- 左侧业务内容只由 `activeTool + leftPanelData` 控制。
- 右侧 AI 对话只由 `messages + contextSuggestions + input` 控制。
- `currentArtifactType/artifactData` 只允许作为兼容字段，不允许再决定右侧面板布局。
- 工作台页面不要再直接渲染 `WorkbenchArtifactPanel` 作为右侧“阶段产物”面板。

## 2. 必须修复的状态问题

### 2.1 修复 `runScreening()` 中布局切换

在 `src/stores/workbenchAssistant.js` 的 `runScreening()` 中，有一段类似：

```js
// 切换到工作区态    layoutMode.value = 'workspace'
activeTool.value = 'screening'
```

这里 `layoutMode.value = 'workspace'` 很可能被写进注释里，导致没有真正执行。

请改成明确的独立语句：

```js
layoutMode.value = 'workspace'
activeTool.value = 'screening'
Object.assign(leftPanelData, {
  enterprises: [...enterprises],
  filters,
  summary: {
    matched: '128 家',
    filtered: '98 家',
    recommended: `${enterprises.length} 家`,
    avgMatch: '90%',
  },
})
```

要求：

- 只要筛客结果生成完成，就必须切换为 `workspace`。
- 左侧必须显示 `WorkbenchBusinessPanel` 的筛客结果。
- 右侧必须显示 AI 对话面板。
- 不要让已生成内容后仍停留在居中对话态。

### 2.2 修复 `setActiveStage()` 不同步新状态的问题

当前 `setActiveStage(id)` 会设置：

```js
currentArtifactType.value = id
Object.assign(artifactData, stage.artifactData || {})
```

但它不会同步：

```js
activeTool
leftPanelData
layoutMode
```

请改造 `setActiveStage(id)`：

- 保留旧字段兼容。
- 但当 stage 对应业务内容时，同步 `activeTool` 和 `leftPanelData`。
- 如果 `id !== null` 且有业务内容，则 `layoutMode.value = 'workspace'`。

建议映射：

```js
const stageToolMap = {
  screen: 'screening',
  explore: 'exploration',
  monitor: 'monitor',
  dueDiligence: 'dueDiligence',
  business: 'business',
  tax: 'tax',
  materials: 'materials',
  riskDiagnosis: 'riskDiagnosis',
  deliverables: 'deliverables',
  reportEditor: 'reportEditor',
}
```

示例：

```js
function setActiveStage(id) {
  activeStageId.value = id
  Object.keys(artifactData).forEach(k => delete artifactData[k])

  const stage = flowStages.find(s => s.id === id)
  if (!stage) return

  currentArtifactType.value = id
  Object.assign(artifactData, stage.artifactData || {})

  const mappedTool = stageToolMap[id]
  if (mappedTool) {
    layoutMode.value = 'workspace'
    activeTool.value = mappedTool
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, stage.artifactData || {})
  }
}
```

注意：如果其他流程已经在具体函数里写入了更完整的 `leftPanelData`，不要被空的 `stage.artifactData` 覆盖。可以判断 `Object.keys(stage.artifactData || {}).length` 再覆盖。

### 2.3 保证 `runIntentRecognition()` 不做重复兜底覆盖

当前 `runIntentRecognition(text)` 在 `sendMessage(text)` 后又兜底切换：

```js
if (layoutMode.value === 'chat-center' && currentFlowStatus.value === 'waiting_selection') {
  layoutMode.value = 'workspace'
  activeTool.value = 'screening'
  Object.assign(leftPanelData, ...)
}
```

可以保留，但要确保它不会覆盖 `filters`、`summary.avgMatch` 等完整数据。

建议：

- 首选在 `runScreening()` 内完成完整切换。
- `runIntentRecognition()` 只作为兜底。

## 3. 必须修改的页面结构

### 3.1 `WorkbenchPage.vue`

请确认二级页只有两种主结构：

```vue
<div v-if="assistant.layoutMode === 'chat-center'" class="wb-state-center">
  ...
</div>

<div v-else class="wb-state-split">
  <main class="wb-state-split__left">
    <WorkbenchBusinessPanel
      :tool="assistant.activeTool"
      :data="assistant.leftPanelData"
      @explore="onExplore"
      @select-template="onTpl"
    />
  </main>

  <aside class="wb-state-split__right">
    ...
    <WorkbenchConversation ... />
    ...
  </aside>
</div>
```

要求：

- `WorkbenchPage.vue` 不要 import 或直接使用 `WorkbenchArtifactPanel`。
- 旧的右侧“阶段产物”区域必须彻底从工作台主布局移除。
- 如果要保留 `WorkbenchArtifactPanel.vue` 文件，只作为兼容组件保留，不要在工作台主布局里用它。

### 3.2 `chat-center` 居中态

视觉要求接近企业探查的初始对话页：

- 整体居中。
- 容器宽度建议 `760px - 860px`。
- 输入框在容器底部。
- 不显示业务内容区。
- 不显示阶段产物区。

### 3.3 `workspace` 左内容 + 右对话态

视觉要求接近企业探查截图：

```text
左侧：业务结果区，占据剩余宽度
右侧：AI Copilot 对话面板，固定宽度约 420px
```

右侧面板要求：

- `width: 420px`
- `min-width: 380px`
- `max-width: 460px`
- 白色背景。
- 左边框 `1px solid var(--border-default)`。
- 高度填满二级页主体。
- header 固定在顶部。
- 输入框固定在底部。
- 消息区滚动。

## 4. 必须按企业探查效果调整右侧 AI 面板

参考截图中的企业探查 AI 面板：

- 面板标题：`AI Copilot`
- 右侧操作：`清空`
- AI 头像：蓝底圆形或浅蓝小方块，文字 `AI`
- 用户头像：蓝底圆形，文字 `我`
- AI 气泡：浅灰/浅蓝背景，细边框
- 用户气泡：主蓝色背景，白字
- 气泡宽度：
  - AI：最大 82% - 86%
  - 用户：最大 72% - 76%
- 消息之间间距 14px - 18px
- 输入框：Element Plus `el-input` 或 `textarea`
- 发送按钮：Element Plus `el-button type="primary"`

请修改：

- `src/pages/WorkbenchPage.vue` 中 `.wb-state-split__right*` 和 `.wb-composer--right`
- `src/components/workbench/WorkbenchConversation.vue` 中消息布局样式

## 5. `WorkbenchConversation.vue` 具体修改要求

当前组件仍有一些旧样式痕迹：

```css
.message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
```

请改成更稳定的 order 控制，参考企业探查：

```css
.message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin-bottom: 16px;
}

.message.ai {
  justify-content: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message.ai .ai-avatar {
  order: 0;
}

.message.ai .bubble {
  order: 1;
}

.message.user .bubble {
  order: 0;
}

.message.user .user-avatar {
  order: 1;
}
```

头像：

```vue
<div v-if="msg.type === 'user'" class="user-avatar">我</div>
```

不要显示乱码。

气泡：

```css
.bubble.ai {
  background: #f8fafc;
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  border-top-left-radius: 4px;
}

.bubble.user {
  background: var(--color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
```

滚动：

- 保留当前流式输出自动滚动监听。
- 不要让消息撑破右侧面板。

## 6. `WorkbenchBusinessPanel.vue` 具体修改要求

左侧业务区要像企业探查内容区，不要像“阶段产物小卡片”。

要求：

- 左侧外层 padding 建议 `24px 28px`。
- 内容区宽度占满剩余空间。
- 使用 Element Plus：
  - `el-card`
  - `el-table`
  - `el-tag`
  - `el-descriptions`
  - `el-tabs`
  - `el-progress`
  - `el-alert`
- `screening` 阶段要显示清晰的候选企业列表。
- `exploration` 阶段要显示企业探查信息。
- `reportEditor` 阶段要有类似截图中的报告编辑区：
  - 左侧报告章节列表
  - 状态标签
  - 正文编辑区

注意：

- 面板标题不要再叫“阶段产物”。
- fallback 文案可以是“等待业务内容生成”。

## 7. 阶段导航条

当前 `WorkbenchPage.vue` 顶部有 `WorkbenchStageStrip`。

请保持，但样式应接近截图顶部的胶囊按钮：

- 横向排列。
- 当前阶段蓝色实心。
- 已完成/可用阶段浅绿色或浅蓝色。
- 不要挤压主体内容。
- 高度控制在 72px 内。

如果 `WorkbenchStageStrip` 过于旧，可少量修改：

- `src/components/workbench/WorkbenchStageStrip.vue`

## 8. 不要做的事

- 不要继续把业务结果放到右侧。
- 不要继续把对话放在左侧工作流主区域。
- 不要让 `currentArtifactType` 决定布局。
- 不要在工作台主布局里渲染 `WorkbenchArtifactPanel`。
- 不要同时出现两个输入框。
- 不要启用 `GlobalInputBar`。
- 不要重写企业探查页面。
- 不要新增依赖。
- 不要接真实接口。

## 9. 验收场景

完成后运行：

```bash
npm run build
```

并检查：

### 场景 1：刚进入工作台 AI Copilot

输入：

```text
帮我筛选深圳的软件企业
```

期望：

- 先进入居中对话态。
- AI 对话在中间。
- 无左侧空业务区。
- 无右侧“阶段产物”。

### 场景 2：筛客结果生成后

期望：

- `layoutMode = workspace`
- `activeTool = screening`
- 左侧显示 `WorkbenchBusinessPanel` 的筛客结果。
- 右侧显示 AI Copilot 对话面板。
- 右侧不显示“阶段产物”。
- 输入框在右侧 AI 面板底部。

### 场景 3：点击候选企业探查

期望：

- 左侧更新为企业探查内容。
- 右侧继续追加 AI 对话。
- AI 提示“加入监控”和“新建尽调”是并列动作。

### 场景 4：视觉

期望：

- 整体接近企业探查截图。
- 右侧面板宽度稳定。
- AI 消息左侧，用户消息右侧。
- 无横向溢出。
- 无两个输入框。

## 10. 最终回复

完成后请回复：

1. 修改了哪些文件。
2. 如何修复状态源混杂问题。
3. 如何保证业务内容在左侧、AI 对话在右侧。
4. 是否移除了工作台主布局里的 `WorkbenchArtifactPanel`。
5. 是否修复了 `runScreening()` 的 `layoutMode` 切换。
6. 是否通过 `npm run build`。

请优先保证状态正确和布局正确，再做视觉微调。
