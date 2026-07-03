# OpenClaw Prompt - Step 1B 工作台尽调流程头部状态一致性修复

请严格按本提示词执行。  
本轮只修 **工作台 Workbench 尽调流程头部的状态一致性和轻量视觉收口**。  
不是全页面重构，不是重新设计头部，不要扩散到智能尽调详情页。

## 本轮必须解决的问题

当前工作台在税票采集阶段出现 3 个严重不一致：

1. 页面标题和左侧内容还是「税票采集」，但流程条已经高亮到「资料补充」；
2. 进度显示 43%，但资料完整度显示 86%，明显过早；
3. 还没有进入风险诊断，却已经显示综合评分 72、评级 C+、中风险；
4. 流程条因为连接线过长而换行，导致 7 个节点不再像一条完整流程。

本轮目标：

**工作台流程头必须和当前左侧 artifact 阶段一致。税票采集页面就高亮税票采集；资料补充页面才高亮资料补充；风险诊断完成后才展示最终评分、评级和风险等级。**

## 允许修改

只允许修改：

- `src/pages/WorkbenchPage.vue`
- `src/stores/workbenchAssistant.js`

其中：

- `WorkbenchPage.vue`：修头部展示逻辑和流程条样式；
- `workbenchAssistant.js`：只允许小范围修 `dueTaskHeader` / `dueFlow` 的阶段数据，不要重写状态机。

## 禁止修改

不要修改：

- `src/pages/DueDiligenceTaskPage.vue`
- `src/components/workbench/*.vue`
- `src/components/workbench/artifacts/*.vue`
- `src/router/*`
- `src/styles/tokens.css`
- `src/data/*.js`

不要处理乱码。浏览器页面不是乱码。  
不要做全页面视觉重构。  
不要改右侧 AI 对话面板。  
不要改左侧 artifact 内容。

## 具体修复要求

### 1. 修复税票采集阶段高亮提前的问题

当前 `mockTaxAuthorized()` 中税票采集完成后，左侧仍然显示税票采集 artifact，但 `dueFlow.steps` 把：

```js
tax: done
materials: active
progress: 43
```

这会导致“税票采集页面高亮资料补充”的错误。

请改成：

```js
tax: active
materials: pending
progress: 43
statusText: '税票采集已完成'
activeKey: 'tax'
```

也就是说：

- 税票采集完成后，如果还没有真正进入资料补充 artifact，流程条仍高亮「税票采集」；
- 右侧建议按钮可以提示「模拟企业上传资料」或「进入资料补充」，但头部流程条不要提前跳；
- 只有真正调用 `runMaterialsStep()` 或切到 materials artifact 后，才高亮「资料补充」。

### 2. 修复资料完整度过早显示 86%

当前 `dueTaskHeader` 里类似逻辑：

```js
const completeness = leftPanelData.completeness ?? (currentArtifactType.value === 'materials' ? 67 : 86)
```

这会导致税票采集阶段显示 86%，不合理。

请改为按阶段动态显示：

```text
business / judicial / tax: 不显示 86；可以显示 “资料待补充” 或 “资料完整度 --”
materials 等待上传: 67%
materials 上传完成后: 86%
evidence / riskDiagnosis / deliverables / deliveryPackage / reportEditor: 86%
```

实现方式可以是：

- 在 `dueTaskHeader` 中按 `currentArtifactType` 返回更准确的 completeness；
- 或在 `WorkbenchPage.vue` 的 computed 中按阶段决定是否展示；
- 但不要在税票阶段显示 86%。

验收标准：

- 税票采集 43% 时，不能显示 `资料完整度 86%`；
- 如果显示完整度，应该是 `资料待补充` / `资料完整度 --` / `资料完整度 67%` 三者之一；
- 资料上传完成后，才能显示 `资料完整度 86%`。

### 3. 修复评分、评级、风险等级过早出现

当前税票采集阶段已经显示：

```text
综合评分 72  C+  中风险
```

这不符合业务流程。评分和风险等级应该来自风险诊断，不能在风险诊断前稳定展示。

请改成阶段化展示：

```text
business / judicial / tax / materials / evidence:
  不显示 72 / C+ / 中风险
  可以显示：综合评分 待诊断 / 风险等级 待诊断

riskDiagnosis / deliverables / deliveryPackage / reportEditor:
  显示：综合评分 72 / C+ / 中风险
```

验收标准：

- 税票采集 43% 页面不能出现 `综合评分 72`、`C+`、`中风险`；
- 风险诊断完成后可以出现；
- 产物确认和交付包阶段可以继续出现。

