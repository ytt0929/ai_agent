<template>
  <div class="delivery-package">
    <!-- 状态摘要 -->
    <el-card shadow="never" class="dp-card">
      <template #header>
        <div class="dp-card__header">
          <span class="dp-card__title">交付包下载 · {{ enterpriseName }}</span>
          <el-tag size="small" :type="deliveryStatusType">{{ packageStatus }}</el-tag>
        </div>
      </template>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="交付包名称">{{ packageName }}</el-descriptions-item>
        <el-descriptions-item label="生成时间">{{ generatedAt }}</el-descriptions-item>
        <el-descriptions-item label="文件数量">15 份</el-descriptions-item>
        <el-descriptions-item label="下载状态">
          <el-tag v-if="downloaded" size="small" type="success">已下载</el-tag>
          <span v-else class="dp-undownloaded">尚未下载</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 交付目录 -->
    <el-card shadow="never" class="dp-card">
      <template #header><span class="dp-card__title">交付目录</span></template>
      <el-tree
        :data="deliveryTree"
        :props="treeProps"
        default-expand-all
        node-key="id"
        class="dp-tree"
      >
        <template #default="{ node, data }">
          <span class="dp-tree-node" :class="{ 'dp-tree-node--file': data.isFile }">
            <el-icon v-if="data.isFile && data.checked" :size="14" color="var(--color-success)">
              <CircleCheck />
            </el-icon>
            <el-icon v-else-if="data.isFile" :size="14" color="var(--text-tertiary)">
              <Document />
            </el-icon>
            <el-icon v-else :size="14" color="var(--color-primary)">
              <Folder />
            </el-icon>
            <span class="dp-tree-label">{{ node.label }}</span>
            <el-tag v-if="data.count" size="small" type="info" effect="plain" class="dp-tree-count">{{ data.count }} 份</el-tag>
          </span>
        </template>
      </el-tree>
    </el-card>

    <!-- 操作按钮 -->
    <div class="dp-actions">
      <el-button type="primary" :icon="Download" @click="$emit('download-all')" :disabled="downloading">
        {{ downloading ? '生成中...' : '下载完整交付包' }}
      </el-button>
      <el-button plain :icon="Document" @click="$emit('download-pdf')">
        单独下载报告PDF
      </el-button>
      <el-button text @click="$emit('back-to-artifacts')">
        ← 返回产物确认
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheck, Document, Folder, Download } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  downloading: { type: Boolean, default: false },
})

const emit = defineEmits(['download-all', 'download-pdf', 'back-to-artifacts'])

const enterpriseName = computed(() => props.data.enterpriseName || '唐山物桥商贸有限公司')
const packageName = computed(() => props.data.packageName || (enterpriseName.value + '_尽调交付包_20260702.zip'))
const packageStatus = computed(() => props.data.packageStatus || '已生成')
const generatedAt = computed(() => props.data.generatedAt || '2026-07-02 15:40')
const downloaded = computed(() => props.data.downloaded || false)

const deliveryStatusType = computed(() => {
  const s = packageStatus.value
  if (s.includes('已')) return 'success'
  if (s.includes('生成')) return 'warning'
  return 'info'
})

const treeProps = { label: 'label', children: 'children' }

const deliveryTree = computed(() => [
  {
    id: '1',
    label: '1. 尽调报告',
    count: 2,
    children: [
      { id: '1-1', label: '尽职调查报告.pdf', isFile: true, checked: true },
      { id: '1-2', label: '尽职调查报告.docx / 可编辑草稿', isFile: true, checked: true },
    ],
  },
  {
    id: '2',
    label: '2. 阶段报告',
    count: 5,
    children: [
      { id: '2-1', label: '工商核验报告.pdf', isFile: true, checked: true },
      { id: '2-2', label: '司法查询报告.pdf', isFile: true, checked: true },
      { id: '2-3', label: '税票分析报告.pdf', isFile: true, checked: true },
      { id: '2-4', label: '资料识别报告.pdf', isFile: true, checked: true },
      { id: '2-5', label: '风险诊断报告.pdf', isFile: true, checked: true },
    ],
  },
  {
    id: '3',
    label: '3. 证据链文件',
    count: 4,
    children: [
      { id: '3-1', label: '企业基础资料证据链.xlsx', isFile: true, checked: true },
      { id: '3-2', label: '风险事项证据链.pdf', isFile: true, checked: true },
      { id: '3-3', label: '税票数据证据链.xlsx', isFile: true, checked: true },
      { id: '3-4', label: '资料完整性清单.xlsx', isFile: true, checked: true },
    ],
  },
  {
    id: '4',
    label: '4. 原始资料包',
    count: 5,
    children: [
      { id: '4-1', label: '营业执照.pdf', isFile: true, checked: true },
      { id: '4-2', label: '纳税申报表.pdf', isFile: true, checked: true },
      { id: '4-3', label: '发票明细.xlsx', isFile: true, checked: true },
      { id: '4-4', label: '合同文件.pdf', isFile: true, checked: true },
      { id: '4-5', label: '上传资料.zip', isFile: true, checked: true },
    ],
  },
])
</script>

<style scoped>
.delivery-package { display: flex; flex-direction: column; gap: var(--space-md, 12px); }
.dp-card :deep(.el-card__header) { padding: var(--space-sm, 10px) var(--space-md, 14px); }
.dp-card__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm, 8px); }
.dp-card__title { font-size: var(--font-size-base, 14px); font-weight: var(--font-weight-semibold, 600); color: var(--text-primary); }
.dp-undownloaded { font-size: 13px; color: var(--text-tertiary); }

/* 树形目录 */
.dp-tree { background: transparent; }
.dp-tree :deep(.el-tree-node__content) { padding: var(--space-xs, 4px) 0; height: auto; min-height: 32px; }
.dp-tree :deep(.el-tree-node__expand-icon) { font-size: 12px; color: var(--text-tertiary); }
.dp-tree :deep(.el-tree-node.is-expanded > .el-tree-node__content) { background: var(--surface-soft); }
.dp-tree-node { display: flex; align-items: center; gap: var(--space-xs, 6px); width: 100%; }
.dp-tree-label { font-size: var(--font-size-sm, 13px); color: var(--text-primary); flex: 1; }
.dp-tree-node--file .dp-tree-label { color: var(--text-secondary); }
.dp-tree-count { flex-shrink: 0; margin-left: auto; }

/* 操作按钮 */
.dp-actions {
  display: flex; align-items: center; gap: var(--space-sm, 8px);
  padding: var(--space-sm, 10px) 0;
  border-top: 1px solid var(--border-divider);
}
</style>
