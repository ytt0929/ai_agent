<template>
  <div class="sr-page">
    <div v-if="view === 'home'" class="sr-home">
      <div class="sr-home__header">
        <h1 class="sr-home__title">智能报告工作台</h1>
        <p class="sr-home__subtitle">基于模板、资料包和尽调产物生成报告，支持 AI 快速修改正文并打包导出</p>
      </div>
      <div class="sr-ai-task">
        <div class="sr-ai-task__label">你想让 AI 处理哪份报告？</div>
        <div class="sr-ai-task__input-wrap">
          <textarea v-model="aiTaskInput" class="sr-ai-task__input" placeholder="例如：用新版单户授信调查模板重新生成明达精工报告" rows="2" @keydown.enter.exact.prevent="handleAiTask"></textarea>
          <button class="sr-ai-task__btn" :disabled="!aiTaskInput.trim()" @click="handleAiTask">发送</button>
        </div>
        <div class="sr-ai-task__quick">
          <button v-for="q in quickTasks" :key="q.label" class="sr-ai-task__chip" @click="handleAiTask(q.label)">{{ q.label }}</button>
        </div>
      </div>
      <div class="sr-mini-stats">
        <div v-for="s in statCards" :key="s.key" class="sr-mini-stat" :class="s.tone">
          <span class="sr-mini-stat__num">{{ s.value }}</span>
          <span class="sr-mini-stat__label">{{ s.label }}</span>
        </div>
      </div>
      <div class="sr-home__section">
        <h2 class="sr-home__section-title">待处理报告</h2>
        <div v-for="task in reportTasks" :key="task.id" class="sr-task-card" @click="openReport(task)">
          <div class="sr-task-card__left">
            <div class="sr-task-card__name">{{ task.enterpriseName }} - {{ task.reportName }}</div>
            <div class="sr-task-card__meta">
              <span>来源：{{ task.source }}</span>
              <span>模板：{{ task.templateName }}</span>
            </div>
          </div>
          <div class="sr-task-card__right">
            <span class="sr-task-card__complete">{{ task.materialComplete }}%</span>
            <span class="sr-task-card__status-badge" :class="statusBadgeClass(task.status)">{{ task.status }}</span>
            <span v-if="task.pendingCount" class="sr-task-card__pending">{{ task.pendingCount }} 项待确认</span>
            <div class="sr-task-card__ai-note">AI：{{ task.aiNote }}</div>
          </div>
        </div>
      </div>
      <div class="sr-home__section">
        <h2 class="sr-home__section-title">报告模板</h2>
        <div class="sr-tpl-list">
          <div v-for="tpl in reportTemplates" :key="tpl.id" class="sr-tpl-item" @click="handleUseTemplate(tpl)">
            <div class="sr-tpl-item__name">{{ tpl.name }}</div>
            <div class="sr-tpl-item__meta">
              <span>{{ tpl.sectionsCount }} 章</span>
              <span>需 {{ tpl.requiredMaterials }} 份资料</span>
              <span class="sr-tpl-item__version">{{ tpl.version }}</span>
            </div>
            <div class="sr-tpl-item__desc">{{ tpl.desc }}</div>
          </div>
        </div>
      </div>
      <div class="sr-home__section">
        <h2 class="sr-home__section-title">资料包</h2>
        <div class="sr-mat-list">
          <div v-for="pkg in materialPackages" :key="pkg.id" class="sr-mat-item" @click="openMaterialPkg(pkg)">
            <div class="sr-mat-item__top">
              <div>
                <div class="sr-mat-item__name">{{ pkg.packageName }}</div>
                <div class="sr-mat-item__ent">{{ pkg.enterpriseName }}</div>
              </div>
              <div class="sr-mat-item__badges">
                <span class="sr-mat-item__src">{{ pkg.source }}</span>
                <span class="sr-mat-item__count">{{ pkg.materialCount }} 份</span>
                <span v-if="pkg.missingCount" class="sr-mat-item__missing">{{ pkg.missingCount }} 份缺失</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="view === 'upload'" class="sr-upload">
      <div class="sr-upload__bar">
        <el-icon class="sr-back" @click="view = 'home'"><ArrowLeft /></el-icon>
        <span class="sr-upload__title">上传资料附件生成报告</span>
      </div>
      <div v-if="!uploadDone" class="sr-upload__panel">
        <div class="sr-upload__step">
          <label class="sr-upload__label">选择报告模板</label>
          <select v-model="uploadTplId" class="sr-upload__select">
            <option v-for="tpl in reportTemplates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
          </select>
        </div>
        <div class="sr-upload__step">
          <label class="sr-upload__label">上传资料附件</label>
          <div class="sr-upload__drop" @click="simulateUpload">
            <el-icon :size="32"><Upload /></el-icon>
            <span>点击模拟上传资料（演示模式）</span>
            <span class="sr-upload__hint">支持 PDF / Word / Excel / 图片</span>
          </div>
        </div>
        <div class="sr-upload__step">
          <label class="sr-upload__label">上传说明（可选）</label>
          <textarea v-model="uploadNote" class="sr-upload__note" placeholder="例如：请重点关注收入真实性章节" rows="2"></textarea>
        </div>
        <div class="sr-upload__actions">
          <button class="sr-btn sr-btn--primary" @click="startGenerate" :disabled="!uploadDone">生成报告草稿</button>
          <button class="sr-btn" @click="view = 'home'">取消</button>
        </div>
      </div>
      <div v-if="uploadDone" class="sr-upload__result">
        <div class="sr-upload__result__header">
          <el-icon :size="20" color="#22c55e"><CircleCheck /></el-icon>
          <span>AI 已识别 {{ identifiedMaterials.length }} 份资料</span>
        </div>
        <div class="sr-upload__materials">
          <div v-for="m in identifiedMaterials" :key="m" class="sr-upload__mat-item ok">
            <span class="sr-upload__mat-icon">&#10003;</span>
            <span>{{ m }}</span>
          </div>
        </div>
        <div v-if="missingMaterials.length" class="sr-upload__missing">
          <div class="sr-upload__missing__title">仍缺失 {{ missingMaterials.length }} 份资料：</div>
          <div v-for="m in missingMaterials" :key="m" class="sr-upload__mat-item miss">
            <span class="sr-upload__mat-icon">&#10007;</span>
            <span>{{ m }}</span>
          </div>
        </div>
        <div class="sr-upload__actions">
          <button class="sr-btn sr-btn--primary" @click="startGenerate">生成报告草稿</button>
          <button class="sr-btn" @click="uploadDone = false">继续上传资料</button>
          <button class="sr-btn" @click="view = 'home'">取消</button>
        </div>
      </div>
    </div>

    <div v-if="view === 'generating'" class="sr-generating">
      <div class="sr-generating__card">
        <div class="sr-generating__spinner"></div>
        <div class="sr-generating__title">AI 正在生成报告&#8230;</div>
        <div v-for="(gs, i) in genSteps" :key="i" class="sr-generating__step" :class="gs.status">
          <span class="sr-generating__step-icon">{{ gs.status === 'done' ? '&#10003;' : gs.status === 'active' ? '&#10227;' : '&#9675;' }}</span>
          <span>{{ gs.label }}</span>
        </div>
      </div>
    </div>

    <div v-if="view === 'editor'" class="sr-editor">
      <div class="sr-editor__header">
        <el-icon class="sr-back" @click="backToHome"><ArrowLeft /></el-icon>
        <div class="sr-editor__top-info">
          <span class="sr-editor__top-name">{{ activeReport?.enterpriseName }}</span>
          <span class="sr-editor__top-report">{{ activeReport?.reportName }}</span>
          <span class="sr-editor__top-meta">模板：{{ activeReport?.templateName }} &#183; 来源：{{ activeReport?.source }} &#183; 资料完整度 {{ activeReport?.materialComplete }}%</span>
          <span v-if="activeReport?.pendingCount" class="sr-editor__top-pending">待确认：{{ activeReport.pendingCount }} 项</span>
          <span class="sr-badge" :class="statusBadgeClass(activeReport?.status)">{{ activeReport?.status }}</span>
        </div>
        <div class="sr-editor__actions">
          <button class="sr-btn" @click="handleSaveDraft">保存草稿</button>
          <button class="sr-btn" @click="handleRegenerateByTemplate">按新模板生成</button>
          <button class="sr-btn" @click="handleExportReport">导出报告</button>
          <button class="sr-btn sr-btn--primary" @click="handleExportAll">导出报告和资料包</button>
          <button class="sr-btn sr-btn--primary" @click="handleSubmitConfirm">提交确认</button>
        </div>
      </div>
      <div class="sr-editor__body">
        <aside class="sr-editor__toc">
          <div class="sr-toc__header">报告目录</div>
          <div v-for="sec in reportSections" :key="sec.id" class="sr-toc__item" :class="{ active: activeSectionId === sec.id, pending: sec.status === '待确认', missing: sec.materialStatus === '部分缺失' || sec.materialStatus === '资料不足' }" @click="selectSection(sec.id)">
            <span class="sr-toc__num">{{ sec.no }}</span>
            <span class="sr-toc__text">{{ sec.title }}</span>
            <span v-if="sec.status === '待确认'" class="sr-toc__dot sr-toc__dot--warn"></span>
            <span v-if="sec.materialStatus === '部分缺失' || sec.materialStatus === '资料不足'" class="sr-toc__dot sr-toc__dot--miss"></span>
          </div>
        </aside>
        <main class="sr-editor__content">
          <template v-if="currentSection">
            <div class="sr-sec-header">
              <h2 class="sr-sec-header__title">{{ currentSection.no }}、{{ currentSection.title }}</h2>
              <span class="sr-badge" :class="statusBadgeClass(currentSection.status)">{{ currentSection.status }}</span>
              <span class="sr-sec-header__mat" v-if="currentSection.materialStatus !== '完整'">资料：{{ currentSection.materialStatus }}</span>
            </div>
            <div v-if="currentSection.aiNote" class="sr-sec-ai-note">
              <span>&#128161;</span>
              <span>{{ currentSection.aiNote }}</span>
            </div>
            <div v-if="currentSection.status === '待确认'" class="sr-sec-pending-note">
              <span>&#9888;&#65039;</span>
              <span>本节有待确认内容，请审阅后确认或修改</span>
            </div>
            <div v-if="currentSection.materialStatus === '部分缺失' || currentSection.materialStatus === '资料不足'" class="sr-sec-missing-note">
              <span>&#128193;</span>
              <span>当前章节资料不足，可能影响结论准确性</span>
            </div>
            <div class="sr-sec-body">
              <div v-if="editingSectionId === currentSection.id" class="sr-sec-edit">
                <textarea v-model="editText" class="sr-sec-edit__textarea" rows="12"></textarea>
                <div class="sr-sec-edit__actions">
                  <button class="sr-btn sr-btn--primary" @click="saveEdit">保存</button>
                  <button class="sr-btn" @click="cancelEdit">取消</button>
                </div>
              </div>
              <template v-else>
                <p v-for="(p, i) in (currentSection.body || [])" :key="i" class="sr-para">{{ p }}</p>
                <table v-if="currentSection.table" class="sr-info-table">
                  <tr v-for="(row, ri) in currentSection.table" :key="ri">
                    <td class="sr-info-table__label" v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                  </tr>
                </table>
                <table v-if="currentSection.tableHeaders" class="sr-data-table">
                  <thead><tr><th v-for="h in currentSection.tableHeaders" :key="h">{{ h }}</th></tr></thead>
                  <tbody><tr v-for="(row, ri) in (currentSection.tableRows || [])" :key="ri"><td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td></tr></tbody>
                </table>
                <div v-if="currentSection.risks" class="sr-risk-list">
                  <div class="sr-risk-list__title">风险事项</div>
                  <div v-for="(r, ri) in currentSection.risks" :key="ri" class="sr-risk-item" :class="riskLevelClass(r.level)">
                    <span class="sr-risk-item__level">{{ r.level }}</span>
                    <span class="sr-risk-item__title">{{ r.title }}</span>
                    <span class="sr-risk-item__basis">{{ r.basis }}</span>
                  </div>
                </div>
                <div v-if="currentSection.relatedMaterialIds?.length" class="sr-sec-material-ref">
                  <div class="sr-sec-material-ref__title">资料依据</div>
                  <div v-for="mid in currentSection.relatedMaterialIds" :key="mid" class="sr-sec-material-ref__item"><span>{{ getMaterialName(mid) }}</span></div>
                </div>
              </template>
            </div>
            <div v-if="editingSectionId !== currentSection.id" class="sr-sec-actions">
              <button class="sr-btn" @click="startEditSection">修改本节</button>
              <button class="sr-btn" @click="handleRegenerateSection">根据资料包重新生成本节</button>
            </div>
          </template>
        </main>
        <aside class="sr-editor__sidebar">
          <div class="sr-sidebar__materials">
            <div class="sr-sidebar__section-title">本章资料包</div>
            <div v-if="currentSectionMaterials.length === 0" class="sr-sidebar__empty">暂无关联资料</div>
            <div v-for="mat in currentSectionMaterials" :key="mat.id" class="sr-mat-card" :class="{ modified: mat.status === '已修改' }">
              <div class="sr-mat-card__name">{{ mat.name }}</div>
              <div class="sr-mat-card__meta"><span>{{ mat.source }}</span><span class="sr-mat-card__status" :class="matStatusClass(mat.status)">{{ mat.status }}</span></div>
              <div v-if="mat.extractedSummary" class="sr-mat-card__summary">{{ mat.extractedSummary }}</div>
              <div class="sr-mat-card__actions">
                <button class="sr-mat-card__link" @click="viewMaterialDetail(mat)">详情</button>
                <button class="sr-mat-card__link" @click="editMaterialSummary(mat)">修改摘要</button>
                <button class="sr-mat-card__link" @click="uploadSupplement(mat)">补充</button>
              </div>
            </div>
          </div>
          <div class="sr-sidebar__assistant ai-assistant-panel">
            <div class="ai-assistant-panel__header"><span class="ai-assistant-panel__title">AI 报告交付助手</span></div>
            <div class="ai-assistant-panel__body">
              <div class="sr-ai-subtitle">改写正文、补充资料、重排模板并打包导出</div>
              <div class="sr-ai-quick">
                <button v-for="a in aiDeliveryActions" :key="a" class="sr-ai-quick-btn" @click="handleAiDeliveryAction(a)">{{ a }}</button>
              </div>
              <div class="sr-ai-msgs">
                <div v-for="(m, i) in aiMsgs" :key="i" class="ai-message" :class="m.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'">
                  <div class="ai-message__avatar">{{ m.role === 'ai' ? 'AI' : '&#25105;' }}</div>
                  <div class="ai-message__bubble" v-html="renderMd(m.text)"></div>
                </div>
                <div v-if="aiBusy" class="ai-message ai-message--ai">
                  <div class="ai-message__avatar">AI</div>
                  <div class="ai-message__bubble sr-ai-msg__thinking">思考中&#8230;</div>
                </div>
              </div>
              <div class="ai-assistant-panel__footer">
                <input v-model="aiInput" class="ai-assistant-panel__input" placeholder="告诉我想如何修改报告，或需要补充哪些资料..." @keydown.enter="sendAiMessage" />
                <button class="ai-assistant-panel__send" @click="sendAiMessage" :disabled="!aiInput.trim() || aiBusy">发送</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <div v-if="showMaterialDetail" class="sr-modal-overlay" @click.self="showMaterialDetail = false">
      <div class="sr-modal">
        <div class="sr-modal__header">
          <h3>{{ selectedMaterial?.name }}</h3>
          <el-icon class="sr-modal__close" @click="showMaterialDetail = false"><Close /></el-icon>
        </div>
        <div class="sr-modal__body" v-if="selectedMaterial">
          <div class="sr-modal__row"><span class="sr-modal__label">类型</span><span>{{ selectedMaterial.type }}</span></div>
          <div class="sr-modal__row"><span class="sr-modal__label">来源</span><span>{{ selectedMaterial.source }}</span></div>
          <div class="sr-modal__row"><span class="sr-modal__label">状态</span><span class="sr-badge" :class="matStatusClass(selectedMaterial.status)">{{ selectedMaterial.status }}</span></div>
          <div class="sr-modal__row"><span class="sr-modal__label">关联章节</span><span>{{ (selectedMaterial.relatedSections || []).join('、') || '无' }}</span></div>
          <div class="sr-modal__row"><span class="sr-modal__label">识别摘要</span><span>{{ selectedMaterial.extractedSummary || '无' }}</span></div>
          <div class="sr-modal__row"><span class="sr-modal__label">识别摘要（编辑）</span><textarea v-model="editingSummary" class="sr-modal__edit" rows="3" placeholder="修改资料识别摘要..."></textarea></div>
        </div>
        <div class="sr-modal__footer">
          <button class="sr-btn" @click="showMaterialDetail = false">关闭</button>
          <button class="sr-btn sr-btn--primary" @click="saveMaterialSummary">保存摘要</button>
        </div>
      </div>
    </div>

    <div v-if="showExportDialog" class="sr-modal-overlay" @click.self="showExportDialog = false">
      <div class="sr-modal">
        <div class="sr-modal__header">
          <h3>批量导出报告和资料包</h3>
          <el-icon class="sr-modal__close" @click="showExportDialog = false"><Close /></el-icon>
        </div>
        <div class="sr-modal__body">
          <div class="sr-modal__label" style="margin-bottom: 8px">选择导出内容：</div>
          <div v-for="opt in exportOptions" :key="opt.key" class="sr-modal__checkbox" @click="opt.checked = !opt.checked">
            <span class="sr-modal__cb-box">{{ opt.checked ? '&#9745;' : '&#9744;' }}</span>
            <span>{{ opt.label }}</span>
          </div>
        </div>
        <div class="sr-modal__footer">
          <button class="sr-btn" @click="showExportDialog = false">取消</button>
          <button class="sr-btn sr-btn--primary" @click="doExportAll">确认导出</button>
        </div>
      </div>
    </div>

    <div v-if="showRegenDialog" class="sr-modal-overlay" @click.self="showRegenDialog = false">
      <div class="sr-modal">
        <div class="sr-modal__header">
          <h3>按新模板重新生成报告</h3>
          <el-icon class="sr-modal__close" @click="showRegenDialog = false"><Close /></el-icon>
        </div>
        <div class="sr-modal__body">
          <div class="sr-modal__label" style="margin-bottom: 8px">选择目标模板：</div>
          <div v-for="tpl in reportTemplates" :key="tpl.id" class="sr-modal__radio" :class="{ on: regenTplId === tpl.id }" @click="regenTplId = tpl.id">
            <span>{{ tpl.name }}</span>
            <span class="sr-modal__radio-desc">{{ tpl.sectionsCount }} 章 &#183; 需 {{ tpl.requiredMaterials }} 份资料</span>
          </div>
          <div v-if="regenTplId" class="sr-modal__mapping">
            <div class="sr-modal__mapping-title">章节映射提示：</div>
            <p class="sr-modal__mapping-text">模板「{{ getRegenTplName() }}」共 {{ getRegenTplSections() }} 章。生成时将保留已有章节内容，新增章节将根据资料包自动生成。</p>
          </div>
        </div>
        <div class="sr-modal__footer">
          <button class="sr-btn" @click="showRegenDialog = false">取消</button>
          <button class="sr-btn sr-btn--primary" @click="doRegenerate" :disabled="!regenTplId">确认生成</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Upload, CircleCheck, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  reportTasks,
  reportTemplates,
  materialPackages,
  uploadEntryOptions,
  reportSections,
  pendingConfirmations,
  aiDeliveryActions,
  exportPackages,
} from '../data/mockSmartReport.js'

