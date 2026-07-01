<template>
  <div class="conversation" ref="scrollRef">
    <div class="date-chip">{{ dateChip }}</div>

    <!-- Messages -->
    <div v-for="(msg, idx) in messages" :key="idx" class="ai-message" :class="msg.type === 'user' ? 'ai-message--user' : 'ai-message--ai'">
      <div class="ai-message__avatar">{{ msg.type === 'user' ? '我' : 'AI' }}</div>
      <div class="ai-message__bubble">
        <div v-if="msg.type === 'ai'" class="meta">
          <span class="pulse"></span>
          <span>AI Copilot</span>
          <span class="meta-time">{{ msg.time }}</span>
        </div>
        <div class="bubble-text">{{ msg.text }}<span v-if="msg.streaming" class="streaming-cursor"></span></div>

        <!-- Todos card -->
        <div v-if="msg.card === 'todos' && msg.todos" class="todos-card">
          <div v-for="t in msg.todos" :key="t.name" class="todo-row">
            <span class="todo-name">{{ t.name }}</span>
            <span class="todo-progress">{{ t.progress }}%</span>
            <span class="todo-status" :class="`status--${t.status}`">{{ t.status }}</span>
          </div>
        </div>
      </div>
    </div>

    
<!-- Process timeline for active stage -->
    <div v-if="activeStage && activeSteps.length" class="process-card">
      <h3>{{ activeStage.icon }} {{ activeStage.label }}</h3>
      <ul class="process-list">
        <li v-for="(step, si) in activeSteps" :key="si" :class="step.status">
          <span class="step-dot" :class="step.status">
            <template v-if="step.status === 'done'">✓</template>
            <template v-else-if="step.status === 'running'">⟳</template>
            <template v-else-if="step.status === 'warn'">!</template>
            <template v-else>·</template>
          </span>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div v-if="step.details && step.details.length" class="step-details">
              <div v-for="(d, di) in step.details" :key="di" class="detail-item">
                <span class="detail-label">{{ d.label }}</span>
                <span class="detail-value">{{ d.value }}</span>
              </div>
            </div>
          </div>
          <span class="step-status" :class="step.status">{{ statusLabel(step.status) }}</span>
        </li>
      </ul>
    </div>

    <!-- Thinking indicator -->
    <div v-if="isThinking" class="ai-message ai-message--ai">
      <div class="ai-message__avatar">AI</div>
      <div class="ai-message__bubble thinking">
        <div class="meta"><span class="pulse-dot thinking-pulse"></span><span>AI 正在执行</span></div>
        <div class="bubble-text thinking-text">{{ thinkingText }}</div>
      </div>
    </div>

    <!-- Waiting -->
    <div v-if="waitingForInput && !isThinking" class="ai-message ai-message--ai">
      <div class="ai-message__avatar">AI</div>
      <div class="ai-message__bubble">
        <div class="meta"><span class="pulse"></span><span>等待输入</span></div>
        <div class="bubble-text">可以继续补充问题，或选择下一步操作。</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const emit = defineEmits(['suggestion-click'])

const props = defineProps({
  messages: { type: Array, default: () => [] },
  flowStages: { type: Array, default: () => [] },
  waitingForInput: { type: Boolean, default: false },
  activeStageId: { type: String, default: null },
  isThinking: { type: Boolean, default: false },
  thinkingText: { type: String, default: '正在分析中...' },
  suggestions: { type: Array, default: () => [] },
})

const scrollRef = ref(null)

let scrollTimer = null
function scrollToBottomSoon() {
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  }, 50)
}

const activeStage = computed(() => {
  if (props.activeStageId) {
    const byId = props.flowStages.find(s => s.id === props.activeStageId)
    if (byId) return byId
  }
  return props.flowStages.find(s => s.status === 'active')
})

const activeSteps = computed(() => {
  return activeStage.value?.artifactData?.steps || []
})

const dateChip = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

function statusLabel(s) {
  return { done: '已完成', running: '进行中', warn: '预警', waiting: '等待中' }[s] || ''
}

// Auto-scroll: new messages
watch(() => props.messages.length, () => {
  scrollToBottomSoon()
})

// Auto-scroll: streaming text updates (same message, text growing)
watch(
  () => props.messages.map(m => m.text).join('|'),
  () => {
    scrollToBottomSoon()
  }
)
// Auto-scroll: active steps change
watch(() => activeSteps.value.length, () => {
  scrollToBottomSoon()
})
</script>

<style scoped>
.conversation {
  width: 100%;
  min-height: 0;
  overflow-y: visible;
  padding: 0;
  background: transparent;
}

