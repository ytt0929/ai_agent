# OpenClaw 提示词：智能报告模板中心左右布局与按钮修复

你是资深 Vue 3 前端工程师、资深 UX/UI 工程师。请修复并优化智能报告里的“报告模板中心”。本轮重点：修复按钮点击报错、改成左右布局、补齐筛选/新建/上传模板/查看详情/关联证据链面板。不要改智能尽调、企业探查、路由、侧边栏和全局样式。

## 当前项目情况

- 技术栈：Vue 3 + Vite + Element Plus。
- 当前主要文件：`src/pages/SmartReportPage.vue`。
- 当前已有：
  - `view === 'templateCenter'`
  - `view === 'templateUpload'`
  - `templateCenterRows`
  - `tplDetailSectionData`
  - `tplForbiddenWordsData`
  - `selectedTpl`
  - `showTplRules`
- 当前模板中心页面中调用了这些函数：
  - `viewTemplateRules(row)`
  - `setAsDefault(row.id)`
  - `goToTemplateUpload(row)`
  - `simulateTplUpload()`
  - `resetTplUpload()`
  - `saveTplAsDraft()`
  - `saveTplAndEnable()`
- 但这些函数目前没有完整定义或没有正确生效，导致点击“查看章节规则”和“上传新版模板”页面无反应或报错。

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

## 一、先修复点击报错

请先补齐以下函数，确保按钮可用：

```js
function viewTemplateRules(row) {}
function setAsDefault(id) {}
function goToTemplateUpload(row = null) {}
function simulateTplUpload() {}
function resetTplUpload() {}
function saveTplAsDraft() {}
function saveTplAndEnable() {}
```

要求：

- `viewTemplateRules(row)`：设置 `selectedTpl.value = row`，并展示右侧详情，不要再优先打开 drawer。
- `setAsDefault(id)`：用本地状态模拟默认模板变更，并 `ElMessage.success('已设置为默认模板')`。
- `goToTemplateUpload(row)`：设置当前上传模板上下文，进入 `view = 'templateUpload'`。
- `simulateTplUpload()`：模拟上传成功，设置文件名、解析步骤完成。
- `resetTplUpload()`：重置上传状态。
- `saveTplAsDraft()`：提示保存草稿成功，返回模板中心。
- `saveTplAndEnable()`：提示保存并启用成功，返回模板中心。

如果 `templateCenterRows` 当前是普通数组，不能直接修改默认状态，可以改成：

```js
const templateCenterRows = ref([...])
```

或者新增 `templateRowsState`，确保 `setAsDefault` 可以更新界面。

## 二、模板中心改成左右布局

当前页面是单张大表格。请改成左右布局：

```text
顶部：返回首页 + 标题 + 筛选区 + 新建模板 + 上传新模板

左侧：模板名称列表
右侧：模板详情 + 章节规则 + 关联资料/证据链面板
```

### 顶部区域

保留：

- 返回首页
- 标题：报告模板中心
- 副标题：维护不同银行/分行的报告模板、章节规则、资料要求、AI 生成提示词和禁用词。

新增筛选区：

- 搜索框：`搜索模板名称/银行/报告类型`
- 银行/机构筛选
- 报告类型筛选
- 状态筛选
- 按钮：
  - `新建模板`
  - `上传新模板`

使用 Element Plus：

- `el-input`
- `el-select`
- `el-button`

### 左侧模板列表

左侧只展示模板名称和简要状态，不再用完整表格。

每一项展示：

- 模板名称
- 银行/机构
- 报告类型
- 状态 tag
- 默认 tag

点击某个模板：

- 设置为当前选中模板
- 右侧展示该模板详情

左侧列表支持：

- 搜索过滤
- 银行过滤
- 类型过滤
- 状态过滤
- 当前选中项高亮

### 右侧模板详情

右侧展示当前选中模板的信息。

内容分为 4 个区块：

1. 模板基本信息
   - 模板名称
   - 银行/机构
   - 报告类型
   - 章节数
   - 必需资料
   - 状态
   - 是否默认
   - 最近使用次数

2. 操作区
   - `设为默认`
   - `查看章节规则`
   - `上传新版模板`
   - `用此模板生成报告`
   - `新建模板`

3. 章节规则表
   - 章节
   - 是否必填
   - 所需资料
   - 生成规则
   - 状态

4. 关联资料 / 证据链面板
   - 这里不是报告正文证据链，而是“模板要求的资料链”
   - 展示模板需要哪些资料，以及系统已有的资料映射状态

字段建议：

