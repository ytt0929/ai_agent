<template>
  <div v-if="task" class="due-task">
    <!-- 企业探查来源提示 -->
    <div v-if="task.explorationSnapshot" class="due-task__exploration-hint">
      <el-icon :size="14"><InfoFilled /></el-icon>
      <span>来自企业探查：综合评分 <strong>{{ task.explorationSnapshot.score }}</strong>，评级 <strong>{{ task.explorationSnapshot.grade }}</strong>，高风险 <strong>{{ task.explorationSnapshot.highRiskCount }}</strong> 项{{ task.explorationSnapshot.missingData?.length ? '，缺少 ' + task.explorationSnapshot.missingData.join('、') : '' }}。</span>
    </div>
    <div class="due-task__header">
      <div class="due-task__header-left">
        <el-button class="back-btn" @click="goBack" :icon="ArrowLeft" circle size="small" />
        <div class="due-task__info">
          <h2 class="due-task__name">{{ task.name }}</h2>
          <span class="due-task__meta">{{ task.industry }} · {{ task.region }} · {{ task.amount }}</span>
        </div>
      </div>
      <div class="due-task__header-right">
        <el-tag :type="getStatusTagType(task.status)" effect="light" round size="small">{{ task.status }}</el-tag>
        <span class="due-task__progress-text">{{ task.progress }}%</span>
      </div>
    </div>

    <div class="due-task__process-bar">
      <div v-for="(step, idx) in processSteps" :key="step.key" class="process-step"
           :class="{ 'process-step--done': step.done, 'process-step--active': step.active, 'process-step--pending': !step.done && !step.active }"
           @click="!step.done && (selectedStageKey = step.key)">
        <div class="process-step__node">
          <el-icon v-if="step.done" :size="14"><CircleCheck /></el-icon>
          <template v-else-if="step.active">
            <div class="process-step__pulse" />
            <el-icon :size="14" class="process-step__active-icon"><Loading /></el-icon>
          </template>
          <span v-else class="process-step__num">{{ idx + 1 }}</span>
        </div>
        <span class="process-step__label">{{ step.label }}</span>
        <div v-if="idx < processSteps.length - 1" class="process-step__connector"
             :class="{ 'process-step__connector--done': step.done, 'process-step__connector--active': step.active, 'process-step__connector--pending': !step.done && !step.active }" />
      </div>
    </div>

    <div class="due-task__body" :class="{ collapsed: chatCollapsed }">
      <main class="due-task__content">

        <!-- ═══ 工商核验 ═══ -->
        <section v-if="selectedStageKey === 'verify-business'" class="stage-panel">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon stage-panel__icon--success"><OfficeBuilding /></el-icon><span>工商核验结果</span></div>
            <el-button size="small" type="primary" plain @click="go('/enterprise-diagnosis')">查看工商信息</el-button>
          </div>
          <div class="stage-panel__summary">主体信息已核实，无工商异常，股权结构清晰。</div>
          <div class="stage-panel__info-grid">
            <div class="info-cell"><div class="info-cell__label">企业名称</div><div class="info-cell__value">{{ task.name }}</div></div>
            <div class="info-cell"><div class="info-cell__label">经营状态</div><div class="info-cell__value" style="color:var(--color-success)">存续</div></div>
            <div class="info-cell"><div class="info-cell__label">注册资本</div><div class="info-cell__value">{{ task.amount || '—' }}</div></div>
            <div class="info-cell"><div class="info-cell__label">异常项</div><div class="info-cell__value" style="color:var(--text-tertiary)">无</div></div>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- ═══ 司法查询 ═══ -->
        <section v-if="selectedStageKey === 'verify-legal'" class="stage-panel">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon stage-panel__icon--danger"><ScaleToOriginal /></el-icon><span>司法查询摘要</span></div>
            <el-button size="small" type="primary" plain @click="go('/enterprise-diagnosis')">查看司法风险</el-button>
          </div>
          <div class="stage-panel__summary">发现被执行人记录 1 条、裁判文书 2 条，建议关注高风险项。</div>
          <div class="risk-mini-list">
            <div class="risk-mini-item risk-mini-item--high"><span class="risk-mini-item__tag risk-mini-item__tag--high">高</span><span class="risk-mini-item__text">被执行人 1 条</span></div>
            <div class="risk-mini-item"><span class="risk-mini-item__tag">中</span><span class="risk-mini-item__text">裁判文书 2 条</span></div>
            <div class="risk-mini-item risk-mini-item--low"><span class="risk-mini-item__tag risk-mini-item__tag--low">低</span><span class="risk-mini-item__text">限制高消 1 条</span></div>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- ═══ 税票采集 ═══ -->
        <section v-if="selectedStageKey === 'tax-rpa'" class="stage-panel">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon stage-panel__icon--warn"><Tickets /></el-icon><span>税票采集结果</span></div>
            <el-button size="small" type="primary" plain @click="go('/tax-rpa')">查看税票采集</el-button>
          </div>
          <div class="stage-panel__summary">已采集 18 张税票，存在 2 张缺口，授权状态正常。</div>
          <div class="stage-panel__info-grid">
            <div class="info-cell"><div class="info-cell__label">已采集</div><div class="info-cell__value" style="color:var(--color-success)">18 张</div></div>
            <div class="info-cell"><div class="info-cell__label">缺口</div><div class="info-cell__value" style="color:var(--color-warning)">2 张</div></div>
            <div class="info-cell"><div class="info-cell__label">授权状态</div><div class="info-cell__value" style="color:var(--color-primary)">已授权</div></div>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- ═══ 资料补充 ═══ -->
        <section v-if="selectedStageKey === 'materials'" class="stage-panel">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon"><DocumentAdd /></el-icon><span>客户补充资料</span></div>
            <el-button size="small" type="primary" plain @click="go('/doc-recognition')">查看/补充资料</el-button>
          </div>
          <div class="stage-panel__summary">已收到 5 份资料，还有 1 项待补充。</div>
          <div class="materials-compact-list">
            <div class="materials-compact-item"><span class="materials-compact-item__icon"><el-icon :size="14"><FolderChecked /></el-icon></span><span class="materials-compact-item__name">营业执照</span><span class="materials-compact-item__status materials-compact-item__status--done">已上传</span></div>
            <div class="materials-compact-item"><span class="materials-compact-item__icon"><el-icon :size="14"><FolderChecked /></el-icon></span><span class="materials-compact-item__name">法人身份证</span><span class="materials-compact-item__status materials-compact-item__status--done">已上传</span></div>
            <div class="materials-compact-item"><span class="materials-compact-item__icon"><el-icon :size="14"><Document /></el-icon></span><span class="materials-compact-item__name">近三年纳税申报表</span><span class="materials-compact-item__status materials-compact-item__status--pending">待补</span></div>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- ═══ 证据整合 ═══ -->
        <section v-if="selectedStageKey === 'evidence'" class="stage-panel">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon"><Connection /></el-icon><span>证据包</span></div>
            <el-button size="small" type="primary" plain>查看证据</el-button>
          </div>
          <div class="stage-panel__summary">已完成证据整合，共收集 31 条有效证据，核心维度覆盖率 92%。</div>
          <div class="stage-panel__info-grid">
            <div class="info-cell"><div class="info-cell__label">证据数量</div><div class="info-cell__value">24 份</div></div>
            <div class="info-cell"><div class="info-cell__label">覆盖率</div><div class="info-cell__value" style="color:var(--color-success)">90%</div></div>
            <div class="info-cell"><div class="info-cell__label">缺口</div><div class="info-cell__value" style="color:var(--color-warning)">2 项</div></div>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- ═══ 风险诊断 ═══ -->
        <section v-if="selectedStageKey === 'risk'" class="stage-panel">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon stage-panel__icon--danger"><Warning /></el-icon><span>风险诊断摘要</span></div>
            <el-button size="small" type="primary" plain @click="go('/enterprise-diagnosis')">查看风险</el-button>
          </div>
          <div class="stage-panel__summary">已识别 8 项风险事项，其中 2 项高风险需要重点关注。</div>
          <div class="risk-mini-list">
            <div class="risk-mini-item risk-mini-item--high"><span class="risk-mini-item__tag risk-mini-item__tag--high">高</span><span class="risk-mini-item__text">实际控制人涉诉</span></div>
            <div class="risk-mini-item risk-mini-item--high"><span class="risk-mini-item__tag risk-mini-item__tag--high">高</span><span class="risk-mini-item__text">环保处罚记录</span></div>
            <div class="risk-mini-item"><span class="risk-mini-item__tag">中</span><span class="risk-mini-item__text">大额应收账款逾期</span></div>
            <div class="risk-mini-item"><span class="risk-mini-item__tag">中</span><span class="risk-mini-item__text">关联交易占比过高</span></div>
            <div class="risk-mini-item risk-mini-item--low"><span class="risk-mini-item__tag risk-mini-item__tag--low">低</span><span class="risk-mini-item__text">商标续展逾期</span></div>
            <div class="risk-mini-item risk-mini-item--low"><span class="risk-mini-item__tag risk-mini-item__tag--low">低</span><span class="risk-mini-item__text">社保缴纳基数偏低</span></div>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- ═══ 产物确认（唯一展示最终产物网格） ═══ -->
        <section v-if="selectedStageKey === 'artifacts'" class="stage-panel stage-panel--artifacts">
          <div class="stage-panel__header">
            <div class="stage-panel__title"><el-icon :size="18" class="stage-panel__icon stage-panel__icon--success"><DocumentChecked /></el-icon><span>尽调产物</span></div>
            <span class="stage-panel__hint">V2 · 3 处待确认</span>
          </div>
          <div class="stage-panel__summary">尽调产物已全部生成，报告草稿 V2 有 3 处结论待确认。</div>
          <div class="artifacts-grid">
            <div class="artifact-type-card">
              <div class="artifact-type-card__top">
                <div class="artifact-type-card__icon-wrap"><el-icon :size="18"><Files /></el-icon></div>
                <div class="artifact-type-card__info"><div class="artifact-type-card__name">证据包</div><div class="artifact-type-card__meta">已整合 24 份材料</div></div>
              </div>
              <div class="artifact-type-card__action">
                <el-button size="small" plain @click="ElMessage.info('查看证据')">
                  <el-icon><List /></el-icon> 查看证据
                </el-button>
              </div>
            </div>
            <div class="artifact-type-card">
              <div class="artifact-type-card__top">
                <div class="artifact-type-card__icon-wrap artifact-type-card__icon-wrap--warn"><el-icon :size="18"><Warning /></el-icon></div>
                <div class="artifact-type-card__info"><div class="artifact-type-card__name">风险诊断摘要</div><div class="artifact-type-card__meta">2高 2中 2低</div></div>
              </div>
              <div class="artifact-type-card__action">
                <el-button size="small" type="warning" plain @click="ElMessage.info('查看风险')">
                  <el-icon><Warning /></el-icon> 查看风险
                </el-button>
              </div>
            </div>
            <div class="artifact-type-card">
              <div class="artifact-type-card__top">
                <div class="artifact-type-card__icon-wrap artifact-type-card__icon-wrap--primary"><el-icon :size="18"><DocumentAdd /></el-icon></div>
                <div class="artifact-type-card__info"><div class="artifact-type-card__name">尽调报告草稿</div><div class="artifact-type-card__meta">V2 · 3处待确认</div></div>
              </div>
              <div class="artifact-type-card__action">
                <el-button size="small" type="primary" plain @click="go('/smart-report')">
                  <el-icon><EditPen /></el-icon> 进入报告
                </el-button>
              </div>
            </div>
            <div class="artifact-type-card">
              <div class="artifact-type-card__top">
                <div class="artifact-type-card__icon-wrap"><el-icon :size="18"><List /></el-icon></div>
                <div class="artifact-type-card__info"><div class="artifact-type-card__name">客户补充清单</div><div class="artifact-type-card__meta">待发送</div></div>
              </div>
              <div class="artifact-type-card__action">
                <el-button size="small" plain @click="ElMessage.info('查看清单')">
                  <el-icon><Download /></el-icon> 查看清单
                </el-button>
              </div>
            </div>
          </div>
          <div class="artifacts-confirm-bar">
            <span>确认后即可提交尽调结论</span>
            <el-button size="small" type="primary" @click="ElMessage.success('已确认全部')">确认全部</el-button>
          </div>
          <div v-if="activeOperation" class="operation-panel">
            <div class="operation-panel__header">
              <span class="operation-panel__badge">{{ activeOperation.badge }}</span>
              <el-icon :size="16" class="operation-panel__icon"><component :is="activeOperation.icon" /></el-icon>
              <span class="operation-panel__title">{{ activeOperation.title }}</span>
              <el-button text size="small" @click="activeOperation = null"><el-icon><Close /></el-icon></el-button>
            </div>
            <div class="operation-panel__content" v-html="activeOperation.content" />
            <div v-if="activeOperation.actions" class="operation-panel__actions">
              <el-button v-for="(a, i) in activeOperation.actions" :key="i" size="small" :type="a.type || ''" plain @click="a.handler">
                {{ a.label }}
              </el-button>
            </div>
          </div>
        </section>

      </main>

      <aside v-if="!chatCollapsed" class="due-task__chat">
        <div class="chat-collapse-bar"><el-button text size="small" @click="chatCollapsed = true"><el-icon><ArrowRight /></el-icon></el-button></div>
        <div class="chat-panel-inner">
          <DueChatPanel :step-key="selectedStageKey" :task-id="task.id" @stage-change="(k) => selectedStageKey = k" @action-trigger="handleChipAction" />
        </div>
      </aside>
      <div v-else class="due-task__chat-collapsed" @click="chatCollapsed = false">
        <span class="due-task__chat-collapsed__icon">AI</span>
        <span class="due-task__chat-collapsed__label">展开</span>
      </div>
    </div>
  </div>
  <div v-else class="due-task__empty"><el-empty description="未找到尽调任务" /></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { OfficeBuilding, ScaleToOriginal, Tickets, DocumentAdd, Connection, Warning, DocumentChecked, ArrowRight, ArrowLeft, FolderChecked, Download, EditPen, ChatLineRound, List, Files, CircleCheck, Loading, Document, Close, CopyDocument, Link, Upload, Promotion, InfoFilled } from '@element-plus/icons-vue'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import DueChatPanel from '../components/DueChatPanel.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const store = useDueDiligenceStore()

