# OpenClaw 提示词：工作台首页改为 AI 优先布局，仅调整布局不改内容

你是资深 Vue 前端工程师和资深 UX/UI 工程师。请调整【工作台首页】的信息架构，让首页更像 AI Copilot 产品：首屏先突出自然语言对话入口，下面再展示待办、推荐、进度和快捷操作。

项目路径：

```text
D:\demo\ai-copilot
```

## 0. 本次目标

只调整工作台首页布局，不改业务内容，不改二级 AI Copilot 工作区流程。

当前首页问题：

- “下一步让 AI 处理”的输入框位置太靠后，像待办卡片附属功能。
- 首屏主要是待办列表，AI 产品心智不明显。
- 用户不知道可以输入什么。

目标：

- 工作台首页首屏优先展示 AI Copilot 自然语言输入面板。
- 用户打开首页第一眼就知道：可以用自然语言筛客、探索企业、发起尽调、查风险、生成报告。
- “今日待办”“推荐下一步”“本周进度”“快捷操作”“我的任务”都保留，但下移到 AI 输入面板之后。
- 不改变现有业务内容，只调整布局和入口表达。
- 不要把中文改成乱码。

## 1. 必读文件

请阅读：

- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/styles/tokens.css`
- `src/styles/global.css`

如需参考视觉风格，可阅读：

- `src/pages/EnterpriseExplorationWorkspacePage.vue`

## 2. 硬性限制

必须遵守：

- 不要改二级页 AI Copilot 工作区的主流程。
- 不要改 `workbenchAssistant.js` 里已有流程逻辑，除非为了新增默认查询示例需要补一个极小辅助入口。
- 不要改路由。
- 不要新增依赖。
- 不要删除现有待办、推荐、本周进度、快捷操作、我的任务内容。
- 不要把中文文案改成乱码。
- 不要修复、重写、批量替换当前文件里已有的乱码中文。
- 当前已有乱码文案保持原样，不要动。
- 新增文案必须使用正常中文。
- 首页 UI 必须使用 Element Plus 组件。
- 样式必须使用 `tokens.css` 的全局 token。

## 3. 首页新的信息架构

请把首页改成：

```text
顶部：
  问候语 + 日期 + 通知

第一屏核心：
  AI Copilot 主输入面板
  默认查询示例
  快捷 prompt chips

第二层：
  推荐下一步

第三层：
  今日待办

第四层：
  本周进度 / 快捷操作

第五层：
  我的任务
```

也就是：

```text
AI 先行
任务跟随
数据支撑
```

## 4. 必须修改 `WorkbenchPage.vue` 首页模板

当前首页大概率结构是：

```vue
<div v-if="!assistant.dialogOpen" class="wb-home">
  <header ... />
  <div class="wb-home__grid">
    <section class="wb-card wb-card--wide">今日待办 + 推荐下一步 + AI 输入</section>
    ...
  </div>
</div>
```

请重组为：

```vue
<div v-if="!assistant.dialogOpen" class="wb-home">
  <header class="wb-home__header">...</header>

  <section class="wb-ai-hero">
    <!-- AI 主输入面板 -->
  </section>

  <section class="wb-ai-recommend">
    <!-- 推荐下一步，保留原内容 -->
  </section>

  <section class="wb-card wb-card--wide wb-todos-section">
    <!-- 今日待办，保留原 todos 内容 -->
  </section>

  <div class="wb-home__grid">
    <section class="wb-card wb-card--narrow">
      <!-- 本周进度，保留原内容 -->
    </section>
    <section class="wb-card wb-card--narrow">
      <!-- 快捷操作，保留原内容 -->
    </section>
  </div>

  <section class="wb-card wb-card--wide">
    <!-- 我的任务，保留原任务表 -->
  </section>
</div>
```

注意：

- 不要删除原来的待办、推荐、统计、快捷、任务。
- 只是把 AI 输入面板从“今日待办卡片内部”提到首屏。
- 推荐下一步从待办内部拆出来，放在 AI 输入面板下方。

## 5. AI Copilot 主输入面板要求

新增首屏主模块，建议 class：

```text
wb-ai-hero
```

内容结构：

```text
标题：AI Copilot
主文案：用一句话开始客户经营
辅助文案：可以自然语言筛客、探索企业、发起尽调、查风险、生成报告
默认查询示例
输入框
快捷 prompt chips
```

建议模板：

```vue
<section class="wb-ai-hero">
  <div class="wb-ai-hero__head">
    <div>
      <div class="wb-ai-hero__eyebrow">AI Copilot</div>
      <h2 class="wb-ai-hero__title">用一句话开始客户经营</h2>
      <p class="wb-ai-hero__desc">
        可以自然语言筛客、探索企业、发起尽调、查风险、生成报告。
      </p>
    </div>
  </div>

  <div class="wb-ai-hero__example">
    <span class="wb-ai-hero__example-label">查询示例</span>
    <button class="wb-ai-hero__example-text" @click="fillDemoQuery">
      筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户
    </button>
    <el-button type="primary" plain size="small" @click="sendDemoQuery">
      直接发送
    </el-button>
  </div>

  <el-input
    v-model="dialogInputLocal"
    placeholder="例如：帮我筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户"
    clearable
    size="large"
    @keyup.enter="handleNormalSend"
    class="wb-ai-hero__input"
  >
    <template #prefix>
      <el-icon><ChatDotRound /></el-icon>
    </template>
    <template #append>
      <el-button type="primary" @click="handleNormalSend">
        <el-icon><Promotion /></el-icon>
      </el-button>
    </template>
  </el-input>

  <div class="wb-ai-hero__chips">
    ...
  </div>
