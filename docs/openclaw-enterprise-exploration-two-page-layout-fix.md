# OpenClaw Prompt: 企业探查两个工作区页面错乱修复

下面内容直接复制到 openClaw 对话框使用。

```text
你是 VUE 前端工程师，请在 D:\demo\ai-copilot 项目中修复“企业探查”工作区两个页面/状态的布局错乱问题。

请先阅读这些文件，不要直接猜：
1. src/pages/EnterpriseExplorationWorkspacePage.vue
2. src/pages/EnterpriseDiagnosisListPage.vue
3. src/styles/tokens.css

如果需要对照智能筛客输入区样式，可只读：
4. src/pages/ScreeningInitialPage.vue

本次主要修复文件：
- src/pages/EnterpriseExplorationWorkspacePage.vue

如非必要，不要改其他文件。尤其不要修改业务数据、mock 数据、路由结构、菜单、侧边栏、企业探查首页内容。

背景：
企业探查工作区现在有两个状态错乱：

问题一：/enterprise-diagnosis/workspace/_new?q=... 对话发起阶段错乱
- 用户输入企业名称后，用户气泡被推到页面最右侧，中间留出巨大空白。
- AI 回复区域有时只出现一个很窄的气泡，例如只显示“已”，气泡宽度和内容被挤压。
- 阶段 A 是全屏对话页，但消息流没有控制最大宽度和左右对齐，视觉上散开。

问题二：识别企业后进入结果工作区，右侧 AI 探查助手面板错乱
- 右侧面板里用户消息贴在顶部并被遮挡/挤压。
- AI 消息、流程卡、快捷操作按钮、后续回复混在一起。
- action buttons（查看证据链、生成专项说明、加入报告、上传流水）不应该像独立消息一样挤占主消息流。
- 右侧面板应是稳定的三段结构：header、messages、footer input；messages 内部滚动，footer 固定在底部。
- AI 在左、用户在右，头像和气泡顺序必须稳定。

修复目标：

一、阶段 A：对话发起页
对应模板：
- v-if="!workspaceActive"
- class="edw-chat-only"
- 消息循环使用 chatMessages
- 底部输入区 class="edw-chat-only__input"

要求：
1. 页面整体仍保持对话发起页，不要改成卡片首页，不要新增查询示例。
2. 消息流区域居中，最大宽度建议 760px-860px。
3. AI 消息靠左，用户消息靠右，但用户消息不能飞到整个页面最右侧。
4. 用户消息右对齐应限制在消息容器内部，而不是 viewport 最右边。
5. AI 气泡最大宽度约 72%-82%，用户气泡最大宽度约 60%-72%。
6. engine 流程卡作为 AI 消息内容出现，宽度跟 AI 气泡区域一致，不要变成超窄块。
7. 底部输入区仍然是原来的 el-input + 发送按钮，固定在对话页底部附近，不要改内容。

建议实现：
- 给 .edw-chat-only 增加稳定布局：
  - height: calc(100vh - 80px)
  - overflow-y: auto
  - padding
- 给消息流增加一个内部容器更好；如果不想改 DOM，可用 .edw-chat-only .ai-message 约束：
  - width: min(100%, 820px)
  - margin-left/right auto
- .edw-chat-only .ai-message--user 使用 justify-content: flex-end，不要用页面级 align-self 导致飞到右边。
- 删除或覆盖 row-reverse 带来的异常宽度问题，优先用 order 控制头像和气泡顺序。

二、阶段 B：结果工作区右侧 AI 面板
对应模板：
- v-else class="edw-workspace-layout"
- aside class="edw-chat-panel ai-assistant-panel"
- .edw-chat-messages.ai-assistant-panel__messages
- .edw-chat-input.ai-assistant-panel__footer

要求：
1. 左侧工作区和右侧 AI 面板稳定左右布局。
2. 右侧 AI 面板宽度建议 360px-420px，不能被内容撑宽或挤窄。
3. 右侧面板 header 固定顶部，footer input 固定底部，messages 独立滚动。
4. 用户消息在右侧，但必须在面板内部右对齐，不能越界、不能被 header 遮挡。
5. AI 消息在左侧，头像 AI 在左，气泡在右。
6. 用户头像“我”在气泡右侧，气泡不超过面板宽度 70%-76%。
7. engine 流程卡在 AI 消息区域内显示，不要铺满整个面板，也不要被压成窄条。
8. msg.actions 应跟随对应 AI 回复显示，建议放在 AI 气泡下方同一消息块内，或至少缩进到 AI 气泡区域，不要独立漂在中间。
9. 快捷操作按钮可以换行，但不能覆盖其他消息，不能把后续 AI 气泡挤到右侧窄列。

建议实现：
- 统一消息 DOM 结构时要小心，不要大改业务逻辑。
- 如果改 DOM，推荐把 actions 放进 AI bubble 内部：
  <div class="ai-message__bubble">
    <div v-html="renderMd(msg.text)"></div>
    <div v-if="msg.role === 'ai' && msg.actions" class="ai-message__actions">...</div>
  </div>
- 如果不改 DOM，则至少用 CSS 修复 .ai-message__actions：
  - width: 100%
  - margin-left: 36px 或 38px
  - max-width: calc(100% - 38px)
  - display:flex; flex-wrap:wrap
- .edw-chat-messages.ai-assistant-panel__messages .ai-message 必须 width: 100%。
- .ai-message--user 使用 justify-content:flex-end。
- 不要依赖 align-self 把整个消息挤到外层最右。

三、不要改的内容
1. 不要修改浏览器里正常显示的中文文案。
2. 不要做乱码修复，终端乱码可以忽略，浏览器中文是正常的。
3. 不要修改 EnterpriseDiagnosisListPage.vue 的首页内容和交互。
4. 不要修改企业探查首页的查询示例文案。
5. 不要修改 sendChat、runExploreFlow、classifyQuestion 的业务逻辑，除非为了修复 DOM 结构必须轻微调整消息渲染。
6. 不要新增依赖。
7. 不要修改 AppSidebar、路由、store 数据结构。

四、验收方式
完成后运行：
npm run build

浏览器检查：
1. 打开 /enterprise-diagnosis/workspace/_new?q=查看股东明细。
2. 输入“唐山物桥商贸有限公司”并发送。
3. 对话阶段中：
   - 用户气泡在对话容器内部右侧，不飞到整个屏幕最右。
   - AI 回复气泡不会只剩一个很窄的“已”。
   - AI 流程卡宽度正常。
4. 等待进入结果工作区：
   - 左侧企业概览正常显示。
   - 右侧 AI 探查助手面板不遮挡、不溢出。
   - 用户消息在面板内右侧，AI 消息在左侧。
   - 快捷操作按钮不挤压后续文本气泡。
   - 底部输入框固定在右侧面板底部。
5. 页面无 Vue 编译错误，浏览器控制台无新增 error。
```
