<template>
  <div class="artifact-materials">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">资料包</span>
          <el-tag type="primary" size="small">完整度 {{ completeness }}%</el-tag>
        </div>
      </template>
      <el-progress :percentage="completeness" :stroke-width="10" :format="() => `${completeness}%`" />
    </el-card>

    <el-row :gutter="12" class="artifact-metric-row">
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">已收集</div>
          <div class="artifact-metric-value" style="color: var(--color-success)">{{ collected }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">待补充</div>
          <div class="artifact-metric-value" style="color: var(--color-warning)">{{ pending }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="artifact-metric-card">
          <div class="artifact-metric-label">待识别</div>
          <div class="artifact-metric-value" style="color: var(--color-primary)">{{ pendingOcr }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">资料清单</span></template>
      <el-table :data="materials" size="small" stripe border>
        <el-table-column label="资料名称" min-width="120">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }"><el-tag size="small" type="info" effect="plain">{{ row.type || '—' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }"><el-tag size="small" :type="matTag(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="missing?.length" shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title" style="color: var(--color-danger)">缺失资料</span></template>
      <el-alert v-for="(m, i) in missing" :key="i" :title="m.name" type="warning" :closable="false" size="small" style="margin-bottom: 8px">
        <template #default>{{ m.note || '待补充' }}</template>
      </el-alert>
    </el-card>

    <!-- 动作区：待补充 -->
    <div v-if="data?.status === '待补充'" class="artifact-materials__actions">
      <el-button plain @click="$emit('send-material-list')">发送资料清单</el-button>
      <el-button type="primary" @click="$emit('mock-material-upload')">模拟企业上传资料</el-button>
    </div>

    <!-- 动作区：已补充 -->
    <div v-if="data?.status === '已补充'" class="artifact-materials__actions">
      <el-button type="primary" @click="$emit('enter-evidence')">进入证据整合</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['send-material-list', 'mock-material-upload', 'enter-evidence'])
const completeness = computed(() => props.data.completeness || 0)
const collected = computed(() => (props.data.materials || []).filter(m => m.status === '已收集').length)
const pending = computed(() => (props.data.materials || []).filter(m => m.status === '待补充').length)
const pendingOcr = computed(() => (props.data.materials || []).filter(m => m.status === '待识别').length)
const materials = computed(() => props.data.materials || [])
const missing = computed(() => props.data.missing || [])

function matTag(status) { return { '已收集': 'success', '缺失': 'danger', '待上传': 'warning', '待补充': 'warning', '待识别': 'info' }[status] || 'info' }
</script>

<style scoped>
.artifact-materials { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-metric-row { margin: 0; }
.artifact-metric-card { text-align: center; border: none; }
.artifact-metric-label { font-size: 12px; color: var(--text-secondary); }
.artifact-metric-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
.artifact-materials__actions {
  display: flex; gap: 8px; padding: 10px 0;
  border-top: 1px solid var(--border-color-divider);
}
</style>
