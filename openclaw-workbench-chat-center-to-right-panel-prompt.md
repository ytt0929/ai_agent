# OpenClaw 提示词：修正工作台 AI Copilot 对话面板从居中态到右侧态的布局转场

你是资深 UX/UI 工程师和前端工程师。请基于现有 Vue + Element Plus 项目，修正工作台 AI Copilot 的核心布局体验。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本次目标

请重点实现一个清晰的布局转场：

```text
未生成业务内容时：
  对话面板在页面中间，像企业探查的初始对话页。

生成业务内容后：
  左侧变成业务内容展示区，右侧变成 AI 对话面板。
```

这次不要优先扩展复杂业务流程，先把这两个状态的空间关系、输入框归属、对话面板位置做正确。

## 1. 参考图片含义

用户给了三张参考图，重点理解如下：

### 图 3：对话中间态

这是工作台 AI Copilot 的初始 / 中间对话态。

要求：

- 对话内容居中，不要靠左挤成窄栏。
- 输入框跟随中间对话区，位于底部。
- 页面大部分空间留给对话，不显示空的左侧业务内容区。
- 整体类似企业探查初始对话页面。

### 图 2：内容生成后的左右工作区态

这是生成内容后的状态。

要求：

- 左侧为业务内容展示区。
- 右侧为 AI 对话面板。
- AI 对话面板固定在右侧，包含 header、消息区、底部输入框。
- 左侧内容区可以展示企业探查、筛客结果、股东明细、尽调进度等。
- 右侧对话面板风格参考企业探查。

### 图 1：当前错误示例

当前工作台存在的问题：

- 对话区、内容区、阶段产物区混在一起。
- 对话面板没有在中间态居中。
- 内容出现后，对话没有稳定收拢到右侧。
- 输入框横跨过宽，视觉归属不清。
- 右侧阶段产物占位不应该抢占对话面板职责。

## 2. 必读文件

请优先阅读：

- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/components/workbench/WorkbenchArtifactPanel.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/styles/tokens.css`
- `src/styles/global.css`

参考企业探查：

- `EnterpriseExplorationWorkspacePage.vue` 里的初始对话模式 `.edw-chat-only`
- 结果工作区布局 `.edw-workspace-layout`
- 右侧 AI 面板 `.ai-assistant-panel`
- 消息气泡 `.ai-message--ai`、`.ai-message--user`

## 3. 布局状态定义

请在工作台 AI Copilot 二级页面中实现两个主要布局状态。

### 3.1 `chat-center`：居中对话态

适用条件：

- 用户刚从工作台首页输入框进入。
- AI 正在识别意图。
- 尚未生成业务内容。
- 尚未选择或打开具体业务结果。

判断条件可以基于现有 store 字段，也可以新增轻量字段，例如：

```js
layoutMode: 'chat-center' | 'workspace'
```

或：

```js
hasBusinessContent === false
```

视觉要求：

```text
页面顶部：返回工作台 / AI Copilot / 状态 / 清空对话

页面中部：
  居中的 AI 对话面板

页面底部：
  快捷建议
  输入框
```

尺寸建议：

- 中间对话容器宽度：`min(860px, calc(100vw - 96px))`
- 不要只有 360px 或 420px。
- 对话消息区要居中，不要贴左侧。
- 输入框宽度跟随中间对话容器。
- 页面不要显示空的左侧业务内容区。
- 页面不要显示空的右侧产物区。

### 3.2 `workspace`：左内容 + 右对话态

适用条件：

- AI 已经识别到工具并生成结果。
- 左侧已经有业务内容可展示。
- 例如：智能筛客结果、企业探查结果、监控配置、尽调进度、税票采集、资料包、风险诊断、报告编辑入口等。

视觉要求：

```text
左侧：业务内容展示区
右侧：AI 对话面板
```

尺寸建议：

- 左侧内容区：占据剩余主空间。
- 右侧 AI 面板宽度：`360px - 420px`。
- 右侧 AI 面板固定在当前工作区右侧，不要跑到底部。
- 右侧 AI 面板有完整结构：
  - header：AI Copilot / 收起或清空
  - messages：消息区
  - quick actions：快捷建议
  - composer：输入框 + 发送按钮
- 输入框只属于右侧 AI 面板，不要横跨整个页面。

## 4. 需要修改的重点

### 4.1 `WorkbenchPage.vue`：重构二级页布局容器

当前二级页大概率在：

```vue
<div v-else class="workbench-dialog-wrap">
```

请改成带布局状态 class：

```vue
<div
  v-else
  class="workbench-dialog-wrap"
  :class="[
    hasBusinessContent ? 'workbench-dialog-wrap--workspace' : 'workbench-dialog-wrap--chat-center'
  ]"
>
```

`hasBusinessContent` 可以是 computed：

```js
const hasBusinessContent = computed(() => {
  return Boolean(assistant.currentArtifactType || assistant.activeTool || assistant.leftPanelData)
})
```

如果现有 store 没有这些字段，可以先用：

```js
Boolean(assistant.currentArtifactType)
```

但建议为工作台流程新增更清楚的字段，例如 `layoutMode` 或 `businessPanelType`。

### 4.2 居中态结构

居中态建议结构：

```vue
<div v-if="!hasBusinessContent" class="wb-chat-center-layout">
  <section class="wb-chat-center-panel">
    <div class="wb-chat-center-messages">
      <WorkbenchConversation ... />
    </div>

    <div class="wb-chat-composer">
      <div v-if="assistant.contextSuggestions.length" class="wb-suggestion-bar">
        ...
      </div>
      <el-input ... />
    </div>
  </section>
