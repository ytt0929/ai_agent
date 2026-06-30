/**
 * 工商风险查询 - Pinia Store
 */
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { enterprises as mockEnts } from '../data/mockBizRisk.js'

export const useBizRiskStore = defineStore('bizRisk', () => {
  // ====== 状态 ======
  const mode = ref('single') // 'single' | 'batch'
  const selectedTemplate = ref('pre-loan')

  // 单户
  const queryText = ref('')
  const currentEnterprise = ref(null)
  const riskProfile = ref(null)
  const isLoading = ref(false)
  const verificationLog = reactive([])
  const dialogueHistory = reactive([])
  const chatPanelOpen = ref(false)

  // 批量
  const batchFile = ref(null)
  const batchQueries = reactive([])      // 原始上传的企业名单
  const batchEnterprises = reactive([])  // 匹配成功的企业
  const batchUnmatched = reactive([])    // 未匹配到的企业名称
  const batchResults = reactive([])
  const batchScanId = ref(null)
  const batchScanning = ref(false)
  const selectedBatchIds = reactive(new Set())

  // 查询历史
  const queryHistory = reactive([])

  // ====== 计算 ======
  const riskLevelBadge = computed(() => {
    if (!riskProfile.value) return { level: '', color: '', text: '' }
    const map = {
      '正常级': { color: '#10b981', bg: '#ecfdf5', text: '正常' },
      '关注级': { color: '#f59e0b', bg: '#fffbeb', text: '关注' },
      '高风险': { color: '#ef4444', bg: '#fef2f2', text: '高风险' },
    }
    return map[riskProfile.value.riskLevel] || { color: '#94a3b8', bg: '#f1f5f9', text: '未知' }
  })

  const riskStats = computed(() => {
    if (!riskProfile.value) return { verify: 0, attention: 0, normal: 0 }
    return {
      verify: riskProfile.value.riskItems.filter(r => r.level === '需核实').length,
      attention: riskProfile.value.riskItems.filter(r => r.level === '关注').length,
      normal: riskProfile.value.normalItems.length,
    }
  })

  const pendingItems = computed(() => {
    if (!riskProfile.value) return []
    return riskProfile.value.riskItems.filter(r => r.status === '待核实')
  })

  const verifiedItems = computed(() => {
    return verificationLog.filter(v => v.action === 'markVerified')
  })

  const hasBatchResults = computed(() => batchScanId.value !== null && batchEnterprises.length > 0)

  // ====== 操作 ======
  function setMode(m) {
    mode.value = m
  }

  function setTemplate(t) {
    selectedTemplate.value = t
  }

  // 单户查询
  async function queryEnterprise(text) {
    isLoading.value = true
    queryText.value = text

    // 模拟查询延迟
    await new Promise(r => setTimeout(r, 1200))

    // 模糊匹配企业
    const found = mockEnts.find(e =>
      e.name.includes(text) || e.creditCode.includes(text)
    ) || mockEnts[0] // 默认返回第一家

    currentEnterprise.value = { ...found }
    riskProfile.value = {
      enterprise: {
        name: found.name,
        creditCode: found.creditCode,
        registeredCapital: found.registeredCapital,
        establishDate: found.establishDate,
        status: found.status,
      },
      riskLevel: found.riskLevel,
      riskSummary: found.riskSummary,
      riskItems: found.riskItems.map(r => ({ ...r })),
      normalItems: [...found.normalItems],
      template: selectedTemplate.value,
      generatedAt: new Date().toLocaleString('zh-CN'),
      dataSource: '国家企业信用信息公示系统',
    }

    // 记录历史
    queryHistory.unshift({
      text,
      enterprise: found.name,
      riskLevel: found.riskLevel,
      time: new Date().toLocaleString('zh-CN'),
    })

    isLoading.value = false
  }

  function markVerified(riskItemId, note) {
    const idx = riskProfile.value.riskItems.findIndex(r => r.id === riskItemId)
    if (idx >= 0) {
      riskProfile.value.riskItems[idx].status = '已核实'
    }
    verificationLog.push({
      riskItemId,
      action: 'markVerified',
      note: note || '已核实',
      verifiedAt: new Date().toLocaleString('zh-CN'),
    })
  }

  function addToDueDiligence(riskItemId) {
    const idx = riskProfile.value.riskItems.findIndex(r => r.id === riskItemId)
    if (idx >= 0) {
      riskProfile.value.riskItems[idx].status = '加入尽调'
    }
  }

  // 批量扫描
  async function startBatchScan(list) {
    batchScanning.value = true
    batchQueries.length = 0
    batchEnterprises.length = 0
    batchUnmatched.length = 0
    batchResults.length = 0
    batchScanId.value = 'SCAN-' + Date.now()
    selectedBatchIds.clear()

    // 保存原始名单
    list.forEach(name => batchQueries.push(name))

    // 模拟扫描延迟
    await new Promise(r => setTimeout(r, 2000))

    // 匹配
    list.forEach(name => {
      const found = mockEnts.find(e => e.name.includes(name) || name.includes(e.name))
      if (found) {
        batchEnterprises.push({
          name: found.name,
          creditCode: found.creditCode,
          riskLevel: found.riskLevel,
          coreRisk: found.riskItems.length > 0
            ? (found.riskItems.find(r => r.level === '需核实')?.type || found.riskItems[0]?.type)
            : '无',
        })
      } else {
        batchUnmatched.push(name)
      }
    })

    batchScanning.value = false
  }

  function toggleBatchSelection(id) {
    if (selectedBatchIds.has(id)) selectedBatchIds.delete(id)
    else selectedBatchIds.add(id)
  }

  function selectAllBatch() {
    const attentionIds = batchEnterprises
      .filter(e => e.riskLevel !== '正常级')
      .map((_, i) => i)
    attentionIds.forEach(i => selectedBatchIds.add(i))
  }

  function clearBatchSelection() {
    selectedBatchIds.clear()
  }

  function resetBatch() {
    batchQueries.length = 0
    batchEnterprises.length = 0
    batchUnmatched.length = 0
    batchResults.length = 0
    batchScanId.value = null
    batchScanning.value = false
    selectedBatchIds.clear()
  }

  function resetSingle() {
    queryText.value = ''
    currentEnterprise.value = null
    riskProfile.value = null
    verificationLog.length = 0
    dialogueHistory.length = 0
    chatPanelOpen.value = false
  }

  return {
    // 状态
    mode, selectedTemplate, queryText, currentEnterprise, riskProfile,
    isLoading, verificationLog, dialogueHistory, chatPanelOpen,
    batchFile, batchQueries, batchEnterprises, batchUnmatched, batchResults,
    batchScanId, batchScanning, selectedBatchIds, queryHistory,
    // 计算
    riskLevelBadge, riskStats, pendingItems, verifiedItems, hasBatchResults,
    // 操作
    setMode, setTemplate, queryEnterprise, markVerified, addToDueDiligence,
    startBatchScan, toggleBatchSelection, selectAllBatch, clearBatchSelection,
    resetBatch, resetSingle,
  }
})
