# OpenClaw 提示词：工作台到智能尽调主流程骨架与状态机第一阶段

你是资深 Vue 前端工程师和资深 UX/UI 工程师。请基于当前项目已有页面和组件，实现【工作台 AI Copilot → 筛客 → 企业探查 → 新建尽调 → 尽调流程 → 报告编辑模式】的第一阶段 demo 主链路。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本阶段目标

本阶段只做“主流程骨架和状态机”，不要追求所有节点产物细节一次性完整。

目标是让 demo 能稳定跑通下面这条主链路：

```text
工作台首页输入默认筛客条件
→ 进入 AI Copilot 二级页
→ 左侧展示智能筛客结果
→ 选择/探查「唐山物桥商贸有限公司」
→ 左侧展示企业探查结果
→ 点击/选择新建尽调
→ 选择「标准授信尽调」
→ 进入尽调任务模式
→ 自动推进工商核验、司法查询
→ 进入税票采集等待授权
→ 用户确认发送采集链接
→ 用户点击模拟企业已授权
→ 展示税票采集完成
→ 进入资料补充
→ 模拟资料补充完成
→ 进入证据整合
→ 进入风险诊断
→ 进入产物确认
→ 点击编辑报告
→ 左侧切换为报告编辑模式，右侧 AI Copilot 保持不收起
```

第一阶段验收重点：

```text
1. 链路能走通。
2. 左侧结果区能根据当前阶段切换。
3. 右侧 AI 对话能用脚本话术推动下一步。
4. 点击快捷动作不会报错。
5. 不跳转到智能报告页面，报告编辑模式在左侧结果区内切换。
```

## 1. 必读文档

先阅读下面讨论文档，不要凭空设计：

```text
docs/workbench-due-diligence-workspace-discussion.md
```

重点阅读：

```text
第 1 章：基本定位
第 2 章：页面状态
第 3 章：复用组件建议
第 8.7 节：产物确认与报告编辑模式
第 9 章：节点交互话术与流程推进
```

## 2. 必读代码

请优先阅读并复用这些文件：

```text
src/pages/WorkbenchPage.vue
src/stores/workbenchAssistant.js
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/WorkbenchConversation.vue
src/components/workbench/WorkbenchStageStrip.vue
src/components/workbench/artifacts/ScreeningArtifact.vue
src/components/workbench/artifacts/EnterpriseExploreArtifact.vue
src/components/workbench/artifacts/BusinessVerifyArtifact.vue
src/components/workbench/artifacts/TaxCollectionArtifact.vue
src/components/workbench/artifacts/MaterialsArtifact.vue
src/components/workbench/artifacts/RiskDiagnosisArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
src/components/workbench/artifacts/DueDiligenceArtifact.vue
src/styles/tokens.css
src/styles/global.css
```

如需参考智能报告编辑方式，再阅读：

```text
src/pages/SmartReportPage.vue
src/stores/smartReport.js
src/data/mockSmartReport.js
```

## 3. 硬性限制

必须遵守：

```text
1. 不要新增路由。
2. 不要新增依赖。
3. 不要把工作台流程做成跳转页面。
4. 不要跳转到智能报告页面。
5. 不要在左侧结果区里再嵌入一套 AI 对话。
6. 不要修改企业探查、智能尽调、税票采集、资料识别、智能报告等独立模块的现有功能。
7. 本阶段只允许在工作台相关 store、workbench 组件、必要的 workbench artifacts 内做增量修改。
8. 必须使用 Element Plus 组件承载按钮、标签、进度、表格、卡片等基础 UI。
9. 样式必须优先使用 tokens.css / global.css 中已有 token。
10. 不要大规模重构已有页面。
11. 不要删除已有 mock 数据。
12. 不要把过程卡片堆在右侧对话中，右侧只放对话和快捷动作。
13. 当前阶段产生的业务结果必须展示在左侧结果区。
```

## 4. 第一阶段建议改动范围

优先改这些文件：

```text
src/stores/workbenchAssistant.js
src/pages/WorkbenchPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/components/workbench/WorkbenchConversation.vue
src/components/workbench/WorkbenchStageStrip.vue
src/components/workbench/artifacts/*.vue
```