const view = ref('home')
const activeReport = ref(null)
const activeSectionId = ref('')
const editingSectionId = ref('')
const editText = ref('')

const aiTaskInput = ref('')
const quickTasks = [
  { label: '从尽调产物生成报告' },
  { label: '上传资料附件生成报告' },
  { label: '按新模板重新生成' },
  { label: '修改待确认内容' },
  { label: '查看章节资料包' },
  { label: '批量导出报告和附件' },
]

function handleAiTask(label) {
  const text = label || aiTaskInput.value.trim()
  if (!text) return
  aiTaskInput.value = ''
  if (text === '上传资料附件生成报告') { view.value = 'upload'; return }
  if (text === '批量导出报告和附件' || text === '批量导出') { showExportDialog.value = true; return }
  if (text === '修改待确认内容') { if (reportTasks.length) openReport(reportTasks[0]); return }
  if (text === '查看章节资料包') { view.value = 'editor'; if (!activeReport.value && reportTasks.length) openReport(reportTasks[0]); return }
  if (text === '按新模板重新生成') { view.value = 'editor'; if (!activeReport.value && reportTasks.length) openReport(reportTasks[0]); setTimeout(() => { showRegenDialog.value = true }, 300); return }
  if (text === '从尽调产物生成报告') { openReport(reportTasks[0]); return }
  ElMessage.info(`AI 收到：「${text}」，将自动匹配最近报告处理`)
  if (reportTasks.length) openReport(reportTasks[0])
}

