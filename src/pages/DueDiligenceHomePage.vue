<template>
  <div class="due-home">
    <!-- 头部 -->
    <div class="due-home__header">
      <div class="due-home__title-area">
        <h1 class="due-home__title">智能尽调</h1>
        <p class="due-home__subtitle">自动发起、跨天跟进、税票RPA采集，最终形成尽调产物</p>
      </div>
      <el-button type="primary" class="due-home__launch-btn" @click="launchNew" round>
        <el-icon><Plus /></el-icon>
        发起智能尽调
      </el-button>
    </div>

    <el-dialog
      v-model="launchDialogVisible"
      title="选择尽调企业"
      width="720px"
      class="launch-dialog"
    >
      <div class="launch-selector">
        <div class="launch-selector__toolbar">
          <el-input
            v-model="launchSearch"
            placeholder="搜索企业名称 / 行业 / 地区"
            clearable
            class="launch-selector__search"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button plain @click="router.push('/screening')">去智能筛客</el-button>
        </div>

        <div class="launch-selector__list">
          <button
            v-for="customer in launchCandidates"
            :key="customer.id"
            type="button"
            class="launch-customer"
            :class="{ 'launch-customer--selected': selectedLaunchCustomerId === customer.id }"
            @click="selectedLaunchCustomerId = customer.id"
          >
            <span class="launch-customer__radio">
              <span v-if="selectedLaunchCustomerId === customer.id"></span>
            </span>
            <span class="launch-customer__main">
              <strong>{{ customer.name }}</strong>
              <small>{{ customer.industry }} · {{ customer.region }}</small>
            </span>
            <span class="launch-customer__meta">
              <span>{{ customer.match || '—' }}%</span>
              <em>{{ customer.status || customer.transferable || '待确认' }}</em>
            </span>
          </button>
        </div>

        <el-empty
          v-if="launchCandidates.length === 0"
          description="没有匹配企业，可先通过智能筛客生成候选客户"
        />
      </div>

      <template #footer>
        <el-button @click="launchDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedLaunchCustomer" @click="confirmLaunch">
          发起尽调
        </el-button>
      </template>
    </el-dialog>

    <!-- 统计卡片 -->
    <div class="due-home__stats">
      <div
        class="stat-card card-animate"
        v-for="(stat, idx) in displayStats"
        :key="stat.label"
      >
        <div class="stat-card__value" :style="{ color: stat.color }">{{ stat.value }}</div>
        <div class="stat-card__label">{{ stat.label }}</div>
      </div>
    </div>

    <!-- 任务队列：表格 -->
    <div class="due-home__tasks">
      <!-- 工具栏 -->
      <div class="task-toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchText"
            placeholder="搜索企业名称 / 信用代码"
            clearable
            size="default"
            class="task-search"
            @input="onSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="statusFilter" placeholder="状态" clearable size="default" class="task-filter" @change="onFilter">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
          <el-select v-model="sourceFilter" placeholder="来源" clearable size="default" class="task-filter" @change="onFilter">
            <el-option label="全部" value="" />
            <el-option label="手动创建" value="手动" />
            <el-option label="筛客转入" value="筛客" />
            <el-option label="企业探查" value="企业探查" />
          </el-select>
          <el-select v-model="sortBy" placeholder="排序" size="default" class="task-filter" @change="onSort">
            <el-option label="最近创建" value="newest" />
            <el-option label="进度优先" value="progress" />
            <el-option label="状态优先" value="status" />
          </el-select>
        </div>
        <div class="toolbar-right">
          <span class="task-count-text">{{ filteredTasks.length }} 笔</span>
          <span v-if="pendingCount > 0" class="pending-badge">
            <span class="pending-dot"></span>
            {{ pendingCount }} 笔待处理
          </span>
        </div>
      </div>

      <!-- 任务队列表格 -->
      <div class="task-table-wrap">
        <table class="task-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" class="custom-checkbox" :checked="allSelected" @change="toggleAll" />
              </th>
              <th class="col-enterprise">企业名称</th>
              <th class="col-status">状态</th>
              <th class="col-progress">进度</th>
              <th class="col-blocker">阻塞 / 风险</th>
              <th class="col-next">下一步</th>
              <th class="col-source">来源</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in filteredAndSortedTasks"
              :key="task.id"
              class="task-row"
              :class="{ 'task-row--urgent': isUrgent(task), 'task-row--selected': selectedIds.has(task.id) }"
              @click="selectTask(task.id)"
            >
              <td class="col-check">
                <input type="checkbox" class="custom-checkbox" :checked="selectedIds.has(task.id)" @change.stop="toggleOne(task.id)" @click.stop />
              </td>
              <td class="col-enterprise">
                <div class="enterprise-name">{{ task.name }}</div>
                <div class="enterprise-meta">{{ task.industry }} · {{ task.region }}</div>
              </td>
              <td class="col-status">
                <el-tag :type="getStatusTagType(task.status)" size="small" effect="light" round>
                  {{ task.status }}
                </el-tag>
              </td>
              <td class="col-progress">
                <div class="progress-cell">
                  <div class="progress-mini-bar">
                    <div class="progress-mini-fill" :style="{ width: task.progress + '%' }"></div>
                  </div>
                  <span class="progress-pct">{{ task.progress }}%</span>
                </div>
              </td>
              <td class="col-blocker">
                <span v-if="getBlocker(task)" class="blocker-tag" :class="getBlockerClass(task)">
                  {{ getBlocker(task) }}
                </span>
                <span v-else class="blocker-ok">无</span>
              </td>
              <td class="col-next">
                <span class="next-action-text">{{ task.nextAction }}</span>
              </td>
              <td class="col-source">
                <span v-if="task.source === '筛客'" class="source-tag source--screening">筛客</span>
                <span v-else-if="task.source === '企业探查'" class="source-tag source--exploration">企业探查</span>
                <span v-else class="source-tag source--manual">手动</span>
              </td>
              <td class="col-action">
                <el-button size="small" type="primary" link @click.stop="selectTask(task.id)">查看</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { useTaxRpaStore } from '../stores/taxRpa.js'
