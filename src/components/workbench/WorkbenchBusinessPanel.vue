<template>
  <div class="wb-business-panel">
    <div class="wb-business-panel__header">
      <h3 class="wb-business-panel__title">{{ panelTitle }}</h3>
      <el-tag v-if="panelTag" :type="panelTagType" size="small">{{ panelTag }}</el-tag>
    </div>

    <!-- 1. 智能筛客 -->
    <template v-if="tool === 'screening'">
      <div v-if="data.filters?.length" class="wb-bp-filters">
        <el-tag v-for="f in data.filters" :key="f" size="small" type="info" effect="plain">{{ f }}</el-tag>
      </div>
      <div v-if="data.summary" class="wb-bp-metrics">
        <div class="wb-bp-metric"><span class="wb-bp-metric__label">匹配企业</span><strong>{{ data.summary.matched }}</strong></div>
        <div class="wb-bp-metric"><span class="wb-bp-metric__label">高风险过滤</span><strong>{{ data.summary.filtered }}</strong></div>
        <div class="wb-bp-metric"><span class="wb-bp-metric__label">适合转尽调</span><strong>{{ data.summary.recommended }}</strong></div>
      </div>
      <el-table :data="data.enterprises || []" size="small" stripe class="wb-bp-table" @row-click="onRowClick">
        <el-table-column type="index" label="#" width="40" align="center" />
        <el-table-column label="企业名称" min-width="130">
          <template #default="{ row }"><span class="wb-ent-name">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column label="行业" width="60"><template #default="{ row }"><span class="wb-ent-industry">{{ row.industry }}</span></template></el-table-column>
        <el-table-column label="风险" width="60" align="center"><template #default="{ row }"><el-tag :type="riskTag(row.risk)" size="small">{{ row.risk }}</el-tag></template></el-table-column>
        <el-table-column label="进度" width="80"><template #default="{ row }"><span class="wb-ent-progress">{{ row.progress }}</span></template></el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template #default="{ row }"><el-button size="small" text type="primary" @click.stop="emit('explore', row)">探查</el-button></template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 2. 企业探查 -->
    <template v-else-if="tool === 'exploration'">
      <div class="wb-bp-ent-bar">
        <el-icon><OfficeBuilding /></el-icon><span>{{ data.enterprise?.name || '—' }}</span>
      </div>
      <el-descriptions :column="1" size="small" border class="wb-bp-desc">
        <el-descriptions-item label="统一社会信用代码">{{ data.basicInfo?.creditCode || '—' }}</el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ data.basicInfo?.legalPerson || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ data.basicInfo?.registeredCapital || '—' }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ data.basicInfo?.establishedDate || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-tabs v-model="activeRiskTab" class="wb-bp-tabs">
        <el-tab-pane label="工商风险" name="commercial">
          <el-table :data="filteredRisks('工商风险')" size="small" stripe>
            <el-table-column label="等级" width="70" align="center"><template #default="{ row }"><el-tag :type="riskTag(row.level)" size="small">{{ row.level }}</el-tag></template></el-table-column>
            <el-table-column label="详情"><template #default="{ row }"><span>{{ row.detail }}</span></template></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="经营风险" name="operation">
          <el-table :data="filteredRisks('经营风险')" size="small" stripe>
            <el-table-column label="等级" width="70" align="center"><template #default="{ row }"><el-tag :type="riskTag(row.level)" size="small">{{ row.level }}</el-tag></template></el-table-column>
            <el-table-column label="详情"><template #default="{ row }"><span>{{ row.detail }}</span></template></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="税务风险" name="tax">
          <el-table :data="filteredRisks('税务风险')" size="small" stripe>
            <el-table-column label="等级" width="70" align="center"><template #default="{ row }"><el-tag :type="riskTag(row.level)" size="small">{{ row.level }}</el-tag></template></el-table-column>
            <el-table-column label="详情"><template #default="{ row }"><span>{{ row.detail }}</span></template></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <el-alert :title="data.conclusion" type="success" :closable="false" show-icon class="wb-bp-alert" />
    </template>

    <!-- 3. 监控 -->
    <template v-else-if="tool === 'monitor'">
      <div class="wb-bp-ent-bar" v-if="data.enterprise">
        <el-icon><OfficeBuilding /></el-icon><span>{{ data.enterprise.name }}</span>
      </div>
      <el-descriptions :column="1" size="small" border class="wb-bp-desc">
        <el-descriptions-item label="监控规则">
          <el-tag v-for="r in data.rules" :key="r" size="small" type="info" effect="plain" style="margin:2px">{{ r }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="监控频率">{{ data.frequency || '每日' }}</el-descriptions-item>
        <el-descriptions-item label="监控维度">
          <el-tag v-for="d in data.dimensions" :key="d" size="small" type="info" effect="plain" style="margin:2px">{{ d }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="data.created" title="监控任务已创建，持续追踪中" type="success" :closable="false" show-icon class="wb-bp-alert" />
    </template>

    <!-- 4. 尽调模板选择 / 尽调任务 -->
    <template v-else-if="tool === 'dueDiligence'">
      <div v-if="data.enterprise" class="wb-bp-ent-bar">
        <el-icon><OfficeBuilding /></el-icon><span>尽调对象：{{ data.enterprise.name }}</span>
      </div>
      <!-- 模板选择阶段 -->
      <template v-if="data.step === 'template-selection'">
        <div class="wb-bp-section-title">选择尽调模板</div>
        <div class="wb-bp-tpl-group">
          <div v-for="tpl in data.templates || []" :key="tpl.id" class="wb-bp-tpl-card" :class="{ 'wb-bp-tpl-card--selected': data.selectedTemplateId === tpl.id }" @click="emit('select-template', tpl)">
            <div class="wb-bp-tpl-card__name">{{ tpl.name }}</div>
            <div class="wb-bp-tpl-card__meta">
              <span>章节 {{ tpl.sections }} 项</span><span>·</span><span>资料 {{ tpl.requiredDocs }} 份</span><span>·</span><span>预计 {{ tpl.estimatedDays }} 天</span>
            </div>
          </div>
        </div>
      </template>
      <!-- 已创建阶段 -->
      <template v-else-if="data.step === 'task-created'">
        <el-alert :title="`尽调任务已创建 — 模板: ${data.selectedTemplate?.name || ''}`" type="success" :closable="false" show-icon class="wb-bp-alert" />
        <div v-if="data.stages" class="wb-bp-dd-stages">
          <div v-for="s in data.stages" :key="s.id" class="wb-bp-dd-stage" :class="`wb-bp-dd-stage--${s.status}`">
            <span class="wb-bp-dd-stage__icon">{{ stageStatusIcon(s.status) }}</span>
            <span class="wb-bp-dd-stage__name">{{ s.name }}</span>
          </div>
        </div>
      </template>
    </template>

    <!-- 5. 工商校验 -->
    <template v-else-if="tool === 'business'">
      <el-alert title="工商校验完成" type="success" :closable="false" show-icon class="wb-bp-alert" />
      <el-descriptions :column="1" size="small" border class="wb-bp-desc">
        <el-descriptions-item label="主体状态">{{ data.entityStatus || '—' }}</el-descriptions-item>
        <el-descriptions-item label="司法风险">{{ data.judicialRisk || '—' }}</el-descriptions-item>
        <el-descriptions-item label="关联企业">{{ data.relatedCompanies || '—' }}</el-descriptions-item>
      </el-descriptions>
    </template>

    <!-- 6. 税票采集 -->
    <template v-else-if="tool === 'tax'">
      <div class="wb-bp-ent-bar" v-if="data.customer">
        <el-icon><OfficeBuilding /></el-icon><span>{{ data.customer.name }}</span>
      </div>
      <el-descriptions :column="1" size="small" border class="wb-bp-desc">
        <el-descriptions-item label="当前状态">{{ data.status || '—' }}</el-descriptions-item>
        <el-descriptions-item label="授权状态">{{ data.authStatus || '—' }}</el-descriptions-item>
        <el-descriptions-item label="链接状态">
          <el-tag :type="data.linkStatus === '已使用' ? 'info' : data.linkStatus === '已发送' ? 'warning' : 'danger'" size="small">{{ data.linkStatus || '—' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div class="wb-bp-metrics" v-if="data.input?.count">
        <div class="wb-bp-metric"><span class="wb-bp-metric__label">进项发票</span><strong>{{ data.input.count }}/{{ data.input.total }}</strong></div>
        <div class="wb-bp-metric"><span class="wb-bp-metric__label">销项发票</span><strong>{{ data.output.count }}/{{ data.output.total }}</strong></div>
        <div class="wb-bp-metric"><span class="wb-bp-metric__label">纳税申报</span><strong>{{ data.filing?.status || '—' }}</strong></div>
      </div>
      <div class="wb-bp-autolog" v-if="data.autoLog">
        <div v-for="(log, i) in data.autoLog" :key="i" class="wb-bp-log-item">
          <time>{{ log.time }}</time>
          <span>{{ log.desc }}</span>
          <span class="wb-bp-log-status" :class="`wb-bp-log-status--${log.status}`">{{ logStatusText(log.status) }}</span>
        </div>
      </div>
    </template>

    <!-- 7. 资料包 -->
    <template v-else-if="tool === 'materials'">
      <div class="wb-bp-mat-header">
        <span>模板: {{ data.template || '标准授信尽调' }}</span>
        <el-tag size="small" type="primary">完整度 {{ data.completeness }}%</el-tag>
      </div>
      <el-progress :percentage="data.completeness || 0" :stroke-width="10" :format="() => `${data.completeness}%`" style="margin-bottom:12px" />
      <el-table :data="data.required || []" size="small" stripe>
        <el-table-column label="资料名称" min-width="100"><template #default="{ row }"><span>{{ row.name }}</span></template></el-table-column>
        <el-table-column label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="matTag(row.status)" size="small">{{ row.status }}</el-tag></template></el-table-column>
      </el-table>
    </template>

    <!-- 8. 风险诊断 -->
    <template v-else-if="tool === 'riskDiagnosis'">
      <div class="wb-bp-score-card">
        <div class="wb-bp-score-value">{{ data.score || '—' }}</div>
        <div class="wb-bp-score-label">综合评分</div>
        <div class="wb-bp-score-grade">等级 {{ data.grade || '—' }} · {{ data.riskLevel || '' }}风险</div>
      </div>
      <el-descriptions :column="1" size="small" border class="wb-bp-desc">
        <el-descriptions-item label="工商风险">{{ data.commercialRisk }}</el-descriptions-item>
        <el-descriptions-item label="税务风险">{{ data.taxRisk }}</el-descriptions-item>
        <el-descriptions-item label="经营风险">{{ data.operationRisk }}</el-descriptions-item>
        <el-descriptions-item label="资料一致性风险">{{ data.dataConsistencyRisk }}</el-descriptions-item>
      </el-descriptions>
      <el-alert :title="data.conclusion" type="warning" :closable="false" show-icon class="wb-bp-alert" />
    </template>

    <!-- 9. 产物清单 -->
    <template v-else-if="tool === 'deliverables'">
      <el-table :data="data.items || []" size="small" stripe>
        <el-table-column label="产物名称" min-width="120"><template #default="{ row }"><span>{{ row.name }}</span></template></el-table-column>
        <el-table-column label="状态" width="90" align="center"><template #default="{ row }"><el-tag :type="row.status.includes('已') || row.status.includes('归档') ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="数量" width="60" align="center"><template #default="{ row }"><span>{{ row.count }}</span></template></el-table-column>
      </el-table>
    </template>

    <!-- 10. 报告编辑器 -->
    <template v-else-if="tool === 'reportEditor'">
      <div class="wb-bp-editor">
        <div class="wb-bp-editor__header">
          <h4 class="wb-bp-editor__title">{{ data.title }}</h4>
          <el-tag size="small" type="primary">{{ data.template }}</el-tag>
        </div>
        <div class="wb-bp-editor__toc">
          <div v-for="sec in data.sections || []" :key="sec.id" class="wb-bp-toc-item">
            <span class="wb-bp-toc-no">{{ sec.no }}</span>
            <span class="wb-bp-toc-title">{{ sec.title }}</span>
            <el-tag size="small" :type="sec.status === '已完成' ? 'success' : sec.status === '待确认' ? 'warning' : 'info'">{{ sec.status }}</el-tag>
          </div>
        </div>
        <el-card shadow="never" class="wb-bp-editor__card">
          <template #header>
            <div class="wb-bp-editor__card-header">
              <span>正文编辑区</span>
              <el-tag size="small" type="info">AI 辅助</el-tag>
            </div>
          </template>
          <el-input type="textarea" :rows="18" placeholder="在此编辑报告内容，右侧 AI 助手可帮你改写、补充和校对…" />
          <div class="wb-bp-editor__actions">
            <el-button size="small" plain>保存草稿</el-button>
            <el-button size="small" type="primary">确认提交</el-button>
          </div>
        </el-card>
      </div>
    </template>

    <!-- fallback -->
    <template v-else>
      <div class="wb-bp-empty">
        <el-empty description="等待业务流程推进" :image-size="60" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({
  tool: { type: String, default: null },
  data: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['explore', 'select-template'])

const activeRiskTab = ref('commercial')

const panelTitle = computed(() => {
  const m = {
    screening: '智能筛客结果',
    exploration: '企业探查',
    monitor: '企业监控',
    dueDiligence: '尽调任务',
    business: '工商校验',
    tax: '税票采集',
    materials: '资料包清单',
    riskDiagnosis: '风险诊断',
    deliverables: '产物清单',
    reportEditor: '报告编辑',
  }
  return m[props.tool] || '等待业务内容生成'
})

const panelTag = computed(() => {
  const t = props.tool
  const d = props.data
  if (t === 'screening') return d.summary?.recommended || '0 家'
  if (t === 'exploration') return '已完成'
  if (t === 'monitor') return d.created ? '监控中' : '未启用'
  if (t === 'dueDiligence') return d.step === 'task-created' ? '已创建' : '选择模板'
  if (t === 'riskDiagnosis') return d.riskLevel ? d.riskLevel + '风险' : ''
  if (t === 'deliverables') return '已生成'
  if (t === 'reportEditor') return '编辑中'
  return ''
})

const panelTagType = computed(() => {
  const tag = panelTag.value
  if (tag === '已完成' || tag === '监控中' || tag === '已创建' || tag === '已生成') return 'success'
  if (tag?.includes('高风险') || tag?.includes('中风险')) return 'warning'
  if (tag === '编辑中') return 'primary'
  return 'info'
})

function filteredRisks(category) {
  return (props.data.risks || []).filter(r => r.category === category)
}

function riskTag(level) { return { '低': 'success', '中': 'warning', '高': 'danger' }[level] || 'info' }
function matTag(status) { return { '已收集': 'success', '缺失': 'danger', '待上传': 'warning' }[status] || 'info' }
function logStatusText(s) { return { done: '✅', waiting: '⏳', running: '🔄' }[s] || '' }
function stageStatusIcon(s) { return { done: '✓', active: '⟳', pending: '○' }[s] || '○' }

function onRowClick(row) {
  emit('explore', row)
}
</script>

<style scoped>
.wb-business-panel {
  height: auto;
  min-height: 0;
  overflow: visible;
  padding: 0;
  background: transparent;
}

.wb-business-panel__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); }
.wb-business-panel__title { margin: 0; font-size: var(--font-size-body-lg); font-weight: 600; color: var(--text-primary); }

.wb-bp-filters { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: var(--space-md); }

.wb-bp-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); margin-bottom: var(--space-md); }
.wb-bp-metric { padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-default); border-radius: var(--radius-sm); background: var(--surface-card); text-align: center; }
.wb-bp-metric__label { display: block; font-size: var(--font-size-xs); color: var(--text-secondary); }
.wb-bp-metric strong { display: block; font-size: var(--font-size-lg); color: var(--text-primary); margin-top: 2px; }

