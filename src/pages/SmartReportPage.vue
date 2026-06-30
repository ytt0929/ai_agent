<template>
  <div class="sr-page">
    <!-- ═══ 工作台首页 ═══ -->
    <div v-if="view === 'workspace'" class="sr-workspace">
      <div class="sr-header">
        <h1 class="sr-title">智能报告</h1>
        <p class="sr-subtitle">基于尽调数据自动生成智能报告，辅助授信决策</p>
      </div>

      <!-- 统计卡 -->
      <div class="sr-stats">
        <div v-for="stat in stats" :key="stat.key" class="sr-stat" :class="stat.tone">
          <div class="sr-stat__value">{{ stat.value }}</div>
          <div class="sr-stat__label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- 快捷生成 -->
      <div class="sr-quick-gen">
        <div class="sr-section-title">快速生成报告</div>
        <div class="sr-tpl-grid">
          <div v-for="tpl in templates" :key="tpl.id" class="sr-tpl-card" @click="startCreate(tpl.id)">
            <el-icon :size="28" class="sr-tpl-card__icon"><component :is="tpl.icon" /></el-icon>
            <div class="sr-tpl-card__name">{{ tpl.name }}</div>
            <div class="sr-tpl-card__desc">{{ tpl.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 报告列表 -->
      <div class="sr-list">
        <div class="sr-section-title">最近报告</div>
        <div v-if="reportList.length === 0" class="sr-empty">暂无报告，请先完成尽调或诊断任务后生成</div>
        <div v-for="item in reportList" :key="item.id" class="sr-report-card" @click="openReport(item)">
          <el-icon :size="24" class="sr-report-card__icon" :class="item.statusTone"><component :is="reportIcon(item.type)" /></el-icon>
          <div class="sr-report-card__info">
            <div class="sr-report-card__name">{{ item.name }}</div>
            <div class="sr-report-card__meta">
              <span class="sr-badge" :class="item.statusTone">{{ item.status }}</span>
              <span class="sr-report-card__time">{{ item.updatedAt }}</span>
              <span v-if="item.source" class="sr-report-card__src">{{ item.source }}</span>
            </div>
          </div>
          <div class="sr-report-card__right">
            <span v-if="item.pendingCount" class="sr-pending-badge">{{ item.pendingCount }} 项待确认</span>
            <el-icon class="sr-report-card__arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 创建向导 ═══ -->
    <div v-if="view === 'create'" class="sr-create">
      <div class="sr-create__bar">
        <el-icon class="sr-back" @click="view = 'workspace'"><ArrowLeft /></el-icon>
        <span class="sr-create__title">新建报告</span>
      </div>

      <div class="sr-create__step">
        <label class="sr-create__label">选择数据源</label>
        <div class="sr-ds-grid">
          <div v-for="ds in sources" :key="ds.id" class="sr-ds-card" :class="{ on: selectedDs.includes(ds.id) }" @click="toggleDs(ds.id)">
            <el-icon :size="18"><component :is="ds.icon" /></el-icon>
            <span class="sr-ds-card__name">{{ ds.name }}</span>
            <span class="sr-ds-card__status" :class="ds.status">{{ ds.status === 'ready' ? '可用' : '部分可用' }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedDs.length > 0" class="sr-create__action">
        <el-button type="primary" size="large" @click="doGen()">生成报告（{{ selectedDs.length }} 个数据源）</el-button>
      </div>

      <!-- 生成中 -->
      <div v-if="generating" class="sr-creating">
        <div class="sr-creating__spinner" />
        <div class="sr-creating__title">正在生成报告…</div>
        <div v-for="(gs, i) in genSteps" :key="i" class="sr-creating__step" :class="gs.status">
          {{ gs.status === 'done' ? '✓' : gs.status === 'active' ? '⟳' : '○' }} {{ gs.label }}
        </div>
      </div>
    </div>

    <!-- ═══ 三栏编辑器 ═══ -->
    <div v-if="view === 'editor'" class="sr-editor">
      <!-- 顶部栏 -->
      <div class="sr-editor__header">
        <el-icon class="sr-back" @click="backToWorkspace"><ArrowLeft /></el-icon>
        <div class="sr-editor__title">{{ currentReport?.name || '报告编辑' }}</div>
        <div class="sr-editor__meta">
          <span class="sr-badge" :class="currentReport?.statusTone">{{ currentReport?.version }}</span>
          <span class="sr-editor__updated">{{ currentReport?.updatedAt }}</span>
        </div>
        <div class="sr-editor__actions">
          <el-button size="small" @click="showRuleCheck = !showRuleCheck">规则检查</el-button>
          <el-button size="small" type="primary" @click="exportReport">导出 Word</el-button>
        </div>
      </div>

      <div class="sr-editor__body">
        <!-- 左：目录 -->
        <div class="sr-editor__toc">
          <div class="sr-toc__title">报告目录</div>
          <div v-for="(sec, idx) in sections" :key="sec.id" class="sr-toc__item" :class="{ active: activeSection === sec.id, pending: sec.pending }" @click="activeSection = sec.id">
            <span class="sr-toc__num">{{ sec.no }}</span>
            <span class="sr-toc__text" :title="sec.title">{{ sec.title.replace(sec.no + '、', '') }}</span>
            <span v-if="sec.pending" class="sr-toc__dot" />
          </div>
        </div>

        <!-- 中：正文 -->
        <div class="sr-editor__content">
          <template v-if="currentSection">
            <div class="sr-section__header">
              <span class="sr-section__no">{{ currentSection.no }}</span>
              <h2 class="sr-section__title">{{ currentSection.title.replace(currentSection.no + '、', '') }}</h2>
              <span class="sr-status-badge" :class="sectionStatusClass(currentSection.status)">{{ currentSection.status }}</span>
            </div>

            <div class="sr-section__body">
              <p v-for="(p, i) in currentSection.body" :key="i" class="sr-para">{{ p }}</p>

              <!-- 2列信息表格 -->
              <table v-if="currentSection.table && !currentSection.tableHeaders" class="sr-info-table">
                <tr v-for="(row, ri) in currentSection.table" :key="ri">
                  <td class="sr-info-table__label" v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                </tr>
              </table>

              <!-- 多列表格 -->
              <table v-if="currentSection.tableHeaders" class="sr-data-table">
                <thead>
                  <tr><th v-for="h in currentSection.tableHeaders" :key="h">{{ h }}</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in currentSection.tableRows" :key="ri">
                    <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- 风险列表 -->
              <div v-if="currentSection.risks" class="sr-risk-list">
                <div v-for="(r, ri) in currentSection.risks" :key="ri" class="sr-risk-item" :class="riskLevelClass(r.level)">
                  <span class="sr-risk-item__level">{{ r.level }}</span>
                  <span class="sr-risk-item__title">{{ r.title }}</span>
                  <span class="sr-risk-item__basis">{{ r.basis }}</span>
                </div>
              </div>

              <!-- 证据列表 -->
              <div v-if="currentSection.evidence" class="sr-evidence-list">
                <div class="sr-evidence-list__title">证据链</div>
                <div v-for="(ev, ei) in currentSection.evidence" :key="ei" class="sr-evidence-item">
                  <span class="sr-evidence-item__name">{{ ev.name }}</span>
                  <span class="sr-badge" :class="evidenceStatusClass(ev.status)">{{ ev.status }}</span>
                  <span class="sr-evidence-item__source">{{ ev.source }}</span>
                </div>
              </div>
            </div>

            <!-- 底部导航 -->
            <div class="sr-section__nav">
              <el-button size="small" :disabled="sectionIdx <= 0" @click="activeSection = sections[sectionIdx - 1].id">
                <el-icon><ArrowLeft /></el-icon> 上一章
              </el-button>
              <el-button size="small" :disabled="sectionIdx >= sections.length - 1" @click="activeSection = sections[sectionIdx + 1].id">
                下一章 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
        </div>

        <!-- 右：AI助手 -->
        <div class="sr-editor__assistant">
          <div class="sr-ai__header">
            <el-icon :size="18"><ChatDotRound /></el-icon>
            <span>AI 报告助手</span>
          </div>

          <!-- 规则检查面板 -->
          <div v-if="showRuleCheck" class="sr-ai__rule-check">
            <div class="sr-ai__rule-title">规则检查</div>
            <div class="sr-rule-item" :class="ruleCheck.missingEvidence > 0 ? 'warn' : 'ok'">
              <span>缺失证据</span><span class="sr-rule-count">{{ ruleCheck.missingEvidence }}</span>
            </div>
            <div class="sr-rule-item" :class="ruleCheck.pendingConclusions > 0 ? 'warn' : 'ok'">
              <span>待确认结论</span><span class="sr-rule-count">{{ ruleCheck.pendingConclusions }}</span>
            </div>
            <div class="sr-rule-item" :class="ruleCheck.forbiddenWords > 0 ? 'warn' : 'ok'">
              <span>禁用词</span><span class="sr-rule-count">{{ ruleCheck.forbiddenWords }}</span>
            </div>
            <div class="sr-rule-item" :class="ruleCheck.templateRules > 0 ? 'warn' : 'ok'">
              <span>模板规则</span><span class="sr-rule-count">{{ ruleCheck.templateRules }}</span>
            </div>
          </div>

          <!-- 待确认事项 -->
          <div v-if="pendingItems.length" class="sr-ai__pending">
            <div class="sr-ai__pending-title">待确认事项</div>
            <div v-for="p in pendingItems" :key="p.id" class="sr-pending-item">
              <el-checkbox v-model="p.confirmed" size="small" />
              <span :class="{ done: p.confirmed }">{{ p.title }}</span>
            </div>
          </div>

          <!-- 快捷按钮 -->
          <div class="sr-ai__quick">
            <div v-for="q in quickActions" :key="q" class="sr-ai__quick-btn" @click="sendQuick(q)">{{ q }}</div>
          </div>

          <!-- 对话区 -->
          <div class="sr-ai__msgs">
            <div v-for="(m, i) in aiMsgs" :key="i" class="sr-ai-msg" :class="m.role">
              <span class="sr-ai-msg__av">{{ m.role === 'ai' ? '🤖' : '👤' }}</span>
              <div class="sr-ai-msg__bubble" v-html="md(m.text)"></div>
            </div>
            <div v-if="aiBusy" class="sr-ai-msg ai">
              <span class="sr-ai-msg__av">🤖</span>
              <div class="sr-ai-msg__bubble sr-ai-msg__thinking">思考中…</div>
            </div>
          </div>

          <div class="sr-ai__input">
            <input v-model="aiInput" placeholder="说你想怎么改…" @keyup.enter="sendAi()" />
            <el-button size="small" type="primary" :disabled="!aiInput || aiBusy" @click="sendAi()">发送</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ArrowLeft, ArrowRight, ChatDotRound,
  DocumentChecked, Warning, DataAnalysis,
  OfficeBuilding, Tickets, Document, Monitor, View, Files,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  reportInstances, creditReportTemplates, creditReportSources,
  reportWorkspaceStats, ruleCheckSummary, assistantQuickActions,
  creditReportSections, pendingItems as rawPendingItems,
} from '../data/mockSmartReport.js'

// ═══ 视图状态 ═══
const view = ref('workspace')
const generating = ref(false)
const selectedTpl = ref('')
const selectedDs = ref([])
const showRuleCheck = ref(false)

// ═══ 编辑器状态 ═══
const currentReport = ref(null)
const sections = ref([])
const activeSection = ref('')
const aiMsgs = ref([])
const aiInput = ref('')
const aiBusy = ref(false)

// ═══ 静态数据 ═══
const stats = reportWorkspaceStats
const templates = creditReportTemplates
const sources = creditReportSources
const quickActions = assistantQuickActions
const ruleCheck = ref({ ...ruleCheckSummary })
const pendingItems = ref(rawPendingItems.map(p => ({ ...p })))

// ═══ 报告列表 ═══
const reportList = computed(() => reportInstances)

// ═══ 生成步骤动画 ═══
const genSteps = ref([
  { label: '读取数据源', status: 'done' },
  { label: '分析数据结构', status: 'done' },
  { label: '生成报告内容', status: 'active' },
  { label: '排版与格式化', status: 'pending' },
])

// ═══ 计算属性 ═══
const sectionIdx = computed(() => sections.value.findIndex(s => s.id === activeSection.value))
const currentSection = computed(() => sections.value.find(s => s.id === activeSection.value) || null)

// ═══ 操作 ═══
function startCreate(tplId) {
  selectedTpl.value = tplId
  selectedDs.value = []
  view.value = 'create'
}

function toggleDs(id) {
  const i = selectedDs.value.indexOf(id)
  if (i >= 0) selectedDs.value.splice(i, 1)
  else selectedDs.value.push(id)
}

function doGen() {
  generating.value = true
  genSteps.value = [
    { label: '读取数据源', status: 'active' },
    { label: '分析数据结构', status: 'pending' },
    { label: '生成报告内容', status: 'pending' },
    { label: '排版与格式化', status: 'pending' },
  ]
  setTimeout(() => {
    genSteps.value[0].status = 'done'
    genSteps.value[1].status = 'active'
  }, 800)
  setTimeout(() => {
    genSteps.value[1].status = 'done'
    genSteps.value[2].status = 'active'
  }, 1600)
  setTimeout(() => {
    genSteps.value[2].status = 'done'
    genSteps.value[3].status = 'active'
  }, 2400)
  setTimeout(() => {
    genSteps.value[3].status = 'done'
    generating.value = false
    openReport(reportInstances[0])
  }, 3200)
}

function openReport(item) {
  if (!item) return
  currentReport.value = item
  sections.value = creditReportSections.map(s => ({ ...s }))
  activeSection.value = sections.value[0].id
  aiMsgs.value = [{ role: 'ai', text: `已打开「${item.name}」，共 ${sections.value.length} 个章节。可以用对话方式修改内容。` }]
  ruleCheck.value = { ...ruleCheckSummary }
  pendingItems.value = rawPendingItems.map(p => ({ ...p }))
  view.value = 'editor'
}

function backToWorkspace() {
  view.value = 'workspace'
  currentReport.value = null
}

function exportReport() {
  ElMessage.success('报告已导出为 Word 文档')
}

// ═══ AI 对话 mock ═══
function sendAi() {
  const t = aiInput.value.trim()
  if (!t) return
  aiMsgs.value.push({ role: 'user', text: t })
  aiInput.value = ''
  aiBusy.value = true
  setTimeout(() => {
    aiMsgs.value.push({ role: 'ai', text: getAiReply(t) })
    aiBusy.value = false
  }, 1200)
}

function sendQuick(q) {
  aiInput.value = q
  sendAi()
}

function getAiReply(input) {
  const low = input.toLowerCase()
  if (low.includes('风险') && low.includes('展开')) {
    return '**高风险项（2项）：**\n\n1. **税票数据授权存在缺口** — 2024年部分税票缺失，影响收入连续性判断。\n2. **法人关联企业异常** — 法人名下3家关联企业，其中1家已注销未披露。\n\n**中风险项（2项）：**\n3. 应收账款集中度高（前两大客户应收占比约68%）\n4. 存货周转率连续三季度下降'
  }
  if (low.includes('税票')) {
    return '已在以下章节追加税票数据：\n- **第七章 财务状况**：补充税票与营收交叉比对\n- **第八章 收入真实性**：追加差异说明\n- **第十二章 风险分析**：补充税票缺口专项说明\n\n注意：2024年税票因授权缺失，相关数据已标注"数据缺口"。'
  }
  if (low.includes('审批') || low.includes('口吻') || low.includes('正式')) {
    return '已调整全文语气：\n- "建议关注" → "提请审批人重点关注"\n- "可能存在" → "经核查确认存在"\n- 结论段落调整为正式公文格式'
  }
  if (low.includes('缺失') || low.includes('证据')) {
    return `证据链完整性检查：\n- 缺失证据项：**${ruleCheck.value.missingEvidence}** 项\n- 待确认结论：**${ruleCheck.value.pendingConclusions}** 项\n- 禁用词：**${ruleCheck.value.forbiddenWords}** 项\n\n建议在"第七章 财务状况"补充银行流水，在"第十章 行业地位"补充行业公开资料。`
  }
  if (low.includes('授信') || low.includes('方案')) {
    return '授信方案已就绪（第十四章）：\n- 授信金额：300 万\n- 期限：12 个月\n- 品种：流动资金贷款\n- 担保：实控人连带保证 + 应收账款质押\n\n提款条件已标注，需确认后方可提交。'
  }
  if (low.includes('禁用')) {
    return `禁用词检查：未发现违规用词 ✅\n- 已扫描全文 ${sections.value.length} 个章节\n- 共检查 12 个金融禁用词\n- 0 处命中`
  }
  return `收到：「${input}」\n\n我可以帮您：\n- **展开某个章节**的详细分析\n- **调整语气**（正式/简洁）\n- **补充数据**（税票/工商/诊断）\n- **检查缺失证据**\n\n请直接告诉我需要怎么改。`
}

function md(text) {
  if (!text) return ''
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

// ═══ 工具函数 ═══
function reportIcon(type) {
  if (type?.includes('诊断')) return Warning
  if (type?.includes('全景')) return DataAnalysis
  return DocumentChecked
}

function sectionStatusClass(s) {
  if (s === '已生成') return 'ok'
  if (s === '待确认') return 'warn'
  if (s === '待补充') return 'warn'
  if (s === '证据不足') return 'danger'
  return 'info'
}

function evidenceStatusClass(s) {
  if (s === '已生成' || s === '已采集' || s === '已识别' || s === '已核验' || s === '已引用' || s === '已确认') return 'ok'
  if (s === '待确认' || s === '待补充') return 'warn'
  if (s.includes('缺失')) return 'danger'
  return 'info'
}

function riskLevelClass(level) {
  if (level === '高风险') return 'high'
  if (level === '中风险') return 'mid'
  return 'low'
}
</script>

<style scoped>
.sr-page { padding: var(--space-2xl) 32px; max-width: 1400px; margin: 0 auto; }

/* ── 工作台 ── */
.sr-header { margin-bottom: var(--space-2xl); }
.sr-title { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.sr-subtitle { font-size: var(--font-size-body); color: var(--text-tertiary); margin: 0; }

.sr-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-2xl); }
.sr-stat { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-lg) 20px; text-align: center; }
.sr-stat__value { font-size: var(--font-size-metric); font-weight: 700; }
.sr-stat__label { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: var(--space-xs); }
.sr-stat.warning .sr-stat__value { color: var(--color-warning); }
.sr-stat.danger .sr-stat__value { color: var(--color-danger); }
.sr-stat.primary .sr-stat__value { color: var(--color-primary); }
.sr-stat.success .sr-stat__value { color: var(--color-success); }

.sr-section-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-md); }

