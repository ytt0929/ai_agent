import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaxRpaStore = defineStore('taxRpa', () => {
  // 授权任务列表
  const tasks = ref([
    {
      id: 'rpa-ts-wq',
      enterprise: '唐山物桥商贸有限公司',
      creditCode: '91130203MA7EEQ2N0T',
      status: '授权中',
      authUrl: 'https://ai-copilot.demo/auth/rpa-ts-wq',
      qrCode: null,
      createdAt: '2026-07-02 08:15',
      authExpireAt: '2026-07-03 08:15',
      authedAt: null,
      collectedCount: 0,
      totalCount: 12,
      lastReminderAt: null,
      nextReminderAt: '2026-07-03 08:15',
      remindCount: 0,
    },
    {
      id: 'rpa001',
      enterprise: '杭州智造科技有限公司',
      creditCode: '91330100MA27XXXX3X',
      status: '授权中', // 授权中 | 已授权 | 已过期 | 采集中 | 已完成
      authUrl: 'https://ai-copilot.demo/auth/rpa001',
      qrCode: null, // will be generated
      createdAt: '2026-06-25 14:30',
      authExpireAt: '2026-06-26 14:30',
      authedAt: null,
      collectedCount: 0,
      totalCount: 12,
      lastReminderAt: '2026-06-26 09:00',
      nextReminderAt: '2026-06-27 09:00',
      remindCount: 2,
    },
    {
      id: 'rpa002',
      enterprise: '宁波天合新材料股份有限公司',
      creditCode: '91330200MA2HXXXX8Y',
      status: '已授权',
      authUrl: 'https://ai-copilot.demo/auth/rpa002',
      qrCode: null,
      createdAt: '2026-06-24 10:15',
      authExpireAt: '2026-06-25 10:15',
      authedAt: '2026-06-24 16:42',
      collectedCount: 8,
      totalCount: 12,
      lastReminderAt: null,
      nextReminderAt: null,
      remindCount: 0,
    },
    {
      id: 'rpa003',
      enterprise: '温州瑞达机械制造有限公司',
      creditCode: '91330300MA29XXXX1Z',
      status: '已完成',
      authUrl: 'https://ai-copilot.demo/auth/rpa003',
      qrCode: null,
      createdAt: '2026-06-20 09:00',
      authExpireAt: '2026-06-21 09:00',
      authedAt: '2026-06-20 11:23',
      collectedCount: 12,
      totalCount: 12,
      lastReminderAt: null,
      nextReminderAt: null,
      remindCount: 0,
    },
    {
      id: 'rpa004',
      enterprise: '嘉兴恒力纺织有限公司',
      creditCode: '91330400MA2AXXXX5W',
      status: '已过期',
      authUrl: 'https://ai-copilot.demo/auth/rpa004',
      qrCode: null,
      createdAt: '2026-06-18 15:00',
      authExpireAt: '2026-06-19 15:00',
      authedAt: null,
      collectedCount: 0,
      totalCount: 12,
      lastReminderAt: '2026-06-19 09:00',
      nextReminderAt: null,
      remindCount: 3,
    },
  ])

  // 当前选中任务
  const currentTaskId = ref('rpa001')

  // 筛选
  const statusFilter = ref('all')

  // 搜索
  const searchQuery = ref('')

  // 分享弹窗
  const shareDialogOpen = ref(false)

  // 新建任务弹窗
  const createDialogOpen = ref(false)
  const newEnterpriseName = ref('')
  const newCreditCode = ref('')

  // 新建企业选项（从尽调任务来）
  const enterpriseOptions = ref([
    { name: '唐山物桥商贸有限公司', creditCode: '91130203MA7EEQ2N0T' },
    { name: '杭州智造科技有限公司', creditCode: '91330100MA27XXXX3X' },
    { name: '宁波天合新材料股份有限公司', creditCode: '91330200MA2HXXXX8Y' },
    { name: '温州瑞达机械制造有限公司', creditCode: '91330300MA29XXXX1Z' },
    { name: '嘉兴恒力纺织有限公司', creditCode: '91330400MA2AXXXX5W' },
    { name: '绍兴金轮精密工业有限公司', creditCode: '91330600MA2BXXXX2V' },
  ])

  const currentTask = computed(() => {
    return tasks.value.find(t => t.id === currentTaskId.value) || null
  })

  const filteredTasks = computed(() => {
    let list = tasks.value
    if (statusFilter.value !== 'all') {
      list = list.filter(t => t.status === statusFilter.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(t =>
        t.enterprise.toLowerCase().includes(q) ||
        t.creditCode.toLowerCase().includes(q)
      )
    }
    return list
  })

  const stats = computed(() => ({
    authing: tasks.value.filter(t => t.status === '授权中').length,
    authed: tasks.value.filter(t => t.status === '已授权').length,
    collecting: tasks.value.filter(t => t.status === '采集中').length,
    done: tasks.value.filter(t => t.status === '已完成').length,
    expired: tasks.value.filter(t => t.status === '已过期').length,
  }))

  const statusChips = [
    { key: 'all', label: '全部' },
    { key: '授权中', label: '授权中' },
    { key: '已授权', label: '已授权' },
    { key: '采集中', label: '采集中' },
    { key: '已完成', label: '已完成' },
    { key: '已过期', label: '已过期' },
  ]

  function selectTask(id) {
    currentTaskId.value = id
  }

  function generateAuthUrl(enterprise) {
    const id = 'rpa' + String(tasks.value.length + 1).padStart(3, '0')
    return {
      id,
      authUrl: `https://ai-copilot.demo/auth/${id}`,
    }
  }

  function createTask(enterpriseName, creditCode) {
    const info = generateAuthUrl(enterpriseName)
    const now = new Date()
    const expire = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const task = {
      id: info.id,
      enterprise: enterpriseName,
      creditCode: creditCode || '',
      status: '授权中',
      authUrl: info.authUrl,
      qrCode: null,
      createdAt: formatTime(now),
      authExpireAt: formatTime(expire),
      authedAt: null,
      collectedCount: 0,
      totalCount: 12,
      lastReminderAt: null,
      nextReminderAt: formatTime(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
      remindCount: 0,
    }
    tasks.value.unshift(task)
    currentTaskId.value = task.id
    return task
  }

  function resendAuth() {
    if (!currentTask.value) return
    currentTask.value.lastReminderAt = formatTime(new Date())
    currentTask.value.remindCount++
    const next = new Date(Date.now() + 24 * 60 * 60 * 1000)
    currentTask.value.nextReminderAt = formatTime(next)
  }

  function regenerateAuth() {
    if (!currentTask.value) return
    const now = new Date()
    const expire = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const next = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    currentTask.value.status = '授权中'
    currentTask.value.authExpireAt = formatTime(expire)
    currentTask.value.authedAt = null
    currentTask.value.collectedCount = 0
    currentTask.value.lastReminderAt = null
    currentTask.value.nextReminderAt = formatTime(next)
    currentTask.value.remindCount = 0
  }

  function openShare() {
    shareDialogOpen.value = true
  }

  function closeShare() {
    shareDialogOpen.value = false
  }

  function openCreate() {
    createDialogOpen.value = true
    newEnterpriseName.value = ''
    newCreditCode.value = ''
  }

  function closeCreate() {
    createDialogOpen.value = false
  }

  function formatTime(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
  }

  return {
    tasks,
    currentTaskId,
    currentTask,
    statusFilter,
    searchQuery,
    filteredTasks,
    stats,
    statusChips,
    shareDialogOpen,
    createDialogOpen,
    newEnterpriseName,
    newCreditCode,
    enterpriseOptions,
    selectTask,
    createTask,
    resendAuth,
    regenerateAuth,
    openShare,
    closeShare,
    openCreate,
    closeCreate,
  }
})
