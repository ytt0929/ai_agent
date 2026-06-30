# AI Copilot 改造计划

> 创建时间：2026-06-28
> 最后更新：2026-06-28 16:42
> 目标：设计令牌升级 + 工作台输入框能力增强 + AI 自动执行链路升级
> 原则：只改工作台输入框区域 + 全局样式，其他菜单功能不变

## 状态

- ✅ 迭代 1：设计令牌升级
- ✅ 迭代 2：新建 store 基础版（筛客）
- ✅ 迭代 3：补全单独意图（尽调/监控/待办）
- ✅ 迭代 4：上下文续接
- ✅ 迭代 5：全流程编排
- ✅ 迭代 6：字段统一 + WorkbenchPage 瘦身 + build 验证
- ✅ **v2 升级：stage-strip + 气泡对话 + artifact panel（8 阶段全链路）**

> 所有迭代已完成，`npm run build` 通过。

---

## 一、改动范围总览

| 改动领域 | 影响范围 | 是否改其他菜单 |
|----------|---------|---------------|
| 设计令牌升级 | 全局 CSS 变量 + 文档 | ❌ 仅色值变化，功能不变 |
| 工作台输入框 | 仅 WorkbenchPage | ❌ 仅工作台 |
| 左侧执行链路 | 仅 WorkbenchPage | ❌ 仅工作台 |
| Store 抽离 | 仅 WorkbenchPage 逻辑 | ❌ 仅工作台 |
| 客户字段统一 | screening.js mock 数据 | ❌ 仅数据补充 |

---

## 二、最终效果

### 视觉层
- 全局 CSS 变量对齐 Figma 设计稿（主色 `#2168f3`，背景 `#f5f8fc` 等）
- 输入框从"普通聊天框"变为"AI 工具调用可视化入口"（大输入框 + 蓝色 56px 按钮 + 阴影 + 工具图标暗示）

### 交互层
- 用户输入后，左侧步骤**像动画一样逐步出现**（每步 400ms 间隔）
- 左侧清晰展示：识别意图 → 调用工具 → 解析条件 → 执行过程 → 生成结果 → 等待下一步
- 右侧根据当前阶段自动展示对应产物卡片
- 支持上下文续接（"第一个发起尽调"、"也加入监控"）
- 支持全流程一条命令跑通

### 架构层
- 流程编排逻辑从 WorkbenchPage.vue 抽离到 `workbenchAssistant.js` store
- WorkbenchPage.vue 退化为纯 UI 层（~60% 代码减少）
- store 调用现有业务 store（screening/dueDiligence/monitor），不替代它们

---

## 三、迭代计划（6 轮）

---

### 迭代 1：设计令牌升级（样式层）

**目标：** 全局 CSS 变量对齐 Figma 设计稿，后续组件直接用新令牌

#### 📝 改动内容

| 文件 | 改动类型 | 具体改动 |
|------|----------|----------|
| `src/style.css` | 修改变量 | 更新 `:root` 全部 CSS 变量 |
| `docs/DESIGN_SYSTEM.md` | 更新文档 | 色彩表、组件条目对齐新变量 |

#### 变量映射表

| 变量名 | 旧值 | 新值 | 用途 |
|--------|------|------|------|
| `--primary` | `#2563eb` | `#2168f3` | 主按钮、链接、激活态 |
| `--primary-hover` | `#1d4ed8` | `#164fca` | 主按钮 hover |
| `--primary-soft` | 无 | `#eaf2ff` | 主色浅背景 |
| `--bg-page` | `#f7faff` | `#f5f8fc` | 页面背景 |
| `--bg-card` | `#ffffff` | `#ffffff` | 卡片背景 |
| `--border-color` | `#e5e7eb` | `#dfe8f5` | 边框色 |
| `--border-soft` | `#f1f5f9` | `#edf3fa` | 浅边框 |
| `--text-primary` | `#1a1a2e` | `#10213f` | 主文字 |
| `--text-muted` | `#94a3b8` | `#66758e` | 次要文字 |
| `--text-subtle` | `#cbd5e1` | `#93a1b5` | 更弱文字 |
| `--success` | `#10b981` | `#18a66a` | 成功色 |
| `--success-soft` | `#ecfdf5` | `#eaf8f2` | 成功浅背景 |
| `--warning` | `#f59e0b` | `#d98712` | 警告色 |
| `--warning-soft` | `#fffbeb` | `#fff5e4` | 警告浅背景 |
| `--danger` | `#ef4444` | `#dc4c49` | 危险色 |
| `--radius` | `10px` | `8px` | 默认圆角 |

