# OpenClaw 快速修改提示词：智能报告统一右侧 AI 面板

下面内容可直接复制给 OpenClaw。本提示词刻意压缩上下文，只让它快速出一版效果。

```text
你是资深前端工程师、资深 UX/UI 工程师、AI 产品工程师。

请快速修改 D:\demo\ai-copilot 项目中的“智能报告”页面。

本轮只做一件事：
把智能报告的 taskDialog 和报告详情页统一成“中间结构化内容 + 右侧 AI 面板”的布局。

只允许修改：
- src/pages/SmartReportPage.vue

不要修改：
- src/data/mockSmartReport.js
- 智能尽调相关文件
- 企业探查相关文件
- 路由
- 侧边栏

当前问题：
1. taskDialog 现在像一个独立聊天页，和报告详情页割裂。
2. 报告详情页右侧同时放“章节证据链”和“AI 写作助手”，右侧太拥挤。
3. 章节证据链应该属于报告正文证据支撑，应放到中间正文下方。
4. 任务确认页和报告详情页都应该复用右侧 AI 面板体验，类似企业诊断详情页。

目标效果：

一、taskDialog 改成任务确认工作区

不要再做左侧大聊天页。

改成：
- 中间/左侧：任务识别确认内容
- 右侧：AI 报告助手面板

结构示意：

<div v-if="view === 'taskDialog'" class="sr-task-workspace">
  <div class="sr-task-workspace__header">返回首页 + 标题</div>
  <div class="sr-task-workspace__body">
    <main class="sr-task-workspace__main">
      用户原始输入
      AI 识别摘要
      任务确认信息
      待确认章节
      缺失材料
      操作按钮
    </main>
    <aside class="sr-task-workspace__assistant">
      右侧 AI 面板
    </aside>
  </div>
</div>

中间任务确认内容用现有 recognizedTask 即可。
保留按钮：
- 确认创建任务
- 调整识别结果
- 返回首页

右侧 AI 面板内容：
- 标题：AI 报告助手
- 上下文：正在识别报告任务
- 快捷按钮：解释识别结果 / 更换目标模板 / 只检查材料 / 返回首页
- 消息区：复用 aiMsgs 或 taskDialogMessages 均可，能展示模拟对话即可
- 输入框：补充任务要求...

二、报告详情页调整

当前详情页是：
左侧目录 / 中间正文 / 右侧章节证据链 + AI 助手

请改成：
左侧目录 / 中间正文 + 章节证据链 / 右侧 AI 助手

也就是把现在右侧的：
<div class="sr-sidebar__materials">章节证据链...</div>

移动到中间正文区域 currentSection 正文下方。

中间正文下方新增：

<section ref="sectionEvidenceRef" class="sr-section-evidence">
  <div class="sr-section-evidence__header">
    <h3>章节证据链</h3>
    <span>本节引用 {{ currentSectionMaterials.length }} 份资料</span>
  </div>
  证据材料列表
</section>

每条证据显示：
- 资料名称
- 来源
- 状态
- 识别摘要
- 操作：详情 / 修改摘要 / 补充 / 转入尽调补充

右侧 sr-editor__sidebar 只保留 AI 写作助手。
不要再把章节证据链放在右侧。

三、左侧目录增加“章节证据链”入口

在报告目录底部增加一项：
章节证据链

点击后滚动到中间证据链区域。

新增：
const sectionEvidenceRef = ref(null)

function scrollToEvidence() {
  sectionEvidenceRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

四、滚动要求

中间内容和右侧 AI 面板各自独立滚动。

CSS 重点：

.sr-editor {
  height: calc(100vh - 140px);
}

.sr-editor__body {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 360px;
  gap: var(--space-md);
  min-height: 0;
  overflow: hidden;
}

.sr-editor__toc {
  overflow-y: auto;
}

.sr-editor__content {
  min-height: 0;
  overflow-y: auto;
}

.sr-editor__sidebar {
  min-height: 0;
  overflow: hidden;
}

.ai-assistant-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ai-assistant-panel__messages,
.sr-ai-msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.ai-assistant-panel__footer {
  flex-shrink: 0;
}

taskDialog 也要独立滚动：

.sr-task-workspace__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--space-md);
  height: calc(100vh - 160px);
  overflow: hidden;
}

.sr-task-workspace__main {
  min-height: 0;
  overflow-y: auto;
}

.sr-task-workspace__assistant {
  min-height: 0;
  overflow: hidden;
}

五、AI 面板风格

右侧 AI 面板尽量参考企业诊断详情页：
- ai-assistant-panel
- ai-assistant-panel__messages
- ai-assistant-panel__quick
- ai-assistant-panel__footer
- ai-message
- ai-message--ai
- ai-message--user

不用完全复刻，只要视觉和滚动行为接近即可。

六、不要做

- 不要新增路由
- 不要改 mockSmartReport.js
- 不要改智能尽调
- 不要改企业探查
- 不要大重构
- 不要把 taskDialog 做成全屏聊天页
- 不要把章节证据链继续放在右侧 AI 面板上方

七、验收标准

1. npm run build 通过
2. taskDialog 变成“任务确认内容 + 右侧 AI 面板”
3. 报告详情页右侧只保留 AI 写作助手
4. 章节证据链移动到中间正文下方
5. 左侧目录有“章节证据链”入口，点击可定位
6. 中间正文和右侧 AI 面板各自独立滚动
7. 没有修改禁止文件

请小步修改，优先快速完成效果。
```
