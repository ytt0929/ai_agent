# AI Copilot — 组件开发规范

> 版本: v1.1 | 创建: 2026-07-02 | 适用范围: 工作台左侧 Artifact 组件
> 基准: `src/styles/tokens.css`

---

## 1. 核心规则（必须遵守）

### 1.1 容器
- 必须用 `<el-card shadow="never">` 作为 Artifact 根容器
- 禁止自定义 `border` + `border-radius` 替代 el-card

### 1.2 标题
- 字号：`14px`（`--font-size-lg`）
- 字重：`600`（`--font-weight-semibold`）
- 颜色：`var(--text-primary)`

### 1.3 间距
- Artifact 外层 gap：`12px`（`--space-md`）
- el-card header padding：`12px 16px`
- header 内部 gap：`8px`（`--space-sm`）
- 紧凑子项间距：`4px`（`--space-xs`）

### 1.4 圆角
- 卡片圆角：`8px`（el-card 自带，`--radius-md`）
- 紧凑圆角：`6px`（`--radius-6`，列表项、内嵌小卡片）
- 标签圆角：`4px`（`--radius-sm`）

### 1.5 颜色
- 必须用 token，禁止硬编码：`#2563eb`、`#10b981`、`#f59e0b`、`#ef4444`、`#1a1a2e`、`#64748b`、`#94a3b8`
- 完整颜色表见第 3 节

### 1.6 Element Plus 默认尺寸
- el-tag：`size="small"`
- el-button：`size="small"`
- el-table：`size="small"`
- el-descriptions：`size="small"`
- el-progress：`:stroke-width="6"`

### 1.7 命名
- 根容器 class：`artifact-[name]`
- 子元素 BEM：`artifact-[name]__header`、`artifact-[name]__item__label`

---

## 2. 标准模板（直接复制）

### 2.1 标准 Artifact 卡片

```vue
<template>
  <div class="artifact-[name]">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">[标题]</span>
          <el-tag size="small" effect="plain">[可选状态]</el-tag>
        </div>
      </template>
      <!-- 内容 -->
    </el-card>
  </div>
</template>

<script setup>
const props = defineProps({ data: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.artifact-[name] { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
</style>
```

### 2.2 指标卡（3 列）

```vue
<el-row :gutter="12" class="artifact-metric-row">
  <el-col :span="8">
    <el-card shadow="never" class="artifact-metric-card">
      <div class="artifact-metric-label">[标签]</div>
      <div class="artifact-metric-value">[数值]</div>
      <el-progress :percentage="[数值]" :stroke-width="6" />
    </el-card>
  </el-col>
</el-row>

<style scoped>
.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }
</style>
```

### 2.3 紧凑列表

```vue
<div class="artifact-list">
  <div v-for="(item, i) in items" :key="i" class="artifact-list__item">
    <span class="artifact-list__item__label">{{ item.label }}</span>
    <el-tag size="small" :type="item.type" effect="plain">{{ item.value }}</el-tag>
  </div>
</div>

<style scoped>
.artifact-list { display: flex; flex-direction: column; gap: 4px; }
.artifact-list__item { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-page); border-radius: 6px; font-size: 12px; }
.artifact-list__item__label { color: var(--text-primary); }
</style>
```

### 2.4 日志列表

```vue
<div class="artifact-log-list">
  <div v-for="(log, i) in logs" :key="i" class="artifact-log-item">
    <time>{{ log.time }}</time>
    <span class="artifact-log-desc">{{ log.desc }}</span>
    <span class="artifact-log-status" :class="'artifact-log-status--' + log.status">●</span>
  </div>
</div>

<style scoped>
.artifact-log-list { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }
.artifact-log-item { display: grid; grid-template-columns: 48px 1fr auto; gap: 8px; align-items: center; padding: 6px 8px; font-size: 12px; }
.artifact-log-item time { color: var(--text-tertiary); font-weight: 600; }
.artifact-log-desc { color: var(--text-secondary); }
.artifact-log-status--done { color: var(--color-success); }
.artifact-log-status--waiting { color: var(--color-warning); }
.artifact-log-status--running { color: var(--color-primary); }
</style>
```

### 2.5 流程条（Process Bar）

**流程条是头部信息区，不使用 el-card。**

