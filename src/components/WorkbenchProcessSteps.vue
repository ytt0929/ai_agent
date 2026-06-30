<template>
  <div class="process-card">
    <h3 class="process-card__title">AI 执行过程</h3>
    <div class="process-list">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="process-step"
        :class="step.status"
      >
        <div class="process-step__connector">
          <span class="process-step__dot" :class="`dot--${step.status}`">
            <template v-if="step.status === 'done'">✓</template>
            <template v-else-if="step.status === 'running'">⟳</template>
            <template v-else-if="step.status === 'waiting'">·</template>
            <template v-else-if="step.status === 'warn'">!</template>
          </span>
          <span v-if="idx < steps.length - 1" class="process-step__line"></span>
        </div>
        <div class="process-step__content">
          <!-- Phase label (optional) -->
          <span v-if="step.phase" class="process-step__phase" :class="`phase--${step.status}`">
            {{ step.phase }}
          </span>
          <div class="process-step__title">{{ step.title }}</div>
          <!-- Details -->
          <div v-if="step.details && step.details.length" class="process-step__details">
            <div
              v-for="(d, di) in step.details"
              :key="di"
              class="detail-item"
            >
              <span class="detail-item__label">{{ d.label }}</span>
              <span class="detail-item__value">{{ d.value }}</span>
            </div>
          </div>
          <!-- Single detail string -->
          <p v-else-if="step.detail" class="process-step__detail-text">{{ step.detail }}</p>
        </div>
      </div>

      <!-- Waiting for input -->
      <div v-if="waitingForInput" class="process-step waiting">
        <div class="process-step__connector">
          <span class="process-step__dot dot--waiting">·</span>
        </div>
        <div class="process-step__content">
          <div class="process-step__title">等待用户输入...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  steps: { type: Array, default: () => [] },
  waitingForInput: { type: Boolean, default: false },
})
</script>

<style scoped>
.process-card {
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
}

.process-card__title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: #10213f;
  display: flex;
  align-items: center;
  gap: 6px;
}

.process-list {
  display: flex;
  flex-direction: column;
}

/* ====== Step ====== */
.process-step {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  padding-bottom: 4px;
}

/* Connector (dot + vertical line) */
.process-step__connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.process-step__dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  z-index: 1;
  flex-shrink: 0;
}

.dot--done {
  background: #18a66a;
  color: #fff;
}

.dot--running {
  background: #2168f3;
  color: #fff;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dot--waiting {
  background: #edf3fa;
  color: #93a1b5;
}

.dot--warn {
  background: #d98712;
  color: #fff;
}

.process-step__line {
  width: 1px;
  flex: 1;
  min-height: 8px;
  background: #dfe8f5;
  margin-top: 2px;
}

/* ====== Content ====== */
.process-step__content {
  padding: 2px 0 10px;
}

/* Phase label */
.process-step__phase {
  display: inline-flex;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 4px;
}

.phase--done {
  color: #18a66a;
  background: #eaf8f2;
}

.phase--running {
  color: #2168f3;
  background: #eaf2ff;
}

.phase--waiting {
  color: #93a1b5;
  background: #edf3fa;
}

.phase--warn {
  color: #d98712;
  background: #fff5e4;
}

/* Title */
.process-step__title {
  font-size: 13px;
  font-weight: 700;
  color: #33425b;
  line-height: 1.5;
}

/* Detail items grid */
.process-step__details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 8px;
  margin-top: 6px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 0;
  font-size: 12px;
}

.detail-item__label {
  color: #93a1b5;
  font-weight: 600;
  flex-shrink: 0;
}

.detail-item__value {
  color: #10213f;
  font-weight: 700;
  text-align: right;
}

/* Single detail text */
.process-step__detail-text {
  font-size: 12px;
  color: #66758e;
  margin: 4px 0 0;
  line-height: 1.5;
}
</style>
