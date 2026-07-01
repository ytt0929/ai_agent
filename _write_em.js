const fs = require('fs');

// Read the template content from the task instruction
// Build the complete EnterpriseMonitorPage.vue content
const parts = [];

parts.push(`<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">企业监测</h1>
        <p class="page-subtitle">用一句话告诉 AI 要监测哪家企业、哪些风险变化，AI 自动建立监测并生成预警</p>
      </div>
    </div>`);

// ====== Phase 1: launch ======
parts.push(`
    <section v-if="store.monitorView === 'launch'" class="monitor-launch card-animate">
      <div class="launch-card">
        <div class="launch-eyebrow"><el-icon><MagicStick /></el-icon><span>AI 创建监测</span></div>
        <h2 class="launch-title">告诉 AI 要监测哪家企业、哪些风险变化</h2>
        <div class="launch-input-card">
          <el-input v-model="store.monitorInput" type="textarea" :rows="3" class="launch-textarea" placeholder="例：监测杭州智造装备，税票连续下降超过30%或新增被执行时提醒我" @keydown.enter.exact.prevent="handleCreateMonitor" />
          <div class="launch-actions">
            <el-button type="primary" size="large" @click="handleCreateMonitor"><el-icon><MagicStick /></el-icon>开始监测</el-button>
            <el-button plain size="large" @click="handleManualMonitor">手工添加</el-button>
          </div>
        </div>
        <transition name="fade">
          <div v-if="store.parsedQuickMonitor" class="recognized-block">
            <div class="recognized-header"><el-icon class="recognized-icon"><CircleCheckFilled /></el-icon><span class="recognized-title-text">AI 已理解你的监测要求</span></div>
            <div class="recognized-items">
              <div class="recognized-item">
                <div class="ri-label">被监测企业</div>
                <el-tag size="small" effect="plain" class="ri-ent-tag">{{ store.parsedQuickMonitor.enterprises.join('、') }}</el-tag>
              </div>
              <div v-for="d in store.parsedQuickMonitor.dimensions" :key="d.name" class="recognized-item">
                <div class="ri-label-row">
                  <el-tag size="small" :type="dimTagType(d.level)" effect="plain" class="ri-dim-tag">{{ d.name }}</el-tag>
                  <span class="ri-level" :class="d.level">{{ dimLevelText(d.level) }}</span>
                </div>
                <div class="ri-value">{{ d.condition }}</div>
              </div>
            </div>
            <div class="recognized-suggestion"><el-icon><InfoFilled /></el-icon><span>建议动作：生成预警提醒 → 客户经理确认 → 可推送尽调</span></div>
          </div>
        </transition>
      </div>
      <div class="launch-examples">
        <div class="examples-label">💡 试试这样说：</div>
        <div class="examples-list">
          <span v-for="(ex, idx) in exampleTexts" :key="idx" class="example-chip" @click="useExample(idx)">{{ ex }}</span>
        </div>
      </div>
    </section>`);

// ====== Phase 2: running ======
parts.push(`
    <section v-else-if="store.monitorView === 'running'" class="monitor-running card-animate">
      <div class="running-header">
        <el-icon class="running-icon spin"><Loading /></el-icon>
        <div>
          <div class="running-title-text">AI 正在为你建立监测</div>
          <div class="running-subtitle">「{{ runningText }}」</div>
        </div>
      </div>
      <div v-if="store.parsedQuickMonitor" class="running-recognized">
        <div class="running-recognized-label">已识别的监测要求</div>
        <div class="running-recognized-items">
          <el-tag size="small" effect="plain">{{ store.parsedQuickMonitor.enterprises.join('、') }}</el-tag>
          <el-tag v-for="d in store.parsedQuickMonitor.dimensions" :key="d.name" size="small" :type="dimTagType(d.level)" effect="plain">{{ d.name }}：{{ d.condition }}</el-tag>
        </div>
      </div>
      <div class="running-progress">
        <div v-for="(step, idx) in store.runningSteps" :key="step.label" class="running-progress-step" :class="step.status">
          <div class="rps-dot">
            <el-icon v-if="step.status === 'done'" class="rps-done-icon"><Select /></el-icon>
            <div v-else-if="step.status === 'active'" class="rps-spinner"></div>
            <span v-else class="rps-num">{{ idx + 1 }}</span>
          </div>
          <div class="rps-line" :class="{ visible: idx < store.runningSteps.length - 1 }"></div>
          <div class="rps-content">
            <div class="rps-label">{{ step.label }}</div>
            <div class="rps-desc">{{ step.status === 'done' ? step.result : step.loadingText }}</div>
          </div>
        </div>
      </div>
    </section>`);