const statCards = [
  { key: 'pending', label: '待修改报告', value: 3, tone: 'warning' },
  { key: 'missing', label: '资料缺失', value: 2, tone: 'danger' },
  { key: 'template', label: '模板版本', value: 6, tone: 'primary' },
  { key: 'export', label: '待导出', value: 4, tone: 'success' },
]

const uploadTplId = ref('credit-v2021')
const uploadNote = ref('')
const uploadDone = ref(false)
const identifiedMaterials = ref([])
const missingMaterials = ref([])

function simulateUpload() {
  identifiedMaterials.value = ['营业执照', '审计报告', '纳税申报表', '销售合同', '访谈记录', '现场照片']
  missingMaterials.value = ['银行流水', '税票明细']
  uploadDone.value = true
}

const genSteps = ref([])

function startGenerate() {
  view.value = 'generating'
  genSteps.value = [
    { label: '读取报告模板', status: 'active', detail: '' },
    { label: '识别资料包内容', status: 'pending', detail: '' },
    { label: '匹配章节资料要求', status: 'pending', detail: '' },
    { label: '生成报告正文', status: 'pending', detail: '' },
    { label: '标记待确认和缺失资料', status: 'pending', detail: '' },
  ]
  const seq = [{ i: 0, t: 600 }, { i: 1, t: 1400 }, { i: 2, t: 2200 }, { i: 3, t: 3200 }, { i: 4, t: 4000 }]
  seq.forEach(s => {
    setTimeout(() => { if (s.i > 0) genSteps.value[s.i - 1].status = 'done'; genSteps.value[s.i].status = 'active' }, s.t)
  })
  setTimeout(() => { genSteps.value[4].status = 'done'; openReport(reportTasks[0]) }, 4800)
}

