# OpenClaw 提示词：Phase 3-F-2B 单点优化「税票采集」节点 UI

请先阅读以下文件，再开始修改：

1. `src/components/workbench/artifacts/TaxCollectionArtifact.vue`
2. `src/components/workbench/WorkbenchBusinessPanel.vue`
3. `src/pages/WorkbenchPage.vue`
4. `src/pages/DueDiligenceTaskPage.vue`
5. `src/stores/workbenchAssistant.js` 中税票采集相关数据结构，只读，不要改
6. `src/styles/tokens.css`

## 本阶段目标

只优化「税票采集」节点的 UI，也就是：

```text
src/components/workbench/artifacts/TaxCollectionArtifact.vue
```

这个组件同时被工作台和智能尽调详情页使用，因此必须兼容两个入口：

```text
工作台：
  待发送采集链接 -> 已发送等待授权 -> 已授权/采集完成 -> 进入资料补充

智能尽调详情页：
  通常从已发送等待授权开始 -> 模拟授权 -> 后续节点
```

目标是把税票采集页从“状态行 + 指标卡 + 日志”调整成清晰的过程型节点页面，让用户一眼知道：

```text
当前卡在哪一步
授权链接是否已发送
企业是否已授权
税票数据采集到什么程度
下一步该点哪个按钮
```

## 严格边界

只允许修改：

```text
src/components/workbench/artifacts/TaxCollectionArtifact.vue
```

不要修改：

```text
src/stores/workbenchAssistant.js
src/stores/dueDiligence.js
src/pages/WorkbenchPage.vue
src/pages/DueDiligenceTaskPage.vue
src/pages/DueDiligenceHomePage.vue
src/pages/SmartReportPage.vue
src/components/workbench/WorkbenchBusinessPanel.vue
src/router/*
src/styles/tokens.css
```

不要改业务逻辑。

不要改 props。

不要改 emit 名称。

不要删除现有按钮。

不要真实复制、下载二维码或调用后端。

不要把中文改乱码。

## 必须保留的 emit

必须保留：

```js
defineEmits([
  'confirm-tax-send',
  'tax-authorized',
  'enter-materials',
  'send-reminder',
  'switch-to-upload',
  'download-qr'
])
```

并且以下按钮仍然触发原事件：

```text
确认发送采集链接 -> confirm-tax-send
模拟企业已授权 -> tax-authorized
进入资料补充 -> enter-materials
发送提醒 -> send-reminder
改为上传材料 -> switch-to-upload
下载二维码 -> download-qr
```

## 数据状态兼容要求

组件当前通过 `props.data` 读取：

```text
status
authStatus
linkStatus
authUrl
input.count / input.total
output.count / output.total
filing.status
logs
```

需要兼容这些状态值：

```text
status:
  等待授权
  已完成
  —

authStatus:
  等待授权
  已授权
  已切换
  —

linkStatus:
  待发送
  已发送
  已使用
  已切换
  —
```

注意：工作台会出现 `linkStatus === '待发送'`，智能尽调详情页更多是 `linkStatus === '已发送'`。

不要写死只有一种路径。

## 页面结构要求

请把页面改成以下结构：

```text
税票采集 [等待授权/已完成] [授权状态] [链接状态]
税票采集需要企业授权。授权完成后将自动采集进项、销项和纳税申报数据。

┌──────────────────────────────────────────────┐
│ 授权信息                                      │
│ el-descriptions                               │
│ 授权状态 / 链接状态 / 授权方式 / 有效期          │
│ 授权链接 code + 复制链接 / 下载二维码            │
├──────────────────────────────────────────────┤
│ 采集进度                                      │
│ 进项发票       128/150       progress          │
│ 销项发票        96/120       progress          │
│ 纳税申报        已采集 / 未采集                  │
├──────────────────────────────────────────────┤
│ 采集日志                                      │
│ el-table：时间 / 事项 / 状态                    │
├──────────────────────────────────────────────┤
│ 操作区                                        │
│ 根据状态显示主按钮和次按钮                       │
└──────────────────────────────────────────────┘
```

重要：顶部「税票采集」区域不要做成厚重 el-card，不要像表格标题上面又压了一个大标题卡。它只是当前节点的轻量状态说明。

顶部状态区应类似 section header / inline summary：

```text
税票采集 [等待授权] [授权状态：等待授权] [链接状态：已发送]
税票采集需要企业授权。授权完成后将自动采集进项、销项和纳税申报数据。
```

视觉要求：

```text
1. 高度控制在 64-72px 以内。
2. padding 控制在 8-12px。
3. 背景透明或非常浅的 var(--surface-soft)。
4. 可以有浅边框或底边线，但不要完整大卡片阴影。
5. 下方「授权信息」才是第一个主要内容卡片。
```

## 三种状态的 UI 和按钮

### 状态 A：待发送采集链接

判断：

```js
linkStatus === '待发送'
```

展示重点：

```text
授权状态：等待授权
链接状态：待发送
说明：已生成采集链接，需先发送给企业。
```

按钮：

```text
主按钮：确认发送采集链接
```

触发：

```vue
@click="$emit('confirm-tax-send')"
```

### 状态 B：已发送，等待企业授权

判断：

```js
linkStatus === '已发送' && authStatus !== '已授权'
```

展示重点：

```text
授权链接已发送，等待企业扫码授权。
可发送提醒，也可以 demo 模拟企业已授权。
```

按钮：

```text
主按钮：模拟企业已授权
次按钮：发送提醒
次按钮：改为上传材料
次按钮：下载二维码
```

触发：

```vue
@click="$emit('tax-authorized')"
@click="$emit('send-reminder')"
@click="$emit('switch-to-upload')"
@click="$emit('download-qr')"
```