### 4. 修复流程条换行问题

上一轮把连接线加长后，7 个节点在工作台左侧内容区换行了。  
本轮要保留流程感，但桌面宽度下必须尽量单行展示。

请调整 `.wb-due-flow-header__steps` / `.wb-flow-step__line`：

建议：

```css
.wb-due-flow-header__steps {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow: hidden;
}

.wb-flow-step {
  flex: 0 0 auto;
}

.wb-flow-step__line {
  flex: 1 1 24px;
  min-width: 14px;
  max-width: 52px;
}
```

要求：

- 桌面宽度下 7 个节点优先一行展示；
- 连接线仍要明显，不能回到特别短的 8px 小短线；
- label 字号不要放大；
- 如果极窄屏幕实在放不下，可以在媒体查询中允许换行，但普通工作台宽度不要换行。

### 5. 修复按钮和流程不对应

当前右侧建议按钮出现「模拟企业上传资料」，但流程条仍应表达当前 artifact 阶段。

规则：

- 右侧按钮可以代表“下一步动作”；
- 顶部流程条必须代表“左侧当前正在看的阶段”；
- 不要因为出现下一步按钮，就提前把流程条 active 移到下一步。

也就是说：

```text
左侧税票采集页面 + 右侧按钮「模拟企业上传资料」
=> 顶部流程条 active 仍是「税票采集」

点击进入/模拟上传后，左侧切到资料补充页面
=> 顶部流程条 active 才是「资料补充」
```

### 6. 不要改坏已有流程

必须保留：

- 工作台可以继续从税票采集进入资料补充；
- 点击「模拟企业上传资料」后能推进；
- 资料补充后能进入证据整合；
- 证据整合后能进入风险诊断；
- 风险诊断后能进入产物确认；
- 产物确认后能生成交付包。

不要改 `handleSuggestionClick` 的主流程分发，除非为了修复上述状态一致性必须做小范围调整。

## 视觉要求

保持上一轮已经改善的方向：

- 企业名不换成大标题；
- badge 不挤压企业名；
- active 节点保持蓝色圆环；
- done 节点保持绿色实心圆；
- pending 节点保持浅灰圆；
- 连接线保持清晰；
- 工作台桌面宽度下一行展示 7 个节点。

使用项目 token：

- `var(--surface-card)`
- `var(--text-primary)`
- `var(--text-secondary)`
- `var(--text-tertiary)`
- `var(--border-light)`
- `var(--border-color-divider)`
- `var(--color-primary)`
- `var(--color-success)`
- `var(--color-warning)`
- `var(--space-xs)`
- `var(--space-sm)`
- `var(--space-md)`
- `var(--space-lg)`

不要新增大面积硬编码颜色。

## 验收路径

完成后运行：

```bash
npm run build
```

然后人工或浏览器检查工作台：

### 税票采集阶段

进入税票采集并点击：

1. 确认发送采集链接；
2. 模拟企业已授权；

检查：

- 页面标题：税票采集；
- 左侧 artifact：税票采集；
- 顶部流程条 active：税票采集；
- 进度：43%；
- 资料完整度不能显示 86%；
- 不能显示综合评分 72 / C+ / 中风险；
- 右侧可以出现下一步动作按钮，但不影响流程条 active。

### 资料补充阶段

点击模拟企业上传资料，真正进入资料补充后检查：

- 页面标题：资料补充；
- 左侧 artifact：资料补充；
- 顶部流程条 active：资料补充；
- 资料完整度可以显示 67% 或 86%，取决于当前资料上传状态；
- 如果资料识别完成后，显示 86% 是合理的。

### 风险诊断阶段

进入风险诊断后检查：

- 可以显示综合评分 72；
- 可以显示 C+；
- 可以显示中风险；
- active 节点为风险诊断；
- 流程条不换行。

### 产物确认阶段

进入产物确认后检查：

- 可以显示综合评分 72 / C+ / 中风险 / 资料完整度 86%；
- active 节点为产物确认；
- 流程条不换行；
- 产物确认按钮仍可用。

## 输出要求

完成后请汇报：

1. 修改了哪些文件；
2. 是否只改了 `WorkbenchPage.vue` 和必要的 `workbenchAssistant.js`；
3. 税票采集 43% 时 active 是否仍是税票采集；
4. 税票采集 43% 时是否不再显示资料完整度 86%；
5. 风险诊断前是否不再显示 72 / C+ / 中风险；
6. 风险诊断后是否正常显示评分、评级、风险；
7. 工作台 7 个节点流程条是否桌面下一行展示；
8. `npm run build` 是否通过。

