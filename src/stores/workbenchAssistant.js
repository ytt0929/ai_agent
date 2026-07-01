/**
 * 工作台 AI 助手 v3 — 三态工作流：对话启动态 / 工作区态 / 沉浸编辑态
 * 支持：智能筛客 → 企业探查 → 加入监控/新建尽调(并列) → 尽调流程 → 报告编辑
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useScreeningStore } from './screening.js'
import { useDueDiligenceStore } from './dueDiligence.js'
import { useMonitorStore } from './enterpriseMonitor.js'

// ====== 阶段定义 ======
const FLOW_STAGES = [
  { id: 'screen', label: '智能筛客', icon: '🔍' },
  { id: 'explore', label: '企业探查', icon: '🏢' },
  { id: 'monitor', label: '加入监控', icon: '📡' },
  { id: 'dueDiligence', label: '新建尽调', icon: '📋' },
  { id: 'business', label: '工商校验', icon: '🏛' },
  { id: 'tax', label: '税票采集', icon: '🎫' },
  { id: 'materials', label: '资料收集', icon: '📁' },
  { id: 'riskDiagnosis', label: '风险诊断', icon: '🧠' },
  { id: 'deliverables', label: '产物生成', icon: '📦' },
  { id: 'reportEditor', label: '报告编辑', icon: '📝' },
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

  // === 布局状态 ===
  const layoutMode = ref('chat-center')  // 'chat-center' | 'workspace'
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

  // === Mock: 深圳软件企业 ===
  const shenzhenSoftwareEnterprises = [
    { id: 'sz001', name: '深圳市科创软件有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '无诉讼'], revenue: '320万', match: 96, reason: '纳税A级，无诉讼记录，经营稳定' },
    { id: 'sz002', name: '深圳市云端科技有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '营收增长'], revenue: '580万', match: 93, reason: '纳税A级，连续3年营收增长' },
    { id: 'sz003', name: '深圳市数智软件有限公司', region: '广东省·深圳市', industry: '软件业', risk: '中', progress: '待确认', tags: ['1笔小额诉讼', '税务评级B'], revenue: '150万', match: 78, reason: '存在1笔小额诉讼，税务评级B' },
    { id: 'sz004', name: '深圳市恒远软件有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '无行政处罚'], revenue: '210万', match: 91, reason: '纳税A级，无行政处罚' },
    { id: 'sz005', name: '深圳市锐创信息技术有限公司', region: '广东省·深圳市', industry: '软件业', risk: '低', progress: '可转尽调', tags: ['纳税A级', '知识产权5项'], revenue: '450万', match: 94, reason: '纳税A级，拥有5项知识产权' },
  ]

  // Mock: 通用企业
  const mockEnterprises = [
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
    commercialRisk: '低风险',
    taxRisk: '中风险',
    operationRisk: '低风险',
    dataConsistencyRisk: '低风险',
    evidenceSummary: '工商正常存续，税务评级A，近一年营收稳定',
    conclusion: '综合评分72，建议有条件授信',
  }

  const mockDeliverables = [
    { name: '尽调资料包', status: '已生成', count: '18份' },
    { name: '风险诊断报告', status: '已生成', count: '1份' },
    { name: '智能报告草稿', status: '待确认', count: '1份' },
    { name: '附件与证据链', status: '已归档', count: '24份' },
  ]

  // 兼容旧版
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

  // ===================== 工具函数 =====================
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

  function setActiveStage(id) {
    activeStageId.value = id
    Object.keys(artifactData).forEach(k => delete artifactData[k])

    const stage = flowStages.find(s => s.id === id)
    if (!stage) return

    currentArtifactType.value = id
    Object.assign(artifactData, stage.artifactData || {})

    layoutMode.value = 'workspace'

    // Sync activeTool based on stage id — needed for left panel component switching
    const stageToolMap = {
      screen: 'screening',
      explore: 'exploration',
      monitor: 'monitor',
      dueDiligence: 'dueDiligence',
      business: 'business',
      tax: 'tax',
      materials: 'materials',
      riskDiagnosis: 'riskDiagnosis',
      deliverables: 'deliverables',
      reportEditor: 'reportEditor',
    }
    const mappedTool = stageToolMap[id]
    if (mappedTool) {
      activeTool.value = mappedTool
      // Sync leftPanelData from stage artifactData (source of truth)
      Object.keys(leftPanelData).forEach(k => delete leftPanelData[k])
      Object.assign(leftPanelData, stage.artifactData || {})
    }
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
  function detectIntent(text) {
    const lower = text.toLowerCase()
    if (lower.includes('筛') || lower.includes('筛选') || lower.includes('找') || lower.includes('名单')) {
      return 'screening'
    }
    return 'screening' // 默认走筛客
  }

  // ===================== 智能筛客 =====================
  async function runScreening(inputText) {
    const screeningStore = useScreeningStore()
    const lower = inputText.toLowerCase()

    // 解析条件
    const filters = []
    if (lower.includes('深圳')) filters.push('深圳市')
    if (lower.includes('软件')) filters.push('软件业')
    if (lower.includes('风险')) filters.push('关注风险')
    if (lower.includes('进度')) filters.push('关注尽调进度')
    if (filters.length === 0) {
      filters.push('深圳市', '软件业', '低风险')
    }

    // 进入居中对话态 - 意图识别
    layoutMode.value = 'chat-center'
    activeTool.value = 'intent'

    await pushStreamingMessage(`已收到需求，正在识别你的操作意图。`)
    await delay(800)
    await pushStreamingMessage(`识别到：智能筛客工具。筛选条件：${filters.join(' / ')}。正在生成候选客户列表...`)
    await delay(600)

    // 根据条件选择mock数据
    let enterprises
    if (lower.includes('深圳') && lower.includes('软件')) {
      enterprises = [...shenzhenSoftwareEnterprises]
    } else {
      enterprises = [...mockEnterprises]
    }

    // 添加筛客阶段
    const stage = { id: 'screen', label: '智能筛客', icon: '🔍', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('screen')

    await pushStep('screen', '解析筛选条件', 'done', filters.map(f => ({ label: '条件', value: f })))
    await delay(400)
    await pushStep('screen', '执行筛选', 'done', [
      { label: '匹配企业', value: '128 家' },
      { label: '高风险过滤', value: '98 家' },
      { label: '适合转尽调', value: `${enterprises.length} 家` },
    ])
    await delay(400)
    await pushStep('screen', `生成结果：推荐 ${enterprises.length} 家候选企业`, 'done', [
      { label: '最终匹配', value: `${enterprises.length} 家` },
      { label: '平均匹配度', value: '90%' },
    ])

    updateStageStatus('screen', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      filters,
      enterprises,
      summary: { matched: '128 家', filtered: '98 家', recommended: `${enterprises.length} 家`, avgMatch: '90%' },
    }

    // 更新状态
    candidateCustomers.length = 0
    candidateCustomers.push(...enterprises)
    lastScreeningResults.length = 0
    lastScreeningResults.push(...enterprises)
    currentArtifactType.value = 'screen'
    Object.assign(artifactData, stage.artifactData)

    // 切换到工作区态
    layoutMode.value = 'workspace'
    activeTool.value = 'screening'
    Object.assign(leftPanelData, {
      enterprises: [...enterprises],
      filters,
      summary: { matched: '128 家', filtered: '98 家', recommended: `${enterprises.length} 家` },
    })

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

    // 进入企业探查
    await runEnterpriseExploration(enterprise)
  }

  async function runEnterpriseExploration(enterprise) {
    selectedEnterprise.value = enterprise
    layoutMode.value = 'workspace'
    activeTool.value = 'exploration'

    const stage = { id: 'explore', label: '企业探查', icon: '🏢', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('explore')

    await withThinking('正在探查企业信息', async () => {
      await delay(600)
      await pushStep('explore', '工商数据查询', 'done', [
        { label: '主体状态', value: '正常存续' },
        { label: '司法风险', value: '无重大诉讼' },
        { label: '关联企业', value: '3 家' },
      ])
      await delay(400)
      await pushStep('explore', '经营数据分析', 'done', [
        { label: '近12月营收', value: '稳定' },
        { label: '社保人数', value: '正常' },
        { label: '行政处罚', value: '无' },
      ])
      await delay(400)
      await pushStep('explore', '税务风险评估', 'done', [
        { label: '纳税信用', value: 'A级' },
        { label: '欠税记录', value: '无' },
      ])
    })

    updateStageStatus('explore', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      enterprise,
      basicInfo: { creditCode: '91440300MA5FXXXX1X', legalPerson: '张三', registeredCapital: '500万', establishedDate: '2018-03-15' },
      conclusion: '企业经营正常，税务评级A级，无重大司法风险',
      risks: [
        { category: '工商风险', level: '低', detail: '主体正常存续，无异常经营记录' },
        { category: '经营风险', level: '低', detail: '近12个月社保人数稳定，无行政处罚' },
        { category: '税务风险', level: '低', detail: '税务评级A级，无欠税记录' },
      ],
      evidenceSummary: '工商登记 + 司法公开 + 税务评级 + 社保记录',
    }
    currentArtifactType.value = 'explore'
    Object.assign(artifactData, stage.artifactData)

    Object.assign(leftPanelData, {
      enterprise,
      basicInfo: { creditCode: '91440300MA5FXXXX1X', legalPerson: '张三', registeredCapital: '500万', establishedDate: '2018-03-15' },
      conclusion: '企业经营正常，税务评级A级，无重大司法风险',
      risks: [
        { category: '工商风险', level: '低', detail: '主体正常存续，无异常经营记录' },
        { category: '经营风险', level: '低', detail: '近12个月社保人数稳定，无行政处罚' },
        { category: '税务风险', level: '低', detail: '税务评级A级，无欠税记录' },
      ],
      evidenceSummary: '工商登记 + 司法公开 + 税务评级 + 社保记录',
    })

    // 推送并列动作提示
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

    activeTool.value = 'monitor'
    layoutMode.value = 'workspace'

    const stage = { id: 'monitor', label: '加入监控', icon: '📡', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('monitor')

    await withThinking('正在创建监控任务', async () => {
      await delay(500)
      await pushStep('monitor', '配置监控规则', 'done', [
        { label: '工商变更', value: '已启用' },
        { label: '税务评级异常', value: '已启用' },
        { label: '重大风险预警', value: '已启用' },
      ])
      await delay(400)
      await pushStep('monitor', '创建监控任务', 'done', [
        { label: '监控频率', value: '每日' },
        { label: '监控维度', value: '工商 / 税票 / 司法' },
      ])
    })

    updateStageStatus('monitor', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      enterprise: ent,
      rules: ['工商变更监控', '税务评级异常', '重大风险预警'],
      frequency: '每日',
      dimensions: ['工商', '税票', '司法'],
      created: true,
    }
    currentArtifactType.value = 'monitor'
    Object.assign(artifactData, stage.artifactData)

    Object.assign(leftPanelData, {
      enterprise: ent,
      rules: ['工商变更监控', '税务评级异常', '重大风险预警'],
      frequency: '每日',
      dimensions: ['工商', '税票', '司法'],
      created: true,
    })

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

    activeTool.value = 'dueDiligence'
    layoutMode.value = 'workspace'

    upsertStage({ id: 'dueDiligence', label: '新建尽调', icon: '📋', status: 'active', artifactData: {} })
    setActiveStage('dueDiligence')

    Object.assign(leftPanelData, {
      enterprise: ent,
      templates: dueDiligenceTemplates,
      selectedTemplateId: null,
      selectedTemplate: null,
      step: 'template-selection',
    })

    await pushStreamingMessage('请先选择尽调模板。')
    currentFlowStatus.value = 'waiting_template'
    waitingForInput.value = true
  }

  // ===================== 确认尽调模板 → 进入尽调流程 =====================
  async function confirmDueTemplate(template) {
    selectedDueTemplate.value = template

    // Update existing dueDiligence stage (do NOT create duplicate)
    const ddStage = flowStages.find(s => s.id === 'dueDiligence')
    if (ddStage) {
      ddStage.status = 'done'
      ddStage.artifactData = {
        ...ddStage.artifactData,
        enterprise: selectedEnterprise.value,
        template,
        status: '已创建',
      }
    }

    leftPanelData.selectedTemplateId = template.id
    leftPanelData.selectedTemplate = template
    leftPanelData.step = 'task-created'

    await pushMessage('user', `选择模板「${template.name}」`)
    await delay(300)

    setActiveStage('dueDiligence')

    await pushStep('dueDiligence', '创建尽调任务', 'done', [
      { label: '企业名称', value: selectedEnterprise.value?.name || '—' },
      { label: '尽调模板', value: template.name },
      { label: '预计耗时', value: template.estimatedDays + '天' },
    ])

    currentArtifactType.value = 'dueDiligence'
    Object.assign(artifactData, ddStage ? ddStage.artifactData : {})

    await pushStreamingMessage('已创建尽调任务。正在进入智能尽调流程。')
    await delay(500)

    // 自动推进到工商校验
    await runBusinessVerification()
  }

  // ===================== 工商校验 =====================
  async function runBusinessVerification() {
    layoutMode.value = 'workspace'
    activeTool.value = 'business'

    const stage = { id: 'business', label: '工商校验', icon: '🏛', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('business')

    await withThinking('正在校验工商信息', async () => {
      await delay(600)
      await pushStep('business', '工商数据校验', 'done', [
        { label: '主体状态', value: '正常存续' },
        { label: '司法风险', value: '无重大诉讼' },
        { label: '关联企业', value: '3 家' },
      ])
    })

    updateStageStatus('business', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      conclusion: '工商校验通过',
      entityStatus: '正常存续',
      judicialRisk: '无重大诉讼',
      relatedCompanies: '3 家',
    }
    currentArtifactType.value = 'business'
    Object.assign(artifactData, stage.artifactData)

    Object.assign(leftPanelData, {
      ddStatus: '工商校验已完成',
      currentStage: '工商校验',
      stageStatus: '已通过',
      stages: [
        { id: 'business', name: '工商校验', status: 'done' },
        { id: 'tax', name: '税票采集', status: 'active' },
        { id: 'materials', name: '资料收集', status: 'pending' },
        { id: 'riskDiagnosis', name: '风险诊断', status: 'pending' },
        { id: 'report', name: '报告生成', status: 'pending' },
      ],
    })

    await pushStreamingMessage('工商校验已完成，下一步进入税票采集。')
    await delay(500)

    // 自动推进到税票采集
    await runTaxCollectionStep()
  }

  // ===================== 税票采集 =====================
  async function runTaxCollectionStep() {
    layoutMode.value = 'workspace'
    activeTool.value = 'tax'

    const stage = { id: 'tax', label: '税票采集', icon: '🎫', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('tax')
    Object.assign(leftPanelData, {
      customer: selectedEnterprise.value,
      chain: '生成授权链接 → 企业扫码授权 → RPA采集 → 数据入库',
      linkStatus: '未发送',
      authStatus: '待确认发送',
      status: '等待确认',
    })

    await pushStep('tax', '生成税票采集授权链接', 'done', [
      { label: '进项发票', value: '待采集' },
      { label: '销项发票', value: '待采集' },
      { label: '纳税申报', value: '待采集' },
    ])

    updateStageStatus('tax', 'active')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer: selectedEnterprise.value,
      chain: '生成授权链接 → 企业扫码授权 → RPA采集 → 数据入库',
      status: '待确认发送',
      authStatus: '待确认发送',
      linkStatus: '未发送',
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
    stage.artifactData.status = '等待企业授权'
    stage.artifactData.autoLog = [
      { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
      { time: '10:35', desc: '授权链接已发送', status: 'done' },
      { time: '—', desc: '等待企业扫码授权', status: 'waiting' },
    ]
    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, stage.artifactData)

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

    await withThinking('正在采集税票数据', async () => {
      await pushStep('tax', '企业已授权，开始采集', 'done')
      await delay(500)
      await pushStep('tax', '进项发票采集完成', 'done', [{ label: '进项发票', value: '已采集 128 份' }])
      await delay(400)
      await pushStep('tax', '销项发票采集完成', 'done', [{ label: '销项发票', value: '已采集 96 份' }])
      await delay(400)
      await pushStep('tax', '纳税申报数据采集完成', 'done')
    })

    updateStageStatus('tax', 'done')
    stage.artifactData.status = '已完成'
    stage.artifactData.authStatus = '已授权'
    stage.artifactData.linkStatus = '已使用'
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
    Object.assign(leftPanelData, stage.artifactData)

    await pushStreamingMessage('税票数据采集完成，开始资料收集。')
    await delay(500)
    await runMaterialCollectionStep()
  }

  // ===================== 资料收集 =====================
  async function runMaterialCollectionStep() {
    layoutMode.value = 'workspace'
    activeTool.value = 'materials'

    const stage = { id: 'materials', label: '资料收集', icon: '📁', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('materials')
    const materials = [
      { name: '财务报表', status: '已收集' },
      { name: '银行流水', status: '已收集' },
      { name: '纳税证明', status: '已收集' },
      { name: '营业执照', status: '已收集' },
      { name: '征信报告', status: '缺失' },
      { name: '审计报告', status: '待上传' },
    ]
    const completeness = Math.round(materials.filter(m => m.status === '已收集').length / materials.length * 100)

    await pushStep('materials', '生成资料包清单', 'done', [
      { label: '模板', value: selectedDueTemplate.value?.name || '标准授信尽调' },
      { label: '资料完整度', value: completeness + '%' },
    ])

    updateStageStatus('materials', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      template: selectedDueTemplate.value?.name || '标准授信尽调',
      completeness,
      required: materials,
    }
    currentArtifactType.value = 'materials'
    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, { template: stage.artifactData.template, completeness, required: materials })

    await pushStreamingMessage(`已根据尽调模板生成资料包。当前资料完整度 ${completeness}%，可进入风险诊断。`)
    await delay(500)
    await runRiskDiagnosisStep()
  }

  // ===================== 风险诊断 =====================
  async function runRiskDiagnosisStep() {
    layoutMode.value = 'workspace'
    activeTool.value = 'riskDiagnosis'

    const stage = { id: 'riskDiagnosis', label: '风险诊断', icon: '🧠', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('riskDiagnosis')

    await withThinking('正在进行风险诊断', async () => {
      await delay(600)
      await pushStep('riskDiagnosis', '工商风险分析', 'done', [{ label: '风险等级', value: '低' }])
      await delay(400)
      await pushStep('riskDiagnosis', '税务风险分析', 'done', [{ label: '风险等级', value: '中' }])
      await delay(400)
      await pushStep('riskDiagnosis', '经营风险分析', 'done', [{ label: '风险等级', value: '低' }])
      await delay(400)
      await pushStep('riskDiagnosis', '资料一致性检查', 'done', [{ label: '一致性', value: '良好' }])
    })

    updateStageStatus('riskDiagnosis', 'done')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      ...mockRiskDiagnosis,
    }
    currentArtifactType.value = 'riskDiagnosis'
    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, { ...mockRiskDiagnosis })

    await pushStreamingMessage('风险诊断已完成。已生成诊断报告草稿，下一步可以生成最终报告。')
    await delay(500)
    await generateDeliverables()
  }

  // ===================== 产物生成 =====================
  async function generateDeliverables() {
    layoutMode.value = 'workspace'
    activeTool.value = 'deliverables'

    const stage = { id: 'deliverables', label: '产物生成', icon: '📦', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('deliverables')

    await pushStep('deliverables', '生成产物清单', 'done', [
      { label: '尽调资料包', value: '18份' },
      { label: '风险诊断报告', value: '1份' },
      { label: '智能报告草稿', value: '1份' },
      { label: '附件与证据链', value: '24份' },
    ])

    updateStageStatus('deliverables', 'done')
    stage.artifactData = { steps: stage.artifactData.steps || [], items: [...mockDeliverables] }
    currentArtifactType.value = 'deliverables'
    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, { items: [...mockDeliverables] })

    await pushStreamingMessage('产物已生成。你可以开始资料包确认和报告修改。')
    currentFlowStatus.value = 'waiting_report_action'
    waitingForInput.value = true
  }

  // ===================== 报告编辑器（工作区态） =====================
  async function openReportEditor() {
    layoutMode.value = 'workspace'
    activeTool.value = 'reportEditor'
    waitingForInput.value = false
    await pushMessage('user', '修改报告')
    await delay(300)

    const stage = { id: 'reportEditor', label: '报告编辑', icon: '📝', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('reportEditor')

    const sections = [
      { id: 's1', no: '一', title: '企业概况', status: '已完成' },
      { id: 's2', no: '二', title: '工商核验', status: '已完成' },
      { id: 's3', no: '三', title: '税票分析', status: '已完成' },
      { id: 's4', no: '四', title: '财务分析', status: '待确认' },
      { id: 's5', no: '五', title: '风险诊断', status: '待确认' },
      { id: 's6', no: '六', title: '授信建议', status: '待编辑' },
    ]

    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      title: selectedEnterprise.value?.name ? `${selectedEnterprise.value.name} 尽职调查报告` : '尽职调查报告',
      template: selectedDueTemplate.value?.name || '标准授信尽调',
      sections,
    }
    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, { title: stage.artifactData.title, template: stage.artifactData.template, sections })

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
  }
})