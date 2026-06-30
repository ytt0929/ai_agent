<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">智能筛客 · 结果</h1>
        <p class="page-subtitle">{{ store.queryText }}</p>
      </div>
      <el-button type="default" class="back-btn btn-press" @click="go('/screening')">
        <el-icon><Back /></el-icon>
        修改条件
      </el-button>
    </div>

    <!-- Summary Cards — compact, secondary -->
    <div class="summary-row">
      <div class="summary-card card-animate" style="--accent: var(--color-primary)">
        <div class="summary-value" style="color: var(--color-primary)">
          <animated-number :target="store.summary.matched" :duration="1000" />
        </div>
        <div class="summary-label">家匹配</div>
      </div>
      <div class="summary-card card-animate" style="--accent: var(--color-success)">
        <div class="summary-value" style="color: var(--color-success)">
          <animated-number :target="store.summary.highMatched" :duration="1200" />
        </div>
        <div class="summary-label">家高匹配</div>
      </div>
      <div class="summary-card card-animate" style="--accent: var(--color-warning)">
        <div class="summary-value" style="color: var(--color-warning)">
          <animated-number :target="store.summary.canTransfer" :duration="1400" />
        </div>
        <div class="summary-label">家可转尽调</div>
      </div>
    </div>

    <!-- AI Note -->
    <div class="ai-note card-animate">
      <el-icon class="ai-icon"><ChatDotRound /></el-icon>
      <span>已按匹配度排序，优先展示经营稳定、风险较低、具备尽调条件的企业。</span>
    </div>

    <!-- Table Toolbar -->
    <div class="table-toolbar card-animate">
      <div class="toolbar-left">
        <span class="toolbar-selected" v-if="store.selectedIds.size > 0">
          已选 <strong>{{ store.selectedIds.size }}</strong> 家
        </span>
        <span v-else class="toolbar-hint">共 {{ store.customers.length }} 家企业</span>
      </div>
      <div class="toolbar-chips">
        <button class="filter-chip" :class="{ active: riskFilter === '' }" @click="riskFilter = ''">全部</button>
        <button class="filter-chip" :class="{ active: riskFilter === '低风险' }" @click="riskFilter = riskFilter === '低风险' ? '' : '低风险'">
          <span class="chip-dot chip-dot--success"></span>低风险
        </button>
        <button class="filter-chip" :class="{ active: riskFilter === '中风险' }" @click="riskFilter = riskFilter === '中风险' ? '' : '中风险'">
          <span class="chip-dot chip-dot--warning"></span>中风险
        </button>
        <button class="filter-chip" :class="{ active: riskFilter === '高风险' }" @click="riskFilter = riskFilter === '高风险' ? '' : '高风险'">
          <span class="chip-dot chip-dot--danger"></span>高风险
        </button>
      </div>
    </div>

    <!-- Results Table -->
    <div class="table-section card-animate">
      <table class="result-table">
        <thead>
          <tr>
            <th class="col-check">
              <input
                type="checkbox"
                class="custom-checkbox"
                :checked="allSelected"
                @change="toggleAll"
              />
            </th>
            <th class="col-name">企业名称</th>
            <th class="col-match">匹配度</th>
            <th class="col-risk">风险</th>
            <th class="col-reason">推荐理由</th>
            <th class="col-status">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(c, i) in filteredCustomers"
            :key="c.id"
            class="result-row"
            :class="{ selected: store.selectedIds.has(c.id) }"
            :style="{ animationDelay: (i * 0.08) + 's' }"
            @click="store.openDrawer(c)"
          >
            <td class="col-check">
              <input
                type="checkbox"
                class="custom-checkbox"
                :checked="store.selectedIds.has(c.id)"
                @change.stop="store.toggleSelection(c.id)"
                @click.stop
              />
            </td>
            <td class="col-name">
              <div class="name-text">{{ c.name }}</div>
              <div class="name-id">{{ c.id.toUpperCase() }}</div>
            </td>
            <td class="col-match">
              <div class="match-bar-wrap">
                <div class="match-bar" :style="{ width: c.match + '%', background: matchColor(c.match) }"></div>
              </div>
              <span class="match-value" :style="{ color: matchColor(c.match) }">{{ c.match }}</span>
            </td>
            <td class="col-risk">
              <span class="risk-badge" :class="riskClass(c.risk)">{{ c.risk }}</span>
            </td>
            <td class="col-reason">
              <span class="reason-text">{{ c.reason }}</span>
            </td>
            <td class="col-status">
              <span class="status-tag" :class="statusClass(c.status)">{{ c.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Batch Actions -->
    <div class="batch-section card-animate">
      <div class="batch-info">
        <span class="selected-count">已选择 <strong>{{ store.selectedIds.size }}</strong> 家</span>
        <span v-if="store.selectedIds.size === 0" class="selected-hint">勾选企业后批量操作</span>
      </div>
      <div class="batch-actions">
        <el-button type="default" class="batch-btn btn-press" @click="doExport">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button type="default" class="batch-btn btn-press" @click="doMonitor">
          <el-icon><Monitor /></el-icon>
          加入监控
        </el-button>
        <el-button type="primary" class="batch-btn btn-press" @click="doDueDiligence">
          <el-icon><DocumentChecked /></el-icon>
          转入尽调
        </el-button>
      </div>
    </div>

    <!-- Light Drawer -->
    <transition name="drawer">
      <div v-if="store.drawerOpen" class="drawer-overlay" @click="store.closeDrawer()">
        <div class="drawer-panel" @click.stop>
          <div class="drawer-header">
            <h3 class="drawer-title">企业摘要</h3>
            <el-icon class="drawer-close" @click="store.closeDrawer()"><Close /></el-icon>
          </div>
          <div v-if="store.drawerCustomer" class="drawer-body">
            <div class="drawer-name">{{ store.drawerCustomer.name }}</div>
            <div class="drawer-id">{{ store.drawerCustomer.id.toUpperCase() }}</div>

            <div class="drawer-metrics">
              <div class="drawer-metric">
                <div class="drawer-metric-value" :style="{ color: matchColor(store.drawerCustomer.match) }">
                  {{ store.drawerCustomer.match }}
                </div>
                <div class="drawer-metric-label">匹配度</div>
              </div>
              <div class="drawer-metric">
                <div class="drawer-metric-value" :style="{ color: store.drawerCustomer.risk === '低风险' ? 'var(--color-success)' : 'var(--color-warning)' }">
                  {{ store.drawerCustomer.risk }}
                </div>
                <div class="drawer-metric-label">风险等级</div>
              </div>
            </div>

            <div class="drawer-section">
              <div class="drawer-section-title">推荐理由</div>
              <p class="drawer-section-text">{{ store.drawerCustomer.reason }}</p>
            </div>

            <div class="drawer-section">
              <div class="drawer-section-title">状态</div>
              <span class="status-tag" :class="statusClass(store.drawerCustomer.status)">
                {{ store.drawerCustomer.status }}
              </span>
            </div>

            <div class="drawer-actions">
              <el-button type="primary" size="small" class="btn-press" @click="doDueDiligence">
                转入尽调
              </el-button>
              <el-button size="small" class="btn-press" @click="doMonitor">
                加入监控
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Back, ChatDotRound, Download, Monitor, DocumentChecked, Close } from '@element-plus/icons-vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'
import { useScreeningStore } from '../stores/screening'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { useMonitorStore } from '../stores/enterpriseMonitor.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const store = useScreeningStore()
const ddStore = useDueDiligenceStore()
const monitorStore = useMonitorStore()

const riskFilter = ref('')

const filteredCustomers = computed(() => {
  if (!riskFilter.value) return store.customers
  return store.customers.filter(c => c.risk === riskFilter.value)
})

const allSelected = computed(() => {
  return filteredCustomers.value.length > 0 && store.selectedIds.size === filteredCustomers.value.length
})

function go(path) {
  router.push(path)
}

function matchColor(score) {
  if (score >= 90) return 'var(--color-success)'
  if (score >= 80) return 'var(--color-primary)'
  return 'var(--color-warning)'
}

function riskClass(risk) {
  if (risk === '低风险') return 'risk-low'
  if (risk === '中风险') return 'risk-mid'
  return 'risk-high'
}

function statusClass(status) {
  const map = { '可转尽调': 'status-transfer', '待确认': 'status-pending', '可监控': 'status-monitor', '可导出': 'status-export' }
  return map[status] || ''
}

function toggleAll() {
  if (allSelected.value) store.selectedIds.clear()
  else filteredCustomers.value.forEach(c => store.selectedIds.add(c.id))
}

function doExport() {
  ElMessage({ message: `已导出 ${store.selectedIds.size || store.customers.length} 家企业`, type: 'success', duration: 2000 })
}

function doMonitor() {
  if (store.selectedIds.size === 0) {
    ElMessage({ message: '请先选择企业', type: 'warning', duration: 2000 })
    return
  }
  ElMessageBox.confirm(`确认将 ${store.selectedIds.size} 家企业加入监控？`, '加入监控', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    const selected = store.customers.filter(c => store.selectedIds.has(c.id))
    selected.forEach(c => {
      monitorStore.addWatchedCompany({
        name: c.name,
        source: '筛客',
        match: c.match,
        risk: c.risk,
      })
    })
    ElMessage({ message: `已将 ${selected.length} 家企业加入监控`, type: 'success', duration: 2000 })
  }).catch(() => {})
}

