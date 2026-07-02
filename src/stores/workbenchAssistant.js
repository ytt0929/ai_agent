/**
 * 工作台 AI 助手 v4 — 第一阶段：主流程骨架与状态机
 * 主链路：智能筛客 → 企业探查 → 加入监控/新建尽调 → 尽调流程 → 报告编辑
 *
 * 统一阶段 key：
 *   screen → explore → monitor → dueDiligence → business → judicial → tax
 *   → materials → evidence → riskDiagnosis → deliverables → reportEditor
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

// ====== 阶段定义 ======
const STAGE_LABEL_MAP = {
  screen: '智能筛客',
  explore: '企业探查',
  monitor: '加入监控',
  dueDiligence: '新建尽调',
  business: '工商核验',
  judicial: '司法查询',
  tax: '税票采集',
  materials: '资料补充',
  evidence: '证据整合',
  riskDiagnosis: '风险诊断',
  deliverables: '产物确认',
  reportEditor: '报告编辑',
}

const STAGE_TOOL_MAP = {
  screen: 'screening',
  explore: 'exploration',
  monitor: 'monitor',
  dueDiligence: 'dueDiligence',
  business: 'business',
  judicial: 'judicial',
  tax: 'tax',
  materials: 'materials',
  evidence: 'evidence',
  riskDiagnosis: 'riskDiagnosis',
  deliverables: 'deliverables',
  reportEditor: 'reportEditor',
}

export const useWorkbenchAssistantStore = defineStore('workbenchAssistant', () => {
  // ===================== 状态 =====================
  const dialogOpen = ref(false)
  const dialogInput = ref('')
  const messages = reactive([])
  const waitingForInput = ref(false)

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

  // 布局状态
  const layoutMode = ref('chat-center')
  const activeTool = ref(null)
  const selectedEnterprise = ref(null)
  const selectedDueTemplate = ref(null)
  const leftPanelData = reactive({})
  const contextSuggestions = reactive([])

  /** 统一设置左侧面板数据源 */
  function setLeftPanel(tool, payload = {}) {
    activeTool.value = tool
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, payload)
  }

  /** 处理建议按钮点击 */
  async function handleSuggestionClick(suggestion) {
    const value = suggestion.value || ''
    contextSuggestions.length = 0

    if (value === 'confirm_tax_send') { await confirmTaxSend(); return }
    if (value === 'tax_authorized') { await mockTaxAuthorized(); return }
    if (value === 'mock_material_upload') { await mockMaterialUpload(); return }
    if (value === 'enter_evidence') { await enterEvidenceMerge(); return }
    if (value === 'enter_risk') { await enterRiskDiagnosis(); return }
    if (value === 'enter_deliverables') { await enterDeliverables(); return }
    if (value === 'edit_report') { await startReportEditor(); return }
    if (value === 'export_report') { await pushStreamingMessage('报告已导出为 PDF。'); return }
    if (value === 'start_monitor') { await startMonitor(); return }

    // 文本建议：塞入输入框走自然语言
    dialogInput.value = suggestion.label || value
    await sendMessage()
  }

  // ===================== Mock 数据 =====================
  const shenzhenSoftwareEnterprises = [
    { id: 'sz001', name: '深圳市科创软件有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '无诉讼'], revenue: '320万', match: 96, reason: '纳税A级，无诉讼记录，经营稳定' },
    { id: 'sz002', name: '深圳市云端科技有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '营收增长'], revenue: '580万', match: 93, reason: '纳税A级，连续3年营收增长' },
    { id: 'sz003', name: '深圳市数智软件有限公司', region: '广东省·深圳市', industry: '软件业', risk: '中', progress: '待确认', tags: ['1笔小额诉讼', '税务评级B'], revenue: '150万', match: 78, reason: '存在1笔小额诉讼，税务评级B' },
    { id: 'sz004', name: '深圳市恒远软件有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '无行政处罚'], revenue: '210万', match: 91, reason: '纳税A级，无行政处罚' },
    { id: 'sz005', name: '深圳市锐创信息技术有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '知识产权5项'], revenue: '450万', match: 94, reason: '纳税A级，拥有5项知识产权' },
  ]

  const mockEnterprises = [
    { id: 'ts-wq-sm', name: '唐山物桥商贸有限公司', creditCode: '91130203MA7EEQ2N0T', region: '河北省·唐山市', industry: '商贸流通', risk: '中', progress: '可转尽调', match: 91, revenue: '2275.98万', taxLevel: 'A', tags: ['近一年有开票记录', '可转尽调', '存在风险事项'], reason: '企业开票活跃，但存在税负率偏低、购销两头在外、开票收入与申报收入不一致等风险事项，适合进入尽调流程。' },
    { id: 'e001', name: '杭州智造科技有限公司', region: '浙江省·杭州市', industry: '制造业', risk: '低', progress: '可转尽调', tags: ['纳税A级'], revenue: '82万', match: 96, reason: '纳税A级，经营稳定' },
    { id: 'e002', name: '宁波天合新材料股份有限公司', region: '浙江省·宁波市', industry: '新材料', risk: '低', progress: '可转尽调', tags: ['纳税A级'], revenue: '156万', match: 92, reason: '制造业匹配度高，纳税信用良好' },
    { id: 'e003', name: '温州瑞达机械制造有限公司', region: '浙江省·温州市', industry: '制造业', risk: '低', progress: '可转尽调', tags: ['纳税A级'], revenue: '67万', match: 89, reason: '开票记录稳定，经营正常' },
    { id: 'e004', name: '嘉兴恒力纺织有限公司', region: '浙江省·嘉兴市', industry: '制造业', risk: '低', progress: '可转尽调', tags: ['纳税A级'], revenue: '43万', match: 78, reason: '基础条件匹配，建议人工复核' },
    { id: 'e005', name: '绍兴金轮精密工业有限公司', region: '浙江省·绍兴市', industry: '制造业', risk: '低', progress: '可转尽调', tags: ['纳税A级'], revenue: '120万', match: 94, reason: '纳税A级，营收增长稳定' },
  ]

  const dueDiligenceTemplates = [
    { id: 'tpl-std', name: '标准授信尽调', sections: 8, requiredDocs: 12, estimatedDays: '5-7' },
    { id: 'tpl-mini', name: '小微快审尽调', sections: 5, requiredDocs: 6, estimatedDays: '2-3' },
    { id: 'tpl-tax', name: '税票专项尽调', sections: 4, requiredDocs: 8, estimatedDays: '3-5' },
    { id: 'tpl-custom', name: '自定义资料包', sections: 0, requiredDocs: 0, estimatedDays: '自定义' },
  ]

  // ====== 主线企业「唐山物桥商贸有限公司」风险事项 mock ======
  const tangshanRiskIssues = [
    { name: '营收增长异常', level: '高', category: '经营稳定性', description: '近12月开票收入同比增长188.3%，增速远超行业平均水平', evidenceSources: ['税票采集', '开票收入趋势', '行业均值对比'] },
    { name: '购销两头在外', level: '中', category: '业务真实性', description: '主要供应商和客户均位于外地，存在两头在外经营模式', evidenceSources: ['进销项发票', '客户供应商区域分布'] },
    { name: '短期偿债压力过大', level: '高', category: '经营稳定性', description: '短期借款50万元，占流动资产61%，偿债压力较大', evidenceSources: ['财务报表', '负债结构', '流动资产数据'] },
    { name: '应收账款周转率下降', level: '中', category: '经营稳定性', description: '应收账款周转率从8.2降至5.6，回款速度变慢', evidenceSources: ['财务报表', '应收账款明细', '经营指标分析'] },
    { name: '税负率显著低于行业', level: '高', category: '税务风险', description: '增值税税负率0.8%，仅为行业均值2.8%的29%', evidenceSources: ['纳税申报表', '销项发票', '行业税负均值'] },
    { name: '开票收入与申报收入不一致', level: '中', category: '业务真实性', description: '开票收入2275.98万元，申报收入2175.46万元，差异4.4%', evidenceSources: ['发票数据', '纳税申报数据', '收入核对表'] },
    { name: '电费与收入相关性低', level: '低', category: '业务真实性', description: '近12月电费与收入相关性仅0.18，低于正常水平', evidenceSources: ['电费记录', '收入趋势', '经营真实性模型'] },
    { name: '公司成立时间较短', level: '中', category: '企业稳定性', description: '企业成立39个月，经营历史相对较短', evidenceSources: ['工商登记信息', '成立日期', '经营年限'] },
  ]

  const tangshanHighlights = [
    { name: '纳税信用 A 级', description: '近年纳税信用评价保持 A 级' },
    { name: '主体状态正常', description: '工商登记状态为正常存续' },
    { name: '无重大司法诉讼', description: '公开司法数据未发现重大诉讼记录' },
  ]

  const tangshanIndicators = [
    { label: '主体状态', value: '正常存续' },
    { label: '纳税信用', value: 'A 级' },
    { label: '近12月开票收入', value: '2275.98万元' },
    { label: '申报收入', value: '2175.46万元' },
    { label: '增值税税负率', value: '0.8%' },
    { label: '关联企业', value: '3 家' },
  ]

  // ====== 尽调流程条数据（可复用的深拷贝工厂） ======
  function freshDueFlowSteps(initialKey = 'business') {
    const order = ['business', 'judicial', 'tax', 'materials', 'evidence', 'riskDiagnosis', 'deliverables']
    const labels = { business: '工商核验', judicial: '司法查询', tax: '税票采集', materials: '资料补充', evidence: '证据整合', riskDiagnosis: '风险诊断', deliverables: '产物确认' }
    return order.map(key => ({ key, label: labels[key], status: key === initialKey ? 'active' : 'pending' }))
  }

  function orderIndex(key) {
    return ['business', 'judicial', 'tax', 'materials', 'evidence', 'riskDiagnosis', 'deliverables'].indexOf(key)
  }

  // ===================== 工具函数 =====================
  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function withThinking(text, fn) {
    isThinking.value = true; thinkingText.value = text
    try { return await fn() } finally { isThinking.value = false }
  }

  async function pushMessage(type, text, extra = {}) {
    if (type === 'ai' && messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last.type === 'ai' && last.text === text && !last.streaming) return
    }
    messages.push({ type, text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), ...extra })
  }

  async function pushStep(stageId, title, status, details = null) {
    const stage = flowStages.find(s => s.id === stageId)
    if (!stage) return
    if (!stage.artifactData) stage.artifactData = {}
    if (!stage.artifactData.steps) stage.artifactData.steps = []
    stage.artifactData.steps.push({ title, status, details, expandable: !!details, expanded: true })
  }

  let streamingTimer = null
  let streamingMsgRef = null

  async function pushStreamingMessage(fullText, extra = {}) {
    const msg = {
      type: 'ai', text: '', fullText, streaming: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      ...extra
    }
    messages.push(msg)
    streamingMsgRef = msg

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

  /** 阶段 upsert：保证 flowStages 中 id 唯一 */
  function upsertStage(stage) {
    const existing = flowStages.find(s => s.id === stage.id)
    if (existing) {
      Object.assign(existing, stage)
      return existing
    }
    flowStages.push({ ...stage })
    return flowStages[flowStages.length - 1]
  }

  /**
   * setActiveStage — 从 flowStages 同步左侧面板
   */
  function setActiveStage(id) {
    activeStageId.value = id
    const stage = flowStages.find(s => s.id === id)
    if (!stage) return
    currentArtifactType.value = id
    Object.assign(artifactData, stage.artifactData || {})
    layoutMode.value = 'workspace'
    const mappedTool = STAGE_TOOL_MAP[id]
    if (mappedTool) activeTool.value = mappedTool
    let data = stage.artifactData
    if (!data || Object.keys(data).length === 0) {
      data = { status: 'empty', title: stage.label || id, placeholder: '当前节点暂无产物，请继续流程' }
    }
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, data)
  }

  /**
   * 统一更新左侧面板产物
   */
  function updateWorkbenchArtifact(stageId, tool, payload, stageStatus = 'active') {
    layoutMode.value = 'workspace'
    activeTool.value = tool
    upsertStage({ id: stageId, label: STAGE_LABEL_MAP[stageId] || stageId, status: stageStatus, artifactData: { ...payload } })
    activeStageId.value = stageId
    currentArtifactType.value = stageId
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, payload)
    Object.keys(artifactData).forEach(k => delete artifactData[k])
    Object.assign(artifactData, payload)
  }

  function reset() {
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
    layoutMode.value = 'chat-center'
    activeTool.value = null
    selectedEnterprise.value = null
    selectedDueTemplate.value = null
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
  }

  // ===================== 意图识别 =====================
  function detectIntent(text) { return 'screening' }

  // ===================== 智能筛客 =====================
  async function runScreening(inputText) {
    const lower = inputText.toLowerCase()
    const filters = []
    if (lower.includes('浙江')) filters.push('浙江省')
    if (lower.includes('制造')) filters.push('制造业')
    if (lower.includes('低风险')) filters.push('低风险')
    if (lower.includes('开票')) filters.push('近一年有开票记录')
    if (lower.includes('尽调')) filters.push('适合转尽调')
    if (filters.length === 0) filters.push('制造业', '低风险')

    layoutMode.value = 'chat-center'
    activeTool.value = 'intent'

    await pushStreamingMessage('已收到需求，正在识别你的操作意图。')
    await delay(800)
    await pushStreamingMessage(`识别到"智能筛客"工具。筛选条件为：${filters.join('、')}。`)
    await delay(600)

    const enterprises = [...mockEnterprises]

    const steps = [
      { title: '解析筛选条件', status: 'done', details: filters.map(f => ({ label: '条件', value: f })) },
      { title: '执行筛选', status: 'done', details: [
        { label: '匹配企业', value: '128 家' },
        { label: '高风险过滤', value: '98 家' },
        { label: '适合转尽调', value: `${enterprises.length} 家` },
      ]},
      { title: `生成结果：推荐 ${enterprises.length} 家候选企业`, status: 'done', details: [
        { label: '最终匹配', value: `${enterprises.length} 家` },
        { label: '平均匹配度', value: '90%' },
      ]},
    ]

    const screenArtifactData = {
      filters,
      enterprises: [...enterprises],
      summary: { matched: '128 家', filtered: '98 家', recommended: `${enterprises.length} 家`, avgMatch: '90%' },
      steps,
    }

    candidateCustomers.length = 0
    candidateCustomers.push(...enterprises)
    lastScreeningResults.length = 0
    lastScreeningResults.push(...enterprises)

    upsertStage({ id: 'screen', label: STAGE_LABEL_MAP.screen, icon: '🔍', status: 'done', artifactData: { ...screenArtifactData } })
    setActiveStage('screen')

    currentFlowStatus.value = 'waiting_selection'
    currentStageId.value = 'screen'
    waitingForInput.value = true
    fillSuggestions('waiting_selection')

    await pushStreamingMessage(`已完成筛客，识别到 ${enterprises.length} 家候选企业。请在左侧选择一家企业继续探查，或继续调整筛选条件。`)
  }

  // ===================== 选择企业 → 企业探查 =====================
  async function selectEnterpriseAndExplore(enterprise) {
    selectedEnterprise.value = enterprise
    waitingForInput.value = false
    await pushMessage('user', `探查「${enterprise.name}」`)
    await delay(300)
    await runEnterpriseExploration(enterprise)
  }

  async function runEnterpriseExploration(enterprise) {
    selectedEnterprise.value = enterprise
    layoutMode.value = 'workspace'
    activeTool.value = 'exploration'

    const isTsWq = enterprise.id === 'ts-wq-sm'

    const steps = [
      { title: '工商数据查询', status: 'done', details: [
        { label: '主体状态', value: '正常存续' },
        { label: '司法风险', value: '无重大诉讼' },
        { label: '关联企业', value: '3 家' },
      ]},
      { title: '经营数据分析', status: 'done', details: [
        { label: '近12月营收', value: isTsWq ? '2275.98万元' : '稳定' },
        { label: '社保人数', value: '正常' },
        { label: '行政处罚', value: '无' },
      ]},
      { title: '税务风险评估', status: 'done', details: [
        { label: '纳税信用', value: 'A级' },
        { label: '欠税记录', value: '无' },
      ]},
    ]

    const exploreArtifactData = {
      enterprise,
      basicInfo: isTsWq
        ? {
            creditCode: '91130203MA7EEQ2N0T',
            legalPerson: '马丽',
            registeredCapital: '500万元',
            establishedDate: '2021-12-24',
            industry: '建材批发 / 商贸流通',
            region: '河北省·唐山市',
            staffSize: '—',
          }
        : { creditCode: '91440300MA5FXXXX1X', legalPerson: '张三', registeredCapital: '500万', establishedDate: '2018-03-15', industry: enterprise.industry || '—', staffSize: '—' },
      conclusion: isTsWq ? '企业经营正常，税务评级A级，但存在多项风险事项需关注' : '企业经营正常，税务评级A级，无重大司法风险',
      risks: isTsWq ? tangshanRiskIssues.map(r => ({ category: r.category, level: r.level, detail: r.description })) : [
        { category: '工商风险', level: '低', detail: '主体正常存续，无异常经营记录' },
        { category: '经营风险', level: '低', detail: '近12个月社保人数稳定，无行政处罚' },
        { category: '税务风险', level: '低', detail: '税务评级A级，无欠税记录' },
      ],
      riskIssues: isTsWq ? tangshanRiskIssues : [],
      highlights: isTsWq ? tangshanHighlights : [],
      fullIndicators: isTsWq ? tangshanIndicators : [],
      evidenceSummary: '工商登记 + 司法公开 + 税务评级 + 社保记录',
      steps,
      // 企业探查阶段的后续动作（并列）
      actions: ['start_monitor', 'start_due_diligence'],
    }

    upsertStage({ id: 'explore', label: STAGE_LABEL_MAP.explore, icon: '🏢', status: 'done', artifactData: { ...exploreArtifactData } })
    setActiveStage('explore')

    await pushStreamingMessage('已完成企业探查。该企业主体状态正常，存在部分经营和税务风险事项，左侧已展示探查结果。')
    await delay(400)
    await pushStreamingMessage('你可以将该企业加入监控，也可以新建尽调任务。两个动作是并列选择，后续也可以互相转入。')
    currentFlowStatus.value = 'waiting_action'
    waitingForInput.value = true
    fillSuggestions('waiting_action')
  }

  // ===================== 并列动作：加入监控 =====================
  async function startMonitor(enterprise) {
    const ent = enterprise || selectedEnterprise.value
    if (!ent) return

    waitingForInput.value = false
    await pushMessage('user', `将「${ent.name}」加入监控`)
    await delay(300)

    const steps = [
      { title: '配置监控规则', status: 'done', details: [
        { label: '工商变更', value: '已启用' },
        { label: '司法风险', value: '已启用' },
        { label: '税务异常', value: '已启用' },
        { label: '舆情风险', value: '已启用' },
      ]},
      { title: '创建监控任务', status: 'done', details: [
        { label: '监控频率', value: '每日' },
        { label: '监控维度', value: '工商变更 / 司法风险 / 税务异常 / 舆情风险' },
      ]},
    ]

    const monitorArtifactData = {
      enterprise: ent,
      rules: ['工商变更', '司法风险', '税务异常', '舆情风险'],
      frequency: '每日',
      dimensions: ['工商变更', '司法风险', '税务异常', '舆情风险'],
      created: true,
      status: '监控中',
      lastCheck: '暂无新增异常',
      steps,
      // 保留"新建尽调"动作
      actions: ['start_due_diligence'],
    }

    upsertStage({ id: 'monitor', label: STAGE_LABEL_MAP.monitor, icon: '📡', status: 'done', artifactData: { ...monitorArtifactData } })
    setActiveStage('monitor')

    await pushStreamingMessage('已将该企业加入监控。后续如果监控发现异常，也可以从监控转入尽调。')
    currentFlowStatus.value = 'waiting_next_action'
    waitingForInput.value = true
  }

  // ===================== 并列动作：新建尽调 =====================
  async function startDueDiligence(enterprise) {
    const ent = enterprise || selectedEnterprise.value
    if (!ent) return

    waitingForInput.value = false
    await pushMessage('user', `为「${ent.name}」新建尽调任务`)
    await delay(300)

    const ddArtifactData = {
      enterprise: ent,
      templates: dueDiligenceTemplates,
      selectedTemplateId: null,
      selectedTemplate: null,
      step: 'template-selection',
      stages: [],
      steps: [],
    }

    upsertStage({ id: 'dueDiligence', label: STAGE_LABEL_MAP.dueDiligence, icon: '📋', status: 'active', artifactData: { ...ddArtifactData } })
    setActiveStage('dueDiligence')

    await pushStreamingMessage('请先选择尽调模板。')
    await delay(400)
    await pushStreamingMessage('建议使用「标准授信尽调」，适用于制造业客户授信前审查。')
    currentFlowStatus.value = 'waiting_template'
    waitingForInput.value = true
  }

  // ===================== 确认尽调模板 → 进入尽调流程 =====================
  async function confirmDueTemplate(template) {
    selectedDueTemplate.value = template
    await pushMessage('user', `选择模板「${template.name}」`)
    await delay(300)

    const ent = selectedEnterprise.value
    const dueFlowSteps = freshDueFlowSteps('business')

    const ddArtifactData = {
      enterprise: ent,
      template,
      selectedTemplateId: template.id,
      selectedTemplate: template,
      step: 'task-created',
      stages: dueFlowSteps.map(s => ({ ...s })),
      steps: [
        { title: '创建尽调任务', status: 'done', details: [
          { label: '企业名称', value: ent?.name || '—' },
          { label: '尽调模板', value: template.name },
          { label: '预计耗时', value: template.estimatedDays + '天' },
        ]},
      ],
      dueFlow: {
        statusText: '等待开始',
        progress: 0,
        activeKey: 'business',
        steps: JSON.parse(JSON.stringify(dueFlowSteps)),
      },
    }

    const ddStage = flowStages.find(s => s.id === 'dueDiligence')
    if (ddStage) {
      Object.assign(ddStage, { status: 'done', artifactData: { ...ddArtifactData } })
    } else {
      upsertStage({ id: 'dueDiligence', label: STAGE_LABEL_MAP.dueDiligence, icon: '📋', status: 'done', artifactData: { ...ddArtifactData } })
    }

    setActiveStage('dueDiligence')

    await pushStreamingMessage('已创建尽调任务。正在进入智能尽调流程，第一步是工商核验。')
    await delay(800)
    await runBusinessVerification()
  }

  // ===================== 工商核验 =====================
  async function runBusinessVerification() {
    const ent = selectedEnterprise.value
    const isTsWq = ent?.id === 'ts-wq-sm'

    const dueFlowSteps = freshDueFlowSteps('judicial')

    const businessArtifactData = {
      enterprise: ent,
      entityStatus: '正常存续',
      judicialRisk: '无重大诉讼',
      relatedCompanies: '3 家',
      conclusion: '主体状态正常，未发现重大工商异常',
      legalPerson: isTsWq ? '马丽' : '—',
      registeredCapital: isTsWq ? '500万' : '—',
      establishedDate: isTsWq ? '2021-12-24' : '—',
      industry: isTsWq ? '建材批发' : '—',
      region: isTsWq ? '河北唐山' : '—',
      staffSize: '—',
      judicialDetails: [],
      relatedCompaniesList: [
        { name: '唐山某建材公司', relation: '关联法人', status: '正常' },
        { name: '唐山某物流公司', relation: '关联股东', status: '正常' },
        { name: '唐山某贸易公司', relation: '同地址', status: '正常' },
      ],
      steps: [
        { title: '查询工商登记信息', status: 'done' },
        { title: '核验主体状态', status: 'done' },
        { title: '查询关联企业', status: 'done' },
        { title: '生成工商核验结论', status: 'done' },
      ],
      dueFlow: {
        statusText: '工商核验已完成',
        progress: 14,
        activeKey: 'judicial',
        steps: JSON.parse(JSON.stringify(dueFlowSteps)),
      },
    }

    upsertStage({ id: 'business', label: STAGE_LABEL_MAP.business, icon: '🏛', status: 'done', artifactData: { ...businessArtifactData } })
    setActiveStage('business')

    await pushStreamingMessage('正在核验工商登记、主体状态、注册资本、法定代表人和关联企业。')
    await delay(1000)
    await pushStreamingMessage('工商核验已完成。企业主体正常存续，暂未发现重大工商异常。')
    await delay(400)
    await pushStreamingMessage('下一步将进入司法查询，继续核验诉讼、执行和处罚风险。')
    await delay(800)
    await runJudicialQuery()
  }

  // ===================== 司法查询 =====================
  async function runJudicialQuery() {
    const ent = selectedEnterprise.value

    const dueFlowSteps = freshDueFlowSteps('tax')
    dueFlowSteps[0].status = 'done'

    const judicialArtifactData = {
      enterprise: ent,
      majorLawsuit: 0,
      execution: 0,
      dishonest: 0,
      judgment: 2,
      judgmentText: '普通记录',
      penalty: 0,
      hearing: 1,
      conclusions: [
        { type: 'ok', text: '未发现失信被执行记录' },
        { type: 'ok', text: '未发现重大未结诉讼' },
        { type: 'ok', text: '未发现影响持续经营的行政处罚' },
        { type: 'warn', text: '存在少量历史裁判文书，建议归档备查' },
      ],
      records: [
        { type: '裁判文书', level: '低风险', summary: '买卖合同纠纷已结案' },
        { type: '开庭公告', level: '低风险', summary: '历史供应商争议' },
      ],
      steps: [
        { title: '查询司法诉讼', status: 'done' },
        { title: '查询被执行信息', status: 'done' },
        { title: '查询失信记录', status: 'done' },
        { title: '查询行政处罚', status: 'done' },
        { title: '生成司法查询结论', status: 'done' },
      ],
      dueFlow: {
        statusText: '司法查询已完成',
        progress: 28,
        activeKey: 'tax',
        steps: JSON.parse(JSON.stringify(dueFlowSteps)),
      },
    }

    upsertStage({ id: 'judicial', label: STAGE_LABEL_MAP.judicial, icon: '⚖', status: 'done', artifactData: { ...judicialArtifactData } })
    setActiveStage('judicial')

    await pushStreamingMessage('正在查询司法诉讼、被执行、失信、行政处罚和裁判文书信息。')
    await delay(1000)
    await pushStreamingMessage('司法查询已完成。未发现重大司法风险，存在少量历史普通记录，已归入证据链。')
    await delay(400)
    await pushStreamingMessage('下一步将进入税票采集，需要企业授权后才能继续采集税票数据。')
    await delay(800)
    await runTaxCollectionStep()
  }

  // ===================== 税票采集 =====================
  async function runTaxCollectionStep() {
    const ent = selectedEnterprise.value
    const taxArtifactData = {
      enterprise: ent,
      status: '等待企业授权',
      authStatus: '等待授权',
      linkStatus: '待发送',
      authUrl: 'https://ai-copilot.demo/auth/rpa002',
      input: { count: 0, total: 150 },
      output: { count: 0, total: 120 },
      filing: { status: '未采集' },
      logs: [
        { time: '09:10', desc: '已生成税票采集授权链接', status: 'done' },
        { time: '—', desc: '等待发送给企业授权', status: 'waiting' },
      ],
      steps: [
        { title: '生成授权链接', status: 'done' },
      ],
      dueFlow: {
        statusText: '等待税票授权',
        progress: 43,
        activeKey: 'tax',
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'active' },
          { key: 'materials', label: '资料补充', status: 'pending' },
          { key: 'evidence', label: '证据整合', status: 'pending' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
          { key: 'deliverables', label: '产物确认', status: 'pending' },
        ])),
      },
    }

    upsertStage({ id: 'tax', label: STAGE_LABEL_MAP.tax, icon: '🧾', status: 'active', artifactData: { ...taxArtifactData } })
    setActiveStage('tax')

    currentFlowStatus.value = 'waiting_tax_confirmation'
    waitingForInput.value = true
    fillSuggestions('waiting_tax_confirmation')

    await pushStreamingMessage('已生成税票采集授权链接。请发送给企业扫码授权，有效期 24 小时。')
    await delay(600)
    await pushStreamingMessage('授权完成前，左侧会展示等待授权状态和采集清单。')
  }

  /** 用户确认发送采集链接 */
  async function confirmTaxSend() {
    waitingForInput.value = false
    await pushMessage('user', '确认发送采集链接')
    await delay(300)

    const taxStage = flowStages.find(s => s.id === 'tax')
    if (taxStage && taxStage.artifactData) {
      taxStage.artifactData.linkStatus = '已发送'
      taxStage.artifactData.authStatus = '等待授权'
      taxStage.artifactData.logs.push({ time: '09:20', desc: '采集链接已发送给企业', status: 'done' })
      taxStage.artifactData.logs.push({ time: '—', desc: '等待企业扫码授权…', status: 'waiting' })
      Object.assign(artifactData, taxStage.artifactData)
      Object.assign(leftPanelData, taxStage.artifactData)
    }

    currentFlowStatus.value = 'waiting_tax_authorization'
    waitingForInput.value = true
    fillSuggestions('waiting_tax_authorization')

    await pushStreamingMessage('采集链接已发送。等待企业线下扫码授权完成后，可以点击"模拟企业已授权"继续。')
  }

  /** 模拟企业已完成授权 → 税票采集完成 → 停在等待资料补充 */
  async function mockTaxAuthorized() {
    waitingForInput.value = false
    await pushMessage('user', '模拟企业已授权')
    await delay(300)

    const taxArtifactData = {
      enterprise: selectedEnterprise.value,
      status: '已完成',
      authStatus: '已授权',
      linkStatus: '已使用',
      authUrl: 'https://ai-copilot.demo/auth/rpa002',
      input: { count: 128, total: 150 },
      output: { count: 96, total: 120 },
      filing: { status: '已采集' },
      logs: [
        { time: '09:10', desc: '已生成税票采集授权链接', status: 'done' },
        { time: '09:20', desc: '采集链接已发送给企业', status: 'done' },
        { time: '09:25', desc: '企业已完成授权', status: 'done' },
        { time: '09:30', desc: '进项发票采集中… 128/150', status: 'running' },
        { time: '09:35', desc: '销项发票采集中… 96/120', status: 'running' },
        { time: '09:40', desc: '纳税申报数据已采集', status: 'done' },
      ],
      steps: [
        { title: '生成授权链接', status: 'done' },
        { title: '企业扫码授权', status: 'done' },
        { title: 'RPA 采集税票数据', status: 'done' },
        { title: '数据入库校验', status: 'done' },
      ],
      dueFlow: {
        statusText: '税票采集已完成',
        progress: 43,
        activeKey: 'tax',
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'done' },
          { key: 'materials', label: '资料补充', status: 'active' },
          { key: 'evidence', label: '证据整合', status: 'pending' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
          { key: 'deliverables', label: '产物确认', status: 'pending' },
        ])),
      },
    }

    upsertStage({ id: 'tax', label: STAGE_LABEL_MAP.tax, icon: '🧾', status: 'done', artifactData: { ...taxArtifactData } })
    setActiveStage('tax')

    await pushStreamingMessage('企业已完成授权，正在采集进项发票、销项发票和纳税申报数据。')
    await delay(800)
    await pushStreamingMessage('税票数据采集完成。左侧已展示采集进度、发票数量和采集日志。')
    await delay(400)
    await pushStreamingMessage('下一步将进入资料补充，当前资料包完整度预计为 67%。')
    await delay(400)

    currentFlowStatus.value = 'waiting_material_action'
    waitingForInput.value = true
    fillSuggestions('waiting_material_upload')
  }

  // ===================== 资料补充 =====================
  async function runMaterialsStep() {
    const ent = selectedEnterprise.value
    const isTsWq = ent?.id === 'ts-wq-sm'

    const materials = isTsWq
      ? [
          { name: '营业执照', type: '证照', status: '已收集' },
          { name: '近一年纳税申报', type: '税务', status: '已收集' },
          { name: '开票明细', type: '税务', status: '已收集' },
          { name: '基础工商资料', type: '工商', status: '已收集' },
          { name: '主要合同', type: '合同', status: '缺失' },
          { name: '银行流水', type: '财务', status: '缺失' },
          { name: '购销说明', type: '经营', status: '缺失' },
          { name: '税负异常说明', type: '税务', status: '缺失' },
        ]
      : [
          { name: '营业执照', type: '证照', status: '已收集' },
          { name: '近6月银行流水', type: '财务', status: '已收集' },
          { name: '财务报表', type: '财务', status: '已收集' },
          { name: '纳税申报表', type: '税务', status: '已收集' },
          { name: '主要购销合同', type: '合同', status: '缺失' },
        ]

    const missing = materials.filter(m => m.status === '缺失')

    const materialsArtifactData = {
      enterprise: ent,
      status: '待补充',
      materials,
      missing,
      completeness: isTsWq ? 67 : 60,
      steps: [
        { title: '列出资料清单', status: 'done' },
      ],
      dueFlow: {
        statusText: '等待资料补充',
        progress: 57,
        activeKey: 'materials',
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'done' },
          { key: 'materials', label: '资料补充', status: 'active' },
          { key: 'evidence', label: '证据整合', status: 'pending' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
          { key: 'deliverables', label: '产物确认', status: 'pending' },
        ])),
      },
    }

    upsertStage({ id: 'materials', label: STAGE_LABEL_MAP.materials, icon: '📁', status: 'active', artifactData: { ...materialsArtifactData } })
    setActiveStage('materials')

    currentFlowStatus.value = 'waiting_material_upload'
    waitingForInput.value = true
    fillSuggestions('waiting_material_upload')

    await pushStreamingMessage('已根据「标准授信尽调」模板生成资料包。当前识别到 8 项资料，缺失 4 项。')
    await delay(600)
    await pushStreamingMessage('我可以生成资料收集清单，发送给企业补充，也可以在 demo 中模拟企业已上传资料。')
  }

  /** 模拟企业上传资料 → 资料补充完成 → 停在等待证据整合 */
  async function mockMaterialUpload() {
    waitingForInput.value = false
    await pushMessage('user', '模拟企业上传资料')
    await delay(300)

    const ent = selectedEnterprise.value
    const isTsWq = ent?.id === 'ts-wq-sm'

    const materials = isTsWq
      ? [
          { name: '营业执照', type: '证照', status: '已收集' },
          { name: '近一年纳税申报', type: '税务', status: '已收集' },
          { name: '开票明细', type: '税务', status: '已收集' },
          { name: '基础工商资料', type: '工商', status: '已收集' },
          { name: '主要合同', type: '合同', status: '已收集' },
          { name: '银行流水', type: '财务', status: '已收集' },
          { name: '购销说明', type: '经营', status: '待确认' },
          { name: '税负异常说明', type: '税务', status: '待确认' },
        ]
      : [
          { name: '营业执照', type: '证照', status: '已收集' },
          { name: '近6月银行流水', type: '财务', status: '已收集' },
          { name: '财务报表', type: '财务', status: '已收集' },
          { name: '纳税申报表', type: '税务', status: '已收集' },
          { name: '主要购销合同', type: '合同', status: '已收集' },
        ]

    const missing = materials.filter(m => m.status === '待确认')

    const materialsArtifactData = {
      enterprise: ent,
      status: '已补充',
      materials,
      missing,
      completeness: 86,
      steps: [
        { title: '列出资料清单', status: 'done' },
        { title: '上传资料包', status: 'done' },
        { title: 'OCR 识别资料', status: 'done' },
        { title: '资料分类归档', status: 'done' },
        { title: '资料完整度评估', status: 'done' },
      ],
      dueFlow: {
        statusText: '资料补充已完成',
        progress: 57,
        activeKey: 'materials',
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'done' },
          { key: 'materials', label: '资料补充', status: 'done' },
          { key: 'evidence', label: '证据整合', status: 'active' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
          { key: 'deliverables', label: '产物确认', status: 'pending' },
        ])),
      },
    }

    upsertStage({ id: 'materials', label: STAGE_LABEL_MAP.materials, icon: '📁', status: 'done', artifactData: { ...materialsArtifactData } })
    setActiveStage('materials')

    await pushStreamingMessage('已收到企业补充资料，正在识别营业执照、合同、银行流水和税务说明。')
    await delay(800)
    await pushStreamingMessage('资料识别完成。当前资料包完整度提升至 86%，仍有 2 项需要后续确认。')
    await delay(400)
    await pushStreamingMessage('下一步将进入证据整合。')
    await delay(400)

    currentFlowStatus.value = 'waiting_evidence_action'
    waitingForInput.value = true
    fillSuggestions('waiting_evidence_action')
  }

  // ===================== 证据整合 =====================
  async function runEvidenceMergeStep() {
    const ent = selectedEnterprise.value
    const isTsWq = ent?.id === 'ts-wq-sm'

    const evidenceArtifactData = {
      enterprise: ent,
      integrity: isTsWq ? 86 : 86,
      sources: [
        { name: '工商证据', count: 6, status: '已归档' },
        { name: '司法证据', count: 2, status: '已归档' },
        { name: '税票证据', count: 12, status: '已归档' },
        { name: '资料证据', count: isTsWq ? 8 : 5, status: '已归档' },
        { name: '风险关联证据', count: isTsWq ? 4 : 0, status: isTsWq ? '已建立' : '无需' },
      ],
      riskEvidence: isTsWq ? [
        { name: '税负率显著低于行业', count: 4, confidence: '高' },
        { name: '开票收入与申报不一致', count: 3, confidence: '高' },
        { name: '购销两头在外', count: 3, confidence: '中' },
        { name: '电费与收入相关性低', count: 1, confidence: '待补充' },
      ] : [],
      gaps: isTsWq ? [
        '! 电费缴费记录缺失，影响"电费与收入相关性"判断',
        '! 主要合同仍需补充原件，影响"购销两头在外"判断',
      ] : [],
      steps: [
        { title: '整合工商数据证据', status: 'done' },
        { title: '整合司法数据证据', status: 'done' },
        { title: '整合税票数据证据', status: 'done' },
        { title: '整合资料证据', status: 'done' },
        { title: '建立风险事项证据链', status: 'done' },
        { title: '证据完整度评估', status: 'done' },
      ],
      dueFlow: {
        statusText: '证据整合已完成',
        progress: 71,
        activeKey: 'riskDiagnosis',
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'done' },
          { key: 'materials', label: '资料补充', status: 'done' },
          { key: 'evidence', label: '证据整合', status: 'done' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'active' },
          { key: 'deliverables', label: '产物确认', status: 'pending' },
        ])),
      },
    }

    upsertStage({ id: 'evidence', label: STAGE_LABEL_MAP.evidence, icon: '🔗', status: 'done', artifactData: { ...evidenceArtifactData } })
    setActiveStage('evidence')

    await pushStreamingMessage('正在将工商、司法、税票、资料等来源的证据进行串联和整合。')
    await delay(1000)
    if (isTsWq) {
      await pushStreamingMessage('证据整合已完成。已为 4 个风险事项建立证据链，整体证据完整度 86%。')
    } else {
      await pushStreamingMessage('证据整合已完成。各来源证据已归档，整体证据完整度 86%。')
    }
    await delay(400)
    await pushStreamingMessage('下一步将进入风险诊断，AI 将综合所有证据进行风险评级和建议。')
    await delay(400)

    currentFlowStatus.value = 'waiting_risk_action'
    waitingForInput.value = true
    fillSuggestions('waiting_risk_action')
  }

  // ===================== 风险诊断 =====================
  async function runRiskDiagnosisStep() {
    const ent = selectedEnterprise.value
    const isTsWq = ent?.id === 'ts-wq-sm'

    const riskArtifactData = {
      enterprise: ent,
      score: isTsWq ? '72' : '85',
      grade: isTsWq ? 'C+' : 'B',
      riskLevel: isTsWq ? '中' : '低',
      riskIssues: isTsWq ? tangshanRiskIssues : [
        { name: '经营规模偏小', level: '低', category: '经营稳定性', description: '营收规模相对较小，抗风险能力有限', evidenceSources: ['财务报表'] },
      ],
      highlights: isTsWq ? tangshanHighlights : [
        { name: '纳税信用 A 级', description: '税务评级良好' },
      ],
      indicators: isTsWq ? tangshanIndicators : [],
      conclusion: isTsWq
        ? '建议有条件授信，补充交易真实性和税负异常说明'
        : '企业经营稳定，风险可控，建议正常推进授信流程。',
      suggestedActions: isTsWq
        ? ['要求补充电费记录', '追加股东连带担保', '限制授信额度', '提高贷后检查频率']
        : ['正常推进'],
      steps: [
        { title: '综合评分计算', status: 'done' },
        { title: '风险等级判定', status: 'done' },
        { title: '生成诊断结论', status: 'done' },
      ],
      dueFlow: {
        statusText: '风险诊断已完成',
        progress: 86,
        activeKey: 'deliverables',
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'done' },
          { key: 'materials', label: '资料补充', status: 'done' },
          { key: 'evidence', label: '证据整合', status: 'done' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'done' },
          { key: 'deliverables', label: '产物确认', status: 'active' },
        ])),
      },
    }

    upsertStage({ id: 'riskDiagnosis', label: STAGE_LABEL_MAP.riskDiagnosis, icon: '🩺', status: 'done', artifactData: { ...riskArtifactData } })
    setActiveStage('riskDiagnosis')

    await pushStreamingMessage('正在综合所有证据进行风险评分和诊断。')
    await delay(1200)
    if (isTsWq) {
      await pushStreamingMessage('风险诊断已完成。该企业整体为中风险，主要风险集中在税负率偏低、收入一致性和业务真实性。')
    } else {
      await pushStreamingMessage('风险诊断已完成。综合评分85分（等级B），低风险。企业经营稳定，风险可控。')
    }
    await delay(400)
    await pushStreamingMessage('下一步将确认尽调产物，准备生成授信调查报告。')
    await delay(400)

    currentFlowStatus.value = 'waiting_deliverable_action'
    waitingForInput.value = true
    fillSuggestions('waiting_deliverable_action')
  }

  // ===================== 产物确认 =====================
  async function runDeliverablesStep() {
    const ent = selectedEnterprise.value

    const deliverablesArtifactData = {
      enterprise: ent,
      items: [
        { name: '尽调底稿', status: '已生成', count: '1 份' },
        { name: '工商核验报告', status: '已生成', count: '1 份' },
        { name: '司法查询报告', status: '已生成', count: '1 份' },
        { name: '税票分析报告', status: '已生成', count: '1 份' },
        { name: '风险诊断报告', status: '已生成', count: '1 份' },
        { name: '证据链文件', status: '已归档', count: '24 项' },
      ],
      steps: [
        { title: '生成尽调产物', status: 'done' },
        { title: '产物质量校验', status: 'done' },
      ],
      dueFlow: {
        statusText: '尽调已完成',
        progress: 100,
        activeKey: null,
        steps: JSON.parse(JSON.stringify([
          { key: 'business', label: '工商核验', status: 'done' },
          { key: 'judicial', label: '司法查询', status: 'done' },
          { key: 'tax', label: '税票采集', status: 'done' },
          { key: 'materials', label: '资料补充', status: 'done' },
          { key: 'evidence', label: '证据整合', status: 'done' },
          { key: 'riskDiagnosis', label: '风险诊断', status: 'done' },
          { key: 'deliverables', label: '产物确认', status: 'done' },
        ])),
      },
    }

    upsertStage({ id: 'deliverables', label: STAGE_LABEL_MAP.deliverables, icon: '📦', status: 'done', artifactData: { ...deliverablesArtifactData } })
    setActiveStage('deliverables')

    currentFlowStatus.value = 'completed'
    waitingForInput.value = true
    flowCompletedAt.value = new Date().toISOString()
    fillSuggestions('completed')

    await pushStreamingMessage('产物已生成，包括尽调报告草稿、资料包、证据链和附件清单。')
    await delay(600)
    await pushStreamingMessage('可以进入报告编辑环节，也可以在此结束尽调流程。')
  }

  /** 用户点击"进入证据整合" */
  async function enterEvidenceMerge() {
    waitingForInput.value = false
    await pushMessage('user', '进入证据整合')
    await delay(300)
    await runEvidenceMergeStep()
  }

  /** 用户点击"进入风险诊断" */
  async function enterRiskDiagnosis() {
    waitingForInput.value = false
    await pushMessage('user', '进入风险诊断')
    await delay(300)
    await runRiskDiagnosisStep()
  }

  /** 用户点击"进入产物确认" */
  async function enterDeliverables() {
    waitingForInput.value = false
    await pushMessage('user', '进入产物确认')
    await delay(300)
    await runDeliverablesStep()
  }

  // ===================== 报告编辑（可选） =====================
  async function startReportEditor() {
    const ent = selectedEnterprise.value
    const isTsWq = ent?.id === 'ts-wq-sm'

    const reportArtifactData = {
      title: '授信调查报告',
      template: '标准授信模板',
      sections: [
        { no: 1, title: '企业基本信息', status: '已完成' },
        { no: 2, title: '工商与司法核验', status: '已完成' },
        { no: 3, title: '经营分析', status: '已完成' },
        { no: 4, title: '税务分析', status: '已完成' },
        { no: 5, title: '风险诊断', status: '已完成' },
        { no: 6, title: '授信建议', status: '待确认' },
      ],
      content: isTsWq
        ? '本报告基于对唐山物桥商贸有限公司的综合尽调，涵盖工商、司法、税票、资料等维度...'
        : '本报告基于对企业基本信息、工商司法核验、经营税务等多维度分析...',
      steps: [
        { title: '生成报告框架', status: 'done' },
        { title: '填充尽调数据', status: 'done' },
      ],
    }

    upsertStage({ id: 'reportEditor', label: STAGE_LABEL_MAP.reportEditor, icon: '📝', status: 'active', artifactData: { ...reportArtifactData } })
    setActiveStage('reportEditor')

    await pushStreamingMessage('报告编辑器已打开。你可以人工编辑和调整报告内容，AI 可辅助改写和校对。')
    currentFlowStatus.value = 'editing'
    waitingForInput.value = true
    fillSuggestions('editing')
  }

  /** 根据流程状态填充右侧建议按钮 */
  function fillSuggestions(flowStatus) {
    contextSuggestions.length = 0
    const map = {
      waiting_selection: [{ label: '探查 唐山物桥商贸有限公司', value: '唐山物桥商贸有限公司' }],
      waiting_action: [
        { label: '新建尽调', value: '新建尽调' },
        { label: '加入监控', value: '加入监控' },
      ],
      waiting_template: [{ label: '选择模板「标准授信尽调」', value: '标准授信尽调' }],
      waiting_tax_confirmation: [{ label: '确认发送采集链接', value: 'confirm_tax_send' }],
      waiting_tax_authorization: [{ label: '模拟企业已授权', value: 'tax_authorized' }],
      waiting_material_upload: [{ label: '模拟企业上传资料', value: 'mock_material_upload' }],
      waiting_evidence_action: [{ label: '进入证据整合', value: 'enter_evidence' }],
      waiting_risk_action: [{ label: '进入风险诊断', value: 'enter_risk' }],
      waiting_deliverable_action: [{ label: '进入产物确认', value: 'enter_deliverables' }],
      completed: [
        { label: '编辑报告', value: 'edit_report' },
        { label: '导出报告', value: 'export_report' },
        { label: '加入监控', value: 'start_monitor' },
      ],
      editing: [
        { label: '改写风险结论', value: '改写风险结论' },
        { label: '补充税票说明', value: '补充税票说明' },
        { label: '生成授信建议', value: '生成授信建议' },
      ],
    }
    const items = map[flowStatus] || []
    items.forEach(item => contextSuggestions.push(item))
  }

  // ===================== 消息路由 =====================
  async function sendMessage(text = '') {
    if (text) dialogInput.value = text
    const inputText = dialogInput.value.trim()
    if (!inputText) return
    dialogInput.value = ''
    await pushMessage('user', inputText)

    if (waitingForInput.value) {
      await handleWaitingForInput(inputText)
      return
    }

    const intent = detectIntent(inputText)
    currentIntent.value = intent

    if (intent === 'screening') {
      currentFlowStatus.value = 'running'
      await runScreening(inputText)
    }
  }

  async function handleWaitingForInput(text) {
    waitingForInput.value = false
    const lower = text.toLowerCase()

    if (currentFlowStatus.value === 'waiting_selection') {
      const ent = mockEnterprises.find(e => text.includes(e.name)) || mockEnterprises[0]
      await selectEnterpriseAndExplore(ent)
    } else if (currentFlowStatus.value === 'waiting_action') {
      if (lower.includes('监控')) { await startMonitor() }
      else { await startDueDiligence() }
    } else if (currentFlowStatus.value === 'waiting_template') {
      const tpl = dueDiligenceTemplates.find(t => text.includes(t.name)) || dueDiligenceTemplates[0]
      await confirmDueTemplate(tpl)
    } else if (currentFlowStatus.value === 'waiting_tax_confirmation') {
      await confirmTaxSend()
    } else if (currentFlowStatus.value === 'waiting_tax_authorization') {
      await mockTaxAuthorized()
    } else if (currentFlowStatus.value === 'waiting_material_upload' || currentFlowStatus.value === 'waiting_material_action') {
      await mockMaterialUpload()
    } else if (currentFlowStatus.value === 'waiting_evidence_action') {
      await enterEvidenceMerge()
    } else if (currentFlowStatus.value === 'waiting_risk_action') {
      await enterRiskDiagnosis()
    } else if (currentFlowStatus.value === 'waiting_deliverable_action') {
      await enterDeliverables()
    } else if (currentFlowStatus.value === 'completed') {
      if (lower.includes('编辑') || lower.includes('report')) {
        await startReportEditor()
      } else if (lower.includes('监控')) {
        await startMonitor()
      }
    } else if (currentFlowStatus.value === 'editing') {
      await pushStreamingMessage('好的，我来帮你处理。')
    }
  }

  // ===================== 快捷操作 =====================
  async function onQuickAction(action) {
    switch (action) {
      case 'explore':
        if (selectedEnterprise.value) {
          await pushMessage('user', `探查「${selectedEnterprise.value.name}」`)
          await runEnterpriseExploration(selectedEnterprise.value)
        }
        break
      case 'start_monitor':
        await startMonitor()
        break
      case 'start_due_diligence':
        await startDueDiligence()
        break
    }
  }

  // ===================== 导出 =====================
  /** 直接传文本触发意图识别（供页面 handleNormalSend 调用） */
  async function runIntentRecognition(text) {
    dialogOpen.value = true
    dialogInput.value = text
    await sendMessage()
  }

  /** 导出最终报告 */
  async function exportFinalReport() {
    await pushMessage('user', '导出最终报告')
    await pushStreamingMessage('已生成最终报告导出任务，demo 阶段可在左侧产物确认区查看报告和资料包。')
  }

  /** 查看诊断报告 */
  async function viewDiagnosisReport() {
    await pushMessage('user', '查看诊断报告')
    await pushStreamingMessage('左侧已展示当前企业诊断报告摘要，可继续进入产物确认或要求我补充风险说明。')
  }

  /** 发送资料清单 */
  async function sendMaterialList() {
    await pushMessage('user', '发送资料清单')
    await pushStreamingMessage('资料清单已发送给企业。demo 阶段可以点击「模拟企业上传资料」继续。')
    currentFlowStatus.value = 'waiting_material_upload'
    waitingForInput.value = true
    fillSuggestions('waiting_material_upload')
  }

  /** 发送税票授权提醒 */
  async function sendTaxAuthReminder() {
    await pushMessage('user', '发送授权提醒')
    await pushStreamingMessage('已向企业发送税票授权提醒。demo 阶段可以点击「模拟企业已授权」继续。')
    currentFlowStatus.value = 'waiting_tax_authorization'
    waitingForInput.value = true
    fillSuggestions('waiting_tax_authorization')
  }

  return {
    dialogOpen, dialogInput, messages, waitingForInput,
    currentFlowStatus, currentStageId, activeStageId, flowStages,
    artifactData, currentArtifactType,
    selectedCustomer, candidateCustomers, lastScreeningResults,
    lastDueTask, pendingConfirmation, pausedReason,
    conversationContext, flowStartedAt, flowCompletedAt,
    currentIntent, isThinking, thinkingText,
    layoutMode, activeTool, selectedEnterprise, selectedDueTemplate,
    leftPanelData, contextSuggestions,
    setLeftPanel, setActiveStage, updateWorkbenchArtifact,
    reset, sendMessage, runIntentRecognition, handleSuggestionClick,
    handleWaitingForInput, onQuickAction,
    selectEnterpriseAndExplore, startMonitor, startDueDiligence,
    confirmDueTemplate, confirmTaxSend, mockTaxAuthorized,
    mockMaterialUpload, enterEvidenceMerge, enterRiskDiagnosis,
    enterDeliverables, startReportEditor,
    runMaterialsStep, exportFinalReport, viewDiagnosisReport,
    sendMaterialList, sendTaxAuthReminder,
  }
})

