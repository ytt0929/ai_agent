<template>
  <div v-if="task" class="due-task">
    <!-- ===== 统一增强流程头部（所有尽调阶段共用） ===== -->
    <div class="due-task-flow-header">
      <div class="due-task-flow-header__top">
        <div class="due-task-flow-header__left">
          <div class="due-task-flow-header__back-row">
            <el-button class="due-task-flow-header__back" @click="goBack" :icon="ArrowLeft" circle size="small" />
            <div>
              <div class="due-task-flow-header__title">{{ task.name }}</div>
              <div class="due-task-flow-header__meta">{{ task.industry }} / {{ task.region }}</div>
            </div>
          </div>
        </div>
        <div class="due-task-flow-header__badges">
          <el-tag size="small" effect="plain" type="info">{{ task.templateName }}</el-tag>
          <el-tag size="small" effect="plain" type="success">来源：{{ task.source }}</el-tag>
          <el-tag size="small" effect="plain">负责人：{{ task.manager }}</el-tag>
          <span class="due-task-flow-header__badge-score">综合评分 <b>{{ task.score }}</b></span>
          <el-tag size="small" effect="plain" type="warning">{{ task.grade }}</el-tag>
          <el-tag size="small" effect="plain" :type="riskTagType(task.riskLevel)">{{ task.riskLevel }}</el-tag>
          <span class="due-task-flow-header__badge-meta">资料完整度 {{ task.materialCompleteness }}%</span>
          <el-tag :type="getStatusTagType(task.status)" effect="light" size="small">{{ task.statusText }}</el-tag>
          <el-progress :percentage="task.progress || 0" :stroke-width="6" :color="getProgressColor(task.progress)" style="width:100px" />
        </div>
      </div>
      <div class="due-task-flow-header__steps">
        <div
          v-for="(step, idx) in processSteps"
          :key="step.key"
          class="dt-flow-step"
          :class="{ 'dt-flow-step--done': step.done, 'dt-flow-step--active': step.active, 'dt-flow-step--pending': !step.done && !step.active }"
          @click="!step.done && (selectedStageKey = step.key)"
        >
          <div class="dt-flow-step__node">
            <el-icon v-if="step.done" :size="14"><CircleCheck /></el-icon>
            <template v-else-if="step.active">
              <div class="dt-flow-step__pulse" />
              <el-icon :size="14" class="dt-flow-step__active-icon"><Loading /></el-icon>
            </template>
            <span v-else class="dt-flow-step__num">{{ idx + 1 }}</span>
          </div>
          <span class="dt-flow-step__label">{{ step.label }}</span>
          <div
            v-if="idx < processSteps.length - 1"
            class="dt-flow-step__connector"
            :class="{ 'dt-flow-step__connector--done': step.done, 'dt-flow-step__connector--active': step.active, 'dt-flow-step__connector--pending': !step.done && !step.active }"
          />
        </div>
      </div>
    </div>

    <!-- 当前节点摘要（紧跟流程卡下方） -->
    <div class="due-task-stage-summary">
      <div class="due-task-stage-summary__label">当前节点</div>
      <div class="due-task-stage-summary__row">
        <span>{{ currentStageLabel }} · {{ stageInfo[selectedStageKey]?.tagType === 'success' ? '已完成' : '进行中' }}</span>
        <el-tag size="small" effect="plain" :type="stageInfo[selectedStageKey]?.tagType || 'info'">{{ stageInfo[selectedStageKey]?.waiting || '' }}</el-tag>
      </div>
      <div class="due-task-stage-summary__desc">{{ stageInfo[selectedStageKey]?.prompt || '' }}</div>
    </div>

    <!-- 主体：左侧阶段产物工作区 + 右侧尽调任务助手 -->
    <div class="due-task__body">
      <!-- 左侧：阶段产物工作区 -->
      <main class="due-task__workspace">
        <!-- 工商核验 -->
        <el-card v-if="selectedStageKey === 'verify-business'" shadow="never" class="workspace-card">
          <BusinessVerifyArtifact :data="businessVerifyData" />
        </el-card>

        <!-- 司法查询 -->
        <el-card v-else-if="selectedStageKey === 'verify-legal'" shadow="never" class="workspace-card">
          <JudicialArtifact :data="judicialData" />
        </el-card>

        <!-- 税票采集 -->
        <el-card v-else-if="selectedStageKey === 'tax-rpa'" shadow="never" class="workspace-card">
          <TaxCollectionArtifact
            :data="taxArtifactData"
            @tax-authorized="handleTaxAuthorized"
            @send-reminder="handleSendReminder"
            @switch-to-upload="handleSwitchToUpload"
          />
        </el-card>

        <!-- 资料补充 -->
        <el-card v-else-if="selectedStageKey === 'materials'" shadow="never" class="workspace-card">
          <MaterialsArtifact :data="materialsArtifactData" @mock-material-upload="handleMockMaterialUpload" @send-material-list="handleSendMaterialList" />
        </el-card>

        <!-- 证据整合 -->
        <el-card v-else-if="selectedStageKey === 'evidence'" shadow="never" class="workspace-card">
          <EvidenceMergeArtifact :data="evidenceData" @enter-risk="handleEnterRisk" />
        </el-card>

        <!-- 风险诊断 -->
        <el-card v-else-if="selectedStageKey === 'risk'" shadow="never" class="workspace-card">
          <RiskDiagnosisArtifact :data="riskData" @enter-deliverables="handleEnterArtifacts" />
        </el-card>

        <!-- 产物确认 -->
        <el-card v-else-if="selectedStageKey === 'artifacts' && !reportEditorMode" shadow="never" class="workspace-card">
          <DeliverablesArtifact
            :data="deliverablesArtifactData"
            @edit-report="handleEditReport"
            @export-report="handleExportReport"
            @start-monitor="handleStartMonitor"
            @sync-to-report="handleSyncToReport"
            @generate-delivery-package="handleGenerateDeliveryPackage"
          />
        </el-card>

        <!-- 报告编辑 Lite（产物确认阶段触发） -->
        <el-card v-else-if="reportEditorMode" shadow="never" class="workspace-card">
          <ReportEditorArtifact
            :data="reportEditorData"
            @confirm-and-generate="handleGenerateDeliveryPackage"
          />
          <div class="report-lite-nav-bar">
            <el-button size="small" text type="primary" @click="exitReportEditor">← 返回产物确认</el-button>
            <el-button size="small" plain @click="handleEnterSmartReport">进入智能报告</el-button>
          </div>
        </el-card>

        <!-- 交付包下载 -->
        <el-card v-else-if="selectedStageKey === 'delivery-package'" shadow="never" class="workspace-card">
          <DeliveryPackageArtifact
            :data="deliveryPackageArtifactData"
            :downloading="deliveryDownloading"
            @download-all="handleDownloadPackage"
            @download-pdf="handleDownloadPdf"
            @back-to-artifacts="handleBackToArtifacts"
          />
        </el-card>
      </main>

      <!-- 右侧：对话式尽调助手 -->
      <aside class="due-task__assistant">
        <div class="chat-panel">
          <!-- 顶部栏 -->
          <div class="chat-panel__header">
            <div class="chat-panel__title-row">
              <span class="chat-panel__title">尽调助手</span>
              <el-button text size="small" @click="handleClearChat">清空</el-button>
            </div>
            <div class="chat-panel__stage-bar">
              <span class="chat-panel__stage-label">当前阶段</span>
              <el-tag size="small" :type="assistantStageTagType">{{ currentStageLabel }}</el-tag>
              <span class="chat-panel__sync-label">同步状态</span>
              <el-tag size="small" effect="plain">{{ task.statusText }}</el-tag>
            </div>
          </div>

          <!-- 消息流 -->
          <el-scrollbar ref="chatScrollbarRef" class="chat-panel__messages">
            <div v-if="taskMessages.length === 0" class="chat-panel__empty">
              <el-empty description="暂无对话记录" :image-size="40" />
            </div>
            <div v-for="msg in taskMessages" :key="msg.id" class="chat-message" :class="'chat-message--' + msg.role">
              <div class="chat-message__avatar">
                <el-icon v-if="msg.role === 'ai'" :size="16"><ChatDotRound /></el-icon>
                <el-icon v-else :size="16"><User /></el-icon>
              </div>
              <div class="chat-message__bubble">
                <div class="chat-message__text">{{ msg.text }}</div>
                <div class="chat-message__time">{{ msg.time }}</div>
              </div>
            </div>
          </el-scrollbar>

          <!-- 快捷动作 -->
          <div class="chat-panel__chips">
            <el-button v-for="chip in assistantChips" :key="chip.label" size="small" :type="chip.type || ''" text @click="chip.handler">
              {{ chip.label }}
            </el-button>
          </div>

          <!-- 输入框 -->
          <div class="chat-panel__input-row">
            <el-input
              v-model="chatInputText"
              placeholder="输入问题或下一步操作..."
              size="small"
              clearable
              @keyup.enter="handleSendInput"
            />
            <el-button size="small" type="primary" :icon="Promotion" @click="handleSendInput">发送</el-button>
          </div>
        </div>
      </aside>
    </div>
  </div>
  <div v-else class="due-task__empty"><el-empty description="未找到尽调任务" /></div>
