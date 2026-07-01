<template>
  <div class="artifact-explore">
    <!-- 企业基本信息卡 -->
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">
            <el-icon><OfficeBuilding /></el-icon>
            {{ enterprise?.name || '—' }}
          </span>
          <el-tag type="success" size="small">探查完成</el-tag>
        </div>
      </template>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="统一社会信用代码">{{ basicInfo?.creditCode || '—' }}</el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ basicInfo?.legalPerson || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ basicInfo?.registeredCapital || '—' }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ basicInfo?.establishedDate || '—' }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ basicInfo?.industry || '—' }}</el-descriptions-item>
        <el-descriptions-item label="人员规模">{{ basicInfo?.staffSize || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 探查结论 -->
    <el-alert v-if="conclusion" :title="conclusion" type="success" :closable="false" show-icon class="artifact-alert" />

    <!-- 风险分类 tabs -->
    <el-card shadow="never" class="artifact-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="工商风险" name="工商风险">
          <el-table :data="filteredRisks('工商风险')" size="small" stripe border>
            <el-table-column label="等级" width="70" align="center">
              <template #default="{ row }"><el-tag size="small" :type="riskTag(row.level)">{{ row.level }}</el-tag></template>
            </el-table-column>
            <el-table-column label="详情">{{ row => row.detail }}</el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="经营风险" name="经营风险">
          <el-table :data="filteredRisks('经营风险')" size="small" stripe border>
            <el-table-column label="等级" width="70" align="center">
              <template #default="{ row }"><el-tag size="small" :type="riskTag(row.level)">{{ row.level }}</el-tag></template>
            </el-table-column>
            <el-table-column label="详情">{{ row => row.detail }}</el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="税务风险" name="税务风险">
          <el-table :data="filteredRisks('税务风险')" size="small" stripe border>
            <el-table-column label="等级" width="70" align="center">
              <template #default="{ row }"><el-tag size="small" :type="riskTag(row.level)">{{ row.level }}</el-tag></template>
            </el-table-column>
            <el-table-column label="详情">{{ row => row.detail }}</el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const activeTab = ref('工商风险')

const enterprise = computed(() => props.data.enterprise || {})
const basicInfo = computed(() => props.data.basicInfo || {})
const conclusion = computed(() => props.data.conclusion || '')
const risks = computed(() => props.data.risks || [])

function filteredRisks(category) {
  return risks.value.filter(r => r.category === category)
}

function riskTag(level) { return { '低': 'success', '中': 'warning', '高': 'danger' }[level] || 'info' }
</script>

<style scoped>
.artifact-explore { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 15px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.artifact-alert { margin: 0; }
</style>
