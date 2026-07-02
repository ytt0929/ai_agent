# OpenClaw 提示词：智能报告任务识别页对话错乱与宽度优化

你是资深 Vue 3 前端工程师、资深 UX/UI 工程师。请修复智能报告里 `AI 正在识别报告任务` 页面的问题。本轮只处理任务识别页的对话内容错乱和页面宽度，不扩展产品功能，不改智能尽调、企业探查、路由、侧边栏和全局样式。

## 当前项目情况

- 技术栈：Vue 3 + Vite + Element Plus。
- 当前主要文件：`src/pages/SmartReportPage.vue`。
- 当前任务识别页是：

```vue
<div v-if="view === 'taskDialog'" class="sr-task-workspace">
```

- 当前任务识别页包含：
  - 左侧：用户输入 + 任务确认面板
  - 右侧：AI 报告助手面板
- 当前相关样式：

```css
.sr-task-workspace { max-width: 1200px; margin: 0 auto; }
.sr-task-workspace__body { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; height: calc(100vh - 160px); overflow: hidden; }
.sr-ai-msgs { flex: 1; overflow-y: auto; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); min-height: 0; }
.sr-ai-quick-inline { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-light); }
```

## 本轮只允许修改

- `src/pages/SmartReportPage.vue`

不要修改：

- `src/data/mockSmartReport.js`
- 智能尽调相关文件
- 企业探查相关文件
- 路由
- 侧边栏
- 全局样式文件
- 其他页面

## 当前问题

### 问题 1：AI 对话面板里的推荐按钮错乱

当前右侧 AI 面板模板大概是：

```vue
<div v-for="(m, i) in aiMsgs" class="ai-message">
  <div class="ai-message__avatar">AI</div>
  <div class="ai-message__bubble" v-html="renderMd(m.text)"></div>
  <div v-if="m.quickActions && m.quickActions.length" class="sr-ai-quick-inline">
    <el-button ...>{{ qa.label }}</el-button>
  </div>
</div>
```

这会导致 `quickActions` 成为 `ai-message` 的第三个 flex 子元素，与头像、气泡并排，截图中表现为：

- 左侧出现一列“解释识别结果 / 更换目标模板 / 只检查材料 / 返回首页”
- 右侧又出现建议气泡
- 整个对话信息结构错乱，不像正常 AI 对话

### 问题 2：任务识别页整体宽度偏窄

当前 `sr-task-workspace` 最大宽度是 `1200px`，右侧 AI 面板只有 `360px`。在当前浏览器宽度下，左侧确认面板和右侧 AI 面板都显得偏窄，内容换行较多。

### 问题 3：AI 面板信息层级不清晰

当前多条识别结果消息可以保留，但最后一条“建议下一步”应该作为一个完整 AI 气泡，推荐动作应该在这个气泡内部，不要脱离气泡。

## 修改目标

把任务识别页调整成更清晰的两栏工作台：

```text
左侧：任务输入 + 任务确认面板
右侧：AI 识别过程 + 推荐动作 + 输入框
```

要求：

- AI 消息不再错乱。
- 推荐动作按钮放在对应 AI 气泡内部。
- 页面宽度更舒展。
- 左侧确认面板和右侧 AI 面板比例更合理。
- 保持 Element Plus 风格。

## 具体修改要求

### 1. 修复 quickActions 错位

请把 `quickActions` 放进 `.ai-message__bubble` 内部。

推荐改成：

```vue
<div v-for="(m, i) in aiMsgs" :key="i" class="ai-message" :class="m.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'">
  <div class="ai-message__avatar">{{ m.role === 'ai' ? 'AI' : '我' }}</div>
  <div class="ai-message__content">
    <div class="ai-message__bubble" v-html="renderMd(m.text)"></div>
    <div v-if="m.quickActions && m.quickActions.length" class="sr-ai-quick-inline">
      <el-button
        v-for="(qa, qi) in m.quickActions"
        :key="qi"
        size="small"
        plain
        @click="qa.handler"
      >
        {{ qa.label }}
      </el-button>
    </div>
  </div>
</div>
```

