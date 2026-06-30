import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Mock 字段提取结果 — key 为文件 id */
const mockFields = {
  f001: [
    { label: '企业名称', value: '杭州智造装备有限公司', confidence: 98 },
    { label: '统一社会信用代码', value: '91330100MA27XXXX3X', confidence: 99 },
    { label: '法定代表人', value: '张某某', confidence: 97 },
    { label: '注册资本', value: '5000万元', confidence: 95 },
    { label: '成立日期', value: '2018-06-15', confidence: 96 },
    { label: '经营范围', value: '专用设备制造、加工、销售...', confidence: 72 },
  ],
  f002: [
    { label: '企业名称', value: '杭州智造装备有限公司', confidence: 99 },
    { label: '纳税人识别号', value: '91330100MA27XXXX3X', confidence: 99 },
    { label: '法定代表人', value: '张某某', confidence: 98 },
    { label: '营业期限', value: '2018-06-15 至 2038-06-14', confidence: 93 },
    { label: '登记机关', value: '杭州市市场监督管理局', confidence: 88 },
  ],
  f003: [
    { label: '姓名', value: '张某某', confidence: 97 },
    { label: '证件号码', value: '330106198001011234', confidence: 99 },
    { label: '住址', value: '杭州市西湖区文三路XXX号', confidence: 91 },
    { label: '签发机关', value: '杭州市公安局西湖分局', confidence: 85 },
    { label: '有效期限', value: '2020.01.01-2040.01.01', confidence: 68 },
  ],
  f004: [
    { label: '企业名称', value: '杭州智造装备有限公司', confidence: 96 },
    { label: '所属年度', value: '2025年度', confidence: 98 },
    { label: '营业收入', value: '73,900,000.00', confidence: 94 },
    { label: '应纳税额', value: '329,000.00', confidence: 92 },
    { label: '实纳税额', value: '315,600.00', confidence: 63 },
    { label: '税负率', value: '4.45%', confidence: 58 },
  ],
  f005: [
    { label: '合同编号', value: 'XS-2025-0892', confidence: 95 },
    { label: '甲方', value: '杭州智造装备有限公司', confidence: 98 },
    { label: '乙方', value: '江苏华锐机械有限公司', confidence: 96 },
    { label: '合同金额', value: '1,280,000.00', confidence: 91 },
    { label: '签订日期', value: '2025-03-20', confidence: 88 },
    { label: '付款条款', value: '预付30%，交货后付60%，质保金10%', confidence: 45 },
  ],
  f006: [
    { label: '企业名称', value: '宁波天合新材料有限公司', confidence: 97 },
    { label: '统一社会信用代码', value: '91330200MA2HXXXX8Y', confidence: 99 },
    { label: '法定代表人', value: '李某某', confidence: 96 },
    { label: '注册资本', value: '8000万元', confidence: 94 },
    { label: '成立日期', value: '2016-03-22', confidence: 95 },
  ],
  f007: [
    { label: '企业名称', value: '宁波天合新材料有限公司', confidence: 98 },
    { label: '报告编号', value: 'XYZ-2025-AUD-0156', confidence: 93 },
    { label: '审计意见', value: '标准无保留意见', confidence: 88 },
    { label: '总资产', value: '125,600,000.00', confidence: 95 },
    { label: '净资产', value: '42,300,000.00', confidence: 92 },
    { label: '营业收入', value: '98,700,000.00', confidence: 90 },
    { label: '净利润', value: '12,500,000.00', confidence: 87 },
  ],
}

