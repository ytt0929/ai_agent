# OpenClaw 提示词：企业探查首页改造成 Element Plus + token.css 风格

项目路径：`D:\demo\ai-copilot`

你是资深 Vue / Element Plus 前端工程师。请只改造「企业探查首页」的 UI 实现方式和样式，使其更符合项目统一设计系统：**Element Plus 组件优先 + `src/styles/tokens.css` 变量驱动**。

本次目标不是重做功能，也不是改企业探查详情页，而是把首页从“自定义 CSS 为主”收口为“Element Plus 组件 + token.css 视觉变量”的标准样板，后续工作台会参考这个风格。

---

## 1. 必须先阅读

请先阅读以下文件：

- `src/pages/EnterpriseDiagnosisListPage.vue`
- `src/styles/tokens.css`
- `src/styles/global.css`

可参考但不要修改：

- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/pages/EnterpriseDiagnosisPage.vue`
- `src/pages/ScreeningInitialPage.vue`
- `src/pages/WorkbenchPage.vue`

---

## 2. 允许修改范围

只允许修改：

- `src/pages/EnterpriseDiagnosisListPage.vue`

如确实发现 `tokens.css` 已有变量不足，优先复用现有变量，不要新增 token。除非非常必要，不要修改 `src/styles/tokens.css`。

禁止修改：

- 企业探查详情页
- 企业探查 workspace 页
- 工作台页面
- 智能尽调页面
- mock 数据
- store
- router
- 业务逻辑函数

---

## 3. 页面目标

页面路径：

- `/enterprise-diagnosis`

需要保留当前首页的信息结构：

1. 页面标题：`AI 企业探查`
2. 页面说明文案
3. 顶部企业/自然语言输入框
4. `开始探查` 主按钮
5. 示例问题分组
6. 最近探查列表
7. 风险筛选
8. 行操作：继续探查 / 查看证据链 / 推送尽调 / 授权税票

不要改变任何交互行为：

- `handleHeroSearch`
- `onChipClick`
- `continueExplore`
- `viewEvidence`
- `pushToDD`
- `authData`

---

## 4. Element Plus 改造要求

当前首页已经部分使用了 Element Plus，但仍有不少自定义结构和硬编码样式。请进一步收口：

### 4.1 顶部输入区

使用 Element Plus 组件组织：

- `el-card` 或具有 Element Plus 卡片语义的容器
- `el-input`
- `el-button`
- 可使用 `el-space` / flex 布局

要求：

- 输入区是项目风格的白色卡片，不要做成营销页 hero。
- 输入框和按钮高度协调。
- 输入框聚焦态使用 token 主色。
- 不要使用 Element Plus 默认生硬边框堆叠，外层卡片和内部输入要协调。
- 保留原 placeholder、按钮文字、回车搜索逻辑。

### 4.2 示例问题区

使用 Element Plus 风格按钮或标签：

- 优先用 `el-button`，也可以使用 `el-tag`，但必须保持可点击。
- 示例问题仍按原来的分组展示。
- 分组标题保留。
- 按钮视觉为浅蓝/浅色胶囊，不要改文字内容。

### 4.3 最近探查列表

继续使用 `el-table`，并强化 Element Plus 语义：

- 风险等级使用 `el-tag`
- 数据覆盖使用 `el-tag`
- 操作按钮使用 `el-button text`
- 筛选按钮使用 `el-button-group` 或 `el-segmented` 风格

要求：

- 不要退回原生 `table`。
- 不要新增复杂图表。
- 不要改变表格列含义。
- 表格高度、行高、留白要与项目当前金融业务风格一致，保持克制、清晰、可扫读。

---

## 5. token.css 使用要求

样式必须优先使用 `src/styles/tokens.css` 已有变量。

优先使用这些变量：

- 颜色：`--color-primary`、`--color-primary-hover`、`--color-primary-bg`
- 状态色：`--color-success`、`--color-warning`、`--color-danger`
- 背景：`--surface-page`、`--surface-card`、`--surface-soft`
- 文本：`--text-primary`、`--text-secondary`、`--text-tertiary`
- 边框：`--border-default`、`--border-light`、`--border-divider`
- 圆角：`--radius-md`、`--radius-lg`、`--radius-full`
- 间距：`--space-*`
- 字体：`--font-size-*`、`--font-weight-*`
- 阴影：`--shadow-sm`、`--shadow-primary`

硬性要求：

- 不要继续大量新增硬编码颜色，例如 `#2563eb`、`#eff6ff`、`#dbeafe`、`#f8fafc`。
- 如果必须写 rgba，优先减少使用，只用于阴影或极少数聚焦态。
- 不要新增一套独立设计语言。
- 不要使用大面积渐变、装饰背景、过度阴影。

---

## 6. 中文和编码要求

非常重要：

- 不要批量重写中文文案。
- 不要因为终端里看到中文显示异常就整体“修复编码”。
- 如果浏览器中中文正常显示，则所有文案保持原样。
- 如果你发现当前文件里确实存在会导致构建失败的字符串语法问题，只修复必要语法，不要顺手改业务文案。
- 修改后必须确认浏览器中没有新增中文显示异常。

---

## 7. 不要做的事

不要：

- 不要改路由。
- 不要改数据。
- 不要改点击行为。
- 不要改企业探查详情页。
- 不要改工作台。
- 不要改智能尽调。
- 不要改智能报告。
- 不要新增依赖。
- 不要把首页做成和工作台二级对话页一样的左右布局。
- 不要把页面做成 Element Plus 官方 demo 的默认风格。

---

## 8. 建议实现方式

可以按这个顺序做：

1. 梳理 `EnterpriseDiagnosisListPage.vue` 当前结构。
2. 保留现有脚本逻辑。
3. 将首页顶部区域整理成 Element Plus 风格卡片。
4. 将示例问题按钮调整为 Element Plus 胶囊按钮风格。
5. 将表格、标签、筛选按钮的样式统一到 Element Plus + token.css。
6. 清理本页面 `<style scoped>` 中明显多余或硬编码的颜色。
7. 运行构建。

---

## 9. 验收标准

完成后请运行：

```bash
npm run build
```

浏览器检查：

1. 打开 `/enterprise-diagnosis`。
2. 首页标题、说明、输入框、示例问题、最近探查列表仍完整存在。
3. `开始探查` 可正常进入企业探查 workspace。
4. 点击示例问题仍能进入对应探查流程。
5. 最近探查表格仍可筛选高/中/低风险。
6. `继续探查`、`查看证据链`、`推送尽调`、`授权税票` 行为不变。
7. 页面视觉更接近项目统一 Element Plus + token.css 风格。
8. 浏览器无新增 console error。
9. 浏览器中文显示无新增异常。

---

## 10. 输出报告格式

完成后请输出：

```text
企业探查首页 Element Plus + token.css 改造完成报告

1. 修改了哪些文件
2. 哪些区域改成了 Element Plus 风格
3. 哪些样式改成了 token.css 变量
4. 是否保留全部原有交互
5. 是否修改了企业探查详情页/工作台/智能尽调/智能报告
6. npm run build 是否通过
7. 浏览器检查结果
```

