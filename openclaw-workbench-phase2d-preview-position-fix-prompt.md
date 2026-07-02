# OpenClaw 提示词：Phase 2-D 查看报告无反馈修复

请读取并严格执行本文件：

`openclaw-workbench-phase2d-preview-position-fix-prompt.md`

## 当前问题

工作台产物确认页中，点击「尽职调查报告 / 查看」后，用户看起来没有任何反应。

实际原因大概率是：

1. 当前报告预览是内嵌面板；
2. 面板被放在 `DeliverablesArtifact.vue` 的底部，位于「报告模板与资料包」「待确认项」「动作区」之后；
3. 点击查看后，预览虽然可能已经展开，但没有自动滚动到预览区域；
4. 用户视口仍停留在产物表格附近，所以误以为按钮无效。

本轮只修交互反馈和预览位置，不要重写主流程。

## 只允许修改文件

只修改：

`src/components/workbench/artifacts/DeliverablesArtifact.vue`

不要修改：

- `src/stores/workbenchAssistant.js`
- `src/pages/WorkbenchPage.vue`
- 智能尽调、智能报告、税票采集等独立模块
- 路由
- mock 数据文件

## 必须修复

### 1. 把报告预览面板移动到产物列表下面

当前结构大概率类似：

```vue
产物列表 el-card
报告模板与资料包 el-card
待确认项 el-card
动作按钮
previewVisible 面板
```

请改为：

```vue
产物列表 el-card
previewVisible 面板
报告模板与资料包 el-card
待确认项 el-card
动作按钮
```

也就是说，点击产物表格里的「查看」后，预览面板应立即出现在产物列表下方，用户不需要翻到很下面才能看到。

### 2. 点击查看后自动滚动到预览面板

在 `script setup` 中引入：

```js
import { computed, ref, nextTick } from 'vue'
```

新增：

```js
const previewPanelRef = ref(null)

async function revealPreviewPanel() {
  await nextTick()
  previewPanelRef.value?.$el?.scrollIntoView?.({
    behavior: 'smooth',
    block: 'start'
  })
}
```

如果 `previewPanelRef.value.$el` 不存在，也兼容 DOM：

```js
const el = previewPanelRef.value?.$el || previewPanelRef.value
el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
```

在预览面板上加：

```vue
<el-card
  v-if="previewVisible"
  ref="previewPanelRef"
  shadow="never"
  class="artifact-card artifact-card--preview"
>
```

在 `openPreview(row)` 最后调用：

```js
previewVisible.value = true
revealPreviewPanel()
```

### 3. 点击查看要有即时反馈

为了 demo 可感知，点击「查看」后可以加一个轻量提示：

```js
ElMessage.success(`已打开${row.name}预览`)
```

不要弹窗，不要阻断。

### 4. 保持报告文档预览不变

保留 Phase 2-D 已实现的文档化报告预览：

- 白色文档页
- 封面信息
- 摘要
- 15 章目录
- 15 章正文
- 资料依据
- 证据链
- 待确认项
- 底部「进入编辑」「导出报告」「关闭预览」

不要改回抽屉。

### 5. 修复可能存在的编码或模板问题

请检查 `DeliverablesArtifact.vue` 中是否有异常字符串、半截标签、缺失引号、错误模板表达式。

重点检查：

```vue
<el-tag type="success" size="small">已生成</el-tag>
<el-table-column label="状态" width="90" align="center">
<el-descriptions-item label="资料包">...</el-descriptions-item>
<span class="report-cover__label">企业名称：</span>
<h3>{{ section.no }}、{{ section.title }}</h3>
```

如果发现类似下面这种内容，必须修正：

```vue
宸茬敓鎴?/el-tag>
label="鐘舵€? width="90"
{{ section.no }}銆亄{ section.title }}
```

所有展示文本必须是正常中文。

### 6. 保持按钮逻辑

产物列表按钮必须保持：

- `尽职调查报告`：查看 / 编辑
- `工商核验报告`：查看
- `司法查询报告`：查看
- `税票分析报告`：查看
- `风险诊断报告`：查看
- `证据链文件`：查看 / 生成

点击「尽职调查报告 / 查看」必须打开文档化预览。

## 验收标准

请修改后验证：

1. `npm run build` 必须通过
2. 打开工作台产物确认页
3. 点击第一行「尽职调查报告 / 查看」
4. 页面应自动滚动到产物列表下方的文档化预览面板
5. 用户能立即看到「报告预览：尽职调查报告」
6. 右侧 AI Copilot 不被覆盖
7. 点击其他报告「查看」仍能打开轻量预览
8. 控制台不能出现 DeliverablesArtifact.vue 相关报错

## 输出报告格式

完成后请输出：

```text
Phase 2-D Preview Position Fix 完成报告

1. 修改了哪些文件
2. 是否把预览面板移动到产物列表下方
3. 点击查看后是否自动滚动到预览
4. 是否保留文档化报告预览和 15 章目录
5. npm run build 是否通过
6. 是否仍有控制台报错
```