.wb-bp-table { width: 100%; }
.wb-bp-table :deep(.el-table__row) { cursor: pointer; }
.wb-bp-table :deep(.el-table__row:hover) { background: var(--surface-row-hover); }

.wb-ent-name { font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary); }
.wb-ent-industry { font-size: var(--font-size-xs); color: var(--text-secondary); }
.wb-ent-progress { font-size: var(--font-size-xs); color: var(--text-secondary); }

.wb-bp-ent-bar { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-sm) var(--space-md); background: var(--color-primary-bg); border-radius: var(--radius-sm); margin-bottom: var(--space-md); font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 600; }

.wb-bp-desc { margin-bottom: var(--space-md); }
.wb-bp-tabs { margin-bottom: var(--space-md); }
.wb-bp-alert { margin-top: var(--space-md); }

.wb-bp-section-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-sm); }

.wb-bp-tpl-group { display: flex; flex-direction: column; gap: var(--space-sm); }
.wb-bp-tpl-card { padding: var(--space-md); border: 1px solid var(--border-default); border-radius: var(--radius-md); cursor: pointer; transition: all 0.15s; }
.wb-bp-tpl-card:hover { border-color: var(--color-primary); }
.wb-bp-tpl-card--selected { border-color: var(--color-primary); background: var(--color-primary-bg); }
.wb-bp-tpl-card__name { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-xs); }
.wb-bp-tpl-card__meta { font-size: var(--font-size-xs); color: var(--text-secondary); display: flex; gap: var(--space-xs); }

