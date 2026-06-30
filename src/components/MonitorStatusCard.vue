<template>
  <div class="sidebar-card">
    <div class="sidebar-card__header">
      <span class="sidebar-card__icon">📡</span>
      <div class="sidebar-card__title-wrap">
        <h4 class="sidebar-card__title">{{ enterpriseName }}</h4>
        <span class="sidebar-card__subtitle">企业监控</span>
      </div>
    </div>

    <!-- 监控状态 -->
    <div class="monitor-status">
      <div class="monitor-status__badge">
        <span class="monitor-status__dot monitor-status__dot--active"></span>
        监控中
      </div>
      <div class="monitor-status__info">
        <div class="info-row">
          <span class="info-label">监控类型</span>
          <span class="info-value">工商变更 + 预警 + 税票异常</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ createdTime }}</span>
        </div>
      </div>
    </div>

    <!-- 模拟预警 -->
    <div v-if="warnings.length" class="monitor-warnings">
      <h5 class="monitor-warnings__title">⚠️ 模拟预警</h5>
      <div
        v-for="w in warnings"
        :key="w.time"
        class="monitor-warning-item"
        :class="'monitor-warning--' + w.level"
      >
        <div class="monitor-warning-item__time">{{ w.time }}</div>
        <div class="monitor-warning-item__content">{{ w.content }}</div>
      </div>
    </div>

    <div class="sidebar-card__actions">
      <span class="sidebar-card__hint">对话中继续监控...</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  enterpriseName: { type: String, required: true },
  createdTime: { type: String, default: '2026-06-28 10:30' },
})

defineEmits([])

// 模拟预警数据
const warnings = ref([
  { time: '2026-06-28 10:30', content: '检测到工商变更 — 法定代表人变更', level: 'warning' },
  { time: '2026-06-28 11:00', content: '检测到税务评级下降 — A级 → B级', level: 'danger' },
])
</script>

<style scoped>
.sidebar-card__header {
  display: flex; gap: 10px; align-items: flex-start;
  padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;
}
.sidebar-card__icon { font-size: 22px; }
.sidebar-card__title-wrap { flex: 1; min-width: 0; }
.sidebar-card__title { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #1a1a2e; }
.sidebar-card__subtitle { font-size: 12px; color: #94a3b8; }
.sidebar-card__actions { display: flex; gap: 8px; padding-top: 8px; }

.monitor-status {
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
  padding: 12px 14px; margin: 12px 0;
}
.monitor-status__badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #059669; margin-bottom: 8px;
}
.monitor-status__dot {
  width: 8px; height: 8px; border-radius: 50%;
  animation: pulse 2s infinite;
}
.monitor-status__dot--active { background: #10b981; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.monitor-status__info { display: flex; flex-direction: column; gap: 4px; }

.info-row { display: flex; justify-content: space-between; font-size: 12.5px; padding: 2px 0; }
.info-label { color: #94a3b8; }
.info-value { color: #334155; font-weight: 500; }

.monitor-warnings { margin-top: 16px; }
.monitor-warnings__title {
  margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #334155;
}

.monitor-warning-item {
  padding: 8px 10px; border-radius: 6px; margin-bottom: 6px;
  background: #f8fafc; border: 1px solid #e5e7eb;
}
.monitor-warning--warning { background: #fffbeb; border-color: #fde68a; }
.monitor-warning--danger { background: #fef2f2; border-color: #fecaca; }

.monitor-warning-item__time { font-size: 11px; color: #94a3b8; margin-bottom: 2px; }
.monitor-warning-item__content { font-size: 12px; color: #334155; line-height: 1.4; }
</style>
