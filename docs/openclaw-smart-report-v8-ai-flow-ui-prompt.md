# OpenClaw Prompt V8：智能报告首页 AI 任务流与 UI 方向修正

你是资深前端工程师、资深 UX/UI 工程师、AI 产品工程师。请继续修改 `D:\demo\ai-copilot` 项目中的“智能报告”模块。

## 一、当前问题判断

当前 `npm run build` 已经可以通过，但智能报告页面的产品交互方向仍然偏离目标。

现在页面看起来像：

```text
AI 输入框 + 推荐标签 + SaaS 管理后台表格
```

而目标应该是：

```text
对话驱动的 AI 报告交付工作台
```

当前主要问题：

1. AI 对话框/任务输入区只是放在页面上方，没有形成 AI 工作流。
2. 任务理解卡显示在输入框下面，但布局很怪，像普通列表卡。
3. `sr-task-card` 同时被用于“报告列表卡”和“AI 任务卡”，职责混用，导致任务卡按钮被拉成竖向大按钮。
4. 页面大量使用原生 `button/input/select/textarea` 和 `.sr-*` 自定义样式，几乎没有使用 Element Plus。
5. 推荐任务 chip 像筛选标签，不像 AI 主动建议。
6. 模板中心、资料包中心、最近报告在首页权重过高，页面仍然像 SaaS 列表页。
7. AI 任务卡缺少“AI 理解、需确认事项、执行影响、执行结果、下一步建议”的 AI 原生表达。
8. 首页没有形成持续对话/任务流，用户会感觉“对话框在下面，交互很怪”。

## 二、产品目标

智能报告的定位不是普通报告管理页，也不是问数工具，而是：

```text
对话驱动的 AI 报告交付工作台
```

它负责：

- 报告模板维护
- 资料包管理
- 上传资料生成报告
- 从智能尽调产物进入后，处理待确认报告
- 按新模板重排旧报告
- 查看章节关联资料依据
- 修改资料摘要
- AI 快速改写报告正文
- 提交前交付检查
- 报告正文、附件清单、资料包、证据目录批量导出

它不负责：

- 问企业经营数据
- 算指标
- 找异常
- 解释评分
- 追问异常原因

这些能力属于【企业探查】，不要放回智能报告。

## 三、重要边界

本次只改智能报告。

允许修改：

```text
src/pages/SmartReportPage.vue
src/data/mockSmartReport.js
```

如确有必要，可以新增：

```text
src/components/report/
```

不要修改：

```text
src/pages/DueDiligenceTaskPage.vue
src/stores/dueDiligence.js
src/data/mockDueDiligence.js
src/stores/workbenchAssistant.js
src/pages/EnterpriseExplorationWorkspacePage.vue
路由结构
侧边栏结构
```

注意：不要碰企业探查页面。当前 `EnterpriseExplorationWorkspacePage.vue` 有未提交改动，不属于本次范围。

## 四、本次修改目标

本次不是继续堆 mock 数据，也不是继续加更多按钮。

本次核心目标是：

```text
把智能报告首页从 SaaS 管理页，改成 AI 任务流工作台。
```

需要完成：

1. 首页重构为 AI 工作流布局。
2. AI 任务卡独立设计，不再复用报告列表卡样式。
3. 推荐任务改成 AI 主动建议，而不是普通 chip。
4. 使用 Element Plus 组件统一视觉。
5. 模板中心、资料包中心、最近报告降级为上下文资源区。
6. 保留现有功能闭环，不要破坏 mock 状态更新。
7. 编辑器三栏结构可以保持，但样式和按钮也要适度 Element Plus 化。
8. `npm run build` 必须通过。

## 五、首页信息架构建议

请把 `/smart-report` 首页调整为下面这种结构：

```text
智能报告工作台

主区域：AI 任务流
- AI 欢迎/状态消息
- AI 主动推荐任务
- 用户输入任务
- 任务理解卡
- 执行进度卡
- 执行结果卡
- 下一步动作按钮

右侧上下文面板：
- 当前待处理报告
- 模板库摘要
- 资料包摘要
- 交付风险/待确认摘要

底部或主区域顶部：
- AI 任务输入框
```