.date-chip {
  width: max-content;
  margin: 0 auto 16px;
  padding: 4px 12px;
  border-radius: var(--el-border-radius-round, 999px);
  color: var(--el-text-color-secondary, var(--text-secondary, #64748b));
  background: var(--el-fill-color-light, var(--bg-table-header, #fafbfd));
  font-size: 12px;
  font-weight: 500;
}

/* ====== Message — reuse global .ai-message, override scoped tokens ====== */
.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
  width: 100%;
}

.message.ai {
  justify-content: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message.ai .ai-avatar {
  order: 0;
}

.message.ai .bubble {
  order: 1;
}

.message.user .bubble {
  order: 0;
}

.message.user .user-avatar {
  order: 1;
}

.ai-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center;
  color: #fff; background: var(--el-color-primary, var(--color-primary, #2563eb));
  font-weight: 600; font-size: 12px;
  flex-shrink: 0;
}

.user-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center;
  color: var(--el-text-color-regular, var(--text-secondary, #64748b)); background: var(--el-fill-color-light, var(--surface-page, var(--bg-page, #f7faff)));
  border: 1px solid var(--el-border-color, var(--border-default, var(--border-color, #dbe7f5)));
  font-weight: 600; font-size: 12px;
  flex-shrink: 0;
}

/* Bubble */
.bubble {
  padding: 8px 12px;
  border-radius: var(--el-border-radius-base, 8px);
  line-height: 1.6;
  font-size: 13px;
  word-break: break-word;
}

.bubble.ai {
  background: var(--el-fill-color-lighter, #f1f5f9);
  border: 1px solid var(--el-border-color-light, var(--border-default));
  color: var(--el-text-color-primary, var(--text-primary));
  border-top-left-radius: 4px;
  max-width: min(85%, 260px);
}

.bubble.user {
  background: var(--el-color-primary, var(--color-primary));
  color: #fff;
  border-top-right-radius: 4px;
  max-width: min(76%, 260px);
}

.meta {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 4px;
  color: var(--el-text-color-secondary, var(--text-secondary)); font-size: 11px; font-weight: 500;
}

.pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--el-color-success, var(--color-success));
  box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
}

.meta-time { color: var(--el-text-color-placeholder, var(--text-tertiary)); font-weight: 500; margin-left: auto; }

/* Todos card */
.todos-card {
  margin-top: 6px;
  border: 1px solid var(--el-border-color-light, #dfe8f5);
  border-radius: var(--el-border-radius-base, 8px);
  overflow: hidden;
  background: var(--el-bg-color, #fff);
}

.todo-row {
  display: grid;
  grid-template-columns: 1fr 60px 70px;
  padding: 8px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--el-border-color-lighter, #edf3fa);
  background: var(--el-bg-color, #fff);
}

.todo-row:last-child { border-bottom: none; }
.todo-name { font-weight: 600; color: #10213f; }
.todo-progress { color: #66758e; text-align: right; }
.todo-status { text-align: right; font-weight: 700; font-size: 12px; }
.status--待确认 { color: #d98712; }
.status--超时 { color: #dc4c49; }
.status--处理中 { color: var(--color-primary); }

/* ====== Process Card ====== */
.process-card {
  margin: 8px 0 14px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light, var(--border-default));
  border-radius: var(--el-border-radius-base, 8px);
  background: var(--el-bg-color, var(--surface-card));
  max-width: 100%;
  box-shadow: var(--el-box-shadow-lighter, none);
}

.process-card h3 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary, var(--text-primary));
}

.process-list {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: 0;
}

.process-list li {
  position: relative;
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 8px;
  padding: 0 0 8px;
  color: var(--el-text-color-regular, var(--text-secondary));
  font-size: 12px;
  font-weight: 500;
}

.process-list li::before {
  content: "";
  position: absolute;
  top: 25px; left: 12px;
  width: 1px;
  height: calc(100% - 22px);
  background: var(--border-default);
}

.process-list li:last-child { padding-bottom: 0; }
.process-list li:last-child::before { display: none; }

.step-dot {
  width: 22px; height: 22px; border-radius: 50%;
  display: grid; place-items: center;
  color: var(--el-text-color-placeholder, var(--text-tertiary)); background: var(--el-bg-color, var(--surface-page));
  font-size: 11px; font-weight: 600;
  z-index: 1;
}

.step-dot.done { color: #fff; background: var(--el-color-success, #10b981); }
.step-dot.running { color: #fff; background: var(--el-color-primary, #2168f3); box-shadow: 0 0 0 4px rgba(33, 104, 243, .12); }
.step-dot.warn { color: #fff; background: var(--el-color-warning, #d98712); }

.step-content { min-width: 0; }

.step-title {
  font-size: 12px; font-weight: 600; color: var(--el-text-color-regular, var(--text-secondary));
  line-height: 1.5;
}

.step-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px 6px;
  margin-top: 3px;
}

.detail-item {
  display: flex; justify-content: space-between;
  gap: 4px; font-size: 11px;
}

.detail-label { color: var(--el-text-color-placeholder, var(--text-tertiary)); font-weight: 500; flex-shrink: 0; }
.detail-value { color: var(--el-text-color-primary, var(--text-primary)); font-weight: 600; text-align: right; }

.step-status {
  font-size: 11px; font-weight: 500;
  color: var(--el-text-color-placeholder, var(--text-tertiary));
  white-space: nowrap;
}

.step-status.done { color: var(--el-color-success, #18a66a); }
.step-status.running { color: var(--el-color-primary, #2168f3); }
.step-status.warn { color: var(--el-color-warning, #d98712); }

/* ====== Thinking ====== */
.bubble.thinking {
  border-color: var(--el-color-primary-light-9, #e8f0fe);
  background: linear-gradient(135deg, var(--el-bg-color, var(--surface-page)), var(--el-color-primary-light-9, var(--color-primary-bg)));
}

.thinking-text {
  color: var(--el-color-primary, #2168f3);
  font-weight: 600;
}

.thinking-pulse {
  background: var(--el-color-primary, #2168f3);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, .15);
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

@keyframes thinking-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: .7; }
}

/* ====== Streaming Cursor ====== */
@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--color-primary);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 0.8s ease-in-out infinite;
}
</style>
