<template>
  <div class="page page--wide tax-rpa-page">
    <!-- 头部 -->
    <div class="tax-rpa-header">
      <div>
        <h1 class="page-title">税票采集</h1>
        <p class="page-subtitle">生成授权链接，企业扫码授权后 RPA 自动采集税票数据</p>
      </div>
      <div class="header-stats">
        <div class="hs-item">
          <span class="hs-value" style="color:var(--color-warning)">{{ store.stats.authing }}</span>
          <span class="hs-label">授权中</span>
        </div>
        <div class="hs-item">
          <span class="hs-value" style="color:var(--color-success)">{{ store.stats.authed }}</span>
          <span class="hs-label">已授权</span>
        </div>
        <div class="hs-item">
          <span class="hs-value" style="color:var(--color-primary)">{{ store.stats.collecting }}</span>
          <span class="hs-label">税票采集中</span>
        </div>
        <div class="hs-item">
          <span class="hs-value" style="color:var(--color-success)">{{ store.stats.done }}</span>
          <span class="hs-label">已完成</span>
        </div>
        <div class="hs-item">
          <span class="hs-value" style="color:var(--color-danger)">{{ store.stats.expired }}</span>
          <span class="hs-label">已过期</span>
        </div>
      </div>
    </div>

    <!-- 双栏布局 -->
    <div class="tax-rpa-body">
      <!-- 左侧：任务列表 -->
      <div class="tax-rpa-sidebar">
        <!-- 新建按钮 -->
        <div class="tax-rpa-sidebar-top">
          <el-button type="primary" size="small" class="btn-create" @click="store.openCreate()">
            <el-icon><Plus /></el-icon>
            新建授权
          </el-button>
        </div>

        <!-- 筛选 -->
        <div class="tax-rpa-filter">
          <div class="filter-chips">
            <div
              v-for="chip in store.statusChips"
              :key="chip.key"
              class="filter-chip"
              :class="{ active: store.statusFilter === chip.key }"
              @click="store.statusFilter = chip.key"
            >{{ chip.label }}</div>
          </div>
          <div class="filter-search">
            <el-input
              v-model="store.searchQuery"
              placeholder="搜索企业/税号"
              size="small"
              clearable
              :prefix-icon="Search"
            />
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="tax-rpa-task-list">
          <div
            v-for="task in store.filteredTasks"
            :key="task.id"
            class="tax-rpa-task-card"
            :class="{ active: store.currentTaskId === task.id }"
            @click="store.selectTask(task.id)"
          >
            <div class="trtc-name">{{ task.enterprise }}</div>
            <div class="trtc-credit">{{ task.creditCode }}</div>
            <div class="trtc-bottom">
              <div class="trtc-status-wrap">
                <el-tag v-if="task.status === '授权中'" size="small" type="warning" effect="light" round>授权中</el-tag>
                <el-tag v-else-if="task.status === '已授权'" size="small" type="success" effect="light" round>已授权</el-tag>
                <el-tag v-else-if="task.status === '采集中'" size="small" type="primary" effect="light" round>采集中</el-tag>
                <el-tag v-else-if="task.status === '已完成'" size="small" type="info" effect="light" round>已完成</el-tag>
                <el-tag v-else-if="task.status === '已过期'" size="small" type="danger" effect="light" round>已过期</el-tag>
              </div>
              <div class="trtc-meta">
                <span v-if="task.status === '授权中' || task.status === '已过期'" class="trtc-time">{{ task.authExpireAt.slice(5) }} 到期</span>
                <span v-else-if="task.status === '已授权'" class="trtc-time">{{ task.authedAt?.slice(5) }} 已授权</span>
                <span v-else-if="task.status === '采集中'" class="trtc-time">{{ task.collectedCount }}/{{ task.totalCount }}</span>
                <span v-else class="trtc-time">已完成</span>
              </div>
            </div>
          </div>
          <div v-if="!store.filteredTasks.length" class="tax-rpa-empty">
            <el-empty description="没有匹配的任务" :image-size="80" />
          </div>
        </div>
      </div>

      <!-- 右侧：详情面板 -->
      <div class="tax-rpa-detail" v-if="store.currentTask">
        <div class="tax-rpa-detail-header">
          <div>
            <h2 class="detail-ent-name">{{ store.currentTask.enterprise }}</h2>
            <div class="detail-credit">统一信用代码：{{ store.currentTask.creditCode }}</div>
          </div>
          <div class="detail-actions">
            <el-button text type="primary" @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </div>

        <!-- 状态卡片 -->
        <div class="status-card" :class="'status-' + store.currentTask.status">
          <div class="sc-icon">
            <el-icon v-if="store.currentTask.status === '授权中'" class="sc-icon-wait" :size="22"><WarningFilled /></el-icon>
            <el-icon v-else-if="store.currentTask.status === '已授权'" class="sc-icon-ok" :size="22"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="store.currentTask.status === '采集中'" class="sc-icon-run" :size="22"><Loading /></el-icon>
            <el-icon v-else-if="store.currentTask.status === '已完成'" class="sc-icon-done" :size="22"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="store.currentTask.status === '已过期'" class="sc-icon-expired" :size="22"><CircleCloseFilled /></el-icon>
          </div>
          <div class="sc-info">
            <div class="sc-status">
              <span class="sc-status-text" :class="'sc-text-' + store.currentTask.status">{{ store.currentTask.status }}</span>
              <span v-if="store.currentTask.status === '授权中'" class="sc-countdown">
                · 距过期还剩 <strong>17小时</strong>
              </span>
            </div>
            <div class="sc-time">创建于 {{ store.currentTask.createdAt }}</div>
          </div>
          <div class="sc-actions">
            <el-button v-if="store.currentTask.status === '已过期'" size="small" type="primary" @click="handleRegenerate">重新生成</el-button>
            <el-button v-if="store.currentTask.status === '授权中'" size="small" plain @click="handleResend">重新提醒</el-button>
          </div>
        </div>

        <!-- 授权链接 -->
        <div class="detail-section">
          <div class="section-title">授权链接</div>
          <div class="link-box">
            <div class="link-url">{{ store.currentTask.authUrl }}</div>
            <el-button size="small" text type="primary" @click="copyLink(store.currentTask.authUrl)">复制</el-button>
          </div>
        </div>

        <!-- 二维码 -->
        <div class="detail-section">
          <div class="section-title">授权二维码</div>
          <div class="qr-section">
            <div class="qr-image-wrap">
              <img :src="qrUrl" alt="授权二维码" class="qr-image" />
            </div>
            <div class="qr-actions">
              <el-button size="small" plain @click="handleShare">
                <el-icon><Share /></el-icon>
                分享二维码
              </el-button>
              <el-button size="small" plain @click="downloadQr">
                <el-icon><Download /></el-icon>
                下载二维码
              </el-button>
              <el-button size="small" plain @click="copyLink(store.currentTask.authUrl)">
                <el-icon><CopyDocument /></el-icon>
                复制链接
              </el-button>
            </div>
          </div>
        </div>

        <!-- 采集进度 -->
        <div v-if="['已授权','采集中','已完成'].includes(store.currentTask.status)" class="detail-section">
          <div class="section-title">采集进度</div>
          <div class="progress-wrap">
            <el-progress
              :percentage="progressPercent"
              :status="progressPercent >= 100 ? 'success' : progressPercent >= 50 ? undefined : 'warning'"
              :stroke-width="8"
              :show-text="false"
            />
            <div class="progress-info">
              <span class="progress-num">{{ store.currentTask.collectedCount }} / {{ store.currentTask.totalCount }}</span>
              <span class="progress-pct">{{ progressPercent }}%</span>
            </div>
          </div>
          <div class="progress-items">
            <div
              v-for="item in mockCollectionItems"
              :key="item.name"
              class="progress-item"
              :class="item.collected ? 'pi-done' : 'pi-wait'"
            >
              <el-icon v-if="item.collected" class="pi-icon pi-icon-done"><CircleCheckFilled /></el-icon>
              <el-icon v-else class="pi-icon pi-icon-wait"><Clock /></el-icon>
              <span class="pi-label">{{ item.name }}</span>
              <span class="pi-time">{{ item.collected ? item.time : '等待中' }}</span>
            </div>
          </div>
        </div>

        <!-- 提醒记录 -->
        <div v-if="store.currentTask.remindCount > 0" class="detail-section">
          <div class="section-title">提醒记录</div>
          <div class="reminder-log">
            <div class="reminder-item">
              <span class="ri-dot"></span>
              <span class="ri-text">上次提醒：{{ store.currentTask.lastReminderAt }}</span>
              <span class="ri-count">累计 {{ store.currentTask.remindCount }} 次</span>
            </div>
            <div v-if="store.currentTask.nextReminderAt" class="reminder-item">
              <span class="ri-dot ri-dot-future"></span>
              <span class="ri-text">下次提醒：{{ store.currentTask.nextReminderAt }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="tax-rpa-detail tax-rpa-detail-empty">
        <el-empty description="选择左侧任务查看详情" />
      </div>
    </div>

    <!-- 分享弹窗 -->
    <el-dialog v-model="store.shareDialogOpen" title="分享授权" width="560px" class="share-dialog" :show-close="true">
      <div v-if="store.currentTask" class="share-dialog-body">
        <div class="share-enterprise">{{ store.currentTask.enterprise }}</div>

        <!-- 方式选择 -->
        <div class="share-tabs">
          <div
            class="share-tab"
            :class="{ active: shareMode === 'qr' }"
            @click="shareMode = 'qr'"
          ><el-icon :size="14"><Share /></el-icon> 二维码</div>
          <div
            class="share-tab"
            :class="{ active: shareMode === 'link' }"
            @click="shareMode = 'link'"
          ><el-icon :size="14"><CopyDocument /></el-icon> 链接</div>
        </div>

        <!-- 二维码模式 -->
        <div v-if="shareMode === 'qr'" class="share-qr-mode">
          <div class="share-qr-wrap">
            <img :src="qrUrl" alt="授权二维码" class="share-qr-img" />
          </div>
          <div class="share-qr-hint">企业扫码即可完成授权</div>
          <div class="share-qr-actions">
            <el-button type="primary" @click="downloadQr">
              <el-icon><Download /></el-icon>
              下载二维码
            </el-button>
            <el-button plain @click="shareViaWechat">
              <el-icon><ChatDotRound /></el-icon>
              微信分享
            </el-button>
          </div>
        </div>

        <!-- 链接模式 -->
        <div v-if="shareMode === 'link'" class="share-link-mode">
          <div class="share-link-box">
            <div class="share-link-url">{{ store.currentTask.authUrl }}</div>
            <el-button type="primary" @click="copyLink(store.currentTask.authUrl)">
              <el-icon><CopyDocument /></el-icon>
              复制链接
            </el-button>
          </div>
          <div class="share-link-hint">链接有效期 24 小时，过期需重新生成</div>
          <div class="share-link-shortcuts">
            <div class="sls-label">快捷分享：</div>
            <el-button size="small" text type="primary" @click="shareViaWechat">微信发送</el-button>
            <el-button size="small" text type="primary" @click="copyLink(store.currentTask.authUrl)">邮件粘贴</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新建任务弹窗 -->
    <el-dialog v-model="store.createDialogOpen" title="新建税票授权" width="480px" class="create-dialog">
      <div class="create-dialog-body">
        <div class="create-field">
          <label>选择企业</label>
          <el-select
            v-model="selectedEnterprise"
            placeholder="搜索或选择企业名称"
            filterable
            class="create-select"
            @change="onEnterpriseSelect"
          >
            <el-option
              v-for="opt in store.enterpriseOptions"
              :key="opt.creditCode"
              :label="opt.name"
              :value="opt.name"
            />
          </el-select>
        </div>
        <div class="create-field">
          <label>统一信用代码</label>
          <el-input v-model="store.newCreditCode" placeholder="自动填充或手动输入" />
        </div>
        <div class="create-field">
          <label>授权有效期</label>
          <div class="create-expire-hint">24 小时（企业扫码授权后自动开始采集）</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="store.closeCreate()">取消</el-button>
        <el-button type="primary" :disabled="!store.newEnterpriseName" @click="handleCreate">创建授权</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Search, Plus, Share, Download, CopyDocument,
  ChatDotRound, CircleCheckFilled, Clock,
  WarningFilled, CircleCloseFilled, Loading
} from '@element-plus/icons-vue'
import { useTaxRpaStore } from '../stores/taxRpa.js'
import { ElMessage } from 'element-plus'

