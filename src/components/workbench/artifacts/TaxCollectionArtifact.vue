<template>
  <div class="artifact-tax">
    <!-- 当前节点标题 -->
    <div class="artifact-tax__node-title">
      <span class="artifact-tax__node-label">{{ nodeTitle }}</span>
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

    <!-- 授权链接与二维码 -->
    <div v-if="authUrl" class="artifact-tax__auth-link-row">
      <span class="artifact-tax__auth-link-label">授权链接</span>
      <code class="artifact-tax__auth-link-url">{{ authUrl }}</code>
      <div class="artifact-tax__auth-link-actions">
        <el-button size="small" type="primary" text @click="copyAuthLink">复制链接</el-button>
        <el-button size="small" text @click="$emit('download-qr')">下载二维码</el-button>
      </div>
    </div>

    <!-- 采集进度 -->
    <div class="artifact-tax__section-title">采集进度</div>
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

    <!-- 采集日志 -->
    <div v-if="logs?.length" class="artifact-tax__logs">
      <div class="artifact-tax__section-title">采集日志</div>
      <div class="artifact-log-list">
        <div v-for="(log, i) in logs" :key="i" class="artifact-log-item">
          <time>{{ log.time }}</time>
          <span class="artifact-log-desc">{{ log.desc }}</span>
          <span class="artifact-log-status" :class="`artifact-log-status--${log.status}`">{{ statusLabel(log.status) }}</span>
        </div>
      </div>
    </div>

    <!-- 动作区：等待确认发送 -->
    <div v-if="linkStatus === '待发送'" class="artifact-tax__actions">
      <el-button type="primary" @click="$emit('confirm-tax-send')">确认发送采集链接</el-button>
    </div>

    <!-- 动作区：已发送等待授权 -->
    <div v-if="linkStatus === '已发送' && authStatus !== '已授权'" class="artifact-tax__actions">
      <el-button type="primary" @click="$emit('tax-authorized')">模拟企业已授权</el-button>
      <el-button plain @click="$emit('send-reminder')">发送提醒</el-button>
      <el-button text @click="$emit('switch-to-upload')">改为上传材料</el-button>
    </div>

    <!-- 动作区：已完成 -->
    <div v-if="currentStatus === '已完成'" class="artifact-tax__actions">
      <el-button type="primary" @click="$emit('enter-materials')">进入资料补充</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['confirm-tax-send', 'tax-authorized', 'enter-materials', 'send-reminder', 'switch-to-upload', 'download-qr'])

// 当前状态
const currentStatus = computed(() => props.data.status || '—')
const statusTag = computed(() => props.data.status === '已完成' ? 'success' : 'warning')
const authStatus = computed(() => props.data.authStatus || '—')
const linkStatus = computed(() => props.data.linkStatus || '—')
const authUrl = computed(() => props.data.authUrl || '')

// 节点标题
const nodeTitle = computed(() => currentStatus.value === '已完成' ? '税票采集结果' : '税票RPA等待授权')

// 税票数据 — 用 data.input / data.output / data.filing 对齐 TaxCollectionArtifact 读取
const inputCount = computed(() => props.data.input?.count ?? 0)
const inputTotal = computed(() => props.data.input?.total ?? 0)
const inputPercent = computed(() => inputTotal.value ? Math.round(inputCount.value / inputTotal.value * 100) : 0)
const outputCount = computed(() => props.data.output?.count ?? 0)
const outputTotal = computed(() => props.data.output?.total ?? 0)
const outputPercent = computed(() => outputTotal.value ? Math.round(outputCount.value / outputTotal.value * 100) : 0)
const filingStatus = computed(() => props.data.filing?.status || '—')

// 采集日志
const logs = computed(() => props.data.logs || [])

function copyAuthLink() {
  if (authUrl.value) {
    navigator.clipboard?.writeText(authUrl.value)
  }
}

function statusLabel(s) {
  return { done: '✓ 完成', waiting: '等待中', running: '进行中' }[s] || s
}
</script>

<style scoped>
.artifact-tax { display: flex; flex-direction: column; gap: 12px; }

/* 当前节点标题 */
.artifact-tax__node-title { display: flex; align-items: center; gap: 8px; }
.artifact-tax__node-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }

/* 状态行 */
.artifact-tax__status-row { display: flex; gap: 12px; }
.artifact-tax__status-cell { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card); border-radius: var(--radius-6, 6px); font-size: 13px; }
.artifact-tax__status-label { color: var(--text-secondary); }

/* 授权链接行 */
.artifact-tax__auth-link-row { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; background: var(--bg-page); border-radius: var(--radius-6, 6px); }
.artifact-tax__auth-link-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.artifact-tax__auth-link-url { font-size: 12px; font-family: monospace; color: var(--color-primary); background: var(--surface-card); padding: 4px 8px; border-radius: 4px; word-break: break-all; }
.artifact-tax__auth-link-actions { display: flex; gap: 4px; }

/* 区块标题 */
.artifact-tax__section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); padding: 4px 0; border-bottom: 1px solid var(--border-color-divider); }

.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }

/* 采集日志 */
.artifact-tax__logs { margin-top: 4px; }
.artifact-log-list { display: grid; gap: 4px; max-height: 180px; overflow-y: auto; }
.artifact-log-item { display: grid; grid-template-columns: 48px 1fr auto; gap: 8px; align-items: center; padding: 6px 8px; font-size: 12px; }
.artifact-log-item time { color: var(--text-tertiary); font-weight: 600; }
.artifact-log-desc { color: var(--text-secondary); }
.artifact-log-status { font-weight: 600; }
.artifact-log-status--done { color: var(--color-success); }
.artifact-log-status--waiting { color: var(--color-warning); }
.artifact-log-status--running { color: var(--color-primary); }

/* 动作区 */
.artifact-tax__actions {
  display: flex; gap: 8px; padding: 10px 0;
  border-top: 1px solid var(--border-color-divider);
}
</style>
