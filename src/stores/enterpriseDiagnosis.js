/**
 * 企业诊断 - Pinia Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enterpriseDB, getDiagnosisMock } from '../data/mockEnterpriseDiagnosis.js'

export const useDiagnosisStore = defineStore('diagnosis', () => {
  // ====== 状态 ======
  const inputText = ref('')
  const isSearching = ref(false)
  const searchResults = ref([])
  const selectedEnterprise = ref(null)

  // 诊断结果
  const diagnosisResult = ref(null)
  const isDiagnosing = ref(false)
  const diagnosisHistory = ref([])

  // ChatOps 对话
  const chatMessages = ref([])
  const chatInput = ref('')
  const isChatProcessing = ref(false)

  // 深度分析面板
  const activeDimension = ref(null)
  const expandedItems = ref({})

  // 报告工作台：指标过滤
  const indicatorTab = ref('risk') // 'risk' | 'highlight' | 'all'
  const indicatorDimensionFilter = ref('all')
  const evidenceDrawerOpen = ref(false)
  const selectedIndicator = ref(null)
  const operationLog = ref([])

  // ====== 计算 ======
  const riskLevelLabel = computed(() => {
    if (!diagnosisResult.value) return ''
    const { riskLevel } = diagnosisResult.value
    return { high: '红色预警', medium: '橙色关注', low: '蓝色正常' }[riskLevel] || ''
  })

  const riskLevelClass = computed(() => {
    if (!diagnosisResult.value) return ''
    return `risk-${diagnosisResult.value.riskLevel}`
  })

  // ====== 操作 ======

  // 搜索企业（模拟模糊搜索）
  function searchEnterprise(text) {
    if (!text || text.length < 2) {
      searchResults.value = []
      return
    }
    searchResults.value = enterpriseDB.filter(e =>
      e.creditCode.includes(text) || e.name.includes(text)
    )
  }

  // 选择企业
  function selectEnterprise(ent) {
    selectedEnterprise.value = ent
    searchResults.value = []
    inputText.value = `${ent.name} (${ent.creditCode})`
  }

  // 开始诊断
  async function startDiagnosis() {
    if (!selectedEnterprise.value) return

    isDiagnosing.value = true
    activeDimension.value = null
    expandedItems.value = {}
    chatMessages.value = []

    // 模拟延迟
    await new Promise(r => setTimeout(r, 2000))

    const result = getDiagnosisMock(selectedEnterprise.value.creditCode)
    if (result) {
      diagnosisResult.value = result
      diagnosisHistory.value.unshift({
        time: new Date().toLocaleString('zh-CN'),
        enterprise: result.enterprise.name,
        riskLevel: result.riskLevel,
        score: result.score,
      })
      // 初始化欢迎消息
      chatMessages.value.push({
        role: 'ai',
        text: `已完成对 **${result.enterprise.name}** 的快速诊断。综合风险评分 **${result.score}/100**，建议：${result.summary}`,
      })
    }

    isDiagnosing.value = false
  }

  // 切换维度：选中则设置 active + filter，再点同一维度则取消
  function toggleDimension(key) {
    if (activeDimension.value === key) {
      activeDimension.value = null
      indicatorDimensionFilter.value = 'all'
    } else {
      activeDimension.value = key
      indicatorDimensionFilter.value = key
    }
  }

  // 设置指标 tab
  function setIndicatorTab(tab) {
    indicatorTab.value = tab
  }

  // 查看证据链
  function viewEvidence(indicator) {
    selectedIndicator.value = indicator
    activeDimension.value = indicator.dimensionKey
    indicatorDimensionFilter.value = indicator.dimensionKey
    evidenceDrawerOpen.value = true
  }

  // 选中指标行（设置上下文）
  function selectIndicator(indicator) {
    selectedIndicator.value = indicator
    activeDimension.value = indicator.dimensionKey
    indicatorDimensionFilter.value = indicator.dimensionKey
  }

  // 操作反馈
  function logOperation(action, detail) {
    operationLog.value.push({ action, detail, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) })
  }

  // ChatOps 对话处理
  async function sendChatMessage() {
    const text = chatInput.value.trim()
    if (!text || !diagnosisResult.value) return

    chatMessages.value.push({ role: 'user', text })
    chatInput.value = ''
    isChatProcessing.value = true

    // 模拟 AI 回复
    await new Promise(r => setTimeout(r, 1200))

    const reply = generateChatReply(text, diagnosisResult.value)
    chatMessages.value.push({ role: 'ai', text: reply })
    isChatProcessing.value = false
  }

  // 重置
  function reset() {
    inputText.value = ''
    searchResults.value = []
    selectedEnterprise.value = null
    diagnosisResult.value = null
    chatMessages.value = []
    activeDimension.value = null
  }

  return {
    inputText, isSearching, searchResults,
    selectedEnterprise,
    diagnosisResult, isDiagnosing, diagnosisHistory,
    chatMessages, chatInput, isChatProcessing,
    activeDimension, expandedItems,
    indicatorTab, indicatorDimensionFilter,
    evidenceDrawerOpen, selectedIndicator,
    operationLog,
    riskLevelLabel, riskLevelClass,
    searchEnterprise, selectEnterprise,
    startDiagnosis, toggleDimension,
    setIndicatorTab, viewEvidence,
    selectIndicator,
    logOperation,
    sendChatMessage, reset,
  }
})

// 模拟 ChatOps 回复生成
function generateChatReply(input, result) {
  const lower = input.toLowerCase()

  if (result.allIndicators && result.allIndicators.length) {
    if (lower.includes('税票') || lower.includes('发票') || lower.includes('税负')) {
      const items = result.allIndicators.filter(i => i.dimensionKey === 'tax')
      return `**税务维度指标：**\n${items.map(i => `· ${i.name}（${i.level === 'high' ? '高风险' : i.level === 'medium' ? '中风险' : '低风险'}）：${i.fact}`).join('\n')}`
    }
    if (lower.includes('司法') || lower.includes('被执行') || lower.includes('失信')) {
      const items = result.allIndicators.filter(i => i.dimensionKey === 'judicial')
      return items.length ? `**司法维度：**\n${items.map(i => `· ${i.name}：${i.fact}`).join('\n')}` : '司法记录清白，无风险项。'
    }
    if (lower.includes('证据') || lower.includes('证据链')) {
      return `该企业共有 ${Object.keys(result.evidenceChain || {}).length} 条证据记录。点击任意指标的「查看证据链」可查看详情。`
    }
    if (lower.includes('报告')) {
      return `当前报告草稿状态：${result.reportDraft?.status || 'draft'}，已纳入 ${result.reportDraft?.includedConclusions?.length || 0} 条结论，${result.reportDraft?.pendingConfirmations || 0} 条待确认。`
    }
  }

  if (lower.includes('解释') && lower.includes('扣分原因')) {
    const name = input.replace(/解释|扣分原因|的/g, '').trim()
    const ind = result.allIndicators?.find(i => i.name.includes(name) || name.includes(i.name))
    if (ind) {
      return `**${ind.name} 扣分原因**\n\n· 所属维度：${ind.dimensionName}\n· 风险等级：${ind.level === 'high' ? '高风险' : ind.level === 'medium' ? '中风险' : '低风险'}\n· 事实依据：${ind.fact}\n\n该指标在同类企业中处于显著偏离水平，建议重点关注并核实数据真实性。`
    }
    return `**扣分原因分析**\n\n当前未选中具体指标。请先在风险列表或八大维度中点击一个具体指标，我将为您生成详细的扣分原因分析。`
  }
  if (lower.includes('生成') && lower.includes('专项说明')) {
    const name = input.replace(/生成|专项说明/g, '').trim()
    return `**${name} 专项说明**\n\n经核查，该企业在${name}相关指标上存在以下情况：\n\n1. 数据来源：基于近12个月税务、发票及经营数据分析\n2. 风险等级：需结合企业实际情况综合判断\n3. 建议措施：建议要求企业提供补充说明材料，并在授信审批时纳入风险溢价考量\n\n本说明仅供参考，最终结论请以实地尽调为准。`
  }
  if (lower.includes('加入报告')) {
    return `已将相关分析内容加入报告草稿。您可以在「推送尽调」中查看和编辑报告草稿内容。`
  }
  if (lower.includes('建议') || lower.includes('结论')) {
    return `**综合建议：**\n${result.suggestions.map(s => `· ${s.text}`).join('\n')}`
  }
  if (lower.includes('总结') || lower.includes('概况')) {
    return `**${result.enterprise.name} 诊断总结：**\n· 综合评分：${result.score}\n· 风险项：${result.riskItems?.length || 0}（高风险 ${(result.riskItems || []).filter(i => i.level === 'high').length}）\n· 亮点项：${result.highlightItems?.length || 0}\n· 证据链：${Object.keys(result.evidenceChain || {}).length} 条`
  }
  return `收到：「${input}」\n\n我可以帮你：\n· **解释扣分原因**\n· **查看证据链**\n· **生成专项说明**\n· **加入报告**`
}
