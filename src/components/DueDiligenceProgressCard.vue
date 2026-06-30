<template>
  <div class="sidebar-card">
    <div class="sidebar-card__header">
      <div class="work-head">
        <div>
          <h3>{{ task.name }}</h3>
          <span class="sidebar-card__subtitle">尽调任务 · {{ task.id }}</span>
        </div>
        <span class="tag tag--amber">进行中</span>
      </div>
    </div>

    <!-- Progress -->
    <div class="dd-progress">
      <el-progress
        :percentage="task.progress"
        :status="task.progress === 100 ? 'success' : ''"
        :stroke-width="10"
        :show-text="false"
      />
      <div class="dd-progress-label">
        <span>进度 {{ task.progress }}%</span>
        <span>{{ completedCount }}/{{ totalSteps }}</span>
      </div>
    </div>

    <!-- Steps -->
    <div class="dd-steps">
      <div
        v-for="(step, idx) in steps"
        :key="step.key"
        class="dd-step"
        :class="`dd-step--${step.state}`"
      >
        <div class="dd-step__header">
          <span class="dd-step__number">{{ idx + 1 }}</span>
          <span class="dd-step__name">{{ step.label }}</span>
          <span class="dd-step__status">{{ step.statusIcon }}</span>
        </div>
        <div v-if="step.detail" class="dd-step__detail">{{ step.detail }}</div>
        <div v-if="step.actions && step.actions.length" class="dd-step__actions">
          <el-button
            v-for="btn in step.actions"
            :key="btn.label"
            size="small"
            :type="btn.type || 'default'"
            plain
            @click="$emit('action', btn)"
          >
            {{ btn.label }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- Recommend -->
    <div class="recommend-card">
      <h4>流程说明</h4>
      <p>尽调任务已创建，系统将自动推进主体核验、税票采集、资料上传等流程。您可以在对话中随时查看进度。</p>
    </div>

    <div class="sidebar-card__actions" v-if="task.progress < 100">
      <span class="sidebar-card__hint">对话中继续推进流程...</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
})

defineEmits(['action'])

const totalSteps = 6
const completedCount = computed(() => {
  return steps.value.filter(s => s.state === 'done').length
})

const steps = computed(() => {
  const t = props.task
  const stepDefs = [
    { key: 'launch', label: '工商核验' },
    { key: 'tax-rpa', label: '税票采集' },
    { key: 'materials', label: '资料上传' },
    { key: 'analysis', label: 'AI分析' },
    { key: 'report', label: '报告生成' },
    { key: 'confirm', label: '报告确认' },
  ]

  return stepDefs.map(def => {
    const storeStep = t.steps?.[def.key]
    const state = storeStep?.state || 'idle'
    return {
      ...def,
      state,
      statusIcon: state === 'done' ? '✓' : state === 'running' ? '⟳' : state === 'error' ? '✗' : '·',
      detail: storeStep?.description || '',
      actions: storeStep?.actions || [],
    }
  })
})
</script>

<style scoped>
.sidebar-card { font-size: 13px; }

.sidebar-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf3fa;
}

.work-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.work-head h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #10213f;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.tag--amber {
  color: #d98712;
  background: #fff5e4;
}

.sidebar-card__subtitle {
  font-size: 12px;
  color: #93a1b5;
}

.dd-progress { margin: 12px 0 16px; }

.dd-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #93a1b5;
  margin-top: 4px;
}

.dd-steps { display: flex; flex-direction: column; gap: 6px; }

.dd-step {
  padding: 10px 12px;
  background: #f8fbff;
  border-radius: 8px;
  border-left: 3px solid #edf3fa;
  transition: all .15s;
}

.dd-step--done {
  border-left-color: #18a66a;
  background: #eaf8f2;
}

.dd-step--running {
  border-left-color: #2168f3;
  background: #eaf2ff;
}

.dd-step--error {
  border-left-color: #dc4c49;
  background: #fef2f2;
}

.dd-step__header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }

.dd-step__number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #edf3fa;
  color: #93a1b5;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
}

.dd-step--done .dd-step__number {
  background: #18a66a;
  color: #fff;
}

.dd-step--running .dd-step__number {
  background: #2168f3;
  color: #fff;
}

.dd-step__name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #10213f;
}

.dd-step__status { font-size: 14px; }

.dd-step__detail {
  font-size: 12px;
  color: #66758e;
  padding: 4px 0 0 28px;
  line-height: 1.4;
}

.dd-step__actions { display: flex; gap: 6px; padding-top: 6px; }

/* Recommend */
.recommend-card {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #c9ecd9;
  border-radius: 8px;
  background: #eaf8f2;
}

.recommend-card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #18a66a;
}

.recommend-card p {
  margin: 0;
  color: #365241;
  font-size: 13px;
  line-height: 1.7;
}

.sidebar-card__actions { display: flex; gap: 8px; padding-top: 8px; }
.sidebar-card__hint { font-size: 12px; color: #93a1b5; padding-top: 4px; }
</style>
