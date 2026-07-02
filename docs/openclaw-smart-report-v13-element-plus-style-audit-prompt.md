# OpenClaw 提示词：智能报告 Element Plus 组件与样式统一整改

你是资深 Vue 3 前端工程师、资深 UX/UI 工程师。请对智能报告页面做一次 Element Plus 组件与样式统一整改。本轮重点是：排查并替换当前页面中未使用 Element Plus 的原生控件、自定义按钮、自定义标签和遗留样式，让首页、AI 任务对话、报告编辑、报告模板中心、上传/生成报告等部分风格统一。不要扩展产品功能，不要改智能尽调、企业探查、路由、侧边栏和全局样式。

## 当前项目情况

- 技术栈：Vue 3 + Vite + Element Plus。
- 当前主要文件：`src/pages/SmartReportPage.vue`。
- 当前智能报告已包含多个视图：
  - `view === 'home'`：智能报告首页
  - `view === 'taskDialog'`：AI 任务识别/确认页
  - `view === 'templateCenter'`：报告模板中心
  - `view === 'templateUpload'`：上传新版模板
  - `view === 'upload'`：上传资料附件生成报告
  - `view === 'generating'`：生成报告中
  - `view === 'editor'`：报告编辑详情页
- 当前文件中已经大量使用 Element Plus，但仍有原生控件和自定义组件样式混用，导致页面风格不统一。

## 本轮只允许修改

- `src/pages/SmartReportPage.vue`

不要修改：

- `src/data/mockSmartReport.js`
- 智能尽调相关文件
- 企业探查相关文件
- 路由
- 侧边栏
- 全局样式文件
- 其他页面

## 一、当前发现的问题清单

### 1. 上传资料附件生成报告页仍使用原生控件

位置：`view === 'upload'`

当前问题：

- 使用了原生 `<select>`：

```vue
<select v-model="uploadTplId" class="sr-upload__select">
```

- 使用了原生 `<textarea>`：

```vue
<textarea v-model="uploadNote" class="sr-upload__note">
```

- 使用了原生 `<button>`：

```vue
<button class="sr-btn sr-btn--primary">生成报告草稿</button>
<button class="sr-btn">取消</button>
<button class="sr-btn">继续上传资料</button>
```

整改要求：

- 替换为 Element Plus：
  - `<el-select>` + `<el-option>`
  - `<el-input type="textarea">`
  - `<el-button>`
  - 上传区域建议使用 `<el-upload>` 或保留模拟上传区域但用 `<el-card>` / `<el-empty>` / `<el-alert>` / `<el-tag>` 组织视觉
- 不再使用 `.sr-upload__select`、`.sr-upload__note`、`.sr-btn` 作为主控件样式。

### 2. 报告编辑详情页正文编辑仍使用原生 textarea 和 button

位置：`view === 'editor'`

当前问题：

```vue
<textarea v-model="editText" class="sr-sec-edit__textarea" rows="12"></textarea>
<button class="sr-btn sr-btn--primary" @click="saveEdit">保存</button>
<button class="sr-btn" @click="cancelEdit">取消</button>
```

整改要求：

- 替换为：

```vue
<el-input v-model="editText" type="textarea" :rows="12" />
<el-button type="primary" @click="saveEdit">保存</el-button>
<el-button @click="cancelEdit">取消</el-button>
```

- 保留当前编辑逻辑，不改业务。
- 删除或弱化 `.sr-sec-edit__textarea` 和 `.sr-btn` 对该区域的依赖。

### 3. 报告详情页状态仍使用自定义 badge

位置：`view === 'editor'`

当前问题：

```vue
<span class="sr-badge" :class="statusBadgeClass(activeReport?.status)">
<span class="sr-badge" :class="statusBadgeClass(currentSection.status)">
```

整改要求：

- 优先替换为 `<el-tag>`。
- 新增或复用一个函数返回 Element Plus tag type，例如：

```js
function statusTagType(status) {
  if (!status) return 'info'
  if (status.includes('待确认')) return 'warning'
  if (status.includes('缺失') || status.includes('资料不足')) return 'danger'
  if (status.includes('已') || status.includes('完成')) return 'success'
  return 'info'
}
```

