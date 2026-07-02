# OpenClaw 快速修改提示词：只改企业探查首页样式

项目路径：`D:\demo\ai-copilot`

你是资深 Vue 前端工程师。请只做一个小范围样式修复：把“企业探查首页”顶部输入区和示例问题按钮的视觉样式，调整得更接近“智能筛客”首页的输入区 UI。

## 必改文件

只允许修改：

- `src/pages/EnterpriseDiagnosisListPage.vue`

只允许改 `<style scoped>` 里的 CSS。不要修改 `<template>`、`<script setup>`、文案、示例内容、路由、点击行为或数据。

参考但不要修改：

- `src/pages/ScreeningInitialPage.vue`

## 目标位置

页面路径：

- `/enterprise-diagnosis`

视觉区域：

- 首页顶部输入区和示例问题区域
- `.edl-hero-input`
- `.edl-hero-field`
- `.edl-hero-chips`
- `.edl-chip-group`
- `.edl-chip-group-title`
- `.edl-hero-chip`

## 样式目标

1. 首页输入区改成接近智能筛客的卡片式输入：
   - 白色卡片背景
   - 1.5px 边框
   - 大圆角
   - 聚焦时蓝色边框和轻微蓝色外发光
   - 输入框本身不要再显示 Element Plus 默认厚边框
   - 输入文字字号更接近智能筛客自然语言输入框

2. “开始探查”按钮内容保持不变，只调整样式：
   - 高度与输入卡片协调
   - 保持蓝色主按钮
   - 不要改按钮文字
   - 不要改点击逻辑

3. 示例问题按钮改成接近智能筛客的浅蓝胶囊：
   - 浅蓝背景
   - 蓝色文字
   - 圆角胶囊
   - hover 时只强调边框
   - 不要改每个 chip 的文字
   - 不要改分组标题

## 不要做

- 不要修改 `src/pages/EnterpriseExplorationWorkspacePage.vue`。
- 不要改 `/enterprise-diagnosis/workspace/_new` 对话中间页。
- 不要改首页任何中文文案。
- 不要改首页 chip 内容。
- 不要改 `handleHeroSearch`、`onChipClick` 或任何脚本逻辑。
- 不要处理中文编码，浏览器里中文是正常的。
- 不要新增依赖。

## 验收

完成后运行：

```bash
npm run build
```

浏览器检查：

1. 打开 `/enterprise-diagnosis`。
2. 首页顶部输入区是卡片式视觉，接近智能筛客首页输入区。
3. 示例问题是浅蓝胶囊按钮，内容完全不变。
4. 点击“开始探查”和点击示例问题的行为与修改前一致。
5. 打开 `/enterprise-diagnosis/workspace/_new?...`，对话中间页仍是原来的普通底部输入条，不出现智能筛客样式输入卡片。
6. 浏览器中文显示不能出现新增乱码。
