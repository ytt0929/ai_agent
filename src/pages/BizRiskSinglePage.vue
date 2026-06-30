<template>
  <div class="br-page">
    <div class="br-header">
      <div>
        <h1 class="br-title">工商风险查询</h1>
        <p class="br-subtitle">查询企业工商风险，快速判断是否值得做</p>
      </div>
      <div class="br-header-actions">
        <el-button size="small" :class="['br-mode-btn', { active: true }]">单户查询</el-button>
        <el-button size="small" class="br-mode-btn" @click="goBatch">批量扫描</el-button>
      </div>
    </div>

    <!-- ═══ 输入区 ═══ -->
    <div v-if="!store.riskProfile && !store.isLoading" class="br-input-section">
      <div class="br-search-row" :class="{ focused: inputFocused }">
        <el-icon class="br-search-icon"><Search /></el-icon>
        <input v-model="searchInput" class="br-search-input" :placeholder="placeholderText"
               @keydown.enter="doQuery" @focus="inputFocused=true" @blur="inputFocused=false" />
        <el-button type="primary" class="br-search-btn" :loading="store.isLoading"
                   :disabled="!searchInput.trim()" @click="doQuery">查询</el-button>
      </div>
      <div class="br-chips-row">
        <span class="br-chips-label">场景：</span>
        <div v-for="t in templates" :key="t.id" class="br-chip"
             :class="{ active: store.selectedTemplate === t.id }"
             @click="store.setTemplate(t.id)">
          {{ t.name }}
        </div>
        <span class="br-chips-sep">·</span>
        <span class="br-chips-label">快捷：</span>
        <div v-for="q in currentQuickIntents" :key="q" class="br-chip br-chip--quick"
             @click="searchInput = q; doQuery()">{{ q }}</div>
      </div>
    </div>

    <!-- ═══ Loading ═══ -->
    <div v-if="store.isLoading" class="br-loading">
      <div class="br-loading-spinner"></div>
      <div class="br-loading-text">正在扫描工商数据并生成风险画像...</div>
    </div>

    <!-- ═══ 结果区 ═══ -->
    <template v-if="store.riskProfile && !store.isLoading">
      <!-- 企业概览 + AI 摘要 -->
      <div class="br-result-header">
        <div class="br-ent-info">
          <h2 class="br-ent-name">{{ store.riskProfile.enterprise.name }}</h2>
          <div class="br-ent-meta">
            <span>税号：{{ store.riskProfile.enterprise.creditCode }}</span>
            <span class="br-meta-dot">·</span>
            <span>注册资本：{{ store.riskProfile.enterprise.registeredCapital }}</span>
            <span class="br-meta-dot">·</span>
            <span>成立日期：{{ store.riskProfile.enterprise.establishDate }}</span>
          </div>
        </div>
        <div class="br-risk-level" :class="riskLevelClass">
          {{ store.riskLevelBadge.text }}
        </div>
      </div>

      <div class="br-ai-summary">
        <div class="br-ai-summary__header">
          <el-icon :size="16" class="br-ai-summary__icon"><ChatDotRound /></el-icon>
          <span class="br-ai-summary__title">AI 风险摘要</span>
        </div>
        <p class="br-ai-summary__text">{{ store.riskProfile.riskSummary }}</p>
        <div class="br-risk-counts">
          <span v-if="store.riskStats.verify" class="br-risk-count br-risk-count--danger">{{ store.riskStats.verify }}项需核实</span>
          <span v-if="store.riskStats.attention" class="br-risk-count br-risk-count--warning">{{ store.riskStats.attention }}项关注</span>
          <span class="br-risk-count br-risk-count--success">{{ store.riskStats.normal }}项正常</span>
        </div>
      </div>

      <!-- 风险依据 -->
      <div class="br-evidence">
        <!-- 需核实 -->
        <div v-if="verifyItems.length" class="br-risk-group">
          <div class="br-risk-group__header br-risk-group__header--danger">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span>需核实（{{ verifyItems.length }}项）</span>
          </div>
          <div v-for="item in verifyItems" :key="item.id" class="br-risk-item" :class="{ verified: item.status !== '待核实' }">
            <div class="br-risk-item__severity-bar br-risk-item__severity-bar--danger" />
            <div class="br-risk-item__content">
              <div class="br-risk-item__header">
                <span class="br-risk-item__type">{{ item.type }}</span>
                <span class="br-status-tag" :class="item.status === '待核实' ? 'br-status-tag--danger' : 'br-status-tag--success'">{{ item.status }}</span>
              </div>
              <div class="br-risk-item__fact">{{ item.fact }}</div>
              <div class="br-risk-item__suggestion">{{ item.suggestion }}</div>

              <!-- 展开详情 -->
              <div v-if="item._expanded && item.detail" class="br-risk-detail">
                <div v-if="item.detail.relations" class="br-relation-list">
                  <div v-for="(rel, i) in item.detail.relations" :key="i" class="br-relation" :class="{ abnormal: rel.status === '经营异常' }">
                    <span class="br-relation__role">{{ rel.role }}</span>
                    <span class="br-relation__name">{{ rel.name }}</span>
                    <span class="br-status-tag" :class="rel.status === '经营异常' ? 'br-status-tag--danger' : 'br-status-tag--success'">{{ rel.status }}</span>
                    <span v-if="rel.reason" class="br-relation__reason">{{ rel.reason }}</span>
                  </div>
                </div>
                <table v-if="item.detail.executions" class="br-detail-table">
                  <thead><tr><th>执行法院</th><th>案号</th><th>金额</th><th>状态</th></tr></thead>
                  <tbody><tr v-for="(ex, i) in item.detail.executions" :key="i">
                    <td>{{ ex.court }}</td><td>{{ ex.caseNo }}</td>
                    <td class="br-amount-danger">{{ ex.amount }}</td>
                    <td><span class="br-status-tag br-status-tag--danger">{{ ex.status }}</span></td>
                  </tr></tbody>
                </table>
                <div v-if="item.detail.changes" class="br-change-timeline">
                  <div v-for="(ch, i) in item.detail.changes" :key="i" class="br-timeline-item">
                    <div class="br-timeline__dot"></div>
                    <div class="br-timeline__content">
                      <div class="br-timeline__date">{{ ch.date }}</div>
                      <div class="br-timeline__type">{{ ch.type }}：{{ ch.from }} → {{ ch.to }}</div>
                    </div>
                  </div>
                </div>
                <table v-if="item.detail.pledges" class="br-detail-table">
                  <thead><tr><th>日期</th><th>出质人</th><th>质权人</th><th>金额</th><th>状态</th></tr></thead>
                  <tbody><tr v-for="(pl, i) in item.detail.pledges" :key="i">
                    <td>{{ pl.date }}</td><td>{{ pl.pledgor }}</td><td>{{ pl.pledgee }}</td>
                    <td>{{ pl.amount }}</td>
                    <td><span class="br-status-tag br-status-tag--warning">{{ pl.status }}</span></td>
                  </tr></tbody>
                </table>
              </div>

              <div v-if="item.status === '待核实'" class="br-risk-item__actions">
                <el-button size="small" @click="item._expanded = !item._expanded">{{ item._expanded ? '收起' : '展开详情' }}</el-button>
                <el-button size="small" type="success" plain @click="store.markVerified(item.id, '')">标记已核实</el-button>
                <el-button size="small" type="primary" plain @click="store.addToDueDiligence(item.id)">加入尽调</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 关注项 -->
        <div v-if="attentionItems.length" class="br-risk-group">
          <div class="br-risk-group__header br-risk-group__header--warning">
            <el-icon :size="14"><Warning /></el-icon>
            <span>关注项（{{ attentionItems.length }}项）</span>
          </div>
          <div v-for="item in attentionItems" :key="item.id" class="br-risk-item" :class="{ verified: item.status !== '待核实' }">
            <div class="br-risk-item__severity-bar br-risk-item__severity-bar--warning" />
            <div class="br-risk-item__content">
              <div class="br-risk-item__header">
                <span class="br-risk-item__type">{{ item.type }}</span>
                <span class="br-status-tag" :class="item.status === '待核实' ? 'br-status-tag--danger' : 'br-status-tag--success'">{{ item.status }}</span>
              </div>
              <div class="br-risk-item__fact">{{ item.fact }}</div>
              <div class="br-risk-item__suggestion">{{ item.suggestion }}</div>
              <div v-if="item.status === '待核实'" class="br-risk-item__actions">
                <el-button size="small" type="success" plain @click="store.markVerified(item.id, '')">标记已核实</el-button>
                <el-button size="small" type="primary" plain @click="store.addToDueDiligence(item.id)">加入尽调</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 正常项 -->
        <div class="br-risk-group br-risk-group--normal">
          <div class="br-risk-group__header br-risk-group__header--normal" @click="normalExpanded = !normalExpanded">
            <el-icon :size="14"><CircleCheck /></el-icon>
            <span>正常项（{{ store.riskProfile.normalItems.length }}项）</span>
            <span class="br-expand-hint">{{ normalExpanded ? '收起' : '展开' }}</span>
          </div>
          <div v-if="normalExpanded" class="br-normal-list">
            <div v-for="(n, i) in store.riskProfile.normalItems" :key="i" class="br-normal-item">
              <el-icon :size="14" color="var(--color-success)"><CircleCheck /></el-icon>
              <span>{{ n }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="br-action-bar">
        <span class="br-action-bar__label">操作：</span>
        <el-button size="small" type="primary" @click="doAction('dueDiligence')">推送至尽调</el-button>
        <el-button size="small" @click="doAction('report')">生成报告</el-button>
        <el-button size="small" @click="doAction('monitor')">订阅监控</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, ChatDotRound, CircleCheck, WarningFilled, Warning
} from '@element-plus/icons-vue'
import { useBizRiskStore } from '../stores/bizRisk.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useBizRiskStore()

