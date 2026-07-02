# OpenClaw 提示词：Phase 3-B 智能尽调详情页收口

你是资深 Vue 前端工程师、资深 UX/UI 工程师。请基于当前代码实现 **Phase 3-B 智能尽调详情页收口**。

本轮目标不是新增大功能，而是把已经搭出的智能尽调详情页从“骨架可见”收口成“唐山物桥商贸有限公司 demo 可完整演示”的任务工作区。

请先阅读：

- `docs/workbench-due-diligence-workspace-discussion.md`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/pages/DueDiligenceHomePage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- `src/components/workbench/artifacts/*Artifact.vue`
- `src/styles/token.css`

## 一、本轮严格修改范围

允许修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/stores/dueDiligence.js`
- `src/data/mockDueDiligence.js`
- 必要时可新增 `src/components/due-diligence/` 下的小组件，但优先复用已有工作台 artifact

不要修改：

- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/SmartReportPage.vue`
- 智能筛客、企业探查、税票采集、资料识别、智能报告等独立业务页面
- 路由、侧边栏、全局布局

## 二、当前已知问题

当前 Phase 3-B 已经有详情页雏形，但存在以下差距：

1. `mockDueDiligence.js` 里的 `steps` 还是旧结构：`launch / verify / tax-rpa / materials / evidence / risk / artifacts`。
2. 详情页实际使用的是新流程：`verify-business / verify-legal / tax-rpa / materials / evidence / risk / artifacts`。
3. 这导致 store 的 step 状态和详情页流程不完全一致。
4. 工商核验、司法查询、证据整合、风险诊断目前只是简单通用卡片，不够丰富。
5. 右侧尽调助手按钮大多只是 `ElMessage` 或切换阶段，没有真实更新任务状态、进度、当前节点。
6. 产物确认里的报告仍是简化草稿，没有对齐“尽职调查报告”产物。
7. `createTaskFromScreening()` 里存在重复 `statusText` 字段，需要清理。

## 三、流程节点必须统一

请统一智能尽调详情页、mock 数据、store 中的流程节点为下面 7 个：

```js
[
  { key: 'verify-business', label: '工商核验' },
  { key: 'verify-legal', label: '司法查询' },
  { key: 'tax-rpa', label: '税票采集' },
  { key: 'materials', label: '资料补充' },
  { key: 'evidence', label: '证据整合' },
  { key: 'risk', label: '风险诊断' },
  { key: 'artifacts', label: '产物确认' },
]
```

进度映射：

```text
工商核验 14%
司法查询 28%
税票采集 43%
资料补充 57%
证据整合 71%
风险诊断 86%
产物确认 100%
```

状态映射：

```text
税票采集等待授权：status = 等待客户，statusText = 税票采集 / 待授权
资料补充等待上传：status = 等待客户，statusText = 资料补充 / 待上传
风险诊断完成待生成产物：status = 进行中，statusText = 风险诊断
产物确认：status = 待确认，statusText = 报告待确认
完成：status = 已完成，statusText = 尽调完成
```

## 四、详情页左侧阶段产物要求

详情页左侧阶段产物区要与工作台当前阶段产物保持统一风格。

### 1. 工商核验

不要只放 4 个字段的简单卡片。

需要展示：

- 企业基础信息：企业名称、统一社会信用代码、注册资本、行业、区域、法定代表人、成立日期、经营状态
- 核验结论摘要：主体状态正常、无工商异常、关联企业 3 家、纳税信用 A 级
- 核验结果列表：工商登记、主体状态、股东/关联企业、经营异常、纳税信用
- 风险提示：如“商贸流通企业应关注上下游真实性”

优先复用已有工作台 artifact 结构；如果没有可直接复用组件，可在 `DueDiligenceTaskPage.vue` 中用 Element Plus 实现，但必须内容丰富。

### 2. 司法查询

需要展示：

- 诉讼/执行/失信/裁判文书/行政处罚等指标卡
- 司法查询结论
- 司法记录明细表
- 数据来源说明