const currentSection = computed(() => reportSections.find(s => s.id === activeSectionId.value) || null)
const currentSectionMaterials = computed(() => {
  const sec = currentSection.value
  if (!sec || !sec.relatedMaterialIds) return []
  return materialPackages[0].materials.filter(m => sec.relatedMaterialIds.includes(m.id))
})

function selectSection(id) { activeSectionId.value = id }

function startEditSection() {
  if (!currentSection.value) return
  editingSectionId.value = currentSection.value.id
  editText.value = (currentSection.value.body || []).join('\n\n')
}
function saveEdit() {
  if (currentSection.value) currentSection.value.body = editText.value.split('\n\n').filter(Boolean)
  editingSectionId.value = ''
  editText.value = ''
  ElMessage.success('本节已保存')
}
function cancelEdit() { editingSectionId.value = ''; editText.value = '' }

function getMaterialName(mid) {
  for (const pkg of materialPackages) {
    const m = pkg.materials.find(x => x.id === mid)
    if (m) return m.name
  }
  return mid
}

const showMaterialDetail = ref(false)
const selectedMaterial = ref(null)
const editingSummary = ref('')

function viewMaterialDetail(mat) { selectedMaterial.value = { ...mat }; editingSummary.value = mat.extractedSummary || ''; showMaterialDetail.value = true }
function editMaterialSummary(mat) { viewMaterialDetail(mat) }
function uploadSupplement(mat) { ElMessage.success(`已上传补充资料「${mat.name}」，可重新生成本节`) }
function saveMaterialSummary() {
  if (selectedMaterial.value) {
    selectedMaterial.value.extractedSummary = editingSummary.value
    for (const pkg of materialPackages) {
      const m = pkg.materials.find(x => x.id === selectedMaterial.value.id)
      if (m) { m.extractedSummary = editingSummary.value; m.status = '已修改'; break }
    }
    ElMessage.success('资料摘要已更新')
  }
  showMaterialDetail.value = false
}

