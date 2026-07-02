<template>
  <div class="due-task-header">
    <div class="due-task-header__enterprise">
      <span class="due-task-header__name">{{ data.enterprise?.name || '—' }}</span>
      <span class="due-task-header__meta">{{ metaText }}</span>
    </div>
    <div class="due-task-header__template">
      <el-tag size="small" round>{{ data.template?.name || data.template || '—' }}</el-tag>
    </div>
    <div class="due-task-header__indicators">
      <span class="due-task-header__score">综合评分 <strong>{{ data.score }}</strong></span>
      <span class="due-task-header__grade">{{ data.grade }}</span>
      <el-tag :type="riskTagType" size="small" effect="plain">{{ data.riskLevel }}</el-tag>
      <span class="due-task-header__completeness">资料完整度 <strong>{{ data.completeness }}%</strong></span>
    </div>
    <div v-if="data.statusText" class="due-task-header__status">
      <el-tag size="small" :type="statusTagType" effect="plain">{{ data.statusText }}</el-tag>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const metaText = computed(() => {
  const e = props.data.enterprise
  const parts = [e?.industry, e?.segment, e?.location, e?.capital].filter(Boolean)
  return parts.join(' / ')
})

const riskTagType = computed(() => {
  const r = props.data.riskLevel || ''
  if (r.includes('高')) return 'danger'
  if (r.includes('中')) return 'warning'
  return 'success'
})

const statusTagType = computed(() => {
  const s = props.data.statusText || ''
  if (s.includes('完成')) return 'success'
  if (s.includes('等待')) return 'warning'
  return 'info'
})
</script>

<style scoped>
.due-task-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 12px 16px;
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-light, #e5eaf2);
  border-radius: var(--radius-md, 8px);
  margin-bottom: 14px;
}

.due-task-header__enterprise {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.due-task-header__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.due-task-header__meta {
  font-size: 12px;
  color: var(--text-tertiary, #94a3b8);
  white-space: nowrap;
  flex-shrink: 0;
}

.due-task-header__template {
  flex-shrink: 0;
}

.due-task-header__indicators {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.due-task-header__score {
  font-size: 12px;
  color: var(--text-secondary, #64748b);
}

.due-task-header__score strong {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary, #2563eb);
}

.due-task-header__grade {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
  background: var(--color-primary-bg, #eef2ff);
  padding: 1px 8px;
  border-radius: 4px;
}

.due-task-header__completeness {
  font-size: 12px;
  color: var(--text-secondary, #64748b);
}

.due-task-header__completeness strong {
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
}

.due-task-header__status {
  flex-shrink: 0;
}
</style>
