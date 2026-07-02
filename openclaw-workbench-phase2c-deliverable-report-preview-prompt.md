# OpenClaw 提示词：工作台 Phase 2-C 产物确认、报告模板目录与预览

请继续推进【工作台 Phase 2-C：产物确认与报告预览修正】。

本轮只修这三件事：

```text
0. 尽调模板选择阶段必须出现并推荐「尽职调查报告」模板。
1. 产物确认页第一项产物名称改为「尽职调查报告」，不要再叫「尽调底稿」。
2. ReportEditorArtifact 的报告目录必须与智能报告中的「尽职调查报告」模板目录一致。
3. 产物确认页“查看”按钮要能在左侧打开只读预览，不跳页。
```

不要做浏览器自动化验收，不要安装 Playwright，不要修改独立业务模块页面。

## 样式与组件要求

本轮涉及产物确认、报告预览、报告编辑目录等 UI，必须严格使用项目现有风格和 Element Plus 组件。

### 必须遵守

```text
1. 优先使用 Element Plus：
   el-table / el-table-column
   el-tag
   el-button
   el-drawer 或 el-dialog
   el-descriptions
   el-alert
   el-card
   el-input

2. 颜色、边框、背景、圆角、间距优先使用项目 token：
   var(--text-primary)
   var(--text-secondary)
   var(--text-tertiary)
   var(--color-primary)
   var(--color-success)
   var(--color-warning)
   var(--color-danger)
   var(--bg-page)
   var(--surface-card)
   var(--border-default)
   var(--border-light)
   var(--radius-md)
   var(--space-sm)
   var(--space-md)

3. UI 风格要和现有工作台 artifact 保持一致：
   表格密度适中
   标题 14-16px
   正文字号 12-14px
   卡片圆角不要过大
   不要嵌套太多层卡片
   不要使用大面积渐变背景
```

### 禁止

```text
1. 不要引入新的 UI 库。
2. 不要写大量自定义 icon。
3. 不要使用 emoji 做主要视觉符号。
4. 不要使用大面积彩色渐变、阴影、装饰性背景。
5. 不要把预览做成全屏新页面。
6. 不要让样式脱离现有工作台和智能报告风格。
```

如果要新增 CSS class，请放在对应 `.vue` 的 scoped style 中，并尽量复用现有 token，不要硬编码大量颜色。

## 需求依据

请先阅读：

```text
docs/workbench-due-diligence-workspace-discussion.md
```

重点看新增的：

```text
## 10. 产物确认、报告底稿与报告预览修正
```

## 当前代码状态

当前代码里还有几个需要修正的点：

```text
src/stores/workbenchAssistant.js
  - dueDiligenceTemplates 当前仍是「标准授信尽调 / 小微快审尽调 / 税票专项尽调」
  - waiting_template 的右侧推荐按钮当前仍推荐「标准授信尽调」
  - 模板选择后的提示话术仍使用「标准授信尽调」
  - runDeliverablesStep() 的 items 第一项仍是「尽调底稿」
  - startReportEditor() 仍使用 6 章简化目录

src/components/workbench/artifacts/DeliverablesArtifact.vue
  - reportTemplate computed 还在查找「尽调底稿」
  - 表格里的“查看”按钮还没有真正打开预览

src/components/workbench/artifacts/ReportEditorArtifact.vue
  - 能展示章节目录和正文，但目录数据来自 store，目前 store 不对
```

## 修改范围

只允许修改：

```text
src/stores/workbenchAssistant.js
src/components/workbench/artifacts/DueDiligenceArtifact.vue
src/components/workbench/artifacts/DeliverablesArtifact.vue
src/components/workbench/artifacts/ReportEditorArtifact.vue
```

如确实需要，也可以只读参考：

```text
src/data/mockSmartReport.js
```

不要修改：

```text
src/pages/SmartReportPage.vue
src/stores/smartReport.js
src/pages/DueDiligenceTaskPage.vue
src/pages/DueDiligenceHomePage.vue
其他独立业务页面
```

## 0. 模板选择阶段必须加入并推荐「尽职调查报告」

文件：

```text
src/stores/workbenchAssistant.js
src/components/workbench/artifacts/DueDiligenceArtifact.vue
```

当前工作台尽调模板还是：

