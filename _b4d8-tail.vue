<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDiagnosisMock, enterpriseDB, evidenceChain, indicators } from '../data/mockEnterpriseDiagnosis.js'
import { enterpriseSourceData, findEnterpriseFromText, getEnterpriseSourceData, getDataCoverage, getTaxDeclarationRows, getShareholderRows, calculateVatBurden } from '../data/mockEnterpriseSourceData.js'

const route = useRoute()
const router = useRouter()

// ══ 企业识别：支持 _new 状态 ══
const isNewMode = route.params.creditCode === '_new'
let initialCreditCode = isNewMode ? null : (route.params.creditCode || null)
const questionParam = route.query.q || ''

const creditCode = ref(initialCreditCode)
const sourceData = ref(null)
const coverage = ref(null)
const isIdentityNeeded = ref(isNewMode && !questionParam)
const pendingQuestion = ref(isNewMode && questionParam ? questionParam : '')

function initDataFor(code) {
  creditCode.value = code
  sourceData.value = getEnterpriseSourceData(code)
  const cov = getDataCoverage(code)
  coverage.value = cov || { business: true, judicial: true, tax: false, flow: false, socialSecurity: false }
  const mock = getDiagnosisMock(code)
  if (mock) {
    mockData.value = mock
    enterprise.value = mock.enterprise || enterpriseDB[0] || null
  } else if (sourceData.value) {
    enterprise.value = { name: sourceData.value.identity.name, creditCode: code, industry: sourceData.value.identity.industry, legalRep: sourceData.value.identity.legalRep, establishedYear: sourceData.value.identity.establishedYear }
  }
  hasTaxData.value = coverage.value?.tax || false
  hasFlowData.value = coverage.value?.flow || false
}

function buildDataCoverageList(cov) {
  if (!cov) return []
  return [
    { label: '工商', status: cov.business ? 'ok' : 'missing', statusText: cov.business ? '已获取' : '缺失' },
    { label: '司法', status: cov.judicial ? 'ok' : 'missing', statusText: cov.judicial ? '已获取' : '缺失' },
    { label: '税票', status: cov.tax ? 'ok' : 'missing', statusText: cov.tax ? '已授权' : '未授权' },
    { label: '流水', status: cov.flow ? 'ok' : 'missing', statusText: cov.flow ? '已获取' : '缺失' },
  ]
}

const mockData = ref({})
const enterprise = ref({ name: '', creditCode: '', industry: '', legalRep: '', establishedYear: '' })
const currentQuestion = ref(questionParam)
const hasTaxData = ref(false)
const hasFlowData = ref(false)
const hasMissingData = computed(() => !hasTaxData.value || !hasFlowData.value)

if (initialCreditCode) initDataFor(initialCreditCode)
else if (questionParam && isNewMode) {
  // _new mode with a question: enter workspace, AI will ask for enterprise
  isIdentityNeeded.value = true
}

const dataCoverage = computed(() => coverage.value ? buildDataCoverageList(coverage.value) : [])

const explorationPhase = ref('idle') // idle → identifying → checking → judging → rendering → done

const phaseOrder = ['idle', 'identifying', 'checking', 'judging', 'rendering', 'done']
function phasePassed(name) { return phaseOrder.indexOf(explorationPhase.value) > phaseOrder.indexOf(name) }

const engineSteps = computed(() => [
  { title: '加载企业基础信息', desc: '工商登记、注册信息', status: explorationPhase.value === 'identifying' ? 'active' : (phasePassed('identifying') ? 'done' : 'pending') },
  { title: '查询税票数据', desc: '增值税开票、纳税申报', status: explorationPhase.value === 'checking' ? 'active' : (phasePassed('checking') ? 'done' : 'pending') },
  { title: '分析诊断维度', desc: '经营分析、风险检测', status: explorationPhase.value === 'judging' ? 'active' : (phasePassed('judging') ? 'done' : 'pending') },
  { title: '渲染结果视图', desc: '关键数据、异常信号', status: explorationPhase.value === 'rendering' ? 'active' : (phasePassed('rendering') ? 'done' : 'pending') },
])

const engineAllDone = computed(() => explorationPhase.value === 'done')

const currentView = ref('overview')
const currentViewTitle = computed(() => ({
  overview: '企业概览', ops: '经营分析', tax: '税票/纳税明细',
  risk: '风险诊断', fraud: '欺诈信号识别', evidence: '证据链',
  taxDeclarations: '申报明细', shareholders: '股东明细', socialSecurity: '从业/社保概览',
}[currentView.value] || '企业概览'))

const taxDeclarationRows = computed(() => creditCode.value ? getTaxDeclarationRows(creditCode.value) : [])
const shareholderRows = computed(() => creditCode.value ? getShareholderRows(creditCode.value) : [])

