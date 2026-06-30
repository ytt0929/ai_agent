import fs from 'fs';
const f = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
const t = fs.readFileSync(f, 'utf8');
const lines = t.split(/\r?\n/);
// Show line 110 (index 109) char by char for non-ASCII
const line = lines[109];
console.log('Line 110:');
console.log(line);
console.log('---');
for (let i = 0; i < line.length; i++) {
  const c = line[i];
  const code = c.charCodeAt(0);
  if (code > 127) {
    console.log(`  [${i}] '${c}' U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
  }
}