推荐布局：

```text
┌────────────────────────────────────────────┬──────────────────────┐
│ AI 任务流                                  │ 上下文面板             │
│                                            │                      │
│ AI：我发现以下报告交付任务                  │ 待确认报告 3           │
│ [任务卡：处理明达精工待确认报告]             │ 证据不足 2             │
│ [任务卡：补齐宁波天合资料]                   │ 模板 10                │
│                                            │ 最近报告               │
│ 用户：处理明达精工待确认报告                 │ 模板中心摘要            │
│ AI：我已理解任务...                         │ 资料包摘要              │
│ [任务理解卡]                                │                      │
│ [执行按钮]                                  │                      │
│                                            │                      │
│ 输入框：告诉 AI 你要交付哪份报告             │                      │
└────────────────────────────────────────────┴──────────────────────┘
```

如果保留顶部输入框，也可以，但任务卡不要像普通内容卡一样散在下面。要形成连续的任务流。

## 六、AI 任务卡设计要求

请新建或重构 AI 任务卡样式，避免继续复用 `.sr-task-card`。

建议命名：

```text
.sr-ai-flow
.sr-ai-message
.sr-ai-task-card
.sr-ai-task-card__summary
.sr-ai-task-card__context
.sr-ai-task-card__steps
.sr-ai-task-card__actions
.sr-context-panel
```

AI 任务卡要表达：

1. AI 理解了什么。
2. 关联对象是什么：
   - 报告
   - 企业
   - 模板
   - 资料包
3. 执行前会做哪些步骤。
4. 哪些内容需要用户确认。
5. 点击后会影响什么状态。
6. 执行结果是什么。
7. 下一步建议是什么。

任务卡不要横向拉成列表，也不要让按钮变成竖向大条。

推荐任务卡结构：

```text
AI 已理解任务

目标：处理明达精工待确认报告

关联对象：
- 报告：明达精工有限公司 - 单户授信调查报告
- 当前模板：单户授信调查报告通用版 V2021
- 资料包：明达精工尽调证据包

需要处理：
- 收入真实性说明待确认
- 法人关联企业说明待确认
- 授信方案待确认

执行步骤：
1. 定位待确认章节
2. 展示 AI 修改建议
3. 用户确认或应用修改
4. 更新报告状态

[逐项处理] [应用 AI 修改] [查看待确认]
```

## 七、AI 推荐任务调整

当前推荐任务是 chip，建议改成 AI 主动建议区域。

不要这样：

```text
[待确认 处理明达精工待确认报告] [缺资料 检查宁波天合缺失资料]
```

建议改成：

```text
AI：我发现 5 个可处理的报告交付任务

任务卡 1：
处理明达精工待确认报告
3 项待确认，影响提交确认
[让 AI 处理]

任务卡 2：
补齐宁波天合缺失资料
缺少税票数据、银行流水
[检查资料缺口]

任务卡 3：
导出杭州智造全景报告交付包
报告已完成，可打包导出
[执行导出检查]
```

推荐任务可以横向卡片或纵向列表，但要像 AI 建议，不像筛选标签。

## 八、Element Plus 使用要求

当前页面几乎全是原生控件，请改成 Element Plus 为主。

优先替换：

- `<button>` -> `<el-button>`
- `<input>` -> `<el-input>`
- `<textarea>` -> `<el-input type="textarea">`
- `<select>` -> `<el-select>` + `<el-option>`
- 状态标签 -> `<el-tag>`
- 弹窗 -> `<el-dialog>`
- 资料/模板表格 -> `<el-table>`
- 任务步骤 -> `<el-steps>` 或自定义步骤但使用 Element 风格
- 警示提示 -> `<el-alert>`
- 加载执行 -> `<el-skeleton>` / `<el-progress>` / `<el-icon>`

注意：

