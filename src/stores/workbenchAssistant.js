/**
 * 工作台 AI 助手 v3 — 三态工作流：对话启动态 / 工作区态 / 沉浸编辑态
 * 支持：智能筛客 → 企业探查 → 加入监控/新建尽调(并列) → 尽调流程 → 报告编辑
 *
 * 数据流规范（2026-07-02 修复）：
 * 1. 每个阶段先构造完整 artifactData（含 steps）
 * 2. 再 upsertStage({ id, label, status, artifactData })
 * 3. 再 setActiveStage(id) — 内部从 stage.artifactData 同步 leftPanelData
 * 4. 不再先插入空 artifactData 的 stage
 * 5. setActiveStage 对空 artifactData 自动填入兜底对象
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

// ====== 阶段定义 ======
const STAGE_LABEL_MAP = {
  screen: '智能筛客', explore: '企业探查', monitor: '加入监控', dueDiligence: '新建尽调',
  business: '工商校验', tax: '税票采集', materials: '资料收集',
  riskDiagnosis: '风险诊断', deliverables: '产物生成', reportEditor: '报告编辑',
}

const STAGE_TOOL_MAP = {
  screen: 'screening', explore: 'exploration', monitor: 'monitor', dueDiligence: 'dueDiligence',
  business: 'business', tax: 'tax', materials: 'materials',
  riskDiagnosis: 'riskDiagnosis', deliverables: 'deliverables', reportEditor: 'reportEditor',
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

  /** 统一设置左侧面板数据源 */
  function setLeftPanel(tool, payload = {}) {
    activeTool.value = tool
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, payload)
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

  const mockRiskDiagnosis = {
    score: 72, grade: 'B', riskLevel: '中',
    commercialRisk: '低风险', taxRisk: '中风险', operationRisk: '低风险', dataConsistencyRisk: '低风险',
    evidenceSummary: '工商正常存续，税务评级A，近一年营收稳定',
    conclusion: '综合评分72，建议有条件授信',
    riskItems: [
      { category: '工商风险', level: '低', detail: '主体正常存续，无重大诉讼', suggestion: '持续关注' },
      { category: '税务风险', level: '中', detail: '税负率偏低，低于行业均值29%', suggestion: '核实税负结构' },
      { category: '经营风险', level: '低', detail: '近12个月营收稳定，社保人数正常', suggestion: '持续关注' },
      { category: '一致性', level: '低', detail: '工商、税务、社保数据一致性良好', suggestion: '无' },
    ],
  }

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

  const mockDeliverables = [
    { name: '尽调资料包', status: '已生成', count: '18份' },
    { name: '风险诊断报告', status: '已生成', count: '1份' },
    { name: '智能报告草稿', status: '待确认', count: '1份' },
    { name: '附件与证据链', status: '已归档', count: '24份' },
  ]

  // ====== 尽调流程条数据 ======
  const dueFlowSteps = [
    { key: 'business', label: '工商核验', status: 'done' },
    { key: 'judicial', label: '司法查询', status: 'done' },
    { key: 'tax', label: '税票采集', status: 'active' },
    { key: 'materials', label: '资料补充', status: 'pending' },
    { key: 'evidence', label: '证据整合', status: 'pending' },
    { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
    { key: 'deliverables', label: '产物确认', status: 'pending' },
  ]

  const dueFlowStepsCompleted = [
    { key: 'business', label: '工商核验', status: 'done' },
    { key: 'judicial', label: '司法查询', status: 'done' },
    { key: 'tax', label: '税票采集', status: 'done' },
    { key: 'materials', label: '资料补充', status: 'active' },
    { key: 'evidence', label: '证据整合', status: 'pending' },
    { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
    { key: 'deliverables', label: '产物确认', status: 'pending' },
  ]

  const dueFlowStepsInitial = [
    { key: 'business', label: '工商核验', status: 'active' },
    { key: 'judicial', label: '司法查询', status: 'pending' },
    { key: 'tax', label: '税票采集', status: 'pending' },
    { key: 'materials', label: '资料补充', status: 'pending' },
    { key: 'evidence', label: '证据整合', status: 'pending' },
    { key: 'riskDiagnosis', label: '风险诊断', status: 'pending' },
    { key: 'deliverables', label: '产物确认', status: 'pending' },
  ]

  const collectionItemsPending = [
    { name: '进项发票', status: 'pending', statusText: '等待中' },
    { name: '销项发票', status: 'pending', statusText: '等待中' },
    { name: '纳税申报', status: 'pending', statusText: '等待中' },
  ]

  const collectionItemsDone = [
    { name: '进项发票', status: 'done', statusText: '已采集 128 份' },
    { name: '销项发票', status: 'done', statusText: '已采集 96 份' },
    { name: '纳税申报', status: 'done', statusText: '已采集' },
  ]

  // 兼容旧版
  const processSteps = computed(() => {
    const steps = []
    for (const stage of flowStages) {
      if (stage.artifactData?.steps) {
        steps.push(...stage.artifactData.steps.map(s => ({ ...s, phase: stage.label })))
      }
    }
    return steps
  })
  const sidebarMode = computed(() => currentArtifactType.value)

  // ===================== 工具函数 =====================
  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function withThinking(text, fn) {
    isThinking.value = true; thinkingText.value = text
    try { return await fn() } finally { isThinking.value = false }
  }

  async function pushMessage(type, text, extra = {}) {
    // 去重：不重复推送相同 AI 消息
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
    flowStages.push(stage)
    return stage
  }

  /**
   * setActiveStage — 从 flowStages 同步左侧面板
   * 1. 找到 stage
   * 2. 映射 activeTool
   * 3. 若 artifactData 为空 → 兜底对象
   * 4. 同步 leftPanelData
   */
  function setActiveStage(id) {
    activeStageId.value = id
    Object.keys(artifactData).forEach(k => delete artifactData[k])

    const stage = flowStages.find(s => s.id === id)
    if (!stage) {
      const fallback = { status: 'empty', title: id, placeholder: '节点尚未就绪' }
      Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
      Object.assign(leftPanelData, fallback)
      return
    }

    currentArtifactType.value = id
    Object.assign(artifactData, stage.artifactData || {})

    layoutMode.value = 'workspace'

    const mappedTool = STAGE_TOOL_MAP[id]
    if (mappedTool) {
      activeTool.value = mappedTool
      // 兜底：如果 artifactData 为空，填入默认结构
      let data = stage.artifactData
      if (!data || Object.keys(data).length === 0) {
        data = { status: 'empty', title: stage.label || id, placeholder: '当前节点暂无产物，请继续流程' }
      }
      Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
      Object.assign(leftPanelData, data)
    }
  }

  /**
   * 统一更新左侧面板产物（新增辅助函数）
   */
  function updateWorkbenchArtifact(stageId, tool, payload, stageStatus = 'active') {
    layoutMode.value = 'workspace'
    activeTool.value = tool

    upsertStage({
      id: stageId,
      label: STAGE_LABEL_MAP[stageId] || stageId,
      status: stageStatus,
      artifactData: { ...payload },
    })

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
    if (lower.includes('深圳')) filters.push('深圳市')
    if (lower.includes('软件')) filters.push('软件业')
    if (lower.includes('风险')) filters.push('关注风险')
    if (lower.includes('进度')) filters.push('关注尽调进度')
    if (filters.length === 0) filters.push('制造业', '低风险')

    layoutMode.value = 'chat-center'
    activeTool.value = 'intent'

    await pushStreamingMessage('已收到需求，正在识别你的操作意图。')
    await delay(800)
    await pushStreamingMessage(`识别到：智能筛客工具。筛选条件：${filters.join(' / ')}。正在生成候选客户列表...`)
    await delay(600)

    const enterprises = (lower.includes('深圳') && lower.includes('软件'))
      ? [...shenzhenSoftwareEnterprises]
      : [...mockEnterprises]

    // 构造完整 steps
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

    // 先构造完整数据，再 upsert + setActiveStage
    upsertStage({ id: 'screen', label: '智能筛客', icon: '🔍', status: 'done', artifactData: { ...screenArtifactData } })
    setActiveStage('screen')

    currentFlowStatus.value = 'waiting_selection'
    currentStageId.value = 'screen'
    waitingForInput.value = true

    await pushStreamingMessage(`已完成智能筛客，识别到 ${enterprises.length} 家候选企业。请在左侧选择一家企业进行探查，或者继续调整筛选条件。`)
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

    // 是否为唐山物桥主线企业
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
    }

    upsertStage({ id: 'explore', label: '企业探查', icon: '🏢', status: 'done', artifactData: { ...exploreArtifactData } })
    setActiveStage('explore')

    await pushStreamingMessage('已完成企业探查。你可以将该企业加入监控，也可以新建尽调任务。这两个动作是并列选择，也可以后续互相转入。')
    currentFlowStatus.value = 'waiting_action'
    waitingForInput.value = true
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
        { label: '税务评级异常', value: '已启用' },
        { label: '重大风险预警', value: '已启用' },
      ]},
      { title: '创建监控任务', status: 'done', details: [
        { label: '监控频率', value: '每日' },
        { label: '监控维度', value: '工商 / 税票 / 司法' },
      ]},
    ]

    const monitorArtifactData = {
      enterprise: ent,
      rules: ['工商变更监控', '税务评级异常', '重大风险预警'],
      frequency: '每日',
      dimensions: ['工商', '税票', '司法'],
      created: true,
      steps,
    }

    upsertStage({ id: 'monitor', label: '加入监控', icon: '📡', status: 'done', artifactData: { ...monitorArtifactData } })
    setActiveStage('monitor')

    await pushStreamingMessage('已创建企业监控任务。后续如果监控发现工商变更、税务异常或经营风险，可以从监控预警转入复核尽调。')
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

    upsertStage({ id: 'dueDiligence', label: '新建尽调', icon: '📋', status: 'active', artifactData: { ...ddArtifactData } })
    setActiveStage('dueDiligence')

    await pushStreamingMessage('请先选择尽调模板。')
    currentFlowStatus.value = 'waiting_template'
    waitingForInput.value = true
  }

  // ===================== 确认尽调模板 → 进入尽调流程 =====================
  async function confirmDueTemplate(template) {
    selectedDueTemplate.value = template
    await pushMessage('user', `选择模板「${template.name}」`)
    await delay(300)

    const ddStage = flowStages.find(s => s.id === 'dueDiligence')
    const ent = selectedEnterprise.value

    const ddArtifactData = {
      enterprise: ent,
      template,
      selectedTemplateId: template.id,
      selectedTemplate: template,
      step: 'task-created',
      stages: dueFlowStepsInitial.map(s => ({ ...s })),
      steps: [
        { title: '创建尽调任务', status: 'done', details: [
          { label: '企业名称', value: ent?.name || '—' },
          { label: '尽调模板', value: template.name },
          { label: '预计耗时', value: template.estimatedDays + '天' },
        ]},
      ],
      dueFlow: {
        statusText: '等待开始',
        progress: 28,
        activeKey: 'business',
        steps: JSON.parse(JSON.stringify(dueFlowStepsInitial)),
      },
    }

    if (ddStage) {
      Object.assign(ddStage, { status: 'done', artifactData: { ...ddArtifactData } })
    } else {
      upsertStage({ id: 'dueDiligence', label: '新建尽调', icon: '📋', status: 'done', artifactData: { ...ddArtifactData } })
    }

    setActiveStage('dueDiligence')

    await pushStreamingMessage('已创建尽调任务。正在进入智能尽调流程。')
    await delay(500)
    await runBusinessVerification()
  }

  // ===================== 工商校验 =====================
  async function runBusinessVerification() {
    const steps = [
      { title: '工商数据校验', status: 'done', details: [
        { label: '主体状态', value: '正常存续' },
        { label: '司法风险', value: '无重大诉讼' },
        { label: '关联企业', value: '3 家' },
      ]},
    ]

    const businessArtifactData = {
      enterprise: selectedEnterprise.value,
      entityStatus: '正常存续',
      judicialRisk: '无重大诉讼',
      relatedCompanies: '3 家',
      conclusion: '工商校验通过',
      legalPerson: '—',
      registeredCapital: '—',
      establishedDate: '—',
      judicialDetails: [],
      relatedCompaniesList: [],
      dueFlow: {
        statusText: '等待税票RPA',
        progress: 42,
        activeKey: 'tax',
        steps: [...dueFlowSteps],
      },
      steps,
    }

    upsertStage({ id: 'business', label: '工商校验', icon: '🏛', status: 'done', artifactData: { ...businessArtifactData } })
    setActiveStage('business')

    await pushStreamingMessage('工商校验已完成，下一步进入税票采集。')
    await delay(500)
    await runTaxCollectionStep()
  }

  // ===================== 税票采集 =====================
  async function runTaxCollectionStep() {
    const steps = [
      { title: '生成税票采集授权链接', status: 'done', details: [
        { label: '进项发票', value: '待采集' },
        { label: '销项发票', value: '待采集' },
        { label: '纳税申报', value: '待采集' },
      ]},
    ]

    const taxArtifactData = {
      enterprise: selectedEnterprise.value,
      chain: '生成授权链接 → 企业扫码授权 → RPA采集 → 数据入库',
      status: '待确认发送',
      authStatus: '待确认发送',
      linkStatus: '未发送',
      authUrl: 'https://ai-copilot.demo/auth/rpa002',
      collectedCount: 0,
      totalCount: 12,
      progressPercent: 0,
      collectionItems: [...collectionItemsPending],
      input: { count: 0, total: 0, unit: '份' },
      output: { count: 0, total: 0, unit: '份' },
      filing: { status: '未采集' },
      dueFlow: {
        statusText: '等待税票RPA',
        progress: 42,
        activeKey: 'tax',
        steps: [...dueFlowSteps],
      },
      autoLog: [
        { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
        { time: '—', desc: '等待用户确认发送', status: 'waiting' },
      ],
      steps,
    }

    upsertStage({ id: 'tax', label: '税票采集', icon: '🎫', status: 'active', artifactData: { ...taxArtifactData } })
    setActiveStage('tax')

    await pushStreamingMessage('已生成采集链接并发送，等待企业授权。点击下方按钮模拟企业已授权，继续采集。')
    currentFlowStatus.value = 'waiting_tax_confirmation'
    waitingForInput.value = true
  }

  async function confirmTaxSend() {
    const stage = flowStages.find(s => s.id === 'tax')
    if (!stage) return

    waitingForInput.value = false
    await pushMessage('user', '确认发送采集链接')
    await delay(300)

    stage.artifactData.linkStatus = '已发送'
    stage.artifactData.authStatus = '等待授权'
    stage.artifactData.status = '等待授权'
    stage.artifactData.autoLog = [
      { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
      { time: '10:35', desc: '授权链接已发送', status: 'done' },
      { time: '—', desc: '等待企业扫码授权', status: 'waiting' },
    ]
    stage.artifactData.dueFlow = {
      statusText: '等待企业授权',
      progress: 42,
      activeKey: 'tax',
      steps: JSON.parse(JSON.stringify(dueFlowSteps)),
    }
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, JSON.parse(JSON.stringify(stage.artifactData)))
    Object.keys(artifactData).forEach(k => delete artifactData[k])
    Object.assign(artifactData, JSON.parse(JSON.stringify(stage.artifactData)))

    await pushStreamingMessage('采集链接已发送。等待企业线下扫码授权完成后，点击"模拟企业已授权"继续。')
    currentFlowStatus.value = 'waiting_tax_auth'
    waitingForInput.value = true
  }

  async function mockTaxAuthorized() {
    const stage = flowStages.find(s => s.id === 'tax')
    if (!stage) return

    waitingForInput.value = false
    await pushMessage('user', '企业已授权，继续采集')
    await delay(300)

    await pushStep('tax', '企业已授权，开始采集', 'done')
    await delay(500)
    await pushStep('tax', '进项发票采集完成', 'done', [{ label: '进项发票', value: '已采集 128 份' }])
    await delay(400)
    await pushStep('tax', '销项发票采集完成', 'done', [{ label: '销项发票', value: '已采集 96 份' }])
    await delay(400)
    await pushStep('tax', '纳税申报数据采集完成', 'done')

    stage.artifactData.status = '已完成'
    stage.artifactData.authStatus = '已授权'
    stage.artifactData.linkStatus = '已使用'
    stage.artifactData.collectedCount = 8
    stage.artifactData.progressPercent = 67
    stage.artifactData.input = { count: 128, total: 150, unit: '份' }
    stage.artifactData.output = { count: 96, total: 120, unit: '份' }
    stage.artifactData.filing = { status: '已采集' }
    stage.artifactData.collectionItems = [...collectionItemsDone]
    stage.artifactData.autoLog = [
      { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
      { time: '10:35', desc: '企业完成扫码授权', status: 'done' },
      { time: '10:36', desc: 'RPA 登录税局系统', status: 'done' },
      { time: '10:42', desc: '进项发票采集 128 份', status: 'done' },
      { time: '10:48', desc: '销项发票采集 96 份', status: 'done' },
      { time: '10:50', desc: '纳税申报数据已采集', status: 'done' },
      { time: '10:51', desc: '数据入库完成', status: 'done' },
    ]
    stage.artifactData.dueFlow = {
      statusText: '税票采集完成',
      progress: 60,
      activeKey: 'materials',
      steps: JSON.parse(JSON.stringify(dueFlowStepsCompleted)),
    }
    // 完整替换 leftPanelData 确保响应式更新
    Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
    Object.assign(leftPanelData, JSON.parse(JSON.stringify(stage.artifactData)))
    Object.keys(artifactData).forEach(k => delete artifactData[k])
    Object.assign(artifactData, JSON.parse(JSON.stringify(stage.artifactData)))
    updateStageStatus('tax', 'done')

    await pushStreamingMessage('税票数据采集完成，开始资料收集。')
    await delay(500)
    await runMaterialCollectionStep()
  }

  // ===================== 资料收集 =====================
  async function runMaterialCollectionStep() {
    const materials = [
      { name: '财务报表', status: '已收集', type: '财务' },
      { name: '银行流水', status: '已收集', type: '财务' },
      { name: '纳税证明', status: '已收集', type: '税务' },
      { name: '营业执照', status: '已收集', type: '工商' },
      { name: '征信报告', status: '缺失', type: '信用' },
      { name: '审计报告', status: '待上传', type: '财务' },
    ]
    const completeness = Math.round(materials.filter(m => m.status === '已收集').length / materials.length * 100)

    const steps = [
      { title: '生成资料包清单', status: 'done', details: [
        { label: '模板', value: selectedDueTemplate.value?.name || '标准授信尽调' },
        { label: '资料完整度', value: completeness + '%' },
      ]},
    ]

    const materialsArtifactData = {
      template: selectedDueTemplate.value?.name || '标准授信尽调',
      completeness,
      materials,
      missing: materials.filter(m => m.status !== '已收集'),
      steps,
    }

    upsertStage({ id: 'materials', label: '资料收集', icon: '📁', status: 'done', artifactData: { ...materialsArtifactData } })
    setActiveStage('materials')

    await pushStreamingMessage(`已根据尽调模板生成资料包。当前资料完整度 ${completeness}%，可进入风险诊断。`)
    await delay(500)
    await runRiskDiagnosisStep()
  }

  // ===================== 风险诊断 =====================
  async function runRiskDiagnosisStep() {
    const isTsWq = selectedEnterprise.value?.id === 'ts-wq-sm'
    const steps = [
      { title: '工商风险分析', status: 'done', details: [{ label: '风险等级', value: isTsWq ? '高' : '低' }] },
      { title: '税务风险分析', status: 'done', details: [{ label: '风险等级', value: '中' }] },
      { title: '经营风险分析', status: 'done', details: [{ label: '风险等级', value: isTsWq ? '高' : '低' }] },
      { title: '资料一致性检查', status: 'done', details: [{ label: '一致性', value: isTsWq ? '偏差' : '良好' }] },
    ]

    const riskArtifactData = {
      ...mockRiskDiagnosis,
      score: isTsWq ? 58 : mockRiskDiagnosis.score,
      grade: isTsWq ? 'C' : mockRiskDiagnosis.grade,
      riskLevel: isTsWq ? '高' : mockRiskDiagnosis.riskLevel,
      conclusion: isTsWq ? '综合评分58，企业存在多项风险事项，建议审慎评估后再行授信' : mockRiskDiagnosis.conclusion,
      riskIssues: isTsWq ? tangshanRiskIssues : [],
      suggestedActions: isTsWq ? ['进一步核实收入真实性', '补充银行流水核验', '约谈实际控制人'] : [],
      steps,
    }

    upsertStage({ id: 'riskDiagnosis', label: '风险诊断', icon: '🧠', status: 'done', artifactData: { ...riskArtifactData } })
    setActiveStage('riskDiagnosis')

    await pushStreamingMessage('风险诊断已完成。已生成诊断报告草稿，下一步可以生成最终报告。')
    await delay(500)
    await generateDeliverables()
  }

  // ===================== 产物生成 =====================
  async function generateDeliverables() {
    const steps = [
      { title: '生成产物清单', status: 'done', details: [
        { label: '尽调资料包', value: '18份' },
        { label: '风险诊断报告', value: '1份' },
        { label: '智能报告草稿', value: '1份' },
        { label: '附件与证据链', value: '24份' },
      ]},
    ]

    const deliverablesArtifactData = {
      items: [...mockDeliverables],
      reportTemplate: '标准授信尽调',
      materialPackage: { count: 18 },
      actions: ['查看', '编辑报告'],
      steps,
    }

    upsertStage({ id: 'deliverables', label: '产物生成', icon: '📦', status: 'done', artifactData: { ...deliverablesArtifactData } })
    setActiveStage('deliverables')

    await pushStreamingMessage('产物已生成。你可以开始资料包确认和报告修改。')
    currentFlowStatus.value = 'waiting_report_action'
    waitingForInput.value = true
  }

  // ===================== 报告编辑器（工作区态） =====================
  async function openReportEditor() {
    waitingForInput.value = false
    await pushMessage('user', '修改报告')
    await delay(300)

    const sections = [
      { id: 's1', no: '一', title: '企业概况', status: '已完成' },
      { id: 's2', no: '二', title: '工商核验', status: '已完成' },
      { id: 's3', no: '三', title: '税票分析', status: '已完成' },
      { id: 's4', no: '四', title: '财务分析', status: '待确认' },
      { id: 's5', no: '五', title: '风险诊断', status: '待确认' },
      { id: 's6', no: '六', title: '授信建议', status: '待编辑' },
    ]

    const reportArtifactData = {
      title: selectedEnterprise.value?.name ? `${selectedEnterprise.value.name} 尽职调查报告` : '尽职调查报告',
      template: selectedDueTemplate.value?.name || '标准授信尽调',
      sections,
      currentSection: 's1',
      body: '',
      pendingItems: ['财务分析确认', '授信建议撰写'],
      steps: [],
    }

    upsertStage({ id: 'reportEditor', label: '报告编辑', icon: '📝', status: 'active', artifactData: { ...reportArtifactData } })
    setActiveStage('reportEditor')

    await pushStreamingMessage('已进入报告编辑模式。我可以帮你改写风险结论、补充税票异常说明或生成授信建议。')
    currentFlowStatus.value = 'editing_report'
    waitingForInput.value = true
  }

  // ===================== Context Suggestions =====================
  const contextSuggestions = computed(() => {
    const suggestions = []
    const status = currentFlowStatus.value

    if (status === 'waiting_selection' && candidateCustomers.length > 0) {
      candidateCustomers.slice(0, 3).forEach(c => {
        suggestions.push({ label: `探查 ${c.name}`, type: 'explore', enterprise: c })
      })
    }

    if (status === 'waiting_action') {
      suggestions.push({ label: '加入监控', type: 'start_monitor' })
      suggestions.push({ label: '新建尽调', type: 'start_due_diligence' })
    }

    if (status === 'waiting_next_action') {
      suggestions.push({ label: '查看监控任务', type: 'send_text', text: '查看监控任务' })
      suggestions.push({ label: '新建尽调', type: 'start_due_diligence' })
      suggestions.push({ label: '继续探查其他企业', type: 'send_text', text: '继续探查其他企业' })
    }

    if (status === 'waiting_template') {
      dueDiligenceTemplates.filter(t => t.id !== 'tpl-custom').forEach(t => {
        suggestions.push({ label: t.name, type: 'confirm_due_template', template: t })
      })
    }

    if (status === 'waiting_tax_confirmation') {
      suggestions.push({ label: '确认发送采集链接', type: 'confirm_tax_send' })
    }

    if (status === 'waiting_tax_auth') {
      suggestions.push({ label: '模拟企业已授权', type: 'tax_authorized' })
    }

    if (status === 'waiting_report_action') {
      suggestions.push({ label: '修改报告', type: 'open_report_editor' })
      suggestions.push({ label: '导出报告', type: 'send_text', text: '导出报告' })
      suggestions.push({ label: '加入监控', type: 'start_monitor' })
    }

    if (status === 'editing_report') {
      suggestions.push({ label: '改写风险结论', type: 'send_text', text: '帮我改写风险结论' })
      suggestions.push({ label: '补充税票异常说明', type: 'send_text', text: '补充税票异常说明' })
      suggestions.push({ label: '生成授信建议', type: 'send_text', text: '生成授信建议' })
      suggestions.push({ label: '导出最终报告', type: 'send_text', text: '导出最终报告' })
    }

    return suggestions
  })

  // ===================== 主入口 =====================
  async function sendMessage(text) {
    if (!text || !text.trim()) return
    const input = text.trim()
    const lower = input.toLowerCase()

    // 1. 等待选择企业
    if (currentFlowStatus.value === 'waiting_selection') {
      const num = parseInt(input)
      if (!isNaN(num) && num > 0 && num <= candidateCustomers.length) {
        await pushMessage('user', input)
        await selectEnterpriseAndExplore(candidateCustomers[num - 1])
        return
      }
      const matched = candidateCustomers.find(c => c.name.includes(input) || input.includes(c.name.replace(/股份|有限|公司/g, '').slice(0, 4)))
      if (matched) {
        await pushMessage('user', input)
        await selectEnterpriseAndExplore(matched)
        return
      }
      await pushMessage('user', input)
      await pushMessage('ai', '没有在当前候选名单中找到该企业，请从左侧列表选择或回复序号。')
      return
    }

    // 2. 等待动作选择（探查后）
    if (currentFlowStatus.value === 'waiting_action') {
      await pushMessage('user', input)
      if (lower.includes('监控') || lower.includes('加入')) {
        await startMonitor(selectedEnterprise.value)
        return
      }
      if (lower.includes('尽调') || lower.includes('新建')) {
        await startDueDiligence(selectedEnterprise.value)
        return
      }
      await pushMessage('ai', '请选择「加入监控」或「新建尽调」。')
      return
    }

    // 3. 等待尽调模板
    if (currentFlowStatus.value === 'waiting_template') {
      await pushMessage('user', input)
      const tpl = dueDiligenceTemplates.find(t => t.name.includes(input) || input.includes(t.name))
      if (tpl) { await confirmDueTemplate(tpl); return }
      await pushMessage('ai', '请从左侧选择一个尽调模板。')
      return
    }

    // 4. 税票确认
    if (currentFlowStatus.value === 'waiting_tax_confirmation') {
      await pushMessage('user', input)
      if (lower.includes('确认') || lower.includes('发送') || lower.includes('可以')) { await confirmTaxSend(); return }
      await pushMessage('ai', '请确认是否发送采集链接。')
      return
    }

    // 5. 税票授权
    if (currentFlowStatus.value === 'waiting_tax_auth') {
      await pushMessage('user', input)
      if (lower.includes('授权') || lower.includes('继续')) { await mockTaxAuthorized(); return }
      await pushMessage('ai', '企业完成授权后告诉我即可继续。')
      return
    }

    // 6. 产物后动作
    if (currentFlowStatus.value === 'waiting_report_action') {
      await pushMessage('user', input)
      if (lower.includes('修改') || lower.includes('报告') || lower.includes('编辑')) { await openReportEditor(); return }
      if (lower.includes('导出')) { await pushMessage('ai', '报告已导出为 PDF 文件。'); return }
      if (lower.includes('监控')) { await startMonitor(selectedEnterprise.value); return }
      await pushMessage('ai', '你可以选择修改报告、导出报告或加入监控。')
      return
    }

    // 7. 编辑报告态
    if (currentFlowStatus.value === 'editing_report') {
      await pushMessage('user', input)
      if (lower.includes('导出')) { await pushMessage('ai', '报告已导出。'); return }
      await pushStreamingMessage('已根据你的要求更新报告内容。如需进一步调整，请继续输入。')
      return
    }

    // 8. 默认：启动新流程
    await startFromWorkbenchInput(input)
  }

  async function startFromWorkbenchInput(text) {
    dialogOpen.value = true
    reset()
    dialogOpen.value = true
    const lower = text.toLowerCase()
    const intent = detectIntent(lower)
    if (intent === 'screening') {
      await runScreening(text)
    }
  }

  async function runIntentRecognition(text) {
    await sendMessage(text)
    if (layoutMode.value === 'chat-center' && currentFlowStatus.value === 'waiting_selection') {
      layoutMode.value = 'workspace'
      activeTool.value = 'screening'
      if (!leftPanelData.enterprises?.length) {
        Object.assign(leftPanelData, {
          enterprises: [...candidateCustomers],
          summary: {
            matched: '128 家',
            filtered: '98 家',
            recommended: `${candidateCustomers.length} 家`,
            avgMatch: '90%',
          },
        })
      }
    }
  }

  function handleSuggestionClick(suggestion) {
    switch (suggestion.type) {
      case 'explore':
        selectEnterpriseAndExplore(suggestion.enterprise)
        break
      case 'start_monitor':
        startMonitor(selectedEnterprise.value)
        break
      case 'start_due_diligence':
        startDueDiligence(selectedEnterprise.value)
        break
      case 'confirm_due_template':
        confirmDueTemplate(suggestion.template)
        break
      case 'confirm_tax_send':
        confirmTaxSend()
        break
      case 'tax_authorized':
        mockTaxAuthorized()
        break
      case 'open_report_editor':
        openReportEditor()
        break
      case 'send_text':
        sendMessage(suggestion.text)
        break
      default:
        sendMessage(suggestion.label)
    }
  }

  // 兼容旧版导出
  return {
    dialogOpen, dialogInput, messages, flowStages, activeStageId,
    artifactData, currentArtifactType, waitingForInput,
    selectedCustomer, candidateCustomers, lastScreeningResults, lastDueTask,
    pendingConfirmation, pausedReason, currentIntent, conversationContext,
    currentFlowStatus, currentStageId, flowStartedAt, flowCompletedAt,
    isThinking, thinkingText,
    processSteps, sidebarMode, contextSuggestions,
    sendMessage, reset, setActiveStage, setLeftPanel,
    // 三态布局
    layoutMode, activeTool, selectedEnterprise, selectedDueTemplate, leftPanelData,
    startFromWorkbenchInput, runIntentRecognition,
    showScreeningResults: () => { layoutMode.value = 'workspace'; activeTool.value = 'screening' },
    selectEnterprise: (e) => { selectedEnterprise.value = e },
    runEnterpriseExploration,
    startMonitor, startDueDiligence, confirmDueTemplate,
    confirmTaxAndContinue: confirmTaxSend,
    confirmReportAndContinue: () => {},
    markTaxAuthorizedAndContinue: mockTaxAuthorized,
    selectCustomerAndStartDueDiligence: (cid) => {
      const c = candidateCustomers.find(x => x.id === cid) || candidateCustomers[0]
      if (c) selectEnterpriseAndExplore(c)
    },
    execAutoDueDiligence: () => runBusinessVerification(),
    runTaxCollectionStep, runMaterialCollectionStep, runRiskDiagnosisStep,
    generateDeliverables, openReportEditor,
    handleSuggestionClick,
    // Mock data
    mockEnterprises: shenzhenSoftwareEnterprises,
    dueDiligenceTemplates,
    mockRiskDiagnosis,
    mockDeliverables,
    // 新增：统一 artifact 更新入口
    updateWorkbenchArtifact,
  }
})