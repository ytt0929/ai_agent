<template>
  <div class="step-materials">
    <!-- 状态概览 -->
    <div class="info-section">
      <div class="section-label">资料状态</div>
      <div class="material-stats">
        <div class="stat-item">
          <div class="stat-value" style="color: var(--color-success)">5</div>
          <div class="stat-label">已收到</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: var(--color-warning)">3</div>
          <div class="stat-label">待补充</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: var(--color-primary)">0</div>
          <div class="stat-label">待识别</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: var(--color-text-tertiary)">明天 09:00</div>
          <div class="stat-label">自动提醒</div>
        </div>
      </div>
    </div>

    <!-- 已上传文件 -->
    <div class="info-section">
      <div class="section-label">已上传文件</div>
      <div class="file-list">
        <div v-for="file in uploadedFiles" :key="file.id" class="file-row">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ file.size }}</span>
          <el-tag size="small" type="success" effect="plain">{{ file.status }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 待补充资料 -->
    <div class="info-section">
      <div class="section-label">待补充资料</div>
      <div class="missing-list">
        <div v-for="item in materialsList" :key="item.id" class="missing-row">
          <el-icon><WarningFilled /></el-icon>
          <span class="missing-name">{{ item.name }}</span>
          <el-tag size="small" :type="item.status === '待客户签署' ? 'warning' : 'info'" effect="plain">{{ item.status }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="action-section">
      <el-upload
        action="#"
        :auto-upload="false"
        :on-change="handleFileSelect"
        :show-file-list="false"
        multiple
      >
        <el-button type="primary" plain><el-icon><Upload /></el-icon> 上传文件</el-button>
      </el-upload>
      <el-button @click="sendLink">发送客户补充链接</el-button>
      <el-button type="primary" @click="$emit('advance')">进入证据整合</el-button>
    </div>
  </div>
</template>

<script setup>
import { Document, WarningFilled, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const uploadedFiles = [
  { id: 'f001', name: '2025年度审计报告.pdf', status: '已识别', size: '2.3MB' },
  { id: 'f002', name: '营业执照.pdf', status: '已识别', size: '1.1MB' },
  { id: 'f003', name: '法人身份证.jpg', status: '已识别', size: '856KB' },
  { id: 'f004', name: '近三年纳税申报表.xlsx', status: '已识别', size: '1.8MB' },
  { id: 'f005', name: '主要销售合同.pdf', status: '已识别', size: '3.2MB' },
]

const materialsList = [
  { id: 'm001', name: '财务报表附注', status: '待上传' },
  { id: 'm002', name: '主要采购合同', status: '待上传' },
  { id: 'm003', name: '征信授权书', status: '待客户签署' },
]

function handleFileSelect(file) {
  ElMessage.success(`已选择文件：${file.name}`)
}

function sendLink() {
  ElMessage.success('补充链接已生成并发送给客户')
}
</script>

<style scoped>
.step-materials { max-width: 640px; }
.info-section { margin-bottom: 24px; }
.material-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-item {
  background: var(--bg-page);
  border-radius: var(--radius-md);
  padding: 12px;
  text-align: center;
}
.stat-value { font-size: 20px; font-weight: 700; }
.stat-label { font-size: 11px; color: var(--color-text-tertiary); margin-top: 4px; }
.file-list, .missing-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-row, .missing-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 13px;
}
.file-name { flex: 1; color: var(--color-text-primary); }
.file-size { font-size: 12px; color: var(--color-text-tertiary); }
.missing-name { flex: 1; color: var(--color-text-primary); font-weight: 500; }
.action-section { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
</style>
