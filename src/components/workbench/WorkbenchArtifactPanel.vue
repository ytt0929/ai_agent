<template>
  <div class="artifact-panel">
    <!-- 企业信息头 -->
    <div class="company-header">
      <div class="company-icon">🏢</div>
      <div>
        <strong>{{ customerName }}</strong>
        <span>{{ taskInfo }}</span>
      </div>
    </div>

    <!-- 按阶段渲染不同内容 -->
    <div class="stage-artifact">
      <div class="artifact-head">
        <div>
          <h3>{{ artifactTitle }}</h3>
          <p>{{ artifactSubtitle }}</p>
        </div>
      </div>
      <div class="artifact-body">

        <!-- screen: 筛客结果 -->
        <template v-if="type === 'screen'">
          <div class="stage-summary">
            <div class="stage-summary-row">
              <span>识别条件</span>
              <div class="sidebar-card__tags">
                <span v-for="(f, i) in data.filters" :key="i" class="sidebar-card__tag">{{ f }}</span>
              </div>
            </div>
            <div class="stage-summary-row">
              <span>筛选口径</span>
              <span>{{ data.summary?.matched || '—' }} 家匹配</span>
            </div>
          </div>
          <!-- 指标卡 -->
          <div class="artifact-grid" v-if="data.summary">
            <div class="mini-card"><span>匹配企业</span><strong>{{ data.summary.matched }}</strong></div>
            <div class="mini-card"><span>高风险过滤</span><strong>{{ data.summary.filtered }}</strong></div>
            <div class="mini-card"><span>适合转尽调</span><strong>{{ data.summary.recommended }}</strong></div>
            <div class="mini-card"><span>平均匹配度</span><strong>{{ data.summary.avgMatch }}</strong></div>
          </div>
          <!-- 客户表格 -->
          <div class="customer-table" v-if="data.customers">
            <table class="table">
              <thead><tr><th>企业名称</th><th>行业</th><th>地区</th><th>匹配度</th><th>风险</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="c in data.customers" :key="c.id" :class="{ highlight: c.id === data.selectedCustomer?.id }">
                  <td>{{ c.name }}</td>
                  <td>{{ c.industry }}</td>
                  <td>{{ c.region }}</td>
                  <td><strong>{{ c.match }}%</strong></td>
                  <td><span class="risk-tag" :class="`risk-${c.risk}`">{{ c.risk }}</span></td>
                  <td>
                    <button class="btn-select" v-if="!data.selectedCustomer || data.selectedCustomer?.id !== c.id" @click="emit('select-customer', c.id)">选择并发起尽调</button>
                    <span v-else class="selected-badge">✓ 已选</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- AI 推荐 -->
          <div class="recommend-card" v-if="data.selectedCustomer">
            <h4>AI 建议</h4>
            <p>建议优先对 <strong>{{ data.selectedCustomer.name }}</strong> 发起尽调，匹配度 {{ data.selectedCustomer.match }}%，风险等级低。</p>
          </div>
        </template>

        <!-- task: 尽调任务 -->
        <template v-else-if="type === 'task'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>任务来源</span><span>{{ data.source || '智能筛客' }}</span></div>
            <div class="stage-summary-row"><span>任务目标</span><span>{{ data.target || '完成尽调报告' }}</span></div>
            <div class="stage-summary-row"><span>任务编号</span><span class="text-primary">{{ data.task?.id || '—' }}</span></div>
            <div class="stage-summary-row"><span>负责人</span><span>张经理</span></div>
            <div class="stage-summary-row"><span>尽调对象</span><span>{{ data.customer?.name || '—' }}</span></div>
            <div class="stage-summary-row"><span>预计耗时</span><span>{{ data.estimatedTime || '5-7 个工作日' }}</span></div>
          </div>
        </template>

        <!-- business: 工商校验 -->
        <template v-else-if="type === 'business'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>校验范围</span><span>{{ data.scope || '—' }}</span></div>
            <div class="stage-summary-row"><span>结论摘要</span><span>{{ data.conclusion || '—' }}</span></div>
            <div class="stage-summary-row"><span>主体状态</span><span>{{ data.entityStatus || '—' }}</span></div>
            <div class="stage-summary-row"><span>司法风险</span><span>{{ data.judicialRisk || '—' }}</span></div>
            <div class="stage-summary-row"><span>关联企业</span><span>{{ data.relatedCompanies || '—' }}</span></div>
            <div class="stage-summary-row"><span>证据入库</span><span>{{ data.evidenceStored ? '✅ 已入库' : '❌ 未入库' }}</span></div>
          </div>
        </template>

        <!-- tax: 税票采集 -->
        <template v-else-if="type === 'tax'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>采集链路</span><span>{{ data.chain || '—' }}</span></div>
            <div class="stage-summary-row"><span>当前状态</span><span>{{ data.status || '—' }}</span></div>
            <div class="stage-summary-row"><span>授权状态</span><span>{{ data.authStatus || '未授权' }}</span></div>
            <div class="stage-summary-row"><span>链接状态</span><span>{{ data.linkStatus || '—' }}</span></div>
            <div class="stage-summary-row"><span>联系人</span><span>{{ data.contactName || '—' }}</span></div>
            <div class="stage-summary-row"><span>手机号</span><span>{{ data.contactPhone || '—' }}</span></div>
            <div class="stage-summary-row"><span>授权链接</span><span class="text-primary">{{ data.authLink || '—' }}</span></div>
            <div class="stage-summary-row"><span>下一步</span><span>{{ data.nextAction || '—' }}</span></div>
          </div>
          <div class="artifact-grid">
            <div class="mini-card"><span>进项发票</span><strong>{{ data.input?.count || 0 }}/{{ data.input?.total || 0 }}{{ data.input?.unit || '' }}</strong></div>
            <div class="mini-card"><span>销项发票</span><strong>{{ data.output?.count || 0 }}/{{ data.output?.total || 0 }}{{ data.output?.unit || '' }}</strong></div>
            <div class="mini-card"><span>纳税申报</span><strong>{{ data.filing?.status || '未采集' }}</strong></div>
          </div>
          <div class="auto-log" v-if="data.autoLog">
            <div v-for="(log, i) in data.autoLog" :key="i" class="log-item">
              <time>{{ log.time }}</time>
              <span>{{ log.desc }}</span>
              <span class="log-status" :class="`log-status--${log.status}`">{{ logStatusText(log.status) }}</span>
            </div>
          </div>
          <!-- 等待用户确认发送采集链接 -->
          <div class="tax-action-bar" v-if="currentFlowStatus === 'waiting_confirmation' && data.linkStatus === '未发送'">
            <button class="btn-tax-confirm" @click="emit('confirm-tax-send')">
              ✓ 确认发送采集链接
            </button>
            <button class="btn-tax-defer" @click="emit('defer-tax-send')">
              稍后处理
            </button>
          </div>
          <!-- 等待企业授权时显示按钮 -->
          <div class="tax-action-bar" v-else-if="currentFlowStatus === 'waiting_tax_authorization'">
            <button class="btn-tax-authorized" @click="emit('tax-authorized')">
              ✓ 模拟企业已授权，继续采集
            </button>
          </div>
        </template>

        <!-- upload: 资料上传 -->
        <template v-else-if="type === 'upload'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>资料目标</span><span>{{ data.target || '—' }}</span></div>
            <div class="stage-summary-row"><span>识别策略</span><span>{{ data.strategy || '—' }}</span></div>
          </div>
          <div class="upload-section">
            <h4>必传资料</h4>
            <div v-for="(doc, i) in (data.required || [])" :key="i" class="doc-item">
              <span class="doc-dot doc-dot--required"></span>
              <span>{{ doc }}</span>
              <span class="doc-status">待上传</span>
            </div>
          </div>
          <div class="upload-section">
            <h4>可选资料</h4>
            <div v-for="(doc, i) in (data.optional || [])" :key="i" class="doc-item doc-item--optional">
              <span class="doc-dot doc-dot--optional"></span>
              <span>{{ doc }}</span>
            </div>
          </div>
          <div class="upload-section" v-if="data.pendingFields">
            <h4>待识别字段</h4>
            <div class="chips">
              <span v-for="(f, i) in data.pendingFields" :key="i" class="chip">{{ f }}</span>
            </div>
          </div>
        </template>

        <!-- analysis: AI分析 -->
        <template v-else-if="type === 'analysis'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>分析输入</span><span>{{ data.input || '—' }}</span></div>
            <div class="stage-summary-row"><span>分析目标</span><span>{{ data.goal || '—' }}</span></div>
          </div>
          <div class="artifact-grid">
            <div class="mini-card"><span>风险评分</span><strong>{{ data.riskScore || '—' }}</strong></div>
            <div class="mini-card"><span>异常解释</span><strong>{{ data.anomalies?.length || 0 }} 项</strong></div>
          </div>
          <div class="next-card" v-if="data.suggestion">
            <strong>建议结论</strong><br>{{ data.suggestion }}
          </div>
        </template>

        <!-- report: 报告确认 -->
        <template v-else-if="type === 'report'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>报告类型</span><span>{{ data.reportType || '—' }}</span></div>
            <div class="stage-summary-row"><span>证据引用</span><span>{{ data.evidence || '—' }}</span></div>
            <div class="stage-summary-row"><span>确认人</span><span>{{ data.confirmer || '—' }}</span></div>
          </div>
          <div class="next-card" v-if="data.pendingItems?.length">
            <strong>待确认项</strong>
            <div v-for="(item, i) in data.pendingItems" :key="i">• {{ item }}</div>
          </div>
          <div class="recommend-card" v-if="data.suggestion">
            <h4>报告建议</h4>
            <p>{{ data.suggestion }}</p>
          </div>
        </template>

        <!-- monitor: 企业监控 -->
        <template v-else-if="type === 'monitor'">
          <div class="stage-summary">
            <div class="stage-summary-row"><span>监控规则</span><span>{{ (data.rules || []).join(' / ') }}</span></div>
            <div class="stage-summary-row"><span>监控维度</span><span>{{ (data.dimensions || []).join(' / ') }}</span></div>
            <div class="stage-summary-row"><span>启用状态</span><span>{{ data.enabled ? '✅ 监控中' : '❌ 未启用' }}</span></div>
          </div>
          <div class="monitor-badge" v-if="data.enabled">
            <span class="monitor-dot"></span> 监控中
          </div>
          <div class="monitor-warnings" v-if="data.warnings?.length">
            <h4>⚠️ 模拟预警</h4>
            <div v-for="w in data.warnings" :key="w.time" class="monitor-warning-item" :class="`level--${w.level}`">
              <div class="monitor-warning-item__time">{{ w.time }}</div>
              <div class="monitor-warning-item__content">{{ w.content }}</div>
            </div>
          </div>
        </template>

        <!-- fallback -->
        <template v-else>
          <p style="color:#93a1b5;font-size:13px;">该阶段产物暂未实现</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: null },
  data: { type: Object, default: () => ({}) },
  currentFlowStatus: { type: String, default: null },
})
const emit = defineEmits(['select-customer', 'tax-authorized', 'confirm-tax-send', 'defer-tax-send'])