const highRiskCount = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'high').length)
const mediumRiskCount = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'medium').length)
const lowRiskCount = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'low').length)
const highlightCount = computed(() => (mockData.value?.highlightItems || []).length)
const highRiskItems = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'high'))
const topEvidences = computed(() => indicators.filter(i => i.level === 'high').flatMap(i => i.evidenceIds).slice(0, 6).map(id => evidenceChain[id]).filter(Boolean))

const chatInput = ref('')
const chatMessages = ref([])
const chatRef = ref(null)
const isExploring = ref(false)
const hasResult = ref(false)

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function typeAiMessage(fullText, options = {}) {
  const msg = { role: 'ai', text: '' }
  chatMessages.value.push(msg)
  for (let i = 1; i <= fullText.length; i++) {
    msg.text = fullText.slice(0, i)
    await delay(18)
  }
  if (options.actions) msg.actions = options.actions
  scrollToBottom()
  return msg
}

// ══ 问题类型分类 ══
function classifyQuestion(text) {
  const q = text.toLowerCase()

  // 报告类
  if (/生成.*工商.*报告|生成工商分析报告/.test(q)) return { type: 'report_business', viewName: '工商分析报告', newView: 'overview' }
  if (/生成.*纳税.*报告|生成纳税全景报告/.test(q)) return { type: 'report_tax', viewName: '纳税全景报告', newView: 'tax' }
  if (/生成.*诊断.*报告|生成企业诊断报告/.test(q)) return { type: 'report_diagnosis', viewName: '企业诊断报告', newView: 'risk' }
  if (/生成.*报告/.test(q)) return { type: 'report_diagnosis', viewName: '企业诊断报告', newView: 'risk' }

  // 明细类 — 左侧打开表格
  if (/股东|出资|持股/.test(q)) return { type: 'detail_shareholders', viewName: '股东明细', newView: 'shareholders' }
  if (/社保|缴保|从业人数/.test(q)) return { type: 'detail_social_security', viewName: '从业/社保概览', newView: 'socialSecurity' }
  if (/申报信息明细|申报记录|近12个月申报/.test(q)) return { type: 'detail_tax_declarations', viewName: '申报明细', newView: 'taxDeclarations' }

  // 指标计算类 — 对话中回答
  if (/税负率|计算税负|税负是多少/.test(q)) return { type: 'metric_tax_burden', viewName: '税负率' }
  if (/收入同比|收入增长/.test(q)) return { type: 'metric_revenue', viewName: '收入指标' }

  // 复杂分析类 — 左侧打开结构化视图
  if (/经营情况|经营分析|营收趋势|经营如何/.test(q)) return { type: 'analysis_ops', viewName: '经营分析', newView: 'ops' }
  if (/纳税全景|纳税分析/.test(q)) return { type: 'analysis_tax', viewName: '纳税全景', newView: 'tax' }
  if (/欺诈|虚假|真实性|票税流/.test(q)) return { type: 'analysis_fraud', viewName: '欺诈信号识别', newView: 'fraud' }
  if (/风险|诊断|高风险/.test(q)) return { type: 'analysis_risk', viewName: '风险诊断', newView: 'risk' }
  if (/证据|依据/.test(q)) return { type: 'evidence', viewName: '证据链', newView: 'evidence' }

  // 工商/司法分析
  if (/工商|法人|成立|股权|司法/.test(q)) return { type: 'analysis_ops', viewName: '工商分析', newView: 'overview' }

  // 法人/行业等基本信息（简单事实）
  if (/法人|成立时间|成立年份|行业|纳税人类型/.test(q)) return { type: 'fact_basic', viewName: '工商信息' }

  return { type: 'analysis_ops', viewName: '企业概览', newView: 'overview' }
}

// 只在对话中回答的类型（不打开左侧视图）
const chatOnlyTypes = ['fact_basic', 'metric_tax_burden', 'metric_revenue']
// 需要打开左侧明细视图的类型
const detailTypes = ['detail_shareholders', 'detail_social_security', 'detail_tax_declarations']
// 需要打开左侧分析视图的类型
const analysisTypes = ['analysis_ops', 'analysis_tax', 'analysis_fraud', 'analysis_risk', 'evidence', 'report_business', 'report_tax', 'report_diagnosis']

