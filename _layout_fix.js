import fs from 'fs';
const f = 'D:\\demo\\ai-copilot\\src\\pages\\EnterpriseDiagnosisPage.vue';
let t = fs.readFileSync(f, 'utf8');

// Current broken structure:
// <header class="ed-topbar">...</header>
// <section class="ed-card ed-diag-main">...</section>
// <section class="ed-card ed-dim-section">...</section>
// <div class="ed-report-layout">
//   <main class="ed-report-main">
//     <section class="ed-workbench">...</section>
//   </main>
//   <aside class="ed-report-aside">...</aside>
// </div>

// Target structure:
// <header class="ed-topbar">...</header>
// <div class="ed-report-layout">
//   <main class="ed-report-main">
//     <section class="ed-card ed-diag-main">...</section>
//     <section class="ed-card ed-dim-section">...</section>
//     <section class="ed-workbench">...</section>
//   </main>
//   <aside class="ed-report-aside">...</aside>
// </div>

// Step 1: Replace the entire ed-result content area
// Find from <header class="ed-topbar"> to the closing </div> before <el-drawer

const oldStructure = `      <header class="ed-topbar">
        <div class="ed-topbar__left">
          <el-button class="ed-back-btn" @click="store.reset()" plain size="small">
            <el-icon :size="14"><ArrowLeft /></el-icon> 返回列表
          </el-button>
          <div class="ed-company">
            <h1 class="ed-company__name">{{ r.enterprise.name }}</h1>
            <div class="ed-company__meta">
              <span>91130203MA7EEQ2N0T · 法人：马丽 · 成立于2022年</span>
            </div>
          </div>
        </div>
        <div class="ed-score-inline">
          <span class="ed-score-inline__num" :class="'num--' + gradeColorClass">{{ r.score }}</span>
          <span class="ed-score-inline__grade" :class="'ed-grade-badge--' + gradeColorClass">综合评级 D · 审慎推进</span>
          <span class="ed-score-inline__divider"></span>
          <el-button size="small" @click="logAndMsg('生成诊断报告')">生成报告</el-button>
          <el-button size="small" @click="logAndMsg('推送至尽调')">推送尽调</el-button>
          <el-button size="small" @click="logAndMsg('创建监测规则')">监测规则</el-button>
        </div>
      </header>


      <section class="ed-card ed-diag-main">
        <div class="ed-section-header">
          <h2 class="ed-section-title">AI 综合诊断</h2>
          <div class="ed-section-sub">基于多维度数据智能分析</div>
        </div>
        <div class="ed-diagnosis-text" v-html="renderMarkdown(r.summary)"></div>
        <div v-if="r.suggestions?.length" class="ed-actions">
          <div v-for="(s, i) in r.suggestions" :key="i" class="ed-action">{{ s.text }}</div>
        </div>
      </section>

      <section class="ed-card ed-dim-section">`;

const newStructure = `      <header class="ed-topbar">
        <div class="ed-topbar__left">
          <el-button class="ed-back-btn" @click="store.reset()" plain size="small">
            <el-icon :size="14"><ArrowLeft /></el-icon> 返回列表
          </el-button>
          <div class="ed-company">
            <h1 class="ed-company__name">{{ r.enterprise.name }}</h1>
            <div class="ed-company__meta">
              <span>91130203MA7EEQ2N0T · 法人：马丽 · 成立于2022年</span>
            </div>
          </div>
        </div>
        <div class="ed-score-inline">
          <span class="ed-score-inline__num" :class="'num--' + gradeColorClass">{{ r.score }}</span>
          <span class="ed-score-inline__grade" :class="'ed-grade-badge--' + gradeColorClass">综合评级 D · 审慎推进</span>
          <span class="ed-score-inline__divider"></span>
          <el-button size="small" @click="logAndMsg('生成诊断报告')">生成报告</el-button>
          <el-button size="small" @click="logAndMsg('推送至尽调')">推送尽调</el-button>
          <el-button size="small" @click="logAndMsg('创建监测规则')">监测规则</el-button>
        </div>
      </header>

      <div class="ed-report-layout">
        <main class="ed-report-main">
          <section class="ed-card ed-diag-main">
            <div class="ed-section-header">
              <h2 class="ed-section-title">AI 综合诊断</h2>
              <div class="ed-section-sub">基于多维度数据智能分析</div>
            </div>
            <div class="ed-diagnosis-text" v-html="renderMarkdown(r.summary)"></div>
            <div v-if="r.suggestions?.length" class="ed-actions">
              <div v-for="(s, i) in r.suggestions" :key="i" class="ed-action">{{ s.text }}</div>
            </div>
          </section>

          <section class="ed-card ed-dim-section">`;

t = t.replace(oldStructure, newStructure);

// Step 2: Replace the old layout boundary
// Old: </section> (closing ed-dim-section)
//      <!-- 涓讳綋涓ゆ爮甯冨眬 -->
//      <div class="ed-report-layout">
//        <main class="ed-report-main">
//          <!-- 核心风险和亮点（单列，不再包含 AI 面板）-->
//          <section class="ed-workbench">
//
// New: </section>
//          <section class="ed-workbench">

const oldBoundary = `      </section>

      <!-- 涓讳綋涓ゆ爮甯冨眬 -->
      <div class="ed-report-layout">
        <main class="ed-report-main">
          <!-- 核心风险和亮点（单列，不再包含 AI 面板）-->
          <section class="ed-workbench">`;

const newBoundary = `          </section>

          <section class="ed-workbench">`;

t = t.replace(oldBoundary, newBoundary);

// Step 3: Close the new </main> before </aside>
// Old: </section> (closing ed-workbench)
//        </main>
//
//        <!-- 鍙充晶 AI 风险研究助手 -->
//
// New: </section>
//        </main>
//        <aside class="ed-report-aside">

const oldAside = `        </main>

        <!-- 鍙充晶 AI 风险研究助手 -->
        <aside class="ed-report-aside">`;

const newAside = `        </main>
        <aside class="ed-report-aside">`;

t = t.replace(oldAside, newAside);

fs.writeFileSync(f, t, 'utf8');
console.log('Layout restructured successfully.');
