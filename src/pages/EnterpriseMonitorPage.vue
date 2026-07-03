<template>
  <div class="page">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">企业监测</h1>
        <p class="page-subtitle">监控已纳入的企业，AI 自动扫描风险变化并生成预警</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateMonitor">
        <el-icon><Plus /></el-icon> 新增监控
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card-animate">
      <div class="filter-tabs">
        <span class="filter-tab" :class="{ active: store.taskFilter === 'all' }" @click="setTaskFilter('all')">
          全部 <span class="filter-count">{{ store.monitorTasks.length }}</span>
        </span>
        <span class="filter-tab" :class="{ active: store.taskFilter === 'warning' }" @click="setTaskFilter('warning')">
          有预警 <span class="filter-count filter-count--danger">{{ warningTaskCount }}</span>
        </span>
        <span class="filter-tab" :class="{ active: store.taskFilter === 'due-diligence' }" @click="setTaskFilter('due-diligence')">
          尽调转入 <span class="filter-count">{{ sourceCount('due-diligence') }}</span>
        </span>
        <span class="filter-tab" :class="{ active: store.taskFilter === 'screening' }" @click="setTaskFilter('screening')">
          筛客转入 <span class="filter-count">{{ sourceCount('screening') }}</span>
        </span>
        <span class="filter-tab" :class="{ active: store.taskFilter === 'diagnosis' }" @click="setTaskFilter('diagnosis')">
          探查转入 <span class="filter-count">{{ sourceCount('diagnosis') }}</span>
        </span>
      </div>
      <div class="filter-actions">
        <el-button plain size="small" @click="openIndicatorLibrary">
          <el-icon><Collection /></el-icon> 指标库
        </el-button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div v-if="filteredTasks.length" class="task-list card-animate">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card" @click="openTaskDetail(task.id)">
        <div class="task-left">
          <div class="task-name-row">
            <span class="task-name">{{ task.enterpriseName }}</span>
            <span v-if="task.focused" class="focus-badge">已关注</span>
          </div>
          <div class="task-meta">
            <span class="task-credit">{{ task.creditCode }}</span>
            <span class="task-dot">·</span>
            <span class="task-source-tag" :class="'source-' + task.source">{{ task.sourceLabel }}</span>
            <span class="task-dot">·</span>
            <span>最近扫描 {{ task.lastScanAt }}</span>
          </div>
          <div class="task-indicators">
            <span v-for="ind in task.indicators.slice(0, 4)" :key="ind.id" class="ind-tag" :class="'level-' + ind.level">
              {{ ind.name }}
            </span>
            <span v-if="task.indicators.length > 4" class="ind-more">+{{ task.indicators.length - 4 }}</span>
          </div>
        </div>
        <div class="task-right">
          <div class="task-status-badge" :class="'status-' + task.status">
            {{ task.status === 'running' ? '监测中' : task.status === 'paused' ? '已暂停' : '异常' }}
          </div>
          <div v-if="task.warningCount > 0" class="task-warning-badge">
            <el-icon><WarningFilled /></el-icon>
            {{ task.warningCount }} 条预警
          </div>
          <el-dropdown @command="(cmd) => handleTaskAction(cmd, task)" trigger="click" @click.stop>
            <el-button text size="small" @click.stop><el-icon><More /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                <el-dropdown-item command="edit">编辑指标</el-dropdown-item>
                <el-dropdown-item :command="task.status === 'running' ? 'pause' : 'resume'">
                  {{ task.status === 'running' ? '暂停监控' : '恢复监控' }}
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'toggleFocus', task }">
                  {{ task.focused ? '取消关注' : '加入重点关注' }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div v-else class="empty-state card-animate">
      <el-icon class="empty-icon"><Monitor /></el-icon>
      <p class="empty-title">暂无监控任务</p>
      <p class="empty-desc">点击「新增监控」开始监控企业风险变化</p>
      <el-button type="primary" @click="openCreateMonitor"><el-icon><Plus /></el-icon> 新增监控</el-button>
    </div>

    <!-- ════════════════════════════════════════ -->
    <!-- 新增监控 Dialog -->
    <!-- ════════════════════════════════════════ -->
    <el-dialog v-model="store.createOpen" :title="createDialogTitle" width="560px" :close-on-click-modal="false" @close="closeCreateMonitor">
      <div v-if="!creating" class="create-mode-tabs">
        <span class="create-mode-tab" :class="{ active: createMode === 'natural' }" @click="createMode = 'natural'">自然语言</span>
        <span class="create-mode-tab" :class="{ active: createMode === 'manual' }" @click="handleManualCreate">手工选择</span>
      </div>

      <!-- 自然语言模式 -->
      <div v-if="createMode === 'natural' && !creating" class="create-natural">
        <el-input v-model="createInput" type="textarea" :rows="3" placeholder="例如：监测明达精工，税票连续下降超过30%或新增被执行时提醒我" />
        <div class="create-parse-row">
          <el-button type="primary" @click="parseCreateText" :loading="createParsing" :disabled="!createInput.trim()">
            <el-icon><MagicStick /></el-icon> AI 识别
          </el-button>
        </div>
        <transition name="fade">
          <div v-if="createParsed" class="create-recognized">
            <div class="create-recognized-header">
              <el-icon class="create-recognized-icon"><CircleCheckFilled /></el-icon>
              <span>AI 已识别</span>
            </div>
            <div class="create-recognized-body">
              <div class="create-rec-item">
                <span class="create-rec-label">企业</span>
                <el-tag size="small" effect="plain">{{ createEnterprise }}</el-tag>
              </div>
              <div v-if="createParsed.creditCode" class="create-rec-item">
                <span class="create-rec-label">信用代码</span>
                <span class="create-rec-credit-code">{{ createParsed.creditCode }}</span>
              </div>
              <div v-if="createSource === 'natural-language'" class="create-rec-item">
                <span class="create-rec-label">识别来源</span>
                <el-tag size="small" type="warning" effect="plain">自然语言</el-tag>
              </div>
              <div class="create-rec-indicators-label">监控指标</div>
              <div v-for="ind in createSelectedIndicators" :key="ind.id" class="create-rec-item">
                <el-tag size="small" :type="levelTagType(ind.level)" effect="plain">{{ ind.name }}</el-tag>
                <span class="create-rec-condition">{{ ind.condition }}</span>
              </div>
            </div>
            <div class="create-confirm-row">
              <el-button type="primary" @click="confirmCreateMonitor">确认创建</el-button>
            </div>
          </div>
        </transition>
      </div>

      <!-- 手工选择模式 -->
      <div v-if="createMode === 'manual' && !creating" class="create-manual">
        <el-input v-model="createEnterprise" placeholder="输入企业名称或统一社会信用代码" class="create-ent-input" />
        <div class="create-ind-selector">
          <div class="create-ind-selector-label">选择监控指标</div>
          <div v-for="ind in indicatorLibrary" :key="ind.id" class="create-ind-option" :class="{ selected: isIndicatorSelected(ind.id) }" @click="toggleCreateIndicatorManual(ind)">
            <div class="create-ind-check">
              <el-icon v-if="isIndicatorSelected(ind.id)" class="check-checked"><Select /></el-icon>
              <div v-else class="check-unchecked"></div>
            </div>
            <div class="create-ind-info">
              <div class="create-ind-name">{{ ind.name }}</div>
              <div class="create-ind-meta">
                <span class="ind-cat">{{ ind.category }}</span>
                <span class="ind-dot">·</span>
                <span>{{ ind.defaultCondition }}</span>
              </div>
            </div>
            <el-tag size="small" :type="levelTagType(ind.defaultLevel)">{{ levelText(ind.defaultLevel) }}</el-tag>
          </div>
        </div>
        <div class="create-confirm-row">
          <el-button type="primary" :disabled="!createEnterprise.trim() || !createSelectedIndicators.length" @click="confirmCreateManual">
            创建监控任务
          </el-button>
        </div>
      </div>

      <!-- 创建中动画 -->
      <div v-if="creating" class="create-running">
        <div class="create-running-header">
          <el-icon class="create-running-icon spin"><Loading /></el-icon>
          <span>正在创建监控任务</span>
        </div>
        <div v-for="(step, i) in creatingSteps" :key="step.label" class="create-step" :class="step.status">
          <div class="create-step-dot">
            <el-icon v-if="step.status === 'done'" class="create-step-done"><Select /></el-icon>
            <div v-else-if="step.status === 'active'" class="create-step-spinner"></div>
            <span v-else class="create-step-num">{{ i + 1 }}</span>
          </div>
          <div class="create-step-label">{{ step.label }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- ════════════════════════════════════════ -->
    <!-- 指标库 Dialog -->
    <!-- ════════════════════════════════════════ -->
    <el-dialog v-model="indicatorLibraryOpen" title="监控指标库" width="600px">
      <div class="indicator-lib-list">
        <div v-for="ind in indicatorLibrary" :key="ind.id" class="indicator-lib-item">
          <div class="indicator-lib-name">{{ ind.name }}</div>
          <div class="indicator-lib-meta">
            <el-tag size="small" type="info" effect="plain">{{ ind.category }}</el-tag>
            <span class="indicator-lib-dot">·</span>
            <span>{{ ind.dataSource }}</span>
            <span class="indicator-lib-dot">·</span>
            <span>{{ ind.defaultCondition }}</span>
          </div>
          <el-tag size="small" :type="levelTagType(ind.defaultLevel)">{{ levelText(ind.defaultLevel) }}</el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- ════════════════════════════════════════ -->
    <!-- 任务详情 Drawer -->
    <!-- ════════════════════════════════════════ -->
    <el-drawer v-model="detailTaskOpen" title="监控任务详情" size="520px">
      <div v-if="detailTask" class="detail-content">
        <div class="detail-header">
          <h2 class="detail-ent-name">{{ detailTask.enterpriseName }}</h2>
          <div class="detail-meta-row">
            <span class="detail-credit">{{ detailTask.creditCode }}</span>
            <span class="detail-dot">·</span>
            <span class="detail-source-tag" :class="'source-' + detailTask.source">{{ detailTask.sourceLabel }}</span>
            <span class="detail-dot">·</span>
            <span>创建于 {{ detailTask.createdAt }}</span>
          </div>
        </div>

        <div class="detail-tabs">
          <span class="detail-tab" :class="{ active: detailTab === 'indicators' }" @click="detailTab = 'indicators'">
            监控指标 ({{ detailTask.indicators.length }})
          </span>
          <span class="detail-tab" :class="{ active: detailTab === 'warnings' }" @click="detailTab = 'warnings'">
            预警 ({{ taskWarningCount(detailTask.id) }})
          </span>
        </div>

        <!-- 指标 Tab -->
        <div v-if="detailTab === 'indicators'" class="detail-tab-content">
          <div v-for="ind in detailTask.indicators" :key="ind.id" class="detail-ind-item">
            <div class="detail-ind-left">
              <el-tag size="small" :type="levelTagType(ind.level)">{{ levelText(ind.level) }}</el-tag>
              <span class="detail-ind-name">{{ ind.name }}</span>
            </div>
            <span class="detail-ind-condition">{{ ind.condition }}</span>
            <el-tag size="small" :type="ind.enabled ? 'success' : 'info'">{{ ind.enabled ? '启用' : '停用' }}</el-tag>
          </div>

          <div v-if="taskScanItems(detailTask.id).length" class="detail-scan-results">
            <h3 class="detail-section-title">最近扫描结果</h3>
            <div v-for="item in taskScanItems(detailTask.id)" :key="item.indicatorId" class="scan-result-item" :class="'scan-' + item.status">
              <div class="scan-row">
                <span class="scan-indicator">{{ item.indicatorName }}</span>
                <el-tag size="small" :type="item.status === 'warning' ? 'danger' : 'success'">
                  {{ item.status === 'warning' ? '触发预警' : '正常' }}
                </el-tag>
              </div>
              <div class="scan-evidence">{{ item.evidence }}</div>
              <div class="scan-ai">{{ item.aiJudgement }}</div>
            </div>
          </div>

          <div class="detail-edit-section">
            <h3 class="detail-section-title">添加指标</h3>
            <div class="detail-edit-row">
              <el-input v-model="editInputVal" size="small" placeholder="描述要新增的监控指标..." @keydown.enter.exact.prevent="doParseEditText" />
              <el-button type="primary" size="small" @click="doParseEditText" :loading="editParsing">AI 识别</el-button>
            </div>
            <transition name="fade">
              <div v-if="editParsed" class="edit-recognized">
                <div v-for="ind in editParsed.indicators" :key="ind.id" class="edit-rec-item">
                  <el-tag size="small" :type="levelTagType(ind.level)">{{ ind.name }}</el-tag>
                  <span class="edit-rec-condition">{{ ind.condition }}</span>
                  <el-button text size="small" type="primary" @click="addEditIndicator(ind)">添加</el-button>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 预警 Tab -->
        <div v-if="detailTab === 'warnings'" class="detail-tab-content">
          <div v-if="taskWarningsList(detailTask.id).length" class="detail-warning-list">
            <div v-for="w in taskWarningsList(detailTask.id)" :key="w.id" class="detail-warning-item" @click="openWarningDetail(w)">
              <div class="detail-warning-level" :class="'level-' + w.level">
                {{ levelText(w.level) }}
              </div>
              <div class="detail-warning-body">
                <div class="detail-warning-title">{{ w.title }}</div>
                <div class="detail-warning-time">{{ w.createdAt }}</div>
                <div class="detail-warning-tags">
                  <el-tag v-if="w.focused" size="small" type="warning" effect="plain">已关注</el-tag>
                  <el-tag v-if="w.pushedToDueDiligence" size="small" type="success" effect="plain">已推送尽调</el-tag>
                  <el-tag v-if="w.handled" size="small" type="info" effect="plain">已处理</el-tag>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="detail-empty">
            <el-icon><CircleCheck /></el-icon>
            <p>暂无预警</p>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- ════════════════════════════════════════ -->
    <!-- 预警详情 Drawer -->
    <!-- ════════════════════════════════════════ -->
    <el-drawer v-model="warningDetailOpen" title="预警详情" size="480px">
      <div v-if="warningDetail" class="warning-detail-content">
        <div class="wd-header">
          <el-tag :type="levelTagType(warningDetail.level)" size="small">{{ levelText(warningDetail.level) }}</el-tag>
          <h3 class="wd-title">{{ warningDetail.title }}</h3>
          <div class="wd-ent">{{ warningDetail.enterpriseName }}</div>
        </div>

        <div class="wd-section">
          <div class="wd-section-title">触发条件</div>
          <div class="wd-section-body">{{ warningDetail.triggerCondition }}</div>
        </div>

        <div class="wd-section">
          <div class="wd-section-title">触发证据</div>
          <div class="wd-section-body wd-evidence">{{ warningDetail.triggerEvidence }}</div>
        </div>

        <div class="wd-section">
          <div class="wd-section-title">AI 研判</div>
          <div class="wd-ai-card">
            <div class="wd-ai-judgement">{{ warningDetail.aiJudgement }}</div>
            <div class="wd-ai-suggestion">💡 {{ warningDetail.suggestion }}</div>
          </div>
        </div>

        <div class="wd-section">
          <div class="wd-section-title">处置记录</div>
          <div v-if="warningDetail.actionLogs && warningDetail.actionLogs.length" class="wd-action-logs">
            <div v-for="(log, i) in warningDetail.actionLogs" :key="i" class="wd-action-log">
              <span class="wd-action-log-title">{{ log.title }}</span>
              <span class="wd-action-log-time">{{ log.time }}</span>
            </div>
          </div>
          <div v-else class="wd-action-empty">暂无处置记录</div>
        </div>
      </div>
      <template #footer>
        <div class="wd-footer">
          <el-button type="primary" size="small" :disabled="warningDetail?.pushedToDueDiligence" @click="doPushToDueDiligence">
            {{ warningDetail?.pushedToDueDiligence ? '已推送尽调' : '推送尽调' }}
          </el-button>
          <el-button size="small" plain :disabled="warningDetail?.focused" @click="doAddFocus">
            {{ warningDetail?.focused ? '已关注' : '加入关注' }}
          </el-button>
          <el-button size="small" plain :disabled="warningDetail?.handled" @click="doMarkHandled">
            {{ warningDetail?.handled ? '已处理' : '标记已处理' }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Plus, MagicStick, CircleCheckFilled, CircleCheck, Select, Loading,
  More, WarningFilled, Monitor, Collection,
} from '@element-plus/icons-vue'
import { useMonitorStore } from '../stores/enterpriseMonitor.js'
import { ElMessage } from 'element-plus'

const store = useMonitorStore()

// ─── 任务列表 ───
const filteredTasks = computed(() => store.filteredTasks)

function setTaskFilter(f) { store.setTaskFilter(f) }

function sourceCount(source) {
  return store.monitorTasks.filter(t => t.source === source).length
}

const warningTaskCount = computed(() => store.monitorTasks.filter(t => t.warningCount > 0).length)

function handleTaskAction(cmd, task) {
  if (cmd === 'detail') openTaskDetail(task.id)
  else if (cmd === 'edit') openEditIndicators(task.id)
  else if (cmd === 'pause' || cmd === 'resume') store.toggleTaskStatus(task.id)
  else if (cmd?.action === 'toggleFocus') {
    task.focused = !task.focused
    ElMessage.success(task.focused ? '已加入重点关注' : '已取消关注')
  }
}

// ─── 任务详情 ───
const detailTaskOpen = computed({ get: () => store.detailTaskOpen, set: v => { if (!v) store.closeTaskDetail() } })
const detailTask = computed(() => store.detailTask)
const detailTab = computed({ get: () => store.detailTab, set: v => store.setDetailTab(v) })

function openTaskDetail(id) { store.openTaskDetail(id) }

function taskScanItems(taskId) {
  return store.scanResults.find(s => s.taskId === taskId)?.items || []
}

function taskWarningsList(taskId) {
  return store.monitorWarnings.filter(w => w.taskId === taskId)
}

function taskWarningCount(taskId) {
  return taskWarningsList(taskId).length
}

// ─── 编辑指标 ───
const editInputVal = computed({ get: () => store.editInput, set: v => { store.editInput = v } })
const editParsing = computed(() => store.editParsing)
const editParsed = computed(() => store.editParsed)

function openEditIndicators(taskId) { store.openEditIndicators(taskId) }

async function doParseEditText() {
  if (!store.editInput.trim()) return
  await store.parseEditText()
}

function addEditIndicator(ind) {
  const task = store.monitorTasks.find(t => t.id === store.editTaskId)
  if (task && !task.indicators.find(i => i.id === ind.id)) {
    task.indicators.push({ ...ind, enabled: true })
    ElMessage.success('已添加指标：' + ind.name)
    store.editParsed = null
    store.editInput = ''
  }
}

// ─── 新增监控 ───
const createMode = computed({ get: () => store.createMode, set: v => { store.createMode = v } })
const createInput = computed({ get: () => store.createInput, set: v => { store.createInput = v } })
const createParsing = computed(() => store.createParsing)
const createParsed = computed(() => store.createParsed)
const createEnterprise = computed({ get: () => store.createEnterprise, set: v => { store.createEnterprise = v } })
const createSelectedIndicators = computed(() => store.createSelectedIndicators)
const creating = computed(() => store.creating)
const creatingSteps = computed(() => store.creatingSteps)
const createDialogTitle = computed(() => creating.value ? '创建中...' : '新增监控任务')

function openCreateMonitor() { store.openCreateMonitor() }
function closeCreateMonitor() { store.closeCreateMonitor() }

async function parseCreateText() {
  await store.parseCreateText()
}

function confirmCreateMonitor() { store.confirmCreateMonitor() }

function confirmCreateManual() {
  if (!store.createEnterprise.trim() || !store.createSelectedIndicators.length) return
  const indicators = store.createSelectedIndicators.map(i => ({ ...i, enabled: true }))
  const parsed = { enterprises: [store.createEnterprise], indicators }
  store.createMonitorTask(parsed, 'manual')
  ElMessage.success('已创建监控任务：' + store.createEnterprise)
  closeCreateMonitor()
}

function handleManualCreate() { store.handleManualCreate() }

function toggleCreateIndicatorManual(ind) {
  store.toggleCreateIndicator(ind.id)
}

function isIndicatorSelected(indId) {
  return store.createSelectedIndicators.some(i => i.id === indId)
}

// ─── 指标库 ───
const indicatorLibrary = computed(() => store.indicatorLibrary)
const indicatorLibraryOpen = computed({ get: () => store.indicatorLibraryOpen, set: v => { if (v) store.openIndicatorLibrary(); else store.closeIndicatorLibrary() } })

function openIndicatorLibrary() { store.openIndicatorLibrary() }

// ─── 预警详情 ───
const warningDetailOpen = computed({ get: () => store.warningDetailOpen, set: v => { if (!v) store.closeWarningDetail() } })
const warningDetail = computed(() => store.warningDetail)

function openWarningDetail(warning) { store.openWarningDetail(warning) }

function doPushToDueDiligence() {
  if (!warningDetail.value) return
  store.pushWarningToDueDiligence(warningDetail.value.id)
  ElMessage.success('已推送尽调')
}

function doAddFocus() {
  if (!warningDetail.value) return
  store.addWarningToFocus(warningDetail.value.id)
  ElMessage.success('已加入关注')
}

function doMarkHandled() {
  if (!warningDetail.value) return
  store.markWarningHandled(warningDetail.value.id)
  ElMessage.success('已标记为已处理')
}

// ─── 工具函数 ───
function levelTagType(level) { return { high: 'danger', medium: 'warning', low: 'info' }[level] || 'info' }
function levelText(level) { return { high: '高', medium: '中', low: '低' }[level] || level }
</script>

<style scoped>
.page {
  padding: var(--space-2xl) var(--space-4xl);
  max-width: var(--layout-page-data);
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  font-size: var(--font-size-body);
  color: var(--text-tertiary);
}

/* ─── 筛选栏 ─── */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.filter-tabs {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.filter-tab {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding: var(--space-2xs) var(--space-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  user-select: none;
}

.filter-tab:hover {
  background: var(--surface-page);
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.filter-count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--surface-page);
  padding: 0 var(--space-2xs);
  border-radius: var(--radius-sm);
}

.filter-count--danger {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

/* ─── 任务列表 ─── */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-slower) var(--ease-out), box-shadow var(--duration-slower) var(--ease-out);
}

.task-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.task-left {
  flex: 1;
  min-width: 0;
}

.task-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.task-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.focus-badge {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background: var(--color-warning-bg);
  padding: 1px var(--space-2xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--space-sm);
}

.task-credit {
  font-family: 'SF Mono', 'Consolas', monospace;
}

.task-dot {
  margin: 0 2px;
}

.task-source-tag {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-2xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
}

.source-due-diligence { background: var(--color-primary-bg); color: var(--color-primary); }
.source-screening { background: var(--color-success-bg); color: var(--color-success); }
.source-diagnosis { background: #f3e8ff; color: #7c3aed; }
.source-manual { background: var(--border-divider); color: var(--text-tertiary); }
.source-natural-language { background: #fef3c7; color: #d97706; }

.task-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.ind-tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--surface-page);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.ind-tag.level-high { background: var(--color-danger-bg); color: var(--color-danger); border-color: var(--color-danger-border); }
.ind-tag.level-medium { background: var(--color-warning-bg); color: var(--color-warning); border-color: var(--color-warning-border); }

.ind-more {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.task-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.task-status-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 2px var(--space-md);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.status-running { background: var(--color-success-bg); color: var(--color-success); }
.status-paused { background: var(--border-divider); color: var(--text-tertiary); }
.status-warning { background: var(--color-danger-bg); color: var(--color-danger); }

.task-warning-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-danger);
  white-space: nowrap;
}

/* ─── 空状态 ─── */
.empty-state {
  text-align: center;
  padding: var(--space-4xl) var(--space-xl);
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.empty-icon {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-md);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-lg);
}

/* ─── 创建 Dialog ─── */
.create-mode-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  padding-bottom: var(--space-sm);
}

