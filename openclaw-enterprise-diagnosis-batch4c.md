# OpenClaw Prompt: Phase 2 Batch 4C Enterprise Diagnosis List + Evidence Detail

```text
你是资深前端工程师和 UI/UX 工程师，熟悉银行客户经理的企业风险诊断场景。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取其他旧提示词文件。

阶段定位：
Phase 2 Batch 4C：企业诊断列表与证据链详情页。
本轮目标是把企业诊断从“单个诊断报告页”扩展成完整工作流：
企业诊断列表 -> 企业诊断报告 -> 证据链详情页。

重要限制：
- 不要处理乱码。
- 不要做全文件转码。
- 不要使用 PowerShell/Node 脚本批量替换。
- 不要重构全局布局。
- 不要修改 AppSidebar.vue。
- 不要修改 GlobalInputBar.vue。
- 不要修改 tokens.css/global 样式。
- 不要引入新依赖。
- 保持当前企业诊断报告页已有的左右布局和 AI 助手结构。
- npm run build 必须通过。

允许修改：
- src/main.js
- src/pages/EnterpriseDiagnosisPage.vue
- 可以新增 src/pages/EnterpriseDiagnosisListPage.vue
- 可以新增 src/pages/EnterpriseDiagnosisEvidencePage.vue
- 如必须，可小范围修改 src/stores/enterpriseDiagnosis.js
- 如必须，可小范围补充 src/data/mockEnterpriseDiagnosis.js 的导出方法，但不要大规模清洗乱码数据。

当前代码现状：
- /enterprise-diagnosis 当前直接进入企业诊断页。
- EnterpriseDiagnosisPage.vue 既承担搜索入口，又承担诊断结果页。
- 诊断报告页里“查看证据链”仍调用 store.viewEvidence(ind)，打开 el-drawer。
- EnterpriseDiagnosisPage.vue 中 .ed-dim-section 顶部仍有 4 个统计卡片：
  - 风险事项
  - 高风险
  - 企业亮点
  - 强亮点
- 这 4 个卡片占用空间，和八大维度诊断区重复，本轮需要去掉。

本轮目标效果：
1. 新增企业诊断列表页。
2. /enterprise-diagnosis 显示企业诊断列表，而不是直接进入报告详情。
3. 新增企业诊断报告详情路由。
4. 新增证据链详情页。
5. 企业诊断报告页里的“查看证据链”不再打开抽屉，而是跳转到证据链详情页。
6. 企业诊断报告页去掉八大维度上方的 4 个统计卡片。
7. 整体仍保持当前金融工作台风格，先实现 demo 闭环，不做重视觉重构。

一、路由设计

请在 src/main.js 中新增路由：

1. 企业诊断列表页：
path: /enterprise-diagnosis
name: enterpriseDiagnosisList
component: EnterpriseDiagnosisListPage

2. 企业诊断报告详情页：
path: /enterprise-diagnosis/report/:creditCode
name: enterpriseDiagnosisReport
component: EnterpriseDiagnosisPage

3. 证据链详情页：
path: /enterprise-diagnosis/evidence/:creditCode/:indicatorId
name: enterpriseDiagnosisEvidence
component: EnterpriseDiagnosisEvidencePage

注意：
- 原来的 /enterprise-diagnosis 路由要改为列表页。
- EnterpriseDiagnosisPage 继续作为报告详情页使用。
- 不要删除 EnterpriseDiagnosisPage.vue。

二、新增企业诊断列表页

新增文件：
src/pages/EnterpriseDiagnosisListPage.vue

页面定位：
这是企业诊断模块的入口页，面向银行客户经理查看已诊断企业、发起诊断、进入报告。

页面结构建议：
1. 顶部标题区：
   - 标题：企业诊断
   - 副标题：查看企业风险诊断结果，追踪高风险指标和证据链
   - 主按钮：发起企业诊断

2. 搜索/筛选区：
   - 输入框：搜索企业名称 / 统一社会信用代码
   - 筛选 chip：
     - 全部
     - 高风险
     - 中风险
     - 低风险

3. 企业诊断列表：
   使用宽表格或紧凑列表，不要卡片宫格。
   列建议：
   - 企业名称
   - 行业
   - 统一社会信用代码
   - 综合评分
   - 评级
   - 风险事项
   - 高风险
   - 最近诊断时间
   - 状态
   - 操作

4. 每行操作：
   - 查看诊断
   - 查看证据链
   - 生成报告

交互要求：
- 点击“查看诊断”跳转：
  /enterprise-diagnosis/report/91130203MA7EEQ2N0T

- 点击“查看证据链”默认跳转到该企业第一个高风险指标：
  /enterprise-diagnosis/evidence/91130203MA7EEQ2N0T/R1

- 点击“发起企业诊断”可以沿用当前 EnterpriseDiagnosisPage 的搜索/诊断能力，跳转到：
  /enterprise-diagnosis/report/91130203MA7EEQ2N0T
  demo 阶段可以先直接进入唐山物桥报告。

数据来源：
- 可以从 src/data/mockEnterpriseDiagnosis.js 的 enterpriseDB、getDiagnosisMock 构造列表数据。
- demo 阶段至少展示 5 条企业。
- 唐山物桥商贸有限公司必须作为第一条。
- 如果其他企业 mock 数据不完整，可以用 getDiagnosisMock 生成简化评分和风险等级。

三、改造 EnterpriseDiagnosisPage.vue 为报告详情页

当前 EnterpriseDiagnosisPage.vue 继续承载报告详情。

要求：
1. 它可以根据 route.params.creditCode 加载诊断结果。
2. 如果没有 route.params.creditCode，也可以默认使用 91130203MA7EEQ2N0T，避免页面空白。
3. 返回按钮不要 store.reset() 回到搜索态，而是返回企业诊断列表：
   router.push('/enterprise-diagnosis')

注意：
- 不要重做整个页面。
- 保留当前 AI 综合诊断、八大维度、核心风险和亮点、右侧 AI 助手。
- 保留右侧助手收起/展开能力。

四、去掉八大维度上方 4 个统计卡片

在 EnterpriseDiagnosisPage.vue 中删除或隐藏 .ed-metrics .ed-metrics--compact 这组统计卡片：
- 风险事项
- 高风险
- 企业亮点
- 强亮点

要求：
- 八大维度诊断结果标题直接出现在 AI 综合诊断下面。
- 不要保留空白。
- 相关 CSS 如果不再使用可以保留，不强制删除。

五、证据链详情页

新增文件：
src/pages/EnterpriseDiagnosisEvidencePage.vue

页面定位：
证据链详情页是风险指标的完整审阅页，不再使用抽屉承载完整证据链。

路由：
/enterprise-diagnosis/evidence/:creditCode/:indicatorId

页面结构建议：

1. 顶部栏：
   - 圆形返回按钮：返回诊断报告
   - 企业名称
   - 指标名称
   - 标签：高风险 / 中风险 / 低风险 或 强亮点 / 亮点
   - 所属维度
   - 当前检测值或摘要

返回按钮跳转：
/enterprise-diagnosis/report/:creditCode

2. 主体两栏：

左侧主内容：
- 风险结论
- 数据事实
- 模型规则
- 推理过程
- 指标数据明细
- 原始证据列表

右侧辅助面板：
- 指标说明
- 行动建议
- AI 证据链助手
- 加入报告
- 生成专项说明

3. 证据链内容生成：
根据 indicatorId 找到对应 indicator。
根据 indicator.evidenceIds 找到 evidenceChain 明细。
展示每条 evidence 的：
- source
- title
- value
- comparison
- collectedAt
- confidence

4. 页面文案需要清晰：
- 数据事实：展示 indicator.fact
- 模型规则：根据风险等级给出模拟规则说明
- 推理过程：说明为什么该指标支持当前风险判断
- 行动建议：提示客户经理下一步核实动作

六、企业诊断报告页“查看证据链”改为跳转

在 EnterpriseDiagnosisPage.vue 中：
当前风险列表按钮：
@click.stop="store.viewEvidence(ind)"

改为跳转证据链详情页：
router.push(`/enterprise-diagnosis/evidence/${r.enterprise.creditCode}/${ind.id}`)

右侧 AI 助手里的“查看证据链”按钮也应跳转详情页：
- 如果 selectedIndicator 存在，跳转对应 indicator。
- 如果没有 selectedIndicator，提示：请先选择一个指标。

七、抽屉处理

本轮证据链主入口改为详情页。
可以保留 el-drawer 代码暂不删除，但不要再从主按钮打开抽屉。

如果决定删除抽屉，也可以删除：
- el-drawer template
- evidenceDrawerOpen 相关调用

但不要大改 store。更稳妥做法：
- 保留 store.viewEvidence 不动
- 新增页面内跳转函数 openEvidencePage(ind)
- 报告页按钮改用 openEvidencePage(ind)

八、AI 对话联动，本轮只做轻量支持

不要做复杂自然语言解析。
只做两个明确入口：

1. 列表页行操作“查看证据链”跳转详情页。
2. 报告页右侧 AI 助手“查看证据链”跳转详情页。

自然语言“查看某个指标证据链”的识别可以留到下一批。

九、验收标准

1. npm run build 通过。
2. /enterprise-diagnosis 显示企业诊断列表页。
3. 点击唐山物桥“查看诊断”进入 /enterprise-diagnosis/report/91130203MA7EEQ2N0T。
4. 企业诊断报告页不再显示八大维度上方 4 个统计卡片。
5. 报告页点击任意指标“查看证据链”进入证据链详情页。
6. /enterprise-diagnosis/evidence/91130203MA7EEQ2N0T/R1 能展示营收增长异常的证据链详情。
7. 证据链详情页包含：数据事实、模型规则、推理过程、行动建议、原始证据列表。
8. 返回按钮能从证据链详情页回到诊断报告页。
9. 不引入新的乱码。
10. 不破坏企业诊断报告页已有左右布局和右侧 AI 助手。

完成后请回复：
- 新增了哪些文件
- 修改了哪些路由
- “查看证据链”现在如何跳转
- 4 个统计卡片是否已移除
- npm run build 是否通过
```
