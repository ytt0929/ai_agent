# OpenClaw 提示词：工作台对话面板继续对齐企业探查 UX/UI

你是资深 Vue 前端工程师和资深 UI/UX 工程师。请在 `D:\demo\ai-copilot` 项目中，继续调整【工作台】二级页，让它更接近“企业探查”页面的工作区效果。

本次目标不是重做首页，而是修工作台进入 AI Copilot 后的二级工作区：去掉顶部大头部，左侧展示产物/业务内容，右侧使用和企业探查一致的 AI 面板 UX/UI，步骤展示移到左侧产物区或改成符合 Element Plus 的轻量步骤组件。

## 一、先阅读这些文件

请先完整阅读：

- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/styles/tokens.css`

重点参考企业探查：

- `EnterpriseExplorationWorkspacePage.vue` 里右侧 `<aside class="edw-chat-panel ai-assistant-panel">`
- `.edw-chat-header.ai-assistant-panel__header`
- `.edw-chat-messages.ai-assistant-panel__messages`
- `.edw-chat-input.ai-assistant-panel__footer`
- `.edw-engine-card` / `.edw-engine-steps` 的执行过程样式
- `tokens.css` 里的 `.ai-assistant-panel` 和 `.ai-message`

## 二、当前问题

工作台当前二级页还有这些问题：

1. 顶部公共 header 太重：
   - `WorkbenchPage.vue` 里仍有 `.wb-copilot__header`
   - 显示“返回工作台 / AI Copilot / 等待输入 / 清空”
   - 这条头部把左侧产物区和右侧对话区整体往下压，不像企业探查页面。

2. 顶部阶段条位置不合适：
   - `WorkbenchStageStrip` 当前在主工作区顶部横跨全宽。
   - 它更像一条全局导航，和企业探查的工作区不一致。
   - 阶段/步骤信息应该放到左侧产物区里，或以 Element Plus `el-steps` / `el-tabs` / `el-tag` 的风格轻量展示。

3. 左侧产物区域不够像企业探查：
   - 左侧应该是主要业务产物区，承载筛客结果、企业探查结果、尽调任务、报告编辑等。
   - 不要在左侧顶部再放一个大蓝色胶囊步骤条占空间。

4. 右侧 AI 面板还没有完全贴近企业探查：
   - 应使用企业探查同款白色独立面板、48px header、消息区滚动、底部输入固定。
   - 面板宽度建议 360px 到 400px，不要过宽；参考企业探查右侧约 360px。
   - 右侧标题可以是 `AI Copilot`，操作为 `清空` 或 `收起`，样式同企业探查。

## 三、必须修改的代码

### 1. 修改 `src/pages/WorkbenchPage.vue`

#### 1.1 去掉二级页公共头部

在 `assistant.dialogOpen` 为 true 的二级页里，删除或不渲染这段结构：

```vue
<header class="wb-copilot__header">
  ...
</header>
```

要求：

- 不再显示顶部整行的“返回工作台 / AI Copilot / 等待输入 / 清空”。
- 不再让 `.wb-copilot__header` 占用高度。
- 对应 CSS `.wb-copilot__header`、`.wb-copilot__header-left`、`.wb-copilot__back`、`.wb-copilot__title`、`.wb-copilot__status` 可以删除，或保留但不再使用。

#### 1.2 返回按钮放到左侧产物区顶部

在 `workspace` 左侧产物区内增加一个轻量 toolbar，不要做成大 header：

```vue
<div class="wb-workspace-toolbar">
  <el-button class="wb-workspace-back" circle @click="returnToNormal">
    <el-icon><ArrowLeft /></el-icon>
  </el-button>
  <div class="wb-workspace-title">
    <strong>{{ workspaceTitle }}</strong>
    <span v-if="statusText">{{ statusText }}</span>
  </div>
</div>
```

`workspaceTitle` 可以用 computed：

```js
const workspaceTitle = computed(() => {
  const m = {
    screening: '智能筛客',
    exploration: '企业探查',
    monitor: '企业监控',
    dueDiligence: '智能尽调',
    business: '工商核验',
    tax: '税票采集',
    materials: '资料收集',
    riskDiagnosis: '风险诊断',
    deliverables: '产物生成',
    reportEditor: '报告编辑',
  }
  return m[assistant.activeTool] || '工作台'
})
```

视觉参考企业探查左上角返回按钮：

- 圆形返回按钮。
- 标题在按钮右侧。
- 不要铺满全屏顶部。
- 高度控制在 48px 到 56px。

#### 1.3 顶部步骤条移到左侧产物区

当前这段不要再放在 `.wb-copilot` 顶部：

```vue
<WorkbenchStageStrip
  v-if="assistant.flowStages.length"
  ...
