# OpenClaw 提示词：按企业探查 UI 调整工作台对话面板

你是资深 Vue 前端工程师和资深 UI/UX 工程师。请在 `D:\demo\ai-copilot` 项目中，参考“企业探查”页面右侧 AI 面板效果，调整【工作台】二级页的 AI Copilot 对话面板。

本次只做工作台对话面板、工作台左右布局和必要状态源修复。不要重构企业探查页面，不要新增依赖，不要接真实接口，不要大范围改业务流程。

## 一、先阅读这些文件

必须先读：

- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/stores/workbenchAssistant.js`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/styles/tokens.css`

重点参考企业探查页面里的这些结构和样式：

- `EnterpriseExplorationWorkspacePage.vue` 中的 `.edw-workspace-layout`
- `.edw-chat-panel.ai-assistant-panel`
- `.edw-chat-header.ai-assistant-panel__header`
- `.edw-chat-messages.ai-assistant-panel__messages`
- `.edw-chat-input.ai-assistant-panel__footer`
- `tokens.css` 中统一的 `.ai-assistant-panel`、`.ai-message`、`.ai-message__bubble` 样式

## 二、目标效果

把通用【工作台】AI Copilot 二级页调整为和企业探查工作台相同的信息架构：

1. 过程初始态：对话居中显示，输入框在底部，对话优先。
2. 业务结果生成后：左侧是业务内容区，右侧是固定 AI Copilot 对话面板。
3. 右侧 AI 面板必须像企业探查页面：
   - 白色独立面板。
   - 顶部 header 固定，左侧标题 `AI Copilot`，右侧操作 `清空`。
   - 中间消息区独立滚动。
   - 底部输入区固定。
   - AI 消息在左，用户消息在右。
   - AI 气泡浅灰或浅蓝背景，用户气泡主蓝色背景白字。
   - 面板宽度稳定，建议 `420px`，最小 `380px`，最大 `460px`。
4. 不再出现旧的“阶段产物”右侧面板。
5. 不要出现两个输入框。
6. 不要让 `currentArtifactType/artifactData` 决定主布局；主布局只由 `layoutMode` 决定。

## 三、具体要改哪些代码

### 1. `src/pages/WorkbenchPage.vue`

检查并调整二级页结构，只保留两种主状态：

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

  <aside class="wb-state-split__right ai-assistant-panel">
    <div class="wb-state-split__right-head ai-assistant-panel__header">
      <h3 class="ai-assistant-panel__title">AI Copilot</h3>
      <el-button text size="small" @click="clearChat">清空</el-button>
    </div>

    <div class="wb-state-split__right-msgs ai-assistant-panel__messages">
      <WorkbenchConversation ... />
    </div>

    <div class="wb-composer wb-composer--right ai-assistant-panel__footer">
      ...
    </div>
  </aside>
</div>
```

要求：

- 不要 import 或渲染 `WorkbenchArtifactPanel`。
- `.wb-state-split__left` 只放业务内容。
- `.wb-state-split__right` 只放 AI 对话。
- 右侧对话面板套用或贴近 `ai-assistant-panel` 的视觉规范。
- 顶部工作台 header 和阶段条可以保留，但不要挤压主内容。

需要调整的 CSS：

- `.wb-state-split`
- `.wb-state-split__left`
- `.wb-state-split__right`
- `.wb-state-split__right-head`
- `.wb-state-split__right-msgs`
- `.wb-composer--right`
- `.wb-state-center`
- `.wb-state-center__col`
- `.wb-state-center__msgs`

推荐样式：

```css
.wb-state-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.wb-state-split__left {
  min-width: 0;
  overflow-y: auto;
  background: var(--surface-page);
}

.wb-state-split__right.ai-assistant-panel {
  width: 420px;
  min-width: 380px;
  max-width: 460px;
  height: 100%;
  border-radius: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  border-left: 1px solid var(--border-default);
  background: var(--surface-card);
}

.wb-state-split__right-head.ai-assistant-panel__header {
  height: 52px;
  padding: 0 16px;
  justify-content: space-between;
}

.wb-state-split__right-msgs.ai-assistant-panel__messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

.wb-composer--right.ai-assistant-panel__footer {
  padding: 10px 12px;
  background: var(--surface-card);
  border-top: 1px solid var(--border-divider);
}
```

### 2. `src/components/workbench/WorkbenchConversation.vue`

把消息布局调整成企业探查页面同款稳定左右布局。

当前组件里有：

```css
.message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
```

建议改为 order 控制：

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

气泡样式按企业探查面板调整：

```css
.bubble.ai {
  background: #f1f5f9;
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  border-top-left-radius: 2px;
  max-width: 82%;
}

