# OpenClaw 提示词：工作台左右独立滚动 + 全面 Element Plus 化

你是资深 Vue 前端工程师和资深 UI/UX 工程师。请在 `D:\demo\ai-copilot` 项目中继续修复【工作台】AI Copilot 二级页。

最新问题：页面整体在滚动，右侧 AI 面板被页面内容撑到底，左右区域没有自己的独立滚动条；左侧产物区和右侧对话区仍有较多自定义按钮、字体、卡片样式，不够像 Element Plus 组件体系。

本次只修工作台二级页，不要重构企业探查页面，不要新增依赖，不要接真实接口。

## 一、先读这些文件

请先完整阅读：

- `src/pages/WorkbenchPage.vue`
- `src/components/workbench/WorkbenchConversation.vue`
- `src/components/workbench/WorkbenchBusinessPanel.vue`
- `src/components/workbench/WorkbenchStageStrip.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/EnterpriseExplorationWorkspacePage.vue`
- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/App.vue`

重点排查布局高度链：

- `html, body, #app`
- `.app-layout`
- `.app-main`
- `.wb-page`
- `.wb-copilot`
- `.wb-state-split`
- `.wb-state-split__left`
- `.wb-state-split__right`
- `.wb-state-split__right-msgs`
- `.conversation`

## 二、必须解决的问题

### 1. 页面不能整体滚动

当前浏览器右侧出现整页滚动条，这是错误的。工作台 AI Copilot 二级页应该固定在视口内：

- 左侧产物区自己滚动。
- 右侧 AI 面板消息区自己滚动。
- 右侧 header 固定在顶部。
- 右侧输入区固定在底部。
- 页面本身、浏览器窗口不应该因为工作区内容而纵向滚动。

### 2. 右侧 AI 面板不能“到底”

右侧 AI 面板必须在当前视口高度内完整显示：

- `AI Copilot` header 固定。
- 消息区域滚动。
- 底部输入框始终可见。
- 不能让右侧消息内容把整个页面撑高。

### 3. 左右两栏都要有自己的滚动容器

左侧：

- `.wb-state-split__left` 独立滚动。
- 左侧 toolbar / steps 可以跟随左侧内容滚动，也可以 sticky，但不要影响右侧。

右侧：

- `.wb-state-split__right` 不滚动，负责固定面板骨架。
- `.wb-state-split__right-msgs` 才是消息滚动区。
- `.conversation` 不要再自己滚动，避免双滚动。

### 4. 页面样式全面使用 Element Plus 组件语言

要求尽量使用 Element Plus 组件，而不是大量自定义 `button/div`：

- 按钮用 `el-button`
- 标签用 `el-tag`
- 卡片/产物块用 `el-card`
- 指标卡可用 `el-row/el-col + el-card` 或 `el-statistic`
- 步骤用 `el-steps/el-step`
- tab 用 `el-tabs/el-tab-pane`
- 表格用 `el-table`
- 描述信息用 `el-descriptions`
- 输入框用 `el-input`
- 空状态用 `el-empty`
- 提示用 `el-alert`
- 字体使用 Element Plus 默认字体和项目 tokens，不要自己做大字号、粗重标题、胶囊按钮风格。

## 三、代码修改要求

### 1. 修改全局高度链

检查 `src/styles/global.css`、`src/styles/tokens.css`、`src/App.vue`，确保应用外壳不会把工作台二级页撑成整页滚动。

建议全局或工作台局部保证：

```css
html,
body,
#app {
  height: 100%;
  overflow: hidden;
}

.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-main {
  min-width: 0;
  min-height: 0;
  height: 100vh;
  overflow: hidden;
}
```

如果全局改动会影响其他页面，可以只在 `WorkbenchPage.vue` 的工作台页内强约束：

```css
.wb-page {
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
```

注意：优先避免影响其他页面。如果全局已有页面需要滚动，不要粗暴全局禁滚，而是在工作台路由容器内锁定高度。