或者把 `quickActions` 直接放在 bubble 内部也可以：

```vue
<div class="ai-message__bubble">
  <div v-html="renderMd(m.text)"></div>
  <div v-if="m.quickActions?.length" class="sr-ai-quick-inline">...</div>
</div>
```

重点：

- `quickActions` 不能作为 `ai-message` 的第三个横向子元素。
- 推荐按钮要跟随对应消息气泡。
- 按钮不应单独漂在消息左侧。

### 2. 增加 AI 消息内容容器样式

如新增 `.ai-message__content`，请加样式：

```css
.ai-message__content {
  max-width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
```

并确保：

- AI 消息左对齐。
- 用户消息右对齐，如当前已有用户消息样式则不要破坏。
- 消息气泡最大宽度合理，建议 `max-width: 100%`。
- 长文本自动换行。

### 3. 优化 quickActions 样式

当前 `.sr-ai-quick-inline` 有边框线和较紧布局，可以轻量化：

```css
.sr-ai-quick-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-light);
}
```

如果放在 bubble 内部，建议按钮用：

- `size="small"`
- `plain`
- 不要全部 `text`，否则按钮弱且像链接堆叠。

### 4. 调整任务识别页整体宽度

当前：

```css
.sr-task-workspace { max-width: 1200px; margin: 0 auto; }
.sr-task-workspace__body { grid-template-columns: minmax(0, 1fr) 360px; }
```

请调整为更适合当前页面：

```css
.sr-task-workspace {
  max-width: 1360px;
  margin: 0 auto;
}

.sr-task-workspace__body {
  grid-template-columns: minmax(620px, 1fr) 420px;
  gap: 20px;
}
```

如果担心小屏幕溢出，可以用：

```css
grid-template-columns: minmax(560px, 1fr) minmax(380px, 420px);
```

并保留响应式：

```css
@media (max-width: 1200px) {
  .sr-task-workspace__body {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
}
```

注意：当前 CSS 里有两个重复的：

```css
@media (max-width: 1200px) {
  .sr-task-dialog__body { grid-template-columns: 1fr; }
}
```

这是旧类名，和当前 `.sr-task-workspace__body` 不匹配。请修正为 `.sr-task-workspace__body`，并删除重复块。

### 5. 优化左侧确认面板宽度和信息展示

左侧任务确认面板当前宽度偏窄，调整布局后应更舒展。

请确保：

- `el-descriptions` 不要过度挤压。
- “关联报告”标签长文本可换行或省略。
- 待确认章节和缺失材料 tag 不要挤在一行导致溢出。
- 操作按钮保持一行优先，空间不足时换行。

### 6. 优化右侧 AI 面板高度和输入框

右侧 AI 面板保持：

- Header 固定顶部。
- 消息区独立滚动。
- 输入框固定底部。

请确保：

- 输入框不要悬浮在过大空白之上。
- 消息区内容多时正常滚动。
- 右侧面板宽度调大后消息不再过度换行。

## 不要做的事

- 不要改智能尽调。
- 不要改企业探查。
- 不要改路由。
- 不要改侧边栏。
- 不要改全局样式文件。
- 不要重写整个智能报告页面。
- 不要修改首页、模板中心、报告详情页的业务结构。
- 不要新增复杂功能。

## 验收标准

完成后请检查：

1. `npm run build` 通过。
2. 进入 `AI 正在识别报告任务` 页面后，右侧 AI 面板不再出现按钮和消息左右错乱。
3. `解释识别结果 / 更换目标模板 / 只检查材料 / 返回首页` 这些推荐动作在对应 AI 消息气泡内部或气泡下方，不再独立漂在左侧。
4. 任务识别页整体宽度比之前更舒展。
5. 左侧任务确认面板可读性更好。
6. 右侧 AI 面板宽度更合理，消息不再过度换行。
7. 小屏下仍能正常纵向排列。
8. 没有修改智能尽调、企业探查、路由、侧边栏、全局样式文件。
9. 本轮只修改 `src/pages/SmartReportPage.vue`。