const aiMsgs = ref([])
const aiInput = ref('')
const aiBusy = ref(false)

function sendAiMessage() {
  const t = aiInput.value.trim()
  if (!t) return
  aiMsgs.value.push({ role: 'user', text: t })
  aiInput.value = ''
  aiBusy.value = true
  setTimeout(() => { aiMsgs.value.push({ role: 'ai', text: getAiDeliveryReply(t) }); aiBusy.value = false }, 1000)
}

function handleAiDeliveryAction(action) {
  aiMsgs.value.push({ role: 'user', text: action })
  aiBusy.value = true
  setTimeout(() => { aiMsgs.value.push({ role: 'ai', text: getAiDeliveryReply(action) }); aiBusy.value = false }, 1000)
}

function getAiDeliveryReply(input) {
  const secTitle = currentSection.value ? `${currentSection.value.no}、${currentSection.value.title}` : '当前章节'
  const secMats = currentSectionMaterials.value.map(m => m.name).join('、') || '无'
  if (input.includes('改写') || input.includes('修改') || input.includes('压缩')) {
    return `已对「${secTitle}」进行改写优化。\n\n修改要点：\n· 调整了表述结构，使逻辑更清晰\n· 删除了冗余信息，保留核心数据\n· 统一了专有名词用法\n\n请在正文区查看效果，如需进一步调整可继续告诉我。`
  }
  if (input.includes('审批') || input.includes('口吻')) {
    return `已将「${secTitle}」调整为审批口吻。\n\n调整内容：\n· "建议关注" → "提请审批人重点关注"\n· "可能存在风险" → "经核查确认存在以下风险事项"\n· 结论段落调整为正式公文格式，符合授信审批阅读习惯`
  }
  if (input.includes('重新生成') || input.includes('资料包')) {
    return `已根据资料包重新生成「${secTitle}」。\n\n引用资料：${secMats}\n\n生成说明：基于上述资料包的识别摘要，已更新本节正文内容。关键数据均已标注资料来源，可直接用于授信审批。`
  }
  if (input.includes('缺失')) {
    if (currentSection.value?.materialStatus === '完整') return `「${secTitle}」资料状态：完整\n当前章节关联资料充足，无需补充。`
    return `「${secTitle}」缺失资料检查：\n\n⚠️ 当前章节资料${currentSection.value?.materialStatus}\n· 影响：可能导致本节结论缺乏充分证据支撑\n· 建议：补充相关财务凭证、银行流水或税票数据\n· 操作：可点击右侧资料包"补充"按钮上传缺失资料`
  }
  if (input.includes('引用') || input.includes('查看本节')) {
    return `「${secTitle}」引用资料：\n\n关联资料：${secMats}\n\n点击右侧"本章资料包"可查看详情、修改摘要或补充上传。`
  }
  if (input.includes('模板') || input.includes('重新生成报告')) {
    return `按新模板重新生成功能已就绪。\n\n操作步骤：\n1. 点击右上角「按新模板生成」按钮\n2. 选择目标模板\n3. 系统将展示章节映射提示\n4. 确认后自动重新生成\n\n当前报告模板：${activeReport.value?.templateName || '未选择'}\n可用模板：${reportTemplates.map(t => t.name).join('、')}`
  }
  if (input.includes('上传') || input.includes('补充')) {
    return `已为您打开补充资料上传入口。\n\n操作：\n· 点击右侧资料包"补充"按钮上传新资料\n· 上传后AI将自动识别并关联到对应章节\n· 资料补充完成后可重新生成本节\n\n当前章节关联资料：${secMats}`
  }
  if (input.includes('尽调') || input.includes('核验')) {
    return `已生成尽调核验事项。\n\n核验要点：\n· 核实收入真实性（需补充银行流水交叉验证）\n· 确认法人关联企业情况\n· 核实应收账款集中度\n\n核验结果将同步更新至报告对应章节。`
  }
  if (input.includes('导出') || input.includes('批量')) {
    return `已生成导出任务。\n\n导出内容：\n· 报告正文：15 章\n· 附件清单：5 项已归集\n· 资料包：6 份资料\n· 证据目录：31 项\n\n导出文件已生成，可在下载区获取。`
  }
  return `收到：「${input}」\n\n我可以帮您：\n· 改写/压缩当前章节\n· 调整为审批口吻\n· 根据资料包重新生成\n· 检查缺失资料\n· 上传补充资料\n· 按新模板重新生成\n· 批量导出报告和资料包\n\n请直接告诉我需要怎么做。`
}

