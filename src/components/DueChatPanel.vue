<template>
  <div class="chat-panel">
    <!-- 标题 -->
    <div class="chat-panel__header">
      <span class="chat-panel__title">尽调对话</span>
    </div>

    <!-- AI 判断卡 -->
    <div class="chat-panel__insight" v-if="insightMessage">
      <div class="insight-icon"><el-icon><ChatDotRound /></el-icon></div>
      <div class="insight-text">{{ insightMessage }}</div>
    </div>

    <!-- 对话消息 -->
    <div class="chat-panel__messages">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="chat-msg"
        :class="msg.role === 'ai' ? 'chat-msg--ai' : 'chat-msg--user'"
      >
        <div class="chat-msg__bubble">{{ msg.content }}</div>
      </div>
    </div>

    <!-- 快捷 chips -->
    <div class="chat-panel__chips" v-if="chips.length">
      <div
        v-for="chip in chips"
        :key="chip"
        class="chat-chip"
        @click="handleChip(chip)"
      >
        {{ chip }}
      </div>
    </div>

    <!-- 输入框 -->
    <div class="chat-panel__input-area">
      <el-input
        v-model="store.chatInput"
        placeholder="输入问题..."
        size="small"
        clearable
        @keyup.enter="sendMessage"
      />
      <el-button type="primary" size="small" :icon="Promotion" circle @click="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { ChatDotRound, Promotion } from '@element-plus/icons-vue'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { stepChats, stepChips } from '../data/mockDueDiligence.js'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['stageChange', 'actionTrigger'])
const props = defineProps({
  stepKey: { type: String, required: true },
  taskId: { type: String, required: true },
})

const store = useDueDiligenceStore()

const messages = computed(() => {
  const key = `${props.taskId}-${props.stepKey}`
  return store.chatMessages[key] || stepChats[props.stepKey] || []
})

const insightMessage = computed(() => {
  const key = `${props.taskId}-${props.stepKey}`
  const msgs = store.chatMessages[key] || stepChats[props.stepKey] || []
  const insight = msgs.find(m => m.role === 'ai' && m.type === 'insight')
  return insight?.content || ''
})

const chips = computed(() => stepChips[props.stepKey] || [])

function handleChip(chip) {
  const action = store.handleChipAction(chip, props.stepKey)
  if (action.toast) ElMessage.success(action.toast)
  if (action.ai) {
    store.addChatMessage({ role: 'ai', content: action.ai, type: 'normal' })
  }
  store.addChatMessage({ role: 'user', content: chip })
  // Emit action-trigger so workspace can react
  emit('actionTrigger', chip)
  // Stage-switching chips
  if (chip.includes('风险诊断')) emit('stageChange', 'risk')
  if (chip.includes('产物确认')) emit('stageChange', 'artifacts')
  if (chip.includes('工商详情')) emit('stageChange', 'verify-business')
  if (chip.includes('司法风险')) emit('stageChange', 'verify-legal')
}

function sendMessage() {
  const input = store.chatInput.trim()
  if (!input) return
  store.addChatMessage({ role: 'user', content: input })
  store.chatInput = ''
  // mock AI reply
  setTimeout(() => {
    store.addChatMessage({
      role: 'ai',
      content: '收到，我正在处理您的请求。在 demo 中这是预设回复。',
      type: 'normal',
    })
  }, 500)
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-panel__header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
}

.chat-panel__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* AI 判断卡 */
.chat-panel__insight {
  margin: 12px;
  padding: 12px;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-shrink: 0;
}

.insight-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.insight-text {
  font-size: 12px;
  color: var(--color-text-primary);
  line-height: 1.5;
}

/* 消息区 */
.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-msg {
  display: flex;
}

.chat-msg__bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.chat-msg--ai .chat-msg__bubble {
  background: var(--surface-page);
  color: var(--text-primary);
  border-top-left-radius: 2px;
}

.chat-msg--user {
  justify-content: flex-end;
}

.chat-msg--user .chat-msg__bubble {
  background: var(--color-primary);
  color: #fff;
  border-top-right-radius: 2px;
}

/* Chips */
.chat-panel__chips {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
  border-top: 1px solid var(--border-soft);
}

.chat-chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.chat-chip:hover {
  background: var(--color-primary);
  color: #fff;
}

/* 输入区 */
.chat-panel__input-area {
  padding: 12px;
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-soft);
  flex-shrink: 0;
}

.chat-panel__input-area :deep(.el-input__wrapper) {
  border-radius: 20px;
}
</style>