优先复用 `JudicialArtifact.vue`，不要重新造一套样式。

### 3. 税票采集

继续复用 `TaxCollectionArtifact.vue`。

必须支持两种 demo 状态：

- 未授权状态：授权状态等待授权、链接已发送、进项/销项 0/0、纳税申报未采集、日志显示等待企业扫码授权
- 已采集状态：授权状态已授权、进项 128/150、销项 96/120、纳税申报已采集、日志显示采集完成

点击右侧「模拟企业已授权」后：

- 当前任务进入税票采集完成态
- 左侧税票结果从未授权切换到已采集
- 进度仍可停在 43% 或进入下一步 57%，但要和右侧提示一致
- 然后右侧出现进入资料补充的动作

### 4. 资料补充

继续复用 `MaterialsArtifact.vue`。

需要展示：

- 资料完整度 67%
- 已收集资料
- 缺失资料
- OCR/识别状态
- 资料清单发送入口

点击右侧「模拟企业上传资料」后：

- 资料完整度提升到 86%
- 缺失资料减少或标记已补齐
- 当前节点推进到证据整合

### 5. 证据整合

不要只放一个描述卡。

需要展示：

- 证据来源分布
- 风险事项证据链
- 证据完整度
- 证据缺口提示
- 「查看证据详情」按钮可以展开或切换出具体内容

优先复用 `EvidenceMergeArtifact.vue`。

### 6. 风险诊断

不要只放简单风险条。

需要展示：

- 综合评分 72
- 等级 C+
- 中风险
- 风险事项列表
- 高/中/低风险筛选
- 企业亮点或全量指标

优先复用 `RiskDiagnosisArtifact.vue` 或企业探查中的风险事项结构，保持工作台风格。

### 7. 产物确认

需要展示：

- 产物列表：
  - 尽职调查报告
  - 工商核验报告
  - 司法查询报告
  - 税票分析报告
  - 风险诊断报告
  - 证据链文件
- 报告模板与资料包：
  - 报告模板：尽职调查报告
  - 资料包：工商资料 / 司法查询 / 税票数据 / 上传资料
- 待确认项：
  - 风险结论需确认
  - 税票异常说明待补充
  - 授信建议待确认

「查看」按钮不要弹全屏抽屉，也不要覆盖右侧助手。请在左侧产物列表下方以内嵌面板方式展示 PDF 样式文档预览。

文档预览要求：

```text
┌──────────────────────────────────────────┐
│ 尽职调查报告                              │
│ 唐山物桥商贸有限公司                      │
│ 模板：尽职调查报告    版本：V1 草稿        │
├──────────────────────────────────────────┤
│ 一、履职声明与基本信息                    │
│ 二、重要说明事项                          │
│ 三、行内评级及授信情况                    │
│ 四、申请人基本信息                        │
│ 五、股权结构及实控人                      │
│ 六、经营情况                              │
│ 七、财务状况                              │
│ 八、收入真实性核实                        │
│ 九、信用状况                              │
│ 十、行业地位比较                          │
│ 十一、诉讼与负面信息                      │
│ 十二、主要风险分析                        │
│ 十三、授信额度依据                        │
│ 十四、调查结论与授信方案                  │
│ 十五、附件清单                            │
├──────────────────────────────────────────┤
│ 正文预览：                                │
│ 本报告基于工商核验、司法查询、税票采集、    │
│ 资料识别和风险诊断结果生成，供客户经理确认。│
└──────────────────────────────────────────┘
```

注意：

- 产物名称是「尽职调查报告」
- 报告底稿也是「尽职调查报告」
- 目录必须与智能报告模板目录保持一致
- 不要再出现「尽调报告草稿」这种旧名称

## 五、右侧尽调助手要求

右侧不是普通卡片堆叠，要体现“任务助手 + 阶段操作”。

每个阶段至少要有：

- 当前阶段
- AI 提示语
- 快捷操作按钮
- 任务状态
- 同步状态

