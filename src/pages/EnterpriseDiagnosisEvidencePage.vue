<template>
  <div class="ede-page">
    <!-- 顶部栏 -->
    <div class="ede-topbar">
      <el-button class="ede-back-btn" circle @click="goBack" title="返回诊断报告">
        <el-icon :size="14"><ArrowLeft /></el-icon>
      </el-button>
      <div class="ede-topbar__info">
        <h1 class="ede-topbar__name">{{ r.enterprise?.name || '—' }}</h1>
        <div class="ede-topbar__meta">
          <span class="ede-topbar__indicator">{{ indicator?.name || '—' }}</span>
          <span class="ede-level" :class="'ede-level--' + (indicator?.level || 'low')">{{ levelText }}</span>
          <span class="ede-topbar__dim">{{ indicator?.dimensionName || '—' }}</span>
          <span class="ede-topbar__fact">{{ indicator?.fact || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="ede-layout">
      <!-- 左侧主内容 -->
      <main class="ede-main">
        <!-- 风险结论 -->
        <section class="ede-card">
          <h3 class="ede-section-title">风险结论</h3>
          <p class="ede-conclusion">{{ conclusionText }}</p>
        </section>

        <!-- 数据事实 -->
        <section class="ede-card">
          <h3 class="ede-section-title">数据事实</h3>
          <p class="ede-fact">{{ indicator?.fact || '暂无数据' }}</p>
        </section>

        <!-- 模型规则 -->
        <section class="ede-card">
          <h3 class="ede-section-title">模型规则</h3>
          <p class="ede-rule">{{ ruleText }}</p>
        </section>

        <!-- 推理过程 -->
        <section class="ede-card">
          <h3 class="ede-section-title">推理过程</h3>
          <p class="ede-reasoning">{{ reasoningText }}</p>
        </section>

        <!-- 指标数据明细 -->
        <section class="ede-card">
          <h3 class="ede-section-title">指标数据明细</h3>
          <div v-for="eid in indicator?.evidenceIds || []" :key="eid" class="ede-evidence-card">
            <template v-if="r.evidenceChain && r.evidenceChain[eid]">
              <div class="ede-evidence-header">
                <strong>{{ r.evidenceChain[eid].title }}</strong>
                <span class="ede-badge ede-badge--source">{{ r.evidenceChain[eid].source }}</span>
              </div>
              <div class="ede-evidence-body">
                <div class="ede-ev-row"><span class="ede-ev-label">数值</span>{{ r.evidenceChain[eid].value }}</div>
                <div class="ede-ev-row"><span class="ede-ev-label">对比</span>{{ r.evidenceChain[eid].comparison }}</div>
                <div class="ede-ev-row"><span class="ede-ev-label">采集时间</span>{{ r.evidenceChain[eid].collectedAt }}</div>
                <div class="ede-ev-row"><span class="ede-ev-label">置信度</span>{{ Math.round(r.evidenceChain[eid].confidence * 100) }}%</div>
              </div>
            </template>
          </div>
        </section>
      </main>

      <!-- 右侧辅助面板 -->
      <aside class="ede-aside">
        <!-- 指标说明 -->
        <section class="ede-card ede-aside-card">
          <h3 class="ede-section-title">指标说明</h3>
          <div class="ede-meta-info">
            <div class="ede-meta-row"><span class="ede-meta-label">所属维度</span><span>{{ indicator?.dimensionName || '—' }}</span></div>
            <div class="ede-meta-row"><span class="ede-meta-label">风险等级</span><span class="ede-level" :class="'ede-level--' + (indicator?.level || 'low')">{{ levelText }}</span></div>
            <div class="ede-meta-row"><span class="ede-meta-label">指标类型</span><span>{{ indicator?.type === 'risk' ? '风险项' : '亮点项' }}</span></div>
            <div class="ede-meta-row"><span class="ede-meta-label">证据条数</span><span>{{ (indicator?.evidenceIds || []).length }} 条</span></div>
          </div>
        </section>

        <!-- 行动建议 -->
        <section class="ede-card ede-aside-card">
          <h3 class="ede-section-title">行动建议</h3>
          <ul class="ede-actions-list">
            <li v-for="(a, i) in actionSuggestions" :key="i">{{ a }}</li>
          </ul>
        </section>

        <!-- AI 证据链助手 -->
        <section class="ede-card ede-aside-card ede-ai-card">
          <h3 class="ede-section-title">AI 证据链助手</h3>
          <div class="ede-ai-input-wrap">
            <input v-model="aiInput" class="ede-ai-input" placeholder="输入问题…" @keydown.enter="sendAiMessage" />
            <el-button type="primary" size="small" @click="sendAiMessage">发送</el-button>
          </div>
          <div class="ede-ai-messages" ref="aiMsgRef">
            <div v-for="(msg, idx) in aiMessages" :key="idx" class="ede-ai-msg" :class="msg.role">
              <div class="ede-ai-msg-bubble" v-html="renderMd(msg.text)"></div>
            </div>
          </div>
          <div class="ede-ai-actions">
            <el-button size="small" text @click="addToReport">加入报告</el-button>
            <el-button size="small" text @click="generateNote">生成专项说明</el-button>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useDiagnosisStore } from '../stores/enterpriseDiagnosis.js'
import { getDiagnosisMock } from '../data/mockEnterpriseDiagnosis.js'

const route = useRoute()
const router = useRouter()
const store = useDiagnosisStore()

const creditCode = route.params.creditCode || '91130203MA7EEQ2N0T'
const indicatorId = route.params.indicatorId

const mock = ref(getDiagnosisMock(creditCode))
const r = computed(() => mock.value || {})

const indicator = computed(() => {
  return (r.value.allIndicators || []).find(i => i.id === indicatorId)
    || (r.value.riskItems || []).find(i => i.id === indicatorId)
    || (r.value.highlightItems || []).find(i => i.id === indicatorId)
})

const levelText = computed(() => {
  if (!indicator.value) return '—'
  const ind = indicator.value
  if (ind.type === 'risk') return { high: '高风险', medium: '中风险', low: '低风险' }[ind.level] || ind.level
  return { strong: '强亮点', normal: '亮点' }[ind.level] || ind.level
})

const conclusionText = computed(() => {
  if (!indicator.value) return '暂无结论'
  const ind = indicator.value
  return `根据${ind.dimensionName}相关数据分析，判定"${ind.name}"为${levelText.value}。依据：${ind.fact}。建议在授信审批时重点关注并核实相关情况。`
})

const ruleText = computed(() => {
  if (!indicator.value) return '—'
  const ind = indicator.value
  return `该指标根据企业${ind.dimensionName}相关数据，结合行业均值和阈值规则自动判定。当实际值偏离行业正常范围超过设定阈值时，系统自动标记为${levelText.value}。`
})

const reasoningText = computed(() => {
  if (!indicator.value) return '—'
  const ind = indicator.value
  return `基于${ind.evidenceIds?.length || 0}条证据记录，综合分析${ind.dimensionName}维度下的各项指标数据。${ind.fact}，该情况直接影响了${ind.dimensionName}维度的评分，进而影响综合风险判断。`
})

const actionSuggestions = computed(() => {
  if (!indicator.value) return []
  const ind = indicator.value
  return [
    `要求企业提供${ind.dimensionName}相关补充材料`,
    `实地尽调时重点核实"${ind.name}"相关情况`,
    ind.type === 'risk' ? '如情况属实，在授信方案中纳入风险溢价考量' : '该亮点可作为授信审批的正面参考',
  ]
})

// AI assistant
const aiInput = ref('')
const aiMessages = ref([])
const aiMsgRef = ref(null)

function sendAiMessage() {
  if (!aiInput.value.trim()) return
  const text = aiInput.value.trim()
  aiMessages.value.push({ role: 'user', text })
  aiInput.value = ''

  // Simple simulated reply
  setTimeout(() => {
    const ind = indicator.value
    aiMessages.value.push({
      role: 'ai',
      text: `关于"${ind?.name || '该指标'}"的证据链分析：\n\n基于现有 ${ind?.evidenceIds?.length || 0} 条证据记录，${ind?.fact || '暂无数据'}。建议进一步核实相关情况。`,
    })
    scrollToBottom()
  }, 800)
}

function scrollToBottom() {
  nextTick(() => {
    if (aiMsgRef.value) aiMsgRef.value.scrollTop = aiMsgRef.value.scrollHeight
  })
}

function renderMd(text) {
  if (!text) return ''
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

function addToReport() {
  store.logOperation('加入报告-' + (indicator.value?.name || ''), 'click')
  aiMessages.value.push({ role: 'ai', text: `已将「${indicator.value?.name || '该指标'}」加入报告草稿。` })
}

function generateNote() {
  const ind = indicator.value
  aiMessages.value.push({
    role: 'ai',
    text: `**${ind?.name || '该指标'} 专项说明**\n\n经核查，该企业在${ind?.dimensionName || '相关'}指标上存在以下情况：\n\n1. 数据来源：基于近12个月相关数据分析\n2. 风险等级：${levelText.value}\n3. 事实依据：${ind?.fact || '暂无'}\n\n本说明仅供参考，最终结论请以实地尽调为准。`,
  })
  scrollToBottom()
}

function goBack() {
  router.push(`/enterprise-diagnosis/report/${creditCode}`)
}
</script>

<style scoped>
.ede-page { padding: var(--space-xl) var(--space-3xl); max-width: 1280px; margin: 0 auto; }

/* 顶部栏 */
.ede-topbar { display: flex; align-items: center; gap: 16px; margin-bottom: var(--space-lg); }
.ede-back-btn { width: 32px; height: 32px; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ede-topbar__info { flex: 1; min-width: 0; }
.ede-topbar__name { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.ede-topbar__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: var(--font-size-sm); color: var(--text-secondary); }
.ede-topbar__indicator { font-weight: 600; color: var(--text-primary); }

/* 等级标签 */
.ede-level { display: inline-block; padding: 1px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 500; }
.ede-level--high { background: var(--color-danger-bg); color: var(--color-danger); }
.ede-level--medium { background: var(--color-warning-bg); color: var(--color-warning); }
.ede-level--low { background: var(--color-success-bg); color: var(--color-success); }
.ede-level--strong { background: var(--color-success-bg); color: var(--color-success); font-weight: 600; }

/* 两栏布局 */
.ede-layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; align-items: start; }
.ede-main { display: flex; flex-direction: column; gap: 16px; }
.ede-aside { display: flex; flex-direction: column; gap: 16px; }

/* 卡片 */
.ede-card { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 14px; }
.ede-section-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: 0 0 10px; }

.ede-conclusion, .ede-fact, .ede-rule, .ede-reasoning { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin: 0; }
.ede-conclusion { background: #f8fafc; padding: 10px; border-radius: 6px; }

/* 证据卡片 */
.ede-evidence-card { background: #fff; border: 1px solid var(--border-default); border-radius: 6px; padding: 10px; margin-bottom: 8px; }
.ede-evidence-card:last-child { margin-bottom: 0; }
.ede-evidence-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ede-evidence-header strong { font-size: var(--font-size-sm); }
.ede-evidence-body { font-size: var(--font-size-xs); color: var(--text-secondary); }
.ede-ev-row { display: flex; padding: 2px 0; }
.ede-ev-label { width: 60px; flex-shrink: 0; color: var(--text-tertiary); font-weight: 500; }

/* 辅助面板 */
.ede-aside-card {}
.ede-meta-info { font-size: var(--font-size-sm); }
.ede-meta-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.ede-meta-label { width: 64px; flex-shrink: 0; color: var(--text-tertiary); font-weight: 500; }

.ede-actions-list { font-size: var(--font-size-sm); color: var(--text-secondary); padding-left: 18px; margin: 0; }
.ede-actions-list li { margin-bottom: 4px; line-height: 1.5; }

/* AI 助手 */
.ede-ai-card {}
.ede-ai-input-wrap { display: flex; gap: 6px; margin-bottom: 10px; }
.ede-ai-input { flex: 1; border: 1px solid var(--border-default); border-radius: 6px; padding: 6px 10px; font-size: var(--font-size-sm); outline: none; }
.ede-ai-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08); }
.ede-ai-messages { max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.ede-ai-msg { max-width: 95%; }
.ede-ai-msg.user { align-self: flex-end; }
.ede-ai-msg.user .ede-ai-msg-bubble { background: var(--color-primary); color: #fff; }
.ede-ai-msg.ai .ede-ai-msg-bubble { background: #f1f5f9; color: #344054; }
.ede-ai-msg-bubble { padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-xs); line-height: 1.5; }
.ede-ai-actions { display: flex; gap: 4px; border-top: 1px solid var(--border-default); padding-top: 8px; }

.ede-badge { padding: 1px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 500; }
.ede-badge--source { background: var(--color-primary-bg); color: var(--color-primary); }

@media (max-width: 1200px) {
  .ede-layout { grid-template-columns: 1fr; }
  .ede-page { padding: var(--space-lg); }
}
</style>
