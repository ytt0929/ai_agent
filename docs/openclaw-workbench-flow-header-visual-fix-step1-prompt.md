# OpenClaw Prompt - Step 1 工作台尽调流程头部视觉修复

请严格按本提示词执行。  
这一步只修 **工作台 Workbench 的尽调流程头部视觉**，不要扩散到智能尽调详情页，不要改 store，不要改 artifact。

## 当前问题

现在 `WorkbenchPage.vue` 中的合并头部方向是对的：  
工作台尽调流程顶部只保留一个增强版流程卡，不再显示两张重复头部卡。

但是当前实现的视觉效果不好：

1. 企业名太大，容易换行；
2. 模板、评分、风险、资料完整度等 badge 挤压企业名；
3. 流程条变成小图标 + 短连接线，看起来像标签串，不像之前稳定的流程卡；
4. active 节点动态效果弱；
5. 与之前较好的第二块流程卡风格差异明显。

本次不要重新设计，不要大改结构。  
**只在现有 `wb-due-flow-header` 基础上修视觉。**

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

## 目标效果

把当前工作台尽调头部修成接近之前“第二块流程卡”的风格：

```text
┌──────────────────────────────────────────────────────────────────────┐
│ 唐山物桥商贸有限公司   商贸流通 / 河北省唐山市          [状态]  57%   │
│ [尽职调查报告]  综合评分 72  [C+]  [中风险]  资料完整度 86%          │
├──────────────────────────────────────────────────────────────────────┤
│ ● 工商核验 ━━━━━ ● 司法查询 ━━━━━ ◎ 税票采集 ━━━━━ ○ 资料补充       │
│                ━━━━━ ○ 证据整合 ━━━━━ ○ 风险诊断 ━━━━━ ○ 产物确认   │
└──────────────────────────────────────────────────────────────────────┘
```

注意：

- 企业名应该是 20px 左右，不要 32px 以上的大标题；
- 企业名优先保持一行，必要时省略号，不要轻易换成两行；
- 行业/地区紧跟企业名后面，颜色浅一些；
- 模板、评分、评级、风险、资料完整度放第二行或自然换行，不要全部挤在右侧；
- 当前状态和进度可以放右上角；
- 流程条必须有旧版流程卡那种“强流程感”：大圆点、长连接线、清晰 active 蓝色圆环；
- 不要做成小图标 + 短横线。

## 具体修改要求

### 1. 保留现有结构，不要重新造第三套头

当前应该已有：

```vue
<section v-if="assistant.isDueWorkspace && currentDueFlow" class="wb-due-flow-header">
  ...
</section>
```

请继续使用这个结构。  
不要恢复 `DueTaskHeader`。  
不要新增另一个大 header。  
不要再做只针对风险诊断的特殊 header。

### 2. 调整顶部信息布局

建议结构保持或调整为：

```text
top row:
  left: 企业名 + 行业/地区
  right: 当前状态 tag + 进度百分比

meta row:
  [尽职调查报告] 综合评分 72 [C+] [中风险] 资料完整度 86%

steps row:
  流程条
```

关键 CSS 要求：

```css
.wb-due-flow-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.wb-due-flow-header__left {
  min-width: 0;
  flex: 1;
}

.wb-due-flow-header__title {
  font-size: 20px 左右;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wb-due-flow-header__badges {
  flex-wrap: wrap;
  justify-content: flex-start;
  flex-shrink: 1;
}
```

不要让右侧 badge 区域设置成 `flex-shrink: 0` 后把企业名挤爆。  
如果现在 badges 在 top row 右侧，请把大部分 badges 移到第二行。

### 3. 恢复流程条的视觉强度

当前流程条太轻。请把 `.wb-flow-step` / `.wb-flow-step__line` 调整为更接近旧版流程卡：

#### done 节点

- 圆点 28px 或 32px；
- 绿色实心；
- 白色对勾；
- label 深色；
- 后方连接线绿色且较长。

#### active 节点

- 圆点 28px 或 32px；
- 白底 + 蓝色 2px 描边；
- 外圈淡蓝 halo；
- label 蓝色加粗；
- 可以保留轻微 pulse，但不要过亮；
- active 节点底部蓝色短线可以保留。

#### pending 节点

- 圆点 24px 或 28px；
- 浅灰底；
- 灰色数字；
- label 浅灰；
- 连接线浅灰。

#### 连接线

连接线必须明显：

```css
.wb-flow-step__line {
  flex: 1 1 40px;
  min-width: 28px;
  max-width: 72px;
  height: 2px;
}
```

不要使用 `max-width: 18px`、`max-width: 24px` 这种太短的线。  
这正是当前流程条不像流程条的主要原因。

### 4. 流程条换行规则

流程条可以换行，但不能变成碎片。

要求：

- `.wb-due-flow-header__steps` 可以 `flex-wrap: wrap`;
- 每个 step + connector 不要因为过窄变成一堆小碎片；
- 如果空间不足，优先让整组自然换行，而不是把连接线压到很短；
- 不要横向溢出。

### 5. 动态逻辑不能改坏

保留现有 computed：

- `wbDueFlowEnterprise`
- `wbDueFlowMetaText`
- `wbDueFlowTemplate`
- `wbDueFlowScore`
- `wbDueFlowGrade`
- `wbDueFlowRisk`
- `wbDueFlowCompleteness`
- `wbStepIsDone`
- `wbStepIsActive`
- `wbStepIsPending`
- `wbFlowStepClass`
- `wbFlowLineClass`

如需微调 CSS class 可以改，但不要改业务状态机。

当前节点高亮必须继续跟随当前 workbench flow，不要固定某一个节点。

### 6. 使用项目 token

样式必须使用项目 token：

- `var(--surface-card)`
- `var(--surface-soft)`
- `var(--text-primary)`
- `var(--text-secondary)`
- `var(--text-tertiary)`
- `var(--border-light)`
- `var(--border-color-divider)`
- `var(--space-xs)`
- `var(--space-sm)`
- `var(--space-md)`
- `var(--space-lg)`
- `var(--radius-md)`
- `var(--color-primary)`
- `var(--color-success)`
- `var(--color-warning)`

不要新增大面积硬编码颜色。  
不要新增渐变大背景。  
不要新增强阴影。  
不要使用很多 icon。

## 验收路径

完成后运行：

```bash
npm run build
```

然后只验收工作台：

1. 智能筛客后选择唐山物桥商贸有限公司；
2. 新建尽调；
3. 选择「尽职调查报告」模板；
4. 开始工商核验；
5. 逐步进入：
   - 工商核验
   - 司法查询
   - 税票采集
   - 资料补充
   - 证据整合
   - 风险诊断
   - 产物确认

每个节点检查：

- 头部只有一个流程卡；
- 企业名不再大面积换行；
- badge 不挤压企业名；
- 流程条圆点明显；
- 连接线明显且连续；
- active 节点蓝色圆环明显；
- 当前节点高亮正确；
- 下方业务产物不受影响；
- 右侧 AI Copilot 不受影响。

## 输出要求

完成后请回复：

1. 是否只修改了 `src/pages/WorkbenchPage.vue`；
2. 是否没有修改 store/router/artifact/token；
3. 企业名和 badges 是否不再互相挤压；
4. 流程条连接线是否恢复为长连接线；
5. active 节点是否恢复为明显蓝色圆环；
6. 工作台 7 个节点高亮是否正确；
7. `npm run build` 是否通过。

