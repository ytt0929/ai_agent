# OpenClaw 完整输入：企业探查右侧对话面板布局错乱修复 v3

```text
你是 VUE 前端工程师，请在 D:\demo\ai-copilot 项目中修复“企业探查”工作区右侧 AI 探查助手对话面板布局错乱问题。

请先阅读以下文件，不要直接猜结构：

1. src/pages/EnterpriseExplorationWorkspacePage.vue
2. src/styles/tokens.css
3. src/pages/EnterpriseDiagnosisListPage.vue

本次主要修改文件：

- src/pages/EnterpriseExplorationWorkspacePage.vue

如非必要，不要修改其他文件。不要修改业务数据、mock 数据、路由、菜单、侧边栏、企业探查首页内容、首页查询示例、中文文案。

重要说明：

这次不要只补 CSS。请先理解 src/pages/EnterpriseExplorationWorkspacePage.vue 里的消息 DOM 结构，再修。

上一版没有改好的根因是：

1. 右侧 AI 探查助手面板里，每条消息的 DOM 结构不统一。
2. msg.actions 当前被渲染成 .ai-message__bubble 的兄弟节点，而不是对应 AI 消息内容的一部分。
3. 因为 actions 是独立兄弟节点，“查看证据链 / 生成专项说明 / 加入报告 / 加入尽调任务 / 上传流水”等按钮会漂成一列，独立挤在消息流中间。
4. 后续 AI 回复，例如“正在查看「风险诊断」。”，会被这列 actions 挤到右侧窄列里，变成很窄的竖条。
5. CSS 里还使用了 flex-direction: row-reverse 和 align-self:flex-end，在右侧窄面板中会进一步导致用户消息、AI 消息、actions 互相挤压。
6. 所以上一版如果只是调 max-width、margin-left、align-self 等 CSS，无法修复根因。必须调整右侧消息 DOM，让 actions 跟随对应 AI 消息。

当前截图中的具体问题：

1. 右侧 AI 探查助手面板中，“查看证据链 / 生成专项说明 / 加入报告 / 加入尽调任务 / 上传流水”等按钮被渲染成一列，独立漂在消息流中间。
2. “正在查看「风险诊断」。”这类 AI 回复气泡被挤到右侧窄列，看起来像用户消息旁的小竖条。
3. 用户消息“诊断报告”“诊断分析”虽然在右侧，但会和 actions、AI 回复互相占位。
4. AI 头像、按钮组、AI 回复气泡没有形成同一条 AI 消息，导致一条逻辑消息被拆成多个 flex 子元素。
5. 面板滚动区和消息布局不稳定，越往下越乱。

必须修复的根因：

把右侧 AI 面板消息渲染改成“每条 chatMessages 只对应一个 .ai-message 根节点”。头像、气泡、engine 卡、actions 都必须在同一条消息内部，不要让 actions 成为 .edw-chat-messages 的直接子级或与 bubble 同层漂浮的独立块。

请在 src/pages/EnterpriseExplorationWorkspacePage.vue 中重点修改右侧面板这段模板：

- aside class="edw-chat-panel ai-assistant-panel"
- .edw-chat-messages.ai-assistant-panel__messages 内部的 v-for

当前结构大概是：

<div v-for="(msg, i) in chatMessages" :key="i" class="ai-message" :class="...">
  <template v-if="msg.role === 'ai' || msg.type === 'engine'">
    <div class="ai-message__avatar">AI</div>
  </template>
  <div class="ai-message__bubble" v-if="msg.type !== 'engine'" v-html="renderMd(msg.text)"></div>
  <div v-if="msg.type === 'engine'" class="edw-engine-card">...</div>
  <div v-if="msg.role === 'ai' && msg.actions" class="ai-message__actions">...</div>
  <template v-if="msg.role === 'user'">
    <div class="ai-message__avatar">我</div>
  </template>
</div>

这个结构必须改。请改成稳定结构，类似下面这样。注意：保持现有变量名、方法名、按钮点击逻辑不变。

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
      <div class="edw-engine-card">
        保留当前 edw-engine-card 内部已有内容，不要改文案，不要改 engineSteps 逻辑。
      </div>
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

请新增或复用一个 helper：

function messageClass(msg) {
  return msg.role === 'user' ? 'ai-message--user' : 'ai-message--ai'
}

如果你不想新增 helper，也可以保留 class 表达式，但必须保证：

- 用户消息 class 是 ai-message--user
- AI 普通消息 class 是 ai-message--ai
- engine 消息 class 也是 ai-message--ai

右侧面板 CSS 必须同步修复。

请在 src/pages/EnterpriseExplorationWorkspacePage.vue 的 <style scoped> 中检查并修复这些样式：

1. .edw-chat-messages.ai-assistant-panel__messages .ai-message 必须是 width:100%; display:flex; align-items:flex-start。
2. 不要再用 flex-direction: row-reverse 实现用户消息。
3. 不要用 align-self:flex-end 把整条用户消息推到不可控位置。
4. 用户消息改用 justify-content:flex-end，并用 order 控制头像与内容顺序。
5. AI 消息用 justify-content:flex-start。
6. 新增 .ai-message__content，作为气泡和 actions 的纵向容器。
7. actions 必须在 .ai-message__content 内部正常换行，不要用 margin-left:36px 之类脱离消息结构的写法。

推荐 CSS 结构如下，可按现有 token 微调，但语义必须保持：

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

.edw-chat-messages.ai-assistant-panel__messages .ai-message__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  max-width: calc(100% - 40px);
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__avatar {
  order: 0;
  background: var(--color-primary);
  color: #fff;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__content {
  order: 1;
  align-items: flex-start;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__content {
  order: 0;
  max-width: 76%;
  align-items: flex-end;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__avatar {
  order: 1;
  background: var(--surface-page);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__bubble {
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__bubble {
  background: var(--surface-page);
  border: 1px solid var(--border-light);
  border-top-left-radius: 4px;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__bubble {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-top-right-radius: 4px;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  max-width: 100%;
  align-self: flex-start;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__bubble--engine {
  width: 100%;
}

.edw-chat-messages.ai-assistant-panel__messages .edw-engine-card {
  width: 100%;
  max-width: 100%;
}

请删除或覆盖这些旧样式，不能继续生效：

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai {
  flex-direction: row;
  align-self: flex-start;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__actions {
  margin-left: 36px;
  margin-top: -6px;
  margin-bottom: 6px;
}

右侧面板容器要求：

1. .edw-chat-panel.ai-assistant-panel 保持 display:flex; flex-direction:column; overflow:hidden。
2. 右侧面板宽度建议 360px-420px，不能被内容撑宽或挤窄。
3. .edw-chat-messages.ai-assistant-panel__messages 保持 flex:1; min-height:0; overflow-y:auto。
4. .edw-chat-input.ai-assistant-panel__footer 保持 flex-shrink:0，固定在面板底部。
5. 不要让右侧面板内部出现横向滚动。

阶段 A 对话发起页也要检查，但不是这次核心：

- v-if="!workspaceActive"
- class="edw-chat-only"

如果阶段 A 仍有“用户消息飞到整个页面最右侧”或“AI 气泡窄成一个字”的问题，可以用同样原则修：

1. 每条消息 width 限制在对话容器内部。
2. 用户消息用 justify-content:flex-end，不要飞到 viewport 最右。
3. AI 和用户气泡都要有合理 max-width。
4. 不要改底部输入框内容，不要新增查询示例。

不要改：

1. 不要修改浏览器里正常显示的中文文案。
2. 不要做乱码修复，终端乱码忽略，浏览器中文正常。
3. 不要修改 EnterpriseDiagnosisListPage.vue 的首页内容和交互。
4. 不要修改 sendChat、runExploreFlow、classifyQuestion、onMsgAction 的业务逻辑。
5. 不要修改 mock 数据。
6. 不要修改 AppSidebar、路由、store 数据结构。
7. 不要新增依赖。

验收方式：

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
   - “查看证据链 / 生成专项说明 / 加入报告 / 加入尽调任务 / 上传流水”按钮跟随对应 AI 回复，在同一条 AI 消息内部，不再独立漂浮成一列。
   - “正在查看「风险诊断」。”不再被挤成右侧窄竖条，而是在 AI 消息区域正常显示。
   - 用户消息“诊断分析”在面板内右侧，不被 actions 区挤压。
   - 右侧面板没有横向溢出。
   - 底部输入框仍固定在右侧面板底部。
   - 浏览器控制台无新增 error。
```
