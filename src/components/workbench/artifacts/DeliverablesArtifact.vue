<template>
  <div class="artifact-deliverables">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">尽调产物</span>
          <el-tag type="success" size="small">已生成</el-tag>
        </div>
      </template>
      <el-table :data="items" size="small" stripe border>
        <el-table-column label="产物名称" min-width="140">
          <template #default="{ row }"><span class="artifact-dl-name">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }"><el-tag size="small" :type="row.status.includes('已') || row.status.includes('归档') ? 'success' : 'warning'">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="数量" width="70" align="center">
          <template #default="{ row }">{{ row.count }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === '已生成'" size="small" text type="primary">查看</el-button>
            <el-button v-else size="small" text type="primary">生成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 报告模板与资料包清单 -->
    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">报告模板与资料包</span></template>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="报告模板">{{ reportTemplate }}</el-descriptions-item>
        <el-descriptions-item label="资料包">工商资料 / 司法查询 / 税票数据 / 上传资料</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 待确认项 -->
    <el-card v-if="pendingItems?.length" shadow="never" class="artifact-card artifact-card--warn">
      <template #header><span class="artifact-card__title">待确认项</span></template>
      <div v-for="(item, i) in pendingItems" :key="i" class="artifact-deliverables__pending">
        <span class="pending-icon">⚠</span>
        <span class="pending-text">{{ item }}</span>
      </div>
    </el-card>

    <!-- 导出状态 -->
    <div v-if="exportStatus" class="artifact-deliverables__export-status">
      <span>✓ {{ exportStatus }}</span>
    </div>

    <!-- 动作区 -->
    <div class="artifact-deliverables__actions">
      <el-button type="primary" @click="$emit('edit-report')">编辑报告</el-button>
      <el-button plain @click="$emit('export-report')">导出报告</el-button>
      <el-button plain @click="$emit('start-monitor')">加入监控</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['edit-report', 'export-report', 'start-monitor'])
const items = computed(() => props.data.items || [])
const exportStatus = computed(() => props.data.exportStatus || '')
const reportTemplate = computed(() => {
  const dl = items.value.find(i => i.name === '尽调底稿')
  return '标准授信尽调报告'
})
const pendingItems = computed(() => {
  const items = []
  if (props.data.riskConclusion !== false) items.push('风险结论需确认')
  if (props.data.taxNote !== false) items.push('税票异常说明待补充')
  if (props.data.creditAdvice !== false) items.push('授信建议待确认')
  return items.length ? items : ['风险结论需确认', '授信建议待确认']
})
</script>

<style scoped>
.artifact-deliverables { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-dl-name { font-weight: 600; }
.artifact-deliverables__actions {
  display: flex; gap: 8px; padding: 10px 0;
  border-top: 1px solid var(--border-color-divider);
}
.artifact-card--warn { border-left: 3px solid var(--color-warning); }
.artifact-deliverables__pending { font-size: 13px; color: var(--text-secondary); display: flex; gap: 6px; align-items: flex-start; margin-bottom: 6px; }
.artifact-deliverables__pending:last-child { margin-bottom: 0; }
.pending-icon { color: var(--color-warning); flex-shrink: 0; }
.pending-text { flex: 1; }
.artifact-deliverables__export-status {
  padding: 8px 12px; background: var(--color-success-bg); border-radius: var(--radius-6, 6px);
  font-size: 13px; font-weight: 500; color: var(--color-success);
}
</style>
