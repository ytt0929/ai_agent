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
        <el-table-column label="数量" width="70" align="center">{{ row => row.count }}</el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === '已生成'" size="small" text type="primary">查看</el-button>
            <el-button v-else size="small" text type="primary">生成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Object, default: () => ({}) } })
const items = computed(() => props.data.items || [])
</script>

<style scoped>
.artifact-deliverables { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-dl-name { font-weight: 600; }
</style>
