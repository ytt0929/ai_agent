<template>
  <div class="artifact-deliverables">
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
              <el-button size="small" text type="primary" @click="openPreview(row)">查看</el-button>
              <el-button size="small" text type="success" @click="emit('edit-report')">编辑</el-button>
            </template>
            <template v-else-if="row.type === 'evidence' && row.status === '已归档'">
              <el-button size="small" text type="primary" @click="openPreview(row)">查看</el-button>
              <el-button size="small" text type="success" @click="generateEvidence(row)">生成</el-button>
            </template>
            <template v-else-if="row.status === '已生成' || row.status === '已归档'">
              <el-button size="small" text type="primary" @click="openPreview(row)">查看</el-button>
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

    <!-- 内嵌预览面板（不覆盖右侧 AI） -->
    <el-card v-if="previewVisible" shadow="never" class="artifact-card artifact-card--preview">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">{{ previewTitle }}</span>
          <el-button text size="small" type="primary" @click="closePreview">关闭预览</el-button>
        </div>
      </template>

      <!-- 文档化报告预览 -->
      <div v-if="previewItem && previewItem.type === 'report'" class="report-document-preview">
        <!-- 左侧目录 -->
        <aside class="report-document-toc">
          <div class="report-document-toc__title">报告目录</div>
          <div
            v-for="ch in previewSections"
            :key="ch.id"
            class="report-document-toc__item"
            :class="{ 'report-document-toc__item--active': activePreviewChapter === ch.id }"
            @click="scrollToReportSection(ch.id)"
          >
            <span class="report-document-toc__no">{{ ch.no }}</span>
            <span class="report-document-toc__text">{{ ch.title }}</span>
          </div>
        </aside>

        <!-- 右侧文档页 -->
        <section class="report-document-page" ref="documentPageRef">
          <!-- 封面 -->
          <div class="report-cover">
            <h2 class="report-cover__title">尽职调查报告</h2>
            <div class="report-cover__info">
              <div class="report-cover__row">
                <span class="report-cover__label">企业名称：</span><span>唐山物桥商贸有限公司</span>
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
            v-for="section in previewSections"
            :key="section.id"
            :id="`rdp-${section.id}`"
            class="report-document-section"
          >
            <h3 class="report-document-section__title">{{ section.no }}、{{ section.title }}</h3>
            <div class="report-document-section__content">
              <p>{{ section.content }}</p>
            </div>
            <!-- 资料依据 -->
            <div v-if="section.materials?.length" class="report-document-section__meta">
              <span class="report-document-section__meta-label">资料依据：</span>
              <el-tag v-for="m in section.materials" :key="m" size="small" type="info" effect="plain" class="report-meta-tag">{{ m }}</el-tag>
            </div>
            <!-- 证据链 -->
            <div v-if="section.evidence?.length" class="report-document-section__meta">
              <span class="report-document-section__meta-label">证据链：</span>
              <el-tag v-for="e in section.evidence" :key="e" size="small" type="success" effect="plain" class="report-meta-tag">{{ e }}</el-tag>
            </div>
            <!-- 待确认项 -->
            <div v-if="section.pending?.length" class="report-document-section__pending">
              <span class="report-document-section__meta-label">⚠ 待确认：</span>
              <span v-for="p in section.pending" :key="p" class="report-pending-text">{{ p }}；</span>
            </div>
          </section>

          <!-- 底部操作 -->
          <div class="report-document-actions">
            <el-button type="primary" @click="enterEditor">进入编辑</el-button>
            <el-button plain @click="$emit('export-report')">导出报告</el-button>
            <el-button plain @click="closePreview">关闭预览</el-button>
          </div>
        </section>
      </div>

      <!-- 非报告产物轻量预览 -->
      <div v-else class="preview-simple">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="产物名称">{{ selectedPreviewItem?.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ selectedPreviewItem?.status }}</el-descriptions-item>
          <el-descriptions-item label="摘要">{{ getSimplePreviewSummary(selectedPreviewItem) }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top:12px;text-align:right">
          <el-button @click="closePreview">关闭</el-button>
        </div>
      </div>
    </el-card>
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
const pendingItems = computed(() => {
  const list = []
  if (props.data.riskConclusion !== false) list.push('风险结论需确认')
  if (props.data.taxNote !== false) list.push('税票异常说明待补充')
  if (props.data.creditAdvice !== false) list.push('授信建议待确认')
  return list.length ? list : ['风险结论需确认', '授信建议待确认']
})

// 预览相关
const previewVisible = ref(false)
const previewItem = ref(null)
const selectedPreviewItem = ref(null)
const activePreviewChapter = ref('c1')
const documentPageRef = ref(null)
const previewSections = computed(() => props.data.reportSections || [])

const todayStr = computed(() => {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
})

const previewTitle = computed(() => {
  const item = previewItem.value || selectedPreviewItem.value
  if (!item) return '产物预览'
  return item.type === 'report' ? `报告预览：${item.name}` : `产物预览：${item.name}`
})

function openPreview(row) {
  if (row.type === 'report') {
    previewItem.value = row
    selectedPreviewItem.value = null
    activePreviewChapter.value = 'c1'
  } else {
    previewItem.value = null
    selectedPreviewItem.value = row
  }
  previewVisible.value = true
}

function closePreview() {
  previewVisible.value = false
  previewItem.value = null
  selectedPreviewItem.value = null
}

function enterEditor() {
  closePreview()
  emit('edit-report')
}

function generateEvidence(row) {
  ElMessage.info('已模拟生成证据链文件。')
  openPreview(row)
}

function scrollToReportSection(id) {
  activePreviewChapter.value = id
  requestAnimationFrame(() => {
    const el = document.getElementById('rdp-' + id)
    if (el && documentPageRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
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
.artifact-card--preview { border-left: 3px solid var(--color-primary); }

/* 文档化报告预览 */
.report-document-preview {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
}

/* 目录 */
.report-document-toc {
  background: var(--bg-page, #f7faff);
  border: 1px solid var(--border-light, #e5eaf2);
  border-radius: var(--radius-md, 8px);
  padding: 8px;
  max-height: 520px;
  overflow-y: auto;
}

.report-document-toc__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--border-divider, #e5eaf2);
  margin-bottom: 4px;
}

.report-document-toc__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 11px;
  color: var(--text-primary);
  transition: background 0.12s;
  border-radius: 4px;
}

.report-document-toc__item:hover { background: var(--bg-page, #f7faff); }
.report-document-toc__item--active { background: var(--color-primary-bg, #eef2ff); font-weight: 600; color: var(--color-primary, #2563eb); }

.report-document-toc__no {
  width: 18px; text-align: center;
  font-weight: 600; color: var(--text-tertiary, #94a3b8);
  flex-shrink: 0;
}

.report-document-toc__text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文档页 */
.report-document-page {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-light, #e5eaf2);
  border-radius: var(--radius-md, 8px);
  padding: 24px 32px;
  max-height: 520px;
  overflow-y: auto;
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
.report-document-section { margin-bottom: 16px; }

.report-document-section__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
  margin: 0 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-divider, #e5eaf2);
}

.report-document-section__content { margin-bottom: 8px; }

.report-document-section__content p {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0 0 6px;
  line-height: 1.8;
}

.report-document-section__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.report-document-section__meta-label {
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  margin-right: 4px;
}

.report-meta-tag { margin: 2px; }

.report-document-section__pending {
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
.report-document-actions {
  padding-top: 16px;
  border-top: 1px solid var(--border-divider, #e5eaf2);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 非报告预览 */
.preview-simple { padding: 0 8px; }

@media (max-width: 768px) {
  .report-document-preview {
    grid-template-columns: 1fr;
  }
  .report-document-toc { max-height: 140px; }
  .report-document-page { padding: 16px; }
}
</style>