import { useScreeningStore } from '../stores/screening.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const store = useDueDiligenceStore()
const taxRpaStore = useTaxRpaStore()
const screeningStore = useScreeningStore()

const tasks = computed(() => store.tasks)
const rawStats = computed(() => store.stats)
const taxStats = computed(() => taxRpaStore.stats)

// 筛选 & 搜索
const searchText = ref('')
const statusFilter = ref('')
const sourceFilter = ref('')
const sortBy = ref('newest')
const selectedIds = ref(new Set())
const launchDialogVisible = ref(false)
const launchSearch = ref('')
const selectedLaunchCustomerId = ref('')

const allSelected = computed(() => {
  return filteredTasks.value.length > 0 && selectedIds.value.size === filteredTasks.value.length
})

const pendingCount = computed(() => {
  return filteredTasks.value.filter(t => isUrgent(t)).length
})

function isUrgent(task) {
  return task.status === '报告待确认' || task.status === '等待税票RPA' || getTaxTaskForDue(task)?.status === '已过期'
}

function getBlocker(task) {
  if (task.status === '等待税票RPA') return '税票未采集'
  if (task.status === '等待资料上传') return '资料缺失'
  if (task.status === '报告待确认') return '报告待确认'
  const tax = getTaxTaskForDue(task)
  if (tax?.status === '已过期') return '税票已超时'
  if (tax?.status === '授权中') return '等待授权'
  return ''
}

function getBlockerClass(task) {
  const b = getBlocker(task)
  if (b.includes('超时') || b.includes('确认') || b.includes('缺失')) return 'blocker--danger'
  if (b.includes('等待') || b.includes('未采集')) return 'blocker--warning'
  return ''
}

function toggleAll() {
  if (allSelected.value) selectedIds.value.clear()
  else filteredTasks.value.forEach(t => selectedIds.value.add(t.id))
}

function toggleOne(id) {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
}

const statusOptions = ['草稿', '等待税票RPA', '等待资料上传', 'AI处理中', '报告待确认', '已完成']

const filteredTasks = computed(() => {
  let list = tasks.value
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) || (t.creditCode || '').toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) {
    list = list.filter(t => t.status === statusFilter.value)
  }
  if (sourceFilter.value) {
    list = list.filter(t => (t.source || '手动').includes(sourceFilter.value))
  }
  return list
})