function go(path) { router.push(path) }
function goBack() { router.push('/due-diligence') }

const taskId = route.params.taskId
const task = computed(() => store.tasks.find(t => t.id === taskId))

// ── 水平流程条：7 个阶段固定顺序，根据 currentStep 计算完成状态 ──
const STAGE_ORDER = ['verify-business', 'verify-legal', 'tax-rpa', 'materials', 'evidence', 'risk', 'artifacts']

const processSteps = computed(() => {
  const t = task.value
  if (!t) return []
  const currentIdx = STAGE_ORDER.indexOf(t.currentStep)
  const isComplete = t.status === '已完成' || t.status === '报告待确认'

  const steps = [
    { key: 'verify-business', label: '工商核验', icon: OfficeBuilding },
    { key: 'verify-legal',      label: '司法查询', icon: ScaleToOriginal },
    { key: 'tax-rpa',           label: '税票采集', icon: Tickets },
    { key: 'materials',         label: '资料补充', icon: DocumentAdd },
    { key: 'evidence',          label: '证据整合', icon: Connection },
    { key: 'risk',              label: '风险诊断', icon: Warning },
    { key: 'artifacts',         label: '产物确认', icon: DocumentChecked }
  ]
  return steps.map((s, i) => {
    let done = false
    let active = false
    if (isComplete) {
      done = true
    } else if (currentIdx >= 0) {
      if (i < currentIdx) done = true
      else if (i === currentIdx) active = true
    }
    return { ...s, done, active }
  })
})

