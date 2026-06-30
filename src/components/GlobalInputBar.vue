<template>
  <footer v-if="showBar" class="global-input-bar">
    <div class="input-bar-inner">
      <el-input
        v-model="inputText"
        :placeholder="placeholder"
        clearable
        @keyup.enter="sendMessage"
        class="global-input"
        size="large"
      >
        <template #prefix>
          <el-icon><ChatDotRound /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="sendMessage">
            <el-icon><Promotion /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 对话覆盖层（工作台隐藏，用工作台自己的 Mode A） -->
    <transition name="dialog-fade">
      <div v-if="dialogOpen && showBar" class="dialog-overlay" @click.self="dialogOpen = false">
        <div class="dialog-content">
          <div class="dialog-header">
            <span class="dialog-title">💬 AI Copilot</span>
            <el-button text @click="dialogOpen = false"><el-icon><Close /></el-icon></el-button>
          </div>
          <div class="dialog-messages" ref="messagesRef">
            <div v-for="(msg, idx) in messages" :key="idx" class="dialog-msg" :class="msg.role">
              <span class="dialog-msg-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
              <div class="dialog-msg-bubble">
                <p v-if="typeof msg.content === 'string'">{{ msg.content }}</p>
                <div v-else-if="msg.content.type === 'card'" class="result-card">
                  <h4>{{ msg.content.title }}</h4>
                  <el-table :data="msg.content.rows" size="small" border>
                    <el-table-column v-for="col in msg.content.columns" :key="col" :prop="col" :label="col" min-width="80" />
                  </el-table>
                  <p v-if="msg.content.footer" class="card-footer">{{ msg.content.footer }}</p>
                  <div class="card-actions">
                    <el-button v-for="btn in msg.content.actions" :key="btn.label" size="small" type="primary" plain @click="onCardAction(btn)">{{ btn.label }}</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="aiTyping" class="dialog-msg ai">
              <span class="dialog-msg-avatar">🤖</span>
              <div class="dialog-msg-bubble typing">
                <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
              </div>
            </div>
          </div>
          <!-- 内嵌输入框 -->
          <div class="dialog-input-wrap">
            <el-input v-model="dialogInput" placeholder="继续输入..." clearable @keyup.enter="sendDialogMessage" size="default">
              <template #append>
                <el-button type="primary" @click="sendDialogMessage"><el-icon><Promotion /></el-icon></el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </transition>
  </footer>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChatDotRound, Promotion, Close } from '@element-plus/icons-vue'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'
import { useTaxRpaStore } from '../stores/taxRpa.js'
import { useScreeningStore } from '../stores/screening.js'
import { useMonitorStore } from '../stores/enterpriseMonitor.js'

const router = useRouter()
const route = useRoute()

const dueDiligenceStore = useDueDiligenceStore()
const taxRpaStore = useTaxRpaStore()
const screeningStore = useScreeningStore()
const monitorStore = useMonitorStore()

// 根据路由返回不同 placeholder
const placeholder = computed(() => {
  const path = route.path
  if (path.startsWith('/due-diligence')) return '询问尽调进度或操作...'
  if (path.startsWith('/screening')) return '描述你想要的客户条件...'
  if (path.startsWith('/tax-rpa')) return '输入企业名创建税票采集...'
  if (path.startsWith('/enterprise-diagnosis')) return '输入企业名开始诊断...'
  if (path.startsWith('/smart-report')) return '描述需要修改的内容...'
  if (path.startsWith('/enterprise-monitor')) return '查询企业预警规则...'
  if (path.startsWith('/biz-risk')) return '输入企业名称查询工商...'
  if (path.startsWith('/doc-recognition')) return '上传文件或输入指令...'
  return '有什么我可以帮你的？'
})

const inputText = ref('')
const dialogOpen = ref(false)
const dialogInput = ref('')
const messages = ref([])
const aiTyping = ref(false)
const messagesRef = ref(null)

// 工作台页面：隐藏 GlobalInputBar 浮层，交给工作台自己的 Mode A 覆盖模式
const isWorkbench = computed(() => route.path === '/' || route.path === '/workbench')
const isEnterpriseDiagnosis = computed(() => route.path.startsWith('/enterprise-diagnosis'))
const showBar = computed(() => !isWorkbench.value && !isEnterpriseDiagnosis.value)

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''

  // 打开对话覆盖层
  dialogOpen.value = true
  messages.value.push({ role: 'user', content: text })

  aiTyping.value = true
  scrollToBottom()

  setTimeout(() => {
    aiTyping.value = false
    messages.value.push({ role: 'ai', content: buildReply(text) })
    scrollToBottom()
  }, 1200)
}

