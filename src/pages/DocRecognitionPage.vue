<template>
  <div class="page page--wide doc-rec-page">
    <!-- 头部 -->
    <div class="doc-rec-header">
      <div>
        <h1 class="page-title">资料识别</h1>
        <p class="page-subtitle">上传文件 → AI OCR 识别 → 字段提取 → 交叉比对 → 经营分析</p>
      </div>
      <div class="header-stats">
        <div class="hs-item">
          <span class="hs-value" style="color: var(--color-success)">{{ store.stats.done }}</span>
          <span class="hs-label">已完成</span>
        </div>
        <div class="hs-item">
          <span class="hs-value" style="color: var(--color-warning)">{{ store.stats.pending }}</span>
          <span class="hs-label">待确认</span>
        </div>
        <div class="hs-item">
          <span class="hs-value" style="color: var(--color-primary)">{{ store.stats.processing }}</span>
          <span class="hs-label">识别中</span>
        </div>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="doc-rec-body">
      <!-- 左侧：任务列表 -->
      <div class="doc-rec-task-list">
        <div class="doc-rec-filter">
          <div class="filter-label">筛选</div>
          <div class="filter-chips">
            <div
              v-for="chip in filterChips"
              :key="chip.key"
              class="filter-chip"
              :class="{ active: store.statusFilter === chip.key }"
              @click="store.statusFilter = chip.key"
            >{{ chip.label }}</div>
          </div>
          <div class="filter-search">
            <el-icon><Search /></el-icon>
            <input v-model="store.searchQuery" placeholder="搜索企业/文件" />
          </div>
        </div>

        <div class="doc-rec-task-items">
          <div
            v-for="task in store.filteredTasks"
            :key="task.id"
            class="doc-rec-task-card"
            :class="{ active: store.currentTaskId === task.id }"
            @click="store.selectTask(task.id)"
          >
            <div class="dtc-name">{{ task.name }}</div>
            <div class="dtc-meta">{{ task.industry }} · {{ task.amount }}</div>
            <div class="dtc-files">
              <div class="dtc-file-count">
                <span class="dtc-count-num">{{ task.files.length }}</span>
                <span class="dtc-count-label">份文件</span>
              </div>
              <div class="dtc-file-status">
                <span v-if="task.files.some(f => f.status === '待确认')" class="dtc-dot dtc-dot-warning" title="有待确认文件"></span>
                <span v-if="task.files.some(f => f.status === '识别中')" class="dtc-dot dtc-dot-primary" title="有识别中文件"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：文件列表 + 上传 -->
      <div class="doc-rec-file-list">
        <div v-if="store.currentTask" class="doc-rec-file-header">
          <h3 class="doc-rec-file-title">{{ store.currentTask.name }}</h3>
          <div class="doc-rec-file-subtitle">共 {{ store.currentTask.files.length }} 份文件</div>
        </div>

        <!-- 上传区域 -->
        <div class="doc-rec-upload" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">点击或拖拽上传文件</div>
          <div class="upload-hint">支持 PDF / Word / Excel / 图片</div>
          <input ref="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" style="display:none" @change="handleFileSelect" />
        </div>

        <!-- 文件列表 -->
        <div v-if="store.currentTask" class="doc-rec-files">
          <div
            v-for="file in store.currentTask.files"
            :key="file.id"
            class="doc-rec-file-item"
            :class="{ active: store.currentFileId === file.id }"
            @click="store.selectFile(file.id)"
          >
            <div class="drfi-icon">{{ fileIcon(file.type) }}</div>
            <div class="drfi-info">
              <div class="drfi-name">{{ file.name }}</div>
              <div class="drfi-meta">
                <span>{{ file.size }}</span>
                <span class="meta-dot">·</span>
                <span>{{ file.uploadedAt }}</span>
              </div>
            </div>
            <div class="drfi-status">
              <el-tag v-if="file.status === '已完成'" size="small" type="success" effect="plain" round>已完成</el-tag>
              <el-tag v-else-if="file.status === '待确认'" size="small" type="warning" effect="plain" round>待确认</el-tag>
              <el-tag v-else-if="file.status === '识别中'" size="small" type="primary" effect="plain" round>
                <el-icon class="spin-icon"><Loading /></el-icon>
                识别中
              </el-tag>
            </div>
          </div>
        </div>
        <div v-else class="doc-rec-empty">
          <el-empty description="选择左侧任务或上传新文件" />
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="doc-rec-result" v-if="store.currentTask">
        <!-- 面板切换 Tab -->
        <div class="doc-rec-tabs">
          <div
            class="doc-rec-tab"
            :class="{ active: store.activePanel === 'file' }"
            @click="store.activePanel = 'file'"
          >📄 字段识别</div>
          <div
            class="doc-rec-tab"
            :class="{ active: store.activePanel === 'compare' }"
            @click="store.activePanel = 'compare'"
          >
            📊 交叉比对
            <span v-if="store.conflictCount" class="tab-badge tab-badge--danger">{{ store.conflictCount }}</span>
            <span v-if="store.warningCount && !store.conflictCount" class="tab-badge tab-badge--warning">{{ store.warningCount }}</span>
          </div>
        </div>

        <!-- ===== 字段识别面板 ===== -->
        <div v-if="store.activePanel === 'file'" class="doc-rec-panel">
          <div v-if="store.currentFile" class="doc-rec-panel-content">
            <div class="doc-rec-result-header">
              <h3 class="doc-rec-result-title">{{ store.currentFile.name }}</h3>
              <div class="doc-rec-result-type">{{ store.currentFile.type }}</div>
            </div>

            <div v-if="store.currentFile.status === '识别中'" class="doc-rec-recognizing">
              <div class="dr-recognizing-spinner"></div>
              <div class="dr-recognizing-text">AI 正在识别文件内容...</div>
              <div class="dr-recognizing-sub">预计 10-30 秒完成</div>
            </div>

            <div v-else class="doc-rec-fields">
              <div v-if="store.lowConfidenceFields.length" class="doc-rec-warning-card">
                <el-icon><WarningFilled /></el-icon>
                <span class="drwc-text">{{ store.lowConfidenceFields.length }} 个字段置信度低于 70%，建议人工核对</span>
              </div>

              <div class="drf-list">
                <div
                  v-for="field in store.currentFileFields"
                  :key="field.label"
                  class="drf-item"
                  :class="{ lowConf: field.confidence < 70, confirmed: field.confidence === 100 }"
                >
                  <div class="drf-label">{{ field.label }}</div>
                  <div class="drf-value-wrap">
                    <input
                      v-if="editingField === field.label"
                      v-model="editingValue"
                      class="drf-edit-input"
                      @keyup.enter="saveEdit(field.label)"
                      @blur="saveEdit(field.label)"
                      ref="editInput"
                    />
                    <span v-else class="drf-value" @dblclick="startEdit(field.label, field.value)">{{ field.value }}</span>
                  </div>
                  <div class="drf-confidence">
                    <div class="drf-confidence-bar">
                      <div
                        class="drf-confidence-fill"
                        :class="confidenceClass(field.confidence)"
                        :style="{ width: field.confidence + '%' }"
                      ></div>
                    </div>
                    <span class="drf-confidence-num" :class="confidenceClass(field.confidence)">{{ field.confidence }}%</span>
                  </div>
                  <div v-if="field.confidence < 70 && !editingField" class="drf-actions">
                    <el-button size="small" text type="warning" @click="startEdit(field.label, field.value)">✏️ 修正</el-button>
                  </div>
                </div>
              </div>

              <div class="doc-rec-actions">
                <el-button type="primary" :disabled="store.currentFile.status === '已完成'" @click="handleConfirm">确认并同步</el-button>
                <el-button plain @click="handleSync">同步到尽调</el-button>
              </div>
            </div>
          </div>
          <div v-else class="doc-rec-panel-empty">
            <el-empty description="选择文件查看识别结果" />
          </div>
        </div>

        <!-- ===== 交叉比对面板 ===== -->
        <div v-if="store.activePanel === 'compare'" class="doc-rec-panel">
          <div v-if="store.crossCompare" class="doc-rec-panel-content">
            <!-- 数据一致性验证 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><Link /></el-icon>
                数据一致性验证
              </div>
              <div class="cc-list">
                <div
                  v-for="(check, idx) in store.crossCompare.consistencyChecks"
                  :key="idx"
                  class="cc-item"
                  :class="'cc-' + check.status"
                >
                  <div class="cc-item-icon">
                    <span v-if="check.status === 'match'" class="cc-icon cc-icon-success">✓</span>
                    <span v-else-if="check.status === 'conflict'" class="cc-icon cc-icon-danger">✗</span>
                    <span v-else-if="check.status === 'warning'" class="cc-icon cc-icon-warning">!</span>
                    <span v-else class="cc-icon cc-icon-pending">○</span>
                  </div>
                  <div class="cc-item-info">
                    <div class="cc-item-label">{{ check.label }}</div>
                    <div class="cc-item-detail">{{ check.detail }}</div>
                    <div class="cc-item-sources">数据来源：{{ check.sources }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 经营指标分析 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><TrendCharts /></el-icon>
                经营指标分析
              </div>
              <div class="cc-metrics">
                <div
                  v-for="(metric, idx) in store.crossCompare.businessMetrics"
                  :key="idx"
                  class="cc-metric-card"
                  :class="'cc-metric-' + metric.status"
                >
                  <div class="ccm-header">
                    <span class="ccm-label">{{ metric.label }}</span>
                    <span class="ccm-status" :class="'ccm-' + metric.status">{{ statusText(metric.status) }}</span>
                  </div>
                  <div class="ccm-value">{{ metric.value }}</div>
                  <div class="ccm-benchmark">
                    <span>参考：{{ metric.benchmark }}</span>
                    <span class="ccm-delta" :class="'ccm-delta-' + metric.status">{{ metric.delta }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI 初步判断 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><ChatDotRound /></el-icon>
                AI 初步判断
              </div>
              <div class="cc-judgment">
                <div class="ccj-summary">{{ store.crossCompare.aiJudgment.summary }}</div>
                <div
                  v-for="(point, idx) in store.crossCompare.aiJudgment.points"
                  :key="idx"
                  class="ccj-item"
                  :class="'ccj-' + point.level"
                >
                  <div class="ccj-dot" :class="'ccj-dot-' + point.level"></div>
                  <div class="ccj-text">{{ point.text }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="doc-rec-panel-empty">
            <el-empty description="暂无比对数据，请确认已上传足够文件" />
          </div>
        </div>
      </div>

      <div v-else class="doc-rec-result doc-rec-result-empty">
        <el-empty description="选择任务或上传文件" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Search, UploadFilled, WarningFilled, Loading, Link, TrendCharts, ChatDotRound } from '@element-plus/icons-vue'
import { useDocRecognitionStore } from '../stores/docRecognition.js'
import { ElMessage } from 'element-plus'

const store = useDocRecognitionStore()
const fileInput = ref(null)
const editingField = ref(null)
const editingValue = ref('')
const editInput = ref(null)

const filterChips = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'processing', label: '识别中' },
  { key: 'done', label: '已完成' },
]

