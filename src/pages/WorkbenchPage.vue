<template>
  <div class="page page--wide">
    <!-- ==================== Normal View ==================== -->
    <div v-if="!assistant.dialogOpen" class="workbench-normal">
      <header class="wb-header">
        <div class="wb-header-left">
          <h1 class="wb-greeting">{{ greeting }}，张经理</h1>
          <p class="wb-date">{{ formattedDate }}</p>
        </div>
        <div class="wb-header-right">
          <el-badge :value="3" :max="99" class="wb-notification">
            <el-button :icon="Bell" circle size="default" />
          </el-badge>
        </div>
      </header>

      <div class="wb-main">
        <!-- 首要区域：今日待办 + 内联 AI 建议 -->
        <section class="wb-section wb-todos wb-section--primary">
          <div class="wb-section-title wb-section-title--primary">
            <span class="wb-section-label">今日待办</span>
            <el-tag size="small" round type="info">{{ todos.length }}</el-tag>
          </div>
          <div class="wb-todo-list">
            <div v-for="todo in todos" :key="todo.id" class="wb-todo-item" :class="{ 'wb-todo-item--primary': todo.level === 'danger' }">
              <span class="wb-todo-dot" :class="`level-${todo.level}`"></span>
              <span class="wb-todo-text"><strong>{{ todo.enterprise }}</strong> · {{ todo.desc }}<span v-if="todo.level === 'danger'" class="wb-todo-ai-badge">AI 建议优先处理</span></span>
              <el-button size="small" type="primary" link @click="go(todo.route)">{{ todo.action }}</el-button>
            </div>
          </div>

          <!-- 内联 AI 建议：紧跟待办下方，非独立卡片 -->
          <div class="wb-ai-inline">
            <div class="wb-ai-inline-header">
              <el-icon class="wb-ai-inline-icon"><MagicStick /></el-icon>
              <span class="wb-ai-inline-label">推荐下一步</span>
            </div>
            <p class="wb-ai-inline-text">优先处理「宁波天合新材料」税票超时事项；杭州智造装备证据已齐，可进入报告确认。</p>
            <div class="wb-ai-inline-actions">
              <el-button size="small" type="primary" plain @click="handleAdopt">采纳建议</el-button>
              <el-button size="small" plain @click="handleIgnore">稍后处理</el-button>
            </div>
          </div>

          <!-- Agent 指令输入区：嵌入今日待办区域 -->
          <div class="wb-agent-input">
            <div class="wb-agent-label">
              <el-icon class="wb-agent-label-icon"><Promotion /></el-icon>
              <span>下一步让 AI 处理</span>
            </div>
            <div class="wb-agent-input-row">
              <el-input
                v-model="dialogInputLocal"
                placeholder="可追问：宁波天合税票为什么超时？或输入新的客户任务"
                clearable
                @keyup.enter="handleNormalSend"
                size="large"
                class="wb-agent-input-inner"
              >
                <template #prefix><el-icon><ChatDotRound /></el-icon></template>
                <template #append>
                  <el-button type="primary" @click="handleNormalSend">
                    <el-icon><Promotion /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
            <div class="wb-agent-chips">
              <button class="wb-agent-chip" @click="handleNormalSendWith('处理税票')">
                <el-icon><Tickets /></el-icon>处理税票
              </button>
              <button class="wb-agent-chip" @click="handleNormalSendWith('查看证据')">
                <el-icon><Picture /></el-icon>查看证据
              </button>
              <button class="wb-agent-chip" @click="go('/screening')">
                <el-icon><Search /></el-icon>发起筛客
              </button>
              <button class="wb-agent-chip" @click="handleNormalSendWith('生成报告摘要')">
                <el-icon><DocumentChecked /></el-icon>生成报告摘要
              </button>
            </div>
          </div>
        </section>

        <!-- 次要区域：本周进度（紧凑） -->
        <section class="wb-section wb-weekly wb-section--compact">
          <div class="wb-section-title wb-section-title--compact"><span class="wb-section-label">本周进度</span></div>
          <div class="wb-weekly-stats">
            <div class="wb-weekly-stat"><span class="wb-stat-value" style="color:var(--color-success)">3</span><span class="wb-stat-label">本周完成尽调</span></div>
            <div class="wb-weekly-stat"><span class="wb-stat-value" style="color:var(--color-warning)">5</span><span class="wb-stat-label">在途</span></div>
            <div class="wb-weekly-stat"><span class="wb-stat-value" style="color:var(--text-tertiary)">12</span><span class="wb-stat-label">监测企业</span></div>
          </div>
        </section>

        <!-- 快捷操作（4 个，轻量） -->
        <section class="wb-section wb-quick wb-section--compact">
          <div class="wb-section-title wb-section-title--compact"><span class="wb-section-label">快捷操作</span></div>
          <div class="wb-quick-actions">
            <el-button v-for="qa in quickActions" :key="qa.label" class="wb-quick-btn" @click="go(qa.route)">
              <el-icon><component :is="iconMap[qa.icon]" /></el-icon><span>{{ qa.label }}</span>
            </el-button>
          </div>
        </section>

        <!-- 我的任务（详情队列，视觉次要） -->
        <section class="wb-section wb-tasks wb-section--secondary">
          <div class="wb-section-title wb-section-title--secondary"><span class="wb-section-label">我的任务</span></div>
          <el-table :data="tasks" stripe size="small" class="wb-task-table">
            <el-table-column prop="name" label="企业名称" min-width="140" />
            <el-table-column prop="type" label="类型" width="70" align="center" />
            <el-table-column label="进度" width="160">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" :status="progressStatus(row.progress)" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small" round>{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="下一步" width="120" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="go(row.route)">{{ row.next }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </div>

    </div>

    <!-- ==================== Conversation View ==================== -->
    <div v-else class="workbench-dialog-wrap">
      <header class="wb-dialog-header">
        <div class="wb-dialog-header-left">
          <el-button class="btn-return" @click="returnToNormal" plain size="default">
            <el-icon><ArrowLeft /></el-icon><span>返回工作台</span>
          </el-button>
          <span class="wb-dialog-title">AI Copilot</span>
          <span v-if="assistant.flowStages.length" class="assist-status">
            <span class="pulse-dot"></span> 自动推进中
          </span>
        </div>
        <div class="wb-dialog-header-right">
          <el-button text @click="clearChat" size="small">清空对话</el-button>
        </div>
      </header>

      <!-- Stage Strip -->
      <WorkbenchStageStrip
        v-if="assistant.flowStages.length"
        :stages="assistant.flowStages"
        :active-stage-id="assistant.activeStageId"
        @select="assistant.setActiveStage"
      />

      <div class="workbench-dialog-body">
        <!-- Left: Conversation + Process -->
        <div class="wb-dialog-left">
          <WorkbenchConversation
            :messages="assistant.messages"
            :flow-stages="assistant.flowStages"
            :waiting-for-input="assistant.waitingForInput"
            :active-stage-id="assistant.activeStageId"
            :is-thinking="assistant.isThinking"
            :thinking-text="assistant.thinkingText"
          />
        </div>

        <!-- Right: Artifact Panel -->
        <div v-if="assistant.currentArtifactType" class="wb-dialog-right">
          <div class="wb-right-header">
            <span class="wb-right-header-title">阶段产物</span>
            <el-button text size="small" @click="assistant.currentArtifactType = null">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="wb-right-content">
            <WorkbenchArtifactPanel
              :type="assistant.currentArtifactType"
              :data="assistant.artifactData"
              :current-flow-status="assistant.currentFlowStatus"
              @select-customer="assistant.selectCustomerAndStartDueDiligence"
              @tax-authorized="assistant.markTaxAuthorizedAndContinue"
              @confirm-tax-send="onConfirmTaxSend"
              @defer-tax-send="onDeferTaxSend"
            />
          </div>
        </div>
      </div>

      <!-- Suggestion Bar (快捷回复) -->
      <div v-if="assistant.contextSuggestions.length" class="wb-suggestion-bar">
        <button
          v-for="(s, si) in assistant.contextSuggestions"
          :key="si"
          class="wb-suggestion-btn"
          @click="handleSuggestionClick(s)"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- Composer -->
      <div class="wb-dialog-input">
        <el-input
          v-model="dialogInputLocal"
          :placeholder="dialogPlaceholder"
          clearable
          @keyup.enter="sendDialogMessage"
          size="large"
          class="wb-dialog-input-inner"
        >
          <template #prefix><el-icon><ChatDotRound /></el-icon></template>
          <template #append>
            <el-button type="primary" @click="sendDialogMessage">
              <el-icon><Promotion /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Plus, Search, Tickets, Picture, OfficeBuilding, Warning, ArrowLeft, ChatDotRound, Promotion, Close, MagicStick, DocumentChecked } from '@element-plus/icons-vue'
import { useWorkbenchAssistantStore } from '../stores/workbenchAssistant.js'
import WorkbenchStageStrip from '../components/workbench/WorkbenchStageStrip.vue'
import WorkbenchConversation from '../components/workbench/WorkbenchConversation.vue'
import WorkbenchArtifactPanel from '../components/workbench/WorkbenchArtifactPanel.vue'

const router = useRouter()
const assistant = useWorkbenchAssistantStore()
const dialogInputLocal = ref('')

// ===================== Normal View Data =====================
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
const iconMap = { Plus, Search, Tickets, Picture, OfficeBuilding, Warning }

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'; if (h < 9) return '早上好'; if (h < 12) return '上午好'
  if (h < 14) return '中午好'; if (h < 18) return '下午好'; return '晚上好'
})
const formattedDate = computed(() => {
  const now = new Date()
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`
})

function go(path) { router.push(path) }
function progressStatus(pct) { if (pct === 100) return 'success'; if (pct >= 60) return ''; if (pct > 0) return 'warning'; return 'exception' }
function statusTagType(s) { const m = { '待确认': 'warning', '超时': 'danger', '处理中': '', '过期': 'danger', '完成': 'success' }; return m[s] || 'info' }
function handleAdopt() { assistant.sendMessage('帮我查看杭州智造装备的尽调报告并确认') }
function handleIgnore() {}
function handleNormalSendWith(text) {
  dialogInputLocal.value = text
  handleNormalSend()
}

function onConfirmTaxSend() {
  assistant.confirmTaxAndContinue()
}

function onDeferTaxSend() {
  assistant.sendMessage('稍后再发')
}

const dialogPlaceholder = computed(() => {
  const status = assistant.currentFlowStatus
  const data = assistant.artifactData
  if (status === 'waiting_selection') {
    return '回复企业名称或序号选择企业...'
  }
  if (status === 'waiting_confirmation' && data.linkStatus === '未发送') {
    return '请点击"确认发送采集链接"，或回复"确认发送"...'
  }
  if (status === 'waiting_tax_authorization') {
    return '企业完成线下授权后，点击按钮或回复"企业已授权"...'
  }
  if (status === 'waiting_confirmation' && data.status === '待确认') {
    return '请确认报告或稍后处理...'
  }
  if (status === 'completed') {
    return '可以询问进度、查看结果或调整监控规则...'
  }
  return '例如：筛选深圳的软件企业 / 发起尽调 / 进度如何'
})

// ===================== Conversation Mode =====================
function handleNormalSend() {
  const text = dialogInputLocal.value.trim(); if (!text) return
  dialogInputLocal.value = ''
  assistant.sendMessage(text)
}
function sendDialogMessage() {
  const text = dialogInputLocal.value.trim(); if (!text) return
  dialogInputLocal.value = ''
  assistant.sendMessage(text)
}
function returnToNormal() { assistant.reset() }
function clearChat() { assistant.reset() }

function handleSuggestionClick(suggestion) {
  switch (suggestion.type) {
    case 'confirm_tax_send':
      assistant.confirmTaxAndContinue()
      break
    case 'defer_tax_send':
      assistant.sendMessage('稍后处理')
      break
    case 'tax_authorized':
      assistant.markTaxAuthorizedAndContinue()
      break
    case 'confirm_report':
      assistant.confirmReportAndContinue()
      break
    case 'send_text':
      assistant.sendMessage(suggestion.text)
      break
    case 'select_customer':
      assistant.selectCustomerAndStartDueDiligence(suggestion.customer)
      break
    case 'set_active_stage':
      assistant.setActiveStage(suggestion.stageId)
      break
    default:
      assistant.sendMessage(suggestion.label)
  }
}

defineExpose({ openDialog: assistant.sendMessage })
</script>

<style scoped>
.page { padding:var(--space-2xl) 32px 120px; max-width: 1200px; margin: 0 auto; }
.page--wide { max-width: 100%; padding:var(--space-2xl) 48px 120px; }

/* Normal View */
.wb-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom:var(--space-2xl); }
.wb-greeting { font-size:var(--font-size-workbench-title); font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.wb-date { font-size:var(--font-size-lg); color: var(--text-tertiary); margin: 0; }
.wb-notification { margin-top:var(--space-xs); }

/* ====== Base section ====== */
.wb-section { background: var(--surface-card); border-radius:var(--radius-md); padding:var(--space-xl) var(--space-xl); border: 1px solid var(--border-default); margin-bottom:var(--space-lg); }

.wb-section-title { display: flex; align-items: center; gap:var(--space-xs); font-size:var(--font-size-xl); font-weight: 600; color: var(--text-primary); margin-bottom:var(--space-lg); }
.wb-section-label { font-size:var(--font-size-body); }

/* ====== 今日待办 — 首要区域 ====== */
.wb-section--primary { padding:var(--space-2xl); }
.wb-section-title--primary { font-size:var(--font-size-section-title); margin-bottom:var(--space-xl); }

.wb-todo-list { display: flex; flex-direction: column; gap:var(--space-md); }
.wb-todo-item { display: flex; align-items: center; gap:var(--space-md); padding:var(--space-md) var(--space-lg); border-radius:var(--radius-md); border: 1px solid var(--border-soft); transition: background 0.15s ease; }
.wb-todo-item:hover { background: var(--surface-page); }
.wb-todo-item:last-child { border-bottom: 1px solid var(--border-soft); }
.wb-todo-item--primary { border-color: var(--color-warning); background: var(--color-warning-bg); }
.wb-todo-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.level-danger { background: var(--color-danger); box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12); }
.level-warning { background: var(--color-warning); }
.level-success { background: var(--color-success); }
.level-info { background: var(--text-tertiary); }
.wb-todo-text { flex: 1; font-size:var(--font-size-body-lg); color: var(--text-primary); display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
.wb-todo-ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-warning);
  color: #fff;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
}

/* ====== 内联 AI 建议 ====== */
.wb-ai-inline {
  margin-top: var(--space-2xl);
  padding: var(--space-lg);
  background: var(--surface-soft, var(--surface-page));
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
}
.wb-ai-inline-header { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); }
.wb-ai-inline-icon { color: var(--color-primary); font-size: 16px; }
.wb-ai-inline-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.wb-ai-inline-text { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin: 0 0 var(--space-sm); }
.wb-ai-inline-actions { display: flex; gap: var(--space-xs); }

/* ====== 次要区域 ====== */
.wb-section--compact { padding: var(--space-lg) var(--space-xl); }
.wb-section-title--compact { font-size: var(--font-size-body-lg); margin-bottom: var(--space-md); }

.wb-weekly-stats { display: flex; gap: var(--space-2xl); }
.wb-weekly-stat { display: flex; align-items: baseline; gap: var(--space-sm); }
.wb-stat-value { font-size:var(--font-size-metric); font-weight: 700; line-height: 1; }
.wb-stat-label { font-size:var(--font-size-sm); color: var(--text-tertiary); }

/* ====== 任务表格 — 视觉次要 ====== */
.wb-section--secondary .wb-section-title { font-size: var(--font-size-body-lg); margin-bottom: var(--space-md); }
.wb-section-title--secondary { font-size: var(--font-size-body-lg); margin-bottom: var(--space-md); color: var(--text-secondary); }

/* ====== 快捷操作 ====== */
.wb-quick-actions { display: flex; flex-wrap: wrap; gap:var(--space-sm); }
.wb-quick-btn {
  display: inline-flex !important;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-page);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  transition: all 0.15s ease;
}
.wb-quick-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}
.wb-task-table { width: 100%; }

/* ====== Agent 指令输入区 ====== */
.wb-agent-input {
  margin-top: var(--space-xl);
  padding: var(--space-lg);
  background: var(--surface-soft, var(--surface-page));
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
}
.wb-agent-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}
.wb-agent-label-icon { color: var(--color-primary); font-size: 14px; }
.wb-agent-input-row { margin-bottom: var(--space-sm); }
.wb-agent-input-inner :deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.wb-agent-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.wb-agent-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--surface-card);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.wb-agent-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}
.wb-agent-chip .el-icon { font-size: 14px; }

/* ====== Conversation View ====== */
.workbench-dialog-wrap {
  display: flex; flex-direction: column;
  height: calc(100vh - 120px); min-height: 400px; max-width: 100%;
  background: var(--surface-page);
}

.wb-dialog-header {
  display: flex; justify-content: space-between; align-items: center;
  padding:var(--space-lg) 20px; flex-shrink: 0;
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-default);
  backdrop-filter: blur(12px);
}

.wb-dialog-header-left { display: flex; align-items: center; gap:var(--space-md); }
.btn-return { font-size:var(--font-size-body); }
.wb-dialog-title { font-size:var(--font-size-assist); font-weight: 600; color: var(--text-primary); }
.wb-dialog-header-right { display: flex; gap:var(--space-xs); }

.assist-status {
  display: inline-flex; align-items: center; gap: 7px;
  color: var(--text-secondary); font-size:var(--font-size-body);
}

.pulse-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 0 5px var(--color-success-light);
}

.workbench-dialog-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* Left: Chat (窄, ~30%) */
.wb-dialog-left {
  width: 380px; min-width: 320px; max-width: 460px;
  display: flex; flex-direction: column;
  background: var(--surface-page);
  border-right: 1px solid var(--border-default);
}

/* Right: Results (宽, ~70%) */
.wb-dialog-right {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  background: var(--surface-card);
}

/* animation removed */

.wb-right-header {
  display: flex; justify-content: space-between; align-items: center;
  padding:var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-default);
  background: var(--surface-card); flex-shrink: 0;
}

.wb-right-header-title { font-size:var(--font-size-body); font-weight: 600; color: var(--text-primary); }
.wb-right-content { flex: 1; overflow-y: auto; }

/* Composer */
.wb-dialog-input {
  flex: 0 0 auto;
  padding:var(--space-lg) 20px 18px;
  background: linear-gradient(180deg, transparent, var(--surface-page) 34%);
}

.wb-dialog-input-inner :deep(.el-input__wrapper) {
  border-radius:var(--radius-lg);
  box-shadow: var(--shadow-primary);
}

@media (max-width: 768px) {
  .page { padding:var(--space-lg); } .page--wide { padding:var(--space-lg); }
  .wb-row-top { grid-template-columns: 1fr; }
  .wb-quick-actions { grid-template-columns: repeat(3, 1fr); display: grid; }
  .wb-dialog-right { width: 300px; min-width: 300px; }
}

/* ====== Suggestion Bar (快捷回复) ====== */
.wb-suggestion-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-divider);
  background: var(--surface-card);
}

.wb-suggestion-btn {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--surface-page);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  line-height: 1.4;
}

.wb-suggestion-btn:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.wb-suggestion-btn:active {
  transform: translateY(0);
}

</style>
