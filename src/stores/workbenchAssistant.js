/**
 * 工作台 AI 助手 v2 — 意图识别 + 工具调用 + 流程编排 + 上下文记忆
 * 不替代现有业务 store，而是调用：screeningStore / dueDiligenceStore / monitorStore
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useScreeningStore } from './screening.js'
import { useDueDiligenceStore } from './dueDiligence.js'
import { useMonitorStore } from './enterpriseMonitor.js'

// ====== 8 个阶段定义 ======
const FLOW_STAGES = [
  { id: 'screen', label: '智能筛客', icon: '🔍' },
  { id: 'task', label: '创建尽调', icon: '📋' },
  { id: 'business', label: '工商校验', icon: '🏢' },
  { id: 'tax', label: '税票采集', icon: '🎫' },
  { id: 'upload', label: '资料上传', icon: '📁' },
  { id: 'analysis', label: 'AI分析', icon: '🧠' },
  { id: 'report', label: '报告确认', icon: '📝' },
  { id: 'monitor', label: '企业监控', icon: '📡' },
]

export const useWorkbenchAssistantStore = defineStore('workbenchAssistant', () => {
  // ===================== 状态 =====================
  const dialogOpen = ref(false)
  const dialogInput = ref('')
  const messages = reactive([])
  const waitingForInput = ref(false)

  // === 状态机 ===
  const currentFlowStatus = ref('idle')
  const currentStageId = ref(null)
  const activeStageId = ref(null)
  const flowStages = reactive([])
  const artifactData = reactive({})
  const currentArtifactType = ref(null)
  const selectedCustomer = ref(null)
  const candidateCustomers = reactive([])
  const lastScreeningResults = reactive([])
  const lastDueTask = ref(null)
  const pendingConfirmation = ref(null)
  const pausedReason = ref('')
  const conversationContext = reactive({})
  const flowStartedAt = ref(null)
  const flowCompletedAt = ref(null)
  const currentIntent = ref(null)
  const isThinking = ref(false)
  const thinkingText = ref('正在分析中...')

  // 兼容旧版 processSteps / sidebarMode
  const processSteps = computed(() => {
    const activeIdx = flowStages.findIndex(s => s.status === 'active')
    const doneStages = flowStages.filter(s => s.status === 'done')
    const active = activeIdx >= 0 ? flowStages[activeIdx] : null
    const steps = []
    for (const stage of doneStages) {
      if (stage.artifactData?.steps) {
        steps.push(...stage.artifactData.steps.map(s => ({ ...s, phase: stage.label })))
      }
    }
    if (active?.artifactData?.steps) {
      steps.push(...active.artifactData.steps.map(s => ({ ...s, phase: active.label })))
    }
    return steps
  })
  const sidebarMode = computed(() => currentArtifactType.value)

  // ===================== 工具 =====================
  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function withThinking(text, fn) {
    isThinking.value = true; thinkingText.value = text
    try { return await fn() } finally { isThinking.value = false }
  }

  async function pushMessage(type, text, extra = {}) {
    messages.push({ type, text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), ...extra })
  }

  async function pushStep(stageId, title, status, details = null) {
    const stage = flowStages.find(s => s.id === stageId)
    if (!stage) return
    if (!stage.artifactData) stage.artifactData = {}
    if (!stage.artifactData.steps) stage.artifactData.steps = []
    stage.artifactData.steps.push({ title, status, details, expandable: !!details, expanded: true })
  }


  // ====== Mock streaming message ======
  let streamingTimer = null
  let streamingMsgRef = null

  async function pushStreamingMessage(fullText, extra = {}) {
    // Create an AI message with empty text, streaming = true
    const msg = {
      type: 'ai',
      text: '',
      fullText,
      streaming: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      ...extra
    }
    messages.push(msg)
    streamingMsgRef = msg

    // Stream out text in chunks
    const chunkSize = 3
    let idx = 0
    return new Promise((resolve) => {
      function streamChunk() {
        if (idx < fullText.length) {
          msg.text += fullText.slice(idx, idx + chunkSize)
          idx += chunkSize
          streamingTimer = setTimeout(streamChunk, 25 + Math.random() * 20)
        } else {
          msg.streaming = false
          streamingMsgRef = null
          streamingTimer = null
          resolve()
        }
      }
      streamChunk()
    })
  }

  function updateStageStatus(stageId, status) {
    const stage = flowStages.find(s => s.id === stageId)
    if (stage) stage.status = status
  }

  function setActiveStage(id) {
    activeStageId.value = id
    Object.keys(artifactData).forEach(k => delete artifactData[k])
    const stage = flowStages.find(s => s.id === id)
    if (stage) {
      currentArtifactType.value = id
      Object.assign(artifactData, stage.artifactData || {})
    }
  }

  function reset() {
    // Stop any in-flight streaming
    if (streamingTimer) { clearTimeout(streamingTimer); streamingTimer = null }
    if (streamingMsgRef) { streamingMsgRef.streaming = false; streamingMsgRef = null }

    dialogOpen.value = false
    messages.length = 0
    flowStages.length = 0
    candidateCustomers.length = 0
    lastScreeningResults.length = 0
    activeStageId.value = null
    currentStageId.value = null
    currentFlowStatus.value = 'idle'
    selectedCustomer.value = null
    pendingConfirmation.value = null
    pausedReason.value = ''
    flowStartedAt.value = null
    flowCompletedAt.value = null
    Object.keys(artifactData).forEach(k => delete artifactData[k])
    currentArtifactType.value = null
    waitingForInput.value = false
    currentIntent.value = null
  }

  // ===================== Mock 数据 =====================
  function mockCustomers(filterValues) {
    return [
      { id: 'sc001', name: '杭州智造科技有限公司', industry: '制造业', region: '浙江省·杭州市', risk: '低', revenue: '82', taxLevel: 'A级', match: 96, transferable: '可转尽调', reason: '纳税A级,营收稳定,无诉讼', status: '可转尽调', filters: filterValues },
      { id: 'sc002', name: '宁波天合新材料股份有限公司', industry: '制造业', region: '浙江省·宁波市', risk: '低', revenue: '156', taxLevel: 'A级', match: 92, transferable: '可转尽调', reason: '制造业匹配度高,纳税信用良好', status: '可转尽调', filters: filterValues },
      { id: 'sc003', name: '温州瑞达机械制造有限公司', industry: '制造业', region: '浙江省·温州市', risk: '低', revenue: '67', taxLevel: 'A级', match: 89, transferable: '可转尽调', reason: '开票记录稳定,经营正常', status: '可转尽调', filters: filterValues },
      { id: 'sc004', name: '嘉兴恒力纺织有限公司', industry: '制造业', region: '浙江省·嘉兴市', risk: '低', revenue: '43', taxLevel: 'B级', match: 78, transferable: '待确认', reason: '基础条件匹配,建议人工复核', status: '待确认', filters: filterValues },
      { id: 'sc005', name: '绍兴金轮精密工业有限公司', industry: '制造业', region: '浙江省·绍兴市', risk: '低', revenue: '120', taxLevel: 'A级', match: 94, transferable: '可转尽调', reason: '纳税A级,营收增长稳定', status: '可转尽调', filters: filterValues },
    ]
  }

  // ===================== 筛客流程 =====================
  async function execScreening(lower, isPartOfFull = false) {
    const screeningStore = useScreeningStore()
    if (!isPartOfFull) {
      flowStages.length = 0
      messages.length = 0
    }

    const filters = []
    const regionMap = { '浙江': '浙江省', '杭州': '杭州市', '宁波': '宁波市', '温州': '温州市', '嘉兴': '嘉兴市', '绍兴': '绍兴市' }
    for (const [key, val] of Object.entries(regionMap)) { if (lower.includes(key)) filters.push(val) }
    const industryMap = { '制造': '制造业', '科技': '科技业', '贸易': '批发/零售' }
    for (const [key, val] of Object.entries(industryMap)) { if (lower.includes(key)) filters.push(val) }
    if (lower.includes('低风险')) filters.push('低风险')
    if (lower.includes('开票')) filters.push('有开票记录')
    if (lower.includes('转尽调')) filters.push('可转尽调')
    if (filters.length === 0) filters.push('浙江省', '制造业', '低风险', '有开票记录')

    // 添加阶段
    const stage = { id: 'screen', label: '智能筛客', icon: '🔍', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('screen')

    // AI 用户气泡
    if (!isPartOfFull) await pushMessage('user', `筛选${filters.join(' / ')}的客户`)
    await delay(400)

    await pushStep('screen', '智能筛客', 'done', filters.map(f => ({ label: '条件', value: f })))
    await delay(400)

    const customers = mockCustomers(filters)
    screeningStore.setCustomers(customers)
    lastScreeningResults.length = 0
    lastScreeningResults.push(...customers)
    candidateCustomers.length = 0
    candidateCustomers.push(...customers)
    // 不自动选择！等待用户手动选择

    await pushStep('screen', '调用 screeningStore 执行筛选', 'done')
    await delay(400)

    await pushStep('screen', `解析条件：${filters.join(' / ')}`, 'done')
    await delay(400)

    await pushStep('screen', '执行筛选：匹配 128 家，过滤高风险 98 家', 'done', [
      { label: '匹配企业', value: '128 家' }, { label: '高风险过滤', value: '98 家' }, { label: '适合转尽调', value: '30 家' },
    ])
    await delay(400)

    await pushStep('screen', `生成结果：推荐 ${customers.length} 家候选企业`, 'done', [
      { label: '最终匹配', value: `${customers.length} 家` }, { label: '平均匹配度', value: '88%' },
    ])

    updateStageStatus('screen', 'done')

    // Artifact 数据
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      filters,
      customers,
      summary: { matched: '128 家', filtered: '98 家', recommended: `${customers.length} 家`, avgMatch: '88%' },
      selectedCustomer: null,
    }
    currentArtifactType.value = 'screen'
    Object.assign(artifactData, stage.artifactData)

    if (!isPartOfFull) {
      currentFlowStatus.value = 'waiting_selection'
      currentStageId.value = 'screen'
      waitingForInput.value = true
      await pushStreamingMessage(`已根据条件完成筛客，生成 ${customers.length} 家候选企业。请从右侧名单中选择一家企业发起尽调，也可以直接回复企业名称或序号。`)
    }
  }

  // ====== 选择企业并开始尽调 ======
  async function selectCustomerAndStartDueDiligence(cid) {
    let customer = typeof cid === 'string' ? (candidateCustomers.find(c => c.id === cid) || lastScreeningResults.find(c => c.id === cid)) : cid
    if (!customer) {
      const num = parseInt(cid)
      if (!isNaN(num) && num > 0 && num <= candidateCustomers.length) { customer = candidateCustomers[num - 1] }
    }
    if (!customer) {
      await pushMessage('ai', '没有在当前候选名单中找到该企业，请从右侧名单选择，或回复企业序号。')
      return
    }
    selectedCustomer.value = customer
    const ss = flowStages.find(s => s.id === 'screen')
    if (ss && ss.artifactData) ss.artifactData.selectedCustomer = customer
    currentFlowStatus.value = 'running'; currentStageId.value = 'task'
    waitingForInput.value = false; pendingConfirmation.value = null
    await pushStreamingMessage('已选择「' + customer.name + '」，开始创建尽调任务。')
    await delay(300)
    await execAutoDueDiligence()
  }

  async function execAutoDueDiligence() {
    const c = selectedCustomer.value; if (!c) return
    await withThinking('正在创建尽调任务', async () => { await execTask(c, true) }); await delay(500)
    await withThinking('正在校验工商信息', async () => { await execBusiness(c) }); await delay(500)
    await pushStreamingMessage('工商校验已完成，下一步需要采集税票数据，这一步需要企业授权。'); await delay(300)
    await execTaxPause(c)
  }

  // ===================== 尽调流程 =====================
  async function execTask(customer, isPartOfFull = false) {
    const ddStore = useDueDiligenceStore()
    if (!isPartOfFull && flowStages.length === 0) {
      flowStages.length = 0
      messages.length = 0
    }

    const stage = { id: 'task', label: '创建尽调', icon: '📋', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('task')

    if (!isPartOfFull) await pushMessage('user', `给${customer.name}发起尽调`)
    await delay(400)

    const task = ddStore.createTaskFromScreening({
      name: customer.name, match: customer.match, risk: customer.risk, reason: customer.reason,
    })
    lastDueTask.value = task

    await pushStep('task', '发起尽调', 'done', [
      { label: '企业名称', value: customer.name }, { label: '任务编号', value: task.id },
    ])
    await delay(400)

    await pushStep('task', '智能尽调工具 dueDiligenceStore', 'done')
    await delay(400)

    await pushStep('task', '确认企业', 'done', [
      { label: '企业名称', value: customer.name }, { label: '法定代表人', value: '张某某' }, { label: '注册资本', value: '500万' },
    ])
    await delay(400)

    await pushStep('task', `创建任务：${task.id}`, 'done')
    await delay(400)

    await pushStep('task', '初始化流程', 'running', [
      { label: '主体核验', value: '待启动' }, { label: '税票采集', value: '待启动' }, { label: '资料上传', value: '待启动' }, { label: 'AI分析', value: '待启动' }, { label: '报告生成', value: '待启动' },
    ])

    updateStageStatus('task', 'done')

    selectedCustomer.value = customer
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      task,
      customer,
      source: '智能筛客',
      target: '完成尽调报告',
      estimatedTime: '5-7 个工作日',
    }
    currentArtifactType.value = 'task'
    Object.assign(artifactData, stage.artifactData)

    if (!isPartOfFull) {
      waitingForInput.value = true
      conversationContext.lastAction = 'due-diligence'
      conversationContext.task = task
    }
  }

  // ===================== 工商校验 =====================
  async function execBusiness(customer) {
    const stage = { id: 'business', label: '工商校验', icon: '🏢', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('business')

    await delay(400)
    await pushStep('business', '工商校验工具 bizRiskStore', 'done')
    await delay(400)
    await pushStep('business', '校验完成：未发现重大异常', 'done', [
      { label: '主体状态', value: '正常存续' }, { label: '司法风险', value: '无重大诉讼' }, { label: '关联企业', value: '3 家' },
    ])

    updateStageStatus('business', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer,
      scope: '主体信息 + 股东结构 + 司法风险 + 经营异常 + 关联企业',
      conclusion: '未发现重大异常，可继续推进',
      entityStatus: '正常存续',
      judicialRisk: '无重大诉讼',
      relatedCompanies: '3 家',
      evidenceStored: true,
    }
    currentArtifactType.value = 'business'
    Object.assign(artifactData, stage.artifactData)
  }

  // ===================== 税票采集 =====================
  async function execTaxPause(customer) {
    const stage = { id: 'tax', label: '税票采集', icon: '🎫', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('tax')

    await delay(400)
    await pushStep('tax', '税票采集工具 taxRpaStore', 'done')
    await delay(400)
    await pushStep('tax', '已生成授权链接', 'running', [
      { label: '进项发票', value: '待采集' }, { label: '销项发票', value: '待采集' }, { label: '纳税申报', value: '待采集' },
    ])

    updateStageStatus('tax', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer,
      chain: '生成授权链接 → 企业扫码授权 → RPA 登录采集 → 数据入库 → 自动生成日志',
      status: '待确认发送授权链接',
      authStatus: '待确认发送',
      linkStatus: '未发送',
      nextAction: '等待用户确认发送采集链接',
      input: { count: 0, total: 0, unit: '份' },
      output: { count: 0, total: 0, unit: '份' },
      filing: { status: '未采集' },
      autoLog: [
        { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
        { time: '—', desc: '等待用户确认发送', status: 'waiting' },
      ],
    }
    currentArtifactType.value = 'tax'
    Object.assign(artifactData, stage.artifactData)

    // 暂停等待确认
    currentFlowStatus.value = 'waiting_confirmation'
    currentStageId.value = 'tax'
    waitingForInput.value = true
    pendingConfirmation.value = { type: 'send_tax_collection_link', stageId: 'tax', target: customer }
    await pushStreamingMessage('工商核验已完成。下一步需要采集税票数据，这一步需要企业授权。我已准备好采集链接，将发送给「' + customer.name + '」的财务联系人王女士，链接有效期 24 小时，采集范围包括发票、申报表和纳税信用信息。是否现在发送？')
  }

  async function confirmTaxAndContinue() {
    const stage = flowStages.find(s => s.id === 'tax'); if (!stage) return
    await withThinking('正在发送采集链接', async () => { await pushStep('tax', '采集链接已发送', 'done') }); await delay(500)
    // 只发送链接，不模拟采集，不继续后续
    stage.artifactData.status = '等待企业授权'
    stage.artifactData.authStatus = '链接已发送'
    stage.artifactData.linkStatus = '已发送'
    stage.artifactData.sentAt = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    stage.artifactData.contactName = '王女士'
    stage.artifactData.contactPhone = '138****6688'
    stage.artifactData.authLink = 'https://tax-auth.demo/link/' + selectedCustomer.value.id
    stage.artifactData.nextAction = '等待企业客户扫码授权'
    stage.artifactData.autoLog = [
      { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
      { time: '10:35', desc: '授权链接已发送给企业联系人', status: 'done' },
      { time: '—', desc: '等待企业客户扫码授权', status: 'waiting' },
    ]
    Object.assign(artifactData, stage.artifactData)
    currentFlowStatus.value = 'waiting_tax_authorization'
    currentStageId.value = 'tax'
    activeStageId.value = 'tax'
    waitingForInput.value = true
    pendingConfirmation.value = null
    await pushStreamingMessage('采集链接已发送至「' + selectedCustomer.value.name + '」的财务联系人王女士。接下来需要企业客户线下扫码并完成授权，授权完成后我会继续采集税票数据。你可以点击右侧「模拟企业已授权」，或回复「企业已授权」继续。')
  }

  async function markTaxAuthorizedAndContinue() {
    const stage = flowStages.find(s => s.id === 'tax'); if (!stage) return
    if (currentFlowStatus.value !== 'waiting_tax_authorization') {
      await pushMessage('ai', '当前不在等待企业授权状态，无法操作。')
      return
    }
    await pushMessage('user', '企业已授权，继续税票采集')
    currentFlowStatus.value = 'running'
    waitingForInput.value = false
    await withThinking('正在模拟采集税票数据', async () => {
      await pushStep('tax', '模拟完成税票数据采集', 'done', [{ label: '进项发票', value: '已采集 128 份' }, { label: '销项发票', value: '已采集 96 份' }])
      await delay(500)
      await pushStep('tax', '数据入库完成', 'done')
    })
    updateStageStatus('tax', 'done')
    stage.artifactData.status = '已完成'
    stage.artifactData.authStatus = '已授权'
    stage.artifactData.input = { count: 128, total: 150, unit: '份' }
    stage.artifactData.output = { count: 96, total: 120, unit: '份' }
    stage.artifactData.filing = { status: '已采集' }
    stage.artifactData.autoLog = [
      { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
      { time: '10:35', desc: '企业完成扫码授权', status: 'done' },
      { time: '10:36', desc: 'RPA 登录税局系统', status: 'done' },
      { time: '10:42', desc: '进项发票采集 128 份', status: 'done' },
      { time: '10:48', desc: '销项发票采集 96 份', status: 'done' },
      { time: '10:50', desc: '纳税申报数据已采集', status: 'done' },
      { time: '10:51', desc: '数据入库完成', status: 'done' },
    ]
    Object.assign(artifactData, stage.artifactData)
    await pushStreamingMessage('企业授权已确认，税票数据采集完成，开始归集尽调材料。')
    await delay(500)
    await execUpload(selectedCustomer.value)
    await delay(500)
    await execAnalysis(selectedCustomer.value)
    await delay(500)
    await execReportPause(selectedCustomer.value)
  }
  async function execUpload(customer) {
    const stage = { id: 'upload', label: '资料上传', icon: '📁', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('upload')

    await delay(400)
    await pushStep('upload', '资料识别工具 docRecognitionStore', 'done')
    await delay(400)
    await pushStep('upload', '已初始化识别策略', 'running', [
      { label: '必传资料', value: '财务报表 / 银行流水 / 纳税证明' }, { label: '可选资料', value: '合同 / 发票 / 资质证书' },
    ])

    updateStageStatus('upload', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer,
      target: '识别并归类尽调所需资料',
      strategy: 'OCR + 分类模型 + 字段抽取',
      required: ['财务报表', '银行流水', '纳税证明', '营业执照'],
      optional: ['合同样本', '增值税发票', '资质证书', '审计报告'],
      pendingFields: ['营收总额', '净利润', '资产负债率', '现金流'],
      docList: [
        { name: '财务报表', status: '待上传', required: true },
        { name: '银行流水', status: '待上传', required: true },
        { name: '纳税证明', status: '待上传', required: true },
        { name: '营业执照', status: '待上传', required: true },
      ],
    }
    currentArtifactType.value = 'upload'
    Object.assign(artifactData, stage.artifactData)
  }

  // ===================== AI分析 =====================
  async function execAnalysis(customer) {
    const stage = { id: 'analysis', label: 'AI分析', icon: '🧠', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('analysis')

    await delay(400)
    await pushStep('analysis', 'AI 分析引擎', 'done')
    await delay(400)
    await pushStep('analysis', '分析完成', 'done', [
      { label: '风险评分', value: '72 / 100' }, { label: '异常解释', value: '2 项' }, { label: '建议结论', value: '可授信' },
    ])

    updateStageStatus('analysis', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer,
      input: '工商校验结果 + 税票采集数据 + 上传资料',
      goal: '生成尽调风险结论',
      evidence: ['主体正常存续', '税务评级 A 级', '近一年营收 82 万'],
      riskScore: 72,
      anomalies: ['税务评级从 A→B（上月）', '1 笔小额诉讼'],
      suggestion: '综合评分 72，建议可授信，额度不超过 50 万',
    }
    currentArtifactType.value = 'analysis'
    Object.assign(artifactData, stage.artifactData)
  }

  // ===================== 报告确认（暂停） =====================
  async function execReportPause(customer) {
    const stage = { id: 'report', label: '报告确认', icon: '📝', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('report'); currentStageId.value = 'report'
    await withThinking('正在生成尽调报告', async () => { await pushStep('report', '生成尽调报告', 'done') }); await delay(500)
    const now = new Date()
    const rid = 'RPT-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-001'
    stage.artifactData = { steps: stage.artifactData.steps || [], customer, reportTitle: '「' + customer.name + '」尽职调查报告', reportId: rid, reportCatalog: ['企业概况', '工商核验', '税票分析', '财务分析', '风险诊断', '审批建议'], score: 82, conclusion: '建议有条件准入', status: '待确认', pendingItems: ['税务评级变化解释', '小额诉讼影响评估'], suggestion: '综合评分 82，建议有条件准入，授信额度不超过 50 万' }
    updateStageStatus('report', 'active'); currentArtifactType.value = 'report'; Object.assign(artifactData, stage.artifactData)
    currentFlowStatus.value = 'waiting_confirmation'; waitingForInput.value = true
    pendingConfirmation.value = { type: 'confirm_report_and_monitor', stageId: 'report', target: customer }
    await pushStreamingMessage('尽调报告草稿已生成，综合评分 82 分，建议有条件准入。是否确认报告并将该企业加入企业监控？')
  }

  async function confirmReportAndContinue() {
    const stage = flowStages.find(s => s.id === 'report'); if (!stage) return
    await withThinking('正在确认报告', async () => { await pushStep('report', '报告已确认', 'done') }); updateStageStatus('report', 'done')
    stage.artifactData.status = '已确认'
    currentFlowStatus.value = 'running'; waitingForInput.value = false; pendingConfirmation.value = null
    await delay(400); await execMonitor(selectedCustomer.value)
  }

  // ===================== 监控流程 =====================
  async function execMonitor(customer, isPartOfFull = false) {
    const monitorStore = useMonitorStore()
    if (!isPartOfFull && flowStages.length === 0) {
      flowStages.length = 0
      messages.length = 0
    }

    const stage = { id: 'monitor', label: '企业监控', icon: '📡', status: 'active', artifactData: {} }
    flowStages.push(stage)
    setActiveStage('monitor')

    if (!isPartOfFull) await pushMessage('user', `把${customer.name}加入监控`)
    await delay(400)

    monitorStore.addWatchedCompany({ name: customer.name, source: '对话', match: customer.match, risk: customer.risk })

    await pushStep('monitor', '加入企业监控', 'done', [
      { label: '企业名称', value: customer.name }, { label: '监控类型', value: '工商变更 + 预警 + 税票异常' },
    ])
    await delay(400)

    await pushStep('monitor', '企业监控工具 monitorStore', 'done')
    await delay(400)

    await pushStep('monitor', '创建监控规则', 'done', [
      { label: '规则1', value: '工商变更监控' }, { label: '规则2', value: '税务评级异常' }, { label: '规则3', value: '重大风险预警' },
    ])
    await delay(400)

    await pushStep('monitor', '启动监控：监控中', 'done')
    await delay(400)

    await pushStep('monitor', '模拟预警', 'warn', [
      { label: '10:30', value: '检测到工商变更' }, { label: '11:00', value: '检测到税务评级下降' },
    ])

    updateStageStatus('monitor', 'done')

    const now = new Date()
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer,
      rules: ['工商变更监控', '税务评级异常', '重大风险预警'],
      dimensions: ['工商', '税票', '司法'],
      enabled: true,
      warnings: [
        { time: `${now.getHours() - 2}:${String(now.getMinutes()).padStart(2, '0')}`, content: '检测到工商变更', level: 'warning' },
        { time: `${now.getHours() - 1}:${String(now.getMinutes()).padStart(2, '0')}`, content: '检测到税务评级下降', level: 'danger' },
      ],
    }
    currentArtifactType.value = 'monitor'
    Object.assign(artifactData, stage.artifactData)

    if (!isPartOfFull) {
      currentFlowStatus.value = 'completed'
      flowCompletedAt.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      waitingForInput.value = true
      conversationContext.lastAction = 'monitor'
      // Streaming summary message
      pushStreamingMessage('全流程已完成！已将「' + customer.name + '」加入企业监控，持续追踪工商变更、税票异常和重大风险。你可以查看尽调报告、查看企业监控，或继续筛选新客户。')
    }
  }

  // ===================== 工具函数 =====================
  function extractEntity(lower) {
    const companies = ['杭州智造', '天合', '瑞达', '恒力', '金轮', '明达', '蓝海', '恒远']
    for (const c of companies) { if (lower.includes(c)) return c }
    return null
  }

  function findCustomerByName(entityName) {
    if (!entityName) return null
    if (lastScreeningResults.length > 0) {
      return lastScreeningResults.find(c => c.name.includes(entityName)) || lastScreeningResults[0]
    }
    return null
  }

  function makeDefaultCustomer(name) {
    return {
      id: 'auto', name: name || '杭州智造科技有限公司', industry: '制造业',
      region: '浙江省·杭州市', risk: '低', revenue: '—', taxLevel: '—',
      match: '—', transferable: '可转尽调', reason: '上下文识别', status: '可转尽调',
    }
  }

  // ====== Context Suggestions ======
  const contextSuggestions = computed(() => {
    const suggestions = []
    const status = currentFlowStatus.value
    const pending = pendingConfirmation.value

    if (status === 'waiting_selection' && candidateCustomers.length > 0) {
      suggestions.push({
        label: '选择第 1 家企业',
        type: 'select_customer',
        customer: candidateCustomers[0]
      })
      suggestions.push({
        label: '查看筛选依据',
        type: 'send_text',
        text: '查看筛选依据'
      })
      suggestions.push({
        label: '重新筛客',
        type: 'send_text',
        text: '重新筛客'
      })
    }

    if (status === 'waiting_confirmation' && pending?.type === 'send_tax_collection_link') {
      suggestions.push({
        label: '确认发送采集链接',
        type: 'confirm_tax_send'
      })
      suggestions.push({
        label: '稍后处理',
        type: 'defer_tax_send'
      })
      suggestions.push({
        label: '查看采集范围',
        type: 'send_text',
        text: '税票采集范围是什么'
      })
    }

    if (status === 'waiting_tax_authorization') {
      suggestions.push({
        label: '模拟企业已授权',
        type: 'tax_authorized'
      })
      suggestions.push({
        label: '查看授权链接',
        type: 'set_active_stage',
        stageId: 'tax'
      })
      suggestions.push({
        label: '现在到哪一步了',
        type: 'send_text',
        text: '现在到哪一步了'
      })
    }

    if (status === 'waiting_confirmation' && pending?.type === 'confirm_report_and_monitor') {
      suggestions.push({
        label: '确认报告并加入监控',
        type: 'confirm_report'
      })
      suggestions.push({
        label: '查看报告结论',
        type: 'send_text',
        text: '查看报告结论'
      })
      suggestions.push({
        label: '稍后确认',
        type: 'send_text',
        text: '稍后确认报告'
      })
    }

    if (status === 'completed') {
      suggestions.push({
        label: '查看尽调报告',
        type: 'send_text',
        text: '查看尽调报告'
      })
      suggestions.push({
        label: '查看企业监控',
        type: 'set_active_stage',
        stageId: 'monitor'
      })
      suggestions.push({
        label: '继续筛选客户',
        type: 'send_text',
        text: '继续筛选客户'
      })
    }

    return suggestions
  })

  // ===================== 上下文续接 =====================
  async function handleContextContinuation(lower) {
    // "第一个发起尽调"
    const ordinalMatch = lower.match(/第([一二三123])个?.*尽调/)
    if (ordinalMatch) {
      const num = { '一': 0, '二': 1, '三': 2, '1': 0, '2': 1, '3': 2 }[ordinalMatch[1]] || 0
      const customer = lastScreeningResults[num]
      if (customer) { await execTask(customer); return true }
    }

    // "也加入监控"
    if ((lower.includes('也') || lower.includes('同时')) && (lower.includes('监控') || lower.includes('加入'))) {
      if (lastDueTask.value) {
        const customer = lastScreeningResults.find(c => c.name === lastDueTask.value.name)
        if (customer) { await execMonitor(customer); return true }
        await execMonitor(makeDefaultCustomer(lastDueTask.value.name)); return true
      }
      if (selectedCustomer.value) { await execMonitor(selectedCustomer.value); return true }
    }

    return false
  }

  // ===================== 全流程 (DEMO ONLY — not exported, may bypass tax auth) =====================
  async function execFullFlow(lower) {
    flowStages.length = 0
    messages.length = 0

    const filters = []
    const regionMap = { '浙江': '浙江省', '杭州': '杭州市' }
    for (const [key, val] of Object.entries(regionMap)) { if (lower.includes(key)) filters.push(val) }
    if (lower.includes('制造')) filters.push('制造业')
    if (lower.includes('低风险')) filters.push('低风险')
    if (lower.includes('开票')) filters.push('有开票记录')
    if (filters.length === 0) filters.push('浙江省', '制造业', '低风险')

    await pushMessage('user', `筛选${filters.join(' / ')}的客户，适合的发起尽调并加入监控`)
    await delay(400)

    await execScreening(lower, true)
    await delay(400)

    await execTask(selectedCustomer.value, true)
    await delay(400)

    await execBusiness(selectedCustomer.value)
    await delay(400)

    await execTaxPause(selectedCustomer.value)
    await delay(400)

    await execUpload(selectedCustomer.value)
    await delay(400)

    await execAnalysis(selectedCustomer.value)
    await delay(400)

    // Note: Full flow bypasses tax authorization pause — do NOT use in production
    await execReportPause(selectedCustomer.value)
    await delay(400)

    await execMonitor(selectedCustomer.value, true)

    waitingForInput.value = true
    conversationContext.lastAction = 'full-flow'
    conversationContext.customers = lastScreeningResults
    conversationContext.task = lastDueTask.value
  }

  // ===================== 待办 =====================
  async function execTodos() {
    const ddStore = useDueDiligenceStore()
    flowStages.length = 0
    messages.length = 0

    const urgent = ddStore.tasks.filter(t => t.progress < 100)
    await pushMessage('user', '今天有哪些待办')
    await delay(400)

    if (urgent.length > 0) {
      await pushMessage('ai', `在途尽调任务 ${urgent.length} 个`, {
        card: 'todos',
        todos: urgent.map(t => ({ name: t.name, progress: t.progress, status: t.status })),
      })
    } else {
      await pushMessage('ai', '当前没有在途尽调任务')
    }

    waitingForInput.value = true
    currentIntent.value = 'todos'
  }

  // ===================== 主入口 =====================
  async function sendMessage(text) {
    if (!text || !text.trim()) return
    const input = text.trim(); dialogInput.value = ''; dialogOpen.value = true; waitingForInput.value = false
    const lower = input.toLowerCase()

    // 1. 等待选择企业
    if (currentFlowStatus.value === 'waiting_selection') {
      const numMatch = lower.match(/第\s*([一二三12345])\s*[个家]/)
      if (numMatch) {
        const map = { '一': 1, '二': 2, '三': 3, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 }
        const idx = map[numMatch[1]] || parseInt(numMatch[1])
        if (idx > 0 && idx <= candidateCustomers.length) { await pushMessage('user', input); await selectCustomerAndStartDueDiligence(candidateCustomers[idx - 1].id); return }
      }
      const num = parseInt(input)
      if (!isNaN(num) && num > 0 && num <= candidateCustomers.length) { await pushMessage('user', input); await selectCustomerAndStartDueDiligence(candidateCustomers[num - 1].id); return }
      const matched = candidateCustomers.find(c => c.name.includes(input) || input.includes(c.name.replace(/股份|有限|公司/g, '').slice(0, 4)))
      if (matched) { await pushMessage('user', input); await selectCustomerAndStartDueDiligence(matched.id); return }
      if (lower.includes('进度') || lower.includes('到哪') || lower.includes('结果')) {
        await pushMessage('user', input)
        await pushMessage('ai', '当前已完成筛客，生成了 ' + candidateCustomers.length + ' 家候选企业。请从右侧名单选择一家，或回复序号（1~' + candidateCustomers.length + '）。')
        currentFlowStatus.value = 'waiting_selection'; waitingForInput.value = true; return
      }
      await pushMessage('user', input)
      await pushMessage('ai', '没有在当前候选名单中找到该企业，请从右侧名单选择，或回复企业序号（1~' + candidateCustomers.length + '）。')
      currentFlowStatus.value = 'waiting_selection'; waitingForInput.value = true; return
    }

    // 2. 等待确认
    if (currentFlowStatus.value === 'waiting_confirmation') {
      await pushMessage('user', input)
      if (lower.includes('确认') || lower.includes('发送') || lower.includes('可以') || lower.includes('好的') || lower.includes('ok') || lower.includes('yes')) {
        if (pendingConfirmation.value?.type === 'send_tax_collection_link') { await confirmTaxAndContinue(); return }
        if (pendingConfirmation.value?.type === 'confirm_report_and_monitor') { await confirmReportAndContinue(); return }
      }
      if (lower.includes('稍后') || lower.includes('取消') || lower.includes('暂不') || lower.includes('no')) {
        const stageLabel = flowStages.find(s => s.id === pendingConfirmation.value?.stageId)?.label || '当前'
        pendingConfirmation.value = null; waitingForInput.value = true; currentFlowStatus.value = 'running'
        await pushMessage('ai', '流程已暂停在「' + stageLabel + '」阶段，随时可以继续。')
        return
      }
      if (lower.includes('进度') || lower.includes('到哪') || lower.includes('结果')) {
        const st = flowStages.find(s => s.id === pendingConfirmation.value?.stageId)
        await pushMessage('ai', '当前流程暂停在「' + (st ? st.label : pendingConfirmation.value?.stageId) + '」阶段，等待你的确认。')
        waitingForInput.value = true; return
      }
      if (pendingConfirmation.value?.type === 'send_tax_collection_link') {
        if (lower.includes('企业') || lower.includes('授权') || lower.includes('扫码') || lower.includes('继续')) {
          await pushMessage('ai', '当前采集链接还未发送，请先确认发送税票采集链接。你可以回复"确认发送"，或者直接回复"确认"。'); waitingForInput.value = true; return
        }
      }
      await pushMessage('ai', '请确认或取消当前操作。'); waitingForInput.value = true; return
    }

    // 2.5 等待企业授权（税票阶段）
    if (currentFlowStatus.value === 'waiting_tax_authorization') {
      await pushMessage('user', input)
      if (lower.includes('授权') || lower.includes('扫码') || lower.includes('完成') || lower.includes('继续') || lower.includes('ok') || lower.includes('yes') || lower.includes('可以')) {
        await markTaxAuthorizedAndContinue(); return
      }
      if (lower.includes('进度') || lower.includes('到哪') || lower.includes('状态')) {
        const customer = selectedCustomer.value
        await pushMessage('ai', '当前流程：税票采集阶段。已发送授权链接给「' + (customer ? customer.name : '目标企业') + '」的财务联系人，等待企业线下扫码授权完成后告诉我"企业已授权"即可继续。')
        waitingForInput.value = true; return
      }
      if (lower.includes('稍后') || lower.includes('取消')) {
        await pushMessage('ai', '流程已暂停在税票采集阶段，企业线下完成授权后随时可以继续。告诉我"企业已授权"即可推进。')
        waitingForInput.value = true; return
      }
      await pushMessage('ai', '企业完成扫码授权后，请告诉我"企业已授权"或回复"继续"，或者点击右侧税票面板的按钮继续。'); waitingForInput.value = true; return
    }

    // 3. 已完成流程，问结果
    if (currentFlowStatus.value === 'completed') {
      await pushMessage('user', input)
      if (lower.includes('工商') || lower.includes('风险')) {
        const bs = flowStages.find(s => s.id === 'business')
        if (bs && bs.artifactData) { await pushMessage('ai', '工商核验结果：主体' + bs.artifactData.entityStatus + '，司法' + bs.artifactData.judicialRisk + '，关联企业' + bs.artifactData.relatedCompanies + '。'); return }
      }
      if (lower.includes('税务') || lower.includes('税票')) {
        const tx = flowStages.find(s => s.id === 'tax')
        if (tx && tx.artifactData) { await pushMessage('ai', '税票采集状态：' + tx.artifactData.status + '，授权' + tx.artifactData.authStatus + '。'); return }
      }
      if (lower.includes('报告') || lower.includes('结论')) {
        const rp = flowStages.find(s => s.id === 'report')
        if (rp && rp.artifactData) { await pushMessage('ai', '报告结论：' + rp.artifactData.conclusion + '。'); return }
      }
      await pushMessage('ai', '全流程已完成。可以问工商风险、税票采集、报告结论等。'); waitingForInput.value = true; return
    }

    // 3. 进度询问
    if (lower.includes('进度') || lower.includes('到哪') || lower.includes('跑到哪')) {
      await pushMessage('user', input)
      if (currentFlowStatus.value === 'waiting_tax_authorization') {
        const customer = selectedCustomer.value
        await pushMessage('ai', '当前暂停在税票采集阶段，已发送授权链接给「' + (customer ? customer.name : '目标企业') + '」，等待企业线下扫码授权。完成后告诉我"企业已授权"即可继续。')
        waitingForInput.value = true; return
      }
      if (flowStages.length > 0) {
        const active = flowStages.find(s => s.status === 'active')
        const done = flowStages.filter(s => s.status === 'done')
        let msg = '当前进度：' + done.map(s => '✅' + s.label).join(' → ')
        if (active) msg += ' → 🔄' + active.label
        msg += '。'
        if (pendingConfirmation.value) msg += '（当前暂停在「' + (flowStages.find(s => s.id === pendingConfirmation.value.stageId)?.label || pendingConfirmation.value.stageId) + '」等待确认）'
        await pushMessage('ai', msg)
      } else { await pushMessage('ai', '还没有开始流程，请输入筛客条件开始。') }
      waitingForInput.value = true; return
    }

    // 4. 阶段结果询问
    if (lower.includes('工商') && (lower.includes('风险') || lower.includes('怎么样') || lower.includes('结果'))) {
      await pushMessage('user', input)
      const bs = flowStages.find(s => s.id === 'business')
      if (bs && bs.artifactData) { await pushMessage('ai', '工商核验：主体' + bs.artifactData.entityStatus + '，司法' + bs.artifactData.judicialRisk + '，关联' + bs.artifactData.relatedCompanies + '家。'); waitingForInput.value = true; return }
      await pushMessage('ai', '还没有执行工商核验，请先发起筛客。'); waitingForInput.value = true; return
    }
    if (lower.includes('税务') && (lower.includes('异常') || lower.includes('什么'))) {
      await pushMessage('user', input)
      const tx = flowStages.find(s => s.id === 'tax')
      if (tx && tx.artifactData) { await pushMessage('ai', '税票采集：' + tx.artifactData.status + '，授权' + tx.artifactData.authStatus + '。'); waitingForInput.value = true; return }
      await pushMessage('ai', '还没有执行税票采集。'); waitingForInput.value = true; return
    }
    if (lower.includes('报告') && (lower.includes('结论') || lower.includes('什么'))) {
      await pushMessage('user', input)
      const rp = flowStages.find(s => s.id === 'report')
      if (rp && rp.artifactData) { await pushMessage('ai', '报告结论：' + rp.artifactData.conclusion + '。'); waitingForInput.value = true; return }
      await pushMessage('ai', '还没有生成尽调报告。'); waitingForInput.value = true; return
    }

    // 5. 发起新流程（筛客+尽调意图）
    if (lower.includes('筛') || lower.includes('筛选') || lower.includes('找') || lower.includes('名单') || (lower.includes('客户') && lower.includes('尽调'))) {
      currentIntent.value = 'screening'
      await execScreening(lower)
      return
    }
    if (lower.includes('尽调') && (lower.includes('发起') || lower.includes('开始') || lower.includes('流程'))) {
      if (candidateCustomers.length > 0) {
        await pushMessage('user', input)
        await pushMessage('ai', '已有候选名单，请先选择企业。')
        waitingForInput.value = true; return
      }
      await pushMessage('user', input)
      await pushMessage('ai', '请先输入筛客条件，例如：筛选深圳的软件企业。')
      waitingForInput.value = true; return
    }

    // 6. 默认回复
    await pushMessage('user', input)
    await pushMessage('ai', '试试说：筛选深圳的软件企业 / 进度怎么样 / 工商风险如何')
    waitingForInput.value = true
  }

  return {
    dialogOpen, dialogInput, messages, flowStages, activeStageId,
    artifactData, currentArtifactType, waitingForInput,
    selectedCustomer, candidateCustomers, lastScreeningResults, lastDueTask,
    pendingConfirmation, pausedReason, currentIntent, conversationContext,
    currentFlowStatus, currentStageId, flowStartedAt, flowCompletedAt,
    isThinking, thinkingText,
    processSteps, sidebarMode, contextSuggestions,
    sendMessage, reset, setActiveStage,
    execScreening, execTask, execBusiness, execTaxPause, execUpload, execAnalysis, execReportPause, execMonitor,
    confirmTaxAndContinue, confirmReportAndContinue, markTaxAuthorizedAndContinue,
    selectCustomerAndStartDueDiligence, execAutoDueDiligence,
  }
})
