# OpenClaw Prompt: Phase 2 Batch 4D-9 AI 面板与对话体验统一修复

你是资深全栈前端工程师、资深 UX/UI 工程师，并理解银行客户经理的企业探查、智能尽调和企业风险分析场景。

项目路径：`D:\demo\ai-copilot`

请只读取本提示词，不要读取旧提示词文件。

## 阶段定位

当前仍属于第二阶段 Batch 4D：企业探查与相关 AI 对话面板体验收口。

本轮不是重新设计企业探查产品，也不是继续新增报告能力。本轮只做一个明确补丁：

统一所有页面的 AI 对话面板格式，去掉全局底部浮动输入框，并修复子页面里 AI 和用户消息都挤在左侧的问题。

## 重要限制

- 不要重构业务流程。
- 不要改路由结构。
- 不要改 store 数据结构。
- 不要新增依赖。
- 不要恢复全局 `GlobalInputBar`。
- 不要再新增第二套 AI 面板样式。
- 不要处理中文编码问题，浏览器中中文显示正常。
- 不要修改与本轮无关的业务页面内容。

本轮允许修改：

- `src/App.vue`
- `src/styles/tokens.css`
- `src/components/DueChatPanel.vue`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/pages/EnterpriseDiagnosisPage.vue`
- `src/pages/EnterpriseDiagnosisEvidencePage.vue`
- 如确实有同类 AI 面板，可少量修改对应页面的面板 class。

## 当前问题

1. 部分页面底部仍出现全局悬浮输入框，和页面自身右侧 AI 面板重复，遮挡内容，尤其智能尽调详情和企业探查页面很明显。
2. AI 对话面板格式不统一：
   - 智能尽调、企业探查、企业诊断、证据链详情页的头部、消息区、快捷按钮、输入区样式不一致。
   - 有些页面输入框是纸飞机图标，有些是文字按钮，有些按钮宽度和位置不统一。
3. 子页面右侧 AI 面板中，AI 消息和用户消息都显示在左侧。
   - 正确效果应该是：AI 在左侧，用户输入在右侧。
4. `EnterpriseExplorationWorkspacePage.vue` 里有 scoped CSS 覆盖 `.ai-message--user`，例如 `row-reverse`，导致用户头像和气泡位置混乱。
5. `EnterpriseDiagnosisEvidencePage.vue` 的 AI 面板结构不够统一，输入区甚至出现在消息区之前，和其他页面体验不一致。

## 目标效果

完成后，所有 AI 对话面板应该像同一个组件体系：

- 面板结构统一：头部、消息区、快捷操作区、底部输入区。
- AI 消息永远在左侧：
  - 左侧头像显示 `AI`
  - 右侧是浅色气泡
- 用户消息永远在右侧：
  - 用户气泡靠右
  - 头像 `我` 在气泡右侧
- 消息气泡宽度合理：
  - AI 气泡最大宽度约 82%
  - 用户气泡最大宽度约 70%-76%
- 快捷操作按钮只跟随 AI 回复，不要挤压用户消息。
- 底部输入区统一使用输入框 + 发送按钮。
- 不再出现全局底部悬浮输入框。

## 具体修改

### 1. 确认移除全局浮动输入框

检查 `src/App.vue`：

- 不要挂载 `GlobalInputBar`。
- 不要 import `GlobalInputBar`。
- 页面只保留侧边栏和 `router-view`。

如果 `GlobalInputBar.vue` 文件仍存在，可以保留文件，不要删除，但不要在全局使用。

### 2. 统一全局 AI 面板样式

在 `src/styles/tokens.css` 中，以现有 `.ai-assistant-panel` 和 `.ai-message` 为唯一公共标准。

确保这些类存在并可用：

- `.ai-assistant-panel`
- `.ai-assistant-panel__header`
- `.ai-assistant-panel__title`
- `.ai-assistant-panel__body`
- `.ai-assistant-panel__messages`
- `.ai-assistant-panel__quick`
- `.ai-assistant-panel__footer`
- `.ai-assistant-panel__input`
- `.ai-assistant-panel__send`
- `.ai-message`
- `.ai-message--ai`
- `.ai-message--user`
- `.ai-message__avatar`
- `.ai-message__bubble`
- `.ai-message__actions`

消息左右布局必须按下面逻辑实现：

```css
.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.ai-message--ai {
  justify-content: flex-start;
}

