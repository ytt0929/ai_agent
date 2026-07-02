# OpenClaw 提示词：企业监测首页改造成 Element Plus + token.css 风格

项目路径：`D:\demo\ai-copilot`

你是资深 Vue / Element Plus 前端工程师。请改造「企业监测首页」的 UI 实现方式和样式，使其更符合项目统一设计系统：**Element Plus 组件优先 + `src/styles/tokens.css` 变量驱动**。

本次只做首页视觉和组件体系收口，不改变任何业务功能、数据、路由、store 或交互流程。

---

## 1. 必须先阅读

请先阅读以下文件：

- `src/pages/EnterpriseMonitorPage.vue`
- `src/stores/enterpriseMonitor.js`
- `src/data/mockEnterpriseMonitor.js`
- `src/styles/tokens.css`
- `src/styles/global.css`

可参考但不要修改：

- `src/pages/EnterpriseDiagnosisListPage.vue`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/pages/WorkbenchPage.vue`

---

## 2. 允许修改范围

只允许修改：

- `src/pages/EnterpriseMonitorPage.vue`

除非发现构建必需问题，否则不要修改其他文件。

禁止修改：

- `src/stores/enterpriseMonitor.js`
- `src/data/mockEnterpriseMonitor.js`
- `src/components/AppSidebar.vue`
- `src/components/GlobalInputBar.vue`
- router / `src/main.js`
- 企业探查页面
- 工作台页面
- 智能尽调页面
- 智能报告页面

---

## 3. 页面目标

页面路径：

- `/enterprise-monitor`

需要保留当前页面的信息结构和业务能力：

1. 页面标题：`企业监测`
2. 页面说明：监控已纳入的企业，AI 自动扫描风险变化并生成预警
3. `新增监控` 主按钮
4. 筛选栏：全部 / 有预警 / 尽调转入 / 筛客转入 / 探查转入
5. `指标库` 按钮
6. 监测任务列表
7. 每条任务包含：
   - 企业名称
   - 是否已关注
   - 统一社会信用代码
   - 来源标签
   - 最近扫描时间
   - 监测指标标签
   - 运行状态
   - 预警数量
   - 更多操作下拉菜单
8. 空状态
9. 新增监控 Dialog
10. 指标库 Dialog
11. 任务详情 Drawer

不要改变任何业务行为：

- `openCreateMonitor`
- `openIndicatorLibrary`
- `setTaskFilter`
- `openTaskDetail`
- `handleTaskAction`
- 新增监控自然语言识别流程
- 手工选择指标流程
- 指标库展示
- 任务详情抽屉
- 暂停/恢复/关注/取消关注等操作

---

## 4. Element Plus 改造要求

当前页面已经使用了部分 Element Plus，但首页筛选栏和任务卡片仍以自定义结构为主。请进一步收口。

### 4.1 页面头部

保留当前布局：左侧标题说明，右侧 `新增监控` 主按钮。

要求：

- `新增监控` 继续使用 `el-button type="primary"`。
- 头部间距、标题字号、说明颜色使用 token.css。
- 不要做成营销页 hero。
- 不要新增大面积装饰背景。

### 4.2 筛选栏

将当前自定义 `span.filter-tab` 收口为 Element Plus 风格控件。

推荐方案：

- 使用 `el-segmented`，如果项目 Element Plus 版本不支持，则使用 `el-radio-group` + `el-radio-button` 或 `el-button-group`。

要求：

- 保留五个筛选项：全部 / 有预警 / 尽调转入 / 筛客转入 / 探查转入。
- 数量必须保留。
- 点击后仍调用 `setTaskFilter` 或等价逻辑，不改变筛选结果。
- `有预警` 数量要保留红色/危险提示语义。
- `指标库` 仍在筛选栏右侧，继续用 `el-button`。

### 4.3 任务列表

不要强行改成纯表格。企业监测是任务流/预警流，更适合卡片列表。

每条任务建议使用：

- `el-card` 作为任务容器，或使用 Element Plus card 语义的结构。
- `el-tag` 展示来源、关注状态、状态、预警数量、指标标签。
- `el-dropdown` 保持更多操作。
- `el-button text` 用于更多操作按钮。

要求：

- 保留整张卡片点击进入详情的能力。
- 保留右侧状态、预警数、更多菜单。
- 保留指标标签最多显示 4 个和 `+N` 逻辑。
- 不要改变 task 数据结构。
- 不要改变 task id / key。
- 任务卡片要清晰、克制、适合金融业务后台，避免过多图标和装饰。

### 4.4 空状态

空状态建议使用：

- `el-empty` 或保留当前结构但按 Element Plus + token.css 风格调整。

要求：

- 保留 `新增监控` 按钮。
- 不改变空状态逻辑。

### 4.5 Dialog / Drawer

当前新增监控 Dialog、指标库 Dialog、任务详情 Drawer 已经大量使用 Element Plus。

本次要求：

- 不重写这些业务流程。
- 可以小幅调整样式，使其和 token.css 更一致。
- 不要改变表单字段、按钮行为、状态推进。
- 不要改变 drawer 宽度逻辑，除非存在明显溢出。

---

## 5. token.css 使用要求

样式必须优先使用 `src/styles/tokens.css` 已有变量。

优先使用：

- 背景：`--surface-page`、`--surface-card`、`--surface-soft`
- 文本：`--text-primary`、`--text-secondary`、`--text-tertiary`
- 主色：`--color-primary`、`--color-primary-hover`、`--color-primary-bg`
- 状态色：`--color-success`、`--color-success-bg`、`--color-warning`、`--color-warning-bg`、`--color-danger`、`--color-danger-bg`
- 边框：`--border-default`、`--border-light`、`--border-divider`
- 圆角：`--radius-sm`、`--radius-md`、`--radius-lg`、`--radius-full`
- 间距：`--space-*`
- 字体：`--font-size-*`、`--font-weight-*`
- 阴影：`--shadow-sm`、`--shadow-primary`
- 动效：`--duration-normal`、`--ease-out`

硬性要求：

- 不要继续新增大量硬编码颜色。
- 当前已有少量紫色/橙色来源标签，如果保留，尽量用现有 token 近似替换；确实无法表达时才保留极少量硬编码。
- 不要新增一套独立视觉体系。
- 不要使用大面积渐变、复杂阴影、装饰图形。

---

## 6. 中文和编码要求

非常重要：

- 不要批量重写中文文案。
- 不要因为终端里看到中文显示异常就整体“修复编码”。
- 如果浏览器中中文正常显示，则文案保持原样。
- 如果你发现当前文件存在会导致构建失败的字符串语法问题，只修复必要语法，不要顺手改业务文案。
- 修改后必须确认浏览器中没有新增中文显示异常。

---

## 7. 不要做的事

不要：

- 不要改 store。
- 不要改 mock 数据。
- 不要改路由。
- 不要新增依赖。
- 不要改变筛选条件含义。
- 不要改变任务详情抽屉内容结构。
- 不要改变新增监控流程。
- 不要把任务卡片改成不可点击。
- 不要把企业监测首页改成工作台对话式布局。
- 不要把页面做成 Element Plus 官方 demo 的默认样子。

---

## 8. 建议实现步骤

1. 阅读 `EnterpriseMonitorPage.vue`，确认当前 template / script / style 结构。
2. 保留 `<script setup>` 业务逻辑。
3. 优先改 template 中首页部分：
   - header
   - filter bar
   - task list
   - empty state
4. 保留 Dialog / Drawer 结构，只做必要 token 样式微调。
5. 清理 `<style scoped>` 中首页部分的硬编码颜色和重复样式。
6. 运行构建。

---

## 9. 验收标准

完成后请运行：

```bash
npm run build
```

浏览器检查：

1. 打开 `/enterprise-monitor`。
2. 页面标题、说明、`新增监控` 按钮存在。
3. 筛选栏五个筛选项都能正常切换。
4. 任务列表仍展示所有企业监测任务。
5. 点击任务卡片仍能打开任务详情 Drawer。
6. 更多操作下拉菜单仍可打开，菜单项不丢失。
7. `指标库` Dialog 可打开。
8. `新增监控` Dialog 可打开，自然语言和手工选择入口仍存在。
9. 空状态逻辑不变。
10. 页面视觉更接近 Element Plus + token.css，且不出现新增 console error。
11. 浏览器中文显示无新增异常。

---

## 10. 输出报告格式

完成后请输出：

```text
企业监测首页 Element Plus + token.css 改造完成报告

1. 修改了哪些文件
2. 哪些区域改成了 Element Plus 风格
3. 哪些样式改成了 token.css 变量
4. 是否保留全部原有交互
5. 是否修改了 store/mock/router/其他业务页面
6. npm run build 是否通过
7. 浏览器检查结果
```

