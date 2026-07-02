<template>
  <div class="artifact-screening">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">智能筛客结果</span>
          <el-tag v-if="data.summary" type="success" size="small">{{ data.summary.recommended }}</el-tag>
        </div>
      </template>

      <div v-if="data.filters?.length" class="artifact-filter-tags">
        <el-tag v-for="f in data.filters" :key="f" type="info" effect="plain" size="small">{{ f }}</el-tag>
      </div>

      <el-row :gutter="12" class="artifact-metric-row">
        <el-col :span="8">
          <el-card shadow="never" class="artifact-metric-card">
            <div class="artifact-metric-label">匹配企业</div>
            <div class="artifact-metric-value">{{ data.summary?.matched || '—' }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="artifact-metric-card">
            <div class="artifact-metric-label">高风险过滤</div>
            <div class="artifact-metric-value">{{ data.summary?.filtered || '—' }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="artifact-metric-card">
            <div class="artifact-metric-label">适合转尽调</div>
            <div class="artifact-metric-value">{{ data.summary?.recommended || '—' }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-table :data="data.enterprises || []" stripe border size="small">
        <el-table-column type="index" label="#" width="40" align="center" />
        <el-table-column label="企业名称" min-width="140">
          <template #default="{ row }"><span class="artifact-ent-name">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column label="行业" width="70" align="center">
          <template #default="{ row }"><el-tag size="small" type="info" effect="plain">{{ row.industry }}</el-tag></template>
        </el-table-column>
        <el-table-column label="风险" width="70" align="center">
          <template #default="{ row }"><el-tag size="small" :type="riskTag(row.risk)">{{ row.risk }}</el-tag></template>
        </el-table-column>
        <el-table-column label="匹配度" width="80" align="center">
          <template #default="{ row }"><el-progress :percentage="row.match || row.matchPercent || 0" :stroke-width="6" :color="(row.match || row.matchPercent) > 80 ? '#10b981' : '#f59e0b'" /></template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }"><el-button size="small" text type="primary" @click="$emit('explore', row)">探查</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['explore'])
function riskTag(level) { return { '低': 'success', '中': 'warning', '高': 'danger' }[level] || 'info' }
</script>

<style scoped>
.artifact-screening { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; justify-content: space-between; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-filter-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
.artifact-metric-row { margin-bottom: 12px; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }
.artifact-ent-name { font-weight: 600; color: var(--text-primary); }
</style>
