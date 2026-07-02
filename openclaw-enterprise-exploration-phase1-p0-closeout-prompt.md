# OpenClaw Prompt：企业探查 Phase 1 P0 收口修复

你是资深 Vue 3 前端工程师。请在 `D:\demo\ai-copilot` 项目中继续收口企业探查 Phase 1。本轮只修 P0 的异步输出稳定性问题，不改 P1 指标文案，不进入 P2/P3。

## 0. 当前背景

上一轮 P0/P1 已经做了部分修改：

```text
1. 企业探查工作区已默认填入唐山物桥税号：91130203MA7EEQ2N0T
2. chatInput 初始化前访问导致白屏的问题已修复
3. runExploreFlow 已经有 try/finally
4. 单指标/单事实已经在右侧对话回答，不主动切换左侧
```

但当前仍有 P0 稳定性问题：

```text
1. safeStreamMessage 使用 isExploring 判断是否正在流式输出，语义错误。
2. runExploreFlow 开始时会设置 isExploring = true，导致 safeStreamMessage 误判“已有流式输出”，直接追加完整文本。
3. 主链路仍残留 typeAiMessage，输出机制混用。
4. sendChat 中仍有 runExploreFlow / safeStreamMessage / typeAiMessage 未 await，可能导致消息交错和状态时机不可控。
```

## 1. 允许修改文件

只允许修改：

```text
src/pages/EnterpriseExplorationWorkspacePage.vue
```

不要修改其他文件。

## 2. 严禁修改内容

不要修改：

```text
src/pages/EnterpriseDiagnosisListPage.vue
src/data/mockEnterpriseSourceData.js
src/main.js
src/components/AppSidebar.vue
src/styles/tokens.css
智能尽调
智能报告
工作台
企业监测
```

不要改路由、侧边栏、mock 数据、首页、全局样式。

不要批量重写中文文案。不要处理编码。不要把页面改成乱码。

## 3. P1 口径：本轮不要再改指标文案

重要：本轮不要再修改单指标回复的业务判断文案。

现在接受单指标返回：

```text
行业均值
判断
建议
偏低 / 增长过快 等评价
```

也就是说，下面这些当前内容不再作为问题：

```text
税负率返回判断
收入同比返回判断
指标返回建议
```

本轮只修 P0 异步输出稳定。

## 4. 必须修复的问题

### 4.1 新增 isStreaming，区分业务处理和流式输出

当前错误点：

```js
async function safeStreamMessage(fullText, options = {}) {
  if (isExploring.value) {
    // 直接追加完整文本
  }
}
```

这里不能用 `isExploring` 判断流式并发。

请新增：

```js
const isStreaming = ref(false)
```

语义：

```text
isExploring：业务处理中，用于禁用发送按钮
isStreaming：AI 正在输出，用于防止多个流式消息并发
```

`safeStreamMessage` 应该使用 `isStreaming.value` 判断，不要使用 `isExploring.value` 判断。

推荐结构：

```js
async function safeStreamMessage(fullText, options = {}) {
  const text = String(fullText || '')

  if (isStreaming.value) {
    const msg = { role: 'ai', text }
    if (options.actions) msg.actions = options.actions
    chatMessages.value.push(msg)
    scrollToBottom()
    return msg
  }

  isStreaming.value = true
  const msg = { role: 'ai', text: '' }
  chatMessages.value.push(msg)

  try {
    const batchSize = 5
    for (let i = 0; i < text.length; i += batchSize) {
      msg.text = text.slice(0, i + batchSize)
      if (i % 20 === 0) scrollToBottom()
      await delay(12)
    }
    msg.text = text
    if (options.actions) msg.actions = options.actions
    scrollToBottom()
    return msg
  } catch (error) {
    console.error('safeStreamMessage error:', error)
    msg.text = text || '回复生成异常，请重新发送。'
    if (options.actions) msg.actions = options.actions
    scrollToBottom()
    return msg
  } finally {
    isStreaming.value = false
  }
}
```

可以微调实现，但必须满足：

