<template>
  <div class="page page--narrow">
    <!-- 标题 -->
    <div class="page-header-area">
      <h1 class="page-title">智能筛客</h1>
      <p class="page-subtitle">描述目标客户特征，AI 从企业库中生成匹配名单</p>
    </div>

    <!-- 输入框：圆角卡片 + 星星图标 + 右侧圆形按钮 -->
    <div class="nl-input-card card-animate">
      <div class="nl-input-row">
        <el-icon class="nl-star-icon"><MagicStick /></el-icon>
        <textarea
          v-model="queryText"
          class="nl-textarea"
          placeholder="筛选浙江省制造业、低风险、近一年有开票记录、适合转尽调的客户"
          rows="1"
        ></textarea>
        <div class="nl-submit-area">
          <div class="nl-circle-btn" @click="startScreening" :class="{ disabled: !queryText.trim() }">
            <el-icon><Promotion /></el-icon>
          </div>
          <span class="nl-submit-label">开始筛选</span>
        </div>
      </div>
    </div>

    <!-- 示例标签：紧贴输入区下方 -->
    <div class="section-area card-animate">
      <span class="section-label">示例查询</span>
      <div class="chips-row">
        <div v-for="(chip, i) in chips" :key="i" class="chip" @click="selectChip(chip)">
          <el-icon class="chip-icon"><component :is="chip.icon" /></el-icon>
          {{ chip.label }}
        </div>
      </div>
    </div>

    <!-- AI 自动识别：仅在有输入时展开 -->
    <div v-if="parsedTags.length > 0" class="section-area card-animate">
      <div class="ai-recognize-card">
        <div class="ai-recognize-header">
          <el-icon class="ai-star"><MagicStick /></el-icon>
          <span class="ai-recognize-title">AI 会自动识别</span>
        </div>
        <div class="ai-conditions-row">
          <div
            v-for="(tag, i) in parsedTags"
            :key="i"
            class="ai-condition-card"
            :style="{ animationDelay: (i * 0.08) + 's' }"
          >
            <div class="ai-condition-icon" :style="{ background: tag.iconBg, color: tag.color }">
              <el-icon><component :is="tag.icon" /></el-icon>
            </div>
            <div class="ai-condition-label">{{ tag.label }}</div>
            <div class="ai-condition-value" :style="{ color: tag.color }">{{ tag.value }}</div>
          </div>
        </div>
        <p class="ai-hint">你也可以直接输入自然语言，AI 将自动理解并拆解条件</p>
      </div>
    </div>

    <!-- 最近筛选 + 右侧说明 -->
    <div class="bottom-row card-animate">
      <div class="recent-section">
        <div class="section-header">
          <el-icon><Clock /></el-icon>
          <span class="section-label-inline">历史筛选记录</span>
        </div>
        <div v-for="(rec, i) in recentSearches" :key="i" class="recent-item">
          <div class="recent-icon-wrap" :style="{ background: rec.iconBg }">
            <el-icon :style="{ color: rec.iconColor }"><component :is="rec.icon" /></el-icon>
          </div>
          <div class="recent-info">
            <div class="recent-title">{{ rec.title }}</div>
            <div class="recent-tags">
              <span v-for="(t, j) in rec.tags" :key="j" class="recent-tag">{{ t }}</span>
            </div>
          </div>
          <div class="recent-meta">
            <span class="recent-time">{{ rec.time }}</span>
            <el-button size="small" class="btn-reuse" @click="reuseSearch(rec)">再次使用</el-button>
          </div>
        </div>
        <div class="recent-footer">
          <a href="javascript:void(0)" class="link-more">查看全部记录 <el-icon><ArrowRight /></el-icon></a>
        </div>
      </div>

      <div class="info-section">
        <div class="info-icon-wrap" style="background: var(--color-primary-bg);">
          <el-icon style="color: var(--color-primary);"><DocumentChecked /></el-icon>
        </div>
        <div class="info-title">筛选结果支持批量导出、加入监控或转入尽调</div>
        <ul class="info-list">
          <li>支持批量导出 Excel</li>
          <li>一键加入企业监控</li>
          <li>支持一键转入尽调任务</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagicStick, Promotion, Shop, Ticket, Refresh, UserFilled,
  Location, Briefcase, CircleCheck, TrendCharts, Clock, ArrowRight, DocumentChecked, Search
} from '@element-plus/icons-vue'
import { useScreeningStore } from '../stores/screening'

const router = useRouter()
const store = useScreeningStore()

const queryText = ref(store.queryText)

const chips = [
  { label: '浙江制造业低风险', icon: Shop },
  { label: '近一年有开票', icon: Ticket },
  { label: '可转尽调', icon: Refresh },
  { label: '存量客户复筛', icon: UserFilled },
]

const recentSearches = [
  { title: '浙江省制造业低风险客户', tags: ['浙江省', '制造业', '低风险'], time: '今天 10:26', icon: Search, iconBg: 'var(--color-primary-bg)', iconColor: 'var(--color-primary)' },
  { title: '近一年营收增长的可转尽调客户', tags: ['全国', '制造业', '可转尽调'], time: '昨天 16:08', icon: TrendCharts, iconBg: 'var(--color-success-bg)', iconColor: 'var(--color-success)' },
  { title: '存量客户复筛-降级风险监控', tags: ['存量客户', '风险降级', '需复筛'], time: '05-17 09:45', icon: UserFilled, iconBg: 'var(--color-primary-bg)', iconColor: 'var(--color-primary-light)' },
]

