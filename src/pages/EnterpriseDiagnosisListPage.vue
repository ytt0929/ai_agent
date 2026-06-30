<template>
  <div class="edl-page">
    <!-- AI 企业探查入口 -->
    <section class="edl-hero">
      <h1 class="edl-hero-title">AI 企业探查</h1>
      <p class="edl-hero-sub">输入企业名称、税号，或直接提问。系统会根据问题类型，在对话中回答或打开结构化分析视图。</p>
      <div class="edl-hero-input">
        <input v-model="heroInput" class="edl-hero-field" placeholder="输入企业名称、税号，或直接问：税负率是多少、查看股东明细、近12个月申报记录如何、是否存在欺诈风险…"
               @keydown.enter="handleHeroSearch" />
        <el-button type="primary" size="large" @click="handleHeroSearch">开始探查</el-button>
      </div>
      <div class="edl-hero-chips">
        <div class="edl-chip-group" v-for="group in chipGroups" :key="group.title">
          <span class="edl-chip-group-title">{{ group.title }}</span>
          <span class="edl-hero-chip" v-for="chip in group.chips" :key="chip" @click="onChipClick(chip)">{{ chip }}</span>
        </div>
      </div>

      <div class="edl-start-guide">
        <h3 class="edl-start-guide-title">你可以这样开始</h3>
        <ul class="edl-start-guide-list">
          <li><strong>输入企业名或税号：</strong>系统先识别企业，再检查工商、司法、税票、流水等数据覆盖。</li>
          <li><strong>直接输入问题：</strong>系统会根据问题进入经营分析、税票明细、风险诊断、欺诈识别或证据链视图。</li>
          <li><strong>从已有记录继续：</strong>可继续追问指标、证据链、风险原因，或推送尽调。</li>
          <li><strong>数据不足不会中断探查：</strong>缺税票时先做工商司法基础探查，缺流水时提示上传补充材料。</li>
        </ul>
      </div>

      <p class="edl-hero-hint">可直接输入企业名称、税号，也可以直接提问：税负率是多少、查看股东明细、近12个月申报记录如何、是否存在欺诈风险。</p>

      <p class="edl-hero-notice">若企业缺少税票或流水数据，系统会先基于工商、司法及公开信息完成基础探查；如需判断经营真实性、税负异常、疑似欺诈和资金流闭环，可授权税票或上传补充数据。</p>
    </section>

    <!-- 列表工具栏 -->
    <div class="edl-toolbar">
      <div class="edl-toolbar__left">
        <h2 class="edl-toolbar-title">探查记录</h2>
      </div>
      <div class="edl-toolbar__right">
        <div class="edl-filters">
          <button class="edl-filter-chip" :class="{ active: riskFilter === 'all' }" @click="riskFilter = 'all'">全部</button>
          <button class="edl-filter-chip" :class="{ active: riskFilter === 'high' }" @click="riskFilter = 'high'">高风险</button>
          <button class="edl-filter-chip" :class="{ active: riskFilter === 'medium' }" @click="riskFilter = 'medium'">中风险</button>
          <button class="edl-filter-chip" :class="{ active: riskFilter === 'low' }" @click="riskFilter = 'low'">低风险</button>
        </div>
      </div>
    </div>

    <p class="edl-dd-note">企业探查结果可作为智能尽调中的风险识别输入，支持推送风险指标、欺诈信号和证据链到尽调任务。</p>

    <!-- 探查记录列表 -->
    <div class="edl-table-wrap">
      <table class="edl-table">
        <thead>
          <tr>
            <th>企业名称</th>
            <th>行业</th>
            <th>探查类型</th>
            <th>数据来源</th>
            <th>数据完整度</th>
            <th>综合评分</th>
            <th>评级</th>
            <th>风险事项</th>
            <th>高风险</th>
            <th>最近探查问题</th>
            <th>下一步</th>
            <th>最近探查时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.creditCode">
            <td class="edl-cell--name">{{ row.name }}</td>
            <td>{{ row.industry }}</td>
            <td>
              <span class="edl-type" :class="'edl-type--' + row.exploreType">{{ row.exploreTypeLabel }}</span>
            </td>
            <td>
              <div class="edl-tags">
                <span v-for="tag in row.sourceTags" :key="tag.label"
                      class="edl-tag" :class="'edl-tag--' + tag.variant">{{ tag.label }}</span>
              </div>
            </td>
            <td>
              <span class="edl-completeness" :class="'edl-completeness--' + row.completenessKey">{{ row.completenessLabel }}</span>
            </td>
            <td class="edl-cell--score">
              <span :class="'edl-score--' + row.riskLevel">{{ row.score }}</span>
            </td>
            <td>
              <span class="edl-grade" :class="'edl-grade--' + gradeColor(row.grade)">{{ row.grade }}</span>
            </td>
            <td>{{ row.riskCount }}</td>
            <td>{{ row.highRiskCount }}</td>
            <td class="edl-cell--question">{{ row.lastQuestion }}</td>
            <td><span class="edl-next-step">{{ row.nextStep }}</span></td>
            <td>{{ row.lastDiagnosedAt }}</td>
            <td>
              <span class="edl-status" :class="'edl-status--' + row.riskLevel">
                {{ row.riskLevel === 'high' ? '高风险' : row.riskLevel === 'medium' ? '中风险' : '低风险' }}
              </span>
            </td>
            <td class="edl-cell--actions">
              <el-button size="small" text type="primary" @click="continueExplore(row)">继续探查</el-button>
              <el-button size="small" text type="primary" @click="viewEvidence(row)">查看证据链</el-button>
              <el-button size="small" text @click="pushToDD(row)">推送尽调</el-button>
              <el-button v-if="row.needsAuth" size="small" text type="warning" @click="authData(row)">授权税票</el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
    const highRiskCount = riskItems.filter(i => i.level === 'high').length

    const hasTax = ent.creditCode === '91130203MA7EEQ2N0T'
    const hasOps = ent.creditCode === '91130203MA7EEQ2N0T'
    const hasDD = false
    const hasMonitor = true

    // 数据来源标签（含缺失项）
    const sourceTags = [
      { label: '工商', variant: 'ok' },
      { label: '司法', variant: 'ok' },
      hasTax ? { label: '税票', variant: 'ok' } : { label: '税票未授权', variant: 'missing' },
      hasOps ? { label: '经营', variant: 'ok' } : { label: '流水缺失', variant: 'missing' },
      hasDD ? { label: '尽调', variant: 'ok' } : { label: '尽调缺失', variant: 'missing' },
      hasMonitor ? { label: '监测', variant: 'ok' } : { label: '监测缺失', variant: 'missing' },
    ]

    let exploreType, exploreTypeLabel, completenessKey, completenessLabel
    if (hasTax && hasOps) {
      exploreType = 'full'; exploreTypeLabel = '综合探查'
      completenessKey = 'full'; completenessLabel = '数据完整'
    } else if (hasTax || hasOps) {
      exploreType = 'basic'; exploreTypeLabel = '基础探查'
      completenessKey = 'partial'; completenessLabel = hasTax ? '缺经营' : '缺税票'
    } else {
      exploreType = 'basic'; exploreTypeLabel = '基础探查'
      completenessKey = 'minimal'; completenessLabel = '仅工商司法'
    }

    return {
      creditCode: ent.creditCode,
      name: ent.name,
      industry: ent.industry,
      score: mock?.score || '—',
      grade: mock?.grade || '—',
      riskLevel: mock?.riskLevel || 'low',
      riskCount: riskItems.length,
      highRiskCount,
      lastDiagnosedAt: '2026-06-25',
      lastQuestion: mock?.summary ? '综合风险评估' : '—',
      nextStep: mock?.riskLevel === 'high' ? '查看证据链' : '继续探查',
      firstIndicator: riskItems.find(i => i.level === 'high') || riskItems[0],
      sourceTags,
      exploreType,
      exploreTypeLabel,
      completenessKey,
      completenessLabel,
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

function gradeColor(grade) {
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
    // 没有识别到企业身份，进入 _new 状态
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

function viewReport(row) {
  router.push(`/enterprise-diagnosis/report/${row.creditCode}`)
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
.edl-page { padding: var(--space-xl) var(--space-3xl); max-width: 1280px; margin: 0 auto; }

/* ===== AI 企业探查 Hero ===== */
.edl-hero { margin-bottom: var(--space-xl); }
.edl-hero-title { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
.edl-hero-sub { font-size: var(--font-size-body); color: var(--text-tertiary); margin: 0 0 var(--space-lg); }

.edl-hero-input { display: flex; gap: 8px; margin-bottom: var(--space-md); }
.edl-hero-field { flex: 1; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 12px 16px; font-size: var(--font-size-body); outline: none; background: var(--bg-card); }
.edl-hero-field:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08); }

.edl-hero-chips { display: flex; flex-direction: column; gap: 10px; margin-bottom: var(--space-md); }
.edl-chip-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.edl-chip-group-title { font-size: var(--font-size-xs); font-weight: 600; color: var(--text-tertiary); white-space: nowrap; min-width: 64px; }
.edl-hero-chip { display: inline-block; padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--font-size-xs); color: var(--color-primary); background: var(--color-primary-bg); cursor: pointer; transition: all .15s; border: 1px solid transparent; }
.edl-hero-chip:hover { border-color: var(--color-primary); background: #fff; }

.edl-hero-hint { font-size: var(--font-size-xs); color: var(--text-secondary); margin: var(--space-sm) 0 var(--space-md); padding: 8px 14px; background: var(--bg-subtle, #f8fafc); border-radius: var(--radius-md); line-height: 1.6; }
.edl-hero-notice { font-size: var(--font-size-xs); color: var(--text-tertiary); margin: 0; line-height: 1.5; }

/* 开始引导 */
.edl-start-guide { margin-bottom: var(--space-md); padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.edl-start-guide-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: 0 0 6px; }
.edl-start-guide-list { margin: 0; padding-left: 18px; font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.7; }
.edl-start-guide-list li { margin-bottom: 2px; }

/* ===== 工具栏 ===== */
.edl-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); }
.edl-toolbar-title { font-size: var(--font-size-body-lg); font-weight: 600; color: var(--text-primary); margin: 0; }

.edl-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.edl-filter-chip { border: 1px solid var(--border-default); background: #fff; border-radius: var(--radius-full); padding: 4px 14px; cursor: pointer; font-size: var(--font-size-xs); color: var(--text-secondary); transition: all .15s; }
.edl-filter-chip:hover, .edl-filter-chip.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }

.edl-dd-note { font-size: var(--font-size-xs); color: var(--text-tertiary); margin: 0 0 var(--space-md); line-height: 1.5; }

/* ===== 表格 ===== */
.edl-table-wrap { border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow: auto; background: var(--surface-card); }
.edl-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.edl-table thead { position: sticky; top: 0; z-index: 1; background: var(--bg-table-header); }
.edl-table th { padding: 10px 12px; text-align: left; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border-default); white-space: nowrap; }
.edl-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-divider); vertical-align: middle; }
.edl-table tbody tr:hover { background: rgba(37, 99, 235, 0.03); }
.edl-table tbody tr:last-child td { border-bottom: none; }