function renderMd(text) {
  if (!text) return ''
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

function statusBadgeClass(s) {
  if (!s) return ''
  if (s.includes('待确认')) return 'sr-badge--warn'
  if (s.includes('缺失') || s.includes('证据不足') || s.includes('资料缺失')) return 'sr-badge--danger'
  if (s.includes('待导出') || s.includes('已导出') || s.includes('已确认')) return 'sr-badge--success'
  return 'sr-badge--info'
}

function matStatusClass(s) {
  if (s === '已关联') return 'sr-badge--ok'
  if (s === '已修改') return 'sr-badge--info'
  if (s === '缺失' || s === '部分缺失') return 'sr-badge--danger'
  if (s === '待确认') return 'sr-badge--warn'
  return 'sr-badge--info'
}

function riskLevelClass(level) {
  if (level === '高风险') return 'sr-risk-item--high'
  if (level === '中风险') return 'sr-risk-item--mid'
  return 'sr-risk-item--low'
}

function openReport(task) {
  activeReport.value = { ...task }
  activeSectionId.value = reportSections[0].id
  aiMsgs.value = [{ role: 'ai', text: `已打开「${task.enterpriseName} - ${task.reportName}」，共 ${reportSections.length} 个章节。可以查看章节资料包，或用对话方式修改报告。` }]
  view.value = 'editor'
}

function backToHome() { view.value = 'home'; activeReport.value = null }

function handleSaveDraft() { ElMessage.success('草稿已保存') }

const showRegenDialog = ref(false)
const regenTplId = ref('')

function handleRegenerateByTemplate() { showRegenDialog.value = true; regenTplId.value = '' }
function getRegenTplName() { const t = reportTemplates.find(x => x.id === regenTplId.value); return t ? t.name : '' }
function getRegenTplSections() { const t = reportTemplates.find(x => x.id === regenTplId.value); return t ? t.sectionsCount : 0 }

function doRegenerate() {
  if (!regenTplId.value) return
  const tpl = reportTemplates.find(x => x.id === regenTplId.value)
  ElMessage.success(`已按「${tpl?.name}」重新生成报告，共 ${tpl?.sectionsCount} 章`)
  showRegenDialog.value = false
}

function handleRegenerateSection() {
  ElMessage.success('已根据资料包重新生成当前章节')
}

const showExportDialog = ref(false)
const exportOptions = ref(exportPackages.map(p => ({ ...p })))

function handleExportReport() { ElMessage.success('报告已导出为 Word 文档') }
function handleExportAll() { showExportDialog.value = true }
function doExportAll() {
  const items = exportOptions.value.filter(o => o.checked).map(o => o.label).join('、')
  ElMessage.success(`已导出：${items || '无'}，文件已生成`)
  showExportDialog.value = false
}

function handleSubmitConfirm() {
  const pending = pendingConfirmations.filter(p => !p.confirmed)
  if (pending.length) { ElMessage.warning(`仍有 ${pending.length} 项待确认内容，暂不能提交`); return }
  const missing = materialPackages[0].missingCount
  if (missing > 0) { ElMessage.warning(`仍有 ${missing} 项资料缺失，建议补充后再提交`); return }
  ElMessage.success('报告已完成确认，可导出交付')
}

function handleUseTemplate(tpl) {
  ElMessage.success(`已选择「${tpl.name}」，请上传资料或从尽调产物生成报告`)
  if (reportTasks.length) openReport(reportTasks[0])
}

function openMaterialPkg(pkg) {
  ElMessage.info(`资料包「${pkg.packageName}」共 ${pkg.materialCount} 份资料${pkg.missingCount ? '，' + pkg.missingCount + ' 份缺失' : ''}`)
  if (reportTasks.length) openReport(reportTasks[0])
}
</script>
<style scoped>
.sr-page { padding: var(--space-2xl) 32px; max-width: 1440px; margin: 0 auto; min-height: 100vh; }

/* ═══ 首页 ═══ */
.sr-home { max-width: 1100px; margin: 0 auto; }
.sr-home__header { margin-bottom: var(--space-xl); }
.sr-home__title { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.sr-home__subtitle { font-size: var(--font-size-body); color: var(--text-tertiary); margin: 0; }

/* AI 任务输入区（第一视觉） */
.sr-ai-task { background: var(--surface-card); border: 1.5px solid var(--color-primary); border-radius: var(--radius-lg); padding: var(--space-lg) 20px; margin-bottom: var(--space-lg); }
.sr-ai-task__label { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-sm); }
.sr-ai-task__input-wrap { display: flex; gap: var(--space-sm); align-items: flex-end; }
.sr-ai-task__input { flex: 1; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 12px; font-size: var(--font-size-body); outline: none; resize: none; font-family: var(--font-family); min-height: 44px; }
.sr-ai-task__input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
.sr-ai-task__btn { padding: 10px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--font-size-body); font-weight: 500; cursor: pointer; white-space: nowrap; }
.sr-ai-task__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sr-ai-task__btn:hover:not(:disabled) { background: #2563eb; }
.sr-ai-task__quick { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-top: var(--space-sm); }
.sr-ai-task__chip { padding: 4px 12px; background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-full); font-size: var(--font-size-xs); cursor: pointer; color: var(--text-secondary); transition: all .15s; }
.sr-ai-task__chip:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }

/* 弱化统计卡 */
.sr-mini-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
.sr-mini-stat { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) 16px; text-align: center; }
.sr-mini-stat__num { font-size: var(--font-size-metric); font-weight: 700; display: block; }
.sr-mini-stat__label { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-top: 4px; }
.sr-mini-stat.warning .sr-mini-stat__num { color: var(--color-warning); }
.sr-mini-stat.danger .sr-mini-stat__num { color: var(--color-danger); }
.sr-mini-stat.primary .sr-mini-stat__num { color: var(--color-primary); }
.sr-mini-stat.success .sr-mini-stat__num { color: var(--color-success); }

.sr-home__section { margin-bottom: var(--space-xl); }
.sr-home__section-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-md); }

