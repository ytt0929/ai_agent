# OpenClaw 提示词：企业探查 Phase 1 P0 连续输入卡顿修复

请先完整阅读并修改 `src/pages/EnterpriseExplorationWorkspacePage.vue`。本轮只解决企业探查工作区连续输入、连续点击、流式回复卡住的问题，不做视觉重构，不改首页表格，不改 P1 指标问答文案，不处理乱码/编码，不改其他模块。

## 当前问题

现在页面已经有 `isStreaming`，但连续输入仍会卡住，原因是只解决了“单段流式文字不并发”，没有解决“用户连续输入的任务调度”。

主要风险点：

1. `sendChat` 仍然用 `isExploring` 直接拦截，上一轮未结束时下一轮输入会被吃掉。
2. `runExploreFlow` 和 `handleReportRequest` 都在设置 `isExploring`，嵌套调用时锁状态会互相覆盖。
3. `safeStreamMessage` 没有队列，只能避免同一时刻两段流式输出，但不能保证多条用户输入按顺序处理。
4. `chatRef` 同时用于对话优先态和右侧对话面板，布局切换时可能导致滚动和 DOM ref 不稳定。

## 产品验收目标

连续输入时不要卡住、不要丢消息、不要乱序：

```text
用户连续输入：
1. 税负率是多少
2. 收入同比是多少
3. 查看股东明细
4. 是否存在欺诈风险

预期：
1. 四条用户消息都显示在对话里。
2. AI 按输入顺序依次回复。
3. 发送按钮不会因为上一条处理中而完全吞掉下一条输入。
4. 单指标/单事实只在右侧对话回答，不切换左侧结果区。
5. 明细/风险/报告类问题才切换左侧结果区。
6. 处理过程中不出现“探查中”永久不释放。
7. 控制台无 `Cannot access ... before initialization`、无 Vue patch 报错、无 Promise uncaught。
```

## 必须采用的修复方向

不要继续零散补 `if (isExploring)`。请把对话处理拆成三层：

```text
sendChat
  只负责读取输入、清空输入、追加用户消息、入队
        ↓
messageQueue + processMessageQueue
  保证用户输入按顺序处理，避免并发业务流
        ↓
runExploreFlow / handleReportRequest
  只处理业务，不再互相抢锁
        ↓
safeStreamMessage
  只负责单条 AI 消息流式输出
```

## 具体修改要求

### 1. 新增消息队列状态

在 `<script setup>` 中新增：

```js
const messageQueue = ref([])
const isProcessingQueue = ref(false)
const isBusy = computed(() => isProcessingQueue.value || isStreaming.value)
```

如果当前已有 `isExploring`，可以保留作为兼容 UI 文案，但不要再让它直接吞掉用户输入。建议最终语义：

- `isProcessingQueue`: 业务队列处理中
- `isStreaming`: 单条 AI 回复正在流式输出
- `isExploring`: 可作为兼容显示状态，或由 `isProcessingQueue` 派生，但不要多处手动抢锁

### 2. 改造 sendChat

`sendChat` 的职责必须变轻：

```js
async function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return

  chatInput.value = ''
  chatMessages.value.push({ role: 'user', text })
  enqueueUserMessage(text)
}
```

注意：

- 不要再因为 `isExploring.value` 直接 `return`。
- 用户连续发送时，消息必须进入队列。
- 按钮可以显示“处理中”，但不能导致用户输入丢失。

### 3. 新增 enqueueUserMessage / processMessageQueue

新增：

```js
function enqueueUserMessage(text) {
  messageQueue.value.push(text)
  processMessageQueue()
}

async function processMessageQueue() {
  if (isProcessingQueue.value) return
  isProcessingQueue.value = true
  isExploring.value = true

  try {
    while (messageQueue.value.length) {
      const text = messageQueue.value.shift()
      await handleUserMessage(text)
    }
  } catch (error) {
    console.error('processMessageQueue error:', error)
    await safeStreamMessage('当前对话处理异常，请重新发送或点击快捷问题继续。')
  } finally {
    isProcessingQueue.value = false
    isExploring.value = false
  }
}
```

### 4. 抽出 handleUserMessage

把现在 `sendChat` 里“未识别企业、识别企业、pendingQuestion、runExploreFlow”的逻辑迁移到 `handleUserMessage(text)`。

