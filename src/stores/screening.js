import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

export const useScreeningStore = defineStore('screening', () => {
  const queryText = ref('筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户')
  const parsedTags = reactive([])
  const progress = ref(0)
  const progressStep = ref(0) // 0:理解 1:匹配 2:生成

  const summary = reactive({ matched: 0, highMatched: 0, canTransfer: 0 })

  const customers = ref([])
  const selectedIds = reactive(new Set())
  const drawerCustomer = ref(null)
  const drawerOpen = ref(false)
  const screeningStatus = ref('idle') // 'idle' | 'running' | 'completed'

  function startScreening() {
    // Parse tags from query text
    parsedTags.length = 0
    if (queryText.value.includes('浙江') || queryText.value.includes('省')) parsedTags.push('浙江省')
    if (queryText.value.includes('制造')) parsedTags.push('制造业')
    if (queryText.value.includes('低风险')) parsedTags.push('低风险')
    if (queryText.value.includes('开票')) parsedTags.push('有开票记录')
    if (queryText.value.includes('尽调')) parsedTags.push('可转尽调')
    if (parsedTags.length === 0) {
      parsedTags.push('浙江省', '制造业', '低风险', '有开票记录', '可转尽调')
    }
  }

  function loadResults() {
    summary.matched = 50
    summary.highMatched = 18
    summary.canTransfer = 12
    customers.value = [
      { id: 'ts-wq-sm', name: '唐山物桥商贸有限公司', industry: '建材批发 / 商贸流通', region: '河北省·唐山市', revenue: '2275.98', taxLevel: 'A级', risk: '中', match: 91, transferable: '可转尽调', reason: '企业开票活跃，但存在税负率偏低、购销两头在外、开票收入与申报收入不一致等风险事项，适合进入尽调流程。', status: '可转尽调', filters: ['建材批发', '商贸流通', '中风险', '有开票记录', '可转尽调'] },
      { id: 'c001', name: '浙江恒远制造有限公司', industry: '制造业', region: '浙江省·杭州市', revenue: '82', taxLevel: 'A级', risk: '低', match: 98, transferable: '可转尽调', reason: '经营稳定，近一年开票连续，暂无重大司法风险', status: '可转尽调', filters: ['浙江省', '制造业', '低风险', '有开票记录'] },
      { id: 'c002', name: '明达精工有限公司', industry: '制造业', region: '浙江省·宁波市', revenue: '156', taxLevel: 'A级', risk: '低', match: 95, transferable: '可转尽调', reason: '制造业匹配度高，纳税信用良好，营收趋势稳定', status: '可转尽调', filters: ['浙江省', '制造业', '低风险', '有开票记录'] },
      { id: 'c003', name: '宁波天合新材料有限公司', industry: '新材料', region: '浙江省·宁波市', revenue: '120', taxLevel: 'A级', risk: '中', match: 92, transferable: '待确认', reason: '经营增长较好，但部分资料需要补充确认', status: '待确认', filters: ['浙江省', '新材料', '中风险'] },
      { id: 'c004', name: '温州精益模具有限公司', industry: '制造业', region: '浙江省·温州市', revenue: '43', taxLevel: 'B级', risk: '低', match: 88, transferable: '可监控', reason: '开票记录稳定，适合作为后续跟进客户', status: '可监控', filters: ['浙江省', '制造业', '低风险'] },
      { id: 'c005', name: '绍兴永盛纺织有限公司', industry: '纺织业', region: '浙江省·绍兴市', revenue: '67', taxLevel: 'A级', risk: '低', match: 83, transferable: '可导出', reason: '基础条件匹配，建议先导出后人工复核', status: '可导出', filters: ['浙江省', '纺织业', '低风险'] },
    ]
    // Default select first 3
    selectedIds.clear()
    customers.value.slice(0, 3).forEach(c => selectedIds.add(c.id))
  }

  function toggleSelection(id) {
    if (selectedIds.has(id)) selectedIds.delete(id)
    else selectedIds.add(id)
  }

  function openDrawer(customer) {
    drawerCustomer.value = customer
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  // Demo: 批量设置客户列表
  function setCustomers(list) {
    customers.value = list
    screeningStatus.value = 'completed'
  }

  // Demo: 选中/取消选中客户
  function selectCustomer(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id)
    } else {
      selectedIds.add(id)
    }
  }

  // Demo: 当前选中的客户（第一个）
  const currentCustomer = computed(() => {
    if (selectedIds.size === 0) return null
    const firstId = [...selectedIds][0]
    return customers.value.find(c => c.id === firstId) || null
  })

  return {
    queryText, parsedTags, progress, progressStep,
    summary, customers, selectedIds,
    drawerCustomer, drawerOpen,
    startScreening, loadResults, toggleSelection, openDrawer, closeDrawer,
    screeningStatus, setCustomers, selectCustomer, currentCustomer,
  }
})
