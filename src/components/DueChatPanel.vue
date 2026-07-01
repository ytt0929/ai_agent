<template>
  <div class="ai-assistant-panel due-chat-panel">
    <!-- 标题 -->
    <div class="ai-assistant-panel__header">
      <span class="ai-assistant-panel__title">尽调对话</span>
    </div>

    <!-- AI 判断卡 -->
    <div class="due-chat-panel__insight" v-if="insightMessage">
      <div class="insight-icon"><el-icon><ChatDotRound /></el-icon></div>
      <div class="insight-text">{{ insightMessage }}</div>
    </div>

    <!-- 对话消息 -->
    <div class="ai-assistant-panel__messages">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="ai-message"
        :class="msg.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'"
      >
        <div class="ai-message__avatar">{{ msg.role === 'ai' ? 'AI' : '我' }}</div>
        <div class="ai-message__bubble">{{ msg.content }}</div>
      </div>
    </div>

    <!-- 快捷 chips -->
    <div class="ai-assistant-panel__quick" v-if="chips.length">
      <div
        v-for="chip in chips"
        :key="chip"
        class="due-chat-chip"
        @click="handleChip(chip)"
      >
        {{ chip }}
      </div>
    </div>

    <!-- 输入框 -->
    <div class="ai-assistant-panel__footer">
      <el-input
        v-model="store.chatInput"
        placeholder="输入问题..."
        size="small"
        clearable
        class="due-chat-input"
        @keyup.enter="sendMessage"
      />
      <button class="ai-assistant-panel__send" @click="sendMessage" :disabled="!store.chatInput.trim()">发送</button>
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
  emit('actionTrigger', chip)
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
.due-chat-panel {
  /* inherits .ai-assistant-panel */
}

/* AI 判断卡 */
.due-chat-panel__insight {
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

/* Chips in quick zone */
.due-chat-chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.due-chat-chip:hover {
  background: var(--color-primary);
  color: #fff;
}

/* Override el-input to blend with unified input */
.due-chat-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: none !important;
  border: 1px solid var(--border-color);
  padding: 0 12px;
}

.due-chat-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08) !important;
}
</style>
