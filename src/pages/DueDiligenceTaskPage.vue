<template>
  <div v-if="task" class="due-task">
    <!-- 返回 + 任务头部 -->
    <div class="due-task__header">
      <div class="due-task__header-top">
        <el-button class="back-btn" @click="goBack" :icon="ArrowLeft" circle size="small" />
        <div class="due-task__header-info">
          <h2 class="due-task__name">{{ task.name }}</h2>
          <span class="due-task__meta">{{ task.industry }} · {{ task.region }} · 注册资本 {{ task.amount }}</span>
        </div>
      </div>
      <div class="due-task__header-meta">
        <el-tag size="small" effect="plain" type="info">模板：{{ task.templateName }}</el-tag>
        <el-tag size="small" effect="plain" type="success">来源：{{ task.source }}</el-tag>
        <el-tag size="small" effect="plain">负责人：{{ task.manager }}</el-tag>
        <span class="due-task__score">综合评分 <b>{{ task.score }}</b></span>
        <el-tag size="small" effect="plain" type="warning">{{ task.grade }}</el-tag>
        <el-tag size="small" effect="plain" :type="riskTagType(task.riskLevel)">{{ task.riskLevel }}</el-tag>
        <span class="due-task__material-meta">资料完整度 {{ task.materialCompleteness }}%</span>
        <el-tag :type="getStatusTagType(task.status)" effect="light" size="small">{{ task.statusText }}</el-tag>
        <el-progress :percentage="task.progress || 0" :stroke-width="6" :color="getProgressColor(task.progress)" style="width:120px" />
      </div>
    </div>

    <!-- 7 节点流程进度 -->
    <div class="due-task__process-bar">
      <div
        v-for="(step, idx) in processSteps"
        :key="step.key"
        class="process-step"
        :class="{ 'process-step--done': step.done, 'process-step--active': step.active, 'process-step--pending': !step.done && !step.active }"
        @click="!step.done && (selectedStageKey = step.key)"
      >
        <div class="process-step__node">
          <el-icon v-if="step.done" :size="14"><CircleCheck /></el-icon>
          <template v-else-if="step.active">
            <div class="process-step__pulse" />
            <el-icon :size="14" class="process-step__active-icon"><Loading /></el-icon>
          </template>
          <span v-else class="process-step__num">{{ idx + 1 }}</span>
        </div>
        <span class="process-step__label">{{ step.label }}</span>
        <div
          v-if="idx < processSteps.length - 1"
          class="process-step__connector"
          :class="{ 'process-step__connector--done': step.done, 'process-step__connector--active': step.active, 'process-step__connector--pending': !step.done && !step.active }"
        />
      </div>
      <div class="due-task__process-actions">
        <span class="due-task__process-text">当前进度：{{ task.progress }}%</span>
        <el-button size="small" plain @click="goBack">稍后继续</el-button>
        <el-button size="small" text @click="go('/workbench')">回到工作台</el-button>
      </div>
    </div>

    <!-- 主体：左侧阶段产物工作区 + 右侧尽调任务助手 -->
    <div class="due-task__body">
      <!-- 左侧：阶段产物工作区 -->
      <main class="due-task__workspace">
        <!-- 税票采集 -->
        <el-card v-if="selectedStageKey === 'tax-rpa'" shadow="never" class="workspace-card">
          <TaxCollectionArtifact
            :data="taxArtifactData"
            @send-reminder="handleSendReminder"
            @tax-authorized="handleTaxAuthorized"
            @switch-to-upload="handleSwitchToUpload"
          />
        </el-card>

        <!-- 资料补充 -->
        <el-card v-else-if="selectedStageKey === 'materials'" shadow="never" class="workspace-card">
          <MaterialsArtifact :data="materialsArtifactData" @send-material-list="handleSendMaterialList" @mock-material-upload="handleMockMaterialUpload" @enter-evidence="handleEnterEvidence" />
        </el-card>

        <!-- 产物确认 -->
        <el-card v-else-if="selectedStageKey === 'artifacts'" shadow="never" class="workspace-card">
          <DeliverablesArtifact
            :data="deliverablesArtifactData"
            @edit-report="handleEditReport"
            @export-report="handleExportReport"
            @start-monitor="handleStartMonitor"
          />
        </el-card>

        <!-- 工商核验 -->
        <el-card v-else-if="selectedStageKey === 'verify-business'" shadow="never" class="workspace-card">
          <div class="artifact-generic">
            <div class="artifact-generic__header">
              <span class="artifact-generic__title">工商核验结果</span>
              <el-tag size="small" type="success" effect="plain">已完成</el-tag>
            </div>
            <div class="artifact-generic__summary">主体信息已核实，无工商异常，经营状态存续，股权结构清晰。</div>
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item label="企业名称">{{ task.name }}</el-descriptions-item>
              <el-descriptions-item label="经营状态"><span style="color:var(--color-success)">存续</span></el-descriptions-item>
              <el-descriptions-item label="注册资本">{{ task.amount }}</el-descriptions-item>
              <el-descriptions-item label="异常项">无</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 司法查询 -->
        <el-card v-else-if="selectedStageKey === 'verify-legal'" shadow="never" class="workspace-card">
          <div class="artifact-generic">
            <div class="artifact-generic__header">
              <span class="artifact-generic__title">司法查询摘要</span>
              <el-tag size="small" type="warning" effect="plain">存在风险项</el-tag>
            </div>
            <div class="artifact-generic__summary">发现被执行人记录 1 条、裁判文书 2 条，建议关注高风险项。</div>
            <div class="artifact-generic__risks">
              <div class="risk-entry risk-entry--high"><span class="risk-entry__level risk-entry__level--high">高</span><span class="risk-entry__text">税票数据授权存在缺口</span></div>
              <div class="risk-entry risk-entry--high"><span class="risk-entry__level risk-entry__level--high">高</span><span class="risk-entry__text">法人关联企业异常</span></div>
              <div class="risk-entry"><span class="risk-entry__level">中</span><span class="risk-entry__text">应收账款集中度高</span></div>
              <div class="risk-entry"><span class="risk-entry__level">中</span><span class="risk-entry__text">存货周转率下降</span></div>
            </div>
          </div>
        </el-card>

        <!-- 证据整合 -->
        <el-card v-else-if="selectedStageKey === 'evidence'" shadow="never" class="workspace-card">
          <div class="artifact-generic">
            <div class="artifact-generic__header">
              <span class="artifact-generic__title">证据包</span>
              <el-tag size="small" type="success" effect="plain">已整合</el-tag>
            </div>
            <div class="artifact-generic__summary">已完成证据整合，共收集 31 条有效证据，核心维度覆盖率 92%。</div>
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item label="证据数量">31 条</el-descriptions-item>
              <el-descriptions-item label="覆盖率"><span style="color:var(--color-success)">92%</span></el-descriptions-item>
              <el-descriptions-item label="工商维度"><span style="color:var(--color-success)">100%</span></el-descriptions-item>
              <el-descriptions-item label="税票维度"><span style="color:var(--color-warning)">78%</span></el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 风险诊断 -->
        <el-card v-else-if="selectedStageKey === 'risk'" shadow="never" class="workspace-card">
          <div class="artifact-generic">
            <div class="artifact-generic__header">
              <span class="artifact-generic__title">风险诊断摘要</span>
              <el-tag size="small" type="danger" effect="plain">2 项高风险</el-tag>
            </div>
            <div class="artifact-generic__summary">已识别 8 项风险事项，其中 2 项高风险需要重点关注。</div>
            <div class="artifact-generic__risks">
              <div class="risk-entry risk-entry--high"><span class="risk-entry__level risk-entry__level--high">高</span><span class="risk-entry__text">税票数据授权存在缺口</span></div>
              <div class="risk-entry risk-entry--high"><span class="risk-entry__level risk-entry__level--high">高</span><span class="risk-entry__text">法人关联企业异常</span></div>
              <div class="risk-entry"><span class="risk-entry__level">中</span><span class="risk-entry__text">应收账款集中度高</span></div>
              <div class="risk-entry"><span class="risk-entry__level">中</span><span class="risk-entry__text">存货周转率下降</span></div>
              <div class="risk-entry risk-entry--low"><span class="risk-entry__level risk-entry__level--low">低</span><span class="risk-entry__text">环保处罚记录</span></div>
              <div class="risk-entry risk-entry--low"><span class="risk-entry__level risk-entry__level--low">低</span><span class="risk-entry__text">社保缴纳人数波动</span></div>
            </div>
          </div>
        </el-card>
      </main>

      <!-- 右侧：尽调任务助手 -->
      <aside class="due-task__assistant">
        <el-card shadow="never" class="assistant-card">
          <template #header>
            <div class="assistant-card__header">
              <span class="assistant-card__title">尽调助手</span>
            </div>
          </template>

          <!-- 当前阶段说明 -->
          <div class="assistant-card__stage-info">
            <span class="assistant-card__stage-label">当前阶段</span>
            <el-tag size="small" :type="assistantStageTagType">{{ currentStageLabel }}</el-tag>
          </div>

          <!-- AI 提示语 -->
          <el-alert :title="assistantPrompt" type="info" :closable="false" show-icon style="font-size:13px" />

          <!-- 快捷操作 -->
          <div class="assistant-card__actions">
            <span class="assistant-card__actions-label">快捷操作</span>
            <div class="assistant-card__actions-grid">
              <el-button v-for="action in assistantActions" :key="action.label" :type="action.type || ''" size="small" @click="action.handler" style="width:100%;text-align:left">
                {{ action.label }}
              </el-button>
            </div>
          </div>

          <!-- 任务状态 -->
          <el-divider />
          <div class="assistant-card__status">
            <span class="assistant-card__status-label">任务状态</span>
            <div class="assistant-card__status-row"><span class="assistant-card__status-key">当前阶段</span><span class="assistant-card__status-value">{{ currentStageLabel }}</span></div>
            <div class="assistant-card__status-row"><span class="assistant-card__status-key">等待事项</span><span class="assistant-card__status-value">{{ waitingItem }}</span></div>
            <div class="assistant-card__status-row"><span class="assistant-card__status-key">同步状态</span><span class="assistant-card__status-value"><el-tag size="small" type="warning" effect="plain">等待客户</el-tag></span></div>
            <div class="assistant-card__status-row"><span class="assistant-card__status-key">最近更新</span><span class="assistant-card__status-value">{{ task.updatedAt }}</span></div>
          </div>
        </el-card>
      </aside>
    </div>
  </div>
  <div v-else class="due-task__empty"><el-empty description="未找到尽调任务" /></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft, ArrowRight, CircleCheck, Loading,
} from '@element-plus/icons-vue'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { ElMessage } from 'element-plus'