</template>

<script setup>

import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CircleCheck, Loading, ChatDotRound, User, Promotion } from '@element-plus/icons-vue'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { ElMessage } from 'element-plus'

import TaxCollectionArtifact from '../components/workbench/artifacts/TaxCollectionArtifact.vue'
import MaterialsArtifact from '../components/workbench/artifacts/MaterialsArtifact.vue'
import DeliverablesArtifact from '../components/workbench/artifacts/DeliverablesArtifact.vue'
import EvidenceMergeArtifact from '../components/workbench/artifacts/EvidenceMergeArtifact.vue'
import RiskDiagnosisArtifact from '../components/workbench/artifacts/RiskDiagnosisArtifact.vue'
import BusinessVerifyArtifact from '../components/workbench/artifacts/BusinessVerifyArtifact.vue'
import JudicialArtifact from '../components/workbench/artifacts/JudicialArtifact.vue'
import ReportEditorArtifact from '../components/workbench/artifacts/ReportEditorArtifact.vue'
import DeliveryPackageArtifact from '../components/workbench/artifacts/DeliveryPackageArtifact.vue'
import { createOrReuseReportTaskFromDueDiligence, reportTasks, reportTemplates, reportSections as reportSectionsData } from '../data/mockSmartReport.js'

const router = useRouter()
const route = useRoute()
const store = useDueDiligenceStore()


const taskId = route.params.taskId
const task = computed(() => store.tasks.find(t => t.id === taskId))

const DUE_STAGES = [
  { key: 'verify-business', label: '工商核验' },
  { key: 'verify-legal',    label: '司法查询' },
  { key: 'tax-rpa',         label: '税票采集' },
  { key: 'materials',       label: '资料补充' },
  { key: 'evidence',        label: '证据整合' },
  { key: 'risk',            label: '风险诊断' },
  { key: 'artifacts',       label: '产物确认' },
  { key: 'delivery-package',label: '交付包下载' },
]

const processSteps = computed(() => {
  const t = task.value
  if (!t) return DUE_STAGES.map(s => ({ ...s, done: false, active: false }))
  const currentIdx = DUE_STAGES.findIndex(s => s.key === t.currentStep)
  const isComplete = t.status === '已完成'
  return DUE_STAGES.map((s, i) => {
    let done = false, active = false
    if (isComplete) { done = true }
    else if (currentIdx >= 0) {
      if (i < currentIdx) done = true
      else if (i === currentIdx) active = true
    }
    return { ...s, done, active }
  })
})

const _initialStageKey = computed(() => {
  const t = task.value
  if (!t) return 'verify-business'
  if (t.currentStep === 'delivery-package' || t.currentStage === 'delivery-package' || t.deliveryPackageStatus) return 'delivery-package'
  if (t.status === '已完成') return 'artifacts'
  return t.currentStep || 'verify-business'
})
const selectedStageKey = ref(_initialStageKey.value)
watch(_initialStageKey, v => { selectedStageKey.value = v })

