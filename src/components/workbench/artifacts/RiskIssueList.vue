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
      <!-- 风险等级过滤 — 轻量 text 按钮 -->
      <div class="risk-issue-list__filter">
        <el-button
          v-for="lv in riskLevels"
          :key="lv.key"
          :type="activeRiskLevel === lv.key ? 'primary' : 'info'"
          :text="true"
          :plain="activeRiskLevel !== lv.key"
          size="small"
          @click="activeRiskLevel = lv.key"
        >
          {{ lv.label }}
        </el-button>
      </div>

      <!-- 风险事项表格 -->
      <el-table
        :data="filteredIssues"
        size="small"
        empty-text="暂无匹配的风险事项"
        class="risk-issue-table"
      >
        <el-table-column label="风险事项" min-width="180">
          <template #default="{ row }">
            <div class="risk-cell-name">{{ row.name }}</div>
            <div class="risk-cell-category">{{ row.category }}</div>
          </template>
        </el-table-column>
        <el-table-column label="风险说明" min-width="280">
          <template #default="{ row }">
            <span class="risk-cell-desc">{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="riskTag(row.level)">{{ row.level }}风险</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showEvidence(row)">查看证据链</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 企业亮点 tab -->
    <div v-if="activeTab === 'highlights'" class="risk-issue-list__tab-body">
      <el-table
        :data="highlights || []"
        size="small"
        empty-text="暂无企业亮点数据"
        class="risk-issue-table"
      >
        <el-table-column label="亮点" min-width="140">
          <template #default="{ row }">
            <span class="risk-cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="说明" min-width="280">
          <template #default="{ row }">
            <span class="risk-cell-desc">{{ row.description }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 全量指标 tab -->
    <div v-if="activeTab === 'indicators'" class="risk-issue-list__tab-body">
      <el-table
        :data="indicators || []"
        size="small"
        empty-text="暂无全量指标数据"
        class="risk-issue-table"
      >
        <el-table-column label="指标" min-width="160">
          <template #default="{ row }">
            <span class="risk-cell-label">{{ row.label }}</span>
          </template>
        </el-table-column>
        <el-table-column label="指标值" min-width="160">
          <template #default="{ row }">
            <span class="risk-cell-value">{{ row.value }}</span>
          </template>
        </el-table-column>
      </el-table>
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
  gap: var(--space-sm, 8px);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
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
  margin-bottom: var(--space-sm, 8px);
}

.risk-issue-list__tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.risk-issue-list__tab-body {
  min-height: 0;
}

/* 风险等级过滤 — 轻量 text 按钮 */
.risk-issue-list__filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs, 4px);
  margin-bottom: var(--space-sm, 8px);
}

.risk-issue-list__filter .el-button {
  padding: 2px 8px;
  font-size: var(--font-size-xs, 11px);
}

/* 统一表格样式 — 无内嵌滚动条 */
.risk-issue-table {
  width: 100%;
  min-width: 0;
}

.risk-issue-table :deep(.el-table__body-wrapper) {
  /* 不设 max-height / overflow，由外层容器滚动 */
}

/* 表格单元格样式 */
.risk-cell-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm, 13px);
  line-height: 1.3;
}

.risk-cell-category {
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.risk-cell-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-xs, 12px);
  line-height: 1.5;
  word-break: break-word;
}

.risk-cell-label {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs, 12px);
}

.risk-cell-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-xs, 12px);
}

/* 证据链弹窗 */
.evidence-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