// ── 默认选中阶段：根据任务真实状态映射 ──
const _initialStageKey = computed(() => {
  const t = task.value
  if (!t) return 'verify-business'
  // 报告待确认 / 已完成 → 产物确认
  if (t.status === '报告待确认' || t.status === '已完成' || t.currentStep === 'artifacts') return 'artifacts'
  // 风险诊断中 / AI处理中 → 风险诊断
  if (t.currentStep === 'risk' || t.status?.includes('AI处理')) return 'risk'
  // 税票等待 / 采集中 → 税票采集
  if (t.currentStep === 'tax-rpa' || t.status?.includes('税票')) return 'tax-rpa'
  // 资料补充中 → 资料补充
  if (t.currentStep === 'materials' || t.status?.includes('资料')) return 'materials'
  // 证据整合中 → 证据整合
  if (t.currentStep === 'evidence') return 'evidence'
  // fallback: 第一个未完成的阶段
  const steps = processSteps.value
  const firstActive = steps.find(s => !s.done)
  return firstActive?.key || 'artifacts'
})
const selectedStageKey = ref(_initialStageKey.value)
watch(_initialStageKey, (v) => { selectedStageKey.value = v })

const chatCollapsed = ref(false)

function getStatusTagType(s) {
  if (s?.includes('等待')) return 'warning'
  if (s?.includes('处理中') || s?.includes('AI')) return ''
  if (s?.includes('报告') || s?.includes('已')) return 'success'
  return 'info'
}
// ══════════════════════════════════════════
// Chip action → visible workspace operation
// ══════════════════════════════════════════
const activeOperation = ref(null)

