import fs from 'fs';
const f = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
let t = fs.readFileSync(f, 'utf8');

// Fix remaining issues
// 1. 维度卡片计数中的乱码问号
t = t.replace(/项风险\?/g, '项风险');
t = t.replace(/项亮点\?/g, '项亮点');

// 2. 诊断中步骤第一项乱码
t = t.replace(/'鑾峰彇宸ュ晢鍩虹淇℃伅'/g, "'获取工商基础信息'");

// 3. AI 聊天空态 SVG 中的乱码 emoji → AI
t = t.replace(/<text x="24" y="28" text-anchor="middle" font-size="16">[^<]*<\/text>/g,
  '<text x="24" y="28" text-anchor="middle" font-size="16">AI</text>');

// 4. 注释乱码
t = t.replace(/<!-- .{0,50}核心风险和亮点.{0,50}-->/, '<!-- 核心风险和亮点（单列，不再包含 AI 面板）-->');
t = t.replace(/<!-- .{0,30}右侧.{0,30}AI 风险研究助手 -->/, '<!-- 右侧 AI 风险研究助手 -->');

// 5. AI 助手摘要区 - 在 ed-assistant__ctx 和 ed-chat 之间插入摘要块
const oldCtx = `              </div>
              <div class="ed-chat" ref="chatListRef">`;
const newCtx = `              </div>
              <!-- 当前研究对象摘要块 -->
              <div class="ed-assistant__summary" v-if="store.selectedIndicator">
                <div class="ed-assistant__summary__badge">
                  <span class="ed-level" :class="'ed-level--' + selectedIndicator.level">{{ indicatorLevelText(selectedIndicator) }}</span>
                  <span class="ed-assistant__summary__dim">{{ indicatorDimName }}</span>
                </div>
                <div class="ed-assistant__summary__fact">{{ selectedIndicator.fact }}</div>
              </div>
              <div class="ed-chat" ref="chatListRef">`;
t = t.replace(oldCtx, newCtx);

// 6. 修改快捷操作按钮 - 解释扣分原因
t = t.replace(
  `@click="quickChat('解释扣分原因')">解释扣分原因</el-button>`,
  `@click="handleExplainDeduction">解释扣分原因</el-button>`
);
t = t.replace(
  `@click="quickChat('生成专项说明')">生成专项说明</el-button>`,
  `@click="handleGenerateSpecialNote">生成专项说明</el-button>`
);
t = t.replace(
  `@click="quickChat('加入报告')">加入报告</el-button>`,
  `@click="handleAddToReport">加入报告</el-button>`
);

// 7. 修改 handleEvidenceAction 和添加新函数
const oldFunc = `function handleEvidenceAction() {
  if (store.selectedIndicator) {
    store.viewEvidence(store.selectedIndicator)
  } else {
    ElMessage.warning('请先选择一个指标')
  }
}`;
const newFunc = `function handleEvidenceAction() {
  if (store.selectedIndicator) {
    store.viewEvidence(store.selectedIndicator)
  } else {
    ElMessage.warning('请先选择一个指标')
  }
}

function handleExplainDeduction() {
  if (store.selectedIndicator) {
    const ind = store.selectedIndicator
    store.chatInput = '解释' + ind.name + '的扣分原因'
    store.sendChatMessage()
  } else if (store.activeDimension) {
    store.chatInput = '解释' + activeDimensionName.value + '维度得分偏低的原因'
    store.sendChatMessage()
  } else {
    ElMessage.warning('请先选择一个维度或指标')
  }
}

function handleGenerateSpecialNote() {
  if (store.selectedIndicator) {
    store.chatInput = '生成' + store.selectedIndicator.name + '专项说明'
    store.sendChatMessage()
  } else if (store.activeDimension) {
    store.chatInput = '生成' + activeDimensionName.value + '维度专项说明'
    store.sendChatMessage()
  } else {
    ElMessage.warning('请先选择一个维度或指标')
  }
}

function handleAddToReport() {
  if (store.selectedIndicator) {
    store.logOperation('加入报告-' + store.selectedIndicator.name, 'click')
    store.chatInput = '将' + store.selectedIndicator.name + '加入报告草稿'
    store.sendChatMessage()
  } else if (store.activeDimension) {
    store.logOperation('加入报告-' + activeDimensionName.value, 'click')
    store.chatInput = '将' + activeDimensionName.value + '维度分析加入报告草稿'
    store.sendChatMessage()
  } else {
    ElMessage.warning('请先选择一个维度或指标')
  }
}`;
t = t.replace(oldFunc, newFunc);

