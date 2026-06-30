<template>
  <div class="step-evidence">
    <!-- 证据概览 -->
    <div class="info-section">
      <div class="section-label">证据整合概览</div>
      <div class="evidence-stats">
        <div class="stat-card card-animate" style="--stagger: 1">
          <div class="stat-icon" style="background: var(--color-primary-bg); color: var(--color-primary)">
            <el-icon><Files /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">31</div>
            <div class="stat-label">有效证据</div>
          </div>
        </div>
        <div class="stat-card card-animate" style="--stagger: 2">
          <div class="stat-icon" style="background: var(--color-success-bg); color: var(--color-success)">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">92%</div>
            <div class="stat-label">核心维度覆盖率</div>
          </div>
        </div>
        <div class="stat-card card-animate" style="--stagger: 3">
          <div class="stat-icon" style="background: var(--color-warning-bg); color: var(--color-warning)">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">78%</div>
            <div class="stat-label">税票维度覆盖率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 证据维度 -->
    <div class="info-section">
      <div class="section-label">证据维度分布</div>
      <div class="evidence-dimensions">
        <div v-for="dim in dimensions" :key="dim.name" class="dim-row">
          <span class="dim-name">{{ dim.name }}</span>
          <div class="dim-bar">
            <div class="dim-fill" :style="{ width: dim.pct + '%', background: dim.color }"></div>
          </div>
          <span class="dim-pct">{{ dim.pct }}%</span>
        </div>
      </div>
    </div>

    <div class="action-section">
      <el-button @click="viewDetail">查看证据详情</el-button>
      <el-button type="primary" @click="$emit('advance')">进入风险诊断</el-button>
    </div>
  </div>
</template>

<script setup>
import { Files, TrendCharts, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const dimensions = [
  { name: '工商信息', pct: 100, color: 'var(--color-success)' },
  { name: '司法涉诉', pct: 95, color: 'var(--color-success)' },
  { name: '财务报表', pct: 90, color: 'var(--color-primary)' },
  { name: '税票数据', pct: 78, color: 'var(--color-warning)' },
  { name: '合同文件', pct: 85, color: 'var(--color-primary)' },
]

function viewDetail() {
  ElMessage.info('证据详情：31条证据，覆盖工商、税票、合同、财务等维度')
}
</script>

<style scoped>
.step-evidence { max-width: 640px; }
.info-section { margin-bottom: 24px; }
.evidence-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.stat-value { font-size: 20px; font-weight: 700; color: var(--color-text-primary); }
.stat-label { font-size: 11px; color: var(--color-text-tertiary); margin-top: 2px; }
.evidence-dimensions { display: flex; flex-direction: column; gap: 10px; }
.dim-row { display: flex; align-items: center; gap: 10px; }
.dim-name { font-size: 13px; color: var(--color-text-secondary); min-width: 70px; }
.dim-bar { flex: 1; height: 8px; background: var(--bg-page); border-radius: 4px; overflow: hidden; }
.dim-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.dim-pct { font-size: 12px; color: var(--color-text-tertiary); min-width: 36px; text-align: right; }
.action-section { display: flex; gap: 12px; margin-top: 24px; }
</style>
