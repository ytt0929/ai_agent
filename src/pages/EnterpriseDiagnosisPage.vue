﻿﻿﻿﻿﻿﻿<template>
  <div class="ed-page">
    <div v-if="!store.diagnosisResult && !store.isDiagnosing" class="ed-search-section">
      <div class="ed-header">
        <h1 class="ed-title">企业诊断</h1>
        <p class="ed-subtitle">输入企业名称或税号，AI 自动完成尽调级诊断分析</p>
      </div>
      <div class="ed-search">
        <div class="ed-search__input-wrap" :class="{ focused: searchFocused }">
          <el-icon class="ed-search__icon"><Search /></el-icon>
          <input v-model="store.inputText" class="ed-search__input" placeholder="输入企业名称或统一社会信用代码"
                 @input="onSearch" @focus="searchFocused = true" @blur="setTimeout(() => searchFocused = false, 200)"
                 @keydown.enter="selectFirstAndDiagnose" />
          <el-button type="primary" :disabled="!store.selectedEnterprise" @click="store.startDiagnosis()">开始诊断</el-button>
        </div>
        <div v-if="store.searchResults.length && searchFocused" class="ed-search__dropdown">
          <div v-for="ent in store.searchResults" :key="ent.creditCode" class="ed-search__item" @click="store.selectEnterprise(ent)">
            <span class="ed-search__name">{{ ent.name }}</span>
            <span class="ed-search__meta">{{ ent.creditCode }} · {{ ent.industry }}</span>
          </div>
        </div>
        <div v-if="!store.inputText" class="ed-quick">
          <span class="ed-quick__label">快捷选择：</span>
          <div v-for="ent in quickEnts" :key="ent.creditCode" class="ed-quick__chip" :class="{ 'ed-quick__chip--primary': ent.creditCode === '91130203MA7EEQ2N0T' }" @click="store.selectEnterprise(ent)">
            {{ ent.name }}<el-icon v-if="ent.creditCode === '91130203MA7EEQ2N0T'" :size="12" style="margin-left:4px"><StarFilled /></el-icon>
          </div>
        </div>
        <div v-if="store.diagnosisHistory.length" class="ed-history">
          <div class="ed-history__title">最近诊断</div>
          <div v-for="h in store.diagnosisHistory.slice(0, 5)" :key="h.time" class="ed-history__item" @click="quickReDiagnose(h)">
            <span class="ed-history__name">{{ h.enterprise }}</span>
            <span class="ed-badge" :class="'ed-badge--' + h.riskLevel">{{ riskLabel(h.riskLevel) }}</span>
            <span class="ed-history__score">{{ h.score }}分</span>
            <span class="ed-history__time">{{ h.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.isDiagnosing" class="ed-diagnosing">
      <div class="ed-diagnosing__card">
        <div class="ed-diagnosing__header">
          <div class="ed-diagnosing__spinner"></div>
          <div>
            <div class="ed-diagnosing__text">正在诊断 {{ store.selectedEnterprise?.name }}</div>
            <div class="ed-diagnosing__sub">AI 正在分析多维度数据，生成企业风险诊断</div>
          </div>
        </div>
        <div class="ed-diagnosing__steps">
          <div v-for="(s, i) in diagSteps" :key="i" class="ed-diag-step" :class="s.status">
            <el-icon v-if="s.status === 'done'" :size="14" class="ed-diag-step__icon"><CircleCheck /></el-icon>
            <el-icon v-else-if="s.status === 'active'" :size="14" class="ed-diag-step__icon"><Loading /></el-icon>
            <span class="ed-diag-step__label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.diagnosisResult && !store.isDiagnosing" class="ed-result">
      <header class="ed-topbar">
        <div class="ed-topbar__left">
          <el-button class="ed-back-btn" circle @click="goBack" title="返回列表">
            <el-icon :size="14"><ArrowLeft /></el-icon>
          </el-button>
          <div class="ed-company">
            <h1 class="ed-company__name">{{ safeEnt.name }}</h1>
            <div class="ed-company__meta">
              <span>91130203MA7EEQ2N0T · 法人：马丽 · 成立于2022年</span>
            </div>
          </div>
        </div>
        <div class="ed-score-inline">
          <span class="ed-score-inline__num" :class="'num--' + gradeColorClass">{{ r.score }}</span>
          <span class="ed-score-inline__grade" :class="'ed-grade-badge--' + gradeColorClass">综合评级 D · 审慎推进</span>
          <span class="ed-score-inline__divider"></span>
          <el-button size="small" @click="logAndMsg('生成诊断报告')">生成报告</el-button>
          <el-button size="small" @click="logAndMsg('推送至尽调')">推送尽调</el-button>
          <el-button size="small" @click="logAndMsg('创建监测规则')">监测规则</el-button>
        </div>
      </header>

      <div class="ed-report-layout" :class="{ 'ed-report-layout--assistant-collapsed': assistantCollapsed }">
        <main class="ed-report-main">
      <section class="ed-card ed-diag-main">
        <div class="ed-section-header">
          <h2 class="ed-section-title">AI 综合诊断</h2>
          <div class="ed-section-sub">基于多维度数据智能分析</div>
        </div>
        <div class="ed-diagnosis-text" v-html="renderMarkdown(r.summary)"></div>
        <div v-if="r.suggestions?.length" class="ed-actions">
          <div v-for="(s, i) in r.suggestions" :key="i" class="ed-action">{{ s.text }}</div>
        </div>
      </section>

      <section class="ed-card ed-dim-section">
        <div class="ed-section-header">
          <div>
            <h2 class="ed-section-title">八大维度诊断结果</h2>
            <span class="ed-dim-sub">点击维度查看指标</span>
          </div>
          <div class="ed-chart-tabs">
            <button class="ed-chart-tab" :class="{ active: chartType === 'radar' }" @click="chartType = 'radar'">维度矩阵</button>
            <button class="ed-chart-tab" :class="{ active: chartType === 'butterfly' }" @click="chartType = 'butterfly'">风险分布</button>
            <button class="ed-chart-tab" :class="{ active: chartType === 'rose' }" @click="chartType = 'rose'">亮点分布</button>
          </div>
        </div>
        <div class="ed-dim-wrap">
          <!-- 宸︿晶锛氳瘖鏂浘 -->
          <div class="ed-dim-chart">
            <!-- chartType === 'radar'锛氶浄杈惧浘 -->
            <div v-show="chartType === 'radar'" class="ed-radar-container">
              <svg :viewBox="`0 0 ${radarSize} ${radarSize}`" class="ed-radar-svg" v-if="r.dimensions?.length">
                <polygon v-for="ring in [0.2, 0.4, 0.6, 0.8, 1]" :key="ring"
                         :points="radarPoints(ring * radarRadius)"
                         class="ed-radar-ring" />
                <polygon :points="radarDataPoints" class="ed-radar-data" />
                <line v-for="(pt, i) in radarLabelPositions" :key="'axis-' + i"
                      :x1="radarCenter" :y1="radarCenter" :x2="pt.x" :y2="pt.y"
                      class="ed-radar-axis" />
                <circle v-for="(pt, i) in radarDataPointList" :key="'dot-' + i"
                        :cx="pt.x" :cy="pt.y" r="4"
                        class="ed-radar-dot" :style="{ fill: dimColor(r.dimensions[i].level) }" />
                <text v-for="(lb, i) in radarLabelPositions" :key="'lbl-' + i"
                      :x="lb.x" :y="lb.y" text-anchor="middle" dominant-baseline="middle"
                      class="ed-radar-label">{{ r.dimensions[i].name.replace('维度','') }}</text>
              </svg>
            </div>
            <!-- chartType === 'butterfly'锛氶闄╁垎甯冩潯褰㈠浘 -->
            <div v-show="chartType === 'butterfly'" class="ed-butterfly">
              <div class="ed-butterfly__legend">
                <span class="ed-bf-legend"><span class="ed-bf-dot ed-bf-dot--high"></span>高</span>
                <span class="ed-bf-legend"><span class="ed-bf-dot ed-bf-dot--medium"></span>中</span>
                <span class="ed-bf-legend"><span class="ed-bf-dot ed-bf-dot--low"></span>低</span>
              </div>
              <div v-for="dim in r.dimensions" :key="'bf-' + dim.key" class="ed-bf-row">
                <span class="ed-bf-label">{{ dim.name.replace('维度','') }}</span>
                <div class="ed-bf-bars">
                  <div class="ed-bf-bar ed-bf-bar--high" :style="{ width: (butterflyDim(dim, 'high') / maxRiskInDim * 100) + '%' }"
                       v-if="butterflyDim(dim, 'high')"><span>{{ butterflyDim(dim, 'high') }}</span></div>
                  <div class="ed-bf-bar ed-bf-bar--medium" :style="{ width: (butterflyDim(dim, 'medium') / maxRiskInDim * 100) + '%' }"
                       v-if="butterflyDim(dim, 'medium')"><span>{{ butterflyDim(dim, 'medium') }}</span></div>
                  <div class="ed-bf-bar ed-bf-bar--low" :style="{ width: (butterflyDim(dim, 'low') / maxRiskInDim * 100) + '%' }"
                       v-if="butterflyDim(dim, 'low')"><span>{{ butterflyDim(dim, 'low') }}</span></div>
                  <div v-if="butterflyTotal(dim) === 0" class="ed-bf-none">暂无</div>
                </div>
              </div>
            </div>
            <!-- chartType === 'rose'锛氫寒鐐瑰垎甯冩潯褰㈠浘 -->
            <div v-show="chartType === 'rose'" class="ed-rose">
              <div class="ed-rose__bars">
                <div v-for="dim in r.dimensions" :key="'rose-' + dim.key" class="ed-rose-col" @click="toggleDim(dim.key)">
                  <div class="ed-rose-val" :style="{ color: roseCount(dim) ? 'var(--color-success)' : 'var(--text-tertiary)' }">
                    {{ roseCount(dim) }}
                  </div>
                  <div class="ed-rose-bar-wrap">
                    <div class="ed-rose-bar" :style="{ height: (roseCount(dim) / maxHighlightInDim * 100) + '%' }"
                         :class="{ 'ed-rose-bar--empty': roseCount(dim) === 0 }"></div>
                  </div>
                  <div class="ed-rose-label">{{ dim.name.replace('维度','') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 鍙充晶锛? 涓淮搴﹂」 4 琛?2 分?-->
          <div class="ed-dim-grid">
            <div v-for="dim in r.dimensions" :key="dim.key" class="ed-dim-chip"
                 :class="{ active: store.activeDimension === dim.key }"
                 @click="toggleDim(dim.key)">
              <div class="ed-dim-chip__top">
                <span class="ed-dim-chip__name">{{ dim.name }}</span>
                <span class="ed-level" :class="'ed-level--' + dim.level">{{ dimLevelText(dim.level) }}</span>
              </div>
              <div class="ed-dim-chip__count" v-if="chartType === 'butterfly'">
                {{ butterflyTotal(dim) }} 项风险              </div>
              <div class="ed-dim-chip__count" v-else-if="chartType === 'rose'">
                {{ roseCount(dim) }} 项亮点              </div>
              <div class="ed-dim-chip__count" v-else>
                评分 {{ dim.score }}
              </div>
            </div>
          </div>
        </div>
          </section>

          <section class="ed-workbench">
            <template v-if="hasIndicators">
              <div class="ed-card">
                <div class="ed-section-header">
                  <h2 class="ed-section-title">核心风险和亮点</h2>
                </div>
                <div class="ed-indicator-toolbar">
                  <div class="ed-tabs">
                    <button class="ed-tab" :class="{ active: store.indicatorTab === 'risk' }" @click="setTab('risk')">风险事项 ({{ riskItems.length }})</button>
                    <button class="ed-tab" :class="{ active: store.indicatorTab === 'highlight' }" @click="setTab('highlight')">企业亮点 ({{ highlightItems.length }})</button>
                    <button class="ed-tab" :class="{ active: store.indicatorTab === 'all' }" @click="setTab('all')">全量指标 ({{ allIndicators.length }})</button>
                  </div>
                </div>
                <div class="ed-filters">
                  <!-- 风险事项 tab：按风险等级筛选 -->
                  <template v-if="store.indicatorTab === 'risk'">
                    <button class="ed-filter-chip" :class="{ active: indicatorLevelFilter === 'all' }" @click="indicatorLevelFilter = 'all'">全部</button>
                    <button v-for="lv in riskLevels" :key="lv.key" class="ed-filter-chip"
                            :class="{ active: indicatorLevelFilter === lv.key }"
                            @click="indicatorLevelFilter = lv.key">{{ lv.label }}</button>
                  </template>
                  <!-- 企业亮点 tab：按亮点等级筛选 -->
                  <template v-else-if="store.indicatorTab === 'highlight'">
                    <button class="ed-filter-chip" :class="{ active: indicatorLevelFilter === 'all' }" @click="indicatorLevelFilter = 'all'">全部</button>
                    <button v-for="lv in highlightLevels" :key="lv.key" class="ed-filter-chip"
                            :class="{ active: indicatorLevelFilter === lv.key }"
                            @click="indicatorLevelFilter = lv.key">{{ lv.label }}</button>
                  </template>
                  <!-- 全量指标 tab：按八大维度筛选 -->
                  <template v-else>
                    <button class="ed-filter-chip" :class="{ active: store.indicatorDimensionFilter === 'all' }" @click="store.indicatorDimensionFilter = 'all'">全部</button>
                    <button v-for="dim in r.dimensions" :key="dim.key" class="ed-filter-chip"
                            :class="{ active: store.indicatorDimensionFilter === dim.key }"
                            @click="toggleDim(dim.key)">{{ dim.name }}</button>
                  </template>
                </div>
                <div class="ed-indicator-list">
                  <div v-for="ind in filteredIndicators" :key="ind.id" class="ed-indicator-row"
                       :class="{ selected: store.selectedIndicator?.id === ind.id }"
                       @click="store.selectIndicator(ind)">
                    <strong class="ed-indicator-row__name">{{ ind.name }}</strong>
                    <span class="ed-level" :class="'ed-level--' + ind.level">{{ indicatorLevelText(ind) }}</span>
                    <span class="ed-indicator-row__dim">{{ ind.dimensionName }}</span>
                    <div class="ed-indicator-row__fact">{{ ind.fact }}</div>
                    <el-button size="small" text type="primary" @click.stop="openEvidencePage(ind)">查看证据链</el-button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="ed-card ed-compact-state">
                <div class="ed-compact-state__icon"><el-icon :size="28" color="var(--color-success)"><CircleCheck /></el-icon></div>
                <h3 class="ed-compact-state__title">暂无风险指标</h3>
                <p class="ed-compact-state__desc">当前企业仅展示基础诊断结果，未发现显著风险信号。</p>
              </div>
            </template>
          </section>
        </main>
        <aside class="ed-report-aside">
          <!-- 收起状态 -->
          <div v-if="assistantCollapsed" class="ed-assistant-collapsed" @click="toggleAssistant">
            <span>AI</span>
            <el-button size="small" text>展开</el-button>
          </div>
          <!-- 展开状态 -->
          <aside v-else class="ed-assistant">
            <div class="ed-card ed-assistant-card">
              <div class="ed-section-header">
                <h2 class="ed-section-title">AI 探查助手</h2>
                <el-button size="small" text @click="toggleAssistant">收起</el-button>
              </div>
              <div class="ed-assistant__ctx">
                <template v-if="store.selectedIndicator">
                  正在研究：<span class="ed-assistant__ctx--dim">{{ indicatorDimName }}</span> / <span class="ed-assistant__ctx--ind">{{ selectedIndicatorName }}</span>
                </template>
                <template v-else-if="store.activeDimension">
                  正在研究：<span class="ed-assistant__ctx--dim">{{ activeDimensionName }}</span>
                </template>
                <template v-else>
                  <span class="ed-assistant__ctx--placeholder">请选择一个维度或指标开始分析</span>
                </template>
              </div>
              <div class="ed-chat ai-assistant-panel__messages" ref="chatListRef">
                <div v-if="!store.chatMessages.length" class="ed-chat-empty">
                  <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="var(--border-default)" stroke-width="1.5" stroke-dasharray="4 3"/>
                    <text x="24" y="28" text-anchor="middle" font-size="16">AI</text>
                  </svg>
                  <div class="ed-chat-empty__text">输入问题，AI 将基于当前诊断结果作答</div>
                </div>
                <div v-for="(msg, i) in store.chatMessages" :key="i" class="ai-message" :class="msg.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'">
                  <div class="ai-message__avatar">{{ msg.role === 'ai' ? 'AI' : '我' }}</div>
                  <div class="ai-message__bubble" v-html="renderMarkdown(msg.text)"></div>
                </div>
                <div v-if="store.isChatProcessing" class="ai-message ai-message--ai">
                  <div class="ai-message__avatar">AI</div>
                  <div class="ai-message__bubble ed-bubble__thinking">思考中…</div>
                </div>
              </div>
              <div class="ed-chat-quick ai-assistant-panel__quick">
                <el-button size="small" text @click="handleExplainDeduction">解释扣分原因</el-button>
                <el-button size="small" text @click="handleEvidenceAction">查看证据链</el-button>
                <el-button size="small" text @click="handleGenerateSpecialNote">生成专项说明</el-button>
                <el-button size="small" text @click="handleAddToReport">加入报告</el-button>
              </div>
              <div class="ed-chat-input ai-assistant-panel__footer">
                <input v-model="store.chatInput" class="ed-chat-input__field ai-assistant-panel__input" placeholder="输入问题…"
                       @keydown.enter="handleSendChat" />
                <button class="ai-assistant-panel__send" @click="handleSendChat" :disabled="!store.chatInput.trim()">发送</button>
              </div>
            </div>
          </aside>
        </aside>
      </div>
    </div>

    <el-drawer v-model="store.evidenceDrawerOpen" title="证据链" size="420px" direction="rtl">
      <div v-if="store.selectedIndicator" class="ed-evidence">
        <h3 class="ed-evidence__title">{{ store.selectedIndicator.name }} · 证据链</h3>
        <div v-for="eid in store.selectedIndicator.evidenceIds" :key="eid" class="ed-evidence-card">
          <template v-if="r.evidenceChain && r.evidenceChain[eid]">
            <div class="ed-evidence-card__header">
              <strong>{{ r.evidenceChain[eid].title }}</strong>
              <span class="ed-badge ed-badge--source">{{ r.evidenceChain[eid].source }}</span>
            </div>
            <div class="ed-evidence-card__body">
              <div class="ed-ev-row"><span class="ed-ev-label">数值</span>{{ r.evidenceChain[eid].value }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">对比</span>{{ r.evidenceChain[eid].comparison }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">采集时间</span>{{ r.evidenceChain[eid].collectedAt }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">置信度</span>{{ Math.round(r.evidenceChain[eid].confidence * 100) }}%</div>
            </div>
          </template>
        </div>
      </div>
    </el-drawer>
    <!-- ══ 空状态 / 白屏兜底 ══ -->
    <div v-if="!store.diagnosisResult && !store.isDiagnosing" class="ed-empty">
      <p>未找到诊断数据，请从<a href="javascript:void(0)" @click="goBack">探查首页</a>重新选择企业。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { Search, CircleCheck, Loading, StarFilled, ArrowLeft } from '@element-plus/icons-vue'
import { useDiagnosisStore } from '../stores/enterpriseDiagnosis.js'
import { ElMessage } from 'element-plus'
import { enterpriseDB, getDiagnosisMock } from '../data/mockEnterpriseDiagnosis.js'
import { useRoute, useRouter } from 'vue-router'

const store = useDiagnosisStore()
const route = useRoute()
const router = useRouter()
const assistantCollapsed = ref(false)
function toggleAssistant() { assistantCollapsed.value = !assistantCollapsed.value }

onMounted(() => {
  const creditCode = route.params.creditCode
  const fallback = '91130203MA7EEQ2N0T'
  const cc = creditCode || fallback
  const mock = getDiagnosisMock(cc)
  if (mock && !store.diagnosisResult) {
    store.diagnosisResult = mock
    store.selectedEnterprise = enterpriseDB.find(e => e.creditCode === cc) || mock.enterprise || null
  } else if (!mock && !store.diagnosisResult) {
    // 路由参数找不到 mock，兜底到默认企业
    const fbMock = getDiagnosisMock(fallback)
    if (fbMock) {
      store.diagnosisResult = fbMock
      store.selectedEnterprise = enterpriseDB.find(e => e.creditCode === fallback) || fbMock.enterprise || null
    }
  }
})

function goBack() {
  router.push('/enterprise-diagnosis')
}

function openEvidencePage(ind) {
  const cc = route.params.creditCode || r.value.enterprise?.creditCode || '91130203MA7EEQ2N0T'
  router.push(`/enterprise-diagnosis/evidence/${cc}/${ind.id}`)
}
const quickEnts = enterpriseDB.slice(0, 5)
const searchFocused = ref(false)
const chartType = ref('radar')
const chatListRef = ref(null)

const diagSteps = ref([
  { label: '获取工商基础信息', status: 'done' },
  { label: '检索司法风险记录', status: 'done' },
  { label: '分析税票波动趋势', status: 'active' },
  { label: '评估经营指标', status: 'pending' },
  { label: '扫描舆情信息', status: 'pending' },
  { label: '生成诊断结论', status: 'pending' },
])

const r = computed(() => store.diagnosisResult || {})
const safeEnt = computed(() => r.value?.enterprise || { name: '', creditCode: '', industry: '' })
const riskItems = computed(() => r.value?.riskItems || [])
const highlightItems = computed(() => r.value?.highlightItems || [])
const allIndicators = computed(() => r.value?.allIndicators || [])

const hasValidResult = computed(() => !!(store.diagnosisResult && r.value.enterprise))
const highRiskCount = computed(() => riskItems.value.filter(i => i.level === 'high').length)
const strongHighlightCount = computed(() => highlightItems.value.filter(i => i.level === 'strong').length)
const hasIndicators = computed(() => allIndicators.value.length > 0)

const recentOps = computed(() => store.operationLog.slice(-3).reverse())

const indicatorLevelFilter = ref('all')

const filteredIndicators = computed(() => {
  let list = []
  if (store.indicatorTab === 'risk') list = riskItems.value
  else if (store.indicatorTab === 'highlight') list = highlightItems.value
  else list = allIndicators.value
  if (store.indicatorTab === 'risk' || store.indicatorTab === 'highlight') {
    if (indicatorLevelFilter.value !== 'all') {
      list = list.filter(i => i.level === indicatorLevelFilter.value)
    }
  } else {
    if (store.indicatorDimensionFilter !== 'all') {
      list = list.filter(i => i.dimensionKey === store.indicatorDimensionFilter)
    }
  }
  return list
})

const riskLevels = ref([
  { key: 'high', label: '高风险' },
  { key: 'medium', label: '中风险' },
  { key: 'low', label: '低风险' },
])
const highlightLevels = ref([
  { key: 'strong', label: '强亮点' },
  { key: 'normal', label: '中亮点' },
  { key: 'low', label: '低亮点' },
])

function setTab(tab) {
  store.setIndicatorTab(tab)
  indicatorLevelFilter.value = 'all'
  if (tab !== 'all') store.indicatorDimensionFilter = 'all'
}

const activeDimensionName = computed(() => {
  if (!store.activeDimension || !r.value?.dimensions) return ''
  const d = r.value.dimensions.find(dim => dim.key === store.activeDimension)
  return d?.name || ''
})
const selectedIndicatorName = computed(() => store.selectedIndicator?.name || '')
const indicatorDimName = computed(() => store.selectedIndicator?.dimensionName || '')

const gradeColorClass = computed(() => {
  const g = r.value?.grade
  if (['D', 'E', 'F'].includes(g)) return 'danger'
  if (['C'].includes(g)) return 'warning'
  return 'success'
})
const gradeText = computed(() => {
  const g = r.value?.grade
  return { A: '正常推进', B: '审慎关注', C: '审慎推进', D: '审慎推进', E: '审慎介入', F: '审慎介入' }[g] || ''
})

// ===== 闆疯揪鍥捐绠?=====
const radarSize = 320
const radarCenter = radarSize / 2
const radarRadius = 130
const radarDims = computed(() => r.value?.dimensions || [])

function _radarPt(angle, radius) {
  return { x: radarCenter + radius * Math.sin(angle), y: radarCenter - radius * Math.cos(angle) }
}

function radarPoints(radius) {
  const n = radarDims.value.length
  if (!n) return ''
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n
    const pt = _radarPt(angle, radius)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

const radarDataPoints = computed(() => {
  const n = radarDims.value.length
  if (!n) return ''
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n
    return _radarPt(angle, (radarDims.value[i].score / 100) * radarRadius)
  }).map(p => `${p.x},${p.y}`).join(' ')
})

const radarDataPointList = computed(() => {
  return Array.from({ length: radarDims.value.length }, (_, i) => {
    const angle = (2 * Math.PI * i) / radarDims.value.length
    return _radarPt(angle, (radarDims.value[i].score / 100) * radarRadius)
  })
})

const radarLabelPositions = computed(() => {
  return Array.from({ length: radarDims.value.length }, (_, i) => {
    const angle = (2 * Math.PI * i) / radarDims.value.length
    return _radarPt(angle, radarRadius + 18)
  })
})

// ===== 铦磋澏鍥捐绠?=====
function butterflyDim(dim, level) {
  return (r.value?.riskItems || []).filter(i => i.dimensionKey === dim.key && i.level === level).length
}
function butterflyTotal(dim) {
  return ['high', 'medium', 'low'].reduce((s, l) => s + butterflyDim(dim, l), 0)
}
const maxRiskInDim = computed(() => {
  let max = 0
  ;(r.value?.dimensions || []).forEach(d => { const t = butterflyTotal(d); if (t > max) max = t })
  return max || 1
})

// ===== 鐜懓鍥捐绠?=====
function roseCount(dim) {
  return (r.value?.highlightItems || []).filter(i => i.dimensionKey === dim.key).length
}
const maxHighlightInDim = computed(() => {
  let max = 0
  ;(r.value?.dimensions || []).forEach(d => { const c = roseCount(d); if (c > max) max = c })
  return max || 1
})

// ===== 鑱婂ぉ鐩稿叧 =====
async function scrollToBottom() {
  await nextTick()
  if (chatListRef.value) chatListRef.value.scrollTop = chatListRef.value.scrollHeight
}
watch(() => store.chatMessages.length, scrollToBottom)
watch(() => store.isChatProcessing, (v) => { if (v) scrollToBottom() })

function handleSendChat() {
  if (!store.chatInput.trim() || !store.diagnosisResult) return
  store.sendChatMessage()
}

function handleEvidenceAction() {
  if (store.selectedIndicator) {
    openEvidencePage(store.selectedIndicator)
  } else {
    ElMessage.warning('请先选择一个指标')
  }
}

function handleExplainDeduction() {
  const ind = store.selectedIndicator
  if (ind) {
    store.chatMessages.push({ role: 'user', text: '解释扣分原因' })
    const levelText = ind.type === 'risk' ? '高风险' : ind.level === 'strong' ? '强亮点' : '亮点'
    store.chatMessages.push({
      role: 'ai',
      text: `**${ind.name}** — 扣分分析\n\n· 所属维度：**${ind.dimensionName}**\n· 风险等级：${levelText}\n· 事实依据：${ind.fact}\n\n该指标偏离行业正常水平，直接拉低${ind.dimensionName}维度得分。建议在授信审批时重点核实该情况。`,
    })
  } else if (store.activeDimension) {
    const name = activeDimensionName.value
    store.chatMessages.push({ role: 'user', text: '解释该维度的扣分原因' })
    store.chatMessages.push({
      role: 'ai',
      text: `**${name}** — 维度分析\n\n当前选中维度「${name}」包含 ${filteredIndicators.value.length} 个指标，其中风险项 ${filteredIndicators.value.filter(i => i.type === 'risk').length} 个、亮点项 ${filteredIndicators.value.filter(i => i.type === 'highlight').length} 个。建议点击下方具体指标查看详细信息。`,
    })
  } else {
    ElMessage.warning('请先选择一个维度或指标')
    return
  }
  scrollToBottom()
}

function handleGenerateSpecialNote() {
  const ind = store.selectedIndicator
  if (ind) {
    store.chatMessages.push({ role: 'user', text: '生成专项说明' })
    store.chatMessages.push({
      role: 'ai',
      text: `**${ind.name} 专项说明**\n\n**一、风险事实**\n${ind.fact}\n\n**二、判断依据**\n该指标基于${ind.dimensionName}相关数据，结合行业均值和阈值规则自动判定。风险等级为${indicatorLevelText(ind)}。\n\n**三、建议动作**\n1. 要求企业提供相关补充材料\n2. 实地尽调时重点核实\n3. 如情况属实，在授信方案中纳入风险溢价考量\n\n本说明仅供参考，最终结论以实地尽调为准。`,
    })
  } else if (store.activeDimension) {
    const name = activeDimensionName.value
    store.chatMessages.push({ role: 'user', text: '生成' + name + '专项说明' })
    const risks = filteredIndicators.value.filter(i => i.type === 'risk')
    const highlights = filteredIndicators.value.filter(i => i.type === 'highlight')
    store.chatMessages.push({
      role: 'ai',
      text: `**${name} 维度专项说明**\n\n**一、维度概况**\n该维度共包含 ${filteredIndicators.value.length} 个指标，风险项 ${risks.length} 个，亮点项 ${highlights.length} 个。\n\n**二、主要发现**\n${risks.length ? '\n· ' + risks.map(r => r.name + '（' + indicatorLevelText(r) + '）：' + r.fact).join('\n· ') : '未发现显著风险项。'}\n\n**三、建议动作**\n建议结合其他维度综合分析，并在尽调时关注相关异常情况。\n\n本说明仅供参考，最终结论以实地尽调为准。`,
    })
  } else {
    ElMessage.warning('请先选择一个维度或指标')
    return
  }
  scrollToBottom()
}

function handleAddToReport() {
  if (store.selectedIndicator) {
    store.logOperation('加入报告', store.selectedIndicator.name)
    ElMessage.success('已加入报告草稿')
    store.chatMessages.push({
      role: 'ai',
      text: `已将「${store.selectedIndicator.name}」加入报告草稿，可在智能报告中继续编辑。`,
    })
  } else if (store.activeDimension) {
    store.logOperation('加入报告', activeDimensionName.value)
    ElMessage.success('已加入报告草稿')
    store.chatMessages.push({
      role: 'ai',
      text: `已将「${activeDimensionName.value}」相关分析加入报告草稿，可在智能报告中继续编辑。`,
    })
  } else {
    ElMessage.warning('请先选择一个维度或指标')
    return
  }
  scrollToBottom()
}

function indicatorLevelText(ind) {
  if (ind.type === 'risk') return { high: '高风险', medium: '中风险', low: '低风险' }[ind.level] || ind.level
    if (ind.type === 'highlight') return { strong: '强亮点', normal: '亮点' }[ind.level] || ind.level
  return ind.level
}

function dimLevelText(level) {
  return { high: '高', medium: '中', low: '低' }[level] || ''
}

function dimColor(level) {
  if (level === 'high') return 'var(--color-danger)'
  if (level === 'medium') return 'var(--color-warning)'
  return 'var(--color-success)'
}

function renderMarkdown(text) {
  if (!text) return ''
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

function toggleDim(key) { store.toggleDimension(key) }
function quickChat(text) { store.chatInput = text; store.sendChatMessage() }
function onSearch() { store.searchEnterprise(store.inputText) }
function riskLabel(level) {
  return { high: '高风险', medium: '中风险', low: '低风险' }[level] || ''
}

function logAndMsg(action) {
  store.logOperation(action, 'click')
  ElMessage.success(action + ' 成功')
}

async function selectFirstAndDiagnose() {
  if (store.searchResults.length && !store.selectedEnterprise) {
    store.selectEnterprise(store.searchResults[0])
    await nextTick()
  }
  if (store.selectedEnterprise) { store.startDiagnosis() }
}

function quickReDiagnose(h) {
  const ent = enterpriseDB.find(e => e.name === h.enterprise)
  if (ent) { store.selectEnterprise(ent); store.startDiagnosis() }
}
</script>

<style scoped>
.ed-page { padding: var(--space-xl) var(--space-3xl); max-width: 1280px; margin: 0 auto; height: 100vh; overflow: hidden; }

.ed-search-section { display: flex; flex-direction: column; gap: var(--space-2xl); }
.ed-header { margin-bottom: var(--space-2xl); }
.ed-title { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.ed-subtitle { font-size: var(--font-size-body); color: var(--text-tertiary); margin: 0; }

.ed-search { display: flex; flex-direction: column; gap: var(--space-xl); }
.ed-search__input-wrap { display: flex; align-items: center; gap: var(--space-sm); background: var(--bg-table-header); border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-xs) 8px; }
.ed-search__input-wrap.focused { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.06); }
.ed-search__icon { font-size: var(--font-size-assist); color: var(--text-tertiary); margin-left: 8px; }
.ed-search__input { flex: 1; border: none; background: transparent; padding: var(--space-sm) 12px; font-size: var(--font-size-lg); outline: none; }
.ed-search__dropdown { position: relative; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); box-shadow: 0 8px 24px rgba(0,0,0,.08); z-index: 10; overflow: hidden; margin-top: calc(-1 * var(--space-sm)); }
.ed-search__item { padding: var(--space-md) 16px; cursor: pointer; transition: background .15s; }
.ed-search__item:hover { background: var(--color-primary-bg); }
.ed-search__name { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
.ed-search__meta { font-size: var(--font-size-sm); color: var(--text-tertiary); }
.ed-quick { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.ed-quick__label { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.ed-quick__chip { padding: 3px 12px; background: var(--surface-page); border: 1px solid var(--border-light); border-radius: var(--radius-full); font-size: var(--font-size-xs); color: var(--text-secondary); cursor: pointer; transition: all .15s; }
.ed-quick__chip:hover { background: var(--color-primary-bg); border-color: var(--color-primary); color: var(--color-primary); }
.ed-quick__chip--primary { border-color: var(--color-primary); color: var(--color-primary); font-weight: 500; }

.ed-history { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-lg) 20px; }
.ed-history__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-sm); }
.ed-history__item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid var(--border-divider); cursor: pointer; }
.ed-history__item:last-child { border-bottom: none; }
.ed-history__item:hover .ed-history__name { color: var(--color-primary); }
.ed-history__name { font-size: var(--font-size-sm); color: var(--text-primary); font-weight: 500; transition: color .15s; }
.ed-history__score { font-size: var(--font-size-xs); color: var(--text-secondary); }
.ed-history__time { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.ed-badge { padding: 1px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 500; }
.ed-badge--high { background: var(--color-danger-bg); color: var(--color-danger); }
.ed-badge--medium { background: var(--color-warning-bg); color: var(--color-warning); }
.ed-badge--low { background: var(--color-success-bg); color: var(--color-success); }
.ed-badge--source { background: var(--color-primary-bg); color: var(--color-primary); }

.ed-diagnosing { display: flex; justify-content: center; padding-top: 40px; }
.ed-diagnosing__card { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-3xl) 32px; width: 100%; max-width: 480px; }
.ed-diagnosing__header { display: flex; align-items: center; gap: var(--space-lg); margin-bottom: var(--space-xl); }
.ed-diagnosing__spinner { width: 28px; height: 28px; border: 3px solid var(--border-light); border-top-color: var(--color-primary); border-radius: 50%; animation: ed-spin 1s linear infinite; flex-shrink: 0; }
@keyframes ed-spin { to { transform: rotate(360deg); } }
.ed-diagnosing__text { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); }
.ed-diagnosing__sub { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: var(--space-xs); }
.ed-diagnosing__steps { display: flex; flex-direction: column; gap: var(--space-xs); }
.ed-diag-step { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-sm); color: var(--text-tertiary); padding: var(--space-xs) 0; }
.ed-diag-step.done { color: var(--color-success); }
.ed-diag-step.active { color: var(--color-primary); font-weight: 500; }
.ed-diag-step__icon { flex-shrink: 0; }
.ed-diag-step.active .ed-diag-step__icon { animation: ed-spin 1s linear infinite; }

.ed-result { display: flex; flex-direction: column; gap: 12px; height: calc(100vh - 32px); overflow: hidden; min-height: 0; }

/* ===== 绱у噾澶撮儴 ===== */
.ed-topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; min-height: 56px; max-height: 72px; padding: 8px 0; flex-shrink: 0; }
.ed-topbar__left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.ed-back-btn { width: 32px; height: 32px; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ed-company__name { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ed-company__meta { color: var(--text-secondary); display: flex; gap: 8px; flex-wrap: wrap; font-size: var(--font-size-xs); }

.ed-score-inline { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ed-score-inline__num { font-size: 26px; font-weight: 800; line-height: 1; }
.ed-score-inline__num.num--danger { color: var(--color-danger); }
.ed-score-inline__num.num--warning { color: var(--color-warning); }
.ed-score-inline__num.num--success { color: var(--color-success); }

.ed-grade-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 999px; font-weight: 600; font-size: var(--font-size-sm); }
.ed-grade-badge--danger { color: var(--color-danger); background: var(--color-danger-bg); }
.ed-grade-badge--warning { color: var(--color-warning); background: var(--color-warning-bg); }
.ed-grade-badge--success { color: var(--color-success); background: var(--color-success-bg); }

.ed-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.ed-section-title { font-size: 18px; font-weight: 600; margin: 0; color: var(--text-primary); }
.ed-section-sub { color: var(--text-tertiary); font-size: 12px; }

.ed-card { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 14px; }

/* ===== 涓讳綋涓ゆ爮甯冨眬 ===== */
.ed-report-layout { display: grid; grid-template-columns: minmax(0, 1fr) 430px; gap: 16px; flex: 1; min-height: 0; overflow: hidden; }
.ed-report-layout--assistant-collapsed { grid-template-columns: minmax(0, 1fr) 56px; }
.ed-report-main { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; overflow-x: hidden; min-height: 0; padding-right: 4px; }
.ed-report-aside { min-height: 0; overflow: hidden; display: flex; }
.ed-report-aside .ed-assistant-card { height: 100%; }

/* 细滚动条 */
.ed-report-main,
.ed-chat {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.35) transparent;
}
.ed-report-main::-webkit-scrollbar,
.ed-chat::-webkit-scrollbar {
  width: 6px;
}
.ed-report-main::-webkit-scrollbar-thumb,
.ed-chat::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.28);
  border-radius: 999px;
}
.ed-report-main::-webkit-scrollbar-thumb:hover,
.ed-chat::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.45);
}
.ed-report-main::-webkit-scrollbar-track,
.ed-chat::-webkit-scrollbar-track {
  background: transparent;
}