```text
标准授信尽调 / 小微快审尽调 / 税票专项尽调 / 自定义资料包
```

本轮必须调整为 demo 主路径使用「尽职调查报告」模板。

### 0.1 模板列表

在 `dueDiligenceTemplates` 中新增或替换主模板：

```js
{
  id: 'tpl-due-report',
  name: '尽职调查报告',
  sections: 15,
  requiredDocs: 12,
  estimatedDays: '5-7',
  reportTemplateId: 'credit-v2021',
  desc: '使用智能报告模板中心的单户授信调查报告通用版 V2021，生成尽职调查报告底稿。'
}
```

要求：

- 「尽职调查报告」必须出现在模板选择列表第一项或推荐位置。
- demo 主路径右侧建议按钮必须推荐：

```text
选择模板「尽职调查报告」
```

不要再推荐：

```text
选择模板「标准授信尽调」
```

### 0.2 右侧话术同步

请把相关话术从：

```text
建议使用「标准授信尽调」
已根据「标准授信尽调」模板生成资料包
选择模板「标准授信尽调」
```

调整为：

```text
建议使用「尽职调查报告」模板
已根据「尽职调查报告」模板生成资料包
选择模板「尽职调查报告」
```

### 0.3 模板与产物关系

选择模板后，后续所有报告相关展示都必须延续同一个模板名：

```text
选择模板：尽职调查报告
生成底稿：尽职调查报告
产物名称：尽职调查报告
报告编辑：尽职调查报告
最终导出：尽职调查报告
```

不要出现模板叫「标准授信尽调」，产物却叫「尽职调查报告」的割裂。

## 1. 产物确认页产物名称修正

文件：

```text
src/stores/workbenchAssistant.js
```

在 `runDeliverablesStep()` 的 `items` 中，把第一项：

```js
{ name: '尽调底稿', status: '已生成', count: '1 份' }
```

改成：

```js
{ name: '尽职调查报告', status: '已生成', count: '1 份', type: 'report' }
```

其他产物建议保持：

```text
工商核验报告
司法查询报告
税票分析报告
风险诊断报告
证据链文件
```

如果需要 type，建议：

```js
{ name: '工商核验报告', type: 'business' }
{ name: '司法查询报告', type: 'judicial' }
{ name: '税票分析报告', type: 'tax' }
{ name: '风险诊断报告', type: 'risk' }
{ name: '证据链文件', type: 'evidence' }
```

产物说明区也要表达清楚：

```text
报告模板：尽职调查报告
报告底稿：尽职调查报告
资料包：工商资料 / 司法查询 / 税票数据 / 上传资料 / 证据链
当前状态：底稿已生成，等待确认和编辑
```

不要把“底稿”作为一个独立产物名称。

## 2. 报告编辑目录必须使用智能报告模板目录

文件：

```text
src/stores/workbenchAssistant.js
```

`startReportEditor()` 里不要再使用 6 章简化目录：

```text
企业概况 / 工商核验 / 税票分析 / 风险诊断 / 授信建议 / 附件清单
```

必须改为智能报告中「尽职调查报告」模板目录，对应 `src/data/mockSmartReport.js` 中 `reportTemplates` 默认授信调查模板的 15 章目录：

```text
一、履职声明与基本信息
二、重要说明事项
三、行内评级及授信情况
四、申请人基本信息
五、股权结构及实控人
六、经营情况
七、财务状况
八、收入真实性核实
九、信用状况
十、行业地位比较
十一、诉讼与负面信息
十二、主要风险分析
十三、授信额度依据
十四、调查结论与授信方案
十五、附件清单
```

实现方式可以二选一：

### 推荐方式 A：在 workbenchAssistant.js 中 import 模板数据

```js
import { reportTemplates } from '../data/mockSmartReport.js'
```

找到默认模板：

```js
const dutyTemplate = reportTemplates.find(t => t.id === 'credit-v2021') || reportTemplates[0]
```

把 `dutyTemplate.chapters` 映射为 `ReportEditorArtifact` 需要的 sections：

```js
sections: dutyTemplate.chapters.map(ch => ({
  id: ch.id,
  no: ch.no,
  title: ch.title,
  status: ...,
  content: ...,
  evidence: ...,
  materials: ch.requiredMaterials || [],
  pending: ...
}))
```