.sr-tpl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-2xl); }
.sr-tpl-card { background: var(--surface-card); border: 1.5px solid var(--border-default); border-radius: var(--radius-lg); padding: 24px 20px; text-align: center; cursor: pointer; }
.sr-tpl-card:hover { border-color: var(--color-primary); }
.sr-tpl-card__icon { color: var(--color-primary); margin-bottom: var(--space-sm); }
.sr-tpl-card__name { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
.sr-tpl-card__desc { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: var(--space-xs); }

.sr-report-card { display: flex; align-items: center; gap: var(--space-md); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-lg) 20px; margin-bottom: var(--space-sm); cursor: pointer; }
.sr-report-card:hover { border-color: var(--color-primary); }
.sr-report-card__icon { flex-shrink: 0; }
.sr-report-card__icon.warning { color: var(--color-warning); }
.sr-report-card__icon.danger { color: var(--color-danger); }
.sr-report-card__icon.success { color: var(--color-success); }
.sr-report-card__info { flex: 1; }
.sr-report-card__name { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
.sr-report-card__meta { display: flex; gap: var(--space-sm); margin-top: 4px; font-size: var(--font-size-sm); align-items: center; }
.sr-report-card__time { color: var(--text-tertiary); }
.sr-report-card__src { color: var(--text-tertiary); }
.sr-report-card__right { display: flex; align-items: center; gap: var(--space-sm); }
.sr-report-card__arrow { color: var(--text-tertiary); }
.sr-pending-badge { font-size: var(--font-size-xs); padding: 2px 8px; background: var(--color-warning-bg); color: var(--color-warning); border-radius: var(--radius-sm); }

.sr-empty { text-align: center; color: var(--text-tertiary); padding: var(--space-4xl) 0; }

/* ═══ Badge ═══ */
.sr-badge { padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs); }
.sr-badge.warning { background: var(--color-warning-bg); color: var(--color-warning); }
.sr-badge.danger { background: var(--color-danger-bg); color: var(--color-danger); }
.sr-badge.success { background: var(--color-success-bg); color: var(--color-success); }
.sr-badge.info { background: var(--bg-page); color: var(--text-tertiary); }
.sr-badge.ok { background: var(--color-success-bg); color: var(--color-success); }
.sr-badge.draft { background: var(--color-warning-bg); color: var(--color-warning); }

