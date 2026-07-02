# OpenClaw Prompt: 企业探查右侧对话面板布局错乱修复 v2

下面内容直接复制到 openClaw 对话框使用。

```text
你是 VUE 前端工程师，请在 D:\demo\ai-copilot 项目中修复“企业探查”工作区右侧 AI 探查助手对话面板布局错乱问题。

这次不要只补 CSS。请先读代码并理解 DOM 结构，因为上一版提示词没有改好，核心原因是：
1. src/pages/EnterpriseExplorationWorkspacePage.vue 里每条消息的 DOM 结构不统一。
2. msg.actions 当前是 .ai-message 的兄弟节点，而不是对应 AI 气泡内部或对应 AI 消息块内部。
3. 因为 actions 独立存在，右侧面板里会出现“按钮列”和“AI 回复气泡”分离，后续消息被挤到窄列，形成截图里的错乱。
4. CSS 里还使用了 flex-direction: row-reverse 和 align-self:flex-end，让用户消息、AI 消息和 actions 在窄面板中互相挤压。
5. 所以上一版只要求“actions 跟随 AI 回复”但没有强制修改模板结构，openClaw 很可能只调了宽度/对齐，根因仍然存在。

请先阅读这些文件：
1. src/pages/EnterpriseExplorationWorkspacePage.vue
2. src/styles/tokens.css
3. src/pages/EnterpriseDiagnosisListPage.vue

主要修改文件：
- src/pages/EnterpriseExplorationWorkspacePage.vue

如非必要不要修改其他文件。不要改业务数据、路由、store、首页内容、中文文案。

当前截图里的具体问题：
1. 右侧 AI 探查助手面板中，“查看证据链 / 生成专项说明 / 加入报告 / 加入尽调任务 / 上传流水”等按钮被渲染成一列，独立漂在消息流中间。
2. “正在查看「风险诊断」。”这类 AI 回复气泡被挤到右侧窄列，看起来像用户消息旁的小竖条。
3. 用户消息“诊断报告”“诊断分析”虽然在右侧，但会和 actions、AI 回复互相占位。
4. AI 头像、按钮组、AI 回复气泡没有形成同一条 AI 消息，导致一条逻辑消息被拆成多个 flex 子元素。
5. 面板滚动区和消息布局不稳定，越往下越乱。

必须修复的根因：
把右侧 AI 面板消息渲染改成“每条 chatMessages 只对应一个 .ai-message 根节点”，不要让 actions 成为独立的兄弟节点。

请在 src/pages/EnterpriseExplorationWorkspacePage.vue 中重点修改这段模板：
- 右侧面板：
  .edw-chat-messages.ai-assistant-panel__messages 内部的 v-for

当前结构大概是：
<div v-for="msg" class="ai-message">
  <template v-if="msg.role === 'ai' || msg.type === 'engine'">
    <div class="ai-message__avatar">AI</div>
  </template>
  <div class="ai-message__bubble" v-if="msg.type !== 'engine'" ...></div>
  <div v-if="msg.type === 'engine'" class="edw-engine-card">...</div>
  <div v-if="msg.role === 'ai' && msg.actions" class="ai-message__actions">...</div>
  <template v-if="msg.role === 'user'">
    <div class="ai-message__avatar">我</div>
  </template>
</div>

这个结构的问题是 actions 和 bubble 同级，engine 卡也不在 bubble 内，用户头像靠 template 放到末尾，再配合 row-reverse 容易错乱。

请改成类似下面的稳定结构。注意保持现有变量名、方法名、按钮点击逻辑不变：

<div
  v-for="(msg, i) in chatMessages"
  :key="i"
  class="ai-message"
  :class="messageClass(msg)"
>
  <div class="ai-message__avatar">
    {{ msg.role === 'user' ? '我' : 'AI' }}
  </div>

  <div class="ai-message__content">
    <div
      v-if="msg.type !== 'engine'"
      class="ai-message__bubble"
      v-html="renderMd(msg.text)"
    ></div>

    <div v-else class="ai-message__bubble ai-message__bubble--engine">
      <!-- 保留现有 edw-engine-card 内容 -->
      <div class="edw-engine-card">...</div>
    </div>

    <div
      v-if="msg.role === 'ai' && msg.actions"
      class="ai-message__actions"
    >
      <el-button
        v-for="a in msg.actions"
        :key="a.label"
        size="small"
        text
        :type="a.type || 'primary'"
        @click="onMsgAction(a)"
      >
        {{ a.label }}
      </el-button>
    </div>
  </div>
</div>

如果不想新增 messageClass，也可以直接保留现有 class 表达式，但必须保证：
- user 消息 class 是 ai-message--user
- AI 普通消息和 engine 消息 class 都是 ai-message--ai

推荐新增 helper：
function messageClass(msg) {
  return msg.role === 'user' ? 'ai-message--user' : 'ai-message--ai'
}

注意：
1. 右侧面板和阶段 A 对话页都用了类似 v-for，但本次重点是右侧面板。
2. 如果你同步修阶段 A，可以用同样结构，但不要改业务流程，不要新增示例，不要改输入框内容。
3. 不要把 actions 放到 .edw-chat-messages 的直接子级。
4. 不要让 actions 独立于对应 AI 消息。

CSS 必须配合改：

请在 src/pages/EnterpriseExplorationWorkspacePage.vue 的 <style scoped> 中修复右侧面板样式。

关键要求：
1. .edw-chat-messages.ai-assistant-panel__messages .ai-message 必须 width:100%，display:flex。
2. 不要再用 flex-direction: row-reverse 来实现用户消息。改用 justify-content 和 order。
3. AI 消息：
   - justify-content:flex-start
   - avatar order:0
   - content order:1
   - content max-width: calc(100% - 40px)
4. 用户消息：
   - justify-content:flex-end
   - content order:0
   - avatar order:1
   - content max-width: 76%
5. .ai-message__content 是垂直容器：
   - display:flex
   - flex-direction:column
   - gap:6px
   - min-width:0
6. .ai-message__bubble：
   - width:auto
   - max-width:100%
   - white-space:normal
   - overflow-wrap:anywhere 或 word-break:break-word
7. .ai-message__actions：
   - display:flex
   - flex-wrap:wrap
   - gap:6px
   - margin:0
   - padding-left:0
   - max-width:100%
   - align-self:flex-start
8. 不要让 .ai-message__actions 使用 margin-left:36px 这类脱离 message content 的写法。
9. engine 卡在 .ai-message__bubble--engine 内部，宽度 100%，不要超出消息 content。

建议 CSS 示例：

.edw-chat-messages.ai-assistant-panel__messages .ai-message {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai {
  justify-content: flex-start;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user {
  justify-content: flex-end;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  max-width: calc(100% - 40px);
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__content {
  order: 0;
  max-width: 76%;
  align-items: flex-end;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__avatar {
  order: 1;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__avatar {
  order: 0;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__content {
  order: 1;
  align-items: flex-start;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__bubble {
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  max-width: 100%;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__bubble--engine {
  width: 100%;
}

同时检查并删除/覆盖这些旧样式：
- .edw-chat-messages.ai-assistant-panel__messages .ai-message--user { flex-direction: row-reverse; align-self:flex-end; }
- .edw-chat-messages.ai-assistant-panel__messages .ai-message__actions { margin-left:36px; margin-top:-6px; ... }

面板结构要求：
1. .edw-chat-panel.ai-assistant-panel 保持 display:flex; flex-direction:column; overflow:hidden。
2. .edw-chat-messages.ai-assistant-panel__messages 保持 flex:1; min-height:0; overflow-y:auto。
3. .edw-chat-input.ai-assistant-panel__footer 保持 flex-shrink:0。
4. 不要让右侧面板内部横向滚动。

不要改：
1. 不要修改中文文案。
2. 不要做乱码修复，终端乱码忽略，浏览器中文正常。
3. 不要修改 EnterpriseDiagnosisListPage.vue 的首页内容。
4. 不要修改 sendChat、runExploreFlow、classifyQuestion、onMsgAction 的业务逻辑。
5. 不要修改 mock 数据。
6. 不要新增依赖。

验收：
完成后运行：
npm run build

浏览器检查：
1. 打开 /enterprise-diagnosis/workspace/_new?q=查看股东明细。
2. 输入“唐山物桥商贸有限公司”并发送，等待进入结果工作区。
3. 在右侧 AI 探查助手中继续点击或输入：
   - 查看股东明细
   - 诊断报告
   - 诊断分析
4. 预期结果：
   - AI 消息在左侧，用户消息在右侧。
   - “查看证据链 / 生成专项说明 / 加入报告 / 加入尽调任务 / 上传流水”按钮跟随对应 AI 回复，不再独立漂浮成一列。
   - “正在查看「风险诊断」。”不再被挤成右侧窄竖条，而是在 AI 消息区域正常显示。
   - 用户消息“诊断分析”在面板内右侧，不被 actions 区挤压。
   - 右侧面板没有横向溢出，底部输入框仍固定在底部。
   - 浏览器控制台无新增 error。
```

## 为什么上一版提示词没有改好

上一版提示词虽然提到了“actions 跟随 AI 回复”，但仍留了“如果不改 DOM，则至少用 CSS 修复”的退路。实际错乱的根因不是单纯宽度或 `max-width`，而是模板结构本身把 `.ai-message__actions` 放成了 `.ai-message__bubble` 的兄弟节点，再叠加 `row-reverse`、`align-self:flex-end` 和面板窄宽度，导致 actions、AI 回复气泡、用户消息共同参与同一层 flex 排版，互相挤压。

所以 v2 必须强制 openClaw 修改右侧消息 DOM：

- 一条消息只对应一个 `.ai-message`
- 头像、内容、气泡、actions 都包在同一条消息内部
- actions 放进 `.ai-message__content`，不能继续作为独立漂浮元素
- 用户消息用 `order` 和 `justify-content` 控制左右，不再依赖 `row-reverse`

这样才能从根上修复截图中的“按钮列漂浮”和“AI 回复被挤成窄竖条”。