#### 🏪 影响模块
- 无。纯 CSS 和文档变更

#### ✅ 验收标准
1. 打开所有页面，视觉无明显异常（变量名兼容）
2. 主色调变为更深的蓝色
3. 背景色变为 `#f5f8fc`
4. `DESIGN_SYSTEM.md` 与新变量表一致

#### 🔍 验证步骤
1. `npm run dev` 启动
2. 访问 `/workbench`、`/biz-risk`、`/screening`、`/tax-rpa`、`/enterprise-monitor` 等所有页面
3. 确认颜色变化但布局/功能正常
4. 确认 `DESIGN_SYSTEM.md` 已更新

---

### 迭代 2：新建 workbenchAssistant.js（基础版：筛客）

**目标：** 新建 store，跑通筛客意图 + 步骤动画推送

#### 📝 改动内容

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/stores/workbenchAssistant.js` | **新增** | ~180 行，包含状态定义 + sendMessage + runScreening |
| `src/pages/WorkbenchPage.vue` | 小改 | 引入新 store，`handleNormalSend` / `sendDialogMessage` 改为调用 `assistant.sendMessage()` |

#### store 结构

```js
// 状态（11 个）
dialogOpen, dialogInput, processSteps, sidebarMode, waitingForInput,
selectedCustomer, lastScreeningResults, lastDueTask, currentIntent, currentStage, conversationContext

// 方法（3 个）
sendMessage(text)     // 主入口
runScreening(lower)   // 筛客流程，400ms 间隔逐步推送步骤
reset()               // 清空对话
```

#### 步骤动画效果

```
输入："筛选浙江制造业低风险客户"

[400ms]  [✅] 识别意图：智能筛客
[800ms]  [✅] 调用工具：客户筛选工具 screeningStore
[1200ms] [✅] 解析条件：浙江省 / 制造业 / 低风险 / 近一年有开票记录
[1600ms] [✅] 执行筛选：匹配 128 家，过滤高风险 98 家
[2000ms] [✅] 生成结果：推荐 5 家可转尽调客户
[2000ms] [⏳] 等待用户下一步
```

#### 🏪 影响模块
- `screeningStore`：调用 `setCustomers()` 和 `selectCustomer()`

#### ✅ 验收标准
1. 进入 `/workbench`，输入"筛选浙江制造业低风险客户"
2. 左侧步骤每隔 400ms 出现一条（动画效果）
3. 右侧出现 ScreeningResultCard，显示第一个客户信息
4. 页面其他功能正常

#### 🔍 验证步骤
1. 打开 `/workbench`
2. 在输入框输入"筛选浙江制造业低风险客户"，按回车
3. 观察左侧步骤是否逐条出现（应有 6 条）
4. 观察右侧是否出现筛选结果卡片
5. 确认卡片上的字段不空（企业名称、行业、地区、营收、纳税等级、风险等级、匹配度、筛选理由）

---

### 迭代 3：补全单独意图

**目标：** 发起尽调、加入监控、今天待办 都能跑，步骤动画推送

#### 📝 改动内容

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/stores/workbenchAssistant.js` | 追加方法 | +`parseIntent()` / `runDueDiligence()` / `runMonitor()` / `runTodos()` / `extractEntity()` |

#### 意图路由表

| 关键词 | 意图 | 调用方法 |
|--------|------|---------|
| 筛 / 筛选 / 客户 / 名单 / 找客户 | screening | `runScreening()` |
| 发起尽调 | due-diligence | `runDueDiligence()` |
| 加入监控 / 监控 | monitor | `runMonitor()` |
| 待办 / 今天 / 今日 | todos | `runTodos()` |
| 其他 | unknown | 返回默认提示 |

