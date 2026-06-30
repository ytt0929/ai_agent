import fs from 'fs';
const file = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
let text = fs.readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);

// 1. Line 63: 返回按钮
lines[62] = '            <el-icon :size="14"><ArrowLeft /></el-icon> 返回列表';

// 2. Line 67-74: 企业信息整行改为静态文案
lines[66] = '              <span>91130203MA7EEQ2N0T · 法人：马丽 · 成立于2022年</span>';
lines[67] = '            </div>';
lines[68] = '          </div>';
// Remove old lines 68-73 (creditCode, legalRep, establishedYear spans)
lines.splice(69, 5);

// 3. Line ~79: 综合评级
const gradeIdx = lines.findIndex(l => l.includes('综合评级') && l.includes('gradeColorClass'));
if (gradeIdx >= 0) {
  lines[gradeIdx] = '          <span class="ed-score-inline__grade" :class="\'ed-grade-badge--\' + gradeColorClass">综合评级 D · 审慎推进</span>';
}

// 4. 风险分布 / 亮点分布 按钮
const riskIdx = lines.findIndex(l => l.includes('butterfly') && /椋庨櫓分嗗竷|风险分布/.test(l) && l.includes('button'));
if (riskIdx >= 0) {
  lines[riskIdx] = '            <button class="ed-chart-tab" :class="{ active: chartType === \'butterfly\' }" @click="chartType = \'butterfly\'">风险分布</button>';
}
const roseIdx = lines.findIndex(l => l.includes('rose') && /浜珐分嗗竷|亮点分布/.test(l) && l.includes('button'));
if (roseIdx >= 0) {
  lines[roseIdx] = '            <button class="ed-chart-tab" :class="{ active: chartType === \'rose\' }" @click="chartType = \'rose\'">亮点分布</button>';
}

// 5. L46: AI 正在分析多维度数据…
const aiIdx = lines.findIndex(l => l.includes('ed-diagnosing__sub') && l.includes('多'));
if (aiIdx >= 0) {
  lines[aiIdx] = '            <div class="ed-diagnosing__sub">AI 正在分析多维度数据…</div>';
}

// 6. 纳税信用 级
const taxIdx = lines.findIndex(l => l.includes('纳税信用') && /绾/.test(l));
if (taxIdx >= 0) {
  lines[taxIdx] = lines[taxIdx].replace(/绾/, '级');
}

text = lines.join('\r\n');
fs.writeFileSync(file, text, 'utf8');
console.log('Done.');
