const fs = require('fs');
const f = 'D:/demo/ai-copilot/src/pages/SmartReportPage.vue';
let c = fs.readFileSync(f, 'utf8');

// Fix the broken ternary on line 34
c = c.replace(/'已完[^']* : '[^']*'/g, "'已完成' : '草稿'");

// Fix any other garbled Chinese text patterns
c = c.replace(/鉁?/g, '✓');
c = c.replace(/鉄?/g, '⟳');
c = c.replace(/鈼?/g, '○');

// Fix common encoding issues
c = c.replace(/宸插畬鎴?/g, '已完成');
c = c.replace(/鑽夌ǹ/g, '草稿');

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed SmartReportPage.vue');
