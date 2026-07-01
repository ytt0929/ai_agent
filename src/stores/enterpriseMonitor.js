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
function parseMonitorText(text) {
  const input = (text || '').trim()
  const parsed = { enterprises: [], indicators: [], rawText: input }

  // 识别企业名
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
  if (!parsed.enterprises.length) parsed.enterprises = ['杭州智造装备有限公司']

  // 识别监控指标
  if (input.includes('税票') || input.includes('开票')) {
    const cond = input.includes('30%') ? '连续下降超过30%' : '连续下降或异常波动'
    parsed.indicators.push({ id: 'ind-tax', name: '税票波动', condition: cond, level: 'high', enabled: true })
  }
  if (input.includes('被执行') || input.includes('司法') || input.includes('诉讼')) {
    parsed.indicators.push({ id: 'ind-judicial', name: '司法风险', condition: '新增被执行/诉讼', level: 'high', enabled: true })
  }
  if (input.includes('法人') || input.includes('股东') || input.includes('工商')) {
    parsed.indicators.push({ id: 'ind-industry', name: '工商变更', condition: '法人/股东/经营范围变更', level: 'medium', enabled: true })
  }
  if (input.includes('资料') || input.includes('过期') || input.includes('征信') || input.includes('审计')) {
    parsed.indicators.push({ id: 'ind-expiry', name: '资料有效期', condition: '过期或即将过期', level: 'medium', enabled: true })
  }
  if (input.includes('经营异常') || input.includes('经营异常名录')) {
    parsed.indicators.push({ id: 'ind-abnormal', name: '经营异常', condition: '列入经营异常名录', level: 'medium', enabled: true })
  }
  if (input.includes('舆情') || input.includes('负面')) {
    parsed.indicators.push({ id: 'ind-sentiment', name: '舆情风险', condition: '负面舆情集中出现', level: 'medium', enabled: true })
  }
  if (!parsed.indicators.length) {
    parsed.indicators.push({ id: 'ind-industry', name: '工商变更', condition: '法人/股东/经营范围变更', level: 'medium', enabled: true })
    parsed.indicators.push({ id: 'ind-judicial', name: '司法风险', condition: '新增被执行/诉讼', level: 'medium', enabled: true })
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
    createInput.value = ''
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
    const task = {
      id,
      enterpriseName: entName,
      creditCode: '91330000MOCK' + Date.now().toString().slice(-4),
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
    const parsed = { enterprises: [createEnterprise.value], indicators }
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