/* 任务卡 */
.sr-task-card { display: flex; justify-content: space-between; gap: var(--space-md); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) 16px; margin-bottom: var(--space-sm); cursor: pointer; transition: all .15s; }
.sr-task-card:hover { border-color: var(--color-primary); }
.sr-task-card__left { flex: 1; min-width: 0; }
.sr-task-card__name { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.sr-task-card__meta { display: flex; gap: var(--space-md); font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-task-card__right { flex-shrink: 0; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.sr-task-card__complete { font-size: var(--font-size-metric); font-weight: 700; color: var(--color-primary); }
.sr-task-card__status-badge { font-size: var(--font-size-xs); padding: 2px 8px; border-radius: var(--radius-sm); }
.sr-task-card__pending { font-size: var(--font-size-xs); padding: 2px 8px; background: var(--color-warning-bg); color: var(--color-warning); border-radius: var(--radius-sm); }
.sr-task-card__ai-note { font-size: var(--font-size-xs); color: var(--text-tertiary); max-width: 320px; line-height: 1.4; }

/* 模板列表 */
.sr-tpl-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-tpl-item { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) 16px; cursor: pointer; transition: all .15s; }
.sr-tpl-item:hover { border-color: var(--color-primary); }
.sr-tpl-item__name { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); }
.sr-tpl-item__meta { display: flex; gap: var(--space-sm); font-size: var(--font-size-xs); color: var(--text-tertiary); margin-top: 2px; }
.sr-tpl-item__version { padding: 1px 6px; background: var(--bg-page); border-radius: var(--radius-sm); }
.sr-tpl-item__desc { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-top: 4px; }

/* 资料包列表 */
.sr-mat-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-mat-item { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) 16px; cursor: pointer; transition: all .15s; }
.sr-mat-item:hover { border-color: var(--color-primary); }
.sr-mat-item__top { display: flex; justify-content: space-between; align-items: flex-start; }
.sr-mat-item__name { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); }
.sr-mat-item__ent { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-mat-item__badges { display: flex; gap: var(--space-xs); align-items: center; flex-shrink: 0; }
.sr-mat-item__src { font-size: var(--font-size-xs); padding: 2px 6px; background: var(--bg-page); border-radius: var(--radius-sm); color: var(--text-tertiary); }
.sr-mat-item__count { font-size: var(--font-size-xs); color: var(--text-secondary); }
.sr-mat-item__missing { font-size: var(--font-size-xs); color: var(--color-danger); }

.sr-empty { text-align: center; color: var(--text-tertiary); padding: var(--space-2xl) 0; font-size: var(--font-size-body); }

/* ═══ 通用 badge ═══ */
.sr-badge { font-size: var(--font-size-xs); padding: 2px 8px; border-radius: var(--radius-sm); display: inline-block; }
.sr-badge--warn { background: var(--color-warning-bg); color: var(--color-warning); }
.sr-badge--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.sr-badge--success { background: var(--color-success-bg); color: var(--color-success); }
.sr-badge--info { background: var(--bg-page); color: var(--text-tertiary); }
.sr-badge--ok { background: var(--color-success-bg); color: var(--color-success); }

/* ═══ 通用按钮 ═══ */
.sr-btn { padding: 6px 14px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: var(--font-size-sm); cursor: pointer; color: var(--text-primary); transition: all .15s; white-space: nowrap; }
.sr-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.sr-btn--primary { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.sr-btn--primary:hover { background: #2563eb; }

.sr-back { cursor: pointer; font-size: 18px; color: var(--text-tertiary); }
.sr-back:hover { color: var(--color-primary); }

/* ═══ 上传态 ═══ */
.sr-upload { max-width: 800px; margin: 0 auto; }
.sr-upload__bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
.sr-upload__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); }
.sr-upload__panel { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-xl) 24px; display: flex; flex-direction: column; gap: var(--space-lg); }
.sr-upload__step { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-upload__label { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.sr-upload__select { border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 12px; font-size: var(--font-size-sm); outline: none; background: #fff; }
.sr-upload__drop { border: 2px dashed var(--border-default); border-radius: var(--radius-md); padding: 32px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); color: var(--text-tertiary); transition: border-color .15s; }
.sr-upload__drop:hover { border-color: var(--color-primary); color: var(--color-primary); }
.sr-upload__hint { font-size: var(--font-size-xs); }
.sr-upload__note { border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 12px; font-size: var(--font-size-sm); outline: none; resize: none; font-family: var(--font-family); }
.sr-upload__actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }

.sr-upload__result { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-xl) 24px; }
.sr-upload__result__header { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-body); font-weight: 600; margin-bottom: var(--space-md); color: var(--color-success); }
.sr-upload__materials, .sr-upload__missing { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md); }
.sr-upload__mat-item { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: var(--radius-md); font-size: var(--font-size-sm); }
.sr-upload__mat-item.ok { background: var(--color-success-bg); color: var(--color-success); }
.sr-upload__mat-item.miss { background: var(--color-danger-bg); color: var(--color-danger); }
.sr-upload__mat-icon { font-weight: 700; font-size: 14px; }
.sr-upload__missing__title { width: 100%; font-size: var(--font-size-sm); font-weight: 600; color: var(--color-danger); margin-bottom: var(--space-xs); }

/* ═══ 生成态 ═══ */
.sr-generating { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.sr-generating__card { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-3xl) 40px; text-align: center; max-width: 480px; width: 100%; }
.sr-generating__spinner { width: 40px; height: 40px; border: 3px solid var(--border-light); border-top-color: var(--color-primary); border-radius: 50%; animation: sr-spin 1s linear infinite; margin: 0 auto var(--space-lg); }
@keyframes sr-spin { to { transform: rotate(360deg); } }
.sr-generating__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-xl); }
.sr-generating__step { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) 0; font-size: var(--font-size-body); color: var(--text-tertiary); }
.sr-generating__step.done { color: var(--color-success); }
.sr-generating__step.active { color: var(--color-primary); font-weight: 500; }
.sr-generating__step-icon { width: 20px; text-align: center; flex-shrink: 0; }

/* ═══ 三栏编辑器 ═══ */
.sr-editor { display: flex; flex-direction: column; height: calc(100vh - 140px); }
.sr-editor__header { display: flex; align-items: center; gap: var(--space-md); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-md) 20px; margin-bottom: var(--space-md); flex-shrink: 0; flex-wrap: wrap; }
.sr-editor__top-info { flex: 1; display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; min-width: 0; }
.sr-editor__top-name { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
.sr-editor__top-report { font-size: var(--font-size-body); color: var(--text-secondary); }
.sr-editor__top-meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-editor__top-pending { font-size: var(--font-size-xs); padding: 2px 6px; background: var(--color-warning-bg); color: var(--color-warning); border-radius: var(--radius-sm); }
.sr-editor__actions { margin-left: auto; display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.sr-editor__body { display: grid; grid-template-columns: 240px 1fr 380px; gap: var(--space-md); flex: 1; overflow: hidden; }

/* 左：目录 */
.sr-editor__toc { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow-y: auto; padding: var(--space-md) 0; }
.sr-toc__header { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); padding: 0 var(--space-md) var(--space-sm); border-bottom: 1px solid var(--border-light); margin-bottom: var(--space-xs); }
.sr-toc__item { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) var(--space-md); cursor: pointer; font-size: var(--font-size-xs); color: var(--text-secondary); }
.sr-toc__item:hover { background: var(--color-primary-bg); color: var(--color-primary); }
.sr-toc__item.active { background: var(--color-primary-bg); color: var(--color-primary); font-weight: 500; }
.sr-toc__item.pending { position: relative; }
.sr-toc__num { width: 20px; flex-shrink: 0; font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-toc__text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-toc__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.sr-toc__dot--warn { background: var(--color-warning); }
.sr-toc__dot--miss { background: var(--color-danger); }

/* 中：正文 */
.sr-editor__content { overflow-y: auto; padding-right: var(--space-sm); }
.sr-sec-header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.sr-sec-header__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }
.sr-sec-header__mat { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.sr-sec-ai-note, .sr-sec-pending-note, .sr-sec-missing-note { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-md); font-size: var(--font-size-sm); margin-bottom: var(--space-md); }
.sr-sec-ai-note { background: var(--color-primary-bg); color: var(--color-primary); }
.sr-sec-pending-note { background: var(--color-warning-bg); color: var(--color-warning); }
.sr-sec-missing-note { background: #fef3c7; color: #92400e; }

.sr-sec-body { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-md); }
.sr-para { font-size: var(--font-size-body); color: var(--text-primary); line-height: 1.8; margin: 0 0 var(--space-md); }