// ====== Phase 3: results ======
parts.push(`
    <div v-else class="monitor-results">
      <div class="results-header card-animate">
        <div>
          <div class="results-eyebrow">AI 已完成首轮扫描</div>
          <div class="results-title">监测已建立，以下是发现</div>
        </div>
        <div class="results-header-actions">
          <el-button plain @click="goLaunch"><el-icon><Plus /></el-icon>新建监测</el-button>
        </div>
      </div>

      <transition name="fade">
        <section v-if="store.createdMonitorResult" class="created-card card-animate">
          <div class="created-icon-wrap"><el-icon class="created-icon"><CircleCheckFilled /></el-icon></div>
          <div class="created-body">
            <div class="created-name">{{ store.createdMonitorResult.task?.name || store.createdMonitorResult.rule?.name || '新监测任务' }}</div>
            <div class="created-dims">
              <el-tag v-for="d in (store.createdMonitorResult.task?.dimensions || [])" :key="d.name" size="small" effect="plain" class="created-dim-tag">{{ d.name }} → {{ d.condition }}</el-tag>
            </div>
            <div class="created-status">AI 已模拟触发 <strong>{{ store.createdMonitorResult.warning ? '1 条预警' : '0 条预警' }}</strong>，请确认处置。</div>
          </div>
          <div class="created-actions">
            <el-button size="small" type="primary" @click="handleViewCreatedWarning">查看预警</el-button>
            <el-button size="small" plain @click="handlePushCreatedWarning">推送尽调</el-button>
          </div>
        </section>
      </transition>

      <section class="ai-brief-section card-animate">
        <div class="section-head">
          <div>
            <div class="section-title">🤖 AI 摘要：需要你关注的变化</div>
            <div class="section-subtitle">按风险级别和处置状态自动排序，高优先级的排在前面</div>
          </div>
        </div>
        <div class="decision-list">
          <div v-for="item in store.decisionQueue" :key="item.id" class="decision-item" @click="store.openDetail(item)">
            <div class="decision-dot" :class="item.level"></div>
            <div class="decision-main">
              <div class="decision-row">
                <span class="decision-enterprise">{{ item.enterprise.name }}</span>
                <span class="decision-title">{{ item.title }}</span>
              </div>
              <div class="decision-explain">{{ item.suggestion?.next || item.summary }}</div>
              <div class="decision-tags">
                <el-tag v-for="tag in getReasonTags(item)" :key="tag" size="small" effect="plain" class="reason-tag">{{ tag }}</el-tag>
              </div>
            </div>
            <div class="decision-action" @click.stop>
              <el-button size="small" type="primary" plain @click="handleRecommendedAction(item)">{{ getActionLabel(item) }}</el-button>
            </div>
          </div>
          <div v-if="!store.decisionQueue.length" class="decision-empty">
            <el-icon><CircleCheck /></el-icon><span>AI 暂未发现需要接管的变化。</span>
          </div>
        </div>
      </section>

      <section class="tasks-section card-animate">
        <div class="section-head">
          <div>
            <div class="section-title">监测任务</div>
            <div class="section-subtitle">所有已建立的 AI 监测任务及其扫描状态</div>
          </div>
        </div>
        <div v-if="!store.monitorTasks.length" class="tasks-empty">
          <el-icon><Document /></el-icon><span>暂无监测任务，使用上方输入框创建第一个 AI 监测。</span>
        </div>
        <div v-else class="task-list">
          <div v-for="task in store.monitorTasks" :key="task.id" class="task-card" @click="handleViewTask(task)">
            <div class="task-main">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-meta">
                <span>{{ task.source }}</span><span class="task-dot">·</span><span>监测 {{ task.enterprises.join('、') }}</span><span class="task-dot">·</span><span>最近扫描 {{ task.lastScan }}</span>
              </div>
              <div class="task-dims"><span v-for="d in task.dimensions" :key="d.name">{{ d.name }}：{{ d.condition }}</span></div>
            </div>
            <div class="task-side">
              <div class="task-status" :class="task.status === 'running' ? 'status-running' : 'status-paused'">{{ task.status === 'running' ? '监测中' : '已暂停' }}</div>
              <div class="task-count" v-if="task.warningCount">{{ task.warningCount }} 预警</div>
              <el-button size="small" text type="primary" @click.stop="handleViewTask(task)">查看详情</el-button>
            </div>
          </div>
        </div>
      </section>
    </div>`);

