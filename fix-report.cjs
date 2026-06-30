const fs = require('fs');
const f = 'D:/demo/ai-copilot/src/pages/SmartReportPage.vue';
let c = fs.readFileSync(f, 'utf8');

// Fix the broken ternary on line 34
c = c.replace(/'已完[^']* : '[^']*'/g, "'已完成' : '草稿'");

// Fix common encoding issues
c = c.replace(/鉁?/g, '✓');
c = c.replace(/鉄?/g, '⟳');
c = c.replace(/鈼?/g, '○');
c = c.replace(/宸插畬鎴?/g, '已完成');
c = c.replace(/鑽夌ǹ/g, '草稿');
c = c.replace(/璇诲彇鏁版嵁婧?/g, '读取数据源');
c = c.replace(/鍒嗘瀽鏁版嵁缁撴瀯/g, '分析数据结构');
c = c.replace(/鐢熸垚鎶ュ憡鍐呭/g, '生成报告内容');
c = c.replace(/鎺掔増涓庢牸寮忓寲/g, '排版与格式化');
c = c.replace(/缂栬緫鍣?/g, '编辑器');
c = c.replace(/鍒涘缓椤?/g, '创建页');
c = c.replace(/鎶ュ憡鍒楄〃/g, '报告列表');
c = c.replace(/鏇磋繎鎶ュ憡/g, '最近报告');
c = c.replace(/鏂板缓鎶ュ憡/g, '新建报告');

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed SmartReportPage.vue');