- 不要继续新增 `.sr-badge--xxx` 样式。

### 4. 老旧自定义按钮、标签、chip 样式仍残留

当前文件中存在：

- `.sr-btn`
- `.sr-btn--primary`
- `.sr-tag`
- `.sr-tag--warn`
- `.sr-tag--danger`
- `.sr-tag--success`
- `.sr-badge`
- `.sr-badge--warn`
- `.sr-badge--danger`
- `.sr-badge--success`
- `.sr-chip`
- `.sr-input-row__input`
- `.sr-upload__select`
- `.sr-upload__note`

整改要求：

- 如果模板中已经没有引用，请删除这些旧样式。
- 如果仍有引用，优先替换成 Element Plus 组件。
- 不要一次性大面积删除不确定是否还在用的样式；请先替换模板引用，再清理明确未使用的样式。

### 5. 首页仍有自定义卡片视觉过多

位置：`view === 'home'`

当前已经使用：

- `el-card`
- `el-input`
- `el-button`
- `el-table`
- `el-tag`

但仍存在较多自定义能力卡样式：

- `.sr-cap-card`
- `.sr-cap-card__icon`
- `.sr-cap-card__title`
- `.sr-cap-card__desc`

整改要求：

- 可以保留 `el-card` 作为能力卡容器，但按钮、标签必须使用 Element Plus。
- 尽量通过 Element Plus 的 `shadow="never"` / `shadow="hover"`、`el-space`、`el-row`、`el-col` 来组织，不要继续堆大量自定义视觉。
- 保持首页简洁，不要大卡片化。

### 6. AI 任务识别/对话面板有大量自定义气泡样式

位置：`view === 'taskDialog'` 和 `editor` 右侧 AI 面板。

当前问题：

- `ai-message`
- `ai-message__avatar`
- `ai-message__bubble`
- `sr-ai-quick-inline`
- `sr-typing-dots`

这些可以保留为 AI 对话特有样式，但要注意：

- 面板容器、输入框、按钮必须使用 Element Plus。
- 推荐动作按钮必须使用 `<el-button size="small">`。
- 状态和材料标签使用 `<el-tag>`。
- 不要用自定义 button。

### 7. 生成报告中页面是纯自定义 loading

位置：`view === 'generating'`

当前问题：

- `.sr-generating__spinner`
- `.sr-generating__step-icon`

整改要求：

- 可以替换为 Element Plus：
  - `<el-result>`
  - `<el-steps>`
  - `<el-step>`
  - `<el-icon class="is-loading">`
  - `<el-progress>`
- 至少要把步骤展示改成 `<el-steps>`，使风格更统一。

### 8. 报告模板中心和上传模板页整体方向正确，但仍需统一 Element Plus 质感

位置：

- `view === 'templateCenter'`
- `view === 'templateUpload'`

当前已经使用：

- `el-input`
- `el-select`
- `el-table`
- `el-tag`
- `el-button`
- `el-card`
- `el-steps`

整改要求：

- 保持左右布局，不要改回大表格。
- 筛选区建议用 `el-form inline` 或 `el-space` 组织，避免自定义布局太重。
- 详情区尽量用：
  - `el-descriptions`
  - `el-table`
  - `el-tabs` 或 `el-collapse`
  - `el-alert`
  - `el-tag`
- 上传页上传区优先用 `el-upload`，如果保留模拟上传，也要用 Element Plus 卡片和提示组件组织。

### 9. 报告中心如果已存在，也需要统一

如果当前文件里已经有 `view === 'reportCenter'` 或相关报告中心代码：

- 搜索/筛选使用 `el-input`、`el-select`。
- 列表使用 `el-table`。
- 状态使用 `el-tag`。
- 操作用 `el-button`。
- 新建报告用 `el-dialog` + `el-form`。

如果当前没有 `reportCenter`，本轮不要新增报告中心，只处理现有代码的 Element Plus 统一。

## 二、统一整改原则

本轮是样式和组件统一，不是产品功能扩展。

请遵守：

