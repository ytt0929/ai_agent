const fs = require('fs');
const fp = 'D:/demo/ai-copilot/src/pages/SmartReportPage.vue';
let c = fs.readFileSync(fp, 'utf8');

// We need to find the exact closing structure for sr-home
// After </div> (closes sr-home__section 最近报告任务), we need </div> to close sr-home
// Then </div> to close sr-page

// Current at lines ~322-325: </div>\n        </div>\n      </div>\n    </div>
// Should be: </div>\n        </div>\n      </div>\n    </div>\n  </div>

// Actually let's look at lines around 320-330
const lines = c.split('\n');
for (let i = 315; i < 330 && i < lines.length; i++) {
  console.log(`L${i+1}: ${lines[i]}`);
}

// Find the pattern after 最近报告任务
const search = '</div>\n    </div>\n\n    <div v-if="view === \'upload\'" class="sr-upload">';
const replace = '</div>\n    </div>\n  </div>\n\n    <div v-if="view === \'upload\'" class="sr-upload">';

if (c.includes(search)) {
  c = c.replace(search, replace);
  console.log('Applied fix: added sr-home closing div');
  fs.writeFileSync(fp, c, 'utf8');
} else {
  console.log('Pattern not found');
}