function fileIcon(type) {
  const map = { 营业执照: '📄', 身份证: '🪪', 纳税申报: '📊', 销售合同: '📋', 审计报告: '📑' }
  return map[type] || '📎'
}

function confidenceClass(conf) {
  if (conf >= 85) return 'conf-high'
  if (conf >= 70) return 'conf-medium'
  return 'conf-low'
}

function statusText(status) {
  return { match: '一致', conflict: '冲突', warning: '偏差', danger: '异常', pending: '待验证', info: '参考' }[status] || status
}

function triggerUpload() { fileInput.value?.click() }

function handleFileSelect(e) {
  const files = e.target.files
  if (!files || !files.length) return
  for (const f of files) {
    store.simulateUpload(f.name, formatSize(f.size))
    ElMessage.success(`已上传：${f.name}，正在识别...`)
  }
  e.target.value = ''
}

function handleDrop(e) {
  const files = e.dataTransfer.files
  if (!files || !files.length) return
  for (const f of files) {
    store.simulateUpload(f.name, formatSize(f.size))
    ElMessage.success(`已上传：${f.name}，正在识别...`)
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function startEdit(label, value) {
  editingField.value = label
  editingValue.value = value
  nextTick(() => editInput.value?.focus())
}

function saveEdit(label) {
  if (editingField.value === label) {
    store.confirmField(label, editingValue.value)
    editingField.value = null
    editingValue.value = ''
  }
}

function handleConfirm() {
  if (!store.currentFileId) return
  const result = store.syncToDueDiligence(store.currentFileId)
  if (result.success) {
    ElMessage.success(`已确认并同步到尽调任务「${result.taskName}」`)
  }
}

function handleSync() {
  if (!store.currentFileId) return
  const result = store.syncToDueDiligence(store.currentFileId)
  if (result.success) {
    ElMessage.success(`已同步到尽调任务「${result.taskName}」`)
  }
}
</script>

<style scoped>
.doc-rec-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 0px);
  overflow: hidden;
  max-width: 100%;
}

