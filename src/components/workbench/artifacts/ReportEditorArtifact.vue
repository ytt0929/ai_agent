<template>
  <div class="artifact-report">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">{{ title }}</span>
          <el-tag type="primary" size="small">{{ template }}</el-tag>
        </div>
      </template>
      <el-table :data="sections" size="small" stripe border>
        <el-table-column label="章节" width="50" align="center">
          <template #default="{ row }">{{ row.no }}</template>
        </el-table-column>
        <el-table-column label="标题" min-width="120">
          <template #default="{ row }">{{ row.title }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }"><el-tag size="small" :type="secTag(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">正文编辑</span>
          <el-tag size="small" type="info">AI 辅助</el-tag>
        </div>
      </template>
      <el-input type="textarea" :rows="14" v-model="content" placeholder="在此编辑报告内容，右侧 AI 助手可帮你改写、补充和校对…" />
      <div class="artifact-report__actions">
        <el-button size="small" plain>保存草稿</el-button>
        <el-button size="small" type="primary">确认提交</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ data: { type: Object, default: () => ({}) } })
const title = computed(() => props.data.title || '授信调查报告')
const template = computed(() => props.data.template || '标准授信模板')
const sections = computed(() => props.data.sections || [])
const content = ref(props.data.content || '')
function secTag(s) { return { '已完成': 'success', '待确认': 'warning', '编辑中': 'primary' }[s] || 'info' }
</script>

<style scoped>
.artifact-report { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-report__actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end; }
</style>