- 优先使用 Element Plus 组件。
- 不新增依赖。
- 不改路由。
- 不改 mock 数据。
- 不改智能尽调。
- 不改企业探查。
- 不改全局样式。
- 不改侧边栏。
- 不新增复杂业务流程。
- 不重写整个文件。

## 三、推荐替换清单

请按优先级替换：

1. 原生控件替换
   - `<select>` -> `<el-select>`
   - `<option>` -> `<el-option>`
   - `<textarea>` -> `<el-input type="textarea">`
   - `<button>` -> `<el-button>`

2. 自定义状态样式替换
   - `.sr-badge` -> `<el-tag>`
   - `.sr-tag` -> `<el-tag>`
   - 自定义资料状态 tag -> `<el-tag>`

3. 生成中页面替换
   - 自定义 spinner -> Element Plus loading / progress / steps
   - 自定义 step row -> `<el-steps>`

4. 上传页替换
   - 自定义上传卡片保留可以，但建议加 `<el-upload>` 或使用 `<el-card>` + `<el-alert>` + `<el-tag>`
   - 上传结果资料列表建议用 `<el-tag>` 或 `<el-table>`

5. 清理未使用样式
   - 确认模板中无引用后，删除旧样式块：
     - `.sr-btn`
     - `.sr-chip`
     - `.sr-tag`
     - `.sr-badge`
     - `.sr-upload__select`
     - `.sr-upload__note`

## 四、具体页面整改要求

### 首页

- 保留当前 Element Plus 表格和输入框。
- 能力卡可以继续用 `el-card`，但减少自定义样式依赖。
- 快捷动作按钮继续使用 `el-button`。
- 最近报告状态继续使用 `el-tag`。

### AI 任务对话页

- 左侧确认卡继续使用 `el-card`、`el-descriptions`、`el-tag`、`el-button`。
- 右侧 AI 面板输入框和按钮继续使用 `el-input`、`el-button`。
- 自定义气泡可以保留，但不要用原生 button。

### 上传资料生成报告页

必须整改：

- 模板选择改成 `el-select`。
- 上传说明改成 `el-input type="textarea"`。
- 操作按钮改成 `el-button`。
- 资料识别结果用 `el-tag` 或 `el-table`。

### 生成报告中

必须整改：

- 用 `el-steps` 展示生成步骤。
- 用 `el-progress` 或 Element Plus loading 表达生成中。
- 不再使用纯自定义 spinner 作为主要视觉。

### 报告编辑详情页

必须整改：

- 编辑正文用 `el-input type="textarea"`。
- 保存/取消用 `el-button`。
- 报告状态、章节状态用 `el-tag`。
- 尽量减少 `.sr-badge`。

### 报告模板中心

- 保持左右布局。
- 筛选区、按钮、列表、状态全部使用 Element Plus。
- 不要再加大量自定义卡片。

### 上传新版模板页

- 继续使用 `el-card`、`el-form`、`el-upload`、`el-steps`、`el-table`、`el-alert`。
- 上传保存按钮使用 `el-button`。

## 五、验收标准

完成后请检查：

1. `npm run build` 通过。
2. `src/pages/SmartReportPage.vue` 中不再出现原生 `<button>`。
3. `src/pages/SmartReportPage.vue` 中不再出现原生 `<select>`。
4. `src/pages/SmartReportPage.vue` 中不再出现原生 `<textarea>`。
5. 上传资料生成报告页使用 Element Plus 表单组件。
6. 报告正文编辑使用 `el-input type="textarea"`。
7. 生成报告中页面使用 `el-steps` 或 `el-progress`。
8. 报告状态和章节状态优先使用 `el-tag`。
9. 模板中心样式和当前项目整体一致。
10. 没有修改智能尽调、企业探查、路由、侧边栏、全局样式文件。
11. 本轮只修改 `src/pages/SmartReportPage.vue`。

## 六、执行建议

请小步实施：

1. 先替换所有原生 `<button>`、`<select>`、`<textarea>`。
2. 再替换 `.sr-badge` 和 `.sr-tag` 的模板引用。
3. 再优化 `generating` 页面为 Element Plus steps/progress。
4. 再清理明确未使用的旧样式。
5. 最后运行 `npm run build`。
