import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dueDiligenceTasks as initialTasks, steps as stepsDef } from '../data/mockDueDiligence.js'

export const useDueDiligenceStore = defineStore('dueDiligence', () => {
  // 任务列表
  const tasks = ref(JSON.parse(JSON.stringify(initialTasks)))

  // 当前选中的任务
  const currentTask = ref(null)

  // 当前步骤 key — 默认工商核验
  const currentStepKey = ref('verify-business')

  // 每个任务的步骤状态 { taskId: { stepKey: 'pending' | 'active' | 'done' | 'skipped' } }
  const stepStates = ref({})

  // 上传文件列表（每个任务独立）
  const uploadedFiles = ref({})

  // 对话消息（每个任务+步骤独立）
  const chatMessages = ref({})

  // 任务级对话消息（跨阶段连续，taskId 为 key）
  const taskChatMessages = ref({})

  // 用户输入
  const chatInput = ref('')

  // 计算统计
  const stats = computed(() => {
    return {
      inProgress: tasks.value.filter(t => t.status === '进行中').length,
      waiting: tasks.value.filter(t => t.status === '等待客户').length,
      pending: tasks.value.filter(t => t.status === '待确认').length,
      completed: tasks.value.filter(t => t.status === '已完成').length,
      todayNew: tasks.value.filter(t => {
        if (!t.updatedAt) return false
        const today = new Date().toISOString().slice(0, 10)
        return t.updatedAt.startsWith(today)
      }).length,
    }
  })

  // 获取当前任务对象
  const currentTaskObj = computed(() => {
    return tasks.value.find(t => t.id === currentTask.value) || null
  })

  // 获取当前步骤索引
  const currentStepIndex = computed(() => {
    return stepsDef.findIndex(s => s.key === currentStepKey.value)
  })

  // 获取某步骤状态
  function getStepState(taskId, stepKey) {
    if (!stepStates.value[taskId]) return 'pending'
    return stepStates.value[taskId][stepKey] || 'pending'
  }

  // 初始化任务步骤状态
  function initTaskSteps(taskId) {
    if (stepStates.value[taskId]) return
    const initStates = {}
    stepsDef.forEach((s, idx) => {
      const task = tasks.value.find(t => t.id === taskId)
      const taskStepIdx = stepsDef.findIndex(st => st.key === task?.currentStep)
      if (idx < taskStepIdx) initStates[s.key] = 'done'
      else if (idx === taskStepIdx) initStates[s.key] = 'active'
      else initStates[s.key] = 'pending'
    })
    stepStates.value[taskId] = initStates
  }

  // 选择任务
  function selectTask(taskId) {
    currentTask.value = taskId
    initTaskSteps(taskId)
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      currentStepKey.value = task.currentStep
    }
  }

  // 切换步骤
  function goToStep(stepKey) {
    currentStepKey.value = stepKey
  }

  // 推进到下一步
  function advanceStep() {
    const idx = stepsDef.findIndex(s => s.key === currentStepKey.value)
    if (idx < stepsDef.length - 1) {
      if (stepStates.value[currentTask.value]) {
        stepStates.value[currentTask.value][currentStepKey.value] = 'done'
      }
      const nextStep = stepsDef[idx + 1]
      currentStepKey.value = nextStep.key
      if (stepStates.value[currentTask.value]) {
        stepStates.value[currentTask.value][nextStep.key] = 'active'
      }
      const task = tasks.value.find(t => t.id === currentTask.value)
      if (task) {
        task.currentStep = nextStep.key
        task.progress = Math.min(100, Math.round(((idx + 1) / stepsDef.length) * 100))
      }
    }
  }

  function nowTime() {
    return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  }

  // 任务级消息操作
  function getTaskChatMessages(taskId) {
    return taskChatMessages.value[taskId] || []
  }

  function addTaskChatMessage(taskId, msg) {
    if (!taskChatMessages.value[taskId]) {
      taskChatMessages.value[taskId] = []
    }
    taskChatMessages.value[taskId].push(msg)
  }

  function clearTaskChatMessages(taskId) {
    taskChatMessages.value[taskId] = []
  }

  // 添加对话消息
  function addChatMessage(msg) {
    const key = `${currentTask.value}-${currentStepKey.value}`
    if (!chatMessages.value[key]) {
      chatMessages.value[key] = []
    }
    chatMessages.value[key].push(msg)
  }

  // 添加文件
  function addFile(taskId, file) {
    if (!uploadedFiles.value[taskId]) {
      uploadedFiles.value[taskId] = []
    }
    uploadedFiles.value[taskId].push(file)
  }

  // 从筛客结果创建尽调任务
  function createTaskFromScreening(customer) {
    const id = 'dd-screen-' + Date.now()
    const task = {
      id,
      name: customer.name,
      creditCode: '',
      industry: '待确认',
      region: '待确认',
      amount: '待评估',
      manager: '张经理',
      priority: '普通',
      templateName: '尽职调查报告',
      source: '筛客转入',
      status: '进行中',
      statusText: '工商核验',
      currentStage: 'verify-business',
      currentStep: 'verify-business',
      progress: 14,
      riskLevel: '待评估',
      score: 0,
      grade: '—',
      materialCompleteness: 0,
      nextAction: '继续处理',
      updatedAt: new Date().toLocaleString('zh-CN'),
      reportDraftId: '',
    }
    tasks.value.unshift(task)
    initTaskSteps(id)
    return task
  }

  // 从企业探查结果创建尽调任务
  function createTaskFromEnterpriseExploration(payload) {
    const id = 'dd-exp-' + Date.now()
    const missing = payload.missingData || []
    const task = {
      id,
      name: payload.name,
      creditCode: payload.creditCode || '',
      industry: payload.industry || '待确认',
      region: payload.region || '待确认',
      amount: payload.amount || '待评估',
      manager: '张经理',
      priority: '普通',
      templateName: '尽职调查报告',
      source: '企业探查',
      status: missing.length ? '等待客户' : '进行中',
      statusText: missing.length ? '资料补充' : 'AI处理中',
      currentStage: missing.length ? 'materials' : 'risk',
      currentStep: missing.length ? 'materials' : 'risk',
      progress: missing.length ? 55 : 68,
      riskLevel: '待评估',
      score: payload.score || 0,
      grade: payload.grade || '—',
      materialCompleteness: 0,
      nextAction: missing.length ? '补充资料' : '查看风险诊断',
      updatedAt: new Date().toLocaleString('zh-CN'),
      reportDraftId: '',
    }
    tasks.value.unshift(task)
    initTaskSteps(id)
    return task
  }

  // 手动创建尽调任务
  function createManualTask(payload) {
    // 检查是否已有同名企业
    const existing = tasks.value.find(t => t.name === payload.name)
    if (existing) {
      return { existing: true, task: existing }
    }
    const id = 'dd-manual-' + Date.now()
    const task = {
      id,
      name: payload.name,
      creditCode: payload.creditCode || '',
      industry: payload.industry || '待确认',
      region: payload.region || '待确认',
      amount: payload.amount || '待评估',
      manager: payload.manager || '张经理',
      priority: payload.priority || '普通',
      templateName: payload.templateName || '尽职调查报告',
      source: '本页创建',
      status: '进行中',
      statusText: '工商核验',
      currentStage: 'verify-business',
      riskLevel: '待评估',
      score: 0,
      grade: '—',
      materialCompleteness: 0,
      nextAction: '继续处理',
      updatedAt: new Date().toLocaleString('zh-CN'),
      reportDraftId: '',
    }
    tasks.value.unshift(task)
    initTaskSteps(id)
    return { created: true, task }
  }

  // 更新任务阶段
  function updateTaskStage(taskId, stageKey) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    const idx = stepsDef.findIndex(s => s.key === stageKey)
    if (idx < 0) return
    const progress = (idx + 1) / stepsDef.length * 100
    task.currentStep = stageKey
    task.currentStage = stageKey
    task.progress = Math.min(100, Math.round(progress))
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 税票授权
  function markTaxAuthorized(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.currentStep = 'materials'
    task.currentStage = 'materials'
    task.progress = 57
    task.status = '进行中'
    task.statusText = '资料补充'
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 资料上传完成
  function markMaterialsUploaded(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.materialCompleteness = 86
    task.currentStep = 'evidence'
    task.currentStage = 'evidence'
    task.progress = 71
    task.status = '进行中'
    task.statusText = '证据整合'
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 进入证据整合
  function enterEvidence(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.currentStep = 'evidence'
    task.currentStage = 'evidence'
    task.progress = 71
    task.status = '进行中'
    task.statusText = '证据整合'
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 进入风险诊断
  function enterRisk(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.currentStep = 'risk'
    task.currentStage = 'risk'
    task.progress = 86
    task.status = '进行中'
    task.statusText = '风险诊断'
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 进入产物确认
  function enterArtifacts(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.currentStep = 'artifacts'
    task.currentStage = 'artifacts'
    task.progress = 100
    task.status = '待确认'
    task.statusText = '报告待确认'
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 进入交付包下载
  function enterDeliveryPackage(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.currentStep = 'delivery-package'
    task.currentStage = 'delivery-package'
    task.progress = 100
    task.status = '已完成'
    task.statusText = '交付包已生成'
    task.deliveryPackageStatus = '已生成'
    task.deliveryPackageName = task.name + '_尽调交付包_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.zip'
    task.deliveryPackageGeneratedAt = new Date().toLocaleString('zh-CN')
    task.deliveryPackageDownloaded = false
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // 标记交付包已下载
  function markDeliveryPackageDownloaded(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.deliveryPackageDownloaded = true
    task.deliveryPackageDownloadedAt = new Date().toLocaleString('zh-CN')
  }

  // 标记报告已导出
  function markReportExported(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.reportDraftId = 'RPT-' + taskId
    task.updatedAt = new Date().toLocaleString('zh-CN')
  }

  // chip 操作反馈
  function handleChipAction(chip, stepKey) {
    const actionMessages = {
      '生成客户材料清单': { toast: '客户材料清单已生成', ai: '已根据尽调类型和企业信息生成材料清单，可通过链接发送给客户。' },
      '说明流程': { toast: '流程说明已发送', ai: '智能尽调包含7个步骤：发起尽调→主体核验→税票RPA→资料补充→证据整合→风险诊断→产物确认。全程自动化推进。' },
      '保存草稿': { toast: '草稿已保存', ai: '草稿已保存，下次进入可从当前步骤继续。' },
      '复制授权链接': { toast: '授权链接已复制到剪贴板', ai: '授权链接已复制，可通过微信或邮件发送给客户。' },
      '发送提醒': { toast: '已发送客户提醒', ai: '提醒已发送，下次提醒时间为明天 09:00。' },
      '改为上传材料': { toast: '已切换到上传模式', ai: '好的，已切换到手动上传模式。您可以直接上传税票相关文件。' },
      '上传文件': { toast: '请选择文件', ai: '支持 PDF / Word / Excel / 图片格式，选择文件后会自动识别。' },
      '发送补充链接': { toast: '补充链接已生成', ai: '补充链接已生成，可发送给客户直接上传所需资料。' },
      '开始识别': { toast: '正在识别文件内容...', ai: '文件识别中，完成后会自动写入证据链。' },
      '查看证据详情': { toast: '正在加载证据详情', ai: '证据包包含31条有效证据，覆盖工商、税票、合同、财务等维度。' },
      '进入风险诊断': { toast: '正在进入风险诊断', ai: '现在开始风险诊断，系统会自动分析所有证据并生成风险摘要。' },
      '查看风险详情': { toast: '正在加载风险详情', ai: '共识别8项风险，其中2项高风险需重点关注。' },
      '进入产物确认': { toast: '正在进入产物确认', ai: '尽调产物已全部生成，请确认3处待确认结论。' },
      '进入智能报告': { toast: '正在打开智能报告', ai: '正在打开报告编辑器，您可以调整结论表述和格式。' },
      '导出产物包': { toast: '产物包已生成并开始下载', ai: '产物包包含证据包、风险摘要、报告草稿和补充清单，已打包下载。' },
      '提交确认': { toast: '尽调报告已提交确认', ai: '报告已提交，等待审批流程。所有产物已归档。' },
    }
    const action = actionMessages[chip] || { toast: `操作"${chip}"已完成`, ai: '操作已完成。' }
    return action
  }

  // 从工作台创建/复用尽调任务（Phase 3-C）
  function createOrReuseTaskFromWorkbench(payload) {
    const { enterpriseName, creditCode, templateName } = payload

    // 按企业名称或信用代码查找已有任务
    const existing = tasks.value.find(t =>
      (creditCode && t.creditCode === creditCode) ||
      (enterpriseName && t.name === enterpriseName)
    )

    if (existing) {
      return { task: existing, reused: true }
    }

    const taskId = 'dd-' + Date.now()
    const task = {
      id: taskId,
      name: enterpriseName || '新尽调任务',
      creditCode: creditCode || '',
      industry: payload.industry || '—',
      region: payload.region || '—',
      amount: payload.registeredCapital || '—',
      source: payload.source || '工作台AI',
      templateName: templateName || '尽职调查报告',
      currentStep: 'tax-rpa',
      currentStage: '税票采集',
      statusText: '税票采集 / 待授权',
      status: '等待客户',
      progress: 43,
      score: 72,
      grade: 'C+',
      riskLevel: '中风险',
      materialCompleteness: 67,
      manager: '当前用户',
      reportDraftId: '',
      updatedAt: new Date().toLocaleString('zh-CN'),
    }
    tasks.value.push(task)
    return { task, reused: false }
  }
  return {
    tasks,
    currentTask,
    currentStepKey,
    stepStates,
    uploadedFiles,
    chatMessages,
    chatInput,
    stats,
    currentTaskObj,
    currentStepIndex,
    getStepState,
    initTaskSteps,
    selectTask,
    goToStep,
    advanceStep,
    updateTaskStage,
    markTaxAuthorized,
    markMaterialsUploaded,
    enterEvidence,
    enterRisk,
    enterArtifacts,
    enterDeliveryPackage,
    markDeliveryPackageDownloaded,
    markReportExported,
    taskChatMessages,
    getTaskChatMessages,
    addTaskChatMessage,
    clearTaskChatMessages,
    nowTime,
    addChatMessage,
    addFile,
    createTaskFromScreening,
    createTaskFromEnterpriseExploration,
    createOrReuseTaskFromWorkbench,
    createManualTask,
    handleChipAction,
  }
})