.edl-cell--name { font-weight: 600; color: var(--text-primary); white-space: nowrap; }
.edl-cell--score .edl-score--high { color: var(--color-danger); font-weight: 700; }
.edl-cell--score .edl-score--medium { color: var(--color-warning); font-weight: 700; }
.edl-cell--score .edl-score--low { color: var(--color-success); font-weight: 700; }
.edl-cell--actions { white-space: nowrap; }

.edl-grade { display: inline-block; padding: 1px 8px; border-radius: var(--radius-sm); font-weight: 600; font-size: var(--font-size-xs); }
.edl-grade--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.edl-grade--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.edl-grade--success { background: var(--color-success-bg); color: var(--color-success); }

.edl-status { font-size: var(--font-size-xs); font-weight: 500; }
.edl-status--high { color: var(--color-danger); }
.edl-status--medium { color: var(--color-warning); }
.edl-status--low { color: var(--color-success); }

/* 探查类型 */
.edl-type { font-size: var(--font-size-xs); font-weight: 500; }
.edl-type--full { color: var(--color-primary); }
.edl-type--basic { color: var(--text-secondary); }

/* 数据来源标签 */
.edl-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.edl-tag { display: inline-block; padding: 1px 6px; border-radius: var(--radius-sm); font-size: 10px; line-height: 1.4; }
.edl-tag--ok { background: #f1f5f9; color: var(--text-secondary); }
.edl-tag--missing { background: #fef3c7; color: #b45309; }

/* 数据完整度 */
.edl-completeness { font-size: var(--font-size-xs); font-weight: 500; }
.edl-completeness--full { color: var(--color-success); }
.edl-completeness--partial { color: var(--color-warning); }
.edl-completeness--minimal { color: var(--text-tertiary); }

.edl-cell--question { font-size: var(--font-size-xs); color: var(--text-secondary); max-width: 160px; }
.edl-next-step { font-size: var(--font-size-xs); color: var(--color-primary); font-weight: 500; }

@media (max-width: 1200px) {
  .edl-page { padding: var(--space-lg); }
  .edl-hero { margin-bottom: var(--space-lg); }
  .edl-toolbar { flex-direction: column; gap: var(--space-sm); align-items: flex-start; }
  .edl-table { font-size: var(--font-size-xs); }
}
</style>
