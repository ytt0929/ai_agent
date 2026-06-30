你是资深前端工程师。请在 D:\demo\ai-copilot 项目中做一个非常小的修复：隐藏企业诊断模块里的全局底部输入框。

重要定位：
当前企业诊断报告页右侧已经有自己的 AI 风险研究助手和输入框，不应该再出现页面底部的全局 GlobalInputBar。

当前问题：
- 页面路径已经变成：
  - /enterprise-diagnosis
  - /enterprise-diagnosis/report/:creditCode
  - /enterprise-diagnosis/evidence/:creditCode/:indicatorId
- 但 src/components/GlobalInputBar.vue 里现在只用 route.path !== '/enterprise-diagnosis' 判断。
- 这只能隐藏企业诊断列表页，不能隐藏报告详情页和证据链详情页。
- 所以在 /enterprise-diagnosis/report/... 页面底部又出现了全局输入框，和右侧 AI 助手重复。

只允许修改：
- src/components/GlobalInputBar.vue

具体怎么改：
1. 新增一个计算属性，例如：
   const isEnterpriseDiagnosis = computed(() => route.path.startsWith('/enterprise-diagnosis'))

2. 修改 showBar 判断：
   当前类似：
   const showBar = computed(() => !isWorkbench.value && route.path !== '/enterprise-diagnosis')

   改成：
   const showBar = computed(() => !isWorkbench.value && !isEnterpriseDiagnosis.value)

3. 如果模板里的 dialog-overlay 仍然用 `dialogOpen && !isWorkbench`，也同步改成依赖 showBar：
   v-if="dialogOpen && showBar"

   这样可以避免未来企业诊断页虽然 footer 隐藏了，但弹层逻辑仍被误触发。

4. 不要修改企业诊断页面布局。
5. 不要修改路由。
6. 不要修改 store。
7. 不要处理乱码文案。
8. 不要做批量替换。

验收标准：
- /enterprise-diagnosis 页面不显示底部全局输入框。
- /enterprise-diagnosis/report/91130203MA7EEQ2N0T 页面不显示底部全局输入框。
- /enterprise-diagnosis/evidence/91130203MA7EEQ2N0T/任意指标 页面不显示底部全局输入框。
- 其他页面例如 /screening、/tax-rpa、/smart-report 仍按原逻辑显示全局输入框。
- npm run build 通过。
