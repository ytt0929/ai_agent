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

      <div class="wb-home__grid">
        <section class="wb-card wb-card--wide">
          <h2 class="wb-card__title">今日待办 <el-tag size="small" round type="info">{{ todos.length }}</el-tag></h2>
          <div class="wb-todo-list">
            <div v-for="todo in todos" :key="todo.id" class="wb-todo" :class="{ 'wb-todo--urgent': todo.level === 'danger' }">
              <span class="wb-todo__dot" :class="`wb-todo__dot--${todo.level}`"></span>
              <span class="wb-todo__text"><strong>{{ todo.enterprise }}</strong> · {{ todo.desc }}</span>
              <el-button size="small" type="primary" link @click="go(todo.route)">{{ todo.action }}</el-button>
            </div>
          </div>

          <div class="wb-ai-tip">
            <div class="wb-ai-tip__header"><el-icon><MagicStick /></el-icon> 推荐下一步</div>
            <p>优先处理「宁波天合新材料」税票超时事项；杭州智造装备证据已齐，可进入报告确认。</p>
            <div class="wb-ai-tip__actions">
              <el-button size="small" type="primary" plain @click="handleAdopt">采纳建议</el-button>
              <el-button size="small" plain @click="handleIgnore">稍后处理</el-button>
            </div>
          </div>

          <div class="wb-home__composer">
            <div class="wb-home__composer-label"><el-icon><Promotion /></el-icon> 下一步让 AI 处理</div>
            <el-input v-model="dialogInputLocal" placeholder="例如：帮我筛选深圳的软件企业，看看工商风险和进度" clearable @keyup.enter="handleNormalSend" size="large">
              <template #prefix><el-icon><ChatDotRound /></el-icon></template>
              <template #append><el-button type="primary" @click="handleNormalSend"><el-icon><Promotion /></el-icon></el-button></template>
            </el-input>
            <div class="wb-home__chips">
              <button class="wb-chip" @click="handleNormalSendWith('处理税票')"><el-icon><Tickets /></el-icon>处理税票</button>
              <button class="wb-chip" @click="handleNormalSendWith('查看证据')"><el-icon><Picture /></el-icon>查看证据</button>
              <button class="wb-chip" @click="handleNormalSendWith('帮我筛选深圳的软件企业，看看工商风险和进度')"><el-icon><Search /></el-icon>发起筛客</button>
              <button class="wb-chip" @click="handleNormalSendWith('生成报告摘要')"><el-icon><DocumentChecked /></el-icon>生成报告摘要</button>
            </div>
          </div>
        </section>

        <section class="wb-card wb-card--narrow">
          <h2 class="wb-card__title wb-card__title--sm">本周进度</h2>
          <div class="wb-stats">
            <div class="wb-stat"><span class="wb-stat__num" style="color:var(--color-success)">3</span><span class="wb-stat__label">本周完成尽调</span></div>
            <div class="wb-stat"><span class="wb-stat__num" style="color:var(--color-warning)">5</span><span class="wb-stat__label">在途</span></div>
            <div class="wb-stat"><span class="wb-stat__num" style="color:var(--text-tertiary)">12</span><span class="wb-stat__label">监测企业</span></div>
          </div>
        </section>

        <section class="wb-card wb-card--narrow">
          <h2 class="wb-card__title wb-card__title--sm">快捷操作</h2>
          <div class="wb-quick">
            <el-button v-for="qa in quickActions" :key="qa.label" class="wb-quick-btn" @click="go(qa.route)">
              <el-icon><component :is="iconMap[qa.icon]" /></el-icon><span>{{ qa.label }}</span>
            </el-button>
          </div>
        </section>

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
                v-for="(s, i) in assistant.contextSuggestions"
                :key="i"
                size="small"
                round
                plain
                type="primary"
                @click="assistant.handleSuggestionClick(s)"
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
          </div>
        </div>
      </div>

      <!-- ============ 态2：左内容 + 右对话 ============ -->
      <div v-else class="wb-state-split">
        <!-- 左侧：业务内容 -->
        <div class="wb-state-split__left">
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
          <!-- 轻量阶段条 -->
          <WorkbenchStageStrip
            v-if="assistant.flowStages.length"
            class="wb-workspace-stages"
            :stages="assistant.flowStages"
            :active-stage-id="assistant.activeStageId"
            @select="assistant.setActiveStage"
          />
          <WorkbenchBusinessPanel
            :tool="assistant.activeTool"
            :data="assistant.leftPanelData"
            @explore="onExplore"
            @select-template="onTpl"
          />
        </div>
        <!-- 右侧：AI 对话面板 -->
        <div class="wb-state-split__right ai-assistant-panel">
          <div class="wb-state-split__right-head ai-assistant-panel__header">
            <h3 class="ai-assistant-panel__title">AI Copilot</h3>
            <el-button text size="small" @click="clearChat">清空</el-button>
          </div>
          <div class="wb-state-split__right-msgs ai-assistant-panel__messages">
            <WorkbenchConversation
              :messages="assistant.messages"
              :flow-stages="assistant.flowStages"
              :waiting-for-input="assistant.waitingForInput"
              :active-stage-id="assistant.activeStageId"
              :is-thinking="assistant.isThinking"
              :thinking-text="assistant.thinkingText"
            />
          </div>
          <div class="wb-composer wb-composer--right ai-assistant-panel__footer">
            <div v-if="assistant.contextSuggestions.length" class="wb-sug">
              <el-button
                v-for="(s, i) in assistant.contextSuggestions"
                :key="i"
                size="small"
                round
                plain
                type="primary"
                @click="assistant.handleSuggestionClick(s)"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ArrowLeft, ChatDotRound, Promotion, MagicStick, DocumentChecked, Tickets, Picture, Search, Plus } from '@element-plus/icons-vue'
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

