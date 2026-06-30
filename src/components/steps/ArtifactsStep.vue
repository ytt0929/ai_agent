<template>
  <div class="step-artifacts">
    <div class="info-section">
      <div class="section-label">尽调产物概览</div>
      <div class="artifact-grid">
        <div v-for="artifact in artifacts" :key="artifact.name" class="artifact-card card-animate">
          <div class="artifact-icon" :style="{ background: artifact.bg, color: artifact.color }">
            <el-icon><component :is="artifact.icon" /></el-icon>
          </div>
          <div class="artifact-info">
            <div class="artifact-name">{{ artifact.name }}</div>
            <div class="artifact-status" :style="{ color: artifact.color }">{{ artifact.status }}</div>
          </div>
          <div class="artifact-count">{{ artifact.count }}</div>
        </div>
      </div>
    </div>
    <div class="info-section">
      <div class="section-label">待确认结论</div>
      <div class="confirm-list">
        <div v-for="(item, idx) in confirmItems" :key="idx" class="confirm-row">
          <el-checkbox v-model="item.checked" />
          <span class="confirm-title">{{ item.title }}</span>
          <el-tag size="small" type="warning" effect="plain" v-if="!item.checked">待确认</el-tag>
          <el-tag size="small" type="success" effect="plain" v-else>已确认</el-tag>
        </div>
      </div>
    </div>
    <div class="action-section">
      <el-button @click="enterReport">进入智能报告</el-button>
      <el-button @click="exportPack">导出产物包</el-button>
      <el-button type="primary" @click="submitConfirm">提交确认</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Files, Warning, Document, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const artifacts = [
  { name: '证据包', status: '已生成', count: '31条证据', icon: Files, bg: 'var(--color-primary-bg)', color: 'var(--color-primary)' },
  { name: '风险诊断摘要', status: '已生成', count: '8项风险', icon: Warning, bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  { name: '尽调报告草稿', status: 'V2待确认', count: '3处待确认', icon: Document, bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' },
  { name: '客户补充清单', status: '可发送', count: '3项资料', icon: List, bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
]

const confirmItems = ref([
  { title: '税票授权缺口说明', checked: false },
  { title: '法人关联企业说明', checked: false },
  { title: '偿债能力结论', checked: false },
])

function enterReport() {
  ElMessage.info('正在打开智能报告编辑器...')
  router.push({
    path: '/smart-report',
    query: { source: 'artifacts' },
  })
}

function exportPack() {
  ElMessage.success('产物包已生成并开始下载')
}

function submitConfirm() {
  const unchecked = confirmItems.value.filter(i => !i.checked)
  if (unchecked.length > 0) {
    ElMessage.warning(`还有 ${unchecked.length} 项待确认，请全部确认后再提交`)
    return
  }
  ElMessage.success('尽调报告已提交确认，所有产物已归档')
}
</script>

<style scoped>
.step-artifacts { max-width: 640px; }
.info-section { margin-bottom: 24px; }
.artifact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.artifact-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.artifact-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.artifact-info { flex: 1; min-width: 0; }
.artifact-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.artifact-status { font-size: 11px; margin-top: 2px; }
.artifact-count { font-size: 12px; color: var(--color-text-tertiary); flex-shrink: 0; }
.confirm-list { display: flex; flex-direction: column; gap: 8px; }
.confirm-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 13px;
}
.confirm-title { flex: 1; color: var(--color-text-primary); }
.action-section { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
</style>