要求：

- `handleUserMessage` 不再追加用户消息，因为用户消息已经在 `sendChat` 中追加。
- `_new` 页面如果默认填了 `91130203MA7EEQ2N0T`，点击发送后能识别唐山物桥商贸有限公司。
- 如果存在 `pendingQuestion`，识别企业后要继续执行原问题，但不要重复追加用户消息到对话里，避免连续输入时消息重复。

### 5. 改造 runExploreFlow

`runExploreFlow(text)` 不要再用：

```js
if (isExploring.value) return
isExploring.value = true
...
finally { isExploring.value = false }
```

因为队列已经负责串行。`runExploreFlow` 只做业务逻辑：

- 分类问题
- chat-only 类型直接 `await safeStreamMessage(...)`
- detail 类型切换左侧视图并回复
- report 类型调用 `await handleReportRequest(text)`
- analysis 类型按当前逻辑跑引擎卡/左侧视图

### 6. 改造 handleReportRequest

`handleReportRequest(text)` 不要再设置 `isExploring.value = true/false`。

原因：报告处理是 `runExploreFlow` 的子流程，锁应由队列统一管理。保留 try/catch 可以，但不要释放全局锁。

### 7. safeStreamMessage 保持单条流式职责

保留 `isStreaming`，但不要让它决定业务是否能进入队列。

建议：

```js
async function safeStreamMessage(fullText, options = {}) {
  const text = String(fullText || '')
  while (isStreaming.value) {
    await delay(16)
  }
  isStreaming.value = true
  ...
  finally { isStreaming.value = false }
}
```

不要在 `isStreaming.value === true` 时直接追加完整文本跳过流式，因为队列已经保证业务顺序，等待上一段流式完成更稳定。

### 8. 拆分 chatRef

现在模板里有两个区域都用了 `ref="chatRef"`：

- 对话优先态
- 右侧 AI 对话面板

请改成：

```js
const chatOnlyRef = ref(null)
const chatPanelRef = ref(null)
```

模板对应改为：

```vue
<div v-if="!workspaceActive" ... ref="chatOnlyRef">
...
<div class="edw-chat-messages ..." ref="chatPanelRef">
```

`scrollToBottom()` 中根据 `workspaceActive.value` 选择当前容器：

```js
function scrollToBottom() {
  nextTick(() => {
    const el = workspaceActive.value ? chatPanelRef.value : chatOnlyRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}
```

### 9. 按钮状态

发送按钮不要因为 `isExploring` 禁用到用户无法继续输入。建议：

```vue
:disabled="!chatInput.trim()"
{{ isBusy ? '排队中' : '发送' }}
```

如果担心用户误会，可以保留可发送，但文案显示“排队中”。不要吞输入。

### 10. 不允许做的事

本轮严禁：

- 不要修改 P1 单指标回复内容。
- 不要修改企业探查首页。
- 不要修改 `token.css`。
- 不要做 Element Plus 样式重构。
- 不要改 mock 数据。
- 不要把中文改成乱码或为了修乱码大面积替换中文。
- 不要改工作台、智能尽调、智能报告、企业监测等其他模块。

## 验收路径

请完成后运行：

```bash
npm run build
```

并手动/代码自查以下路径：

1. 访问 `/enterprise-diagnosis/workspace/_new?q=计算税负率`
2. 输入框应默认填入 `91130203MA7EEQ2N0T`
3. 点击发送，识别唐山物桥商贸有限公司，并继续处理“计算税负率”
4. 在上一条回复尚未完全结束时，连续输入：
   - `收入同比是多少`
   - `查看股东明细`
   - `是否存在欺诈风险`
5. 预期三条消息不丢失，AI 依次回复，左侧只在股东明细和风险类问题时切换。

## 完成后汇报格式

请按以下格式汇报：

```text
企业探查连续输入队列修复完成报告

1. 修改了哪些文件
2. 新增了哪些状态和函数
3. sendChat / runExploreFlow / handleReportRequest 的职责如何变化
4. chatRef 是否已拆分
5. 连续输入是否会入队而不是被吞
6. npm run build 是否通过
7. 是否没有修改 P1 指标文案、首页、其他模块
```