按钮必须真实更新任务，而不只是弹 `ElMessage`：

### 税票阶段

按钮：

- 发送提醒：只提示已发送，不推进
- 模拟企业已授权：切换税票为已授权/已采集，推进到资料补充或显示进入资料补充按钮
- 改为上传材料：进入资料补充
- 稍后继续：保持当前状态

### 资料补充阶段

按钮：

- 发送资料清单：只提示已发送，不推进
- 模拟企业上传资料：资料完整度提升，推进证据整合
- 稍后继续：保持当前状态

### 证据整合阶段

按钮：

- 查看证据详情：左侧展开证据详情
- 进入风险诊断：推进到风险诊断

### 风险诊断阶段

按钮：

- 查看诊断报告：左侧保持风险诊断并展示完整风险事项
- 生成产物：推进到产物确认

### 产物确认阶段

按钮：

- 查看报告：左侧打开内嵌 PDF 样式文档预览
- 编辑报告：只提示“下一阶段将进入智能报告编辑”，不要跳转
- 导出报告：更新导出状态
- 稍后继续：保持任务状态

## 六、store 数据要求

请在 `src/stores/dueDiligence.js` 中补齐必要方法，但不要过度复杂化。

建议新增或整理：

```js
updateTaskStage(taskId, stageKey)
markTaxAuthorized(taskId)
markMaterialsUploaded(taskId)
enterEvidence(taskId)
enterRisk(taskId)
enterArtifacts(taskId)
markReportExported(taskId)
```

这些方法要更新：

- `currentStep`
- `currentStage`
- `progress`
- `status`
- `statusText`
- `materialCompleteness`
- `updatedAt`

清理：

- `createTaskFromScreening()` 中重复的 `statusText`
- `currentStepKey` 初始值不要再使用已经不存在的 `launch`，建议用 `verify-business`
- `initTaskSteps()` 要按新的 7 节点初始化

## 七、样式要求

必须使用项目已有风格和 Element Plus 组件。

强制要求：

- 表格用 `el-table`
- 描述信息用 `el-descriptions`
- 标签用 `el-tag`
- 卡片用 `el-card`
- 按钮用 `el-button`
- 进度用 `el-progress`
- 不要大量使用自定义 icon
- 不要引入新的 UI 库
- 不要使用大面积彩色渐变
- 不要手写一套完全不同的视觉风格

样式必须使用 `src/styles/token.css` 中的变量，例如：

```css
var(--text-primary)
var(--text-secondary)
var(--surface-card)
var(--surface-soft)
var(--border-light)
var(--space-sm)
var(--space-md)
var(--space-lg)
var(--radius-sm)
var(--radius-md)
var(--color-primary)
var(--color-success)
var(--color-warning)
var(--color-danger)
```

## 八、验收路径

请按下面路径自测：

1. 打开智能尽调首页。
2. 找到「唐山物桥商贸有限公司」任务。
3. 点击继续处理进入详情页。
4. 默认停在税票采集 / 待授权状态。
5. 点击「发送提醒」：不推进，只提示。
6. 点击「模拟企业已授权」：税票结果变为已采集。
7. 进入资料补充。
8. 点击「模拟企业上传资料」：资料完整度提升并进入证据整合。
9. 查看证据详情。
10. 进入风险诊断，看到完整风险事项。
11. 生成产物，进入产物确认。
12. 点击「尽职调查报告」的查看，左侧出现 PDF 样式文档预览。
13. 点击导出报告，左侧显示导出状态。

必须运行：

```bash
npm run build
```

构建必须通过。

## 九、输出报告

完成后请输出：

1. 修改了哪些文件。
2. 每个阶段左侧产物现在展示什么。
3. 右侧按钮现在如何推进状态。
4. `mockDueDiligence.js` 的流程节点是否已统一。
5. `npm run build` 是否通过。
6. 是否修改了工作台、智能报告或其他独立模块。

