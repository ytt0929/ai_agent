# 设计系统 - AI Copilot 基准

> 所有页面、组件的样式都基于此设计系统。新增功能时直接沿用这些变量和组件。
> 更新日期：2026-06-28 — 已对齐 Figma 设计稿色值

## 1. 设计令牌 (CSS Variables)

### 色彩系统

#### 主色

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--copilot-primary` | `#2168f3` | 主按钮、链接、高亮、主色标签 |
| `--copilot-primary-hover` | `#164fca` | 主按钮 hover 态 |
| `--copilot-primary-soft` | `#eaf2ff` | 主色浅背景、激活导航 |

#### 背景

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--copilot-bg-page` | `#f5f8fc` | 页面全局背景 |
| `--copilot-bg-surface` | `#ffffff` | 卡片/面板背景 |
| `--copilot-bg-soft` | `#f8fbff` | 极浅背景、侧边栏 |

#### 边框

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--copilot-border` | `#dfe8f5` | 卡片/面板边框 |
| `--copilot-border-soft` | `#edf3fa` | 浅边框（表格行、内部分隔） |

#### 文字

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--copilot-text` | `#10213f` | 主文本、标题 |
| `--copilot-text-muted` | `#66758e` | 次要文本、辅助说明 |
| `--copilot-text-subtle` | `#93a1b5` | 更弱文字、label、时间戳 |

#### 状态色

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--copilot-success` | `#18a66a` | 成功、低风险、完成状态 |
| `--copilot-success-soft` | `#eaf8f2` | 成功浅背景（done 步骤） |
| `--copilot-warning` | `#d98712` | 警告、中风险、进行中 |
| `--copilot-warning-soft` | `#fff5e4` | 警告浅背景（warn 步骤） |
| `--copilot-danger` | `#dc4c49` | 危险、高风险、错误提示 |

#### 圆角

| 变量 | 值 | 用途 |
|------|-----|------|
| `--copilot-radius` | `8px` | 默认圆角（卡片、按钮、标签） |

#### 阴影

| 变量 | 值 | 用途 |
|------|-----|------|
| `--copilot-shadow` | `0 14px 34px rgba(32, 72, 128, .08)` | 卡片主阴影 |
| `--copilot-shadow-sm` | `0 4px 18px rgba(26, 54, 92, .04)` | 气泡/小元素阴影 |

---

> 以下为原有令牌，与新令牌并存，逐步迁移中。

### 色彩系统（旧版，保留兼容）

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--color-primary` | `#2563eb` | 主按钮、链接、高亮、主色标签 |
| `--color-primary-bg` | `#eef2ff` | 主色背景、hover 态 |
| `--color-primary-border` | `#dbe7f5` | 主色边框、卡片边界 |
| `--color-success` | `#10b981` | 成功、低风险、可监控状态 |
| `--color-success-bg` | `#ecfdf5` | 成功色背景 |
| `--color-warning` | `#f59e0b` | 警告、中风险、待确认状态 |
| `--color-warning-bg` | `#fffbeb` | 警告色背景 |
| `--color-danger` | `#ef4444` | 危险、高风险、错误提示 |
| `--color-danger-bg` | `#fef2f2` | 危险色背景 |
| `--color-text-primary` | `#1a1a2e` | 主文本、标题 |
| `--color-text-secondary` | `#64748b` | 副文本、正文 |
| `--color-text-tertiary` | `#94a3b8` | 辅助文本、label |
| `--color-text-disabled` | `#cbd5e1` | 禁用文本、placeholder |
| `--bg-page` | `#f7faff` | 全局背景色 |
| `--bg-card` | `#ffffff` | 卡片背景 |
| `--border-color` | `#dbe7f5` | 卡片/表格边框 |
| `--border-color-light` | `#e5eaf2` | 轻量边框（侧边栏分隔线） |
| `--border-color-divider` | `#f1f5f9` | 表格行分隔线 |

### 圆角

| 变量 | 值 | 用途 |
|------|-----|------|
| `--radius-sm` | `4px` | 小标签、状态 badge |
| `--radius-md` | `8px` | 卡片、按钮、输入框 |
| `--radius-lg` | `12px` | 弹窗、抽屉 |
| `--radius-xl` | `16px` | 大容器 |
| `--radius-full` | `9999px` | 头像、chip 标签 |