.doc-rec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding:var(--space-2xl) 32px 16px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}
.header-stats { display: flex; gap: 32px; }
.hs-item { display: flex; flex-direction: column; align-items: center; }
.hs-value { font-size:var(--font-size-workbench-title); font-weight: 700; }
.hs-label { font-size:var(--font-size-caption); color: var(--color-text-tertiary); margin-top:var(--space-xs); }

.doc-rec-body { display: flex; flex: 1; overflow: hidden; }

/* 左侧任务列表 */
.doc-rec-task-list {
  width: 260px; min-width: 260px; background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; overflow: hidden;
}
.doc-rec-filter { padding:var(--space-lg); border-bottom: 1px solid var(--border-color-light); flex-shrink: 0; }
.filter-label { font-size:var(--font-size-caption); color: var(--color-text-tertiary); font-weight: 500; margin-bottom:var(--space-sm); }
.filter-chips { display: flex; gap:var(--space-xs); flex-wrap: wrap; margin-bottom:var(--space-sm); }
.filter-chip {
  padding: 3px 10px; border-radius: var(--radius-full); font-size:var(--font-size-caption);
  background: var(--bg-page); color: var(--color-text-secondary);
  cursor: pointer; transition: all .15s; border: 1px solid transparent;
}
.filter-chip:hover { background: var(--color-primary-bg); color: var(--color-primary); }
.filter-chip.active { background: var(--color-primary); color: var(--surface-card); }
.filter-search {
  display: flex; align-items: center; gap:var(--space-xs);
  background: var(--bg-page); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding:var(--space-xs) 10px;
}
.filter-search .el-icon { font-size:var(--font-size-lg); color: var(--color-text-tertiary); }
.filter-search input {
  flex: 1; border: none; background: transparent;
  font-size:var(--font-size-sm); color: var(--color-text-primary); outline: none;
}
.filter-search input::placeholder { color: var(--color-text-disabled); }
.doc-rec-task-items { flex: 1; overflow-y: auto; padding:var(--space-sm); }
.doc-rec-task-card {
  padding:var(--space-lg) 16px; border-radius: var(--radius-md); cursor: pointer;
  transition: all .15s; margin-bottom:var(--space-xs); border: 1px solid transparent;
}
.doc-rec-task-card:hover { background: var(--bg-page); }
.doc-rec-task-card.active { background: var(--color-primary-bg); border-color: var(--color-primary-border); }
.dtc-name {
  font-size:var(--font-size-body); font-weight: 600; color: var(--color-text-primary);
  margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dtc-meta { font-size:var(--font-size-caption); color: var(--color-text-tertiary); margin-bottom:var(--space-sm); }
.dtc-files { display: flex; align-items: center; justify-content: space-between; }
.dtc-file-count { display: flex; align-items: baseline; gap:0; }
.dtc-count-num { font-size:var(--font-size-assist); font-weight: 700; color: var(--color-text-primary); }
.dtc-count-label { font-size: 10px; color: var(--color-text-tertiary); }
.dtc-file-status { display: flex; gap:var(--space-xs); }
.dtc-dot { width: 8px; height: 8px; border-radius: 50%; }
.dtc-dot-warning { background: var(--color-warning); }
.dtc-dot-primary { background: var(--color-primary); }

/* 中间文件列表 */
.doc-rec-file-list {
  width: 320px; min-width: 320px; background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; overflow: hidden;
}
.doc-rec-file-header { padding:var(--space-lg) 20px 12px; border-bottom: 1px solid var(--border-color-light); flex-shrink: 0; }
.doc-rec-file-title {
  font-size:var(--font-size-xl); font-weight: 600; color: var(--color-text-primary);
  margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.doc-rec-file-subtitle { font-size:var(--font-size-caption); color: var(--color-text-tertiary); margin-top:var(--space-xs); }
.doc-rec-upload {
  padding:var(--space-2xl) 20px; margin: 12px; border: 2px dashed var(--border-color);
  border-radius: var(--radius-md); text-align: center; cursor: pointer;
  transition: all .15s; flex-shrink: 0;
}
.doc-rec-upload:hover { border-color: var(--color-primary); background: var(--color-primary-bg); }
.upload-icon { font-size:var(--font-size-metric); color: var(--color-text-tertiary); margin-bottom:var(--space-xs); }
.upload-text { font-size:var(--font-size-body); font-weight: 500; color: var(--color-text-primary); margin-bottom: 3px; }
.upload-hint { font-size:var(--font-size-caption); color: var(--color-text-tertiary); }
.doc-rec-files { flex: 1; overflow-y: auto; padding: 0 12px 12px; }
.doc-rec-file-item {
  display: flex; align-items: center; gap:var(--space-sm); padding:var(--space-md) 14px;
  border-radius: var(--radius-md); cursor: pointer; transition: all .15s;
  border: 1px solid transparent; margin-bottom:var(--space-xs);
}
.doc-rec-file-item:hover { background: var(--bg-page); }
.doc-rec-file-item.active { background: var(--color-primary-bg); border-color: var(--color-primary-border); }
.drfi-icon { font-size:var(--font-size-page-title); flex-shrink: 0; width: 32px; text-align: center; }
.drfi-info { flex: 1; min-width: 0; }
.drfi-name {
  font-size:var(--font-size-body); font-weight: 500; color: var(--color-text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.drfi-meta {
  font-size:var(--font-size-caption); color: var(--color-text-tertiary);
  display: flex; align-items: center; gap:var(--space-xs); margin-top:var(--space-xs);
}
.meta-dot { color: var(--color-text-disabled); }
.drfi-status { flex-shrink: 0; }
.spin-icon { animation: spin 1s linear infinite; }
.doc-rec-empty { flex: 1; display: flex; align-items: center; justify-content: center; }

/* 右侧面板 */
.doc-rec-result { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.doc-rec-result-empty { align-items: center; justify-content: center; }

/* Tab */
.doc-rec-tabs { display: flex; border-bottom: 1px solid var(--border-color); background: var(--bg-card); flex-shrink: 0; }
.doc-rec-tab {
  padding:var(--space-md) 20px; font-size:var(--font-size-body); font-weight: 500; color: var(--color-text-secondary);
  cursor: pointer; border-bottom: 2px solid transparent; transition: all .15s;
  display: flex; align-items: center; gap:var(--space-xs);
}
.doc-rec-tab:hover { color: var(--color-text-primary); background: var(--bg-page); }
.doc-rec-tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; }
.tab-badge { font-size: 10px; padding: 1px 6px; border-radius:var(--radius-md); font-weight: 600; }
.tab-badge--danger { background: var(--color-danger); color: var(--surface-card); }
.tab-badge--warning { background: var(--color-warning); color: var(--surface-card); }

.doc-rec-panel { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.doc-rec-panel-content { flex: 1; overflow-y: auto; padding:var(--space-lg) 24px; }
.doc-rec-panel-empty { flex: 1; display: flex; align-items: center; justify-content: center; }

/* 字段识别 */
.doc-rec-result-header { margin-bottom:var(--space-lg); }
.doc-rec-result-title { font-size:var(--font-size-xl); font-weight: 600; color: var(--color-text-primary); margin: 0; }
.doc-rec-result-type { font-size:var(--font-size-caption); color: var(--color-text-tertiary); margin-top:var(--space-xs); }
.doc-rec-recognizing { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap:var(--space-md); }
.dr-recognizing-spinner {
  width: 40px; height: 40px; border: 3px solid var(--border-color);
  border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;
}
.dr-recognizing-text { font-size:var(--font-size-lg); font-weight: 500; color: var(--color-text-primary); }
.dr-recognizing-sub { font-size:var(--font-size-sm); color: var(--color-text-tertiary); }
.doc-rec-fields { display: flex; flex-direction: column; }
.doc-rec-warning-card {
  display: flex; align-items: center; gap:var(--space-sm); padding:var(--space-sm) 14px;
  background: var(--color-warning-bg); border: 1px solid #fde68a;
  border-radius: var(--radius-md); margin-bottom:var(--space-lg);
}
.doc-rec-warning-card .el-icon { color: var(--color-warning); font-size:var(--font-size-assist); }
.drwc-text { font-size:var(--font-size-sm); color: var(--color-warning); font-weight: 500; }
.drf-list { display: flex; flex-direction: column; gap:var(--space-sm); }
.drf-item {
  display: flex; align-items: center; gap:var(--space-md); padding:var(--space-md) 14px;
  background: var(--bg-page); border-radius: var(--radius-md);
  border: 1px solid var(--border-color); transition: all .15s;
}
.drf-item.lowConf { border-color: #fde68a; background: var(--color-warning-bg); }
.drf-item.confirmed { border-color: var(--color-success-light); background: var(--color-success-bg); }
.drf-label { font-size:var(--font-size-sm); color: var(--color-text-tertiary); min-width: 90px; flex-shrink: 0; }
.drf-value-wrap { flex: 1; min-width: 0; }
.drf-value {
  font-size:var(--font-size-body); color: var(--color-text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: text;
}
.drf-value:hover { text-decoration: underline dotted; }
.drf-edit-input {
  width: 100%; border: 1px solid var(--color-primary); border-radius:var(--radius-sm);
  padding:var(--space-xs) 8px; font-size:var(--font-size-body); color: var(--color-text-primary); outline: none;
}
.drf-confidence { display: flex; align-items: center; gap:var(--space-xs); flex-shrink: 0; width: 100px; }
.drf-confidence-bar { flex: 1; height: 6px; background: var(--border-color-light); border-radius:var(--radius-sm); overflow: hidden; }
.drf-confidence-fill { height: 100%; border-radius:var(--radius-sm); transition: width .3s; }
.drf-confidence-fill.conf-high { background: var(--color-success); }
.drf-confidence-fill.conf-medium { background: var(--color-warning); }
.drf-confidence-fill.conf-low { background: var(--color-danger); }
.drf-confidence-num { font-size:var(--font-size-caption); font-weight: 600; min-width: 32px; text-align: right; }
.drf-confidence-num.conf-high { color: var(--color-success); }
.drf-confidence-num.conf-medium { color: var(--color-warning); }
.drf-confidence-num.conf-low { color: var(--color-danger); }
.drf-actions { flex-shrink: 0; }
.doc-rec-actions {
  display: flex; gap:var(--space-sm); margin-top: 24px;
  padding-top: 16px; border-top: 1px solid var(--border-color-light);
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 交叉比对 ===== */
.cc-section { margin-bottom:var(--space-2xl); }
.cc-section-title {
  display: flex; align-items: center; gap:var(--space-sm);
  font-size:var(--font-size-lg); font-weight: 600; color: var(--color-text-primary);
  margin-bottom:var(--space-md); padding-bottom: 8px; border-bottom: 1px solid var(--border-color-light);
}
.cc-section-title .el-icon { font-size:var(--font-size-assist); color: var(--color-text-secondary); }

/* 一致性列表 */
.cc-list { display: flex; flex-direction: column; gap:var(--space-xs); }
.cc-item {
  display: flex; align-items: flex-start; gap:var(--space-sm);
  padding:var(--space-sm) 14px; border-radius: var(--radius-md);
  border-left: 3px solid transparent; background: var(--bg-page);
}
.cc-item.cc-match { border-left-color: var(--color-success); }
.cc-item.cc-conflict { border-left-color: var(--color-danger); background: var(--color-danger-bg); }
.cc-item.cc-warning { border-left-color: var(--color-warning); background: var(--color-warning-bg); }
.cc-item.cc-pending { border-left-color: var(--color-text-disabled); }
.cc-item-icon { flex-shrink: 0; margin-top:var(--space-xs); }
.cc-icon { font-size:var(--font-size-lg); font-weight: 700; }
.cc-icon-success { color: var(--color-success); }
.cc-icon-danger { color: var(--color-danger); }
.cc-icon-warning { color: var(--color-warning); }
.cc-icon-pending { color: var(--color-text-disabled); }
.cc-item-info { flex: 1; min-width: 0; }
.cc-item-label { font-size:var(--font-size-body); font-weight: 600; color: var(--color-text-primary); margin-bottom:var(--space-xs); }
.cc-item-detail { font-size:var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 3px; line-height: 1.4; }
.cc-item-sources { font-size:var(--font-size-caption); color: var(--color-text-tertiary); }

/* 经营指标卡片 */
.cc-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap:var(--space-sm); }
.cc-metric-card {
  padding:var(--space-lg) 16px; border-radius: var(--radius-md); background: var(--bg-page);
  border: 1px solid var(--border-color); transition: all .15s;
}
.cc-metric-card.cc-metric-warning { border-color: #fde68a; }
.cc-metric-card.cc-metric-danger { border-color: #fecaca; background: var(--color-danger-bg); }
.cc-metric-card.cc-metric-match { border-color: var(--color-success-light); background: var(--color-success-bg); }
.ccm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom:var(--space-xs); }
.ccm-label { font-size:var(--font-size-sm); color: var(--color-text-tertiary); font-weight: 500; }
.ccm-status { font-size: 10px; padding:0 8px; border-radius: var(--radius-full); font-weight: 600; }
.ccm-status.ccm-match { background: var(--color-success-bg); color: var(--color-success); }
.ccm-status.ccm-warning { background: var(--color-warning-bg); color: var(--color-warning); }
.ccm-status.ccm-danger { background: var(--color-danger-bg); color: var(--color-danger); }
.ccm-value { font-size:var(--font-size-page-title); font-weight: 700; color: var(--color-text-primary); margin-bottom:var(--space-xs); }
.ccm-benchmark { display: flex; justify-content: space-between; align-items: center; font-size:var(--font-size-caption); color: var(--color-text-tertiary); }
.ccm-delta { font-weight: 600; }
.ccm-delta-danger { color: var(--color-danger); }
.ccm-delta-warning { color: var(--color-warning); }
.ccm-delta-match { color: var(--color-success); }

/* AI 判断 */
.cc-judgment {
  background: var(--bg-page); border-radius: var(--radius-md); padding:var(--space-lg) 18px;
  border: 1px solid var(--border-color);
}
.ccj-summary { font-size:var(--font-size-body); color: var(--color-text-secondary); margin-bottom:var(--space-md); line-height: 1.5; }
.ccj-item { display: flex; align-items: flex-start; gap:var(--space-sm); padding: 5px 0; }
.ccj-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.ccj-dot-danger { background: var(--color-danger); }
.ccj-dot-warning { background: var(--color-warning); }
.ccj-dot-info { background: var(--color-text-tertiary); }
.ccj-text { font-size:var(--font-size-body); color: var(--color-text-primary); line-height: 1.5; }
</style>
