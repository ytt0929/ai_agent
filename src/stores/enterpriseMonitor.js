/**
 * 企业监测 - Pinia Store
 * 核心模型：monitorTasks / scanResults / monitorWarnings
 * 旧 rules / warnings 保留兼容（筛客 addWatchedCompany 等）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { warnings as mockWarnings, rules as mockRules } from '../data/mockEnterpriseMonitor.js'

function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

// 自然语言解析
function parseMonitorText(text) {
  const input = (text || '').trim()
  const parsed = { name: '新监测任务', enterprises: [], dimensions: [], rawText: input }

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

  if (input.includes('税票') || input.includes('开票')) {
    const cond = input.includes('30%') ? '连续下降超过30%' : '连续下降或异常波动'
    parsed.dimensions.push({ name: '税票波动', condition: cond, level: 'high' })
  }
  if (input.includes('被执行') || input.includes('司法') || input.includes('诉讼')) {
    parsed.dimensions.push({ name: '司法风险', condition: '新增被执行/诉讼', level: 'high' })
  }
  if (input.includes('法人') || input.includes('股东') || input.includes('工商')) {
    parsed.dimensions.push({ name: '工商变更', condition: '法人/股东/经营范围变更', level: 'medium' })
  }
  if (input.includes('资料') || input.includes('过期') || input.includes('征信') || input.includes('审计')) {
    parsed.dimensions.push({ name: '资料有效期', condition: '过期或即将过期', level: 'medium' })
  }
  if (!parsed.dimensions.length) {
    parsed.dimensions.push({ name: '工商变更', condition: '任意重要变更', level: 'low' })
    parsed.dimensions.push({ name: '司法风险', condition: '新增被执行/诉讼', level: 'low' })
  }
  parsed.name = parsed.enterprises[0] + ' - ' + parsed.dimensions.map(d => d.name).join(' / ') + ' 监测'
  return parsed
}

function buildSuggestion(warning) {
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

function nowLabel() {
  const d = new Date()
  return `今天 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export const useMonitorStore = defineStore('monitor', () => {
  // ====== 新核心状态 ======
  const monitorInput = ref('监测杭州智造装备，税票连续下降超过30%或新增被执行时提醒我')
  const parsedMonitor = ref(null)
  const monitorView = ref('launch')
  const runningSteps = ref([])
  const monitorTasks = ref([])
  const selectedTaskId = ref(null)
  const scanResults = ref([])
  const monitorWarnings = ref([])

  // 详情 / 创建
  const detailOpen = ref(false)
  const detailWarning = ref(null)
  const detailTask = ref(null)
  const createRuleOpen = ref(false)
  const nlInput = ref('')
  const nlParsed = ref(null)
  const nlParsing = ref(false)
  const createdMonitorResult = ref(null)

  // 兼容旧数据
  const activeTab = ref('warnings')
  const warningFilter = ref('all')
  const complianceFilter = ref('all')
  const warnings = ref(clone(mockWarnings))
  const rules = ref(clone(mockRules))
  const queryHistory = ref([])
  const actionCenter = ref([])

  // ====== 计算属性 ======
  const parsedQuickMonitor = computed(() => {
    if (!monitorInput.value.trim()) return null
    return parseMonitorText(monitorInput.value)
  })

  const kpi = computed(() => {
    const w = warnings.value
    const oneDay = 24 * 3600000
    return {
      monitored: 42,
      todayWarnings: w.filter(w => (Date.now() - w.timeRaw) < oneDay).length,
      unread: w.filter(w => !w.read).length,
      expired: w.filter(w => w.type === 'compliance' && w.daysOverdue > 0).length,
    }
  })

  const filteredWarnings = computed(() => {
    let list = [...warnings.value]
    const f = warningFilter.value
    if (f === 'high') list = list.filter(w => w.level === 'high')
    else if (f === 'medium') list = list.filter(w => w.level === 'medium')
    else if (f === 'low') list = list.filter(w => w.level === 'low')
    else if (f === 'unread') list = list.filter(w => !w.read)
    const levelOrder = { high: 0, medium: 1, low: 2 }
    list.sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || b.timeRaw - a.timeRaw)
    return list
  })

  const complianceWarningsData = computed(() => {
    let list = warnings.value.filter(w => w.type === 'compliance')
    const f = complianceFilter.value
    if (f === 'expired') list = list.filter(w => w.daysOverdue > 0)
    else if (f === 'expiring') list = list.filter(w => w.daysRemaining > 0)
    list.sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0) || (a.daysRemaining || 999) - (b.daysRemaining || 999))
    return list
  })

  const runningRules = computed(() => rules.value.filter(r => r.status === 'running'))
  const pausedRules = computed(() => rules.value.filter(r => r.status === 'paused'))
  const focusedWarnings = computed(() => warnings.value.filter(w => w.focused))

  const monitoredRules = computed(() => {
    return rules.value.map(rule => {
      const related = warnings.value.filter(w =>
        w.ruleName === rule.name ||
        rule.enterprises?.some(e => w.enterprise?.name?.includes(e) || e.includes(w.enterprise?.name || ''))
      )
      const latest = related.sort((a, b) => b.timeRaw - a.timeRaw)[0]
      return { ...rule, source: rule.source || '手动规则', warningCount: related.length, latestWarning: latest }
    })
  })

  const decisionQueue = computed(() => {
    const levelOrder = { high: 0, medium: 1, low: 2 }
    return [...warnings.value]
      .filter(w => !w.pushedToDueDiligence || !w.focused)
      .sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || b.timeRaw - a.timeRaw)
      .slice(0, 4)
      .map(w => ({ ...w, suggestion: buildSuggestion(w) }))
  })

  // ====== Actions ======
  function setMonitorInput(text) { monitorInput.value = text }

  function parseMonitorTextAction(text) {
    parsedMonitor.value = parseMonitorText(text || monitorInput.value)
    return parsedMonitor.value
  }

  function setMonitorView(view) { monitorView.value = view }

  function setRunningSteps(steps) { runningSteps.value = steps }

  function advanceRunningStep(idx, status) {
    if (runningSteps.value[idx]) runningSteps.value[idx].status = status
  }

  // 创建监测任务
  function createMonitorTask(parsed, source = 'AI自然语言') {
    const id = 'MT' + Date.now()
    const task = {
      id,
      name: parsed.name,
      enterprises: [...parsed.enterprises],
      dimensions: [...parsed.dimensions],
      source,
      status: 'running',
      createdAt: new Date().toISOString().slice(0, 10),
      createdAtLabel: nowLabel(),
      lastScan: '刚刚',
      warningCount: 0,
      latestWarning: null,
      rawText: parsed.rawText || '',
    }
    monitorTasks.value.unshift(task)

    // 同时在旧 rules 里也加一条，兼容 monitoredRules 展示
    const compatRule = {
      id: 'R' + Date.now(),
      name: parsed.name,
      enterprises: [...parsed.enterprises],
      dimensions: [...parsed.dimensions],
      notifyMethod: '站内消息',
      status: 'running',
      source,
      createdAt: task.createdAt,
      triggerCount: 0,
      lastTrigger: '无',
      history: [],
    }
    rules.value.unshift(compatRule)

    selectedTaskId.value = id
    return task
  }

  // 生成首轮扫描结果
  function createInitialScanResult(taskId) {
    const task = monitorTasks.value.find(t => t.id === taskId)
    if (!task) return null

    const results = []
    for (const dim of task.dimensions) {
      let status = 'normal'
      let evidence = '数据正常，未触发条件'
      let aiJudgment = '当前无需处置，持续监测中。'

      if (dim.name === '税票波动') {
        status = 'abnormal'
        evidence = '近4个月开票金额连续下降，最新月下降超30%，命中阈值。'
        aiJudgment = '税票连续下降幅度超过监测条件，建议核实企业经营状况，必要时推送尽调。'
      }
      if (dim.name === '司法风险') {
        status = 'abnormal'
        evidence = '新增1条被执行人记录，执行标的500万元。'
        aiJudgment = '司法风险触发，建议核实被执行原因及对企业偿付能力的影响。'
      }
      if (dim.name === '工商变更') {
        status = 'attention'
        evidence = '近30天内无工商变更。'
        aiJudgment = '工商状态正常，无重要变更。'
      }
      if (dim.name === '资料有效期') {
        status = 'attention'
        evidence = '征信报告已过有效期3天。'
        aiJudgment = '资料过期，建议尽快补充更新。'
      }

      results.push({
        dimensionName: dim.name,
        condition: dim.condition,
        status,
        evidence,
        aiJudgment,
      })
    }

    scanResults.value.push({ taskId, results, scannedAt: nowLabel() })
    return results
  }

  // 从扫描结果生成预警
  function createWarningFromScan(taskId) {
    const task = monitorTasks.value.find(t => t.id === taskId)
    const results = scanResults.value.find(s => s.taskId === taskId)?.results || []
    if (!task || !results.length) return null

    const abnormalResults = results.filter(r => r.status === 'abnormal')
    const generatedWarnings = []

    for (const r of abnormalResults) {
      const dim = task.dimensions.find(d => d.name === r.dimensionName)
      const warning = {
        id: 'MW' + Date.now() + Math.random().toString(36).slice(2, 6),
        type: 'enterprise',
        level: dim?.level || 'medium',
        title: `${r.dimensionName}异常 — ${task.enterprises.join('、')}`,
        enterprise: { name: task.enterprises[0], creditCode: '91330000MOCK' + Date.now().toString().slice(-4) },
        ruleName: task.name,
        summary: r.evidence,
        time: '刚刚',
        timeRaw: Date.now(),
        read: false,
        triggerReason: r.evidence,
        aiJudgment: r.aiJudgment,
        trendData: r.dimensionName === '税票波动' ? [
          { month: '3月', value: 1680 }, { month: '4月', value: 1580 },
          { month: '5月', value: 1210 }, { month: '6月', value: 820, abnormal: true },
        ] : [],
        industryAvg: r.dimensionName === '税票波动' ? '下降15%' : '',
        impactAssessment: [
          `${r.dimensionName}已触发监测条件：${r.condition}`,
          r.aiJudgment,
          '建议客户经理确认处置方式。',
        ],
        historyWarnings: [],
        pushedToDueDiligence: false,
        focused: false,
        dispositionStatus: '待处置',
        actionLogs: [],
      }
      monitorWarnings.value.unshift(warning)
      generatedWarnings.push(warning)

      // 也加到旧 warnings 列表，兼容现有功能
      warnings.value.unshift(warning)
    }

    task.warningCount = generatedWarnings.length
    task.lastScan = nowLabel()
    task.latestWarning = generatedWarnings[0] || null

    // 更新兼容 rule
    const compatRule = rules.value.find(r => r.name === task.name)
    if (compatRule) {
      compatRule.triggerCount += generatedWarnings.length
      compatRule.lastTrigger = nowLabel()
    }

    return { task, warnings: generatedWarnings }
  }

  // 从快速输入开始监测
  function startMonitorFromInput() {
    const text = monitorInput.value.trim()
    if (!text) return null
    const parsed = parseMonitorText(text)
    const task = createMonitorTask(parsed, 'AI自然语言')
    return task
  }

  // 重置流程
  function resetMonitorFlow() {
    monitorView.value = 'launch'
    parsedMonitor.value = null
    runningSteps.value = []
    selectedTaskId.value = null
    createdMonitorResult.value = null
  }

  // 打开任务详情
  function openTaskDetail(taskId) {
    const task = monitorTasks.value.find(t => t.id === taskId)
    if (!task) return
    detailTask.value = task
    detailOpen.value = true
  }

  // 打开预警详情（兼容旧接口）
  function openDetail(warning) {
    const target = warnings.value.find(w => w.id === warning.id) || warning
    detailWarning.value = target
    detailOpen.value = true
    const idx = warnings.value.findIndex(w => w.id === target.id)
    if (idx >= 0 && !warnings.value[idx].read) warnings.value[idx].read = true
  }

  function closeDetail() {
    detailOpen.value = false
    detailWarning.value = null
    detailTask.value = null
  }

  // 推送尽调
  function pushWarningToDueDiligence(warningId) {
    const warning = warnings.value.find(w => w.id === warningId)
    if (!warning) return null
    warning.pushedToDueDiligence = true
    warning.dispositionStatus = '已推送尽调'
    warning.dueTaskName = `${warning.enterprise.name}-${warning.title}核查`
    warning.dueTaskProgress = 35
    if (!warning.actionLogs) warning.actionLogs = []
    warning.actionLogs.unshift({
      title: '已推送到智能尽调',
      detail: `已生成「${warning.dueTaskName}」`,
      time: nowLabel(),
    })
    return warning
  }

  // 重点关注
  function addWarningToFocus(warningId) {
    const warning = warnings.value.find(w => w.id === warningId)
    if (!warning) return null
    warning.focused = true
    warning.dispositionStatus = warning.pushedToDueDiligence ? '已推送尽调 / 重点关注' : '重点关注'
    if (!warning.actionLogs) warning.actionLogs = []
    warning.actionLogs.unshift({
      title: '已加入重点关注',
      detail: '后续数据刷新时优先复核该企业。',
      time: nowLabel(),
    })
    return warning
  }

  // 兼容旧方法
  function buildMonitorSuggestion(warning) { return buildSuggestion(warning) }
  function pushToDueDiligence(warningId) { return pushWarningToDueDiligence(warningId) }
  function addFocus(warningId) { return addWarningToFocus(warningId) }

  function setActiveTab(tab) { activeTab.value = tab }
  function setWarningFilter(f) { warningFilter.value = f }
  function setComplianceFilter(f) { complianceFilter.value = f }

  function openCreateRule() { createRuleOpen.value = true; nlInput.value = ''; nlParsed.value = null }
  function closeCreateRule() { createRuleOpen.value = false; nlInput.value = ''; nlParsed.value = null }

  async function parseNLRules() {
    nlParsing.value = true
    await new Promise(r => setTimeout(r, 800))
    nlParsed.value = parseMonitorText(nlInput.value)
    nlParsing.value = false
  }

  function confirmCreateRule() {
    if (!nlParsed.value) return
    const task = createMonitorTask(nlParsed.value, 'AI自然语言')
    closeCreateRule()
    return task
  }

  function toggleRuleStatus(ruleId) {
    const r = rules.value.find(r => r.id === ruleId)
    if (r) r.status = r.status === 'running' ? 'paused' : 'running'
  }
  function deleteRule(ruleId) { rules.value = rules.value.filter(r => r.id !== ruleId) }

  function addWatchedCompany(info) {
    const w = {
      id: 'w' + Date.now(), type: 'enterprise', title: `新增监控 — ${info.name}`,
      summary: `从智能筛客转入，匹配度 ${info.match || '—'}，风险等级 ${info.risk || '—'}`,
      ruleName: '筛客自动监控', level: 'low', enterprise: { name: info.name },
      time: '刚刚', timeRaw: Date.now(), read: false,
    }
    warnings.value.unshift(w)
  }

  function createMonitorFromQuickInput() {
    const text = monitorInput.value.trim()
    if (!text) return null
    const parsed = parseMonitorText(text)
    const task = createMonitorTask(parsed, 'AI自然语言')
    const results = createInitialScanResult(task.id)
    const scanWarnings = createWarningFromScan(task.id)

    createdMonitorResult.value = {
      task,
      scanResults: results,
      warning: scanWarnings?.warnings?.[0] || null,
    }

    // 兼容：也在旧 rules/warnings 中生成
    const compatRule = rules.value.find(r => r.name === task.name)
    if (compatRule && scanWarnings?.warnings?.[0]) {
      compatRule.history.unshift({ time: nowLabel(), title: scanWarnings.warnings[0].title, warningId: scanWarnings.warnings[0].id })
    }

    return { rule: compatRule || { name: task.name }, warning: scanWarnings?.warnings?.[0] }
  }

  function createManualMonitor() {
    const parsed = {
      name: '手工监测 - 工商/资料有效期',
      enterprises: ['手工添加企业'],
      dimensions: [
        { name: '工商变更', condition: '法人/股东/经营范围变更', level: 'medium' },
        { name: '资料有效期', condition: '过期或即将过期', level: 'medium' },
      ],
      rawText: '手工添加监控',
    }
    const task = createMonitorTask(parsed, '手工添加')
    const results = createInitialScanResult(task.id)
    const scanWarnings = createWarningFromScan(task.id)

    createdMonitorResult.value = {
      task,
      scanResults: results,
      warning: scanWarnings?.warnings?.[0] || null,
    }

    const compatRule = rules.value.find(r => r.name === task.name)
    return { rule: compatRule || { name: task.name }, warning: scanWarnings?.warnings?.[0] }
  }

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

  return {
    // 新核心
    monitorInput, parsedMonitor, monitorView, runningSteps,
    monitorTasks, selectedTaskId, scanResults, monitorWarnings,
    // 详情
    detailOpen, detailWarning, detailTask,
    createRuleOpen, nlInput, nlParsed, nlParsing,
    createdMonitorResult,
    // 兼容
    activeTab, warningFilter, complianceFilter,
    warnings, rules, queryHistory, actionCenter,
    // 计算
    kpi, filteredWarnings, complianceWarnings: complianceWarningsData,
    runningRules, pausedRules, focusedWarnings, monitoredRules,
    decisionQueue, parsedQuickMonitor,
    // Actions
    setMonitorInput, parseMonitorTextAction, setMonitorView, setRunningSteps, advanceRunningStep,
    createMonitorTask, createInitialScanResult, createWarningFromScan,
    startMonitorFromInput, resetMonitorFlow,
    openTaskDetail, openDetail, closeDetail,
    pushWarningToDueDiligence, addWarningToFocus,
    pushToDueDiligence, addFocus,
    buildMonitorSuggestion,
    setActiveTab, setWarningFilter, setComplianceFilter,
    openCreateRule, closeCreateRule, parseNLRules, confirmCreateRule,
    toggleRuleStatus, deleteRule, addWatchedCompany,
    createMonitorFromQuickInput, createManualMonitor,
    findWarning, ensureActionLog, getRecommendedAction, getReasonTags,
  }
})