const customerName = computed(() => {
  return props.data?.customer?.name || props.data?.selectedCustomer?.name || '当前企业'
})

const taskInfo = computed(() => {
  if (props.data?.task?.id) return `尽调任务 · ${props.data.task.id}`
  return 'AI 尽调助手'
})

const artifactTitle = computed(() => {
  const titles = {
    screen: '筛客结果 · 已完成',
    task: '尽调任务 · 已创建',
    business: '工商校验 · 已完成',
    tax: '税票采集 · 进行中',
    upload: '资料上传 · 待上传',
    analysis: 'AI分析 · 已完成',
    report: '报告确认 · 待确认',
    monitor: '企业监控 · 监控中',
  }
  return titles[props.type] || '阶段产物'
})

const artifactSubtitle = computed(() => {
  const subs = {
    screen: '已识别筛客条件并完成推荐',
    task: '已创建尽调任务，AI 将自动推进',
    business: '工商校验完成，未发现重大异常',
    tax: '已生成授权链接，等待企业授权',
    upload: '已初始化识别策略，等待上传',
    analysis: '分析完成，已生成风险结论',
    report: '报告已生成，等待确认',
    monitor: '监控规则已启用，持续追踪中',
  }
  return subs[props.type] || ''
})

function logStatusText(s) {
  return { done: '✅', waiting: '⏳', running: '🔄' }[s] || ''
}
</script>

