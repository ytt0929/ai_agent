# OpenClaw Prompt：企业探查 Phase 1（P0 + P1）稳定 Demo 与单指标轻问答

你是资深 Vue 3 前端工程师、资深 UX 工程师。请在 `D:\demo\ai-copilot` 项目中修复企业探查工作区的第一阶段问题。本阶段只做 P0 + P1：稳定 Demo 主链路、修复 AI 流式输出卡住、统一单指标/单事实轻问答。不要做 P2/P3 的大重构和视觉大改。

## 0. 先读需求文档

请先阅读：

```text
docs/enterprise-exploration-product-direction.md
```

重点阅读其中：

```text
2026-07-02 补充：对话优先的企业探查工作区设计
P0：跑通 Demo 主链路和流式稳定
P1：统一单指标和单事实轻问答
```

## 1. 本次允许修改的文件

优先只修改：

```text
src/pages/EnterpriseExplorationWorkspacePage.vue
```

如确实需要补充非常少量 demo 常量，可以修改：

```text
src/data/mockEnterpriseSourceData.js
```

但原则上唐山物桥数据已经存在，不要重写 mock 数据。

## 2. 严禁修改范围

不要修改：

```text
src/pages/EnterpriseDiagnosisListPage.vue
src/pages/EnterpriseDiagnosisPage.vue
src/pages/EnterpriseDiagnosisEvidencePage.vue
src/pages/WorkbenchPage.vue
src/pages/DueDiligence*.vue
src/pages/SmartReportPage.vue
src/components/AppSidebar.vue
src/main.js
src/styles/tokens.css
```

不要改路由、侧边栏、首页查询示例、企业探查首页布局、智能尽调、智能报告、企业监测等模块。

不要批量重写中文文案。不要做编码转换。不要把页面改成乱码。终端显示乱码不代表浏览器乱码，除非你在浏览器里确认，否则不要处理编码。

## 3. P0 目标：稳定 Demo 主链路

当前问题：

1. 企业探查对话页 AI 回复存在流式输出卡住问题，有时只输出一个字，例如“税”。
2. `typeAiMessage` 逐字输出，且部分调用没有 `await`，可能出现并发流式输出。
3. `runExploreFlow` 多处分支手动设置 `isExploring = false`，异常时可能无法释放。
4. 当页面需要用户输入企业名称/税号时，当前只是提示用户输入，Demo 操作者还要手动知道该输什么。

### 3.1 固定 Demo 企业

只要页面进入「需要用户输入企业名称或统一社会信用代码才能继续」的状态，就默认在输入框中填入：

```text
91130203MA7EEQ2N0T
```

对应企业：

```text
唐山物桥商贸有限公司
```

注意：

- 不是只在 `_new` 页面填。
- 只要没有企业上下文、需要用户补企业身份，就默认填入该税号。
- 用户仍然需要点击发送确认。
- 如果 URL 中有 `q` 参数，例如 `/enterprise-diagnosis/workspace/_new?q=计算税负率`，则发送税号识别企业后，再继续处理原来的 pending question。

目标链路：

```text
进入 /enterprise-diagnosis/workspace/_new?q=计算税负率
   │
   ├─ AI 提示：请先输入企业名称或统一社会信用代码
   ├─ 输入框默认：91130203MA7EEQ2N0T
   ├─ 用户点击发送
   ├─ 系统识别：唐山物桥商贸有限公司
   ├─ AI 提示已识别企业，并继续处理原问题
   └─ AI 回答税负率
```

### 3.2 修复流式输出卡住

请新增一个安全输出函数，例如：

```js
async function safeStreamMessage(fullText, options = {}) {}
```

要求：

1. 不允许多个 AI 回复同时流式输出。
2. 输出时可以按 3-6 个字符一批更新，不要逐字慢慢输出。
3. 输出过程中节流 `scrollToBottom()`，不要只在最后滚动。
4. 输出完成后再挂载 `options.actions`。
5. 如果输出异常，必须兜底写入完整或错误提示，不允许页面停在一个字。
6. 最终必须释放流式状态。

可以保留原 `typeAiMessage`，但核心路径应改为使用 `safeStreamMessage`。至少覆盖：

```text
runExploreFlow
sendChat 中识别企业后的 AI 回复
handleReportRequest 中关键回复
runReportGenerationFlow 中关键回复
```

不要遗漏没有 `await` 的调用。凡是会影响用户主链路的 AI 回复，都必须 `await safeStreamMessage(...)`。

### 3.3 runExploreFlow 状态释放

重构 `runExploreFlow(text)`：

