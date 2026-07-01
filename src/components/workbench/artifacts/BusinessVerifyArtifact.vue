<template>
  <div class="artifact-business">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">工商校验</span>
          <el-tag :type="entityStatus === '正常存续' ? 'success' : 'danger'" size="small">{{ entityStatus }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="主体状态">
          <el-tag :type="entityStatus === '正常存续' ? 'success' : 'danger'" size="small">{{ entityStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ legalPerson || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ registeredCapital || '—' }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ establishedDate || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">司法风险</span>
          <el-tag :type="judicialRisk === '无' ? 'success' : 'warning'" size="small">{{ judicialRisk }}</el-tag>
        </div>
      </template>
      <el-table :data="judicialDetails" size="small" stripe border>
        <el-table-column label="案件类型" width="100">
          <template #default="{ row }"><el-tag size="small" :type="row.type === '无' ? 'success' : 'info'">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column label="详情" min-width="160">{{ row => row.detail }}</el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="artifact-card">
      <template #header>
        <span class="artifact-card__title">关联企业</span>
      </template>
      <el-table :data="relatedCompanies" size="small" stripe border>
        <el-table-column label="企业名称" min-width="140">{{ row => row.name }}</el-table-column>
        <el-table-column label="关系" width="100">{{ row => row.relation }}</el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }"><el-tag size="small" :type="row.status === '正常' ? 'success' : 'info'">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
const props = defineProps({ data: { type: Object, default: () => ({}) } })
const entityStatus = computed(() => props.data.entityStatus || '—')
const legalPerson = computed(() => props.data.legalPerson || '—')
const registeredCapital = computed(() => props.data.registeredCapital || '—')
const establishedDate = computed(() => props.data.establishedDate || '—')
const judicialRisk = computed(() => props.data.judicialRisk || '—')
const judicialDetails = computed(() => props.data.judicialDetails || [])
const relatedCompanies = computed(() => props.data.relatedCompanies || [])
</script>

<style scoped>
.artifact-business { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
</style>
