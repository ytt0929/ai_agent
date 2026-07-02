# OpenClaw 提示词：快速优化工作台首页输入框进入后的二级 AI Copilot 页面

你是资深 UX/UI 工程师和前端工程师。请基于现有 Vue + Element Plus 项目，快速修复“工作台首页输入框进入后的 AI Copilot 二级页面”布局混乱问题。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本次只做这一件事

只优化工作台二级 AI Copilot 页面：

- 工作台首页输入框输入后进入的对话页面。
- 不改企业探查业务。
- 不改智能尽调业务。
- 不改税票、报告、监控状态机。
- 不新增依赖。
- 不做大重构。

目标是：参考企业探查的对话样式和交互节奏，把工作台二级页面改成清晰、稳定、可继续推进任务的 AI 对话工作区。

## 1. 快速定位文件

请优先阅读这些文件，其他文件先不要展开。

### 必读

- `src/pages/WorkbenchPage.vue`
  - 工作台首页和 AI Copilot 二级页面都在这里。
  - 二级页面入口在 `assistant.dialogOpen`。
  - 重点看 `.workbench-dialog-wrap`。
  - 重点看 `.workbench-dialog-body`。
  - 重点看 `.wb-dialog-left`。
  - 重点看 `.wb-dialog-right`。
  - 重点看 `.wb-suggestion-bar`。
  - 重点看 `.wb-dialog-input`。

- `src/components/workbench/WorkbenchConversation.vue`
  - 工作台对话消息气泡。
  - 日期 chip。
  - AI/user 消息布局。
  - 流程卡片 `.process-card`。

- `src/stores/workbenchAssistant.js`
  - 只用于理解 `dialogOpen`、`messages`、`flowStages`、`currentArtifactType`、`contextSuggestions`。
  - 不要重写流程。

- `src/components/workbench/WorkbenchArtifactPanel.vue`
  - 右侧阶段产物区。
  - 本次不重做，只确保布局能正常承载。

### 参考文件

- `src/pages/EnterpriseExplorationWorkspacePage.vue`

只参考以下体验，不要复制业务逻辑：

- 对话优先模式：`.edw-chat-only`
- 结果工作区模式：`.edw-workspace-layout`
- 统一 AI 面板感觉：`.ai-assistant-panel`
- 消息样式：`.ai-message--ai`、`.ai-message--user`、`.ai-message__bubble`

## 2. 当前问题

现在工作台二级 AI Copilot 页面存在这些 UX 问题：

1. 没有阶段产物时，页面仍按左右布局展示，右侧出现巨大空白。
2. 左侧对话区太窄，用户输入“处理税票”后，聊天内容挤在左侧。
3. 底部输入框横跨整个页面，视觉上不属于左侧对话，也不属于右侧产物。
4. 快捷建议按钮和输入框关系不够稳定，应该像“下一步建议/快捷回复”一样靠近输入框。
5. 对话、流程阶段、产物区的边界不清。
6. 工作台二级页和企业探查的对话体验不统一。

## 3. 目标交互

请把工作台二级页改成两种明确状态。

### 状态 A：无产物，对话优先模式

判断条件：

```js
!assistant.currentArtifactType
```

目标：

- 不显示右侧产物占位。
- 不出现右侧大空白。
- 对话区域居中，宽度建议 `680px - 760px`。
- 消息区在中间滚动。
- 快捷建议按钮固定在输入框上方。
- 输入框固定在这个居中对话容器底部。
- 输入框不要横跨整个页面。
- 体验参考企业探查 `.edw-chat-only`。

视觉结构：

```text
顶部栏
  返回工作台 / AI Copilot / 清空对话

中间
  居中对话流

底部
  快捷建议按钮
  输入框 + 发送按钮
```

### 状态 B：有产物，工作区模式

判断条件：

```js
assistant.currentArtifactType
```

目标：

- 左侧为 AI 对话面板。
- 右侧为阶段产物区。
- 左侧宽度建议 `380px - 420px`。
- 右侧占据剩余空间。
- 输入框只在左侧 AI 面板底部。
- 快捷建议按钮在左侧输入框上方。
- 右侧只展示 `WorkbenchArtifactPanel`，不承载输入框。
- 体验参考企业探查 `.edw-workspace-layout`。

视觉结构：

