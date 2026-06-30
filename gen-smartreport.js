const fs = require('fs');
const path = require('path');

const content = `<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">智能报告</h1>
      <p class="page-subtitle">AI 驱动的文档工作台</p>
    </div>

    <!-- ===== 列表页 ===== -->
    <div v-if="view === 'list'" class="card-animate">
      <div class="create-entry" @click="startCreate()">
        <div class="create-icon">✨</div>
        <div>
          <div class="create-title">新建报告</div>
          <div class="create-desc">选择模板和数据源，AI 自动生成初稿</div>
        </div>
      </div>

      <div class="history-title">最近报告</div>

      <div v-if="reportList.length === 0" class="empty-hint">
        暂无可生成的报告，请先推进尽调或诊断任务至 80% 以上。
      </div>

      <div
        v-for="(item, idx) in reportList"
        :key="item.id"
        class="report-card"
        @click="openReport(idx)"
      >
        <div class="rc-icon">{{ item.tpl === 'due' ? '📋' : item.tpl === 'diag' ? '🔍' : '🌐' }}</div>
        <div>
          <div class="rc-name">{{ item.name }}</div>
          <div class="rc-meta">
            <span class="rc-tag" :class="item.status === 'completed' ? 'done' : 'draft'">
              {{ item.status === 'completed' ? '已完成' : '草稿' }}
            </span>
            <span class="rc-time">{{ item.createdAt }}</span>
            <span class="rc-credit">{{ item.creditCode }}</span>
            <span class="rc-progress">进度 {{ item.progress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 创建页 ===== -->
    <div v-if="view === 'create' && !creating" class="card-animate">
      <div class="step-bar">
        <el-icon class="back" @click="view='list'"><ArrowLeft /></el-icon>
        <span class="step-t">新建报告</span>
      </div>

      <div class="fg">
        <label class="fl">选择报告模板</label>
        <div class="tpl-row">
          <div class="tpl-card" :class="{ on: tpl==='due' }" @click="tpl='due'">
            <div class="tpl-i">📋</div><div class="tpl-n">尽调报告</div><div class="tpl-d">基于尽调资料生成标准尽调报告</div>
          </div>
          <div class="tpl-card" :class="{ on: tpl==='diag' }" @click="tpl='diag'">
            <div class="tpl-i">🔍</div><div class="tpl-n">诊断报告</div><div class="tpl-d">基于企业诊断结果生成诊断摘要</div>
          </div>
          <div class="tpl-card" :class="{ on: tpl==='pan' }" @click="tpl='pan'">
            <div class="tpl-i">🌐</div><div class="tpl-n">全景报告</div><div class="tpl-d">汇总企业多维度数据生成全景视图</div>
          </div>
        </div>
      </div>

      <div class="fg" v-if="tpl">
        <label class="fl">选择企业</label>
        <div class="ent-w">
          <input
            v-model="entText"
            class="ent-in"
            placeholder="输入企业名称或信用代码"
            @input="onEntInput()"
            @focus="showEntDrop = true"
            @blur="hideEntDrop()"
          />
          <div v-if="showEntDrop && entList.length" class="ent-drop">
            <div v-for="e in entList" :key="e.c" class="ent-opt" @mousedown="pickEnt(e)">
              <span>{{ e.n }}</span><span class="ent-oc">{{ e.c }}</span>
            </div>
          </div>
        </div>
        <div v-if="ent" class="ent-ok"><span style="color:#10b981">✓ 已选择：{{ ent.n }}</span></div>
      </div>

      <div class="fg" v-if="ent">
        <label class="fl">选择数据源</label>
        <div class="ds-row">
          <div v-for="ds in dsItems" :key="ds.id" class="ds-card" :class="{ on: dsOn.includes(ds.id) }" @click="toggleDs(ds.id)">
            <div class="ds-n">{{ ds.name }}</div>
            <div class="ds-s" :class="ds.st">{{ ds.st === 'ready' ? '可用' : '部分可用' }}</div>
          </div>
        </div>
      </div>

      <div v-if="tpl && ent" class="gen-wrap">
        <el-button type="primary" size="large" :disabled="dsOn.length===0" @click="doGen()">
          生成报告（{{ dsOn.length }} 个数据源）
        </el-button>
      </div>
    </div>

    <!-- ===== 生成中 ===== -->
    <div v-if="view === 'create' && creating" class="card-animate">
      <div class="gen-box">
        <div class="gen-spin"></div>
        <div class="gen-t">正在生成报告...</div>
        <div class="gen-steps">
          <div class="gs done">✓ 读取数据源</div>
          <div class="gs done">✓ 分析数据结构</div>
          <div class="gs active">⟳ 生成报告内容</div>
          <div class="gs">○ 排版与格式化</div>
        </div>
      </div>
    </div>

    <!-- ===== 编辑器 ===== -->
    <div v-if="view === 'editor'" class="card-animate">
      <div class="ed-top">
        <el-icon class="back" @click="view='list'"><ArrowLeft /></el-icon>
        <div class="ed-t">{{ rptName }}</div>
        <div class="ed-btns">
          <el-button size="small" type="primary" @click="elMsg('已导出 Word')">导出 Word</el-button>
        </div>
      </div>
      <div class="ed-body">
        <div class="ed-left">
          <div v-for="(sec, idx) in secs" :key="sec.id" class="sec-card">
            <div class="sec-head">
              <div class="sec-num">{{ idx + 1 }}</div>
              <div class="sec-title">{{ sec.title }}</div>
              <el-icon class="sec-edit" @click="doEdit(sec.id)"><Edit /></el-icon>
            </div>
            <textarea v-if="editId === sec.id" v-model="editText" class="sec-ta" rows="6"></textarea>
            <div v-else class="sec-body" @dblclick="doEdit(sec.id)">{{ sec.text }}</div>
            <div v-if="editId === sec.id" class="sec-act">
              <el-button size="small" @click="editId=''">取消</el-button>
              <el-button size="small" type="primary" @click="doSave()">保存</el-button>
            </div>
          </div>
        </div>
        <div class="ed-right">
          <div class="ch-head">对话式修改</div>
          <div class="ch-msgs">
            <div v-for="(m, i) in msgs" :key="i" class="ch-m" :class="m.role">
              <span class="ch-av">{{ m.role === 'ai' ? '🤖' : '👤' }}</span>
              <div class="ch-bubble" v-html="md(m.text)"></div>
            </div>
            <div v-if="chBusy" class="ch-m ai">
              <span class="ch-av">🤖</span>
              <div class="ch-bubble ch-think">思考中...</div>
            </div>
          </div>
          <div class="ch-input-row">
            <input v-model="chText" class="ch-input" placeholder="说你想怎么改..." @keyup.enter="doSend()" />
            <el-button size="small" type="primary" :disabled="!chText || chBusy" @click="doSend()">发送</el-button>
          </div>
          <div class="ch-quick">
            <span class="ch-ql">快捷：</span>
            <span v-for="q in quicks" :key="q" class="ch-q" @click="quickCmd(q)">{{ q }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { useDiagnosisStore } from '../stores/enterpriseDiagnosis.js'
import { enterpriseDB } from '../data/mockEnterpriseDiagnosis.js'
import { riskItems, artifactsList } from '../data/mockDueDiligence.js'
import { getDiagnosisMock } from '../data/mockEnterpriseDiagnosis.js'

const dueDiligenceStore = useDueDiligenceStore()
const diagnosisStore = useDiagnosisStore()

const view = ref('list')
const tpl = ref('')
const ent = ref(null)
const entText = ref('')
const entList = ref([])
const showEntDrop = ref(false)
const dsOn = ref([])
const creating = ref(false)
const rptName = ref('')
const secs = ref([])
const editId = ref('')
const editText = ref('')
const msgs = ref([])
const chText = ref('')
const chBusy = ref(false)

const dsItems = [
  { id: 'biz', name: '工商查询', st: 'ready' },
  { id: 'due', name: '尽调资料', st: 'ready' },
  { id: 'diag', name: '企业诊断', st: 'ready' },
  { id: 'mon', name: '企业监测', st: 'ready' },
  { id: 'tax', name: '税票数据', st: 'partial' },
]

const quicks = ['展开风险分析', '语气正式一点', '加税票数据', '总结一下', '证据链交叉比对', '导出Word']

// ====== 1. 报告列表 — 从 DueDiligenceStore + 诊断数据动态生成 ======

const dueReportList = computed(() => {
  return dueDiligenceStore.tasks
    .filter(t => t.progress >= 80)
    .map((t, idx) => {
      const day = String(28 - idx).padStart(2, '0')
      return {
        id: t.id,
        name: t.name + ' - 尽调报告' + (t.status && t.status.includes('待确认') ? '' : '（草稿）'),
        status: t.status && t.status.includes('待确认') ? 'completed' : 'draft',
        progress: t.progress,
        createdAt: '2026-06-' + day + ' 14:30',
        type: '尽调报告',
        tpl: 'due',
        creditCode: t.creditCode || '—',
      }
    })
})

const diagReportList = computed(() => {
  const diagnosed = diagnosisStore.diagnosisHistory || []
  return diagnosed.map((d, idx) => {
    const day = String(27 - idx).padStart(2, '0')
    return {
      id: 'DIAG_' + d.enterprise,
      name: d.enterprise + ' - 诊断报告',
      status: 'completed',
      progress: 100,
      createdAt: '2026-06-' + day + ' ' + String(10 + idx).padStart(2, '0') + ':15',
      type: '诊断报告',
      tpl: 'diag',
      creditCode: (enterpriseDB.find(e => e.name === d.enterprise) || {}).creditCode || '—',
    }
  })
})

const reportList = computed(() => {
  const combined = dueReportList.value.concat(diagReportList.value)
  return combined.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

// ====== 2. 企业选择 — 融合 DueDiligenceStore 和 EnterpriseDB ======

const enterprisePool = computed(() => {
  const map = {}
  dueDiligenceStore.tasks.forEach(t => {
    if (t.name && t.creditCode) {
      map[t.creditCode] = { n: t.name, c: t.creditCode }
    }
  })
  enterpriseDB.forEach(e => {
    if (!map[e.creditCode]) {
      map[e.creditCode] = { n: e.name, c: e.creditCode }
    }
  })
  return Object.keys(map).map(k => map[k])
})

function onEntInput() {
  const t = entText.value.trim()
  if (t.length >= 1) {
    entList.value = enterprisePool.value.filter(e => e.n.indexOf(t) >= 0 || e.c.indexOf(t) >= 0)
  } else {
    entList.value = []
  }
}

function pickEnt(e) {
  ent.value = e
  entText.value = e.n
  entList.value = []
  showEntDrop.value = false
}

function hideEntDrop() {
  setTimeout(() => { showEntDrop.value = false }, 200)
}

function startCreate() {
  view.value = 'create'
  tpl.value = ''
  ent.value = null
  entText.value = ''
  entList.value = []
  dsOn.value = []
}

function toggleDs(id) {
  const i = dsOn.value.indexOf(id)
  if (i >= 0) dsOn.value.splice(i, 1)
  else dsOn.value.push(id)
}

// ====== 3 & 5. 生成报告 + 构建章节 ======

function buildDueSections(entName, creditCode) {
  const task = dueDiligenceStore.tasks.find(t => t.name === entName || t.creditCode === creditCode)
  const taskProgress = task ? task.progress : 0
  const taskStatus = task ? task.status : '未知'
  const highRisks = riskItems.filter(r => r.level === 'high')
  const medRisks = riskItems.filter(r => r.level === 'medium')
  const lowRisks = riskItems.filter(r => r.level === 'low')

  return [
    {
      id: 'dd_overview',
      title: '一、企业概况',
      text: entName + '\\n信用代码：' + (creditCode || '未披露') + '\\n行业：' + (task ? task.industry : '—') + '\\n地区：' + (task ? task.region : '—') + '\\n授信金额：' + (task ? task.amount : '—') + '\\n客户经理：' + (task ? task.manager : '—') + '\\n\\n该企业基本信息已完成主体核验，工商登记状态存续，法定代表人为张XX，注册资本5000万元。尽调任务当前进度 ' + taskProgress + '%，状态：' + taskStatus + '。',
    },
    {
      id: 'dd_verify',
      title: '二、主体核验',
      text: '工商基础信息已核验：\\n• 企业工商登记状态：存续 ✅\\n• 统一社会信用代码：' + (creditCode || '未披露') + '\\n• 法定代表人：张XX\\n• 注册资本：5000万元\\n• 成立日期：2015年\\n\\n股权穿透图已生成，最大股东为杭州XX控股（持股45%），董监高信息已采集完毕。',
    },
    {
      id: 'dd_tax',
      title: '三、税票数据',
      text: '税票数据获取情况：\\n\\n销项发票近4个月趋势：\\n• 3月：1950万元\\n• 4月：2000万元\\n• 5月：1200万元（环比下降40%）⚠️\\n• 6月：760万元（环比下降62%）⚠️⚠️\\n\\n进项发票同步下降45%，上下游同时萎缩。\\n行业均值下降15%，该企业远超行业波动范围。\\n\\n注意：2024年税票因客户授权缺失，数据存在缺口，仅覆盖2025年数据。',
    },
    {
      id: 'dd_materials',
      title: '四、资料补充',
      text: '已收到资料（5份）：\\n• 2025年度审计报告.pdf（2.3MB）✅ 已识别\\n• 营业执照.pdf（1.1MB）✅ 已识别\\n• 法人身份证.jpg（856KB）✅ 已识别\\n• 近三年纳税申报表.xlsx（1.8MB）✅ 已识别\\n• 主要销售合同.pdf（3.2MB）✅ 已识别\\n\\n待补充（3项）：\\n• 财务报表附注\\n• 主要采购合同\\n• 征信授权书（待客户签署）',
    },
    {
      id: 'dd_evidence',
      title: '五、证据整合',
      text: '证据包统计：\\n• 工商数据：31条有效证据 ✅\\n• 税票数据：18条有效证据（覆盖率78%）⚠️\\n• 合同数据：12条有效证据 ✅\\n• 财务数据：24条有效证据 ✅\\n\\n核心维度覆盖率92%，税票维度因授权缺口仅覆盖78%。\\n交叉比对发现3处差异，已在风险章节标注。',
    },
    {
      id: 'dd_risk',
      title: '六、风险诊断',
      text: '共识别 ' + riskItems.length + ' 项风险：\\n\\n【高风险 ' + highRisks.length + ' 项】\\n' + highRisks.map(r => '• ' + r.title + '：' + r.desc).join('\\n') + '\\n\\n【中风险 ' + medRisks.length + ' 项】\\n' + medRisks.map(r => '• ' + r.title + '：' + r.desc).join('\\n') + '\\n\\n【低风险 ' + lowRisks.length + ' 项】\\n' + lowRisks.map(r => '• ' + r.title + '：' + r.desc).join('\\n'),
    },
    {
      id: 'dd_artifacts',
      title: '七、产物确认',
      text: '尽调产物清单（' + artifactsList.length + ' 项）：\\n' + artifactsList.map(a => '• ' + a.name + '：' + a.status + '（' + a.count + '）').join('\\n') + '\\n\\n报告草稿 V2 有 ' + ((artifactsList.find(a => a.name === '尽调报告草稿') || {}).count || '3处') + ' 待确认，确认后即可提交审批流程。\\n\\n所有产物已归档，等待最终确认。',
    },
  ]
}

function buildDiagSections(entName, creditCode) {
  const result = getDiagnosisMock(creditCode)
  if (!result) {
    return [
      { id: 'dg_score', title: '一、综合评分', text: entName + '\\n暂无诊断数据，请先完成企业诊断。' },
      { id: 'dg_judicial', title: '二、司法风险', text: '暂无数据。' },
      { id: 'dg_tax', title: '三、税票数据', text: '暂无数据。' },
      { id: 'dg_biz', title: '四、工商变更', text: '暂无数据。' },
      { id: 'dg_operation', title: '五、经营指标', text: '暂无数据。' },
      { id: 'dg_public', title: '六、舆情信息', text: '暂无数据。' },
    ]
  }

  const riskLabels = { high: '红色预警', medium: '橙色关注', low: '蓝色正常' }

  return [
    {
      id: 'dg_score',
      title: '一、综合评分',
      text: entName + '\\n风险评分：' + result.score + '/100\\n风险等级：' + (riskLabels[result.riskLevel] || result.riskLevel) + '\\n\\n综合结论：' + result.summary,
    },
    {
      id: 'dg_judicial',
      title: '二、司法风险',
      text: (() => {
        const dim = result.dimensions.find(d => d.key === 'judicial')
        if (!dim) return '暂无司法风险数据。'
        return dim.title + '\\n' + dim.items.map(i => '• ' + i.text).join('\\n')
      })(),
    },
    {
      id: 'dg_tax',
      title: '三、税票数据',
      text: (() => {
        const dim = result.dimensions.find(d => d.key === 'tax')
        if (!dim) return '暂无税票数据。'
        let t = dim.title + '\\n' + dim.items.map(i => '• ' + i.text).join('\\n')
        if (dim.trendData && dim.trendData.length) {
          t += '\\n\\n近4个月趋势：\\n' + dim.trendData.map(td => '• ' + td.month + '：' + td.value + '万元' + (td.abnormal ? ' ⚠️异常' : '')).join('\\n')
          t += '\\n行业均值：' + (dim.industryAvg || '—')
        }
        return t
      })(),
    },
    {
      id: 'dg_biz',
      title: '四、工商变更',
      text: (() => {
        const dim = result.dimensions.find(d => d.key === 'biz')
        if (!dim) return '暂无工商变更数据。'
        return dim.title + '\\n' + dim.items.map(i => '• ' + i.text).join('\\n')
      })(),
    },
    {
      id: 'dg_operation',
      title: '五、经营指标',
      text: (() => {
        const dim = result.dimensions.find(d => d.key === 'operation')
        if (!dim) return '暂无经营指标数据。'
        return dim.title + '\\n' + dim.items.map(i => '• ' + i.text).join('\\n')
      })(),
    },
    {
      id: 'dg_public',
      title: '六、舆情信息',
      text: (() => {
        const dim = result.dimensions.find(d => d.key === 'publicOpinion')
        if (!dim) return '暂无舆情数据。'
        return dim.title + '\\n' + dim.items.map(i => '• ' + i.text).join('\\n')
      })(),
    },
  ]
}

function buildPanSections(entName, creditCode) {
  const diagResult = getDiagnosisMock(creditCode)
  const task = dueDiligenceStore.tasks.find(t => t.name === entName || t.creditCode === creditCode)

  return [
    {
      id: 'pn_overview',
      title: '一、企业概况',
      text: entName + '\\n信用代码：' + (creditCode || '未披露') + '\\n行业：' + (task ? task.industry : '—') + '\\n地区：' + (task ? task.region : '—') + '\\n授信金额：' + (task ? task.amount : '—') + '\\n\\n工商登记状态存续，注册资本5000万元，成立于2015年。',
    },
    {
      id: 'pn_biz',
      title: '二、工商与股权',
      text: '企业工商状态正常，存续。\\n• 近90天无重大工商变更（如有诊断数据则引用实际变更记录）\\n• 股权穿透图：最大股东杭州XX控股（持股45%）\\n• 董监高信息已采集',
    },
    {
      id: 'pn_tax',
      title: '三、税票与经营',
      text: (() => {
        if (!diagResult) return '暂无税票数据。'
        const taxDim = diagResult.dimensions.find(d => d.key === 'tax')
        if (!taxDim) return '暂无税票数据。'
        let t = '销项发票趋势：\\n'
        if (taxDim.trendData) {
          t += taxDim.trendData.map(td => '• ' + td.month + '：' + td.value + '万元' + (td.abnormal ? ' ⚠️' : '')).join('\\n')
        }
        return t + '\\n\\n行业均值：' + (taxDim.industryAvg || '—')
      })(),
    },
    {
      id: 'pn_risk',
      title: '四、风险概况',
      text: (() => {
        if (!diagResult) return '暂无风险数据。'
        const riskLabels = { high: '高风险', medium: '中风险', low: '低风险' }
        let t = '综合风险评分：' + diagResult.score + '/100（' + (riskLabels[diagResult.riskLevel] || diagResult.riskLevel) + '）\\n'
        const highRisks = riskItems.filter(r => r.level === 'high')
        if (highRisks.length) {
          t += '\\n高风险项：\\n' + highRisks.map(r => '• ' + r.title).join('\\n')
        }
        return t
      })(),
    },
    {
      id: 'pn_monitor',
      title: '五、监测状态',
      text: '当前已创建监测规则（税票/司法监控）。\\n• 触发次数：2次\\n• 近30天新增预警：0\\n• 建议持续关注税票波动趋势',
    },
  ]
}

function buildSecs(templateId, entName, creditCode) {
  switch (templateId) {
    case 'due': return buildDueSections(entName, creditCode)
    case 'diag': return buildDiagSections(entName, creditCode)
    case 'pan': return buildPanSections(entName, creditCode)
    default: return []
  }
}

// ====== 打开报告 ======

function openReport(idx) {
  const item = reportList.value[idx]
  if (!item) return
  secs.value = buildSecs(item.tpl, item.name.replace(/ - .+$/, ''), item.creditCode)
  rptName.value = item.name
  msgs.value = [{ role: 'ai', text: '已打开「' + item.name + '」。报告共 ' + secs.value.length + ' 个章节，可用对话方式修改。' }]
  view.value = 'editor'
}

// ====== 生成报告 ======

function doGen() {
  if (!tpl.value || !ent.value) return
  creating.value = true
  setTimeout(function() {
    secs.value = buildSecs(tpl.value, ent.value.n, ent.value.c)
    const tplNames = { due: '尽调报告', diag: '诊断报告', pan: '全景报告' }
    rptName.value = ent.value.n + ' - ' + (tplNames[tpl.value] || '报告')
    msgs.value = [{ role: 'ai', text: '已生成「' + rptName.value + '」初稿，共 ' + secs.value.length + ' 个章节。可用对话方式修改。' }]
    creating.value = false
    view.value = 'editor'
  }, 2000)
}

// ====== 编辑器操作 ======

function doEdit(id) {
  editId.value = id
  const s = secs.value.find(x => x.id === id)
  editText.value = s ? s.text : ''
}

function doSave() {
  const s = secs.value.find(x => x.id === editId.value)
  if (s) s.text = editText.value
  editId.value = ''
  editText.value = ''
}

// ====== AI 对话 ======

function doSend() {
  const t = chText.value
  if (!t || t.length === 0) return
  msgs.value.push({ role: 'user', text: t })
  chText.value = ''
  chBusy.value = true
  setTimeout(function() {
    const r = getReply(t)
    msgs.value.push({ role: 'ai', text: r })
    chBusy.value = false
  }, 1000)
}

function quickCmd(q) {
  chText.value = q
  doSend()
}

// ====== 4. AI 对话回复升级 ======

function getReply(input) {
  const low = input.toLowerCase()

  if (low.indexOf('风险') >= 0 && low.indexOf('展开') >= 0) {
    const highRisks = riskItems.filter(r => r.level === 'high')
    const medRisks = riskItems.filter(r => r.level === 'medium')
    const lowRisks = riskItems.filter(r => r.level === 'low')
    const lines = []
    lines.push('**高风险项（' + highRisks.length + '项）：**')
    lines.push('')
    highRisks.forEach((r, i) => {
      lines.push((i + 1) + '. **' + r.title + '** — ' + r.desc)
      lines.push('')
    })
    lines.push('**中风险项（' + medRisks.length + '项）：**')
    lines.push('')
    medRisks.forEach((r, i) => {
      lines.push((i + highRisks.length + 1) + '. ' + r.title + '（' + r.desc + '）')
    })
    lines.push('')
    lines.push('**低风险项（' + lowRisks.length + '项）：**')
    lines.push('')
    lowRisks.forEach((r, i) => {
      lines.push((i + highRisks.length + medRisks.length + 1) + '. ' + r.title + '（' + r.desc + '）')
    })
    return lines.join('\\n')
  }

  if (low.indexOf('正式') >= 0 || low.indexOf('语气') >= 0) {
    return '已调整全文语气。主要变更：\\n- "建议关注" → "提请审批人重点关注"\\n- "可能存在" → "经核查确认存在"\\n- 摘要部分改为审批口吻表述\\n- 结论段落调整为正式公文格式'
  }

  if (low.indexOf('税票') >= 0) {
    return '已在以下章节追加税票数据：\\n- **第二章 经营概况**：补充2025年度纳税总额、增值税明细\\n- **第四章 财务分析**：补充税票与营收交叉比对结果\\n- **第六章 风险提示**：追加"税票数据覆盖不全"专项说明\\n\\n注意：2024年税票因授权缺失，相关章节已标注"数据缺口"。'
  }

  if (low.indexOf('总结') >= 0 || low.indexOf('概要') >= 0) {
    const report = secs.value
    const lines = []
    lines.push('**报告概要：**')
    lines.push('')
    lines.push('本报告共 ' + report.length + ' 个章节，涵盖：')
    report.forEach(s => { lines.push('**' + s.title + '**') })
    lines.push('')
    lines.push('**核心结论：** 企业整体经营状况正常，存在 ' + riskItems.filter(r => r.level === 'high').length + ' 项高风险需关注，建议有条件通过审批。')
    return lines.join('\\n')
  }

  if (low.indexOf('导出') >= 0 || low.indexOf('word') >= 0) {
    return '报告已导出为 Word 文档，可在下载中心查看。'
  }

  if (low.indexOf('证据') >= 0 || low.indexOf('交叉') >= 0) {
    return '证据链完整性检查：\\n- 工商数据：31条有效证据 ✅\\n- 税票数据：18条有效证据（覆盖率78%）⚠️\\n- 合同数据：12条有效证据 ✅\\n- 财务数据：24条有效证据 ✅\\n\\n交叉比对发现3处差异，已在风险章节标注。'
  }

  return '收到您的修改意见：「' + input + '」\\n\\n我可以帮您：\\n- **展开某个章节**的详细分析\\n- **调整语气**（正式/简洁/口语化）\\n- **补充数据**（税票/工商/诊断）\\n- **总结概要**\\n\\n请直接告诉我需要怎么改。'
}

// ====== Markdown 简单渲染 ======

function md(text) {
  if (!text) return ''
  return text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>')
}

function elMsg(t) {
  ElMessage.success(t)
}
</script>

<style scoped>
.page { padding: 24px 32px; max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: #94a3b8; }
.card-animate { animation: fadeUp .3s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.empty-hint { text-align: center; color: #94a3b8; font-size: 13px;