/* 尽调阶段列表 */
.wb-bp-dd-stages { display: flex; flex-direction: column; gap: 2px; margin-top: var(--space-md); }
.wb-bp-dd-stage { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); font-size: var(--font-size-sm); }
.wb-bp-dd-stage--done { color: var(--color-success); background: var(--color-success-bg); }
.wb-bp-dd-stage--active { color: var(--color-primary); background: var(--color-primary-bg); }
.wb-bp-dd-stage--pending { color: var(--text-tertiary); }
.wb-bp-dd-stage__icon { width: 18px; text-align: center; font-weight: 700; }
.wb-bp-dd-stage__name { flex: 1; }

/* 税票日志 */
.wb-bp-autolog { display: grid; gap: 4px; margin-top: var(--space-md); }
.wb-bp-log-item { display: grid; grid-template-columns: 48px 1fr auto; gap: var(--space-sm); align-items: center; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); background: var(--surface-card); font-size: var(--font-size-xs); }
.wb-bp-log-item time { color: var(--text-tertiary); font-weight: 600; }
.wb-bp-log-status { font-weight: 600; }
.wb-bp-log-status--done { color: var(--color-success); }
.wb-bp-log-status--waiting { color: var(--color-warning); }

/* 资料包 */
.wb-bp-mat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); font-size: var(--font-size-sm); color: var(--text-secondary); }