// ====== Drawer: warning detail ======
parts.push(`
    <transition name="drawer">
      <div v-if="store.detailOpen" class="drawer-overlay" @click.self="store.closeDetail()">
        <div class="drawer-panel">
          <div class="drawer-header">
            <el-icon class="drawer-back" @click="store.closeDetail()"><ArrowLeft /></el-icon>
            <span class="drawer-title">预警详情</span>
          </div>
          <div v-if="store.detailWarning" class="drawer-body">
            <div class="dw-header">
              <div class="dw-level" :class="store.detailWarning.level">{{ levelLabel(store.detailWarning.level) }}</div>
              <div class="dw-title-text">{{ store.detailWarning.title }}</div>
              <div class="dw-ent-name">{{ store.detailWarning.enterprise.name }}</div>
              <div v-if="store.detailWarning.ruleName" class="dw-rule">触发规则：{{ store.detailWarning.ruleName }}</div>
            </div>
            <div class="dw-section">
              <div class="dw-section-title">📌 触发原因</div>
              <div class="dw-section-body">{{ store.detailWarning.triggerReason || store.detailWarning.summary }}</div>
            </div>
            <div class="dw-section">
              <div class="dw-section-title">AI 处置建议</div>
              <div class="suggest-card">
                <div class="suggest-primary">{{ monitorSuggestion.primary }}</div>
                <div class="suggest-text">{{ monitorSuggestion.next }}</div>
                <div class="suggest-impact">{{ monitorSuggestion.impact }}</div>
              </div>
            </div>
            <div v-if="store.detailWarning.trendData?.length" class="dw-section">
              <div class="dw-section-title">📊 趋势对比</div>
              <div class="trend-chart">
                <div v-for="d in store.detailWarning.trendData" :key="d.month" class="trend-bar" :class="{ abnormal: d.abnormal }">
                  <div class="trend-label">{{ d.month }}</div>
                  <div class="trend-fill-wrap"><div class="trend-fill" :style="{ width: (d.value / 2000 * 100) + '%' }"></div></div>
                  <div class="trend-value">{{ d.value }}万</div>
                </div>
                <div v-if="store.detailWarning.industryAvg" class="trend-industry">行业均值：{{ store.detailWarning.industryAvg }}</div>
              </div>
            </div>
            <div v-if="store.detailWarning.impactAssessment" class="dw-section">
              <div class="dw-section-title">💡 影响评估</div>
              <div class="dw-section-body">
                <div v-for="(item, i) in store.detailWarning.impactAssessment" :key="i" class="impact-item">· {{ item }}</div>
              </div>
            </div>
            <div class="dw-section">
              <div class="dw-section-title">处置进展</div>
              <div class="action-status-card" :class="{ active: store.detailWarning.pushedToDueDiligence || store.detailWarning.focused }">
                <div class="action-status-title">{{ store.detailWarning.dispositionStatus || '待处置' }}</div>
                <div v-if="store.detailWarning.dueTaskName" class="action-status-text">已生成尽调核查项：{{ store.detailWarning.dueTaskName }}，当前进度 {{ store.detailWarning.dueTaskProgress }}%</div>
                <div v-else class="action-status-text">可推送到智能尽调，或加入重点关注等待下次数据刷新。</div>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <el-button size="small" type="primary" :disabled="store.detailWarning?.pushedToDueDiligence" @click="handlePushToDueDiligence">{{ store.detailWarning?.pushedToDueDiligence ? '已推送尽调' : '推送到尽调' }}</el-button>
            <el-button size="small" plain :disabled="store.detailWarning?.focused" @click="handleAddFocus">{{ store.detailWarning?.focused ? '已重点关注' : '加入重点关注' }}</el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>`);

