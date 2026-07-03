/**
 * 企业监测 - Pinia Store
 * 核心模型：monitorTasks / indicatorLibrary / scanResults / monitorWarnings
 * 旧 rules / warnings 保留兼容（筛客 addWatchedCompany 等）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  monitorTasks as mockTasks,
  indicatorLibrary as mockIndicators,
  scanResults as mockScanResults,
  monitorWarnings as mockWarnings,
  warnings as mockOldWarnings,
  rules as mockRules,
} from '../data/mockEnterpriseMonitor.js'

function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

// ════════════════════════════════════════
// 自然语言解析（用于新增/编辑监控）
// ════════════════════════════════════════

// 唐山物桥商贸有限公司专用映射
const TANGSHAN_WUQIAO = {
  name: '唐山物桥商贸有限公司',
  creditCode: '91130203MA7EEQ2N0T',
}

function parseMonitorText(text) {
  const input = (text || '').trim()
  const parsed = { enterprises: [], creditCode: null, indicators: [], rawText: input }

  // ── 识别统一社会信用代码 ──
  const ccMatch = input.match(/\b(91\d{16}[A-Z0-9])\b/)
  if (ccMatch) {
    parsed.creditCode = ccMatch[1]
  }

  // ── 识别企业名：优先已知企业 ──
  if (input.includes(TANGSHAN_WUQIAO.name) || input.includes('唐山物桥')) {
    parsed.enterprises.push(TANGSHAN_WUQIAO.name)
    if (!parsed.creditCode) parsed.creditCode = TANGSHAN_WUQIAO.creditCode
  } else {
    // 通用模式
    const entPatterns = [
      /(?:监测|监控|盯着|盯住|关注|帮我盯着|帮我监测)([^\uff0c\s,。；;]+)/,
    ]
    for (const p of entPatterns) {
      const m = input.match(p)
      if (m?.[1] && m[1].length > 1) {
        parsed.enterprises.push(m[1])
        break
      }
    }
  }
  if (!parsed.enterprises.length) parsed.enterprises = ['杭州智造装备有限公司']

  // ── 识别监控指标（去重：用 Set 追踪已添加的指标名）──
  const seen = new Set()
  const addIndicator = (id, name, condition, level) => {
    if (!seen.has(name)) {
      seen.add(name)
      parsed.indicators.push({ id, name, condition, level, enabled: true })
    }
  }

  // 税负率 / 税负 / 税票 / 纳税 / 税务
  if (input.includes('税负率') || input.includes('税负') || (input.includes('税票') && (input.includes('低') || input.includes('降') || input.includes('异常')))) {
    addIndicator('ind-tax-rate', '税负率异常', '税负率显著低于行业均值或连续下降', 'high')
  }

  // 开票 / 收入 / 营收 / 异常波动 / 连续下降
  if (input.includes('开票收入') || input.includes('开票') && input.includes('波动') || input.includes('开票收入连续下降') || input.includes('收入') && (input.includes('波动') || input.includes('下降'))) {
    addIndicator('ind-revenue-fluct', '开票收入波动', '开票收入连续下降或异常波动', 'high')
  }

  // 税票波动（通用兜底，不与上面的重复）
  if ((input.includes('税票') || input.includes('开票')) && !seen.has('税票波动') && !seen.has('税负率异常')) {
    const cond = input.includes('30%') ? '连续下降超过30%' : '连续下降或异常波动'
    addIndicator('ind-tax', '税票波动', cond, 'high')
  }

  // 被执行 / 诉讼 / 司法 / 裁判 / 失信
  if (input.includes('被执行') || input.includes('诉讼') || input.includes('司法') || input.includes('裁判') || input.includes('失信')) {
    addIndicator('ind-judicial', '司法风险', '新增被执行、诉讼、裁判文书或失信记录', 'high')
  }

  // 法人 / 股东 / 工商 / 经营范围 / 注册地址
  if (input.includes('法人') || input.includes('股东') || input.includes('工商变更') || input.includes('经营范围') || input.includes('注册地址')) {
    addIndicator('ind-industry', '工商变更', '法人、股东、经营范围或注册地址发生变更', 'medium')
  }

  // 资料 / 过期 / 征信 / 审计
  if (input.includes('资料') || input.includes('过期') || input.includes('征信') || input.includes('审计')) {
    addIndicator('ind-expiry', '资料有效期', '过期或即将过期', 'medium')
  }

  // 经营异常 / 行政处罚 / 严重违法
  if (input.includes('经营异常') || input.includes('经营异常名录') || input.includes('行政处罚') || input.includes('严重违法')) {
    addIndicator('ind-abnormal', '经营异常', '新增经营异常名录、行政处罚或严重违法记录', 'medium')
  }

  // 舆情 / 负面
  if (input.includes('舆情') || input.includes('负面')) {
    addIndicator('ind-sentiment', '舆情风险', '负面舆情集中出现', 'medium')
  }

  // 兜底
  if (!parsed.indicators.length) {
    addIndicator('ind-industry', '工商变更', '法人/股东/经营范围变更', 'medium')
    addIndicator('ind-judicial', '司法风险', '新增被执行/诉讼', 'medium')
  }

  return parsed
}

function nowLabel() {
  const d = new Date()
  return `今天 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const useMonitorStore = defineStore('monitor', () => {
  // ════════════════════════════════════════
  // 首页：监控任务中心
  // ════════════════════════════════════════
  const monitorTasks = ref(clone(mockTasks))
  const taskFilter = ref('all')  // all | due-diligence | screening | diagnosis | manual | natural-language | warning

  // ════════════════════════════════════════
  // 指标库
  // ════════════════════════════════════════
  const indicatorLibrary = ref(clone(mockIndicators))
  const indicatorLibraryOpen = ref(false)

  // ════════════════════════════════════════
  // 新增监控 dialog
  // ════════════════════════════════════════
  const createOpen = ref(false)
  const createMode = ref('natural')  // natural | manual
  const createInput = ref('')
  const createParsed = ref(null)
  const createParsing = ref(false)
  const createEnterprise = ref('')
  const createSelectedIndicators = ref([])
  const createSource = ref('natural-language')
  const creating = ref(false)
  const creatingSteps = ref([])

  // ════════════════════════════════════════
  // 编辑指标 drawer
  // ════════════════════════════════════════
  const editOpen = ref(false)
  const editTaskId = ref(null)
  const editInput = ref('')
  const editParsed = ref(null)
  const editParsing = ref(false)

  // ════════════════════════════════════════
  // 任务详情 drawer
  // ════════════════════════════════════════
  const detailTaskOpen = ref(false)
  const detailTask = ref(null)
  const detailTab = ref('indicators')  // indicators | warnings

  // ════════════════════════════════════════
  // 预警详情 drawer
  // ════════════════════════════════════════
  const warningDetailOpen = ref(false)
  const warningDetail = ref(null)

  // ════════════════════════════════════════
  // 扫描结果 & 预警
  // ════════════════════════════════════════
  const scanResults = ref(clone(mockScanResults))
  const monitorWarnings = ref(clone(mockWarnings))

  // ════════════════════════════════════════
  // 旧兼容数据
  // ════════════════════════════════════════
  const warnings = ref(clone(mockOldWarnings))
  const rules = ref(clone(mockRules))
  const activeTab = ref('warnings')
  const warningFilter = ref('all')
  const complianceFilter = ref('all')
  const queryHistory = ref([])
  const actionCenter = ref([])

  // ════════════════════════════════════════
  // 计算属性
  // ════════════════════════════════════════
  const filteredTasks = computed(() => {
    let list = [...monitorTasks.value]
    const f = taskFilter.value
    if (f !== 'all' && f !== 'warning') {
      list = list.filter(t => t.source === f)
    } else if (f === 'warning') {
      list = list.filter(t => t.warningCount > 0)
    }
    return list
  })

  const currentTaskScanResults = computed(() => {
    if (!detailTask.value) return []
    return scanResults.value.find(s => s.taskId === detailTask.value.id)?.items || []
  })

  const currentTaskWarnings = computed(() => {
    if (!detailTask.value) return []
    return monitorWarnings.value.filter(w => w.taskId === detailTask.value.id)
  })

  // ════════════════════════════════════════
  // Actions - 任务筛选
  // ════════════════════════════════════════
  function setTaskFilter(f) { taskFilter.value = f }

  // ════════════════════════════════════════
  // Actions - 新增监控
  // ════════════════════════════════════════
  function openCreateMonitor() {
    createOpen.value = true
    createMode.value = 'natural'
    createInput.value = '监控唐山物桥商贸有限公司，重点关注税负率显著低于行业、开票收入连续下降或异常波动、新增被执行或诉讼、法人股东工商变更、经营异常名录；一旦触发高风险请提醒我。'
    createParsed.value = null
    createEnterprise.value = ''
    createSelectedIndicators.value = []
    createSource.value = 'natural-language'
    creating.value = false
    creatingSteps.value = []
  }

  function closeCreateMonitor() {
    createOpen.value = false
  }

  async function parseCreateText() {
    if (!createInput.value.trim()) return
    createParsing.value = true
    await new Promise(r => setTimeout(r, 600))
    const parsed = parseMonitorText(createInput.value)
    createParsed.value = parsed
    createEnterprise.value = parsed.enterprises[0] || '杭州智造装备有限公司'
    createSelectedIndicators.value = parsed.indicators.map(i => ({ ...i }))
    createParsing.value = false
  }

  function getCreateParsedCreditCode() {
    return createParsed.value?.creditCode || null
  }

  const createSteps = [
    { label: '识别企业主体', result: '已识别企业主体' },
    { label: '拆解监控指标', result: '已识别监控指标' },
    { label: '匹配指标库', result: '已匹配系统指标库' },
    { label: '接入数据源', result: '已接入数据源' },
    { label: '建立监控任务', result: '已建立监控任务' },
    { label: '完成首轮扫描', result: '已完成首轮扫描' },
  ]

  function runCreateMonitorSteps(task) {
    creating.value = true
    creatingSteps.value = createSteps.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' }))
    const delays = [600, 1200, 1800, 2400, 3000, 3600]
    const timers = []
    for (let i = 0; i < delays.length; i++) {
      timers.push(setTimeout(() => {
        if (i > 0) creatingSteps.value[i - 1].status = 'done'
        creatingSteps.value[i].status = 'active'
      }, delays[i]))
    }
    timers.push(setTimeout(() => {
      creatingSteps.value[creatingSteps.value.length - 1].status = 'done'
      creating.value = false
      closeCreateMonitor()
    }, 4200))
    return timers
  }

  function createMonitorTask(parsed, source) {
    const id = 'MT-' + Date.now()
    const entName = parsed.enterprises[0] || createEnterprise.value || '杭州智造装备有限公司'
    // 优先使用解析出的 creditCode（如唐山物桥的统一社会信用代码），否则生成模拟编码
    const creditCode = parsed.creditCode || ('91330000MOCK' + Date.now().toString().slice(-4))
    const task = {
      id,
      enterpriseName: entName,
      creditCode,
      source,
      sourceLabel: source === 'due-diligence' ? '尽调转入' : source === 'screening' ? '筛客转入' : source === 'diagnosis' ? '风险探查转入' : source === 'manual' ? '手工新增' : '自然语言',
      status: 'running',
      indicators: parsed.indicators.map(i => ({ ...i })),
      lastScanAt: nowLabel(),
      warningCount: 0,
      latestWarning: null,
      focused: false,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    monitorTasks.value.unshift(task)
    return task
  }

  function confirmCreateMonitor() {
    const indicators = createSelectedIndicators.value.map(i => ({
      id: i.id || 'ind-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      name: i.name,
      condition: i.condition,
      level: i.level,
      enabled: i.enabled !== false,
    }))
    const parsed = { enterprises: [createEnterprise.value], indicators, creditCode: getCreateParsedCreditCode() }
    const source = createSource.value
    const task = createMonitorTask(parsed, source)
    // 模拟首轮扫描
    const items = indicators.map(ind => ({
      indicatorId: ind.id,
      indicatorName: ind.name,
      status: 'normal',
      evidence: '数据正常，未触发条件。',
      aiJudgement: '当前无需处置，持续监测中。',
      scannedAt: nowLabel(),
    }))
    scanResults.value.push({ taskId: task.id, items })
    runCreateMonitorSteps(task)
  }

  function handleManualCreate() {
    createMode.value = 'manual'
    createEnterprise.value = ''
    createSelectedIndicators.value = indicatorLibrary.value.filter(i => i.enabled).map(i => ({
      id: i.id,
      name: i.name,
      condition: i.defaultCondition,
      level: i.defaultLevel,
      enabled: true,
    }))
  }

  function toggleCreateIndicator(indId) {
    const idx = createSelectedIndicators.value.findIndex(i => i.id === indId)
    if (idx >= 0) {
      createSelectedIndicators.value.splice(idx, 1)
    }
  }

  function addCreateIndicator(indicator) {
    if (!createSelectedIndicators.value.find(i => i.id === indicator.id)) {
      createSelectedIndicators.value.push({ ...indicator, enabled: true })
    }
  }

  // ════════════════════════════════════════
  // Actions - 编辑指标
  // ════════════════════════════════════════
  function openEditIndicators(taskId) {
    editTaskId.value = taskId
    editOpen.value = true
    editInput.value = ''
    editParsed.value = null
  }

  function closeEditIndicators() {
    editOpen.value = false
    editTaskId.value = null
  }

  async function parseEditText() {
    if (!editInput.value.trim()) return
    editParsing.value = true
    await new Promise(r => setTimeout(r, 500))
    editParsed.value = parseMonitorText(editInput.value)
    editParsing.value = false
  }

  function confirmEditIndicators() {
    const task = monitorTasks.value.find(t => t.id === editTaskId.value)
    if (!task || !editParsed.value) return
    const newIndicators = editParsed.value.indicators.map(ind => ({
      id: ind.id || 'ind-' + Date.now(),
      name: ind.name,
      condition: ind.condition,
      level: ind.level,
      enabled: true,
    }))
    // 合并去重
    const existingIds = new Set(task.indicators.map(i => i.id))
    for (const ind of newIndicators) {
      if (!existingIds.has(ind.id)) {
        task.indicators.push(ind)
        existingIds.add(ind.id)
      }
    }
    ElMessage.success('已添加指标：' + newIndicators.map(i => i.name).join('、'))
    editInput.value = ''
    editParsed.value = null
  }

  function removeTaskIndicator(taskId, indId) {
    const task = monitorTasks.value.find(t => t.id === taskId)
    if (task) task.indicators = task.indicators.filter(i => i.id !== indId)
  }

  // ════════════════════════════════════════
  // Actions - 指标库
  // ════════════════════════════════════════
  function openIndicatorLibrary() { indicatorLibraryOpen.value = true }
  function closeIndicatorLibrary() { indicatorLibraryOpen.value = false }

  // ════════════════════════════════════════
  // Actions - 任务详情
  // ════════════════════════════════════════
  function openTaskDetail(taskId) {
    const task = monitorTasks.value.find(t => t.id === taskId)
    if (!task) return
    detailTask.value = task
    detailTaskOpen.value = true
    detailTab.value = 'indicators'
  }

  function closeTaskDetail() {
    detailTaskOpen.value = false
    detailTask.value = null
  }

  function setDetailTab(tab) { detailTab.value = tab }

  // ════════════════════════════════════════
  // Actions - 预警详情
  // ════════════════════════════════════════
  function openWarningDetail(warning) {
    const target = monitorWarnings.value.find(w => w.id === warning.id) || warning
    warningDetail.value = target
    warningDetailOpen.value = true
  }

  function closeWarningDetail() {
    warningDetailOpen.value = false
    warningDetail.value = null
  }

  // ════════════════════════════════════════
  // Actions - 预警处置
  // ════════════════════════════════════════
  function pushWarningToDueDiligence(warningId) {
    const warning = monitorWarnings.value.find(w => w.id === warningId)
    if (!warning) return null
    warning.pushedToDueDiligence = true
    warning.actionLogs.unshift({ title: '已推送到智能尽调', time: nowLabel() })
    return warning
  }

  function addWarningToFocus(warningId) {
    const warning = monitorWarnings.value.find(w => w.id === warningId)
    if (!warning) return null
    warning.focused = true
    warning.actionLogs.unshift({ title: '已加入重点关注', time: nowLabel() })
    return warning
  }

  function markWarningHandled(warningId) {
    const warning = monitorWarnings.value.find(w => w.id === warningId)
    if (!warning) return null
    warning.handled = true
    warning.actionLogs.unshift({ title: '已标记为已处理', time: nowLabel() })
    return warning
  }

  // ════════════════════════════════════════
  // Actions - 任务状态切换
  // ════════════════════════════════════════
  function toggleTaskStatus(taskId) {
    const task = monitorTasks.value.find(t => t.id === taskId)
    if (task) task.status = task.status === 'running' ? 'paused' : 'running'
  }

  // ════════════════════════════════════════
  // 兼容旧方法（筛客等调用）
  // ════════════════════════════════════════
  function addWatchedCompany(info) {
    const w = {
      id: 'w' + Date.now(), type: 'enterprise', title: `新增监控 — ${info.name}`,
      summary: `从智能筛客转入，匹配度 ${info.match || '—'}，风险等级 ${info.risk || '—'}`,
      ruleName: '筛客自动监控', level: 'low', enterprise: { name: info.name },
      time: '刚刚', timeRaw: Date.now(), read: false,
    }
    warnings.value.unshift(w)
  }

  function setActiveTab(tab) { activeTab.value = tab }
  function setWarningFilter(f) { warningFilter.value = f }
  function setComplianceFilter(f) { complianceFilter.value = f }
  function openCreateRule() {}
  function closeCreateRule() {}
  async function parseNLRules() {}
  function confirmCreateRule() {}
  function toggleRuleStatus() {}
  function deleteRule() {}

  function openDetail(warning) {
    openWarningDetail(warning)
    const idx = warnings.value.findIndex(w => w.id === warning.id)
    if (idx >= 0 && !warnings.value[idx].read) warnings.value[idx].read = true
  }

  function closeDetail() {
    closeWarningDetail()
  }

  function buildMonitorSuggestion(warning) {
    if (!warning) return {}
    if (warning.level === 'high') return {
      primary: '推送到智能尽调并生成重点核查项',
      next: '建议同步税票、司法、工商证据到尽调任务，由 AI 生成风险核查清单。',
      impact: '高风险预警需要在后续授信或贷后回访中形成可追溯处置记录。',
    }
    if (warning.level === 'medium') return {
      primary: '加入重点关注并持续观察',
      next: '建议保留预警记录，等待下一次数据刷新后自动复核。',
      impact: '中风险事项当前不一定需要发起尽调，但应保留跟踪状态。',
    }
    return { primary: '记录为普通关注', next: '建议归档本次变化。', impact: '低风险事项适合轻量跟踪。' }
  }

  function pushToDueDiligence(warningId) { return pushWarningToDueDiligence(warningId) }
  function addFocus(warningId) { return addWarningToFocus(warningId) }

  function findWarning(warningId) { return warnings.value.find(w => w.id === warningId) || null }
  function ensureActionLog(warning) { if (!warning.actionLogs) warning.actionLogs = []; return warning.actionLogs }

  function getRecommendedAction(warning) {
    if (!warning) return { label: '查看详情', type: 'detail' }
    if (warning.pushedToDueDiligence && !warning.focused) return { label: '继续重点关注', type: 'focus' }
    if (warning.focused && !warning.pushedToDueDiligence && warning.level === 'high') return { label: '生成尽调核查项', type: 'due' }
    if (warning.level === 'high') return { label: '生成尽调核查项', type: 'due' }
    return { label: '确认重点关注', type: 'focus' }
  }

  function getReasonTags(warning) {
    const tags = []
    if (!warning) return tags
    if (warning.level === 'high') tags.push('高风险')
    if (warning.type === 'compliance') tags.push('资料有效期')
    if (!warning.read) tags.push('未读')
    if (warning.trendData?.some(d => d.abnormal)) tags.push('趋势异常')
    if (warning.historyWarnings?.length) tags.push('有历史预警')
    return tags.slice(0, 3)
  }

  function parseMonitorTextAction(text) { return parseMonitorText(text) }
  function getMonitorSourceLabel(source) {
    return { 'due-diligence': '尽调转入', 'screening': '筛客转入', 'diagnosis': '风险探查转入', 'manual': '手工新增', 'natural-language': '自然语言' }[source] || source
  }

  return {
    // 新核心
    monitorTasks, taskFilter, filteredTasks,
    indicatorLibrary, indicatorLibraryOpen,
    createOpen, createMode, createInput, createParsed, createParsing,
    createEnterprise, createSelectedIndicators, createSource,
    creating, creatingSteps,
    editOpen, editTaskId, editInput, editParsed, editParsing,
    detailTaskOpen, detailTask, detailTab,
    warningDetailOpen, warningDetail,
    scanResults, monitorWarnings,
    currentTaskScanResults, currentTaskWarnings,
    // Actions
    setTaskFilter,
    openCreateMonitor, closeCreateMonitor,
    parseCreateText, confirmCreateMonitor, runCreateMonitorSteps,
    handleManualCreate, toggleCreateIndicator, addCreateIndicator,
    createMonitorTask,
    openEditIndicators, closeEditIndicators,
    parseEditText, confirmEditIndicators, removeTaskIndicator,
    openIndicatorLibrary, closeIndicatorLibrary,
    openTaskDetail, closeTaskDetail, setDetailTab,
    openWarningDetail, closeWarningDetail,
    pushWarningToDueDiligence, addWarningToFocus, markWarningHandled,
    toggleTaskStatus,
    // 兼容
    addWatchedCompany,
    setActiveTab, setWarningFilter, setComplianceFilter,
    openCreateRule, closeCreateRule, parseNLRules, confirmCreateRule,
    toggleRuleStatus, deleteRule,
    openDetail, closeDetail,
    buildMonitorSuggestion, pushToDueDiligence, addFocus,
    findWarning, ensureActionLog, getRecommendedAction, getReasonTags,
    parseMonitorTextAction, getMonitorSourceLabel,
    warnings, rules, queryHistory, actionCenter,
    activeTab, warningFilter, complianceFilter,
  }
})