const stageInfo = {
  'verify-business': { label: '工商核验', prompt: '工商核验已完成，企业主体状态正常存续，无工商异常。', waiting: '无（已完成）', tagType: 'success' },
  'verify-legal':    { label: '司法查询', prompt: '司法查询已完成，发现 1 条被执行记录、2 条裁判文书，建议关注高风险项。', waiting: '无（已完成）', tagType: 'success' },
  'tax-rpa':         { label: '税票采集', prompt: '税票采集需要企业授权。当前任务会保持在「等待客户」状态。你可以发送提醒，或在 demo 中点击「模拟企业已授权」继续采集。', waiting: '企业扫码授权', tagType: 'warning' },
  'materials':       { label: '资料补充', prompt: '资料补充等待客户上传。你可以发送资料清单链接，或模拟企业上传资料。', waiting: '客户上传资料', tagType: 'warning' },
  'evidence':        { label: '证据整合', prompt: '证据整合已完成，共收集 31 条有效证据，核心维度覆盖率 92%。可进入风险诊断。', waiting: '无（已完成）', tagType: 'success' },
  'risk':            { label: '风险诊断', prompt: '风险诊断已完成，共识别 8 项风险事项（2 高、2 中、2 低）。可进入产物确认。', waiting: '无（已完成）', tagType: 'success' },
  'artifacts':       { label: '产物确认', prompt: '尽调产物已全部生成。报告草稿有 3 处结论待确认，确认后即可提交。', waiting: '客户经理确认和修改', tagType: 'primary' },
  'delivery-package':{ label: '交付包下载', prompt: '尽调交付包已整理完成，包含尽调报告、阶段报告、证据链文件和原始资料包。', waiting: '无', tagType: 'success' },
}

const chatInputText = ref('')
const chatScrollbarRef = ref(null)
const reportEditorMode = ref(false)
const deliveryDownloading = ref(false)

const reportEditorData = computed(() => {
  return {
    title: '尽职调查报告',
    template: '尽职调查报告',
    completeness: task.value?.materialCompleteness || 86,
    pendingCount: 3,
    sections: reportSectionsData.map((s) => ({
      id: s.id,
      no: parseInt(s.no.replace(/[^0-9]/g, '')) || 1,
      title: s.title.replace(/^[一二三四五六七八九十]+、/, ''),
      status: s.status || '编辑中',
      content: (s.body || []).join('\n\n'),
      evidence: s.evidence ? s.evidence : [],
      materials: s.materials ? s.materials : [],
      pending: s.pending || [],
    })),
  }
})

function handleEnterSmartReport() {
  // 确保已有报告任务 ID
  if (!task.value?.reportDraftId) {
    // 没有则先创建/复用
    const result = createOrReuseReportTaskFromDueDiligence({
      dueTaskId: taskId,
      enterpriseName: task.value?.name || '唐山物桥商贸有限公司',
      reportName: '尽职调查报告',
      templateId: 'credit-v2021',
      templateName: '尽职调查报告',
      materialPackageId: 'MAT-004',
      pendingCount: 3,
      materialComplete: task.value?.materialCompleteness || 86,
      chapters: 15,
      evidenceCount: 24,
      aiNote: '税负率偏低、购销两头在外、开票收入与申报收入不一致等风险事项需重点核实',
      riskLevel: '中风险',
    })
    if (task.value) {
      task.value.reportDraftId = result.task.id
      task.value.reportStatus = '草稿待编辑'
    }
  }
  const reportTaskId = task.value?.reportDraftId
  pushUser('进入智能报告')
  pushAi('正在打开智能报告深度编辑页。你可以继续编辑正文、处理待确认项并导出正式报告。')
  router.push({
    path: '/smart-report',
    query: {
      reportId: reportTaskId,
      from: 'due-diligence',
      dueTaskId: taskId
    }
  })
}

function exitReportEditor() {
  reportEditorMode.value = false
}

// ── 交付包下载 ──
const deliveryPackageArtifactData = computed(() => ({
  enterpriseName: task.value?.name || '唐山物桥商贸有限公司',
  packageName: task.value?.deliveryPackageName || '',
  packageStatus: task.value?.deliveryPackageStatus || '未生成',
  generatedAt: task.value?.deliveryPackageGeneratedAt || '',
  downloaded: task.value?.deliveryPackageDownloaded || false,
}))

function handleGenerateDeliveryPackage() {
  // 防御判断：store.enterDeliveryPackage 必须存在
  if (typeof store.enterDeliveryPackage !== 'function') {
    ElMessage.error('交付包流程方法未加载，请刷新页面后重试')
    return
  }
  pushUser('确认产物并生成交付包')
  pushAi('报告草稿、阶段报告和证据链已确认。我已整理完整尽调交付包，包含尽调报告、阶段报告、证据链文件和原始资料包。')
  store.enterDeliveryPackage(taskId)
  selectedStageKey.value = 'delivery-package'
}

function handleDownloadPackage() {
  deliveryDownloading.value = true
  pushUser('下载完整交付包')
  pushAi('正在生成「' + (task.value?.deliveryPackageName || '尽调交付包') + '」。')
  setTimeout(() => {
    deliveryDownloading.value = false
    store.markDeliveryPackageDownloaded(taskId)
    pushAi('交付包已生成。demo 阶段已模拟下载完成。')
    ElMessage.success('交付包已生成，demo 阶段模拟下载完成')
  }, 1200)
}

function handleDownloadPdf() {
  pushUser('单独下载报告PDF')
  pushAi('已模拟导出「尽职调查报告.pdf」。正式环境将由后端渲染 PDF。')
  ElMessage.success('已模拟导出「尽职调查报告.pdf」。正式环境将由后端渲染 PDF。')
}