function doDueDiligence() {
  if (store.selectedIds.size === 0) {
    ElMessage({ message: '请先选择企业', type: 'warning', duration: 2000 })
    return
  }
  ElMessageBox.confirm(`确认将 ${store.selectedIds.size} 家企业转入尽调？`, '转入尽调', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    const selected = store.customers.filter(c => store.selectedIds.has(c.id))
    selected.forEach(c => {
      ddStore.createTaskFromScreening({
        name: c.name,
        match: c.match,
        risk: c.risk,
        reason: c.reason,
      })
    })
    ElMessage({ message: `已创建尽调任务 ${selected.length} 个，正在跳转...`, type: 'success', duration: 2000 })
    setTimeout(() => { router.push('/due-diligence') }, 800)
  }).catch(() => {})
}

onMounted(() => {
  store.loadResults()
})
</script>

<style scoped>
.page {
  padding:var(--space-xl) var(--space-2xl);
  max-width: var(--layout-page-data);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom:var(--space-xl);
}

.page-title {
  font-size:var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom:var(--space-xs);
}

.page-subtitle {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
  max-width: 500px;
}

.back-btn {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

.back-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Summary Cards — compact */
.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap:var(--space-md);
  margin-bottom:var(--space-md);
}

.summary-card {
  background: var(--surface-card);
  border-radius:var(--radius-md);
  padding:var(--space-md) var(--space-lg);
  text-align: center;
  border: 1px solid var(--border-default);
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
}