/** Mock 交叉比对结果 — key 为任务 id */
const mockCrossCompare = {
  dd001: {
    consistencyChecks: [
      { label: '企业名称', status: 'match', detail: '5 份文件均为「杭州智造装备有限公司」', sources: '营业执照×2, 身份证, 纳税申报, 销售合同' },
      { label: '法定代表人', status: 'match', detail: '营业执照 = 法人身份证 = 张某某', sources: '营业执照, 身份证' },
      { label: '统一社会信用代码', status: 'match', detail: '营业执照 = 纳税申报 = 91330100MA27XXXX3X', sources: '营业执照, 纳税申报' },
      { label: '营业收入', status: 'conflict', detail: '纳税申报 739 万 vs 审计报告推算 987 万，差异 33.6%', sources: '纳税申报 vs 审计报告' },
      { label: '合同回款', status: 'warning', detail: '销售合同金额 128 万，银行流水到账仅 64 万，回款率 50%', sources: '销售合同 vs 银行流水' },
      { label: '实缴税款', status: 'warning', detail: '应纳税 32.9 万，实缴 31.56 万，欠缴 1.34 万', sources: '纳税申报' },
    ],
    businessMetrics: [
      { label: '税负率', value: '4.45%', benchmark: '行业均值 6.8%', status: 'warning', delta: '-34.6%' },
      { label: '客户集中度', value: 'CR2 = 68%', benchmark: '安全线 ≤ 50%', status: 'warning', delta: '超标' },
      { label: '应收回款率', value: '50%', benchmark: '健康线 ≥ 80%', status: 'danger', delta: '-30%' },
      { label: '注册资本实缴', value: '5000 万 / 实缴 0', benchmark: '应实缴到位', status: 'danger', delta: '未实缴' },
    ],
    aiJudgment: {
      summary: '综合已有材料，企业存在以下异常，建议在尽调中重点关注：',
      points: [
        { level: 'danger', text: '营业收入在不同材料中差异 33.6%，需核实真实营收规模' },
        { level: 'danger', text: '实缴资本为 0，资本风险较大' },
        { level: 'warning', text: '合同回款率仅 50%，需关注现金流和应收账款质量' },
        { level: 'warning', text: '税负率显著低于同行业，可能存在低报风险' },
        { level: 'info', text: '建议补充银行流水验证真实资金流向' },
      ],
    },
  },
  dd002: {
    consistencyChecks: [
      { label: '企业名称', status: 'match', detail: '营业执照与审计报告主体一致', sources: '营业执照, 审计报告' },
      { label: '统一社会信用代码', status: 'pending', detail: '审计报告未提取信用代码，待 RPA 补全', sources: '营业执照 vs 审计报告' },
      { label: '注册资本', status: 'match', detail: '营业执照 8000 万，审计报告实收资本一致', sources: '营业执照, 审计报告' },
    ],
    businessMetrics: [
      { label: '资产负债率', value: '66.3%', benchmark: '行业均值 55%', status: 'warning', delta: '+11.3%' },
      { label: '净利率', value: '12.7%', benchmark: '行业均值 8.5%', status: 'match', delta: '+4.2%' },
      { label: 'ROE', value: '29.6%', benchmark: '行业均值 12%', status: 'warning', delta: '异常偏高' },
    ],
    aiJudgment: {
      summary: '材料尚不完整（仅 2 份），以下为初步判断：',
      points: [
        { level: 'warning', text: 'ROE 29.6% 远超行业均值，需核实利润真实性' },
        { level: 'warning', text: '资产负债率 66.3% 偏高，偿债压力较大' },
        { level: 'info', text: '建议补充税票数据和银行流水后再做判断' },
      ],
    },
  },
}

