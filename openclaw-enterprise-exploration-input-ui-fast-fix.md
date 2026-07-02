# OpenClaw 快速修改提示词：企业探查输入框与查询示例对齐智能筛客

项目路径：`D:\demo\ai-copilot`

你是资深 Vue 前端工程师。请只做一个小范围 UI 修复：把“企业探查”初始对话阶段的输入框和“查询示例”样式，改成与“智能筛客”首页一致。不要改业务流程，不要改路由，不要改 mock 数据，不要处理中文编码。

## 必改文件

只改：

- `src/pages/EnterpriseExplorationWorkspacePage.vue`

参考但不要修改：

- `src/pages/ScreeningInitialPage.vue`

## 目标位置

在 `src/pages/EnterpriseExplorationWorkspacePage.vue` 中定位：

- 模板里 `v-if="!workspaceActive"` 的初始对话阶段
- 原来的 `.edw-chat-only__input`
- 脚本里的 `chatInput`、`sendChat`
- 样式里的 `.edw-chat-only__input`

## 参考样式

参考 `src/pages/ScreeningInitialPage.vue` 的这些结构和样式：

- `.nl-input-card`
- `.nl-input-row`
- `.nl-star-icon`
- `.nl-textarea`
- `.nl-submit-area`
- `.nl-circle-btn`
- `.nl-submit-label`
- `.section-area`
- `.section-label`
- `.chips-row`
- `.chip`

## 具体改法

1. 把企业探查初始态底部的普通 `el-input + el-button` 改成智能筛客同款输入卡片：
   - 左侧使用 `MagicStick` 图标
   - 中间使用原生 `textarea`
   - 绑定仍然是 `v-model="chatInput"`
   - 回车仍然触发 `sendChat`
   - 右侧使用圆形按钮，图标用 `Promotion`
   - 按钮禁用条件仍然是 `!chatInput.trim() || isExploring`

2. 输入框 placeholder 内容保持原来的意思：
   - “输入企业名称或统一社会信用代码，或直接提问…”
   - 不要新增复杂说明文案

3. 在输入卡片下方新增“查询示例”区域，样式对齐智能筛客的示例 chips：
   - 标题：`查询示例`
   - chip 样式用浅蓝背景、圆角胶囊、蓝色文字
   - 点击 chip 只把示例文字写入 `chatInput`
   - 不要自动发起查询

4. 示例内容只用企业探查已有语义，不要改业务内容：
   - `税负率是多少`
   - `查看申报明细`
   - `查看股东明细`
   - `是否存在欺诈风险`

5. 在 `<script setup>` 中补充：
   - 从 `@element-plus/icons-vue` 引入 `MagicStick`、`Promotion`
   - 增加 `queryExamples`
   - 增加 `selectQueryExample(example) { chatInput.value = example }`

6. 样式命名建议使用企业探查自己的前缀，避免影响智能筛客：
   - `.edw-chat-only__composer`
   - `.edw-nl-input-card`
   - `.edw-nl-input-row`
   - `.edw-nl-star-icon`
   - `.edw-nl-textarea`
   - `.edw-nl-submit-area`
   - `.edw-nl-circle-btn`
   - `.edw-nl-submit-label`
   - `.edw-query-examples`
   - `.edw-query-chip`

## 不要做

- 不要修改浏览器里正常显示的中文文案。
- 不要做任何“乱码修复”。
- 不要改 `ScreeningInitialPage.vue`。
- 不要改企业探查的聊天流程、识别逻辑、报告逻辑、证据链逻辑。
- 不要改右侧 AI 面板。
- 不要新增依赖。

## 验收

完成后运行：

```bash
npm run build
```

浏览器检查：

1. 打开企业探查新建页，例如 `/enterprise-diagnosis/workspace/_new`。
2. 初始态底部输入区应与智能筛客首页视觉一致：卡片、MagicStick 图标、textarea、圆形发送按钮。
3. “查询示例”应在输入卡片下方，chip 风格与智能筛客一致。
4. 点击 chip 后只填入输入框，不自动发送。
5. 输入企业名或问题后，原有 `sendChat` 流程仍正常。
6. 页面中文在浏览器中不能出现新增乱码。