.create-mode-tab {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  padding: var(--space-2xs) var(--space-md);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-normal) var(--ease-out);
  user-select: none;
}

.create-mode-tab:hover { color: var(--text-primary); }

.create-mode-tab.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-weight: var(--font-weight-semibold);
}

.create-natural {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.create-parse-row { display: flex; justify-content: flex-end; }

.create-recognized {
  background: var(--surface-page);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-top: var(--space-sm);
}

.create-recognized-header { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.create-recognized-icon { color: var(--color-success); font-size: 16px; }
.create-recognized-body { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md); }
.create-rec-item { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-sm); }
.create-rec-label { color: var(--text-tertiary); min-width: 56px; flex-shrink: 0; }
.create-rec-credit-code { font-family: 'SF Mono', 'Consolas', monospace; font-size: var(--font-size-xs); color: var(--text-secondary); }
.create-rec-condition { color: var(--text-secondary); }
.create-rec-indicators-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-top: var(--space-xs); margin-bottom: 2px; }
.create-confirm-row { display: flex; justify-content: flex-end; }

/* 手工选择 */
.create-manual { display: flex; flex-direction: column; gap: var(--space-md); }
.create-ent-input { margin-bottom: var(--space-sm); }
.create-ind-selector-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-sm); }
.create-ind-selector { display: flex; flex-direction: column; gap: var(--space-sm); max-height: 320px; overflow-y: auto; }
.create-ind-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) var(--space-lg); border: 1px solid var(--border-default); border-radius: var(--radius-md); cursor: pointer; transition: all var(--duration-normal) var(--ease-out); }
.create-ind-option:hover { border-color: var(--color-primary); }
.create-ind-option.selected { background: var(--color-primary-bg); border-color: var(--color-primary); }
.create-ind-check { flex-shrink: 0; }
.check-unchecked { width: 18px; height: 18px; border: 2px solid var(--border-default); border-radius: var(--radius-sm); }
.check-checked { color: var(--color-primary); font-size: 18px; }
.create-ind-info { flex: 1; min-width: 0; }
.create-ind-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-2xs); }
.create-ind-meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.ind-cat { font-weight: 500; }
.ind-dot { margin: 0 4px; }

