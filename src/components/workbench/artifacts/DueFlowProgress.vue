<template>
  <div class="wb-due-flow">
    <div class="wb-due-flow__header">
      <div class="wb-due-flow__header-left">
        <span class="wb-due-flow__name">{{ enterprise?.name || '—' }}</span>
        <span v-if="summaryText" class="wb-due-flow__summary">{{ summaryText }}</span>
      </div>
      <div class="wb-due-flow__header-right">
        <el-tag :type="headerTagType" size="small" effect="plain">{{ statusText }}</el-tag>
        <span class="wb-due-flow__pct">{{ progress }}%</span>
      </div>
    </div>

    <div class="wb-due-flow__bar">
      <template v-for="(step, idx) in flowSteps" :key="step.key">
        <div class="wb-due-flow__step" :class="`wb-due-flow__step--${step.status}`">
          <div class="wb-due-flow__step__node">
            <el-icon v-if="step.status === 'done'" :size="14"><Select /></el-icon>
            <div v-else-if="step.status === 'active'" class="wb-due-flow__step__pulse" />
            <span v-else class="wb-due-flow__step__num">{{ idx + 1 }}</span>
          </div>
          <span class="wb-due-flow__step__label">{{ step.label }}</span>
        </div>
        <div v-if="idx < flowSteps.length - 1" class="wb-due-flow__connector" :class="`wb-due-flow__connector--${step.status}`" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Select } from '@element-plus/icons-vue'

const props = defineProps({
  enterprise: { type: Object, default: () => ({}) },
  statusText: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  steps: { type: Array, default: () => [] },
})

const flowSteps = computed(() => props.steps || [])
const summaryText = computed(() => {
  const e = props.enterprise
  return [e.industry, e.region].filter(Boolean).join(' / ')
})
const headerTagType = computed(() => {
  const t = props.statusText
  if (t?.includes('完成')) return 'success'
  if (t?.includes('等待')) return 'warning'
  return 'info'
})
</script>

<style scoped>
.wb-due-flow {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.wb-due-flow__header { display: flex; align-items: center; justify-content: space-between; }
.wb-due-flow__header-left { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.wb-due-flow__name { font-size: 15px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wb-due-flow__summary { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; flex-shrink: 0; }
.wb-due-flow__header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.wb-due-flow__pct { font-size: 18px; font-weight: 700; color: var(--color-primary); }

/* 流程条 */
.wb-due-flow__bar { display: flex; align-items: center; gap: 0; }

.wb-due-flow__step { display: flex; align-items: center; flex: 1; justify-content: center; gap: 6px; padding: 4px 6px; border-radius: var(--radius-sm); position: relative; cursor: default; transition: background 0.15s; }
.wb-due-flow__step:hover { background: var(--bg-page); }
.wb-due-flow__step__node { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 600; color: #fff; }

/* 已完成 */
.wb-due-flow__step--done .wb-due-flow__step__node { background: var(--color-success); }
.wb-due-flow__step--done .wb-due-flow__step__label { color: var(--text-primary); font-weight: 500; }
/* 当前 */
.wb-due-flow__step--active .wb-due-flow__step__node { background: #fff; color: var(--color-primary); border: 2px solid var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.wb-due-flow__step--active .wb-due-flow__step__label { color: var(--color-primary); font-weight: 600; }
.wb-due-flow__step--active::after { content: ''; position: absolute; bottom: -4px; left: 15%; right: 15%; height: 2px; background: var(--color-primary); border-radius: 1px; }
/* 等待中 */
.wb-due-flow__step--pending .wb-due-flow__step__node { background: var(--bg-page); color: var(--text-tertiary); border: 1px solid var(--border-light); }
.wb-due-flow__step--pending .wb-due-flow__step__label { color: var(--text-tertiary); }
.wb-due-flow__step__num { font-size: 11px; line-height: 1; }
.wb-due-flow__step__label { font-size: 12px; white-space: nowrap; }

/* 连接线 */
.wb-due-flow__connector { flex: 1; height: 2px; min-width: 10px; margin: 0 6px; pointer-events: none; background: var(--border-divider); }
.wb-due-flow__connector--done { background: var(--color-success); }
.wb-due-flow__connector--active { background: linear-gradient(to right, var(--color-primary), var(--border-divider)); }

/* 脉冲动画 */
.wb-due-flow__step__pulse { position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--color-primary); opacity: 0.4; animation: wb-flow-pulse 2s ease-in-out infinite; }
@keyframes wb-flow-pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .wb-due-flow__step__pulse { animation: none; opacity: 0.2; } }
</style>
