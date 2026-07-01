<template>
  <div class="stage-strip">
    <el-button
      v-for="stage in stages"
      :key="stage.id"
      :class="['stage-tab', stage.status, { active: stage.id === activeStageId }]"
      :disabled="stage.status === 'pending'"
      size="small"
      plain
      round
      @click="$emit('select', stage.id)"
    >
      {{ stage.icon }} {{ stage.label }}
    </el-button>
  </div>
</template>

<script setup>
defineProps({
  stages: { type: Array, default: () => [] },
  activeStageId: { type: String, default: null },
})
defineEmits(['select'])
</script>

<style scoped>
.stage-strip {
  display: flex;
  gap: 6px;
  padding: 0;
  margin: 0 0 12px;
  overflow-x: auto;
  background: transparent;
  border-bottom: 0;
  flex-wrap: wrap;
}

/* Override el-button styles for stage tabs */
.stage-tab.el-button {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--el-border-color, #dbe7f5);
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #64748b);
  transition: all .15s;
}

.stage-tab.el-button.is-disabled {
  opacity: .5;
  cursor: default;
}

.stage-tab.el-button:not(.is-disabled):hover {
  border-color: var(--el-color-primary, #2563eb);
  color: var(--el-color-primary, #2563eb);
}

.stage-tab.done.el-button {
  color: var(--el-color-success, #10b981);
  background: var(--el-color-success-light-9, #ecfdf5);
  border-color: var(--el-color-success-light-7, #d1fae5);
}

.stage-tab.active.el-button {
  color: var(--el-color-primary, #2563eb);
  background: var(--el-color-primary-light-9, #eef2ff);
  border-color: var(--el-color-primary, #2563eb);
}
</style>
