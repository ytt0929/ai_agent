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
          <el-radio-group v-model="store.statusFilter" size="small" class="filter-radio-group">
            <el-radio-button
              v-for="chip in filterChips"
              :key="chip.key"
              :value="chip.key"
            >{{ chip.label }}</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="store.searchQuery"
            placeholder="搜索企业/文件"
            :prefix-icon="Search"
            size="small"
            clearable
            class="filter-search-input"
          />
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
            <div class="drfi-icon">
              <el-icon :size="20" class="drfi-icon-img"><component :is="fileIconComponent(file.type)" /></el-icon>
            </div>
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
          >字段识别</div>
          <div
            class="doc-rec-tab"
            :class="{ active: store.activePanel === 'compare' }"
            @click="store.activePanel = 'compare'"
          >
            <el-icon :size="14"><TrendCharts /></el-icon> 交叉比对
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
              <!-- 识别摘要卡 -->
              <div v-if="summaryCard" class="doc-rec-summary-card">
                <div class="summary-card-header">
                  <h4 class="summary-card-filename">{{ summaryCard.fileName }}</h4>
                  <el-tag size="small" :type="summaryTagType(summaryCard.status)" effect="plain">{{ summaryCard.status }}</el-tag>
                </div>
                <el-descriptions :column="2" size="small" border class="summary-card-desc">
                  <el-descriptions-item label="文件类型">{{ summaryCard.fileType }}</el-descriptions-item>
                  <el-descriptions-item label="识别字段">{{ summaryCard.fieldCount }} 项</el-descriptions-item>
                  <el-descriptions-item label="平均置信度">{{ summaryCard.avgConfidence }}%</el-descriptions-item>
                  <el-descriptions-item label="状态">{{ summaryCard.status }}</el-descriptions-item>
                </el-descriptions>
                <div class="summary-card-tags">
                  <span class="summary-card-label">用于核验：</span>
                  <el-tag v-for="p in summaryCard.verifyPurposes" :key="p" size="small" effect="plain" type="info">{{ p }}</el-tag>
                </div>
                <div class="summary-card-tags">
                  <span class="summary-card-label">可同步章节：</span>
                  <el-tag v-for="c in summaryCard.syncChapters" :key="c" size="small" effect="plain" type="primary">{{ c }}</el-tag>
                </div>
              </div>

              <div v-if="store.lowConfidenceFields.length" class="doc-rec-warning-card">
                <el-icon><WarningFilled /></el-icon>
                <span class="drwc-text">{{ store.lowConfidenceFields.length }} 个字段置信度低于 70%，建议人工核对</span>
              </div>

              <!-- 分组字段 -->
              <div v-if="groupedFieldList.length" class="drf-groups">
                <div v-for="group in groupedFieldList" :key="group.name" class="drf-group">
                  <div class="drf-group-header">{{ group.name }}</div>
                  <div class="drf-group-fields">
                    <div
                      v-for="field in group.fields"
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
                        <el-tooltip v-else-if="store.getMetricExplanation(field.label)" :content="store.getMetricExplanation(field.label)" placement="top">
                          <span class="drf-value drf-value--explainable" @dblclick="startEdit(field.label, field.value)">{{ field.value }} <span class="drf-help-icon">?</span></span>
                        </el-tooltip>
                        <span v-else class="drf-value" @dblclick="startEdit(field.label, field.value)">{{ field.value }}</span>
                        <div v-if="store.getMetricExplanation(field.label) && editingField !== field.label" class="drf-explanation">{{ store.getMetricExplanation(field.label) }}</div>
                      </div>
                      <div class="drf-confidence">
                        <el-progress :percentage="field.confidence" :stroke-width="4" :show-text="true" :format="() => field.confidence + '%'" :color="confidenceColor(field.confidence)" class="drf-progress" />
                      </div>
                      <div v-if="field.confidence < 70 && !editingField" class="drf-actions">
                        <el-button size="small" text type="warning" @click="startEdit(field.label, field.value)">修正</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 非银行流水：保持原有平铺 -->
              <div v-else class="drf-list">
                <div
                  v-for="field in store.currentFileFields"
                  :key="field.label"
                  class="drf-item"
                  :class="{ lowConf: field.confidence < 70, confirmed: field.confidence === 100 }"
                >
                  <div class="drf-label">{{ field.label }}</div>
                  <div class="drf-value-wrap">
                    <span class="drf-value" @dblclick="startEdit(field.label, field.value)">{{ field.value }}</span>
                  </div>
                  <div class="drf-confidence">
                    <el-progress :percentage="field.confidence" :stroke-width="4" :show-text="true" :format="() => field.confidence + '%'" :color="confidenceColor(field.confidence)" class="drf-progress" />
                  </div>
                  <div v-if="field.confidence < 70 && !editingField" class="drf-actions">
                    <el-button size="small" text type="warning" @click="startEdit(field.label, field.value)">修正</el-button>
                  </div>
                </div>
              </div>

              <!-- 同步提示 -->
              <div class="doc-rec-sync-hint">
                <el-icon><DocumentChecked /></el-icon>
                <span>识别和比对结果可同步至：</span>
                <template v-for="ch in syncChapters" :key="ch">
                  <el-tag size="small" type="primary" effect="plain">{{ ch }}</el-tag>
                </template>
              </div>

              <div class="doc-rec-actions">
                <el-button type="primary" :disabled="store.currentFile.status === '已完成'" @click="handleConfirm">确认并同步</el-button>
                <el-button plain @click="handleSync">同步到尽调</el-button>
              </div>
            </div>
          </div>
          <div v-else class="doc-rec-panel-empty">
            <el-empty description="选择文件查看识别结果">
              <template #image>
                <el-icon :size="40" style="color:var(--color-text-tertiary)"><UploadFilled /></el-icon>
              </template>
              <p style="font-size:var(--font-size-sm);color:var(--color-text-tertiary);margin-top:var(--space-xs);max-width:280px;text-align:center">
                建议优先查看「银行流水摘要.pdf」，可用于收入真实性、经营稳定性和偿债能力核验。
              </p>
            </el-empty>
          </div>
        </div>

        <!-- ===== 交叉比对面板 ===== -->
        <div v-if="store.activePanel === 'compare'" class="doc-rec-panel">
          <div v-if="store.crossCompare" class="doc-rec-panel-content">
            <!-- AI 分析与复核建议 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><ChatDotRound /></el-icon>
                AI 分析与复核建议
              </div>
              <el-alert type="warning" :closable="false" class="cc-ai-summary" show-icon>
                <template #title>
                  <div class="cc-ai-summary-title">结论摘要</div>
                </template>
                <template #default>
                  <div class="cc-ai-summary-text">{{ store.crossCompare.aiJudgment.summary }}</div>
                </template>
              </el-alert>
              <div class="cc-ai-judgments">
                <div
                  v-for="(point, idx) in store.crossCompare.aiJudgment.points"
                  :key="idx"
                  class="cc-ai-point"
                  :class="'cc-ai-point--' + point.level"
                >
                  <el-tag size="small" :type="aiPointTagType(point.level)" effect="plain" class="cc-ai-tag">{{ aiPointLabel(point.level) }}</el-tag>
                  <span class="cc-ai-point-text">{{ point.text }}</span>
                </div>
              </div>
            </div>

            <!-- 收入真实性核实 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><TrendCharts /></el-icon>
                收入真实性核实
              </div>
              <div class="cc-income-verify">
                <div class="cc-income-threshold">
                  <el-alert type="info" :closable="false" show-icon class="cc-threshold-alert">
                    <template #title>
                      <span class="cc-threshold-text">长期差异 &gt; 30% → 人工复核原因</span>
                    </template>
                  </el-alert>
                </div>
                <el-table :data="incomeVerifyRows" size="small" border class="cc-table">
                  <el-table-column prop="a" label="来源 A" width="120" />
                  <el-table-column prop="b" label="来源 B" width="120" />
                  <el-table-column prop="delta" label="差异率" width="100">
                    <template #default="{ row }">
                      <span :class="row.exceed ? 'cc-delta-danger' : 'cc-delta-ok'">{{ row.delta }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="conclusion" label="结论" />
                </el-table>
                <div class="cc-income-conclusion">
                  <el-alert type="success" :closable="false" show-icon>
                    <template #title>未超过 30% 阈值，收入数据整体可交叉验证；但异常交易仍需复核。</template>
                  </el-alert>
                </div>
              </div>
            </div>

            <!-- 银行流水经营分析 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><TrendCharts /></el-icon>
                银行流水经营分析
              </div>
              <div class="cc-metrics">
                <div
                  v-for="(metric, idx) in bankFlowMetrics"
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

            <!-- 数据一致性验证 -->
            <div class="cc-section">
              <div class="cc-section-title">
                <el-icon><Link /></el-icon>
                数据一致性验证
              </div>
              <el-table :data="store.crossCompare.consistencyChecks" size="small" border class="cc-table">
                <el-table-column prop="label" label="项目" width="140" />
                <el-table-column label="结果" width="80">
                  <template #default="{ row }">
                    <el-tag size="small" :type="ccStatusTag(row.status)" effect="plain">{{ ccStatusText(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="detail" label="详情" />
                <el-table-column prop="sources" label="来源" width="140" />
              </el-table>
            </div>

            <!-- 交叉比对总览 -->
            <div v-if="ccOverview" class="cc-overview cc-overview--bottom">
              <div class="cc-overview-card">
                <div class="cc-overview-label">主体一致</div>
                <div class="cc-overview-value" :class="ccOverview.entityConsistent === '通过' ? 'cc-ov-ok' : 'cc-ov-fail'">{{ ccOverview.entityConsistent }}</div>
              </div>
              <div class="cc-overview-card">
                <div class="cc-overview-label">收入匹配度</div>
                <div class="cc-overview-value">{{ ccOverview.incomeMatch }}</div>
              </div>
              <div class="cc-overview-card">
                <div class="cc-overview-label">资料完整度</div>
                <div class="cc-overview-value">{{ ccOverview.materialCompleteness }}</div>
              </div>
              <div class="cc-overview-card">
                <div class="cc-overview-label">现金流偿债</div>
                <div class="cc-overview-value cc-ov-warn">DSCR {{ ccOverview.dscr }}</div>
              </div>
              <div class="cc-overview-card">
                <div class="cc-overview-label">人工复核</div>
                <div class="cc-overview-value cc-ov-fail">{{ ccOverview.manualReview }} 项</div>
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
import { ref, nextTick, computed } from 'vue'
import { Search, UploadFilled, WarningFilled, Loading, Link, TrendCharts, ChatDotRound, DocumentChecked, Document, CreditCard, DataAnalysis, Notebook, Files } from '@element-plus/icons-vue'
import { useDocRecognitionStore } from '../stores/docRecognition.js'
import { ElMessage } from 'element-plus'

const store = useDocRecognitionStore()
const fileInput = ref(null)
const editingField = ref(null)
const editingValue = ref('')
const editInput = ref(null)

// P1 增强 computed
const summaryCard = computed(() => store.fileSummary)
const groupedFieldList = computed(() => store.groupedFields)
const ccOverview = computed(() => store.crossCompareOverview)
const syncChapters = computed(() => store.fileSummary?.syncChapters || [])

// 收入真实性核实行
const incomeVerifyRows = computed(() => {
  const cc = store.crossCompare
  if (!cc) return []
  const checks = cc.consistencyChecks
  const find = (label) => checks.find(c => c.label.includes(label))
  const extractDelta = (detail) => {
    const m = detail?.match(/差异\s*(\d+\.?\d*)%/)
    return m ? m[1] + '%' : '—'
  }
  const invoiceTax = find('发票收入 vs 纳税申报')
  const flowInvoice = find('银行流水 vs 发票收入')
  const flowTax = find('银行流水 vs 纳税申报收入')
  const threshold = 30
  return [
    { a: '发票收入', b: '纳税申报', delta: invoiceTax ? extractDelta(invoiceTax.detail) : '4.4%', exceed: false, conclusion: '差异 4.4%，未超阈值，数据可验证' },
    { a: '银行流水', b: '发票收入', delta: flowInvoice ? extractDelta(flowInvoice.detail) : '8.3%', exceed: false, conclusion: '差异 8.3%，未超阈值，需关注未回款部分' },
    { a: '银行流水', b: '纳税申报', delta: flowTax ? extractDelta(flowTax.detail) : '4.1%', exceed: false, conclusion: '差异 4.1%，未超阈值，基本匹配' },
  ]
})

// 银行流水经营分析（从 businessMetrics 中筛选）
const bankFlowMetrics = computed(() => {
  const cc = store.crossCompare
  if (!cc) return []
  const flowLabels = ['月均入账', '月均出账', '经营净现金流', '收入波动率', 'DSCR', '短期冲量交易', '整数规律交易', '关联互转交易', '临近授信异常转入']
  return cc.businessMetrics.filter(m => flowLabels.some(l => m.label.includes(l) || l.includes(m.label)))
})

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

function fileIconComponent(type) {
  const map = { 营业执照: Document, 身份证: CreditCard, 纳税申报: DataAnalysis, 销售合同: Notebook, 审计报告: Files }
  return map[type] || Document
}

function confidenceClass(conf) {
  if (conf >= 85) return 'conf-high'
  if (conf >= 70) return 'conf-medium'
  return 'conf-low'
}

function statusText(status) {
  return { match: '一致', conflict: '冲突', warning: '偏差', danger: '异常', pending: '待验证', info: '参考' }[status] || status
}

function ccStatusTag(status) {
  return { match: 'success', conflict: 'danger', warning: 'warning', pending: 'info' }[status] || 'info'
}

function ccStatusText(status) {
  return { match: '通过', conflict: '未通过', warning: '偏差', pending: '待验证' }[status] || status
}

function summaryTagType(status) {
  return { 已完成: 'success', 待确认: 'warning', 识别中: 'primary' }[status] || 'info'
}

function confidenceColor(conf) {
  if (conf >= 85) return 'var(--color-success, #67c23a)'
  if (conf >= 70) return 'var(--color-warning, #e6a23c)'
  return 'var(--color-danger, #f56c6c)'
}

function aiPointTagType(level) {
  return { danger: 'danger', warning: 'warning', info: 'info' }[level] || 'info'
}

function aiPointLabel(level) {
  return { danger: '风险', warning: '关注', info: '提示' }[level] || level
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
.filter-radio-group { display: flex; flex-wrap: wrap; margin-bottom:var(--space-sm); }
.filter-radio-group :deep(.el-radio-button__inner) {
  border-radius: var(--radius-full) !important;
  padding: 3px 10px !important;
  font-size: var(--font-size-caption) !important;
}
.filter-search-input { margin-bottom: 0; }
.filter-search-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
}
.doc-rec-task-items { flex: 1; overflow-y: auto; padding:var(--space-sm); }
.doc-rec-task-card {
  padding:var(--space-lg) 16px; border-radius: var(--radius-md); cursor: pointer;
  transition: all .15s; margin-bottom:var(--space-xs); border: 1px solid transparent;
}
.doc-rec-task-card:hover { background: var(--bg-page); }
.doc-rec-task-card.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  border-left: 3px solid var(--color-primary);
  padding-left: 13px;
}
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
.doc-rec-file-item.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  border-left: 3px solid var(--color-primary);
  padding-left: 11px;
}
.drfi-icon { flex-shrink: 0; width: 32px; text-align: center; }
.drfi-icon-img { color: var(--color-text-secondary); }
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
/* 字段识别 — 摘要卡 */
.doc-rec-summary-card {
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-lg) 18px;
  margin-bottom: var(--space-lg);
}
.summary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}
.summary-card-filename {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.summary-card-desc {
  margin-bottom: var(--space-md);
}
.summary-card-tags {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
}
.summary-card-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

/* 同步提示 */
.doc-rec-sync-hint {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  padding: var(--space-sm) 12px;
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}
.doc-rec-sync-hint .el-icon { color: var(--color-primary); font-size: var(--font-size-assist); }

/* 字段分组 */
.drf-groups { display: flex; flex-direction: column; gap: var(--space-md); }
.drf-group { display: flex; flex-direction: column; }
.drf-group-header {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: var(--space-xs) 0;
  margin-bottom: var(--space-xs);
  border-bottom: 1px solid var(--border-color-light);
}
.drf-group-fields { display: flex; flex-direction: column; gap: var(--space-xs); }

/* el-progress in field items */
.drf-progress { width: 80px; }
.drf-progress :deep(.el-progress-bar__outer) { border-radius: 2px; }
.drf-progress :deep(.el-progress-bar__inner) { border-radius: 2px; }
.drf-progress :deep(.el-progress__text) { font-size: 10px; min-width: 28px; }

.drf-value--explainable { text-decoration: underline dotted var(--color-text-tertiary); text-underline-offset: 2px; }
.drf-help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  color: var(--color-text-tertiary);
  border: 1px solid var(--border-color-light);
  border-radius: 50%;
  vertical-align: middle;
  margin-left: 4px;
}
.drf-explanation {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  line-height: 1.4;
  margin-top: 4px;
}
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

