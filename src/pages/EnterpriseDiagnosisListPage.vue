<template>
  <div class="edl-page">
    <!-- 顶部标题区 -->
    <section class="edl-hero">
      <h1 class="edl-hero-title">AI 企业探查</h1>
      <p class="edl-hero-sub">输入企业名称、税号，或直接提问。系统会识别企业、检查数据覆盖，并在对话中打开分析视图。</p>

      <!-- 主输入区 -->
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

    <!-- 列表工具栏 -->
    <div class="edl-toolbar">
      <div class="edl-toolbar__left">
        <h2 class="edl-toolbar-title">最近探查</h2>
      </div>
      <div class="edl-toolbar__right">
        <div class="edl-filters">
          <el-button-group>
            <el-button size="small" :type="riskFilter === 'all' ? 'primary' : ''" plain @click="riskFilter = 'all'">全部</el-button>
            <el-button size="small" :type="riskFilter === 'high' ? 'danger' : ''" plain @click="riskFilter = 'high'">高风险</el-button>
            <el-button size="small" :type="riskFilter === 'medium' ? 'warning' : ''" plain @click="riskFilter = 'medium'">中风险</el-button>
            <el-button size="small" :type="riskFilter === 'low' ? 'success' : ''" plain @click="riskFilter = 'low'">低风险</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 探查记录表格 -->
    <el-table :data="filteredRows" size="small" class="edl-table" stripe>
      <el-table-column label="企业名称" min-width="140">
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
              :type="tag.variant === 'ok' ? 'info' : 'warning'"
              size="small"
              effect="plain"
            >
              {{ tag.label }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="当前结论" min-width="180">
        <template #default="{ row }">
          <span class="edl-cell--conclusion">{{ row.shortConclusion }}</span>
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
      <el-table-column label="最近时间" width="100">
        <template #default="{ row }">
          <span class="edl-cell--time">{{ row.lastDiagnosedAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click="continueExplore(row)">继续探查</el-button>
          <el-button size="small" text type="primary" @click="viewEvidence(row)">查看证据链</el-button>
          <el-button size="small" text @click="pushToDD(row)">推送尽调</el-button>
          <el-button v-if="row.needsAuth" size="small" text type="warning" @click="authData(row)">授权税票</el-button>
        </template>
      </el-table-column>
    </el-table>
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
      { label: '工商', variant: 'ok' },
      { label: '司法', variant: 'ok' },
      hasTax ? { label: '税票', variant: 'ok' } : { label: '税票未授权', variant: 'missing' },
      hasOps ? { label: '经营', variant: 'ok' } : { label: '流水缺失', variant: 'missing' },
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
  padding: var(--space-2xl) 32px;
  max-width: 1280px;
  margin: 0 auto;
  background: var(--surface-page);
  min-height: 100vh;
}

/* ===== Hero ===== */
.edl-hero {
  margin-bottom: var(--space-2xl);
}

.edl-hero-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-xs);
}

.edl-hero-sub {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-lg);
}

/* 主输入区 */
.edl-hero-input {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: var(--surface-card);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-xl);
  margin-bottom: var(--space-lg);
  max-width: 860px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.edl-hero-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.06);
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
  line-height: 1.6;
  height: 32px;
}

.edl-hero-input .edl-hero-field :deep(.el-input__inner::placeholder) {
  color: var(--text-disabled);
}

.edl-hero-input .el-button {
  flex-shrink: 0;
  height: 48px;
  border-radius: var(--radius-md);
  padding: 0 var(--space-xl);
  font-weight: 600;
}

/* 示例问题 */
.edl-hero-chips {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  max-width: 860px;
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
  font-size: var(--font-size-sm);
  height: 32px;
  padding: 0 var(--space-lg);
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-color: var(--border-default);
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

/* ===== 工具栏 ===== */
.edl-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.edl-toolbar__left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.edl-toolbar-title {
  font-size: var(--font-size-body-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* ===== 表格 ===== */
.edl-table {
  width: 100%;
}

.edl-table :deep(.el-table__header th) {
  font-weight: 600;
  color: var(--text-secondary);
}

.edl-table :deep(.el-table__row) {
  height: 44px;
}

.edl-cell--name {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.edl-cell--conclusion {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  max-width: 240px;
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
}

.edl-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.edl-risk-level {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.edl-grade-tag {
  font-weight: 600;
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
