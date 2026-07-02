<template>
  <div class="artifact-deliverables">
    <!-- ====== 状态 1：产物确认列表态 ====== -->
    <template v-if="viewMode === 'list'">
      <el-card shadow="never" class="artifact-card">
        <template #header>
          <div class="artifact-card__header">
            <span class="artifact-card__title">尽调产物</span>
            <el-tag type="success" size="small">已生成</el-tag>
          </div>
        </template>
        <el-table :data="items" size="small" stripe border>
          <el-table-column label="产物名称" min-width="140">
            <template #default="{ row }"><span class="artifact-dl-name">{{ row.name }}</span></template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }"><el-tag size="small" :type="row.status.includes('已') || row.status.includes('归档') ? 'success' : 'warning'">{{ row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column label="数量" width="70" align="center">
            <template #default="{ row }">{{ row.count }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <template v-if="row.type === 'report'">
                <el-button size="small" text type="primary" @click="viewReport(row)">查看</el-button>
                <el-button size="small" text type="success" @click="emit('edit-report')">编辑</el-button>
              </template>
              <template v-else-if="row.type === 'evidence' && row.status === '已归档'">
                <el-button size="small" text type="primary" @click="openSimplePreview(row)">查看</el-button>
                <el-button size="small" text type="success" @click="generateEvidence(row)">生成</el-button>
              </template>
              <template v-else-if="row.status === '已生成' || row.status === '已归档'">
                <el-button size="small" text type="primary" @click="openSimplePreview(row)">查看</el-button>
              </template>
              <template v-else>
                <el-button size="small" text type="primary">生成</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 报告模板与资料包清单 -->
      <el-card shadow="never" class="artifact-card">
        <template #header><span class="artifact-card__title">报告模板与资料包</span></template>
        <el-descriptions :column="2" size="small" border>
          <el-descriptions-item label="报告模板">{{ reportTemplate }}</el-descriptions-item>
          <el-descriptions-item label="报告底稿">尽职调查报告</el-descriptions-item>
          <el-descriptions-item label="资料包">工商资料 / 司法查询 / 税票数据 / 上传资料 / 证据链</el-descriptions-item>
          <el-descriptions-item label="当前状态">底稿已生成，等待确认和编辑</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 待确认项 -->
      <el-card v-if="pendingItems?.length" shadow="never" class="artifact-card artifact-card--warn">
        <template #header><span class="artifact-card__title">待确认项</span></template>
        <div v-for="(item, i) in pendingItems" :key="i" class="artifact-deliverables__pending">
          <span class="pending-icon">⚠</span>
          <span class="pending-text">{{ item }}</span>
        </div>
      </el-card>

      <!-- 导出状态 -->
      <div v-if="exportStatus" class="artifact-deliverables__export-status">
        <span>✓ {{ exportStatus }}</span>
      </div>

      <!-- 动作区 -->
      <div class="artifact-deliverables__actions">
        <el-button type="primary" @click="$emit('edit-report')">编辑报告</el-button>
        <el-button plain @click="$emit('export-report')">导出报告</el-button>
        <el-button plain @click="$emit('start-monitor')">加入监控</el-button>
      </div>

      <!-- 非报告产物轻量预览（列表下方小面板） -->
      <el-card v-if="simplePreviewVisible" shadow="never" class="artifact-card artifact-card--preview-simple">
        <template #header>
          <div class="artifact-card__header">
            <span class="artifact-card__title">产物预览：{{ simplePreviewItem?.name }}</span>
            <el-button text size="small" type="primary" @click="closeSimplePreview">关闭</el-button>
          </div>
        </template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="产物名称">{{ simplePreviewItem?.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ simplePreviewItem?.status }}</el-descriptions-item>
          <el-descriptions-item label="摘要">{{ getSimplePreviewSummary(simplePreviewItem) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </template>

    <!-- ====== 状态 2：报告预览态（整区切换） ====== -->
    <template v-else-if="viewMode === 'reportPreview'">
      <div class="report-preview-full">
        <!-- 顶部栏：返回 + 标题 -->
        <div class="report-preview-bar">
          <el-button text type="primary" size="default" @click="backToList">
            ← 返回产物确认
          </el-button>
          <span class="report-preview-bar__title">报告预览：尽职调查报告</span>
          <div class="report-preview-bar__actions">
            <el-button size="small" type="primary" @click="editReport">进入编辑</el-button>
            <el-button size="small" plain @click="$emit('export-report')">导出报告</el-button>
          </div>
        </div>

        <!-- 企业摘要 -->
        <div class="report-preview-summary">
          <span class="report-preview-summary__name">{{ enterpriseName }}</span>
          <span class="report-preview-summary__meta">商贸流通</span>
          <el-tag size="small" effect="plain">综合评分 72</el-tag>
          <el-tag size="small" type="warning" effect="plain">C+</el-tag>
          <el-tag size="small" type="warning" effect="plain">中风险</el-tag>
          <span class="report-preview-summary__meta">资料完整度 86%</span>
        </div>

        <!-- 左侧目录 + 右侧文档页 -->
        <div class="report-preview-body">
          <el-scrollbar class="report-preview-toc">
            <div class="report-preview-toc__title">报告目录</div>
            <div
              v-for="ch in reportSections"
              :key="ch.id"
              class="report-preview-toc__item"
              :class="{ 'report-preview-toc__item--active': activeChapter === ch.id }"
              @click="goToChapter(ch.id)"
            >
              <span class="report-preview-toc__no">{{ ch.no }}</span>
              <span class="report-preview-toc__text">{{ ch.title }}</span>
            </div>
          </el-scrollbar>

          <el-scrollbar class="report-preview-page" ref="pageRef">
            <!-- 封面 -->
            <div class="report-cover">
              <h2 class="report-cover__title">尽职调查报告</h2>
              <div class="report-cover__info">
                <div class="report-cover__row">
                  <span class="report-cover__label">企业名称：</span><span>{{ enterpriseName }}</span>
                </div>
                <div class="report-cover__row">
                  <span class="report-cover__label">所属行业：</span><span>建材批发 / 商贸流通</span>
                </div>
                <div class="report-cover__row">
                  <span class="report-cover__label">所在区域：</span><span>河北省唐山市</span>
                </div>
                <div class="report-cover__row">
                  <span class="report-cover__label">报告模板：</span><span>尽职调查报告</span>
                </div>
                <div class="report-cover__row">
                  <span class="report-cover__label">综合评分：</span><span>72</span>
                  <span class="report-cover__sep">等级：C+&emsp;风险等级：中风险</span>
                </div>
                <div class="report-cover__row">
                  <span class="report-cover__label">资料完整度：</span><span>86%</span>
                  <span class="report-cover__sep">生成日期：{{ todayStr }}</span>
                </div>
                <div class="report-cover__row">
                  <span class="report-cover__label">报告状态：</span><span>底稿已生成，待确认和编辑</span>
                </div>
              </div>
            </div>

            <el-divider />

            <!-- 摘要 -->
            <div class="report-abstract">
              <p>
                本报告基于工商登记信息、司法公开数据、税票采集数据、企业补充资料及 AI 风险诊断结果生成。
                经初步核验，唐山物桥商贸有限公司主体状态正常存续，纳税信用评级 A 级，
                但存在税负率显著低于行业、开票收入与申报收入不一致、购销两头在外、短期偿债压力较大等风险事项。
                建议作为有条件授信对象，后续需补充税负异常说明、确认购销业务真实性，并强化贷后监测。
              </p>
            </div>

            <el-divider />

            <!-- 15 章正文 -->
            <section
              v-for="section in reportSections"
              :key="section.id"
              :id="`rdp-${section.id}`"
              class="report-section"
            >
              <h3 class="report-section__title">{{ section.no }}、{{ section.title }}</h3>
              <div class="report-section__content">
                <p>{{ section.content }}</p>
              </div>
              <div v-if="section.materials?.length" class="report-section__meta">
                <span class="report-section__meta-label">资料依据：</span>
                <el-tag v-for="m in section.materials" :key="m" size="small" type="info" effect="plain" class="report-meta-tag">{{ m }}</el-tag>
              </div>
              <div v-if="section.evidence?.length" class="report-section__meta">
                <span class="report-section__meta-label">证据链：</span>
                <el-tag v-for="e in section.evidence" :key="e" size="small" type="success" effect="plain" class="report-meta-tag">{{ e }}</el-tag>
              </div>
              <div v-if="section.pending?.length" class="report-section__pending">
                <span class="report-section__meta-label">⚠ 待确认：</span>
                <span v-for="p in section.pending" :key="p" class="report-pending-text">{{ p }}；</span>
              </div>
            </section>

            <!-- 底部操作 -->
            <div class="report-section-actions">
              <el-button type="primary" @click="editReport">进入编辑</el-button>
              <el-button plain @click="$emit('export-report')">导出报告</el-button>
              <el-button plain @click="backToList">返回产物确认</el-button>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['edit-report', 'export-report', 'start-monitor'])

const items = computed(() => props.data.items || [])
const exportStatus = computed(() => props.data.exportStatus || '')
const reportTemplate = computed(() => '尽职调查报告')
const enterpriseName = computed(() => props.data.enterprise?.name || '唐山物桥商贸有限公司')
const pendingItems = computed(() => {
  const list = []
  if (props.data.riskConclusion !== false) list.push('风险结论需确认')
  if (props.data.taxNote !== false) list.push('税票异常说明待补充')
  if (props.data.creditAdvice !== false) list.push('授信建议待确认')
  return list.length ? list : ['风险结论需确认', '授信建议待确认']
})

// ====== 三态 ======
const viewMode = ref('list') // 'list' | 'reportPreview'
const activeChapter = ref('c1')
const pageRef = ref(null)
const reportSections = computed(() => props.data.reportSections || [])

const todayStr = computed(() => {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
})

// 查看报告 → 整区切换为 reportPreview
function viewReport(row) {
  activeChapter.value = 'c1'
  viewMode.value = 'reportPreview'
}

// 返回产物确认列表
function backToList() {
  viewMode.value = 'list'
}

// 进入编辑
function editReport() {
  emit('edit-report')
}

// 定位到章节
function goToChapter(id) {
  activeChapter.value = id
  requestAnimationFrame(() => {
    const el = document.getElementById('rdp-' + id)
    if (el && pageRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// 非报告产物轻量预览
const simplePreviewVisible = ref(false)
const simplePreviewItem = ref(null)

function openSimplePreview(row) {
  simplePreviewItem.value = row
  simplePreviewVisible.value = true
}

function closeSimplePreview() {
  simplePreviewVisible.value = false
  simplePreviewItem.value = null
}

function generateEvidence(row) {
  ElMessage.info('已模拟生成证据链文件。')
  openSimplePreview(row)
}

const simpleSummaries = {
  business: '工商核验报告：企业主体状态正常存续，税务评级A级，注册资本500万元，关联企业3家，未发现重大工商异常。',
  judicial: '司法查询报告：未发现重大诉讼记录，裁判文书2条（普通买卖合同纠纷已结案），无行政处罚记录。',
  tax: '税票分析报告：进项发票128/150份，销项发票96/120份。增值税税负率0.8%，申报收入2175.46万元，开票收入2275.98万元。',
  risk: '风险诊断报告：综合评分72分，等级C+，中风险。8项风险事项已识别，其中3项高风险、3项中风险、2项低风险。',
  evidence: '证据链文件：共24项证据，覆盖工商登记、司法查询、税票采集、资料识别、风险诊断等维度。',
}

function getSimplePreviewSummary(row) {
  return simpleSummaries[row.type] || '暂无摘要信息。'
}
</script>

<style scoped>
.artifact-deliverables { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-dl-name { font-weight: 600; }
.artifact-deliverables__actions {
  display: flex; gap: 8px; padding: 10px 0;
  border-top: 1px solid var(--border-color-divider);
}
.artifact-card--warn { border-left: 3px solid var(--color-warning); }
.artifact-deliverables__pending { font-size: 13px; color: var(--text-secondary); display: flex; gap: 6px; align-items: flex-start; margin-bottom: 6px; }
.artifact-deliverables__pending:last-child { margin-bottom: 0; }
.pending-icon { color: var(--color-warning); flex-shrink: 0; }
.pending-text { flex: 1; }
.artifact-deliverables__export-status {
  padding: 8px 12px; background: var(--color-success-bg); border-radius: var(--radius-6, 6px);
  font-size: 13px; font-weight: 500; color: var(--color-success);
}
.artifact-card--preview-simple { border-left: 3px solid var(--color-primary); }

/* ====== 报告预览整区 ====== */
.report-preview-full {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-page, #f7faff);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

/* 顶部栏 */
.report-preview-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-card, #fff);
  border-bottom: 1px solid var(--border-divider, #e5eaf2);
  flex-shrink: 0;
}

.report-preview-bar__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.report-preview-bar__actions {
  display: flex;
  gap: 8px;
}

/* 企业摘要 */
.report-preview-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-card, #fff);
  border-bottom: 1px solid var(--border-light, #e5eaf2);
  flex-wrap: wrap;
}

.report-preview-summary__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.report-preview-summary__meta {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 主体：目录 + 文档页 */
.report-preview-body {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 目录 */
.report-preview-toc {
  background: var(--bg-page, #f7faff);
  border-right: 1px solid var(--border-light, #e5eaf2);
  padding: 8px 6px;
}

.report-preview-toc__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--border-divider, #e5eaf2);
  margin-bottom: 4px;
}

.report-preview-toc__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-primary);
  transition: background 0.12s;
  border-radius: 4px;
}

.report-preview-toc__item:hover { background: var(--bg-page, #f7faff); }
.report-preview-toc__item--active {
  background: var(--color-primary-bg, #eef2ff);
  font-weight: 600;
  color: var(--color-primary, #2563eb);
}

.report-preview-toc__no {
  width: 18px;
  text-align: center;
  font-weight: 600;
  color: var(--text-tertiary, #94a3b8);
  flex-shrink: 0;
}

.report-preview-toc__text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文档页 */
.report-preview-page {
  background: var(--bg-card, #fff);
  padding: 24px 32px;
  line-height: 1.8;
  color: var(--text-primary, #1a1a2e);
}

/* 封面 */
.report-cover { text-align: center; padding: 12px 0 8px; }

.report-cover__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
  margin: 0 0 16px;
  letter-spacing: 2px;
}

.report-cover__info {
  display: inline-block;
  text-align: left;
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  line-height: 2;
}

.report-cover__row { display: flex; gap: 4px; }
.report-cover__label { font-weight: 600; color: var(--text-primary); white-space: nowrap; }
.report-cover__sep { margin-left: 16px; }

/* 摘要 */
.report-abstract {
  padding: 12px 16px;
  background: var(--bg-page, #f7faff);
  border-left: 3px solid var(--color-primary, #2563eb);
  border-radius: 0 6px 6px 0;
  margin: 0 0 8px;
}

.report-abstract p {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.9;
}

/* 章节 */
.report-section { margin-bottom: 16px; }

.report-section__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
  margin: 0 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-divider, #e5eaf2);
}

.report-section__content { margin-bottom: 8px; }

.report-section__content p {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0 0 6px;
  line-height: 1.8;
}

.report-section__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.report-section__meta-label {
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  margin-right: 4px;
}

.report-meta-tag { margin: 2px; }

.report-section__pending {
  padding: 6px 10px;
  background: var(--color-warning-bg, #fffbeb);
  border: 1px solid var(--color-warning-border, #fde68a);
  border-radius: 4px;
  margin-top: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.report-pending-text {
  color: var(--color-warning, #d97706);
}

/* 底部操作 */
.report-section-actions {
  padding-top: 16px;
  border-top: 1px solid var(--border-divider, #e5eaf2);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .report-preview-body {
    grid-template-columns: 1fr;
  }
  .report-preview-toc { max-height: 140px; }
  .report-preview-page { padding: 16px; }
}
</style>