/>
```

改为放到左侧产物区 toolbar 下方、业务产物上方：

```vue
<WorkbenchStageStrip
  v-if="assistant.flowStages.length"
  class="wb-workspace-stages"
  :stages="assistant.flowStages"
  :active-stage-id="assistant.activeStageId"
  @select="assistant.setActiveStage"
/>
```

或者改用 Element Plus 风格：

```vue
<el-steps
  v-if="assistant.flowStages.length"
  class="wb-workspace-steps"
  :active="activeStageIndex"
  finish-status="success"
  simple
>
  <el-step v-for="s in assistant.flowStages" :key="s.id" :title="s.label" />
</el-steps>
```

如果继续使用 `WorkbenchStageStrip.vue`，请把它改成更轻的 Element 风格：

- 高度不要超过 44px。
- 横向滚动。
- 不要使用大蓝色胶囊占据左侧内容首屏。
- 当前阶段蓝色细边或浅蓝底，已完成用绿色 tag 风格。

#### 1.4 二级页结构改成企业探查同款

`workspace` 状态建议结构：

```vue
<div v-else class="wb-state-split">
  <main class="wb-state-split__left">
    <div class="wb-workspace-toolbar">...</div>
    <WorkbenchStageStrip v-if="assistant.flowStages.length" ... />
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

`chat-center` 状态也不要显示顶部公共 header。居中对话态可以在对话列顶部放一个很轻的返回按钮或不放。

### 2. 修改 `src/pages/WorkbenchPage.vue` 样式

推荐样式方向：

```css
.wb-copilot {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--surface-page);
  overflow: hidden;
}

.wb-state-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.wb-state-split__left {
  min-width: 0;
  overflow-y: auto;
  padding: 32px 40px 40px;
  background: var(--surface-page);
}

.wb-workspace-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.wb-workspace-back {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.wb-workspace-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wb-workspace-title strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.wb-workspace-title span {
  font-size: 13px;
  color: var(--text-secondary);
}

.wb-state-split__right.ai-assistant-panel {
  width: 360px;
  min-width: 360px;
  max-width: 380px;
  height: 100%;
  border-radius: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  border-left: 1px solid var(--border-default);
  background: var(--surface-card);
}

.wb-state-split__right-head.ai-assistant-panel__header {
  height: 48px;
  padding: 0 var(--space-md);
  justify-content: space-between;
  border-bottom: 1px solid var(--border-divider);
}

.wb-state-split__right-msgs.ai-assistant-panel__messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-md);
  background: var(--surface-card);
}

.wb-composer--right.ai-assistant-panel__footer {
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--border-divider);
  background: var(--surface-card);
}
```

注意：

- 不要在 `.wb-state-split__right-msgs` 外再套一个会滚动的 `.conversation` 导致双滚动。
- 如果 `WorkbenchConversation.vue` 自己有 `overflow-y: auto`，在右侧场景要让外层或内层只保留一个滚动容器。

### 3. 修改 `src/components/workbench/WorkbenchConversation.vue`

让消息样式更接近企业探查右侧面板：

1. 用户头像显示 `我`，不要乱码：

```vue
<div v-if="msg.type === 'user'" class="user-avatar">我</div>
```

2. AI meta 文案修成可读中文：

```vue
<span>AI 自动执行</span>
```

3. 等待态文案修成：

```vue
<span>等待输入</span>
<div class="bubble-text">可以继续补充问题，或选择下一步操作。</div>
```

4. 右侧面板内的消息样式建议：

```css
.conversation {
  min-height: 0;
  overflow: visible;
  padding: 0;
  background: transparent;
}

.date-chip {
  margin: 0 auto 18px;
}

.message {
  gap: 8px;
  margin-bottom: 14px;
}

.ai-avatar,
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 11px;
}

.ai-avatar {
  background: var(--color-primary);
  color: #fff;
}

.user-avatar {
  background: var(--surface-page);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  word-break: break-word;
}

.bubble.ai {
  background: var(--surface-page);
  border: 1px solid var(--border-light);
  border-top-left-radius: 4px;
}

.bubble.user {
  background: var(--color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
```

