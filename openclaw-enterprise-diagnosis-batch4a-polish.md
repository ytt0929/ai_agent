# OpenClaw Prompt: Phase 2 Batch 4A Enterprise Diagnosis Full Two-Column Fix

```text
你是资深前端工程师和 UI/UX 工程师。

项目路径：
D:\demo\ai-copilot

请只读取本提示词，不要读取旧提示词文件。

阶段定位：
第二阶段 Batch 4A 企业诊断报告页布局补丁。
本轮必须修正 EnterpriseDiagnosisPage.vue 的主体 DOM 包裹关系。

重要限制：
- 只修改 src/pages/EnterpriseDiagnosisPage.vue。
- 不要修改 store、mock、路由、全局样式、其他页面。
- 不要引入新依赖。
- 不要处理编码问题。
- 不要重做八大维度图。
- 不要改证据链抽屉逻辑。

当前代码问题：
1. .ed-report-layout 现在只包住了“核心风险和亮点 + AI 助手”。这是错误的。
2. .ed-diag-main 和 .ed-dim-section 仍然在 .ed-report-layout 外面，所以右侧 AI 面板只能从核心风险区开始。
3. 目标不是让 AI 面板跟核心风险区对齐，而是让 AI 面板跟整个诊断报告主体顶部对齐。

目标效果：
1. 顶部 .ed-topbar 保持在最上方。
2. .ed-topbar 下面立即是完整的两栏布局 .ed-report-layout。
3. 左侧 .ed-report-main 包含全部诊断报告结果内容：
   - AI 综合诊断 .ed-diag-main
   - 八大维度诊断结果 .ed-dim-section
   - 核心风险和亮点 .ed-workbench
4. 右侧 .ed-report-aside 包含完整 AI 风险研究助手 .ed-assistant。
5. 右侧 AI 面板从 AI 综合诊断顶部开始，与左侧主内容顶部对齐。

必须改成的 template 结构：

<header class="ed-topbar">...</header>

<div class="ed-report-layout">
  <main class="ed-report-main">
    <section class="ed-card ed-diag-main">
      <!-- AI 综合诊断 -->
    </section>

    <section class="ed-card ed-dim-section">
      <!-- 八大维度诊断结果 -->
    </section>

    <section class="ed-workbench">
      <!-- 核心风险和亮点，只放指标列表或空状态 -->
    </section>
  </main>

  <aside class="ed-report-aside">
    <aside class="ed-assistant">
      <!-- AI 风险研究助手完整内容 -->
    </aside>
  </aside>
</div>

具体修改：

1. 移动 .ed-report-layout 的开始位置
- 当前 .ed-report-layout 在 .ed-dim-section 后面，这是错误的。
- 把 .ed-report-layout 移到 .ed-topbar 后面。
- .ed-diag-main、.ed-dim-section、.ed-workbench 都必须放进 .ed-report-main。

2. 保持 AI 面板在右侧整栏
- .ed-assistant 必须放在 .ed-report-aside 内。
- .ed-assistant 不能放在 .ed-workbench 内。
- .ed-report-aside 要和 .ed-report-main 同级。
- .ed-report-aside .ed-assistant-card 可以 sticky，top: 16px 或 24px。

3. 保持左侧诊断报告内容顺序
- .ed-report-main 内顺序必须是：
  1. .ed-diag-main
  2. .ed-dim-section
  3. .ed-workbench
- 不要把八大维度或核心风险移到右侧。
- 不要新增目录。

4. CSS 要匹配结构
- .ed-report-layout：
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
- .ed-report-main：
  display: flex;
  flex-direction: column;
  gap: 16px;
- .ed-workbench 改成单列，不要再承担左右布局。

5. 保持现有能力
- AI 综合诊断内容保持。
- 八大维度左图右 8 维度布局保持。
- 三个 tab 内容保持不同。
- 点击维度仍筛选指标。
- 点击指标仍更新 AI 面板上下文。
- 查看证据链仍打开抽屉。
- AI 快捷动作和输入框保持可用。

硬性验收：
1. npm run build 通过。
2. 只修改 src/pages/EnterpriseDiagnosisPage.vue。
3. .ed-report-layout 必须紧跟在 .ed-topbar 后面。
4. .ed-diag-main、.ed-dim-section、.ed-workbench 必须全部位于 .ed-report-main 内。
5. .ed-assistant 必须位于 .ed-report-aside 内。
6. .ed-assistant 不能位于 .ed-workbench 内。
7. 右侧 AI 面板从 AI 综合诊断顶部开始显示，而不是从核心风险区开始。
8. 指标点击、AI 上下文、查看证据链仍可用。

完成后回复：
- 修改了哪个文件。
- 是否完成 DOM 包裹关系移动。
- npm run build 结果。
- 如果没有完成上述硬性验收，说明原因。
```