async function runExploreFlow(text) {
  if (isExploring.value) return
  isExploring.value = true
  const qa = classifyQuestion(text)
  const shouldRunFullEngine = !hasResult.value

  // ══ 只在对话中回答 ══
  if (chatOnlyTypes.includes(qa.type)) {
    const reply = buildChatReply(qa, text)
    await typeAiMessage(reply, { actions: buildChatActions(qa.type) })
    isExploring.value = false
    return
  }

  // ══ 明细类：左侧打开表格，右侧一句话说明 ══
  if (detailTypes.includes(qa.type)) {
    const viewName = qa.viewName
    const newView = qa.newView
    // 数据缺失检查
    if (qa.type === 'detail_tax_declarations' && !hasTaxData.value) {
      await typeAiMessage('当前**税票数据未授权**，无法查看申报明细。请先授权税票。', {
        actions: [{ label: '授权税票', action: 'auth', type: 'warning' }]
      })
      isExploring.value = false
      return
    }
    if (qa.type === 'detail_shareholders' && !sourceData.value) {
      await typeAiMessage('当前数据未加载，请刷新页面。')
      isExploring.value = false
      return
    }
    currentView.value = newView
    if (!hasResult.value) hasResult.value = true
    const detailLabels = { detail_shareholders: '股东明细', detail_tax_declarations: '近12个月申报明细', detail_social_security: '从业/社保概览' }
    await typeAiMessage('已为你打开**' + (detailLabels[qa.type] || viewName) + '**，数据来源见左侧。')
    isExploring.value = false
    return
  }

  // ══ 报告类 ══
  if (qa.type.startsWith('report_')) {
    await handleReportRequest(text)
    isExploring.value = false
    return
  }

  // ══ 复杂分析：走引擎流程，打开左侧视图 ══
  const newView = qa.newView || 'overview'
  const viewName = qa.viewName

  if (shouldRunFullEngine) {
    await typeAiMessage('我先识别企业，并检查可用数据范围。')
    await delay(300)

    chatMessages.value.push({ role: 'ai', type: 'engine' })
    explorationPhase.value = 'identifying'
    scrollToBottom()
    await delay(600)

    explorationPhase.value = 'checking'
    scrollToBottom()
    await delay(600)

    explorationPhase.value = 'judging'
    scrollToBottom()
    await delay(600)

    explorationPhase.value = 'rendering'
    scrollToBottom()
    await delay(400)

    explorationPhase.value = 'done'

    const summaryText = buildAnalysisSummary(qa)
    await typeAiMessage(summaryText, { actions: buildMsgActions(newView) })
    await delay(300)

    currentView.value = newView
    hasResult.value = true
  } else {
    await typeAiMessage('正在查看「' + viewName + '」。', { actions: buildMsgActions(newView) })
    currentView.value = newView
  }

  isExploring.value = false
}

