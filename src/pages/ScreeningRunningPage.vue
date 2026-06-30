<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">智能筛客</h1>
        <p class="page-subtitle">AI 正在理解条件并匹配企业</p>
      </div>
    </div>

    <!-- Submitted Query -->
    <div class="query-display card-animate">
      <div class="query-label">你的筛选条件</div>
      <div class="query-text">"{{ store.queryText }}"</div>
    </div>

    <!-- Parsed Tags -->
    <div class="tags-section card-animate">
      <div class="section-label">AI 已解析</div>
      <div class="parsed-chips">
        <div
          v-for="(tag, i) in store.parsedTags"
          :key="i"
          class="parsed-chip"
          :style="{ animationDelay: (i * 0.15) + 's' }"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <!-- Progress Steps -->
    <div class="progress-section card-animate">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="step-item"
        :class="step.status"
      >
        <div class="step-indicator">
          <transition name="pop" mode="out-in">
            <div v-if="step.status === 'done'" class="step-check">
              <el-icon><Check /></el-icon>
            </div>
            <div v-else-if="step.status === 'active'" class="step-spinner">
              <div class="spinner-dot"></div>
            </div>
            <div v-else class="step-pending"></div>
          </transition>
        </div>
        <div class="step-info">
          <div class="step-label">{{ step.label }}</div>
          <transition name="fade" mode="out-in">
            <div v-if="step.status === 'done'" class="step-result">{{ step.result }}</div>
            <div v-else-if="step.status === 'active'" class="step-loading">{{ step.loadingText }}</div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Dynamic Numbers -->
    <div class="metrics-section card-animate">
      <div class="metric-card">
        <div class="metric-value" style="color: #2563eb">
          <animated-number :target="matchedCount" :duration="1800" />
        </div>
        <div class="metric-label">已匹配</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #10b981">
          <animated-number :target="highMatchCount" :duration="2000" />
        </div>
        <div class="metric-label">高匹配企业</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #f59e0b">
          <animated-number :target="transferCount" :duration="2200" />
        </div>
        <div class="metric-label">可转尽调</div>
      </div>
    </div>

    <!-- Skeleton Preview -->
    <div class="skeleton-section card-animate">
      <div class="skeleton-title">AI 正在生成筛选结果</div>
      <div class="skeleton-table">
        <div class="skeleton-header">
          <div class="skeleton-cell w-40"></div>
          <div class="skeleton-cell w-20"></div>
          <div class="skeleton-cell w-25"></div>
          <div class="skeleton-cell w-15"></div>
        </div>
        <div
          v-for="i in 3"
          :key="i"
          class="skeleton-row"
          :class="{ 'pulse': progress < 100 }"
        >
          <div class="skeleton-cell w-40"></div>
          <div class="skeleton-cell w-20"></div>
          <div class="skeleton-cell w-25"></div>
          <div class="skeleton-cell w-15"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check } from '@element-plus/icons-vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'
import { useScreeningStore } from '../stores/screening'

const router = useRouter()
const store = useScreeningStore()

const matchedCount = ref(0)
const highMatchCount = ref(0)
const transferCount = ref(0)

const steps = ref([
  { label: '理解筛选条件', status: 'active', loadingText: '正在解析自然语言...', result: '已识别 5 个筛选维度' },
  { label: '匹配企业库', status: 'pending', loadingText: '正在扫描企业数据...', result: '已匹配 86 家企业' },
  { label: '生成推荐名单', status: 'pending', loadingText: '正在排序推荐...', result: '已生成 Top 50 名单' },
])

onMounted(() => {
  runAnimation()
})

function runAnimation() {
  // Step 1: understanding (active → done)
  setTimeout(() => {
    steps.value[0].status = 'done'
    steps.value[1].status = 'active'
    matchedCount.value = 32
  }, 1200)

  // Step 2: matching (active → done)
  setTimeout(() => {
    steps.value[1].status = 'done'
    steps.value[2].status = 'active'
    matchedCount.value = 86
    highMatchCount.value = 24
  }, 2800)

  // Step 3: generating (active → done)
  setTimeout(() => {
    steps.value[2].status = 'done'
    matchedCount.value = 86
    highMatchCount.value = 24
    transferCount.value = 7
  }, 4500)

  // Auto navigate
  setTimeout(() => {
    store.loadResults()
    router.push('/screening/results')
  }, 5200)
}
</script>

<style scoped>
.page {
  padding: 24px 32px;
  max-width: 720px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 13px;
  color: #94a3b8;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 10px;
}

/* Query Display */
.query-display {
  margin: 20px 0;
}

.query-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.query-text {
  font-size: 14px;
  color: #2563eb;
  font-weight: 500;
  background: #eef2ff;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #dbe7f5;
}

/* Parsed Tags */
.tags-section {
  margin-bottom: 24px;
}

.parsed-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.parsed-chip {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #dbe7f5;
  border-radius: 20px;
  font-size: 12.5px;
  color: #2563eb;
  font-weight: 500;
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Progress Steps */
.progress-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  border: 1px solid #dbe7f5;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 0;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: 38px;
  width: 2px;
  height: calc(100% - 38px);
  background: #e5eaf2;
}

.step-item.done:not(:last-child)::after {
  background: #d1fae5;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.step-item.pending .step-indicator {
  background: #f1f5f9;
}

.step-item.active .step-indicator {
  background: #eef2ff;
}

.step-item.done .step-indicator {
  background: #10b981;
}

.step-pending {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
}

.spinner-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2563eb;
  animation: dot-blink 1.2s ease-in-out infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.7); }
}

.step-check {
  color: #fff;
  font-size: 16px;
}

.step-info {
  flex: 1;
  padding-top: 2px;
}

.step-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #1a1a2e;
  transition: color 0.3s;
}

.step-item.done .step-label {
  color: #10b981;
}

.step-item.active .step-label {
  color: #2563eb;
}

.step-result {
  font-size: 12px;
  color: #10b981;
  margin-top: 3px;
  font-weight: 500;
}

.step-loading {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 3px;
}

/* Metrics */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border-radius: 8px;
  padding: 18px;
  text-align: center;
  border: 1px solid #dbe7f5;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.3s;
}

.metric-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Skeleton */
.skeleton-section {
  margin-bottom: 16px;
}

.skeleton-title {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.skeleton-table {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #dbe7f5;
  overflow: hidden;
}

.skeleton-header {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #f7faff;
  border-bottom: 1px solid #e5eaf2;
}

.skeleton-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.skeleton-row:last-child { border-bottom: none; }

.skeleton-row.pulse .skeleton-cell {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.skeleton-cell {
  height: 12px;
  border-radius: 4px;
  background: #e5eaf2;
}

.w-40 { flex: 0 0 40%; }
.w-25 { flex: 0 0 25%; }
.w-20 { flex: 0 0 20%; }
.w-15 { flex: 0 0 15%; }

/* Transitions */
.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0);
}

.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
}
</style>
