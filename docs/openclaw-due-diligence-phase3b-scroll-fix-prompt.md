# OpenClaw 提示词：智能尽调详情页左右区域滚动修复

你是资深 Vue 前端工程师、资深 UX/UI 工程师。请只修复 **智能尽调详情页左侧结果展示区和右侧对话面板缺少上下滚动条** 的问题。

当前页面：`src/pages/DueDiligenceTaskPage.vue`

## 一、问题描述

智能尽调详情页现在左侧阶段产物区和右侧对话面板都没有独立上下滚动条。

表现：

- 左侧资料清单内容变长后，底部内容被截断或无法顺畅查看。
- 右侧对话消息变多后，消息区没有正常独立滚动。
- 输入框应该固定在右侧面板底部，但当前滚动容器高度没有形成闭环。

已知全局布局中 `App.vue` 的主区域类似：

```css
.app-main {
  height: 100vh;
  overflow: hidden;
}
```

所以浏览器页面本身不会滚动，智能尽调详情页必须自己在左右两栏内部建立滚动容器。

## 二、本轮修改范围

只允许修改：

- `src/pages/DueDiligenceTaskPage.vue` 的 `<style scoped>`

不要修改：

- `template`
- `script`
- `src/stores/dueDiligence.js`
- 左侧任何 artifact 组件
- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`
- `src/pages/SmartReportPage.vue`
- 路由
- 侧边栏
- 全局 token
- 其他业务模块

本轮只修布局滚动，不改业务逻辑。

## 三、目标布局

详情页应该形成如下滚动结构：

```text
┌──────────────────────────────────────────────────────────────┐
│ 任务头部：企业名 / 模板 / 来源 / 评分 / 进度                   │ 固定在上方
├──────────────────────────────────────────────────────────────┤
│ 流程条：工商核验 → 司法查询 → 税票采集 → ...                   │ 固定在上方
├──────────────────────────────────────┬───────────────────────┤
│ 左侧阶段产物工作区                    │ 右侧对话式尽调助手      │
│                                      │                       │
│ 内部纵向滚动                          │ 内部消息区纵向滚动       │
│                                      │                       │
│                                      │ 快捷动作和输入框固定底部 │
└──────────────────────────────────────┴───────────────────────┘
```

要求：

1. `.due-task` 占满当前视口。
2. 任务头部和流程条不参与内部滚动。
3. `.due-task__body` 占据剩余高度。
4. 左侧 `.due-task__workspace` 内部纵向滚动。
5. 右侧 `.chat-panel` 高度与左侧工作区一致。
6. 右侧 `.chat-panel__messages` 内部纵向滚动。
7. 右侧 `.chat-panel__chips` 和 `.chat-panel__input-row` 固定在面板底部，不跟着消息区滚走。
8. 不要让整个浏览器页面滚动。

## 四、当前问题原因

当前样式大致存在这些问题：

```css
.due-task {
  max-width: var(--layout-page-data, 1200px);
  margin: 0 auto;
  padding: var(--space-4xl, 32px);
}

.due-task__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
}

.due-task__workspace {
  min-width: 0;
}

.chat-panel {
  height: calc(100vh - 260px);
  overflow: hidden;
}

.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
}
```

问题：

- `.due-task` 没有形成 `height: 100vh` 的纵向 flex 容器。
- `.due-task__body` 没有 `flex: 1`、`min-height: 0`，子容器无法获得可滚动高度。
- `.due-task__workspace` 没有 `overflow-y: auto`。
- `.chat-panel` 使用硬编码 `calc(100vh - 260px)`，容易与头部高度不一致。
- Element Plus `el-scrollbar` 的内部 wrap 可能没有明确高度，需要通过 `min-height: 0` 和深度选择器保证滚动。

## 五、建议 CSS 修改方向

请在 `DueDiligenceTaskPage.vue` 的 `<style scoped>` 中调整相关样式。

可以参考下面方向，但请结合当前文件已有 CSS 做最小改动，不要整段重写整个 style：

```css
.due-task {
  height: 100vh;
  max-height: 100vh;
  max-width: var(--layout-page-data, 1200px);
  margin: 0 auto;
  padding: var(--space-4xl, 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.due-task__header,
.due-task__process-bar {
  flex-shrink: 0;
}

.due-task__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-lg);
  align-items: stretch;
}

.due-task__workspace {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding-right: var(--space-xs);
}

.due-task__assistant {
  min-width: 0;
  min-height: 0;
  height: 100%;
  position: static;
}

.chat-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-panel__header,
.chat-panel__chips,
.chat-panel__input-row {
  flex-shrink: 0;
}

.chat-panel__messages {
  flex: 1;
  min-height: 0;
}

.chat-panel__messages :deep(.el-scrollbar__wrap) {
  overflow-y: auto;
}

.chat-panel__messages :deep(.el-scrollbar__view) {
  min-height: 100%;
}
```

## 六、特别注意

1. 不要继续使用 `.chat-panel { height: calc(100vh - 260px); }` 这种硬编码高度。
2. 不要让 `.due-task__body` 使用 `align-items: start`，否则左右栏高度不一致。
3. 不要把 `overflow-y: auto` 放到整个 `.due-task` 上。本页应该左右两栏分别滚动。
4. 不要改 `App.vue` 的全局 `overflow: hidden`。
5. 不要自定义花哨滚动条，使用浏览器或 Element Plus 默认滚动即可。
6. 不要修改任何业务 handler、store 方法、artifact 数据。
7. 保留当前右侧对话式助手结构。
8. 保留当前左侧 7 个阶段产物。

## 七、验收标准

请完成后按以下路径自测：

1. 运行：

```bash
npm run build
```

必须通过。

2. 打开智能尽调首页，点击唐山物桥商贸有限公司「继续处理」进入详情页。

3. 切到「资料补充」阶段：

- 左侧资料清单内容可在左侧结果展示区内部上下滚动。
- 页面整体不出现浏览器主滚动。
- 头部任务信息和流程条仍在上方。

4. 右侧对话面板：

- 消息多时，消息区内部出现滚动。
- 快捷动作 chips 保持在消息区下方。
- 输入框固定在面板底部。
- 输入框不会被滚动内容挤出页面。

5. 切换到「产物确认」阶段：

- 左侧产物内容较长时仍能内部滚动查看。
- 右侧对话助手高度与左侧工作区一致。

## 八、输出报告

完成后请输出：

1. 修改了哪些 CSS 选择器。
2. 左侧滚动是如何实现的。
3. 右侧消息滚动是如何实现的。
4. 是否保留了右侧输入框固定底部。
5. 是否修改了业务逻辑、store、artifact 组件。
6. `npm run build` 是否通过。

