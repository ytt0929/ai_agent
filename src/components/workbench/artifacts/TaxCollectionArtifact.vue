<template>
  <div class="artifact-tax">
    <!-- 标题行 -->
    <div class="artifact-tax__header-row">
      <span class="artifact-tax__title">税票采集</span>
      <el-tag :type="statusTag" size="small" effect="plain">{{ currentStatus }}</el-tag>
    </div>

    <!-- 授权/链接状态 -->
    <div class="artifact-tax__status-row">
      <div class="artifact-tax__status-cell">
        <span class="artifact-tax__status-label">授权状态</span>
        <el-tag :type="authStatus === '已授权' ? 'success' : 'warning'" size="small" effect="plain">{{ authStatus }}</el-tag>
      </div>
      <div class="artifact-tax__status-cell">
        <span class="artifact-tax__status-label">链接状态</span>
        <el-tag :type="linkStatus === '已使用' ? 'info' : linkStatus === '已发送' ? 'warning' : 'danger'" size="small" effect="plain">{{ linkStatus }}</el-tag>
      </div>
    </div>

    <!-- 采集进度标题 -->
    <div class="artifact-tax__section-title">采集进度</div>

    <!-- 采集进度卡片 -->
    <el-row :gutter="12" class="artifact-metric-row">
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">进项发票</div>
          <div class="artifact-metric-value">{{ inputCount }}/{{ inputTotal }}</div>
          <el-progress :percentage="inputPercent" :stroke-width="6" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">销项发票</div>
          <div class="artifact-metric-value">{{ outputCount }}/{{ outputTotal }}</div>
          <el-progress :percentage="outputPercent" :stroke-width="6" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">纳税申报</div>
          <div class="artifact-metric-value">{{ filingStatus }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">采集日志</span></template>
      <div class="artifact-log-list">
        <div v-for="(log, i) in logs" :key="i" class="artifact-log-item">
          <time>{{ log.time }}</time>
          <span class="artifact-log-desc">{{ log.desc }}</span>
          <span class="artifact-log-status" :class="'artifact-log-status--' + log.status">{{ logStatusText(log.status) }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })

const currentStatus = computed(() => props.data.status || '—')
const statusTag = computed(() => props.data.status === '已完成' ? 'success' : 'warning')
const authStatus = computed(() => props.data.authStatus || '—')
const linkStatus = computed(() => props.data.linkStatus || '—')
const currentStep = computed(() => {
  const s = (props.data.steps || []).filter(x => x.status === 'success').length
  return s
})
const steps = computed(() => props.data.steps || [])
const inputCount = computed(() => props.data.input?.count || 0)
const inputTotal = computed(() => props.data.input?.total || 0)
const inputPercent = computed(() => inputTotal.value ? Math.round(inputCount.value / inputTotal.value * 100) : 0)
const outputCount = computed(() => props.data.output?.count || 0)
const outputTotal = computed(() => props.data.output?.total || 0)
const outputPercent = computed(() => outputTotal.value ? Math.round(outputCount.value / outputTotal.value * 100) : 0)
const filingStatus = computed(() => props.data.filing?.status || '—')
const logs = computed(() => props.data.logs || [])

function logStatusText(s) { return { done: '✅', waiting: '⏳', running: '🔄' }[s] || '' }
</script>

<style scoped>
.artifact-tax { display: flex; flex-direction: column; gap: 12px; }

/* 标题行 */
.artifact-tax__header-row { display: flex; align-items: center; gap: 8px; }
.artifact-tax__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

/* 状态行 */
.artifact-tax__status-row { display: flex; gap: 12px; }
.artifact-tax__status-cell { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card, #f8fafc); border-radius: 6px; font-size: 13px; }
.artifact-tax__status-label { color: var(--text-secondary); }

/* 区块标题 */
.artifact-tax__section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); padding: 4px 0; border-bottom: 1px solid var(--border-color-divider); }

.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }
.artifact-log-list { display: grid; gap: 4px; max-height: 180px; overflow-y: auto; }
.artifact-log-item { display: grid; grid-template-columns: 48px 1fr auto; gap: 8px; align-items: center; padding: 6px 8px; font-size: 12px; }
.artifact-log-item time { color: var(--text-tertiary); font-weight: 600; }
.artifact-log-desc { color: var(--text-secondary); }
.artifact-log-status { font-weight: 600; }
.artifact-log-status--done { color: var(--color-success); }
.artifact-log-status--waiting { color: var(--color-warning); }
.artifact-log-status--running { color: var(--color-primary); }
</style>