// ══ 事实查询 / 指标计算的对话回复（使用源数据） ══
function buildChatReply(qa, text) {
  const q = text.toLowerCase()
  const src = sourceData.value
  if (!src) return '当前数据未加载，请刷新页面。'
  const cov = coverage.value || {}

  // ══ 事实查询 ══
  if (/股东|出资|持股/.test(q)) {
    const rows = getShareholderRows(creditCode.value)
    if (!rows.length) return '未找到该企业的股东信息。'
    let reply = '已找到**' + enterprise.value.name + '**的股东信息：\n'
    rows.forEach(r => { reply += '\n• **' + r.name + '**，持股 ' + r.ratio + '%，认缴出资 ' + r.amount + ' 万元' })
    reply += '\n\n数据来源：工商登记信息（企业年度申报附表）。'
    return reply
  }

  if (/社保|缴保/.test(q)) {
    const ss = src.socialSecurity
    if (ss) {
      return '**' + enterprise.value.name + '**的社保/从业信息：\n\n• **从业人数**：' + ss.employeeCount + ' 人\n• **说明**：' + ss.note + '\n\n数据来源：企业所得税申报附表（104从业人数）。' +
        (ss.isEstimated ? '\n\n（注：此为从业人数概览，非完整社保费明细。）' : '')
    }
    return '当前暂未获取社保数据。'
  }

  if (/申报信息明细/.test(q)) {
    if (!cov.tax) {
      return '当前**税票数据未授权**，无法查看申报明细。\n\n请先授权税票数据。'
    }
    const rows = getTaxDeclarationRows(creditCode.value, 6)
    if (!rows.length) return '未找到申报记录。'
    let reply = '近12个月申报明细摘要（前' + rows.length + '条）：\n'
    rows.slice(0, 4).forEach(r => {
      reply += '\n• ' + r.periodEnd.substring(0, 7) + ' | ' + r.project + ' | 销售额 ' + formatNum(r.salesAmount) + ' | 应纳税额 ' + formatNum(r.taxAmount)
    })
    reply += '\n\n数据来源：增值税纳税申报系统。'
    return reply
  }

  if (/法人|成立时间|成立年份/.test(q)) {
    const id = src.identity
    return '**' + id.name + '**的基本信息：\n\n• **法人**：' + id.legalRep + '\n• **成立年份**：' + id.establishedYear + '年\n• **行业**：' + id.industry + '\n• **纳税人类型**：' + id.taxpayerType + '\n• **信用代码**：' + id.creditCode + '\n\n数据来源：国家企业信用信息公示系统。'
  }

  if (/客户|供应商/.test(q)) {
    return '当前仅能获取**' + enterprise.value.name + '**的基本工商信息。\n\n如需查看主要客户/供应商明细、购销关系和资金流分析，需要授权税票或上传流水数据。' +
      (!cov.flow ? '\n\n⚠️ 流水数据缺失，无法分析客户/供应商关系和资金流闭环。' : '')
  }

  // ══ 指标计算 ══
  if (/税负率|计算税负|税负是多少/.test(q)) {
    if (!cov.tax) {
      return '当前**税票数据未授权**，无法计算税负率。\n\n税负率 = 应纳增值税 ÷ 应税销售收入 × 100%\n\n请先授权税票数据。'
    }
    const vat = calculateVatBurden(creditCode.value)
    if (!vat) return '无法计算税负率，请检查数据。'
    return '税负率计算结果：\n\n**' + vat.formula + '**\n\n• 数据来源：增值税纳税申报系统（近12个月）\n• 行业均值：**' + vat.industryAvg + '%**（建材批发）\n• 判断：**' + vat.judgment + '**\n\n建议：查看税票和申报差异证据链，核实税负偏低原因。'
  }

  if (/收入同比|收入增长/.test(q)) {
    const m = src.metrics
    return '近12个月营收指标：\n\n• 2025应税收入：**' + m.invoiceIncome + '万元**\n• 同比增速：**' + m.revenueYoY + '%**（行业均值 12.5%）\n• 数据来源：增值税开票系统 + 纳税申报\n• 判断：**增长过快**，购销两头在外，收入真实性存疑\n\n建议：查看购销合同和资金流验证收入真实性。'
  }

  if (/差异/.test(q)) {
    if (!cov.tax) return '当前税票未授权，无法计算差异。请先授权税票数据。'
    const m = src.metrics
    return '开票与申报差异：\n\n• 开票收入：**' + m.invoiceIncome + '万元**\n• 申报收入：**' + m.declaredIncome + '万元**\n• 差异：**' + formatNum((m.invoiceIncome - m.declaredIncome) * 10000) + '元（' + m.declarationDiffRate + '%）**\n• 数据来源：增值税发票系统 + 纳税申报\n• 判断：**存在差异**，需核实原因'
  }

  return '已收到你的问题，当前正在分析中。你可以继续追问或查看具体维度。'
}