### 2. 修改 `src/pages/WorkbenchPage.vue`

#### 2.1 二级页骨架必须固定高度

把工作台二级页写成固定高度布局：

```css
.wb-copilot {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.wb-state-split {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  overflow: hidden;
}
```

不要再让 `.wb-state-split` 或其父级依赖内容撑高。

#### 2.2 左侧产物区独立滚动

```css
.wb-state-split__left {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px;
  background: var(--el-bg-color-page);
}
```

左侧内容过高时，只出现左侧滚动条。

#### 2.3 右侧 AI 面板固定骨架，消息区独立滚动

```css
.wb-state-split__right.ai-assistant-panel {
  width: 380px;
  min-width: 380px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  border-left: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.wb-state-split__right-head.ai-assistant-panel__header {
  flex: 0 0 48px;
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-light);
}

.wb-state-split__right-msgs.ai-assistant-panel__messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  background: var(--el-bg-color);
}

.wb-composer--right.ai-assistant-panel__footer {
  flex: 0 0 auto;
  padding: 12px;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}
```

关键要求：

- `.wb-state-split__right` 不允许 `overflow-y: auto`。
- `.wb-state-split__right-msgs` 必须是唯一的右侧消息滚动容器。
- `.conversation` 必须 `overflow: visible`，不能再制造第二个滚动条。

#### 2.4 输入区改成 Element Plus 组件风格

当前建议按钮用了原生 `button.wb-sug-btn`。请改成 `el-button`：

```vue
<div v-if="assistant.contextSuggestions.length" class="wb-sug">
  <el-button
    v-for="(s, i) in assistant.contextSuggestions"
    :key="i"
    size="small"
    round
    plain
    type="primary"
    @click="assistant.handleSuggestionClick(s)"
  >
    {{ s.label }}
  </el-button>
</div>
```

发送区建议改成：

```vue
<div class="wb-composer-row">
  <el-input
    v-model="dialogInputLocal"
    :placeholder="dialogPlaceholder"
    clearable
    @keyup.enter="sendMsg"
    class="wb-composer__input"
  />
  <el-button type="primary" :icon="Promotion" @click="sendMsg" />
</div>
```

不要使用 `el-input` 的 append slot 把按钮塞进输入框里，右侧面板空间窄时容易挤压。

### 3. 修改 `src/components/workbench/WorkbenchConversation.vue`

#### 3.1 禁止组件自己滚动

```css
.conversation {
  min-height: 0;
  overflow: visible;
  padding: 0;
  background: transparent;
}
```

滚动交给父级 `.wb-state-split__right-msgs`。

#### 3.2 使用 Element Plus 视觉变量

不要写太多硬编码颜色，尽量使用：

- `var(--el-color-primary)`
- `var(--el-color-primary-light-9)`
- `var(--el-bg-color)`
- `var(--el-bg-color-page)`
- `var(--el-border-color)`
- `var(--el-border-color-light)`
- `var(--el-text-color-primary)`
- `var(--el-text-color-regular)`
- `var(--el-text-color-secondary)`

#### 3.3 消息样式贴近企业探查，但更 Element

```css
.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  margin-bottom: 14px;
}

.message.ai {
  justify-content: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.ai-avatar,
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 600;
}

.ai-avatar {
  background: var(--el-color-primary);
  color: #fff;
}

.user-avatar {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color);
}

.bubble {
  max-width: min(85%, 260px);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.bubble.ai {
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
  border-top-left-radius: 4px;
}

.bubble.user {
  background: var(--el-color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
```

#### 3.4 过程卡片不要撑开右侧面板

当前 `process-card` 在右侧太大，会让面板内容流很长。建议二选一：

方案 A：右侧不显示 `process-card`，只显示对话；步骤移到左侧。

方案 B：将 `process-card` 改成 Element Plus 卡片风格且宽度受控：