/* ── 创建向导 ── */
.sr-create__bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
.sr-create__title { font-size: var(--font-size-assist); font-weight: 600; color: var(--text-primary); }
.sr-create__step { margin-bottom: var(--space-xl); }
.sr-create__label { display: block; font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-sm); }
.sr-ds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
.sr-ds-card { display: flex; align-items: center; gap: var(--space-sm); background: var(--surface-card); border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) 16px; cursor: pointer; }
.sr-ds-card:hover { border-color: var(--color-primary); }
.sr-ds-card.on { border-color: var(--color-primary); background: var(--color-primary-bg); }
.sr-ds-card__name { flex: 1; font-size: var(--font-size-body); font-weight: 600; }
.sr-ds-card__status { font-size: var(--font-size-xs); }
.sr-ds-card__status.ready { color: var(--color-success); }
.sr-ds-card__status.partial { color: var(--color-warning); }
.sr-create__action { display: flex; justify-content: center; padding: var(--space-lg) 0; }

.sr-creating { text-align: center; padding: 40px 20px; }
.sr-creating__spinner { width: 36px; height: 36px; border: 3px solid var(--border-light); border-top-color: var(--color-primary); border-radius: 50%; animation: sr-spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes sr-spin { to { transform: rotate(360deg); } }
.sr-creating__title { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); }
.sr-creating__step { font-size: var(--font-size-body); color: var(--text-tertiary); padding: var(--space-xs) 0; }
.sr-creating__step.done { color: var(--color-success); }
.sr-creating__step.active { color: var(--color-primary); font-weight: 500; }

