<template>
  <nav class="stage-strip">
    <button
      v-for="stage in stages"
      :key="stage.id"
      class="stage-tab"
      :class="[stage.status, { active: stage.id === activeStageId }]"
      :disabled="stage.status === 'pending'"
      @click="$emit('select', stage.id)"
    >
      {{ stage.icon }} {{ stage.label }}
    </button>
  </nav>
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
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  overflow-x: auto;
  background: #fff;
  border-bottom: 1px solid #edf3fa;
}

.stage-tab {
  white-space: nowrap;
  height: 34px;
  padding: 0 13px;
  border-radius: 999px;
  color: #50617b;
  background: #f8fbff;
  border: 1px solid #dfe8f5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.stage-tab:disabled {
  opacity: .5;
  cursor: default;
}

.stage-tab:not(:disabled):hover {
  border-color: #2168f3;
  color: #2168f3;
}

.stage-tab.done {
  color: #18a66a;
  background: #eaf8f2;
  border-color: #c9ecd9;
}

.stage-tab.active {
  color: #fff;
  background: #2168f3;
  border-color: #2168f3;
  box-shadow: 0 10px 22px rgba(33, 104, 243, .18);
}
</style>
