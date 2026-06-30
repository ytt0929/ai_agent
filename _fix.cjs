const fs = require('fs');
const p = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
let c = fs.readFileSync(p, 'utf8');

const oldBlock = `function renderMarkdown(text) {
  if (!text) return ''
  return text.replace(/`;
const oldEnd = `/g, '<br>')
/g, '<br>')
}`;

const newBlock = `function renderMarkdown(text) {
  if (!text) return ''
  return text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>')
}`;

const si = c.indexOf(oldBlock);
if (si === -1) { console.log('not found, searching...'); const idx = c.indexOf('function renderMarkdown'); console.log(c.substring(idx, idx+200)); process.exit(1); }

// Find the actual broken content more carefully
const startIdx = c.indexOf('function renderMarkdown(text)');
const endSearch = c.indexOf('function toggleDim', startIdx);
const fullBroken = c.substring(startIdx, endSearch).trim();

c = c.substring(0, startIdx) + newBlock + '\n\n' + c.substring(endSearch);

fs.writeFileSync(p, c);
console.log('Fixed. Verify:');
const v = fs.readFileSync(p, 'utf8');
const vi = v.indexOf('function renderMarkdown');
console.log(v.substring(vi, vi + 130));
