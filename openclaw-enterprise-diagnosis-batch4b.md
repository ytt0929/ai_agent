# OpenClaw Prompt: Phase 2 Batch 4B Enterprise Diagnosis Assistant Actions Fix

```text
你是资深前端工程师、UI/UX 工程师，同时熟悉银行客户经理风控诊断场景。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取旧提示词文件。

阶段定位：
第二阶段 Batch 4B：企业诊断结果页右侧 AI 风险研究助手交互收口。
上一轮已经完成右侧 AI 面板布局修复，本轮不要再改布局。
本轮只修一个核心问题：右侧 AI 风险研究助手的快捷按钮绑定了不存在的函数，点击会无效或运行时报错。

重要限制：
- 只修改 src/pages/EnterpriseDiagnosisPage.vue。
- 不要修改 src/data/mockEnterpriseDiagnosis.js。
- 不要修改 src/stores/enterpriseDiagnosis.js。
- 不要修改路由、全局样式、其他页面。
- 不要引入新依赖。
- 不要处理乱码。
- 不要做全文件转码。
- 不要使用 PowerShell/Node 脚本批量替换。
- 不要改页面布局。
- 不要移动 .ed-report-layout。
- 不要改 CSS。
- 不要改 DOM 结构。
- 不要重写整页。

当前页面状态：
- 企业诊断页已能打开。
- npm run build 当前可以通过。
- .ed-report-layout 已经在 .ed-topbar 后面。
- 左侧 .ed-report-main 已包含：
  - .ed-diag-main
  - .ed-dim-section
  - .ed-workbench
- 右侧 .ed-report-aside 已包含 .ed-assistant。
- 但是模板中有 3 个按钮绑定了不存在的函数：
  - handleExplainDeduction
  - handleGenerateSpecialNote
  - handleAddToReport

本轮目标效果：
1. 点击“解释扣分原因”不会报错，并在聊天区生成具体解释。
2. 点击“生成专项说明”不会报错，并在聊天区生成可加入报告的说明草稿。
3. 点击“加入报告”不会报错，并给出明确反馈，同时在聊天区追加结果。
4. 未选中维度或指标时，按钮给出合理提示。
5. 已选中指标时，内容围绕该指标生成。
6. 已选中维度但未选中指标时，内容围绕该维度生成。

具体修改：

1. 在 <script setup> 中补齐以下函数

必须新增：
- handleExplainDeduction()
- handleGenerateSpecialNote()
- handleAddToReport()

2. handleExplainDeduction 行为

如果 store.selectedIndicator 存在：
- 向 store.chatMessages 追加一条 user 消息：
  解释扣分原因
- 再追加一条 ai 消息，内容包含：
  - 指标名称
  - 所属维度
  - 风险等级/亮点等级
  - 事实摘要
  - 为什么会影响诊断判断

如果没有 selectedIndicator，但有 store.activeDimension：
- 找到当前维度名称。
- 追加一条 user 消息：
  解释该维度的扣分原因
- 再追加一条 ai 消息，说明该维度的风险/亮点概况。

如果两者都没有：
- 使用 ElMessage.warning('请先选择一个维度或指标')

3. handleGenerateSpecialNote 行为

如果 store.selectedIndicator 存在：
- 向聊天区追加 user 消息：
  生成专项说明
- 追加 ai 消息，生成一段可直接放入报告的专项说明草稿。
- 草稿需包含：
  - 指标名称
  - 风险事实
  - 判断依据
  - 建议动作

如果没有 selectedIndicator，但有 activeDimension：
- 围绕维度生成专项说明。

如果两者都没有：
- ElMessage.warning('请先选择一个维度或指标')

4. handleAddToReport 行为

如果 store.selectedIndicator 存在：
- 调用 store.logOperation('加入报告', store.selectedIndicator.name)
- ElMessage.success('已加入报告草稿')
- 向聊天区追加 ai 消息：
  已将「指标名称」加入报告草稿，可在智能报告中继续编辑。

如果没有 selectedIndicator，但有 activeDimension：
- 调用 store.logOperation('加入报告', activeDimensionName.value)
- ElMessage.success('已加入报告草稿')
- 向聊天区追加 ai 消息：
  已将「维度名称」相关分析加入报告草稿。

如果两者都没有：
- ElMessage.warning('请先选择一个维度或指标')

5. 内容生成要求

不要只写“已生成”。
要写出对客户经理有用的模拟分析内容。
可以使用这些现有字段：
- store.selectedIndicator.name
- store.selectedIndicator.dimensionName
- store.selectedIndicator.level
- store.selectedIndicator.fact
- activeDimensionName.value
- filteredIndicators.value
- r.value.summary
- r.value.suggestions

6. 不要改模板结构
模板中按钮已经存在：
- 解释扣分原因
- 查看证据链
- 生成专项说明
- 加入报告

除非发现函数名不一致，否则不要改 template。

不要修改：
- AppSidebar.vue
- main.js
- router
- global/tokens 样式
- mock 数据
- store
- 其他业务页面
- 依赖包

验收标准：
1. npm run build 通过。
2. 点击“解释扣分原因”不报错，并出现具体 AI 回复。
3. 点击“生成专项说明”不报错，并出现具体草稿内容。
4. 点击“加入报告”不报错，并出现成功提示和聊天反馈。
5. 未选择指标/维度时，三个按钮都有明确提示。
6. 不改变右侧 AI 面板布局。
7. 不新增乱码，不改业务数据。

完成后请回复：
- 修改了哪些文件
- 新增了哪些函数
- 三个按钮分别做了什么
- npm run build 是否通过
```