// Chip → 阶段映射：每个操作明确归属一个阶段
const chipStageMap = {
  '上传文件': 'materials',
  '发送补充链接': 'materials',
  '开始识别': 'materials',
  '复制授权链接': 'tax-rpa',
  '发送提醒': 'tax-rpa',
  '改为上传材料': 'tax-rpa',
  '查看证据详情': 'evidence',
  '进入风险诊断': 'risk',
  '查看风险详情': 'risk',
  '进入产物确认': 'artifacts',
  '进入智能报告': 'artifacts',
  '导出产物包': 'artifacts',
  '提交确认': 'artifacts',
}

const operationMap = {
  '上传文件': { icon: Upload, badge: '当前操作', title: '补充资料上传', content: `<div class="op-upload-area"><div class="op-upload-area__text">已打开补充资料上传入口</div><div class="op-upload-area__hint">支持上传纳税申报表、采购合同、授权书等文件</div><div class="op-upload-area__types"><span class="op-file-type">财务报表</span><span class="op-file-type">采购合同</span><span class="op-file-type">授权书</span><span class="op-file-type">纳税申报表</span></div></div>`, actions: [{ label: '选择文件', type: 'primary' }, { label: '取消' }] },
  '发送补充链接': { icon: Link, badge: 'AI 已执行', title: '补充资料链接', content: `<div class="op-link-card"><div class="op-link-card__label">已生成客户补充资料提交链接</div><div class="op-link-card__url">https://example.com/due/submit/dd003?token=a8x3k</div><div class="op-link-card__meta">有效期 7 天 · 已发送至 张经理</div></div>`, actions: [{ label: '复制链接', type: 'primary', handler: () => { ElMessage.success('链接已复制到剪贴板') } }, { label: '关闭' }] },
  '开始识别': { icon: Promotion, badge: '当前操作', title: '资料识别中', content: `<div class="op-progress-card"><div class="op-progress-card__label">正在识别已上传文件内容…</div><div class="op-progress-card__bar"><div class="op-progress-card__bar-fill" style="width:60%"></div></div><div class="op-progress-card__meta">已识别 3/5 份文件</div><div class="op-progress-card__items"><span class="op-progress-item op-progress-item--done">✓ 营业执照</span><span class="op-progress-item op-progress-item--done">✓ 法人身份证</span><span class="op-progress-item op-progress-item--done">✓ 审计报告</span><span class="op-progress-item">… 纳税申报表</span><span class="op-progress-item">… 销售合同</span></div></div>`, actions: [{ label: '查看证据详情', handler: () => { selectedStageKey.value = 'evidence'; activeOperation.value = null } }, { label: '关闭' }] },
  '复制授权链接': { icon: CopyDocument, badge: '当前操作', title: '税票授权链接', content: `<div class="op-link-card"><div class="op-link-card__label">税票采集授权链接</div><div class="op-link-card__url">https://example.com/tax/auth/dd001?code=b7m2p</div><div class="op-link-card__meta">有效期 24 小时 · 已复制</div></div>`, actions: [{ label: '发送提醒', type: 'primary' }, { label: '关闭' }] },
  '发送提醒': { icon: Promotion, badge: 'AI 已执行', title: '提醒已发送', content: `<div class="op-log-card"><div class="op-log-card__entry"><span class="op-log-card__time">18:06</span> 已向客户张经理发送授权提醒（短信 + 邮件）</div><div class="op-log-card__entry"><span class="op-log-card__time">18:06</span> 下次自动提醒：明天 09:00</div><div class="op-log-card__meta">累计提醒 2 次</div></div>`, actions: [{ label: '关闭' }] },
  '改为上传材料': { icon: Upload, badge: '操作结果', title: '已切换为手动上传模式', content: `<div class="op-notice-card op-notice-card--warn"><div class="op-notice-card__text">已取消税票 RPA 自动采集模式，切换为手动上传。</div><div class="op-notice-card__hint">后续请在"资料补充"环节上传税票文件。</div></div>`, actions: [{ label: '前往资料补充', type: 'primary', handler: () => { selectedStageKey.value = 'materials'; activeOperation.value = null } }, { label: '关闭' }] },
  '查看证据详情': { icon: List, badge: 'AI 已执行', title: '证据详情', content: `<div class="op-evidence-card"><div class="op-evidence-card__summary">共收集 31 条有效证据，覆盖以下维度：</div><div class="op-evidence-card__dims"><span class="op-dim-tag op-dim-tag--done">工商 100%</span><span class="op-dim-tag op-dim-tag--done">司法 95%</span><span class="op-dim-tag op-dim-tag--done">财务 90%</span><span class="op-dim-tag op-dim-tag--warn">税票 78%</span><span class="op-dim-tag op-dim-tag--done">合同 85%</span></div></div>`, actions: [{ label: '进入风险诊断', type: 'primary', handler: () => { selectedStageKey.value = 'risk'; activeOperation.value = null } }, { label: '关闭' }] },
  '进入风险诊断': { icon: Warning, badge: '操作结果', title: '已切换至风险诊断', content: `<div class="op-notice-card op-notice-card--info"><div class="op-notice-card__text">已跳转至风险诊断环节，正在分析 8 项风险。</div></div>`, actions: [{ label: '查看风险', type: 'primary', handler: () => { selectedStageKey.value = 'risk'; activeOperation.value = null } }, { label: '关闭' }] },
  '查看风险详情': { icon: Warning, badge: 'AI 已执行', title: '风险详情展开', content: `<div class="op-risk-detail"><div class="op-risk-entry op-risk-entry--high"><span class="op-risk-level op-risk-level--high">高</span><span class="op-risk-desc">实际控制人涉诉</span><span class="op-risk-action">建议专项说明</span></div><div class="op-risk-entry op-risk-entry--high"><span class="op-risk-level op-risk-level--high">高</span><span class="op-risk-desc">环保处罚记录</span><span class="op-risk-action">已整改</span></div><div class="op-risk-entry"><span class="op-risk-level">中</span><span class="op-risk-desc">大额应收账款逾期</span><span class="op-risk-action">持续关注</span></div><div class="op-risk-entry"><span class="op-risk-level">中</span><span class="op-risk-desc">关联交易占比过高</span><span class="op-risk-action">建议核实</span></div><div class="op-risk-entry op-risk-entry--low"><span class="op-risk-level op-risk-level--low">低</span><span class="op-risk-desc">商标续展逾期</span><span class="op-risk-action">提醒处理</span></div><div class="op-risk-entry op-risk-entry--low"><span class="op-risk-level op-risk-level--low">低</span><span class="op-risk-desc">社保缴纳基数偏低</span><span class="op-risk-action">备注说明</span></div></div>`, actions: [{ label: '进入产物确认', type: 'primary', handler: () => { selectedStageKey.value = 'artifacts'; activeOperation.value = null } }, { label: '关闭' }] },
  '进入产物确认': { icon: DocumentChecked, badge: '操作结果', title: '产物已就绪', content: `<div class="op-notice-card op-notice-card--success"><div class="op-notice-card__text">尽调产物已全部生成，报告草稿 V2 有 3 处结论待确认。</div></div>`, actions: [{ label: '查看产物', type: 'primary', handler: () => { selectedStageKey.value = 'artifacts'; activeOperation.value = null } }, { label: '关闭' }] },
  '进入智能报告': { icon: EditPen, badge: '当前操作', title: '正在跳转智能报告…', content: `<div class="op-notice-card op-notice-card--info"><div class="op-notice-card__text">即将打开尽调报告编辑器，报告草稿 V2 有 3 处待确认。</div></div>`, actions: [{ label: '确认并跳转', type: 'primary', handler: () => { go('/smart-report') } }, { label: '取消' }] },
  '导出产物包': { icon: Download, badge: '当前操作', title: '产物包导出', content: `<div class="op-export-card"><div class="op-export-card__label">尽调产物包已准备就绪</div><div class="op-export-card__items"><span class="op-export-item">✓ 证据包（31条）</span><span class="op-export-item">✓ 风险诊断摘要（8项）</span><span class="op-export-item">✓ 尽调报告草稿 V2</span><span class="op-export-item">✓ 客户补充清单</span></div></div>`, actions: [{ label: '下载产物包', type: 'primary', handler: () => { ElMessage.success('产物包已下载') } }, { label: '关闭' }] },
  '提交确认': { icon: CircleCheck, badge: '操作结果', title: '提交尽调结论', content: `<div class="op-submit-card"><div class="op-submit-card__label">确认提交尽调结论？</div><div class="op-submit-card__summary">提交后将生成正式尽调报告并发送给审批人。</div><div class="op-submit-card__meta">当前版本：V2 · 已完成 3 处确认</div></div>`, actions: [{ label: '确认提交', type: 'primary', handler: () => { ElMessage.success('尽调结论已提交') } }, { label: '取消' }] },
}

