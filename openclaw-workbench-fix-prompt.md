# openClaw 修改提示词：修复工作台 AI 对话体验剩余缺口

项目路径：

```text
D:\demo\ai-copilot
```

请只修复当前工作台 AI 对话体验中尚未收口的问题。

当前代码已经实现了以下内容，请不要重做：

- `pushStreamingMessage()` mock 流式输出基础能力。
- `contextSuggestions` 上下文建议数据。
- `WorkbenchConversation.vue` 中的建议按钮基础展示。
- `WorkbenchPage.vue` 中的 `handleSuggestionClick()` 动作分发。
- 税票阶段右侧按钮：确认发送采集链接、稍后处理、模拟企业已授权。
- 自动尽调主流程：筛客、选择企业、创建尽调、工商校验、税票采集、材料归集、AI 分析、报告确认、企业监控。

本次不要重写主流程。  
不要重写税票状态机。  
不要重做右侧产物区整体 UI。  
不要引入真实 LLM。  
不要大范围重构 store。  
只做小范围体验修复。

## 一、请先阅读这些文件

重点阅读：

- `src/stores/workbenchAssistant.js`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchArtifactPanel.vue`

确认当前已有实现后，只改下面列出的剩余问题。

## 二、本次需要修复的问题

### 问题 1：对话模式输入框 placeholder 仍然是写死的

当前普通工作台输入框已经用了：

```vue
:placeholder="dialogPlaceholder"
```

但是进入对话模式后，底部输入框仍然是固定文案：

```vue
placeholder="可以追问、调整或打断当前任务，例如：暂停采集 / 查看证据 / 调整监控规则"
```

请把对话模式底部输入框也改成：

```vue
:placeholder="dialogPlaceholder"
```

动态提示必须覆盖：

```text
等待选择企业：回复企业名称或序号选择企业
等待确认发送税票链接：请点击“确认发送采集链接”，或回复“确认发送”
等待企业线下授权：企业完成线下授权后，点击按钮或回复“企业已授权”
报告确认阶段：请确认报告并加入监控，或稍后处理
流程完成后：可以查看尽调报告、企业监控，或继续筛选客户
```

### 问题 2：建议按钮位置不够像当前快捷回复

当前建议按钮已经在 `WorkbenchConversation.vue` 里展示，但它在对话滚动区内部，可能随着聊天记录滚走。

目标：建议按钮要像「当前下一步建议 / 快捷回复」，用户在输入框附近能稳定看到。

请二选一实现：

方案 A，推荐：

- 将建议按钮移到 `WorkbenchPage.vue` 的输入框上方。
- `WorkbenchConversation.vue` 只负责聊天记录和流程卡片。
- 输入框上方新增一行轻量快捷按钮，使用 `assistant.contextSuggestions`。
- 点击仍然走现有 `handleSuggestionClick()`。

方案 B，可接受：

- 保留在 `WorkbenchConversation.vue`，但让 `.suggestion-bar` sticky 到对话区底部。
- 不要让用户必须滚动到底部才能看到建议按钮。

视觉要求：

- 按钮轻量、紧凑，像快捷回复。
- 不要做大卡片。
- 不要挤压输入框。
- 文案清晰，例如「确认发送采集链接」「模拟企业已授权」「确认报告并加入监控」。

### 问题 3：流式输出期间没有持续自动滚动

当前 `WorkbenchConversation.vue` 只监听了：

```js
props.messages.length
activeSteps.value.length
```

但是 mock 流式输出时，是同一条消息的 `msg.text` 不断变化，`messages.length` 不会变化。

请补一个轻量自动滚动机制，让流式输出过程中也能滚到底部。

可以实现为：

```js
watch(
  () => props.messages.map(m => m.text).join('|'),
  () => scrollToBottomSoon()
+)
```

或者使用更稳妥的 scroll 方法封装。

要求：

- 不要引入复杂依赖。
- 不要每帧高频滚动导致卡顿。
- 可以用 `setTimeout` 或简单节流。
- 保留现有 `messages.length` 和 `activeSteps.length` 监听也可以。

### 问题 4：reset 时需要停止未完成的流式输出

`workbenchAssistant.js` 里已经有 `streamingTimer` / `streamingMsgRef`。

请在 `reset()` 中清理：

```js
if (streamingTimer) clearTimeout(streamingTimer)
if (streamingMsgRef) streamingMsgRef.streaming = false
streamingTimer = null
streamingMsgRef = null
```

避免用户清空对话或返回工作台后，旧的流式输出还在继续写旧消息。

### 问题 5：旧的 `execFullFlow()` 仍有潜在风险

当前 `workbenchAssistant.js` 中仍有旧方法 `execFullFlow()`，里面调用了不存在的：

```js
execReport(selectedCustomer.value)
```

现在实际使用的是：

```js
execReportPause(customer)
```

请处理这个风险，但不要重写全流程。

可选方案：

1. 如果 `execFullFlow()` 已经没有任何入口使用，可以删除或注释掉，并确保没有导出。
2. 如果需要保留兼容，请把其中的 `execReport()` 改为 `execReportPause()`，并确保它不会绕过税票授权等待节点。

推荐方案：保守处理，避免任何入口误触发旧全流程。

## 三、不要破坏的流程顺序

主流程仍然必须保持：

```text
输入筛客条件
→ 产出客户名单
→ 用户选择一家企业
→ 自动创建尽调
→ 工商校验
→ 税票采集：等待确认发送链接
→ 用户确认发送链接
→ 税票采集：等待企业线下授权
→ 用户点击“模拟企业已授权”或输入“企业已授权”
→ 税票采集完成
→ 材料归集
→ AI 分析
→ 报告确认
→ 用户确认加入监控
→ 企业监控完成
→ currentFlowStatus = completed
```

不要让税票授权链接一发送就自动进入下一步。  
不要让「企业已授权」在链接未发送前直接生效。  
不要让建议按钮绕开状态机。

## 四、建议验收场景

### 场景 1：对话模式输入框动态提示

进入对话模式后，在不同状态检查输入框 placeholder：

- 等待选择企业时，提示选择企业名称或序号。
- 等待确认发送税票链接时，提示确认发送。
- 等待企业线下授权时，提示企业授权完成后继续。
- 报告确认阶段，提示确认报告并加入监控。
- 流程完成后，提示可查看报告、监控或继续筛客。

### 场景 2：建议按钮始终靠近输入区

流程跑到税票确认节点时：

- 用户不用滚动聊天记录，也能看到「确认发送采集链接」。
- 点击后正常进入 `waiting_tax_authorization`。

流程跑到企业授权节点时：

- 用户不用滚动聊天记录，也能看到「模拟企业已授权」。
- 点击后正常继续税票采集。

### 场景 3：流式输出自动滚动

当 AI 输出长文本时：

- 文本逐步出现。
- 对话框能跟随滚到底部。
- 不需要用户手动滚动才能看到最新输出。

### 场景 4：清空/返回时没有残留流式输出

在 AI 流式输出过程中点击清空或返回：

- 对话被清空。
- 不再继续追加旧消息。
- 控制台没有报错。

### 场景 5：旧全流程入口不会误触发坏逻辑

检查 `execFullFlow()`：

- 不再调用不存在的 `execReport()`。
- 不会绕过税票授权等待节点。
- 如果无入口使用，可以安全移除或不导出。

## 五、构建验证

修改完成后运行：

```bash
npm run build
```

最后请说明：

1. 修改了哪些文件。
2. 对话模式 placeholder 如何改成动态提示。
3. 建议按钮现在展示在哪里。
4. 流式输出自动滚动如何实现。
5. reset 如何清理流式输出。
6. `execFullFlow()` 风险如何处理。
7. 上述验收场景是否通过。
