import fs from 'fs';
const f = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
let t = fs.readFileSync(f, 'utf8');
const lines = t.split(/\r?\n/);

// Fix 1: Line 110 - 亮点分布 button
const badLine = lines[109];
const newLine = badLine.replace(/">[\u4e00-\u9fff\uE000-\uFFFF]{2,}<\/button>/, '">亮点分布</button>');
console.log('OLD:', badLine);
console.log('NEW:', newLine);
lines[109] = newLine;

// Fix 2: Find AI avatar/标识乱码 in chat area
// Search for lines with chat bubble avatars that look corrupted
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  // Look for ed-bubble__avatar with corrupted chars
  if (l.includes('ed-bubble__avatar') && /[\u4e00-\u9fff].*[\u0080-\u00ff]/.test(l)) {
    console.log(`L${i+1}: ${l.trim()}`);
    // Replace the content inside the avatar div
    // e.g. <div class="ed-bubble__avatar">傀口</div>
    const match = l.match(/(<div class="ed-bubble__avatar">)([\s\S]*?)(<\/div>)/);
    if (match) {
      const avatarContent = match[2].trim();
      console.log(`  Avatar content: "${avatarContent}"`);
    }
  }
}