// ====== Script ======
parts.push(`
<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { MagicStick, ArrowLeft, InfoFilled, Plus, CircleCheckFilled, CircleCheck, Select, Loading, Document } from '@element-plus/icons-vue'
import { useMonitorStore } from '../stores/enterpriseMonitor.js'
import { ElMessage } from 'element-plus'

const store = useMonitorStore()
const monitorSuggestion = computed(() => store.buildMonitorSuggestion(store.detailWarning) || {})
const runningText = ref('')
const runningTimers = []

const exampleTexts = [
  '监测杭州智造装备，税票连续下降超过30%或新增被执行时提醒我',
  '帮我盯着浙江新源动力，法人变更和股权出质时通知我',
  '关注杭州锐思软件，征信报告过期或审计到期时通知我',
]

const defaultRunningSteps = [
  { label: '识别企业主体', status: 'pending', loadingText: '正在识别企业名称和统一社会信用代码...', result: '已识别企业主体' },
  { label: '拆解监测指标', status: 'pending', loadingText: '正在理解监测维度和触发条件...', result: '已识别监测指标和触发条件' },
  { label: '接入数据源', status: 'pending', loadingText: '正在接入工商、司法、税票、资料有效期数据...', result: '已接入数据源' },
  { label: '建立监测任务', status: 'pending', loadingText: '正在创建监测任务并加入列表...', result: '已建立监测任务' },
  { label: '扫描首轮风险', status: 'pending', loadingText: '正在扫描首轮风险变化...', result: '已生成首轮扫描结果' },
  { label: '生成预警提醒', status: 'pending', loadingText: '正在生成预警提醒...', result: '已生成预警，可查看详情并处置' },
]

function dimTagType(level) { return { high: 'danger', medium: 'warning', low: 'info' }[level] || 'info' }
function dimLevelText(level) { return { high: '高', medium: '中', low: '低' }[level] || '低' }
function levelLabel(l) { return { high: '红色预警', medium: '橙色预警', low: '蓝色预警' }[l] || '' }

function useExample(idx) { store.setMonitorInput(exampleTexts[idx]) }

function handleCreateMonitor() {
  if (!store.monitorInput.trim()) return
  runningText.value = store.monitorInput
  runMonitorWorkflow()
}

function handleManualMonitor() {
  runningText.value = '手工添加企业，监测工商变更和资料有效期'
  runMonitorWorkflow()
}

function handleViewCreatedWarning() {
  const w = store.createdMonitorResult?.warning
  if (w) store.openDetail(w)
  else ElMessage.info('暂无预警')
}

function handlePushCreatedWarning() {
  const w = store.createdMonitorResult?.warning
  if (w) { const r = store.pushToDueDiligence(w.id); if (r) ElMessage.success('已生成尽调核查项：' + r.dueTaskName) }
}

function handleViewTask(task) {
  if (task.latestWarning) store.openDetail(task.latestWarning)
  else ElMessage.info('该任务暂无预警')
}

function handlePushToDueDiligence() {
  if (!store.detailWarning) return
  const w = store.pushToDueDiligence(store.detailWarning.id)
  if (w) ElMessage.success('已生成尽调核查项：' + w.dueTaskName)
}

function handleAddFocus() {
  if (!store.detailWarning) return
  const w = store.addFocus(store.detailWarning.id)
  if (w) ElMessage.success('已将「' + w.enterprise.name + '」加入重点关注')
}

function handleRecommendedAction(warning) {
  if (!warning) return
  const action = store.getRecommendedAction(warning)
  if (action.type === 'focus') {
    const r = store.addFocus(warning.id)
    if (r) ElMessage.success('已将「' + r.enterprise.name + '」加入重点关注')
  } else {
    const r = store.pushToDueDiligence(warning.id)
    if (r) ElMessage.success('已生成尽调核查项：' + r.dueTaskName)
  }
}

function getActionLabel(warning) { const a = store.getRecommendedAction(warning); return a?.label || '查看详情' }
function getReasonTags(warning) { return store.getReasonTags(warning) }

function resetRunningSteps() {
  runningTimers.splice(0).forEach(t => clearTimeout(t))
  store.setRunningSteps(defaultRunningSteps.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })))
}

function runMonitorWorkflow() {
  resetRunningSteps()
  store.setMonitorView('running')
  const isManual = runningText.value.includes('手工')
  const delays = [500, 1100, 1700, 2300, 3000, 3700]
  for (let i = 0; i < delays.length; i++) {
    runningTimers.push(setTimeout(() => {
      if (i > 0) store.advanceRunningStep(i - 1, 'done')
      store.advanceRunningStep(i, 'active')
    }, delays[i]))
  }
  runningTimers.push(setTimeout(() => {
    store.advanceRunningStep(delays.length - 1, 'done')
    const result = isManual ? store.createManualMonitor() : store.createMonitorFromQuickInput()
    if (result) ElMessage.success('已加入监测：' + (result.rule?.name || '新监测任务'))
    store.setMonitorView('results')
  }, 4400))
}

function goLaunch() { store.resetMonitorFlow(); resetRunningSteps() }
onUnmounted(() => { runningTimers.splice(0).forEach(t => clearTimeout(t)) })
<\/script>`);