- 不要求一次全部替换，但首页和 AI 任务流必须优先 Element Plus 化。
- 保持项目现有克制风格，不要使用夸张大圆角、大阴影、大渐变。
- 使用现有 `tokens.css` 中的颜色、字号、边框语义。
- Element Plus 组件的尺寸用 `small/default`，避免过大。

## 九、首页模块权重调整

模板中心、资料包中心、最近报告不要作为首页主视觉。

请改成右侧上下文面板或折叠摘要：

```text
今日交付上下文

待确认报告：3
资料缺失：2
可导出：1
模板版本：10

最近报告
- 明达精工 单户授信调查报告 待确认
- 宁波天合 授信调查报告 资料缺失
- 杭州智造 企业全景报告 可导出

模板库
- 10 个模板
- 7 家银行/机构
- 2 个草稿模板

资料包
- 3 个客户资料包
- 2 个存在缺失资料
```

每项可以点击生成 AI 任务卡，而不是直接跳普通详情。

## 十、编辑器页调整建议

编辑器三栏结构可以保留：

```text
左侧：目录
中间：报告正文
右侧：资料依据 + 交付检查 + AI 助手
```

但要注意：

- 顶部按钮适度减少，避免一排 SaaS 操作按钮。
- 重要动作优先放到右侧 AI 助手或任务卡中。
- 使用 `el-button`、`el-tag`、`el-dialog`。
- 右侧 AI 助手保持项目统一的 `.ai-assistant-panel` 风格。
- AI 快捷动作不要是一堆小 chip，需要按当前章节推荐 3-5 个动作即可。

## 十一、必须保留的现有能力

不要把已经做好的 mock 状态闭环删掉。

必须保留或修复：

- 点击推荐任务生成任务理解卡。
- 任务卡执行后有进度/结果反馈。
- 应用 AI 修改后章节状态变化。
- 待确认数减少。
- 补充资料后资料包缺失数减少。
- 按新模板重排后报告模板信息变化。
- 导出后报告状态变化。
- 提交确认根据阻断项/待确认项反馈。
- 打开报告进入三栏编辑器。

## 十二、不要做的事情

不要：

- 不要做营销页。
- 不要做大 hero。
- 不要做花哨渐变背景。
- 不要把全部内容都放成大卡片。
- 不要继续用 `.sr-task-card` 同时承载 AI 任务卡和报告列表。
- 不要把问数据、算指标、找异常放回智能报告。
- 不要改路由和侧边栏。
- 不要修改智能尽调、企业探查代码。
- 不要因为 PowerShell 显示乱码而转换文件编码。

## 十三、验收标准

完成后必须满足：

1. `npm run build` 通过。
2. `/smart-report` 首页第一眼是 AI 任务流，而不是 SaaS 表格页。
3. AI 推荐任务像“AI 主动建议”，不是普通 chip 筛选条。
4. 点击推荐任务后，任务理解卡布局正常，不再出现按钮被拉成竖向大条的问题。
5. AI 任务卡不再复用报告列表卡样式。
6. 首页至少主要控件使用 Element Plus：
   - 输入框
   - 按钮
   - 标签
   - 选择器或表格
7. 右侧上下文面板能看到报告、模板、资料包、交付状态摘要。
8. 模板中心/资料包/最近报告不再抢首页主视觉。
9. AI 任务执行仍能推动 mock 状态变化。
10. 进入编辑器后三栏布局正常。
11. 编辑器 AI 助手和页面风格一致。
12. 不修改禁止修改的文件。

## 十四、输出要求

完成后请输出：

1. 修改了哪些文件。
2. 首页信息架构如何调整。
3. 哪些原生控件替换成了 Element Plus。
4. AI 任务卡如何与报告列表卡拆分。
5. 保留了哪些任务闭环。
6. `npm run build` 是否通过。
7. 如果有未完成项，请明确说明。

请直接开始修改，不要只给方案。

---

## 十五、OpenClaw 对话框直接输入版

如果是在 OpenClaw 对话框里发起任务，不建议一次性粘贴全文。请直接输入下面这段，让 OpenClaw 先读取本文档，再按“快速可交付”的顺序修改：