```vue
<template>
  <div class="due-flow">
    <div class="due-flow__header">
      <div class="due-flow__header-left">
        <span class="due-flow__name">{{ enterprise?.name || '—' }}</span>
        <span v-if="summaryText" class="due-flow__summary">{{ summaryText }}</span>
      </div>
      <div class="due-flow__header-right">
        <el-tag size="small" effect="plain" :type="statusTag">{{ statusText }}</el-tag>
        <span class="due-flow__pct">{{ progress }}%</span>
      </div>
    </div>

    <div class="due-flow__bar">
      <template v-for="(step, idx) in steps" :key="step.key">
        <div class="due-flow__step" :class="'due-flow__step--' + step.status">
          <div class="due-flow__step__node">
            <el-icon v-if="step.status === 'done'" :size="14"><Select /></el-icon>
            <span v-else-if="step.status === 'pending'" class="due-flow__step__num">{{ idx + 1 }}</span>
            <div v-else class="due-flow__step__pulse" />
          </div>
          <span class="due-flow__step__label">{{ step.label }}</span>
        </div>
        <div v-if="idx < steps.length - 1" class="due-flow__connector"
             :class="'due-flow__connector--' + step.status" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { Select } from '@element-plus/icons-vue'
const props = defineProps({
  enterprise: { type: Object, default: () => ({}) },
  statusText: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  steps: { type: Array, default: () => [] },
})
const statusTag = computed(() => {
  if (props.statusText?.includes('完成')) return 'success'
  if (props.statusText?.includes('等待')) return 'warning'
  return 'info'
})
</script>

<style scoped>
.due-flow { display: flex; flex-direction: column; gap: 12px; padding: 12px 16px; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); }
.due-flow__header { display: flex; align-items: center; justify-content: space-between; }
.due-flow__header-left { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.due-flow__name { font-size: 15px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.due-flow__summary { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; }
.due-flow__header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.due-flow__pct { font-size: 18px; font-weight: 700; color: var(--color-primary); }
.due-flow__bar { display: flex; align-items: center; gap: 0; }
.due-flow__step { display: flex; align-items: center; flex: 1; justify-content: center; gap: 6px; padding: 4px 6px; border-radius: var(--radius-sm); position: relative; }
.due-flow__step__node { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 600; color: #fff; }
.due-flow__step--done .due-flow__step__node { background: var(--color-success); }
.due-flow__step--done .due-flow__step__label { color: var(--text-primary); font-weight: 500; }
.due-flow__step--active .due-flow__step__node { background: #fff; color: var(--color-primary); border: 2px solid var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.due-flow__step--active .due-flow__step__label { color: var(--color-primary); font-weight: 600; }
.due-flow__step--active::after { content: ''; position: absolute; bottom: -4px; left: 15%; right: 15%; height: 2px; background: var(--color-primary); border-radius: 1px; }
.due-flow__step--pending .due-flow__step__node { background: var(--bg-page); color: var(--text-tertiary); border: 1px solid var(--border-light); }
.due-flow__step--pending .due-flow__step__label { color: var(--text-tertiary); }
.due-flow__step__label { font-size: 12px; white-space: nowrap; }
.due-flow__connector { flex: 1; height: 2px; min-width: 10px; margin: 0 6px; pointer-events: none; background: var(--border-divider); }
.due-flow__connector--done { background: var(--color-success); }
.due-flow__connector--active { background: linear-gradient(to right, var(--color-primary), var(--border-divider)); }
.due-flow__step__pulse { position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--color-primary); opacity: 0.4; animation: wb-pulse 2s ease-in-out infinite; }
@keyframes wb-pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
</style>
```

---

## 3. Token 速查表

### 颜色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#2563eb` | 主色 |
| `--color-success` | `#10b981` | 成功/低风险 |
| `--color-warning` | `#f59e0b` | 警告/中风险 |
| `--color-danger` | `#ef4444` | 危险/高风险 |
| `--text-primary` | `#1a1a2e` | 标题文字 |
| `--text-secondary` | `#64748b` | 描述文字 |
| `--text-tertiary` | `#94a3b8` | 占位符/提示 |
| `--surface-card` | `#ffffff` | 卡片背景 |
| `--surface-page` | `#f7faff` | 页面背景 |
| `--border-light` | `#e5eaf2` | 浅色边框 |
| `--border-divider` | `#f1f5f9` | 分割线 |

### 字号

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-size-xs` | `11px` | 流程条标签、序号 |
| `--font-size-sm` | `12px` | 辅助文字、列表文字 |
| `--font-size-lg` | `14px` | **卡片标题** |
| `--font-size-xl` | `15px` | 流程条企业名 |
| `--font-size-2xl` | `20px` | 指标数值 |
| `--font-weight-semibold` | `600` | **标题字重** |
| `--font-weight-bold` | `700` | 指标数值 |

### 间距

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | `4px` | 紧凑间距（tag gap） |
| `--space-sm` | `8px` | 标准间距（header gap） |
| `--space-md` | `12px` | **artifact gap、card padding** |
| `--space-lg` | `16px` | 区块间距 |

### 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `4px` | tag、chip |
| `--radius-md` | `8px` | **卡片容器** |
| `--radius-6` | `6px` | 紧凑圆角（列表项） |
| `--radius-full` | `9999px` | pill、胶囊 |

---

## 4. 新增组件 Checklist

创建新 Artifact 组件时逐项确认：

- [ ] 容器是 `<el-card shadow="never">`，不是自定义 border+radius
- [ ] 标题字号 `14px`，字重 `600`，颜色 `var(--text-primary)`
- [ ] 外层 `gap: 12px`
- [ ] Card header `padding: 12px 16px`
- [ ] 颜色全部用 token，不硬编码 `#2563eb` 等
- [ ] el-tag / el-button 使用 `size="small"`
- [ ] class 命名 `artifact-[name]` 前缀
- [ ] 样式 < 30 行（不含模板复用部分）

---

## 5. 版本记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-07-02 | v1.1 | 纯前瞻性规范，移除偏差清单 |
| 2026-07-02 | v1.0 | 初始版本 |