.summary-value {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.summary-label {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top:var(--space-xs);
}

/* ====== Table Toolbar ====== */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-sm);
}
.toolbar-left {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
.toolbar-selected strong { color: var(--color-primary); }
.toolbar-hint { color: var(--text-tertiary); }

.toolbar-chips {
  display: flex;
  gap: var(--space-xs);
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--surface-card);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-family);
}
.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}
.filter-chip.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-weight: var(--font-weight-semibold);
}
.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.chip-dot--success { background: var(--color-success); }
.chip-dot--warning { background: var(--color-warning); }
.chip-dot--danger { background: var(--color-danger); }

/* AI Note */
.ai-note {
  display: flex;
  align-items: center;
  gap:var(--space-sm);
  background: var(--color-primary-bg);
  border: 1px solid var(--border-default);
  border-radius:var(--radius-md);
  padding:var(--space-md) var(--space-lg);
  margin-bottom:var(--space-lg);
  font-size:var(--font-size-sm);
  color: var(--color-primary);
}

.ai-icon {
  font-size:var(--font-size-assist);
  flex-shrink: 0;
}

/* Table */
.table-section {
  background: var(--surface-card);
  border-radius:var(--radius-md);
  border: 1px solid var(--border-default);
  overflow: hidden;
  margin-bottom:var(--space-lg);
}

.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-table th {
  padding: var(--space-sm) var(--space-md);
  font-size:var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-align: left;
  background: var(--surface-table-header);
  border-bottom: 1px solid var(--border-default);
}

.col-check { width: 40px; }
.col-name { min-width: 180px; width: 20%; }
.col-match { width: 12%; }
.col-risk { width: 10%; }
.col-reason { min-width: 200px; }
.col-status { width: 110px; }

.result-row {
  opacity: 0;
  animation: slideIn 0.4s ease forwards;
  transition: background 0.15s ease;
  cursor: pointer;
}

.result-row:hover {
  background: var(--surface-page);
}

.result-row.selected {
  background: var(--color-primary-bg);
}