如当前 artifacts 已经能承载左侧结果，只做补齐和连接，不要重写。

## 5. 状态机要求

在 `src/stores/workbenchAssistant.js` 中整理并稳定主流程状态。

建议统一阶段 key：

```text
screen              智能筛客
explore             企业探查
monitor             加入监控
dueDiligence        新建尽调
business            工商核验
judicial            司法查询
tax                 税票采集
materials           资料补充
evidence            证据整合
riskDiagnosis       风险诊断
deliverables        产物确认
reportEditor        报告编辑
```

如果当前代码没有 `judicial` 或 `evidence` 的独立 artifact，可以第一阶段先用轻量占位结果面板，但必须在流程条里出现，并能推进。

必须确保这些状态数据稳定：

```text
dialogOpen
layoutMode
messages
flowStages
activeStageId
activeTool
leftPanelData
selectedEnterprise
selectedDueTemplate
currentFlowStatus
contextSuggestions
```

禁止出现：

```text
activeStageId 已切换但 leftPanelData 为空
flowStages 有阶段但 stage.artifactData 为 null
当前阶段没有兜底数据导致页面空白
右侧消息重复刷屏
点击快捷动作后浏览器报 Vue patch 错误
```

## 6. 主流程脚本

### 6.1 首页默认输入

工作台首页保留当前 AI 优先输入区。

默认查询示例：

```text
筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户
```

点击“直接发送”或输入框发送后：

```text
1. 打开 AI Copilot 二级页。
2. 初始为居中对话态。
3. AI 识别意图后切换为左右布局态。
4. 左侧显示智能筛客结果。
```

### 6.2 智能筛客

右侧话术：

```text
AI：已收到需求，正在识别你的操作意图。
AI：识别到“智能筛客”工具。筛选条件为：浙江省、制造业、低风险、近一年有开票记录、适合转尽调。
AI：已完成筛客，识别到 6 家候选企业。请在左侧选择一家企业继续探查，或继续调整筛选条件。
```

左侧要求：

```text
1. 展示筛客摘要：匹配企业 128 家、高风险过滤 98 家、适合转尽调 6 家。
2. 展示候选企业表格。
3. 第一条必须是「唐山物桥商贸有限公司」。
4. 每行有“探查”动作。
```

候选名单必须包含：

```text
唐山物桥商贸有限公司
杭州智造科技有限公司
宁波天合新材料股份有限公司
温州瑞达机械制造有限公司
嘉兴恒力纺织有限公司
绍兴金轮精密工业有限公司
```

用户点击「探查 唐山物桥商贸有限公司」后进入企业探查。

### 6.3 企业探查

右侧话术：

```text
AI：已选择「唐山物桥商贸有限公司」，正在进入企业探查。
AI：正在查询企业工商、司法、税票和风险相关数据。
AI：已完成企业探查。该企业主体状态正常，存在部分经营和税务风险事项，左侧已展示探查结果。
AI：你可以将该企业加入监控，也可以新建尽调任务。两个动作是并列选择，后续也可以互相转入。
```

左侧第一阶段要求：

```text
1. 展示企业基础信息。
2. 展示风险事项摘要。
3. 展示“加入监控”和“新建尽调”两个并列动作。
4. 新建尽调不能自动触发，必须由用户动作触发。
```

### 6.4 加入监控分支

如果用户点击加入监控：

```text
AI：已将该企业加入监控。后续如果监控发现异常，也可以从监控转入尽调。
```

左侧显示简单监控状态即可：

```text
监控中
监控维度：工商变更 / 司法风险 / 税务异常 / 舆情风险
最近一次检查：暂无新增异常
```

并继续保留“新建尽调”动作。

### 6.5 新建尽调 / 模板选择

点击新建尽调后：

```text
AI：请先选择尽调模板。
AI：建议使用「标准授信尽调」，适用于制造业客户授信前审查。
```

左侧显示模板选择卡片：

```text
标准授信尽调
小微快审尽调
税票专项尽调
```

点击「标准授信尽调」后：