### 阴影

| 变量 | 用途 |
|------|------|
| `--shadow-sm` | 轻微阴影，hover 提示 |
| `--shadow-md` | 卡片 hover 提升 |
| `--shadow-lg` | 弹窗、下拉菜单 |
| `--shadow-primary` | 主卡片/主按钮阴影 |
| `--shadow-drawer` | 右侧抽屉阴影 |

### 字体

| 变量 | 值 | 用途 |
|------|-----|------|
| `--font-size-xs` | `11px` | 微小标签、ID |
| `--font-size-sm` | `12px` | 辅助文本、badge |
| `--font-size-base` | `13px` | 正文默认 |
| `--font-size-md` | `13.5px` | 稍大正文 |
| `--font-size-lg` | `14px` | 输入框 |
| `--font-size-xl` | `15px` | 卡片标题 |
| `--font-size-2xl` | `20px` | 页面标题 |
| `--font-size-3xl` | `22px` | 大标题 |

### 间距

| 变量 | 值 |
|------|-----|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `12px` |
| `--space-lg` | `16px` |
| `--space-xl` | `20px` |
| `--space-2xl` | `24px` |
| `--space-3xl` | `28px` |
| `--space-4xl` | `32px` |

### 布局

| 变量 | 值 |
|------|-----|
| `--sidebar-width` | `220px` |
| `--content-max-width` | `1100px` |
| `--content-max-width-narrow` | `780px` |
| `--content-max-width-wide` | `960px` |

### 动画

| 变量 | 值 | 用途 |
|------|-----|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 卡片入场 |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 页面切换、按钮 |
| `--duration-normal` | `150ms` | hover 反馈 |
| `--duration-slow` | `250ms` | 页面切换 |
| `--duration-slowest` | `400ms` | 卡片入场动画 |

## 2. 通用组件

### `.page` / `.page--narrow` / `.page--wide`
页面容器，控制最大宽度和内边距。

### `.page-header` + `.page-title` + `.page-subtitle`
页面标题栏的标准结构。

### `.card` / `.card--hover` / `.card--primary`
卡片容器。`--hover` 加 hover 上浮效果，`--primary` 主卡片高亮。

### `.btn` / `.btn--primary` / `.btn--default`
按钮基础样式。配合 Element Plus 时可用 `.btn-press` 添加点击缩放效果。

### `.input-base`
标准输入框样式（边框、focus 光圈）。

### `.chip`
chip 标签样式（圆角胶囊）。

### `.tag` / `.tag--primary` / `.tag--success` / `.tag--warning` / `.tag--danger` / `.tag--neutral`
状态标签。

### `.metric-value` + `.metric-label`
指标值对（大数字 + 小标签）。

### `.section-label`
区块小标题（灰色小字）。

### `.info-card` / `.info-card--warning` / `.info-card--info`
信息提示卡片。

### `.skeleton`
骨架屏加载动画。

### `.drawer-overlay` + `.drawer-panel`
右侧抽屉基础结构。

## 3. 动画工具类

### `.card-animate`
卡片入场动画（从下往上淡入）。自动 stagger，第 n 个子元素延迟 `n × 0.06s`。

### `.fade` transition
页面切换过渡，用于 `<transition name="fade">`。

### `.drawer` transition
抽屉滑入滑出过渡。

### 关键帧动画
- `card-enter` — 卡片从下往上淡入
- `dot-pulse` — 加载脉冲点
- `skeleton-pulse` — 骨架屏闪烁

## 4. 使用方式

### 新增页面模板
```vue
<template>
  <div class="page page--narrow">
    <div class="page-header">
      <div>
        <h1 class="page-title">页面标题</h1>
        <p class="page-subtitle">副标题描述</p>
      </div>
    </div>

    <div class="card card-animate">
      内容
    </div>
  </div>
</template>
```

### CSS 中使用变量
```css
.my-component {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  color: var(--color-text-primary);
  transition: transform var(--duration-slow) var(--ease-out);
}

.my-component:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### 颜色使用规范
- **不要用大面积渐变**（只有头像可用渐变）
- **不要用装饰性光斑**
- **不要用暗色主题**（全局浅蓝白 `#f7faff` 背景）
- **阴影要克制**（只在卡片 hover 和抽屉使用）
- **按钮不要过多**（结果页最多 3 个主操作）
