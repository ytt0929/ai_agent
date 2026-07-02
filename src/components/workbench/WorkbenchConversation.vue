<template>
  <div class="conversation" ref="scrollRef">
    <div class="date-chip">{{ dateChip }}</div>

    <!-- Messages - deduplicated -->
    <template v-for="(msg, idx) in dedupedMessages" :key="idx">
      <div class="ai-message" :class="msg.type === 'user' ? 'ai-message--user' : 'ai-message--ai'">
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
    </template>

    <!-- Thinking indicator -->
    <div v-if="isThinking" class="ai-message ai-message--ai">
      <div class="ai-message__avatar">AI</div>
      <div class="ai-message__bubble thinking">
        <div class="meta"><span class="pulse-dot thinking-pulse"></span><span>AI 正在执行</span></div>
        <div class="bubble-text thinking-text">{{ thinkingText }}</div>
      </div>
    </div>

    <!-- Waiting indicator - only shows once as a status block, not repeated -->
    <div v-if="waitingForInput && !isThinking" class="waiting-indicator">
      <div class="ai-message ai-message--ai">
        <div class="ai-message__avatar">AI</div>
        <div class="ai-message__bubble">
          <div class="meta"><span class="pulse"></span><span>等待输入</span></div>
          <div class="bubble-text">可以继续补充问题，或选择下一步操作。</div>
        </div>
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

const dateChip = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

/**
 * 消息去重：
 * 1. 跳过与上一条 AI 消息 text 完全相同的消息
 * 2. 跳过高度相似的 streaming 消息（保留 streaming 中的最新一条）
 * 3. waitingForInput 不再作为消息插入，而是固定状态块
 */
const dedupedMessages = computed(() => {
  const result = []
  for (const msg of props.messages) {
    if (result.length === 0) {
      result.push(msg)
      continue
    }

    const last = result[result.length - 1]

    // 完全相同的 AI 消息 → 跳过
    if (msg.type === 'ai' && last.type === 'ai' && msg.text === last.text && !msg.streaming && !last.streaming) {
      continue
    }

    // Streaming 消息：如果上一条是同一条（fullText 相同），替换为最新的
    if (msg.streaming && last.streaming && msg.fullText === last.fullText) {
      result[result.length - 1] = msg
      continue
    }

    result.push(msg)
  }
  return result
})

// Auto-scroll: new messages
watch(() => dedupedMessages.value.length, () => {
  scrollToBottomSoon()
})

// Auto-scroll: streaming text updates
watch(
  () => dedupedMessages.value.map(m => m.text).join('|'),
  () => {
    scrollToBottomSoon()
  }
)
</script>

<style scoped>
.conversation {
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 12px 0;
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

/* ====== Messages ====== */
.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
  width: 100%;
}

.ai-message--user {
  justify-content: flex-end;
}

.ai-message--ai {
  justify-content: flex-start;
}

.ai-message__avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center;
  flex-shrink: 0;
  font-weight: 600; font-size: 12px;
}

.ai-message--ai .ai-message__avatar {
  order: 0;
  color: #fff;
  background: var(--el-color-primary, #2563eb);
}

.ai-message--user .ai-message__avatar {
  order: 1;
  color: var(--el-text-color-regular, #64748b);
  background: var(--el-fill-color-light, #f7faff);
  border: 1px solid var(--el-border-color, #dbe7f5);
}

.ai-message__bubble {
  padding: 8px 12px;
  border-radius: var(--el-border-radius-base, 8px);
  line-height: 1.6;
  font-size: 13px;
  word-break: break-word;
  max-width: min(85%, 400px);
}

.ai-message--ai .ai-message__bubble {
  order: 1;
  background: var(--el-fill-color-lighter, #f1f5f9);
  border: 1px solid var(--el-border-color-light, #e5e7eb);
  color: var(--el-text-color-primary, #10213f);
  border-top-left-radius: 4px;
}

.ai-message--user .ai-message__bubble {
  order: 0;
  background: var(--el-color-primary, #2563eb);
  color: #fff;
  border-top-right-radius: 4px;
  max-width: min(76%, 400px);
}

.meta {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 4px;
  color: var(--el-text-color-secondary, #64748b); font-size: 11px; font-weight: 500;
}

.pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--el-color-success, #10b981);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
}

.meta-time { color: var(--el-text-color-placeholder, #94a3b8); font-weight: 500; margin-left: auto; }

.bubble-text {
  line-height: 1.6;
}

/* Waiting indicator */
.waiting-indicator {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter, #f1f5f9);
}

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

/* ====== Thinking ====== */
.bubble.thinking {
  border-color: var(--el-color-primary-light-9, #e8f0fe);
  background: linear-gradient(135deg, var(--el-bg-color, #fff), var(--el-color-primary-light-9, #eef2ff));
}

.thinking-text {
  color: var(--el-color-primary, #2563eb);
  font-weight: 600;
}

.thinking-pulse {
  background: var(--el-color-primary, #2563eb);
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