.ai-message--user {
  justify-content: flex-end;
}

.ai-message--ai .ai-message__avatar {
  order: 0;
}

.ai-message--ai .ai-message__bubble {
  order: 1;
  max-width: 82%;
}

.ai-message--user .ai-message__bubble {
  order: 0;
  max-width: 76%;
}

.ai-message--user .ai-message__avatar {
  order: 1;
}
```

注意：

- 优先使用 `order` 控制左右顺序。
- 不要再用 `row-reverse` 修用户消息位置。
- 用户消息靠右不是靠 `margin-left` 硬挤，而是用 `.ai-message--user { justify-content: flex-end; }`。

### 3. 清理页面 scoped CSS 覆盖

检查并修改：

- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/pages/EnterpriseDiagnosisEvidencePage.vue`
- `src/pages/EnterpriseDiagnosisPage.vue`
- `src/components/DueChatPanel.vue`

要求：

- 删除或弱化页面 scoped CSS 中对 `.ai-message--user`、`.ai-message--ai`、`.ai-message__avatar`、`.ai-message__bubble` 的重复覆盖。
- 特别删除 `flex-direction: row-reverse`。
- 页面可以保留面板高度、宽度、padding，但消息左右布局必须交给 `tokens.css` 的公共类控制。

### 4. 统一消息 DOM 结构

所有 AI 面板消息循环统一使用类似结构：

```vue
<div class="ai-message" :class="msg.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'">
  <div class="ai-message__avatar">{{ msg.role === 'ai' ? 'AI' : '我' }}</div>
  <div class="ai-message__bubble">
    <div>{{ msg.text }}</div>
    <div v-if="msg.actions?.length" class="ai-message__actions">
      <!-- action buttons -->
    </div>
  </div>
</div>
```

不要让 AI 和用户使用两套不同 DOM。
不要把用户头像单独放在另一层外面。
不要让 action buttons 跳出 AI 气泡区域太远。

### 5. 修复证据链详情页 AI 面板

重点检查 `src/pages/EnterpriseDiagnosisEvidencePage.vue`：

- AI 面板应为：
  - header
  - messages
  - quick actions
  - footer input
- 输入区必须在底部，不要放在消息区上方。
- AI 消息左侧，用户消息右侧。
- 子页面宽度较窄时，用户气泡不要铺满整行，最大宽度控制在 70%-76%。

### 6. 统一发送按钮

所有 AI 面板底部发送按钮统一使用 `.ai-assistant-panel__send`。

可以是文字“发送”，不要混用纸飞机圆形按钮和文字按钮。

按钮要求：

- 高度和输入框一致。
- disabled 状态清晰。
- 不要溢出面板。

## 不要修改

- 不要改企业探查的业务分支逻辑。
- 不要新增报告页面。
- 不要修改智能尽调流程步骤。
- 不要修改 mock 数据。
- 不要为了修样式改路由。
- 不要把 AI 面板改成抽屉。
- 不要把右侧 AI 面板移到左侧。

## 验收标准

完成后运行：

```bash
npm run build
```

页面验收：

1. 智能尽调详情页：
   - 不再出现底部全局浮动输入框。
   - 右侧尽调对话面板输入区在面板底部。
   - AI 左侧，用户右侧。

2. 企业探查工作台：
   - 不再出现全局底部浮动输入框。
   - 对话面板格式与其他页面一致。
   - AI 消息左侧，用户消息右侧。

3. 企业诊断报告页：
   - 右侧 AI 风险研究助手使用统一消息样式。
   - 用户消息不再出现在左侧。

4. 证据链详情页：
   - 右侧 AI 面板中，AI 在左，用户在右。
   - 输入区在底部。
   - 消息气泡宽度不挤压、不溢出。

5. 全局：
   - `App.vue` 不再挂载 `GlobalInputBar`。
   - 页面没有两个输入框同时出现。
   - 构建通过，没有 Vue 模板错误。

完成后回复：

- 修改了哪些文件。
- 统一了哪些 AI 面板。
- 是否删除了全局浮动输入框挂载。
- `npm run build` 结果。
