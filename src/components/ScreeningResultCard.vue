<template>
  <div class="sidebar-card">
    <!-- Header -->
    <div class="sidebar-card__header">
      <div class="work-head">
        <h3>📋 筛选结果</h3>
        <span class="tag tag--blue">已生成</span>
      </div>
    </div>

    <!-- Section: Identified Filters -->
    <div class="sidebar-card__section" v-if="customer.filters && customer.filters.length">
      <h4 class="sidebar-card__section-title">识别到的指标</h4>
      <div class="sidebar-card__tags">
        <span v-for="(f, i) in customer.filters" :key="i" class="sidebar-card__tag">{{ f }}</span>
      </div>
    </div>

    <!-- Section: Enterprise Detail (facts grid) -->
    <div class="sidebar-card__section">
      <h4 class="sidebar-card__section-title">企业信息</h4>
      <div class="facts-grid">
        <div class="fact-item">
          <span class="fact-label">行业</span>
          <strong class="fact-value">{{ customer.industry || '—' }}</strong>
        </div>
        <div class="fact-item">
          <span class="fact-label">地区</span>
          <strong class="fact-value">{{ customer.region || '—' }}</strong>
        </div>
        <div class="fact-item">
          <span class="fact-label">营收</span>
          <strong class="fact-value">{{ customer.revenue ? customer.revenue + '万' : '—' }}</strong>
        </div>
        <div class="fact-item">
          <span class="fact-label">纳税等级</span>
          <strong class="fact-value">{{ customer.taxLevel || '—' }}</strong>
        </div>
        <div class="fact-item">
          <span class="fact-label">风险等级</span>
          <strong class="fact-value" :class="{ 'text-green': customer.risk === '低' }">{{ customer.risk || '—' }} {{ customer.risk === '低' ? '✓' : '' }}</strong>
        </div>
        <div class="fact-item">
          <span class="fact-label">匹配度</span>
          <strong class="fact-value text-primary">{{ customer.match }}%</strong>
        </div>
      </div>
    </div>

    <!-- Section: Assessment -->
    <div class="sidebar-card__section">
      <h4 class="sidebar-card__section-title">筛客评估</h4>
      <div class="sidebar-card__row">
        <span class="sidebar-card__label">尽调适配</span>
        <span class="sidebar-card__value">{{ customer.transferable || '—' }}</span>
      </div>
      <div class="sidebar-card__row">
        <span class="sidebar-card__label">筛选理由</span>
        <span class="sidebar-card__value text-muted">{{ customer.reason || '—' }}</span>
      </div>
    </div>

    <!-- Recommend Card -->
    <div class="recommend-card">
      <h4>AI 建议</h4>
      <p>建议优先对<span class="text-primary">{{ customer.name }}</span>发起尽调，匹配度 {{ customer.match }}%，风险等级低。</p>
    </div>

    <!-- Actions -->
    <div class="sidebar-card__actions">
      <el-button type="primary" size="default" @click="$emit('due')">🔍 发起尽调</el-button>
      <el-button type="success" plain size="default" @click="$emit('monitor')">📡 加入监控</el-button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['due', 'monitor'])
const props = defineProps({ customer: Object })
</script>

<style scoped>
.sidebar-card {
  font-size: 13px;
}

.sidebar-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf3fa;
}

.work-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.work-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #10213f;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.tag--blue {
  color: #2168f3;
  background: #eaf2ff;
}

.sidebar-card__section {
  margin-bottom: 14px;
}

.sidebar-card__section-title {
  font-size: 12px;
  font-weight: 700;
  color: #66758e;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.sidebar-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.sidebar-card__tag {
  background: #eef4fb;
  color: #43536d;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

/* Facts grid */
.facts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.fact-item {
  padding: 8px 10px;
  border: 1px solid #edf3fa;
  border-radius: 7px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.fact-label {
  display: block;
  margin-bottom: 4px;
  color: #66758e;
  font-size: 12px;
  font-weight: 600;
}

.fact-value {
  font-size: 14px;
  font-weight: 700;
  color: #10213f;
}

.sidebar-card__row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dashed #edf3fa;
}

.sidebar-card__label {
  color: #93a1b5;
  font-size: 12px;
}

.sidebar-card__value {
  color: #10213f;
  font-weight: 600;
}

.text-primary { color: #2168f3; }
.text-green { color: #18a66a; }
.text-muted { color: #93a1b5; }

/* Recommend card */
.recommend-card {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #c9ecd9;
  border-radius: 8px;
  background: #eaf8f2;
}

.recommend-card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #18a66a;
}

.recommend-card p {
  margin: 0;
  color: #365241;
  font-size: 13px;
  line-height: 1.7;
}

/* Actions */
.sidebar-card__actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
}

.sidebar-card__hint {
  font-size: 12px;
  color: #93a1b5;
  padding-top: 4px;
}
</style>
