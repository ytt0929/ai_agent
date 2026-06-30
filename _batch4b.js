import fs from 'fs';
const f = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
let text = fs.readFileSync(f, 'utf8');

// ===== Task 1: 乱码修复 =====

// 1a. 搜索企业分隔符：路 → ·
text = text.replace('路 {{ ent.industry }}', '· {{ ent.industry }}');

// 1b. 诊断中副标题
text = text.replace(/AI .{0,30}$/, 'AI 正在分析多维度数据，生成企业风险诊断', m => {
  return m;
});
// More targeted approach for line 46
text = text.replace(/AI [^\n]*(?=<\/div>)/g, (match) => {
  if (match.includes('分析') || match.includes('正在')) {
    return 'AI 正在分析多维度数据，生成企业风险诊断';
  }
  return match;
});

// 1c. 监测规则点击参数
text = text.replace(/['"][^'"]*监测规则['"]\)/, "'创建监测规则')");

// 1d. 蝴蝶图例：高/中/低 乱码
// Fix legend
text = text.replace(/<\/span>楂<\/span>/g, '</span>高</span>');
text = text.replace(/<\/span>涓<\/span>/g, '</span>中</span>');
text = text.replace(/<\/span>浣<\/span>/g, '</span>低</span>');

// 1e. 蝴蝶图空值：鈥 → 暂无
text = text.replace(/ed-bf-none">[^<]*<\/div>/g, 'ed-bf-none">暂无</div>');

// 1f. 维度卡片计数文字中的乱码问号
text = text.replace(/项风险\?/g, '项风险');
text = text.replace(/项亮点\?/g, '项亮点');

// 1g. HTML注释乱码
text = text.replace(/<!-- .{0,30}AI.{0,10}-->/, '<!-- 核心风险和亮点（单列，不再包含 AI 面板）-->');

// 1h. 右侧注释
text = text.replace(/<!-- .{0,10}AI .{0,20}-->/, '<!-- 右侧 AI 风险研究助手 -->');

// 1i. 证据链标题分隔符
text = text.replace('}} 路 证据链', '}} · 证据链');

// ===== Task 2: AI助手联动增强 =====
// Add a context summary block in ed-assistant-card after ed-assistant__ctx
// Find the pattern: </div>\n              <div class="ed-chat"
// and insert a summary block between them

const ctxPattern = `</div>
              <div class="ed-chat"`;

const summaryBlock = `</div>
              <!-- 当前研究对象摘要 -->
              <div class="ed-assistant__summary" v-if="store.selectedIndicator">
                <div class="ed-assistant__summary__badge">
                  <span class="ed-level" :class="'ed-level--' + selectedIndicator.level">{{ indicatorLevelText(selectedIndicator) }}</span>
                  <span class="ed-assistant__summary__dim">{{ indicatorDimName }}</span>
                </div>
                <div class="ed-assistant__summary__fact">{{ selectedIndicator.fact }}</div>
              </div>
              <div class="ed-chat"`;

text = text.replace(ctxPattern, summaryBlock);

// ===== Task 3: 优化快捷操作行为 =====
// Rewrite quickChat and handleEvidenceAction to be smarter
// Find the handleEvidenceAction function and replace it
const oldEvidenceAction = `function handleEvidenceAction() {
  if (store.selectedIndicator) {
    store.viewEvidence(store.selectedIndicator)
  } else {
    ElMessage.warning('请先选择一个指标')
  }
}`;

const newEvidenceAction = `function handleEvidenceAction() {
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
    const dimName = activeDimensionName.value
    store.chatInput = '解释' + dimName + '维度得分偏低的原因'
    store.sendChatMessage()
  } else {
    ElMessage.warning('请先选择一个维度或指标')
  }
}

function handleGenerateSpecialNote() {
  if (store.selectedIndicator) {
    const ind = store.selectedIndicator
    store.chatInput = '生成' + ind.name + '专项说明'
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

text = text.replace(oldEvidenceAction, newEvidenceAction);

// Update template buttons to use new functions
text = text.replace(`@click="quickChat('解释扣分原因')">解释扣分原因</el-button>`,
  `@click="handleExplainDeduction">解释扣分原因</el-button>`);
text = text.replace(`@click="quickChat('生成专项说明')">生成专项说明</el-button>`,
  `@click="handleGenerateSpecialNote">生成专项说明</el-button>`);
text = text.replace(`@click="quickChat('加入报告')">加入报告</el-button>`,
  `@click="handleAddToReport">加入报告</el-button>`);

// ===== Task 4: 优化 store generateChatReply =====
// We need to also update the store to produce better replies for these specific prompts

fs.writeFileSync(f, text, 'utf8');
console.log('Phase 1 done (template + script).');

// Now update the store
const sf = 'D:\\demo\\ai-copilot\\src\\stores\\enterpriseDiagnosis.js';
let st = fs.readFileSync(sf, 'utf8');

const oldReply = `  if (lower.includes('建议') || lower.includes('结论')) {
    return \`**综合建议：**\\n\${result.suggestions.map(s => \`· \${s.text}\`).join('\\n')}\`
  }
  if (lower.includes('总结') || lower.includes('概况')) {
    return \`**\${result.enterprise.name} 诊断总结：**\\n· 综合评分：\${result.score}\\n· 风险项：\${result.riskItems?.length || 0}（高风险 \${(result.riskItems || []).filter(i => i.level === 'high').length}）\\n· 亮点项：\${result.highlightItems?.length || 0}\\n· 证据链：\${Object.keys(result.evidenceChain || {}).length} 条\`
  }
  return \`收到：「\${input}」\\n\\n我可以帮你：\\n· **解释扣分原因**\\n· **查看证据链**\\n· **生成专项说明**\\n· **加入报告**\`
}`;

const newReply = `  if (lower.includes('解释') && lower.includes('扣分原因')) {
    // Find the selected indicator context
    const name = input.replace(/解释|扣分原因|的/g, '').trim()
    const ind = result.allIndicators?.find(i => i.name.includes(name) || name.includes(i.name))
    if (ind) {
      return \`**\${ind.name} 扣分原因**\\n\\n· 所属维度：\${ind.dimensionName}\\n· 风险等级：\${ind.level === 'high' ? '高风险' : ind.level === 'medium' ? '中风险' : '低风险'}\\n· 事实依据：\${ind.fact}\\n\\n该指标在同类企业中处于显著偏离水平，建议重点关注并核实数据真实性。\`
    }
    return \`**\${name} 扣分原因**\\n\\n当前未选中具体指标。请先在风险列表或八大维度中点击一个具体指标，我将为您生成详细的扣分原因分析。\`
  }
  if (lower.includes('生成') && lower.includes('专项说明')) {
    const name = input.replace(/生成|专项说明/g, '').trim()
    return \`**\${name} 专项说明**\\n\\n经核查，该企业在\${name}相关指标上存在以下情况：\\n\\n1. 数据来源：基于近12个月税务、发票及经营数据分析\\n2. 风险等级：需结合企业实际情况综合判断\\n3. 建议措施：建议要求企业提供补充说明材料，并在授信审批时纳入风险溢价考量\\n\\n本说明仅供参考，最终结论请以实地尽调为准。\`
  }
  if (lower.includes('加入报告')) {
    return \`已将相关分析内容加入报告草稿。您可以在「推送尽调」中查看和编辑报告草稿内容。\`
  }
  if (lower.includes('建议') || lower.includes('结论')) {
    return \`**综合建议：**\\n\${result.suggestions.map(s => \`· \${s.text}\`).join('\\n')}\`
  }
  if (lower.includes('总结') || lower.includes('概况')) {
    return \`**\${result.enterprise.name} 诊断总结：**\\n· 综合评分：\${result.score}\\n· 风险项：\${result.riskItems?.length || 0}（高风险 \${(result.riskItems || []).filter(i => i.level === 'high').length}）\\n· 亮点项：\${result.highlightItems?.length || 0}\\n· 证据链：\${Object.keys(result.evidenceChain || {}).length} 条\`
  }
  return \`收到：「\${input}」\\n\\n我可以帮你：\\n· **解释扣分原因**\\n· **查看证据链**\\n· **生成专项说明**\\n· **加入报告**\`
}`;

st = st.replace(oldReply, newReply);
fs.writeFileSync(sf, st, 'utf8');
console.log('Phase 2 done (store chat replies).');