function handleChipAction(chip) {
  const op = operationMap[chip]
  if (op) {
    // 先切换到对应阶段，让操作面板锚定到该阶段内
    const targetStage = chipStageMap[chip]
    if (targetStage) selectedStageKey.value = targetStage
    activeOperation.value = { ...op }
  }
}

</script>

<style scoped>
.due-task { max-width: 1200px; margin: 0 auto; padding: var(--space-lg); }

/* ── 企业探查来源提示 ── */
.due-task__exploration-hint {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-primary);
}
.due-task__exploration-hint strong {
  color: var(--color-primary);
}

/* ── Header ── */
.due-task__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-default); }
.due-task__header-left { display: flex; align-items: center; gap: var(--space-md); }
.due-task__name { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0; }
.due-task__meta { font-size: var(--font-size-sm); color: var(--text-tertiary); }
.due-task__progress-text { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary); }

/* ── 水平流程条 ── */
.due-task__process-bar { display: flex; align-items: center; gap: 0; padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-lg); background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); }
.process-step { display: flex; align-items: center; flex: 1; justify-content: center; gap: var(--space-xs); cursor: pointer; border-radius: var(--radius-sm); padding: var(--space-xs) var(--space-sm); transition: background 0.15s; position: relative; }
.process-step:hover { background: var(--bg-page); }
.process-step__node { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: var(--font-size-xs); font-weight: 600; }
.process-step--done .process-step__node { background: var(--color-success); color: #fff; }
.process-step--active .process-step__node { background: #fff; color: var(--color-primary); border: 2px solid var(--color-primary); box-shadow: 0 0 0 3px var(--color-success-bg); }
.process-step--pending .process-step__node { background: var(--bg-page); color: var(--text-tertiary); border: 1px solid var(--border-light); }
.process-step__label { font-size: var(--font-size-xs); white-space: nowrap; }
.process-step--done .process-step__label { color: var(--text-primary); font-weight: 500; }
.process-step--active .process-step__label { color: var(--color-primary); font-weight: 600; }
.process-step--pending .process-step__label { color: var(--text-tertiary); }
.process-step--active::after { content: ''; position: absolute; bottom: -4px; left: 20%; right: 20%; height: 2px; background: var(--color-primary); border-radius: 1px; }
.process-step__connector { flex: 1; height: 2px; min-width: 12px; margin: 0 var(--space-xs); pointer-events: none; }
.process-step__connector { background: var(--border-divider); }
.process-step--done .process-step__connector { background: var(--color-success); }

/* ── 两栏 Body ── */
.due-task__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-lg);
  align-items: stretch;
  height: calc(100vh - 220px);
}
.due-task__body.collapsed {
  grid-template-columns: minmax(0, 1fr) 56px;
}