const searchInput = computed({
  get: () => store.queryText || '',
  set: (v) => { store.queryText = v }
})
const inputFocused = ref(false)
const normalExpanded = ref(false)

const templates = [
  { id: 'pre-loan', name: '贷前初筛' },
  { id: 'post-loan', name: '贷后巡检' },
  { id: 'annual', name: '年审排查' },
  { id: 'custom', name: '自定义' },
]

const placeholders = {
  'pre-loan': '输入企业名称或税号，快速判断是否值得做',
  'post-loan': '输入企业，查看最近有什么变化',
  'annual': '输入企业，生成年度工商风险全景',
  'custom': '输入企业名称或税号，用自然语言查询...',
}
const quickMap = {
  'pre-loan': ['风险扫描', '关联穿透', '执行/诉讼', '股权穿透'],
  'post-loan': ['变更对比', '新增风险', '恶化分析'],
  'annual': ['全景扫描', '关联穿透', '股权穿透', '变更对比', '执行/诉讼'],
  'custom': ['风险扫描', '关联穿透', '变更对比', '执行/诉讼'],
}

const placeholderText = computed(() => placeholders[store.selectedTemplate] || placeholders.custom)
const currentQuickIntents = computed(() => quickMap[store.selectedTemplate] || [])
const verifyItems = computed(() => store.riskProfile?.riskItems.filter(r => r.level === '需核实') || [])
const attentionItems = computed(() => store.riskProfile?.riskItems.filter(r => r.level === '关注') || [])

