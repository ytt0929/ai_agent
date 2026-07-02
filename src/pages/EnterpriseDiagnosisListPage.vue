<template>
  <div class="edl-page">
    <!-- 顶部标题区 -->
    <section class="edl-hero">
      <h1 class="edl-hero-title">企业探查</h1>
      <p class="edl-hero-sub">输入企业名称、税号，或直接提问。系统会识别企业、检查数据覆盖，并在对话中打开分析视图。</p>

      <!-- 主输入区 -->
      <el-card class="edl-hero-card" shadow="never">
        <div class="edl-hero-input">
          <el-input
            v-model="heroInput"
            class="edl-hero-field"
            size="large"
            placeholder="输入企业名称、税号，或直接问：税负率是多少、查看股东明细、近12个月申报记录如何…"
            @keydown.enter="handleHeroSearch"
            clearable
          />
          <el-button type="primary" size="large" @click="handleHeroSearch">
            开始探查
          </el-button>
        </div>
      </el-card>

      <!-- 五组示例问题 -->
      <div class="edl-hero-chips">
        <div v-for="group in chipGroups" :key="group.title" class="edl-chip-group">
          <span class="edl-chip-group-title">{{ group.title }}</span>
          <el-button
            v-for="chip in group.chips"
            :key="chip"
            class="edl-hero-chip"
            size="small"
            plain
            @click="onChipClick(chip)"
          >
            {{ chip }}
          </el-button>
        </div>
      </div>

      <!-- 轻量提示 -->
      <div class="edl-hero-tip">
        <span class="edl-tip-item">输入企业名/税号后自动识别</span>
        <span class="edl-tip-dot">·</span>
        <span class="edl-tip-item">缺少税票/流水时先用工商和司法数据基础探查</span>
        <span class="edl-tip-dot">·</span>
        <span class="edl-tip-item">可继续授权税票或上传流水生成更完整报告</span>
      </div>
    </section>

    <!-- 最近探查卡片 -->
    <el-card shadow="never" class="edl-recent-card">
      <!-- 工具栏 -->
      <div class="edl-toolbar">
        <h2 class="edl-toolbar-title">最近探查</h2>
        <el-segmented v-model="riskFilter" :options="riskFilterOptions" size="default" />
      </div>

      <!-- 探查记录表格 -->
      <el-table :data="filteredRows" size="small" class="edl-table" stripe>
        <el-table-column prop="name" label="企业名称" min-width="140">
          <template #default="{ row }">
            <span class="edl-cell--name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数据覆盖" width="240">
          <template #default="{ row }">
            <div class="edl-tags">
              <el-tag
                v-for="tag in row.sourceTags"
                :key="tag.label"
                :type="tag.tagType"
                size="small"
                effect="plain"
              >
                {{ tag.label }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前结论" min-width="200">
          <template #default="{ row }">
            <span class="edl-cell--conclusion" :title="row.shortConclusion">{{ row.shortConclusion }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="130">
          <template #default="{ row }">
            <span class="edl-risk-level">
              <el-tag :type="riskTagType(row.riskLevel)" size="small">
                {{ riskLabel(row.riskLevel) }}
              </el-tag>
              <el-tag :type="gradeTagType(row.grade)" size="small" class="edl-grade-tag">{{ row.grade }}</el-tag>
              <span class="edl-risk-score">{{ row.score }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最近问题" width="120">
          <template #default="{ row }">
            <span class="edl-cell--question">{{ row.lastQuestion }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近时间" width="110">
          <template #default="{ row }">
            <span class="edl-cell--time">{{ row.lastDiagnosedAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="continueExplore(row)">继续探查</el-button>
            <el-button link type="primary" size="small" @click="viewEvidence(row)">查看证据链</el-button>
            <el-button link size="small" @click="pushToDD(row)">推送尽调</el-button>
            <el-button v-if="row.needsAuth" link type="warning" size="small" @click="authData(row)">授权税票</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { enterpriseDB, getDiagnosisMock } from '../data/mockEnterpriseDiagnosis.js'
import { findEnterpriseFromText } from '../data/mockEnterpriseSourceData.js'

const router = useRouter()
const heroInput = ref('')
const riskFilter = ref('all')

const riskFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '高风险', value: 'high' },
  { label: '中风险', value: 'medium' },
  { label: '低风险', value: 'low' },
]

const chipGroups = [
  {
    title: '事实查询',
    chips: ['查看股东明细', '查看社保费明细', '查看申报信息明细', '查看法人和成立时间'],
  },
  {
    title: '指标计算',
    chips: ['计算税负率', '收入同比是多少'],
  },
  {
    title: '复杂分析',
    chips: ['这家企业经营情况如何', '是否存在欺诈风险', '近12个月收入趋势如何？', '税负率是多少？'],
  },
  {
    title: '报告生成',
    chips: ['生成工商分析报告', '生成纳税全景报告', '生成企业诊断报告'],
  },
  {
    title: '证据链',
    chips: ['查看营收增长异常的证据链', '为什么判断业务真实性存疑？'],
  },
]

const listRows = computed(() => {
  return enterpriseDB.map(ent => {
    const mock = getDiagnosisMock(ent.creditCode)
    const riskItems = mock?.riskItems || []

    const hasTax = ent.creditCode === '91130203MA7EEQ2N0T'
    const hasOps = ent.creditCode === '91130203MA7EEQ2N0T'

    const sourceTags = [
      { label: '工商', tagType: 'success' },
      { label: '司法', tagType: 'success' },
      hasTax ? { label: '税票', tagType: 'success' } : { label: '税票未授权', tagType: 'danger' },
      hasOps ? { label: '经营', tagType: 'success' } : { label: '流水缺失', tagType: 'warning' },
    ]

    const firstHigh = riskItems.find(i => i.level === 'high')
    let shortConclusion = '数据正常，无显著风险'
    if (firstHigh) shortConclusion = firstHigh.name + '，' + firstHigh.fact

    return {
      creditCode: ent.creditCode,
      name: ent.name,
      score: mock?.score || '—',
      grade: mock?.grade || '—',
      riskLevel: mock?.riskLevel || 'low',
      shortConclusion,
      lastDiagnosedAt: '2026-06-25',
      lastQuestion: mock?.summary ? '综合风险评估' : '—',
      firstIndicator: firstHigh || riskItems[0],
      sourceTags,
      needsAuth: !hasTax,
    }
  })
})

const filteredRows = computed(() => {
  let rows = listRows.value
  if (riskFilter.value !== 'all') {
    rows = rows.filter(r => r.riskLevel === riskFilter.value)
  }
  return rows
})

function riskTagType(level) {
  return { high: 'danger', medium: 'warning', low: 'success' }[level] || 'info'
}

function riskLabel(level) {
  return { high: '高风险', medium: '中风险', low: '低风险' }[level] || level
}

function gradeTagType(grade) {
  if (['D', 'E', 'F'].includes(grade)) return 'danger'
  if (grade === 'C') return 'warning'
  return 'success'
}

function handleHeroSearch() {
  const text = heroInput.value.trim()
  if (!text) {
    ElMessage.warning('请输入企业名称、税号或问题')
    return
  }
  const found = findEnterpriseFromText(text)
  if (found && found.creditCode) {
    router.push('/enterprise-diagnosis/workspace/' + found.creditCode + '?q=' + encodeURIComponent(text))
  } else {
    router.push('/enterprise-diagnosis/workspace/_new?q=' + encodeURIComponent(text))
  }
}

function onChipClick(chip) {
  heroInput.value = chip
  router.push('/enterprise-diagnosis/workspace/_new?q=' + encodeURIComponent(chip))
}

function continueExplore(row) {
  router.push(`/enterprise-diagnosis/workspace/${row.creditCode}`)
}

function viewEvidence(row) {
  if (row.firstIndicator) {
    router.push(`/enterprise-diagnosis/evidence/${row.creditCode}/${row.firstIndicator.id}`)
  } else {
    router.push(`/enterprise-diagnosis/report/${row.creditCode}`)
  }
}

function pushToDD(row) {
  ElMessage.info('Demo: 已将探查结果推送至尽调任务')
}

function authData(row) {
  ElMessage.info('Demo: 已发起税票授权请求')
}
</script>

<style scoped>
.edl-page {
  padding: var(--space-2xl) var(--space-4xl);
  max-width: var(--layout-page-data);
  margin: 0 auto;
  background: var(--surface-page);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== Hero ===== */
.edl-hero {
  margin-bottom: var(--space-2xl);
}

.edl-hero-title {
  font-size: var(--font-size-workbench-title);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs);
}

.edl-hero-sub {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-lg);
}

/* 主输入区 — 卡片容器 */
.edl-hero-card {
  background: var(--surface-card);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-xl);
  margin-bottom: var(--space-lg);
  max-width: var(--layout-page-data);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--duration-slower) var(--ease-out), box-shadow var(--duration-slower) var(--ease-out);
}

.edl-hero-card:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-primary);
}