const filteredAndSortedTasks = computed(() => {
  const list = [...filteredTasks.value]
  if (sortBy.value === 'newest') {
    // 默认：新任务在前
    list.sort((a, b) => (b.id || '').localeCompare(a.id || ''))
  } else if (sortBy.value === 'progress') {
    list.sort((a, b) => b.progress - a.progress)
  } else if (sortBy.value === 'status') {
    const order = { '报告待确认': 0, 'AI处理中': 1, '等待税票RPA': 2, '等待资料上传': 3, '草稿': 4 }
    list.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5))
  }
  return list
})

const launchCandidates = computed(() => {
  const query = launchSearch.value.trim().toLowerCase()
  const list = screeningStore.customers.length ? screeningStore.customers : []
  if (!query) return list
  return list.filter(customer => {
    return [customer.name, customer.industry, customer.region, customer.status, customer.transferable]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query))
  })
})

const selectedLaunchCustomer = computed(() => {
  return launchCandidates.value.find(customer => customer.id === selectedLaunchCustomerId.value) || null
})

function onSearch() { /* trigger computed */ }
function onFilter() { /* trigger computed */ }
function onSort() { /* trigger computed */ }



const displayStats = computed(() => [
  { label: '进行中', value: rawStats.value.inProgress + rawStats.value.processing, color: 'var(--color-primary)' },
  { label: '待我处理', value: rawStats.value.pending, color: 'var(--color-danger)' },
  { label: '等待授权', value: rawStats.value.waiting, color: 'var(--color-warning)' },
  { label: '税票已超时', value: taxStats.value.expired, color: 'var(--color-warning)' },
])

/** 通过 creditCode 或企业名称前4字匹配税票任务 */
function getTaxTaskForDue(dueTask) {
  if (!dueTask.creditCode) return null
  return taxRpaStore.tasks.find(t => {
    if (dueTask.creditCode && t.creditCode === dueTask.creditCode) return true
    if (dueTask.name && t.enterprise) {
      const duePrefix = dueTask.name.slice(0, 4)
      const taxPrefix = t.enterprise.slice(0, 4)
      if (dueTask.name.includes(taxPrefix) || t.enterprise.includes(duePrefix)) return true
    }
    return false
  })
}

/** 税票状态展示文案 */
function getTaxStatusText(taxTask) {
  const map = {
    '授权中': '等待授权',
    '已授权': '已授权',
    '采集中': '采集中',
    '已完成': '已完成',
    '已过期': '已超时',
  }
  return map[taxTask.status] || taxTask.status
}

/** 税票操作按钮文案 */
function getTaxActionText(taxTask) {
  if (taxTask.status === '采集中') return '查看'
  if (taxTask.status === '授权中' || taxTask.status === '已过期') return '提醒'
  return ''
}

/** 税票操作按钮点击 */
function handleTaxAction(dueTask) {
  const taxTask = getTaxTaskForDue(dueTask)
  if (!taxTask) return
  if (taxTask.status === '授权中' || taxTask.status === '已过期') {
    taxRpaStore.selectTask(taxTask.id)
    taxRpaStore.resendAuth()
    ElMessage.success('已发送税票授权提醒')
  } else {
    taxRpaStore.selectTask(taxTask.id)
    ElMessage.info('查看税票采集详情')
  }
}

function getStatusTagType(status) {
  if (status.includes('等待')) return 'warning'
  if (status.includes('处理中') || status.includes('AI')) return 'success'
  if (status.includes('待确认')) return 'danger'
  return 'info'
}

function launchNew() {
  if (!screeningStore.customers.length) {
    screeningStore.loadResults()
  }
  selectedLaunchCustomerId.value = screeningStore.customers[0]?.id || ''
  launchDialogVisible.value = true
}

function confirmLaunch() {
  const customer = selectedLaunchCustomer.value
  if (!customer) {
    ElMessage.warning('请先选择一家企业')
    return
  }
  const task = store.createTaskFromScreening(customer)
  store.selectTask(task.id)
  launchDialogVisible.value = false
  ElMessage.success(`已为「${customer.name}」创建尽调任务`)
  router.push(`/due-diligence/${task.id}`)
}

function selectTask(taskId) {
  store.selectTask(taskId)
  router.push(`/due-diligence/${taskId}`)
}
</script>