```css
.process-card {
  width: 100%;
  max-width: 100%;
  margin: 8px 0 14px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}
```

优先方案 A。

### 4. 修改 `src/components/workbench/WorkbenchBusinessPanel.vue`

左侧产物区要用 Element Plus 组件样式，不要自绘太多卡片。

#### 4.1 外层不滚动，不设高度

```css
.wb-business-panel {
  min-height: 0;
  overflow: visible;
  padding: 0;
  background: transparent;
}
```

滚动只交给 `.wb-state-split__left`。

#### 4.2 指标卡改 Element 风格

不要用自定义 `.wb-bp-metric` 造卡。建议改成：

```vue
<el-row v-if="data.summary" :gutter="12" class="wb-bp-metrics">
  <el-col :span="8">
    <el-card shadow="never" class="wb-bp-metric-card">
      <el-statistic title="匹配企业" :value="128" suffix="家" />
    </el-card>
  </el-col>
  ...
</el-row>
```

如果值是字符串，也可以继续展示，但外层必须用 `el-card`。

#### 4.3 企业探查结果用 Element 组件

企业探查页左侧建议：

- 企业名称用 `el-card` 或 `el-alert`
- 基本信息用 `el-descriptions`
- 风险 tab 用 `el-tabs`
- 风险明细用 `el-table`
- 结论用 `el-alert`

不要让表格横向撑出左侧区域：

```css
.wb-bp-table,
.wb-bp-tabs,
.wb-bp-desc {
  width: 100%;
  min-width: 0;
}
```

### 5. 修改 `src/components/workbench/WorkbenchStageStrip.vue`

优先改成 Element Plus 组件，而不是自定义大胶囊按钮。

推荐在 `WorkbenchPage.vue` 里用 `el-steps simple` 直接替换：

```vue
<el-card v-if="assistant.flowStages.length" shadow="never" class="wb-workspace-stage-card">
  <el-steps :active="activeStageIndex" finish-status="success" simple>
    <el-step
      v-for="stage in assistant.flowStages"
      :key="stage.id"
      :title="stage.label"
      @click="assistant.setActiveStage(stage.id)"
    />
  </el-steps>
</el-card>
```

如果保留 `WorkbenchStageStrip.vue`，里面的按钮也要改成 `el-button` 或 `el-tag` 风格，不要继续使用原生 `button.stage-tab`。

## 四、必须写入验收检查

完成后运行：

```bash
npm run build
```

然后人工检查或用浏览器检查：

1. 打开 `/workbench`。
2. 进入 AI Copilot 二级工作区。
3. 浏览器窗口右侧不应出现整页滚动条。
4. 左侧产物内容过长时，只左侧栏滚动。
5. 右侧消息过长时，只右侧消息区滚动，右侧 header 和底部输入固定。
6. 右侧 AI 面板不再被消息内容撑到底。
7. 按钮、标签、卡片、表格、tabs、输入框都尽量使用 Element Plus 组件。
8. 无横向滚动条。
9. 无双输入框。
10. 无右侧面板和左侧内容互相抢滚动的问题。

## 五、不要做的事

- 不要改企业探查页面业务逻辑。
- 不要新增依赖。
- 不要接真实接口。
- 不要让浏览器页面整体滚动。
- 不要让 `.conversation` 和 `.wb-state-split__right-msgs` 同时滚动。
- 不要使用大量原生 `button` 自绘组件。
- 不要大范围重写 mock 数据。
- 不要大范围修复全项目乱码，只修本次工作台可见文案。

## 六、最终回复

完成后请回复：

1. 修改了哪些文件。
2. 如何保证页面本身不滚动。
3. 左侧产物区的滚动容器是哪一个。
4. 右侧 AI 面板的滚动容器是哪一个。
5. 哪些自定义 UI 已替换为 Element Plus 组件。
6. 是否通过 `npm run build`。
