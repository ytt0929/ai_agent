<template>
  <div class="artifact-business">
    <!-- 核验结论摘要条 -->
    <div class="artifact-business__summary">
      <span class="artifact-business__summary-label">工商核验</span>
      <el-tag :type="conclusion === '正常' ? 'success' : 'warning'" size="small">{{ conclusion }}</el-tag>
      <span v-if="conclusionNote" class="artifact-business__summary-note">{{ conclusionNote }}</span>
    </div>

    <!-- 基础信息 -->
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">基础信息</span>
        </div>
      </template>

      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="主体状态">
          <el-tag :type="entityStatus === '正常存续' ? 'success' : 'danger'" size="small">{{ entityStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ legalPerson || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ registeredCapital || '—' }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ establishedDate || '—' }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ industry || '—' }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ region || '—' }}</el-descriptions-item>
        <el-descriptions-item label="关联企业">{{ relatedCompanies || '—' }}</el-descriptions-item>
        <el-descriptions-item label="税务评级">
          <el-tag type="success" size="small">{{ taxLevel || '—' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 核验结果 -->
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <span class="artifact-card__title">核验结果</span>
      </template>
      <div class="artifact-business__checks">
        <div v-for="(c, i) in checks" :key="i" class="artifact-business__check-item">
          <span :class="c.ok ? 'check-ok' : 'check-warn'">{{ c.ok ? '✓' : '!' }}</span>
          <span class="artifact-business__check-text">{{ c.text }}</span>
        </div>
      </div>
    </el-card>

    <!-- 关联企业 -->
    <el-card v-if="relatedCompaniesList.length" shadow="never" class="artifact-card">
      <template #header>
        <span class="artifact-card__title">关联企业</span>
      </template>
      <el-table :data="relatedCompaniesList" size="small" stripe border>
        <el-table-column label="企业名称" min-width="140">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="关系" width="100">
          <template #default="{ row }">{{ row.relation }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }"><el-tag size="small" :type="row.status === '正常' ? 'success' : 'info'">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 风险提示小卡 -->
    <el-card v-if="riskTips?.length" shadow="never" class="artifact-card artifact-card--warn">
      <template #header>
        <span class="artifact-card__title">风险提示</span>
      </template>
      <div v-for="(tip, i) in riskTips" :key="i" class="artifact-business__tip">
        <span class="tip-icon">⚠</span>
        <span class="tip-text">{{ tip }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const entityStatus = computed(() => props.data.entityStatus || '—')
const conclusion = computed(() => props.data.conclusion || '正常')
const conclusionNote = computed(() => props.data.conclusionNote || '')
const legalPerson = computed(() => props.data.legalPerson || '—')
const registeredCapital = computed(() => props.data.registeredCapital || '—')
const establishedDate = computed(() => props.data.establishedDate || '—')
const industry = computed(() => props.data.industry || '—')
const region = computed(() => props.data.region || '—')
const relatedCompanies = computed(() => props.data.relatedCompanies || '—')
const taxLevel = computed(() => props.data.taxLevel || '—')
const judicialDetails = computed(() => props.data.judicialDetails || [])
const relatedCompaniesList = computed(() => props.data.relatedCompaniesList || [])
const riskTips = computed(() => props.data.riskTips || [])

const checks = computed(() => props.data.checks || [
  { ok: true, text: '工商登记信息核验通过' },
  { ok: true, text: '主体状态正常，无经营异常记录' },
  { ok: true, text: '未发现重大司法风险' },
  { ok: true, text: '税务评级A级' },
])
</script>

<style scoped>
.artifact-business { display: flex; flex-direction: column; gap: 12px; }
.artifact-business__summary {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: var(--bg-page); border-radius: var(--radius-6, 6px);
}
.artifact-business__summary-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.artifact-business__summary-note { font-size: 12px; color: var(--text-secondary); }

.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.artifact-business__checks { display: flex; flex-direction: column; gap: 6px; }
.artifact-business__check-item { font-size: 13px; color: var(--text-secondary); display: flex; gap: 6px; align-items: flex-start; }
.artifact-business__check-text { flex: 1; }
.check-ok { color: var(--color-success); font-weight: 700; flex-shrink: 0; }
.check-warn { color: var(--color-warning); font-weight: 700; flex-shrink: 0; }

.artifact-card--warn { border-left: 3px solid var(--color-warning); }
.artifact-business__tip { font-size: 12px; color: var(--text-secondary); display: flex; gap: 6px; align-items: flex-start; margin-bottom: 4px; }
.artifact-business__tip:last-child { margin-bottom: 0; }
.tip-icon { color: var(--color-warning); flex-shrink: 0; }
.tip-text { flex: 1; }
</style>