.edl-hero-input {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.edl-hero-input .edl-hero-field {
  flex: 1;
}

.edl-hero-input .edl-hero-field :deep(.el-input__wrapper) {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.edl-hero-input .edl-hero-field :deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  height: var(--space-2xl);
}

.edl-hero-input .edl-hero-field :deep(.el-input__inner::placeholder) {
  color: var(--text-disabled);
}

.edl-hero-input .el-button {
  flex-shrink: 0;
  border-radius: var(--radius-md);
  padding: 0 var(--space-xl);
  font-weight: var(--font-weight-semibold);
}

/* 示例问题 */
.edl-hero-chips {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  max-width: var(--layout-page-narrow);
}

.edl-chip-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.edl-chip-group-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  white-space: nowrap;
  min-width: 56px;
}

.edl-hero-chip {
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  height: 32px;
  padding: 0 var(--space-lg);
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
}

.edl-hero-chip :deep(span) {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
}

.edl-hero-chip:hover,
.edl-hero-chip:focus {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
}

/* 轻量提示条 */
.edl-hero-tip {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  flex-wrap: wrap;
}

.edl-tip-dot {
  color: var(--border-default);
}

/* ===== 最近探查卡片 ===== */
.edl-recent-card {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.edl-recent-card :deep(.el-card__body) {
  padding: var(--space-lg) var(--space-xl);
}

/* ===== 工具栏 ===== */
.edl-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.edl-toolbar-title {
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.edl-toolbar :deep(.el-segmented) {
  --el-segmented-item-selected-color: var(--color-primary);
}

/* ===== 表格 ===== */
.edl-table {
  width: 100%;
}

.edl-table :deep(.el-table__header-wrapper) {
  border-radius: var(--radius-sm);
}

.edl-table :deep(.el-table__header th) {
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.edl-table :deep(.el-table__row) {
  height: 48px;
}

.edl-cell--name {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.edl-cell--conclusion {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edl-cell--question {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.edl-cell--time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.edl-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.edl-tags :deep(.el-tag) {
  font-size: var(--font-size-xs);
}

.edl-risk-level {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.edl-grade-tag {
  font-weight: var(--font-weight-semibold);
  min-width: 32px;
  text-align: center;
}

.edl-risk-score {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* 响应式 */
@media (max-width: 1200px) {
  .edl-page {
    padding: var(--space-lg);
  }
  .edl-hero {
    margin-bottom: var(--space-lg);
  }
  .edl-toolbar {
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }
}
</style>
