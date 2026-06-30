# OpenClaw Prompt: Enterprise Diagnosis Assistant Panel + Compact Header Fix

```text
你是资深前端工程师和 UI/UX 工程师，熟悉银行客户经理的风险诊断工作台场景。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取其他旧提示词文件。

阶段定位：
企业诊断详情页体验补丁。
本轮只做两个小目标：
1. 右侧 AI 风险研究助手支持展开 / 收起。
2. 顶部企业信息栏变得更紧凑，减少占用空间。

重要限制：
- 只修改 src/pages/EnterpriseDiagnosisPage.vue。
- 不修改 store、mock、路由、全局样式、其他页面。
- 不处理乱码。
- 不做全文件转码。
- 不使用 PowerShell/Node 脚本批量替换。
- 不重构整个页面。
- 不修改企业诊断业务数据。
- npm run build 必须通过。

当前问题：
1. 右侧 AI 风险研究助手宽度固定，用户看多轮对话时空间偏小。
2. 右侧助手没有“收起/展开”，用户无法临时扩大左侧报告阅读区，也无法扩大助手阅读区。
3. 顶部企业信息栏占用空间偏大，降低了下方报告和对话区的有效高度。

目标效果：
1. 右侧 AI 助手面板支持收起和展开。
2. 展开状态下，右侧面板宽度比现在更适合阅读对话，建议 420px 或 440px。
3. 收起状态下，右侧只保留一个窄条入口，左侧报告区自动变宽。
4. 用户可以通过按钮在展开/收起之间切换。
5. 顶部栏更紧凑，不再显得很厚重。
6. 不影响左侧报告独立滚动和右侧聊天内部滚动。

具体修改：

一、增加右侧助手收起/展开状态

在 <script setup> 中新增：
- const assistantCollapsed = ref(false)
- function toggleAssistant() { assistantCollapsed.value = !assistantCollapsed.value }

二、给 .ed-report-layout 增加状态 class

在 template 中：
当前：
<div class="ed-report-layout">

改为：
<div class="ed-report-layout" :class="{ 'ed-report-layout--assistant-collapsed': assistantCollapsed }">

三、右侧 AI 助手 header 增加收起按钮

在 AI 风险研究助手标题右侧增加一个小按钮。

展开状态按钮文案：
收起

收起状态按钮文案：
展开

可以用 el-button size="small" text，不需要新增复杂图标。

四、收起状态展示

当 assistantCollapsed 为 true 时：
- 右侧栏只显示一个窄的折叠入口。
- 不显示聊天内容、快捷按钮、输入框。
- 折叠入口至少显示：
  - AI
  - 展开

可以用 v-if / v-else 包裹现有助手内容。

建议结构：

<aside class="ed-report-aside">
  <div v-if="assistantCollapsed" class="ed-assistant-collapsed" @click="toggleAssistant">
    <span>AI</span>
    <button>展开</button>
  </div>
  <aside v-else class="ed-assistant">
    原有 AI 助手内容
  </aside>
</aside>

五、调整右侧宽度

当前：
.ed-report-layout {
  grid-template-columns: minmax(0, 1fr) 360px;
}

建议改为：
.ed-report-layout {
  grid-template-columns: minmax(0, 1fr) 430px;
}

收起状态：
.ed-report-layout--assistant-collapsed {
  grid-template-columns: minmax(0, 1fr) 56px;
}

右侧折叠条：
.ed-assistant-collapsed {
  height: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 12px 6px;
  cursor: pointer;
}

六、优化 AI 助手内部阅读空间

确保右侧助手展开时：
- .ed-assistant-card height: 100%;
- .ed-assistant-card min-height: 0;
- .ed-chat flex: 1;
- .ed-chat min-height: 0;
- .ed-chat max-height: none;
- .ed-chat overflow-y: auto;
- .ed-chat-quick 和 .ed-chat-input flex-shrink: 0;

不要让聊天区被 header、快捷按钮和输入框挤到太小。

七、压缩顶部企业信息栏

当前顶部栏视觉占用偏大。
请只做轻量压缩：

.ed-topbar：
- min-height 从 72px 降到 56px 或 60px。
- max-height 不要继续撑大，可移除或设为 72px。
- padding 从 12px 0 降到 8px 0。
- align-items: center 保持。

.ed-company__name：
- font-size 从 22px 降到 20px。
- line-height 保持 1.2。

.ed-score-inline__num：
- font-size 从 28px 降到 26px。

顶部按钮：
- 保持 size="small" 即可，不要新增大按钮。

八、响应式要求

在 @media (max-width: 1200px) 中：
- 取消右侧固定栏。
- .ed-report-layout 仍为单列。
- 收起状态不要破坏单列布局。
- AI 助手自然显示在下方即可。

不要修改：
- 证据链逻辑
- 核心风险列表
- 八大维度图
- AI 助手按钮业务逻辑
- GlobalInputBar
- AppSidebar
- main.js

验收标准：
1. npm run build 通过。
2. 企业诊断页右侧 AI 助手有“收起/展开”能力。
3. 收起后左侧报告区变宽。
4. 展开后右侧助手宽度更适合阅读对话。
5. 多轮对话仍然在 .ed-chat 内部滚动。
6. 顶部企业信息栏更紧凑。
7. 不影响左侧报告滚动。
8. 不引入新的乱码。

完成后请回复：
- 修改了哪些文件
- 新增了哪些状态/函数
- 右侧助手展开宽度和收起宽度是多少
- 顶部栏做了哪些压缩
- npm run build 是否通过
```
