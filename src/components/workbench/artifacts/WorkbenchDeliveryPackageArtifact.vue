<template>
  <div class="wb-delivery-package">
    <!-- 交付包头部信息 -->
    <el-card shadow="never" class="wb-dp__header-card">
      <template #header>
        <div class="wb-dp__header">
          <span class="wb-dp__title">交付包已生成</span>
          <el-tag type="success" size="small">已生成</el-tag>
        </div>
      </template>
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="企业">{{ enterprise }}</el-descriptions-item>
        <el-descriptions-item label="包名">{{ packageName }}</el-descriptions-item>
        <el-descriptions-item label="生成时间">{{ generatedAt }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          {{ summary.join('、') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 交付清单摘要 -->
    <el-card shadow="never" class="wb-dp__list-card">
      <template #header>
        <span class="wb-dp__list-title">交付清单摘要</span>
      </template>
      <ul class="wb-dp__file-list">
        <li v-for="(file, i) in files" :key="i" class="wb-dp__file">
          <span class="wb-dp__file-icon">📄</span>
          <span class="wb-dp__file-name">{{ file }}</span>
        </li>
      </ul>
    </el-card>

    <!-- 操作按钮 -->
    <div class="wb-dp__actions">
      <el-button type="primary" @click="$emit('mock-download')">
        {{ downloaded ? '再次下载' : '模拟下载交付包' }}
      </el-button>
      <el-button plain @click="$emit('view-list')">查看交付清单</el-button>
    </div>

    <!-- 下载完成提示 -->
    <div v-if="downloaded" class="wb-dp__downloaded-hint">
      <span>✓ 已完成模拟下载</span>
      <span v-if="downloadedAt" class="wb-dp__downloaded-time">{{ downloadedAt }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['mock-download', 'view-list'])

const enterprise = computed(() => props.data.enterprise?.name || '—')
const packageName = computed(() => props.data.packageName || '—')
const generatedAt = computed(() => props.data.generatedAt || '—')
const summary = computed(() => props.data.summary || [])
const files = computed(() => props.data.files || [])
const downloaded = computed(() => !!props.data.downloaded)
const downloadedAt = computed(() => props.data.downloadedAt || '')
</script>

<style scoped>
.wb-delivery-package { display: flex; flex-direction: column; gap: 12px; }
.wb-dp__header-card :deep(.el-card__header) { padding: 12px 16px; }
.wb-dp__header { display: flex; align-items: center; gap: 8px; }
.wb-dp__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.wb-dp__list-card :deep(.el-card__header) { padding: 12px 16px; }
.wb-dp__list-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.wb-dp__file-list { list-style: none; padding: 0; margin: 0; }
.wb-dp__file {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 0; font-size: 13px; color: var(--text-primary);
}
.wb-dp__file-icon { flex-shrink: 0; }
.wb-dp__file-name { font-size: 13px; color: var(--text-primary); }
.wb-dp__actions { display: flex; gap: 8px; padding: 10px 0; border-top: 1px solid var(--border-color-divider); }
.wb-dp__downloaded-hint {
  padding: 8px 12px; background: var(--color-success-bg); border-radius: var(--radius-6, 6px);
  font-size: 13px; font-weight: 500; color: var(--color-success);
  display: flex; align-items: center; gap: 8px;
}
.wb-dp__downloaded-time { font-weight: 400; color: var(--text-tertiary); }
</style>
