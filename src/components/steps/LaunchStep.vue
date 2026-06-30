<template>
  <div class="step-launch">
    <!-- 企业卡片 -->
    <div class="info-section">
      <div class="section-label">尽调对象</div>
      <div class="enterprise-card">
        <div class="enterprise-card__name">{{ task.name }}</div>
        <div class="enterprise-card__grid">
          <div class="info-row"><span class="info-row__label">尽调类型</span><span>{{ task.type }}</span></div>
          <div class="info-row"><span class="info-row__label">业务金额</span><span class="amount">{{ task.amount }}</span></div>
          <div class="info-row"><span class="info-row__label">行业</span><span>{{ task.industry }}</span></div>
          <div class="info-row"><span class="info-row__label">地区</span><span>{{ task.region }}</span></div>
          <div class="info-row"><span class="info-row__label">负责人</span><span>{{ task.manager }}</span></div>
        </div>
      </div>
    </div>

    <!-- 自动能力 -->
    <div class="info-section">
      <div class="section-label">自动能力</div>
      <div class="capabilities">
        <div v-for="cap in task.autoCapabilities" :key="cap" class="capability-tag">
          <el-icon><CircleCheckFilled /></el-icon>
          <span>{{ cap }}</span>
        </div>
      </div>
    </div>

    <!-- 操作 -->
    <div class="action-section">
      <el-button type="primary" size="large" @click="launch">启动智能尽调</el-button>
      <el-button size="large" @click="saveDraft">保存草稿</el-button>
    </div>
  </div>
</template>

<script setup>
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['advance'])

function launch() {
  ElMessage.success('智能尽调已启动，正在自动推进流程...')
  setTimeout(() => {
    emit('advance')
    ElMessage.info('已进入主体核验步骤')
  }, 1200)
}

function saveDraft() {
  ElMessage.success('草稿已保存')
}
</script>

<style scoped>
.step-launch {
  max-width: 640px;
}

.info-section {
  margin-bottom: 24px;
}

.enterprise-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
}

.enterprise-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.enterprise-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row__label {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.info-row span:not(.info-row__label) {
  font-size: 13px;
  color: var(--color-text-primary);
}

.amount {
  color: var(--color-primary) !important;
  font-weight: 600;
}

.capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capability-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}
</style>
