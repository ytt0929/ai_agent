<template>
  <div class="artifact-monitor">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">
            <el-icon><OfficeBuilding /></el-icon>
            {{ enterprise?.name || '—' }}
          </span>
          <el-tag v-if="created" type="success" size="small">监控中</el-tag>
          <el-tag v-else type="info" size="small">未启用</el-tag>
        </div>
      </template>

      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="监控规则">
          <div class="artifact-rule-list">
            <el-tag v-for="r in rules" :key="r" size="small" type="info" effect="plain">{{ r }}</el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="监控频率">{{ frequency || '每日' }}</el-descriptions-item>
        <el-descriptions-item label="监控维度">
          <div class="artifact-rule-list">
            <el-tag v-for="d in dimensions" :key="d" size="small" type="info" effect="plain">{{ d }}</el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-alert v-if="created" title="监控任务已创建，持续追踪中" type="success" :closable="false" show-icon />
    <el-alert v-else title="尚未启用监控" type="info" :closable="false" show-icon description="可在探查完成后启用监控，系统将自动追踪工商变更、司法风险、税务异常等指标。" />

    <el-card v-if="alerts?.length" shadow="never" class="artifact-card">
      <template #header><span class="artifact-card__title">风险预警</span></template>
      <el-alert v-for="(a, i) in alerts" :key="i" :title="a.title" :type="a.type || 'warning'" :closable="false" size="small" style="margin-bottom: 8px">
        <template #default>{{ a.desc }}</template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const enterprise = computed(() => props.data.enterprise || {})
const rules = computed(() => props.data.rules || [])
const frequency = computed(() => props.data.frequency || '每日')
const dimensions = computed(() => props.data.dimensions || [])
const created = computed(() => props.data.created || false)
const alerts = computed(() => props.data.alerts || [])
</script>

<style scoped>
.artifact-monitor { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.artifact-rule-list { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
