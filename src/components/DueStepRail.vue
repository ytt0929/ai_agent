<template>
  <div class="step-rail">
    <div
      v-for="(step, idx) in steps"
      :key="step.key"
      class="step-rail__item"
      :class="{
        'step-rail__item--active': step.key === currentStep,
        'step-rail__item--done': stepStates[step.key] === 'done',
      }"
      @click="$emit('step-click', step.key)"
    >
      <!-- 连接线 -->
      <div
        v-if="idx > 0"
        class="step-rail__line"
        :class="{ 'step-rail__line--done': stepStates[steps[idx - 1].key] === 'done' }"
      ></div>

      <!-- 步骤圆点 -->
      <div class="step-rail__dot" :class="getDotClass(step.key)">
        <el-icon v-if="stepStates[step.key] === 'done'"><Check /></el-icon>
        <el-icon v-else-if="stepStates[step.key] === 'active'"><Loading /></el-icon>
        <span v-else class="step-rail__num">{{ idx + 1 }}</span>
      </div>

      <!-- 标签 -->
      <div class="step-rail__label">{{ step.label }}</div>

      <!-- 状态 chip -->
      <div v-if="stepStates[step.key]" class="step-rail__chip" :class="getChipClass(step.key)">
        {{ getChipText(step.key) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: String, required: true },
  stepStates: { type: Object, default: () => ({}) },
})

defineEmits(['step-click'])

function getDotClass(key) {
  const state = props.stepStates[key]
  if (state === 'done') return 'step-rail__dot--done'
  if (state === 'active') return 'step-rail__dot--active'
  return ''
}

function getChipClass(key) {
  const state = props.stepStates[key]
  if (state === 'done') return 'chip--done'
  if (state === 'active') return 'chip--active'
  return 'chip--pending'
}

function getChipText(key) {
  const state = props.stepStates[key]
  if (state === 'done') return '已完成'
  if (state === 'active') return '进行中'
  return '待执行'
}
</script>

<style scoped>
.step-rail {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
}

.step-rail__item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s ease;
}

.step-rail__item:hover {
  background: var(--bg-page);
}

.step-rail__item--active {
  background: var(--color-primary-bg);
}

.step-rail__item--done {
  cursor: pointer;
}

/* 连接线 */
.step-rail__line {
  position: absolute;
  left: 26px;
  top: -10px;
  width: 2px;
  height: 10px;
  background: var(--border-color-light);
}

.step-rail__line--done {
  background: var(--color-success);
}

/* 圆点 */
.step-rail__dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-page);
  color: var(--color-text-tertiary);
  border: 2px solid var(--border-color);
  margin-top: 1px;
  transition: all 0.2s ease;
}

.step-rail__dot--done {
  background: var(--color-success);
  color: #fff;
  border-color: var(--color-success);
}

.step-rail__dot--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.step-rail__dot--active .step-rail__num,
.step-rail__dot--active .el-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 标签 */
.step-rail__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.step-rail__item--active .step-rail__label {
  color: var(--color-primary);
  font-weight: 600;
}

.step-rail__item--done .step-rail__label {
  color: var(--color-text-primary);
}

/* Chip */
.step-rail__chip {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
  flex-shrink: 0;
}

.chip--done {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.chip--active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.chip--pending {
  background: var(--bg-page);
  color: var(--color-text-tertiary);
}
</style>
