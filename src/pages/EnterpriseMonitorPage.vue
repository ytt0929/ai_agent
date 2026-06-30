<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">企业监测</h1>
        <p class="page-subtitle">7×24小时监测企业风险，在异常发生时及时提醒</p>
      </div>
    </div>

    <!-- KPI -->
    <div class="kpi-row card-animate">
      <div class="kpi-card"><div class="kpi-value">{{ store.kpi.monitored }}</div><div class="kpi-label">监测企业</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-warning)">{{ store.kpi.todayWarnings }}</div><div class="kpi-label">今日预警</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-primary)">{{ store.kpi.unread }}</div><div class="kpi-label">未读</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">{{ store.kpi.expired }}</div><div class="kpi-label">资料过期</div></div>
    </div>

    <!-- 快速创建 -->
    <div class="create-bar card-animate" @click="store.openCreateRule()">
      <el-icon class="create-icon"><MagicStick /></el-icon>
      <span class="create-placeholder">例如：监测杭州智造装备，工商变更或税票异常时及时通知我</span>
      <el-button size="small" type="primary" class="create-btn">创建规则</el-button>
    </div>

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
            <div class="warning-meta"><span class="warning-rule">触发规则：{{ w.ruleName }}</span></div>
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
          </div>
          <div class="drawer-footer">
            <el-button size="small" type="primary" @click="ElMessage.success('已推送到智能尽调')">推送到尽调</el-button>
            <el-button size="small" plain @click="ElMessage.success('已加入重点关注')">加入重点关注</el-button>
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
import { MagicStick, ArrowLeft } from '@element-plus/icons-vue'
import { useMonitorStore } from '../stores/enterpriseMonitor.js'
import { ElMessage } from 'element-plus'
const store = useMonitorStore()
function levelLabel(l) { return { high: '红色预警', medium: '橙色预警', low: '蓝色预警' }[l] || '' }
function levelShort(l) { return { high: '🔴 高', medium: '🟡 中', low: '🟢 低' }[l] || '' }
</script>

<style scoped>
.page{padding:var(--space-2xl) 32px;max-width:1000px;margin:0 auto}
.page-header{margin-bottom:var(--space-2xl)}
.page-title{font-size:var(--font-size-page-title);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-xs)}
.page-subtitle{font-size:var(--font-size-body);color:var(--text-tertiary)}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl)}
.kpi-card{background:var(--surface-card);border-radius:var(--radius-lg);padding:var(--space-xl);border:1px solid var(--border-default);text-align:center}
.kpi-value{font-size:var(--font-size-metric);font-weight:700;color:var(--text-primary)}
.kpi-label{font-size:var(--font-size-sm);color:var(--text-tertiary);margin-top:var(--space-xs)}
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
.warning-meta{font-size:var(--font-size-caption);color:var(--text-tertiary)}
.warning-rule{color:#8b5cf6}
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
</style>