```text
AI：已创建尽调任务。正在进入智能尽调流程，第一步是工商核验。
```

随后左侧进入尽调任务模式。

### 6.6 尽调任务模式

新建尽调后，左侧顶部要出现统一任务头部和流程条。

任务头部信息：

```text
唐山物桥商贸有限公司
建材批发 / 商贸流通 · 河北唐山 · 500万
标准授信尽调
当前状态：根据当前节点变化
总进度：根据节点变化
```

流程条：

```text
工商核验 → 司法查询 → 税票采集 → 资料补充 → 证据整合 → 风险诊断 → 产物确认
```

第一阶段可以继续使用 `WorkbenchStageStrip.vue`，但要保证状态清晰：

```text
done      已完成
active    当前节点
pending   未开始
```

### 6.7 工商核验

右侧话术：

```text
AI：正在核验工商登记、主体状态、注册资本、法定代表人和关联企业。
AI：工商核验已完成。企业主体正常存续，暂未发现重大工商异常。
AI：下一步将进入司法查询，继续核验诉讼、执行和处罚风险。
```

推进方式：

```text
自动进入司法查询，不需要用户确认。
```

左侧第一阶段展示：

```text
工商核验 · 已完成
主体状态：正常存续
注册资本：500万
法定代表人：张三
关联企业：3 家
结论：主体状态正常，未发现重大工商异常
```

### 6.8 司法查询

右侧话术：

```text
AI：正在查询司法诉讼、被执行、失信、行政处罚和裁判文书信息。
AI：司法查询已完成。未发现重大司法风险，存在少量历史普通记录，已归入证据链。
AI：下一步将进入税票采集，需要企业授权后才能继续采集税票数据。
```

推进方式：

```text
自动进入税票采集。
```

左侧第一阶段展示：

```text
司法查询 · 已完成
重大诉讼：0
被执行信息：0
失信记录：0
行政处罚：0
历史普通记录：2
```

### 6.9 税票采集

进入税票采集后先停在等待用户确认状态。

右侧话术：

```text
AI：已生成税票采集授权链接。请发送给企业扫码授权，有效期 24 小时。
AI：授权完成前，左侧会展示等待授权状态和采集清单。
```

左侧等待授权展示：

```text
税票采集 · 等待企业授权
授权状态：等待授权
链接状态：已生成 / 待发送
授权链接：https://ai-copilot.demo/auth/rpa002
采集进度：0 / 12，0%
采集清单：纳税申报表、增值税发票、企业所得税、完税证明、发票明细、纳税评级等
```

快捷动作：

```text
确认发送采集链接
复制授权链接
改为上传材料
```

用户点击确认发送采集链接：

```text
AI：采集链接已发送。等待企业线下扫码授权完成后，可以点击“模拟企业已授权”继续。
```

然后显示快捷动作：

```text
模拟企业已授权
发送提醒
改为上传材料
```

用户点击模拟企业已授权：

```text
AI：企业已完成授权，正在采集进项发票、销项发票和纳税申报数据。
AI：税票数据采集完成。左侧已展示采集进度、发票数量和采集日志。
AI：下一步将进入资料补充，当前资料包完整度预计为 67%。
```

左侧采集完成展示：

```text
税票采集 · 已完成
授权状态：已授权
链接状态：已使用
进项发票：128 / 150，85%
销项发票：96 / 120，80%
纳税申报：已采集
采集日志：生成链接、企业授权、RPA 登录、进项采集、销项采集、申报采集
```

### 6.10 资料补充

右侧话术：

```text
AI：已根据「标准授信尽调」模板生成资料包。当前识别到 8 项资料，缺失 4 项。
AI：我可以生成资料收集清单，发送给企业补充，也可以在 demo 中模拟企业已上传资料。
```

左侧展示：

```text
资料补充 · 待补充
资料包完整度：67%
已收集：营业执照、近一年纳税申报、开票明细、基础工商资料等
缺失：主要合同、银行流水、购销说明、税负异常说明
```

快捷动作：

```text
发送资料清单
模拟企业上传资料
先进入风险诊断
```

用户点击模拟企业上传资料：