</div>
```

要求：

- `WorkbenchConversation` 在中间大容器中显示。
- 输入框与对话区同宽。
- 快捷建议在输入框上方。
- 不渲染右侧产物区。
- 不渲染左侧业务区。

### 4.3 工作区态结构

工作区态建议结构：

```vue
<div v-else class="wb-workspace-layout">
  <main class="wb-business-panel">
    <WorkbenchArtifactPanel
      :type="assistant.currentArtifactType"
      :data="assistant.artifactData"
      ...
    />
  </main>

  <aside class="wb-ai-side-panel">
    <div class="wb-ai-side-header">
      <span>AI Copilot</span>
      <el-button text size="small" @click="clearChat">清空</el-button>
    </div>

    <div class="wb-ai-side-messages">
      <WorkbenchConversation ... />
    </div>

    <div class="wb-chat-composer">
      <div v-if="assistant.contextSuggestions.length" class="wb-suggestion-bar">
        ...
      </div>
      <el-input ... />
    </div>
  </aside>
</div>
```

要求：

- 左侧业务区是主视觉。
- 右侧 AI 面板像企业探查右侧 AI 助手。
- 输入框在右侧面板底部。
- 快捷建议在右侧输入框上方。
- 不再有页面级横跨全屏的输入框。

### 4.4 内容生成后的触发

请确保从首页输入框发起后：

1. 先进入 `chat-center`。
2. AI 输出“正在识别意图”。
3. 当识别到工具并生成结果后，切换到 `workspace`。
4. 左侧显示业务结果，右侧保留对话。

如果当前 store 已经有 `assistant.sendMessage(text)` 并会生成 `currentArtifactType`，可以基于该字段切换。

如果现有 mock 不完整，请补一个最小可演示流：

```text
用户输入：帮我筛选深圳的软件企业
AI：识别到智能筛客工具，正在生成结果
切换 workspace
左侧：显示筛客结果表
右侧：AI 提示“已生成筛客结果，请在左侧选择企业继续探查”
```

## 5. `WorkbenchConversation.vue` 要求

请让同一个对话组件能适配两种宽度：

- 居中态：宽容器，消息不散，气泡最大宽度合理。
- 右侧态：窄容器，消息紧凑，不溢出。

要求：

- AI 消息在左。
- 用户消息在右。
- AI 头像显示 `AI`。
- 用户头像显示 `张` 或 `我`，不要乱码。
- AI 气泡浅色背景。
- 用户气泡主蓝色背景。
- 气泡最大宽度：
  - 居中态：AI 约 70%，用户约 60%。
  - 右侧态：AI 约 86%，用户约 76%。
- 流程卡片不要撑满整页。

可以通过父级 class 控制：

```css
.workbench-dialog-wrap--chat-center .bubble.ai { max-width: 70%; }
.workbench-dialog-wrap--chat-center .bubble.user { max-width: 60%; }
.workbench-dialog-wrap--workspace .bubble.ai { max-width: 86%; }
.workbench-dialog-wrap--workspace .bubble.user { max-width: 76%; }
```

## 6. Element Plus 组件要求

UI 必须使用 Element Plus 组件来承载主要控件：

- 输入框：`el-input`
- 发送按钮：`el-button`
- 标签：`el-tag`
- 业务结果表：`el-table`
- 结果卡片：`el-card`
- 状态提示：`el-alert`
- 进度：`el-progress`
- 步骤：`el-steps`
- 表单配置：`el-form`

不要自己写大量原生控件替代 Element Plus。

## 7. 全局风格要求

保持和企业探查一致：

- 背景用浅灰 `var(--surface-page)`。
- 卡片用白色 `var(--surface-card)`。
- 边框轻，阴影轻。
- 操作按钮以蓝色主色为主。
- 信息密度偏工作台，不要营销页风。
- 不要大圆角浮夸卡片。
- 不要渐变大背景。
- 不要额外装饰图形。

## 8. 不要做的事

- 不要把右侧对话面板放到左侧。
- 不要在有内容后继续让对话居中占满主画布。
- 不要在无内容时显示空业务内容区。
- 不要让输入框横跨整个工作区。
- 不要同时出现两个输入框。
- 不要重写企业探查页面。
- 不要启用 `GlobalInputBar`。
- 不要接真实后端。
- 不要新增依赖。

## 9. 验收场景

完成后运行：

```bash
npm run build
```

请检查：

### 场景 1：初始进入

从工作台首页输入：

```text
帮我筛选深圳的软件企业
```

期望：

- 进入 AI Copilot 后，对话在页面中间。
- 没有左侧空内容区。
- 没有右侧空产物区。
- 输入框在中间对话面板底部。
- 整体效果接近参考图 3。

### 场景 2：生成内容后

AI 识别并生成筛客结果后：

- 页面切换为左右布局。
- 左侧显示业务内容。
- 右侧显示 AI 对话面板。
- 右侧对话面板包含消息区、快捷建议、输入框。
- 输入框不再横跨页面。
- 整体效果接近参考图 2。

### 场景 3：继续对话

在右侧 AI 面板继续输入：

```text
探查第一家企业
```

期望：

- 左侧业务内容切换或更新为企业探查内容。
- 右侧继续追加 AI 对话。
- 布局仍保持左内容、右对话。

### 场景 4：视觉检查

- AI 消息左侧，用户消息右侧。
- 页面无明显横向溢出。
- 不出现两个输入框。
- 不出现右侧空白大面板。
- 不出现输入框漂在错误区域。

## 10. 最终回复

完成后请回复：

1. 修改了哪些文件。
2. 如何判断“居中对话态”和“工作区态”。
3. 生成内容后如何切换到左内容 + 右对话。
4. 输入框现在分别位于哪里。
5. 是否使用 Element Plus 组件。
6. 是否通过 `npm run build`。

请优先把布局转场做准，业务内容可以先用 mock 高保真展示。