.sr-info-table { width: 100%; border-collapse: collapse; margin: var(--space-md) 0; }
.sr-info-table td { padding: var(--space-sm) var(--space-md); font-size: var(--font-size-sm); border: 1px solid var(--border-light); }
.sr-info-table__label { font-weight: 500; color: var(--text-secondary); width: 25%; background: var(--bg-table-header); }

.sr-data-table { width: 100%; border-collapse: collapse; margin: var(--space-md) 0; font-size: var(--font-size-sm); }
.sr-data-table th { background: var(--bg-table-header); color: var(--text-secondary); font-weight: 600; padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-light); text-align: left; }
.sr-data-table td { padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-light); color: var(--text-primary); }

.sr-risk-list { margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-risk-list__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
.sr-risk-item { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); background: var(--bg-page); font-size: var(--font-size-sm); }
.sr-risk-item--high { border-left: 3px solid var(--color-danger); }
.sr-risk-item--mid { border-left: 3px solid var(--color-warning); }
.sr-risk-item--low { border-left: 3px solid var(--color-success); }
.sr-risk-item__level { font-size: var(--font-size-xs); font-weight: 600; padding: 1px 6px; border-radius: 3px; color: #fff; background: var(--color-warning); white-space: nowrap; }
.sr-risk-item--high .sr-risk-item__level { background: var(--color-danger); }
.sr-risk-item--low .sr-risk-item__level { background: var(--color-success); }
.sr-risk-item__title { flex: 1; font-weight: 500; }
.sr-risk-item__basis { color: var(--text-tertiary); max-width: 50%; font-size: var(--font-size-xs); }

.sr-sec-material-ref { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); }
.sr-sec-material-ref__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
.sr-sec-material-ref__item { padding: 4px 0; font-size: var(--font-size-sm); color: var(--text-primary); }

.sr-sec-edit { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-sec-edit__textarea { border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md); font-size: var(--font-size-body); outline: none; resize: none; font-family: var(--font-family); line-height: 1.8; min-height: 200px; }
.sr-sec-edit__textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
.sr-sec-edit__actions { display: flex; gap: var(--space-sm); }
.sr-sec-actions { display: flex; gap: var(--space-sm); padding-top: var(--space-md); }

/* 右：侧栏 */
.sr-editor__sidebar { overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-md); }

.sr-sidebar__materials { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md); max-height: 45%; overflow-y: auto; flex-shrink: 0; }
.sr-sidebar__section-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-sm); }
.sr-sidebar__empty { font-size: var(--font-size-xs); color: var(--text-tertiary); padding: var(--space-md) 0; }

.sr-mat-card { border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--space-sm) 10px; margin-bottom: var(--space-sm); font-size: var(--font-size-xs); }
.sr-mat-card.modified { border-color: var(--color-primary); background: var(--color-primary-bg); }
.sr-mat-card__name { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.sr-mat-card__meta { display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-tertiary); }
.sr-mat-card__summary { color: var(--text-secondary); line-height: 1.4; margin-bottom: 4px; }
.sr-mat-card__actions { display: flex; gap: var(--space-xs); }
.sr-mat-card__link { font-size: var(--font-size-xs); color: var(--color-primary); cursor: pointer; background: none; border: none; text-decoration: underline; padding: 0; }
.sr-mat-card__link:hover { color: #2563eb; }

/* AI 助手 */
.sr-sidebar__assistant { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.sr-ai-subtitle { font-size: var(--font-size-xs); color: var(--text-tertiary); padding: var(--space-sm) var(--space-md); }
.sr-ai-quick { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 var(--space-md) var(--space-sm); }
.sr-ai-quick-btn { font-size: 11px; padding: 3px 8px; background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-lg); cursor: pointer; color: var(--text-secondary); transition: all .15s; }
.sr-ai-quick-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }
.sr-ai-msgs { flex: 1; overflow-y: auto; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); min-height: 0; }
.sr-ai-msg__thinking { color: var(--text-tertiary); font-style: italic; }

/* ═══ 弹窗 ═══ */
.sr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.sr-modal { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); width: 480px; max-width: 90vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
.sr-modal__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-light); }
.sr-modal__header h3 { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); margin: 0; }
.sr-modal__close { cursor: pointer; font-size: 18px; color: var(--text-tertiary); }
.sr-modal__close:hover { color: var(--color-primary); }
.sr-modal__body { padding: var(--space-lg); }
.sr-modal__row { display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm); font-size: var(--font-size-sm); }
.sr-modal__label { color: var(--text-tertiary); min-width: 80px; flex-shrink: 0; }
.sr-modal__edit { flex: 1; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--font-size-sm); outline: none; resize: none; font-family: var(--font-family); width: 100%; }
.sr-modal__footer { display: flex; justify-content: flex-end; gap: var(--space-sm); padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-light); }
.sr-modal__checkbox { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) 0; cursor: pointer; font-size: var(--font-size-sm); color: var(--text-primary); }
.sr-modal__cb-box { font-size: 16px; }
.sr-modal__radio { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-default); border-radius: var(--radius-md); margin-bottom: var(--space-sm); cursor: pointer; font-size: var(--font-size-sm); }
.sr-modal__radio:hover { border-color: var(--color-primary); }
.sr-modal__radio.on { border-color: var(--color-primary); background: var(--color-primary-bg); }
.sr-modal__radio-desc { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-modal__mapping { margin-top: var(--space-md); padding: var(--space-md); background: var(--bg-page); border-radius: var(--radius-md); font-size: var(--font-size-sm); color: var(--text-secondary); }
.sr-modal__mapping-title { font-weight: 600; margin-bottom: var(--space-xs); }
.sr-modal__mapping-text { margin: 0; line-height: 1.5; }

@media (max-width: 1200px) {
  .sr-editor__body { grid-template-columns: 1fr; }
  .sr-editor__toc { max-height: 200px; }
  .sr-editor__sidebar { max-height: 400px; }
}
</style>