<style scoped>
.due-home {
  padding:var(--space-4xl);
  max-width: var(--layout-page-data);
  margin: 0 auto;
}

.due-home__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2xl);
}

.due-home__title {
  font-size:var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom:var(--space-xs);
}

.due-home__subtitle {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
  line-height: 1.5;
}

.due-home__launch-btn {
  padding:var(--space-sm) var(--space-2xl);
  font-size:var(--font-size-lg);
  font-weight: 500;
  flex-shrink: 0;
}

.launch-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.launch-selector__toolbar {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.launch-selector__search {
  flex: 1;
}

.launch-selector__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 360px;
  overflow-y: auto;
}

.launch-customer {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  padding: var(--space-md);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-md);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.launch-customer:hover {
  border-color: var(--color-primary-border);
  background: var(--color-primary-bg);
}

.launch-customer--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  box-shadow: var(--shadow-sm);
}

.launch-customer__radio {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.launch-customer--selected .launch-customer__radio {
  border-color: var(--color-primary);
}

.launch-customer__radio span {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
}

.launch-customer__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.launch-customer__main strong {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.launch-customer__main small {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.launch-customer__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  font-size: var(--font-size-xs);
}

.launch-customer__meta span {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.launch-customer__meta em {
  color: var(--text-tertiary);
  font-style: normal;
}

/* 统计卡片 */
.due-home__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap:var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.stat-card {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding:var(--space-lg) var(--space-xl);
  transition: transform 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
}

.stat-card__value {
  font-size:var(--font-size-workbench-title);
  font-weight: 700;
  line-height: 1.2;
}

.stat-card__label {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top:var(--space-xs);
}

/* 任务列表 */
.due-home__section-title {
  font-size:var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom:var(--space-md);
}

/* 工具栏 */
.task-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom:var(--space-lg);
  gap:var(--space-md);
  flex-wrap: wrap;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap:var(--space-sm);
  flex-wrap: wrap;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap:var(--space-sm);
}
.task-search {
  width: 240px;
}
.task-filter {
  width: 130px;
}
.task-count-text {
  font-size:var(--font-size-sm);
  color: var(--text-tertiary);
}

.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.pending-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
}

/* ====== 任务队列表格 ====== */
.task-table-wrap {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-align: left;
  background: var(--surface-table-header);
  border-bottom: 1px solid var(--border-default);
}

.col-check { width: 40px; }
.col-enterprise { min-width: 180px; }
.col-status { width: 120px; }
.col-progress { width: 100px; }
.col-blocker { width: 120px; }
.col-next { min-width: 130px; }
.col-source { width: 80px; }
.col-action { width: 60px; }

.task-row {
  transition: background 0.15s ease;
  cursor: pointer;
}

.task-row:hover { background: var(--surface-page); }
.task-row--selected { background: var(--color-primary-bg); }
.task-row--urgent {
  border-left: 3px solid var(--color-warning);
  background: var(--color-warning-bg);
}

.task-row td {
  padding: var(--space-md) var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-divider);
  vertical-align: middle;
}

.enterprise-name {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-body);
  margin-bottom: 2px;
}
.enterprise-meta {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* Progress mini bar */
.progress-cell { display: flex; align-items: center; gap: var(--space-xs); }
.progress-mini-bar {
  flex: 1;
  height: 4px;
  background: var(--border-divider);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.progress-mini-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
}
.task-row--urgent .progress-mini-fill { background: var(--color-warning); }
.progress-pct { font-size: var(--font-size-xs); color: var(--text-tertiary); min-width: 28px; text-align: right; }

/* Blocker */
.blocker-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
.blocker--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.blocker--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.blocker-ok { color: var(--text-tertiary); font-size: var(--font-size-xs); }

.next-action-text { color: var(--text-secondary); font-size: var(--font-size-sm); }

/* Source tag */
.source-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
.source--screening { background: var(--color-success-bg); color: var(--color-success); }
.source--exploration { background: var(--color-primary-bg); color: var(--color-primary); }
.source--manual { background: var(--surface-page); color: var(--text-tertiary); }

.custom-checkbox {
  width: 14px;
  height: 14px;
  accent-color: var(--color-primary);
  cursor: pointer;
}
</style>
