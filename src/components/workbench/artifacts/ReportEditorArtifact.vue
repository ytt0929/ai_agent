<template>
  <div class="artifact-report-lite">
    <!-- 头部信息 -->
    <div class="report-lite__header">
      <span class="report-lite__title">{{ data.title || '尽职调查报告' }}</span>
      <div class="report-lite__meta">
        <el-tag size="small" round>{{ data.template || '标准授信尽调' }}</el-tag>
        <span class="report-lite__meta-text">资料完整度 {{ data.completeness ?? 86 }}%</span>
        <span v-if="data.pendingCount" class="report-lite__meta-text">
          待确认 <el-tag type="warning" size="small" effect="plain">{{ data.pendingCount }} 项</el-tag>
        </span>
      </div>
    </div>

    <!-- 双栏布局：目录 + 正文 -->
    <div class="report-lite__body">
      <!-- 左侧目录 -->
      <aside class="report-lite__toc">
        <div class="report-lite__toc-title">报告目录</div>
        <div
          v-for="sec in sections"
          :key="sec.id || sec.no"
          class="report-lite__toc-item"
          :class="{ 'report-lite__toc-item--active': currentSection?.id === sec.id }"
          @click="selectSection(sec)"
        >
          <span class="report-lite__toc-no">{{ sec.no }}</span>
          <span class="report-lite__toc-name">{{ sec.title }}</span>
          <el-tag :size="'small'" :type="secTag(sec.status)" effect="plain" class="report-lite__toc-status">
            {{ sec.status }}
          </el-tag>
        </div>
      </aside>

      <!-- 右侧正文 -->
      <main class="report-lite__content" v-if="currentSection">
        <div class="report-lite__content-head">
          <div class="report-lite__content-head-left">
            <h3 class="report-lite__content-title">
              第{{ numToChinese(currentSection.no) }}章 {{ currentSection.title }}
            </h3>
            <el-tag :size="'small'" :type="secTag(currentSection.status)" effect="plain">
              {{ currentSection.status }}
            </el-tag>
          </div>
          <div class="report-lite__content-head-right">
            <el-tag size="small" type="info">
              资料完整度 {{ data.completeness ?? 86 }}%
            </el-tag>
          </div>
        </div>

        <!-- 正文编辑区 -->
        <div class="report-lite__section">
          <div class="report-lite__section-title">正文内容</div>
          <el-input
            type="textarea"
            :rows="8"
            v-model="currentSection.content"
            placeholder="在此编辑本章正文内容…"
            class="report-lite__textarea"
          />
        </div>

        <!-- 证据链 -->
        <div v-if="currentSection.evidence?.length" class="report-lite__section">
          <div class="report-lite__section-title">本章证据链</div>
          <div class="report-lite__evidence-list">
            <el-tag
              v-for="(ev, i) in currentSection.evidence"
              :key="i"
              size="small"
              type="success"
              effect="plain"
            >
              {{ ev }}
            </el-tag>
          </div>
        </div>

        <!-- 关联资料 -->
        <div v-if="currentSection.materials?.length" class="report-lite__section">
          <div class="report-lite__section-title">关联资料</div>
          <div class="report-lite__materials-list">
            <el-tag
              v-for="(mat, i) in currentSection.materials"
              :key="i"
              size="small"
              effect="plain"
            >
              {{ mat }}
            </el-tag>
          </div>
        </div>

        <!-- 待确认项 -->
        <div v-if="currentSection.pending?.length" class="report-lite__section report-lite__section--pending">
          <div class="report-lite__section-title">
            待确认项
            <el-tag type="warning" size="small" effect="plain">{{ currentSection.pending.length }}</el-tag>
          </div>
          <div class="report-lite__pending-list">
            <div v-for="(p, i) in currentSection.pending" :key="i" class="report-lite__pending-item">
              <el-icon class="report-lite__pending-icon"><WarningFilled /></el-icon>
              <span>{{ p }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 底部操作按钮 -->
    <div class="report-lite__actions">
      <el-button size="default" plain>保存草稿</el-button>
      <el-button size="default" type="info" plain>导出报告</el-button>
      <el-button size="default" type="primary">提交确认</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })

const sections = computed(() => props.data.sections || [])

const currentSection = ref(null)

// 默认选中第一个章节
if (sections.value.length > 0) {
  currentSection.value = sections.value[0]
}

function selectSection(sec) {
  currentSection.value = sec
}

function secTag(s) {
  return { '已完成': 'success', '待确认': 'warning', '编辑中': 'primary' }[s] || 'info'
}

function numToChinese(n) {
  const map = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return map[n - 1] || n
}
</script>

<style scoped>
.artifact-report-lite {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 头部 */
.report-lite__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-light, #e5eaf2);
  border-radius: var(--radius-md, 8px);
}

.report-lite__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
}

.report-lite__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-lite__meta-text {
  font-size: 12px;
  color: var(--text-secondary, #64748b);
}

/* 双栏布局 */
.report-lite__body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 14px;
  min-height: 380px;
}

/* 目录 */
.report-lite__toc {
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-light, #e5eaf2);
  border-radius: var(--radius-md, 8px);
  padding: 8px;
}

.report-lite__toc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--border-divider, #f1f5f9);
  margin-bottom: 4px;
}

.report-lite__toc-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
}

.report-lite__toc-item:hover {
  background: var(--bg-page, #f7faff);
}

.report-lite__toc-item--active {
  background: var(--color-primary-bg, #eef2ff);
}

.report-lite__toc-no {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary, #94a3b8);
  background: var(--bg-page, #f7faff);
  border-radius: 4px;
  flex-shrink: 0;
}

.report-lite__toc-item--active .report-lite__toc-no {
  color: var(--color-primary, #2563eb);
  background: var(--color-primary-bg, #eef2ff);
}

.report-lite__toc-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary, #1a1a2e);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-lite__toc-item--active .report-lite__toc-name {
  font-weight: 600;
  color: var(--color-primary, #2563eb);
}

.report-lite__toc-status {
  flex-shrink: 0;
  font-size: 10px;
}

/* 正文内容 */
.report-lite__content {
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-light, #e5eaf2);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-lite__content-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-divider, #f1f5f9);
}

.report-lite__content-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-lite__content-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
  margin: 0;
}

/* 各小节 */
.report-lite__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-lite__section--pending {
  background: var(--color-warning-bg, #fffbeb);
  border: 1px solid var(--color-warning-border, #fde68a);
  border-radius: 6px;
  padding: 10px 12px;
  margin: -4px -8px 0;
}

.report-lite__section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 文本域 */
.report-lite__textarea :deep(.el-textarea__inner) {
  font-size: 13px;
  line-height: 1.7;
  border-radius: 6px;
}

/* 证据链 / 关联资料列表 */
.report-lite__evidence-list,
.report-lite__materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 待确认项列表 */
.report-lite__pending-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-lite__pending-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-primary, #1a1a2e);
}

.report-lite__pending-icon {
  color: var(--color-warning, #f59e0b);
  font-size: 14px;
  flex-shrink: 0;
}

/* 底部操作按钮 */
.report-lite__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
}

@media (max-width: 768px) {
  .report-lite__body {
    grid-template-columns: 1fr;
  }

  .report-lite__toc {
    max-height: 160px;
    overflow-y: auto;
  }
}
</style>