.bubble.user {
  background: var(--color-primary);
  color: #fff;
  border-top-right-radius: 2px;
  max-width: 76%;
}
```

要求：

- AI 头像显示 `AI`。
- 用户头像显示 `我`，不要乱码。
- 消息区保留自动滚动逻辑。
- 气泡必须 `word-break: break-word`，避免撑破右侧面板。
- `process-card` 在右侧面板内最大宽度不要超过 `90%`。

### 3. `src/stores/workbenchAssistant.js`

修复状态源，避免业务结果生成后仍停留在居中对话态。

#### 3.1 修复 `runScreening()`

在筛客结果生成完成后，必须明确执行：

```js
layoutMode.value = 'workspace'
activeTool.value = 'screening'
Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
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

注意：当前代码里疑似有 `layoutMode.value = 'workspace'` 被写到注释同一行后面，导致没有执行。必须改成独立语句。

#### 3.2 修复 `setActiveStage(id)`

当前 `setActiveStage` 只同步：

```js
currentArtifactType.value = id
Object.assign(artifactData, stage.artifactData || {})
```

需要增加对新状态源的同步：

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

推荐实现：

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

    const data = stage.artifactData || {}
    if (Object.keys(data).length) {
      Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
      Object.assign(leftPanelData, data)
    }
  }
}
```

如果某些流程函数后续会写入更完整的 `leftPanelData`，不要用空的 `stage.artifactData` 覆盖它。

#### 3.3 修复 `runIntentRecognition(text)`

保留兜底逻辑，但不要覆盖完整筛客数据：

```js
if (layoutMode.value === 'chat-center' && currentFlowStatus.value === 'waiting_selection') {
  layoutMode.value = 'workspace'
  activeTool.value = 'screening'
  if (!leftPanelData.enterprises?.length) {
    Object.assign(leftPanelData, {
      enterprises: [...candidateCustomers],
      summary: {
        matched: '128 家',
        filtered: '98 家',
        recommended: `${candidateCustomers.length} 家`,
        avgMatch: '90%',
      },
    })
  }
}
```

### 4. `src/components/workbench/WorkbenchBusinessPanel.vue`

左侧业务区要像企业探查内容区，不要像小型阶段产物卡。

重点调整：

- `.wb-business-panel` padding 建议 `24px 28px`。
- 背景用 `var(--surface-page)`。
- 表格、指标、描述、报告编辑区撑满左侧可用宽度。
- fallback 标题不要叫“阶段产物”，改成“等待业务内容生成”。

如果当前文案乱码，修复本次涉及到的可见文案：

- 智能筛客结果
- 企业探查
- 企业监控
- 尽调任务
- 工商核验
- 税票采集
- 资料包清单
- 风险诊断
- 产物清单
- 报告编辑
- 等待业务内容生成

### 5. `src/components/workbench/WorkbenchStageStrip.vue`

阶段条可以保留。只做轻量样式优化：

- 高度控制在 64px 以内。
- 横向滚动。
- 当前阶段蓝色实心。
- 已完成阶段浅绿或浅蓝。
- 不要挤压主工作区。

## 四、不要做的事

- 不要改企业探查页面主体逻辑。
- 不要新增依赖。
- 不要接真实接口。
- 不要把业务结果放到右侧。
- 不要把对话放到左侧业务区。
- 不要让 `currentArtifactType` 决定主布局。
- 不要在工作台主布局里渲染 `WorkbenchArtifactPanel`。
- 不要同时显示两个输入框。
- 不要启用全局输入条。
- 不要大范围修复全项目乱码；只修本次会直接影响工作台对话面板的可见文案。

## 五、验收步骤

完成后运行：

```bash
npm run build
```

验收场景：

1. 进入工作台首页，输入“帮我筛选深圳的软件企业”。
2. 初始过程态应为居中对话，不显示左侧业务空区。
3. 筛客结果生成后，应切到 `layoutMode = workspace`。
4. 左侧显示 `WorkbenchBusinessPanel` 的筛客结果。
5. 右侧显示固定宽度 AI Copilot 对话面板。
6. 右侧面板 header 为 `AI Copilot` + `清空`。
7. AI 消息在左，用户消息在右。
8. 消息区可滚动，底部输入区固定。
9. 点击候选企业“探查”，左侧切换为企业探查内容，右侧继续追加对话。
10. 页面无横向溢出，无双输入框，无旧“阶段产物”右侧面板。

## 六、最终回复

完成后请说明：

1. 修改了哪些文件。
2. 如何修复 `layoutMode / activeTool / leftPanelData` 状态源。
3. 如何保证左侧是业务内容、右侧是 AI 对话。
4. 是否移除了工作台主布局中的 `WorkbenchArtifactPanel`。
5. 是否修复 `runScreening()` 的 `layoutMode` 切换。
6. 是否通过 `npm run build`。
