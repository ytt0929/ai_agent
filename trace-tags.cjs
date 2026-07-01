const fs = require('fs');
const c = fs.readFileSync('D:/demo/ai-copilot/src/pages/SmartReportPage.vue', 'utf8');
const tm = c.match(/<template>([\s\S]*?)<\/template>/);
if (!tm) { console.log('NO TEMPLATE FOUND'); process.exit(1); }
const t = tm[1];
const lines = t.split('\n');
const stack = [];
lines.forEach((l, i) => {
  // Match opening and closing tags: div, section, main, aside, header, footer, article, nav, template, el-*
  const re = /<(\/?)([a-z][\w-]*)(?:\s[^>]*)?>/g;
  let m;
  while ((m = re.exec(l)) !== null) {
    const isClose = m[1] === '/';
    const name = m[2].toLowerCase();
    // Skip void elements
    if (['br','hr','img','input','textarea','select','option','el-icon','el-button','strong','p','h1','h2','h3','h4','span','label','button','textarea','select','option','strong'].includes(name)) continue;
    // Skip el-* tags
    if (name.startsWith('el-')) continue;
    if (isClose) {
      if (stack.length > 0 && stack[stack.length - 1] === name) {
        stack.pop();
      } else {
        console.log(`MISMATCH close at L${i+1}: </${name}> expected </${stack.length > 0 ? stack[stack.length-1] : 'empty'}>`);
      }
    } else {
      if (!m[0].endsWith('/>')) {
        stack.push(name);
      }
    }
  }
});
if (stack.length > 0) {
  console.log('UNCLOSED at end:', stack);
} else {
  console.log('All tags balanced');
}