#### 步骤动画效果

**发起尽调：**
```
输入："给杭州智造发起尽调"

[400ms]  [✅] 识别意图：发起尽调
[800ms]  [✅] 调用工具：智能尽调工具 dueDiligenceStore
[1200ms] [✅] 确认企业：杭州智造科技有限公司
[1600ms] [✅] 创建任务：生成尽调任务 ddxxx
[2000ms] [🔄] 初始化流程：主体核验 / 税票采集 / 资料上传 / AI 分析 / 报告生成
[2400ms] [⏳] 等待用户下一步
```

**加入监控：**
```
输入："把杭州智造加入监控"

[400ms]  [✅] 识别意图：加入企业监控
[800ms]  [✅] 调用工具：企业监控工具 monitorStore
[1200ms] [✅] 确认企业：杭州智造科技有限公司
[1600ms] [✅] 创建监控规则：工商变更 / 税票异常 / 重大风险预警
[2000ms] [✅] 启动监控：监控中
[2400ms] [⚠️] 模拟预警：检测到工商变更 / 税务评级下降
[2400ms] [⏳] 等待用户下一步
```

**今天待办：**
```
输入："今天有哪些待办"

[400ms]  [✅] 识别意图：查看今日待办
[800ms]  [✅] 查询在途任务：3 个尽调任务，2 个在途
[1200ms] [⏳] 待办列表已展示
```

#### 🏪 影响模块
- `dueDiligenceStore`：调用 `createTaskFromScreening()`
- `monitorStore`：调用 `addWatchedCompany()`
- `dueDiligenceStore.tasks`：读取待办数据

#### ✅ 验收标准
1. 输入"给杭州智造发起尽调" → 左侧 6 步逐步出现 → 右侧 DueDiligenceProgressCard
2. 输入"把杭州智造加入监控" → 左侧 7 步逐步出现 → 右侧 MonitorStatusCard
3. 输入"今天有哪些待办" → 左侧 3 步逐步出现 → 展示待办列表
4. 所有步骤间隔 ~400ms，有动画感

#### 🔍 验证步骤
1. 打开 `/workbench`
2. 输入"给杭州智造发起尽调"，观察左侧步骤和右侧卡片
3. 点击"返回工作台"，重新输入"把杭州智造加入监控"
4. 点击"返回工作台"，重新输入"今天有哪些待办"
5. 确认三种意图都能正确触发，步骤逐步出现

---

### 迭代 4：上下文续接

**目标：** 支持"第一个发起尽调"、"也加入监控"等续接场景

#### 📝 改动内容

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/stores/workbenchAssistant.js` | 追加逻辑 | +`handleContextContinuation()` + 修改 `parseIntent()` 识别续接关键词 |

#### 续接规则

| 用户输入 | 解析逻辑 | 使用的上下文 |
|----------|---------|-------------|
| "第一个发起尽调" | 关键词：`第一个` + `发起` | `lastScreeningResults[0]` |
| "第二个发起尽调" | 关键词：`第二个` + `发起` | `lastScreeningResults[1]` |
| "也加入监控" | 关键词：`也` + `监控` | `lastDueTask` 的企业 |
| "查看这个客户" | 关键词：`这个` | `selectedCustomer` |

#### 动画效果

```
第 1 轮：输入"筛客" → 步骤逐步出现 → 右侧筛客卡片

第 2 轮：输入"第一个发起尽调"

[400ms]  [✅] 识别意图：发起尽调（上下文续接：使用上一轮筛客第 1 个客户）
[800ms]  [✅] 调用工具：智能尽调工具 dueDiligenceStore
[1200ms] [✅] 确认企业：杭州智造科技有限公司（来自上一轮筛选结果）
[1600ms] [✅] 创建任务：生成尽调任务 ddxxx
[2000ms] [🔄] 初始化流程...
[2400ms] [⏳] 等待用户下一步

第 3 轮：输入"也加入监控"