```js
async function runExploreFlow(text) {
  if (isExploring.value) return
  isExploring.value = true
  try {
    // classify + reply + optional left view
  } catch (error) {
    console.error(error)
    await safeStreamMessage('当前问题已识别，但回复生成异常。你可以重新发送或点击下方快捷问题继续。')
  } finally {
    isExploring.value = false
  }
}
```

不要在每个分支里散落大量 `isExploring.value = false`。可以保留必要 return，但释放必须由 `finally` 兜底。

## 4. P1 目标：单指标 / 单事实轻问答

### 4.1 单指标不切左侧

以下类型仍然只在右侧 AI 对话中回答，不主动切换左侧结果区：

```text
税负率是多少
计算税负率
收入同比是多少
收入增长是多少
```

如果当前已经有左侧视图，也不要因为单指标问题主动切到别的视图。

### 4.2 单指标回复结构

单指标回复必须包含：

```text
指标结果
计算公式
数据口径
指标说明
数据来源
可选下一步按钮
```

单指标回复严禁包含：

```text
异常判断
风险评价
偏低 / 偏高 / 异常 / 高风险 等判断词
建议核验风险
```

税负率示例：

```text
唐山物桥商贸有限公司近 12 个月增值税税负率为 0.8%。

计算公式：
税负率 = 已缴增值税 / 开票收入 × 100%
       = 17.40 万 / 2175.46 万 × 100%
       = 0.8%

数据口径：
- 统计周期：近 12 个月
- 开票收入：2175.46 万元
- 已缴增值税：17.40 万元

指标说明：
税负率用于描述企业在一定期间内增值税缴纳金额与收入规模之间的比例关系。
不同地区、行业、业务结构和税收政策下，税负率水平可能存在差异。

数据来源：
税票数据 / 纳税申报数据
```

收入同比示例：

```text
唐山物桥商贸有限公司近 12 个月收入同比为 188.3%。

计算公式：
收入同比 = (本期收入 - 上期收入) / 上期收入 × 100%

数据口径：
- 本期收入：2275.98 万元
- 上期收入：789.34 万元
- 统计周期：近 12 个月

指标说明：
收入同比用于描述企业收入在相邻可比期间之间的变化幅度。
它只反映增长或下降比例，不单独代表经营质量或风险水平。

数据来源：
开票数据 / 纳税申报数据
```

### 4.3 单事实回复结构

单事实类问题，例如：

```text
法人是谁
成立时间
行业是什么
纳税人类型
```

只在右侧对话中回答：

```text
事实结果
数据来源
可选下一步按钮
```

不切换左侧结果区。

## 5. 不要做的事情

本阶段不要做：

```text
1. 不要重构成完整 answer plan。
2. 不要大改左侧结果区结构。
3. 不要做 Element Plus + token.css 的视觉治理。
4. 不要重写企业探查首页。
5. 不要修改其他业务模块。
6. 不要在页面上展示“问题类型分流规则表”。
7. 不要添加新的复杂功能。
```

P2 和 P3 留到后续阶段。

## 6. 验收路径

请完成后按下面路径自测：

### 6.1 税负率 Demo 链路

```text
访问 /enterprise-diagnosis/workspace/_new?q=计算税负率
确认输入框默认填入 91130203MA7EEQ2N0T
点击发送
确认识别唐山物桥商贸有限公司
确认自动继续处理“计算税负率”
确认右侧回复包含：指标结果 / 计算公式 / 数据口径 / 指标说明 / 数据来源
确认回复中没有：偏低 / 异常 / 风险 / 高风险 等评价词
确认左侧结果区不切换
确认发送按钮恢复可用
```

### 6.2 收入同比链路

```text
输入：收入同比是多少
确认右侧回复包含公式、口径、说明、来源
确认不做异常判断
确认左侧不切换
```

### 6.3 明细类仍可打开左侧

```text
输入：查看股东明细
确认左侧打开股东明细表
确认右侧只做解释和引导
```

### 6.4 风险类仍可打开左侧

```text
输入：是否存在欺诈风险
确认左侧打开风险/欺诈分析视图
确认右侧输出结论和下一步按钮
```

### 6.5 流式稳定性

连续测试：

```text
计算税负率
收入同比是多少
查看股东明细
是否存在欺诈风险
生成企业诊断报告
```

确认：

```text
不出现只输出一个字
不长时间显示“探查中”
不出现多个 AI 气泡同时流式输出
控制台无 Vue runtime error
```

## 7. 构建要求

修改后必须运行：

```bash
npm run build
```

最终回复请说明：

```text
1. 修改了哪些文件
2. P0 做了哪些修复
3. P1 做了哪些修复
4. 是否修改了其他模块
5. npm run build 是否通过
6. 手动验收路径是否跑过，结果如何
```