/* AI 助手折叠态 */
.ed-assistant-collapsed { height: 100%; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 12px; padding: 12px 6px; cursor: pointer; font-weight: 600; font-size: 14px; color: var(--color-primary); }

/* AI 综合诊断锛氬彧鏀炬憳瑕佸拰寤鸿 */
.ed-diag-main { padding: 16px; }

/* 绱у噾缁熻鏉★紙鏀惧湪鍏ぇ维度鏍囬闄勮繎锛?*/
.ed-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ed-metrics--compact { margin-bottom: 14px; gap: 8px; }
.ed-metric { background: #f8fafc; border: 1px solid var(--border-default); border-radius: 6px; padding: 10px; text-align: center; }
.ed-metric strong { display: block; font-size: 22px; margin-bottom: 2px; }
.ed-metric--risk strong { color: var(--color-danger); }
.ed-metric--good strong { color: var(--color-success); }
.ed-metric span { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.ed-diagnosis-text { line-height: 1.6; color: #344054; background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: var(--font-size-body); }

.ed-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; counter-reset: ed-action-item; }
.ed-action { border: 1px solid var(--border-default); border-radius: 6px; padding: 10px 10px 10px 30px; line-height: 1.5; background: #fff; font-size: var(--font-size-sm); color: var(--text-secondary); position: relative; }
.ed-action::before { counter-increment: ed-action-item; content: counter(ed-action-item); display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--color-primary-bg); color: var(--color-primary); font-weight: 700; position: absolute; left: 8px; top: 10px; font-size: 11px; }

.ed-report-state { background: #f8fafc; border: 1px solid var(--border-default); border-radius: 6px; padding: 12px; display: grid; gap: 8px; }
.ed-report-state--compact { padding: 8px 12px; }
.ed-report-row { display: flex; justify-content: space-between; color: var(--text-tertiary); font-size: var(--font-size-sm); }
.ed-report-row strong { color: var(--text-primary); font-weight: 600; }
.ed-report-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.ed-score-inline__divider { width: 1px; height: 22px; background: var(--border-default); margin: 0 4px; }
.ed-op-log { margin-top: 12px; border-top: 1px solid var(--border-default); padding-top: 8px; }
.ed-op-log__title { font-size: 11px; color: var(--text-tertiary); font-weight: 600; margin-bottom: 4px; }
.ed-op-log__item { display: flex; gap: 8px; font-size: 11px; color: var(--text-secondary); padding: 2px 0; }
.ed-op-log__time { color: var(--text-tertiary); flex-shrink: 0; }

.ed-dim-section {}
.ed-dim-sub { color: var(--text-tertiary); font-size: 12px; margin-left: 8px; font-weight: 400; }

.ed-chart-tabs { display: flex; gap: 8px; }
.ed-chart-tab { border: 1px solid var(--border-default); background: #fff; border-radius: 6px; padding: 7px 12px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-sm); }
.ed-chart-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* ===== 鍏ぇ维度锛氬乏鍥惧彸鏍?===== */
.ed-dim-wrap { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; min-height: 260px; max-height: 340px; }

/* 宸︿晶鍥捐〃 */
.ed-dim-chart { position: relative; }
.ed-radar-container { display: flex; align-items: center; justify-content: center; height: 280px; }
.ed-radar-svg { max-width: 100%; max-height: 100%; }

/* 鍙充晶 8 涓淮搴?4 琛?2 分?*/
.ed-dim-grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, 1fr); gap: 8px; align-content: start; }
.ed-dim-chip { border: 1px solid var(--border-default); border-radius: 8px; padding: 10px 12px; background: #fff; cursor: pointer; display: flex; flex-direction: column; justify-content: center; gap: 4px; transition: all .15s; min-height: 56px; }
.ed-dim-chip:hover { border-color: var(--color-primary); }
.ed-dim-chip.active { border-color: var(--color-primary); background: var(--color-primary-bg); }
.ed-dim-chip__top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.ed-dim-chip__name { font-weight: 600; font-size: 13px; color: var(--text-primary); }
.ed-dim-chip__count { font-size: 11px; color: var(--text-tertiary); }

.ed-level { font-size: 12px; padding: 1px 7px; border-radius: 999px; white-space: nowrap; font-weight: 500; }
.ed-level--high { color: var(--color-danger); background: var(--color-danger-bg); }
.ed-level--medium { color: var(--color-warning); background: var(--color-warning-bg); }
.ed-level--low { color: var(--color-success); background: var(--color-success-bg); }
.ed-level--strong { color: var(--color-success); background: var(--color-success-bg); }
.ed-level--normal { color: var(--color-success); background: var(--color-success-bg); }

/* ===== 鍥捐〃閫氱敤鏍峰紡 ===== */
.ed-matrix { min-height: 320px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #fbfdff; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-content: start; position: relative; }
.ed-matrix--radar { display: grid; grid-template-columns: 1fr; }
.ed-matrix--radar .ed-matrix-cell { display: none; }
.ed-matrix--butterfly { display: block; grid-template-columns: none; }
.ed-matrix--rose { display: block; grid-template-columns: none; }
.ed-matrix-cell { height: 74px; border-radius: 8px; background: #fff; border: 1px solid var(--border-default); padding: 12px; position: relative; overflow: hidden; font-size: var(--font-size-sm); color: var(--text-secondary); cursor: pointer; }
.ed-matrix-cell:hover { border-color: var(--color-primary); }
.ed-matrix-cell.active { border-color: var(--color-primary); background: var(--color-primary-bg); }
.ed-matrix-cell strong { display: block; font-size: 20px; margin-bottom: 6px; color: var(--text-primary); }
.ed-matrix-cell::after { content: ""; position: absolute; left: 0; bottom: 0; height: 4px; width: var(--w); background: var(--c); }

.ed-radar-ring { fill: none; stroke: #e2e8f0; stroke-width: 1; }
.ed-radar-data { fill: rgba(37,99,235,0.12); stroke: rgba(37,99,235,0.6); stroke-width: 2; }
.ed-radar-axis { stroke: #e2e8f0; stroke-width: 0.8; }
.ed-radar-dot { stroke: #fff; stroke-width: 1.5; }
.ed-radar-label { font-size: 11px; fill: var(--text-secondary); font-weight: 500; }

/* 宸︿晶鍐呭祵铦磋澏鍥?*/
.ed-dim-chart .ed-butterfly { padding: 8px 0; }
.ed-butterfly__title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; }
.ed-butterfly__legend { display: flex; gap: 12px; margin-bottom: 10px; }
.ed-bf-legend { font-size: 11px; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px; }
.ed-bf-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.ed-bf-dot--high { background: var(--color-danger); }
.ed-bf-dot--medium { background: var(--color-warning); }
.ed-bf-dot--low { background: var(--color-success); }
.ed-bf-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ed-bf-label { font-size: 12px; color: var(--text-secondary); width: 100px; flex-shrink: 0; }
.ed-bf-bars { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ed-bf-bar { height: 18px; border-radius: 3px; display: flex; align-items: center; padding: 0 6px; font-size: 10px; color: #fff; font-weight: 600; min-width: 28px; }
.ed-bf-bar--high { background: var(--color-danger); }
.ed-bf-bar--medium { background: var(--color-warning); }
.ed-bf-bar--low { background: var(--color-success); }
.ed-bf-none { font-size: 11px; color: var(--text-tertiary); font-style: italic; }

/* 宸︿晶鍐呭祵鐜懓鍥?*/
.ed-dim-chart .ed-rose { padding: 8px 0; }
.ed-rose__title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 12px; }
.ed-rose__bars { display: flex; justify-content: space-around; align-items: flex-end; gap: 4px; height: 200px; padding: 0 8px; }
.ed-rose-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; cursor: pointer; }
.ed-rose-val { font-size: 18px; font-weight: 700; }
.ed-rose-bar-wrap { width: 100%; height: 140px; display: flex; align-items: flex-end; }
.ed-rose-bar { width: 100%; border-radius: 4px 4px 0 0; background: var(--color-success); transition: height .3s ease; min-height: 2px; }
.ed-rose-bar--empty { background: #e2e8f0; }
.ed-rose-label { font-size: 11px; color: var(--text-tertiary); text-align: center; }
.ed-rose-label.active { color: var(--color-primary); font-weight: 600; }

/* 宸ヤ綔鍖猴細鍗曞垪锛屼笉鍐嶆壙鎷呭乏鍙充袱鏍?*/
.ed-workbench {}

.ed-indicator-toolbar { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.ed-tabs { display: flex; gap: 8px; }
.ed-tab { border: 1px solid var(--border-default); background: #fff; border-radius: 6px; padding: 7px 12px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-sm); }
.ed-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.ed-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.ed-filter-chip { border: 1px solid var(--border-default); background: #fff; border-radius: var(--radius-full); padding: 4px 12px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-xs); }
.ed-filter-chip.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }

.ed-indicator-list { display: grid; gap: 8px; }
.ed-indicator-row { display: grid; grid-template-columns: 160px 74px 104px 1fr auto; gap: 10px; align-items: center; border: 1px solid var(--border-default); border-radius: 6px; background: #fff; padding: 8px 10px; cursor: pointer; }
.ed-indicator-row:hover { border-color: var(--color-primary); }
.ed-indicator-row.selected { border-color: var(--color-primary); background: var(--color-primary-bg); }
.ed-indicator-row__name { font-size: 14px; }
.ed-indicator-row__dim { font-size: var(--font-size-xs); color: var(--text-tertiary); white-space: nowrap; }
.ed-indicator-row__fact { color: #344054; line-height: 1.5; font-size: var(--font-size-sm); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.ed-compact-state { text-align: center; padding: 32px; }
.ed-compact-state__icon { margin-bottom: 12px; }
.ed-compact-state__title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; }
.ed-compact-state__desc { font-size: var(--font-size-sm); color: var(--text-tertiary); margin: 0; }

/* ===== AI 瀵硅瘽闈㈡澘 ===== */
.ed-assistant { min-height: 0; height: 100%; display: flex; }
.ed-assistant-card { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.ed-assistant__ctx { color: var(--text-tertiary); font-size: 12px; margin-bottom: 10px; }
.ed-assistant__ctx--dim { color: var(--color-primary); font-weight: 600; }
.ed-assistant__ctx--ind { color: var(--text-primary); font-weight: 600; }
.ed-assistant__ctx--placeholder { color: var(--text-tertiary); font-style: italic; }
.ed-chat.ai-assistant-panel__messages { min-height: 260px; flex: 1; min-height: 0; overflow-y: auto; border: 1px solid var(--border-default); border-radius: 6px; padding: 12px; background: #fff; display: flex; flex-direction: column; }
.ed-chat-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 32px 0; }
.ed-chat-empty__text { font-size: 12px; color: var(--text-tertiary); text-align: center; }
/* Legacy .ed-bubble removed - use unified .ai-message classes from tokens.css */
.ed-bubble__thinking { color: var(--text-tertiary); font-style: italic; }
.ed-chat-quick.ai-assistant-panel__quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0; border-top: 1px solid var(--border-default); border-bottom: 1px solid var(--border-default); flex-shrink: 0; }
.ed-chat-input.ai-assistant-panel__footer { display: flex; gap: 8px; margin-top: 0; flex-shrink: 0; align-items: flex-end; }
.ed-chat-input__field.ai-assistant-panel__input { flex: 1; border: 1px solid var(--border-default); border-radius: 6px; padding: 8px 12px; font-size: 13px; outline: none; background: #fff; font-family: var(--font-family); }
.ed-chat-input__field:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
/* .ed-chat-input__btn removed - use .ai-assistant-panel__send from tokens.css */

.ed-evidence { display: flex; flex-direction: column; gap: 12px; }
.ed-evidence__title { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
.ed-evidence-card { border: 1px solid var(--border-default); border-radius: 6px; padding: 10px; }
.ed-evidence-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ed-evidence-card__body { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.7; }
.ed-ev-row { margin-bottom: 4px; }
.ed-ev-label { display: inline-block; width: 60px; color: var(--text-tertiary); font-size: 12px; font-weight: 500; }

@media (max-width: 1200px) {
  .ed-page { height: auto; overflow: visible; }
  .ed-result { height: auto; overflow: visible; }
  .ed-report-layout { overflow: visible; }
  .ed-report-main { overflow: visible; }
  .ed-report-aside { overflow: visible; display: block; }
  .ed-assistant { height: auto; display: block; }
  .ed-assistant-card { height: auto; }
  .ed-chat { max-height: 340px; flex: none; }
  .ed-chat-quick, .ed-chat-input { flex-shrink: unset; }
  .ed-report-layout { grid-template-columns: 1fr; }
  .ed-report-layout--assistant-collapsed { grid-template-columns: 1fr; }
  .ed-report-aside .ed-assistant-card { position: static; }
  .ed-dim-wrap { grid-template-columns: 1fr; }
  .ed-actions { grid-template-columns: repeat(3, 1fr); }
  .ed-indicator-row { grid-template-columns: 1fr auto; gap: 6px; }
  .ed-indicator-row__dim { grid-column: 1; }
}
@media (max-width: 768px) {
  .ed-topbar { flex-direction: column; }
  .ed-actions { grid-template-columns: 1fr; }
  .ed-metrics { grid-template-columns: repeat(2, 1fr); }
  .ed-matrix { grid-template-columns: repeat(2, 1fr); }
}

/* 证据链摘要区 */
.ed-evidence-summary { background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 14px; }
.ed-ev-summary-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: var(--font-size-sm); }
.ed-ev-summary-row:last-child { margin-bottom: 0; }
.ed-ev-summary-row .ed-ev-label { flex-shrink: 0; width: 60px; color: var(--text-tertiary); font-weight: 500; }

/* 证据链解释区 */
.ed-evidence-explain { margin-bottom: 14px; }
.ed-explain-section { margin-bottom: 12px; }
.ed-explain-section h4 { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.ed-explain-section p { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin: 0; }

.ed-evidence-detail-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: 0 0 8px; padding-top: 8px; border-top: 1px solid var(--border-default); }

/* AI助手摘要区 */
.ed-assistant__summary { background: #f8fafc; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; border-left: 3px solid var(--color-primary); }
.ed-assistant__summary__badge { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.ed-assistant__summary__dim { font-size: 11px; color: var(--text-tertiary); }
.ed-assistant__summary__fact { font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.5; }
.ed-empty { display: flex; align-items: center; justify-content: center; min-height: 60vh; color: var(--text-tertiary); font-size: var(--font-size-body); }
.ed-empty a { color: var(--color-primary); text-decoration: underline; }

</style>