[400ms]  [✅] 识别意图：加入企业监控（上下文续接：使用当前尽调企业）
[800ms]  [✅] 调用工具：企业监控工具 monitorStore
[1200ms] [✅] 确认企业：杭州智造科技有限公司
[1600ms] [✅] 创建监控规则...
[2000ms] [✅] 启动监控：监控中
[2000ms] [⏳] 等待用户下一步
```

#### 🏪 影响模块
- 无新增 store 调用，仅使用已有的 `lastScreeningResults` / `lastDueTask` 上下文

#### ✅ 验收标准
1. 先输入"筛客"，再输入"第一个发起尽调" → 能自动取第一个客户，不需要说企业名
2. 上一步尽调后，输入"也加入监控" → 能自动取尽调的企业
3. 步骤中显示"上下文续接：使用上一轮..."提示

#### 🔍 验证步骤
1. 打开 `/workbench`，输入"筛选浙江制造业低风险客户"
2. 确认右侧出现筛客结果，第一个客户是"杭州智造科技有限公司"
3. 输入"第一个发起尽调"
4. 确认步骤中显示"上下文续接"，企业名称为"杭州智造科技有限公司"
5. 确认右侧切换到 DueDiligenceProgressCard
6. 输入"也加入监控"
7. 确认步骤中显示"上下文续接"，企业名称同上
8. 确认右侧切换到 MonitorStatusCard

---

### 迭代 5：全流程编排

**目标：** 一条命令跑通"筛客 → 尽调 → 监控"，左侧 10 步逐步展示

#### 📝 改动内容

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/stores/workbenchAssistant.js` | 新增方法 | +`runFullFlow(text)` |

#### 全流程动画时间线

```
输入："筛选浙江制造业低风险客户，适合的发起尽调并加入监控"

[0ms]    清空 processSteps
[400ms]  [✅] 识别意图：筛客 + 尽调 + 企业监控全流程
[800ms]  [✅] 调用工具1：客户筛选工具 screeningStore
[1200ms] [✅] 解析筛选条件：浙江省 / 制造业 / 低风险
[1600ms] [✅] 生成筛客名单：5 家客户，推荐杭州智造科技有限公司
[2000ms] [✅] 调用工具2：智能尽调工具 dueDiligenceStore
[2400ms] [✅] 创建尽调任务：ddxxx
[2800ms] [🔄] 初始化尽调流程：主体核验 / 税票采集 / 资料上传 / AI 分析 / 报告生成
[3200ms] [✅] 调用工具3：企业监控工具 monitorStore
[3600ms] [✅] 创建监控规则：工商变更 / 税票异常 / 重大风险预警
[4000ms] [✅] 流程完成：已完成筛客、尽调、监控三项动作
[4000ms] waitingForInput = true
```

#### 右侧展示

`sidebarMode` 最终设为 `'full-flow'`，展示全流程总结卡片（新增 `FullFlowSummaryCard.vue` 或复用 MonitorStatusCard）

**全流程总结卡片内容：**
- ✅ 推荐客户：杭州智造科技有限公司（匹配度 96%）
- ✅ 已创建尽调任务：ddxxx
- ✅ 已启动企业监控：工商变更 + 税票异常 + 重大风险预警
- 💡 下一步建议：进入尽调详情页，继续推进主体核验

#### 🏪 影响模块
- `screeningStore`：调用 `setCustomers()` / `selectCustomer()`
- `dueDiligenceStore`：调用 `createTaskFromScreening()`
- `monitorStore`：调用 `addWatchedCompany()`

#### ✅ 验收标准
1. 输入全流程文本，左侧 10 个步骤逐步出现（每步 400ms）
2. 右侧最终展示全流程总结卡片
3. 总结卡片包含：推荐客户 + 匹配度 + 任务编号 + 监控状态 + 下一步建议
4. 总耗时约 4 秒，用户能看清每一步

#### 🔍 验证步骤
1. 打开 `/workbench`
2. 输入"筛选浙江制造业低风险客户，适合的发起尽调并加入监控"
3. 观察左侧步骤是否逐条出现（应有 10 条）
4. 计时从输入到全部步骤出现完毕，约 4 秒
5. 观察右侧是否出现全流程总结卡片
6. 确认卡片包含所有 5 项内容

