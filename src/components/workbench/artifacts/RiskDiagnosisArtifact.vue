<template>
  <div class="artifact-risk">
    <el-card shadow="never" class="artifact-card artifact-card--score">
      <div class="artifact-score">
        <div class="artifact-score__value" :style="{ color: scoreColor }">{{ score }}</div>
        <div class="artifact-score__label">综合评分</div>
        <div class="artifact-score__grade">等级 {{ grade }} · <el-tag :type="riskLevelTag" size="small">{{ riskLevel }}风险</el-tag></div>
      </div>
    </el-card>

    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">风险统计</span></template>
      <el-row :gutter="12">
        <el-col :span="8">
          <div class="artifact-risk-stat">
            <div class="artifact-risk-stat__label">高风险</div>
            <div class="artifact-risk-stat__value" style="color: var(--color-danger)">{{ highCount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="artifact-risk-stat">
            <div class="artifact-risk-stat__label">中风险</div>
            <div class="artifact-risk-stat__value" style="color: var(--color-warning)">{{ midCount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="artifact-risk-stat">
            <div class="artifact-risk-stat__label">低风险</div>
            <div class="artifact-risk-stat__value" style="color: var(--color-success)">{{ lowCount }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">风险事项</span></template>
      <el-table :data="riskItems" size="small" stripe border>
        <el-table-column label="类别" width="100" align="center">
          <template #default="{ row }"><el-tag size="small" :type="riskTag(row.level)">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column label="等级" width="70" align="center">
          <template #default="{ row }"><el-tag size="small" :type="riskTag(row.level)">{{ row.level }}</el-tag></template>
        </el-table-column>
        <el-table-column label="详情" min-width="140">{{ row => row.detail }}</el-table-column>
        <el-table-column label="建议动作" min-width="100">
          <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.suggestion || '—' }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-alert v-if="conclusion" :title="conclusion" type="warning" :closable="false" show-icon />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const score = computed(() => props.data.score || '—')
const grade = computed(() => props.data.grade || '—')
const riskLevel = computed(() => props.data.riskLevel || '')
const riskLevelTag = computed(() => ({ '低': 'success', '中': 'warning', '高': 'danger' }[riskLevel.value] || 'info'))
const scoreColor = computed(() => ({ '低': 'var(--color-success)', '中': 'var(--color-warning)', '高': 'var(--color-danger)' }[riskLevel.value] || 'var(--text-primary)'))
const riskItems = computed(() => props.data.riskItems || [])
const conclusion = computed(() => props.data.conclusion || '')
const highCount = computed(() => riskItems.value.filter(r => r.level === '高').length)
const midCount = computed(() => riskItems.value.filter(r => r.level === '中').length)
const lowCount = computed(() => riskItems.value.filter(r => r.level === '低').length)

function riskTag(level) { return { '低': 'success', '中': 'warning', '高': 'danger' }[level] || 'info' }
</script>

<style scoped>
.artifact-risk { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-card--score { text-align: center; }
.artifact-score__value { font-size: 36px; font-weight: 800; }
.artifact-score__label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.artifact-score__grade { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.artifact-risk-stat { text-align: center; padding: 8px; }
.artifact-risk-stat__label { font-size: 12px; color: var(--text-secondary); }
.artifact-risk-stat__value { font-size: 24px; font-weight: 700; }
</style>
