<template>
  <div class="step-tax">
    <div class="info-section">
      <div class="section-label">税票RPA状态</div>
      <div class="tax-card">
        <div class="tax-status-row">
          <span class="tax-status-label">授权状态</span>
          <el-tag type="warning" effect="light" round size="small">等待客户授权</el-tag>
        </div>
        <div class="tax-status-row">
          <span class="tax-status-label">RPA 状态</span>
          <span class="tax-status-value">待启动</span>
        </div>
        <div class="tax-status-row">
          <span class="tax-status-label">授权有效期</span>
          <span class="tax-status-value">24小时</span>
        </div>
        <div class="tax-status-row">
          <span class="tax-status-label">下次提醒</span>
          <span class="tax-status-value">明天 09:00</span>
        </div>
      </div>
    </div>

    <!-- 授权链接 -->
    <div class="info-section">
      <div class="section-label">授权链接</div>
      <div class="link-box">
        <span class="link-url">https://demo.ai-copilot.com/auth/dd001/tax-rpa</span>
        <el-button text type="primary" @click="copyLink">复制</el-button>
      </div>
      <div class="qr-placeholder">
        <el-icon><View /></el-icon>
        <span>二维码占位</span>
      </div>
    </div>

    <!-- 本步骤产出 -->
    <div class="info-section">
      <div class="section-label">本步骤产出</div>
      <div class="output-tags">
        <span class="output-tag">税票采集记录</span>
        <span class="output-tag">纳税趋势摘要</span>
        <span class="output-tag">税票证据</span>
      </div>
    </div>

    <div class="action-section">
      <el-button @click="copyLink">复制授权链接</el-button>
      <el-button @click="sendReminder">发送提醒</el-button>
      <el-button type="primary" @click="switchUpload">改为上传材料</el-button>
    </div>
  </div>
</template>

<script setup>
import { View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

function copyLink() {
  ElMessage.success('授权链接已复制到剪贴板')
}
function sendReminder() {
  ElMessage.success('已发送客户提醒，下次提醒时间：明天 09:00')
}
function switchUpload() {
  ElMessage.info('已切换到上传模式')
}
</script>

<style scoped>
.step-tax { max-width: 640px; }
.info-section { margin-bottom: 24px; }
.tax-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tax-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tax-status-label { font-size: 13px; color: var(--color-text-secondary); }
.tax-status-value { font-size: 13px; color: var(--color-text-primary); font-weight: 500; }
.link-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 14px;
}
.link-url { flex: 1; font-size: 12px; color: var(--color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qr-placeholder {
  margin-top: 12px;
  width: 120px;
  height: 120px;
  background: var(--bg-page);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--color-text-tertiary);
  font-size: 12px;
}
.output-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.output-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-full);
}
.action-section { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
</style>