/* ── 三栏编辑器 ── */
.sr-editor { display: flex; flex-direction: column; height: calc(100vh - 140px); }
.sr-editor__header { display: flex; align-items: center; gap: var(--space-md); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-md) 20px; margin-bottom: var(--space-md); flex-shrink: 0; }
.sr-editor__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); flex: 1; }
.sr-editor__meta { display: flex; gap: var(--space-sm); align-items: center; }
.sr-editor__updated { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-editor__actions { margin-left: auto; display: flex; gap: var(--space-xs); }

.sr-editor__body { display: grid; grid-template-columns: 240px 1fr 360px; gap: var(--space-md); flex: 1; overflow: hidden; }

/* 左：目录 */
.sr-editor__toc { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow-y: auto; padding: var(--space-md) 0; }
.sr-toc__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); padding: 0 var(--space-md) var(--space-sm); border-bottom: 1px solid var(--border-light); margin-bottom: var(--space-xs); }
.sr-toc__item { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) var(--space-md); cursor: pointer; font-size: var(--font-size-sm); color: var(--text-secondary); }
.sr-toc__item:hover { background: var(--color-primary-bg); color: var(--color-primary); }
.sr-toc__item.active { background: var(--color-primary-bg); color: var(--color-primary); font-weight: 500; }
.sr-toc__item.pending { position: relative; }
.sr-toc__num { width: 22px; flex-shrink: 0; font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-toc__text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-toc__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-warning); flex-shrink: 0; }