// 8. 证据链抽屉 - 升级为解释结构
const oldDrawer = `    <el-drawer v-model="store.evidenceDrawerOpen" title="证据链" size="420px" direction="rtl">
      <div v-if="store.selectedIndicator" class="ed-evidence">
        <h3 class="ed-evidence__title">{{ store.selectedIndicator.name }} · 证据链</h3>
        <div v-for="eid in store.selectedIndicator.evidenceIds" :key="eid" class="ed-evidence-card">
          <template v-if="r.evidenceChain && r.evidenceChain[eid]">
            <div class="ed-evidence-card__header">
              <strong>{{ r.evidenceChain[eid].title }}</strong>
              <span class="ed-badge ed-badge--source">{{ r.evidenceChain[eid].source }}</span>
            </div>
            <div class="ed-evidence-card__body">
              <div class="ed-ev-row"><span class="ed-ev-label">数值</span>{{ r.evidenceChain[eid].value }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">对比</span>{{ r.evidenceChain[eid].comparison }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">采集时间</span>{{ r.evidenceChain[eid].collectedAt }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">置信度</span>{{ Math.round(r.evidenceChain[eid].confidence * 100) }}%</div>
            </div>
          </template>
        </div>
      </div>
    </el-drawer>`;

const newDrawer = `    <el-drawer v-model="store.evidenceDrawerOpen" title="证据链" size="420px" direction="rtl">
      <div v-if="store.selectedIndicator" class="ed-evidence">
        <h3 class="ed-evidence__title">{{ store.selectedIndicator.name }} · 证据链</h3>
        <!-- 摘要区 -->
        <div class="ed-evidence-summary">
          <div class="ed-ev-summary-row">
            <span class="ed-ev-label">风险等级</span>
            <span class="ed-level" :class="'ed-level--' + store.selectedIndicator.level">{{ indicatorLevelText(store.selectedIndicator) }}</span>
          </div>
          <div class="ed-ev-summary-row">
            <span class="ed-ev-label">所属维度</span>
            <span>{{ store.selectedIndicator.dimensionName }}</span>
          </div>
          <div class="ed-ev-summary-row">
            <span class="ed-ev-label">事实摘要</span>
            <span>{{ store.selectedIndicator.fact }}</span>
          </div>
        </div>
        <!-- 解释区 -->
        <div class="ed-evidence-explain">
          <div class="ed-explain-section">
            <h4>1 数据事实</h4>
            <p>{{ store.selectedIndicator.fact }}</p>
          </div>
          <div class="ed-explain-section">
            <h4>2 模型规则</h4>
            <p>该指标根据企业{{ store.selectedIndicator.dimensionName }}相关数据，结合行业均值和阈值规则自动判定。风险等级为{{ indicatorLevelText(store.selectedIndicator) }}。</p>
          </div>
          <div class="ed-explain-section">
            <h4>3 推理结论</h4>
            <p>基于上述数据事实和模型规则，判定{{ store.selectedIndicator.name }}为{{ indicatorLevelText(store.selectedIndicator) }}，建议在授信审批时重点关注并核实相关情况。</p>
          </div>
          <div class="ed-explain-section">
            <h4>4 行动建议</h4>
            <p>建议要求企业提供相关补充材料，并在实地尽调时重点核实。如情况属实，应在授信方案中纳入风险溢价考量。</p>
          </div>
        </div>
        <!-- 明细区 -->
        <h4 class="ed-evidence-detail-title">指标数据明细</h4>
        <div v-for="eid in store.selectedIndicator.evidenceIds" :key="eid" class="ed-evidence-card">
          <template v-if="r.evidenceChain && r.evidenceChain[eid]">
            <div class="ed-evidence-card__header">
              <strong>{{ r.evidenceChain[eid].title }}</strong>
              <span class="ed-badge ed-badge--source">{{ r.evidenceChain[eid].source }}</span>
            </div>
            <div class="ed-evidence-card__body">
              <div class="ed-ev-row"><span class="ed-ev-label">数值</span>{{ r.evidenceChain[eid].value }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">对比</span>{{ r.evidenceChain[eid].comparison }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">采集时间</span>{{ r.evidenceChain[eid].collectedAt }}</div>
              <div class="ed-ev-row"><span class="ed-ev-label">置信度</span>{{ Math.round(r.evidenceChain[eid].confidence * 100) }}%</div>
            </div>
          </template>
        </div>
      </div>
    </el-drawer>`;
t = t.replace(oldDrawer, newDrawer);

// 9. 添加摘要区和解释区的 CSS
const oldStyle = `</style>`;
const newStyle = `
/* 证据链摘要区 */
.ed-evidence-summary { background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 14px; }
.ed-ev-summary-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: var(--font-size-sm); }
.ed-ev-summary-row:last-child { margin-bottom: 0; }
.ed-ev-summary-row .ed-ev-label { flex-shrink: 0; width: 60px; color: var(--text-tertiary); font-weight: 500; }

/* 证据链解释区 */
.ed-evidence-explain { margin-bottom: 14px; }
.ed-explain-section { margin-bottom: 12px; }
.ed-explain-section h4 { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.ed-explain-section p { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin: 0; }

.ed-evidence-detail-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: 0 0 8px; padding-top: 8px; border-top: 1px solid var(--border-default); }

/* AI助手摘要区 */
.ed-assistant__summary { background: #f8fafc; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; border-left: 3px solid var(--color-primary); }
.ed-assistant__summary__badge { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.ed-assistant__summary__dim { font-size: 11px; color: var(--text-tertiary); }
.ed-assistant__summary__fact { font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.5; }
</style>`;
t = t.replace(oldStyle, newStyle);

fs.writeFileSync(f, t, 'utf8');
console.log('EnterpriseDiagnosisPage.vue updated.');