---

### 迭代 6：统一客户字段 + WorkbenchPage 瘦身 + build 验证

**目标：** screening.js mock 数据补全，WorkbenchPage.vue 只保留 UI，构建通过

#### 📝 改动内容

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/stores/screening.js` | 补充字段 | mock 客户数据新增 8 个字段 |
| `src/pages/WorkbenchPage.vue` | **大改（瘦身）** | 删除所有流程逻辑（~180 行），改为引用 `assistant.xxx` |
| 构建验证 | 命令 | `npm run build` |

#### screening.js mock 数据补全

**旧数据结构（5 字段）：**
```js
{ id, name, match, risk, reason, status }
```

**新数据结构（13 字段）：**
```js
{
  id, name, industry, region, revenue, taxLevel,
  risk, match, transferable, reason, status, filters, matchRaw
}
```

| 字段 | 类型 | 示例 | 来源 |
|------|------|------|------|
| `id` | string | `'c001'` | 保留 |
| `name` | string | `'浙江恒远制造有限公司'` | 保留 |
| `industry` | string | `'制造业'` | **新增** |
| `region` | string | `'浙江省·杭州市'` | **新增** |
| `revenue` | string | `'82万'` | **新增** |
| `taxLevel` | string | `'A级'` | **新增**（替代旧 `tax` 字段） |
| `risk` | string | `'低'` | 保留 |
| `match` | number | `98` | 统一为 number（原为 string '98'） |
| `transferable` | string | `'可转尽调'` | **新增** |
| `reason` | string | `'经营稳定...'` | 保留 |
| `status` | string | `'可转尽调'` | 保留 |
| `filters` | array | `['浙江省', '制造业', ...]` | **新增** |
| `matchRaw` | string | `'98%'` | **新增**（展示用） |

#### WorkbenchPage.vue 瘦身前后对比

**瘦身前（~500 行）：**
- 模板：~200 行（保留）
- 脚本：~300 行（含 200+ 行流程逻辑）

**瘦身后（~300 行）：**
- 模板：~200 行（不变）
- 脚本：~100 行（仅 UI 状态 + store 引用 + 事件绑定）

**删除的函数：**
- `buildReply()`
- `buildScreeningReply()`
- `openDueDiligence()`
- `openMonitor()`
- `extractEntity()`

**保留的部分：**
- `greeting` / `formattedDate` / `todos` / `tasks` / `quickActions`
- `go()` / `progressStatus()` / `statusTagType()`
- `handleAdopt()` / `handleIgnore()`
- 全部模板

#### 🏪 影响模块
- `screeningStore`：mock 数据结构变化，需确保所有引用处兼容
- `ScreeningResultCard.vue`：读取新字段，确认不空

#### ✅ 验收标准
1. ScreeningResultCard 所有字段都有值显示（不空）
2. WorkbenchPage.vue 行数减少 ~40%
3. 所有交互和之前一样（回归测试 6 项验收标准）
4. `npm run build` 通过，无 error

#### 🔍 验证步骤
1. 检查 `screening.js` mock 数据是否包含所有新字段
2. 打开 `/workbench`，输入"筛客"，确认 ScreeningResultCard 不空
3. 检查 WorkbenchPage.vue 行数是否减少
4. 回归测试：筛客、尽调、监控、续接、全流程、待办 6 项逐一验证
5. 运行 `npm run build`，确认无 error
6. 如有 error，修复后重新 build

---

## 四、全局改动汇总

| 迭代 | 文件 | 改动类型 | 新增/修改/删除 |
|------|------|----------|---------------|
| 1 | `src/style.css` | 修改变量 | 修改 12+ 个变量值 |
| 1 | `docs/DESIGN_SYSTEM.md` | 更新文档 | 重写色彩表 |
| 2 | `src/stores/workbenchAssistant.js` | **新增** | ~180 行 |
| 2 | `src/pages/WorkbenchPage.vue` | 小改 | +10 行引用 |
| 3 | `src/stores/workbenchAssistant.js` | 追加方法 | +120 行 |
| 4 | `src/stores/workbenchAssistant.js` | 追加逻辑 | +60 行 |
| 5 | `src/stores/workbenchAssistant.js` | 新增方法 | +80 行 |
| 6 | `src/stores/screening.js` | 补充字段 | +20 行 |
| 6 | `src/pages/WorkbenchPage.vue` | **大改（瘦身）** | -200 行 |
| - | `src/components/FullFlowSummaryCard.vue` | **新增（可选）** | ~120 行 |

**合计：** 新增 2 个文件（workbenchAssistant.js + FullFlowSummaryCard.vue），修改 3 个文件，删除 0 个文件

---

## 五、不改动内容（明确不变）

| 内容 | 状态 |
|------|------|
| `src/pages/BizRiskPage.vue` | ❌ 不动 |
| `src/pages/ScreeningInitialPage.vue` | ❌ 不动 |
| `src/pages/TaxRpaPage.vue` | ❌ 不动 |
| `src/pages/EnterpriseMonitorPage.vue` | ❌ 不动 |
| `src/pages/DueDiligenceHomePage.vue` | ❌ 不动 |
| `src/pages/DocRecognitionPage.vue` | ❌ 不动 |
| `src/pages/SmartReportPage.vue` | ❌ 不动 |
| `src/pages/EnterpriseDiagnosisPage.vue` | ❌ 不动 |
| `src/components/AppSidebar.vue` | ❌ 不动 |
| `src/components/GlobalInputBar.vue` | ❌ 不动（保留，仅 WorkbenchPage 不再引用） |
| `src/stores/dueDiligence.js` | ❌ 不动（仅被调用，不改内部逻辑） |
| `src/stores/enterpriseMonitor.js` | ❌ 不动（仅被调用，不改内部逻辑） |
| `src/stores/bizRisk.js` | ❌ 不动 |
| `src/stores/taxRpa.js` | ❌ 不动 |
| `src/stores/docRecognition.js` | ❌ 不动 |
| `src/stores/smartReport.js` | ❌ 不动 |
| `src/stores/enterpriseDiagnosis.js` | ❌ 不动 |
| `src/router/index.js` | ❌ 不动 |
| `src/App.vue` | ❌ 不动 |
| `vite.config.js` | ❌ 不动 |
| `package.json` | ❌ 不动 |

---

## 六、关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 步骤动画 | `setTimeout` 分批推送 | 简单可控，不依赖动画库 |
| 每步延迟 | 400ms | 太快看不到效果，太慢像卡顿 |
| 全流程延迟 | 每步递增 400ms，总计约 4s | 让用户看清每一步 |
| 客户字段统一 | 改 screening.js mock 数据 | 最小改动，不破坏现有逻辑 |
| WorkbenchPage 瘦身 | 删除逻辑，保留 UI | 让 store 成为唯一真相源 |
| 全流程卡片 | 新增 FullFlowSummaryCard | 复用 MonitorStatusCard 信息不够完整 |
| Element Plus | 保留，用 scoped CSS 覆盖 | 减少重写量 |
| CSS 变量名 | 保持不变，只改色值 | 零风险，兼容所有现有组件 |

---

## 七、6 项最终验收标准

| # | 验收项 | 测试方式 |
|---|--------|---------|
| 1 | 进入 `/workbench`，输入"筛选浙江制造业低风险客户"，能看到筛客流程步骤和右侧筛客结果 | 手动测试 |
| 2 | 继续输入"第一个发起尽调"，能创建尽调任务并切换右侧尽调进度卡片 | 手动测试 |
| 3 | 继续输入"也加入监控"，能加入企业监控并切换右侧监控卡片 | 手动测试 |
| 4 | 直接输入"筛选浙江制造业低风险客户，适合的发起尽调并加入监控"，能一条命令跑完整流程 | 手动测试 |
| 5 | 直接输入"今天有哪些待办"，能展示当前尽调/税票相关待办 | 手动测试 |
| 6 | `npm run build` 通过 | 命令验证 |
