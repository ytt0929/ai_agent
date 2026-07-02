<template>
  <div class="artifact-risk">
    <!-- 风险评分卡片 -->
    <el-card shadow="never" class="artifact-card artifact-card--score">
      <div class="artifact-score">
        <div class="artifact-score__value" :style="{ color: scoreColor }">{{ score }}</div>
        <div class="artifact-score__label">综合评分</div>
        <div class="artifact-score__grade">等级 {{ grade }} · <el-tag :type="riskLevelTag" size="small">{{ riskLevel }}风险</el-tag></div>
      </div>
    </el-card>

    <!-- 诊断结论 -->
    <el-alert v-if="conclusion" :title="conclusion" type="warning" :closable="false" show-icon class="artifact-alert" />

    <!-- 风险诊断事项 -->
    <RiskIssueList
      :issues="riskIssues"
      :highlights="highlights"
      :indicators="indicators"
      title="风险诊断事项"
    />

    <!-- 建议动作 -->
    <div v-if="suggestedActions?.length" class="artifact-risk__suggestions">
      <span class="artifact-risk__suggestions-label">建议动作：</span>
      <el-tag v-for="(a, ai) in suggestedActions" :key="ai" size="small" effect="plain">{{ a }}</el-tag>
    </div>

    <!-- 动作区 -->
    <div class="artifact-risk__actions">
      <el-button plain @click="$emit('view-diagnosis-report')">查看诊断报告</el-button>
      <el-button plain @click="$emit('sync-report')">同步到最终报告</el-button>
      <el-button type="primary" @click="$emit('enter-deliverables')">进入产物确认</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RiskIssueList from './RiskIssueList.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['view-diagnosis-report', 'sync-report', 'enter-deliverables'])
const score = computed(() => props.data.score || '—')
const grade = computed(() => props.data.grade || '—')
const riskLevel = computed(() => props.data.riskLevel || '')
const riskLevelTag = computed(() => ({ '低': 'success', '中': 'warning', '高': 'danger' }[riskLevel.value] || 'info'))
const scoreColor = computed(() => ({ '低': 'var(--color-success)', '中': 'var(--color-warning)', '高': 'var(--color-danger)' }[riskLevel.value] || 'var(--text-primary)'))
const riskIssues = computed(() => props.data.riskIssues || props.data.riskItems || [])
const conclusion = computed(() => props.data.conclusion || '')
const suggestedActions = computed(() => props.data.suggestedActions || [])
const highlights = computed(() => props.data.highlights || [])
const indicators = computed(() => props.data.indicators || [])
</script>

<style scoped>
.artifact-risk { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-card--score { text-align: center; }
.artifact-score__value { font-size: 36px; font-weight: 800; }
.artifact-score__label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.artifact-score__grade { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.artifact-alert { margin: 0; }
.artifact-risk__suggestions {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
  padding: 8px 0; font-size: 12px;
}
.artifact-risk__suggestions-label {
  font-weight: 500; color: var(--text-secondary); margin-right: 4px;
}
.artifact-risk__actions {
  display: flex; gap: 8px; padding: 10px 0;
  border-top: 1px solid var(--border-color-divider);
}
</style>