```markdown
请修改 D:\demo\ai-copilot 项目中的“智能报告”模块。

先阅读：
docs/openclaw-smart-report-v8-ai-flow-ui-prompt.md

本次目标不是继续堆功能，而是快速修正智能报告首页方向：
把当前“AI 输入框 + SaaS 表格页”改成“对话驱动的 AI 报告交付工作台”。

只允许修改：
- src/pages/SmartReportPage.vue
- src/data/mockSmartReport.js
- 如确有必要，可新增 src/components/report/ 下的组件

不要修改：
- src/pages/EnterpriseExplorationWorkspacePage.vue
- src/pages/DueDiligenceTaskPage.vue
- src/stores/dueDiligence.js
- src/data/mockDueDiligence.js
- src/stores/workbenchAssistant.js
- 路由结构
- 侧边栏结构

请按下面顺序快速实现：

1. 先读当前 SmartReportPage.vue 和 mockSmartReport.js，确认 npm run build 当前状态。
2. 首页重构为 AI 任务流布局：
   - 左/中主区域是 AI 任务流
   - 右侧是上下文面板
   - AI 推荐任务要像“AI 主动建议”，不要继续像 chip 筛选条
3. AI 任务卡单独设计，不要继续复用 .sr-task-card。
   - .sr-task-card 只用于报告列表
   - 新增或重构 .sr-ai-task-card / .sr-ai-flow / .sr-context-panel
   - 修复当前任务卡按钮被拉成竖向大条的问题
4. 首页主要控件优先 Element Plus 化：
   - button -> el-button
   - input/textarea -> el-input
   - select -> el-select
   - 状态 -> el-tag
   - 任务步骤可用 el-steps 或 Element 风格自定义
   - 弹窗尽量用 el-dialog
5. 模板中心、资料包中心、最近报告降级为右侧上下文摘要或辅助区，不要抢首页主视觉。
6. 保留已有 mock 状态闭环：
   - 点击推荐任务生成任务理解卡
   - 执行任务后有进度/结果
   - 应用 AI 修改会更新章节/待确认状态
   - 补充资料会更新资料包缺失数
   - 按新模板重排会更新报告模板
   - 导出会更新报告状态
   - 提交确认根据阻断项/待确认项反馈
7. 编辑器三栏结构可以保持，但按钮和标签适度 Element Plus 化，右侧 AI 助手保持统一风格。
8. 最后必须运行 npm run build，并修复直到通过。

验收重点：
- /smart-report 第一眼是 AI 任务流，不是 SaaS 表格页
- 推荐任务像 AI 主动建议
- 任务理解卡布局正常，按钮不再变成竖向大条
- AI 任务卡和报告列表卡样式职责分离
- 首页主要控件使用 Element Plus
- 右侧上下文面板展示报告、模板、资料包、交付状态摘要
- 不修改企业探查、智能尽调、路由、侧边栏

完成后输出：
1. 修改文件
2. 首页结构调整
3. Element Plus 替换范围
4. AI 任务卡与报告列表卡如何拆分
5. 保留的 mock 闭环
6. npm run build 结果
```

## 十六、建议给 OpenClaw 的分步执行方式

为了让 OpenClaw 快速改成想要的结果，建议不要让它一次重写整个页面。让它按下面四步做：

```text
第一步：只改首页信息架构和样式职责
- 拆分 AI 任务卡和报告列表卡
- 修复按钮竖条问题
- 首页改为 AI 任务流 + 右侧上下文
- build 通过

第二步：Element Plus 化首页主要控件
- el-input / el-button / el-tag / el-select
- 推荐任务卡和上下文面板统一视觉
- build 通过

第三步：保留并校准 mock 状态闭环
- 推荐任务、任务执行、应用修改、补资料、重排、导出、提交检查
- 确认没有只靠 ElMessage 的关键动作
- build 通过

第四步：轻量整理编辑器
- 三栏不大改
- 顶部按钮减噪
- 右侧 AI 助手与首页 AI 任务流风格一致
- build 通过
```

如果 OpenClaw 容易跑偏，可以追加一句：