</section>
```

快捷 chips 保留当前内容，但语义改成 prompt 模板：

- 处理税票
- 查看证据
- 发起筛客
- 生成报告摘要

点击后仍然调用现有 `handleNormalSendWith(text)`。

## 6. 必须新增默认查询示例场景

新增默认查询示例：

```text
筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户
```

要求：

- 首页 AI 输入框默认可以直接展示这个示例。
- 用户可以点击示例填入输入框。
- 用户也可以点击“直接发送”，demo 阶段无需手动输入。
- 点击“直接发送”后，必须进入二级 AI Copilot 工作区，并走现有 `assistant.runIntentRecognition()` / `handleNormalSend()` 流程。

建议在 `WorkbenchPage.vue` 中增加：

```js
const demoQuery = '筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户'

function fillDemoQuery() {
  dialogInputLocal.value = demoQuery
}

function sendDemoQuery() {
  dialogInputLocal.value = demoQuery
  handleNormalSend()
}
```

如果当前 store 的筛客 mock 更偏“深圳软件企业”，暂时不强制改业务逻辑，但输入文案必须是上述浙江制造业场景。

如要让 demo 更一致，可以在 `workbenchAssistant.js` 的 `runScreening()` 中识别：

- 浙江省
- 制造业
- 低风险
- 近一年有开票记录
- 适合转尽调

并复用已有 `mockEnterprises`。但不要大改流程。

## 7. 推荐下一步位置

原本“推荐下一步”在待办卡片内部。

请拆出来，放在 AI 主输入面板下方。

要求：

- 内容保持原来的建议内容，不要删除。
- 样式可以是轻量 `el-card` 或 `el-alert`。
- 操作按钮保留“采纳建议”“稍后处理”。
- 视觉上它是 AI 主入口后的辅助建议，不是首屏主角。

## 8. 今日待办位置

今日待办要下移到推荐下一步之后。

要求：

- 保留现有 `todos` 数据。
- 保留优先级颜色。
- 保留操作按钮。
- 可以把待办卡片做得更紧凑。
- 不要把 AI 输入框放回待办卡片内部。

## 9. 样式要求

请使用 `tokens.css` 的变量：

```css
var(--surface-page)
var(--surface-card)
var(--surface-soft)
var(--border-default)
var(--border-divider)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--color-primary)
var(--color-primary-bg)
var(--radius-md)
var(--radius-lg)
var(--space-md)
var(--space-lg)
var(--space-xl)
```

首页不要做营销页风格，不要大面积渐变，不要装饰圆球。

AI 主输入面板应该是工作台工具风：

- 白色或浅蓝背景。
- 细边框。
- 稳定圆角。
- 输入框突出。
- chips 轻量。

建议样式方向：

```css
.wb-ai-hero {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin-bottom: 16px;
}

.wb-ai-hero__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.wb-ai-hero__desc {
  color: var(--text-secondary);
}

.wb-ai-hero__example {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 16px 0;
  padding: 10px 12px;
  background: var(--surface-page);
  border: 1px solid var(--border-divider);
  border-radius: var(--radius-md);
}
```

示例文本按钮可以用原生 button，但更推荐 `el-button link` 或 `el-tag`；如果使用原生 button，必须做成无侵入样式。

## 10. 中文与乱码硬性要求

新增中文必须正常显示，不允许乱码。

非常重要：

- 不要修复历史乱码。
- 不要批量替换历史乱码。
- 不要重写现有 todos、tasks、quickActions、greeting、formattedDate 等已有中文数据。
- 不要因为“看起来乱码”就改动现有业务文案。
- 本次只允许新增 AI 主输入面板相关的正常中文文案。
- 现有乱码保持原样，避免扩大改动范围和引入新错误。

请不要复制当前文件中已经乱码的文案作为新增文案。

新增文案统一使用：

- `AI Copilot`
- `用一句话开始客户经营`
- `可以自然语言筛客、探索企业、发起尽调、查风险、生成报告。`
- `查询示例`
- `筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户`
- `直接发送`

## 11. 验收

完成后运行：

```bash
npm run build
```

检查：

1. 工作台首页首屏先看到 AI Copilot 主输入面板。
2. 今日待办不再是首屏最大主角。
3. 推荐下一步位于 AI 输入面板下方。
4. 今日待办位于推荐下一步下方。
5. AI 输入面板中有默认查询示例。
6. 点击示例可以填入输入框。
7. 点击“直接发送”可以进入二级 AI Copilot 工作区。
8. 快捷 chips 仍可使用。
9. 原有今日待办、本周进度、快捷操作、我的任务内容都还在。
10. 新增中文没有乱码。
11. `npm run build` 通过。

## 12. 最终回复

完成后请回复：

1. 修改了哪些文件。
2. 首页信息架构如何调整。
3. AI 主输入面板放到了哪里。
4. 默认查询示例如何实现。
5. 是否保留了原有待办/进度/快捷操作/我的任务。
6. `npm run build` 结果。
