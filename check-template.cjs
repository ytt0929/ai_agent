const fs = require('fs');
const c = fs.readFileSync('D:/demo/ai-copilot/src/pages/SmartReportPage.vue', 'utf8');
const tm = c.match(/<template>([\s\S]*?)<\/template>/);
const t = tm[1];
const lines = t.split('\n');
const stack = [];
lines.forEach((l, i) => {
  const tags = l.match(/<\/?(?:section|main|aside|div)(?:\s[^>]*)?>/g);
  if (tags) {
    tags.forEach(tag => {
      if (tag.startsWith('</')) {
        const m = tag.match(/<\/(\w+)/);
        if (m) {
          const name = m[1];
          if (stack.length > 0 && stack[stack.length - 1] === name) {
            stack.pop();
          } else {
            console.log('MISMATCH close at line', i + 1, tag, 'expected', stack.length > 0 ? '</' + stack[stack.length - 1] + '>' : 'none');
          }
        }
      } else {
        const m = tag.match(/<(\w+)/);
        if (m && !tag.endsWith('/>')) {
          stack.push(m[1]);
        }
      }
    });
  }
});
if (stack.length > 0) {
  console.log('UNCLOSED at end:', stack);
} else {
  console.log('All tags balanced');
}