```text
不要重写智能报告全部业务，不要新增复杂页面。先把首页 AI 工作流和任务卡视觉做对，保持现有 mock 闭环能跑。
```

---

## 十七、下一步小步修改提示词：AI 任务流 + 右侧上下文雏形

### 17.1 OpenClaw 角色定位

你是资深前端工程师、资深 UX/UI 工程师、AI 产品工程师。

你的任务不是单纯写页面，也不是把需求堆成 SaaS 管理后台，而是把“智能报告”逐步调整成**对话驱动的 AI 报告交付工作台**。

你需要同时关注：

- 工程稳定性：小步修改、避免整段替换导致文件截断，保证 `npm run build` 通过。
- UX 方向：首页第一眼应该是 AI 任务流，不是普通报表/模板/资料列表。
- UI 一致性：沿用现有设计 token 和 Element Plus 风格，克制、专业、适合银行客户经理工作台。
- 产品边界：智能报告只负责报告交付、模板、资料包、正文修改和导出，不负责问数据、算指标、找异常。

### 17.2 本轮目标

请继续修改 `D:\demo\ai-copilot` 项目中的“智能报告”模块。

当前状态：

- `npm run build` 已通过。
- AI 任务卡样式已从 `.sr-task-card` 拆成 `.sr-ai-task-card`。
- 当前不要再做整段首页 template 替换。
- 当前不要一次性重构整个页面。

本轮只做下一步：

```text
把首页从“AI 输入框 + SaaS 列表页”轻量调整为“AI 任务流 + 右侧上下文面板”的结构雏形。
```

### 17.3 允许修改

只允许修改：

```text
src/pages/SmartReportPage.vue
```

本轮不要修改：

```text
src/data/mockSmartReport.js
src/pages/EnterpriseExplorationWorkspacePage.vue
智能尽调相关文件
路由
侧边栏
```

### 17.4 当前已知问题

当前首页仍然是：

```text
1. AI 输入框
2. AI 推荐任务
3. 模板中心
4. 资料包中心
5. 最近报告
```

这还是 SaaS 列表页结构。

当前代码中：

- AI 任务卡已经使用 `.sr-ai-task-card`。
- 但首页没有 `.sr-ai-flow`。
- 没有 `.sr-context-panel`。
- 模板中心、资料包中心、最近报告仍然占据主视觉。
- 推荐任务仍然像普通列表，不像 AI 主动建议。

### 17.5 目标结构

只调整首页 home 区域的信息架构，不改编辑器，不改 mock。

目标结构：

```text
首页
┌───────────────────────────────┬────────────────────┐
│ 左侧/主区域：AI 任务流          │ 右侧：交付上下文     │
│ - 标题                         │ - 待确认报告         │
│ - AI 输入框                    │ - 资料缺失           │
│ - AI 主动建议任务              │ - 可导出             │
│ - 当前任务理解卡/执行卡/结果卡  │ - 最近报告摘要       │
│                               │ - 模板库摘要         │
│                               │ - 资料包摘要         │
└───────────────────────────────┴────────────────────┘
```

### 17.6 具体修改要求

#### 1. 新增首页布局容器

在 home 区域内部增加：

```html
<div class="sr-ai-workbench">
  <main class="sr-ai-flow">...</main>
  <aside class="sr-context-panel">...</aside>
</div>
```

注意：

- 不要重写整个文件。
- 只移动 home 区域里已有内容。
- 保留现有 AI 输入框、推荐任务、AI 任务卡逻辑。
- 不要改 script 逻辑。

#### 2. 主区域放 AI 工作流

`sr-ai-flow` 中放：

- 标题区
- AI 输入框
- AI 推荐任务
- `activeAiTaskCard` 对应的任务卡展示区

推荐任务不要再像普通列表标题“AI 推荐任务”，改成更像 AI 主动建议：

```text
AI 已发现这些可推进的报告交付任务
```

推荐任务样式从普通列表改得更像任务建议卡，但不要大改逻辑。

可以新增样式：

```text
.sr-ai-suggestions
.sr-ai-suggestion-card
```

