<template>
  <div class="risk-issue-list">
    <div class="risk-issue-list__header">
      <span class="risk-issue-list__title">{{ title || '核心风险和亮点' }}</span>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="risk-issue-list__tabs">
      <el-tab-pane :label="`风险事项（${issues?.length || 0}）`" name="risk" />
      <el-tab-pane :label="`企业亮点（${highlights?.length || 0}）`" name="highlights" />
      <el-tab-pane :label="`全量指标（${indicators?.length || 0}）`" name="indicators" />
    </el-tabs>

    <!-- 风险事项 tab -->
    <div v-if="activeTab === 'risk'" class="risk-issue-list__tab-body">
      <!-- 风险等级过滤 -->
      <div class="risk-issue-list__filter">
        <el-button
          v-for="lv in riskLevels"
          :key="lv.key"
          :type="activeRiskLevel === lv.key ? 'primary' : ''"
          :plain="activeRiskLevel !== lv.key"
          size="small"
          text
          @click="activeRiskLevel = lv.key"
        >
          {{ lv.label }}
        </el-button>
      </div>

      <!-- 风险事项列表 -->
      <div v-if="filteredIssues.length" class="risk-issue-list__items">
        <div v-for="(item, idx) in filteredIssues" :key="idx" class="risk-issue-item">
          <div class="risk-issue-item__main">
            <div class="risk-issue-item__name">{{ item.name }}</div>
            <div class="risk-issue-item__category">{{ item.category }}</div>
          </div>
          <div class="risk-issue-item__desc">{{ item.description }}</div>
          <div class="risk-issue-item__actions">
            <el-tag size="small" :type="riskTag(item.level)">{{ item.level }}风险</el-tag>
            <el-button size="small" link type="primary" @click="showEvidence(item)">查看证据链</el-button>
          </div>
        </div>
      </div>
      <div v-else class="risk-issue-list__empty">暂无匹配的风险事项</div>
    </div>

    <!-- 企业亮点 tab -->
    <div v-if="activeTab === 'highlights'" class="risk-issue-list__tab-body">
      <div v-if="highlights?.length" class="risk-issue-list__highlights">
        <div v-for="(h, idx) in highlights" :key="idx" class="risk-issue-list__highlight-item">
          <span class="risk-issue-list__highlight-name">{{ h.name }}</span>
          <span class="risk-issue-list__highlight-desc">{{ h.description }}</span>
        </div>
      </div>
      <div v-else class="risk-issue-list__empty">暂无企业亮点数据</div>
    </div>

    <!-- 全量指标 tab -->
    <div v-if="activeTab === 'indicators'" class="risk-issue-list__tab-body">
      <div v-if="indicators?.length" class="risk-issue-list__indicators">
        <div v-for="(ind, idx) in indicators" :key="idx" class="risk-issue-list__indicator-item">
          <span class="risk-issue-list__indicator-label">{{ ind.label }}</span>
          <span class="risk-issue-list__indicator-value">{{ ind.value }}</span>
        </div>
      </div>
      <div v-else class="risk-issue-list__empty">暂无全量指标数据</div>
    </div>

    <!-- 证据链弹窗 -->
    <el-dialog v-model="evidenceDialogVisible" :title="selectedIssue?.name || '证据链'" width="480px" destroy-on-close>
      <template v-if="selectedIssue">
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="事项名称">{{ selectedIssue.name }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag size="small" :type="riskTag(selectedIssue.level)">{{ selectedIssue.level }}风险</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="风险分类">{{ selectedIssue.category }}</el-descriptions-item>
          <el-descriptions-item label="说明">{{ selectedIssue.description }}</el-descriptions-item>
          <el-descriptions-item label="证据来源">
            <div class="evidence-sources">
              <el-tag v-for="(src, si) in selectedIssue.evidenceSources" :key="si" size="small" effect="plain">{{ src }}</el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button size="small" @click="evidenceDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  issues: { type: Array, default: () => [] },
  highlights: { type: Array, default: () => [] },
  indicators: { type: Array, default: () => [] },
  title: { type: String, default: '' },
})

const activeTab = ref('risk')
const activeRiskLevel = ref('all')
const selectedIssue = ref(null)
const evidenceDialogVisible = ref(false)

const riskLevels = [
  { key: 'all', label: '全部' },
  { key: '高', label: '高风险' },
  { key: '中', label: '中风险' },
  { key: '低', label: '低风险' },
]

const filteredIssues = computed(() => {
  if (activeRiskLevel.value === 'all') return props.issues || []
  return (props.issues || []).filter(i => i.level === activeRiskLevel.value)
})

function riskTag(level) {
  return { '低': 'success', '中': 'warning', '高': 'danger' }[level] || 'info'
}

function showEvidence(issue) {
  selectedIssue.value = issue
  evidenceDialogVisible.value = true
}
</script>

<style scoped>
.risk-issue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.risk-issue-list__header {
  padding: 2px 0;
}
.risk-issue-list__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.risk-issue-list__tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}
.risk-issue-list__tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
.risk-issue-list__tab-body {
  min-height: 0;
}

/* 风险等级过滤 */
.risk-issue-list__filter {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.risk-issue-list__filter .el-button {
  padding: 2px 8px;
  font-size: 12px;
}

/* 风险事项列表 */
.risk-issue-list__items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}
.risk-issue-item {
  display: grid;
  grid-template-columns: 1fr 1.2fr auto;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  background: var(--bg-page);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
}
.risk-issue-item__name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
}
.risk-issue-item__category {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
.risk-issue-item__desc {
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.risk-issue-item__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

/* 企业亮点 */
.risk-issue-list__highlights {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.risk-issue-list__highlight-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: #f0fdf4;
  border-radius: 6px;
  font-size: 12px;
}
.risk-issue-list__highlight-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
}
.risk-issue-list__highlight-desc {
  color: var(--text-secondary);
}

/* 全量指标 */
.risk-issue-list__indicators {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.risk-issue-list__indicator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--bg-page);
  border-radius: 6px;
  font-size: 12px;
}
.risk-issue-list__indicator-label {
  color: var(--text-tertiary);
}
.risk-issue-list__indicator-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 空状态 */
.risk-issue-list__empty {
  text-align: center;
  padding: 24px 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 证据链弹窗 */
.evidence-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