/* 中：正文 */
.sr-editor__content { overflow-y: auto; padding-right: var(--space-sm); }
.sr-section__header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.sr-section__no { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary); }
.sr-section__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }
.sr-status-badge { font-size: var(--font-size-xs); padding: 2px 8px; border-radius: var(--radius-sm); }
.sr-status-badge.ok { background: var(--color-success-bg); color: var(--color-success); }
.sr-status-badge.warn { background: var(--color-warning-bg); color: var(--color-warning); }
.sr-status-badge.danger { background: var(--color-danger-bg); color: var(--color-danger); }

.sr-section__body { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-md); }
.sr-para { font-size: var(--font-size-body); color: var(--text-primary); line-height: 1.8; margin: 0 0 var(--space-md); }

/* 2列表格 */
.sr-info-table { width: 100%; border-collapse: collapse; margin: var(--space-md) 0; }
.sr-info-table td { padding: var(--space-sm) var(--space-md); font-size: var(--font-size-sm); border: 1px solid var(--border-light); }
.sr-info-table__label { font-weight: 500; color: var(--text-secondary); width: 25%; background: var(--bg-table-header); }

/* 多列表格 */
.sr-data-table { width: 100%; border-collapse: collapse; margin: var(--space-md) 0; font-size: var(--font-size-sm); }
.sr-data-table th { background: var(--bg-table-header); color: var(--text-secondary); font-weight: 600; padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-light); text-align: left; }
.sr-data-table td { padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-light); color: var(--text-primary); }

