<template>
  <div class="due-home">
    <!-- 头部 -->
    <div class="due-home__header">
      <div class="due-home__title-area">
        <h1 class="due-home__title">智能尽调</h1>
        <p class="due-home__subtitle">管理由工作台、筛客结果、企业探查或本页直接创建的尽调任务</p>
      </div>
      <div class="due-home__actions">
        <el-button type="primary" @click="openNewDialog">新建尽调</el-button>
        <el-button plain @click="router.push('/screening')">从筛客创建</el-button>
      </div>
    </div>

    <!-- 任务概览 -->
    <div class="due-home__stats">
      <el-card shadow="never" class="stat-card" v-for="(stat, idx) in displayStats" :key="stat.label">
        <div class="stat-card__value" :style="{ color: stat.color }">{{ stat.value }}</div>
        <div class="stat-card__label">{{ stat.label }}</div>
      </el-card>
    </div>

    <!-- 筛选区 -->
    <div class="due-home__filter">
      <el-input
        v-model="searchText"
        placeholder="搜索企业 / 信用代码"
        clearable
        size="default"
        class="filter-search"
        style="width: 240px"
      />
      <el-select v-model="statusFilter" placeholder="状态" clearable size="default" style="width: 120px">
        <el-option label="全部" value="" />
        <el-option label="进行中" value="进行中" />
        <el-option label="等待客户" value="等待客户" />
        <el-option label="待确认" value="待确认" />
        <el-option label="已完成" value="已完成" />
      </el-select>
      <el-select v-model="sourceFilter" placeholder="来源" clearable size="default" style="width: 120px">
        <el-option label="全部" value="" />
        <el-option label="工作台AI" value="工作台AI" />
        <el-option label="本页创建" value="本页创建" />
        <el-option label="筛客转入" value="筛客转入" />
        <el-option label="企业探查" value="企业探查" />
      </el-select>
      <el-select v-model="templateFilter" placeholder="模板" clearable size="default" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="尽职调查报告" value="尽职调查报告" />
        <el-option label="小微快审尽调" value="小微快审尽调" />
        <el-option label="税票专项尽调" value="税票专项尽调" />
      </el-select>

      <!-- 快捷标签筛选 -->
      <div class="filter-tags">
        <el-tag
          :type="activeQuickTag === '' ? 'primary' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilter('')"
          style="cursor: pointer"
        >全部</el-tag>
        <el-tag
          :type="activeQuickTag === '进行中' ? 'primary' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilter('进行中')"
          style="cursor: pointer"
        >进行中</el-tag>
        <el-tag
          :type="activeQuickTag === '等待客户' ? 'warning' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilter('等待客户')"
          style="cursor: pointer"
        >等待客户</el-tag>
        <el-tag
          :type="activeQuickTag === '待确认' ? 'danger' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilter('待确认')"
          style="cursor: pointer"
        >待确认</el-tag>
        <el-tag
          :type="activeQuickTag === '已完成' ? 'success' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilter('已完成')"
          style="cursor: pointer"
        >已完成</el-tag>
        <el-tag
          :type="activeQuickTag === 'source:工作台AI' ? 'success' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilterSource('工作台AI')"
          style="cursor: pointer"
        >来自工作台</el-tag>
        <el-tag
          :type="activeQuickTag === 'source:本页创建' ? 'primary' : 'info'"
          effect="plain"
          size="small"
          @click="quickFilterSource('本页创建')"
          style="cursor: pointer"
        >本页创建</el-tag>
      </div>
    </div>

    <!-- 任务列表 -->
    <el-card shadow="never" class="due-home__tasks">
      <template #header>
        <div class="task-list-header">
          <span class="task-list__title">任务列表</span>
          <span class="task-list__count">{{ filteredTasks.length }} 笔</span>
        </div>
      </template>

      <el-table :data="filteredTasks" size="default" stripe style="width: 100%" empty-text="没有匹配的尽调任务">
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="企业" min-width="180">
          <template #default="{ row }">
            <div class="enterprise-cell">
              <span class="enterprise-cell__name">{{ row.name }}</span>
              <span class="enterprise-cell__meta">{{ row.industry }} · {{ row.region }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="模板" width="120">
          <template #default="{ row }">
            <span class="cell-text">{{ row.templateName || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="getSourceTagType(row.source)" size="small" effect="plain">{{ row.source || '—' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="当前阶段" min-width="140">
          <template #default="{ row }">
            <span class="cell-text">{{ row.statusText || row.nextAction || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="进度" width="100" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :stroke-width="6" :color="getProgressColor(row.progress)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="continueTask(row)">{{ getTaskActionLabel(row) }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredTasks.length === 0" description="没有匹配的尽调任务，可新建或从筛客创建" />
    </el-card>

    <!-- 新建尽调弹窗 -->
    <el-dialog v-model="newDialogVisible" title="新建尽调" width="480px" destroy-on-close>
      <el-form :model="newForm" label-width="120px" label-position="left" class="new-form">
        <el-form-item label="企业名称">
          <el-select v-model="newForm.name" filterable allow-create placeholder="选择或输入企业名称" style="width: 100%">
            <el-option label="唐山物桥商贸有限公司" value="唐山物桥商贸有限公司" />
            <el-option label="杭州智造装备有限公司" value="杭州智造装备有限公司" />
            <el-option label="宁波天合新材料有限公司" value="宁波天合新材料有限公司" />
          </el-select>
        </el-form-item>
        <el-form-item label="统一社会信用代码">
          <el-input v-model="newForm.creditCode" placeholder="91130203MA7EEQ2N0T" />
        </el-form-item>
        <el-form-item label="尽调模板">
          <el-select v-model="newForm.templateName" style="width: 100%">
            <el-option label="尽职调查报告" value="尽职调查报告" />
            <el-option label="小微快审尽调" value="小微快审尽调" />
            <el-option label="税票专项尽调" value="税票专项尽调" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务负责人">
          <el-select v-model="newForm.manager" style="width: 100%">
            <el-option label="张经理" value="张经理" />
            <el-option label="李经理" value="李经理" />
            <el-option label="王经理" value="王经理" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newForm.priority" style="width: 100%">
            <el-option label="普通" value="普通" />
            <el-option label="较高" value="较高" />
            <el-option label="紧急" value="紧急" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createNewTask">创建尽调任务</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useDueDiligenceStore()

const tasks = computed(() => store.tasks)

// 统计
const displayStats = computed(() => [
  { label: '进行中', value: store.stats.inProgress, color: 'var(--color-primary)' },
  { label: '等待客户', value: store.stats.waiting, color: 'var(--color-warning)' },
  { label: '待确认', value: store.stats.pending, color: 'var(--color-danger)' },
  { label: '已完成', value: store.stats.completed, color: 'var(--color-success)' },
  { label: '今日新增', value: store.stats.todayNew, color: 'var(--text-secondary, #64748b)' },
])

// 筛选
const searchText = ref('')
const statusFilter = ref('')
const sourceFilter = ref('')
const templateFilter = ref('')
const activeQuickTag = ref('')

function quickFilter(status) {
  activeQuickTag.value = status
  statusFilter.value = status
  sourceFilter.value = ''
  templateFilter.value = ''
}

function quickFilterSource(source) {
  activeQuickTag.value = 'source:' + source
  sourceFilter.value = source
  statusFilter.value = ''
  templateFilter.value = ''
}

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
    list = list.filter(t => t.source === sourceFilter.value)
  }
  if (templateFilter.value) {
    list = list.filter(t => t.templateName === templateFilter.value)
  }
  return list
})

// 新建弹窗
const newDialogVisible = ref(false)
const newForm = ref({
  name: '唐山物桥商贸有限公司',
  creditCode: '91130203MA7EEQ2N0T',
  templateName: '尽职调查报告',
  manager: '张经理',
  priority: '普通',
})

function openNewDialog() {
  newForm.value = {
    name: '唐山物桥商贸有限公司',
    creditCode: '91130203MA7EEQ2N0T',
    templateName: '尽职调查报告',
    manager: '张经理',
    priority: '普通',
  }
  newDialogVisible.value = true
}

function createNewTask() {
  if (!newForm.value.name) {
    ElMessage.warning('请输入企业名称')
    return
  }
  const result = store.createManualTask({ ...newForm.value })
  if (result.existing) {
    newDialogVisible.value = false
    statusFilter.value = ''
    sourceFilter.value = ''
    templateFilter.value = ''
    activeQuickTag.value = ''
    searchText.value = ''
    ElMessage.info('该企业已有尽调任务，已为你定位到任务列表')
  } else {
    newDialogVisible.value = false
    statusFilter.value = ''
    sourceFilter.value = ''
    templateFilter.value = ''
    activeQuickTag.value = ''
    searchText.value = ''
    ElMessage.success('已创建尽调任务')
  }
}

function continueTask(row) {
  store.selectTask(row.id)
  router.push(`/due-diligence/${row.id}`)
}

function getStatusTagType(status) {
  const map = { '进行中': 'primary', '等待客户': 'warning', '待确认': 'danger', '已完成': 'success' }
  return map[status] || 'info'
}

function getSourceTagType(source) {
  const map = { '工作台AI': 'success', '本页创建': 'primary', '筛客转入': 'info', '企业探查': '' }
  return map[source] || 'info'
}

function getTaskActionLabel(row) {
  if (row.status === '等待客户') return '继续处理'
  if (row.status === '进行中') return '继续处理'
  if (row.status === '待确认') return '编辑报告'
  if (row.status === '已完成') return '查看报告'
  return '查看任务'
}

function getProgressColor(progress) {
  if (progress >= 100) return 'var(--color-success, #67c23a)'
  if (progress >= 60) return 'var(--color-primary, #409eff)'
  if (progress >= 30) return 'var(--color-warning, #e6a23c)'
  return 'var(--text-tertiary, #909399)'
}
</script>

<style scoped>
.due-home {
  padding: var(--space-4xl, 32px);
  max-width: var(--layout-page-data, 1200px);
  margin: 0 auto;
}

/* 头部 */
.due-home__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2xl, 24px);
}

.due-home__title {
  font-size: var(--font-size-page-title, 24px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs, 8px);
}

.due-home__subtitle {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.due-home__actions {
  display: flex;
  gap: var(--space-sm, 8px);
  flex-shrink: 0;
}

/* 统计卡片 */
.due-home__stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-lg, 16px);
  margin-bottom: var(--space-2xl, 24px);
}

.stat-card :deep(.el-card__body) {
  padding: var(--space-lg, 16px) var(--space-xl, 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card__value {
  font-size: var(--font-size-workbench-title, 28px);
  font-weight: 700;
  line-height: 1.2;
}

.stat-card__label {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary);
  margin-top: var(--space-xs, 8px);
}

/* 筛选区 */
.due-home__filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm, 8px);
  margin-bottom: var(--space-lg, 16px);
}

.filter-tags {
  display: flex;
  gap: var(--space-xs, 8px);
  margin-left: auto;
}

/* 任务列表 */
.due-home__tasks :deep(.el-card__header) {
  padding: var(--space-md, 12px) var(--space-lg, 16px);
  background: var(--surface-card, #fff);
}

.task-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-list__title {
  font-size: var(--font-size-section-title, 16px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
}

.task-list__count {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary);
}

.enterprise-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.enterprise-cell__name {
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary);
}

.enterprise-cell__meta {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-tertiary);
}

.cell-text {
  font-size: var(--font-size-sm, 13px);
  color: var(--text-primary);
}

/* 新建弹窗 */
.new-form {
  padding: var(--space-md, 12px) 0;
}

@media (max-width: 960px) {
  .due-home__stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .due-home__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .due-home__header {
    flex-direction: column;
    gap: var(--space-md, 12px);
  }
  .filter-tags {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>