const riskLevelClass = computed(() => {
  const map = { '正常级': 'br-risk-level--success', '关注级': 'br-risk-level--warning', '高风险': 'br-risk-level--danger' }
  return map[store.riskProfile?.riskLevel] || ''
})

function goBatch() { store.setMode('batch') }

async function doQuery() {
  const text = (store.queryText || '杭州智造装备').trim()
  if (!text || store.isLoading) return
  await store.queryEnterprise(text)
}

function doAction(a) {
  if (a === 'report') ElMessage.success('风险报告生成中...')
  else if (a === 'dueDiligence') {
    if (!store.pendingItems.length) { ElMessage.warning('没有待核实的风险项'); return }
    ElMessage.success(`已将 ${store.pendingItems.length} 项风险推送到智能尽调`)
    router.push('/due-diligence')
  }
  else if (a === 'monitor') ElMessage.success('已订阅风险监控')
}
</script>

<style scoped>
.br-page { padding: var(--space-2xl) 32px; max-width: 1000px; margin: 0 auto; }

/* ── Header ── */
.br-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2xl); }
.br-title { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.br-subtitle { font-size: var(--font-size-body); color: var(--text-tertiary); margin: 0; }
.br-header-actions { display: flex; gap: var(--space-sm); }
.br-mode-btn { font-size: var(--font-size-sm); border: 1px solid var(--border-default); background: var(--surface-card); color: var(--text-secondary); }
.br-mode-btn.active { background: var(--color-primary-bg); border-color: var(--color-primary); color: var(--color-primary); font-weight: 500; }

/* ── Input ── */
.br-input-section { margin-bottom: var(--space-xl); }
.br-search-row { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) 16px; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: var(--space-md); }
.br-search-row.focused { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.06); }
.br-search-icon { font-size: var(--font-size-assist); color: var(--text-tertiary); flex-shrink: 0; }
.br-search-input { flex: 1; border: none; outline: none; font-size: var(--font-size-lg); color: var(--text-primary); font-family: inherit; background: transparent; }
.br-search-input::placeholder { color: var(--text-disabled); }
.br-search-btn { flex-shrink: 0; }
.br-chips-row { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.br-chips-label { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.br-chip { padding: 3px 12px; background: var(--surface-page); border: 1px solid var(--border-light); border-radius: var(--radius-full); font-size: var(--font-size-xs); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; }
.br-chip.active { background: var(--color-primary-bg); border-color: var(--color-primary); color: var(--color-primary); font-weight: 500; }
.br-chip:hover:not(.active) { background: var(--color-primary-bg); }
.br-chip--quick { border-color: var(--border-default); }
.br-chips-sep { color: var(--text-disabled); font-size: var(--font-size-xs); }

/* ── Loading ── */
.br-loading { text-align: center; padding: 40px 0; }
.br-loading-spinner { width: 32px; height: 32px; border: 3px solid var(--border-light); border-top-color: var(--color-primary); border-radius: 50%; animation: br-spin 0.8s linear infinite; margin: 0 auto 12px; }
@keyframes br-spin { to { transform: rotate(360deg); } }
.br-loading-text { font-size: var(--font-size-body); color: var(--text-tertiary); }

/* ── Result Header ── */
.br-result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); }
.br-ent-name { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.br-ent-meta { font-size: var(--font-size-sm); color: var(--text-tertiary); }
.br-meta-dot { margin: 0 6px; color: var(--text-disabled); }
.br-risk-level { padding: var(--space-xs) 14px; border-radius: var(--radius-sm); font-size: var(--font-size-body); font-weight: 600; white-space: nowrap; }
.br-risk-level--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.br-risk-level--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.br-risk-level--success { background: var(--color-success-bg); color: var(--color-success); }

/* ── AI Summary ── */
.br-ai-summary { background: var(--color-primary-bg); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--space-lg) 20px; margin-bottom: var(--space-xl); }
.br-ai-summary__header { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); }
.br-ai-summary__icon { color: var(--color-primary); }
.br-ai-summary__title { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); }
.br-ai-summary__text { font-size: 13.5px; color: var(--text-primary); line-height: 1.6; margin: 0 0 var(--space-sm); }
.br-risk-counts { display: flex; gap: var(--space-md); flex-wrap: wrap; }
.br-risk-count { font-size: var(--font-size-xs); font-weight: 500; padding: 2px 8px; border-radius: var(--radius-sm); }
.br-risk-count--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.br-risk-count--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.br-risk-count--success { background: var(--color-success-bg); color: var(--color-success); }