<style scoped>
.artifact-panel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #fbfdff;
}

.company-header {
  display: flex; gap: 10px; align-items: center;
  margin-bottom: 14px;
}

.company-icon {
  width: 38px; height: 38px; border-radius: 9px;
  display: grid; place-items: center;
  color: #2168f3; background: #eaf2ff;
  font-weight: 900; font-size: 18px;
}

.company-header strong { display: block; font-size: 14px; color: #10213f; }
.company-header span { display: block; margin-top: 3px; color: #66758e; font-size: 12px; }

/* Stage artifact card */
.stage-artifact {
  border: 1px solid #dfe8f5;
  border-radius: 8px;
  background: #f8fbff;
  overflow: hidden;
}

.artifact-head {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 13px; border-bottom: 1px solid #dfe8f5;
  background: #fff;
}

.artifact-head h3 { margin: 0 0 4px; font-size: 15px; color: #10213f; }
.artifact-head p { margin: 0; color: #66758e; font-size: 12px; }

.artifact-body { padding: 13px; }

/* Summary rows */
.stage-summary { display: grid; gap: 8px; margin-bottom: 12px; }

.stage-summary-row {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 10px;
  align-items: start;
  padding: 10px 11px;
  border: 1px solid #edf3fa;
  border-radius: 7px;
  background: #fff;
  font-size: 13px;
}

.stage-summary-row > span:first-child { color: #66758e; font-weight: 800; }

.text-primary { color: #2168f3; font-weight: 700; }

.sidebar-card__tags { display: flex; flex-wrap: wrap; gap: 4px; }
.sidebar-card__tag {
  background: #eef4fb; color: #43536d;
  padding: 2px 8px; border-radius: 999px;
  font-size: 12px; font-weight: 700;
}

/* Artifact grid */
.artifact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.mini-card {
  padding: 10px;
  border: 1px solid #edf3fa;
  border-radius: 7px;
  background: #fff;
}

.mini-card span { display: block; color: #66758e; font-size: 12px; }
.mini-card strong { display: block; margin-top: 5px; font-size: 15px; color: #10213f; }

/* Table */
.table {
  width: 100%; border-collapse: collapse;
  border-radius: 8px; overflow: hidden;
  background: #fff; border: 1px solid #dfe8f5;
  font-size: 12px;
}

.table th { padding: 8px 10px; background: #f7faff; color: #66758e; font-weight: 700; text-align: left; }
.table td { padding: 8px 10px; border-top: 1px solid #edf3fa; color: #10213f; }
.table tr.highlight td { background: #eef6ff; }

.risk-tag {
  display: inline-block; padding: 2px 6px;
  border-radius: 4px; font-size: 11px; font-weight: 700;
}
.risk-低 { color: #18a66a; background: #eaf8f2; }
.risk-中 { color: #d98712; background: #fff5e4; }
.risk-高 { color: #dc4c49; background: #fef2f2; }

/* Recommend card */
.recommend-card {
  margin-top: 12px; padding: 12px;
  border: 1px solid #c9ecd9; border-radius: 8px;
  background: #eaf8f2;
}

.recommend-card h4 { margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #18a66a; }
.recommend-card p { margin: 0; color: #365241; font-size: 13px; line-height: 1.7; }

/* Auto log */
.auto-log { display: grid; gap: 8px; margin-top: 12px; }

.log-item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 10px; align-items: center;
  padding: 9px 10px;
  border: 1px solid #edf3fa;
  border-radius: 7px; background: #fff;
  font-size: 13px;
}

.log-item time { color: #93a1b5; font-size: 12px; font-weight: 800; }

/* Upload */
.upload-section { margin-bottom: 12px; }
.upload-section h4 { margin: 0 0 8px; font-size: 13px; color: #10213f; }

.doc-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0; font-size: 13px; color: #33425b;
}

.doc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.doc-dot--required { background: #2168f3; }
.doc-dot--optional { background: #edf3fa; }
.doc-status { margin-left: auto; color: #93a1b5; font-size: 12px; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  padding: 5px 9px; border-radius: 999px;
  color: #43536d; background: #eef4fb;
  font-size: 12px; font-weight: 700;
}

/* Next card */
.next-card {
  margin-top: 14px; padding: 13px;
  border-radius: 8px;
  color: #4d3a10; background: #fff5e4;
  border: 1px solid #f5d8a3;
  font-size: 13px; line-height: 1.6;
}

/* Monitor */
.monitor-badge {
  display: flex; align-items: center; gap: 6px;
  margin: 12px 0; padding: 8px 12px;
  border-radius: 8px; background: #eaf8f2;
  color: #18a66a; font-weight: 700; font-size: 13px;
}

.monitor-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #18a66a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}

.monitor-warnings { margin-top: 16px; }
.monitor-warnings h4 { margin: 0 0 8px; font-size: 13px; color: #10213f; }

.monitor-warning-item {
  padding: 8px 10px; border-radius: 6px; margin-bottom: 6px;
  background: #f8fafc; border: 1px solid #e5e7eb;
}

.level--warning { background: #fff5e4; border-color: #f5d8a3; }
.level--danger { background: #fef2f2; border-color: #fecaca; }

.monitor-warning-item__time { font-size: 11px; color: #93a1b5; margin-bottom: 2px; }
.monitor-warning-item__content { font-size: 12px; color: #33425b; }
.btn-select {
  padding: 4px 10px; border: none; border-radius: 6px;
  background: #2168f3; color: #fff; font-size: 11px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
}
.btn-select:hover { background: #1a56d4; }
.selected-badge {
  padding: 4px 10px; border-radius: 6px;
  background: #18a66a; color: #fff; font-size: 11px; font-weight: 700;
  white-space: nowrap;
}

/* Tax action bar */
.tax-action-bar {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #eef4ff, #e8f5e9);
  border: 1px solid #d0e0f8;
  display: flex;
  justify-content: center;
}

.btn-tax-authorized {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #18a66a, #10b981);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(24, 166, 106, 0.25);
}

.btn-tax-authorized:hover {
  background: linear-gradient(135deg, #15935e, #0d9972);
  box-shadow: 0 6px 16px rgba(24, 166, 106, 0.35);
  transform: translateY(-1px);
}

.btn-tax-authorized:active {
  transform: translateY(0);
}

.btn-tax-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #2168f3, #3b82f6);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(33, 104, 243, 0.25);
}

.btn-tax-confirm:hover {
  background: linear-gradient(135deg, #164fca, #2563eb);
  box-shadow: 0 6px 16px rgba(33, 104, 243, 0.35);
  transform: translateY(-1px);
}

.btn-tax-defer {
  padding: 10px 20px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--surface-card);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tax-defer:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.tax-action-bar {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

</style>
