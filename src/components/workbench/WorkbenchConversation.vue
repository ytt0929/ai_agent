<template>
  <div class="conversation" ref="scrollRef">
    <div class="date-chip">{{ dateChip }}</div>

    <!-- User messages -->
    <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.type">
      <div v-if="msg.type === 'ai'" class="ai-avatar">AI</div>
      <div class="bubble" :class="msg.type">
        <div v-if="msg.type === 'ai'" class="meta">
          <span class="pulse"></span>
          <span>AI 自动执行</span>
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
      <div v-if="msg.type === 'user'" class="user-avatar">张</div>
    </div>

    
<!-- Process timeline for active stage -->
    <div v-if="activeStage" class="process-card">
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
    <div v-if="isThinking" class="message ai">
      <div class="ai-avatar">AI</div>
      <div class="bubble ai thinking">
        <div class="meta"><span class="pulse-dot thinking-pulse"></span><span>AI 正在执行</span></div>
        <div class="bubble-text thinking-text">{{ thinkingText }}</div>
      </div>
    </div>

    <!-- Waiting -->
    <div v-if="waitingForInput && !isThinking" class="message ai">
      <div class="ai-avatar">AI</div>
      <div class="bubble ai">
        <div class="meta"><span class="pulse"></span><span>等待输入</span></div>
        <div class="bubble-text">对话中继续推进流程，或告诉我下一步操作</div>
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
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-2xl) var(--space-xl) 18px;
  background: var(--surface-page);
}

.date-chip {
  width: max-content;
  margin: 0 auto 20px;
  padding: 6px 10px;
  border-radius: 999px;
  color: var(--text-secondary);
  background: var(--bg-table-header);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

/* ====== Message ====== */
.message {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.message.user {
  grid-template-columns: minmax(0, 1fr) 36px;
  justify-content: end;
}

.ai-avatar {
  width: 36px; height: 36px; border-radius: var(--radius-md);
  display: grid; place-items: center;
  color: var(--color-primary); background: var(--color-primary-bg);
  font-weight: 900; font-size: var(--font-size-lg);
}

.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: grid; place-items: center;
  color: #fff; background: linear-gradient(145deg, var(--color-primary-hover), #6846bb);
  font-weight: 900; font-size: 14px;
}

.message.user .user-avatar { grid-column: 2; }

/* Bubble */
.bubble {
  padding: 13px 15px;
  border-radius: var(--radius-lg);
  line-height: 1.65;
  font-size: 14px;
  box-shadow: 0 4px 18px rgba(26, 54, 92, .04);
}

.bubble.ai {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-top-left-radius: 4px;
}

.bubble.user {
  grid-column: 1;
  color: #fff;
  background: var(--color-primary);
  border-top-right-radius: 4px;
}

.meta {
  display: flex; align-items: center; gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  color: var(--text-secondary); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
}

.pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 0 5px rgba(16, 185, 129, .12);
}

.meta-time { color: var(--text-tertiary); font-weight: var(--font-weight-semibold); margin-left: auto; }

/* Todos card */
.todos-card {
  margin-top: var(--space-sm);
  border: 1px solid #dfe8f5;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.todo-row {
  display: grid;
  grid-template-columns: 1fr 60px 70px;
  padding: 8px 12px;
  font-size: var(--font-size-body);
  border-bottom: 1px solid #edf3fa;
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
  margin: var(--space-lg) 0 var(--space-xl) 48px;
  padding: var(--space-lg);
  border: 1px solid #dfe8f5;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(32, 72, 128, .05);
}

.process-card h3 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #10213f;
}

.process-list {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: 0;
}

.process-list li {
  position: relative;
  display: grid;
  grid-template-columns: 26px 1fr auto;
  gap: 9px;
  padding: 0 0 13px;
  color: #33425b;
  font-size: 13px;
  font-weight: 700;
}

.process-list li::before {
  content: "";
  position: absolute;
  top: 25px; left: 12px;
  width: 1px;
  height: calc(100% - 22px);
  background: #dfe8f5;
}

.process-list li:last-child { padding-bottom: 0; }
.process-list li:last-child::before { display: none; }

.step-dot {
  width: 24px; height: 24px; border-radius: 50%;
  display: grid; place-items: center;
  color: #93a1b5; background: #eef3fa;
  font-size: 12px; font-weight: 900;
  z-index: 1;
}

.step-dot.done { color: #fff; background: #18a66a; }
.step-dot.running { color: #fff; background: #2168f3; box-shadow: 0 0 0 5px rgba(33, 104, 243, .12); }
.step-dot.warn { color: #fff; background: #d98712; }

.step-content { min-width: 0; }

.step-title {
  font-size: 13px; font-weight: 700; color: #33425b;
  line-height: 1.5;
}

.step-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 8px;
  margin-top: 4px;
}

.detail-item {
  display: flex; justify-content: space-between;
  gap: 6px; font-size: 12px;
}

.detail-label { color: #93a1b5; font-weight: 600; flex-shrink: 0; }
.detail-value { color: #10213f; font-weight: 700; text-align: right; }

.step-status {
  font-size: 12px; font-weight: 800;
  color: #93a1b5;
  white-space: nowrap;
}

.step-status.done { color: #18a66a; }
.step-status.running { color: #2168f3; }
.step-status.warn { color: #d98712; }

/* ====== Thinking ====== */
.bubble.thinking {
  border-color: #e8f0fe;
  background: linear-gradient(135deg, var(--surface-page), var(--color-primary-bg));
}

.thinking-text {
  color: #2168f3;
  font-weight: 600;
}

.thinking-pulse {
  background: #2168f3;
  box-shadow: 0 0 0 5px rgba(37, 99, 235, .15);
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

@keyframes thinking-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: .7; }
}


/* ====== Suggestion Bar ====== */
.suggestion-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-default);
  background: var(--surface-card);
}

.suggestion-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-default);
  border-radius: 20px;
  background: var(--surface-page);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.suggestion-btn:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.suggestion-btn:active {
  transform: translateY(0);
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