function sendDialogMessage() {
  const text = dialogInput.value.trim()
  if (!text) return
  dialogInput.value = ''
  messages.value.push({ role: 'user', content: text })
  aiTyping.value = true
  scrollToBottom()

  setTimeout(() => {
    aiTyping.value = false
    messages.value.push({ role: 'ai', content: buildReply(text) })
    scrollToBottom()
  }, 1200)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

function onCardAction(btn) {
  dialogOpen.value = false
  if (btn.route) router.push(btn.route)
}

/**
 * 基于 Pinia Store 真实数据构建 AI 回复
 */
function buildReply(input) {
  const lower = input.toLowerCase()

  // 筛客/客户关键词
  if (lower.includes('筛') || lower.includes('客户')) {
    const dueTasks = dueDiligenceStore.tasks
    return {
      type: 'card', title: '当前在途客户（前3条）',
      columns: ['企业名称', '进度', '状态'],
      rows: dueTasks.slice(0, 3).map(t => ({
        '企业名称': t.name,
        '进度': t.progress + '%',
        '状态': t.status,
      })),
      footer: `共 ${dueTasks.length} 笔在途尽调`,
      actions: [{ label: '查看详情', route: '/due-diligence' }],
    }
  }

  // 税票关键词
  if (lower.includes('税票')) {
    const taxTasks = taxRpaStore.tasks
    return {
      type: 'card', title: '税票采集状态',
      columns: ['企业', '状态', '进度'],
      rows: taxTasks.slice(0, 4).map(t => ({
        '企业': t.enterprise.slice(0, 6) + '...',
        '状态': t.status,
        '进度': t.collectedCount + '/' + t.totalCount,
      })),
      footer: `共 ${taxTasks.length} 个税票任务`,
      actions: [{ label: '管理税票', route: '/tax-rpa' }],
    }
  }

  // 尽调关键词
  if (lower.includes('尽调') || lower.includes('发起')) {
    const tasks = dueDiligenceStore.tasks
    return {
      type: 'card', title: '尽调任务概览',
      columns: ['企业名称', '进度', '状态', '操作'],
      rows: tasks.map(t => ({
        '企业名称': t.name,
        '进度': t.progress + '%',
        '状态': t.status,
        '操作': '[查看]',
      })),
      footer: `共 ${tasks.length} 笔尽调`,
      actions: [{ label: '进入尽调首页', route: '/due-diligence' }],
    }
  }

  // 工商/查询关键词
  if (lower.includes('工商') || lower.includes('查')) {
    const task = dueDiligenceStore.tasks[0]
    return {
      type: 'card', title: `企业信息 — ${task?.name || '未找到'}`,
      columns: ['项目', '信息'],
      rows: [
        { '项目': '企业名称', '信息': task?.name || '—' },
        { '项目': '行业', '信息': task?.industry || '—' },
        { '项目': '地区', '信息': task?.region || '—' },
        { '项目': '尽调进度', '信息': (task?.progress ?? '—') + '%' || '—' },
      ],
      actions: [{ label: '查看详情', route: '/due-diligence' }],
    }
  }

  // 待办/今天关键词
  if (lower.includes('待办') || lower.includes('今天')) {
    const tasks = dueDiligenceStore.tasks
    const urgentTasks = tasks.filter(t => t.progress < 100)
    return {
      type: 'card', title: '在途任务汇总',
      columns: ['企业', '进度', '下一步'],
      rows: urgentTasks.map(t => ({
        '企业': t.name,
        '进度': t.progress + '%',
        '下一步': t.nextAction || '—',
      })),
      footer: null,
      actions: [],
    }
  }

  // 预警/监测关键词
  if (lower.includes('预警') || lower.includes('监测') || lower.includes('监控')) {
    const rules = monitorStore.rules
    const rows = rules.map(r => ({
      '规则名称': r.name,
      '状态': r.status === 'running' ? '🟢 启用' : '🟡 暂停',
      '命中次数': String(r.triggerCount ?? '0'),
    }))
    return {
      type: 'card', title: '当前预警规则',
      columns: ['规则名称', '状态', '命中次数'],
      rows,
      footer: `共${rules.length}条预警规则`,
      actions: [{ label: '管理预警规则', route: '/enterprise-monitor' }],
    }
  }

  return `收到：「${input}」\n\n我理解您的意图，正在为您处理。`
}
</script>

<style scoped>
/* 全局底部输入框 */
.global-input-bar {
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 100;
  padding: 12px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e5e7eb;
}

.input-bar-inner {
  max-width: 900px;
  margin: 0 auto;
}

.global-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 对话覆盖层 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding-bottom: 80px;
}

.dialog-content {
  width: 560px;
  max-height: 70vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  font-size: 15px;
  font-weight: 600;
}

.dialog-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  max-height: 50vh;
}

.dialog-msg {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.dialog-msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.dialog-msg.ai {
  align-self: flex-start;
}

.dialog-msg-avatar {
  font-size: 20px;
  flex-shrink: 0;
}

.dialog-msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.5;
}

.dialog-msg.user .dialog-msg-bubble {
  background: #2563eb;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.dialog-msg.ai .dialog-msg-bubble {
  background: #f1f5f9;
  color: #334155;
  border-bottom-left-radius: 4px;
}

.dialog-msg-bubble p { margin: 0; }

/* 结果卡片 */
.result-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin-top: 4px;
}

.result-card h4 {
  margin: 0 0 8px;
  font-size: 13.5px;
  font-weight: 600;
}

.card-footer {
  font-size: 12px;
  color: #94a3b8;
  margin: 8px 0 0;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* 内嵌输入 */
.dialog-input-wrap {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}

/* 打字动画 */
.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typingDot 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.25s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .global-input-bar {
    left: 0;
    padding: 10px 16px;
  }

  .dialog-content {
    width: 100%;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
  }
}
</style>