function handleBackToArtifacts() {
  selectedStageKey.value = 'artifacts'
  pushUser('返回产物确认')
  pushAi('已返回产物确认阶段。交付包状态已保留。')
}

let msgIdCounter = 0
function nextMsgId() { return 'msg-' + (++msgIdCounter) }

const taskMessages = computed(() => store.getTaskChatMessages(taskId))

function scrollChatToBottom() {
  nextTick(() => {
    if (chatScrollbarRef.value) {
      const wrap = chatScrollbarRef.value.wrapRef
      if (wrap) wrap.scrollTop = wrap.scrollHeight
    }
  })
}

function pushUser(text) {
  const m = { id: nextMsgId(), role: 'user', text, time: store.nowTime(), stage: selectedStageKey.value }
  store.addTaskChatMessage(taskId, m)
  scrollChatToBottom()
  return m
}
function pushAi(text) {
  const m = { id: nextMsgId(), role: 'ai', text, time: store.nowTime(), stage: selectedStageKey.value }
  store.addTaskChatMessage(taskId, m)
  scrollChatToBottom()
  return m
}

// 初始 AI 消息（进入页面时若该任务没有消息则自动添加）
watch(
  () => task.value?.id,
  (tid) => {
    if (!tid) return
    const msgs = store.getTaskChatMessages(tid)
    if (msgs.length === 0) {
      const t = task.value
      if (!t) return
      const stage = stageInfo[t.currentStep] || stageInfo['tax-rpa']
      const initText = `该任务当前停留在「${stage.label || t.currentStep}」。你可以点击下方快捷动作或输入自然语言推进尽调流程。`
      pushAi(initText)
    }
  },
  { immediate: true }
)


function goBack() { router.push('/due-diligence') }
function go(path) { router.push(path) }



const currentStageLabel = computed(() => stageInfo[selectedStageKey.value]?.label || '—')
const assistantPrompt = computed(() => stageInfo[selectedStageKey.value]?.prompt || '')
const assistantStageTagType = computed(() => stageInfo[selectedStageKey.value]?.tagType || 'info')
const waitingItem = computed(() => stageInfo[selectedStageKey.value]?.waiting || '')

// ── 阶段产物数据 ──
const businessVerifyData = computed(() => ({
  conclusion: '正常', conclusionNote: '主体信息已核实，无工商异常',
  entityStatus: '正常存续', legalPerson: '张某某',
  registeredCapital: task.value?.amount || '500万元', establishedDate: '2021-06-15',
  industry: task.value?.industry || '建材批发', region: task.value?.region || '河北省唐山市',
  relatedCompanies: '3 家', taxLevel: 'A 级',
  checks: [
    { ok: true, text: '主体状态：存续，无经营异常' },
    { ok: true, text: '注册资本：已实缴 500 万元' },
    { ok: true, text: '税务评级：A 级' },
    { ok: false, text: '关联企业：3 家中 1 家已注销未披露' },
  ],
  relatedCompaniesList: [
    { name: '唐山桥通物流有限公司', relation: '同一法人', status: '正常' },
    { name: '唐山物桥科技有限公司', relation: '同一法人', status: '正常' },
    { name: '唐山物桥旧商贸公司', relation: '前身', status: '已注销' },
  ],
  riskTips: ['关联企业注销未披露，建议核实原因'],
}))

const judicialData = computed(() => ({
  majorLawsuit: 0, execution: 1, dishonest: 0, judgment: 2, judgmentText: '（已结案）', penalty: 0, hearing: 1,
  conclusions: [
    { type: 'ok', text: '未发现失信被执行记录' },
    { type: 'warn', text: '存在 1 条被执行记录（金额较大，建议关注）' },
    { type: 'ok', text: '2 条裁判文书均为普通买卖合同纠纷，已结案' },
    { type: 'ok', text: '未发现影响持续经营的行政处罚' },
  ],
  records: [
    { type: '被执行', level: '中风险', summary: '2024年买卖合同纠纷，标的金额 120 万元，执行中' },
    { type: '裁判文书', level: '低风险', summary: '2023年合同纠纷，原告胜诉，已履行完毕' },
    { type: '开庭公告', level: '低风险', summary: '2025年劳动争议案，待开庭' },
  ],
}))