#### 3. 右侧上下文面板

新增右侧上下文面板，不需要新 mock，直接用已有数据展示即可。

展示内容：

```text
今日交付上下文
待确认报告：reportTasks 中 status 包含“待确认”的数量
资料缺失：reportTasks 中 status 包含“缺失”或 materialComplete < 80 的数量
可导出：reportTasks 中 status 包含“待导出”或“已导出”的数量
模板数量：reportTemplates.length
资料包数量：materialPackages.length

最近报告
列出 reportTasks 前 3 条：
- 企业名
- 报告名
- 状态 tag
点击后 openReport(task)

模板库
- 模板总数
- 默认模板名称
- 草稿模板数量

资料包
- 资料包总数
- 缺失资料包数量
```

可以直接在 template 里用简单表达式，不要新增复杂 computed，除非非常必要。

#### 4. 降低模板中心、资料包中心、最近报告主视觉

本轮不要删除它们，但要把它们放到主区域下方的“辅助资源区”，视觉权重降低。

可以包一层：

```html
<div class="sr-resource-dock">
  模板中心
  资料包中心
  最近报告
</div>
```

或者保留原位置但放在 `sr-ai-flow` 下方，并减少 margin 和高度。

关键是：页面第一屏主要看到 AI 任务流 + 右侧上下文，而不是三块表格。

#### 5. 样式要求

新增 CSS：

```css
.sr-ai-workbench
.sr-ai-flow
.sr-context-panel
.sr-context-card
.sr-context-metric
.sr-ai-suggestions
.sr-ai-suggestion-card
.sr-resource-dock
```

要求：

- 使用现有 CSS 变量。
- 不要大渐变。
- 不要大圆角。
- 不要营销页。
- 保持银行工作台的克制、紧凑、专业。
- 宽屏两栏，窄屏单栏。

#### 6. Element Plus

本轮不要大规模替换所有控件。

只做最小 Element Plus 增量：

- 右侧状态标签可以用 `<el-tag size="small">`。
- 右侧上下文按钮可以用 `<el-button size="small" text>`。
- 不要为了替换控件导致大范围重写。

### 17.7 禁止事项

不要：

- 不要修改 `mockSmartReport.js`。
- 不要修改企业探查。
- 不要修改智能尽调。
- 不要修改编辑器三栏逻辑。
- 不要整段替换整个 `SmartReportPage.vue`。
- 不要新增复杂组件。
- 不要动路由/侧边栏。
- 不要把问数据、算指标、找异常放进智能报告。

### 17.8 验收标准

完成后必须：

1. `npm run build` 通过。
2. `/smart-report` 首页第一屏是 AI 工作流 + 右侧上下文。
3. AI 任务卡仍然使用 `.sr-ai-task-card`，不退回 `.sr-task-card`。
4. 推荐任务看起来更像 AI 主动建议。
5. 模板中心/资料包/最近报告不再抢主视觉。
6. 没有修改禁止文件。
7. 汇报修改了哪些位置和 build 结果。

请小步修改，不要一次性大段替换。先完成这一轮首页结构轻调整。

### 17.9 OpenClaw 输入框可直接复制版

