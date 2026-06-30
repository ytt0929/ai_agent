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

  const queryHistory = ref([])

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
    let list = warnings.value
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

  // ====== 操作 ======
  function setActiveTab(tab) { activeTab.value = tab }
  function setWarningFilter(f) { warningFilter.value = f }
  function setComplianceFilter(f) { complianceFilter.value = f }

  function openDetail(warning) {
    detailWarning.value = warning
    detailOpen.value = true
    const idx = warnings.value.findIndex(w => w.id === warning.id)
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

    const text = nlInput.value
    const parsed = { name: '新监测规则', enterprises: [], dimensions: [], notifyMethod: '站内消息' }

    // 提取企业名
    const patterns = [/盯(着|住)?([^\s，,，。]+)/g, /监控([^\s，,，。]+)/g]
    for (const p of patterns) {
      let m
      while ((m = p.exec(text)) !== null) {
        if (m[2] && m[2].length > 2) parsed.enterprises.push(m[2])
      }
    }
    if (!parsed.enterprises.length) parsed.enterprises = ['浙江XX制造有限公司']

    // 提取维度
    if (text.includes('税票') || text.includes('发票')) parsed.dimensions.push({ name: '税票波动', condition: '下降', level: 'high' })
    if (text.includes('被执行') || text.includes('司法')) parsed.dimensions.push({ name: '司法风险', condition: '新增被执行', level: 'high' })
    if (text.includes('法人')) parsed.dimensions.push({ name: '法人变更', condition: '任意变更', level: 'medium' })
    if (text.includes('工商')) parsed.dimensions.push({ name: '工商变更', condition: '任意变更', level: 'low' })
    if (!parsed.dimensions.length) {
      parsed.dimensions.push({ name: '税票波动', condition: '连续下降', level: 'high' })
      parsed.dimensions.push({ name: '司法风险', condition: '新增被执行', level: 'high' })
    }
    if (text.includes('重点')) parsed.dimensions.forEach(d => d.level = 'high')

    parsed.name = parsed.enterprises[0] + '-' + parsed.dimensions.map(d => d.name).join('/') + '监控'
    nlParsed.value = parsed
    nlParsing.value = false
  }

  function confirmCreateRule() {
    if (!nlParsed.value) return
    rules.value.unshift({
      id: 'R' + Date.now(),
      name: nlParsed.value.name,
      enterprises: [...nlParsed.value.enterprises],
      dimensions: [...nlParsed.value.dimensions],
      notifyMethod: '站内消息',
      status: 'running',
      createdAt: new Date().toISOString().slice(0, 10),
      triggerCount: 0, lastTrigger: '无', history: [],
    })
    closeCreateRule()
  }

  function toggleRuleStatus(ruleId) {
    const r = rules.value.find(r => r.id === ruleId)
    if (r) r.status = r.status === 'running' ? 'paused' : 'running'
  }

  function deleteRule(ruleId) {
    rules.value = rules.value.filter(r => r.id !== ruleId)
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
    queryHistory,
    kpi, filteredWarnings, complianceWarnings, runningRules, pausedRules,
    setActiveTab, setWarningFilter, setComplianceFilter,
    openDetail, closeDetail,
    openCreateRule, closeCreateRule,
    parseNLRules, confirmCreateRule,
    toggleRuleStatus, deleteRule,
  }
})