.due-task__content { min-width: 0; height: 100%; overflow-y: auto; padding-right: var(--space-xs); }

/* ── Stage Panel ── */
.stage-panel { background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--space-lg); }
.stage-panel--artifacts { background: var(--bg-page); border-color: var(--border-soft); }
.stage-panel__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); }
.stage-panel__title { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-body-lg); font-weight: 600; color: var(--text-primary); }
.stage-panel__icon { color: var(--color-primary); background: var(--bg-page); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.stage-panel__icon--success { color: var(--color-success); background: var(--color-success-bg); }
.stage-panel__icon--warn { color: #d97706; background: #fef3c7; }
.stage-panel__icon--danger { color: var(--color-danger); background: #fef2f2; }
.stage-panel__hint { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.stage-panel__summary { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-md); padding: var(--space-sm) var(--space-md); background: var(--bg-page); border-radius: var(--radius-sm); }

/* ── Info Grid ── */
.stage-panel__info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-md); }
.info-cell { background: var(--bg-page); border-radius: var(--radius-sm); padding: var(--space-md); }
.info-cell__label { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-bottom: var(--space-xs); }
.info-cell__value { font-size: var(--font-size-base); font-weight: 500; color: var(--text-primary); }

/* ── Risk Mini List ── */
.risk-mini-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.risk-mini-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: var(--bg-page); border-radius: var(--radius-sm); }
.risk-mini-item__tag { font-size: var(--font-size-xs); font-weight: 600; padding: 1px 6px; border-radius: 3px; color: #fff; background: var(--color-warning); }
.risk-mini-item__tag--high { background: var(--color-danger); }
.risk-mini-item__tag--low { background: var(--color-success); }
.risk-mini-item__text { font-size: var(--font-size-sm); color: var(--text-primary); }

/* ── Materials Compact List ── */
.materials-compact-list { display: flex; flex-direction: column; gap: var(--space-xs); }
.materials-compact-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: var(--bg-page); border-radius: var(--radius-sm); }
.materials-compact-item__icon { color: var(--text-tertiary); }
.materials-compact-item__name { flex: 1; font-size: var(--font-size-sm); color: var(--text-primary); }
.materials-compact-item__status { font-size: var(--font-size-xs); }
.materials-compact-item__status--done { color: var(--color-success); }
.materials-compact-item__status--pending { color: var(--color-warning); }