function formatNum(n) {
  if (n == null || n === 0) return '0'
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(2) + '万'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function buildChatActions(type) {
  if (type === 'fact_basic' || type === 'detail_shareholders' || type === 'detail_tax_declarations' || type === 'detail_social_security') {
    const base = [{ label: '查看证据来源', action: 'evidence' }, { label: '加入报告', action: 'report' }]
    if (!hasTaxData.value) base.push({ label: '授权税票', action: 'auth', type: 'warning' })
    return base
  }
  if (type === 'metric_tax_burden' || type === 'metric_revenue') {
    const base = [{ label: '查看证据链', action: 'evidence' }, { label: '加入报告', action: 'report' }]
    if (!hasTaxData.value) base.push({ label: '授权税票', action: 'auth', type: 'warning' })
    return base
  }
  return []
}

// ══ 复杂分析结果摘要 ══
function buildAnalysisSummary(qa) {
  const viewName = qa.viewName
  const summaries = {
    analysis_ops: '已完成「' + viewName + '」。近12个月营收增长' + (sourceData.value?.metrics?.revenueYoY || '—') + '%，显著高于行业均值12.5%。但购销两头在外、流水缺失，收入真实性需要补充验证。',
    analysis_tax: '已完成「' + viewName + '」。增值税税负率' + (sourceData.value?.metrics?.vatBurdenRate || '—') + '%，仅为行业均值29%。纳税信用A级为亮点。开票与申报差异' + (sourceData.value?.metrics?.declarationDiffRate || '—') + '%需核实。',
    analysis_risk: '已完成「' + viewName + '」。综合评分' + (mockData.value?.score || '—') + '，评级' + (mockData.value?.grade || '—') + '。共' + (mockData.value?.riskItems?.length || 0) + '项风险信号（高风险' + highRiskCount.value + '项）、' + (mockData.value?.highlightItems?.length || 0) + '项企业亮点。建议重点核实高风险事项后再推进授信。',
    analysis_fraud: '已完成「' + viewName + '」。三项欺诈信号叠加：购销两头在外、票税差异、电费与收入不匹配。业务真实性需重点核实。',
    evidence: '已完成「' + viewName + '」。已展示' + highRiskCount.value + '项高风险指标的证据链，共' + topEvidences.value.length + '条核心证据，置信度75%-96%。',
  }
  let text = summaries[qa.type] || ('已完成「' + viewName + '」分析。')
  if (!hasFlowData.value && (qa.type === 'analysis_fraud' || qa.type === 'analysis_ops')) {
    text += '\n\n**流水缺失**，完整判断需要上传流水。'
  }
  if (!hasTaxData.value && qa.type === 'analysis_tax') {
    text = '当前**税票数据未授权**，无法展示纳税全景。请先授权税票数据。'
  }
  return text
}

// ══ 报告请求处理 ══
async function handleReportRequest(text) {
  if (/工商|工商分析/.test(text)) {
    await typeAiMessage('已为你生成**工商分析报告**（Demo）。基于工商登记和司法公开数据，包含企业基本信息、股权结构、司法风险等内容。', {
      actions: [
        { label: '查看报告详情', action: 'report_detail' },
        { label: '加入尽调任务', action: 'dd' },
      ]
    })
    return
  }
  if (/纳税|税票/.test(text)) {
    if (!hasTaxData.value) {
      await typeAiMessage('当前**税票数据未授权**，无法生成纳税全景报告。\n\n请先授权税票数据后，系统将生成包含税负分析、申报明细、开票差异等内容的纳税全景报告。', {
        actions: [{ label: '授权税票', action: 'auth', type: 'warning' }]
      })
      return
    }
    await typeAiMessage('已为你生成**纳税全景报告**（Demo）。包含近12个月税负率趋势、申报明细对比、开票差异分析等内容。', {
      actions: [
        { label: '查看报告详情', action: 'report_detail' },
        { label: '查看税负率计算', action: 'explain' },
      ]
    })
    return
  }
  // 默认：企业诊断报告
  if (!hasFlowData.value) {
    await typeAiMessage('当前数据覆盖不足以生成完整的企业诊断报告。\n\n已获取：工商、司法' + (hasTaxData.value ? '、税票' : '') + '。\n缺失：流水。\n\n上传流水后可增强经营真实性和欺诈识别判断。', {
      actions: [
        { label: '查看工商分析报告', action: 'report_business' },
        { label: '上传流水', action: 'upload', type: 'warning' },
      ]
    })
    return
  }
  await typeAiMessage('已为你生成**企业诊断报告**（Demo）。包含经营、税票、风险、欺诈、证据链等全维度分析。', {
    actions: [
      { label: '查看报告详情', action: 'report_detail' },
      { label: '推送尽调', action: 'dd' },
    ]
  })
}

onMounted(() => {
  if (isNewMode && !creditCode.value) {
    // _new 模式：根据 pendingQuestion 给出上下文感知的提示
    const pq = pendingQuestion.value
    let hintMsg = '我可以帮你探查企业经营、工商、税票、股东、申报和风险证据链。请先输入企业名称或统一社会信用代码。'
    if (pq) {
      const pqType = classifyQuestion(pq)
      if (pqType.type === 'detail_tax_declarations') {
        hintMsg = '我可以帮你查看申报明细。请先输入企业名称或统一社会信用代码。'
      } else if (pqType.type === 'metric_tax_burden') {
        hintMsg = '我可以帮你计算税负率。请先输入企业名称或统一社会信用代码。'
      } else if (pqType.type === 'detail_shareholders') {
        hintMsg = '我可以帮你查看股东信息。请先输入企业名称或统一社会信用代码。'
      } else if (pqType.type === 'detail_social_security') {
        hintMsg = '我可以帮你查看社保费明细。请先输入企业名称或统一社会信用代码。'
      }
    }
    chatMessages.value.push({ role: 'ai', text: hintMsg })
    return
  }
  if (currentQuestion.value) {
    chatMessages.value.push({ role: 'user', text: currentQuestion.value })
    runExploreFlow(currentQuestion.value)
  }
})

async function sendChat() {
  const text = chatInput.value.trim()
  if (!text || isExploring.value) return
  chatInput.value = ''
  chatMessages.value.push({ role: 'user', text })

  // 如果企业未识别，先尝试识别
  if (!creditCode.value) {
    const found = findEnterpriseFromText(text)
    if (found && enterpriseSourceData[found.creditCode]) {
      initDataFor(found.creditCode)
      isIdentityNeeded.value = false

      // 构建数据覆盖描述
      const covList = (coverage.value ? Object.entries(coverage.value).filter(([k,v]) => k !== 'name').map(([k,v]) => {
        const labels = { business: '工商', judicial: '司法', tax: '税票', flow: '流水', socialSecurity: '社保' }
        return labels[k] + (v ? '已获取' : '缺失')
      }).join('、') : '数据加载中')

      if (pendingQuestion.value) {
        // 有待处理问题：继续执行
        const origQ = pendingQuestion.value
        pendingQuestion.value = ''
        await typeAiMessage('已识别企业：**' + enterprise.value.name + '**。\n当前数据覆盖：' + covList + '。\n我将继续处理你的问题。')
        await delay(300)
        chatMessages.value.push({ role: 'user', text: origQ })
        runExploreFlow(origQ)
      } else {
        typeAiMessage('已识别企业：**' + enterprise.value.name + '**。\n当前数据覆盖：' + covList + '。\n你可以继续问：税负率是多少、查看申报明细、查看股东明细、是否存在欺诈风险。')
      }
    } else {
      typeAiMessage('当前 Demo 只内置了少量企业样例，请输入：唐山物桥商贸有限公司 或 91130203MA7EEQ2N0T。')
    }
    return
  }

  runExploreFlow(text)
}

function buildMsgActions(view) {
  const base = [
    { label: '查看证据链', action: 'evidence' },
    { label: '生成专项说明', action: 'explain' },
    { label: '加入报告', action: 'report' },
  ]
  if (view === 'risk') base.push({ label: '推送尽调', action: 'dd' })
  if (!hasTaxData.value) base.push({ label: '授权税票', action: 'auth', type: 'warning' })
  if (!hasFlowData.value) base.push({ label: '上传流水', action: 'upload', type: 'warning' })
  return base
}

function onMsgAction(a) {
  switch (a.action) {
    case 'evidence': viewEvidenceOf('R1'); break
    case 'explain': aiAction('专项说明'); break
    case 'report': aiAction('加入报告'); break
    case 'dd': pushToDD(); break
    case 'auth': authMissing(); break
    case 'upload': uploadFlow(); break
    case 'report_detail': viewFullReport(); break
    case 'report_business':
      chatMessages.value.push({ role: 'ai', text: '正在生成**工商分析报告**（Demo）...\n\n包含企业基本信息、股权结构、司法风险等内容。' })
      scrollToBottom()
      break
  }
}

function aiAction(label) {
  if (label === '加入报告') { chatMessages.value.push({ role: 'ai', text: '已加入报告草稿。' }) }
  else if (label === '推送尽调') { pushToDD() }
  else { chatMessages.value.push({ role: 'ai', text: '**' + label + '**\n\n基于当前已获取的工商、司法' + (hasTaxData.value ? '、税票' : '') + '数据，已完成基础分析。如需更完整的判断，建议补充缺失数据后再次探查。' }) }
  scrollToBottom()
}

function viewEvidenceOf(indId) { router.push('/enterprise-diagnosis/evidence/' + creditCode.value + '/' + indId) }
function goEvidencePage() { router.push('/enterprise-diagnosis/evidence/' + creditCode.value + '/R1') }
function pushToDD() { ElMessage.info('Demo: 已将探查结果推送至尽调任务') }
function authMissing() { ElMessage.info('Demo: 已发起数据授权请求') }
function uploadFlow() { ElMessage.info('Demo: 已发起流水上传入口') }
function renderMd(text) { return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') }
function scrollToBottom() { nextTick(() => { if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight }) }
function viewFullReport() { router.push('/enterprise-diagnosis/report/' + creditCode.value) }
function generateReport() { router.push('/enterprise-diagnosis/report/' + creditCode.value) }
function gradeColor(grade) { if (['D','E','F'].includes(grade)) return 'danger'; if (grade === 'C') return 'warning'; return 'success' }
function goBack() { router.push('/enterprise-diagnosis') }
</script>

<style scoped>
/* ══ 对话优先布局 ══ */
.edw-chat-first { display: flex; flex-direction: column; height: calc(100vh - 40px); max-width: 720px; margin: 20px auto; }
.edw-chat-first__header { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-divider); margin-bottom: 12px; }
.edw-chat-first__info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; }
.edw-chat-first__name { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.edw-chat-first__tag { font-size: var(--font-size-xs); color: var(--text-secondary); background: var(--bg-subtle, #f1f5f9); padding: 2px 8px; border-radius: 999px; }
.edw-chat-first__tag--ok { background: #dcfce7; color: #16a34a; }
.edw-chat-first__tag--warn { background: #fef3c7; color: #b45309; }
.edw-chat-first__body { flex: 1; overflow-y: auto; padding: 16px 0; display: flex; flex-direction: column; gap: 10px; }
.edw-chat-first__input { display: flex; gap: 8px; padding: 12px 0; border-top: 1px solid var(--border-divider); }

/* ══ 结果模式顶部 ══ */
.edw-result-topbar { display: flex; align-items: center; gap: 12px; padding: 8px 0; margin-bottom: var(--space-md); }
.edw-result-topbar__info { flex: 1; min-width: 0; }
.edw-result-topbar__name { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
.edw-result-topbar__meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: var(--font-size-xs); color: var(--text-secondary); }
.edw-result-topbar__view { color: var(--color-primary); font-weight: 500; }
.edw-page { padding: var(--space-xl) var(--space-3xl); max-width: 1280px; margin: 0 auto; }
.edw-back-btn { width: 32px; height: 32px; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
/* ══ 结果模式布局 ══ */
.edw-result-mode { display: flex; flex-direction: column; gap: 16px; padding: 20px 28px; }
.edw-result-layout { display: grid; grid-template-columns: minmax(680px, 1fr) minmax(420px, 480px); gap: 20px; max-width: 1520px; margin: 0 auto; align-items: stretch; }

/* ══ AI 诊断引擎过程卡 ══ */
.edw-engine-card { width: 100%; max-width: 100%; background: #f8fbff; border: 1px solid #d1e3f7; border-radius: 8px; padding: 14px 16px; box-sizing: border-box; }
.edw-engine-card__header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.edw-engine-card__header strong { font-size: 13px; color: var(--text-primary); }
.edw-engine-card__header p { font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0; }
.edw-engine-spinner { width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top-color: var(--color-primary, #3b82f6); border-radius: 50%; animation: edw-spin 0.8s linear infinite; flex-shrink: 0; }
@keyframes edw-spin { to { transform: rotate(360deg); } }
.edw-engine-steps { display: flex; flex-direction: column; gap: 4px; }
.edw-engine-step { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; min-height: 34px; font-size: var(--font-size-xs); }
.edw-engine-step__icon { width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.edw-engine-step__dot--active { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary, #3b82f6); display: inline-block; animation: edw-pulse 1.5s ease-in-out infinite; }
.edw-engine-step__dot--pending { width: 6px; height: 6px; border-radius: 50%; background: #d1d5db; display: inline-block; }
.edw-engine-step--done { background: transparent; }
.edw-engine-step--done strong { color: var(--color-success); }
.edw-engine-step--done p { color: var(--color-success); }
.edw-engine-step--active { background: #eff6ff; border: 1px solid #bfdbfe; }
.edw-engine-step--active strong { color: var(--color-primary, #3b82f6); }
.edw-engine-step--active p { color: var(--text-secondary); }
.edw-engine-step:not(.edw-engine-step--done):not(.edw-engine-step--active) { background: transparent; }
.edw-engine-step:not(.edw-engine-step--done):not(.edw-engine-step--active) strong { color: var(--text-tertiary); }
.edw-engine-step:not(.edw-engine-step--done):not(.edw-engine-step--active) p { color: var(--text-tertiary); }
.edw-engine-step strong { font-size: var(--font-size-xs); margin: 0; line-height: 1.3; }
.edw-engine-step p { font-size: 11px; margin: 0; color: var(--text-secondary); line-height: 1.3; }
.edw-workspace { display: flex; flex-direction: column; gap: 14px; max-width: 1080px; width: 100%; }
.edw-view-header { display: flex; justify-content: space-between; align-items: center; }
.edw-view-title { font-size: var(--font-size-body-lg); font-weight: 600; color: var(--text-primary); margin: 0; }
.edw-view-actions { display: flex; gap: 6px; }
.edw-view-content { display: flex; flex-direction: column; gap: 16px; }
.edw-card { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px 18px; }
.edw-card h3 { font-size: var(--font-size-sm); font-weight: 600; margin: 0 0 10px; }
.edw-card--conclusion { border-left: 3px solid var(--color-primary); }
.edw-card--abnormal { border-left: 3px solid var(--color-warning); }
.edw-card-label { font-size: var(--font-size-xs); font-weight: 600; color: var(--color-primary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.edw-conclusion-text { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin: 0; }
.edw-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: var(--font-size-sm); }
.edw-meta-row { display: flex; gap: 6px; }
.edw-meta-row span:first-child { color: var(--text-tertiary); min-width: 64px; }
.edw-meta-row strong { color: var(--text-primary); }
.edw-coverage-summary { display: flex; gap: 8px; flex-wrap: wrap; }
.edw-coverage-item { font-size: var(--font-size-xs); }
.edw-coverage--ok { color: var(--color-success); }
.edw-coverage--missing { color: var(--color-warning); }
.edw-coverage--pending { color: var(--text-tertiary); }
.edw-next-list { font-size: var(--font-size-sm); color: var(--text-secondary); padding-left: 18px; margin: 0; }
.edw-next-list li { margin-bottom: 4px; line-height: 1.5; }
.edw-data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: var(--font-size-sm); }
.edw-data-cell { display: flex; gap: 6px; padding: 4px 0; }
.edw-data-cell span:first-child { color: var(--text-tertiary); min-width: 90px; }
.edw-data-cell strong { color: var(--text-primary); }
.edw-signal-list { font-size: var(--font-size-sm); color: var(--text-secondary); padding-left: 18px; margin: 0; }
.edw-signal-list li { margin-bottom: 4px; line-height: 1.5; }
.edw-signal-list--warn li { color: #b45309; }
.edw-signal-list--danger li { color: #dc2626; }
.edw-risk-summary { display: flex; gap: 8px; flex-wrap: wrap; }
.edw-risk-badge { font-size: var(--font-size-xs); padding: 2px 8px; border-radius: 999px; }
.edw-risk--high { background: #fee2e2; color: #dc2626; }
.edw-risk--medium { background: #fef3c7; color: #b45309; }
.edw-risk--low { background: #dbeafe; color: #2563eb; }
.edw-risk--good { background: #dcfce7; color: #16a34a; }
.edw-card-actions { display: flex; gap: 6px; flex-wrap: wrap; padding: 14px; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.edw-fraud-note { font-size: var(--font-size-sm); color: #dc2626; margin: 8px 0 0; }
.edw-evidence-list { display: flex; flex-direction: column; gap: 12px; }
.edw-evidence-item { padding: 10px 12px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-subtle, #f8fafc); }
.edw-ev-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.edw-ev-source { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.edw-ev-confidence { font-size: var(--font-size-xs); color: var(--color-success); font-weight: 500; margin-left: auto; }
.edw-ev-body { font-size: var(--font-size-xs); color: var(--text-secondary); }
.edw-ev-row { margin-bottom: 2px; }
.edw-ev-label { color: var(--text-tertiary); display: inline; }
.edw-chat { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; height: calc(100vh - 160px); max-height: none; position: sticky; top: 16px; width: 100%; min-width: 420px; }
.edw-chat-header { padding: 10px 12px; border-bottom: 1px solid var(--border-divider); }
.edw-chat-header h3 { margin: 0; font-size: var(--font-size-sm); color: var(--text-primary); }
.edw-chat-messages { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.edw-msg { display: flex; gap: 8px; align-items: flex-start; }
.edw-msg--ai { justify-content: flex-start; }
.edw-msg--user { justify-content: flex-end; }
.edw-msg-content { display: flex; flex-direction: column; gap: 6px; max-width: calc(100% - 40px); }
.edw-msg--ai .edw-msg-content { width: calc(100% - 40px); }
.edw-msg--user .edw-msg-content { max-width: 78%; }
.edw-msg-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-top: 2px; }
.edw-msg-avatar--ai { background: #2563eb; color: #fff; }
.edw-msg-avatar--user { background: #eef2ff; color: #1d4ed8; }
.edw-msg-bubble { padding: 8px 12px; border-radius: 10px; font-size: var(--font-size-sm); line-height: 1.55; word-break: break-word; }
.edw-msg--ai .edw-msg-bubble { background: var(--bg-subtle, #f1f5f9); color: var(--text-secondary); }
.edw-msg--user .edw-msg-bubble { background: var(--color-primary, #3b82f6); color: #fff; }
.edw-msg-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; padding-left: 0; }
.edw-engine-card { width: 100%; max-width: 100%; background: #f8fbff; border: 1px solid #d1e3f7; border-radius: 8px; padding: 14px 16px; box-sizing: border-box; }
.edw-chat-input { display: flex; gap: 6px; padding: 10px; border-top: 1px solid var(--border-divider); }
.edw-chat-field { flex: 1; padding: 6px 10px; border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: var(--font-size-sm); outline: none; }
.edw-chat-field:focus { border-color: var(--color-primary); }
.edw-danger { color: #dc2626; }
.edw-warning { color: #b45309; }
.edw-success { color: #16a34a; }
@media (max-width: 900px) { .edw-result-layout { grid-template-columns: 1fr; } .edw-chat { max-height: 400px; position: static; } }
.edw-detail-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-xs); }
.edw-detail-table th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-weight: 500; }
.edw-detail-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; }
.edw-table-note { font-size: var(--font-size-xs); color: #94a3b8; margin-top: 8px; }

</style>