// 复用工作台 artifact 组件
import TaxCollectionArtifact from '../components/workbench/artifacts/TaxCollectionArtifact.vue'
import MaterialsArtifact from '../components/workbench/artifacts/MaterialsArtifact.vue'
import DeliverablesArtifact from '../components/workbench/artifacts/DeliverablesArtifact.vue'

const router = useRouter()
const route = useRoute()
const store = useDueDiligenceStore()

function goBack() { router.push('/due-diligence') }
function go(path) { router.push(path) }

const taskId = route.params.taskId
const task = computed(() => store.tasks.find(t => t.id === taskId))

// ── 7 节点流程 ──
const DUE_STAGES = [
  { key: 'verify-business', label: '工商核验' },
  { key: 'verify-legal',    label: '司法查询' },
  { key: 'tax-rpa',         label: '税票采集' },
  { key: 'materials',       label: '资料补充' },
  { key: 'evidence',        label: '证据整合' },
  { key: 'risk',            label: '风险诊断' },
  { key: 'artifacts',       label: '产物确认' },
]

const processSteps = computed(() => {
  const t = task.value
  if (!t) return DUE_STAGES.map(s => ({ ...s, done: false, active: false }))
  const currentIdx = DUE_STAGES.findIndex(s => s.key === t.currentStep)
  const isComplete = t.status === '已完成' || t.status === '报告待确认'

  return DUE_STAGES.map((s, i) => {
    let done = false
    let active = false
    if (isComplete) {
      done = true
    } else if (currentIdx >= 0) {
      if (i < currentIdx) done = true
      else if (i === currentIdx) active = true
    }
    return { ...s, done, active }
  })
})