export const useDocRecognitionStore = defineStore('docRecognition', () => {
  // 按任务/企业分组的文件列表
  const tasks = ref([
    {
      id: 'dd001',
      name: '杭州智造装备有限公司',
      industry: '专用设备制造',
      region: '浙江杭州',
      amount: '500万',
      files: [
        { id: 'f001', name: '营业执照.pdf', type: '营业执照', status: '已完成', size: '1.1MB', uploadedAt: '2026-06-26 10:30' },
        { id: 'f002', name: '营业执照副本.pdf', type: '营业执照', status: '已完成', size: '856KB', uploadedAt: '2026-06-26 10:31' },
        { id: 'f003', name: '法人身份证.jpg', type: '身份证', status: '待确认', size: '856KB', uploadedAt: '2026-06-26 14:15' },
        { id: 'f004', name: '2025年纳税申报表.xlsx', type: '纳税申报', status: '待确认', size: '1.8MB', uploadedAt: '2026-06-27 09:20' },
        { id: 'f005', name: '主要销售合同.pdf', type: '销售合同', status: '识别中', size: '3.2MB', uploadedAt: '2026-06-27 14:05' },
      ],
    },
    {
      id: 'dd002',
      name: '宁波天合新材料有限公司',
      industry: '新材料研发',
      region: '浙江宁波',
      amount: '800万',
      files: [
        { id: 'f006', name: '营业执照.pdf', type: '营业执照', status: '已完成', size: '980KB', uploadedAt: '2026-06-27 11:00' },
        { id: 'f007', name: '2025年度审计报告.pdf', type: '审计报告', status: '识别中', size: '4.5MB', uploadedAt: '2026-06-27 16:30' },
      ],
    },
  ])

  const currentTaskId = ref('dd001')
  const currentFileId = ref(null)
  const isUploading = ref(false)
  const statusFilter = ref('all')
  const searchQuery = ref('')
  const chatInput = ref('')
  const chatMessages = ref([])
  const isChatProcessing = ref(false)

  // 右侧面板切换：file（字段识别） / compare（交叉比对）
  const activePanel = ref('file')

  // ---- computed ----

  const stats = computed(() => {
    let pending = 0, processing = 0, done = 0
    tasks.value.forEach(t => {
      t.files.forEach(f => {
        if (f.status === '待确认') pending++
        else if (f.status === '识别中') processing++
        else if (f.status === '已完成') done++
      })
    })
    return { total: pending + processing + done, pending, processing, done }
  })

  const currentTask = computed(() =>
    tasks.value.find(t => t.id === currentTaskId.value) || null
  )

  const currentFile = computed(() => {
    if (!currentTask.value || !currentFileId.value) return null
    return currentTask.value.files.find(f => f.id === currentFileId.value) || null
  })

  const currentFileFields = computed(() => {
    if (!currentFileId.value) return []
    return mockFields[currentFileId.value] || []
  })

  const lowConfidenceFields = computed(() =>
    currentFileFields.value.filter(f => f.confidence < 70)
  )

  const filteredTasks = computed(() => {
    let list = tasks.value
    if (statusFilter.value !== 'all') {
      const map = { pending: '待确认', processing: '识别中', done: '已完成' }
      const target = map[statusFilter.value]
      list = list.filter(t => t.files.some(f => f.status === target))
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.files.some(f => f.name.toLowerCase().includes(q))
      )
    }
    return list
  })

  // 交叉比对数据
  const crossCompare = computed(() => {
    if (!currentTaskId.value) return null
    return mockCrossCompare[currentTaskId.value] || null
  })

  const conflictCount = computed(() => {
    const cc = crossCompare.value
    if (!cc) return 0
    return cc.consistencyChecks.filter(c => c.status === 'conflict').length
  })

  const warningCount = computed(() => {
    const cc = crossCompare.value
    if (!cc) return 0
    return cc.consistencyChecks.filter(c => c.status === 'warning').length +
           cc.businessMetrics.filter(m => m.status === 'warning' || m.status === 'danger').length
  })

  const judgmentCount = computed(() => {
    const cc = crossCompare.value
    if (!cc) return 0
    return cc.aiJudgment.points.filter(p => p.level === 'danger').length
  })

  // ---- actions ----

  function selectTask(taskId) {
    currentTaskId.value = taskId
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.files.length > 0) {
      currentFileId.value = task.files[0].id
    } else {
      currentFileId.value = null
    }
    // 切任务时默认回到字段面板
    activePanel.value = 'file'
  }

  function selectFile(fileId) {
    currentFileId.value = fileId
  }

  function togglePanel(panel) {
    activePanel.value = panel
  }

  function confirmField(fieldLabel, newValue) {
    const fields = mockFields[currentFileId.value]
    if (fields) {
      const field = fields.find(f => f.label === fieldLabel)
      if (field) {
        field.confidence = 100
        if (newValue !== undefined) field.value = newValue
      }
    }
  }

  function simulateUpload(fileName, fileSize) {
    isUploading.value = true
    const newId = `f${Date.now()}`
    const newFile = {
      id: newId,
      name: fileName,
      type: fileName.split('.').pop(),
      status: '识别中',
      size: fileSize || '1.2MB',
      uploadedAt: new Date().toLocaleString('zh-CN'),
    }
    const targetTask = tasks.value.find(t => t.id === currentTaskId.value) || tasks.value[0]
    targetTask.files.push(newFile)
    mockFields[newId] = [
      { label: '企业名称', value: targetTask.name, confidence: 95 },
      { label: '文档类型', value: newFile.type, confidence: 88 },
      { label: '提取内容', value: '待人工确认...', confidence: 55 },
    ]
    setTimeout(() => {
      const file = targetTask.files.find(f => f.id === newId)
      if (file) file.status = '待确认'
      isUploading.value = false
    }, 3000)
    return newId
  }

  function syncToDueDiligence(fileId) {
    for (const task of tasks.value) {
      const file = task.files.find(f => f.id === fileId)
      if (file) {
        file.status = '已完成'
        const fields = mockFields[fileId]
        if (fields) fields.forEach(f => (f.confidence = 100))
        return { success: true, taskName: task.name }
      }
    }
    return { success: false }
  }

  function addChatMessage(msg) { chatMessages.value.push(msg) }

  function sendChat() {
    const input = chatInput.value.trim()
    if (!input || isChatProcessing.value) return
    chatMessages.value.push({ role: 'user', content: input })
    chatInput.value = ''
    isChatProcessing.value = true
    setTimeout(() => {
      chatMessages.value.push({
        role: 'ai',
        content: '收到，我正在处理您的请求。在 demo 中这是预设回复。',
      })
      isChatProcessing.value = false
    }, 800)
  }

  return {
    tasks,
    currentTaskId,
    currentFileId,
    isUploading,
    statusFilter,
    searchQuery,
    chatInput,
    chatMessages,
    isChatProcessing,
    activePanel,
    stats,
    currentTask,
    currentFile,
    currentFileFields,
    lowConfidenceFields,
    filteredTasks,
    crossCompare,
    conflictCount,
    warningCount,
    judgmentCount,
    selectTask,
    selectFile,
    togglePanel,
    confirmField,
    simulateUpload,
    syncToDueDiligence,
    addChatMessage,
    sendChat,
  }
})
