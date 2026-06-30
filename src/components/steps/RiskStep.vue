<template>
  <div class="step-risk">
    <!-- 风险概览 -->
    <div class="info-section">
      <div class="section-label">风险诊断摘要</div>
      <div class="risk-summary">
        <div class="risk-count high"><span>2</span><em>高风险</em></div>
        <div class="risk-count medium"><span>2</span><em>中风险</em></div>
        <div class="risk-count low"><span>2</span><em>低风险</em></div>
      </div>
    </div>

    <!-- 风险列表 -->
    <div class="info-section">
      <div class="section-label">风险事项明细</div>
      <div class="risk-list">
        <div v-for="(item, idx) in riskItems" :key="idx" class="risk-item-card">
          <div class="risk-item__header">
            <span class="risk-level" :class="item.level">{{ getLevelLabel(item.level) }}</span>
            <span class="risk-title">{{ item.title }}</span>
          </div>
          <p class="risk-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <div class="action-section">
      <el-button @click="viewDetail">查看风险详情</el-button>
      <el-button type="primary" @click="$emit('advance')">进入产物确认</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const riskItems = [
  { level: 'high', title: '税票数据授权存在缺口', desc: '客户仅授权2025年数据，2024年税票缺失' },
  { level: 'high', title: '法人关联企业异常', desc: '法人张某某名下3家关联企业，其中1家已注销未披露' },
  { level: 'medium', title: '应收账款集中度高', desc: '前两大客户占比68%，存在依赖风险' },
  { level: 'medium', title: '存货周转率下降', desc: '近三个季度连续下降，需关注滞销情况' },
  { level: 'low', title: '环保处罚记录', desc: '2024年有一次轻微环保处罚，已整改' },
  { level: 'low', title: '社保缴纳人数波动', desc: '近6个月缴纳人数波动较大，需核实用工情况' },
]

function getLevelLabel(level) {
  return { high: '高风险', medium: '中风险', low: '低风险' }[level]
}

function viewDetail() {
  ElMessage.info('共8项风险，其中2项高风险需重点关注')
}
</script>

<style scoped>
.step-risk { max-width: 640px; }
.info-section { margin-bottom: 24px; }
.risk-summary {
  display: flex;
  gap: 16px;
}
.risk-count {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}
.risk-count span {
  display: block;
  font-size: 24px;
  font-weight: 700;
}
.risk-count em {
  display: block;
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
  font-style: normal;
}
.risk-count.high span { color: var(--color-danger); }
.risk-count.medium span { color: var(--color-warning); }
.risk-count.low span { color: var(--color-text-secondary); }
.risk-list { display: flex; flex-direction: column; gap: 10px; }
.risk-item-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  transition: border-color 0.15s;
}
.risk-item-card:hover { border-color: var(--color-primary-border); }
.risk-item__header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.risk-level {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
}
.risk-level.high { background: var(--color-danger-bg); color: var(--color-danger); }
.risk-level.medium { background: var(--color-warning-bg); color: var(--color-warning); }
.risk-level.low { background: var(--bg-page); color: var(--color-text-secondary); }
.risk-title { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.risk-desc { font-size: 12px; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
.action-section { display: flex; gap: 12px; margin-top: 24px; }
</style>
