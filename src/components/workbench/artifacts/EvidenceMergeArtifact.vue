<template>
  <div class="artifact-evidence">
    <!-- 顶部标题 -->
    <div class="artifact-evidence__header">
      <span class="artifact-evidence__title">证据整合 · 已完成</span>
      <el-tag type="success" size="small" effect="plain">已生成证据链</el-tag>
    </div>

    <!-- 证据完整度 -->
    <el-row :gutter="12" class="artifact-metric-row">
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">证据完整度</div>
          <div class="artifact-metric-value" :style="{ color: integrityColor }">{{ integrity }}%</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">已归档</div>
          <div class="artifact-metric-value" style="color: var(--color-success)">{{ archivedCount }} 项</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">待确认</div>
          <div class="artifact-metric-value" style="color: var(--color-warning)">{{ pendingCount }} 项</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 证据来源分布 -->
    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">证据来源分布</span></template>
      <div class="artifact-evidence__sources">
        <div v-for="s in sources" :key="s.name" class="artifact-evidence__source-item">
          <span class="artifact-evidence__source-name">{{ s.name }}</span>
          <span class="artifact-evidence__source-count">{{ s.count }} 条</span>
          <el-tag size="small" :type="s.status === '已归档' ? 'success' : 'warning'" effect="plain">{{ s.status }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 风险事项证据链 -->
    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">风险事项证据链</span></template>
      <el-table :data="riskEvidence" size="small" stripe border>
        <el-table-column label="风险事项" min-width="160">
          <template #default="{ row }"><span class="artifact-evidence__risk-name">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column label="证据数" width="80" align="center">
          <template #default="{ row }">{{ row.count }} 条</template>
        </el-table-column>
        <el-table-column label="置信度" width="90" align="center">
          <template #default="{ row }"><el-tag size="small" :type="confidenceTag(row.confidence)">{{ row.confidence }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 证据缺口 -->
    <el-alert v-for="(g, i) in gaps" :key="i" :title="g" type="warning" :closable="false" size="small" style="margin-bottom: 8px">
      <template #default>{{ gapsDesc[i] || '' }}</template>
    </el-alert>

    <!-- 动作区 -->
    <div class="artifact-evidence__actions">
      <el-button type="primary" @click="$emit('enter-risk')">进入风险诊断</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['enter-risk'])

const integrity = computed(() => props.data.integrity ?? 86)
const integrityColor = computed(() => integrity.value >= 80 ? 'var(--color-success)' : 'var(--color-warning)')

const sources = computed(() => props.data.sources || [
  { name: '工商证据', count: 6, status: '已归档' },
  { name: '司法证据', count: 2, status: '已归档' },
  { name: '税票证据', count: 12, status: '已归档' },
  { name: '资料证据', count: 9, status: '部分待确认' },
  { name: '风险关联证据', count: 2, status: '已建立' },
])

const archivedCount = computed(() => sources.value.filter(s => s.status === '已归档' || s.status === '已建立').length)
const pendingCount = computed(() => sources.value.filter(s => s.status.includes('待确认')).length)

const riskEvidence = computed(() => props.data.riskEvidence || [
  { name: '税负率显著低于行业', count: 4, confidence: '高' },
  { name: '开票收入与申报不一致', count: 3, confidence: '高' },
  { name: '购销两头在外', count: 3, confidence: '中' },
  { name: '电费与收入相关性低', count: 1, confidence: '待补充' },
])

const gaps = computed(() => props.data.gaps || [
  '! 电费缴费记录缺失，影响"电费与收入相关性"判断',
  '! 主要合同仍需补充原件，影响"购销两头在外"判断',
])

const gapsDesc = computed(() => {
  const descs = []
  for (let i = 0; i < gaps.value.length; i++) {
    const g = gaps.value[i]
    if (g.includes('电费')) descs.push('建议企业补充最近6个月电费缴费凭证')
    else if (g.includes('合同')) descs.push('建议补充最近一期主要购销合同原件扫描件')
    else descs.push('')
  }
  return descs
})

function confidenceTag(level) {
  return { '高': 'success', '中': 'warning', '低': 'danger', '待补充': 'info' }[level] || 'info'
}
</script>

<style scoped>
.artifact-evidence { display: flex; flex-direction: column; gap: 12px; }
.artifact-evidence__header { display: flex; align-items: center; justify-content: space-between; }
.artifact-evidence__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 18px; font-weight: 700; margin-top: 4px; }

.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.artifact-evidence__sources { display: flex; flex-direction: column; gap: 8px; }
.artifact-evidence__source-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: var(--bg-page); border-radius: var(--radius-6, 6px);
  font-size: 13px;
}
.artifact-evidence__source-name { flex: 1; font-weight: 500; color: var(--text-primary); }
.artifact-evidence__source-count { color: var(--text-secondary); flex-shrink: 0; }

.artifact-evidence__risk-name { font-weight: 600; color: var(--text-primary); }
.artifact-evidence__actions {
  display: flex; gap: 8px; padding: 10px 0;
  border-top: 1px solid var(--border-color-divider);
}
</style>