/* 风险诊断 */
.wb-bp-score-card { text-align: center; padding: var(--space-lg); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); margin-bottom: var(--space-md); }
.wb-bp-score-value { font-size: 36px; font-weight: 800; color: var(--color-warning); }
.wb-bp-score-label { font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: 2px; }
.wb-bp-score-grade { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-top: 4px; }

/* 报告编辑器 */
.wb-bp-editor { display: flex; flex-direction: column; gap: var(--space-md); }
.wb-bp-editor__header { display: flex; align-items: center; justify-content: space-between; }
.wb-bp-editor__title { margin: 0; font-size: var(--font-size-lg); font-weight: 700; color: var(--text-primary); }
.wb-bp-editor__toc { display: flex; flex-direction: column; gap: 4px; }
.wb-bp-toc-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s; }
.wb-bp-toc-item:hover { background: var(--surface-card); }
.wb-bp-toc-no { font-size: var(--font-size-xs); font-weight: 700; color: var(--text-tertiary); min-width: 20px; }
.wb-bp-toc-title { flex: 1; font-size: var(--font-size-sm); color: var(--text-primary); }
.wb-bp-editor__card :deep(.el-card__header) { padding: var(--space-sm) var(--space-md); }
.wb-bp-editor__card-header { display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.wb-bp-editor__actions { display: flex; gap: var(--space-sm); margin-top: var(--space-md); justify-content: flex-end; }

.wb-bp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 200px; }
</style>
