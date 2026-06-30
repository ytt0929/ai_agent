# OpenClaw Prompt: Enterprise Diagnosis Independent Scroll Fix

```text
你是资深前端工程师和 UI/UX 工程师。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取其他旧提示词文件。

阶段定位：
企业诊断详情页滚动修复补丁。
本轮只修滚动，不改业务逻辑、不改数据、不改页面结构。

重要限制：
- 只修改 src/pages/EnterpriseDiagnosisPage.vue。
- 只改 scoped CSS，除非必须补一个 class。
- 不改 DOM 结构。
- 不改 JS 逻辑。
- 不改 store、mock、路由、全局样式。
- 不处理乱码。
- 不使用 PowerShell/Node 脚本批量替换。

当前问题：
企业诊断详情页已经是左右两栏：
- 左侧：诊断报告内容
- 右侧：AI 风险研究助手

但现在滚动仍然不对：
1. 页面右侧仍出现浏览器整体滚动条。
2. 左侧报告区没有独立滚动。
3. 右侧 AI 面板虽然固定在右侧，但对话内容多轮后没有在对话框内部自然滚动。
4. 用户向下查看左侧报告时，不应该影响右侧 AI 面板的可见性。

目标效果：
1. 企业诊断结果页内部形成固定高度工作区。
2. 左侧 .ed-report-main 独立纵向滚动。
3. 右侧 .ed-report-aside 保持可见，不跟随左侧滚动。
4. 右侧 .ed-assistant-card 占满右侧工作区高度。
5. 右侧 .ed-chat 在助手卡片内部独立滚动，支持多轮对话。
6. 页面 body 不应再作为主要滚动容器。
7. 1200px 以下移动/窄屏可以恢复单列自然滚动。

请重点修改以下 CSS：

1. .ed-page
当前如果页面外层还会撑出浏览器滚动条，需要限制高度：
- height: 100vh;
- overflow: hidden;

注意：只对诊断结果页生效更好。如果担心影响搜索页，可以通过 .ed-result 控制，不要破坏搜索首页。

2. .ed-result
应成为垂直固定工作区：
- height: calc(100vh - 32px);
- display: flex;
- flex-direction: column;
- overflow: hidden;
- min-height: 0;

3. .ed-topbar
顶部不参与滚动：
- flex-shrink: 0;

4. .ed-report-layout
作为左右两栏滚动容器：
- flex: 1;
- min-height: 0;
- overflow: hidden;
- display: grid;
- grid-template-columns: minmax(0, 1fr) 360px;

5. .ed-report-main
左侧报告独立滚动：
- min-height: 0;
- overflow-y: auto;
- overflow-x: hidden;
- padding-right: 4px; 或合适留白

6. .ed-report-aside
右侧栏不跟随左侧滚动：
- min-height: 0;
- overflow: hidden;
- display: flex;

7. .ed-assistant 和 .ed-assistant-card
右侧助手占满右栏：
- .ed-assistant { min-height: 0; height: 100%; display: flex; }
- .ed-assistant-card { height: 100%; min-height: 0; display: flex; flex-direction: column; }

8. .ed-chat
聊天消息区必须在卡片内部滚动：
- flex: 1;
- min-height: 0;
- max-height: none;
- overflow-y: auto;

9. .ed-chat-quick 和 .ed-chat-input
快捷按钮和输入框应固定在卡片底部，不被聊天内容挤走：
- flex-shrink: 0;

10. 响应式恢复
在 @media (max-width: 1200px) 中恢复自然滚动：
- .ed-result { height: auto; overflow: visible; }
- .ed-report-layout { overflow: visible; }
- .ed-report-main { overflow: visible; }
- .ed-report-aside { overflow: visible; display: block; }
- .ed-assistant-card { height: auto; }
- .ed-chat { max-height: 340px; flex: none; }

不要修改：
- 左右栏宽度
- DOM 顺序
- AI 助手按钮逻辑
- 指标筛选逻辑
- mock/store 数据

验收标准：
1. npm run build 通过。
2. 企业诊断结果页右侧不再依赖浏览器整体滚动。
3. 左侧报告内容可以在左栏内部滚动。
4. 右侧 AI 风险研究助手始终可见。
5. 多轮对话时，只有 .ed-chat 消息区域滚动，快捷按钮和输入框仍在底部。
6. 1200px 以下页面不被固定高度破坏。

完成后请回复：
- 修改了哪些 CSS 选择器
- 左侧报告是否独立滚动
- 右侧聊天区是否内部滚动
- npm run build 是否通过
```