/* 创建中动画 */
.create-running { display: flex; flex-direction: column; gap: var(--space-md); padding: var(--space-lg) 0; }
.create-running-header { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-body); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-md); }
.create-running-icon { color: var(--color-primary); }
.create-running-icon.spin { animation: spin 1.5s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.create-step { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm) 0; }
.create-step-dot { width: 28px; height: 28px; border-radius: var(--radius-full); border: 2px solid var(--border-default); background: var(--surface-card); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: var(--font-weight-bold); color: var(--text-tertiary); }
.create-step.active .create-step-dot { border-color: var(--color-primary); background: var(--color-primary); color: #fff; }
.create-step.done .create-step-dot { border-color: var(--color-success); background: var(--color-success); color: #fff; }
.create-step-done { font-size: 14px; color: #fff; }
.create-step-spinner { width: 10px; height: 10px; border-radius: var(--radius-full); background: #fff; animation: pulseDot 1s infinite ease-in-out; }
@keyframes pulseDot { 0%,100% { transform: scale(0.65); opacity: 0.55; } 50% { transform: scale(1); opacity: 1; } }
.create-step-label { font-size: var(--font-size-sm); color: var(--text-secondary); }
.create-step.active .create-step-label { color: var(--color-primary); font-weight: var(--font-weight-semibold); }
.create-step.done .create-step-label { color: var(--color-success); }

/* 指标库 */
.indicator-lib-list { display: flex; flex-direction: column; gap: var(--space-sm); max-height: 400px; overflow-y: auto; }
.indicator-lib-item { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) var(--space-lg); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.indicator-lib-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); min-width: 70px; }
.indicator-lib-meta { flex: 1; font-size: var(--font-size-xs); color: var(--text-tertiary); }
.indicator-lib-dot { margin: 0 4px; }

/* 任务详情 Drawer */
.detail-content { padding: 0 var(--space-sm); }
.detail-header { margin-bottom: var(--space-lg); }
.detail-ent-name { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary); margin: 0 0 var(--space-xs); }
.detail-meta-row { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-xs); color: var(--text-tertiary); }
.detail-dot { margin: 0 2px; }
.detail-source-tag { font-size: var(--font-size-xs); padding: 1px var(--space-2xs); border-radius: var(--radius-sm); font-weight: var(--font-weight-semibold); }
.detail-source-tag.source-due-diligence { background: var(--color-primary-bg); color: var(--color-primary); }
.detail-source-tag.source-screening { background: var(--color-success-bg); color: var(--color-success); }
.detail-source-tag.source-diagnosis { background: #f3e8ff; color: #7c3aed; }
.detail-source-tag.source-manual { background: var(--border-divider); color: var(--text-tertiary); }
.detail-source-tag.source-natural-language { background: #fef3c7; color: #d97706; }
.detail-tabs { display: flex; gap: var(--space-md); border-bottom: 1px solid var(--border-light); margin-bottom: var(--space-lg); }
.detail-tab { font-size: var(--font-size-sm); color: var(--text-tertiary); padding: var(--space-sm) 0; cursor: pointer; user-select: none; border-bottom: 2px solid transparent; transition: all var(--duration-normal) var(--ease-out); }
.detail-tab:hover { color: var(--text-primary); }
.detail-tab.active { color: var(--color-primary); font-weight: var(--font-weight-semibold); border-bottom-color: var(--color-primary); }
.detail-tab-content { display: flex; flex-direction: column; gap: var(--space-md); }

/* 指标列表 */
.detail-ind-item { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm) var(--space-md); background: var(--surface-page); border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
.detail-ind-left { display: flex; align-items: center; gap: var(--space-sm); flex: 1; }
.detail-ind-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.detail-ind-condition { font-size: var(--font-size-xs); color: var(--text-secondary); }

/* 扫描结果 */
.detail-section-title { font-size: var(--font-size-body); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-sm); }
.detail-scan-results { margin-top: var(--space-md); }
.scan-result-item { padding: var(--space-md); border: 1px solid var(--border-light); border-radius: var(--radius-md); margin-bottom: var(--space-sm); }
.scan-result-item.scan-warning { border-left: 3px solid var(--color-danger); }
.scan-result-item.scan-normal { border-left: 3px solid var(--color-success); }
.scan-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs); }
.scan-indicator { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.scan-evidence { font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: var(--space-xs); line-height: 1.5; }
.scan-ai { font-size: var(--font-size-xs); color: var(--color-primary); line-height: 1.5; }

/* 编辑指标 */
.detail-edit-section { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); }
.detail-edit-row { display: flex; gap: var(--space-sm); }
.edit-recognized { margin-top: var(--space-sm); display: flex; flex-direction: column; gap: var(--space-xs); }
.edit-rec-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: var(--surface-page); border-radius: var(--radius-sm); }
.edit-rec-condition { font-size: var(--font-size-xs); color: var(--text-secondary); flex: 1; }