/* ── Artifacts Grid ── */
.artifacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-md); }
.artifact-type-card { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) var(--space-lg); }
.artifact-type-card__top { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.artifact-type-card__icon-wrap { width: 32px; height: 32px; border-radius: 6px; background: var(--bg-page); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-shrink: 0; }
.artifact-type-card__icon-wrap--warn { background: #fef3c7; color: #d97706; }
.artifact-type-card__icon-wrap--primary { background: #eff6ff; color: var(--color-primary); }
.artifact-type-card__info { flex: 1; min-width: 0; }
.artifact-type-card__name { font-size: var(--font-size-sm); font-weight: 500; color: var(--text-primary); }
.artifact-type-card__meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.artifact-type-card__action { display: flex; justify-content: flex-end; }

/* ── Artifacts Confirm Bar ── */
.artifacts-confirm-bar { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-lg); padding: var(--space-md) var(--space-lg); background: var(--color-success-bg); border-radius: var(--radius-sm); border: 1px solid var(--color-success); }
.artifacts-confirm-bar span { font-size: var(--font-size-sm); color: var(--text-primary); }


/* ── Process bar: active pulse ── */
.process-step__pulse { position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--color-primary); opacity: 0.4; animation: process-pulse 2s ease-in-out infinite; }
@keyframes process-pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .process-step__pulse { animation: none; opacity: 0.2; } }
.process-step__active-icon { position: relative; z-index: 1; }
.process-step__connector--done { background: var(--color-success); }
.process-step__connector--active { background: linear-gradient(to right, var(--color-primary), var(--border-light)); }
.process-step__connector--pending { background: var(--border-divider); }

