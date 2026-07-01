<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">企业监测</h1>
        <p class="page-subtitle">用自然语言告诉 AI 要盯哪些企业和指标，系统自动监测并生成提醒</p>
      </div>
    </div>

    <!-- 创建监控 -->
    <section v-if="monitorView === 'launch'" class="monitor-launch card-animate">
      <div class="launch-main">
        <div class="launch-eyebrow">
          <el-icon><MagicStick /></el-icon>
          <span>AI 创建监控</span>
        </div>
        <h2 class="launch-title">告诉 AI 监测条件，AI 自动识别指标并开始盯</h2>
        <div class="launch-input-wrap">
          <textarea
            v-model="store.quickMonitorInput"
            class="launch-input"
            placeholder="例：监测杭州智造装备，税票连续下降超过30%或新增被执行时提醒我"
          ></textarea>
          <div class="launch-actions">
            <el-button type="primary" @click="handleCreateMonitor">开始监测</el-button>
            <el-button plain @click="handleManualMonitor">手工添加监控</el-button>
          </div>
        </div>
        <div v-if="store.parsedQuickMonitor" class="recognized-block">
          <div class="recognized-title">AI 已识别到需要监测的内容</div>
          <div class="recognized-grid">
            <div class="recognized-card">
              <span>企业</span>
              <strong>{{ store.parsedQuickMonitor.enterprises.join('、') }}</strong>
            </div>
            <div
              v-for="d in store.parsedQuickMonitor.dimensions"
              :key="d.name"
              class="recognized-card"
            >
              <span>{{ d.name }}</span>
              <strong>{{ d.condition }}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="launch-side">
        <div class="launch-step active">1. 自然语言识别</div>
        <div class="launch-step active">2. 建立监测任务</div>
        <div class="launch-step active">3. 扫描并生成结果</div>
        <div class="launch-hint">支持税票波动、司法风险、工商变更、资料有效期等指标。</div>
      </div>
    </section>

    <!-- 建立监测中 -->
    <section v-else-if="monitorView === 'running'" class="monitor-running card-animate">
      <div class="running-query">
        <div class="running-label">监测条件</div>
        <div class="running-text">{{ runningText }}</div>
      </div>
      <div v-if="store.parsedQuickMonitor" class="running-tags">
        <span>{{ store.parsedQuickMonitor.enterprises.join('、') }}</span>
        <span v-for="d in store.parsedQuickMonitor.dimensions" :key="d.name">{{ d.name }}：{{ d.condition }}</span>
      </div>
      <div class="running-steps">
        <div v-for="step in runningSteps" :key="step.label" class="running-step" :class="step.status">
          <div class="running-step-dot">
            <span v-if="step.status === 'done'">✓</span>
            <span v-else-if="step.status === 'active'" class="running-spinner"></span>
          </div>
          <div>
            <div class="running-step-title">{{ step.label }}</div>
            <div class="running-step-text">{{ step.status === 'done' ? step.result : step.loadingText }}</div>
          </div>
        </div>
      </div>
    </section>

    <div v-else class="monitor-results">
      <div class="result-header card-animate">
        <div>
          <div class="result-eyebrow">监测列表</div>
          <div class="result-title">已加入监测，AI 已完成首轮扫描</div>
          <div class="result-subtitle">进入监测列表后，可查看扫描结果、预警提醒，并把风险事项推送到尽调。</div>
        </div>
        <el-button plain @click="goLaunch">新建监测</el-button>
      </div>

    <section v-if="store.createdMonitorResult" class="created-result card-animate">
      <div>
        <div class="created-title">已开始监测：{{ store.createdMonitorResult.rule.name }}</div>
        <div class="created-text">AI 已生成监测规则，并模拟触发一条提醒，可继续查看详情或推送到尽调。</div>
      </div>
      <div class="created-actions">
        <el-button size="small" type="primary" @click="store.openDetail(store.createdMonitorResult.warning)">查看提醒</el-button>
        <el-button size="small" plain @click="handlePushWarning(store.createdMonitorResult.warning)">推送到尽调</el-button>
      </div>
    </section>

    <!-- 正在监控 -->
    <section class="monitored-section card-animate">
      <div class="section-head">
        <div>
          <div class="section-title">正在监控</div>
          <div class="section-subtitle">自然语言和手工添加的监控规则都会出现在这里</div>
        </div>
        <el-button text type="primary" @click="store.setActiveTab('rules')">管理全部规则</el-button>
      </div>
      <div class="monitor-rule-list">
        <div v-for="rule in store.monitoredRules.slice(0, 4)" :key="rule.id" class="monitor-rule-card">
          <div class="monitor-rule-main">
            <div class="monitor-rule-title">{{ rule.name }}</div>
            <div class="monitor-rule-meta">
              <span>{{ rule.source }}</span>
              <span>监测 {{ rule.enterprises.join('、') }}</span>
              <span>{{ rule.status === 'running' ? '监测中' : '已暂停' }}</span>
            </div>
            <div class="monitor-rule-dims">
              <span v-for="d in rule.dimensions" :key="d.name">{{ d.name }}：{{ d.condition }}</span>
            </div>
          </div>
          <div class="monitor-rule-side">
            <div class="monitor-rule-count">{{ rule.warningCount }}</div>
            <div class="monitor-rule-label">提醒</div>
            <el-button v-if="rule.latestWarning" size="small" text type="primary" @click="store.openDetail(rule.latestWarning)">查看最新</el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- KPI -->
    <div class="kpi-row card-animate">
      <div class="kpi-card"><div class="kpi-value">{{ store.kpi.monitored }}</div><div class="kpi-label">监测企业</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-warning)">{{ store.kpi.todayWarnings }}</div><div class="kpi-label">今日预警</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-primary)">{{ store.kpi.unread }}</div><div class="kpi-label">未读</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">{{ store.kpi.expired }}</div><div class="kpi-label">资料过期</div></div>
    </div>

    <!-- 预警提醒 -->
    <section class="decision-section card-animate">
      <div class="section-head">
        <div>
          <div class="section-title">监测提醒</div>
          <div class="section-subtitle">监测规则命中后会生成提醒，可查看原因并推送到尽调</div>
        </div>
        <el-button text type="primary" @click="store.setActiveTab('warnings')">查看全部明细</el-button>
      </div>
      <div class="decision-list">
        <div v-for="item in store.decisionQueue" :key="item.id" class="decision-item" @click="store.openDetail(item)">
          <div class="decision-dot" :class="item.level"></div>
          <div class="decision-main">
            <div class="decision-row">
              <span class="decision-enterprise">{{ item.enterprise.name }}</span>
              <span class="decision-title">{{ item.title }}</span>
            </div>
            <div class="decision-explain">{{ item.suggestion.next }}</div>
            <div class="decision-tags">
              <span v-for="tag in item.reasonTags" :key="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="decision-action" @click.stop>
            <el-button size="small" type="primary" plain @click="handleRecommendedAction(item)">{{ item.recommendedAction.label }}</el-button>
          </div>
        </div>
        <div v-if="!store.decisionQueue.length" class="decision-empty">AI 暂未发现需要接管的变化。</div>
      </div>
    </section>

    <!-- Tab 切换 -->
    <div class="tab-bar card-animate">
      <div class="tab-item" :class="{ active: store.activeTab === 'warnings' }" @click="store.setActiveTab('warnings')">
        企业预警 <span class="tab-count">{{ store.warnings.filter(w=>w.type==='enterprise').length }}</span>
      </div>
      <div class="tab-item" :class="{ active: store.activeTab === 'compliance' }" @click="store.setActiveTab('compliance')">
        合规监测 <span class="tab-count">{{ store.complianceWarnings.length }}</span>
      </div>
      <div class="tab-item" :class="{ active: store.activeTab === 'rules' }" @click="store.setActiveTab('rules')">
        我的规则 <span class="tab-count">{{ store.rules.length }}</span>
      </div>
      <div class="tab-right"><el-button size="small" text @click="store.openCreateRule()">+ 创建规则</el-button></div>
    </div>

    <!-- Tab: 企业预警 -->
    <div v-if="store.activeTab === 'warnings'" class="tab-content card-animate">
      <div class="filter-row">
        <div class="filter-chips">
          <div class="filter-chip" :class="{ active: store.warningFilter === 'all' }" @click="store.setWarningFilter('all')">全部 {{ store.warnings.filter(w=>w.type==='enterprise').length }}</div>
          <div class="filter-chip danger" :class="{ active: store.warningFilter === 'high' }" @click="store.setWarningFilter('high')">🔴 高 {{ store.warnings.filter(w=>w.type==='enterprise'&&w.level==='high').length }}</div>
          <div class="filter-chip warning" :class="{ active: store.warningFilter === 'medium' }" @click="store.setWarningFilter('medium')">🟡 中 {{ store.warnings.filter(w=>w.type==='enterprise'&&w.level==='medium').length }}</div>
          <div class="filter-chip info" :class="{ active: store.warningFilter === 'low' }" @click="store.setWarningFilter('low')">🟢 低 {{ store.warnings.filter(w=>w.type==='enterprise'&&w.level==='low').length }}</div>
          <div class="filter-chip" :class="{ active: store.warningFilter === 'unread' }" @click="store.setWarningFilter('unread')">未读</div>
        </div>
      </div>
      <div class="warning-list">
        <div v-for="w in store.filteredWarnings.filter(w=>w.type==='enterprise')" :key="w.id" class="warning-item" :class="{ unread: !w.read }" @click="store.openDetail(w)">
          <div class="warning-level-dot" :class="w.level"></div>
          <div class="warning-main">
            <div class="warning-enterprise">{{ w.enterprise.name }}</div>
            <div class="warning-title">{{ w.title }}</div>
            <div class="warning-summary">{{ w.summary }}</div>
            <div class="warning-meta">
              <span class="warning-rule">触发规则：{{ w.ruleName }}</span>
              <span v-if="w.pushedToDueDiligence" class="action-tag action-tag--due">已推送尽调</span>
              <span v-if="w.focused" class="action-tag action-tag--focus">重点关注</span>
            </div>
          </div>
          <div class="warning-side">
            <div class="warning-time">{{ w.time }}</div>
            <div class="warning-status" :class="w.read ? 'read' : 'unread'">{{ w.read ? '已读' : '未读' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: 合规监测 -->
    <div v-if="store.activeTab === 'compliance'" class="tab-content card-animate">
      <div class="filter-row">
        <div class="filter-chips">
          <div class="filter-chip" :class="{ active: store.complianceFilter === 'all' }" @click="store.setComplianceFilter('all')">全部</div>
          <div class="filter-chip danger" :class="{ active: store.complianceFilter === 'expired' }" @click="store.setComplianceFilter('expired')">🔴 已过期</div>
          <div class="filter-chip warning" :class="{ active: store.complianceFilter === 'expiring' }" @click="store.setComplianceFilter('expiring')">🟡 即将过期</div>
        </div>
      </div>
      <div class="warning-list">
        <div v-for="w in store.complianceWarnings" :key="w.id" class="warning-item compliance-item" :class="{ unread: !w.read }" @click="store.openDetail(w)">
          <div class="warning-level-dot" :class="w.level"></div>
          <div class="warning-main">
            <div class="warning-enterprise">{{ w.enterprise.name }}</div>
            <div class="warning-title">{{ w.docType }} — {{ w.title }}</div>
            <div class="warning-summary">{{ w.summary }}</div>
            <div class="warning-meta">
              <span v-if="w.pushedToDueDiligence" class="action-tag action-tag--due">已推送尽调</span>
              <span v-if="w.focused" class="action-tag action-tag--focus">重点关注</span>
            </div>
          </div>
          <div class="warning-side">
            <div class="warning-time">{{ w.time }}</div>
            <div class="warning-status" :class="w.read ? 'read' : 'unread'">{{ w.read ? '已读' : '未读' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: 我的规则 -->
    <div v-if="store.activeTab === 'rules'" class="tab-content card-animate">
      <div v-if="store.runningRules.length" class="rule-group">
        <div class="rule-group-header">运行中（{{ store.runningRules.length }}条）</div>
        <div v-for="r in store.runningRules" :key="r.id" class="rule-item">
          <div class="rule-name">{{ r.name }}</div>
          <div class="rule-dims">{{ r.dimensions.map(d => d.name).join(' / ') }}</div>
          <div class="rule-meta"><span>触发 {{ r.triggerCount }}次</span><span class="rule-dot">·</span><span>最近：{{ r.lastTrigger }}</span></div>
          <div class="rule-actions">
            <el-button size="small" text type="primary" @click="store.toggleRuleStatus(r.id)">暂停</el-button>
            <el-button size="small" text type="danger" @click="store.deleteRule(r.id)">删除</el-button>
          </div>
        </div>
      </div>
      <div v-if="store.pausedRules.length" class="rule-group">
        <div class="rule-group-header" style="color:#94a3b8">已暂停（{{ store.pausedRules.length }}条）</div>
        <div v-for="r in store.pausedRules" :key="r.id" class="rule-item" style="opacity:0.6">
          <div class="rule-name">⏸️ {{ r.name }}</div>
          <div class="rule-dims">{{ r.dimensions.map(d => d.name).join(' / ') }}</div>
          <div class="rule-meta"><span>触发 {{ r.triggerCount }}次</span><span class="rule-dot">·</span><span>暂停于：{{ r.pausedAt }}</span></div>
          <div class="rule-actions">
            <el-button size="small" text type="success" @click="store.toggleRuleStatus(r.id)">启用</el-button>
            <el-button size="small" text type="danger" @click="store.deleteRule(r.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- 侧滑：预警详情 -->
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
            <div v-if="store.detailWarning.trendData && store.detailWarning.trendData.length" class="dw-section">
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
            <div v-if="store.detailWarning.historyWarnings && store.detailWarning.historyWarnings.length" class="dw-section">
              <div class="dw-section-title">📜 历史预警（{{ store.detailWarning.historyWarnings.length }}条）</div>
              <div v-for="hw in store.detailWarning.historyWarnings" :key="hw.date" class="history-item">
                <span class="hw-date">{{ hw.date }}</span>
                <span class="hw-title">{{ hw.title }}</span>
                <span class="hw-level" :class="hw.level">{{ levelShort(hw.level) }}</span>
              </div>
            </div>
            <div class="dw-section">
              <div class="dw-section-title">处置进展</div>
              <div class="action-status-card" :class="{ active: store.detailWarning.pushedToDueDiligence || store.detailWarning.focused }">
                <div class="action-status-title">{{ store.detailWarning.dispositionStatus || '待处置' }}</div>
                <div v-if="store.detailWarning.dueTaskName" class="action-status-text">
                  已生成尽调核查项：{{ store.detailWarning.dueTaskName }}，当前进度 {{ store.detailWarning.dueTaskProgress }}%
                </div>
                <div v-else class="action-status-text">可推送到智能尽调，或加入重点关注等待下次数据刷新。</div>
              </div>
              <div v-if="store.detailWarning.actionLogs && store.detailWarning.actionLogs.length" class="action-log-list">
                <div v-for="log in store.detailWarning.actionLogs" :key="log.time + log.title" class="action-log-item">
                  <div class="action-log-time">{{ log.time }}</div>
                  <div class="action-log-main">
                    <div class="action-log-title">{{ log.title }}</div>
                    <div class="action-log-detail">{{ log.detail }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <el-button size="small" type="primary" :disabled="store.detailWarning?.pushedToDueDiligence" @click="handlePushToDueDiligence">
              {{ store.detailWarning?.pushedToDueDiligence ? '已推送尽调' : '推送到尽调' }}
            </el-button>
            <el-button size="small" plain :disabled="store.detailWarning?.focused" @click="handleAddFocus">
              {{ store.detailWarning?.focused ? '已重点关注' : '加入重点关注' }}
            </el-button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 侧滑：创建规则 -->
    <transition name="drawer">
      <div v-if="store.createRuleOpen" class="drawer-overlay" @click.self="store.closeCreateRule()">
        <div class="drawer-panel drawer-panel-wide">
          <div class="drawer-header">
            <el-icon class="drawer-back" @click="store.closeCreateRule()"><ArrowLeft /></el-icon>
            <span class="drawer-title">创建监测规则</span>
          </div>
          <div class="drawer-body">
            <div class="nl-section">
              <div class="nl-label">方式一：用自然语言创建</div>
              <textarea v-model="store.nlInput" class="nl-textarea" placeholder="例：帮我盯着浙江XX制造，税票下降或新增被执行就通知我"></textarea>
              <el-button type="primary" class="nl-btn" :loading="store.nlParsing" @click="store.parseNLRules()">{{ store.nlParsing ? '解析中...' : '开始解析 ▶' }}</el-button>
            </div>
            <div class="nl-divider">— 或 —</div>
            <div class="form-section">
              <div class="nl-label">方式二：手动配置</div>
              <div class="form-field"><label>监测企业</label><input class="input-sm" placeholder="搜索企业名称" /></div>
              <div class="form-field"><label>监测维度</label>
                <div class="dim-checks">
                  <label><input type="checkbox" checked /> 税票波动</label>
                  <label><input type="checkbox" checked /> 司法风险</label>
                  <label><input type="checkbox" /> 工商变更</label>
                  <label><input type="checkbox" /> 经营指标</label>
                </div>
              </div>
            </div>
            <div v-if="store.nlParsed" class="parse-result">
              <div class="parse-title">系统已识别你的监测要求：</div>
              <div class="parse-card">
                <div class="parse-field"><div class="parse-label">规则名称</div><div class="parse-value">{{ store.nlParsed.name }}</div></div>
                <div class="parse-field"><div class="parse-label">监测企业</div><div v-for="e in store.nlParsed.enterprises" :key="e" class="parse-ent">{{ e }}</div></div>
                <div class="parse-field"><div class="parse-label">监测维度</div>
                  <div v-for="d in store.nlParsed.dimensions" :key="d.name" class="parse-dim"><span class="dim-level" :class="d.level">{{ levelShort(d.level) }}</span> {{ d.name }} → {{ d.condition }}</div>
                </div>
              </div>
              <div class="parse-actions">
                <el-button plain @click="store.nlParsed = null">调整</el-button>
                <el-button type="primary" @click="store.confirmCreateRule()">确认创建</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { MagicStick, ArrowLeft } from '@element-plus/icons-vue'
import { useMonitorStore } from '../stores/enterpriseMonitor.js'
import { ElMessage } from 'element-plus'
const store = useMonitorStore()
const monitorSuggestion = computed(() => store.buildMonitorSuggestion(store.detailWarning) || {})
const monitorView = ref('launch')
const runningText = ref('')
const pendingCreateMode = ref('ai')
const runningTimers = []
const runningSteps = ref([
  { label: '识别监测指标', status: 'pending', loadingText: '正在理解企业、指标和触发条件...', result: '已识别企业和监测指标' },
  { label: '建立监测任务', status: 'pending', loadingText: '正在创建规则并接入数据源...', result: '已加入企业监测列表' },
  { label: '扫描指标并生成结果', status: 'pending', loadingText: '正在扫描税票、司法、工商和资料状态...', result: '已生成首轮扫描结果和预警提醒' },
])
function levelLabel(l) { return { high: '红色预警', medium: '橙色预警', low: '蓝色预警' }[l] || '' }
function levelShort(l) { return { high: '🔴 高', medium: '🟡 中', low: '🟢 低' }[l] || '' }
function handleCreateMonitor() {
  if (!store.quickMonitorInput.trim()) return
  pendingCreateMode.value = 'ai'
  runningText.value = store.quickMonitorInput
  runMonitorWorkflow()
}
function handleManualMonitor() {
  pendingCreateMode.value = 'manual'
  runningText.value = '手工添加企业，监测工商变更和资料有效期'
  runMonitorWorkflow()
}
function handlePushWarning(warning) {
  if (!warning) return
  const result = store.pushToDueDiligence(warning.id)
  if (result) ElMessage.success(`已生成尽调核查项：${result.dueTaskName}`)
}
function handlePushToDueDiligence() {
  if (!store.detailWarning) return
  const warning = store.pushToDueDiligence(store.detailWarning.id)
  if (warning) ElMessage.success(`已生成尽调核查项：${warning.dueTaskName}`)
}
function handleAddFocus() {
  if (!store.detailWarning) return
  const warning = store.addFocus(store.detailWarning.id)
  if (warning) ElMessage.success(`已将「${warning.enterprise.name}」加入重点关注`)
}
function handleRecommendedAction(warning) {
  if (!warning) return
  if (warning.recommendedAction?.type === 'focus') {
    const result = store.addFocus(warning.id)
    if (result) ElMessage.success(`已将「${result.enterprise.name}」加入重点关注`)
    return
  }
  const result = store.pushToDueDiligence(warning.id)
  if (result) ElMessage.success(`已生成尽调核查项：${result.dueTaskName}`)
}
function resetRunningSteps() {
  runningTimers.splice(0).forEach(timer => clearTimeout(timer))
  runningSteps.value = runningSteps.value.map((step, index) => ({
    ...step,
    status: index === 0 ? 'active' : 'pending',
  }))
}
function runMonitorWorkflow() {
  resetRunningSteps()
  monitorView.value = 'running'
  runningTimers.push(setTimeout(() => {
    runningSteps.value[0].status = 'done'
    runningSteps.value[1].status = 'active'
  }, 900))
  runningTimers.push(setTimeout(() => {
    runningSteps.value[1].status = 'done'
    runningSteps.value[2].status = 'active'
  }, 1900))
  runningTimers.push(setTimeout(() => {
    runningSteps.value[2].status = 'done'
    const result = pendingCreateMode.value === 'manual'
      ? store.createManualMonitor()
      : store.createMonitorFromQuickInput()
    if (result) ElMessage.success(`已加入监测：${result.rule.name}`)
    monitorView.value = 'results'
  }, 3100))
}
function goLaunch() {
  monitorView.value = 'launch'
  resetRunningSteps()
}
onUnmounted(() => {
  runningTimers.splice(0).forEach(timer => clearTimeout(timer))
})
</script>

<style scoped>
.page{padding:var(--space-2xl) 32px;max-width:1120px;margin:0 auto}
.page-header{margin-bottom:var(--space-2xl)}
.page-title{font-size:var(--font-size-page-title);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.page-subtitle{font-size:var(--font-size-body);color:var(--text-tertiary)}
.monitor-launch{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:var(--space-xl);background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-2xl);margin-bottom:var(--space-lg)}
.launch-main{min-width:0}
.launch-eyebrow{display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--font-size-sm);font-weight:700;color:var(--color-primary);background:var(--color-primary-bg);border:1px solid var(--color-primary-border);border-radius:var(--radius-full);padding:4px 10px;margin-bottom:var(--space-md)}
.launch-title{font-size:24px;line-height:1.28;font-weight:700;color:var(--text-primary);margin:0 0 var(--space-lg)}
.launch-input-wrap{border:1px solid var(--border-default);background:var(--surface-card);border-radius:var(--radius-md);padding:var(--space-md);box-shadow:0 8px 24px rgba(15,23,42,.04)}
.launch-input{width:100%;min-height:92px;border:0;outline:none;resize:vertical;font-family:inherit;font-size:var(--font-size-body);line-height:1.7;color:var(--text-primary);background:transparent}
.launch-input::placeholder{color:var(--text-disabled)}
.launch-actions{display:flex;gap:var(--space-sm);justify-content:flex-end;align-items:center;padding-top:var(--space-sm);border-top:1px solid var(--border-light)}
.recognized-block{margin-top:var(--space-lg);border-top:1px solid var(--border-light);padding-top:var(--space-lg)}
.recognized-title{font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-sm)}
.recognized-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-sm)}
.recognized-card{background:var(--surface-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-md) 14px;min-height:74px}
.recognized-card span{display:block;font-size:var(--font-size-caption);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.recognized-card strong{display:block;font-size:var(--font-size-sm);line-height:1.5;color:var(--text-primary);font-weight:700}
.launch-side{display:flex;flex-direction:column;gap:var(--space-sm);padding-top:34px}
.launch-step{position:relative;border:1px solid var(--border-light);background:var(--surface-card);border-radius:var(--radius-md);padding:10px 12px 10px 34px;font-size:var(--font-size-sm);font-weight:600;color:var(--text-secondary)}
.launch-step::before{content:'';position:absolute;left:13px;top:14px;width:9px;height:9px;border-radius:50%;background:var(--color-primary)}
.launch-step.active{border-color:var(--color-primary-border);background:var(--color-primary-bg);color:var(--text-primary)}
.launch-hint{font-size:var(--font-size-caption);color:var(--text-tertiary);line-height:1.6;margin-top:var(--space-xs)}
.monitor-running{max-width:760px;margin:0 auto var(--space-xl);background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-2xl)}
.running-query{background:var(--surface-page);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-lg) 18px;margin-bottom:var(--space-lg)}
.running-label{font-size:var(--font-size-caption);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.running-text{font-size:var(--font-size-body);font-weight:700;color:var(--color-primary);line-height:1.6}
.running-tags{display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-bottom:var(--space-xl)}
.running-tags span{font-size:var(--font-size-caption);color:var(--text-secondary);background:var(--color-primary-bg);border:1px solid var(--color-primary-border);border-radius:var(--radius-full);padding:4px 10px}
.running-steps{display:flex;flex-direction:column;gap:0}
.running-step{position:relative;display:flex;gap:var(--space-md);padding:0 0 var(--space-xl)}
.running-step:not(:last-child)::after{content:'';position:absolute;left:13px;top:30px;bottom:0;width:2px;background:var(--border-light)}
.running-step.done:not(:last-child)::after{background:var(--color-success-light)}
.running-step-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--border-default);background:var(--surface-card);display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;color:var(--surface-card);font-size:12px;font-weight:800}
.running-step.active .running-step-dot{border-color:var(--color-primary);background:var(--color-primary)}
.running-step.done .running-step-dot{border-color:var(--color-success);background:var(--color-success);color:#fff}
.running-step-title{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.running-step-text{font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.6}
.running-spinner{width:10px;height:10px;border-radius:50%;background:#fff;animation:pulseDot 1s infinite ease-in-out}
@keyframes pulseDot{0%,100%{transform:scale(.65);opacity:.55}50%{transform:scale(1);opacity:1}}
.monitor-results{animation:fadeIn .24s ease-out}
.result-header{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-lg);background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-xl);margin-bottom:var(--space-lg)}
.result-eyebrow{font-size:var(--font-size-caption);font-weight:700;color:var(--color-primary);margin-bottom:var(--space-xs)}
.result-title{font-size:var(--font-size-xl);font-weight:800;color:var(--text-primary);margin-bottom:var(--space-xs)}
.result-subtitle{font-size:var(--font-size-sm);color:var(--text-tertiary);line-height:1.6}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.created-result{display:flex;align-items:center;justify-content:space-between;gap:var(--space-lg);background:var(--color-success-bg);border:1px solid var(--color-success-light);border-radius:var(--radius-md);padding:var(--space-lg) 20px;margin-bottom:var(--space-lg)}
.created-title{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.created-text{font-size:var(--font-size-sm);color:var(--text-secondary)}
.created-actions{display:flex;gap:var(--space-sm);flex-shrink:0}
.monitored-section{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-xl);margin-bottom:var(--space-xl)}
.monitor-rule-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-md)}
.monitor-rule-card{display:flex;justify-content:space-between;gap:var(--space-md);border:1px solid var(--border-light);background:var(--surface-page);border-radius:var(--radius-md);padding:var(--space-lg) 18px;min-height:138px}
.monitor-rule-main{min-width:0;display:flex;flex-direction:column;gap:var(--space-xs)}
.monitor-rule-title{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);line-height:1.4}
.monitor-rule-meta{display:flex;flex-wrap:wrap;gap:var(--space-xs);font-size:var(--font-size-caption);color:var(--text-tertiary)}
.monitor-rule-meta span{background:var(--surface-card);border:1px solid var(--border-light);border-radius:var(--radius-sm);padding:1px 7px}
.monitor-rule-dims{display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-top:var(--space-xs)}
.monitor-rule-dims span{font-size:var(--font-size-caption);color:var(--text-secondary);background:var(--color-primary-bg);border-radius:var(--radius-sm);padding:2px 8px}
.monitor-rule-side{width:70px;flex-shrink:0;text-align:right;display:flex;flex-direction:column;align-items:flex-end;justify-content:center}
.monitor-rule-count{font-size:28px;font-weight:800;line-height:1;color:var(--text-primary)}
.monitor-rule-label{font-size:var(--font-size-caption);color:var(--text-tertiary);margin:3px 0 var(--space-xs)}
.ai-brief{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:var(--space-xl);background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-2xl);margin-bottom:var(--space-xl)}
.ai-eyebrow{display:flex;align-items:center;gap:var(--space-xs);font-size:var(--font-size-sm);font-weight:700;color:var(--color-primary);margin-bottom:var(--space-sm)}
.ai-title{font-size:24px;line-height:1.25;font-weight:700;color:var(--text-primary);margin:0 0 var(--space-sm)}
.ai-summary{font-size:var(--font-size-body);color:var(--text-secondary);line-height:1.7;margin:0 0 var(--space-lg)}
.ai-lead-card{border:1px solid var(--border-light);background:var(--surface-page);border-radius:var(--radius-md);padding:var(--space-lg) 18px;cursor:pointer;transition:all .16s}
.ai-lead-card:hover{border-color:var(--color-primary);box-shadow:0 6px 18px rgba(37,99,235,.08)}
.ai-lead-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm)}
.ai-lead-level{font-size:var(--font-size-caption);font-weight:700;padding:2px 9px;border-radius:var(--radius-sm)}
.ai-lead-level.high{background:var(--color-danger-bg);color:var(--color-danger)}
.ai-lead-level.medium{background:var(--color-warning-bg);color:var(--color-warning)}
.ai-lead-level.low{background:var(--color-success-bg);color:var(--color-success)}
.ai-lead-time{font-size:var(--font-size-caption);color:var(--text-tertiary)}
.ai-lead-enterprise{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.ai-lead-title{font-size:var(--font-size-lg);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.ai-lead-reason{font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-sm)}
.ai-lead-tags,.decision-tags{display:flex;flex-wrap:wrap;gap:var(--space-xs)}
.ai-lead-tags span,.decision-tags span{font-size:var(--font-size-caption);color:var(--text-secondary);background:var(--surface-card);border:1px solid var(--border-light);border-radius:var(--radius-sm);padding:1px 7px}
.ai-actions{display:flex;gap:var(--space-sm);flex-wrap:wrap;margin-top:var(--space-lg)}
.ai-brief-side{display:flex;flex-direction:column;gap:var(--space-sm)}
.ai-stat{background:var(--surface-page);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-lg) 16px}
.ai-stat-value{font-size:26px;line-height:1;font-weight:800;color:var(--text-primary);margin-bottom:var(--space-xs)}
.ai-stat-label{font-size:var(--font-size-caption);color:var(--text-tertiary)}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl)}
.kpi-card{background:var(--surface-card);border-radius:var(--radius-lg);padding:var(--space-xl);border:1px solid var(--border-default);text-align:center}
.kpi-value{font-size:var(--font-size-metric);font-weight:700;color:var(--text-primary)}
.kpi-label{font-size:var(--font-size-sm);color:var(--text-tertiary);margin-top:var(--space-xs)}
.decision-section{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-xl);margin-bottom:var(--space-xl)}
.section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-lg);margin-bottom:var(--space-lg)}
.section-title{font-size:var(--font-size-xl);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.section-subtitle{font-size:var(--font-size-sm);color:var(--text-tertiary)}
.decision-list{display:flex;flex-direction:column;gap:var(--space-sm)}
.decision-item{display:flex;align-items:flex-start;gap:var(--space-md);padding:var(--space-lg) 18px;border:1px solid var(--border-light);border-radius:var(--radius-md);background:var(--surface-page);cursor:pointer;transition:all .16s}
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
.decision-action{flex-shrink:0}
.decision-empty{font-size:var(--font-size-sm);color:var(--text-tertiary);padding:var(--space-lg);text-align:center;background:var(--surface-page);border-radius:var(--radius-md)}
.create-bar{display:flex;align-items:center;gap:var(--space-md);background:#f5f3ff;border:1.5px dashed #c4b5fd;border-radius:var(--radius-lg);padding:var(--space-lg) 20px;cursor:pointer;margin-bottom:var(--space-xl);transition:all .2s}
.create-bar:hover{border-color:#8b5cf6;background:#ede9fe}
.create-icon{font-size:var(--font-size-page-title);color:#8b5cf6;flex-shrink:0}
.create-placeholder{flex:1;font-size:var(--font-size-lg);color:#7c3aed;font-style:italic}
.create-btn{font-size:var(--font-size-sm);flex-shrink:0}
.tab-bar{display:flex;align-items:center;gap:var(--space-xs);background:var(--surface-card);border-radius:var(--radius-md);padding:var(--space-xs);border:1px solid var(--border-default);margin-bottom:var(--space-xl)}
.tab-item{padding:var(--space-sm) 18px;border-radius:var(--radius-md);font-size:var(--font-size-body);color:var(--text-secondary);cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:var(--space-xs)}
.tab-item.active{background:var(--color-primary-bg);color:var(--color-primary);font-weight:500}
.tab-item:hover:not(.active){background:var(--surface-page)}
.tab-count{font-size:var(--font-size-caption);background:var(--border-divider);padding:1px 8px;border-radius:var(--radius-md);color:var(--text-tertiary)}
.tab-item.active .tab-count{background:var(--border-default);color:var(--color-primary)}
.tab-right{margin-left:auto}
.filter-row{margin-bottom:var(--space-lg)}
.filter-chips{display:flex;gap:var(--space-sm);flex-wrap:wrap}
.filter-chip{padding:5px 14px;background:var(--surface-page);border:1px solid var(--border-light);border-radius:var(--radius-full);font-size:var(--font-size-sm);color:var(--text-secondary);cursor:pointer;transition:all .15s}
.filter-chip.active{background:var(--color-primary-bg);border-color:var(--color-primary);color:var(--color-primary);font-weight:500}
.filter-chip.danger.active{background:var(--color-danger-bg);border-color:var(--color-danger);color:var(--color-danger)}
.filter-chip.warning.active{background:var(--color-warning-bg);border-color:var(--color-warning);color:var(--color-warning)}
.filter-chip.info.active{background:var(--color-success-bg);border-color:var(--color-success);color:var(--color-success)}
.warning-list{display:flex;flex-direction:column;gap:var(--space-sm)}
.warning-item{display:flex;align-items:flex-start;gap:var(--space-md);background:var(--surface-card);border-radius:var(--radius-md);padding:var(--space-lg) 20px;border:1px solid var(--border-default);cursor:pointer;transition:all .2s}
.warning-item:hover{border-color:var(--color-primary);box-shadow:0 2px 8px rgba(37,99,235,.06)}
.warning-item.unread{border-left:3px solid var(--color-primary)}
.warning-item.compliance-item{border-left:3px solid transparent}
.warning-item.compliance-item.unread{border-left:3px solid var(--color-warning)}
.warning-level-dot{width:8px;height:8px;border-radius:50%;margin-top:var(--space-sm);flex-shrink:0}
.warning-level-dot.high{background:var(--color-danger)}
.warning-level-dot.medium{background:var(--color-warning)}
.warning-level-dot.low{background:var(--color-success)}
.warning-main{flex:1;min-width:0}
.warning-enterprise{font-size:var(--font-size-body);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.warning-title{font-size:var(--font-size-body);color:var(--text-primary);margin-bottom:var(--space-xs)}
.warning-summary{font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:var(--space-xs)}
.warning-meta{font-size:var(--font-size-caption);color:var(--text-tertiary);display:flex;align-items:center;gap:var(--space-xs);flex-wrap:wrap}
.warning-rule{color:#8b5cf6}
.action-tag{display:inline-flex;align-items:center;padding:1px 7px;border-radius:var(--radius-sm);font-size:10px;font-weight:600;line-height:1.5}
.action-tag--due{background:var(--color-primary-bg);color:var(--color-primary)}
.action-tag--focus{background:var(--color-warning-bg);color:var(--color-warning)}
.warning-side{text-align:right;flex-shrink:0}
.warning-time{font-size:var(--font-size-caption);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.warning-status{font-size:var(--font-size-caption);padding:2px 8px;border-radius:var(--radius-sm)}
.warning-status.unread{background:var(--color-primary-bg);color:var(--color-primary)}
.warning-status.read{background:var(--border-divider);color:var(--text-tertiary)}
.tab-content{margin-bottom:var(--space-xl)}
.rule-group{margin-bottom:var(--space-2xl)}
.rule-group-header{font-size:var(--font-size-body);font-weight:600;color:var(--text-secondary);margin-bottom:var(--space-sm)}
.rule-item{display:flex;align-items:center;justify-content:space-between;background:var(--surface-card);border-radius:var(--radius-md);padding:var(--space-lg) 20px;border:1px solid var(--border-default);margin-bottom:var(--space-sm)}
.rule-name{font-size:var(--font-size-body);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.rule-dims{font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:var(--space-xs)}
.rule-meta{font-size:var(--font-size-caption);color:var(--text-tertiary)}
.rule-dot{margin:0 6px;color:var(--text-disabled)}
.rule-actions{display:flex;gap:var(--space-xs);flex-shrink:0}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.15);z-index:1000;display:flex;justify-content:flex-end}
.drawer-panel{width:440px;background:var(--surface-card);height:100vh;overflow-y:auto;box-shadow:-4px 0 24px rgba(0,0,0,.08);display:flex;flex-direction:column}
.drawer-panel-wide{width:520px}
.drawer-enter-active,.drawer-leave-active{transition:opacity .3s}
.drawer-enter-from,.drawer-leave-to{opacity:0}
.drawer-enter-active .drawer-panel,.drawer-leave-active .drawer-panel{transition:transform .3s ease-out}
.drawer-enter-from .drawer-panel,.drawer-leave-to .drawer-panel{transform:translateX(100%)}
.drawer-header{display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-xl) 24px;border-bottom:1px solid var(--border-divider)}
.drawer-back{font-size:var(--font-size-page-title);cursor:pointer;color:var(--text-secondary)}
.drawer-back:hover{color:var(--text-primary)}
.drawer-title{font-size:var(--font-size-xl);font-weight:600;color:var(--text-primary)}
.drawer-body{flex:1;padding:var(--space-xl) 24px;overflow-y:auto}
.drawer-footer{padding:var(--space-lg) 24px;border-top:1px solid var(--border-divider);display:flex;gap:var(--space-sm)}
.dw-header{margin-bottom:var(--space-xl)}
.dw-level{display:inline-block;padding:2px 12px;border-radius:var(--radius-sm);font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--space-sm)}
.dw-level.high{background:var(--color-danger-bg);color:var(--color-danger)}
.dw-level.medium{background:var(--color-warning-bg);color:var(--color-warning)}
.dw-level.low{background:var(--color-success-bg);color:var(--color-success)}
.dw-title-text{font-size:var(--font-size-assist);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.dw-ent-name{font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:var(--space-xs)}
.dw-rule{font-size:var(--font-size-caption);color:#8b5cf6}
.dw-section{margin-bottom:var(--space-xl)}
.dw-section-title{font-size:var(--font-size-body);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-sm)}
.dw-section-body{font-size:var(--font-size-body);color:var(--text-primary);line-height:1.6}
.suggest-card{background:var(--color-primary-bg);border:1px solid var(--color-primary-border);border-radius:var(--radius-md);padding:var(--space-lg) 16px}
.suggest-primary{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.suggest-text{font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-sm)}
.suggest-impact{font-size:var(--font-size-caption);color:var(--color-primary);line-height:1.5}
.impact-item{margin-bottom:var(--space-xs);font-size:12.5px;color:var(--text-secondary);line-height:1.5}
.trend-chart{display:flex;flex-direction:column;gap:var(--space-sm);background:var(--bg-table-header);border-radius:var(--radius-md);padding:var(--space-lg) 16px}
.trend-bar{display:flex;align-items:center;gap:var(--space-sm)}
.trend-label{width:30px;font-size:var(--font-size-caption);color:var(--text-tertiary);flex-shrink:0}
.trend-fill-wrap{flex:1;height:18px;background:var(--border-light);border-radius:var(--radius-sm);overflow:hidden}
.trend-fill{height:100%;background:var(--color-primary);border-radius:var(--radius-sm);transition:width .3s}
.trend-bar.abnormal .trend-fill{background:var(--color-danger)}
.trend-value{width:50px;font-size:var(--font-size-caption);color:var(--text-primary);font-weight:500;text-align:right;flex-shrink:0}
.trend-bar.abnormal .trend-value{color:var(--color-danger)}
.trend-industry{font-size:var(--font-size-caption);color:var(--text-tertiary);padding-top:6px;border-top:1px solid var(--border-light)}
.history-item{display:flex;align-items:center;gap:var(--space-sm);font-size:var(--font-size-sm);padding:var(--space-xs) 10px;background:var(--bg-table-header);border-radius:var(--radius-sm);margin-bottom:var(--space-xs)}
.hw-date{color:var(--text-tertiary);flex-shrink:0}
.hw-title{color:var(--text-primary);flex:1}
.hw-level{font-size:10px;padding:1px 6px;border-radius:var(--radius-sm)}
.hw-level.high{background:var(--color-danger-bg);color:var(--color-danger)}
.hw-level.medium{background:var(--color-warning-bg);color:var(--color-warning)}
.hw-level.low{background:var(--color-success-bg);color:var(--color-success)}
.action-status-card{border:1px solid var(--border-default);background:var(--bg-table-header);border-radius:var(--radius-md);padding:var(--space-md) 14px;margin-bottom:var(--space-sm)}
.action-status-card.active{background:var(--color-success-bg);border-color:var(--color-success-light)}
.action-status-title{font-size:var(--font-size-body);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-xs)}
.action-status-text{font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.5}
.action-log-list{display:flex;flex-direction:column;gap:var(--space-xs)}
.action-log-item{display:flex;gap:var(--space-sm);padding:var(--space-sm) 10px;border-radius:var(--radius-sm);background:var(--surface-page)}
.action-log-time{width:54px;flex-shrink:0;font-size:var(--font-size-caption);color:var(--text-tertiary)}
.action-log-main{flex:1;min-width:0}
.action-log-title{font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);margin-bottom:2px}
.action-log-detail{font-size:var(--font-size-caption);color:var(--text-secondary);line-height:1.5}
.nl-section{margin-bottom:var(--space-lg)}
.nl-label{font-size:var(--font-size-body);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-sm)}
.nl-textarea{width:100%;min-height:80px;border:1.5px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-md) 14px;font-size:var(--font-size-body);font-family:inherit;resize:vertical;outline:none;background:var(--bg-table-header)}
.nl-textarea:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.06)}
.nl-btn{margin-top:var(--space-sm);width:100%}
.nl-divider{text-align:center;font-size:var(--font-size-sm);color:var(--text-disabled);margin:20px 0}
.form-section{margin-bottom:var(--space-xl)}
.form-field{margin-bottom:var(--space-lg)}
.form-field label{display:block;font-size:var(--font-size-sm);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.input-sm{width:100%;border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-sm) 12px;font-size:var(--font-size-body);outline:none}
.input-sm:focus{border-color:var(--color-primary)}
.dim-checks{display:flex;flex-wrap:wrap;gap:var(--space-md)}
.dim-checks label{font-size:12.5px;color:var(--text-primary);cursor:pointer;display:flex;align-items:center;gap:var(--space-xs)}
.parse-result{margin-top:var(--space-xl);background:var(--color-success-bg);border:1px solid var(--color-success-light);border-radius:var(--radius-md);padding:var(--space-lg) 20px}
.parse-title{font-size:var(--font-size-body);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-lg)}
.parse-card{background:var(--surface-card);border-radius:var(--radius-md);padding:var(--space-lg) 16px;margin-bottom:var(--space-lg)}
.parse-field{margin-bottom:var(--space-md)}
.parse-field:last-child{margin-bottom:0}
.parse-label{font-size:var(--font-size-caption);color:var(--text-tertiary);margin-bottom:var(--space-xs)}
.parse-value{font-size:var(--font-size-body);color:var(--text-primary)}
.parse-ent{font-size:12.5px;color:var(--text-primary);padding:var(--space-xs) 0}
.parse-dim{font-size:12.5px;color:var(--text-primary);padding:var(--space-xs) 0;display:flex;align-items:center;gap:var(--space-xs)}
.dim-level{font-size:10px;padding:1px 6px;border-radius:var(--radius-sm)}
.dim-level.high{background:var(--color-danger-bg);color:var(--color-danger)}
.dim-level.medium{background:var(--color-warning-bg);color:var(--color-warning)}
.dim-level.low{background:var(--color-success-bg);color:var(--color-success)}
.parse-actions{display:flex;gap:var(--space-sm);justify-content:flex-end}
@media (max-width:900px){
  .monitor-launch{grid-template-columns:1fr}
  .launch-side{padding-top:0}
  .monitor-rule-list{grid-template-columns:1fr}
  .recognized-grid{grid-template-columns:1fr}
}
@media (max-width:640px){
  .page{padding:var(--space-xl) 16px}
  .created-result{align-items:flex-start;flex-direction:column}
  .created-actions,.launch-actions{width:100%;justify-content:flex-start;flex-wrap:wrap}
  .kpi-row{grid-template-columns:repeat(2,1fr)}
  .monitor-rule-card{flex-direction:column}
  .monitor-rule-side{width:100%;align-items:flex-start;text-align:left}
  .result-header{flex-direction:column}
}
</style>