/* ── Evidence ── */
.br-evidence { margin-bottom: var(--space-xl); }
.br-risk-group { margin-bottom: var(--space-lg); }
.br-risk-group__header { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-body); font-weight: 600; padding: var(--space-xs) 0; cursor: pointer; user-select: none; }
.br-risk-group__header--danger { color: var(--color-danger); }
.br-risk-group__header--warning { color: var(--color-warning); }
.br-risk-group__header--normal { color: var(--color-success); }
.br-expand-hint { font-size: var(--font-size-caption); font-weight: 400; color: var(--text-tertiary); margin-left: auto; }

.br-risk-item { display: flex; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); margin-bottom: var(--space-sm); overflow: hidden; }
.br-risk-item.verified { opacity: 0.7; }
.br-risk-item__severity-bar { width: 3px; flex-shrink: 0; }
.br-risk-item__severity-bar--danger { background: var(--color-danger); }
.br-risk-item__severity-bar--warning { background: var(--color-warning); }
.br-risk-item__content { flex: 1; padding: var(--space-lg) 20px; }
.br-risk-item__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); }
.br-risk-item__type { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); }
.br-risk-item__fact { font-size: 13px; color: var(--text-primary); line-height: 1.6; margin-bottom: var(--space-xs); }
.br-risk-item__suggestion { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-sm); }
.br-risk-item__actions { display: flex; gap: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--border-divider); }

