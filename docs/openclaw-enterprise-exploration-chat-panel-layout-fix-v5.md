# 企业探查右侧 AI 面板布局修复 v5

## 放到 openClaw 输入框的内容

你是资深 Vue 前端工程师和资深 UI/UX 工程师。请在 D:\demo\ai-copilot 项目中执行以下任务：

1. 先完整阅读：
D:\demo\ai-copilot\docs\openclaw-enterprise-exploration-chat-panel-layout-fix-v4-copy-direct.txt

2. 严格按照该文件要求修复企业探查工作区右侧 AI 探查助手面板，重点解决：
- 右侧 AI 面板消息布局错乱；
- actions 按钮组不能独立漂浮成一列；
- “查看证据链 / 生成专项说明 / 加入报告 / 加入尽调任务 / 上传流水”等按钮必须跟随对应 AI 回复；
- AI 回复气泡不能被挤成右侧窄竖条；
- 用户消息在右侧、AI 消息在左侧，必须都限制在右侧面板内部；
- 右侧 AI 面板 header 固定、消息区独立滚动、底部输入固定；
- 每条 chatMessages 只能对应一个 .ai-message 根节点；
- 头像、气泡、engine 卡、actions 必须在同一条消息内部；
- 不要继续使用 row-reverse 和脱离消息结构的 margin-left 来硬推布局；
- 不要新增依赖；
- 不要修改企业探查首页内容；
- 不要修改中文文案；
- 不要做乱码修复；
- 不要修改企业探查业务逻辑、mock 数据、路由或 store 结构；
- 不要出现横向滚动条、双输入框或右侧面板内容溢出。

3. 修改完成后运行：
npm run build

4. 最终回复：
- 修改了哪些文件；
- 右侧 AI 面板消息 DOM 结构如何调整；
- actions 按钮组现在放在哪个容器内；
- 如何保证用户消息和 AI 消息不会互相挤压；
- 右侧 AI 面板的滚动容器是哪一个；
- 是否保留 header 固定、messages 独立滚动、footer input 固定；
- 是否通过 npm run build。