```text
1. 不用 isExploring 判断流式并发
2. 输出异常时不允许停在一个字
3. actions 在文本完成后再挂载
4. finally 必须释放 isStreaming
```

### 4.2 主链路残留 typeAiMessage 改为 safeStreamMessage

请检查 `EnterpriseExplorationWorkspacePage.vue` 中所有 `typeAiMessage(` 调用。

至少以下主链路必须替换为：

```js
await safeStreamMessage(...)
```

包括但不限于：

```text
runExploreFlow 中：
- 我先识别企业，并检查可用数据范围。

runReportGenerationFlow 中：
- 正在生成报告
- 生成完成总结

handleReportRequest 中：
- 税票未授权提示
- 企业未识别提示

sendChat 识别失败中：
- 当前 Demo 只内置了少量企业样例...
```

可以保留 `typeAiMessage` 函数本身，避免大范围删除，但主链路不要继续混用。

### 4.3 sendChat 中主链路异步调用必须 await

当前存在未 await 的调用，例如：

```js
runExploreFlow(origQ)
safeStreamMessage(...)
typeAiMessage(...)
runExploreFlow(text)
```

请改成：

```js
await runExploreFlow(origQ)
await safeStreamMessage(...)
await runExploreFlow(text)
```

要求：

```text
1. 识别企业后，如果有 pendingQuestion，必须 await runExploreFlow(origQ)
2. 识别企业后，如果没有 pendingQuestion，提示消息必须 await safeStreamMessage
3. 识别失败路径必须 await safeStreamMessage
4. 已有 creditCode 时，sendChat 末尾必须 await runExploreFlow(text)
```

### 4.4 保持 runExploreFlow try/finally

`runExploreFlow` 必须继续使用：

```js
try { ... } catch { ... } finally { isExploring.value = false }
```

不要回退到多个分支手动释放。

如果 `handleReportRequest` 内部也设置 `isExploring`，请避免与 `runExploreFlow` 互相冲突。原则：

```text
由最外层用户触发流程负责设置和释放 isExploring。
内部辅助函数尽量不要重复设置 isExploring，除非它也可能被独立调用。
```

不要做大重构，只处理明显冲突。

## 5. 不要做的事情

本轮不要做：

```text
1. 不要修改单指标回复文案。
2. 不要去掉“判断 / 建议 / 行业均值”。
3. 不要重构 answer plan。
4. 不要改左侧结果区。
5. 不要做 Element Plus + token.css 视觉重构。
6. 不要修改企业探查首页。
7. 不要修改其他业务模块。
```

## 6. 验收路径

完成后请自测：

### 6.1 默认税号 + pending question

```text
打开 /enterprise-diagnosis/workspace/_new?q=计算税负率
确认页面不白屏
确认输入框默认是 91130203MA7EEQ2N0T
点击发送
确认识别唐山物桥商贸有限公司
确认继续处理“计算税负率”
确认按钮最终恢复为“发送”
```

### 6.2 连续输入不交错

在企业已识别后连续测试：

```text
计算税负率
收入同比是多少
查看股东明细
是否存在欺诈风险
生成企业诊断报告
```

确认：

```text
1. 不出现只输出一个字
2. 不长时间卡在“探查中”
3. 不出现多个 AI 气泡同时流式输出
4. 控制台无 ReferenceError / Vue runtime error
```

### 6.3 左侧切换规则保持原样

确认：

```text
计算税负率 → 右侧回答，不主动切左侧
收入同比是多少 → 右侧回答，不主动切左侧
查看股东明细 → 左侧打开股东明细
是否存在欺诈风险 → 左侧打开风险/欺诈分析
```

## 7. 构建要求

修改后必须运行：

```bash
npm run build
```

最终回复请说明：

```text
1. 修改了哪些文件
2. 是否新增 isStreaming
3. safeStreamMessage 是否不再使用 isExploring 判断流式并发
4. 主链路残留 typeAiMessage 替换了哪些
5. sendChat 中哪些调用补了 await
6. npm run build 是否通过
7. 是否没有改 P1 指标文案
```

