<template>
  <div class="artifact-tax">
    <!-- 顶部轻量状态条 -->
    <div class="tax-summary-bar">
      <div class="tax-summary-bar__left">
        <div class="tax-summary-bar__title-row">
          <span class="tax-summary-bar__title">税票采集</span>
          <el-tag :type="summaryStatusTag" size="small">{{ summaryStatusLabel }}</el-tag>
        </div>
        <p class="tax-summary-bar__desc">税票采集需要企业授权。授权完成后将自动采集进项、销项和纳税申报数据。</p>
      </div>
      <div class="tax-summary-bar__tags">
        <el-tag size="small" effect="plain" :type="authStatusTagType">{{ authStatus }}</el-tag>
        <el-tag size="small" effect="plain" :type="linkStatusTagType">{{ linkStatus }}</el-tag>
      </div>
    </div>

    <!-- 授权信息 -->
    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">授权信息</span></template>
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="授权状态">
          <el-tag :type="authStatus === '已授权' ? 'success' : 'warning'" size="small">{{ authStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="链接状态">
          <el-tag :type="linkStatusTagType" size="small">{{ linkStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="授权方式">企业扫码授权</el-descriptions-item>
        <el-descriptions-item label="有效期">24 小时</el-descriptions-item>
      </el-descriptions>

      <!-- 授权链接 -->
      <div v-if="authUrl" class="tax-auth-url">
        <span class="tax-auth-url__label">授权链接</span>
        <code class="tax-auth-url__value">{{ authUrl }}</code>
        <div class="tax-auth-url__actions">
          <el-button size="small" type="primary" text @click="copyAuthLink">复制链接</el-button>
          <el-button size="small" text @click="$emit('download-qr')">下载二维码</el-button>
        </div>
      </div>
    </el-card>

    <!-- 采集进度 -->
    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">采集进度</span></template>
      <el-row :gutter="12" class="artifact-metric-row">
        <el-col :xs="24" :sm="8">
          <el-card shadow="never" class="artifact-metric-card">
            <div class="artifact-metric-label">进项发票</div>
            <div class="artifact-metric-value">{{ inputCount }}/{{ inputTotal }}</div>
            <el-progress :percentage="inputPercent" :stroke-width="6" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="never" class="artifact-metric-card">
            <div class="artifact-metric-label">销项发票</div>
            <div class="artifact-metric-value">{{ outputCount }}/{{ outputTotal }}</div>
            <el-progress :percentage="outputPercent" :stroke-width="6" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="never" class="artifact-metric-card">
            <div class="artifact-metric-label">纳税申报</div>
            <div class="artifact-metric-value">{{ filingStatus }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 采集日志 -->
    <el-card v-if="logs?.length" shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">采集日志</span></template>
      <el-table :data="logs" size="small" stripe style="width: 100%">
        <el-table-column label="时间" width="80">
          <template #default="{ row }"><span class="tax-log-time">{{ row.time }}</span></template>
        </el-table-column>
        <el-table-column label="事项" min-width="140">
          <template #default="{ row }"><span class="tax-log-desc">{{ row.desc }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="logStatusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 操作区：状态 A 待发送 -->
    <div v-if="isWaitingToSend" class="artifact-tax__actions">
      <el-button type="primary" @click="$emit('confirm-tax-send')">确认发送采集链接</el-button>
    </div>

    <!-- 操作区：状态 B 已发送等待授权 -->
    <div v-if="isWaitingAuthorization" class="artifact-tax__actions">
      <el-button type="primary" @click="$emit('tax-authorized')">模拟企业已授权</el-button>
      <el-button plain @click="$emit('send-reminder')">发送提醒</el-button>
      <el-button plain @click="$emit('switch-to-upload')">改为上传材料</el-button>
      <el-button plain @click="$emit('download-qr')">下载二维码</el-button>
    </div>

    <!-- 操作区：状态 C 已授权/已完成 -->
    <div v-if="isCompleted" class="artifact-tax__actions">
      <el-button type="primary" @click="$emit('enter-materials')">进入资料补充</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['confirm-tax-send', 'tax-authorized', 'enter-materials', 'send-reminder', 'switch-to-upload', 'download-qr'])

// 当前状态
const currentStatus = computed(() => props.data.status || '—')
const authStatus = computed(() => props.data.authStatus || '等待授权')
const linkStatus = computed(() => props.data.linkStatus || '待发送')
const authUrl = computed(() => props.data.authUrl || '')

// 税票数据
const inputCount = computed(() => props.data.input?.count ?? 0)
const inputTotal = computed(() => props.data.input?.total ?? 0)
const inputPercent = computed(() => inputTotal.value ? Math.round(inputCount.value / inputTotal.value * 100) : 0)
const outputCount = computed(() => props.data.output?.count ?? 0)
const outputTotal = computed(() => props.data.output?.total ?? 0)
const outputPercent = computed(() => outputTotal.value ? Math.round(outputCount.value / outputTotal.value * 100) : 0)
const filingStatus = computed(() => props.data.filing?.status || '—')

// 采集日志
const logs = computed(() => props.data.logs || [])

// ══ 状态判断 ══
const isWaitingToSend = computed(() => linkStatus.value === '待发送')
const isWaitingAuthorization = computed(() => linkStatus.value === '已发送' && authStatus.value !== '已授权')
const isCompleted = computed(() => currentStatus.value === '已完成' || authStatus.value === '已授权')

// 顶部摘要
const summaryStatusLabel = computed(() => {
  if (isCompleted.value) return '已完成'
  if (isWaitingToSend.value) return '等待授权'
  return '等待授权'
})
const summaryStatusTag = computed(() => isCompleted.value ? 'success' : 'warning')

const authStatusTagType = computed(() => authStatus.value === '已授权' ? 'success' : 'warning')
const linkStatusTagType = computed(() => {
  return { '已使用': 'success', '已发送': 'warning', '已切换': 'info', '待发送': 'info' }[linkStatus.value] || 'info'
})

function copyAuthLink() {
  if (authUrl.value) {
    navigator.clipboard?.writeText(authUrl.value)
  }
}

function statusLabel(s) {
  return { done: '✓ 完成', waiting: '等待中', running: '进行中' }[s] || s
}

function logStatusTag(s) {
  return { done: 'success', waiting: 'warning', running: 'primary' }[s] || 'info'
}
</script>

<style scoped>
.artifact-tax {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

/* ====== 顶部轻量状态条 ====== */
.tax-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md, 12px);
  padding: var(--space-md, 12px) var(--space-md, 16px);
  background: var(--surface-soft, #f8fafc);
  border-bottom: 1px solid var(--border-default, #dbe3ef);
  border-radius: var(--radius-sm, 4px);
  min-width: 0;
  flex-wrap: wrap;
}

.tax-summary-bar__left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tax-summary-bar__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

.tax-summary-bar__title {
  font-size: var(--font-size-body, 13px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
}

.tax-summary-bar__desc {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.tax-summary-bar__tags {
  display: flex;
  gap: var(--space-xs, 4px);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }

/* ====== 授权链接 ====== */
.tax-auth-url {
  margin-top: var(--space-sm, 8px);
  padding: var(--space-sm, 10px) var(--space-md, 12px);
  background: var(--surface-soft, #f8fafc);
  border-radius: var(--radius-sm, 4px);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs, 4px);
  align-items: center;
}

.tax-auth-url__label {
  font-size: var(--font-size-xs, 11px);
  font-weight: 500;
  color: var(--text-secondary);
}

.tax-auth-url__value {
  font-size: var(--font-size-xs, 11px);
  font-family: monospace;
  color: var(--color-primary);
  background: var(--surface-card, #fff);
  padding: 2px 6px;
  border-radius: 3px;
  word-break: break-all;
  white-space: normal;
  flex: 1;
  min-width: 0;
}

.tax-auth-url__actions {
  display: flex;
  gap: var(--space-xs, 4px);
}

/* ====== 采集日志表格 ====== */
.tax-log-time {
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary);
  font-weight: 600;
}

.tax-log-desc {
  font-size: var(--font-size-xs, 11px);
  color: var(--text-secondary);
}

/* ====== 操作区 ====== */
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
</style>
