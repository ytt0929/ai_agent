<template>
  <div class="wb-page">
    <!-- ==================== Normal View (工作台首页) ==================== -->
    <div v-if="!assistant.dialogOpen" class="wb-home">
      <header class="wb-home__header">
        <div>
          <h1 class="wb-home__greeting">{{ greeting }}，张经理</h1>
          <p class="wb-home__date">{{ formattedDate }}</p>
        </div>
        <el-badge :value="3" :max="99">
          <el-button :icon="Bell" circle />
        </el-badge>
      </header>

      <!-- ══ 第一屏：AI Copilot 主输入面板 ══ -->
      <section class="wb-ai-hero">
        <div class="wb-ai-hero__head">
          <div class="wb-ai-hero__eye">AI Copilot</div>
          <h2 class="wb-ai-hero__title">用一句话开始客户经营</h2>
          <p class="wb-ai-hero__desc">可以自然语言筛客、探索企业、发起尽调、查风险、生成报告。</p>
        </div>
        <div class="wb-ai-hero__example">
          <span class="wb-ai-hero__example-label">查询示例</span>
          <el-button link type="primary" size="small" class="wb-ai-hero__example-btn" @click="fillDemoQuery">
            筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户
          </el-button>
          <el-button type="primary" plain size="small" @click="sendDemoQuery">直接发送</el-button>
        </div>
        <el-input
          v-model="dialogInputLocal"
          placeholder="例如：筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户"
          clearable
          size="large"
          @keyup.enter="handleNormalSend"
          class="wb-ai-hero__input"
        >
          <template #prefix><el-icon><ChatDotRound /></el-icon></template>
          <template #append><el-button type="primary" @click="handleNormalSend"><el-icon><Promotion /></el-icon></el-button></template>
        </el-input>
      </section>

      <!-- ══ 第二层：推荐下一步 ══ -->
      <section class="wb-ai-recommend">
        <div class="wb-ai-recommend__header"><el-icon><MagicStick /></el-icon> 推荐下一步</div>
        <p class="wb-ai-recommend__text">优先处理「宁波天合新材料」税票超时事项；杭州智造装备证据已齐，可进入报告确认。</p>
      </section>

      <!-- ══ 第三层：今日待办 ══ -->
      <section class="wb-card wb-card--wide wb-todos-section">
        <h2 class="wb-card__title">今日待办 <el-tag size="small" round type="info">{{ todos.length }}</el-tag></h2>
        <div class="wb-todo-list">
          <div v-for="todo in todos" :key="todo.id" class="wb-todo" :class="{ 'wb-todo--urgent': todo.level === 'danger' }">
            <span class="wb-todo__dot" :class="`wb-todo__dot--${todo.level}`"></span>
            <span class="wb-todo__text"><strong>{{ todo.enterprise }}</strong> · {{ todo.desc }}</span>
            <el-button size="small" type="primary" link @click="go(todo.route)">{{ todo.action }}</el-button>
          </div>
        </div>
      </section>

      <!-- ══ 第四层：我的任务 ══ -->
      <section class="wb-card wb-card--wide">
        <h2 class="wb-card__title wb-card__title--sm">我的任务</h2>
        <el-table :data="tasks" stripe size="small">
          <el-table-column prop="name" label="企业名称" min-width="140" />
          <el-table-column prop="type" label="类型" width="70" align="center" />
          <el-table-column label="进度" width="160">
            <template #default="{ row }"><el-progress :percentage="row.progress" :status="pStatus(row.progress)" :stroke-width="8" /></template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }"><el-tag :type="sTag(row.status)" size="small" round>{{ row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column label="下一步" width="120" align="center">
            <template #default="{ row }"><el-button size="small" type="primary" link @click="go(row.route)">{{ row.next }}</el-button></template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <!-- ==================== AI Copilot 二级页 ==================== -->
    <div v-else class="wb-copilot" :class="`wb-copilot--${assistant.layoutMode}`">

      <!-- ============ 态1：居中对话 ============ -->
      <div v-if="assistant.layoutMode === 'chat-center'" class="wb-state-center">
        <div class="wb-state-center__col">
          <div class="wb-state-center__msgs">
            <WorkbenchConversation
              :messages="assistant.messages"
              :flow-stages="assistant.flowStages"
              :waiting-for-input="assistant.waitingForInput"
              :active-stage-id="assistant.activeStageId"
              :is-thinking="assistant.isThinking"
              :thinking-text="assistant.thinkingText"
            />
          </div>
          <div class="wb-composer wb-composer--center">
            <div v-if="assistant.contextSuggestions.length" class="wb-sug">
              <el-button
                v-for="s in assistant.contextSuggestions"
                :key="s.value"
                size="small"
                round
                plain
                type="primary"
                @click="handleWorkbenchSuggestion(s)"
              >
                {{ s.label }}
              </el-button>
            </div>
            <div class="wb-composer-row">
              <el-input
                v-model="dialogInputLocal"
                :placeholder="dialogPlaceholder"
                clearable
                @keyup.enter="sendMsg"
                class="wb-composer__input"
              />
              <el-button type="primary" :icon="Promotion" @click="sendMsg" />
            </div>
            <div class="wb-quick-row">
              <button class="wb-quick-sm" v-for="qa in quickActions" :key="qa.label" @click="go(qa.route)">
                <el-icon><component :is="iconMap[qa.icon]" /></el-icon><span>{{ qa.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 态2：左内容 + 右对话 ============ -->
      <div v-else class="wb-state-split-shell">
        <div class="wb-state-split">
          <!-- 左侧：业务内容 -->
          <main class="wb-state-split__left">
            <!-- 轻量工具栏 -->
            <div class="wb-workspace-toolbar">
              <el-button class="wb-workspace-back" circle @click="returnToNormal">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <div class="wb-workspace-title">
                <strong>{{ workspaceTitle }}</strong>
                <span v-if="statusText">· {{ statusText }}</span>
              </div>
            </div>
            <!-- 轻量阶段条（非尽调阶段显示） -->
            <WorkbenchStageStrip
              v-if="!assistant.isDueWorkspace && assistant.flowStages.length"
              class="wb-workspace-stages"
              :stages="assistant.flowStages"
              :active-stage-id="assistant.activeStageId"
              :readonly="true"
            />
            <!-- 尽调阶段：统一增强流程头部（所有尽调节点共用） -->
            <section v-if="assistant.isDueWorkspace && currentDueFlow" class="wb-due-flow-header">
              <div class="wb-due-flow-header__top">
                <div class="wb-due-flow-header__left">
                  <div class="wb-due-flow-header__title">{{ wbDueFlowEnterprise }}</div>
                  <div class="wb-due-flow-header__meta">{{ wbDueFlowMetaText }}</div>
                </div>
                <div class="wb-due-flow-header__badges">
                  <el-tag size="small" effect="plain" type="info">{{ wbDueFlowTemplate }}</el-tag>
                  <span class="wb-due-flow-header__badge-score">综合评分 <b>{{ wbDueFlowScore }}</b></span>
                  <el-tag size="small" effect="plain" type="warning">{{ wbDueFlowGrade }}</el-tag>
                  <el-tag size="small" effect="plain" :type="wbRiskTagType(wbDueFlowRisk)">{{ wbDueFlowRisk }}</el-tag>
                  <span class="wb-due-flow-header__badge-meta">资料完整度 {{ wbDueFlowCompleteness }}%</span>
                  <el-tag :type="wbFlowStatusTag" size="small" effect="plain">{{ currentDueFlow.statusText }}</el-tag>
                </div>
              </div>
              <div class="wb-due-flow-header__steps">
                <template v-for="(step, idx) in currentDueFlow.steps" :key="step.label">
                  <span class="wb-flow-step"
                    :class="wbFlowStepClass(step)">
                    <el-icon v-if="wbStepIsDone(step)" :size="13"><CircleCheck /></el-icon>
                    <template v-else-if="wbStepIsActive(step)">
                      <div class="wb-flow-step__pulse" />
                      <el-icon :size="13" class="wb-flow-step__active-icon"><Loading /></el-icon>
                    </template>
                    <span v-else class="wb-flow-step__num">{{ idx + 1 }}</span>
                    <span class="wb-flow-step__label">{{ step.label }}</span>
                  </span>
                  <span v-if="idx < currentDueFlow.steps.length - 1" class="wb-flow-step__line"
                    :class="wbFlowLineClass(step)"></span>
                </template>
              </div>
            </section>
            <WorkbenchBusinessPanel
              :tool="assistant.activeTool"
              :data="assistant.leftPanelData"
              @explore="onExplore"
              @select-template="onTpl"
              @start-monitor="assistant.startMonitor()"
              @start-due="assistant.startDueDiligence()"
              @confirm-tax-send="assistant.confirmTaxSend()"
              @tax-authorized="assistant.mockTaxAuthorized()"
              @enter-materials="assistant.runMaterialsStep()"
              @mock-material-upload="assistant.mockMaterialUpload()"
              @enter-evidence="assistant.enterEvidenceMerge()"
              @enter-risk="assistant.enterRiskDiagnosis()"
              @enter-deliverables="assistant.enterDeliverables()"
              @edit-report="assistant.startReportEditor()"
              @export-report="assistant.exportFinalReport()"
              @view-diagnosis-report="assistant.viewDiagnosisReport()"
              @sync-report="assistant.enterDeliverables()"
              @send-material-list="assistant.sendMaterialList()"
              @send-reminder="assistant.sendTaxAuthReminder()"
              @switch-to-upload="assistant.switchTaxToMaterialUpload()"
              @generate-delivery-package="assistant.generateDeliveryPackage()"
              @mock-download="assistant.mockDownloadDeliveryPackage()"
              @view-list="assistant.viewDeliveryPackageList()"
            />
          </main>
          <!-- 右侧：AI 对话面板 -->
          <aside class="wb-state-split__right ai-assistant-panel">
            <div class="ai-assistant-panel__header">
              <h3 class="ai-assistant-panel__title">AI Copilot</h3>
              <el-button text size="small" @click="clearChat">清空</el-button>
            </div>
            <div class="ai-assistant-panel__messages">
              <WorkbenchConversation
                :messages="assistant.messages"
                :flow-stages="assistant.flowStages"
                :waiting-for-input="assistant.waitingForInput"
                :active-stage-id="assistant.activeStageId"
                :is-thinking="assistant.isThinking"
                :thinking-text="assistant.thinkingText"
              />
            </div>
            <div class="ai-assistant-panel__quick" v-if="assistant.contextSuggestions.length">
              <el-button
                v-for="s in assistant.contextSuggestions"
                :key="s.value"
                size="small"
                round
                plain
                type="primary"
                @click="handleWorkbenchSuggestion(s)"
              >
                {{ s.label }}
              </el-button>
            </div>
            <div class="ai-assistant-panel__footer">
              <el-input
                v-model="dialogInputLocal"
                :placeholder="dialogPlaceholder"
                clearable
                @keyup.enter="sendMsg"
                class="ai-assistant-panel__input"
              />
              <el-button type="primary" size="default" class="ai-assistant-panel__send" @click="sendMsg">发送</el-button>
            </div>
            <div class="ai-assistant-panel__quick-actions" v-if="false">
              <button class="wb-quick-sm" v-for="qa in quickActions" :key="qa.label" @click="go(qa.route)">
                <el-icon><component :is="iconMap[qa.icon]" /></el-icon><span>{{ qa.label }}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ArrowLeft, ChatDotRound, Promotion, MagicStick, DocumentChecked, Tickets, Picture, Search, Plus, CircleCheck, Loading } from '@element-plus/icons-vue'
import { useWorkbenchAssistantStore } from '../stores/workbenchAssistant.js'
import WorkbenchStageStrip from '../components/workbench/WorkbenchStageStrip.vue'
import WorkbenchConversation from '../components/workbench/WorkbenchConversation.vue'
import WorkbenchBusinessPanel from '../components/workbench/WorkbenchBusinessPanel.vue'

const router = useRouter()
const assistant = useWorkbenchAssistantStore()
const dialogInputLocal = ref('')

const todos = [
  { id: 't1', enterprise: '杭州智造装备', level: 'danger', desc: '报告待确认，证据已齐', action: '查看并确认', route: '/due-diligence/dd001' },
  { id: 't2', enterprise: '宁波天合新材料', level: 'warning', desc: '税票已超时，已等3天', action: '处理税票', route: '/tax-rpa' },
  { id: 't3', enterprise: '温州瑞达机械', level: 'success', desc: '税票采集中', action: '查看进度', route: '/due-diligence/dd003' },
  { id: 't4', enterprise: '新客户', level: 'info', desc: '建议先做快速筛查', action: '立即筛客', route: '/screening' },
]
const tasks = [
  { name: '杭州智造装备', type: '尽调', progress: 71, status: '待确认', next: '确认报告', route: '/due-diligence/dd001' },
  { name: '宁波天合新材料', type: '尽调', progress: 42, status: '超时', next: '处理税票', route: '/due-diligence/dd002' },
  { name: '温州瑞达机械', type: '尽调', progress: 60, status: '处理中', next: '查看进度', route: '/due-diligence/dd003' },
  { name: '嘉兴恒力纺织', type: '税票', progress: 0, status: '过期', next: '重新生成', route: '/tax-rpa' },
  { name: '绍兴金轮精密', type: '筛查', progress: 100, status: '完成', next: '查看名单', route: '/screening' },
]
const quickActions = [
  { label: '发起尽调', icon: 'Plus', route: '/due-diligence' },
  { label: '筛选客户', icon: 'Search', route: '/screening' },
  { label: '税票采集', icon: 'Tickets', route: '/tax-rpa' },
  { label: '识别文件', icon: 'Picture', route: '/doc-recognition' },
]
const iconMap = { Plus, Search, Tickets, Picture }

const demoQuery = '筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户'

function fillDemoQuery() {
  dialogInputLocal.value = demoQuery
}

function sendDemoQuery() {
  dialogInputLocal.value = demoQuery
  handleNormalSend()
}

const greeting = computed(() => { const h = new Date().getHours(); return h < 6 ? '夜深了' : h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好' })
const formattedDate = computed(() => { const d = new Date(); const days = ['周日','周一','周二','周三','周四','周五','周六']; return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${days[d.getDay()]}` })

const workspaceTitle = computed(() => {
  const m = {
    screening: '智能筛客',
    exploration: '企业探查',
    monitor: '企业监控',
    dueDiligence: '智能尽调',
    business: '工商核验',
    judicial: '司法查询',
    tax: '税票采集',
    materials: '资料补充',
    evidence: '证据整合',
    riskDiagnosis: '风险诊断',
    deliverables: '产物确认',
    reportEditor: '报告编辑',
  }
  return m[assistant.activeTool] || '工作台'
})

const statusText = computed(() => {
  if (assistant.currentFlowStatus === 'completed') return '流程已完成'
  if (assistant.waitingForInput) return '等待输入'
  if (assistant.isThinking || assistant.flowStages.length) return '自动推进中'
  return ''
})

const currentDueFlow = computed(() => {
  const stage = assistant.flowStages.find(s => s.id === assistant.currentArtifactType)
  return stage?.artifactData?.dueFlow || null
})

// ═══ 统一流程头部动态数据读取 ═══
const wbDueFlowEnterprise = computed(() => {
  return assistant.selectedEnterprise?.name
    || assistant.dueTaskHeader?.enterpriseName
    || assistant.dueTaskHeader?.name
    || assistant.leftPanelData?.enterprise?.name
    || '唐山物桥商贸有限公司'
})

const wbDueFlowMetaText = computed(() => {
  const ent = assistant.selectedEnterprise
  const industry = ent?.industry || assistant.dueTaskHeader?.industry || assistant.leftPanelData?.enterprise?.industry || '商贸流通'
  const region = ent?.region || assistant.dueTaskHeader?.region || assistant.leftPanelData?.enterprise?.region || '河北省唐山市'
  return [industry, region].filter(Boolean).join(' / ')
})

const wbDueFlowTemplate = computed(() => {
  return assistant.dueTaskHeader?.templateName
    || assistant.leftPanelData?.reportTemplate
    || '尽职调查报告'
})

const wbDueFlowScore = computed(() => {
  return assistant.dueTaskHeader?.score
    ?? assistant.selectedEnterprise?.score
    ?? assistant.leftPanelData?.score
    ?? 72
})

const wbDueFlowGrade = computed(() => {
  return assistant.dueTaskHeader?.grade
    ?? assistant.selectedEnterprise?.grade
    ?? assistant.leftPanelData?.grade
    ?? 'C+'
})

const wbDueFlowRisk = computed(() => {
  return assistant.dueTaskHeader?.riskLevel
    ?? assistant.selectedEnterprise?.riskLevel
    ?? assistant.leftPanelData?.riskLevel
    ?? '中风险'
})

const wbDueFlowCompleteness = computed(() => {
  return assistant.dueTaskHeader?.materialComplete
    ?? assistant.dueTaskHeader?.materialCompleteness
    ?? assistant.dueTaskHeader?.completeness
    ?? currentDueFlow.value?.materialComplete
    ?? currentDueFlow.value?.materialCompleteness
    ?? assistant.selectedEnterprise?.materialComplete
    ?? assistant.selectedEnterprise?.materialCompleteness
    ?? assistant.leftPanelData?.materialComplete
    ?? assistant.leftPanelData?.materialCompleteness
    ?? 86
})

const wbFlowStatusTag = computed(() => {
  const t = currentDueFlow.value?.statusText || ''
  if (t?.includes('完成')) return 'success'
  if (t?.includes('等待')) return 'warning'
  return 'info'
})

function wbStepIsDone(step) {
  return step.status === 'done' || step.done
}

function wbStepIsActive(step) {
  return step.status === 'active' || step.active
}

function wbStepIsPending(step) {
  return !wbStepIsDone(step) && !wbStepIsActive(step)
}

function wbFlowStepClass(step) {
  return {
    'wb-flow-step--done': wbStepIsDone(step),
    'wb-flow-step--active': wbStepIsActive(step),
    'wb-flow-step--pending': wbStepIsPending(step)
  }
}

function wbFlowLineClass(step) {
  return {
    'wb-flow-step__line--done': wbStepIsDone(step),
    'wb-flow-step__line--active': wbStepIsActive(step)
  }
}

function wbRiskTagType(level) {
  if (level === '高风险' || level === '高') return 'danger'
  if (level === '中风险' || level === '中') return 'warning'
  return 'success'
}

const dialogPlaceholder = computed(() => {
  const s = assistant.currentFlowStatus
  if (s === 'waiting_selection') return '回复企业名称或序号选择企业...'
  if (s === 'waiting_action') return '选择加入监控或新建尽调...'
  if (s === 'waiting_template') return '选择尽调模板...'
  if (s === 'waiting_tax_confirmation') return '确认发送采集链接...'
  if (s === 'waiting_tax_authorization') return '企业完成授权后回复"继续"...'
  if (s === 'waiting_report_action') return '修改报告 / 导出 / 加入监控...'
  if (s === 'editing') return '例如：帮我改写风险结论 / 补充税票异常说明...'
  return '例如：筛选深圳的软件企业 / 发起尽调 / 进度如何'
})

function go(path) { router.push(path) }
function pStatus(p) { return p === 100 ? 'success' : p >= 60 ? '' : p > 0 ? 'warning' : 'exception' }
function sTag(s) { return { '待确认':'warning', '超时':'danger', '处理中':'', '过期':'danger', '完成':'success' }[s] || 'info' }
function handleAdopt() { assistant.sendMessage('帮我查看杭州智造装备的尽调报告并确认') }
function handleIgnore() {}
function handleNormalSendWith(t) { dialogInputLocal.value = t; handleNormalSend() }
function onExplore(e) { assistant.selectEnterpriseAndExplore(e) }
function onTpl(t) { assistant.confirmDueTemplate(t) }

function handleNormalSend() { const t = dialogInputLocal.value.trim(); if (!t) return; dialogInputLocal.value = ''; assistant.runIntentRecognition(t) }
function sendMsg() { const t = dialogInputLocal.value.trim(); if (!t) return; dialogInputLocal.value = ''; assistant.sendMessage(t) }
function returnToNormal() { assistant.reset() }
function clearChat() { assistant.reset() }

// Phase 3-C: 工作台建议按钮点击（不再跳转尽调详情页）
function handleWorkbenchSuggestion(s) {
  assistant.handleSuggestionClick(s)
}
</script>

<style scoped>
/* ========== 页面壳 ========== */
.wb-page {
  height: 100vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== 工作台首页 ========== */
.wb-home {
  padding: 32px 48px 48px;
  overflow-y: auto;
  flex: 1;
  background: var(--bg-page, #f7faff);
}
.wb-home__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.wb-home__greeting { font-size: 28px; font-weight: 700; color: var(--text-primary, #1a1a2e); margin: 0 0 4px; }
.wb-home__date { font-size: 14px; color: var(--text-tertiary, #94a3b8); margin: 0; }

.wb-home__grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
.wb-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #dbe7f5); }
.wb-card--wide { grid-column: 1 / -1; }
.wb-todos-section { max-width: 100%; }
.wb-card__title { font-size: 16px; font-weight: 600; color: var(--text-primary, #1a1a2e); margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
.wb-card__title--sm { font-size: 14px; margin-bottom: 12px; }

.wb-todo-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.wb-todo { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color-light, #e5eaf2); transition: background 0.15s; }
.wb-todo:hover { background: var(--bg-card-hover, #f7faff); }
.wb-todo--urgent { border-color: var(--color-warning, #f59e0b); background: var(--color-warning-bg, #fffbeb); }
.wb-todo__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.wb-todo__dot--danger { background: var(--color-danger, #ef4444); box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
.wb-todo__dot--warning { background: var(--color-warning, #f59e0b); }
.wb-todo__dot--success { background: var(--color-success, #10b981); }
.wb-todo__dot--info { background: var(--text-tertiary, #94a3b8); }
.wb-todo__text { flex: 1; font-size: 14px; color: var(--text-primary, #1a1a2e); }

.wb-ai-recommend { background: var(--surface-card, #fff); border: 1px solid var(--border-color-light, #e5eaf2); border-radius: var(--radius-md); padding: 14px 20px; margin-bottom: 16px; }
.wb-ai-recommend__header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary, #1a1a2e); }
.wb-ai-recommend__header .el-icon { color: var(--color-primary, #2563eb); }
.wb-ai-recommend__text { font-size: 13px; color: var(--text-secondary, #64748b); line-height: 1.6; margin: 0 0 8px; }
.wb-ai-recommend__actions { display: flex; gap: 8px; }

/* ══ AI Hero 主输入面板 ══ */
.wb-ai-hero {
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-color, #dbe7f5);
  border-radius: var(--radius-lg, 12px);
  padding: 24px 28px;
  margin-bottom: 16px;
}
.wb-ai-hero__head { margin-bottom: 16px; }
.wb-ai-hero__eye {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary, #2563eb);
  background: var(--color-primary-bg, #eef2ff);
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-full, 9999px);
  margin-bottom: 8px;
}
.wb-ai-hero__title {
  font-size: var(--font-size-workbench-title, 24px);
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
  margin: 0 0 6px;
}
.wb-ai-hero__desc {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  margin: 0;
}
.wb-ai-hero__example {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 16px 0;
  padding: 10px 12px;
  background: var(--surface-page, #f7faff);
  border: 1px solid var(--border-color-divider, #f1f5f9);
  border-radius: var(--radius-md, 8px);
}
.wb-ai-hero__example-label {
  font-size: 12px;
  color: var(--text-tertiary, #94a3b8);
  flex-shrink: 0;
}
.wb-ai-hero__example-btn {
  font-size: 13px;
  padding: 0;
  height: auto;
}
.wb-ai-hero__input { width: 100%; }
.wb-ai-hero__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.wb-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border: 1px solid var(--border-color, #dbe7f5); border-radius: 20px; background: var(--bg-card, #fff); color: var(--text-secondary, #64748b); font-size: 13px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.wb-chip:hover { border-color: var(--color-primary, #2563eb); color: var(--color-primary, #2563eb); background: var(--color-primary-bg, #eef2ff); }
.wb-chip .el-icon { font-size: 14px; }

.wb-stats { display: flex; gap: 32px; }
.wb-stat { display: flex; align-items: baseline; gap: 8px; }
.wb-stat__num { font-size: 28px; font-weight: 700; line-height: 1; }
.wb-stat__label { font-size: 13px; color: var(--text-tertiary, #94a3b8); }

.wb-quick { display: flex; flex-wrap: wrap; gap: 8px; }
.wb-quick-btn { display: inline-flex !important; align-items: center; gap: 6px; padding: 4px 12px; border: 1px solid var(--border-color-light, #e5eaf2); border-radius: 8px; background: var(--bg-page, #f7faff); color: var(--text-secondary, #64748b); font-size: 13px; transition: all 0.15s; }
.wb-quick-btn:hover { border-color: var(--color-primary, #2563eb); color: var(--color-primary, #2563eb); background: var(--color-primary-bg, #eef2ff); }

/* ========== AI Copilot 二级页 ========== */
.wb-copilot {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--bg-page, #f7faff);
  overflow: hidden;
}


/* ═══════════════════════════════════════
   态1：居中对话
   780px max-width column, centered by parent flex
   ═══════════════════════════════════════ */
.wb-state-center {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 32px var(--space-3xl) 24px;
  background: var(--surface-page);
}

.wb-state-center__col {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 780px;
  min-height: 0;
  height: 100%;
}

.wb-state-center__msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 居中态气泡更窄 */
.wb-state-center__msgs :deep(.bubble.ai) { max-width: 72%; }
.wb-state-center__msgs :deep(.bubble.user) { max-width: 60%; }
.wb-state-center__msgs :deep(.process-card) { max-width: 82%; }

/* ═══════════════════════════════════════
   态2：左内容 + 右对话
   ═══════════════════════════════════════ */

/* 页面壳：增加留白容器 */
.wb-state-split-shell {
  flex: 1;
  min-height: 0;
  padding: 24px 28px 24px;
  overflow: hidden;
  background: var(--surface-page);
}

/* 主体工作区 */
.wb-state-split {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 24px;
  overflow: hidden;
}

/* 左侧业务区：独立滚动 */
.wb-state-split__left {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

/* Workspace toolbar inside left panel */
.wb-workspace-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-top: 4px;
}

.wb-workspace-back {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.wb-workspace-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wb-workspace-title strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.wb-workspace-title span {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Lightweight stage strip inside left panel */
.wb-workspace-stages {
  margin-bottom: 14px;
}

/* 右侧面板：复用 .ai-assistant-panel（已在 tokens.css 定义） */
.wb-state-split__right.ai-assistant-panel {
  min-width: 0;
  width: 420px;
  height: 100%;
  min-height: 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--surface-card);
}

/* 右侧面板气泡限制 */
.wb-state-split__right :deep(.bubble.ai) { max-width: 86%; }
.wb-state-split__right :deep(.bubble.user) { max-width: 76%; }
.wb-state-split__right :deep(.process-card) { max-width: 100%; }

/* 居中态 composer */
.wb-composer {
  flex-shrink: 0;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border-divider);
  background: var(--surface-page);
}
.wb-composer--center {
  background: linear-gradient(180deg, transparent 0%, var(--surface-page) 25%);
  border-top: none;
}
.wb-composer--center :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--color-primary);
}
.wb-composer__input :deep(.el-input__wrapper) { border-radius: 10px; }

.wb-composer-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}
.wb-composer-row .el-input { flex: 1; }
.wb-composer-row .el-button { flex-shrink: 0; }

/* 快捷小入口行 */
.wb-quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color-divider, #f1f5f9);
}
.wb-quick-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1px solid var(--border-color-light, #e5eaf2);
  border-radius: 16px;
  background: var(--surface-card, #fff);
  color: var(--text-secondary, #64748b);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.wb-quick-sm:hover { border-color: var(--color-primary, #2563eb); color: var(--color-primary, #2563eb); background: var(--color-primary-bg, #eef2ff); }
.wb-quick-sm .el-icon { font-size: 13px; }

/* 居中态 composer 建议按钮 */
.wb-composer .wb-sug {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 8px;
}

/* 左侧产物区表格/描述宽度控制 */
.wb-state-split__left :deep(.el-table),
.wb-state-split__left :deep(.el-descriptions),
.wb-state-split__left :deep(.el-tabs),
.wb-bp-table,
.wb-bp-tabs,
.wb-bp-desc {
  width: 100%;
  min-width: 0;
}

/* ═══ 统一增强流程头部（工作台尽调阶段） ═══ */
.wb-due-flow-header {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-lg);
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}

.wb-due-flow-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.wb-due-flow-header__left {
  min-width: 0;
}

.wb-due-flow-header__title {
  font-size: var(--font-size-workbench-title, 20px);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
  line-height: 1.3;
}

.wb-due-flow-header__meta {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary);
  line-height: 1.4;
}

.wb-due-flow-header__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.wb-due-flow-header__badge-score {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary);
  white-space: nowrap;
}

.wb-due-flow-header__badge-score b {
  color: var(--text-primary);
  font-weight: 700;
}

.wb-due-flow-header__badge-meta {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary);
  white-space: nowrap;
}

.wb-due-flow-header__steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color-divider);
}

/* 流程步骤 */
.wb-flow-step {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  white-space: nowrap;
  position: relative;
}

.wb-flow-step__num,
.wb-flow-step__active-icon,
.wb-flow-step__pulse {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wb-flow-step__num {
  border-radius: 50%;
  border: 1px solid var(--border-light);
  background: var(--surface-page);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs, 10px);
  font-weight: 600;
}

.wb-flow-step--done .el-icon {
  color: var(--color-success);
  font-size: 14px;
}

.wb-flow-step__pulse {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  opacity: 0.4;
  animation: wb-flow-pulse 2s ease-in-out infinite;
}

.wb-flow-step__active-icon {
  color: var(--color-primary);
  position: relative;
  z-index: 1;
}

.wb-flow-step__label {
  font-size: var(--font-size-xs, 12px);
}

.wb-flow-step--done .wb-flow-step__label {
  color: var(--text-primary);
  font-weight: 500;
}

.wb-flow-step--active .wb-flow-step__label {
  color: var(--color-primary);
  font-weight: 600;
}

.wb-flow-step--pending .wb-flow-step__label {
  color: var(--text-tertiary);
}

.wb-flow-step--active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

.wb-flow-step__line {
  flex: 1;
  min-width: 8px;
  max-width: 24px;
  height: 2px;
  background: var(--border-color-divider);
  border-radius: 1px;
}

.wb-flow-step__line--done {
  background: var(--color-success);
}

.wb-flow-step__line--active {
  background: linear-gradient(to right, var(--color-primary), var(--border-light));
}

@keyframes wb-flow-pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.6); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wb-flow-step__pulse { animation: none; opacity: 0.2; }
}

@media (max-width: 900px) {
  .wb-home { padding: 16px; }
  .wb-home__grid { grid-template-columns: 1fr; }
  .wb-state-split-shell { padding: 12px; }
  .wb-state-split {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .wb-state-split__right.ai-assistant-panel { width: 100%; max-width: 100%; height: 400px; }
  .wb-state-center__col { max-width: 100%; }
}
</style>
