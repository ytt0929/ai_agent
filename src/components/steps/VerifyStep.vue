<template>
  <div class="step-verify">
    <div class="info-section">
      <div class="section-label">主体核验结果</div>
      <div class="verify-card">
        <div class="verify-item">
          <el-icon class="verify-ok"><CircleCheckFilled /></el-icon>
          <div>
            <div class="verify-title">工商登记信息</div>
            <div class="verify-desc">统一社会信用代码、注册资本、法定代表人已核验</div>
          </div>
        </div>
        <div class="verify-item">
          <el-icon class="verify-ok"><CircleCheckFilled /></el-icon>
          <div>
            <div class="verify-title">司法涉诉记录</div>
            <div class="verify-desc">未发现重大涉诉记录</div>
          </div>
        </div>
        <div class="verify-item">
          <el-icon class="verify-ok"><CircleCheckFilled /></el-icon>
          <div>
            <div class="verify-title">经营异常名录</div>
            <div class="verify-desc">未被列入经营异常名录</div>
          </div>
        </div>
        <div class="verify-item">
          <el-icon class="verify-warn"><WarningFilled /></el-icon>
          <div>
            <div class="verify-title">行政处罚记录</div>
            <div class="verify-desc">2024年有一次轻微环保处罚，已整改</div>
          </div>
        </div>
      </div>
    </div>
    <div class="action-section">
      <el-button type="primary" @click="$emit('advance')">进入税票RPA</el-button>
    </div>
  </div>
</template>

<script setup>
import { CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.step-verify { max-width: 640px; }
.info-section { margin-bottom: 24px; }
.verify-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.verify-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.verify-item:hover { background: var(--bg-page); }
.verify-ok { color: var(--color-success); font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.verify-warn { color: var(--color-warning); font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.verify-title { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.verify-desc { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
.action-section { display: flex; gap: 12px; margin-top: 24px; }
</style>