5. 过程卡片 `process-card` 不要在右侧面板中过大。建议后续把步骤放左侧，因此右侧只保留轻量对话。如果仍显示，最大宽度 `100%`，不要撑破面板。

### 4. 修改 `src/components/workbench/WorkbenchBusinessPanel.vue`

左侧要承担“产物展示”职责，类似企业探查左侧结果区：

- 外层不要再做窄小卡片感。
- padding 可由 `WorkbenchPage.vue` 的 `.wb-state-split__left` 控制，组件内部减少重复 padding。
- 筛客结果、企业探查、报告编辑等要占满左侧区域。
- 将流程步骤/当前阶段的摘要放在左侧上方或业务产物上方。

建议：

```css
.wb-business-panel {
  height: auto;
  min-height: 0;
  overflow: visible;
  padding: 0;
  background: transparent;
}
```

业务内容内部仍可使用：

- `el-card`
- `el-table`
- `el-tag`
- `el-descriptions`
- `el-tabs`
- `el-progress`
- `el-alert`

### 5. 修改 `src/components/workbench/WorkbenchStageStrip.vue`

把它从“大蓝色胶囊导航”改成轻量 Element 风格。可选方案：

方案 A：保留组件，但样式改轻：

```css
.stage-strip {
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0 0 16px;
  overflow-x: auto;
  background: transparent;
  border-bottom: 0;
}

.stage-tab {
  height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

.stage-tab.done {
  color: var(--color-success);
  background: var(--color-success-bg);
  border-color: var(--color-success-light);
}

.stage-tab.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  box-shadow: none;
}
```

方案 B：不用 `WorkbenchStageStrip`，在 `WorkbenchPage.vue` 里换成 `el-steps simple`。如果这么做，要删除不用的 import。

## 四、状态源要求

不要改变这条原则：

- 主布局只由 `assistant.layoutMode` 控制。
- 左侧产物只由 `assistant.activeTool + assistant.leftPanelData` 控制。
- 右侧对话只由 `assistant.messages + assistant.contextSuggestions + dialogInputLocal` 控制。
- `currentArtifactType/artifactData` 只能兼容旧逻辑，不允许决定右侧面板或主布局。

如果发现筛客完成后没有进入左右布局，请检查 `src/stores/workbenchAssistant.js`：

- `runScreening()` 结束后必须执行 `layoutMode.value = 'workspace'`。
- `activeTool.value = 'screening'`。
- `leftPanelData` 必须包含 `enterprises / filters / summary`。
- `setActiveStage()` 如果同步 stage，不能用空数据覆盖已有完整 `leftPanelData`。

## 五、不要做的事

- 不要改企业探查页面逻辑。
- 不要新增依赖。
- 不要接真实接口。
- 不要把业务产物放到右侧。
- 不要让右侧面板显示阶段产物。
- 不要保留二级页顶部公共 header。
- 不要让阶段条横跨左右两栏。
- 不要出现两个输入框。
- 不要大范围修复全项目乱码，只修本次工作台二级页可见乱码。

## 六、验收

完成后运行：

```bash
npm run build
```

然后检查：

1. 进入工作台，输入“帮我筛选深圳的软件企业”。
2. 进入 AI Copilot 二级页后，不再出现顶部整行公共 header。
3. 过程初始态对话可以居中，但不应有厚重头部。
4. 筛客结果生成后，左侧显示产物/业务内容，右侧显示 AI Copilot 对话面板。
5. 阶段/步骤展示在左侧产物区内部，或是轻量 Element 风格，不再横跨顶部。
6. 右侧面板视觉接近企业探查：白色面板、48px header、消息区滚动、底部输入固定。
7. AI 在左，用户在右，头像和气泡样式与企业探查一致。
8. 页面无横向溢出、无双滚动、无双输入框。
9. 点击候选企业“探查”，左侧切换为企业探查产物，右侧继续保留对话。

## 七、最终回复

完成后请回复：

1. 修改了哪些文件。
2. 是否去掉了工作台二级页顶部公共 header。
3. 步骤/阶段信息现在放在哪里。
4. 左侧产物区和右侧 AI 面板如何分工。
5. 右侧面板如何对齐企业探查 UX/UI。
6. 是否通过 `npm run build`。