```text
AI：已收到企业补充资料，正在识别营业执照、合同、银行流水和税务说明。
AI：资料识别完成。当前资料包完整度提升至 86%，仍有 2 项需要后续确认。
AI：下一步将进入证据整合。
```

### 6.11 证据整合

右侧话术：

```text
AI：正在整合工商核验、司法查询、税票采集和资料识别结果，生成本次尽调证据链。
AI：证据整合完成。已形成工商证据、税票证据、资料证据和风险关联证据。
AI：当前证据完整度为 86%，可以进入风险诊断；缺失项会作为报告中的待确认事项保留。
```

左侧第一阶段展示：

```text
证据整合 · 已完成
证据完整度：86%
工商证据：已归档
司法证据：已归档
税票证据：已归档
资料证据：部分待确认
风险关联证据：已建立
```

### 6.12 风险诊断

右侧话术：

```text
AI：正在基于企业探查结果、税票采集数据、资料包和证据链生成风险诊断。
AI：风险诊断已完成。该企业整体为中风险，主要风险集中在税负率偏低、收入一致性和业务真实性。
AI：左侧已展示核心风险事项。你可以查看完整诊断报告，也可以直接同步到最终尽调报告。
```

左侧第一阶段展示：

```text
风险诊断 · 已完成
综合评分：72 / 100
风险等级：中风险
证据完整度：86%
核心风险事项：
  - 税负率显著低于行业
  - 营收增长异常
  - 短期偿债压力过大
  - 开票收入与申报收入不一致
  - 购销两头在外
诊断结论：建议有条件授信，补充交易真实性和税负异常说明。
```

快捷动作：

```text
查看诊断报告
同步到最终报告
进入产物确认
```

第一阶段“查看诊断报告”可以打开一个轻量抽屉或在左侧展示摘要，不要求完整长报告。

### 6.13 产物确认

右侧话术：

```text
AI：产物已生成，包括尽调报告草稿、资料包、证据链和附件清单。
AI：当前还有 2 项待确认：税负率异常说明、购销两头在外的业务解释。
AI：你可以开始确认资料包，也可以进入报告编辑模式继续修改报告。
```

左侧第一阶段展示：

```text
产物确认 · 待确认
尽调报告草稿：已生成
资料包：18 份
证据链：24 份
附件清单：已归档
待确认项：2 项
```

快捷动作：

```text
编辑报告
导出报告
加入监控
```

### 6.14 报告编辑模式

用户点击编辑报告后：

```text
AI：已进入报告编辑模式。左侧是报告目录和正文，你可以选择章节修改，也可以让我辅助改写。
AI：我已定位到“风险诊断”章节，可以帮你改写风险结论、补充缓释措施或检查证据链。
```

左侧必须切换为报告编辑模式，不跳转页面，不收起右侧 AI。

第一阶段左侧展示：

```text
唐山物桥商贸有限公司 尽职调查报告
标准授信尽调 · 资料完整度 86% · 待确认 2 项

左栏：报告目录
  一 企业概况
  二 工商核验
  三 税票分析
  四 风险诊断
  五 授信建议
  六 附件清单

右栏：当前章节正文
  标题 / 状态 / 资料完整度
  正文内容
  本章证据链
  关联资料
  待确认项
```

快捷动作：

```text
改写风险结论
补充税票说明
生成授信建议
检查证据链
导出最终报告
```

第一阶段可以先做静态编辑态，不要求真实富文本编辑器，但必须有“修改本节 / 保存草稿”的按钮和视觉反馈。

## 7. 右侧 AI 对话规范

右侧 AI Copilot 只承担：

```text
1. 状态说明。
2. 用户确认。
3. 推动下一步。
4. 提供快捷动作。
```

不要在右侧堆叠：

```text
流程大卡片
税票采集结果大卡片
工商核验大卡片
风险诊断长报告
报告目录和正文
```

这些内容都应该进入左侧结果区。

## 8. 左右布局规范

二级页布局保持：

```text
左侧：业务结果 / 尽调任务工作区
右侧：AI Copilot 对话
```

要求：

