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
        <el-descriptions-item label="区域">{{ basicInfo?.region || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 探查结论 -->
    <el-alert v-if="conclusion" :title="conclusion" type="success" :closable="false" show-icon class="artifact-alert" />

    <!-- 核心风险和亮点 -->
    <RiskIssueList
      :issues="riskIssues"
      :highlights="highlights"
      :indicators="fullIndicators"
      title="核心风险和亮点"
    />

    <!-- 后续动作提示 -->
    <div v-if="evidenceSummary" class="artifact-evidence-summary">
      <span class="artifact-evidence-summary__label">数据来源：</span>
      <span>{{ evidenceSummary }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import RiskIssueList from './RiskIssueList.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })

const enterprise = computed(() => props.data.enterprise || {})
const basicInfo = computed(() => props.data.basicInfo || {})
const conclusion = computed(() => props.data.conclusion || '')
const riskIssues = computed(() => props.data.riskIssues || [])
const highlights = computed(() => props.data.highlights || [])
const fullIndicators = computed(() => props.data.fullIndicators || [])
const evidenceSummary = computed(() => props.data.evidenceSummary || '')
</script>

<style scoped>
.artifact-explore { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 15px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.artifact-alert { margin: 0; }
.artifact-evidence-summary {
  padding: 8px 12px;
  background: var(--bg-page);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}
.artifact-evidence-summary__label {
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