// ── 默认选中阶段 ──
const _initialStageKey = computed(() => {
  const t = task.value
  if (!t) return 'verify-business'
  if (t.status === '报告待确认' || t.status === '已完成') return 'artifacts'
  if (t.currentStep === 'risk') return 'risk'
  if (t.currentStep === 'tax-rpa') return 'tax-rpa'
  if (t.currentStep === 'materials') return 'materials'
  if (t.currentStep === 'evidence') return 'evidence'
  if (t.currentStep === 'verify-legal') return 'verify-legal'
  if (t.currentStep === 'verify-business') return 'verify-business'
  const firstIncomplete = DUE_STAGES.find(s => {
    const idx = DUE_STAGES.indexOf(s)
    const currentIdx2 = DUE_STAGES.findIndex(st => st.key === t.currentStep)
    return idx > currentIdx2
  })
  return firstIncomplete?.key || 'artifacts'
})
const selectedStageKey = ref(_initialStageKey.value)
watch(_initialStageKey, v => { selectedStageKey.value = v })

// ── 阶段标题 / 提示语映射 ──
const stageInfo = {
  'verify-business': {
    label: '工商核验',
    prompt: '工商核验已完成，企业主体状态正常存续，无工商异常。',
    waiting: '无（已完成）',
    tagType: 'success',
  },
  'verify-legal': {
    label: '司法查询',
    prompt: '司法查询已完成，发现 2 条高风险项：税票数据授权缺口、法人关联企业异常。',
    waiting: '无（已完成）',
    tagType: 'success',
  },
  'tax-rpa': {
    label: '税票采集',
    prompt: '税票采集需要企业授权。当前任务会保持在「等待客户」状态。你可以发送提醒，也可以在 demo 中点击「模拟企业已授权」继续采集。',
    waiting: '企业扫码授权',
    tagType: 'warning',
  },
  'materials': {
    label: '资料补充',
    prompt: '资料补充等待客户上传。你可以发送资料清单链接，或模拟企业上传资料。',
    waiting: '客户上传资料',
    tagType: 'warning',
  },
  'evidence': {
    label: '证据整合',
    prompt: '证据整合已完成，共收集 31 条有效证据，核心维度覆盖率 92%。',
    waiting: '无（已完成）',
    tagType: 'success',
  },
  'risk': {
    label: '风险诊断',
    prompt: '风险诊断已完成，共识别 8 项风险事项（2 高、2 中、2 低）。',
    waiting: '无（已完成）',
    tagType: 'success',
  },
  'artifacts': {
    label: '产物确认',
    prompt: '尽调产物已全部生成。报告草稿 V2 有 3 处结论待确认，确认后即可提交。',
    waiting: '客户经理确认和修改',
    tagType: 'primary',
  },
}