.result-row td {
  padding:var(--space-sm) var(--space-md);
  font-size:var(--font-size-body);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-divider);
  vertical-align: middle;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Checkbox */
.custom-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* Name */
.name-text {
  font-weight: 500;
  font-size:var(--font-size-body);
  color: var(--text-primary);
}

.name-id {
  font-size:var(--font-size-caption);
  color: var(--text-disabled);
  margin-top:var(--space-xs);
}

/* Match Bar */
.match-bar-wrap {
  width: 100%;
  height: 5px;
  background: var(--border-divider);
  border-radius:var(--radius-sm);
  overflow: hidden;
  margin-bottom:var(--space-xs);
}

.match-bar {
  height: 100%;
  border-radius:var(--radius-sm);
  transition: width 0.8s ease;
}

.match-value {
  font-size:var(--font-size-sm);
  font-weight: 600;
}

/* Risk Badge */
.risk-badge {
  display: inline-block;
  padding:0 10px;
  border-radius:var(--radius-sm);
  font-size:var(--font-size-sm);
  font-weight: 500;
}

.risk-low { background: var(--color-success-bg); color: var(--color-success); }
.risk-mid { background: var(--color-warning-bg); color: var(--color-warning); }
.risk-high { background: var(--color-danger-bg); color: var(--color-danger); }

/* Reason */
.reason-text {
  font-size:var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Status Tag */
.status-tag {
  display: inline-block;
  padding:0 10px;
  border-radius:var(--radius-sm);
  font-size:var(--font-size-sm);
  font-weight: 500;
}

.status-transfer { background: var(--color-primary-bg); color: var(--color-primary); }
.status-pending { background: var(--color-warning-bg); color: var(--color-warning); }
.status-monitor { background: var(--color-success-bg); color: var(--color-success); }
.status-export { background: var(--border-divider); color: var(--text-secondary); }

/* Batch Actions — sticky */
.batch-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-card);
  border-radius:var(--radius-md);
  padding:var(--space-lg) var(--space-xl);
  border: 1px solid var(--border-default);
  position: sticky;
  bottom: var(--space-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.selected-count {
  font-size:var(--font-size-body);
  color: var(--text-secondary);
}

.selected-count strong {
  color: var(--color-primary);
  font-weight: 600;
}
.selected-hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-left: var(--space-sm);
}

.batch-actions {
  display: flex;
  gap:var(--space-sm);
}

.batch-btn {
  font-size:var(--font-size-body);
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: var(--drawer-width);
  background: var(--surface-card);
  height: 100vh;
  padding:var(--space-2xl);
  overflow-y: auto;
  box-shadow: var(--shadow-drawer);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom:var(--space-xl);
}

.drawer-title {
  font-size:var(--font-size-assist);
  font-weight: 600;
  color: var(--text-primary);
}

.drawer-close {
  font-size:var(--font-size-page-title);
  color: var(--text-tertiary);
  cursor: pointer;
  padding:var(--space-xs);
  transition: color 0.2s;
}

.drawer-close:hover {
  color: var(--text-primary);
}

.drawer-name {
  font-size:var(--font-size-assist);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom:var(--space-xs);
}

.drawer-id {
  font-size:var(--font-size-sm);
  color: var(--text-disabled);
  margin-bottom:var(--space-xl);
}

.drawer-metrics {
  display: flex;
  gap:var(--space-2xl);
  margin-bottom:var(--space-xl);
}

.drawer-metric {
  text-align: center;
}

.drawer-metric-value {
  font-size:var(--font-size-workbench-title);
  font-weight: 700;
}

.drawer-metric-label {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top:var(--space-xs);
}

.drawer-section {
  margin-bottom:var(--space-lg);
}

.drawer-section-title {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom:var(--space-xs);
}

.drawer-section-text {
  font-size:var(--font-size-body);
  color: var(--text-secondary);
  line-height: 1.5;
}

.drawer-actions {
  display: flex;
  gap:var(--space-sm);
  margin-top: var(--space-2xl);
}

/* Drawer transitions */
.drawer-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-leave-active {
  transition: all 0.25s ease;
}
.drawer-enter-from {
  opacity: 0;
}
.drawer-enter-from .drawer-panel {
  transform: translateX(100%);
}
.drawer-enter-to .drawer-panel {
  transform: translateX(0);
}
.drawer-leave-to {
  opacity: 0;
}
</style>