const parsedTags = computed(() => {
  const text = queryText.value
  const tags = []
  if (text.includes('浙江') || text.includes('省')) tags.push({ label: '地区', value: '浙江省', color: 'var(--color-primary)', icon: Location, iconBg: 'var(--color-primary-bg)' })
  if (text.includes('制造')) tags.push({ label: '行业', value: '制造业', color: 'var(--color-success)', icon: Briefcase, iconBg: 'var(--color-success-bg)' })
  if (text.includes('低风险')) tags.push({ label: '风险等级', value: '低风险', color: 'var(--color-warning)', icon: CircleCheck, iconBg: 'var(--color-warning-bg)' })
  if (text.includes('开票')) tags.push({ label: '数据条件', value: '近一年有开票记录', color: 'var(--color-primary-light)', icon: TrendCharts, iconBg: 'var(--color-primary-bg)' })
  return tags
})

function selectChip(chip) {
  const map = {
    '浙江制造业低风险': '筛选浙江省制造业、低风险客户',
    '近一年有开票': '筛选近一年有开票记录的客户',
    '可转尽调': '筛选适合转尽调的客户',
    '存量客户复筛': '对存量客户进行复筛',
  }
  queryText.value = map[chip.label] || chip.label
}

function reuseSearch(rec) {
  queryText.value = rec.title
}

function startScreening() {
  if (!queryText.value.trim()) return
  store.queryText = queryText.value
  store.startScreening()
  router.push('/screening/running')
}
</script>

<style scoped>
.page--narrow {
  padding: var(--space-2xl) var(--space-2xl);
  max-width: 1060px;
  margin: 0 auto;
}

.page-header-area { margin-bottom: var(--space-2xl); }

.page-title {
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* ====== 输入卡片 ====== */
.nl-input-card {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-default);
  padding: var(--space-lg) var(--space-xl);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.nl-input-card:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.06);
}

.nl-input-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.nl-star-icon {
  font-size: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.nl-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  line-height: 1.6;
  font-family: inherit;
  background: transparent;
  min-height: 24px;
  padding: 0;
}

.nl-textarea::placeholder {
  color: var(--text-disabled);
}

.nl-submit-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nl-circle-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.nl-circle-btn:hover { transform: scale(1.05); }
.nl-circle-btn:active { transform: scale(0.95); }
.nl-circle-btn.disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

.nl-submit-label {
  font-size: var(--font-size-caption);
  color: var(--color-primary);
  font-weight: 500;
}

/* ====== Section ====== */
.section-area { margin-top: var(--space-xl); }
.section-label { font-size: var(--font-size-sm); color: var(--text-tertiary); font-weight: var(--font-weight-medium); }

/* ====== Chips ====== */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary-bg);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.chip:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
}

.chip-icon { font-size: 14px; }

/* ====== AI 识别卡片 ====== */
.ai-recognize-card {
  background: var(--surface-page);
  border-radius: var(--radius-lg);
  padding: var(--space-xl) var(--space-2xl);
  border: 1px solid var(--border-soft);
}

.ai-recognize-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
}

.ai-star { color: var(--color-primary); font-size: 16px; }

.ai-recognize-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.ai-conditions-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.ai-condition-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  padding: var(--space-lg) var(--space-md);
  border: 1px solid var(--border-soft);
  text-align: center;
  opacity: 0;
  animation: card-enter 0.3s ease forwards;
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-condition-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin: 0 auto var(--space-sm);
}

.ai-condition-label {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
  margin-bottom: var(--space-xs);
}

.ai-condition-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
}

.ai-hint {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

/* ====== 底部行 ====== */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  margin-top: var(--space-xl);
}

/* 最近筛选 */
.recent-section {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border-soft);
  opacity: 0.85;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.section-header .el-icon { font-size: var(--font-size-lg); color: var(--text-tertiary); }

.section-label-inline {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-color-divider);
}

.recent-item:last-of-type { border-bottom: none; }

.recent-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.recent-info { flex: 1; min-width: 0; }

.recent-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.recent-tags { display: flex; gap: 6px; flex-wrap: wrap; }

.recent-tag {
  font-size: var(--font-size-xs);
  padding: 1px 8px;
  background: var(--surface-page);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.recent-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.recent-time { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.btn-reuse {
  font-size: var(--font-size-sm);
  height: 26px;
  padding: 0 var(--space-md);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary);
  background: var(--surface-card);
}

.btn-reuse:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
}

.recent-footer {
  text-align: center;
  margin-top: 12px;
}

.link-more {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

/* 右侧信息 — 轻量化 */
.info-section {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border-soft);
  opacity: 0.85;
}

.info-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-md);
}

.info-title {
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding: var(--space-xs) 0;
  padding-left: var(--space-md);
  position: relative;
}

.info-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: 600;
}
</style>