const taxArtifactData = computed(() => {
  const t = task.value
  const isAuth = t?.currentStep !== 'tax-rpa'
  const isCollected = ['evidence', 'risk', 'artifacts'].includes(t?.currentStep)
  return {
    status: isCollected ? '已完成' : '等待授权',
    authStatus: isAuth ? '已授权' : '等待授权',
    linkStatus: isAuth ? '已使用' : '已发送',
    authUrl: 'https://ai-copilot.demo/auth/rpa002',
    input: isCollected ? { count: 128, total: 150 } : { count: 0, total: 0 },
    output: isCollected ? { count: 96, total: 120 } : { count: 0, total: 0 },
    filing: isCollected ? { status: '已采集' } : { status: '未采集' },
    logs: isCollected
      ? [
          { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
          { time: '10:35', desc: '授权链接已发送', status: 'done' },
          { time: '11:20', desc: '企业已完成授权', status: 'done' },
          { time: '11:25', desc: '进项发票采集完成 128/150', status: 'done' },
          { time: '11:26', desc: '销项发票采集完成 96/120', status: 'done' },
        ]
      : [
          { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
          { time: '10:35', desc: '授权链接已发送', status: 'done' },
          { time: '—',    desc: '等待企业扫码授权',       status: 'waiting' },
        ],
  }
})

const materialsArtifactData = computed(() => {
  const t = task.value
  const isComplete = ['evidence', 'risk', 'artifacts'].includes(t?.currentStep)
  return {
    status: isComplete ? '已补充' : '待补充',
    completeness: t?.materialCompleteness || (isComplete ? 86 : 67),
    materials: [
      { name: '营业执照', type: '工商', status: '已收集' },
      { name: '法人身份证', type: '工商', status: '已收集' },
      { name: '2025年度审计报告', type: '财务', status: '已收集' },
      { name: '近三年纳税申报表', type: '税票', status: '已收集' },
      { name: '主要销售合同', type: '合同', status: '已收集' },
      { name: '征信授权书', type: '授权', status: '已收集' },
      { name: '主要采购合同', type: '合同', status: isComplete ? '已收集' : '待补充' },
      { name: '财务报表附注', type: '财务', status: isComplete ? '已收集' : '待补充' },
      { name: '最新财务报表', type: '财务', status: '待补充' },
      { name: '应收账款明细', type: '财务', status: '待补充' },
      { name: '电费缴费记录', type: '其他', status: '待补充' },
    ],
    missing: [
      { name: '最新财务报表', note: '需最近一期财务报表' },
      { name: '应收账款明细', note: '需前五大客户应收账款明细' },
      { name: '电费缴费记录', note: '需近12个月电费缴费凭证' },
    ],
  }
})

const evidenceData = computed(() => ({
  integrity: 86,
  sources: [
    { name: '工商证据', count: 6, status: '已归档' },
    { name: '司法证据', count: 2, status: '已归档' },
    { name: '税票证据', count: 12, status: '已归档' },
    { name: '资料证据', count: 9, status: '部分待确认' },
    { name: '风险关联证据', count: 2, status: '已建立' },
  ],
  riskEvidence: [
    { name: '税负率显著低于行业', count: 4, confidence: '高' },
    { name: '开票收入与申报不一致', count: 3, confidence: '高' },
    { name: '购销两头在外', count: 3, confidence: '中' },
    { name: '电费与收入相关性低', count: 1, confidence: '待补充' },
  ],
  gaps: [
    '! 电费缴费记录缺失，影响"电费与收入相关性"判断',
    '! 主要合同仍需补充原件，影响"购销两头在外"判断',
  ],
}))

const riskData = computed(() => ({
  score: task.value?.score || 72, grade: task.value?.grade || 'C+', riskLevel: '中',
  riskIssues: [
    { id: 'r1', level: '高', title: '税票数据授权存在缺口', desc: '客户仅授权2025年数据，2024年税票缺失', evidence: ['税票授权记录', '数据缺口说明'], impact: '影响年度税负趋势判断', suggestedAction: '补充2024年税票数据或出具说明' },
    { id: 'r2', level: '高', title: '法人关联企业异常', desc: '法人张某某名下3家关联企业，其中1家已注销未披露', evidence: ['工商关联查询', '注销企业记录'], impact: '可能涉及资产转移或隐瞒负债', suggestedAction: '核实关联企业注销原因及资金流向' },
    { id: 'r3', level: '中', title: '应收账款集中度高', desc: '前两大客户占比68%', evidence: ['销售合同', '应收账款明细'], impact: '大客户流失将严重影响经营', suggestedAction: '关注大客户经营稳定性' },
    { id: 'r4', level: '中', title: '存货周转率下降', desc: '近三个季度连续下降', evidence: ['财务报表', '存货明细'], impact: '资金占用增加', suggestedAction: '核实存货结构及库龄' },
    { id: 'r5', level: '低', title: '环保处罚记录', desc: '2024年有一次轻微环保处罚，已整改', evidence: ['环保处罚公示'], impact: '影响有限', suggestedAction: '关注是否再次发生' },
    { id: 'r6', level: '低', title: '社保缴纳人数波动', desc: '近6个月缴纳人数波动较大', evidence: ['社保缴纳记录'], impact: '可能影响企业稳定性', suggestedAction: '核实用工模式变化原因' },
  ],
  conclusion: '该企业综合评分 72 分，等级 C+，属于中风险。主要风险集中在税票数据授权缺口和法人关联企业异常，建议作为有条件授信对象。',
  suggestedActions: ['补充税负异常说明', '确认购销业务真实性', '核实关联企业资金流向', '强化贷后监测'],
}))

const deliverablesArtifactData = computed(() => ({
  enterprise: task.value,
  items: [
    { name: '尽职调查报告', status: 'V2 待确认', count: '3处待确认', type: 'report' },
    { name: '工商核验报告', status: '已生成', count: '1份', type: 'business' },
    { name: '司法查询报告', status: '已生成', count: '1份', type: 'judicial' },
    { name: '税票分析报告', status: '已生成', count: '1份', type: 'tax' },
    { name: '风险诊断报告', status: '已生成', count: '8项风险', type: 'risk' },
    { name: '证据链文件', status: '已归档', count: '31条证据', type: 'evidence' },
  ],
  exportStatus: '',
  pendingItems: ['风险结论需确认', '税票异常说明待补充', '授信建议待确认'],
  reportSections: [
    { id: 'c1', no: '一', title: '企业基本情况', content: '唐山物桥商贸有限公司成立于2021年，注册资本500万元，法定代表人张某某，经营范围为建材批发。', materials: ['工商登记信息'] },
    { id: 'c2', no: '二', title: '行业与市场分析', content: '企业主营建材批发，属于传统商贸流通行业，行业竞争激烈，利润率偏低。', evidence: ['行业报告', '市场调研数据'] },
    { id: 'c3', no: '三', title: '财务分析', content: '企业2025年度营业收入约2175万元，净利润约43万元，税负率0.8%显著低于行业平均。', materials: ['审计报告', '纳税申报表'], pending: ['税负异常说明待补充'] },
    { id: 'c4', no: '四', title: '税票分析', content: '进项发票128/150份，销项发票96/120份。增值税税负率0.8%，低于行业平均1.5%。', materials: ['税票采集数据'] },
    { id: 'c5', no: '五', title: '司法风险', content: '存在1条被执行记录，2条裁判文书。未发现失信被执行记录。', materials: ['司法查询数据'] },
    { id: 'c6', no: '六', title: '风险诊断', content: '共识别8项风险事项，其中2项高风险、2项中风险、2项低风险。', materials: ['AI风险诊断'] },
    { id: 'c7', no: '七', title: '授信建议', content: '建议作为有条件授信对象，授信额度不超过300万元，期限不超过1年。', materials: ['综合评估'], pending: ['授信建议待确认'] },
  ],
  riskConclusion: false, taxNote: false, creditAdvice: false,
}))

// ── 快捷动作 chips ──
const assistantChips = computed(() => {
  const stage = selectedStageKey.value
  const tid = taskId
  if (stage === 'tax-rpa') return [
    { label: '发送提醒', handler: handleSendReminder },
    { label: '模拟企业已授权', type: 'primary', handler: () => handleTaxAuthorized(tid) },
    { label: '改为上传材料', handler: handleSwitchToUpload },
    { label: '稍后继续', handler: handleLaterContinue },
  ]
  if (stage === 'materials') return [
    { label: '发送资料清单', handler: handleSendMaterialList },
    { label: '模拟客户上传资料', type: 'primary', handler: () => handleMockMaterialUpload(tid) },
    { label: '稍后继续', handler: handleLaterContinue },
  ]
  if (stage === 'evidence') return [
    { label: '查看证据详情', handler: handleViewEvidence },
    { label: '进入风险诊断', type: 'primary', handler: () => handleEnterRisk(tid) },
  ]
  if (stage === 'risk') return [
    { label: '查看诊断报告', handler: handleViewRisk },
    { label: '生成产物', type: 'primary', handler: () => handleEnterArtifacts(tid) },
  ]
  if (stage === 'artifacts') return [
    { label: '查看报告', handler: handleViewReport },
    { label: '编辑报告', handler: handleEditReport },
    { label: '生成交付包', handler: handleGenerateDeliveryPackage },
    { label: '稍后继续', handler: handleLaterContinue },
  ]
  if (stage === 'delivery-package') return [
    { label: '下载完整交付包', type: 'primary', handler: handleDownloadPackage },
    { label: '单独下载报告PDF', handler: handleDownloadPdf },
    { label: '返回产物确认', handler: handleBackToArtifacts },
  ]
  return [
    { label: '稍后继续', handler: handleLaterContinue },
  ]
})

// ── Handlers ──
function handleSendReminder() {
  pushUser('发送提醒')
  pushAi('提醒已发送给企业联系人，授权链接有效期 24 小时。当前任务仍保持在「税票采集 / 待授权」。')
}
function handleTaxAuthorized(tid) {
  pushUser('模拟企业已授权')
  pushAi('已收到企业授权，正在登录税票系统并采集数据。')
  setTimeout(() => {
    store.markTaxAuthorized(tid)
    selectedStageKey.value = 'materials'
    pushAi('税票数据采集完成，已获取进项发票 128/150、销项发票 96/120，纳税申报已采集。下一步进入资料补充。')
  }, 400)
}
function handleSwitchToUpload() {
  pushUser('改为上传材料')
  pushAi('已切换为手动上传材料模式。你可以让客户上传税票文件或直接模拟资料补充。')
  selectedStageKey.value = 'materials'
}
function handleLaterContinue() {
  pushUser('稍后继续')
  pushAi('任务已保留在当前阶段。下次进入智能尽调或工作台时，可以从这里继续。')
}
function handleSendMaterialList() {
  pushUser('发送资料清单')
  pushAi('资料清单已发送给客户。当前还缺少最新财务报表、主要合同、应收账款明细和电费缴费记录。')
}
function handleMockMaterialUpload(tid) {
  pushUser('模拟客户上传资料')
  pushAi('已收到客户补充资料，正在识别并归档到资料包。')
  setTimeout(() => {
    store.markMaterialsUploaded(tid)
    selectedStageKey.value = 'evidence'
    pushAi('资料完整度已提升至 86%，下一步进入证据整合。')
  }, 400)
}
function handleEnterRisk(tid) {
  pushUser('进入风险诊断')
  pushAi('正在基于证据链生成风险诊断。')
  setTimeout(() => {
    store.enterRisk(tid)
    selectedStageKey.value = 'risk'
    pushAi('风险诊断完成，识别 8 项风险事项，其中 2 项高风险。')
  }, 400)
}
function handleEnterArtifacts(tid) {
  pushUser('生成产物')
  pushAi('已基于尽职调查报告模板生成尽调产物，包括尽职调查报告、工商核验报告、司法查询报告、税票分析报告、风险诊断报告和证据链文件。')
  store.enterArtifacts(tid)
  selectedStageKey.value = 'artifacts'
}
function handleEditReport() {
  // 创建/复用智能报告编写任务
  const result = createOrReuseReportTaskFromDueDiligence({
    dueTaskId: taskId,
    enterpriseName: task.value?.name || '唐山物桥商贸有限公司',
    reportName: '尽职调查报告',
    templateId: 'credit-v2021',
    templateName: '尽职调查报告',
    materialPackageId: 'MAT-004',
    pendingCount: 3,
    materialComplete: task.value?.materialCompleteness || 86,
    chapters: 15,
    evidenceCount: 24,
    aiNote: '税负率偏低、购销两头在外、开票收入与申报收入不一致等风险事项需重点核实',
    riskLevel: '中风险',
  })

  // 同步到尽调任务
  if (task.value) {
    task.value.reportDraftId = result.task.id
    task.value.reportStatus = '草稿待编辑'
  }

  // 切换左侧为报告编辑 Lite
  reportEditorMode.value = true

  pushUser('编辑报告')
  if (result.reused) {
    pushAi('已找到该企业的智能报告编写任务，并同步当前尽调产物。你可以继续在当前页编辑。')
  } else {
    pushAi('已基于当前尽调产物创建智能报告编写任务。你可以先在当前页轻量编辑报告，也可以稍后进入智能报告进行深度编辑、版本管理和导出。')
  }
}

function handleSyncToReport() {
  // 与编辑报告相同：创建/复用报告任务 + 切换左侧为报告编辑 Lite
  const result = createOrReuseReportTaskFromDueDiligence({
    dueTaskId: taskId,
    enterpriseName: task.value?.name || '唐山物桥商贸有限公司',
    reportName: '尽职调查报告',
    templateId: 'credit-v2021',
    templateName: '尽职调查报告',
    materialPackageId: 'MAT-004',
    pendingCount: 3,
    materialComplete: task.value?.materialCompleteness || 86,
    chapters: 15,
    evidenceCount: 24,
    aiNote: '税负率偏低、购销两头在外、开票收入与申报收入不一致等风险事项需重点核实',
    riskLevel: '中风险',
  })

  if (task.value) {
    task.value.reportDraftId = result.task.id
    task.value.reportStatus = '草稿待编辑'
  }

  reportEditorMode.value = true

  pushUser('同步到智能报告')
  if (result.reused) {
    pushAi('已找到该企业的智能报告编写任务，并同步当前尽调产物。你可以继续在当前页编辑。')
  } else {
    pushAi('已基于当前尽调产物创建智能报告编写任务。你可以先在当前页轻量编辑报告，也可以稍后进入智能报告进行深度编辑、版本管理和导出。')
  }
}
function handleExportReport(tid) {
  pushUser('导出报告')
  store.markReportExported(tid)
  pushAi('导出任务已生成。Demo 阶段已模拟生成最终报告文件。')
}
function handleStartMonitor() {
  pushUser('加入监控')
  pushAi('已加入监控列表。')
}
function handleViewReport() {
  pushUser('查看报告')
  pushAi('左侧已打开「尽职调查报告」文档化预览。你可以继续编辑、导出或稍后确认。')
  selectedStageKey.value = 'artifacts'
}
function handleViewEvidence() {
  pushUser('查看证据详情')
  pushAi('证据包包含 31 条有效证据，覆盖工商、司法、税票、合同、财务等维度。左侧已展示证据来源分布和风险事项证据链。')
}
function handleViewRisk() {
  pushUser('查看诊断报告')
  pushAi('左侧已展示完整风险诊断结果，包括综合评分、风险等级、风险事项和证据链入口。')
  selectedStageKey.value = 'risk'
}
function handleClearChat() {
  if (taskId) store.clearTaskChatMessages(taskId)
}

function getStatusTagType(s) {
  if (s?.includes('等待')) return 'warning'
  if (s?.includes('进行') || s?.includes('完成')) return 'success'
  if (s?.includes('待确认')) return 'danger'
  return 'info'
}
function riskTagType(r) {
  if (r === '高风险') return 'danger'
  if (r === '中风险') return 'warning'
  return 'success'
}


// ── 自然语言输入 ──
function handleSendInput() {
  const text = chatInputText.value.trim()
  if (!text) return
  pushUser(text)
  chatInputText.value = ''
  const t = text.toLowerCase()
  const tid = taskId

  if (t.includes('提醒')) {
    handleSendReminder()
    return
  }
  if (t.includes('授权')) {
    handleTaxAuthorized(tid)
    return
  }
  if (t.includes('上传') || t.includes('补齐')) {
    if (selectedStageKey.value === 'materials') { handleMockMaterialUpload(tid) }
    else { pushAi('当前不在资料补充阶段，请先完成税票采集。') }
    return
  }
  if (t.includes('证据')) {
    if (selectedStageKey.value === 'evidence') { handleViewEvidence() }
    else if (['tax-rpa', 'materials'].includes(selectedStageKey.value)) { pushAi('当前还在资料阶段，请完成资料补充后进入证据整合。') }
    else { handleViewEvidence() }
    return
  }
  if (t.includes('风险') || t.includes('诊断')) {
    if (selectedStageKey.value === 'evidence') { handleEnterRisk(tid) }
    else if (selectedStageKey.value === 'risk') { handleViewRisk() }
    else { pushAi('请先完成证据整合后再进入风险诊断。') }
    return
  }
  if (t.includes('产物') || t.includes('生成产物')) {
    if (selectedStageKey.value === 'risk') { handleEnterArtifacts(tid) }
    else if (selectedStageKey.value === 'artifacts') { pushAi('产物已经生成，你可以查看报告或导出。') }
    else { pushAi('请先完成风险诊断后再生成产物。') }
    return
  }
  if (t.includes('下载') || t.includes('交付包') || t.includes('zip')) {
    if (selectedStageKey.value === 'delivery-package') { handleDownloadPackage() }
    else if (selectedStageKey.value === 'artifacts') { handleGenerateDeliveryPackage() }
    else { pushAi('请先完成尽调流程进入产物确认阶段。') }
    return
  }
  if (t.includes('pdf') || t.includes('报告pdf')) {
    if (selectedStageKey.value === 'delivery-package') { handleDownloadPdf() }
    else { pushAi('请先完成尽调流程并生成交付包。') }
    return
  }
  if (t.includes('返回') || t.includes('产物确认')) {
    if (selectedStageKey.value === 'delivery-package') { handleBackToArtifacts() }
    else { pushAi('当前已在产物确认或更早的阶段。') }
    return
  }

  if (t.includes('导出') || t.includes('报告')) {
    if (selectedStageKey.value === 'artifacts') { handleExportReport(tid) }
    else if (t.includes('查看报告') || t.includes('打开报告')) { handleViewReport() }
    else { pushAi('请先完成风险诊断并生成产物后，才能导出报告。') }
    return
  }
  if (t.includes('稍后') || t.includes('保存')) {
    handleLaterContinue()
    return
  }

  pushAi('我已收到你的问题。你也可以点击下方快捷动作继续推进当前尽调任务。')
}
function getProgressColor(p) {
  if (p >= 100) return 'var(--color-success, #67c23a)'
  if (p >= 60) return 'var(--color-primary, #409eff)'
  if (p >= 30) return 'var(--color-warning, #e6a23c)'
  return 'var(--text-tertiary, #909399)'
}

</script>

<style scoped>

.due-task { height: 100vh; max-height: 100vh; max-width: var(--layout-page-data, 1200px); margin: 0 auto; padding: var(--space-4xl, 32px); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }

/* ═══ 统一增强流程头部 ═══ */
.due-task-flow-header {
  margin-bottom: var(--space-sm);
  flex-shrink: 0;
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}

.due-task-flow-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.due-task-flow-header__left { min-width: 0; }

.due-task-flow-header__back-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.due-task-flow-header__back { flex-shrink: 0; }

.due-task-flow-header__title {
  font-size: var(--font-size-page-title, 20px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.due-task-flow-header__meta {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary);
}

.due-task-flow-header__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.due-task-flow-header__badge-score {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary);
  white-space: nowrap;
}

.due-task-flow-header__badge-score b {
  font-weight: 700;
  color: var(--text-primary);
}

.due-task-flow-header__badge-meta {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary);
  white-space: nowrap;
}

.due-task-flow-header__steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color-divider);
}