/* ── Operation Panel ── */
.operation-panel { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); margin-top: var(--space-md); margin-bottom: var(--space-lg); overflow: hidden; }
.operation-panel__header { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-light); }
.operation-panel__badge { font-size: var(--font-size-xs); color: var(--color-primary); background: var(--color-primary-bg); padding: 1px 8px; border-radius: var(--radius-sm); font-weight: 500; flex-shrink: 0; }
.operation-panel__icon { color: var(--color-primary); flex-shrink: 0; }
.operation-panel__title { flex: 1; font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.operation-panel__content { padding: var(--space-md) var(--space-lg); }
.operation-panel__actions { display: flex; gap: var(--space-xs); padding: var(--space-sm) var(--space-lg); border-top: 1px solid var(--border-light); background: var(--bg-page); }

/* Operation sub-components */
.op-upload-area__text { font-size: var(--font-size-base); color: var(--text-primary); margin-bottom: var(--space-xs); }
.op-upload-area__hint { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-bottom: var(--space-md); }
.op-upload-area__types { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.op-file-type { font-size: var(--font-size-xs); padding: var(--space-xs) var(--space-sm); background: var(--bg-page); border-radius: var(--radius-sm); color: var(--text-secondary); }

.op-link-card__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--text-primary); margin-bottom: var(--space-xs); }
.op-link-card__url { font-size: var(--font-size-xs); font-family: monospace; color: var(--color-primary); background: var(--bg-page); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); margin-bottom: var(--space-xs); word-break: break-all; }
.op-link-card__meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.op-progress-card__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--text-primary); margin-bottom: var(--space-sm); }
.op-progress-card__bar { height: 6px; background: var(--bg-page); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: var(--space-xs); }
.op-progress-card__bar-fill { height: 100%; background: var(--color-primary); border-radius: var(--radius-sm); transition: width 0.5s; }
.op-progress-card__meta { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-bottom: var(--space-sm); }
.op-progress-card__items { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.op-progress-item { font-size: var(--font-size-xs); color: var(--text-secondary); }
.op-progress-item--done { color: var(--color-success); }

.op-log-card__entry { font-size: var(--font-size-sm); color: var(--text-primary); margin-bottom: var(--space-xs); }
.op-log-card__time { font-size: var(--font-size-xs); color: var(--text-tertiary); margin-right: var(--space-xs); }
.op-log-card__meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.op-notice-card { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-md); border-radius: var(--radius-sm); }
.op-notice-card--warn { background: #fef3c7; color: #92400e; }
.op-notice-card--info { background: var(--color-primary-bg); color: var(--text-primary); }
.op-notice-card--success { background: var(--color-success-bg); color: var(--color-success); }
.op-notice-card__icon { font-size: var(--font-size-base); }
.op-notice-card__text { font-size: var(--font-size-sm); }
.op-notice-card__hint { font-size: var(--font-size-xs); margin-top: var(--space-xs); }

.op-evidence-card__summary { font-size: var(--font-size-sm); color: var(--text-primary); margin-bottom: var(--space-md); }
.op-evidence-card__dims { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.op-dim-tag { font-size: var(--font-size-xs); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); }
.op-dim-tag--done { background: var(--color-success-bg); color: var(--color-success); }
.op-dim-tag--warn { background: #fef3c7; color: #d97706; }

.op-risk-detail { display: flex; flex-direction: column; gap: var(--space-xs); }
.op-risk-entry { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: var(--bg-page); border-radius: var(--radius-sm); }
.op-risk-entry--high { border-left: 3px solid var(--color-danger); }
.op-risk-entry--low { border-left: 3px solid var(--color-success); }
.op-risk-level { font-size: var(--font-size-xs); font-weight: 600; padding: 1px 6px; border-radius: 3px; color: #fff; background: var(--color-warning); }
.op-risk-level--high { background: var(--color-danger); }
.op-risk-level--low { background: var(--color-success); }
.op-risk-desc { flex: 1; font-size: var(--font-size-sm); color: var(--text-primary); }
.op-risk-action { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.op-export-card__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--text-primary); margin-bottom: var(--space-sm); }
.op-export-card__items { display: flex; flex-direction: column; gap: var(--space-xs); }
.op-export-item { font-size: var(--font-size-sm); color: var(--text-primary); }

.op-submit-card__label { font-size: var(--font-size-base); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-xs); }
.op-submit-card__summary { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-sm); }
.op-submit-card__meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }

/* ── Chat restore ── */
.chat-restore-bar { margin-bottom: var(--space-md); }

/* ── 右侧 AI 面板 — unified ── */
.due-task__chat { border: 1px solid var(--border-light); border-radius: var(--radius-md); height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.chat-panel-inner { flex: 1; overflow: hidden; }
.chat-panel-inner > .ai-assistant-panel { height: 100%; }
.chat-collapse-bar { display: flex; justify-content: flex-end; padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--border-light); }
.due-task__chat-collapsed { border: 1px solid var(--border-light); border-radius: var(--radius-md); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: var(--bg-subtle, #f8fafc); gap: 4px; }
.due-task__chat-collapsed__icon { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-bg); color: var(--color-primary); display: grid; place-items: center; font-size: 12px; font-weight: 700; }
.due-task__chat-collapsed__label { font-size: 11px; color: var(--text-tertiary); }

/* ── Empty ── */
.due-task__empty { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
</style>
