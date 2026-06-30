<template>
  <div class="brb-page">
    <div class="brb-header">
      <div>
        <h1 class="brb-title">工商风险批量扫描</h1>
        <p class="brb-subtitle">导入企业名单，批量扫描工商风险分布</p>
      </div>
      <div class="brb-header-actions">
        <el-button size="small" class="brb-mode-btn" @click="goSingle">单户查询</el-button>
        <el-button size="small" :class="['brb-mode-btn', { active: true }]">批量扫描</el-button>
      </div>
    </div>

    <!-- ═══ 名单导入 ═══ -->
    <div v-if="!store.hasBatchResults" class="brb-upload">
      <div class="brb-upload__input">
        <div class="brb-upload__label">粘贴企业名单</div>
        <textarea v-model="pasteText" class="brb-paste-area"
                  placeholder="每行一个企业名称或税号&#10;例：&#10;杭州智造装备有限公司&#10;91330100MA2KJ8X26R" />
        <div class="brb-upload__footer">
          <div class="brb-upload__hint">支持粘贴企业名称或统一社会信用代码，每行一条</div>
          <el-button size="small" plain @click="useMockData">填入示例数据</el-button>
        </div>
      </div>

      <div class="brb-upload__actions">
        <div class="brb-chips-row">
          <span class="brb-chips-label">场景：</span>
          <div v-for="t in templates" :key="t.id" class="brb-chip"
               :class="{ active: store.selectedTemplate === t.id }"
               @click="store.setTemplate(t.id)">{{ t.name }}</div>
        </div>
        <el-button type="primary" size="large" :disabled="!canStart" :loading="store.batchScanning" @click="doBatchScan">
          {{ store.batchScanning ? '扫描中...' : '开始扫描' }}
        </el-button>
      </div>
    </div>

    <!-- ═══ 扫描中 ═══ -->
    <div v-if="store.batchScanning" class="brb-scanning">
      <div class="brb-scanning__spinner"></div>
      <div class="brb-scanning__text">正在批量扫描企业工商数据...</div>
    </div>

    <!-- ═══ 结果区 ═══ -->
    <div v-if="store.hasBatchResults && !store.batchScanning" class="brb-result">
      <!-- 概览条 -->
      <div class="brb-overview">
        <span class="brb-overview__title">扫描完成 · 共 {{ batchList.length }} 家企业</span>
        <div class="brb-overview__stats">
          <span v-for="s in riskStats" :key="s.label" class="brb-stat">
            <span class="brb-stat__count" :style="{ color: s.color }">{{ s.count }}</span>
            <span class="brb-stat__label">{{ s.label }}</span>
          </span>
          <el-button v-if="abnormalCount" size="small" :type="showOnlyAbnormal ? 'primary' : ''" plain
                     @click="showOnlyAbnormal = !showOnlyAbnormal">
            {{ showOnlyAbnormal ? '显示全部' : `只看异常（${abnormalCount}家）` }}
          </el-button>
        </div>
      </div>

      <!-- 未匹配 -->
      <div v-if="store.batchUnmatched.length" class="brb-unmatched">
        <el-icon :size="14" color="var(--color-warning)"><Warning /></el-icon>
        <span>未匹配到工商数据（{{ store.batchUnmatched.length }}家）：</span>
        <span v-for="(n, i) in store.batchUnmatched" :key="i" class="brb-unmatched__name">{{ n }}</span>
      </div>

      <!-- 表格 -->
      <div class="brb-table-wrap">
        <table class="brb-table">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" class="brb-cb" :checked="allSelected" @change="toggleAll"></th>
              <th style="width:40px">#</th>
              <th>企业名称</th>
              <th style="width:120px">统一社会信用代码</th>
              <th style="width:80px">风险等级</th>
              <th style="width:180px">核心风险</th>
              <th style="width:100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in displayList" :key="i" :class="{ selected: store.selectedBatchIds.has(i) }">
              <td><input type="checkbox" class="brb-cb" :checked="store.selectedBatchIds.has(i)" @change="store.toggleBatchSelection(i)"></td>
              <td style="color:var(--text-tertiary);font-size:12px">{{ getDisplayIndex(i) + 1 }}</td>
              <td>
                <div class="brb-name">{{ e.name }}</div>
                <div v-if="e.detail" class="brb-name-sub">{{ e.detail.industry || '' }}</div>
              </td>
              <td style="font-size:11px;color:var(--text-tertiary);font-family:monospace">{{ e.creditCode }}</td>
              <td><span class="brb-risk-tag" :class="riskTagClass(e.riskLevel)">{{ riskTagLabel(e.riskLevel) }}</span></td>
              <td><span class="brb-core-risk">{{ e.coreRisk }}</span></td>
              <td>
                <el-button size="small" text type="primary" @click="viewDetail(e)">详情</el-button>
                <el-button size="small" text type="success" @click="pushDueDiligence(e)">推送</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 详情 Drawer -->
      <el-drawer v-model="detailDrawer" title="企业工商风险详情" size="480px" :with-header="false">
        <template v-if="selectedEnterprise">
          <div class="brb-drawer__header">
            <h3 class="brb-drawer__name">{{ selectedEnterprise.name }}</h3>
            <div class="brb-drawer__meta">{{ selectedEnterprise.creditCode }}</div>
            <span class="brb-risk-tag" :class="riskTagClass(selectedEnterprise.riskLevel)">{{ riskTagLabel(selectedEnterprise.riskLevel) }}</span>
          </div>
          <div class="brb-drawer__core">
            <div class="brb-drawer__label">核心风险</div>
            <div>{{ selectedEnterprise.coreRisk }}</div>
          </div>
          <div class="brb-drawer__actions">
            <el-button size="small" type="primary" @click="pushDueDiligence(selectedEnterprise); detailDrawer = false">推送至尽调</el-button>
            <el-button size="small" @click="detailDrawer = false">关闭</el-button>
          </div>
        </template>
      </el-drawer>

      <!-- 批量操作栏 -->
      <div class="brb-action-bar">
        <div class="brb-action-bar__info">
          已选择 <strong>{{ store.selectedBatchIds.size }}</strong> 家企业
        </div>
        <div class="brb-action-bar__btns">
          <el-button size="small" plain @click="selectAll"><el-icon :size="14"><Select /></el-icon> 全选异常</el-button>
          <el-button size="small" plain @click="doExport"><el-icon :size="14"><Download /></el-icon> 批量导出</el-button>
          <el-button size="small" type="primary" @click="doBatchPush"><el-icon :size="14"><DocumentChecked /></el-icon> 批量推送尽调</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Select, Download, DocumentChecked, Warning } from '@element-plus/icons-vue'