### 状态 C：已授权 / 已完成

判断：

```js
authStatus === '已授权' || currentStatus === '已完成'
```

展示重点：

```text
企业已授权，税票数据采集完成。
进项发票、销项发票、纳税申报有结果。
```

按钮：

```text
主按钮：进入资料补充
```

触发：

```vue
@click="$emit('enter-materials')"
```

## 视觉要求

必须使用 Element Plus：

```text
el-card
el-descriptions
el-descriptions-item
el-tag
el-progress
el-table
el-table-column
el-button
el-alert
el-row
el-col
```

不要使用原生 table。

不要新增大量 icon。

不要做大面积彩色背景。

授权链接区域要轻量，不要像警告框。

采集日志建议从 div list 改成 `el-table`：

```text
时间 / 事项 / 状态
```

## CSS 要求

只改 `TaxCollectionArtifact.vue` 的 scoped style。

所有新增/调整样式使用 token：

```css
var(--surface-card)
var(--surface-soft)
var(--border-default)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--color-primary)
var(--color-success)
var(--color-warning)
var(--color-danger)
var(--space-xs)
var(--space-sm)
var(--space-md)
var(--space-lg)
var(--radius-sm)
var(--radius-md)
var(--font-size-xs)
var(--font-size-sm)
var(--font-size-body)
var(--font-size-lg)
```

可以带 fallback：

```css
background: var(--surface-card, #fff);
border: 1px solid var(--border-default, #dbe3ef);
```

根容器必须：

```css
.artifact-tax {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}
```

操作区必须：

```css
.artifact-tax__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-sm, 8px);
  min-width: 0;
  padding-top: var(--space-sm, 8px);
  border-top: 1px solid var(--border-default, #dbe3ef);
}
```

授权链接必须：

```css
word-break: break-all;
white-space: normal;
```

指标卡在窄容器下要自动换行：

```vue
<el-col :xs="24" :sm="8">
```

不要只写 `:span="8"`。

## 具体优化点

### 1. 顶部轻量状态区

新增一个轻量 header block，不要使用厚重 `el-card`：

```text
标题：税票采集
说明：税票采集需要企业授权。授权完成后将自动采集进项、销项和纳税申报数据。
状态 tag：等待授权 / 已完成
授权状态 tag
链接状态 tag
```

推荐结构：

```vue
<div class="artifact-tax__summary">
  <div class="artifact-tax__summary-main">
    <span class="artifact-tax__summary-title">税票采集</span>
    <el-tag ...>{{ currentStatus }}</el-tag>
    <el-tag ...>授权：{{ authStatus }}</el-tag>
    <el-tag ...>链接：{{ linkStatus }}</el-tag>
  </div>
  <p class="artifact-tax__summary-desc">税票采集需要企业授权。授权完成后将自动采集进项、销项和纳税申报数据。</p>
</div>
```

不要把它做成完整卡片，不要让它抢走下方「授权信息」和「采集进度」的视觉重心。

### 2. 授权信息区

用 `el-descriptions` 展示：

```text
授权状态
链接状态
授权方式：企业扫码授权
有效期：24 小时
```

如果 `authUrl` 存在，展示授权链接：

```text
https://ai-copilot.demo/auth/rpa002
[复制链接] [下载二维码]
```

如果 `authUrl` 不存在，展示轻量空状态，不要报错。

`copyAuthLink()` 保留现有 clipboard 行为即可，不需要新增成功提示。

### 3. 采集进度区

3 个 compact 指标卡：

```text
进项发票  inputCount/inputTotal  progress
销项发票  outputCount/outputTotal progress
纳税申报  filingStatus
```

如果 total 为 0，progress 显示 0，不要出现 NaN。

### 4. 采集日志区

将当前日志 div list 改成 `el-table`：

```text
时间 time
事项 desc
状态 statusLabel(status)
```

状态用 `el-tag`：

```text
done -> success / 已完成
waiting -> warning / 等待中
running -> primary / 进行中
```

注意 `statusLabel()` 现有函数可以继续使用，但不要输出乱码。

### 5. 操作区

把当前多个 `v-if` 操作区整理成一个清晰操作区，或者保留多个操作区但样式统一。

推荐 computed：

```js
const isWaitingToSend = computed(() => linkStatus.value === '待发送')
const isWaitingAuthorization = computed(() => linkStatus.value === '已发送' && authStatus.value !== '已授权')
const isCompleted = computed(() => currentStatus.value === '已完成' || authStatus.value === '已授权')
```

模板中按状态显示按钮。

## 双入口验收

完成后必须检查：

### A. 工作台入口

路径：

```text
工作台 -> 新建尽调 -> 开始工商核验 -> 自动到税票采集
```

检查三种状态：

```text
1. 初始待发送：显示「确认发送采集链接」
2. 点击确认发送后：显示「模拟企业已授权」「发送提醒」「改为上传材料」
3. 点击模拟授权后：显示采集完成结果和「进入资料补充」
```

### B. 智能尽调详情入口

路径：

```text
智能尽调首页 -> 进入税票采集中的任务详情
```

检查：

```text
1. 默认已发送等待授权状态显示正常。
2. 「模拟企业已授权」仍然可推进。
3. 右侧尽调助手不被覆盖。
4. 左侧税票页不溢出。
```

## 构建要求

完成后运行：

```bash
npm run build
```

## 输出要求

完成后请汇报：

1. 是否只修改了 `TaxCollectionArtifact.vue`。
2. 是否保留所有 props 和 emit。
3. 三种税票状态分别如何展示。
4. 采集日志是否改成 Element Plus 表格。
5. 授权链接是否能自动换行。
6. 工作台入口验收情况。
7. 智能尽调详情入口验收情况。
8. `npm run build` 是否通过。