const currentStageLabel = computed(() => stageInfo[selectedStageKey.value]?.label || '—')
const assistantPrompt = computed(() => stageInfo[selectedStageKey.value]?.prompt || '')
const assistantStageTagType = computed(() => stageInfo[selectedStageKey.value]?.tagType || 'info')
const waitingItem = computed(() => stageInfo[selectedStageKey.value]?.waiting || '')

// ── 税票采集 artifact data ──
const taxArtifactData = computed(() => ({
  status: '等待授权',
  authStatus: '等待授权',
  linkStatus: '已发送',
  authUrl: 'https://ai-copilot.demo/auth/rpa002',
  input: { count: 0, total: 0 },
  output: { count: 0, total: 0 },
  filing: { status: '未采集' },
  logs: [
    { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
    { time: '10:35', desc: '授权链接已发送', status: 'done' },
    { time: '—',    desc: '等待企业扫码授权',       status: 'waiting' },
  ],
}))

// ── 资料补充 artifact data ──
const materialsArtifactData = computed(() => ({
  status: '待补充',
  completeness: 67,
  materials: [
    { name: '营业执照', type: '工商', status: '已收集' },
    { name: '法人身份证', type: '工商', status: '已收集' },
    { name: '2025年度审计报告', type: '财务', status: '已收集' },
    { name: '近三年纳税申报表', type: '税票', status: '已收集' },
    { name: '主要销售合同', type: '合同', status: '已收集' },
    { name: '征信授权书', type: '授权', status: '已收集' },
    { name: '主要采购合同', type: '合同', status: '已收集' },
    { name: '财务报表附注', type: '财务', status: '已收集' },
    { name: '最新财务报表', type: '财务', status: '待补充' },
    { name: '主要合同', type: '合同', status: '待补充' },
    { name: '应收账款明细', type: '财务', status: '待补充' },
    { name: '电费缴费记录', type: '其他', status: '待补充' },
  ],
  missing: [
    { name: '最新财务报表', note: '需最近一期财务报表' },
    { name: '主要合同', note: '需近半年主要采购/销售合同' },
    { name: '应收账款明细', note: '需前五大客户应收账款明细' },
    { name: '电费缴费记录', note: '需近12个月电费缴费凭证' },
  ],
}))

// ── 产物确认 artifact data ──
const deliverablesArtifactData = computed(() => ({
  items: [
    { name: '证据包', status: '已归档', count: '31 条', type: 'evidence' },
    { name: '风险诊断摘要', status: '已生成', count: '8 项', type: 'risk' },
    { name: '尽调报告草稿', status: 'V2 待确认', count: 'V2', type: 'report' },
    { name: '客户补充清单', status: '可发送', count: '4 项', type: 'checklist' },
  ],
  reportSections: [
    { id: 'c1', no: '一', title: '企业基本情况', content: '唐山物桥商贸有限公司成立于2021年，注册资本500万元，法定代表人张某某，经营范围为建材批发。', materials: ['工商登记信息'] },
    { id: 'c2', no: '二', title: '行业与市场分析', content: '企业主营建材批发，属于传统商贸流通行业，行业竞争激烈，利润率偏低。', evidence: ['行业报告', '市场调研数据'] },
    { id: 'c3', no: '三', title: '财务分析', content: '企业2025年度营业收入约2175万元，净利润约43万元，税负率0.8%显著低于行业平均。', materials: ['审计报告', '纳税申报表'], pending: ['税负异常说明待补充'] },
  ],
  riskConclusion: false,
  taxNote: false,
  creditAdvice: false,
}))

// ── 快捷操作按钮 ──
const assistantActions = computed(() => {
  const stage = selectedStageKey.value
  if (stage === 'tax-rpa') {
    return [
      { label: '发送提醒', type: 'primary', handler: handleSendReminder },
      { label: '模拟企业已授权', type: '', handler: handleTaxAuthorized },
      { label: '改为上传材料', type: '', handler: handleSwitchToUpload },
      { label: '稍后继续', type: 'info', handler: handleLaterContinue },
      { label: '回到工作台', type: 'info', handler: () => go('/workbench') },
    ]
  }
  if (stage === 'materials') {
    return [
      { label: '发送资料清单', type: 'primary', handler: handleSendMaterialList },
      { label: '模拟企业上传资料', type: '', handler: handleMockMaterialUpload },
      { label: '稍后继续', type: 'info', handler: handleLaterContinue },
      { label: '回到工作台', type: 'info', handler: () => go('/workbench') },
    ]
  }
  if (stage === 'artifacts') {
    return [
      { label: '编辑报告', type: 'primary', handler: handleEditReport },
      { label: '导出报告', type: '', handler: handleExportReport },
      { label: '稍后继续', type: 'info', handler: handleLaterContinue },
      { label: '回到工作台', type: 'info', handler: () => go('/workbench') },
    ]
  }
  // 通用
  return [
    { label: '稍后继续', type: 'info', handler: handleLaterContinue },
    { label: '回到工作台', type: 'info', handler: () => go('/workbench') },
  ]
})

// ── 助手操作 handlers ──
function handleSendReminder() {
  ElMessage.success('已发送企业授权提醒')
}

function handleTaxAuthorized() {
  ElMessage.success('已模拟企业授权，税票采集完成')
}

function handleSwitchToUpload() {
  ElMessage.info('已切换为手动上传模式，可前往资料补充环节上传税票文件')
  selectedStageKey.value = 'materials'
}

function handleLaterContinue() {
  ElMessage.info('任务已保留在当前阶段，可稍后继续处理')
}

function handleSendMaterialList() {
  ElMessage.success('资料清单链接已生成并发送')
}

function handleMockMaterialUpload() {
  ElMessage.success('已模拟企业上传资料')
}

function handleEnterEvidence() {
  selectedStageKey.value = 'evidence'
  ElMessage.success('已进入证据整合阶段')
}

function handleEditReport() {
  ElMessage.info('即将打开尽调报告编辑器')
}

function handleExportReport() {
  ElMessage.success('报告已开始导出')
}

function handleStartMonitor() {
  ElMessage.success('已加入监控列表')
}

// ── 工具函数 ──
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

function getProgressColor(p) {
  if (p >= 100) return 'var(--color-success, #67c23a)'
  if (p >= 60) return 'var(--color-primary, #409eff)'
  if (p >= 30) return 'var(--color-warning, #e6a23c)'
  return 'var(--text-tertiary, #909399)'
}
</script>

<style scoped>
/* ═══ 全局布局 ═══ */
.due-task {
  max-width: var(--layout-page-data, 1200px);
  margin: 0 auto;
  padding: var(--space-4xl, 32px);
}

/* ═══ 任务头部 ═══ */
.due-task__header {
  margin-bottom: var(--space-lg);
}
.due-task__header-top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}
.back-btn { flex-shrink: 0; }
.due-task__name {
  font-size: var(--font-size-page-title, 24px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
  margin: 0;
}
.due-task__meta {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary);
}