/* 交叉比对总览 */
.cc-overview {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}
.cc-overview-card {
  flex: 1;
  min-width: 100px;
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-sm);
  text-align: center;
}
.cc-overview-label {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-xs);
}
.cc-overview-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}
.cc-ov-ok { color: var(--color-success); }
.cc-ov-warn { color: var(--color-warning); }
.cc-ov-fail { color: var(--color-danger); }

/* 数据一致性表格 */
.cc-table { margin-bottom: var(--space-md); }
.cc-table :deep(.el-table__header th) { font-weight: 600; font-size: var(--font-size-sm); }
.cc-table :deep(.el-table__body td) { font-size: var(--font-size-sm); }

/* 收入真实性核实 */
.cc-income-verify { display: flex; flex-direction: column; gap: var(--space-md); }
.cc-income-threshold { margin-bottom: var(--space-xs); }
.cc-threshold-alert :deep(.el-alert__title) { font-size: var(--font-size-sm); font-weight: 500; }
.cc-threshold-text { color: var(--color-text-secondary); }
.cc-income-conclusion { margin-top: var(--space-xs); }
.cc-delta-ok { color: var(--color-success); font-weight: 600; }
.cc-delta-danger { color: var(--color-danger); font-weight: 600; }

/* 一致性列表（保留兼容） */
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

/* AI 判断 — 增强版 */
.cc-ai-summary {
  margin-bottom: var(--space-md);
}
.cc-ai-summary-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}
.cc-ai-summary-text {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  line-height: 1.6;
  margin-top: var(--space-xs);
}
.cc-ai-judgments {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.cc-ai-point {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
.cc-ai-point--warning { border-left: 3px solid var(--color-warning); }
.cc-ai-point--danger { border-left: 3px solid var(--color-danger); }
.cc-ai-point--info { border-left: 3px solid var(--color-text-tertiary); }
.cc-ai-tag { flex-shrink: 0; }
.cc-ai-point-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
}

/* AI 判断 — 旧版（保留兼容） */
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