```text
顶部栏
  返回工作台 / AI Copilot / 当前状态 / 清空对话

主体
  左侧 AI 对话面板
    消息区
    快捷建议
    输入框

  右侧阶段产物区
    WorkbenchArtifactPanel
```

## 4. 必须修改的区域

### 4.1 `WorkbenchPage.vue`：增加布局状态 class

在二级页面根容器上增加状态 class，例如：

```vue
<div
  v-else
  class="workbench-dialog-wrap"
  :class="{
    'workbench-dialog-wrap--chat-only': !assistant.currentArtifactType,
    'workbench-dialog-wrap--with-artifact': assistant.currentArtifactType
  }"
>
```

允许使用 computed，但不要过度封装。

### 4.2 `WorkbenchPage.vue`：重组二级页面结构

当前大概率是：

```vue
<div class="workbench-dialog-body">
  <div class="wb-dialog-left">
    <WorkbenchConversation />
  </div>

  <div v-if="assistant.currentArtifactType" class="wb-dialog-right">
    <WorkbenchArtifactPanel />
  </div>
</div>

<div class="wb-suggestion-bar">...</div>
<div class="wb-dialog-input">...</div>
```

请改成更清晰的结构：

```vue
<div class="workbench-dialog-body">
  <div class="wb-dialog-chat-shell">
    <div class="wb-dialog-chat-scroll">
      <WorkbenchConversation ... />
    </div>

    <div class="wb-dialog-composer">
      <div v-if="assistant.contextSuggestions.length" class="wb-suggestion-bar">
        <button
          v-for="..."
          class="wb-suggestion-btn"
          @click="handleSuggestionClick(s)"
        >
          {{ s.label }}
        </button>
      </div>

      <div class="wb-dialog-input">
        <el-input
          v-model="dialogInputLocal"
          :placeholder="dialogPlaceholder"
          clearable
          @keyup.enter="sendDialogMessage"
          size="large"
          class="wb-dialog-input-inner"
        >
          ...
        </el-input>
      </div>
    </div>
  </div>

  <div v-if="assistant.currentArtifactType" class="wb-dialog-right">
    ...
  </div>
</div>
```

要求：

- 建议按钮和输入框属于同一个 composer。
- composer 在无产物模式下跟随居中对话容器。
- composer 在有产物模式下跟随左侧 AI 面板。
- 删除或停用原本页面级底部的 `.wb-suggestion-bar` 和 `.wb-dialog-input` 位置。
- `:placeholder="dialogPlaceholder"` 必须保留。

### 4.3 `WorkbenchPage.vue`：CSS 改造

请重点改这些 class：

- `.workbench-dialog-wrap`
- `.workbench-dialog-body`
- `.workbench-dialog-wrap--chat-only`
- `.workbench-dialog-wrap--with-artifact`
- `.wb-dialog-chat-shell`
- `.wb-dialog-chat-scroll`
- `.wb-dialog-composer`
- `.wb-dialog-right`
- `.wb-suggestion-bar`
- `.wb-dialog-input`

建议 CSS 方向：

```css
.workbench-dialog-wrap {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  min-height: 520px;
  background: var(--surface-page);
}

.workbench-dialog-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.workbench-dialog-wrap--chat-only .workbench-dialog-body {
  justify-content: center;
  padding: 0 24px;
}

.workbench-dialog-wrap--chat-only .wb-dialog-chat-shell {
  width: min(760px, 100%);
  border-left: 1px solid var(--border-default);
  border-right: 1px solid var(--border-default);
  background: var(--surface-page);
}

.workbench-dialog-wrap--with-artifact .wb-dialog-chat-shell {
  width: 400px;
  min-width: 360px;
  max-width: 440px;
  border-right: 1px solid var(--border-default);
  background: var(--surface-page);
}

.wb-dialog-chat-shell {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.wb-dialog-chat-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.wb-dialog-composer {
  flex-shrink: 0;
  padding: 10px 16px 16px;
  background: linear-gradient(180deg, rgba(248,250,252,0), var(--surface-page) 28%);
  border-top: 1px solid var(--border-divider);
}

.wb-suggestion-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 0 10px;
  border-top: none;
  background: transparent;
}

.wb-dialog-input {
  padding: 0;
  background: transparent;
}
```