.due-task__header-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm, 8px);
}
.due-task__score {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary);
}
.due-task__score b {
  font-weight: 700;
  color: var(--text-primary);
}
.due-task__material-meta {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary);
}

/* ═══ 流程进度条 ═══ */
.due-task__process-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-lg);
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}
.due-task__process-bar .process-step { flex: 1; }
.due-task__process-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
  margin-left: auto;
  padding-left: var(--space-md);
  border-left: 1px solid var(--border-divider);
}
.due-task__process-text {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary);
  white-space: nowrap;
}

/* 流程节点 */
.process-step {
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
.process-step:hover { background: var(--surface-soft); }
.process-step__node {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  font-weight: 600;
}
.process-step--done .process-step__node { background: var(--color-success); color: #fff; }
.process-step--active .process-step__node {
  background: #fff; color: var(--color-primary);
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-success-bg);
}
.process-step--pending .process-step__node {
  background: var(--surface-page); color: var(--text-tertiary);
  border: 1px solid var(--border-light);
}
.process-step__label { font-size: var(--font-size-xs); white-space: nowrap; }
.process-step--done .process-step__label { color: var(--text-primary); font-weight: 500; }
.process-step--active .process-step__label { color: var(--color-primary); font-weight: 600; }
.process-step--pending .process-step__label { color: var(--text-tertiary); }
.process-step--active::after {
  content: ''; position: absolute; bottom: -4px;
  left: 20%; right: 20%; height: 2px;
  background: var(--color-primary); border-radius: 1px;
}
.process-step__connector { flex: 1; height: 2px; min-width: 12px; margin: 0 var(--space-xs); pointer-events: none; }
.process-step__connector--done { background: var(--color-success); }
.process-step__connector--active { background: linear-gradient(to right, var(--color-primary), var(--border-light)); }
.process-step__connector--pending { background: var(--border-divider); }

/* Active pulse */
.process-step__pulse {
  position: absolute; width: 36px; height: 36px;
  border-radius: 50%; border: 2px solid var(--color-primary);
  opacity: 0.4; animation: process-pulse 2s ease-in-out infinite;
}
@keyframes process-pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.6); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .process-step__pulse { animation: none; opacity: 0.2; }
}
.process-step__active-icon { position: relative; z-index: 1; }