// ====== Style ======
parts.push(`
<style scoped>
.page{padding:var(--space-2xl) 32px;max-width:1120px;margin:0 auto}
.page-header{margin-bottom:var(--space-2xl)}
.page-title{font-size:var(--font-size-page-title);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.page-subtitle{font-size:var(--font-size-body);color:var(--text-tertiary)}
.monitor-launch{max-width:760px}
.launch-card{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-2xl)}
.launch-eyebrow{display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--font-size-sm);font-weight:700;color:var(--color-primary);background:var(--color-primary-bg);border:1px solid var(--color-primary-border);border-radius:var(--radius-full);padding:4px 10px;margin-bottom:var(--space-md)}
.launch-title{font-size:22px;line-height:1.3;font-weight:700;color:var(--text-primary);margin:0 0 var(--space-lg)}
.launch-input-card{border:1px solid var(--border-default);background:var(--surface-card);border-radius:var(--radius-md);padding:var(--space-md);box-shadow:0 8px 24px rgba(15,23,42,.04)}
.launch-textarea{margin-bottom:var(--space-sm)}
.launch-textarea :deep(.el-textarea__inner){border:none;box-shadow:none;padding:0;font-size:var(--font-size-body);line-height:1.7;color:var(--text-primary);resize:vertical;background:transparent;min-height:72px}
.launch-textarea :deep(.el-textarea__inner::placeholder){color:var(--text-disabled)}
.launch-actions{display:flex;gap:var(--space-sm);justify-content:flex-end;padding-top:var(--space-sm);border-top:1px solid var(--border-light)}
.recognized-block{margin-top:var(--space-lg);background:var(--surface-page);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-lg) var(--space-xl)}
.recognized-header{display:flex;align-items:center;gap:var(--space-xs);margin-bottom:var(--space-md)}
.recognized-icon{color:var(--color-success);font-size:16px}
.recognized-title-text{font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary)}
.recognized-items{display:flex;flex-direction:column;gap:var(--space-sm)}
.recognized-item{display:flex;align-items:flex-start;gap:var(--space-sm)}
.ri-label-row{display:flex;align-items:center;gap:var(--space-xs);min-width:100px;flex-shrink:0}
.ri-ent-tag,.ri-dim-tag{font-weight:600}
.ri-level{font-size:var(--font-size-caption);font-weight:600;padding:1px 6px;border-radius:var(--radius-sm)}
.ri-level.high{background:var(--color-danger-bg);color:var(--color-danger)}
.ri-level.medium{background:var(--color-warning-bg);color:var(--color-warning)}
.ri-level.low{background:var(--color-success-bg);color:var(--color-success)}
.ri-value{font-size:var(--font-size-sm);color:var(--text-primary);line-height:1.5}
.recognized-suggestion{margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:var(--space-xs);font-size:var(--font-size-caption);color:var(--text-secondary)}
.recognized-suggestion .el-icon{color:var(--color-primary);flex-shrink:0}
.launch-examples{margin-top:var(--space-lg)}
.examples-label{font-size:var(--font-size-sm);color:var(--text-tertiary);margin-bottom:var(--space-sm)}
.examples-list{display:flex;flex-wrap:wrap;gap:var(--space-sm)}
.example-chip{padding:6px 14px;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-full);font-size:var(--font-size-xs);color:var(--text-secondary);cursor:pointer;transition:all .15s;line-height:1.4}
.example-chip:hover{border-color:var(--color-primary);color:var(--color-primary);background:var(--color-primary-bg)}
.monitor-running{max-width:720px;margin:0 auto;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-2xl)}
.running-header{display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-xl)}
.running-icon{font-size:20px;color:var(--color-primary)}
.running-icon.spin{animation:spin 1.5s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.running-title-text{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary)}
.running-subtitle{font-size:var(--font-size-sm);color:var(--color-primary);margin-top:2px}
.running-recognized{margin-bottom:var(--space-xl);background:var(--surface-page);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-md) var(--space-lg)}
.running-recognized-label{font-size:var(--font-size-caption);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.running-recognized-items{display:flex;flex-wrap:wrap;gap:var(--space-xs)}
.running-progress{display:flex;flex-direction:column;gap:0}
.running-progress-step{display:flex;align-items:flex-start;gap:var(--space-md);padding:0 0 var(--space-lg);position:relative}
.running-progress-step:not(:last-child) .rps-line.visible{content:'';position:absolute;left:13px;top:28px;width:2px;bottom:0;background:var(--border-light)}
.running-progress-step.done:not(:last-child) .rps-line.visible{background:var(--color-success-light)}
.rps-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--border-default);background:var(--surface-card);display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;font-size:12px;font-weight:800;color:var(--text-tertiary)}
.running-progress-step.active .rps-dot{border-color:var(--color-primary);background:var(--color-primary);color:#fff}
.running-progress-step.done .rps-dot{border-color:var(--color-success);background:var(--color-success);color:#fff}
.rps-done-icon{font-size:14px;color:#fff}
.rps-spinner{width:10px;height:10px;border-radius:50%;background:#fff;animation:pulseDot 1s infinite ease-in-out}
@keyframes pulseDot{0%,100%{transform:scale(.65);opacity:.55}50%{transform:scale(1);opacity:1}}
.rps-content{flex:1}
.rps-label{font-size:var(--font-size-body);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.running-progress-step.done .rps-label{color:var(--color-success)}
.running-progress-step.active .rps-label{color:var(--color-primary)}
.rps-desc{font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.5}
.monitor-results{animation:fadeIn .24s ease-out}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.results-header{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-lg);background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-xl);margin-bottom:var(--space-lg)}
.results-eyebrow{font-size:var(--font-size-caption);font-weight:700;color:var(--color-primary);margin-bottom:var(--space-xs)}
.results-title{font-size:var(--font-size-xl);font-weight:800;color:var(--text-primary)}
.created-card{display:flex;align-items:center;gap:var(--space-lg);background:var(--color-success-bg);border:1px solid var(--color-success-light);border-radius:var(--radius-md);padding:var(--space-lg) var(--space-xl);margin-bottom:var(--space-lg)}
.created-icon-wrap{flex-shrink:0}
.created-icon{font-size:28px;color:var(--color-success)}
.created-body{flex:1;min-width:0}
.created-name{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.created-dims{display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-bottom:var(--space-xs)}
.created-dim-tag{font-size:11px}
.created-status{font-size:var(--font-size-sm);color:var(--text-secondary)}
.created-actions{display:flex;gap:var(--space-sm);flex-shrink:0}
.ai-brief-section{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-xl);margin-bottom:var(--space-lg)}
.section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-lg);margin-bottom:var(--space-lg)}
.section-title{font-size:var(--font-size-lg);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.section-subtitle{font-size:var(--font-size-sm);color:var(--text-tertiary)}
.decision-list{display:flex;flex-direction:column;gap:var(--space-sm)}
.decision-item{display:flex;align-items:flex-start;gap:var(--space-md);padding:var(--space-lg) var(--space-lg);border:1px solid var(--border-light);border-radius:var(--radius-md);background:var(--surface-page);cursor:pointer;transition:all .16s}
.decision-item:hover{border-color:var(--color-primary);background:var(--surface-card);box-shadow:0 4px 14px rgba(15,23,42,.05)}
.decision-dot{width:9px;height:9px;border-radius:50%;margin-top:7px;flex-shrink:0}
.decision-dot.high{background:var(--color-danger)}
.decision-dot.medium{background:var(--color-warning)}
.decision-dot.low{background:var(--color-success)}
.decision-main{flex:1;min-width:0}
.decision-row{display:flex;align-items:center;gap:var(--space-sm);flex-wrap:wrap;margin-bottom:var(--space-xs)}
.decision-enterprise{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary)}
.decision-title{font-size:var(--font-size-body);color:var(--text-primary)}
.decision-explain{font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-sm)}
.reason-tag{font-size:10px}
.decision-action{flex-shrink:0}
.decision-empty{font-size:var(--font-size-sm);color:var(--text-tertiary);padding:var(--space-lg);text-align:center;background:var(--surface-page);border-radius:var(--radius-md);display:flex;align-items:center;gap:var(--space-sm);justify-content:center}
.tasks-section{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-xl);margin-bottom:var(--space-xl)}
.tasks-empty{font-size:var(--font-size-sm);color:var(--text-tertiary);padding:var(--space-lg);text-align:center;background:var(--surface-page);border-radius:var(--radius-md);display:flex;align-items:center;gap:var(--space-sm);justify-content:center}
.task-list{display:flex;flex-direction:column;gap:var(--space-sm)}
.task-card{display:flex;align-items:center;justify-content:space-between;gap:var(--space-md);padding:var(--space-lg) var(--space-lg);border:1px solid var(--border-light);border-radius:var(--radius-md);background:var(--surface-page);cursor:pointer;transition:all .16s}
.task-card:hover{border-color:var(--color-primary);background:var(--surface-card);box-shadow:0 4px 14px rgba(15,23,42,.05)}
.task-main{flex:1;min-width:0}
.task-name{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.task-meta{display:flex;flex-wrap:wrap;gap:var(--space-xs);font-size:var(--font-size-caption);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.task-dot{margin:0 4px;color:var(--text-disabled)}
.task-dims{display:flex;flex-wrap:wrap;gap:var(--space-xs)}
.task-dims span{font-size:var(--font-size-caption);color:var(--text-secondary);background:var