```text
1. 右侧 AI 面板固定宽度，建议 380px-460px。
2. 左侧结果区独立滚动。
3. 右侧对话区独立滚动。
4. 页面本身不要出现混乱的双滚动。
5. 对话面板顶部不要贴到浏览器顶端，要与企业探查页面风格一致。
6. 用 Element Plus 的 Button、Tag、Progress、Table、Card、Drawer 等组件。
```

## 9. 组件和数据建议

如果当前组件已经存在，优先复用：

```text
WorkbenchStageStrip
WorkbenchBusinessPanel
WorkbenchConversation
ScreeningArtifact
EnterpriseExploreArtifact
BusinessVerifyArtifact
TaxCollectionArtifact
MaterialsArtifact
RiskDiagnosisArtifact
DeliverablesArtifact
ReportEditorArtifact
DueDiligenceArtifact
```

如需新增第一阶段轻量组件，建议只新增：

```text
src/components/workbench/artifacts/JudicialArtifact.vue
src/components/workbench/artifacts/EvidenceMergeArtifact.vue
```

并在 `WorkbenchBusinessPanel.vue` 中注册。

不要新增大型页面。

## 10. 关键数据

必须围绕这家企业跑通：

```text
企业名称：唐山物桥商贸有限公司
统一社会信用代码：91130203MA7EEQ2N0T
行业：商贸流通 / 建材批发
区域：河北唐山
注册资本：500万
风险等级：中风险
综合评分：72 / 100
资料完整度：86%
```

风险事项：

```text
营收增长异常
购销两头在外
短期偿债压力过大
应收账款周转率下降
税负率显著低于行业
开票收入与申报收入不一致
电费与收入相关性低
公司成立时间较短
```

亮点：

```text
纳税信用 A 级
主体状态正常
无重大司法诉讼
```

## 11. Vue 稳定性要求

重点修复并避免这些问题：

```text
Cannot read properties of null (reading 'subTree')
Cannot set properties of null (setting '__vnode')
leftPanelData 为 null 导致左侧空白
component :is 组件切换时 key 不稳定
v-if / v-for 切换导致同层节点结构不稳定
```

建议：

```text
1. 所有 artifact data 都给默认对象。
2. `component :is` 使用稳定 key，例如 `${tool}-${data.currentStage || data.status || 'default'}`。
3. 切换阶段时先写入完整 artifactData，再 setActiveStage。
4. 不要先创建空 stage 再异步补数据。
5. 不要在同一层频繁切换完全不同根节点，必要时用固定 wrapper。
6. 所有数组字段默认 `[]`，所有对象字段默认 `{}`。
```

## 12. 验收方式

完成后请执行：

```text
npm run build
```

如果能启动预览，请用浏览器验证：

```text
http://localhost:4177/#workbench
```

至少手工走通：

```text
1. 工作台首页点击“直接发送”。
2. 进入二级页，看到智能筛客结果。
3. 点击唐山物桥商贸有限公司的探查。
4. 点击新建尽调。
5. 选择标准授信尽调。
6. 自动推进到税票采集等待授权。
7. 点击确认发送采集链接。
8. 点击模拟企业已授权。
9. 进入资料补充。
10. 模拟企业上传资料。
11. 进入证据整合。
12. 进入风险诊断。
13. 进入产物确认。
14. 点击编辑报告。
15. 左侧显示报告编辑模式，右侧 AI Copilot 仍然保留。
```

验收结果必须满足：

```text
1. 浏览器控制台没有 Vue runtime 报错。
2. 左侧没有空白阶段。
3. 右侧对话不拥挤，不出现大块流程卡片。
4. 阶段条状态随流程推进变化。
5. 报告编辑模式不跳转页面。
```

## 13. 本阶段不要做的事情

不要做：

```text
1. 不要实现完整诊断报告长预览。
2. 不要实现完整智能报告富文本编辑器。
3. 不要深度重做企业探查页面。
4. 不要深度重做智能尽调页面。
5. 不要接真实接口。
6. 不要新增复杂权限、上传、下载逻辑。
7. 不要改独立模块原有页面结构。
```

第一阶段只要主链路稳定、状态清晰、左右分工正确，就算完成。