不要机械照抄，按现有 token 调整即可。

### 4.4 `WorkbenchConversation.vue`：消息布局优化

目标：

- AI 消息在左。
- 用户消息在右。
- AI 头像为 `AI`。
- 用户头像显示 `张` 或 `我`，不要乱码。
- AI 气泡浅色背景、细边框。
- 用户气泡主蓝色背景。
- 气泡不要铺满整行。

建议调整：

```css
.message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
}

.message.ai {
  justify-content: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message.user .bubble {
  order: 0;
  max-width: 76%;
}

.message.user .user-avatar {
  order: 1;
}

.message.ai .bubble {
  max-width: 82%;
}
```

如当前模板用 grid，也可以继续用 grid，但最终视觉必须是：

- AI 左。
- 用户右。
- 气泡宽度合理。
- 对话容器变宽后不显得散。

### 4.5 `WorkbenchConversation.vue`：流程卡片降噪

`.process-card` 当前容易像大块内容混入聊天流。

请改为：

- 只在 `activeStage` 且 `activeSteps.length` 时显示。
- 最大宽度跟随 AI 消息，不要撑满。
- 减小阴影和边距。
- 标题更紧凑。
- 步骤行更轻，不要过度抢视觉。

模板建议：

```vue
<div v-if="activeStage && activeSteps.length" class="process-card">
```

### 4.6 顶部状态轻量化

在 `WorkbenchPage.vue` 顶部栏里，如果存在流程状态，显示轻量状态。

可使用 computed，例如：

```js
const assistantStatusText = computed(() => {
  if (assistant.currentFlowStatus === 'completed') return '流程已完成'
  if (assistant.waitingForInput) return '等待输入'
  if (assistant.isThinking || assistant.flowStages.length) return '自动推进中'
  return ''
})
```

顶部展示：

```vue
<span v-if="assistantStatusText" class="assist-status">
  <span class="pulse-dot"></span>
  {{ assistantStatusText }}
</span>
```

如果已有类似状态，可以直接优化，不要重复加两套。

## 5. 不要修改

严格不要做这些事：

- 不要重写 `src/stores/workbenchAssistant.js` 主流程。
- 不要改税票确认、企业授权、报告确认逻辑。
- 不要改变 `assistant.contextSuggestions` 的数据结构。
- 不要改路由。
- 不要新增依赖。
- 不要启用 `GlobalInputBar`。
- 不要把企业探查业务逻辑复制进工作台。
- 不要大面积重写 `WorkbenchArtifactPanel.vue`。
- 不要处理无关页面样式。
- 不要把中文乱码作为本次重点，浏览器展示正常即可。

## 6. 验收路径

请完成后运行：

```bash
npm run build
```

然后至少检查以下场景：

### 场景 1：从工作台首页输入

在工作台首页输入：

```text
处理税票
```

进入 AI Copilot 二级页后：

- 没有产物时，对话区居中。
- 右侧不出现巨大空白。
- 输入框在居中对话容器底部。
- 快捷建议按钮在输入框上方。
- 输入框没有横跨整个页面。

### 场景 2：流程产生阶段产物

当 `assistant.currentArtifactType` 出现后：

- 页面切换为左侧 AI 对话面板 + 右侧产物区。
- 左侧面板宽度稳定，大约 `380px - 420px`。
- 输入框仍在左侧面板底部。
- 快捷建议仍在输入框上方。
- 右侧只展示阶段产物，不出现第二个输入框。

### 场景 3：消息样式

检查消息区：

- AI 消息在左。
- 用户消息在右。
- 气泡宽度合理。
- 头像位置正确。
- 日期 chip 不抢视觉。
- 流程卡片不撑满、不压迫阅读。

### 场景 4：窄屏

窄屏下：

- 不横向溢出。
- 不重叠。
- 输入框仍归属于 AI 对话区。
- 产物区可下移或合理堆叠。

## 7. 最终回复格式

完成后请回复：

1. 修改了哪些文件。
2. 如何判断“对话优先模式”和“工作区模式”。
3. 如何解决右侧大空白。
4. 输入框和快捷建议现在放在哪里。
5. 是否参考了企业探查的对话样式。
6. `npm run build` 是否通过。

请保持改动小而准，优先解决布局与交互归属，不要扩大范围。
