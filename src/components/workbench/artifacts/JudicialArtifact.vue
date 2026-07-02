<template>
  <div class="artifact-judicial">
    <!-- 顶部标题 -->
    <div class="artifact-judicial__header">
      <span class="artifact-judicial__title">司法查询 · 已完成</span>
      <el-tag type="success" size="small" effect="plain">无重大风险</el-tag>
    </div>
    <p class="artifact-judicial__desc">基于公开司法、执行、裁判文书和行政处罚数据核验</p>

    <!-- 司法风险概览 -->
    <el-row :gutter="12" class="artifact-metric-row">
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">重大诉讼</div>
          <div class="artifact-metric-value" style="color: var(--color-success)">{{ majorLawsuit }} 条</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">被执行信息</div>
          <div class="artifact-metric-value" style="color: var(--color-success)">{{ execution }} 条</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">失信记录</div>
          <div class="artifact-metric-value" style="color: var(--color-success)">{{ dishonest }} 条</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="artifact-metric-row">
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">裁判文书</div>
          <div class="artifact-metric-value">{{ judgment }} 条{{ judgmentText }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">行政处罚</div>
          <div class="artifact-metric-value" style="color: var(--color-success)">{{ penalty }} 条重大异常</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">开庭公告</div>
          <div class="artifact-metric-value">{{ hearing }} 条历史记录</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 核验结论 -->
    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">核验结论</span></template>
      <div class="artifact-judicial__conclusion">
        <div v-for="(c, i) in conclusions" :key="i" class="artifact-judicial__conclusion-item">
          <span :class="c.type === 'warn' ? 'warn' : 'ok'">{{ c.type === 'warn' ? '!' : '✓' }}</span>
          <span>{{ c.text }}</span>
        </div>
      </div>
    </el-card>

    <!-- 司法记录明细 -->
    <el-card v-if="records?.length" shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">司法记录明细</span></template>
      <el-table :data="records" size="small" stripe border>
        <el-table-column label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" type="info" effect="plain">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column label="风险等级" width="90" align="center">
          <template #default="{ row }"><el-tag size="small" :type="riskTag(row.level)">{{ row.level }}</el-tag></template>
        </el-table-column>
        <el-table-column label="摘要" min-width="180">
          <template #default="{ row }">{{ row.summary }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 数据来源 -->
    <div class="artifact-judicial__source">
      <span class="artifact-judicial__source-label">数据来源：</span>
      <span>工商公开信息 / 裁判文书网 / 执行公开信息 / 行政处罚公示</span>
      <span class="artifact-judicial__source-time">更新时间：{{ updateTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })

const majorLawsuit = computed(() => props.data.majorLawsuit ?? 0)
const execution = computed(() => props.data.execution ?? 0)
const dishonest = computed(() => props.data.dishonest ?? 0)
const judgment = computed(() => props.data.judgment ?? 0)
const judgmentText = computed(() => props.data.judgmentText || '')
const penalty = computed(() => props.data.penalty ?? 0)
const hearing = computed(() => props.data.hearing ?? 0)

const conclusions = computed(() => props.data.conclusions || [
  { type: 'ok', text: '未发现失信被执行记录' },
  { type: 'ok', text: '未发现重大未结诉讼' },
  { type: 'ok', text: '未发现影响持续经营的行政处罚' },
  { type: 'warn', text: '存在少量历史裁判文书，建议归档备查' },
])

const records = computed(() => props.data.records || [])

const updateTime = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

function riskTag(level) {
  return { '低风险': 'success', '中风险': 'warning', '高风险': 'danger' }[level] || 'info'
}
</script>

<style scoped>
.artifact-judicial { display: flex; flex-direction: column; gap: 12px; }
.artifact-judicial__header { display: flex; align-items: center; justify-content: space-between; }
.artifact-judicial__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-judicial__desc { font-size: 12px; color: var(--text-tertiary); margin: 0; }

.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 18px; font-weight: 700; margin-top: 4px; }

.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.artifact-judicial__conclusion { display: flex; flex-direction: column; gap: 6px; }
.artifact-judicial__conclusion-item { font-size: 13px; color: var(--text-secondary); display: flex; gap: 6px; align-items: flex-start; }
.artifact-judicial__conclusion-item .ok { color: var(--color-success); font-weight: 700; flex-shrink: 0; }
.artifact-judicial__conclusion-item .warn { color: var(--color-warning); font-weight: 700; flex-shrink: 0; }

.artifact-judicial__source {
  font-size: 12px; color: var(--text-tertiary); padding: 8px 0;
  border-top: 1px solid var(--border-color-divider);
  display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
}
.artifact-judicial__source-label { font-weight: 500; color: var(--text-secondary); }
.artifact-judicial__source-time { margin-left: auto; }
</style>