/* 流程步骤 */
.dt-flow-step {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  transition: background 0.15s;
  position: relative;
}

.dt-flow-step:hover { background: var(--surface-soft); }

.dt-flow-step__node {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.dt-flow-step--done .dt-flow-step__node { background: var(--color-success); color: #fff; }
.dt-flow-step--active .dt-flow-step__node { background: #fff; color: var(--color-primary); border: 2px solid var(--color-primary); box-shadow: 0 0 0 3px var(--color-success-bg); }
.dt-flow-step--pending .dt-flow-step__node { background: var(--surface-page); color: var(--text-tertiary); border: 1px solid var(--border-light); }

.dt-flow-step__label { font-size: var(--font-size-xs); white-space: nowrap; }
.dt-flow-step--done .dt-flow-step__label { color: var(--text-primary); font-weight: 500; }
.dt-flow-step--active .dt-flow-step__label { color: var(--color-primary); font-weight: 600; }
.dt-flow-step--pending .dt-flow-step__label { color: var(--text-tertiary); }

.dt-flow-step--active::after { content: ''; position: absolute; bottom: -4px; left: 20%; right: 20%; height: 2px; background: var(--color-primary); border-radius: 1px; }

.dt-flow-step__pulse { position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--color-primary); opacity: 0.4; animation: process-pulse 2s ease-in-out infinite; }
.dt-flow-step__active-icon { position: relative; z-index: 1; }

.dt-flow-step__connector { flex: 1; height: 2px; min-width: 12px; margin: 0 var(--space-xs); pointer-events: none; }
.dt-flow-step__connector--done { background: var(--color-success); }
.dt-flow-step__connector--active { background: linear-gradient(to right, var(--color-primary), var(--border-light)); }
.dt-flow-step__connector--pending { background: var(--border-divider); }

@keyframes process-pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .dt-flow-step__pulse { animation: none; opacity: 0.2; } }

/* 当前节点摘要 */
.due-task-stage-summary {
  margin-bottom: var(--space-lg);
  flex-shrink: 0;
  background: var(--surface-soft);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-sizing: border-box;
  min-width: 0;
}

.due-task-stage-summary__label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.due-task-stage-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
  margin-bottom: 4px;
  font-size: var(--font-size-sm, 13px);
  color: var(--text-primary);
  font-weight: 600;
}