/* ── Status Tag ── */
.br-status-tag { font-size: var(--font-size-caption); padding: 1px 8px; border-radius: var(--radius-sm); font-weight: 500; }
.br-status-tag--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.br-status-tag--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.br-status-tag--success { background: var(--color-success-bg); color: var(--color-success); }

/* ── Detail ── */
.br-risk-detail { margin-top: var(--space-md); padding: var(--space-lg) 16px; background: var(--bg-table-header); border-radius: var(--radius-md); }
.br-relation-list { display: flex; flex-direction: column; gap: var(--space-xs); margin-bottom: var(--space-sm); }
.br-relation { display: flex; align-items: center; gap: var(--space-sm); font-size: 13px; padding: var(--space-xs) 10px; background: var(--surface-card); border-radius: var(--radius-sm); }
.br-relation.abnormal { background: var(--color-danger-bg); }
.br-relation__role { padding: 1px 6px; background: var(--color-primary-bg); border-radius: var(--radius-sm); font-size: var(--font-size-caption); color: var(--color-primary); font-weight: 500; }
.br-relation__name { font-weight: 500; color: var(--text-primary); }
.br-relation__reason { font-size: var(--font-size-caption); color: var(--text-tertiary); }

.br-detail-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); margin-bottom: var(--space-sm); }
.br-detail-table th { padding: var(--space-sm) 10px; background: var(--color-primary-bg); font-weight: 500; color: var(--text-secondary); text-align: left; border-bottom: 1px solid var(--border-light); }
.br-detail-table td { padding: var(--space-sm) 10px; border-bottom: 1px solid var(--border-divider); color: var(--text-primary); }
.br-amount-danger { color: var(--color-danger); font-weight: 600; }

.br-change-timeline { padding-left: 4px; }
.br-timeline-item { display: flex; gap: var(--space-sm); padding: var(--space-xs) 0; }
.br-timeline__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); margin-top: 5px; flex-shrink: 0; }
.br-timeline__date { font-size: var(--font-size-caption); color: var(--text-tertiary); margin-bottom: var(--space-xs); }
.br-timeline__type { font-size: 13px; color: var(--text-primary); }

.br-normal-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-xs); padding: var(--space-sm) 0; }
.br-normal-item { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-sm); color: var(--text-secondary); padding: var(--space-xs) 10px; background: var(--surface-card); border-radius: var(--radius-sm); border: 1px solid var(--border-divider); }

/* ── Action Bar ── */
.br-action-bar { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-lg) 20px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.br-action-bar__label { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
</style>