/* 预警列表 */
.detail-warning-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.detail-warning-item { display: flex; align-items: flex-start; gap: var(--space-md); padding: var(--space-md); border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer; transition: all var(--duration-normal) var(--ease-out); }
.detail-warning-item:hover { border-color: var(--color-primary); background: var(--surface-page); }
.detail-warning-level { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 2px var(--space-2xs); border-radius: var(--radius-sm); flex-shrink: 0; }
.detail-warning-level.level-high { background: var(--color-danger-bg); color: var(--color-danger); }
.detail-warning-level.level-medium { background: var(--color-warning-bg); color: var(--color-warning); }
.detail-warning-level.level-low { background: var(--color-success-bg); color: var(--color-success); }
.detail-warning-body { flex: 1; min-width: 0; }
.detail-warning-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-xs); }
.detail-warning-time { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-bottom: var(--space-xs); }
.detail-warning-tags { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.detail-empty { text-align: center; padding: var(--space-2xl) 0; color: var(--text-tertiary); display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }
.detail-empty .el-icon { font-size: 32px; }
.detail-empty p { margin: 0; font-size: var(--font-size-sm); }

/* 预警详情 Drawer */
.warning-detail-content { padding: 0 var(--space-xs); }
.wd-header { display: flex; flex-direction: column; gap: var(--space-xs); margin-bottom: var(--space-xl); }
.wd-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary); margin: 0; }
.wd-ent { font-size: var(--font-size-sm); color: var(--text-secondary); }
.wd-section { margin-bottom: var(--space-lg); }
.wd-section-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-sm); }
.wd-section-body { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; }
.wd-evidence { background: var(--surface-page); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-light); }
.wd-ai-card { background: var(--color-primary-bg); border: 1px solid var(--color-primary-border); border-radius: var(--radius-md); padding: var(--space-lg) var(--space-md); }
.wd-ai-judgement { font-size: var(--font-size-sm); color: var(--text-primary); line-height: 1.6; margin-bottom: var(--space-sm); }
.wd-ai-suggestion { font-size: var(--font-size-xs); color: var(--color-primary); line-height: 1.5; }
.wd-action-logs { display: flex; flex-direction: column; gap: var(--space-xs); }
.wd-action-log { display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) var(--space-md); background: var(--surface-page); border-radius: var(--radius-sm); }
.wd-action-log-title { font-size: var(--font-size-xs); color: var(--text-primary); }
.wd-action-log-time { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.wd-action-empty { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.wd-footer { display: flex; gap: var(--space-sm); flex-wrap: wrap; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity var(--duration-slower); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 响应式 */
@media (max-width: 768px) {
  .task-card { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
  .task-right { flex-direction: row; width: 100%; justify-content: space-between; }
  .filter-bar { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
}
</style>