.due-task-stage-summary__desc {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary);
  line-height: 1.5;
}

.due-task__body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: var(--space-lg); align-items: stretch; }
.due-task__workspace { min-width: 0; min-height: 0; overflow-y: auto; padding-right: var(--space-xs); }
.workspace-card :deep(.el-card__header) { padding: var(--space-md) var(--space-lg); }
.workspace-card :deep(.el-card__body) { padding: var(--space-lg); }
.report-lite-nav-bar { display: flex; align-items: center; gap: var(--space-md); margin-top: var(--space-md); padding-top: var(--space-sm); border-top: 1px solid var(--border-divider); }
.due-task__assistant { min-width: 0; min-height: 0; height: 100%; position: static; }
.chat-panel { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; }
.chat-panel__header { padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.chat-panel__title-row { display: flex; align-items: center; justify-content: space-between; }
.chat-panel__title { font-size: var(--font-size-base, 14px); font-weight: var(--font-weight-semibold, 600); color: var(--text-primary); }
.chat-panel__stage-bar { display: flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-xs); }
.chat-panel__stage-label { font-size: var(--font-size-xs); color: var(--text-secondary); }
.chat-panel__sync-label { font-size: var(--font-size-xs); color: var(--text-secondary); }
.chat-panel__messages { flex: 1; min-height: 0; padding: var(--space-md); overflow-y: auto; }
.chat-panel__messages :deep(.el-scrollbar__wrap) { overflow-y: auto; }
.chat-panel__messages :deep(.el-scrollbar__view) { min-height: 100%; }
.chat-panel__empty { display: flex; align-items: center; justify-content: center; height: 100%; }
.chat-message { display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); }
.chat-message--user { flex-direction: row-reverse; }
.chat-message__avatar { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.chat-message--ai .chat-message__avatar { background: var(--surface-soft); color: var(--text-secondary); }
.chat-message--user .chat-message__avatar { background: var(--color-primary); color: #fff; }
.chat-message__bubble { max-width: 85%; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); line-height: 1.5; font-size: var(--font-size-sm, 13px); }
.chat-message--ai .chat-message__bubble { background: var(--surface-soft); color: var(--text-primary); border-top-left-radius: 2px; }
.chat-message--user .chat-message__bubble { background: var(--color-primary); color: #fff; border-top-right-radius: 2px; }
.chat-message__text { word-break: break-word; }
.chat-message__time { font-size: 11px; margin-top: 2px; opacity: 0.6; }
.chat-message--user .chat-message__time { text-align: right; }
.chat-panel__chips { padding: var(--space-sm) var(--space-md); border-top: 1px solid var(--border-light); display: flex; flex-wrap: wrap; gap: var(--space-xs); flex-shrink: 0; }
.chat-panel__input-row { padding: var(--space-sm) var(--space-md) var(--space-md); display: flex; gap: var(--space-sm); flex-shrink: 0; }
.chat-panel__input-row .el-input { flex: 1; }
.due-task__empty { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
@media (max-width: 1280px) { .due-task__body { grid-template-columns: 1fr; } .due-task__assistant { position: static; } .chat-panel { height: 500px; } }

</style>
