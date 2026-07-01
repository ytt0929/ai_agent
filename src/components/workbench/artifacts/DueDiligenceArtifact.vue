<template>
  <div class="artifact-dd">
    <el-card shadow="never" class="artifact-card">
      <template #header>
        <div class="artifact-card__header">
          <span class="artifact-card__title">尽调任务</span>
          <el-tag v-if="enterprise" size="small" type="info">{{ enterprise.name }}</el-tag>
        </div>
      </template>

      <template v-if="data.step === 'template-selection'">
        <div class="artifact-tpl-list">
          <el-card v-for="tpl in templates" :key="tpl.id" shadow="hover" class="artifact-tpl-card" :class="{ 'artifact-tpl-card--selected': selectedId === tpl.id }" @click="$emit('select-template', tpl)">
            <div class="artifact-tpl-card__name">{{ tpl.name }}</div>
            <div class="artifact-tpl-card__meta">
              <span>章节 {{ tpl.sections }} 项</span><span>·</span><span>资料 {{ tpl.requiredDocs }} 份</span><span>·</span><span>预计 {{ tpl.estimatedDays }} 天</span>
            </div>
          </el-card>
        </div>
      </template>

      <template v-else-if="data.step === 'task-created'">
        <el-alert :title="`尽调任务已创建 — 模板: ${selectedTemplate?.name || ''}`" type="success" :closable="false" show-icon />
        <div class="artifact-dd-stages">
          <div v-for="s in stages" :key="s.id" class="artifact-dd-stage" :class="'artifact-dd-stage--' + s.status">
            <span class="artifact-dd-stage__icon">{{ stageIcon(s.status) }}</span>
            <span class="artifact-dd-stage__name">{{ s.name }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <el-empty description="请选择尽调模板" :image-size="60" />
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Object, default: () => ({}) } })
defineEmits(['select-template'])
const enterprise = computed(() => props.data.enterprise || {})
const templates = computed(() => props.data.templates || [])
const selectedId = computed(() => props.data.selectedTemplateId)
const selectedTemplate = computed(() => props.data.selectedTemplate || {})
const stages = computed(() => props.data.stages || [])
function stageIcon(s) { return { done: '✓', active: '⟳', pending: '○' }[s] || '○' }
</script>

<style scoped>
.artifact-dd { display: flex; flex-direction: column; gap: 12px; }
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__header { display: flex; align-items: center; gap: 8px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.artifact-tpl-list { display: flex; flex-direction: column; gap: 8px; }
.artifact-tpl-card { cursor: pointer; transition: border-color .15s; }
.artifact-tpl-card:hover { border-color: var(--color-primary); }
.artifact-tpl-card--selected { border-color: var(--color-primary); background: var(--color-primary-bg); }
.artifact-tpl-card__name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.artifact-tpl-card__meta { font-size: 12px; color: var(--text-secondary); display: flex; gap: 6px; }
.artifact-dd-stages { display: flex; flex-direction: column; gap: 2px; margin-top: 12px; }
.artifact-dd-stage { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 4px; font-size: 13px; }
.artifact-dd-stage--done { color: var(--color-success); background: var(--color-success-bg); }
.artifact-dd-stage--active { color: var(--color-primary); background: var(--color-primary-bg); }
.artifact-dd-stage--pending { color: var(--text-tertiary); }
.artifact-dd-stage__icon { width: 20px; text-align: center; font-weight: 700; }
.artifact-dd-stage__name { flex: 1; }
</style>
