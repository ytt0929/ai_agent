/**
 * 企业监测 - Pinia Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { warnings as mockWarnings, rules as mockRules } from '../data/mockEnterpriseMonitor.js'

// 纯 JSON 深克隆（mock 数据 timeRaw 已经是 Number，无需 Date 转换）
function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export const useMonitorStore = defineStore('monitor', () => {
  // ====== 状态 ======
  const activeTab = ref('warnings')
  const warningFilter = ref('all')
  const complianceFilter = ref('all')

  const warnings = ref(clone(mockWarnings))
  const rules = ref(clone(mockRules))

  const detailOpen = ref(false)
  const detailWarning = ref(null)
  const createRuleOpen = ref(false)

  const nlInput = ref('')
  const nlParsed = ref(null)
  const nlParsing = ref(false)
  const quickMonitorInput = ref('监测杭州智造装备，税票连续下降超过30%或新增被执行时提醒我')
  const createdMonitorResult = ref(null)

  const queryHistory = ref([])
  const actionCenter = ref([])

  // ====== 计算 ======
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

  const complianceWarnings = computed(() => {
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
      const relatedWarnings = warnings.value.filter(w =>
        w.ruleName === rule.name ||
        rule.enterprises?.some(e => w.enterprise?.name?.includes(e) || e.includes(w.enterprise?.name || ''))
      )
      const latest = relatedWarnings.sort((a, b) => b.timeRaw - a.timeRaw)[0]
      return {
        ...rule,
        source: rule.source || '手动规则',
        warningCount: relatedWarnings.length,
        latestWarning: latest,
      }
    })
  })
  const parsedQuickMonitor = computed(() => {
    if (!quickMonitorInput.value.trim()) return null
    return parseMonitorText(quickMonitorInput.value)
  })
  const decisionQueue = computed(() => {
    const levelOrder = { high: 0, medium: 1, low: 2 }
    return [...warnings.value]
      .filter(w => !w.pushedToDueDiligence || !w.focused)
      .sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || b.timeRaw - a.timeRaw)
      .slice(0, 4)
      .map(w => ({
        ...w,
        suggestion: buildMonitorSuggestion(w),
        recommendedAction: getRecommendedAction(w),
        reasonTags: getReasonTags(w),
      }))
  })
  const aiBriefing = computed(() => {
    const queue = decisionQueue.value
    const lead = queue[0] || null
    const highCount = warnings.value.filter(w => w.level === 'high' && !w.pushedToDueDiligence).length
    const complianceCount = warnings.value.filter(w => w.type === 'compliance' && !w.pushedToDueDiligence).length
    return {
      lead,
      title: lead ? `建议先处理「${lead.enterprise.name}」` : '今日暂无必须接管的风险',
      summary: lead
        ? `${lead.title}需要客户经理确认。AI 已按风险级别、发生时间和处置状态完成排序。`
        : 'AI 已完成本轮监测，当前仅保留持续观察。',
      stats: [
        { label: '需确认变化', value: queue.length },
        { label: '高风险待接管', value: highCount },
        { label: '资料有效性', value: complianceCount },
      ],
    }
  })

  // ====== 操作 ======
  function setActiveTab(tab) { activeTab.value = tab }
  function setWarningFilter(f) { warningFilter.value = f }
  function setComplianceFilter(f) { complianceFilter.value = f }

  function openDetail(warning) {
    const target = findWarning(warning.id) || warning
    detailWarning.value = target
    detailOpen.value = true
    const idx = warnings.value.findIndex(w => w.id === target.id)
    if (idx >= 0 && !warnings.value[idx].read) {
      warnings.value[idx].read = true
    }
  }

  function closeDetail() {
    detailOpen.value = false
    detailWarning.value = null
  }

  function openCreateRule() {
    createRuleOpen.value = true
    nlInput.value = ''
    nlParsed.value = null
  }

  function closeCreateRule() {
    createRuleOpen.value = false
    nlInput.value = ''
    nlParsed.value = null
  }

  async function parseNLRules() {
    nlParsing.value = true
    await new Promise(r => setTimeout(r, 800))

    const parsed = parseMonitorText(nlInput.value)
    nlParsed.value = parsed
    nlParsing.value = false
  }

  function confirmCreateRule() {
    if (!nlParsed.value) return
    addRuleFromParsed(nlParsed.value, 'AI自然语言')
    closeCreateRule()
  }

  function toggleRuleStatus(ruleId) {
    const r = rules.value.find(r => r.id === ruleId)
    if (r) r.status = r.status === 'running' ? 'paused' : 'running'
  }

  function deleteRule(ruleId) {
    rules.value = rules.value.filter(r => r.id !== ruleId)
  }

  function parseMonitorText(text) {
    const input = (text || '').trim()
    const parsed = { name: '新监测规则', enterprises: [], dimensions: [], notifyMethod: '站内消息', rawText: input }
    const enterpriseMatch = input.match(/(?:监测|监控|盯着|盯住|关注|帮我盯着)([^，,。；;\s]+)/)
    if (enterpriseMatch?.[1] && enterpriseMatch[1].length > 1) {
      parsed.enterprises.push(enterpriseMatch[1])
    }
    if (!parsed.enterprises.length) parsed.enterprises = ['浙江XX制造有限公司']

    if (input.includes('税票') || input.includes('发票')) {
      const condition = input.includes('30%') ? '连续下降超过30%' : '连续下降或异常波动'
      parsed.dimensions.push({ name: '税票波动', condition, level: 'high' })
    }
    if (input.includes('被执行') || input.includes('司法') || input.includes('诉讼')) {
      parsed.dimensions.push({ name: '司法风险', condition: '新增被执行/诉讼', level: 'high' })
    }
    if (input.includes('资料') || input.includes('征信') || input.includes('审计') || input.includes('过期')) {
      parsed.dimensions.push({ name: '资料有效期', condition: '过期或即将过期', level: 'medium' })
    }
    if (input.includes('法人') || input.includes('工商') || input.includes('股东')) {
      parsed.dimensions.push({ name: '工商变更', condition: '法人/股东/经营范围变更', level: 'medium' })
    }
    if (!parsed.dimensions.length) {
      parsed.dimensions.push({ name: '工商变更', condition: '任意重要变更', level: 'low' })
    }
    if (input.includes('重点') || input.includes('立即') || input.includes('异常')) {
      parsed.dimensions.forEach(d => { d.level = d.level === 'low' ? 'medium' : d.level })
    }
    parsed.name = parsed.enterprises[0] + '-' + parsed.dimensions.map(d => d.name).join('/') + '监测'
    return parsed
  }

  function addRuleFromParsed(parsed, source = 'AI自然语言') {
    const id = 'R' + Date.now()
    const rule = {
      id,
      name: parsed.name,
      enterprises: [...parsed.enterprises],
      dimensions: [...parsed.dimensions],
      notifyMethod: parsed.notifyMethod || '站内消息',
      status: 'running',
      source,
      createdAt: new Date().toISOString().slice(0, 10),
      triggerCount: 1,
      lastTrigger: '刚刚',
      history: [],
      rawText: parsed.rawText || '',
    }
    rules.value.unshift(rule)
    const warning = createSimulatedWarning(rule)
    createdMonitorResult.value = { rule, warning }
    activeTab.value = 'rules'
    return { rule, warning }
  }

  function createSimulatedWarning(rule) {
    const primary = rule.dimensions[0]
    const isCompliance = primary.name === '资料有效期'
    const warning = {
      id: 'W' + Date.now(),
      type: isCompliance ? 'compliance' : 'enterprise',
      level: primary.level,
      title: `${primary.name}提醒`,
      enterprise: { name: rule.enterprises[0], creditCode: '91330000MOCK000001' },
      ruleName: rule.name,
      docType: isCompliance ? '资料有效期' : undefined,
      summary: `AI 已按自然语言条件开始监测：${primary.condition}。Demo 中模拟生成本条提醒，便于演示后续处置。`,
      time: '刚刚',
      timeRaw: Date.now(),
      read: false,
      triggerReason: `命中规则「${rule.name}」：${primary.name} / ${primary.condition}`,
      trendData: primary.name === '税票波动'
        ? [
            { month: '3月', value: 1680 },
            { month: '4月', value: 1580 },
            { month: '5月', value: 1210 },
            { month: '6月', value: 820, abnormal: true },
          ]
        : [],
      industryAvg: primary.name === '税票波动' ? '下降15%' : '',
      impactAssessment: [
        `AI 已识别监测指标：${rule.dimensions.map(d => d.name).join('、')}`,
        `触发条件：${primary.condition}`,
        '建议客户经理确认是否推送到智能尽调或加入重点关注',
      ],
      historyWarnings: [],
    }
    warnings.value.unshift(warning)
    rule.history.unshift({ time: '刚刚', title: warning.title, warningId: warning.id })
    return warning
  }

  function createMonitorFromQuickInput() {
    const text = quickMonitorInput.value.trim()
    if (!text) return null
    const parsed = parseMonitorText(text)
    return addRuleFromParsed(parsed, 'AI自然语言')
  }

  function createManualMonitor() {
    const parsed = {
      name: '手工监测-工商/资料有效期',
      enterprises: ['手工添加企业'],
      dimensions: [
        { name: '工商变更', condition: '法人/股东/经营范围变更', level: 'medium' },
        { name: '资料有效期', condition: '过期或即将过期', level: 'medium' },
      ],
      notifyMethod: '站内消息',
      rawText: '手工添加监控',
    }
    return addRuleFromParsed(parsed, '手工添加')
  }

  function nowLabel() {
    const d = new Date()
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `今天 ${h}:${m}`
  }

  function findWarning(warningId) {
    return warnings.value.find(w => w.id === warningId) || null
  }

  function ensureActionLog(warning) {
    if (!warning.actionLogs) warning.actionLogs = []
    return warning.actionLogs
  }

  function buildMonitorSuggestion(warning) {
    if (!warning) return null
    if (warning.type === 'compliance') {
      return {
        primary: '补齐资料并更新尽调档案',
        next: '建议向客户经理生成补充材料提醒，同时把过期资料写入待办。',
        impact: '资料有效性不足会影响授信复核和贷后检查。',
      }
    }
    if (warning.level === 'high') {
      return {
        primary: '推送到智能尽调并生成重点核查项',
        next: '建议同步税票、司法、工商证据到尽调任务，由 AI 生成风险核查清单。',
        impact: '高风险预警需要在后续授信或贷后回访中形成可追溯处置记录。',
      }
    }
    if (warning.level === 'medium') {
      return {
        primary: '加入重点关注并持续观察',
        next: '建议保留预警记录，等待下一次工商/税票/司法数据刷新后自动复核。',
        impact: '中风险事项当前不一定需要发起尽调，但应保留跟踪状态。',
      }
    }
    return {
      primary: '记录为普通关注',
      next: '建议归档本次变化，后续若连续触发再升级为重点关注。',
      impact: '低风险事项适合轻量跟踪，避免打扰客户经理主流程。',
    }
  }

  function getRecommendedAction(warning) {
    if (!warning) return { label: '查看详情', type: 'detail' }
    if (warning.pushedToDueDiligence && !warning.focused) return { label: '继续重点关注', type: 'focus' }
    if (warning.focused && !warning.pushedToDueDiligence && warning.level === 'high') return { label: '生成尽调核查项', type: 'due' }
    if (warning.type === 'compliance') return { label: '写入尽调待办', type: 'due' }
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

  function pushToDueDiligence(warningId) {
    const warning = findWarning(warningId)
    if (!warning) return null
    const time = nowLabel()
    const taskName = `${warning.enterprise.name}-${warning.title}核查`
    warning.pushedToDueDiligence = true
    warning.dispositionStatus = '已推送尽调'
    warning.dueTaskName = taskName
    warning.dueTaskProgress = 35
    ensureActionLog(warning).unshift({
      type: 'due',
      title: '已推送到智能尽调',
      detail: `已生成「${taskName}」，包含触发原因、影响评估和历史预警。`,
      time,
    })
    actionCenter.value.unshift({
      id: 'A' + Date.now(),
      warningId,
      enterprise: warning.enterprise.name,
      title: warning.title,
      action: '推送尽调',
      time,
    })
    return warning
  }

  function addFocus(warningId) {
    const warning = findWarning(warningId)
    if (!warning) return null
    const time = nowLabel()
    warning.focused = true
    warning.dispositionStatus = warning.pushedToDueDiligence ? '已推送尽调 / 重点关注' : '重点关注'
    ensureActionLog(warning).unshift({
      type: 'focus',
      title: '已加入重点关注',
      detail: '系统会在后续数据刷新时优先复核该企业，并在工作台待办中提示客户经理。',
      time,
    })
    actionCenter.value.unshift({
      id: 'A' + Date.now(),
      warningId,
      enterprise: warning.enterprise.name,
      title: warning.title,
      action: '重点关注',
      time,
    })
    return warning
  }

  // 从筛客添加监控企业
  function addWatchedCompany(info) {
    // 在预警列表中新增一条记录
    const newWarning = {
      id: 'w' + Date.now(),
      type: 'enterprise',
      title: `新增监控 — ${info.name}`,
      summary: `从智能筛客转入，匹配度 ${info.match || '—'}，风险等级 ${info.risk || '—'}`,
      ruleName: '筛客自动监控',
      level: 'low',
      enterprise: { name: info.name },
      time: '刚刚',
      timeRaw: Date.now(),
      read: false,
    }
    warnings.value.unshift(newWarning)
  }

  return {
    activeTab, warningFilter, complianceFilter,
    warnings, rules,
    detailOpen, detailWarning,
    createRuleOpen, nlInput, nlParsed, nlParsing,
    quickMonitorInput, createdMonitorResult,
    queryHistory,
    actionCenter,
    kpi, filteredWarnings, complianceWarnings, runningRules, pausedRules, focusedWarnings,
    decisionQueue, aiBriefing, monitoredRules, parsedQuickMonitor,
    setActiveTab, setWarningFilter, setComplianceFilter,
    openDetail, closeDetail,
    openCreateRule, closeCreateRule,
    parseNLRules, confirmCreateRule,
    toggleRuleStatus, deleteRule,
    addWatchedCompany,
    createMonitorFromQuickInput, createManualMonitor,
    buildMonitorSuggestion, pushToDueDiligence, addFocus,
  }
})