import { useBizRiskStore } from '../stores/bizRisk.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useBizRiskStore()
const pasteText = ref('')
const showOnlyAbnormal = ref(false)
const detailDrawer = ref(false)
const selectedEnterprise = ref(null)

const templates = [
  { id: 'pre-loan', name: '贷前初筛' },
  { id: 'post-loan', name: '贷后巡检' },
  { id: 'annual', name: '年审排查' },
  { id: 'custom', name: '自定义' },
]

const batchList = computed(() => store.batchEnterprises)
const canStart = computed(() => pasteText.value.trim().length > 0)

const displayList = computed(() => {
  if (!showOnlyAbnormal.value) return batchList.value
  return batchList.value.filter(e => e.riskLevel !== '正常级')
})

const abnormalCount = computed(() => batchList.value.filter(e => e.riskLevel !== '正常级').length)

const riskStats = computed(() => {
  const total = batchList.value.length
  if (!total) return []
  const normal = batchList.value.filter(e => e.riskLevel === '正常级').length
  const attention = batchList.value.filter(e => e.riskLevel === '关注级').length
  const high = batchList.value.filter(e => e.riskLevel === '高风险').length
  return [
    { label: '正常', count: normal, pct: `${Math.round(normal / total * 100)}%`, color: 'var(--color-success)' },
    { label: '关注', count: attention, pct: `${Math.round(attention / total * 100)}%`, color: 'var(--color-warning)' },
    { label: '高风险', count: high, pct: `${Math.round(high / total * 100)}%`, color: 'var(--color-danger)' },
  ]
})

const allSelected = computed(() => {
  const ids = displayList.value.map((_, i) => i)
  return ids.length > 0 && ids.every(i => store.selectedBatchIds.has(i))
})

function goSingle() { store.setMode('single'); router.push('/biz-risk') }

function useMockData() {
  pasteText.value = '杭州智造装备有限公司\n浙江恒远制造有限公司\n宁波海川精密制造有限公司\n温州精益模具有限公司\n绍兴某某贸易有限公司'
}

async function doBatchScan() {
  const lines = pasteText.value.trim().split('\n').map(l => l.trim()).filter(Boolean)
  await store.startBatchScan(lines)
}

function toggleAll() {
  if (allSelected.value) store.clearBatchSelection()
  else selectAll()
}

function selectAll() {
  store.clearBatchSelection()
  displayList.value.forEach((_, i) => store.selectedBatchIds.add(i))
}

function riskTagClass(level) {
  return { '正常级': 'brb-risk-tag--success', '关注级': 'brb-risk-tag--warning', '高风险': 'brb-risk-tag--danger' }[level] || ''
}
function riskTagLabel(level) {
  return { '正常级': '正常', '关注级': '关注', '高风险': '高风险' }[level] || level
}

function getDisplayIndex(originalIndex) {
  if (!showOnlyAbnormal.value) return originalIndex
  // Find the position in the filtered list
  const filtered = displayList.value
  const item = batchList.value[originalIndex]
  return filtered.indexOf(item)
}

function viewDetail(e) {
  selectedEnterprise.value = e
  detailDrawer.value = true
}

function pushDueDiligence(e) {
  ElMessage.success(`${e.name} 已推送到智能尽调`)
}

function doExport() { ElMessage.success('批量报告导出中...') }
function doBatchPush() {
  if (!store.selectedBatchIds.size) { ElMessage.warning('请先选择企业'); return }
  ElMessage.success(`已将 ${store.selectedBatchIds.size} 家企业推送到智能尽调`)
}
</script>