```markdown
你是资深前端工程师、资深 UX/UI 工程师、AI 产品工程师。

请继续修改 D:\demo\ai-copilot 项目中的“智能报告”模块。

你的任务不是单纯写页面，也不是把需求堆成 SaaS 管理后台，而是把“智能报告”逐步调整成对话驱动的 AI 报告交付工作台。请同时关注工程稳定性、UX 方向、UI 一致性和产品边界。

当前状态：
- npm run build 已通过
- AI 任务卡样式已从 .sr-task-card 拆成 .sr-ai-task-card
- 当前不要再做整段首页 template 替换
- 当前不要一次性重构整个页面

本次只做下一步：把首页从“AI 输入框 + SaaS 列表页”轻量调整为“AI 任务流 + 右侧上下文面板”的结构雏形。

只允许修改：
- src/pages/SmartReportPage.vue

本轮不要修改：
- src/data/mockSmartReport.js
- src/pages/EnterpriseExplorationWorkspacePage.vue
- 智能尽调相关文件
- 路由
- 侧边栏

当前已知问题：
- 首页仍然是 AI 输入框、AI 推荐任务、模板中心、资料包中心、最近报告
- 这还是 SaaS 列表页结构
- AI 任务卡已经使用 .sr-ai-task-card
- 但首页没有 .sr-ai-flow
- 没有 .sr-context-panel
- 模板中心、资料包中心、最近报告仍然占据主视觉
- 推荐任务仍然像普通列表，不像 AI 主动建议

本次目标结构：

首页采用两栏雏形：
- 左侧/主区域：AI 任务流
  - 标题
  - AI 输入框
  - AI 主动建议任务
  - 当前任务理解卡/执行卡/结果卡
- 右侧：交付上下文
  - 待确认报告
  - 资料缺失
  - 可导出
  - 最近报告摘要
  - 模板库摘要
  - 资料包摘要

具体要求：

1. 在 home 区域内部增加：
   <div class="sr-ai-workbench">
     <main class="sr-ai-flow">...</main>
     <aside class="sr-context-panel">...</aside>
   </div>

2. sr-ai-flow 中放：
   - 标题区
   - AI 输入框
   - AI 推荐任务
   - activeAiTaskCard 对应的任务卡展示区

3. 推荐任务标题改成更像 AI 主动建议：
   “AI 已发现这些可推进的报告交付任务”

4. 推荐任务样式从普通列表改得更像任务建议卡，但不要大改逻辑。
   可新增：
   - .sr-ai-suggestions
   - .sr-ai-suggestion-card

5. 新增右侧上下文面板，不需要新 mock，直接用已有数据展示：
   - 今日交付上下文
   - 待确认报告：reportTasks 中 status 包含“待确认”的数量
   - 资料缺失：reportTasks 中 status 包含“缺失”或 materialComplete < 80 的数量
   - 可导出：reportTasks 中 status 包含“待导出”或“已导出”的数量
   - 模板数量：reportTemplates.length
   - 资料包数量：materialPackages.length
   - 最近报告：reportTasks 前 3 条，点击 openReport(task)
   - 模板库：模板总数、默认模板名称、草稿模板数量
   - 资料包：资料包总数、缺失资料包数量

6. 模板中心、资料包中心、最近报告不要删除，但要放到主区域下方的辅助资源区，降低视觉权重。
   可包一层：
   <div class="sr-resource-dock">...</div>

7. 新增 CSS：
   - .sr-ai-workbench
   - .sr-ai-flow
   - .sr-context-panel
   - .sr-context-card
   - .sr-context-metric
   - .sr-ai-suggestions
   - .sr-ai-suggestion-card
   - .sr-resource-dock

8. 样式要求：
   - 使用现有 CSS 变量
   - 不要大渐变
   - 不要大圆角
   - 不要营销页
   - 保持银行工作台的克制、紧凑、专业
   - 宽屏两栏，窄屏单栏

9. Element Plus 只做最小增量：
   - 右侧状态标签可以用 <el-tag size="small">
   - 右侧上下文按钮可以用 <el-button size="small" text>
   - 不要为了替换控件导致大范围重写

禁止事项：
- 不要修改 mockSmartReport.js
- 不要修改企业探查
- 不要修改智能尽调
- 不要修改编辑器三栏逻辑
- 不要整段替换整个 SmartReportPage.vue
- 不要新增复杂组件
- 不要动路由/侧边栏
- 不要把问数据、算指标、找异常放进智能报告

验收标准：
1. npm run build 通过
2. /smart-report 首页第一屏是 AI 工作流 + 右侧上下文
3. AI 任务卡仍然使用 .sr-ai-task-card，不退回 .sr-task-card
4. 推荐任务看起来更像 AI 主动建议
5. 模板中心/资料包/最近报告不再抢主视觉
6. 没有修改禁止文件
7. 汇报修改了哪些位置和 build 结果

请小步修改，不要一次性大段替换。先完成这一轮首页结构轻调整。
```