const greeting = computed(() => { const h = new Date().getHours(); return h < 6 ? '夜深了' : h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好' })
const formattedDate = computed(() => { const d = new Date(); const days = ['周日','周一','周二','周三','周四','周五','周六']; return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${days[d.getDay()]}` })

const workspaceTitle = computed(() => {
  const m = {
    screening: '智能筛客',
    exploration: '企业探查',
    monitor: '企业监控',
    dueDiligence: '智能尽调',
    business: '工商核验',
    tax: '税票采集',
    materials: '资料收集',
    riskDiagnosis: '风险诊断',
    deliverables: '产物生成',
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

const dialogPlaceholder = computed(() => {
  const s = assistant.currentFlowStatus
  if (s === 'waiting_selection') return '回复企业名称或序号选择企业...'
  if (s === 'waiting_action') return '选择加入监控或新建尽调...'
  if (s === 'waiting_template') return '选择尽调模板...'
  if (s === 'waiting_tax_confirmation') return '确认发送采集链接...'
  if (s === 'waiting_tax_auth') return '企业完成授权后回复"继续"...'
  if (s === 'waiting_report_action') return '修改报告 / 导出 / 加入监控...'
  if (s === 'editing_report') return '例如：帮我改写风险结论 / 补充税票异常说明...'
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

.wb-ai-tip { margin-top: 16px; padding: 16px; background: var(--bg-card-hover, #f7faff); border-radius: 8px; border: 1px solid var(--border-color-light, #e5eaf2); }
.wb-ai-tip__header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: var(--text-primary, #1a1a2e); }
.wb-ai-tip__header .el-icon { color: var(--color-primary, #2563eb); }
.wb-ai-tip p { font-size: 13px; color: var(--text-secondary, #64748b); line-height: 1.6; margin: 0 0 10px; }
.wb-ai-tip__actions { display: flex; gap: 8px; }

.wb-home__composer { margin-top: 20px; padding: 16px; background: var(--bg-card-hover, #f7faff); border-radius: 8px; border: 1px solid var(--border-color-light, #e5eaf2); }
.wb-home__composer-label { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: var(--text-primary, #1a1a2e); }
.wb-home__composer-label .el-icon { color: var(--color-primary, #2563eb); font-size: 14px; }
.wb-home__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
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
  background: var(--bg-page, #f7faff);
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
.wb-state-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.wb-state-split__left {
  min-width: 0;
  overflow-y: auto;
  padding: 0 32px 40px;
  background: var(--surface-page, var(--bg-page, #f7faff));
}

/* Workspace toolbar inside left panel */
.wb-workspace-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-top: 12px;
}

.wb-workspace-back {
  width: 40px;
  height: 40px;
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
  color: var(--text-primary, #1a1a2e);
}

.wb-workspace-title span {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

/* Lightweight stage strip inside left panel */
.wb-workspace-stages {
  margin-bottom: 20px;
}

.wb-state-split__right.ai-assistant-panel {
  width: 360px;
  min-width: 360px;
  max-width: 380px;
  height: 100%;
  border-radius: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  border-left: 1px solid var(--border-default, var(--border-color, #dbe7f5));
  background: var(--surface-card, var(--bg-card, #fff));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wb-state-split__right-head.ai-assistant-panel__header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-divider, var(--border-color-divider, #f1f5f9));
  flex-shrink: 0;
}

.ai-assistant-panel__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
}

.wb-state-split__right-msgs.ai-assistant-panel__messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
  background: var(--surface-card, var(--bg-card, #fff));
}

/* 右侧面板气泡 */
.wb-state-split__right-msgs :deep(.bubble.ai) { max-width: 82%; }
.wb-state-split__right-msgs :deep(.bubble.user) { max-width: 76%; }
.wb-state-split__right-msgs :deep(.process-card) { max-width: 90%; }

/* 右侧面板 footer */
.wb-composer--right.ai-assistant-panel__footer {
  padding: 10px 12px;
  border-top: 1px solid var(--border-divider, var(--border-color-divider, #f1f5f9));
  background: var(--surface-card, var(--bg-card, #fff));
}

/* ========== 共享：Composer ========== */
.wb-composer {
  flex-shrink: 0;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border-color-divider, #f1f5f9);
  background: var(--bg-page, #f7faff);
}
.wb-composer--center {
  background: linear-gradient(180deg, transparent 0%, var(--bg-page, #f7faff) 25%);
}
.wb-composer--center :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--color-primary, #2563eb);
}
.wb-composer--right.ai-assistant-panel__footer {
  padding: 10px 12px;
  border-top-color: var(--border-divider);
  background: var(--surface-card);
}
.wb-composer__input :deep(.el-input__wrapper) { border-radius: 10px; }

/* 建议按钮 */
.wb-sug { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: 8px; }
.wb-sug-btn {
  padding: 5px 14px;
  border: 1px solid var(--border-color, #dbe7f5);
  border-radius: 20px;
  background: var(--bg-card, #fff);
  color: var(--color-primary, #2563eb);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.wb-sug-btn:hover { background: var(--color-primary-bg, #eef2ff); border-color: var(--color-primary, #2563eb); }

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

@media (max-width: 900px) {
  .wb-home { padding: 16px; }
  .wb-home__grid { grid-template-columns: 1fr; }
  .wb-state-split {
    display: flex;
    flex-direction: column;
  }
  .wb-state-split__right.ai-assistant-panel { width: 100%; max-width: 100%; border-left: none; border-top: 1px solid var(--el-border-color, var(--border-color, #dbe7f5)); }
  .wb-state-center__col { max-width: 100%; }
}
</style>