/* 风险列表 */
.sr-risk-list { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-md); }
.sr-risk-item { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-md); border-radius: var(--radius-sm); background: var(--bg-page); }
.sr-risk-item.high { border-left: 3px solid var(--color-danger); }
.sr-risk-item.mid { border-left: 3px solid var(--color-warning); }
.sr-risk-item.low { border-left: 3px solid var(--color-success); }
.sr-risk-item__level { font-size: var(--font-size-xs); font-weight: 600; padding: 1px 6px; border-radius: 3px; color: #fff; background: var(--color-warning); white-space: nowrap; }
.sr-risk-item.high .sr-risk-item__level { background: var(--color-danger); }
.sr-risk-item.low .sr-risk-item__level { background: var(--color-success); }
.sr-risk-item__title { flex: 1; font-size: var(--font-size-sm); font-weight: 500; color: var(--text-primary); }
.sr-risk-item__basis { font-size: var(--font-size-xs); color: var(--text-tertiary); max-width: 50%; }

/* 证据列表 */
.sr-evidence-list { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); }
.sr-evidence-list__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-sm); }
.sr-evidence-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) 0; font-size: var(--font-size-sm); }
.sr-evidence-item__name { flex: 1; color: var(--text-primary); }
.sr-evidence-item__source { color: var(--text-tertiary); font-size: var(--font-size-xs); }

