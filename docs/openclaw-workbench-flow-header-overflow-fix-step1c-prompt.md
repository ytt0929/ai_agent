# OpenClaw Prompt - Step 1C 工作台尽调流程条尾部遮挡修复

请读取并严格执行本提示词。  
本轮只修 **工作台尽调流程头部的流程条尾部被遮挡问题**。  
不要改业务状态机，不要改智能尽调详情页，不要改 artifact，不要改右侧 AI 对话。

## 当前问题

Step 1B 后，状态一致性已经修好，但工作台在「新建尽调 / 等待开始」等 0% 阶段出现流程条尾部被遮挡：

- 右侧最后一个节点「产物确认」显示不完整；
- 第 6 个节点「风险诊断」右侧连接线和第 7 个节点被容器裁掉；
- 原因是 `.wb-due-flow-header__steps` 设置了 `flex-wrap: nowrap` + `overflow: hidden`，同时 7 个节点和连接线总宽度超过了左侧工作区可用宽度。

## 只允许修改

- `src/pages/WorkbenchPage.vue`

## 禁止修改

不要修改：

- `src/stores/workbenchAssistant.js`
- `src/stores/dueDiligence.js`
- `src/pages/DueDiligenceTaskPage.vue`
- `src/components/workbench/*.vue`
- `src/components/workbench/artifacts/*.vue`
- `src/router/*`
- `src/styles/tokens.css`
- `src/data/*.js`

不要处理乱码。浏览器页面不是乱码。  
不要做全页面视觉重构。  
不要改流程状态、suggestion 按钮、AI 对话逻辑。

## 目标效果

工作台尽调流程头部在常规桌面宽度下必须完整展示 7 个节点：

```text
◎ 工商核验 ━━ ○ 司法查询 ━━ ○ 税票采集 ━━ ○ 资料补充 ━━ ○ 证据整合 ━━ ○ 风险诊断 ━━ ○ 产物确认
```

要求：

- 不允许尾部被裁掉；
- 不允许出现横向滚动条；
- 不允许最后一个节点被遮挡；
- 普通工作台宽度下优先一行展示；
- 如果宽度确实不够，允许流程条自然换成两行，但必须完整显示，不能被 `overflow: hidden` 裁掉。

## 具体修复建议

### 1. 不要使用裁剪

检查 `.wb-due-flow-header__steps`：

如果当前有：

```css
overflow: hidden;
flex-wrap: nowrap;
```

请改成更安全的布局：

```css
.wb-due-flow-header__steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: var(--space-sm);
  column-gap: var(--space-xs);
  overflow: visible;
  min-width: 0;
  max-width: 100%;
}
```

说明：

- 不要裁剪流程条；
- 允许极限情况下换行；
- 换行比遮挡更可接受。

### 2. 压缩单个节点宽度

为了常规宽度下仍尽量一行，请收紧节点尺寸：

```css
.wb-flow-step {
  flex: 0 0 auto;
  gap: 4px;
}

.wb-flow-step__dot {
  width: 24px;
  height: 24px;
}

.wb-flow-step__label {
  font-size: 12px;
  white-space: nowrap;
}
```

不要把企业名、badge 或流程节点字体放大。

### 3. 连接线可变短，但不能消失

连接线不要再用过长的最大值。建议：

```css
.wb-flow-step__line {
  flex: 1 1 18px;
  min-width: 10px;
  max-width: 36px;
  height: 2px;
}
```

要求：

- 连接线仍然可见；
- 不要回到 0 或完全没有线；
- 连接线比 Step 1B 稍短，以换取 7 节点完整展示。

### 4. 重点修复第 7 节点显示

必须确认以下节点完整显示：

- 工商核验
- 司法查询
- 税票采集
- 资料补充
- 证据整合
- 风险诊断
- 产物确认

尤其检查 `产物确认` 不能被右侧容器边界裁掉。

### 5. 不要改状态显示

本轮不要改变：

- 税票 43% active 仍为税票采集；
- 风险诊断前不显示 72 / C+ / 中风险；
- 税票阶段不显示资料完整度 86%；
- 当前状态、进度、按钮逻辑不变。

## 验收路径

完成后运行：

```bash
npm run build
```

然后检查工作台：

1. 新建尽调，选择「尽职调查报告」后，停在等待开始 / 工商核验 0%；
2. 检查流程条 7 个节点是否完整显示；
3. 检查「产物确认」是否没有被遮挡；
4. 开始工商核验后继续检查工商、司法、税票阶段；
5. 检查没有横向滚动条；
6. 检查右侧 AI Copilot 不受影响。

## 输出要求

完成后请汇报：

1. 是否只修改了 `src/pages/WorkbenchPage.vue`；
2. 是否没有修改 store/router/artifact/token；
3. 是否移除了流程条裁剪；
4. 7 个流程节点是否完整显示；
5. 「产物确认」是否不再被遮挡；
6. `npm run build` 是否通过。