/* ═══ 主体两栏 ═══ */
.due-task__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-lg);
  align-items: start;
}

/* ═══ 左侧工作区 ═══ */
.due-task__workspace { min-width: 0; }
.workspace-card :deep(.el-card__header) { padding: var(--space-md) var(--space-lg); }
.workspace-card :deep(.el-card__body) { padding: var(--space-lg); }

/* 通用 artifact 展示 */
.artifact-generic__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); }
.artifact-generic__title { font-size: var(--font-size-body-lg, 15px); font-weight: 600; color: var(--text-primary); }
.artifact-generic__summary {
  font-size: var(--font-size-sm, 13px); color: var(--text-secondary);
  margin-bottom: var(--space-md); padding: var(--space-sm) var(--space-md);
  background: var(--surface-soft); border-radius: var(--radius-sm);
}
.artifact-generic__risks {
  display: grid;
  gap: var(--space-sm);
}
.risk-entry {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--surface-card);
}
.risk-entry__level {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full, 999px);
  font-size: var(--font-size-xs, 12px);
  color: var(--color-warning);
  background: var(--color-warning-light, #fdf6ec);
}
.risk-entry__level--high {
  color: var(--color-danger);
  background: var(--color-danger-light, #fef0f0);
}
.risk-entry__level--low {
  color: var(--color-success);
  background: var(--color-success-light, #f0f9eb);
}
.risk-entry__text {
  color: var(--text-primary);
  font-size: var(--font-size-sm, 13px);
}

/* ═══ 右侧助手 ═══ */
.due-task__assistant {
  min-width: 0;
  position: sticky;
  top: var(--space-lg);
}
.assistant-card {
  border-color: var(--border-light);
}
.assistant-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.assistant-card__title {
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
}
.assistant-card__stage-info,
.assistant-card__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.assistant-card__stage-info {
  margin-bottom: var(--space-md);
}
.assistant-card__stage-label,
.assistant-card__actions-label,
.assistant-card__status-label,
.assistant-card__status-key {
  color: var(--text-secondary);
  font-size: var(--font-size-sm, 13px);
}
.assistant-card__actions {
  margin-top: var(--space-lg);
}
.assistant-card__actions-grid {
  display: grid;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}
.assistant-card__status {
  display: grid;
  gap: var(--space-sm);
}
.assistant-card__status-label {
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
}
.assistant-card__status-value {
  color: var(--text-primary);
  font-size: var(--font-size-sm, 13px);
}

.due-task__empty {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1280px) {
  .due-task__body {
    grid-template-columns: 1fr;
  }
  .due-task__assistant {
    position: static;
  }
}
</style>