const store = useTaxRpaStore()
const shareMode = ref('qr')
const selectedEnterprise = ref('')

// Mock 采集条目
const mockCollectionItems = [
  { name: '纳税申报表', collected: true, time: '2026-06-24 17:05' },
  { name: '增值税发票', collected: true, time: '2026-06-24 17:06' },
  { name: '企业所得税', collected: true, time: '2026-06-24 17:07' },
  { name: '完税证明', collected: true, time: '2026-06-24 17:08' },
  { name: '发票明细', collected: true, time: '2026-06-24 17:10' },
  { name: '纳税评级', collected: true, time: '2026-06-24 17:11' },
  { name: '税种核定', collected: true, time: '2026-06-24 17:12' },
  { name: '税收优惠', collected: true, time: '2026-06-24 17:13' },
  { name: '退税记录', collected: false, time: '' },
  { name: '欠税记录', collected: false, time: '' },
  { name: '税务处罚', collected: false, time: '' },
  { name: '税务登记', collected: false, time: '' },
]

const qrUrl = computed(() => {
  if (!store.currentTask) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(store.currentTask.authUrl)}&size=200x200&color=2563eb&bgcolor=ffffff`
})

const progressPercent = computed(() => {
  if (!store.currentTask) return 0
  return Math.round((store.currentTask.collectedCount / store.currentTask.totalCount) * 100)
})

function copyLink(url) {
  navigator.clipboard?.writeText(url).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.success('链接已复制')
  })
}

function handleShare() {
  shareMode.value = 'qr'
  store.openShare()
}

function handleResend() {
  store.resendAuth()
  ElMessage.success('已重新发送提醒，下次提醒：明天 09:00')
}

function handleRegenerate() {
  store.regenerateAuth()
  ElMessage.success('已重新生成授权链接，有效期 24 小时')
}

function downloadQr() {
  if (!store.currentTask) return
  const link = document.createElement('a')
  link.href = qrUrl.value
  link.download = `tax-rpa-qr-${store.currentTask.id}.png`
  link.target = '_blank'
  link.click()
  ElMessage.success('二维码下载中...')
}

function shareViaWechat() {
  copyLink(store.currentTask?.authUrl)
  ElMessage.success('已复制链接，请粘贴到微信发送给客户')
}

function onEnterpriseSelect(name) {
  const opt = store.enterpriseOptions.find(o => o.name === name)
  if (opt) {
    store.newEnterpriseName.value = opt.name
    store.newCreditCode.value = opt.creditCode
  }
}

function handleCreate() {
  if (!store.newEnterpriseName.value) return
  store.createTask(store.newEnterpriseName.value, store.newCreditCode.value)
  store.closeCreate()
  ElMessage.success(`已为「${store.newEnterpriseName.value}」生成授权链接`)
}
</script>

<style scoped>
/* ════════════════════════════════════════════════
   TaxRpaPage — 税票采集页 scoped styles
   统一使用 Element Plus + tokens.css 变量
   ════════════════════════════════════════════════ */

.tax-rpa-page {
  display: flex; flex-direction: column;
  height: calc(100vh - 0px); overflow: hidden;
}

/* ── 头部 ── */
.tax-rpa-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 32px 16px; flex-shrink: 0;
  background: var(--bg-card); border-bottom: 1px solid var(--border-color);
}
.header-stats { display: flex; gap: 24px; }
.hs-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.hs-value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); line-height: 1; }
.hs-label { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.tax-rpa-body { display: flex; flex: 1; overflow: hidden; }

/* ── 左侧 ── */
.tax-rpa-sidebar {
  width: 320px; min-width: 320px; background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; overflow: hidden;
}
.tax-rpa-sidebar-top { padding: 14px 16px; border-bottom: 1px solid var(--border-color-light); flex-shrink: 0; }
.btn-create { width: 100%; }

/* 筛选区 */
.tax-rpa-filter { padding: 10px 16px; border-bottom: 1px solid var(--border-color-light); flex-shrink: 0; }
.filter-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.filter-chip {
  padding: 3px 10px; border-radius: var(--radius-full); font-size: var(--font-size-xs);
  background: var(--surface-page); color: var(--text-secondary);
  cursor: pointer; transition: all var(--duration-normal); border: 1px solid transparent;
  line-height: 1.6;
}
.filter-chip:hover { background: var(--color-primary-bg); color: var(--color-primary); }
.filter-chip.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.filter-search { margin-top: 2px; }

/* 任务列表 */
.tax-rpa-task-list { flex: 1; overflow-y: auto; padding: 6px; }
.tax-rpa-task-card {
  padding: 12px 14px; border-radius: var(--radius-md); cursor: pointer;
  transition: all var(--duration-normal); margin-bottom: 2px; border: 1px solid transparent;
}
.tax-rpa-task-card:hover { background: var(--surface-soft); }
.tax-rpa-task-card.active { background: var(--surface-row-selected); border-color: var(--color-primary-border); }
.trtc-name {
  font-size: var(--font-size-base); font-weight: var(--font-weight-semibold);
  color: var(--text-primary); margin-bottom: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.trtc-credit {
  font-size: var(--font-size-xs); color: var(--text-tertiary);
  font-family: monospace; margin-bottom: 8px;
}
.trtc-bottom { display: flex; align-items: center; justify-content: space-between; }
.trtc-meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.tax-rpa-empty { flex: 1; display: flex; align-items: center; justify-content: center; }

/* ── 右侧详情 ── */
.tax-rpa-detail { flex: 1; min-width: 0; overflow-y: auto; padding: 24px 32px; }
.tax-rpa-detail-empty { display: flex; align-items: center; justify-content: center; }

.tax-rpa-detail-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: var(--space-xl);
}
.detail-ent-name {
  font-size: 18px; font-weight: var(--font-weight-bold); color: var(--text-primary); margin: 0;
}
.detail-credit {
  font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: 4px;
  font-family: monospace;
}

/* ── 状态卡片 ── */
.status-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: var(--radius-md);
  border: 1px solid var(--border-color); background: var(--bg-card);
  margin-bottom: var(--space-2xl);
}
.status-card.status-授权中 { border-left: 3px solid var(--color-warning); }
.status-card.status-已授权 { border-left: 3px solid var(--color-success); }
.status-card.status-采集中 { border-left: 3px solid var(--color-primary); }
.status-card.status-已完成 {
  border-left: 3px solid var(--color-success);
  background: var(--color-success-bg);
}
.status-card.status-已过期 {
  border-left: 3px solid var(--color-danger);
  background: var(--color-danger-bg);
}
.sc-icon { flex-shrink: 0; display: flex; align-items: center; }
.sc-icon-wait { color: var(--color-warning); }
.sc-icon-ok { color: var(--color-success); }
.sc-icon-run { color: var(--color-primary); }
.sc-icon-done { color: var(--color-success); }
.sc-icon-expired { color: var(--color-danger); }
.sc-info { flex: 1; }
.sc-status { display: flex; align-items: center; gap: 8px; }
.sc-status-text { font-size: 15px; font-weight: var(--font-weight-bold); }
.sc-text-授权中 { color: var(--color-warning); }
.sc-text-已授权 { color: var(--color-success); }
.sc-text-采集中 { color: var(--color-primary); }
.sc-text-已完成 { color: var(--color-success); }
.sc-text-已过期 { color: var(--color-danger); }
.sc-countdown { font-size: var(--font-size-sm); color: var(--text-tertiary); }
.sc-time { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: 4px; }
.sc-actions { flex-shrink: 0; }

/* ── 通用 section ── */
.detail-section { margin-bottom: var(--space-2xl); }
.section-title {
  font-size: var(--font-size-base); font-weight: var(--font-weight-semibold);
  color: var(--text-primary); margin-bottom: 10px; padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color-light);
}

/* ── 链接 ── */
.link-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface-page); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 10px 14px;
}
.link-url {
  flex: 1; font-size: var(--font-size-sm); color: var(--color-primary);
  font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── 二维码 ── */
.qr-section { display: flex; align-items: flex-start; gap: 24px; }
.qr-image-wrap {
  padding: 12px; background: #fff; border: 1px solid var(--border-color);
  border-radius: var(--radius-md); flex-shrink: 0;
}
.qr-image { width: 160px; height: 160px; display: block; }
.qr-actions { display: flex; flex-direction: column; gap: 8px; flex: 1; }

/* ── 进度 ── */
.progress-wrap { margin-bottom: 14px; }
.progress-info {
  display: flex; justify-content: space-between; font-size: var(--font-size-sm);
  color: var(--text-secondary); margin-top: 6px;
}
.progress-num { font-weight: var(--font-weight-semibold); }
.progress-pct { color: var(--text-tertiary); }
.progress-items { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.progress-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: var(--radius-sm);
  background: var(--surface-page); font-size: var(--font-size-sm);
}
.progress-item.pi-done { border-left: 3px solid var(--color-success); }
.progress-item.pi-wait { border-left: 3px solid var(--border-color-light); opacity: 0.6; }
.pi-icon { font-size: 14px; flex-shrink: 0; }
.pi-icon-done { color: var(--color-success); }
.pi-icon-wait { color: var(--text-disabled); }
.pi-label { flex: 1; }
.pi-time { font-size: var(--font-size-xs); color: var(--text-tertiary); }

/* ── 提醒记录 ── */
.reminder-log { display: flex; flex-direction: column; gap: 8px; }
.reminder-item { display: flex; align-items: center; gap: 10px; font-size: var(--font-size-sm); }
.ri-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-tertiary); flex-shrink: 0; }
.ri-dot-future { background: var(--color-primary); }
.ri-text { color: var(--text-secondary); }
.ri-count { color: var(--text-tertiary); margin-left: auto; }

/* ── 分享弹窗 ── */
.share-dialog-body { text-align: center; }
.share-enterprise {
  font-size: 15px; font-weight: var(--font-weight-semibold);
  color: var(--text-primary); margin-bottom: var(--space-xl);
}
.share-tabs { display: flex; justify-content: center; gap: 0; margin-bottom: var(--space-xl); }
.share-tab {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 18px; font-size: var(--font-size-base); font-weight: var(--font-weight-medium);
  color: var(--text-secondary); cursor: pointer; transition: all var(--duration-normal);
  border: 1px solid var(--border-color); background: var(--surface-card);
}
.share-tab:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.share-tab:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.share-tab.active {
  background: var(--color-primary); color: #fff;
  border-color: var(--color-primary); position: relative; z-index: 1;
}
.share-tab:hover:not(.active) {
  background: var(--color-primary-bg); color: var(--color-primary);
}
.share-qr-wrap {
  display: inline-block; padding: 16px; background: #fff;
  border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 12px;
}
.share-qr-img { width: 200px; height: 200px; display: block; }
.share-qr-hint { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-bottom: 16px; }
.share-qr-actions { display: flex; gap: 10px; justify-content: center; }
.share-link-box {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  background: var(--surface-page); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); margin-bottom: 12px;
}
.share-link-url {
  flex: 1; font-size: var(--font-size-sm); color: var(--color-primary);
  font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.share-link-hint { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-bottom: 16px; }
.share-link-shortcuts { display: flex; align-items: center; gap: 8px; justify-content: center; }
.sls-label { font-size: var(--font-size-sm); color: var(--text-tertiary); }

/* ── 创建弹窗 ── */
.create-dialog-body { padding: 8px 0; }
.create-field { margin-bottom: 16px; }
.create-field label {
  display: block; font-size: var(--font-size-base); font-weight: var(--font-weight-medium);
  color: var(--text-primary); margin-bottom: 6px;
}
.create-select { width: 100%; }
.create-expire-hint { font-size: var(--font-size-sm); color: var(--text-tertiary); }
</style>