<style scoped>
.brb-page { padding: var(--space-2xl) 32px; max-width: 1200px; margin: 0 auto; }

/* ── Header ── */
.brb-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2xl); }
.brb-title { font-size: var(--font-size-page-title); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.brb-subtitle { font-size: var(--font-size-body); color: var(--text-tertiary); margin: 0; }
.brb-header-actions { display: flex; gap: var(--space-sm); }
.brb-mode-btn { font-size: var(--font-size-sm); border: 1px solid var(--border-default); background: var(--surface-card); color: var(--text-secondary); }
.brb-mode-btn.active { background: var(--color-primary-bg); border-color: var(--color-primary); color: var(--color-primary); font-weight: 500; }

/* ── Upload ── */
.brb-upload { display: flex; flex-direction: column; gap: var(--space-lg); margin-bottom: var(--space-xl); }
.brb-upload__input { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-xl); }
.brb-upload__label { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-sm); }
.brb-paste-area { width: 100%; min-height: 100px; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 14px; font-size: var(--font-size-body); font-family: inherit; resize: vertical; outline: none; }
.brb-paste-area:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.06); }
.brb-upload__footer { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-sm); }
.brb-upload__hint { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.brb-upload__actions { display: flex; justify-content: space-between; align-items: center; }
.brb-chips-row { display: flex; align-items: center; gap: var(--space-xs); }
.brb-chips-label { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.brb-chip { padding: 3px 12px; background: var(--surface-page); border: 1px solid var(--border-light); border-radius: var(--radius-full); font-size: var(--font-size-xs); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; }
.brb-chip.active { background: var(--color-primary-bg); border-color: var(--color-primary); color: var(--color-primary); font-weight: 500; }
.brb-chip:hover:not(.active) { background: var(--color-primary-bg); }

/* ── Scanning ── */
.brb-scanning { text-align: center; padding: 40px 0; }
.brb-scanning__spinner { width: 32px; height: 32px; border: 3px solid var(--border-light); border-top-color: var(--color-primary); border-radius: 50%; animation: brb-spin 0.8s linear infinite; margin: 0 auto 12px; }
@keyframes brb-spin { to { transform: rotate(360deg); } }
.brb-scanning__text { font-size: var(--font-size-body); color: var(--text-tertiary); }

/* ── Result ── */
.brb-result { }

/* 概览条 */
.brb-overview { display: flex; justify-content: space-between; align-items: center; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-lg) 20px; margin-bottom: var(--space-md); }
.brb-overview__title { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
.brb-overview__stats { display: flex; align-items: center; gap: var(--space-lg); }
.brb-stat { text-align: center; }
.brb-stat__count { font-size: var(--font-size-metric); font-weight: 700; display: block; }
.brb-stat__label { font-size: var(--font-size-xs); color: var(--text-tertiary); }

/* 未匹配 */
.brb-unmatched { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; background: var(--color-warning-bg); border: 1px solid var(--color-warning); border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); margin-bottom: var(--space-md); font-size: var(--font-size-sm); color: var(--color-warning); }
.brb-unmatched__name { font-size: var(--font-size-xs); padding: 1px 8px; background: var(--color-warning-light); border-radius: var(--radius-sm); }

/* 表格 */
.brb-table-wrap { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow: hidden; margin-bottom: var(--space-md); }
.brb-table { width: 100%; border-collapse: collapse; }
.brb-table th { padding: 11px 14px; font-size: var(--font-size-sm); font-weight: 500; color: var(--text-tertiary); text-align: left; background: var(--bg-table-header); border-bottom: 1px solid var(--border-light); }
.brb-table td { padding: var(--space-md) 14px; font-size: var(--font-size-body); color: var(--text-primary); border-bottom: 1px solid var(--border-divider); vertical-align: middle; }
.brb-table tbody tr:hover { background: var(--surface-page); }
.brb-table tbody tr.selected { background: var(--color-primary-bg); }
.brb-cb { accent-color: var(--color-primary); cursor: pointer; }
.brb-name { font-weight: 500; }
.brb-name-sub { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.brb-risk-tag { padding: 0 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 500; }
.brb-risk-tag--success { background: var(--color-success-bg); color: var(--color-success); }
.brb-risk-tag--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.brb-risk-tag--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.brb-core-risk { font-size: var(--font-size-sm); color: var(--text-secondary); }

/* Drawer */
.brb-drawer__header { padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-light); margin-bottom: var(--space-md); }
.brb-drawer__name { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-xs); }
.brb-drawer__meta { font-size: var(--font-size-xs); color: var(--text-tertiary); font-family: monospace; margin-bottom: var(--space-xs); }
.brb-drawer__core { margin-bottom: var(--space-md); }
.brb-drawer__label { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-bottom: var(--space-xs); }

/* 操作栏 */
.brb-action-bar { display: flex; justify-content: space-between; align-items: center; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md) 20px; }
.brb-action-bar__info { font-size: var(--font-size-sm); color: var(--text-secondary); }
.brb-action-bar__info strong { color: var(--color-primary); font-weight: 600; }
.brb-action-bar__btns { display: flex; gap: var(--space-sm); }
</style>
