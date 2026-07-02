<template>
  <div class="artifact-risk">
    <!-- 顶部轻量状态条 -->
    <div class="risk-summary-bar">
      <div class="risk-summary-bar__left">
        <div class="risk-summary-bar__title-row">
          <span class="risk-summary-bar__title">风险诊断</span>
          <el-tag type="success" size="small">已完成</el-tag>
          <el-tag :type="riskLevelTag" size="small">{{ riskLevel }}风险</el-tag>
        </div>
        <p class="risk-summary-bar__desc">基于工商、司法、税票、资料和证据链完成诊断，识别到 {{ riskIssues.length }} 项风险事项。建议有条件授信，并补充交易真实性和税负异常说明。</p>
      </div>
      <div class="risk-summary-bar__tags">
        <el-tag size="small" effect="plain">评分 {{ score }}</el-tag>
        <el-tag size="small" effect="plain">{{ grade }}</el-tag>
      </div>
    </div>

    <!-- 诊断结论 -->
    <el-alert v-if="conclusion" :title="conclusion" type="warning" :closable="false" show-icon class="artifact-alert" />

    <!-- 风险诊断事项 -->
    <RiskIssueList
      :issues="riskIssues"
      :highlights="highlights"
      :indicators="indicators"
      title="风险事项"
    />

    <!-- 建议动作 -->
    <div v-if="suggestedActions?.length" class="artifact-risk__suggestions">
      <span class="artifact-risk__suggestions-label">建议动作：</span>
      <el-tag v-for="(a, ai) in suggestedActions" :key="ai" size="small" effect="plain">{{ a }}</el-tag>
    </div>

    <!-- 操作区 -->
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
.artifact-risk {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

/* ====== 顶部轻量状态条 ====== */
.risk-summary-bar {
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

.risk-summary-bar__left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.risk-summary-bar__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

.risk-summary-bar__title {
  font-size: var(--font-size-body, 13px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
}

.risk-summary-bar__desc {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.risk-summary-bar__tags {
  display: flex;
  gap: var(--space-xs, 4px);
  flex-wrap: wrap;
  flex-shrink: 0;
}



/* ====== 诊断结论 ====== */
.artifact-alert { margin: 0; }

/* ====== 建议动作 ====== */
.artifact-risk__suggestions {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-xs, 4px);
  padding: var(--space-sm, 8px) 0; font-size: var(--font-size-xs, 12px);
}
.artifact-risk__suggestions-label {
  font-weight: 500; color: var(--text-secondary); margin-right: var(--space-xs, 4px);
}

/* ====== 操作区 ====== */
.artifact-risk__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm, 8px);
  padding: var(--space-sm, 10px) 0;
  border-top: 1px solid var(--border-default, #dbe3ef);
  min-width: 0;
}
</style>
