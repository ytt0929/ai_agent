/**
 * 智能报告 - Pinia Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reportTemplates, dataSources, reportHistory, getReportContent } from '../data/mockSmartReport.js'

export const useSmartReportStore = defineStore('smartReport', () => {
  const activeTab = ref('list')
  const selectedTemplate = ref(null)
  const selectedEnterprise = ref(null)
  const selectedDataSources = ref([])
  const isGenerating = ref(false)
  const currentReport = ref(null)
  const editingSectionId = ref(null)
  const sectionEditInput = ref('')
  const chatMessages = ref([])
  const chatInput = ref('')
  const isChatProcessing = ref(false)
  const templates = ref(JSON.parse(JSON.stringify(reportTemplates)))
  const sources = ref(JSON.parse(JSON.stringify(dataSources)))
  const history = ref(JSON.parse(JSON.stringify(reportHistory)))
  const enterpriseInput = ref('')
  const enterpriseResults = ref([])

  const availableSources = computed(() => {
    return sources.value.filter(s => s.status !== 'missing')
  })

  function openCreate() {
    activeTab.value = 'create'
    selectedTemplate.value = null
    selectedEnterprise.value = null
    selectedDataSources.value = []
    enterpriseInput.value = ''
    enterpriseResults.value = []
  }

  function selectTemplate(t) {
    selectedTemplate.value = t
  }

  function toggleDataSource(id) {
    const arr = selectedDataSources.value
    const idx = arr.indexOf(id)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(id)
  }

  function buildSections(content) {
    return content.sections.map(s => ({
      id: s.id,
      title: s.title,
      content: s.content,
      originalContent: s.content,
      modifiedContent: null,
      dataItems: s.dataItems || [],
      isEditable: true,
    }))
  }

  async function generateReport() {
    if (!selectedTemplate.value || !selectedEnterprise.value) return
    isGenerating.value = true
    await new Promise(r => setTimeout(r, 2500))
    const content = getReportContent(selectedTemplate.value.id, selectedEnterprise.value)
    currentReport.value = {
      id: 'RPT' + Date.now(),
      name: selectedEnterprise.value.name + ' - ' + selectedTemplate.value.name,
      template: selectedTemplate.value.name,
      enterprise: selectedEnterprise.value.name,
      createdAt: new Date().toLocaleString('zh-CN'),
      status: 'draft',
      sections: buildSections(content),
    }
    const aiText = '已生成 **' + currentReport.value.name + '** 初稿，共 ' + currentReport.value.sections.length + ' 个章节。你可以：' + '\n\n· 点击章节左侧的 ✏️ 直接编辑' + '\n· 在这里用自然语言告诉我怎么改，比如把风险分析展开、语气更正式一点'
    chatMessages.value = [{ role: 'ai', text: aiText }]
    activeTab.value = 'editor'
    isGenerating.value = false
  }

  function openReport(rpt) {
    let tplId = 'panoramic'
    if (rpt.template === '尽调报告') tplId = 'due_diligence'
    else if (rpt.template === '诊断报告') tplId = 'diagnosis'
    const content = getReportContent(tplId, { name: rpt.enterprise })
    currentReport.value = {
      id: rpt.id,
      name: rpt.name,
      template: rpt.template,
      enterprise: rpt.enterprise,
      createdAt: rpt.createdAt,
      status: rpt.status,
      sections: buildSections(content),
    }
    chatMessages.value = [{
      role: 'ai',
      text: '已打开 **' + rpt.name + '**。你可以继续用对话方式修改报告内容。',
    }]
    activeTab.value = 'editor'
  }

  function startEditSection(sectionId) {
    editingSectionId.value = sectionId
    const sec = currentReport.value.sections.find(s => s.id === sectionId)
    if (sec) sectionEditInput.value = sec.modifiedContent || sec.content
  }

  function saveEditSection() {
    const sid = editingSectionId.value
    const sec = currentReport.value.sections.find(s => s.id === sid)
    if (sec && sectionEditInput.value && sectionEditInput.value.trim()) {
      sec.modifiedContent = sectionEditInput.value
    }
    editingSectionId.value = null
    sectionEditInput.value = ''
  }

  async function sendChatMessage() {
    const text = chatInput.value
    if (!text || !text.trim() || !currentReport.value) return
    chatMessages.value.push({ role: 'user', text: text })
    chatInput.value = ''
    isChatProcessing.value = true
    await new Promise(r => setTimeout(r, 1500))
    const reply = processChatCommand(text, currentReport.value)
    chatMessages.value.push({ role: 'ai', text: reply })
    isChatProcessing.value = false
  }

  function backToList() {
    activeTab.value = 'list'
    currentReport.value = null
    chatMessages.value = []
  }

  return {
    activeTab, selectedTemplate, selectedEnterprise, selectedDataSources, isGenerating,
    currentReport, editingSectionId, sectionEditInput,
    chatMessages, chatInput, isChatProcessing,
    templates, sources, history, enterpriseInput, enterpriseResults,
    availableSources,
    openCreate, selectTemplate, toggleDataSource,
    generateReport, openReport,
    startEditSection, saveEditSection,
    sendChatMessage, backToList,
  }
})

function processChatCommand(input, report) {
  const lower = input.toLowerCase()
  const NL = '\n'

  // 修改章节
  const sectionMatch = lower.match(/把(.+?)那?部分/) || lower.match(/修改(.+?)[，。]/)
  if (sectionMatch) {
    const keyword = sectionMatch[1]
    const sec = report.sections.find(s =>
      s.title.toLowerCase().indexOf(keyword) >= 0 || s.title.indexOf(keyword) >= 0
    )
    if (sec) {
      let newContent = sec.content
      if (lower.indexOf('展开') >= 0 || lower.indexOf('详细') >= 0) {
        newContent = sec.content + NL + NL + '（展开补充）根据最新数据，该部分情况更为严重。建议进一步核实相关数据，并与企业负责人沟通确认。'
      } else if (lower.indexOf('删') >= 0 || lower.indexOf('去掉') >= 0) {
        newContent = sec.content.replace(/，建议.*$/, '。（已简化）')
      } else if (lower.indexOf('正式') >= 0 || lower.indexOf('书面') >= 0) {
        newContent = sec.content.replace(/建议：/g, '建议如下：')
      } else if (lower.indexOf('口语') >= 0 || lower.indexOf('轻松') >= 0) {
        newContent = sec.content.replace(/较为/g, '比较').replace(/显著/g, '明显')
      }
      sec.modifiedContent = newContent
      return '已更新「**' + sec.title + '**」的内容。你可以点击章节的 ✏️ 图标查看完整编辑结果。'
    }
  }

  // 加内容
  if (lower.indexOf('加上') >= 0 || lower.indexOf('增加') >= 0 || lower.indexOf('新增') >= 0) {
    const lastSec = report.sections[report.sections.length - 1]
    lastSec.modifiedContent = (lastSec.modifiedContent || lastSec.content) + NL + NL + '（新增内容）' + input
    return '已在「**' + lastSec.title + '**」末尾添加新内容。'
  }

  // 总结
  if (lower.indexOf('总结') >= 0 || lower.indexOf('概况') >= 0) {
    const modifiedCount = report.sections.filter(s => s.modifiedContent).length
    return '**报告概况：**' + NL + '· 报告名称：' + report.name + NL + '· 共 ' + report.sections.length + ' 个章节' + NL + '· 已修改章节：' + modifiedCount + ' 个'
  }

  return '收到。你可以这样告诉我怎么改：' + NL + NL + '· **把风险判断那部分展开** → 展开对应章节' + NL + '· **语气改成正式一点** → 调整整体语气' + NL + '· **加上最新的税票数据** → 在对应章节追加内容' + NL + '· **删掉经营分析那部分** → 简化对应章节' + NL + '· **总结一下** → 查看报告概况'
}