- 资料名称
- 用途章节
- 来源
- 状态：已映射 / 待确认 / 缺规则
- 说明

示例：

- 工商资料 / 申请人基本信息 / 工商查询 / 已映射 / 用于生成企业基本信息
- 营业执照 / 申请人基本信息 / 资料识别 / 已映射 / 用于核验企业名称、统一社会信用代码
- 税票数据 / 收入真实性核实 / 税票采集 / 待确认 / 需要确认近 12 个月范围
- 银行流水 / 收入真实性核实 / 用户上传 / 缺规则 / 模板未明确流水期间要求
- 征信授权 / 信用状况 / 用户上传 / 已映射 / 用于核验信用状况

## 三、新建模板交互

点击 `新建模板`：

- 打开 Element Plus Dialog 或进入 `templateUpload`。
- 推荐做 Dialog，字段包括：
  - 模板名称
  - 银行/机构
  - 报告类型
  - 版本号
  - 是否设为默认
  - 创建方式：
    - 空白模板
    - 复制当前模板
    - 上传文件解析

点击确认：

- 如果选择“上传文件解析”，进入 `templateUpload`
- 否则用 `ElMessage.success('模板已创建')` 模拟创建，并选中新模板

## 四、上传新版模板页面

保留 `view === 'templateUpload'`，但要确保入口可用。

进入方式：

- 顶部 `上传新模板`
- 右侧详情 `上传新版模板`
- 新建模板 Dialog 中选择上传文件解析

上传页面要求：

- 返回模板中心
- 上传区域
- 模板基本信息
- AI 解析步骤
- 解析结果统计
- 章节规则预览
- AI 解析建议
- 按钮：
  - 返回模板中心
  - 重新上传
  - 保存为草稿
  - 保存并启用

上传页面保存成功后：

- 返回 `templateCenter`
- 选中刚才上传的模板或原模板
- 显示成功提示

## 五、查看章节规则交互

当前点击 `查看章节规则` 可以不用 drawer，也可以保留 drawer。

但本轮更推荐：

- 点击后右侧详情滚动到“章节规则表”
- 或者展开一个 `el-collapse` 区块
- 不要只弹 drawer，否则和“右侧详情面板”目标不一致

如果保留 drawer，也必须保证按钮不报错。

## 六、用此模板生成报告

右侧详情增加按钮：

`用此模板生成报告`

点击后：

- 进入 `taskDialog`
- 自动传入一句自然语言：

`使用【模板名称】为明达精工有限公司生成授信调查报告，并检查缺失材料`

不要直接进入报告详情页。

## 七、视觉要求

必须和当前项目整体一致：

- Vue 3 + Element Plus 风格
- 浅灰背景
- 白色内容区
- 细边框
- 蓝色主按钮
- 轻量 tag
- 不要营销页
- 不要大面积卡片堆叠
- 不要复杂插画
- 页面布局清楚、紧凑、像银行内部配置工作台

左右布局建议：

- 左侧宽度：280px - 340px
- 右侧自适应
- 页面高度尽量撑满当前视口
- 左侧列表独立滚动
- 右侧详情独立滚动

## 八、实现建议

请小步修改，不要重写整个文件：

1. 先补齐缺失函数，保证所有按钮点击不报错。
2. 把 `templateCenterRows` 改成可响应状态，支持设置默认。
3. 新增筛选状态：
   - `templateKeyword`
   - `templateBankFilter`
   - `templateTypeFilter`
   - `templateStatusFilter`
4. 新增 computed：
   - `filteredTemplateRows`
   - `selectedTemplateEvidenceRows`
5. 改造 `templateCenter` template 为左右布局。
6. 新增新建模板 Dialog。
7. 保证 `templateUpload` 入口和保存返回逻辑正常。
8. 运行 build。

## 九、验收标准

完成后请检查：

1. `npm run build` 通过。
2. 模板中心点击 `查看章节规则` 不报错，并能看到章节规则。
3. 模板中心点击 `上传新版模板` 不报错，并进入上传页面。
4. 模板中心为左右布局：左侧模板名称列表，右侧模板详情。
5. 左侧支持搜索和筛选。
6. 点击左侧模板后，右侧详情随之变化。
7. 右侧展示模板基本信息、章节规则、关联资料/证据链面板。
8. 支持新建模板。
9. 支持返回首页。
10. 支持上传模板并保存返回模板中心。
11. 样式与当前项目一致，没有引入新设计风格。
12. 没有修改智能尽调、企业探查、路由、侧边栏、全局样式文件。
13. 本轮只修改 `src/pages/SmartReportPage.vue`。