### 备选方式 B：在 store 中本地复制 15 章目录

如果担心 import 影响构建，可以本地定义常量。但必须保证目录名称与智能报告模板一致。

### 内容要求

每章可以先 mock 正文，但要和章节含义对应：

```text
履职声明与基本信息：报告生成依据、调查方式、客户经理、版本等
重要说明事项：资料范围、待确认事项、数据口径
行内评级及授信情况：C+、中风险、历史授信/申请额度
申请人基本信息：唐山物桥工商主体信息
股权结构及实控人：股东/实控人 mock
经营情况：建材批发、商贸流通、上下游
财务状况：收入、负债、应收、现金流 mock
收入真实性核实：税票收入、申报收入、银行流水缺口
信用状况：纳税信用 A 级、司法无重大诉讼
行业地位比较：建材批发行业对比
诉讼与负面信息：司法查询结果
主要风险分析：8 项风险事项
授信额度依据：评分、资料完整度、条件约束
调查结论与授信方案：有条件授信建议
附件清单：工商资料、司法查询、税票数据、资料包、证据链
```

“章节证据链”不要作为第十六章，而是在 `ReportEditorArtifact` 底部作为辅助入口展示。

## 3. 产物确认页“查看”按钮打开只读预览

文件：

```text
src/components/workbench/artifacts/DeliverablesArtifact.vue
```

当前表格里有“查看”按钮，但没有真实预览。请实现轻量预览，不跳页。

建议使用 Element Plus：

```text
el-drawer 或 el-dialog
```

要求：

```text
点击「尽职调查报告 / 查看」
→ 打开左侧组件内的报告预览抽屉/弹窗
→ 展示 15 章目录 + 当前章节正文预览 + 资料依据 + 本章证据链 + 待确认项
→ 底部按钮：[进入编辑] [导出报告] [关闭预览]
```

不要跳转到 `SmartReportPage.vue`。

### 预览结构

```text
报告预览：尽职调查报告
├─ 左侧目录：15 章
├─ 右侧正文预览
├─ 资料依据
├─ 本章证据链
├─ 待确认项
└─ 操作：[进入编辑] [导出报告] [关闭预览]
```

### 其他产物查看

其他产物点击查看也可以先做轻量只读预览：

```text
工商核验报告 → 显示工商核验摘要
司法查询报告 → 显示司法查询摘要
税票分析报告 → 显示税票采集摘要
风险诊断报告 → 显示风险诊断摘要
证据链文件 → 显示证据链摘要
```

不要求复用完整 artifact，只要有结构化预览即可。

### 进入编辑

在预览「尽职调查报告」时点击“进入编辑”，应触发已有：

```vue
$emit('edit-report')
```

这样由 WorkbenchPage 调用 `assistant.startReportEditor()` 进入 ReportEditor Lite。

## 4. ReportEditorArtifact 底部增加章节证据链入口

文件：

```text
src/components/workbench/artifacts/ReportEditorArtifact.vue
```

当前已经有目录、正文、证据链、关联资料、待确认项。请在底部增加一个轻量区域：

```text
章节证据链
已关联 31 条证据，覆盖工商、司法、税票、资料包、风险诊断。
[查看章节证据链] [根据资料包重新生成本节]
```

这个区域不是第十六章。

## 5. 验收

必须运行：

```bash
npm run build
```

代码层检查：

```text
1. 产物列表第一项为「尽职调查报告」，不再是「尽调底稿」。
2. 报告模板与资料包卡片中显示：
   报告模板：尽职调查报告
   报告底稿：尽职调查报告
3. ReportEditorArtifact 目录为 15 章，和智能报告模板一致。
4. 「章节证据链」作为底部辅助入口，不作为第 16 章。
5. 产物确认页“查看”可以打开预览，不跳页。
6. 独立业务页面未修改。
```

## 输出要求

完成后输出：

1. 修改了哪些文件。
2. 模板选择列表和右侧推荐是否已经改为「尽职调查报告」。
3. 是否从智能报告模板读取/对齐了 15 章目录。
4. 产物确认页“查看”预览如何实现。
5. ReportEditorArtifact 底部章节证据链如何展示。
6. `npm run build` 是否通过。