/* 底部导航 */
.sr-section__nav { display: flex; justify-content: space-between; padding: var(--space-md) 0; }

/* 右：AI助手 */
.sr-editor__assistant { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; }
.sr-ai__header { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-md) var(--space-lg); background: var(--bg-table-header); border-bottom: 1px solid var(--border-light); font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); }

/* 规则检查 */
.sr-ai__rule-check { padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-light); }
.sr-ai__rule-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
.sr-rule-item { display: flex; justify-content: space-between; padding: var(--space-xs) 0; font-size: var(--font-size-sm); color: var(--text-primary); }
.sr-rule-item.warn { color: var(--color-warning); }
.sr-rule-item.ok { color: var(--color-success); }
.sr-rule-count { font-weight: 600; }

/* 待确认 */
.sr-ai__pending { padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-light); }
.sr-ai__pending-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
.sr-pending-item { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) 0; font-size: var(--font-size-sm); color: var(--text-primary); }
.sr-pending-item span.done { text-decoration: line-through; color: var(--text-tertiary); }

/* 快捷按钮 */
.sr-ai__quick { display: flex; flex-wrap: wrap; gap: var(--space-xs); padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-light); }
.sr-ai__quick-btn { font-size: var(--font-size-xs); padding: 4px 10px; background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-lg); cursor: pointer; color: var(--text-secondary); }
.sr-ai__quick-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }

/* 对话区 */
.sr-ai__msgs { flex: 1; padding: var(--space-lg); overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-sm); min-height: 0; }
.sr-ai-msg { display: flex; gap: var(--space-sm); }
.sr-ai-msg.user { flex-direction: row-reverse; }
.sr-ai-msg__av { font-size: var(--font-size-page-title); flex-shrink: 0; }
.sr-ai-msg__bubble { max-width: 90%; padding: var(--space-sm) 12px; border-radius: var(--radius-md); font-size: 12.5px; line-height: 1.6; }
.sr-ai-msg.ai .sr-ai-msg__bubble { background: var(--bg-table-header); border-bottom-left-radius: 4px; }
.sr-ai-msg.user .sr-ai-msg__bubble { background: var(--color-primary); color: #fff; border-bottom-right-radius: 4px; }
.sr-ai-msg__thinking { color: var(--text-tertiary); font-style: italic; }

/* 输入区 */
.sr-ai__input { display: flex; gap: var(--space-xs); padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-light); }
.sr-ai__input input { flex: 1; border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 12px; font-size: var(--font-size-sm); outline: none; background: var(--bg-page); }
.sr-ai__input input:focus { border-color: var(--color-primary); }
</style>